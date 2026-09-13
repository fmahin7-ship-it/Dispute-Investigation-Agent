import type { Finding } from "../../schemas/finding.js";
import type { CaseSummary } from "../../schemas/cases.js";
import { findWarehousePickByOrderId } from "../../repositories/warehousePickRepository.js";

/**
 * Deterministic policy guards after the LLM Finding.
 * REF-7.2: wrong_item + warehouse matches order → REQUEST_INFO (never REJECT/APPROVE on free-text).
 */
export async function applyFindingGuards(
  finding: Finding,
  caseRow: CaseSummary
): Promise<Finding> {
  if (caseRow.claim_type !== "wrong_item") {
    return finding;
  }

  const pick = await findWarehousePickByOrderId(caseRow.order_id);
  if (!pick.found || pick.sku_match !== true) {
    return finding;
  }

  if (
    finding.recommendation === "REQUEST_INFO" &&
    finding.recommended_action === "REQUEST_PHOTO_OF_ITEM"
  ) {
    return finding;
  }

  const reason =
    finding.recommendation === "REQUEST_INFO"
      ? finding.reason
      : `${finding.reason} Policy REF-7.2: warehouse pick matches order — request photo evidence before reject or refund.`;

  return {
    ...finding,
    recommendation: "REQUEST_INFO",
    recommended_action: "REQUEST_PHOTO_OF_ITEM",
    reason,
  };
}
