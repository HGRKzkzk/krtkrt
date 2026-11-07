# Instructions for coding agents

This repository is an experimental SvelteKit + TypeScript social hub, **not** a generic social feed, commercial marketplace, or matching app.

## Product invariants
- Treat **Kaart**, **Kringen**, and **Mijn plek** as the primary navigation. Discovery is a quality of interactions across these areas, not a separate navigation mode.
- Circles have private conversations; posts are visible outside their circles only when explicitly shared.
- Never expose residential coordinates, private addresses, contact details, or private circle content to unauthorized users.
- Personal introductions attest to a sincere existing relationship; they do not transfer liability for invitees' future acts.
- Preserve a future non-invite entry route for people without existing connections.
- Profiles can express likes, dislikes, ambivalence, reasons, external links, and tentative relationships. Do not infer genre or preference inheritance from adjacent artists.
- Do not reintroduce a discovery tab, explicit connection-creation form, cultural route graph, or deterministic matching. Curiosity, disagreement, and resemblance emerge through human-authored profiles, conversations, and posts.
- No badges, popularity rankings, engagement incentives, or required profile-completion metrics.

## Implementation approach
1. Start with working SvelteKit code and fictional demo data, no real accounts.
2. Keep components and state typed, comprehensible, and small. Use OpenLayers for map exploration at neighborhood level.
3. Run install, typecheck, tests, and build before claiming completion. Report any unrun checks.
4. Use small branches and reviewable pull requests; do not merge without human review.
5. Do not introduce Supabase, AI, realtime subscriptions, public profiles, or a production auth system without a scoped decision and security review.
6. Never commit credentials, personal data, or real participant records.
7. Preserve Dutch-language, plain and non-bureaucratic user copy.

## Review question
Does this change create a concrete possibility for encounter, expression, practical help, or incidental discovery without making participation less voluntary or more invasive?
