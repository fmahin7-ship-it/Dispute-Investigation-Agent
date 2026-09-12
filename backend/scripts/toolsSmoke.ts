/**
 * Person B smoke — print slim tool payloads for demo cases 1042 / 1087 / 1112.
 *
 *   cd backend && npm run tools:smoke
 */
import "dotenv/config";
import { closePool } from "../src/db/client.js";
import { findCaseById } from "../src/repositories/caseRepository.js";
import { executeTool } from "../src/services/tools/index.js";

const DEMO_CASES = ["1042", "1087", "1112"] as const;

async function runForCase(caseId: string) {
  const caseRow = await findCaseById(caseId);
  if (!caseRow) {
    console.error(`Case ${caseId} not found in Postgres`);
    return;
  }

  console.log(`\n=== Case ${caseId} ===`);
  console.log(
    JSON.stringify(
      {
        claim_type: caseRow.claim_type,
        amount_aud: caseRow.amount_aud,
        order_id: caseRow.order_id,
        customer_id: caseRow.customer_id,
        expected_recommendation: caseRow.expected_recommendation,
      },
      null,
      2
    )
  );

  const tools = [
    ["get_order", { order_id: caseRow.order_id }],
    ["get_tracking", { order_id: caseRow.order_id }],
    ["get_delivery_evidence", { order_id: caseRow.order_id }],
    ["get_customer_history", { customer_id: caseRow.customer_id }],
    ["get_payments", { order_id: caseRow.order_id }],
    ["get_warehouse_pick", { order_id: caseRow.order_id }],
  ] as const;

  for (const [name, args] of tools) {
    const result = await executeTool(name, args);
    console.log(`\n-- ${name} --`);
    console.log(JSON.stringify(result, null, 2));
  }
}

async function main() {
  for (const id of DEMO_CASES) {
    await runForCase(id);
  }
}

main()
  .catch((err) => {
    console.error("tools:smoke failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
