/** Person B — implement against seed DB. Return slim facts only. */
export async function getOrder(orderId: string) {
  return {
    order_id: orderId,
    stub: true,
    message: "TODO Person B: load order from seed",
  };
}
