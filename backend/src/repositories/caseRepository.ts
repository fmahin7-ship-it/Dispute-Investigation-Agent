import { query } from "../db/client.js";
import { toNumber } from "../db/coerce.js";
import type { CaseSummary } from "../schemas/cases.js";

type DisputeRow = {
  case_number: string;
  claim_type: string;
  customer_message: string;
  amount_aud: string;
  expected_recommendation: string | null;
  expected_action: string | null;
  demo: boolean;
  order_id: string;
  customer_id: string;
  item_name: string;
};

function amountLabel(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

/** Title from seed claim_type + amount + order item_name (no invented copy). */
function buildTitle(
  claimType: string,
  amount: number,
  itemName: string
): string {
  const money = amountLabel(amount);
  switch (claimType) {
    case "not_received":
      return `Item not received — $${money} ${itemName}`;
    case "duplicate_charge":
      return `Duplicate charge — $${money}`;
    case "wrong_item":
      return `Wrong item received`;
    default:
      return `${claimType.replaceAll("_", " ")} — $${money}`;
  }
}

function mapRow(row: DisputeRow): CaseSummary {
  const amount = toNumber(row.amount_aud) ?? 0;
  return {
    id: row.case_number,
    title: buildTitle(row.claim_type, amount, row.item_name),
    customer_message: row.customer_message,
    claim_type: row.claim_type,
    amount_aud: amount,
    expected_recommendation: row.expected_recommendation ?? "",
    expected_action: row.expected_action ?? "",
    demo: row.demo,
    order_id: row.order_id,
    customer_id: row.customer_id,
  };
}

const CASE_SELECT = `
  SELECT
    d.case_number,
    d.claim_type,
    d.customer_message,
    d.amount_aud::text AS amount_aud,
    d.expected_recommendation,
    d.expected_action,
    d.demo,
    d.order_id,
    d.customer_id,
    o.item_name
  FROM disputes d
  JOIN orders o ON o.id = d.order_id
`;

/** Demo queue — disputes.demo = true (1042 / 1087 / 1112). */
export async function listDemoCases(): Promise<CaseSummary[]> {
  const result = await query<DisputeRow>(
    `${CASE_SELECT} WHERE d.demo = TRUE ORDER BY d.case_number`
  );
  return result.rows.map(mapRow);
}

export async function findCaseById(
  caseId: string
): Promise<CaseSummary | null> {
  const result = await query<DisputeRow>(
    `${CASE_SELECT} WHERE d.case_number = $1 LIMIT 1`,
    [caseId]
  );
  const row = result.rows[0];
  return row ? mapRow(row) : null;
}
