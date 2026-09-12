# NovaCart High-Value Order & Manual Verification Policy
**Document ID:** NC-POL-HV-2026-03  
**Version:** 3.2  
**Effective date:** 1 March 2026  
**Owner:** Payments Risk & Customer Operations  
**Applies to:** All AUD ecommerce orders fulfilled by NovaCart AU  

---

## 1. Purpose

This policy defines when refunds, replacements, and goodwill gestures for **high-value orders** may be automated versus when they require **human verification**. High-value disputes create elevated financial leakage and fraud exposure. Investigators (human or AI-assisted) must apply these rules consistently and record evidence.

## 2. Definitions

| Term | Meaning |
|---|---|
| High-value order | Order total **greater than AUD $500** (inclusive of GST, exclusive of shipping unless shipping alone exceeds $500) |
| Confirmed delivery | Carrier status is `delivered`, or delivery scan exists with timestamp |
| Delivery evidence | One or more of: GPS proximity to registered address, delivery photo metadata, signature capture, locker pickup confirmation |
| Conflicting evidence | Customer claim contradicts one or more delivery evidence artefacts |
| Manual verification | Review by an authorised CX Manager (or Finance for exceptions above approval limits) before money moves |
| Auto-refund | System-initiated refund without human approval |

## 3. Scope

This policy applies to:

- Item not received (INR) disputes  
- Damaged / missing parts on high-value goods  
- Wrong item claims on high-value goods  
- Chargebacks linked to high-value deliveries  
- Goodwill refunds proposed by agents or AI systems  

This policy does **not** replace the general Refund Policy or Fraud Escalation Policy; where rules conflict, the **stricter** control wins.

## 4. High-value threshold rules

### 4.1 Primary threshold

1. Orders with `total_amount > 500 AUD` are classified **HIGH_VALUE**.  
2. Multiple related orders from the same customer within 48 hours that collectively exceed $500 should be treated as high-value for dispute handling if they appear linked to one claim narrative.  
3. Gift cards and digital goods above $500 follow the same manual verification gate.

### 4.2 Confirmed delivery + high value

**Rule HV-4.2 (critical for investigators):**

> If an order is **HIGH_VALUE** AND delivery is **confirmed** (carrier delivered) AND any delivery evidence exists (GPS, photo, signature, or locker proof), then **do not auto-refund**.  
> Required action: `MANUAL_VERIFICATION`.  
> Recommendation stance for AI systems: `HOLD` or `ESCALATE`, never `APPROVE` for full refund without human approval.

### 4.3 Conflicting delivery evidence

**Rule HV-4.3:**

> If customer alleges non-receipt but tracking shows delivered, OR GPS is within 100 metres of the registered address, OR a delivery photo exists, the case is **conflicting evidence**.  
> Conflicting evidence on high-value orders **must be escalated** to a human reviewer.  
> AI must cite the conflicting artefacts in the investigation finding.

### 4.4 GPS interpretation guidance

| Distance from registered address | Interpretation |
|---|---|
| 0–50m | Strong support for delivery at address |
| 51–150m | Supportive; check photo / unit number / ATL notes |
| 151–500m | Weak; request clarification; possible neighbour / wrong unit |
| >500m | Material conflict with “delivered to customer”; escalate |

GPS alone never proves the customer physically received the device. Combine with photo limitations and customer history.

### 4.5 Delivery photo guidance

Delivery photos are **supporting evidence**, not conclusive identity proof. Investigators should record:

- Whether a package is visible  
- Whether a door / building context is visible  
- Whether the address number is readable  
- Explicit **limitations** (e.g. address not clear, person not visible)

If photo limitations are material and the order is high-value, prefer `HOLD` / `MANUAL_VERIFICATION` over auto-refund.

## 5. Customer history multipliers

High-value disputes involving customers with **three or more** prior refunds or “not received” claims in the last 12 months are **elevated risk**.

**Rule HV-5.1:**

> Elevated-risk + high-value + any delivery confirmation → mandatory manager review.  
> Do not approve full refund in first-pass automation.

Document prior claim count and outcomes in the finding.

## 6. Allowed automated actions (high-value)

Automation **may**:

- Open an investigation case  
- Collect order, tracking, payment, warehouse, and history evidence  
- Retrieve this policy and related policies  
- Recommend `HOLD`, `REQUEST_INFO`, or `ESCALATE`  
- Draft customer messaging for human send  

Automation **must not**:

- Execute a full refund on high-value + confirmed delivery cases  
- Promise refund timing that bypasses verification  
- Suppress contradictory evidence from the finding  

## 7. Approval authority after verification

| Amount | Approver after investigation |
|---|---|
| $500.01 – $1,000 | CX Manager |
| $1,000.01 – $3,000 | Senior CX Manager |
| Above $3,000 | Finance Operations + CX Senior Manager |

Partial refunds / store credit still require the same band if the original order was high-value and delivery was confirmed.

## 8. Required finding fields for AI investigators

When producing a structured finding for a high-value dispute, include:

1. Order amount and high-value flag  
2. Delivery status and timestamps  
3. GPS distance if available  
4. Delivery evidence summary + limitations  
5. Customer prior dispute count  
6. Explicit policy citation (document name + section, e.g. HV-4.2)  
7. Recommendation and recommended action  
8. Contradictions list  

Missing any of the above on a high-value INR claim is a quality defect.

## 9. Worked examples

### Example A — Laptop INR with delivery proof (typical HOLD)

- Order: $850 laptop  
- Tracking: Delivered  
- GPS: 18m from registered address  
- Photo: package on doorstep; address number unclear  
- History: 4 prior refunds  

**Apply:** HV-4.2, HV-4.3, HV-5.1  
**Outcome:** `HOLD` + `MANUAL_VERIFICATION`  
**Rationale:** High-value + confirmed delivery + evidence conflict with customer narrative + elevated history.

### Example B — High-value, never shipped

- Order: $799  
- Tracking: label created only; no delivery scan  
- No GPS / photo  

**Outcome:** May recommend refund or reship after confirming payment capture and warehouse non-despatch — not blocked by HV-4.2 because delivery is not confirmed.

### Example C — High-value wrong item

- Order: $1,299 MacBook Air  
- Warehouse pick matches Air  
- Customer claims Pro  

**Outcome:** `REQUEST_INFO` (serial / unboxing photo) before refund; do not auto-approve full refund solely on customer statement.

## 10. Interaction with chargebacks

If a bank chargeback is opened on a high-value delivered order, assemble delivery evidence pack within SLA and prefer contesting when GPS ≤ 150m and photo exists, unless fraud indicators dominate. See Fraud Escalation Policy for representment rules.

## 11. Logging & audit

Every high-value manual verification decision must store:

- Investigation id  
- Evidence ids  
- Policy sections cited  
- Approver identity / role  
- Final action  

Retention: minimum 7 years for financial dispute records.

## 12. Exceptions

Rare exceptions (PR crisis, confirmed courier loss after delivery scan, police report) require Senior CX Manager written approval and must still be audited. AI systems must not invent exception paths.

## 13. Policy ownership & review

Reviewed quarterly or after material fraud incidents. Investigators must use the version effective on the dispute open date when rules change mid-month.

## 14. Quick reference for agents

```
IF amount > 500
 AND delivered == true
 AND (gps_near OR photo_exists OR signature_exists)
THEN
  recommendation = HOLD
  recommended_action = MANUAL_VERIFICATION
  do_not_auto_refund = true
END
```

If evidence conflicts with the customer story, add contradiction notes and escalate rather than approving.

---

**End of document — NC-POL-HV-2026-03**
