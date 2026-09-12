import type { HumanDecision } from "../schemas/finding.js";
import { HumanDecisionSchema } from "../schemas/finding.js";
import { getInvestigationOrThrow } from "./investigationService.js";
import { appendAudit } from "./auditService.js";

/** HITL gate — AI recommends; human decides. No real refund rails. */
export async function applyDecision(
  investigationId: string,
  decision: HumanDecision,
  decidedBy: string
) {
  HumanDecisionSchema.parse(decision);
  const inv = await getInvestigationOrThrow(investigationId);

  const record = {
    investigation_id: investigationId,
    case_id: inv.case_id,
    ai_recommendation: inv.finding.recommendation,
    human_decision: decision,
    decided_by: decidedBy,
    role_label: "Manager",
    at: new Date().toISOString(),
    note: "Skeleton — production maps role_label to real RBAC",
  };

  appendAudit({ type: "human_decision", ...record });
  return record;
}
