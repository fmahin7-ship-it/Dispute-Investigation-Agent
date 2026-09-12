# Ecommerce Dispute Investigator (Riley)

> We don’t automate refunds. We automate the investigation before the refund.

**Separate apps** for separate hosting (no monorepo):

| App | Stack | Host |
|---|---|---|
| `frontend/` | Next.js **16** + Zod | Vercel |
| `backend/` | Node + Express + Zod | Railway / Render / Fly |

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — diagrams + layers
- [docs/RUBRIC.md](docs/RUBRIC.md) — judging criteria
- [docs/TEAM.md](docs/TEAM.md) — 4-person ownership

## Backend layout (functional)

```text
backend/src/
  routes/          # wire HTTP → controller (+ Zod validate)
  controllers/     # thin HTTP functions
  services/        # business logic as functions (agent, tools, rag, …)
  repositories/    # data access as functions
  schemas/         # Zod contracts
  middleware/      # errors, requestId, validate
```

## Quick start

### Database (Docker — local only)

```bash
# from project root
docker compose up -d
```

See `backend/data/db/README.md`. Production uses managed Postgres (no Docker required).

### Backend

```bash
cd backend
cp .env.example .env
npm install
# after docker compose up -d (or use hosted DATABASE_URL):
npm run db:seed
npm run dev
# http://localhost:4000/health
```

### Frontend (other terminal)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL` to your deployed API URL on Vercel.

## Finding schema sync

Keep these files aligned:

- `backend/src/schemas/finding.ts`
- `frontend/src/schemas/finding.ts`

## RAG policies

Substantial NovaCart policy docs live in `backend/data/policies/` (100+ lines each) for embedding.

## First milestone

`POST /api/investigations/1042` → real agent Finding with `HOLD` (not stub).
