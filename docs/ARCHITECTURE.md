# Architecture — Ecommerce Dispute Investigator

**Positioning:** We don’t automate refunds. We automate the investigation before the refund.  
**Principle:** Fake the commerce stack. Real the investigation loop.

**Deploy:** `frontend/` (Next.js 16 → Vercel) and `backend/` (Express → Railway/Render) are **separate** projects.

---

## 1. System context

```mermaid
flowchart TB
  CX[CX / Returns Manager]
  WEB[Next.js Desk — Vercel]
  API[Express API — Railway/Render]
  AGENT[Investigation Agent]
  TOOLS[Tool Layer]
  RAG[Policy RAG]
  VOICE[ElevenLabs]
  DB[(Seed DB)]
  VDB[(Vector store)]

  CX --> WEB
  WEB -->|HTTPS REST + Zod parse| API
  API --> AGENT
  AGENT --> TOOLS
  AGENT --> RAG
  TOOLS --> DB
  RAG --> VDB
  API --> VOICE
```

---

## Backend layout (routes → controllers → services → repositories)

```mermaid
flowchart TB
  R[routes + Zod validate]
  C[controllers — thin HTTP functions]
  S[services — plain async functions]
  REPO[repositories — plain data functions]
  AG[agent / tools / rag]

  R --> C --> S
  S --> REPO
  S --> AG
```

| Layer | Responsibility |
|---|---|
| `routes/` | Path + Zod `validate` |
| `controllers/` | Call service functions; send JSON |
| `services/` | Business logic as **functions** (no classes) |
| `repositories/` | Data access as **functions** |
| `schemas/` | Zod contracts |

---

## 3. Investigation sequence

```mermaid
sequenceDiagram
  participant UI as Next.js
  participant C as Controller
  participant S as InvestigationService
  participant A as Agent
  participant T as Tools/RAG

  UI->>C: POST /api/investigations/:caseId
  C->>S: run(caseId)
  S->>A: runInvestigationAgent
  loop max 3 rounds
    A->>T: selected tools
    T-->>A: slim facts
  end
  A-->>S: Finding (Zod)
  S-->>C: InvestigationRecord
  C-->>UI: 201 + Finding
  UI->>C: POST .../decision (HITL)
  UI->>C: POST .../brief (ElevenLabs)
```

---

## 4. Frontend

- App Router desk: queue + `/cases/[id]`
- `lib/api.ts` validates responses with **Zod** before UI use
- Schemas mirrored under `frontend/src/schemas/` (keep in sync with backend)

---

## 5. Demo cases

| ID | Expected |
|---|---|
| 1042 | HOLD |
| 1087 | APPROVE |
| 1112 | REQUEST_INFO |

---

## Out of scope

LangGraph · CRAG · Vision · monorepo workspaces · real Shopify/GPS · full RBAC
