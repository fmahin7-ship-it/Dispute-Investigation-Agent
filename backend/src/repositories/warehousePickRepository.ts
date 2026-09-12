import { query } from "../db/client.js";
import { toIso } from "../db/coerce.js";

type PickRow = {
  order_id: string;
  sku_ordered: string;
  sku_picked: string;
  name_ordered: string;
  name_picked: string;
  picked_at: Date;
  picker_id: string | null;
};

export type WarehousePickFacts = {
  found: boolean;
  order_id: string;
  sku_ordered?: string;
  sku_picked?: string;
  name_ordered?: string;
  name_picked?: string;
  sku_match?: boolean;
  picked_at?: string | null;
  picker_id?: string | null;
};

export async function findWarehousePickByOrderId(
  orderId: string
): Promise<WarehousePickFacts> {
  const result = await query<PickRow>(
    `SELECT order_id, sku_ordered, sku_picked, name_ordered, name_picked,
            picked_at, picker_id
     FROM warehouse_picks WHERE order_id = $1
     ORDER BY picked_at DESC LIMIT 1`,
    [orderId]
  );
  const row = result.rows[0];
  if (!row) {
    return { found: false, order_id: orderId };
  }
  return {
    found: true,
    order_id: row.order_id,
    sku_ordered: row.sku_ordered,
    sku_picked: row.sku_picked,
    name_ordered: row.name_ordered,
    name_picked: row.name_picked,
    sku_match: row.sku_ordered === row.sku_picked,
    picked_at: toIso(row.picked_at),
    picker_id: row.picker_id,
  };
}
