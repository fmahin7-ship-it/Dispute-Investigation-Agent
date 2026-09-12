# Frontend (Next.js 16)

Operator desk — deploy on **Vercel**.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

Set `NEXT_PUBLIC_API_URL` to your backend URL (local or deployed).

Zod schemas live in `src/schemas/` — keep Finding in sync with `backend/src/schemas/finding.ts`.
