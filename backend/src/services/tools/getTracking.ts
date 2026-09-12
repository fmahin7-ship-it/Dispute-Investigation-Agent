/** Person B */
export async function getTracking(orderId: string) {
  return {
    order_id: orderId,
    stub: true,
    message: "TODO Person B: tracking + GPS proximity",
  };
}
