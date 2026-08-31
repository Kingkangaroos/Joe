# Gamenfy Website Lab

**Owner:** Joey  
**Maintained by:** ChatGPT (OpenAI) + Claude  
**Purpose:** one persistent place in the repo for testing website techniques without losing earlier experiments.

## Rule

Do not overwrite an accepted experiment just to try a different technique. Keep it as a numbered test and add the next direction as Test 2, Test 3, etc. This lets Joey compare directions and lets ChatGPT/Claude review the same implementation history.

## Website Lab north star — accepted 2026-08-31

The target is **Apple-like clarity and premium motion applied to a local-service conversion website**.

Hard rules:
- within about **5 scroll gestures**, the visitor should understand the company, feel trust, see the level of work and want a price indication;
- one clear focus per section;
- headlines are short; supporting copy is usually one sentence;
- motion supports the sales story and must never hold useful information hostage;
- no scroll-jacking and no long empty cinematic stretches;
- the signature visual should feel expensive because of art direction, consistency, typography and restraint — not because many things move;
- mobile-first;
- service detail can progressively disclose on tap instead of dumping text on the homepage;
- project proof should be visual and swipeable/compact;
- primary conversion direction is a **low-friction first price indication / free site visit**, not a heavy quote form;
- when images are generated for a transition sequence, use the same room, same camera, same perspective and logical build progression;
- ChatGPT-generated visuals should be tried first; external stock imagery is not the desired Test 1.2 direction.

## Test 1 — Scroll Animations

**File:** `site-klus-scroll.html`  
**Regression checks:** `tests/scroll-site-smoke.js`  
**Lab index:** `sites.html`

Original mobile-first construction-company experiment: a sticky blueprint canvas, pencil path and long staged build sequence.

Accepted feedback:
- keep scroll-driven progress and the idea of one story evolving;
- change the long cinematic pacing, because it delays useful company information;
- keep Test 1 as technical reference rather than overwriting it.

## Test 1.1 — Content-first persistent scroll story

**File:** `site-klus-scroll-1-1.html`

First attempt to let normal site content move at normal speed while a persistent bathroom visual evolves alongside it.

Accepted feedback:
- content-first was the right correction;
- the drawing/pencil still felt too dominant and not logically connected enough to the final room;
- the copy did not feel inviting enough to read;
- the visual still behaved too much like a demo effect;
- using an Unsplash payoff was not the desired production direction;
- the next version should use self-generated, highly consistent keyframes.

## Test 1.2 — Apple-like 5-frame conversion story

**File:** `site-klus-scroll-1-2.html`  
**Visual asset:** `img/lab/website-test-1-2/a-sequence.webp`

### Chosen art direction: Alternative A — Architectural Luxury

Four visual directions were explored:
A. Architectural Luxury  
B. Warm Minimal  
C. Construction Reveal  
D. Ultra Premium Showcase

**A was selected for the first working 1.2 site.** It gives the best balance between:
- premium / expensive visual impact;
- believable renovation-company positioning;
- a dark, architectural aesthetic with natural stone, walnut and warm light;
- enough restraint to support conversion.

D can be tested later as a more spectacular variant, but risks making the company feel like a luxury interior-design studio rather than a contractor/renovation business.

### 5 visual states

One bathroom, one camera:
1. elegant architectural concept;
2. definitive plan with first material information;
3. clean rough construction / framing / plumbing;
4. high-end finish nearly complete;
5. final architectural-photography-feeling bathroom.

The five states are stored in one lightweight sprite and are crossfaded based on normal page scroll. Crossfade is combined only with a very subtle scale/vertical shift to avoid a slideshow feeling.

### Page rhythm

1. Hero: company proposition, CTA, trust proof and first concept visible immediately.
2. Scroll story: plan → rough build → finish → final room with extremely short copy.
3. Services: horizontally swipeable/tappable cards, with progressive disclosure.
4. Projects: visual proof cards.
5. About: short human trust block.
6. Price indication: lightweight two-choice demo that returns a broad range and points toward a free site visit.

### Collaboration note

Claude may refine Test 1.2, but preserve the north-star rules above. A substantially different mechanic or art direction should remain a separate numbered variant rather than silently replacing Test 1.2.
