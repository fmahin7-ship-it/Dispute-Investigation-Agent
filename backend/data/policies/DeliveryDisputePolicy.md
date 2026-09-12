# NovaCart Delivery Dispute & Evidence Policy
**Document ID:** NC-POL-DEL-2026-01  
**Version:** 2.4  
**Effective date:** 10 January 2026  
**Owner:** Logistics Experience + CX Operations  
**Related:** High-Value Rules, Refund Policy, Fraud Escalation Policy  

---

## 1. Purpose

Delivery disputes (“I never got it”, “left at wrong place”, “photo is not my door”) are among the highest-volume and highest-leakage claim types. This policy standardises how investigators evaluate **carrier data, GPS, delivery photos, and customer statements**.

## 2. Evidence hierarchy

When artefacts conflict, weigh in this order unless fraud indicators reverse it:

1. Carrier scan events with timestamps (accepted, out for delivery, delivered)  
2. GPS distance from registered delivery coordinates at delivery time  
3. Delivery photo metadata and documented limitations  
4. Signature / ID check / locker retrieval logs  
5. Customer free-text statement  
6. Informal neighbour statements (weak)

Customer statements matter, but they do not override strong multi-artefact delivery confirmation without human review.

## 3. Tracking status meanings

| Status | Investigator meaning |
|---|---|
| `label_created` | Not yet with carrier; treat as not shipped for INR |
| `in_transit` | Do not refund as INR yet; provide tracking |
| `out_for_delivery` | Same day wait; recheck in 24h |
| `delivered` | Confirmed delivery event exists |
| `failed_attempt` | Not proof of receipt; schedule reattempt |
| `returning_to_sender` | Prefer refund/reship after warehouse receive |
| `lost` | Carrier confirmed loss → refund/reship |

## 4. GPS evaluation standard

### 4.1 Registered address

Use the shipping address geocode stored at checkout. If the customer updated address after label creation, note the mismatch.

### 4.2 Distance bands

| Band | Metres | Guidance |
|---|---|---|
| A | 0–50 | Strong spatial support for correct location |
| B | 51–150 | Supportive; verify unit / ATL / photo |
| C | 151–500 | Ambiguous; request clarification |
| D | >500 | Material location conflict |

**Rule DEL-4.2:** Band A or B combined with `delivered` status is **delivery-supporting evidence**. For orders above $500, combine with High-Value Rules (manual verification, not auto-refund).

### 4.3 Multi-unit dwellings

GPS near a building centroid may not prove the correct apartment. Prefer photo context, intercom logs, or locker codes. If unit-level uncertainty exists, `REQUEST_INFO` is appropriate.

## 5. Delivery photo standard

### 5.1 What photos are for

Photos help corroborate that a parcel was left in a location consistent with the address. They are **not** biometric identity verification.

### 5.2 Required metadata fields for systems

Investigators / tools should expose:

- `exists` boolean  
- `url` or asset path  
- `caption` (human or structured description)  
- `limitations[]` (what cannot be concluded)  
- `captured_at` timestamp  

### 5.3 Interpreting limitations

Common limitations:

- Address number not readable  
- No person in frame  
- Package label SKU not visible  
- Image blur / night glare  
- Package at building lobby serving many units  

**Rule DEL-5.3:** If limitations are material, do not claim “photo proves customer received goods.” Say “photo supports package presence at a doorway / lobby.”

### 5.4 Missing photos

Absence of a photo is **not** proof of non-delivery. Use tracking + GPS + history. For high-value conflicts, still prefer human review.

## 6. Authority to leave (ATL) & safe-drop

If ATL was selected:

- Delivered + Band A/B GPS is strong  
- Customer “I didn’t get it” remains possible (theft after drop)  
- Outcome options: HOLD for review, police report request for high-value, goodwill only with manager  

Do not silently full-refund high-value ATL deliveries with strong evidence.

## 7. Wrong address caused by customer

If the customer typed an incorrect address and carrier delivered to that pin:

- Prefer reship at customer cost or reject INR refund  
- Exception: if NovaCart address validation failed obviously, escalate for goodwill  

## 8. Carrier delay vs non-receipt

Delayed ≠ not received. Provide tracking and wait until delivered or exception closes. Refunding early creates double-fulfil risk when the parcel later arrives.

## 9. Investigation workflow for delivery disputes

```
1. Load order + shipping address
2. Load shipment/tracking
3. Load GPS fields + distance_meters
4. Load delivery_evidence
5. Load customer history
6. Search policies (this doc + high-value + refund)
7. List contradictions explicitly
8. Recommend APPROVE | HOLD | REQUEST_INFO | ESCALATE | REJECT
```

AI agents should stop when sufficient artefacts exist; they may refine policy search if the first retrieval is too generic.

## 10. Contradiction catalogue (examples)

- Customer: not received ↔ Tracking: delivered  
- Customer: not received ↔ GPS: 18m from home  
- Customer: not received ↔ Photo: package at door  
- Customer: wrong address drop ↔ GPS Band A + matching suburb  
- Customer: never shipped ↔ Warehouse pick + carrier acceptance exist  

Each contradiction must appear in the finding.

## 11. Outcomes aligned to delivery evidence

| Situation | Typical recommendation |
|---|---|
| Not shipped / lost | APPROVE refund or reship |
| Delivered + weak evidence + low value + clean history | Case-by-case; often REQUEST_INFO then decide |
| Delivered + strong evidence + high value | HOLD / MANUAL_VERIFICATION |
| Delivered + strong evidence + serial INR history | HOLD / ESCALATE fraud review |
| GPS Band D on “delivered” | HOLD — possible misdelivery |
| Photo limitations high + customer cooperative | REQUEST_INFO |

## 12. Customer communication standards

Do not accuse customers of fraud in first response. Use neutral language:

- “Our carrier shows a delivery scan at …”  
- “We need to verify a few details before we can refund …”  
- “Please upload a photo of the empty doorway / ask neighbours …”  

## 13. Data retention for delivery artefacts

Keep tracking payloads, GPS points, and delivery photos for at least 24 months (longer if chargeback open). Access limited to CX, Fraud, and Finance roles.

## 14. AI tool expectations

Operational tools should return **slim facts**, for example:

```json
{
  "status": "delivered",
  "delivered_at": "...",
  "distance_meters": 18,
  "delivery_method": "authority_to_leave"
}
```

Not entire carrier raw dumps. Policy search should retrieve sections 4–5 and 10–11 for INR+delivered cases.

## 15. Worked example — Case pattern 1042

Customer claims non-receipt of an $850 laptop. Tracking delivered, GPS 18m, photo shows package on doorstep with address unclear, four prior refunds.

**Evidence reading:** Strong delivery support + material claim conflict + high value + elevated history.  
**Policy path:** Delivery Dispute §§4–5 + High-Value HV-4.2/4.3/5.1 + Refund INR matrix.  
**Finding:** HOLD, MANUAL_VERIFICATION, list contradictions, cite policies.

## 16. Worked example — Misdelivery suspicion

Delivered status but GPS 920m from registered apartment and photo shows generic lobby.

**Finding:** HOLD or ESCALATE; possible wrong building drop; do not auto-reject customer; do not auto-refund without review.

## 17. Non-goals

This policy does not require computer-vision models. Captions/metadata are acceptable evidence inputs for hackathon and production v1 investigators.

## 18. Quick reference card

```
delivered + gps<=150m + photo → delivery-supporting
+ amount>500 → HOLD (manual verification)
+ many prior INR refunds → elevate risk
gps>500m on delivered → HOLD (possible misdelivery)
no ship scan → treat as not delivered
uncertain → REQUEST_INFO (do not invent)
```

## 19. Review cadence

Logistics and CX jointly review this policy every six months or after a spike in INR loss rate.

---

**End of document — NC-POL-DEL-2026-01**
