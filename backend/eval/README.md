# Eval fixtures

Labeled `expected_recommendation` / `expected_action` live on seed dispute rows.
The agent never sees those fields — they are scoring labels only.

Only **1042 / 1087 / 1112** need full UI polish. Remaining rows are agent eval targets.

| case_id | claim_type | expected | expected_action | notes |
|---|---|---|---|---|
| 1042 | not_received | HOLD | MANUAL_VERIFICATION | Hero — delivered + GPS ~18m + photo + 4 prior disputes + high-value ($850) |
| 1087 | duplicate_charge | APPROVE | REFUND_DUPLICATE | Two succeeded captures ~3s apart, same order |
| 1112 | wrong_item | REQUEST_INFO | REQUEST_PHOTO_OF_ITEM | Warehouse sku_match true vs customer Pro claim |
| 1201 | not_received | REJECT | DENY_REFUND_DELIVERED | Low-value hub but strong delivery (GPS ~9m + photo) — do not refund |
| 1202 | not_received | HOLD | MANUAL_VERIFICATION | High-value iPad; GPS far from address (seed) |
| 1203 | not_as_described | REQUEST_INFO | REQUEST_PHOTO_OF_ITEM | Colour mismatch — ask for photos before escalate |

## Run the harness

```bash
# Prerequisites: DATABASE_URL, OPENAI_API_KEY, npm run db:seed, npm run rag:index
cd backend
npm run eval
```

Scores each case: agent `recommendation` vs DB `expected_recommendation` → PASS/FAIL table.
Exit code `1` if any fail.

Subset (cheaper):

```bash
EVAL_CASES=1042,1087,1112 npm run eval
```

Demo-only smoke (same 3 gates): `npm run agent:smoke`.

## Additional scenario checks (manual / future)

| case_id | focus | expected | notes |
|---|---|---|---|
| 1042 | policy citation | HOLD | Must cite HighValueRules and/or DeliveryDisputePolicy |
| 1042 | contradictions | HOLD | Must mention delivery/GPS/photo vs “not received” claim |
| 1087 | payments-only | APPROVE | Must use get_payments; refund duplicate only |
| 1112 | REF-7.2 | REQUEST_INFO | Order + warehouse agree; do not auto-refund on free-text |
| 1201 | strong delivery | REJECT | GPS near + photo → deny refund |
| 1202 | high-value INR | HOLD | total_amount 620 + delivery distance conflict |
| 1203 | colour NAD | REQUEST_INFO | No ops proof of colour → photo request |

Finding must pass `FindingSchema` (Zod). `recommendation` ≠ human decision.

**1112 stability:** after the LLM Finding, a REF-7.2 guard forces `REQUEST_INFO` when warehouse `sku_match` is true (model often finishes before the finalize turn).
