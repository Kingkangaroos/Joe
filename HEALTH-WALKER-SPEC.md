# Health Walker — future Home component

Status: specified, not yet illustrated or animated.  
Product owner: Joey. Builder: ChatGPT (OpenAI).  
Captured: 2026-09-01.

## Product idea

Replace the former Day Score with one small character walking through grass along a visible path. A Level 0–10 badge sits above the character. Its position and energy represent a calm, smoothed picture of current health momentum rather than a volatile score for one isolated day.

No artwork is generated in the Builder chat. A separate Creator supplies the approved walker and animation frames later; the Builder integrates them.

## Proposed level calculation

`Health Momentum = 60% mission consistency + 25% recovery + 15% movement`

- **Mission consistency (60%)**: average of the active public Daily Mission levels, each already on the existing 0–10 scale.
- **Recovery (25%)**: sleep duration/consistency plus resting-heart-rate and HRV trends compared with Joey's own rolling 28-day baseline.
- **Movement (15%)**: steps and active minutes relative to the personal daily target.

The displayed Level is the seven-day exponentially smoothed result, rounded to 0–10. A single bad reading must not make the character collapse or jump several levels.

## Health-data safeguards

- Never punish a high heart rate recorded during exercise. Heart-rate input is only considered when Fitbit marks it as resting or when a sustained resting trend is available.
- Missing Fitbit fields are omitted and the remaining known components are reweighted; missing data never counts as zero.
- Show `Health data incomplete` when fewer than two of the three components are available.
- This is a motivation indicator, not a medical diagnosis or risk score.
- Fitbit reconnection is a prerequisite before recovery data can influence the level reliably.

## Visual behaviour

- One compact landscape strip, smaller than the old Day Score card.
- The character walks farther along the grass/path as the smoothed level rises.
- Level 0–2: slow/tired idle; 3–5: steady walk; 6–8: energetic walk; 9–10: confident glow.
- Reduced-motion mode uses a still pose and only changes position.
- Tapping opens a transparent breakdown of Mission, Recovery and Movement contributions.

## Data contract

Store only derived display state in `rpg_health_walker_v1`; source data remains in the existing habit and Fitbit stores. Suggested fields:

```json
{
  "date": "YYYY-MM-DD",
  "level": 0,
  "rawScore": 0,
  "components": { "missions": null, "recovery": null, "movement": null },
  "dataComplete": false,
  "calculatedAt": "ISO-8601"
}
```

## Build sequence

1. Restore Fitbit authorization and verify its daily data feed.
2. Implement the calculation behind a Lab-only diagnostic card with test fixtures.
3. Ask the Creator for the approved walker/grass animation set.
4. Integrate and verify reduced motion, missing-data behaviour and iPhone layout.
5. Move the component to Home only after Joey approves it in the normal Lab.

