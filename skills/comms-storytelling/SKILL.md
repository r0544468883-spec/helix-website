---
name: comms-storytelling
description: Clear, audience-aware follow-up, summary, and in-product communication for Israeli SMB products. Use when turning analysis or data into a persuasive narrative for a specific reader (executive, customer, investor, non-technical stakeholder), writing a meeting follow-up or status summary where every commitment and date must be backed by the source, explaining a technical concept to a non-technical audience, writing an announcement or crisis note, or crafting microcopy such as button labels, error messages, empty states, and confirmations that tell the user what happens next.
---

# Comms Storytelling

## When to use
Use this for two related jobs. First, narrative communication: follow-ups, summaries, announcements, and findings that must lead with the point and stay faithful to the source. Second, product microcopy: labels, errors, empty states, confirmations, and success messages. It powers the comms agent that drafts follow-ups from transcripts/data and the UI-copy pass. It is not marketing copy (that is brand-voice/copywriting) or long-form docs.

## Operative rules (always-on; mirrors the registry entry)
- Structure BLUF (bottom line up front): lead with the point or decision, then support. One primary ask per message.
- Commitment fidelity: state only commitments, dates, numbers, and next-steps backed by the source (transcript/data). Never promise something that was not actually said. If a detail is uncertain, omit it or mark it to-confirm.
- Match register to the reader: exec = outcomes + decisions; practitioner = specifics. Translate jargon for non-technical readers.
- No over-promising, no hype.
- Microcopy is concise, action-first, and tells the user what happens next. Never blame the user.

## Deep reference (the on-demand layer)

### The narrative spine (four parts)
1. Headline: one sentence that captures the essence. If you cannot write it, you do not yet know your message.
2. Key points: 3-5 supporting ideas in a logical order (chronological, problem-solution, or importance-ranked).
3. Proof: concrete evidence for each point (a number, an example, a quote). One number per point; more than one is confusion.
4. Call to action: what the reader should think, feel, or do next. Specific, achievable.

### Narrative structures (pick by situation)
| Structure | Use when | Beats |
|---|---|---|
| Situation-Complication-Resolution | Exec / board / investor updates | Set the stage, name what changed/what is at stake, give the path forward |
| Problem-Solution-Benefit | Recommendations, proposals, project updates | Define the problem with stakes, recommend with rationale, quantify the benefit |
| Before-After-Bridge | Product/feature launches, process improvements | Current pain, improved future, how to get there |
| Hero's Journey | Major change, pivot, overcoming a challenge | Status quo, call to change, trials, victory, new normal |

### Data-heavy communication
- Lead with the insight, not the data.
- One number per point.
- Humanize: "42% churn" becomes "we lose 12 customers every week, a full cohort."
- Give context by comparison: "200ms latency" becomes "2x slower than last quarter."
- Bad = a data dump of every metric. Good = the one claim the data supports, plus a recommendation.

### Technical to non-technical
- Translate jargon into plain mechanism ("distributed consensus" -> "how servers agree on truth with no central boss").
- Use an analogy from the reader's world.
- Lead with business impact, not implementation.
- Pre-answer "why does this matter?" explicitly.

### Crisis note pattern
Lead with facts (what happened, when, impact). Take accountability with no weasel words ("mistakes were made" is a red flag). State concrete actions with a timeline. Commit to when they will hear next.

### Microcopy craft
| Element | Rule | Good | Bad |
|---|---|---|---|
| Button | Verb + noun | "Save draft", "Delete project" | "OK", "Click here" |
| Error | What happened + why + fix, never blame | "That email isn't valid, check for typos" | "You entered an invalid email" / "Something went wrong" |
| Empty state | Explain the blank, then invite action | "No projects yet. Create your first one." | "No data" |
| Tooltip | One sentence, answers "what does this do?" | | Explaining why it exists |
| Destructive confirm | Name the consequence; cancel is the prominent button | "Delete my account" / "Keep my account" | "Confirm" / "Cancel" |
| Success | Confirm the action, suggest the next step | "You're all set. Go to dashboard." | "Success!" |
Discipline: verb+noun labels, sentence case, same verb for the same action everywhere (never mix "Sign in" and "Log in"), lead with what the user can do, count words then cut 30%, write the error/empty/loading states with as much care as the happy path. One "please" per flow, not five.

### Worked example (follow-up with commitment fidelity)
Transcript says: client asked for a revised quote "next week"; team agreed to send API docs; pricing was discussed but no number was committed.
Good follow-up (BLUF): "Next step: we send a revised quote by [date], plus the API docs you asked for. Open item to confirm: final pricing (discussed, not yet fixed)." 
Wrong: inventing a price, or promising a delivery date the transcript did not contain. Uncertain details are marked to-confirm or omitted.

## Anti-patterns / common mistakes
- Burying the lede; the most important thing must be first.
- A draft that is all bullets with no narrative arc, or one you cannot summarize in a sentence.
- Passive voice to dodge accountability ("mistakes were made").
- Including data that does not support the point.
- Promising a date, number, or commitment the source never contained.
- "Click here" links and "Something went wrong" errors with no recovery action.
- Blaming the user in error copy.
- Over-apologizing ("we're so sorry, but unfortunately...").
- Inconsistent verbs for the same action across the UI.

## Checklist before returning
- The message leads with the bottom line and has exactly one primary ask.
- Every commitment, date, and number traces to the source; uncertain ones are omitted or marked to-confirm.
- Register matches the reader; jargon is translated for non-technical audiences.
- Each key point carries one concrete proof; no unsupported claims.
- Microcopy is verb+noun, action-first, blame-free, and says what happens next.
- Israeli context: Hebrew reads native and RTL where the output is Hebrew; no em-dash; no hype phrases.

## Sources
Distilled from the installed skills `communication-storytelling` (headline/key-points/proof/CTA spine, the four narrative structures, data-humanizing, technical-to-non-technical, crisis pattern, guardrails) and `ux-writer` (error-message formula, button/empty-state/tooltip/destructive-confirm rules, consistency and word-cutting discipline). Registry entry: `comms-storytelling` in `_shared/ai-kit/skills/registry.ts`.
