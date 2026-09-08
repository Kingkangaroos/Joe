# Income handoff — 2026-09-07

Managed by ChatGPT (OpenAI). This is the compact commercial handoff from Joey's cross-project sparring so the Income / Website Ventures project can continue without re-explaining the decisions.

## LIVE UPDATE — 2026-09-08

- **Website Ventures = priority #1 / primary near-term income engine.**
- **Joey's own Website Ventures / agency showroom = P0** and sets the visual/technical ceiling before the customer system is sold.
- **Higgsfield Batch 4 is treated as complete in the current manual workflow. Do not regenerate it by default.**
- Active manual generation queue: `WEBSITE-VENTURES-HIGGSFIELD-QUEUE.json`.
- Copy/paste cockpit: `website-ventures-higgsfield-prompt-board.html`.
- Winner review: `website-ventures-higgsfield-review.html`.
- Asset landing map: `WEBSITE-VENTURES-ASSET-IMPORT-MANIFEST.json` → `website-ventures-assets/`.
- **Selected/live integration gate:** `WEBSITE-VENTURES-SELECTED-ASSETS.json` + `website-ventures-selected-assets.html` + `website-ventures-selected-assets.js`.
- The Agency Showroom and Plumbing flagship are already wired to that gate. `pending` keeps the coded placeholder; only `selected + real committed selectedPath` may replace it.
- The Selected Assets board automatically audits **Queue → Import Manifest → Registry → selected-file existence**, so broken routing becomes visible before QA.
- Finance → Ventures now exposes the same numbered work route directly: **1 Queue → 2 Review winners → 3 Selected Assets**. Its Productielijn tab reads the active queue JSON directly; the old legacy HQ quick list is no longer the operational queue.
- `ventures.js` is now **v11.4 / focusVersion 5**. Existing same-ID completion metadata is preserved while current quest copy points to the Selected Assets gate.
- Current required order:
  1. **Batch 5 — Agency desktop hero round:** three 16:9 / 2K Soul 2.0 concepts → choose exactly one desktop winner.
  2. **Batch 5 mobile derivative:** `AG-HERO-MOBILE-001` uses Nano Banana 2 image-to-image, 4:5 / 2K, from that exact desktop winner. Recompose intentionally for mobile; do not invent a second campaign.
  3. **Batch 6 — Plumbing technician:** four 3:4 candidates → choose exactly one recurring technician master.
  4. **Batch 7 — Same-technician scenes:** diagnosis, under-sink service, arrival/trust using the same selected technician identity.
  5. **Promote approved files through Selected Assets:** local Review winner checkboxes do not publish anything by themselves.
  6. **Batch 9 — Final 4K masters:** Cinema Studio Image 2.5 only after selected 2K winners; credit-sensitive finish.
- **Batch 8 is OPTIONAL / skip-by-default.** Transformation/process/showcase support prompts exist only for a real coded-page media gap. Batch 8 never blocks progress.
- 50% remaining paid-generation balance = hard review stop. Manual Unlimited-supported website generation is preferred for exploration before paid finish.
- The old `HIGGSFIELD-P0-GENERATION-MANIFEST.json` has been deliberately replaced with a **deprecated-do-not-execute pointer** because it mixed earlier assistant hypotheses with approved work.
- All Website Ventures changes above were committed on `main` and observed as Vercel production **READY** during the 2026-09-08 execution pass.

## READ THIS FIRST — core decisions

1. **Website Ventures is the active money-machine.**
2. **Build Joey's own agency site first.** If Joey sells premium websites, his own site must be a convincing proof of that ability.
3. Agency direction: **maximum-premium, calm Apple-like shell, strong typography, controlled spacing, integrated scroll/motion, deliberate mobile execution.**
4. The agency site is also R&D: new scroll/interaction techniques can be proven there and later become premium customer add-ons.
5. Plumbing/trades remains the **first commercial showcase/customer-template system**, not the public top-level agency identity.
6. **Do not expose the production factory.** Public website = output/capability. Prompts, model recipes, asset registries, internal workflows and production logic = private competitive IP.
7. The connected GitHub repo has been observed as **public** in Vercel deployment metadata. This is an IP exposure risk and should be solved before commercial launch; no repo-visibility change has been claimed or performed yet.
8. Gamenfy Public remains a cheap beta. Do not let it consume major effort before repeated real usage proves demand.
9. Grip / other ventures remain idea-bank items, not current execution priority.

## Website Ventures — commercial direction

- First niche: **plumbing / trades / handyman / installations**.
- Starting geography: **Almere**, with **Bussum** as a useful second local area because Joey works there.
- `€349` = working **founding-offer hypothesis**, not final pricing and not a permanent ceiling.
- `€499–€699` = possible later range once scope, quality, speed and conversion are proven; also not locked.
- Desired production model: one exceptional reusable customer system → customer-specific colors, copy, services, real photos and selected identity assets.
- Customer should provide real project/team photos where proof is claimed; production presents them beautifully rather than fabricating proof.
- Fulfilment should become fast once the template is mature, but do not promise an ultra-short end-to-end time before customers 1–10 reveal real communication, revision, QA, domain and handoff time.
- Possible add-on: **Website Control Session ~€59**, not locked.
- Customer should remain owner of their domain. Joey may manage DNS/hosting/setup for convenience.
- Acquisition should fit Joey's full-time job and Dutch rules: active-buyer platforms, referrals, warm/local contacts and compliant outreach are preferable to generic mass spam or assumed cold-calling loopholes.

## Joey's own agency website — P0

Purpose: **prove capability, create trust and define the visual/technical ceiling before selling customer sites.**

### Agreed experience principles

- Apple-like premium feel: calm, minimal, strong typography, expensive but restrained motion.
- The site itself demonstrates craft instead of merely describing it.
- Text, visual and scroll motion should feel like **one experience**, not a detached autoplay video beside static copy.
- Plumbing is the first major showcase/demo world.
- Static first frame must already sell quality.
- Mobile quality is non-negotiable.
- The agency site should **not** become an AI-image gallery.

### Exact agency media rules

Authoritative file: `AGENCY-SHOWROOM-SLOT-CONTRACT-V1.json`.

- `AG-HERO-001`: likely external visual. Desktop 16:9; mobile deliberate 4:5 derivative.
- `AG-FIRSTSCROLL-001`: reuse the hero through code/CSS/JS if possible; do not generate another asset automatically.
- `AG-SHOWCASE-PL-001`: use real browser captures of the actual Plumbing demo, desktop + mobile.
- `AG-TRANSFORM-001`: code/screenshot first.
- `AG-INTERACT-001`: code first; generated art only after the interaction itself proves useful.
- `AG-OFFER-001`: no generation required.
- `AG-PROOF-001`: real-source-only; never generate the evidence.
- `AG-CTA-001`: no extra generation required unless an approved master can be reused cheaply.

Expected agency-specific external visual spend should remain small: roughly **one strong hero system plus selected derivatives**, then add media only where the real page needs it.

### Selected Assets integration contract

The coded pages now have predefined media hooks, so selecting a winner no longer requires redesigning page markup.

- Agency desktop hero → `agency.hero.desktop`.
- Agency mobile hero → `agency.hero.mobile`.
- Real Plumbing browser captures → `agency.showcase.plumbing.desktop` and `.mobile`.
- Plumbing master character reference → `plumbing.character.master` (reference-only by default).
- Plumbing hero → `plumbing.hero`.
- Plumbing story beats → `plumbing.story.trust`, `.diagnosis`, `.service`.
- A registry slot on `pending` is intentionally non-destructive.
- A local Review checkbox is only QA state.
- Promotion requires the exact file to be committed, then the intended registry slot set to `selected` with a real `selectedPath`, then desktop/mobile verification.
- If a selected file fails to load, the loader keeps the coded fallback rather than breaking the page.

## Plumbing asset status — FIXED vs PROPOSED

### FIXED / strongly agreed

- One strong recurring technician; consistency beats many unrelated AI people.
- Authentic tradesperson, not fashion model.
- Premium Porsche-like shell is allowed.
- Real client project proof remains real.
- Customer system must be reusable/template-driven.
- Current generation round is intentionally small: technician + diagnosis + under-sink/service + trust/arrival scene.

### PROPOSED / NOT mandatory

Do not turn these old concepts into generation work without a real page need or fresh Joey approval:

- leaking-bathroom hero;
- permanent white/deep-red/chrome/water world;
- service van;
- tool pack;
- phone/contact bridge;
- full arrival → inspection → repair → clean-up → handover generated sequence;
- technical macro pack;
- motion versions.

## Website offer questions still open

- Exact one-sentence outcome sold.
- Final founding price and later regular price.
- Maximum production/communication time per customer.
- Setup-only vs annual hosting/maintenance model.
- Revision boundaries and custom-work definition.
- Exact commercial hosting/domain/DNS/handoff flow.
- Best acquisition mix around Joey's full-time job.
- Whether Website Control Session is optional or bundled.

## Higgsfield operating rule

- Active exploration is manual on `higgsfield.ai` when the chosen account/model path is visibly Unlimited-supported.
- Do not use connector/API generation merely because it is available; treat direct integration as credit-spending unless Higgsfield explicitly reports otherwise.
- Use still/reference winners before motion or premium finish.
- Final 4K = winner polish, not exploration.
- At 50% remaining paid-generation balance: stop, review winners/waste/remaining required jobs, then decide what still deserves paid spend.

## Gamenfy visual production — IMPORTANT BOUNDARY

The earlier full park/world/prop expansion was **assistant inference**, not an approved Joey production requirement.

### What is actually prepared

A separate file now exists:

- `GAMENFY-HIGGSFIELD-ANIMATION-PILOT.json`
- copy-board: `gamenfy-higgsfield-animation-pilot.html`
- future output folder: `img/lab/animation-pilot/`

It is explicitly **DEFERRED while Website Ventures is the active bottleneck**.

The real bounded pilot is:

1. choose one existing approved Daily Score source from `img/lab/daily-score/joey/l01.webp` … `l10.webp`;
2. AutoSprite **WALK** first;
3. only if WALK passes: natural **IDLE**;
4. **JUMP** with real anticipation/takeoff/landing articulation;
5. one **custom reach/touch/return interaction** where the visible prop remains a separate app layer.

Verified Higgsfield model: **AutoSprite Animation (`autosprite`)**. Relevant supported presets include `idle`, `walk`, `run`, `attack`, `jump`, `custom`; parameters include turbo/pro/max tier, 2–64 frames, 32–512 frame size, background removal and humanoid toggle.

### Stop rule

If WALK repeatedly looks like a flat translated PNG, feet skate/melt, identity morphs, or interactions cannot hold a stable contact point: **stop the animation batch and prototype rigged 2D architecture** instead.

### DEFER / do not generate now

- full master park/world;
- path/tree/bench/lamp/sign/fountain kit;
- 11 Daily Mission props;
- chess/piano/book/weights/whistle/tennis packs;
- new final skill characters;
- broad animation batches across all existing characters.

Core principle: **prove the general technology first; produce character/content breadth later.**

## Gamenfy Public

- Do not genericize all Joey missions/skills yet.
- Current beta is a demand/understanding test, not a second full roadmap.
- Friends only justify major Public development if they actually return and use it.
- Personal Gamenfy remains the main source of product learning.

## Cross-project operating rule

- GitHub repo / Project HQ is the durable bridge between Dashboard, Website Ventures and Income.
- Important decisions from one ChatGPT project must be mirrored into repo HQ/handoff docs rather than assuming another project automatically received the conversation.
- To resume in Income / Website Ventures, say: **"Read `INCOME-HANDOFF-2026-09-07.md` from `Kingkangaroos/Joe` first, then continue from it."**
