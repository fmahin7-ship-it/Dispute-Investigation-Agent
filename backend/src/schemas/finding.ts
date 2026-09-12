import { z } from "zod";

/** AI stance — not the same as human decision or ops action */
export const RecommendationSchema = z.enum([
  "APPROVE",
  "HOLD",
  "REJECT",
  "ESCALATE",
  "REQUEST_INFO",
]);
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const RiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const EvidenceItemSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  fact: z.string().min(1),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const PolicyCitationSchema = z.object({
  doc: z.string().min(1),
  quote: z.string().min(1),
  section: z.string().optional(),
});
export type PolicyCitation = z.infer<typeof PolicyCitationSchema>;

export const InvestigationConfidenceSchema = z.object({
  label: z.enum(["LOW", "MEDIUM", "HIGH"]),
  why: z.array(z.string().min(1)).min(1),
});
export type InvestigationConfidence = z.infer<
  typeof InvestigationConfidenceSchema
>;

/**
 * Finding contract — keep in sync with frontend/src/schemas/finding.ts
 */
export const FindingSchema = z.object({
  case_id: z.string().min(1),
  claim_type: z.string().min(1),
  evidence: z.array(EvidenceItemSchema),
  contradictions: z.array(z.string()),
  policy_citations: z.array(PolicyCitationSchema),
  risk: RiskLevelSchema,
  recommendation: RecommendationSchema,
  recommended_action: z.string().min(1),
  investigation_confidence: InvestigationConfidenceSchema,
  reason: z.string().min(1),
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
