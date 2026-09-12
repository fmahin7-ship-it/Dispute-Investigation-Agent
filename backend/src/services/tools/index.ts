import { AppError } from "../../middleware/errorHandler.js";
import { getOrder } from "./getOrder.js";
import { getTracking } from "./getTracking.js";
import { getDeliveryEvidence } from "./getDeliveryEvidence.js";
import { getCustomerHistory } from "./getCustomerHistory.js";
import { getPayments } from "./getPayments.js";
import { getWarehousePick } from "./getWarehousePick.js";
import { searchPolicy } from "../rag/searchPolicy.js";

type ToolArgs = Record<string, unknown>;

/** Person B (+ C for search_policy) — validated tool gateway. No raw SQL for the LLM. */
export async function executeTool(name: string, args: ToolArgs) {
  switch (name) {
    case "get_order":
      return getOrder(String(args.order_id));
    case "get_tracking":
      return getTracking(String(args.order_id));
    case "get_delivery_evidence":
      return getDeliveryEvidence(String(args.order_id));
    case "get_customer_history":
      return getCustomerHistory(String(args.customer_id));
    case "get_payments":
      return getPayments(String(args.order_id));
    case "get_warehouse_pick":
      return getWarehousePick(String(args.order_id));
    case "search_policy":
      return searchPolicy(String(args.query));
    default:
      throw new AppError(400, `Unauthorized or unknown tool: ${name}`, "BAD_TOOL");
  }
}
