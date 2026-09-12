/**
 * Person C — Policy RAG
 * Embeddings over data/policies/*.md (or PDF text).
 * Return top-k chunks with doc + quote. Ops data stays OUT of the vector DB.
 */
export async function searchPolicy(query: string) {
  return {
    query,
    chunks: [] as Array<{ doc: string; quote: string; score?: number }>,
    stub: true,
    message: "TODO Person C: implement embeddings + retrieval",
  };
}
