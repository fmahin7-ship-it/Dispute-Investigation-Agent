/** Person B — wrong item case */
export async function getWarehousePick(orderId: string) {
  return {
    order_id: orderId,
    stub: true,
    message: "TODO Person B: warehouse pick/pack",
  };
}
