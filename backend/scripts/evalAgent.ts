/**
 * Eval harness: run fixture cases and score recommendation vs expected_recommendation.
 *
 *   cd backend && npm run eval
 *
 * Prerequisites: DATABASE_URL, OPENAI_API_KEY, db:seed, rag:index.
 * Optional: EVAL_CASES=1042,1087 to run a subset.
 */
import "dotenv/config";
import { closePool } from "../src/db/client.js";
import { findCaseById } from "../src/repositories/caseRepository.js";
import { runInvestigationAgent } from "../src/services/agent/investigator.js";
import { FindingSchema } from "../src/schemas/finding.js";

/** Seed fixtures with labeled expected_recommendation (see eval/README.md). */
const FIXTURE_IDS = ["1042", "1087", "1112", "1201", "1202", "1203"] as const;

type RowResult = {
  caseId: string;
  expected: string;
  got: string;
  actionExpected: string;
  actionGot: string;
  pass: boolean;
  error?: string;
};

function selectedIds(): string[] {
  const raw = process.env.EVAL_CASES?.trim();
  if (!raw) return [...FIXTURE_IDS];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

async function main() {
  const ids = selectedIds();
  const results: RowResult[] = [];

  console.log(`Eval: ${ids.length} fixture case(s)\n`);

  for (const caseId of ids) {
    const caseRow = await findCaseById(caseId);
    if (!caseRow) {
      results.push({
        caseId,
        expected: "?",
        got: "—",
        actionExpected: "?",
        actionGot: "—",
        pass: false,
        error: "case not found (run npm run db:seed)",
      });
      console.log(`FAIL  ${caseId}  — case not found`);
      continue;
    }

    const expected = caseRow.expected_recommendation.trim().toUpperCase();
    if (!expected) {
      results.push({
        caseId,
        expected: "(empty)",
        got: "—",
        actionExpected: caseRow.expected_action,
        actionGot: "—",
        pass: false,
        error: "missing expected_recommendation in DB",
      });
      console.log(`FAIL  ${caseId}  — no expected_recommendation`);
      continue;
    }

    process.stdout.write(`… ${caseId} (expect ${expected}) `);

    try {
      const finding = await runInvestigationAgent(caseRow);
      FindingSchema.parse(finding);

      const got = finding.recommendation.toUpperCase();
      const pass = got === expected;

      results.push({
        caseId,
        expected,
        got,
        actionExpected: caseRow.expected_action,
        actionGot: finding.recommended_action,
        pass,
      });

      console.log(
        `${pass ? "PASS" : "FAIL"}  got ${got}` +
          (pass ? "" : ` (wanted ${expected})`)
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        caseId,
        expected,
        got: "ERROR",
        actionExpected: caseRow.expected_action,
        actionGot: "—",
        pass: false,
        error: message.slice(0, 200),
      });
      console.log(`FAIL  error: ${message.slice(0, 120)}`);
    }
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;

  console.log("\n┌────────┬──────────┬──────────┬────────┐");
  console.log("│ Case   │ Expected │ Got      │ Result │");
  console.log("├────────┼──────────┼──────────┼────────┤");
  for (const r of results) {
    console.log(
      `│ ${pad(r.caseId, 6)} │ ${pad(r.expected, 8)} │ ${pad(r.got, 8)} │ ${pad(
        r.pass ? "PASS" : "FAIL",
        6
      )} │`
    );
  }
  console.log("└────────┴──────────┴──────────┴────────┘");
  console.log(`\n${passed}/${results.length} passed`);

  if (failed > 0) {
    for (const r of results.filter((x) => !x.pass && x.error)) {
      console.log(`  ${r.caseId}: ${r.error}`);
    }
    throw new Error(`eval failed on ${failed} case(s)`);
  }

  console.log("✓ eval passed");
}

main()
  .catch((err) => {
    console.error("\neval failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
