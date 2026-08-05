# Gamenfy v11 — Visual Redesign Exploration

Staging branch for the v11 visual direction. Nothing here affects the live
v10 app on `main` — this branch exists specifically so Joey can preview
changes safely before deciding whether to adopt them (his explicit request,
2026-08-06).

## Status: exploration phase, no code changes yet

Per Joey: "we kunnen er later over discussiëren" — this is inspiration
gathering, not a build request. Nothing should be built here until Joey
confirms a direction.

## Reference sites Joey shared (2026-08-06)

- **panton.vitra.com** — scroll-driven narrative timeline. Each scroll step
  reveals a new year/chapter of Verner Panton's life; images and text enter
  tied to scroll position. Built on Framer, which has scroll-animation
  primitives built in — Gamenfy has no build step/framework, so this would
  need to be hand-built with CSS scroll-driven animations (`animation-timeline`)
  and/or Intersection Observer, which is achievable but more manual.
- **kargo-studio.com/works** — horizontal-scroll portfolio, distinct panels
  (Archives/Works/Contacts) as "chapters."
- **apple.com** — parallax/sticky-section storytelling (well-established,
  no need to re-verify — Claude already knows this pattern well).

Also referenced: Raycast Wrapped (stats-card grid), Google Calendar app
store screenshots, a "Flora"-style focus app with a cute animated character
that reacts to state, an isometric tree-growing achievement visualization,
a pink habit-tracker app with a flowing connected-icon daily timeline,
Google Health's dashboard layout.

## Joey's own notes (verbatim, lightly organized)

- Widget on the home screen
- Agenda feels too static, wants it to feel more "flowing"
- A OneNote/Notion vibe per skill — notes/lists per skill — but ALSO wants
  to see them surfaced on Main. He flagged this himself as hard to reconcile
  ("dat vind ik nog moeilijk") — a real information-architecture question,
  not just a style question.
- Weather widget if easy to build: sun meter, UV index, degrees, 14-day
  forecast.
- Forest-app-style: small animated "Joey characters" per skill that visually
  reflect skill level — e.g. a finger-whistling character that whistles
  louder and moves more the higher that skill's level is. (Claude's take:
  this is the strongest idea of the batch — genuinely buildable with simple
  CSS/SVG animation, no game engine needed, and it's a motivating mechanic
  that's actually native to a skill-leveling app.)

## Claude's honest technical read (2026-08-06)

- **Daily-use tension**: Panton/Kargo are built for a one-time "wow" visit,
  not an app opened 5-10x/day. Heavy scroll-jacking and long pinned sections
  are great once, tedious daily. Leaning toward translating the *feeling*
  into fast, subtle scroll-linked micro-animations rather than full
  cinematic scroll-storytelling.
- **Home-screen widget**: a true iOS widget (like the screenshots) requires
  a native app — a PWA cannot provide one. What's realistic: the PWA icon
  itself, possibly a Siri Shortcut for at-a-glance info. Don't oversell this.
- **Weather**: genuinely easy — Open-Meteo is a free, no-key API, good fit.
- **Skill characters**: buildable now, no blockers.
- **Flowing agenda**: buildable with SVG/CSS, no heavy scroll library needed.

## Design Bible (per "chattie"'s suggestion, which Claude thinks is sound)

Before touching code, define:
1. Color world
2. Character style
3. Animation rules
4. Home layout
5. Skill-page structure
6. Scroll behavior

Not started yet — waiting on Joey's direction.
