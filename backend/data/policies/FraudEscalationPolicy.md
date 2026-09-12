# NovaCart Fraud Indicators & Escalation Policy
**Document ID:** NC-POL-FRD-2026-01  
**Version:** 4.0  
**Effective date:** 20 January 2026  
**Owner:** Trust & Safety / Payments Risk  
**Audience:** CX investigators, AI investigation systems, Finance approvers  

---

## 1. Purpose

This policy defines **fraud indicators**, when to escalate, and what AI systems may recommend without accusing customers. NovaCart prioritises legitimate customers while reducing organised refund abuse and friendly fraud.

## 2. Principles

1. Escalate on patterns, not vibes.  
2. Separate **risk recommendation** from **customer messaging tone**.  
3. Never auto-refund when multiple red flags coincide with delivery confirmation.  
4. Preserve audit trails for representment and law enforcement requests.  
5. AI must not label a person “fraudster” in customer-facing text; use internal risk levels only.

## 3. Risk levels

| Level | Meaning | Typical system stance |
|---|---|---|
| LOW | Routine dispute | Normal refund policy path |
| MEDIUM | Some anomalies | REQUEST_INFO or manager spot-check |
| HIGH | Multiple indicators | HOLD / ESCALATE — no auto-refund |
| CRITICAL | Clear abuse ring signals | Freeze + Trust & Safety |

## 4. Indicator catalogue

### 4.1 Identity & account

- New account + high-value first order + immediate INR claim  
- Frequent address changes between order and claim  
- Mismatch between billing and shipping with no gift note  
- Disposable email patterns (internal list)

### 4.2 Claim behaviour

- Repeated “not received” claims after ATL deliveries  
- Claims opened immediately after delivered scan  
- Refusal to provide basic verification photos when requested  
- Scripted messages reused across tickets  

### 4.3 Delivery contradiction

- Delivered + GPS Band A/B + photo support vs INR claim  
- Multiple high-value INR claims with the same pattern  
- Chargeback filed in parallel with soft claim (“item not received”) while evidence is strong  

### 4.4 Payment

- Card BIN historically linked to abuse (internal tag)  
- Rapid velocity: many orders / refunds in short window  
- Duplicate charge claims where only one capture exists (possible social engineering)

### 4.5 Warehouse

- Claims wrong item while pick log matches and serial path confirms  
- Asserts empty box without unboxing media when asked  

## 5. Scoring guidance (lightweight)

Investigators do not need a machine-learning score. Use additive flags:

- +2 delivered vs INR contradiction  
- +2 high-value (>$500)  
- +2 ≥3 prior refunds/INR in 12 months  
- +1 ATL selected  
- +1 chargeback already open  
- +1 GPS Band A  

**Rule FRD-5:** Total ≥ 5 → treat as HIGH risk → `HOLD` or `ESCALATE`.  
Total 3–4 → MEDIUM → manager review or request info.  
Below 3 → follow standard refund/delivery policies.

This scoring is a **guide**, not a calibrated probability. UI should show qualitative risk plus reasons, not fake precision.

## 6. Escalation triggers (mandatory)

Escalate to Trust & Safety / Senior CX when any of the following hold:

1. HIGH risk score under §5 on a financial action path  
2. Suspected multi-account linkage  
3. Threats, blackmail, or synthetic identity suspicion  
4. Chargeback already entered on high-value delivered order  
5. Employee collusion signals (warehouse)  

## 7. Actions allowed by risk

| Risk | Auto refund | AI recommend approve full | Human approval |
|---|---|---|---|
| LOW | Possible if policy allows | Yes | Per amount bands |
| MEDIUM | No for high-value | Rare | Required |
| HIGH | No | No | Required |
| CRITICAL | No | No | Trust & Safety only |

## 8. Friendly fraud vs theft after delivery

Delivered + strong evidence + customer INR may be:

- Genuine porch theft  
- Misunderstanding (neighbour has parcel)  
- Friendly fraud  

Do **not** decide which in automation. HOLD, ask clarifying questions, and for high-value consider police report / statutory declaration per Finance playbook before goodwill.

## 9. Chargeback representment pack

When escalating for representment, include:

- Order & payment receipts  
- Tracking timeline  
- GPS distance  
- Delivery photo + limitations  
- Customer message history  
- Prior dispute outcomes  
- Policy citations  

AI investigators should assemble these as evidence ids in the finding.

## 10. AI system constraints

AI may:

- Flag indicators  
- Compute simple additive risk  
- Recommend HOLD / ESCALATE  
- Cite this policy  

AI must not:

- Accuse the customer in outbound copy  
- Fabricate prior claims  
- Bypass HITL for HIGH/CRITICAL  
- Treat confidence_score as forensic proof  

## 11. Interaction with other policies

- High-Value Rules dominate auto-refund bans for >$500 delivered orders.  
- Delivery Dispute Policy defines evidence strength.  
- Refund Policy defines duplicate and wrong-item handling.  
- When unsure which applies, choose the path that **prevents irreversible money movement** until a human reviews.

## 12. Worked examples

### Example — High risk INR laptop

Flags: delivered contradiction (+2), $850 (+2), 4 prior refunds (+2), GPS 18m (+1) → score 7 CRITICAL/HIGH.  
**Outcome:** HOLD + MANUAL_VERIFICATION / ESCALATE. No auto-refund.

### Example — Clean duplicate charge

Flags: none of the abuse patterns; two real captures.  
**Outcome:** APPROVE REFUND_DUPLICATE under Refund Policy; fraud policy not blocking.

### Example — Wrong item with matching warehouse

Customer claims Pro; systems show Air ordered and picked.  
**Outcome:** REQUEST_INFO; if customer refuses evidence and pressure for instant refund, elevate to MEDIUM/HIGH.

## 13. Privacy & proportionality

Collect only evidence needed for the dispute. Do not request unrelated ID documents unless Finance policy for large goodwill requires it. Store sensitive artefacts securely.

## 14. Sanctions & account actions

Only Trust & Safety may:

- Ban accounts  
- Block payment methods  
- Initiate formal fraud cases  

CX managers may deny refunds within policy without account bans.

## 15. Reporting metrics

Track monthly:

- INR rate on delivered parcels  
- Override rate (AI HOLD → human APPROVE)  
- Chargeback win rate on representments  
- False escalation complaints  

Use metrics to tune thresholds — not to silence HOLD recommendations during demos or pilots.

## 16. Quick reference for investigators

```
IF delivered_conflict AND amount>500 AND prior_INR>=3
THEN risk=HIGH → HOLD/ESCALATE
IF only duplicate_payment_pattern
THEN follow Refund Policy (usually APPROVE duplicate)
IF wrong_item AND warehouse_matches_order
THEN REQUEST_INFO (not instant refund)
NEVER auto-refund HIGH risk
```

## 17. Training note for AI prompts

When retrieving this document, prefer sections on indicator catalogue, scoring guidance, mandatory escalation, and worked examples. Cite `NC-POL-FRD-2026-01` plus section numbers in `policy_citations`.

## 18. Document control

Owned by Trust & Safety. Changes require CX + Finance acknowledgement. Effective version is the one active on dispute creation date.

---

**End of document — NC-POL-FRD-2026-01**
