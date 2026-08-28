---
name: contract-legal
description: Convenience second-eyes review of Israeli SMB B2B contracts that flags one-sided clauses and missing standard protections, explicitly not legal advice and always ending in a human lawyer sign-off. Use when reviewing a service agreement, SOW, NDA, retainer, reseller or partner contract, or terms of service for an Israeli small business, and when checking for Israeli-jurisdiction essentials such as governing law and venue, VAT handling, payment and late-payment terms, IP assignment, liability caps, confidentiality, termination and notice, and data and privacy clauses. Separates risky (present but unbalanced) from missing (absent), quotes the specific clause, and never invents a statute or a legal fact. Not for drafting court filings or giving definitive legal opinions.
---

# Contract Legal (second-eyes, not advice)

## When to use
- A HELIX or SMB client hands over an Israeli B2B contract and wants a plain-language read before signing.
- Reviewing a service agreement, statement of work, NDA, retainer, reseller/partner agreement, or terms of service.
- Checking whether the standard Israeli-jurisdiction protections are present and balanced.
- Spotting one-sided clauses (liability, indemnity, IP, exclusivity, auto-renewal, unilateral termination) before a signature.

Not for: drafting litigation documents, giving a definitive legal opinion, or replacing a lawyer. This skill produces an advisory checklist; a qualified lawyer signs off on anything material.

## Operative rules (always-on; mirrors the registry entry)
- This is a convenience second-eyes check, explicitly NOT legal advice. A human signs, and a lawyer reviews anything material.
- FLAG: one-sided/unbalanced clauses (liability, indemnity, IP assignment, exclusivity, auto-renewal, unilateral termination), ambiguous or undefined terms, and MISSING standard protections.
- IL-JURISDICTION PRESENCE CHECK: governing law + jurisdiction, VAT (מע"מ) handling, payment terms + late-payment, privacy/data (and consumer-protection where relevant), termination + notice, liability cap, confidentiality, dispute resolution. Name what appears absent.
- DISCIPLINE: never invent a legal fact or cite a statute you are unsure of. Quote the specific clause you are flagging. Separate "risky" (present but bad) from "missing" (absent). Output is advisory: say plainly what to add or soften, and recommend a lawyer for anything material.

## Deep reference (the on-demand layer)

### The non-advice frame (state it every time)
Open every review by making the frame explicit: this is a second pair of eyes to help the reader spot issues to raise with a lawyer, not legal advice, and not a substitute for counsel. The client decides and signs; a qualified Israeli lawyer reviews anything material (large sums, IP transfer, long exclusivity, uncapped liability). This is the same posture as qa-verification's "mark unverified, do not pass": when you are unsure whether a clause is enforceable under Israeli law, say so and route it to a lawyer rather than asserting.

### Two buckets: risky vs missing
Always separate the two. They call for different action:
- Risky = a clause is present but unbalanced or ambiguous. Action: quote it and say how to soften/rebalance it.
- Missing = a standard protection is absent. Action: name it and say what to add.
Never blur them into one "issues" list; the client needs to know whether to change wording or add a section.

### Clause-by-clause flags (risky when present)
| Clause | Flag when |
|--------|-----------|
| Liability / indemnity | Uncapped, or one-sided (only your client indemnifies), or excludes the other party's own negligence |
| IP assignment | Assigns pre-existing/background IP, or assigns more than the deliverable, or is silent on ownership of work product |
| Exclusivity | Broad scope, long term, no carve-outs, no minimum-commitment in return |
| Auto-renewal | Renews silently with a long or unclear opt-out window, or a price rise on renewal with no cap |
| Termination | Unilateral (only one side may terminate for convenience), or no notice period, or no wind-down/payment-for-work-done |
| Payment | No due date, no late-payment consequence, milestones undefined, currency/VAT ambiguous |
| Confidentiality / NDA | One-directional when it should be mutual, no time limit, or definition of "confidential" so broad it is unworkable |
| Definitions | Key terms (Deliverable, Services, Confidential Information, Acceptance) used but never defined |
| Warranty / SLA | Promised uptime or acceptance criteria with no measurement or remedy |

### Israeli-jurisdiction presence checklist (missing when absent)
Confirm each of these appears; name any that is absent:
- Governing law and venue: contract states it is governed by Israeli law (הדין הישראלי) and names the competent court/venue (commonly the courts of a specific district, often Tel Aviv). Absence leaves jurisdiction contestable.
- VAT / מע"מ handling: states whether prices are inclusive or exclusive of VAT (בתוספת מע"מ כדין / כולל מע"מ). Silence on VAT is a frequent, costly ambiguity in Israeli B2B contracts. VAT is charged per the statutory rate in force at invoicing; do not assert a specific percentage in the review unless it is stated in the contract.
- Payment terms and late payment: due date or net terms (e.g., שוטף+30/+60), invoicing trigger, and a late-payment consequence (interest/הצמדה) or a reference to the statutory late-payment framework. For public-sector counterparties, mandatory payment-timing rules may apply.
- Privacy / data protection: where personal data is processed, a clause covering data handling and security, consistent with Israel's Privacy Protection Law and its regulations. Flag if the contract moves personal data with no data clause. Consumer-protection provisions where the end context is consumer-facing.
- Termination and notice: how either party ends the contract, the notice period, and what happens to work-in-progress and prepaid amounts.
- Liability cap: a stated ceiling on liability (often tied to fees paid), and which damages are excluded (indirect/consequential). Absence exposes the client to open-ended liability.
- Confidentiality: mutual where appropriate, with a survival period.
- Dispute resolution: litigation venue or arbitration (בוררות)/mediation (גישור) clause, and whether it is a precondition to suit.

### Language and bilingual contracts
Israeli B2B contracts are often in Hebrew, sometimes bilingual. When a contract is bilingual, check which language governs in a conflict (a "prevailing language" clause). Flag if the two versions differ on a material point. Quote the clause in its original language and give a short plain-Hebrew or plain-English gloss.

### How to write a finding
For each flagged item: (1) quote the exact clause text (or note "absent"), (2) say in one plain sentence why it matters to the client, (3) give the concrete fix (specific wording to add or soften), (4) mark severity (material -> lawyer required; minor -> optional). Never paraphrase a clause as if quoting it; if you cannot quote it, say you could not locate it.

### The discipline line (do not fabricate law)
Never invent a statute number, a case, or a legal rule you are not sure of. It is better to write "this area is governed by Israeli law on X; confirm the specifics with a lawyer" than to cite a wrong section. A confident wrong legal citation is worse than an honest "verify this". Do not state VAT percentages, interest rates, or notice periods as legal requirements unless they are in the contract or you are certain; otherwise route to counsel.

## Anti-patterns / common mistakes
- Presenting the review as legal advice or omitting the not-advice frame.
- Blending "risky" and "missing" into one undifferentiated list.
- Paraphrasing a clause as though quoting it, or flagging a clause without quoting the text.
- Inventing a statute, section number, VAT rate, or notice period.
- Missing the VAT/מע"מ inclusive-vs-exclusive ambiguity (a top Israeli B2B gap).
- Ignoring governing-law/venue absence, or a silent auto-renewal.
- Treating a one-directional NDA or uncapped liability as normal.
- Not flagging a bilingual contract's prevailing-language question.
- Failing to route material items (large sums, IP transfer, uncapped liability) to a lawyer.

## Checklist before returning
- The not-advice frame is stated and a lawyer sign-off is recommended for material items.
- Findings split cleanly into risky (present but bad) and missing (absent).
- Each finding quotes the clause (or says "absent"), explains why it matters, and gives a concrete fix.
- Israeli essentials checked: governing law + venue, VAT/מע"מ, payment + late-payment, privacy/data, termination + notice, liability cap, confidentiality, dispute resolution.
- No invented statutes, rates, or legal facts; uncertain points routed to counsel.
- Bilingual contracts: prevailing-language clause checked and version conflicts flagged.

## Sources
- No strong installed source skill exists for contract review (none found under ~/.claude/skills or the .agents skill sets). Written from domain knowledge of Israeli SMB B2B contract practice.
- Registry operative entry "contract-legal" (ai-kit/skills/registry.ts): not-advice frame, risky vs missing split, Israeli-jurisdiction presence check, quote-the-clause discipline, no fabricated legal facts.
