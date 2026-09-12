import { query } from "../db/client.js";
import { toIso, toNumber } from "../db/coerce.js";

type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  currency: string;
  total_amount: string;
  item_sku: string;
  item_name: string;
  item_category: string | null;
  paid_at: Date | null;
};

export type OrderFacts = {
  found: boolean;
  order_id: string;
  order_number?: string;
  customer_id?: string;
  status?: string;
  currency?: string;
  total_amount?: number;
  item_sku?: string;
  item_name?: string;
  item_category?: string | null;
  paid_at?: string | null;
};

export async function findOrderById(orderId: string): Promise<OrderFacts> {
  const result = await query<OrderRow>(
    `SELECT id, order_number, customer_id, status, currency,
            total_amount::text AS total_amount, item_sku, item_name,
            item_category, paid_at
     FROM orders WHERE id = $1 LIMIT 1`,
    [orderId]
  );
  const row = result.rows[0];
  if (!row) {
    return { found: false, order_id: orderId };
  }
  return {
    found: true,
    order_id: row.id,
    order_number: row.order_number,
    customer_id: row.customer_id,
    status: row.status,
    currency: row.currency,
    total_amount: toNumber(row.total_amount) ?? 0,
    item_sku: row.item_sku,
    item_name: row.item_name,
    item_category: row.item_category,
    paid_at: toIso(row.paid_at),
  };
}
