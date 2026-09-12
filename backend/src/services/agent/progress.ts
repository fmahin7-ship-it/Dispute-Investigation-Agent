/** Live investigation progress (console + SSE). */
export type InvestigationProgressEvent =
  | {
      type: "round_start";
      case_id: string;
      round: number;
      max_rounds: number;
      mode: "tools" | "finalize";
    }
  | {
      type: "tool_start";
      case_id: string;
      round: number;
      tool: string;
      args: Record<string, unknown>;
    }
  | {
      type: "tool_done";
      case_id: string;
      round: number;
      tool: string;
      ok: boolean;
      error?: string;
    }
  | {
      type: "finding_ready";
      case_id: string;
      recommendation: string;
      tools_used: string[];
    };

export type InvestigationProgressHandler = (
  event: InvestigationProgressEvent
) => void;

export function formatProgressLog(event: InvestigationProgressEvent): string {
  switch (event.type) {
    case "round_start":
      return `[agent] case=${event.case_id} round=${event.round}/${event.max_rounds} ${event.mode}`;
    case "tool_start":
      return `[agent] case=${event.case_id} round=${event.round} → ${event.tool}(${JSON.stringify(event.args)})`;
    case "tool_done":
      return event.ok
        ? `[agent] case=${event.case_id} round=${event.round} ✓ ${event.tool}`
        : `[agent] case=${event.case_id} round=${event.round} ✗ ${event.tool}: ${event.error ?? "error"}`;
    case "finding_ready":
      return `[agent] case=${event.case_id} finding=${event.recommendation} tools=[${event.tools_used.join(", ")}]`;
  }
}
