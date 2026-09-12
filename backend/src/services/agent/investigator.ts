import type { Finding } from "../../schemas/finding.js";
import { FindingSchema } from "../../schemas/finding.js";
import type { CaseSummary } from "../../schemas/cases.js";

/**
 * Person A — replace stub with bounded native tool-calling loop.
 * Validate every Finding with FindingSchema before return.
 */
export async function runInvestigationAgent(
  caseRow: CaseSummary
): Promise<Finding> {
  const stub: Finding = {
    case_id: caseRow.id,
    claim_type: caseRow.claim_type,
    evidence: [
      {
        id: "E0",
        source: "stub",
        fact: "Agent not implemented yet — Person A owns investigator.ts",
      },
    ],
    contradictions: [],
    policy_citations: [],
    risk: "MEDIUM",
    recommendation: caseRow.expected_recommendation as Finding["recommendation"],
    recommended_action: caseRow.expected_action,
    investigation_confidence: {
      label: "LOW",
      why: ["Skeleton stub — replace with real tool loop"],
    },
    reason: "Placeholder Finding from skeleton. Implement agentic investigation.",
    tools_used: [],
  };

  return FindingSchema.parse(stub);
}
