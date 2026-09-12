/**
 * Smoke: run the real agent on demo cases 1042 / 1087 / 1112.
 *
 *   cd backend && npm run agent:smoke
 *
 * Requires DATABASE_URL, OPENAI_API_KEY, and `npm run rag:index` beforehand.
 */
import "dotenv/config";
import { closePool } from "../src/db/client.js";
import { findCaseById } from "../src/repositories/caseRepository.js";
import { runInvestigationAgent } from "../src/services/agent/investigator.js";
import { FindingSchema } from "../src/schemas/finding.js";

const DEMO = [
  { id: "1042", expected: "HOLD" },
  { id: "1087", expected: "APPROVE" },
  { id: "1112", expected: "REQUEST_INFO" },
] as const;

async function main() {
  let failed = 0;

  for (const row of DEMO) {
    const caseRow = await findCaseById(row.id);
    if (!caseRow) {
      console.error(`Case ${row.id} not found — run npm run db:seed`);
      failed += 1;
      continue;
    }

    console.log(`\n=== Case ${row.id} (expect ${row.expected}) ===`);
    const finding = await runInvestigationAgent(caseRow);
    FindingSchema.parse(finding);

    const ok = finding.recommendation === row.expected;
    if (!ok) failed += 1;

    console.log(
      JSON.stringify(
        {
          recommendation: finding.recommendation,
          recommended_action: finding.recommended_action,
          risk: finding.risk,
          evidence_count: finding.evidence.length,
          policy_citations_count: finding.policy_citations.length,
          contradictions: finding.contradictions,
          confidence: finding.investigation_confidence,
          tools_used: finding.tools_used,
          match_expected: ok,
        },
        null,
        2
      )
    );
  }

  if (failed > 0) {
    throw new Error(`agent:smoke failed on ${failed} case(s)`);
  }
  console.log("\n✓ agent:smoke passed demo gates");
}

main()
  .catch((err) => {
    console.error("agent:smoke failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
