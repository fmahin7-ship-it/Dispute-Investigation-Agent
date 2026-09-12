import { query } from "../db/client.js";
import { toIso, toNumber } from "../db/coerce.js";

type HistoryRow = {
  related_order: string | null;
  claim_type: string;
  outcome: string;
  amount_aud: string | null;
  opened_at: Date;
  notes: string | null;
};

export type PriorDispute = {
  related_order: string | null;
  claim_type: string;
  outcome: string;
  amount_aud: number | null;
  opened_at: string | null;
  notes: string | null;
};

export type CustomerHistoryFacts = {
  found: boolean;
  customer_id: string;
  prior_dispute_count: number;
  refunded_count: number;
  total_disputed_aud: number;
  prior: PriorDispute[];
};

export async function findCustomerHistory(
  customerId: string
): Promise<CustomerHistoryFacts> {
  const result = await query<HistoryRow>(
    `SELECT related_order, claim_type, outcome, amount_aud::text AS amount_aud,
            opened_at, notes
     FROM customer_dispute_history
     WHERE customer_id = $1
     ORDER BY opened_at DESC`,
    [customerId]
  );

  const prior: PriorDispute[] = result.rows.map((row) => ({
    related_order: row.related_order,
    claim_type: row.claim_type,
    outcome: row.outcome,
    amount_aud: toNumber(row.amount_aud),
    opened_at: toIso(row.opened_at),
    notes: row.notes,
  }));

  const refundedCount = prior.filter((p) =>
    p.outcome === "refunded" || p.outcome === "partial_refund"
  ).length;

  const totalDisputed = prior.reduce(
    (sum, p) => sum + (p.amount_aud ?? 0),
    0
  );

  return {
    found: prior.length > 0,
    customer_id: customerId,
    prior_dispute_count: prior.length,
    refunded_count: refundedCount,
    total_disputed_aud: totalDisputed,
    prior,
  };
}
