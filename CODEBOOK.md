# Codebook: narrative pattern coding (hand-coded)

**Status: DRAFT for review. Not yet applied.**

This codebook governs the manual coding of the 50 stories in `data/GR_stories.csv`. It replaces the keyword and regex classification that produced `data/GR_narrative_patterns.csv` (see notebook, Step 2), which was run on 50-word summaries rather than full stories and was never validated. Hand-coded output will be written to `data/GR_narrative_patterns_handcoded.csv` with the same schema, plus a `notes` column for edge cases.

## Procedure

1. **Unit of analysis:** the full story text, not the summary.
2. **First pass blind:** code all 50 stories without consulting the regex-derived CSV, in randomised order.
3. **Comparison pass:** diff hand codes against the regex output; compute simple per-dimension agreement.
4. **Adjudication:** for each disagreement, the hand code stands; log the disagreement and reason in `notes`.
5. **Reporting:** agreement rates and characteristic failure modes of the regex classifier go into the notebook and the README limitations section.

Single-coder design for now. If this feeds a publication later, add a second coder on a subsample (10 to 15 stories) and report Cohen's kappa per dimension.

## Dimensions and categories

### 1. `protagonist_gender`
Protagonist means the character with the most narrative agency, whose decisions drive the plot. If two share it equally, code the one the narration follows in the opening and note this in `notes`.
- `female` / `male`, as gendered by the text (pronouns, descriptors).
- `unclear`, for no gendering, or a nonhuman or collective protagonist (note which in `notes`).

### 2. `protagonist_role`
The protagonist's stated social role or occupation at story start, not what they become.
- `weaver`, `priestess`, `shepherd`, `fisherman`, `adventurer`, `warrior`, `royalty`, `ordinary villager` (no marked occupation beyond village membership), `unspecified`.
- Rule: an explicit occupation beats `ordinary villager`. A role acquired during the story does not count.
- New roles may be added if the full texts warrant it; log additions here.

### 3. `setting`
- `ancient/mythological`, for pre-modern markers only (gods, temples, oral prophecy, no modernity).
- `contemporary`, for explicit modern markers (technology, dated events, modern institutions). This category did not exist in the regex schema; its absence there presumed the finding. It must be codeable even if it ends up empty. An empty cell is evidence, a missing category is not.
- `mixed`, for both registers co-present (framed narration, mythic past intruding on a modern present).
- `unclear`, for no decidable temporal markers.

### 4. `core_conflict`
The conflict that the resolution resolves, not every conflict present.
- `vs gods / fate`, antagonist or obstacle is divine, prophetic, or fated.
- `community crisis`, threat to the collective (drought, curse, invasion) that the protagonist addresses.
- `quest / adventure`, goal-directed journey; obstacles incidental to reaching the goal.
- `love / loyalty`, interpersonal bond as the central stake.
- Precedence rule when several apply: code the conflict named in the climax. If a community crisis is caused by gods or fate, code `vs gods / fate` only if the divine relation (appeasing, defying) is what the climax turns on; otherwise code `community crisis`.

### 5. `resolution_type`
- `succeeds/triumphs`, protagonist attains their goal, no major cost.
- `saves community`, collective outcome foregrounded over personal goal.
- `returns home`, homecoming or transformation is the closing beat (may co-occur with success; code `returns home` only when the return itself is the resolution).
- `fails/sacrifices`, goal not attained, or attained at a cost the text marks as grave.
- `ambiguous`, open ending or unresolved.
- Precedence when several apply: `fails/sacrifices` beats `saves community` beats `returns home` beats `succeeds/triumphs`.

## General rules

- Code what the text does, not what the genre implies.
- Every non-obvious decision gets a one-line `notes` entry; the notes column is data.
- If a dimension repeatedly resists these categories, stop and revise the codebook rather than forcing codes, and record the revision in this file with a date.
