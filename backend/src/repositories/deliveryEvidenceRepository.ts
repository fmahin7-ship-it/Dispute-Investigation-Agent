import { query } from "../db/client.js";
import { toIso } from "../db/coerce.js";

type EvidenceRow = {
  order_id: string;
  exists_flag: boolean;
  photo_url: string | null;
  caption: string | null;
  limitations: string[] | null;
  captured_at: Date | null;
};

export type DeliveryEvidenceFacts = {
  found: boolean;
  order_id: string;
  exists: boolean;
  url: string | null;
  caption: string | null;
  limitations: string[];
  captured_at?: string | null;
};

export async function findDeliveryEvidenceByOrderId(
  orderId: string
): Promise<DeliveryEvidenceFacts> {
  const result = await query<EvidenceRow>(
    `SELECT order_id, exists_flag, photo_url, caption, limitations, captured_at
     FROM delivery_evidence WHERE order_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [orderId]
  );
  const row = result.rows[0];
  if (!row) {
    return {
      found: false,
      order_id: orderId,
      exists: false,
      url: null,
      caption: null,
      limitations: [],
    };
  }
  return {
    found: true,
    order_id: row.order_id,
    exists: row.exists_flag,
    url: row.photo_url,
    caption: row.caption,
    limitations: row.limitations ?? [],
    captured_at: toIso(row.captured_at),
  };
}
