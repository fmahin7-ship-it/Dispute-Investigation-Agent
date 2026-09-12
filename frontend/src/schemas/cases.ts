import { z } from "zod";
import { FindingSchema } from "./finding";

export const CaseSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  customer_message: z.string(),
  claim_type: z.string(),
  amount_aud: z.number(),
  expected_recommendation: z.string(),
  expected_action: z.string(),
  demo: z.boolean(),
  order_id: z.string().optional(),
  customer_id: z.string().optional(),
});
export type CaseSummary = z.infer<typeof CaseSummarySchema>;

export const CasesResponseSchema = z.object({
  cases: z.array(CaseSummarySchema),
});

export const CaseResponseSchema = z.object({
  case: CaseSummarySchema,
});

export const InvestigationResponseSchema = z.object({
  id: z.string(),
  case_id: z.string(),
  status: z.enum(["completed", "failed"]),
  finding: FindingSchema,
  created_at: z.string(),
});
export type InvestigationResponse = z.infer<typeof InvestigationResponseSchema>;

export const PolicyListItemSchema = z.object({
  doc: z.string(),
  title: z.string(),
  summary: z.string(),
});

export const PoliciesResponseSchema = z.object({
  policies: z.array(PolicyListItemSchema),
});

export const PolicyDetailSchema = z.object({
  doc: z.string(),
  title: z.string(),
  content: z.string(),
});
