# Gamenfy Swipe Navigation Architecture

Status: **engine built, dormant, not loaded by any production page**.

This follows the Lab-first rule. `lab-swipe-nav.html` validates gesture feel; `swipe-nav.js` is the reusable cross-page engine that can be explicitly mounted later. Do not load or mount it globally until Joey approves the installed-iPhone feel.

## Canonical route order

1. Main → `index.html`
2. Body → `character.html`
3. Skills → `character.html#skills`
4. Finance → `finance.html`
5. Jarvis → `jarvis.html`

This mirrors the current `topbar.js` bottom navigation. Bottom-nav taps remain the primary/direct navigation path; swipe is additive.

## Gesture ownership

The engine is deliberately vertical-first.

- No gesture is claimed during the first 10 px.
- Horizontal lock only occurs when `abs(dx) > abs(dy) * 1.28`.
- Vertical intent exits immediately and leaves browser scrolling native.
- `preventDefault()` is called only after horizontal lock.
- Slow horizontal commits require at least `max(72px, 18% viewport width)`.
- A fast flick can commit after 38 px at >= 0.55 px/ms.
- First/last tab stop at their route boundary.

## Exclusions

A page swipe cannot start from:

- inputs, textareas, selects, buttons or links;
- contenteditable controls;
- sliders;
- visible dialogs/modals;
- anything marked `data-swipe-exempt`;
- any ancestor with real horizontal overflow (`overflow-x: auto|scroll` and scrollWidth > clientWidth).

This protects forms, Jarvis chat controls, category strips, carousels and custom horizontal components.

## Modal safety

The engine refuses to start while known app modal states are open, including `topbar-modal-open`, `p31-modal-open`, visible `aria-modal=true`, `.modal-bg`, `.po-modal-bg` and `.wt-overlay` surfaces.

## Cross-document behavior

The production app uses separate HTML documents. Therefore the real engine does **not** attempt to drag the next document live underneath the finger. A successful gesture resolves only at release and then calls `location.assign()` for the adjacent canonical route.

That is intentional: it avoids iframe duplication, stale app state, double-loaded Supabase clients, broken browser history and heavy memory usage on iPhone.

A later cosmetic transition can be added separately after the navigation behavior is proven. It should not change gesture ownership rules.

## Activation contract

The file does not self-mount. The only activation path is an explicit call such as:

```js
window.GamenfySwipeNav.mount();
```

A caller may also inject `navigate` and `onState` callbacks for testing. Until a production page imports the file **and** calls `mount()`, this engine has zero runtime effect.

## Rollout gate

Before any production activation:

1. test `lab-swipe-nav.html` in the installed iPhone PWA;
2. verify ordinary vertical scrolling and diagonal scrolling feel natural;
3. verify inputs/buttons and Jarvis-style controls never switch page;
4. verify horizontal category/carousel strips keep their own gesture;
5. verify slow swipe, flick, snapback and first/last boundary behavior;
6. only then wire the dormant engine into a small subset or opt-in mode before global release.
