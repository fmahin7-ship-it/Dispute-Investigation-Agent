# Ecommerce Dispute Investigator

> We don’t automate refunds. We automate the investigation before the refund.

NovaCart operator desk: an agent gathers order, payment, carrier, warehouse, and customer-history evidence, retrieves policy via RAG, and returns a structured **Finding**. A human still decides — Investigate → Finding → **Brief me** (voice) → HITL → audit.

## Live

| | URL |
|---|---|
| Desk | https://dispute-investigation-agent.vercel.app |
| API | https://dispute-investigation-agent-production.up.railway.app |
| Repo | https://github.com/fmahin7-ship-it/Dispute-Investigation-Agent |

Demo cases: **1042 HOLD** · **1087 APPROVE** · **1112 REQUEST_INFO**

## Why this exists

Returns ops spend hours stitching carrier GPS, delivery photos, payments, and policy for each dispute. Auto-refund bots leak money; chatbots dump text without a decision record. This desk produces an investigation pack so a manager can approve, hold, or request info with evidence and policy citations attached.

## Differentiation

| Approach | Gap |
|---|---|
| Refund chatbot | Answers questions; no tool trail, Finding, or HITL audit |
| Zapier + OCR | Brittle rules; no bounded agent loop or policy RAG |
| Auto-refund rules | Skips investigation — pays the $850 “not received” when carrier evidence says otherwise |

**We investigate first.** Recommendation ≠ payment.

## Impact (ROI sketch)

- **Blocked leakage:** Case **1042** is an **$850** MacBook “not received” claim with delivered tracking, GPS ~18m, and photo — agent recommends **HOLD** instead of blind refund.
- **Time:** If a human investigation is ~25–40 min and a mid-market desk handles hundreds of disputes/month, shaving that to a few minutes of review compounds as **hours × loaded rate × volume**.
- **Quality:** Structured Finding + policy citations + voice brief reduces handoff friction for managers.

## Models & data

| Piece | Choice | Why |
|---|---|---|
| Agent | OpenAI **gpt-4o-mini** (configurable `AI_CHAT_MODEL`) | Native tool calling; bounded ≤3 rounds; cheap enough for demo + eval |
| Policy RAG | **text-embedding-3-small** + Postgres **pgvector** | Ground Finding in NovaCart policy docs, not free-text invention |
| Voice brief | **ElevenLabs** TTS | Core step after Investigate — manager hears the case in under a minute |
| Ops data | Synthetic NovaCart seed (orders, payments, carrier, warehouse) | Feasible for a hackathon; same tool shapes as real integrations |

Eval fixtures (6 labeled cases): see [`backend/eval/README.md`](backend/eval/README.md). Run:

```bash
cd backend && npm run eval
```

## Feasibility & limits

- Carrier GPS/photo, Stripe-like payments, and warehouse picks are **synthetic** — not live Shopify/AusPost.
- Agent proposes a recommendation; **humans** approve/reject via HITL.
- Voice needs `ELEVENLABS_API_KEY`; without it, Brief me fails clearly rather than faking audio.
- Production needs seeded DB + `rag:index` so `search_policy` returns real chunks.

## Stack

| App | Stack | Host |
|---|---|---|
| `frontend/` | Next.js 16 + Zod | Vercel |
| `backend/` | Node + Express + Zod + pgvector | Railway |

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — diagrams + layers
- [docs/RUBRIC.md](docs/RUBRIC.md) — judging criteria
- [docs/TEAM.md](docs/TEAM.md) — module map
- [backend/eval/README.md](backend/eval/README.md) — fixtures + harness

## Quick start

### Database (Docker — local only)

```bash
docker compose up -d
```

See `backend/data/db/README.md`. Production uses managed Postgres.

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:seed
npm run rag:index
npm run dev
# http://localhost:4000/health
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL` to the API (local or Railway).

### Eval

```bash
cd backend
npm run eval
# optional subset: EVAL_CASES=1042,1087,1112 npm run eval
```

## Finding schema sync

Keep aligned:

- `backend/src/schemas/finding.ts`
- `frontend/src/schemas/finding.ts`

## Backend layout

```text
backend/src/
  routes/          # HTTP → controller (+ Zod)
  controllers/     # thin HTTP
  services/        # agent, tools, rag, voice
  repositories/    # data access
  schemas/         # Zod contracts
```
