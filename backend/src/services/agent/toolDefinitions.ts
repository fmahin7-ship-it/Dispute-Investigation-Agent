/**
 * OpenAI-compatible tool definitions.
 * Handlers live in services/tools/*; search_policy uses the same executeTool gateway.
 */
export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "get_order",
      description:
        "Get slim order facts (status, amount, SKU, customer_id) for an order_id",
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
      description:
        "Get shipment tracking status, delivery timestamp, and GPS proximity (distance_meters) for an order",
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
      description:
        "Get prior dispute/refund summary for a customer (counts + short prior list)",
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
      description:
        "Get payment transactions for an order (use for duplicate-charge cases)",
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
      description:
        "Get warehouse pick/pack log including sku_match (use for wrong-item cases)",
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
        "Search NovaCart refund/delivery/high-value/fraud policies. Call again with a refined query if the first hit is too generic.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
];
