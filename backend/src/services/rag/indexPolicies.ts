import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPool, query } from "../../db/client.js";
import { chunkMarkdown, summarizeChunks } from "./chunkMarkdown.js";
import { embedTexts, toVectorLiteral } from "./embeddings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POLICIES_DIR = path.resolve(__dirname, "../../../data/policies");

export type IndexPoliciesResult = {
  ready: true;
  docs: string[];
  chunk_count: number;
  avg_estimated_tokens: number;
};

function chunkId(docName: string, chunkIndex: number): string {
  return `${docName}::${chunkIndex}`;
}

async function listPolicyFiles(): Promise<string[]> {
  const entries = await fs.readdir(POLICIES_DIR);
  return entries.filter((name) => name.toLowerCase().endsWith(".md")).sort();
}

/**
 * Person C — chunk → embed → upsert into policy_chunks.
 * Re-running replaces chunks for each policy doc (idempotent for demo).
 */
export async function indexAllPolicies(): Promise<IndexPoliciesResult> {
  const files = await listPolicyFiles();
  if (files.length === 0) {
    throw new Error(`No policy markdown found in ${POLICIES_DIR}`);
  }

  const drafts: ReturnType<typeof chunkMarkdown> = [];
  for (const file of files) {
    const markdown = await fs.readFile(path.join(POLICIES_DIR, file), "utf8");
    drafts.push(...chunkMarkdown(file, markdown));
  }

  if (drafts.length === 0) {
    throw new Error("Policy chunking produced zero chunks");
  }

  const vectors = await embedTexts(drafts.map((d) => d.content));
  if (vectors.length !== drafts.length) {
    throw new Error(
      `Embedding count mismatch: ${vectors.length} vectors for ${drafts.length} chunks`
    );
  }

  const docNames = [...new Set(drafts.map((d) => d.doc_name))];

  // Dedicated client so BEGIN/DELETE/INSERT/COMMIT share one connection.
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "DELETE FROM policy_chunks WHERE doc_name = ANY($1::text[])",
      [docNames]
    );

    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i]!;
      const vector = vectors[i]!;
      await client.query(
        `INSERT INTO policy_chunks (id, doc_name, section, chunk_index, content, embedding)
         VALUES ($1, $2, $3, $4, $5, $6::vector)`,
        [
          chunkId(draft.doc_name, draft.chunk_index),
          draft.doc_name,
          draft.section,
          draft.chunk_index,
          draft.content,
          toVectorLiteral(vector),
        ]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback errors
    }
    throw err;
  } finally {
    client.release();
  }

  const summary = summarizeChunks(drafts);
  return {
    ready: true,
    docs: docNames,
    chunk_count: summary.count,
    avg_estimated_tokens: summary.avg_estimated_tokens,
  };
}

/** Count indexed policy chunks (Person A/D may call before investigate). */
export async function countPolicyChunks(): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM policy_chunks WHERE embedding IS NOT NULL"
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function listIndexedDocs(): Promise<string[]> {
  const result = await query<{ doc_name: string }>(
    `SELECT DISTINCT doc_name
     FROM policy_chunks
     WHERE embedding IS NOT NULL
     ORDER BY doc_name`
  );
  return result.rows.map((row) => row.doc_name);
}

/**
 * Ensure the vector index is ready. Indexes only when the table is empty
 * so API boot stays cheap after the first `npm run rag:index`.
 */
export async function ensurePolicyIndex(): Promise<
  IndexPoliciesResult | { ready: false; reason: string; chunk_count: number }
> {
  const existing = await countPolicyChunks();
  if (existing > 0) {
    return {
      ready: true,
      docs: await listIndexedDocs(),
      chunk_count: existing,
      avg_estimated_tokens: 0,
    };
  }

  try {
    return await indexAllPolicies();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ready: false, reason: message, chunk_count: 0 };
  }
}
