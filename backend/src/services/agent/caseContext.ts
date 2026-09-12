import type { CaseSummary } from "../../schemas/cases.js";

/** Ops keys only — never include expected_recommendation / expected_action. */
export type AgentCaseContext = {
  case_id: string;
  title: string;
  customer_message: string;
  claim_type: string;
  amount_aud: number;
  order_id: string;
  customer_id: string;
};

/**
 * Strip answer-key fields before the model sees the case.
 * expected_recommendation / expected_action are eval labels only — never LLM input.
 */
export function toAgentCaseContext(caseRow: CaseSummary): AgentCaseContext {
  return {
    case_id: caseRow.id,
    title: caseRow.title,
    customer_message: caseRow.customer_message,
    claim_type: caseRow.claim_type,
    amount_aud: caseRow.amount_aud,
    order_id: caseRow.order_id,
    customer_id: caseRow.customer_id,
  };
}

export function buildInitialUserMessage(ctx: AgentCaseContext): string {
  return [
    "Investigate this NovaCart dispute and produce a Finding.",
    "",
    "Case context (ops keys for tools):",
    JSON.stringify(ctx, null, 2),
    "",
    "Suggested first-round tools (call in parallel as needed):",
    `- get_order with order_id "${ctx.order_id}"`,
    `- claim-relevant ops tools for claim_type "${ctx.claim_type}"`,
    `- get_customer_history with customer_id "${ctx.customer_id}" when INR / high-value / risk`,
    `- search_policy with a specific query for this claim`,
  ].join("\n");
}
