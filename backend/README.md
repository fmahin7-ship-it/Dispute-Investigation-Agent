# Backend API (Express)

Controller → service **functions** → repository **functions**. Zod on every request boundary.

```bash
cp .env.example .env
npm install
npm run db:seed
npm run dev
```

`db:seed` applies schema + demo seed to `DATABASE_URL` (skips if already seeded; `--force` to reset).

Health: `GET http://localhost:4000/health`  
Investigate: `POST http://localhost:4000/api/investigations/1042`

## Ownership

| Person | Paths |
|---|---|
| A | `src/services/agent/`, `src/llm/` |
| B | `src/repositories/`, `src/services/tools/`, `data/` |
| C | `src/services/rag/`, `data/policies/` |
| D | `src/services/voice/` (+ frontend) |

Deploy this app separately from the Next.js frontend (Railway/Render/Fly).
