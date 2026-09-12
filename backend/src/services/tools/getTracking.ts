import { findShipmentByOrderId } from "../../repositories/shipmentRepository.js";

/** Slim tracking + GPS proximity from shipments. */
export async function getTracking(orderId: string) {
  return findShipmentByOrderId(orderId);
}
