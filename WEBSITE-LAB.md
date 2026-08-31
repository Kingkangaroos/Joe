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

### Concept

A mobile-first construction-company website built around a sticky blueprint canvas. Normal page scrolling scrubs the build sequence: a pencil follows an SVG path, drawing the plan in stages, and the blueprint gradually becomes the finished bathroom.

### Locked mechanics

- normal scroll only; no scroll-jacking;
- sticky build canvas;
- SVG pencil follows the path using `getPointAtLength()`;
- nine draw-on-scroll lines;
- five story chapters;
- blueprint → finished-room transformation tied to the same scroll progress;
- dedicated mobile composition, including short-phone handling;
- `prefers-reduced-motion` support.

### Collaboration note

Claude may inspect and improve Test 1, but should preserve the core scroll mechanism when making Test-1 improvements. A substantially different scroll technique should become a new numbered test rather than silently replacing this one.
