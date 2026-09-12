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
});
export type CaseSummary = z.infer<typeof CaseSummarySchema>;

/** Live UI cases — Person B expands seed data behind these IDs */
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

export const CaseIdParamSchema = z.object({
  caseId: z.string().min(1),
});

export const InvestigationIdParamSchema = z.object({
  investigationId: z.string().min(1),
});
