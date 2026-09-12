import { z } from "zod";

/** Keep in sync with backend/src/schemas/finding.ts */
export const RecommendationSchema = z.enum([
  "APPROVE",
  "HOLD",
  "REJECT",
  "ESCALATE",
  "REQUEST_INFO",
]);
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const RiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const EvidenceItemSchema = z.object({
  id: z.string(),
  source: z.string(),
  fact: z.string(),
});

export const PolicyCitationSchema = z.object({
  doc: z.string(),
  quote: z.string(),
  section: z.string().optional(),
});

export const InvestigationConfidenceSchema = z.object({
  label: z.enum(["LOW", "MEDIUM", "HIGH"]),
  why: z.array(z.string()).min(1),
});

export const FindingSchema = z.object({
  case_id: z.string(),
  claim_type: z.string(),
  evidence: z.array(EvidenceItemSchema),
  contradictions: z.array(z.string()),
  policy_citations: z.array(PolicyCitationSchema),
  risk: RiskLevelSchema,
  recommendation: RecommendationSchema,
  recommended_action: z.string(),
  investigation_confidence: InvestigationConfidenceSchema,
  reason: z.string(),
  confidence_score: z.number().min(0).max(1).optional(),
  tools_used: z.array(z.string()).optional(),
});
export type Finding = z.infer<typeof FindingSchema>;

export const HumanDecisionSchema = z.enum([
  "APPROVE",
  "REJECT",
  "ESCALATE",
  "REQUEST_INFO",
]);
export type HumanDecision = z.infer<typeof HumanDecisionSchema>;
