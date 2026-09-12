# AGENT_HANDOFF — Investigation agent

Bounded native tool-calling investigator is live. No LangGraph. Max **3** LLM rounds.
Ops tools + `search_policy` go through the shared `executeTool` gateway only.

## Setup

```bash
# from REPO_ROOT (Dispute-Investigation-Agent)
docker compose up -d
cd backend
# .env needs:
#   DATABASE_URL=postgresql://edi:edi@localhost:5432/edi
#   OPENAI_API_KEY=...
# Optional: AI_CHAT_MODEL=gpt-4o-mini
npm install
npm run db:seed
npm run rag:index
npm run agent:smoke   # optional — checks 1042/1087/1112 recommendations
npm run dev
```

## Demo gate

```bash
curl -s -X POST http://localhost:4000/api/investigations/1042
curl -s -X POST http://localhost:4000/api/investigations/1087
curl -s -X POST http://localhost:4000/api/investigations/1112
```

| case | expected recommendation | expected action |
|---|---|---|
| 1042 | `HOLD` | `MANUAL_VERIFICATION` |
| 1087 | `APPROVE` | `REFUND_DUPLICATE` |
| 1112 | `REQUEST_INFO` | `REQUEST_PHOTO_OF_ITEM` |

Each Finding must have:

- non-empty `evidence[]` from tools
- non-empty `policy_citations[]` from RAG
- `contradictions` when claim conflicts with ops facts (especially 1042)
- `investigation_confidence.label` + `why[]`
- Zod-valid via `FindingSchema`

## Module notes

- Agent loop: `backend/src/services/agent/**`, `backend/src/llm/**`
- Investigation wiring: `backend/src/services/investigationService.ts`
- Eval fixtures: `backend/eval/**`
- Tools / SQL: call `executeTool` only (do not reimplement repositories)
- RAG: call `search_policy` only — run `npm run rag:index` before demo
- Frontend / ElevenLabs: desk + voice brief

## Desk / HITL notes

- `recommendation` is the AI stance — HITL buttons are the human decision.
- Case rows still include `expected_recommendation` / `expected_action` for eval; the agent **does not** receive those fields.
- Investigations remain in-memory (`investigationRepository`) for this hackathon path — restart clears them.
- `tools_used` on the Finding lists which tools the loop actually called.

## Example Finding JSON (case 1042)

Illustrative shape grounded in seed tool facts + high-value policy (live model wording may vary; recommendation/action must match the table above):

```json
{
  "case_id": "1042",
  "claim_type": "not_received",
  "evidence": [
    {
      "id": "E1",
      "source": "get_order",
      "fact": "Order ORD-1042 MacBook Air 13\" M3 256GB total_amount 850 AUD (high-value)."
    },
    {
      "id": "E2",
      "source": "get_tracking",
      "fact": "Shipment status delivered; GPS distance_meters 18 from registered address; authority_to_leave."
    },
    {
      "id": "E3",
      "source": "get_delivery_evidence",
      "fact": "Delivery photo exists with caption of package on doorstep; limitations include unread street number and unverified recipient identity."
    },
    {
      "id": "E4",
      "source": "get_customer_history",
      "fact": "Customer C-22 has prior_dispute_count 4 and refunded_count 4."
    }
  ],
  "contradictions": [
    "Customer claims item not received, but carrier tracking shows delivered within 18m of the registered address with a delivery photo on file."
  ],
  "policy_citations": [
    {
      "doc": "HighValueRules.md",
      "section": "4. High-value threshold rules › 4.2 Confirmed delivery + high value",
      "quote": "If an order is HIGH_VALUE AND delivery is confirmed AND any delivery evidence exists, then do not auto-refund. Required action: MANUAL_VERIFICATION."
    }
  ],
  "risk": "HIGH",
  "recommendation": "HOLD",
  "recommended_action": "MANUAL_VERIFICATION",
  "investigation_confidence": {
    "label": "HIGH",
    "why": [
      "Tracking, GPS proximity, and photo metadata all indicate delivery",
      "Order exceeds AUD 500 high-value threshold",
      "Customer has multiple prior refunds elevating risk"
    ]
  },
  "reason": "High-value INR claim conflicts with confirmed delivery evidence; policy requires manual verification before any refund.",
  "tools_used": [
    "get_order",
    "get_tracking",
    "get_delivery_evidence",
    "get_customer_history",
    "search_policy"
  ]
}
```

## Desk wiring checklist

1. Investigate → show `evidence`, `contradictions`, `policy_citations`, Finding panel  
2. HITL → `POST .../decision` (do not treat AI recommendation as final money move)  
3. Brief me → ElevenLabs from Finding reason  
4. Audit timeline from investigation + decision events  
