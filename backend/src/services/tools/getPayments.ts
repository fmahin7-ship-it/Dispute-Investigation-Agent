/** Person B — duplicate charge case */
export async function getPayments(orderId: string) {
  return {
    order_id: orderId,
    payments: [],
    stub: true,
    message: "TODO Person B: payment rows",
  };
}
