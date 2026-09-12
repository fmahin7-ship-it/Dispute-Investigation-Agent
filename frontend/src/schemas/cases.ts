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
});
export type CaseSummary = z.infer<typeof CaseSummarySchema>;

export const DEMO_CASES: CaseSummary[] = [
  {
    id: "1042",
    title: "Item not received — $850 MacBook",
    customer_message: "My $850 laptop wasn't delivered.",
    claim_type: "not_received",
    amount_aud: 850,
    expected_recommendation: "HOLD",
    expected_action: "MANUAL_VERIFICATION",
    demo: true,
  },
  {
    id: "1087",
    title: "Duplicate charge — $249",
    customer_message: "I was charged twice for the same order.",
    claim_type: "duplicate_charge",
    amount_aud: 249,
    expected_recommendation: "APPROVE",
    expected_action: "REFUND_DUPLICATE",
    demo: true,
  },
  {
    id: "1112",
    title: "Wrong item received",
    customer_message: "I ordered a MacBook Air but received a Pro claim.",
    claim_type: "wrong_item",
    amount_aud: 1299,
    expected_recommendation: "REQUEST_INFO",
    expected_action: "REQUEST_PHOTO_OF_ITEM",
    demo: true,
  },
];

export const CasesResponseSchema = z.object({
  cases: z.array(CaseSummarySchema),
});

export const InvestigationResponseSchema = z.object({
  id: z.string(),
  case_id: z.string(),
  status: z.enum(["completed", "failed"]),
  finding: FindingSchema,
  created_at: z.string(),
});
export type InvestigationResponse = z.infer<typeof InvestigationResponseSchema>;
