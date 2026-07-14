# Scientific Skills Audit — v9.3 (2026-07-14)

Roadmap item "scientific skills audit" (Joey-approved, no input needed). Method:
automated invariant scan over every ladder + manual review of the measurable
ladders against established progression standards.

## Automated invariants (all 31 ladders, 328 quests)
Checked: duplicate levels (would collide on the `skill:lvl` done-key), levels
outside 1–100, gate coverage (every tier gate ≤ ladder top must have a quest at
or below it — otherwise a permanent level cap), XP monotonicity along the
ladder, and `tierLockInfo` never locking without a claimable gate quest.
**Result after fixes: 0 issues.**

## Manual review of measurable ladders
- **Strength** — benchmarks expressed as bodyweight multiples (bench 1.0×BW at
  the LV10 gate, 1.25×, 1.5×; press 0.5→0.9×BW; row 1.0→1.3×BW; hip thrust 2×BW),
  consistent with common strength-standards tables (novice→intermediate→advanced).
  Deliberately built on Joey's actual six lifts — **no squat/deadlift anywhere**. ✓
- **Calisthenics** — ordering matches accepted skill progressions (negatives →
  first strict pull-up → 5 → 10, wall → free handstand, first muscle-up →
  five, tuck → front lever), in line with Overcoming Gravity / Reddit RR
  progression logic. Multi-year pacing is realistic. ✓
- **Tennis, Reading, Piano** — sensible: match-play gates (first set at LV10),
  volume+retention for reading (incl. month-later recall), roughly graded-
  repertoire pacing for piano. ✓
- **Gym, Focus, Saving, Superiority** — sound structure; only XP dips (below).

## Fixes applied
1. **7 XP dips** (a higher quest paid less than the one before it): saving L7
   150, gym L7 260, gym L15 480, focus L20 550, superiority L18 350 / L33 470 /
   L47 600. Same-level edits only — done-keys untouched; values raised, never
   lowered.
2. **Endurance ladder added (11 quests).** It is a physical-decay skill that had
   zero progression content. Ladder uses universally provable running
   benchmarks: 20-min non-stop → first 5K → sub-30 5K (LV10 gate) → first 10K →
   sub-25 5K → zone-2 hour → sub-55 10K → half marathon → sub-22 5K →
   sub-1:50 half → sub-20 5K or marathon. Gate coverage 10/22/48/74.

## Explicitly left alone
- `no_porn` / `weed_control`: no ladders **by design** (backlog: "intentionally
  omitted for now").
- Existing quest **levels**: never moved — the done-key is `skill:lvl`, moving a
  level would silently re-map old claims onto different quests.
- Habit economy (+15/check, decay −1 score per missed day, physical skills −1
  level per 14 idle days): internally consistent, unchanged.
