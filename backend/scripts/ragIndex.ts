/**
 * Person C — embed policies into policy_chunks.
 *
 *   cd backend && npm run rag:index
 *
 * Requires DATABASE_URL + OPENAI_API_KEY (see RAG_HANDOFF.md).
 */
import "dotenv/config";
import { closePool } from "../src/db/client.js";
import { indexAllPolicies } from "../src/services/rag/indexPolicies.js";

async function main() {
  console.log("→ indexing policy markdown into policy_chunks …");
  const result = await indexAllPolicies();
  console.log(
    JSON.stringify(
      {
        ready: result.ready,
        docs: result.docs,
        chunk_count: result.chunk_count,
        avg_estimated_tokens: result.avg_estimated_tokens,
      },
      null,
      2
    )
  );
  console.log("✓ rag:index complete");
}

main()
  .catch((err) => {
    console.error("rag:index failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
