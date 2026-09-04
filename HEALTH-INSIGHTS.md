# Gamenfy Health Insights — Lab contract

Implemented and maintained by ChatGPT (OpenAI), 2026-09-04.

## Status

**LIVE IN LAB, READ-ONLY.**

Health Insights is rendered inside the existing Health Trail card by `health-trail.js` v1.28. It does not change Home/Main and it does not write health or RPG state.

Latest verified functional checkpoint:
- `c6d61411c7d85a7ddf0fdd7023b2c1c69c6a380f`;
- GitHub Actions smoke suite: `completed/success` (run 110);
- exact Vercel production deployment: `dpl_GUQqKZDBg8AmXr6T5vnHPkny9TJ8`;
- deployment state: `READY`.

Later documentation-only commits do not replace this functional checkpoint.

Regression coverage currently includes:
- `tests/health-trail-smoke.js` — overall scoring, cautious insight rules, Lab mount and refresh contract;
- `tests/health-trail-baseline-smoke.js` — conservative HRV/resting-HR baseline maturity and recovery source labels;
- `tests/health-trail-refresh-smoke.js` — stable last-good Fitbit snapshot during refresh;
- `tests/health-trail-stale-source-smoke.js` — stale Fitbit source cannot sound current;
- `tests/health-trail-sleep-nuance-smoke.js` — exact 7h mission versus advice-only near-goal nuance;
- `tests/health-trail-calendar-baseline-smoke.js` — real recent calendar windows rather than old/scattered available rows.

## Goal

Turn the large amount of incoming Fitbit data into a small number of useful next actions without pretending a consumer wearable can diagnose health conditions.

The output should answer questions like:
- Is there a real change versus my own recent baseline?
- Is this simply a consistency gap against one of my chosen missions?
- Is there one low-risk action that makes sense today?
- Is the data too old or too thin to support a useful conclusion?
- Is there no meaningful signal at all? (This is a valid result.)

## Signals used in v1

Automated advice currently uses only:
- sleep minutes;
- HRV;
- resting heart rate;
- steps.

SpO2, breathing rate and temperature are deliberately **not** automatically interpreted as diagnoses or alarms in v1. Those wearable measurements can be noisy/context-dependent and are higher-risk to overinterpret.

## Evidence rules

### Real recent personal baseline first

HRV/resting-HR/steps comparisons require at least **5 valid historical values inside the prior real 14-calendar-day window** before a personal median becomes active.

This is intentionally different from simply taking the “last five” or “last fourteen” available rows. If there was a long data/sync gap, old physiology does not become a fake current baseline. With insufficient recent evidence, the relevant component stays neutral instead of manufacturing certainty.

Population cut-offs are not used for these trend comparisons.

### Recovery warning requires agreement

One odd HRV or resting-HR value is not enough.

A `recovery_load` warning requires both:
- HRV materially below the recent personal median; and
- resting HR materially above the recent personal median.

The wording stays cautious: a possible lighter day / more recovery, not a medical diagnosis.

### Source freshness is explicit

Health Trail and Health Insights only treat real `YYYY-MM-DD` Fitbit keys as dated observations. Metadata keys such as `source` or `updated` can never become a fake latest health day.

For visible advice:
- today's Fitbit day may be used and is labeled `bron vandaag`;
- yesterday is allowed as a pre-sync fallback and is labeled `bron gisteren`;
- data older than yesterday produces one neutral `stale_source` state instead of current-sounding recovery/activity advice.

A partial newest Fitbit day is not currently treated as a demonstrated production bug. The ingest fetches metrics independently, so it is technically possible, but recent live rows are complete and the latest audited sync had no metric errors. Do not stack speculative per-signal source selection unless real evidence shows this case affects the UI.

### Sleep: exact mission, nuanced advice

The actual Sleep Daily Mission remains **exactly 420 minutes / 7 hours**. Health Insights never changes whether that Daily Mission is completed.

“Recent sleep” means available sleep observations from the **latest three actual calendar days**, not simply the last three sleep rows found in storage. The older personal sleep baseline is also calendar-bounded to a real recent window.

The advice layer intentionally distinguishes:

1. `sleep_trend`
   - recent sleep is meaningfully lower than the user's older personal baseline;
   - a clear personal decline can still be a watch-state even when the absolute duration is close to 7 hours.

2. `sleep_consistency`
   - recent sleep is meaningfully below the 7-hour mission;
   - but is not sufficiently worse than personal baseline to call it a sudden decline;
   - wording explicitly separates a goal/consistency gap from deterioration.

3. `sleep_near_goal`
   - recent sleep is below 7 hours by at most **15 minutes**;
   - this is a **neutral advice-only buffer**, not mission leniency;
   - copy explicitly states that the mission remains exactly 7 hours and a small gap alone is not a recovery warning.

4. `sleep_short`
   - latest single sleep entry is meaningfully below the 7-hour goal when no stronger multi-night sleep insight exists.

This distinction exists because real read-only QA showed that a sub-7h recent average can be close to, or above, the user's own established baseline. The app must not convert “goal not quite reached” into “health suddenly worsened.”

### Steps only later in the day

Low steps do not create an inactivity warning in the morning. An activity nudge is eligible only after 18:00 local time, only from today's source day, and is framed as an optional short-walk / 10k-mission action.

## Output policy

- Maximum 3 insights at once.
- Highest-priority useful action first.
- A positive/stable state can be shown.
- If no useful signal exists, show `Geen duidelijke afwijking` / `Baseline wordt nog opgebouwd` rather than inventing a negative insight.
- Missing signals are omitted; missing data never counts as failure.
- Old data does not masquerade as current advice.
- Source-day transparency stays visible in insight metadata.
- Read-only disclaimer stays visible in the Lab card.
- Persistent unusual wearable patterns plus real symptoms should be escalated to a qualified professional, not diagnosed by Gamenfy.

## Current insight keys

- `recovery_load` — HRV + resting-HR jointly move against a sufficiently recent personal baseline.
- `recovery_steady` — those two recovery signals do not show a clear warning.
- `sleep_trend` — meaningful recent sleep decline versus older recent personal baseline.
- `sleep_consistency` — sleep remains meaningfully below the app's exact 7h mission without a strong personal-baseline decline.
- `sleep_near_goal` — neutral advice when sleep is within the 15-minute advice band below 7h; mission completion remains unchanged.
- `sleep_short` — latest single sleep entry meaningfully below 7h when no stronger multi-night insight exists.
- `steps_evening` — optional evening activity nudge from today's steps.
- `stale_source` — latest Fitbit date is older than yesterday; no current-sounding action is generated.
- `quiet` — enough/partial baseline data but no stronger action.
- `waiting` — no usable Fitbit trend yet.

## Hard boundaries

- Do not put Health Insights on Home without Joey explicitly approving that rollout.
- Do not change Daily Mission completion thresholds as a side effect of health-advice tuning.
- Do not make medication, diagnosis or urgent-care decisions from these wearable rules.
- Do not interpret a single SpO2 / temperature / breathing-rate value as an alarm.
- Do not use population thresholds where the intent is a personal trend unless the threshold is explicitly a user-selected app goal (for example the 7h / 10k Daily Mission thresholds).
- Do not write back to `health_fitbit` or RPG state from Health Insights.
- Do not manufacture data/history merely to make a verification pass green.
- Keep the insight engine deterministic/testable. AI-generated health prose is not required for v1 and would add unnecessary unpredictability.

## Possible next iterations — separate product review

These are ideas, not permission to change production behavior automatically:

- Trend persistence: require the same multi-signal recovery pattern on more than one day before raising prominence.
- Training context: combine Hevy/training load with recovery signals before suggesting a lighter session.
- Explainability drawer: show exactly which recent personal baseline days/signals produced an insight.
- Weekly insight summary rather than more daily alerts.
- Carefully designed use of additional wearable fields only after deciding their evidence/UX safety contract.
- Per-signal source freshness only if a real partial-day sync case is observed; do not add speculative source-selection complexity pre-emptively.
