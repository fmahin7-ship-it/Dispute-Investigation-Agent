/**
 * Person A — register OpenAI-compatible tool definitions here.
 * Person B implements the handlers in services/tools/*.
 */
export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "get_order",
      description: "Get order facts for a case/order id",
      parameters: {
        type: "object",
        properties: { order_id: { type: "string" } },
        required: ["order_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_tracking",
      description: "Get shipment tracking and GPS proximity facts",
      parameters: {
        type: "object",
        properties: { order_id: { type: "string" } },
        required: ["order_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_delivery_evidence",
      description:
        "Get delivery photo metadata/caption (no computer vision). Returns exists, url, caption, limitations.",
      parameters: {
        type: "object",
        properties: { order_id: { type: "string" } },
        required: ["order_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_customer_history",
      description: "Get prior dispute/refund summary for a customer",
      parameters: {
        type: "object",
        properties: { customer_id: { type: "string" } },
        required: ["customer_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_payments",
      description: "Get payment transactions for an order (duplicate-charge cases)",
      parameters: {
        type: "object",
        properties: { order_id: { type: "string" } },
        required: ["order_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_warehouse_pick",
      description: "Get warehouse pick/pack log (wrong-item cases)",
      parameters: {
        type: "object",
        properties: { order_id: { type: "string" } },
        required: ["order_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_policy",
      description:
        "Search company refund/delivery/high-value policies. Call again with a refined query if needed.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
];
