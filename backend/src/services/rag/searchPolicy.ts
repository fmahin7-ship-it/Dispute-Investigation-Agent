import { query } from "../../db/client.js";
import { embedQuery, toVectorLiteral } from "./embeddings.js";
import { countPolicyChunks } from "./indexPolicies.js";

export type PolicyChunkHit = {
  doc: string;
  quote: string;
  section?: string;
  score?: number;
};

export type SearchPolicyResult = {
  query: string;
  chunks: PolicyChunkHit[];
};

const DEFAULT_TOP_K = 5;

type PolicyRow = {
  doc: string;
  quote: string;
  section: string | null;
  score: string | null;
};

/**
 * Policy RAG retrieval.
 * Embed query → top-k cosine similarity over policy_chunks only (no ops rows).
 */
export async function searchPolicy(
  rawQuery: string,
  topK = DEFAULT_TOP_K
): Promise<SearchPolicyResult> {
  const cleaned = rawQuery.trim();
  if (!cleaned) {
    return { query: rawQuery, chunks: [] };
  }

  const indexed = await countPolicyChunks();
  if (indexed === 0) {
    return {
      query: cleaned,
      chunks: [],
    };
  }

  const vector = await embedQuery(cleaned);
  const limit = Math.max(1, Math.min(topK, 12));

  const result = await query<PolicyRow>(
    `SELECT
       doc_name AS doc,
       content AS quote,
       section,
       (1 - (embedding <=> $1::vector))::text AS score
     FROM policy_chunks
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [toVectorLiteral(vector), limit]
  );

  const chunks: PolicyChunkHit[] = result.rows.map((row) => {
    const hit: PolicyChunkHit = {
      doc: row.doc,
      quote: row.quote,
    };
    if (row.section) {
      hit.section = row.section;
    }
    if (row.score != null && row.score !== "") {
      hit.score = Number(Number(row.score).toFixed(4));
    }
    return hit;
  });

  return { query: cleaned, chunks };
}
