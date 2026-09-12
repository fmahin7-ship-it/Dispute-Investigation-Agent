/**
 * Person C smoke — handoff-gate queries against search_policy.
 *
 *   cd backend && npm run rag:smoke
 */
import "dotenv/config";
import { closePool } from "../src/db/client.js";
import { countPolicyChunks } from "../src/services/rag/indexPolicies.js";
import { searchPolicy } from "../src/services/rag/searchPolicy.js";
import { executeTool } from "../src/services/tools/index.js";

const SMOKE_QUERIES = [
  "high value delivered order refund manual verification",
  "duplicate charge same order",
  "wrong item warehouse matches request evidence",
] as const;

async function main() {
  const count = await countPolicyChunks();
  console.log(`policy_chunks with embeddings: ${count}`);
  if (count === 0) {
    throw new Error("policy_chunks is empty — run npm run rag:index first");
  }

  for (const q of SMOKE_QUERIES) {
    const viaService = await searchPolicy(q);
    const viaTool = await executeTool("search_policy", { query: q });

    console.log(`\n=== query: ${q} ===`);
    console.log(
      JSON.stringify(
        {
          chunk_count: viaService.chunks.length,
          docs: [...new Set(viaService.chunks.map((c) => c.doc))],
          top: viaService.chunks.slice(0, 3).map((c) => ({
            doc: c.doc,
            section: c.section,
            score: c.score,
            quote_preview: c.quote.slice(0, 160).replace(/\s+/g, " "),
          })),
          tool_matches_service:
            JSON.stringify(viaTool) === JSON.stringify(viaService),
        },
        null,
        2
      )
    );
  }
}

main()
  .catch((err) => {
    console.error("rag:smoke failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
