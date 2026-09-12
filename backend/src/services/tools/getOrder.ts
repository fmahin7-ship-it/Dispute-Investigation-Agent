import { findOrderById } from "../../repositories/orderRepository.js";

/** Slim order facts from Postgres seed. */
export async function getOrder(orderId: string) {
  return findOrderById(orderId);
}
