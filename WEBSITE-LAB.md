# Gamenfy Website Lab

**Owner:** Joey  
**Maintained by:** ChatGPT (OpenAI) + Claude  
**Purpose:** one persistent place in the repo for testing website techniques without losing earlier experiments.

## Rule

Do not overwrite an accepted experiment just to try a different technique. Keep it as a numbered test and add the next direction as Test 2, Test 3, etc. This lets Joey compare directions and lets ChatGPT/Claude review the same implementation history.

## Test 1 — Scroll Animations

**File:** `site-klus-scroll.html`  
**Regression checks:** `tests/scroll-site-smoke.js`  
**Lab index:** `sites.html`

### Original concept

A mobile-first construction-company website built around a sticky blueprint canvas. Normal page scrolling scrubs the build sequence: a pencil follows an SVG path, drawing the plan in stages, and the blueprint gradually becomes the finished bathroom.

### Joey feedback — accepted 2026-08-31

**KEEP**
- the idea that one visual story evolves as the visitor scrolls;
- sketch / blueprint → construction → finished room;
- a pencil or visual companion can move with the story;
- premium motion that makes the site memorable.

**CHANGE**
- Test 1 asks for too much scrolling before the visitor gets useful website information;
- the animation currently becomes the main event and steals attention from the actual company/site content;
- the website needs a much stronger expensive / premium / art-directed feeling;
- the final result should look substantially more photorealistic — almost like a real architectural/interior camera shoot.

**REUSE**
- scroll-driven progress;
- sticky/persistent visual layer;
- staged build progression;
- reduced-motion support;
- mobile-first implementation.

## Test 1.1 — Content-first persistent scroll story

This is the next iteration of Test 1, not a replacement for the archived original.

### Core principle

**The visitor keeps receiving normal website content at normal speed while one visual construction story travels alongside it.** Motion supports the content; it does not delay it.

### Proposed page rhythm

1. **Hero — finished promise + first sketch**  
   Strong headline, trust/CTA immediately visible. The visual starts as an elegant architectural sketch or partial blueprint, but the visitor already understands what the company does.

2. **Services — blueprint becomes structure**  
   Normal readable service copy enters while the same visual scene gains walls / plumbing / framing / material detail.

3. **Process — room is being built**  
   The visual progresses through believable construction stages while short process steps remain readable and tappable.

4. **Proof / reviews — almost finished**  
   Materials, lighting and surfaces become increasingly realistic. Reviews and proof stay foreground content, not hidden behind a cinematic sequence.

5. **Final CTA — photoreal finished bathroom / interior**  
   The same composition resolves into a polished, camera-shot-feeling final room. This is the visual payoff, with the CTA directly adjacent.

### Visual behavior

- no long blank scroll sections;
- no scroll-jacking;
- a persistent/sticky visual may sit beside content on desktop and behind/above compact content beats on mobile;
- each normal content section advances the visual state;
- transitions should feel continuous rather than five unrelated images;
- the final image must aim for architectural-photography realism, not generic AI art;
- typography, spacing, material detail and motion should create the "someone spent serious money on this site" feeling.

### Higgsfield / generation role

Use a **ChatGPT-first** workflow for layout, still concepts, composition and implementation. Higgsfield is not the whole production line; it is a specialist step only where it produces a clear delta — especially smooth sketch→build→photoreal motion, cinematic material transitions, or higher-end image/video consistency.

### Earlier Gamenfy parallel

An older Gamenfy direction used the same principle: a character/companion travels with the user through changing scenes (e.g. jumping/moving between areas) while the actual app content remains usable. That interaction idea is a useful reference for Test 1.1: **one persistent visual companion/story, changing with scroll, without holding the content hostage.**

### Collaboration note

Claude may improve Test 1.1, but should preserve the content-first rule. A substantially different scroll mechanic should become a separate numbered test rather than silently replacing Test 1 or Test 1.1.
