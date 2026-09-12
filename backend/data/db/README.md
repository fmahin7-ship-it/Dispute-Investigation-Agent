# Local database (Docker)

## Start

From the **project root** (where `docker-compose.yml` lives):

```bash
docker compose up -d
```

Wait until healthy:

```bash
docker compose ps
docker exec -it edi-postgres psql -U edi -d edi -c "\dt"
```

On **first** start, Postgres runs:

- `backend/data/db/init/01_schema.sql`
- `backend/data/db/init/02_seed.sql`

## Seed via npm (local or Railway/Render)

From `backend/` with `DATABASE_URL` set in `.env` (or the host env):

```bash
npm run db:seed
```

- Creates schema if missing  
- Seeds if `disputes` is empty  
- Safe to re-run (skips when already seeded)

Force re-seed (destructive):

```bash
npm run db:seed -- --force
```

### Hosting (Railway / Render)

1. Create managed Postgres  
2. Set `DATABASE_URL` on the API service  
3. Run once (local against prod URL, or host shell):

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

You do **not** need Docker in production.

## Connection (local Docker)

```text
postgresql://edi:edi@localhost:5432/edi
```

Set the same value as `DATABASE_URL` in `backend/.env`.

## What was seeded

| case | claim | expected |
|---|---|---|
| 1042 | not_received $850 | HOLD |
| 1087 | duplicate_charge | APPROVE duplicate |
| 1112 | wrong_item | REQUEST_INFO |
| 1201–1203 | eval fixtures | see `disputes.expected_*` |

## Reset DB via Docker (destructive)

```bash
docker compose down -v
docker compose up -d
```

## RAG policy files

- `backend/data/policies/HighValueRules.md`
- `backend/data/policies/RefundPolicy.md`
- `backend/data/policies/DeliveryDisputePolicy.md`
- `backend/data/policies/FraudEscalationPolicy.md`
