# Eval fixtures (Person A)

Documented expected recommendations for demo + seed cases.
Only **1042 / 1087 / 1112** need full UI polish. Remaining rows are agent eval targets.

| case_id | claim_type | expected | expected_action | notes |
|---|---|---|---|---|
| 1042 | not_received | HOLD | MANUAL_VERIFICATION | Hero — delivered + GPS ~18m + photo + 4 prior disputes + high-value (>$500) |
| 1087 | duplicate_charge | APPROVE | REFUND_DUPLICATE | Two succeeded captures ~3s apart, same order |
| 1112 | wrong_item | REQUEST_INFO | REQUEST_PHOTO_OF_ITEM | Warehouse sku_match true vs customer Pro claim |
| 1201 | not_received | APPROVE | REFUND_FULL | Low-value hub; seed eval fixture |
| 1202 | not_received | HOLD | MANUAL_VERIFICATION | High-value iPad; GPS far from address (seed) |
| 1203 | not_as_described | ESCALATE | HUMAN_JUDGEMENT | Colour mismatch — judgement call (seed) |

## Additional scenario checks (same seed ops, claim framing)

Use when expanding automated eval later — still grounded in existing seed rows / policies:

| case_id | focus | expected | notes |
|---|---|---|---|
| 1042 | policy citation | HOLD | Must cite HighValueRules and/or DeliveryDisputePolicy |
| 1042 | contradictions | HOLD | Must mention delivery/GPS/photo vs “not received” claim |
| 1087 | payments-only | APPROVE | Must use get_payments; refund duplicate only |
| 1112 | REF-7.2 | REQUEST_INFO | Order + warehouse agree; do not auto-refund on free-text |
| 1202 | high-value INR | HOLD | total_amount 620 + delivery distance conflict |

## How to run a demo check

```bash
# Prerequisites (Persons B + C): docker up, db:seed, rag:index, OPENAI_API_KEY
cd backend
npm run dev
curl -s -X POST http://localhost:4000/api/investigations/1042 | jq '.finding.recommendation,.finding.evidence,.finding.policy_citations'
```

Finding must pass `FindingSchema` (Zod). `recommendation` ≠ human decision.
