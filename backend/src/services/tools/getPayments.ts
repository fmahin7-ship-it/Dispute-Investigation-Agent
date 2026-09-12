import { listPaymentsByOrderId } from "../../repositories/paymentRepository.js";

/** All charges for an order — critical for 1087 duplicate capture. */
export async function getPayments(orderId: string) {
  return listPaymentsByOrderId(orderId);
}
