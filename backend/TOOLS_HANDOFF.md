# TOOLS_HANDOFF — Person B → Person A / C

Postgres is the **ops source of truth**. Tools return **slim JSON facts** (no raw SQL for the LLM).  
`search_policy` stays Person C (still stub until C hands off).

## Setup

```bash
# from REPO_ROOT (Dispute-Investigation-Agent)
docker compose up -d
cd backend
cp .env.example .env   # DATABASE_URL=postgresql://edi:edi@localhost:5432/edi
npm install
npm run db:seed
npm run tools:smoke    # prints payloads for 1042 / 1087 / 1112
```

## Case → tool args (from `disputes`)

| case_number | order_id | customer_id | expected_recommendation |
|---|---|---|---|
| 1042 | `ORD-1042` | `C-22` | HOLD |
| 1087 | `ORD-1087` | `C-41` | APPROVE |
| 1112 | `ORD-1112` | `C-58` | REQUEST_INFO |

`GET /api/cases` and `findCaseById` now load from Postgres and include `order_id` + `customer_id` on each case (for the agent).

## `executeTool` names

| name | args | handler |
|---|---|---|
| `get_order` | `{ order_id }` | `getOrder` |
| `get_tracking` | `{ order_id }` | `getTracking` |
| `get_delivery_evidence` | `{ order_id }` | `getDeliveryEvidence` |
| `get_customer_history` | `{ customer_id }` | `getCustomerHistory` |
| `get_payments` | `{ order_id }` | `getPayments` |
| `get_warehouse_pick` | `{ order_id }` | `getWarehousePick` |
| `search_policy` | `{ query }` | Person C |

---

## Example payloads (seed data)

### Case 1042 — HOLD story

**`get_order("ORD-1042")`**

```json
{
  "found": true,
  "order_id": "ORD-1042",
  "order_number": "NC-88321",
  "customer_id": "C-22",
  "status": "shipped",
  "currency": "AUD",
  "total_amount": 850,
  "item_sku": "MBA-M3-256",
  "item_name": "MacBook Air 13\" M3 256GB",
  "item_category": "electronics",
  "paid_at": "2026-09-05T00:12:00.000Z"
}
```

**`get_tracking("ORD-1042")`**

```json
{
  "found": true,
  "order_id": "ORD-1042",
  "carrier": "AusPost",
  "tracking_number": "AP0099182736",
  "status": "delivered",
  "delivered_at": "2026-09-10T04:32:00.000Z",
  "gps_lat": -37.766812,
  "gps_lng": 144.961455,
  "registered_lat": -37.76678,
  "registered_lng": 144.96142,
  "distance_meters": 18,
  "delivery_method": "authority_to_leave"
}
```

**`get_delivery_evidence("ORD-1042")`**

```json
{
  "order_id": "ORD-1042",
  "exists": true,
  "url": "/demo-assets/delivery-1042.jpg",
  "caption": "Package visible on residential doorstep; cardboard box consistent with laptop shipment; doorway and mat visible.",
  "limitations": [
    "Exact street number not clearly readable from image",
    "Recipient identity cannot be verified from photo alone"
  ],
  "captured_at": "2026-09-10T04:32:10.000Z",
  "found": true
}
```

**`get_customer_history("C-22")`** — multiple prior disputes (serial-risk)

```json
{
  "found": true,
  "customer_id": "C-22",
  "prior_dispute_count": 4,
  "refunded_count": 4,
  "total_disputed_aud": 494,
  "prior": [
    {
      "related_order": "NC-72018",
      "claim_type": "not_received",
      "outcome": "partial_refund",
      "amount_aud": 75,
      "opened_at": "2026-06-21T06:40:00.000Z",
      "notes": "ATL delivery; partial goodwill"
    },
    {
      "related_order": "NC-69044",
      "claim_type": "damaged",
      "outcome": "refunded",
      "amount_aud": 210,
      "opened_at": "2026-03-04T22:15:00.000Z",
      "notes": "Photo evidence accepted"
    },
    {
      "related_order": "NC-64010",
      "claim_type": "not_received",
      "outcome": "refunded",
      "amount_aud": 89,
      "opened_at": "2026-01-18T01:30:00.000Z",
      "notes": "Courier exception; refund approved"
    },
    {
      "related_order": "NC-61001",
      "claim_type": "not_received",
      "outcome": "refunded",
      "amount_aud": 120,
      "opened_at": "2025-11-01T23:00:00.000Z",
      "notes": "Low-value accessory; refunded as goodwill"
    }
  ]
}
```

---

### Case 1087 — duplicate charge

**`get_payments("ORD-1087")`** — two succeeded captures ~3s apart

```json
{
  "found": true,
  "order_id": "ORD-1087",
  "payment_count": 2,
  "payments": [
    {
      "id": "PAY-1087-A",
      "provider": "stripe",
      "charge_id": "ch_1087_a",
      "amount": 249,
      "currency": "AUD",
      "status": "succeeded",
      "charged_at": "2026-09-08T04:01:02.000Z"
    },
    {
      "id": "PAY-1087-B",
      "provider": "stripe",
      "charge_id": "ch_1087_b",
      "amount": 249,
      "currency": "AUD",
      "status": "succeeded",
      "charged_at": "2026-09-08T04:01:05.000Z"
    }
  ]
}
```

---

### Case 1112 — wrong item / REQUEST_INFO

**`get_warehouse_pick("ORD-1112")`** — pick matches Air (supports claim vs warehouse tension)

```json
{
  "found": true,
  "order_id": "ORD-1112",
  "sku_ordered": "MBA-M3-512",
  "sku_picked": "MBA-M3-512",
  "name_ordered": "MacBook Air 13\" M3 512GB Midnight",
  "name_picked": "MacBook Air 13\" M3 512GB Midnight",
  "sku_match": true,
  "picked_at": "2026-09-01T21:50:00.000Z",
  "picker_id": "PICK-03"
}
```

Customer claim (from case): ordered Air but believes they received a Pro → agent should REQUEST_INFO / photo of item (Person A).

---

## Ownership notes

- **Repos:** `backend/src/db/`, `repositories/` (ops), `services/tools/` (except `search_policy`)
- **Investigations** stay in-memory (`investigationRepository`) for A/D — do not block on migrating to `investigations` table
- **Do not invent evidence** — if `found: false`, treat as missing data
- Timestamps below are exact ISO strings from `npm run tools:smoke` against the Docker seed
