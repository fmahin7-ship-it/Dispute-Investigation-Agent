"use client";

import { useEffect, useRef } from "react";
import type { InvestigateProgressEvent } from "@/lib/api";
import { formatLabel } from "@/lib/formatLabel";

export type StepStatus = "pending" | "active" | "done" | "error";

export type ChecklistItem = {
  id: string;
  label: string;
  detail?: string;
  tool?: string;
  status: StepStatus;
};

export type PhaseId =
  | "start"
  | "gather"
  | "finalize"
  | "complete"
  | "failed";

export type ProgressState = {
  open: boolean;
  phase: PhaseId;
  phaseLabel: string;
  phases: { id: PhaseId; label: string; status: StepStatus }[];
  checklist: ChecklistItem[];
  recommendation?: string;
  error?: string;
};

const PHASE_DEFS: { id: PhaseId; label: string }[] = [
  { id: "start", label: "Start agent" },
  { id: "gather", label: "Gather evidence" },
  { id: "finalize", label: "Write finding" },
  { id: "complete", label: "Complete" },
];

export function initialProgressState(): ProgressState {
  return {
    open: false,
    phase: "start",
    phaseLabel: "Waiting…",
    phases: PHASE_DEFS.map((p) => ({
      ...p,
      status: "pending" as StepStatus,
    })),
    checklist: [],
  };
}

function setPhaseStatus(
  phases: ProgressState["phases"],
  active: PhaseId,
  terminal?: "done" | "error"
): ProgressState["phases"] {
  const order = PHASE_DEFS.map((p) => p.id);
  const activeIdx = order.indexOf(active);
  return phases.map((p) => {
    const idx = order.indexOf(p.id);
    if (terminal === "error" && p.id === active) {
      return { ...p, status: "error" };
    }
    if (idx < activeIdx) return { ...p, status: "done" };
    if (idx === activeIdx) {
      return {
        ...p,
        status: terminal === "done" ? "done" : "active",
      };
    }
    return { ...p, status: "pending" };
  });
}

function toolCallLabel(
  tool: string,
  args?: Record<string, unknown>
): string {
  if (!args || Object.keys(args).length === 0) return tool;
  const keys = Object.entries(args)
    .slice(0, 3)
    .map(([k, v]) => {
      const raw = typeof v === "string" ? v : JSON.stringify(v);
      const clipped = raw.length > 48 ? `${raw.slice(0, 48)}…` : raw;
      return `${k}=${clipped}`;
    })
    .join(", ");
  return `${tool}(${keys})`;
}

export function reduceProgress(
  prev: ProgressState,
  event: InvestigateProgressEvent
): ProgressState {
  switch (event.type) {
    case "started":
      return {
        ...prev,
        open: true,
        phase: "start",
        phaseLabel: "Starting investigation…",
        phases: setPhaseStatus(prev.phases, "start"),
        checklist: [
          {
            id: "boot",
            label: "Connect to investigator",
            status: "active",
          },
        ],
        error: undefined,
        recommendation: undefined,
      };
    case "round_start": {
      if (event.mode === "finalize") {
        return {
          ...prev,
          open: true,
          phase: "finalize",
          phaseLabel: `Round ${event.round}/${event.max_rounds} — writing Finding…`,
          phases: setPhaseStatus(prev.phases, "finalize"),
          checklist: prev.checklist
            .map((c) =>
              c.status === "active" ? { ...c, status: "done" as const } : c
            )
            .concat({
              id: `finalize-${event.round}`,
              label: "Compose Finding JSON from evidence + policy",
              status: "active",
            }),
        };
      }
      const round = event.round ?? 1;
      return {
        ...prev,
        open: true,
        phase: "gather",
        phaseLabel: `Round ${round}/${event.max_rounds} — calling tools…`,
        phases: setPhaseStatus(prev.phases, "gather"),
        checklist: [
          ...prev.checklist.map((c) =>
            c.status === "active" ? { ...c, status: "done" as const } : c
          ),
          {
            id: `round-${round}`,
            label: `Evidence round ${round}`,
            status: "active",
            detail: "Waiting for tool calls",
          },
        ],
      };
    }
    case "tool_start": {
      const id = `tool-${event.tool}-${prev.checklist.length}`;
      return {
        ...prev,
        open: true,
        phase: "gather",
        phaseLabel: `Running ${event.tool}…`,
        phases: setPhaseStatus(prev.phases, "gather"),
        checklist: [
          ...prev.checklist.map((c) =>
            c.id.startsWith("round-") && c.status === "active"
              ? { ...c, status: "done" as const, detail: undefined }
              : c.status === "active" && c.id === "boot"
                ? { ...c, status: "done" as const }
                : c
          ),
          {
            id,
            label: toolCallLabel(event.tool ?? "tool", event.args),
            tool: event.tool,
            status: "active",
            detail: "In progress",
          },
        ],
      };
    }
    case "tool_done": {
      const lastToolIdx = [...prev.checklist]
        .map((c, i) => ({ c, i }))
        .reverse()
        .find(
          ({ c }) =>
            c.status === "active" &&
            (c.tool === event.tool || c.label.startsWith(event.tool ?? ""))
        )?.i;

      return {
        ...prev,
        open: true,
        phaseLabel: event.ok
          ? `Finished ${event.tool}`
          : `${event.tool} failed`,
        checklist: prev.checklist.map((c, i) => {
          if (lastToolIdx !== undefined && i === lastToolIdx) {
            return {
              ...c,
              status: event.ok ? ("done" as const) : ("error" as const),
              detail: event.ok ? "Done" : (event.error ?? "Failed"),
            };
          }
          return c;
        }),
      };
    }
    case "finding_ready":
      return {
        ...prev,
        open: true,
        phase: "complete",
        phaseLabel: `Finding ready → ${formatLabel(event.recommendation)}`,
        recommendation: event.recommendation,
        phases: setPhaseStatus(prev.phases, "complete", "done"),
        checklist: [
          ...prev.checklist.map((c) =>
            c.status === "active" ? { ...c, status: "done" as const } : c
          ),
          {
            id: "finding",
            label: `Recommendation: ${formatLabel(event.recommendation)}`,
            status: "done",
            detail: (event.tools_used ?? []).join(", ") || undefined,
          },
        ],
      };
    default:
      return prev;
  }
}

/** Delay between applying SSE events so parallel tools feel sequential. */
export function progressEventDelayMs(event: InvestigateProgressEvent): number {
  switch (event.type) {
    case "tool_start":
      return 520;
    case "tool_done":
      return 380;
    case "round_start":
      return 420;
    case "finding_ready":
      return 500;
    case "started":
      return 300;
    default:
      return 220;
  }
}

function StatusMark({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <span
        className="investigate-mark-done flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white"
        aria-hidden
      >
        ✓
      </span>
    );
  }
  if (status === "active") {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-accent"
        aria-hidden
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
      </span>
    );
  }
  if (status === "error") {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white"
        aria-hidden
      >
        !
      </span>
    );
  }
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white"
      aria-hidden
    />
  );
}

type Props = {
  state: ProgressState;
  onClose: () => void;
};

export function InvestigationProgressModal({ state, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [state.checklist.length, state.phaseLabel, state.phase]);

  if (!state.open) return null;

  const canClose =
    state.phase === "complete" || state.phase === "failed" || !!state.error;

  return (
    <div
      className="investigate-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="investigate-progress-title"
    >
      <div className="investigate-modal-panel flex max-h-[min(85vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-desk">
        <div className="shrink-0 border-b border-line px-5 py-4">
          <p className="desk-kicker">Investigation in progress</p>
          <h2
            id="investigate-progress-title"
            className="investigate-phase-title mt-1 font-display text-lg font-semibold text-ink"
            key={state.phaseLabel}
          >
            {state.phaseLabel}
          </h2>
          {state.recommendation ? (
            <p className="mt-1 text-sm text-teal-800">
              Result: <strong>{formatLabel(state.recommendation)}</strong>
            </p>
          ) : null}
          {state.error ? (
            <p className="mt-1 text-sm text-red-600">{state.error}</p>
          ) : null}
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4"
        >
          <ol className="space-y-2">
            {state.phases.map((phase) => (
              <li
                key={phase.id}
                className="investigate-phase-row flex items-center gap-3 text-sm transition-colors duration-300"
              >
                <StatusMark status={phase.status} />
                <span
                  className={
                    phase.status === "active"
                      ? "font-semibold text-ink"
                      : phase.status === "done"
                        ? "text-slate-600"
                        : "text-slate-400"
                  }
                >
                  {phase.label}
                </span>
              </li>
            ))}
          </ol>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Checklist
            </p>
            <ul className="space-y-2 rounded-xl bg-slate-50 p-3">
              {state.checklist.length === 0 ? (
                <li className="text-sm text-slate-500">Waiting for first step…</li>
              ) : (
                state.checklist.map((item) => (
                  <li
                    key={item.id}
                    className="investigate-step-enter flex items-start gap-3 text-sm"
                  >
                    <StatusMark status={item.status} />
                    <div className="min-w-0">
                      <p
                        className={
                          item.status === "active"
                            ? "font-mono text-[13px] font-medium text-ink"
                            : item.status === "error"
                              ? "font-mono text-[13px] text-red-700"
                              : item.label.includes("(") ||
                                  item.label.startsWith("get_") ||
                                  item.label.startsWith("search_")
                                ? "font-mono text-[13px] text-slate-700"
                                : "text-slate-700"
                        }
                      >
                        {item.label}
                      </p>
                      {item.detail ? (
                        <p
                          className={
                            item.status === "active"
                              ? "investigate-detail-pulse text-xs text-slate-500"
                              : "text-xs text-slate-500"
                          }
                        >
                          {item.detail}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-3">
          {canClose ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              {state.error ? "Close" : "View finding"}
            </button>
          ) : (
            <p className="text-center text-xs text-slate-500">
              Watching each tool step — scroll if the list grows
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
