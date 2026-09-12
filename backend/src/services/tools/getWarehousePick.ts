import { findWarehousePickByOrderId } from "../../repositories/warehousePickRepository.js";

/** Ordered vs picked SKU/name — critical for 1112 wrong-item. */
export async function getWarehousePick(orderId: string) {
  return findWarehousePickByOrderId(orderId);
}
