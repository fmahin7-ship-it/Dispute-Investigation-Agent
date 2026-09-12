import { findDeliveryEvidenceByOrderId } from "../../repositories/deliveryEvidenceRepository.js";

/** Photo URL + caption + limitations (no Vision). */
export async function getDeliveryEvidence(orderId: string) {
  const row = await findDeliveryEvidenceByOrderId(orderId);
  return {
    order_id: row.order_id,
    exists: row.exists,
    url: row.url,
    caption: row.caption,
    limitations: row.limitations,
    captured_at: row.captured_at ?? null,
    found: row.found,
  };
}
