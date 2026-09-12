# Team ownership (4 members)

Separate repos/folders for hosting — assign by folder:

| Role | Owns | Host |
|---|---|---|
| **A — Engine** | `backend/src/services/agent/`, `llm/` | with backend |
| **B — Data & tools** | `backend/src/data/`, `repositories/`, `services/tools/` | with backend |
| **C — RAG** | `backend/src/services/rag/`, `data/policies/` | with backend |
| **D — Desk + voice + ship** | `frontend/` + `backend/src/services/voice/` + deploy both | Vercel + API host |

**Schema sync:** A/B own `backend/src/schemas/finding.ts`; D mirrors to `frontend/src/schemas/finding.ts`.

**Pitch:** We don’t automate refunds. We automate the investigation before the refund.
