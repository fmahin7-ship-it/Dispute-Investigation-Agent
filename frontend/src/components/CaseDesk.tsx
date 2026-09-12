"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  briefInvestigation,
  decide,
  fetchCase,
  investigateWithProgress,
  type BriefingResponse,
  type InvestigateProgressEvent,
} from "@/lib/api";
import { formatLabel } from "@/lib/formatLabel";
import type { CaseDetail, CaseSummary } from "@/schemas/cases";
import type { Finding } from "@/schemas/finding";
import { EvidencePanel } from "@/components/EvidencePanel";
import { FindingPanel } from "@/components/FindingPanel";
import { DeliveryOpsPanel } from "@/components/DeliveryOpsPanel";
import { BriefMePanel } from "@/components/BriefMePanel";
import { HitlActions } from "@/components/HitlActions";
import { AuditTimeline } from "@/components/AuditTimeline";
import {
  initialProgressState,
  InvestigationProgressModal,
  progressEventDelayMs,
  reduceProgress,
  type ProgressState,
} from "@/components/InvestigationProgressModal";

type Props = { caseId: string };

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function CaseDesk({ caseId }: Props) {
  const [caseRow, setCaseRow] = useState<CaseDetail | CaseSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [finding, setFinding] = useState<Finding | null>(null);
  const [audit, setAudit] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [briefBusy, setBriefBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [humanDecision, setHumanDecision] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState>(initialProgressState);

  const queueRef = useRef<InvestigateProgressEvent[]>([]);
  const drainingRef = useRef(false);
  const queueWaitersRef = useRef<Array<() => void>>([]);

  function notifyQueueIdle() {
    if (queueRef.current.length > 0 || drainingRef.current) return;
    const waiters = queueWaitersRef.current.splice(0);
    waiters.forEach((w) => w());
  }

  function waitForProgressQueue(): Promise<void> {
    if (queueRef.current.length === 0 && !drainingRef.current) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      queueWaitersRef.current.push(resolve);
    });
  }

  async function drainProgressQueue() {
    if (drainingRef.current) return;
    drainingRef.current = true;
    while (queueRef.current.length > 0) {
      const event = queueRef.current.shift()!;
      setProgress((prev) => reduceProgress(prev, event));
      await sleep(progressEventDelayMs(event));
    }
    drainingRef.current = false;
    notifyQueueIdle();
  }

  function enqueueProgress(event: InvestigateProgressEvent) {
    queueRef.current.push(event);
    void drainProgressQueue();
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCase(caseId);
        if (!cancelled) setCaseRow(data.case);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load case");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  async function onInvestigate() {
    setBusy(true);
    setError(null);
    setBriefError(null);
    setBriefing(null);
    setHumanDecision(null);
    setFinding(null);
    setInvestigationId(null);
    queueRef.current = [];
    setProgress({
      ...initialProgressState(),
      open: true,
      phaseLabel: "Starting…",
      phases: initialProgressState().phases.map((p) =>
        p.id === "start" ? { ...p, status: "active" } : p
      ),
    });

    try {
      const result = await investigateWithProgress(caseId, enqueueProgress);
      await waitForProgressQueue();
      setInvestigationId(result.id);
      setFinding(result.finding);
      setProgress((prev) => ({
        ...prev,
        open: true,
        phase: "complete",
        phaseLabel: `Finding ready → ${formatLabel(result.finding.recommendation)}`,
        recommendation: result.finding.recommendation,
        phases: prev.phases.map((p) => ({ ...p, status: "done" as const })),
        checklist: prev.checklist.map((c) =>
          c.status === "active" ? { ...c, status: "done" as const } : c
        ),
      }));
      setAudit((a) => [
        ...a,
        `${new Date().toLocaleTimeString()} Investigation completed → ${formatLabel(result.finding.recommendation)}`,
      ]);
    } catch (e) {
      await waitForProgressQueue();
      const message = e instanceof Error ? e.message : "Investigate failed";
      setError(message);
      setProgress((prev) => ({
        ...prev,
        open: true,
        phase: "failed",
        phaseLabel: "Investigation failed",
        error: message,
      }));
      setAudit((a) => [
        ...a,
        `${new Date().toLocaleTimeString()} Investigation failed`,
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function onBrief() {
    if (!investigationId) return;
    setBriefBusy(true);
    setBriefError(null);
    try {
      const result = await briefInvestigation(investigationId);
      setBriefing(result);
      setAudit((a) => [
        ...a,
        `${new Date().toLocaleTimeString()} Voice brief ${
          result.stub ? "(script only)" : "ready"
        }`,
      ]);
    } catch (e) {
      setBriefError(e instanceof Error ? e.message : "Brief failed");
    } finally {
      setBriefBusy(false);
    }
  }

  async function onDecide(decision: string) {
    if (!investigationId) return;
    setBusy(true);
    setError(null);
    try {
      await decide(investigationId, decision);
      setHumanDecision(decision);
      setAudit((a) => [
        ...a,
        `${new Date().toLocaleTimeString()} Human decision → ${formatLabel(decision)} (Manager)`,
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decision failed");
    } finally {
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="space-y-3">
        <p className="text-red-600">{loadError}</p>
        <Link href="/" className="text-sm font-semibold text-accent">
          ← Back to cases
        </Link>
      </div>
    );
  }

  if (!caseRow) {
    return <p className="text-sm text-slate-500">Loading case…</p>;
  }

  return (
    <div className="animate-fade-up space-y-6">
      <Link href="/" className="text-sm font-semibold text-accent">
        ← Back to cases
      </Link>

      <section className="desk-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <p className="desk-meta">
              Case #{caseRow.id}
              {caseRow.order_id ? ` · ${caseRow.order_id}` : ""}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
              {caseRow.title}
            </h2>
            <p className="mt-3 text-sm italic leading-relaxed text-slate-600">
              “{caseRow.customer_message}”
            </p>
            <p className="mt-3">
              <span className="claim-chip">
                {formatLabel(caseRow.claim_type)}
              </span>
              <span className="ml-2 text-sm font-semibold tabular-nums text-accent">
                A${caseRow.amount_aud.toLocaleString()}
              </span>
            </p>
          </div>
          <button
            type="button"
            disabled={busy || progress.open}
            onClick={onInvestigate}
            className="btn-primary"
          >
            {busy ? "Investigating…" : "Investigate"}
          </button>
        </div>
        {error && !progress.open ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        ) : null}
        {humanDecision ? (
          <p className="mt-4 rounded-xl border border-teal-300/60 bg-accent-soft/80 px-3 py-2.5 text-sm text-teal-950">
            Recorded decision:{" "}
            <strong>{formatLabel(humanDecision)}</strong> (AI recommended{" "}
            {formatLabel(finding?.recommendation)})
          </p>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <EvidencePanel finding={finding} />
        <FindingPanel finding={finding} />
      </div>

      {finding && "ops" in caseRow && caseRow.ops ? (
        <DeliveryOpsPanel
          tracking={caseRow.ops.tracking}
          delivery={caseRow.ops.delivery_evidence}
        />
      ) : null}

      {finding && investigationId ? (
        <>
          <BriefMePanel
            disabled={!investigationId || !finding}
            busy={briefBusy}
            briefing={
              briefing
                ? {
                    script: briefing.script,
                    audio_url: briefing.audio_url,
                    stub: briefing.stub,
                    message: briefing.message,
                  }
                : null
            }
            error={briefError}
            onBrief={onBrief}
          />

          <HitlActions disabled={!finding || busy} onDecide={onDecide} />
        </>
      ) : null}

      <AuditTimeline lines={audit} />

      <InvestigationProgressModal
        state={progress}
        onClose={() => setProgress((p) => ({ ...p, open: false }))}
      />
    </div>
  );
}
