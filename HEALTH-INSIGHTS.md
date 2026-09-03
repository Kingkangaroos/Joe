# Gamenfy Health Insights — Lab contract

Implemented by ChatGPT (OpenAI), 2026-09-04.

## Status

**LIVE IN LAB, READ-ONLY.**

Health Insights is rendered inside the existing Health Trail card by `health-trail.js` v1.21. It does not change Home/Main and it does not write health or RPG state.

Regression coverage lives in `tests/health-trail-smoke.js`.

Latest functional checkpoint at implementation time:
- `9a3e30a9b0c02637e5fabf3ae1c55cf9f1821b11`
- full GitHub Actions smoke suite: success
- exact Vercel production deployment: READY

## Goal

Turn the large amount of incoming Fitbit data into a small number of useful next actions without pretending a consumer wearable can diagnose health conditions.

The output should answer questions like:
- Is there a real change versus my own recent baseline?
- Is this simply a consistency gap against one of my chosen missions?
- Is there one low-risk action that makes sense today?
- Is there no meaningful signal at all? (This is a valid result.)

## Signals used in v1

Automated advice currently uses only:
- sleep minutes;
- HRV;
- resting heart rate;
- steps.

SpO2, breathing rate and temperature are deliberately **not** automatically interpreted as diagnoses or alarms in v1. Those wearable measurements can be noisy/context-dependent and are higher-risk to overinterpret.

## Evidence rules

### Personal baseline first

HRV/resting-HR/steps baseline comparisons require at least **5 historical values**. Baselines use recent personal history rather than population cut-offs.

### Recovery warning requires agreement

One odd HRV or resting-HR value is not enough.

A recovery-load warning requires both:
- HRV materially below the recent personal median; and
- resting HR materially above the recent personal median.

The wording stays cautious: a possible lighter day / more recovery, not a medical diagnosis.

### Sleep: decline vs consistency are separate

Two distinct states are intentionally separated:

1. `sleep_trend`
   - recent sleep is meaningfully lower than the user's older personal baseline;
   - wording may say sleep has actually declined relative to baseline.

2. `sleep_consistency`
   - recent sleep average is below the app's chosen 7-hour Daily Mission threshold;
   - but is not meaningfully worse than personal baseline;
   - wording explicitly says this is not automatically a sudden deterioration.

This distinction was added after read-only QA against the current Fitbit dataset showed that a sub-7h recent average can be very close to the user's existing baseline. The app must not convert “goal not yet habitual” into “health suddenly worsened.”

### Steps only later in the day

Low steps do not create an inactivity warning in the morning. An activity nudge is eligible only after 18:00 local time and is framed as an optional short-walk / 10k-mission action.

## Output policy

- Maximum 3 insights at once.
- Highest-priority useful action first.
- A positive/stable state can be shown.
- If no useful signal exists, show `Geen duidelijke afwijking` / `Baseline wordt nog opgebouwd` rather than inventing a negative insight.
- Missing signals are omitted; missing data never counts as failure.
- Read-only disclaimer stays visible in the Lab card.
- Persistent unusual wearable patterns plus real symptoms should be escalated to a qualified professional, not diagnosed by Gamenfy.

## Current insight keys

- `recovery_load` — HRV + resting-HR jointly move against personal baseline.
- `recovery_steady` — those two recovery signals do not show a clear warning.
- `sleep_trend` — meaningful recent sleep decline versus older personal baseline.
- `sleep_consistency` — stable/recent sleep remains below the app's 7h mission without a meaningful baseline decline.
- `sleep_short` — latest single sleep entry below 7h when no stronger multi-night insight exists.
- `steps_evening` — optional evening activity nudge.
- `quiet` — enough/partial baseline data but no stronger action.
- `waiting` — no usable Fitbit trend yet.

## Hard boundaries

- Do not put Health Insights on Home without Joey explicitly approving that rollout.
- Do not make medication, diagnosis or urgent-care decisions from these wearable rules.
- Do not interpret a single SpO2 / temperature / breathing-rate value as an alarm.
- Do not use population thresholds where the intent is a personal trend unless the threshold is explicitly a user-selected app goal (for example the 7h / 10k Daily Mission thresholds).
- Do not write back to `health_fitbit` or RPG state from Health Insights.
- Keep the insight engine deterministic/testable. AI-generated health prose is not required for v1 and would add unnecessary unpredictability.

## Possible next iterations (need separate review)

- Trend persistence: require the same multi-signal recovery pattern on more than one day before raising prominence.
- Training context: combine Hevy/training load with recovery signals before suggesting a lighter session.
- Explainability drawer: show exactly which personal baseline days/signals produced an insight.
- Weekly insight summary rather than more daily alerts.
- Carefully designed use of additional wearable fields only after deciding their evidence/UX safety contract.
