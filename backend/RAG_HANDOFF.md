# RAG_HANDOFF — Policy retrieval

Policy markdown is the **knowledge** source. Ops rows stay in relational tables; only `backend/data/policies/*.md` is embedded into `policy_chunks`.

`search_policy` is wired through the shared `executeTool` gateway — call the tool name `search_policy` (do not reimplement retrieval).

## Setup

```bash
# from REPO_ROOT (Dispute-Investigation-Agent)
docker compose up -d
cd backend
# .env needs at least:
#   DATABASE_URL=postgresql://edi:edi@localhost:5432/edi
#   OPENAI_API_KEY=...
# Optional: AI_EMBEDDING_MODEL=text-embedding-3-small  (1536 dims — matches schema)
npm install
npm run db:seed
npm run rag:index
npm run rag:smoke
```

## Commands

| Script | Purpose |
|---|---|
| `npm run rag:index` | Chunk → embed → replace rows in `policy_chunks` |
| `npm run rag:smoke` | Handoff queries via `searchPolicy` + `executeTool("search_policy")` |

`ensurePolicyIndex()` (in `src/services/rag/indexPolicies.ts`) no-ops when chunks already exist; otherwise runs a full index (useful on empty hosts).

## What was indexed

Four NovaCart policy docs:

- `HighValueRules.md`
- `RefundPolicy.md`
- `DeliveryDisputePolicy.md`
- `FraudEscalationPolicy.md`

Chunking: heading-aware (`##` / `###`), target ~400–800 tokens (`chunkMarkdown.ts`).  
Embeddings: OpenAI `AI_EMBEDDING_MODEL` (default `text-embedding-3-small`) via existing `getLlmClient()`.  
Storage: `policy_chunks.embedding vector(1536)` with cosine distance (`<=>`).

## `search_policy` return shape (slim)

```json
{
  "query": "high value delivered order refund manual verification",
  "chunks": [
    {
      "doc": "HighValueRules.md",
      "section": "4. High-value threshold rules › 4.2 Confirmed delivery + high value",
      "quote": "## … policy text …",
      "score": 0.81
    }
  ]
}
```

Default top-k = **5**. Empty index → `{ query, chunks: [] }` (no invented citations).

## Smoke queries (handoff gate)

| Query | Expect doc names among top hits |
|---|---|
| `high value delivered order refund manual verification` | `HighValueRules.md` and/or `DeliveryDisputePolicy.md` (often also Refund) |
| `duplicate charge same order` | `RefundPolicy.md` (duplicate-charge sections) |
| `wrong item warehouse matches request evidence` | `RefundPolicy.md` and/or `FraudEscalationPolicy.md` (wrong-item / warehouse) |

After `npm run rag:smoke`, confirm `policy_chunks` count > 0 and the high-value query returns High-Value / Delivery-related `doc` values.

## Notes

- RAG code: `backend/src/services/rag/**`, `backend/scripts/ragIndex.ts`, `backend/scripts/ragSmoke.ts`
- Agent should call `search_policy` only; do not embed policies again inside the agent loop
- Policies UI can list the four filenames under `data/policies/`
- Re-run `npm run rag:index` after policy markdown edits (replaces chunks for those docs)
