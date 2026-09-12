/** Person B — photo URL + caption + limitations (no Vision). */
export async function getDeliveryEvidence(orderId: string) {
  return {
    order_id: orderId,
    exists: false,
    url: null,
    caption: null,
    limitations: [],
    stub: true,
    message: "TODO Person B: delivery evidence fixture",
  };
}
