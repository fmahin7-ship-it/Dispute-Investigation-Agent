# NovaCart Customer Refund & Returns Policy
**Document ID:** NC-POL-REF-2026-02  
**Version:** 5.1  
**Effective date:** 15 February 2026  
**Owner:** Customer Experience Operations  
**Region:** Australia  

---

## 1. Purpose

This policy explains when NovaCart issues refunds, replacements, store credit, or rejects a claim. It is written for CX officers and AI investigation systems that must produce evidence-backed recommendations before money moves.

## 2. Guiding principles

1. **Fairness to genuine customers** — resolve clear merchant errors quickly.  
2. **Protection against leakage** — do not refund when delivery and payment evidence contradict the claim without review.  
3. **Human control of money** — automated systems recommend; authorised humans approve financial actions above policy thresholds.  
4. **Explainability** — every decision cites evidence and a policy section.  
5. **Consistency** — similar facts should produce similar outcomes.

## 3. Eligibility windows

| Claim type | Standard window | Notes |
|---|---|---|
| Change of mind | 30 days from delivery | Item unused, original packaging where practical |
| Not received | 60 days from estimated delivery | Earlier if carrier closes as delivered |
| Damaged in transit | 7 days from delivery | Photos required |
| Wrong item | 14 days from delivery | Compare order vs warehouse vs customer evidence |
| Defective / DOA | 14 days (manufacturer warranty may extend) | Troubleshooting first for electronics |
| Duplicate charge | 120 days from charge date | Refund duplicate only |

Windows may be extended for verified courier failures or platform outages.

## 4. Refund types

### 4.1 Full refund
Return of the full order amount (and shipping if NovaCart fault).

### 4.2 Partial refund
Used for missing accessories, cosmetic damage, or goodwill when goods are retained.

### 4.3 Duplicate-only refund
When two successful captures exist for one order, refund **exactly one** duplicate charge. Do not refund the primary legitimate capture.

### 4.4 Store credit
Optional alternative when policy would otherwise reject but retention value is high; requires manager for amounts above $100.

## 5. Item not received (INR)

### 5.1 Investigation checklist

1. Confirm order paid and SKU.  
2. Retrieve tracking status and timestamps.  
3. Retrieve GPS / delivery photo / signature if any.  
4. Retrieve customer dispute history.  
5. Apply High-Value Rules if amount > $500.  
6. Decide: approve, hold, request info, or escalate.

### 5.2 Decision matrix (non-exhaustive)

| Tracking | Evidence | History risk | Typical outcome |
|---|---|---|---|
| Not shipped | n/a | any | Approve refund or reship |
| In transit | n/a | any | Wait / request patience; do not refund yet |
| Delivered | strong GPS/photo | low | Request more info or reject after review |
| Delivered | strong GPS/photo | high | HOLD — manual verification |
| Delivered | weak / missing | low | Case-by-case; may approve with notes |
| Exception / lost | carrier confirmation | any | Approve refund or reship |

### 5.3 Authority to leave (ATL)

ATL deliveries are valid deliveries under NovaCart terms when the customer enabled ATL. Non-receipt after ATL still requires investigation; it is not automatic fraud, but it is not automatic refund either.

## 6. Duplicate charge disputes

**Rule REF-6.1:**

> If two (or more) successful payment captures reference the same `order_id` with equal amounts and timestamps within a short window (typically under 5 minutes), recommend `APPROVE` with action `REFUND_DUPLICATE`.

Investigators must:

- List each `charge_id` and timestamp  
- Identify which charge remains as the primary  
- Ensure only the duplicate is refunded  
- Confirm the customer is not requesting refund of a separate legitimate second order  

If amounts differ or order ids differ, do **not** treat as automatic duplicate — escalate.

## 7. Wrong item received

### 7.1 Evidence sources

- Order line (SKU / name ordered)  
- Warehouse pick/pack log (SKU picked)  
- Customer description / photos  
- Tracking contents labels if available  

### 7.2 Outcomes

| Order vs warehouse | Customer claim | Outcome |
|---|---|---|
| Match | Conflicts with both | `REQUEST_INFO` — ask for clear photos of device, box label, serial |
| Mismatch | Aligns with pick error | Approve replacement or refund after confirm |
| Match | Aligns with order | Educate / reject wrong-item framing; offer return path if eligible |

**Rule REF-7.2:** Never auto-refund a wrong-item claim solely on free-text customer assertion when warehouse and order agree.

## 8. Damaged items

Require:

- Photos of packaging and damage  
- Order confirmation  
- Delivery date within window  

If damage is inconsistent with packaging method or customer has repeated damage claims, escalate for fraud review.

## 9. Change of mind

Eligible if within window and item condition acceptable. Electronics opened may receive restocking fee per category rules (not detailed here). High-value change-of-mind still follows payment capture confirmation but does not invoke delivery-conflict HOLD rules unless INR is alleged.

## 10. Refund method

Refunds return to the original payment method within 5–10 business days after approval. Store credit is instant after approval. Investigators must not promise faster timelines than Finance SLA.

## 11. Interaction with promotions

If an order used a discount code, refund the **amount actually captured**, not the pre-discount catalogue price, unless a published guarantee says otherwise.

## 12. AI investigator obligations

AI systems assisting refund decisions must:

1. Call only needed operational tools.  
2. Retrieve relevant policy sections via search.  
3. Produce a structured finding with evidence and citations.  
4. Separate `recommendation` from human `decision`.  
5. Prefer `HOLD` / `REQUEST_INFO` over silent approval when uncertain.  
6. Never invent tracking events, photos, or history counts.

## 13. Worked examples

### Example — Duplicate AirPods charge

- Order NC-77102 amount $249  
- Payment A at 14:01:02  
- Payment B at 14:01:05  
- Same order id  

**Apply REF-6.1 → APPROVE / REFUND_DUPLICATE.**

### Example — Wrong item MacBook

- Ordered MacBook Air 512GB  
- Warehouse picked MacBook Air 512GB  
- Customer claims MacBook Pro  

**Apply REF-7.2 → REQUEST_INFO / REQUEST_PHOTO_OF_ITEM.**

### Example — Low-value clear non-shipment

- $89 accessory  
- No carrier acceptance scan after 10 days  

**May APPROVE full refund** under INR matrix (not shipped).

## 14. Exclusions

Refunds are not available for:

- Verified digital content already redeemed (except statutory rights)  
- Claims opened after policy windows without exceptional cause  
- Items damaged by misuse after delivery (assess case-by-case)

Australian Consumer Law rights are not excluded by this policy where they apply.

## 15. Escalation path

If policy sections conflict, or evidence is incomplete after one customer reply cycle, escalate to CX Manager. For suspected fraud rings or synthetic identities, use Fraud Escalation Policy.

## 16. Audit requirements

Record:

- Case id / order id  
- Claim type  
- Evidence summary  
- Policy clauses used  
- Recommendation vs final human decision  
- Approver  

## 17. Quick reference

```
duplicate same order + two successes → REFUND_DUPLICATE
wrong item + order==warehouse ≠ claim → REQUEST_INFO
INR + not shipped → likely APPROVE
INR + delivered + high value → see High-Value Policy (HOLD)
uncertain → REQUEST_INFO or ESCALATE (never invent)
```

## 18. Document control

Supersedes NC-POL-REF-2025-11. Train all CX staff within 14 days of effective date. AI prompts must reference this version id in citations when possible.

---

**End of document — NC-POL-REF-2026-02**
