# Piano Studio — ChatGPT — 10 November 2026

Joey asked to prepare live piano feedback inside the Piano skill, using four songs and optional accompaniment/lyrics. All five named favorite artists are represented by four song workspaces:

- RAYE & 070 Shake — Escapism.
- MARINA — Primadonna
- Megan Thee Stallion feat. Nicki Minaj & Ty Dolla $ign — Hot Girl Summer
- Mariah Carey — We Belong Together

Entry points: Lab → Piano Studio; Piano skill → Piano Studio. `piano-lab.html` opens directly so microphone permission is not trapped in a preview iframe.

## Working behavior

Original, distinct technical warmups are included and explicitly labeled as **not the songs' instrumentals or transcriptions**. Correct full-song accompaniment is not provided. User-supplied Standard MIDI files can drive the piano synthesizer, note roll and wait-mode reference. User-supplied audio can provide a real backing track; it cannot provide reference notes without MIDI. Licensed score references are linked for three songs; the fourth links the official artist video. PDF conversion is not implemented. No purchases were made.

- Local Web Audio single-fundamental estimate, nominally D2–D6, confidence gating and release/repeated-note gating. Microphone input is monophonic and does not validate chord simultaneity, fingering, dynamics, timing or vocal technique.
- Optional Web MIDI input (no sysex), exact note-on checking including simultaneous chord targets. Hand selection uses a visible adjustable pitch split, not a learned fingering model.
- Wait mode, incorrect-note feedback, semitone note names, dynamic keyboard range, note roll, hand isolation, speed adjustment and bounded A/B fragment loops.
- Local MIDI type 0/1 parsing with running status, tempo map, note durations and sustain CC64. Drum channel excluded. Input bounds: 2 MB, 12,000 notes, 20 minutes.
- Own audio (50 MB cap), plain-text lyrics or timed LRC (100 KB input cap, 40,000 characters). Text is rendered safely via textContent/textarea.
- Reference playback and singing modes stop the microphone and grading to prevent the app's own output being scored as the user's piano. Microphone is not routed to speakers. Only user gestures enable input or audio.
- Mic tracks, synthesis and MIDI handlers stop on pagehide/background. Async permission requests have cancellation checks and stop late-acquired streams. Audio object URLs are revoked on replacement/unload.
- All imports and lyrics are memory-only for this session. No upload, recording, persistence, XP award or RPG writer.

## Evidence and limitations

Browser checked: four song selectors, correct/incorrect screen-key note feedback, complete eight-note left-hand fragment, reference playback state, optional lyric display and timed self-authored test line during singing mode. This validates UI/logic; sound quality and real piano microphone accuracy have not been established. Actual iPhone, physical MIDI input, microphone capture and noisy-room/polyphonic accuracy remain unverified.

`tests/piano-lab-smoke.js`: synthetic pitch at 44.1/48 kHz across register, silence/noise, MIDI tempo/running status/sustain/truncation, hand separation, chord completion/repeated events, LRC and isolation/lifecycle checks pass.

Prior baseline has two unrelated stale-version tests failing: `tests/park31-smoke.js` expects art cache v1.19 rather than current v1.20; `tests/spar-product-pass-smoke.js` expects an old Park JS version. Both failures were reproduced at original commit 9897a5d, before World Studio/Piano changes. Do not claim the full repository suite is green.

Reference feature research: flowkey's public wait/loop/slow-motion/hand selection description; Skoove's note recognition description; MDN Web Audio, getUserMedia and Web MIDI. This is an independent prototype, not their code, UI, recordings or catalog. No complete copyrighted lyrics are bundled.
