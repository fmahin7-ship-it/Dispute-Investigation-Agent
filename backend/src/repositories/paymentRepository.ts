import { query } from "../db/client.js";
import { toIso, toNumber } from "../db/coerce.js";

type PaymentRow = {
  id: string;
  order_id: string;
  provider: string;
  charge_id: string;
  amount: string;
  currency: string;
  status: string;
  charged_at: Date;
};

export type PaymentFact = {
  id: string;
  provider: string;
  charge_id: string;
  amount: number;
  currency: string;
  status: string;
  charged_at: string | null;
};

export type PaymentsFacts = {
  found: boolean;
  order_id: string;
  payment_count: number;
  payments: PaymentFact[];
};

export async function listPaymentsByOrderId(
  orderId: string
): Promise<PaymentsFacts> {
  const result = await query<PaymentRow>(
    `SELECT id, order_id, provider, charge_id, amount::text AS amount,
            currency, status, charged_at
     FROM payments WHERE order_id = $1
     ORDER BY charged_at ASC`,
    [orderId]
  );
  const payments: PaymentFact[] = result.rows.map((row) => ({
    id: row.id,
    provider: row.provider,
    charge_id: row.charge_id,
    amount: toNumber(row.amount) ?? 0,
    currency: row.currency,
    status: row.status,
    charged_at: toIso(row.charged_at),
  }));
  return {
    found: payments.length > 0,
    order_id: orderId,
    payment_count: payments.length,
    payments,
  };
}
