import { findCustomerHistory } from "../../repositories/customerHistoryRepository.js";

/** Prior dispute counts + short list for a customer. */
export async function getCustomerHistory(customerId: string) {
  return findCustomerHistory(customerId);
}
