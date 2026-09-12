import { z } from "zod";
import { HumanDecisionSchema } from "./finding.js";

export const DecideBodySchema = z.object({
  decision: HumanDecisionSchema,
  decided_by: z.string().min(1).default("manager"),
});
export type DecideBody = z.infer<typeof DecideBodySchema>;
