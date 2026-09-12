import { z } from "zod";

export const DemoCaseIdSchema = z.enum(["1042", "1087", "1112"]);
export type DemoCaseId = z.infer<typeof DemoCaseIdSchema>;

export const CaseSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  customer_message: z.string().min(1),
  claim_type: z.string().min(1),
  amount_aud: z.number().nonnegative(),
  expected_recommendation: z.string().min(1),
  expected_action: z.string().min(1),
  demo: z.boolean(),
  /** Ops keys for tools — from disputes.order_id / customer_id */
  order_id: z.string().min(1),
  customer_id: z.string().min(1),
});
export type CaseSummary = z.infer<typeof CaseSummarySchema>;

export const CaseIdParamSchema = z.object({
  caseId: z.string().min(1),
});

export const InvestigationIdParamSchema = z.object({
  investigationId: z.string().min(1),
});
