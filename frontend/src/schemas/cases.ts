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

export const TrackingOpsSchema = z.object({
  found: z.boolean(),
  order_id: z.string(),
  carrier: z.string().optional(),
  tracking_number: z.string().optional(),
  status: z.string().optional(),
  delivered_at: z.string().nullable().optional(),
  gps_lat: z.number().nullable().optional(),
  gps_lng: z.number().nullable().optional(),
  registered_lat: z.number().nullable().optional(),
  registered_lng: z.number().nullable().optional(),
  distance_meters: z.number().nullable().optional(),
  delivery_method: z.string().nullable().optional(),
});

export const DeliveryEvidenceOpsSchema = z.object({
  found: z.boolean(),
  order_id: z.string(),
  exists: z.boolean(),
  url: z.string().nullable(),
  caption: z.string().nullable(),
  limitations: z.array(z.string()),
  captured_at: z.string().nullable().optional(),
});

export const CaseOpsSchema = z.object({
  tracking: TrackingOpsSchema,
  delivery_evidence: DeliveryEvidenceOpsSchema,
});

export const CasesResponseSchema = z.object({
  cases: z.array(CaseSummarySchema),
});

export const CaseResponseSchema = z.object({
  case: CaseSummarySchema.extend({
    ops: CaseOpsSchema.optional(),
  }),
});

export type CaseDetail = z.infer<typeof CaseResponseSchema>["case"];

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
