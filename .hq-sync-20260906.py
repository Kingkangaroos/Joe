from pathlib import Path
import json
import re

hq = Path("PROJECT-HQ.md")
s = hq.read_text()
s = re.sub(r"Last refreshed: .*", "Last refreshed: 2026-09-06 by ChatGPT (OpenAI)", s, count=1)

new_now = """## NOW

1. **Installed-iPhone Device QA pass** — open `iPhone Device QA` from the normal Lab inside the installed Gamenfy PWA. Capture standalone mode, safe-area, Visual Viewport and max fixed-bottom drift. In the same pass test Daily Missions 2.0 and Swipe Navigation. Do not patch production bottom navigation or activate the dormant swipe engine before this real-device proof.
2. **Fitbit retrospective natural proof** — live same-owner audit still shows 12 historical qualifying completions missing from canonical history (7 Walking, 5 Sleep), none `manual-off` and none marked XP-paid. Run a normal authenticated Gamenfy session, then re-audit read-only. Never manufacture proof with SQL writes.
3. **Goal/WHY source verification on device** — the live RPG cloud row currently has no `rpg_goals_v1`; the 29 Aug private backup also had no `rpg_goals_v1`, so there is no evidence of a recent Goal-store deletion. Open Goals on Joey's device: if local Goals exist, canonical RPG sync should populate cloud; if local is also empty, enter current Goals deliberately rather than restoring the unrelated legacy June `goals` row.
4. **WHY linking** — once the actual Goal store is present, add `linkedSkills` only where Joey genuinely intends a relationship. Do not infer a competing taxonomy.
5. **Restore Dry Run real-file test** — Phase 1 can validate and preview a real export but still has no apply/write path.
6. **Edge Function secret cutover** — Jarvis and `send-daily-push` require environment-secret creation through a supported secure path before redeploy/rotation. The current connector cannot create Edge Function secrets.
7. **Budgeting owl asset import** — locked direction; native 10-level set still not present. Do not fabricate it.
8. **Meditation native level set** — waiting for Joey's approved art; fallback remains temporary.
9. **Life/dashboard taxonomy** — decide only after real WHY links are visible; preserve the underlying 100-year-plan WHY even if old labels change.

## COMPLETED THIS PASS"""
s, n = re.subn(r"## NOW\n.*?\n## COMPLETED THIS PASS", new_now, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit("HQ NOW block not found")

anchor = "- [x] WHY release merged to `main` as `849c119f481f53c0dd477ddad80d96a00e2263b0`; production deployment `dpl_3hUiKkptRddroLxnjBeyT7Un2LxR` verified READY."
additions = """
- [x] **Swipe Navigation Lab** shipped read-only with vertical-first axis lock and interaction exclusions; the reusable cross-page engine exists but remains dormant.
- [x] **WHY Link Audit** shipped read-only; it scores local active Goals on WHY, deadline and explicit skill links without inventing mappings.
- [x] **Restore Dry Run Phase 1** shipped read-only with local backup validation and merge/overwrite preview; there is no apply path.
- [x] Fitbit reconciliation audit hardened to pair `health_fitbit` + `rpg` by the same owner; live audit reconfirmed 12 pending qualified historical completions.
- [x] Edge Function security audit + durable cutover contract shipped; repo regression guards reject server credential/owner literals.
- [x] **iPhone Device QA Lab** shipped read-only in normal Lab: installed-PWA detection, safe-area probes, Visual Viewport telemetry, fixed-bottom drift, orientation/background logging and copyable diagnostics.
- [x] Device QA drift zero-baseline corrected and CI-locked: intentional `8px + safe-area-inset-bottom` is subtracted before drift is reported. Product commit `e56dd3eb8b9ba084de90dd3389003e54dc791abc`; production `dpl_81g6BRyafi8ssPpnZes6BPV94XUY` READY."""
if additions.strip() not in s:
    if anchor not in s:
        raise SystemExit("HQ completed anchor missing")
    s = s.replace(anchor, anchor + additions, 1)

why_note = """- **Current data reality (6 Sep 2026):** the live `rpg` cloud row does not currently contain `rpg_goals_v1`. The private 29 Aug backup also did not contain that key. The only separate `goals` cloud row is legacy June data and is not the canonical Goal store. This is therefore not evidence of a recent Goal-store loss and must not trigger an automatic legacy restore.
- Next proof: open the canonical Goals editor on Joey's real device. If current Goals are present locally, let normal RPG sync populate the cloud store and re-audit. If local Goals are empty too, populate current Goals deliberately with Joey rather than guessing from old data.
"""
gratitude_marker = "### Gratitude Board"
if why_note.strip() not in s:
    pos = s.find(gratitude_marker)
    why_pos = s.find("### WHY graph")
    if pos == -1 or why_pos == -1 or pos < why_pos:
        raise SystemExit("HQ WHY/Gratitude markers missing")
    s = s[:pos] + why_note + "\n" + s[pos:]

s = s.replace(
    "- [ ] Natural installed-iPhone verification of Daily Missions 2.0 performance and feel.",
    "- [ ] Run the iPhone Device QA Lab from the installed PWA and capture diagnostics while verifying Daily Missions 2.0 feel."
)
s = s.replace(
    "- [ ] Verify the shipped goal-first WHY layer with Joey's real active Goals; add explicit `linkedSkills` and extend beyond Home/Daily Challenge only where useful.",
    "- [ ] Verify whether the canonical Goals store exists locally on Joey's device; sync it to cloud if present, otherwise enter current Goals deliberately, then add explicit `linkedSkills`."
)
s = s.replace(
    "- [ ] Horizontal swipe navigation architecture across major sections.",
    "- [ ] Test Swipe Navigation Lab on the installed iPhone; activate the dormant cross-page engine only after the gesture feels right."
)
s = s.replace(
    "- [ ] iOS standalone bottom-nav drift reproduction before any architecture patch.",
    "- [ ] Use iPhone Device QA to reproduce/capture standalone bottom-nav drift before any production shell/internal-scroller patch."
)

change = """### 2026-09-06 — device QA, WHY data audit and security continuation
- Shipped read-only iPhone Device QA into normal Lab and corrected its fixed-bottom zero baseline before using it as proof.
- Final functional Device QA code: `e56dd3eb8b9ba084de90dd3389003e54dc791abc`; Vercel production `dpl_81g6BRyafi8ssPpnZes6BPV94XUY` READY; PR smoke run 229 succeeded.
- Live same-owner Fitbit audit still shows 12 pending historical qualifying completions (7 Walking, 5 Sleep); no direct SQL repair was performed.
- Live RPG cloud has no `rpg_goals_v1`; 29 Aug backup also lacked it. Legacy standalone `goals` contains only June-era data and is not a restore source. Next proof is the canonical Goals editor on Joey's device.
- Edge Function security audit confirmed Jarvis / daily-push secret cutover remains blocked until secure environment secrets can be created. Repo now has a cutover contract and literal-secret regression guard.

"""
if change.strip() not in s:
    marker = "## HUMAN CHANGELOG\n\n"
    if marker not in s:
        raise SystemExit("HQ changelog marker missing")
    s = s.replace(marker, marker + change, 1)
hq.write_text(s)

bugs = Path("BUGS-ACTIVE.md")
b = bugs.read_text()
b = re.sub(
    r"Last refreshed: \*\*.*?\*\* by ChatGPT \(OpenAI\)",
    "Last refreshed: **2026-09-06** by ChatGPT (OpenAI)",
    b,
    count=1
)

baseline = """## Current verified production baseline

Latest verified functional head:
- `e56dd3eb8b9ba084de90dd3389003e54dc791abc` — corrected iPhone Device QA fixed-bottom zero baseline; no production navigation behavior changed.
- GitHub smoke suite: **run 229 — completed/success** on the PR merge combination.
- exact Vercel production deployment: `dpl_81g6BRyafi8ssPpnZes6BPV94XUY`.
- deployment state: **READY**, target `production`.

This baseline also contains Daily Missions 2.0, the goal-first WHY foundation, Swipe Navigation Lab + dormant engine, WHY Link Audit, Restore Dry Run, Fitbit audit owner-pairing hardening and Edge Function secret-cutover guard.

Do not confuse older checkpoints with current functional production.

---"""
b, n = re.subn(r"## Current verified production baseline\n.*?\n---", baseline, b, count=1, flags=re.S)
if n != 1:
    raise SystemExit("bugs production baseline block not found")

section5 = """## 5. iOS standalone PWA bottom navigation drift

**Status:** **OPEN — DEVICE-DEPENDENT; OFFICIAL READ-ONLY QA PATH NOW SHIPPED.**

Observed on iOS 26 standalone PWA: fixed bottom navigation can visually drift upward while scrolling.

Use `lab-iphone-device-qa.html` from the **installed Gamenfy PWA** before changing production CSS. The QA page is isolated from Auth/sync/topbar/swipe and measures:
- installed-PWA mode;
- safe-area top/bottom;
- window + Visual Viewport dimensions/offsets;
- fixed-bottom probe actual-vs-expected position and maximum drift;
- orientation/background transitions;
- copyable diagnostics.

The diagnostic zero baseline was corrected in `e56dd3eb8b9ba084de90dd3389003e54dc791abc`: the intentional `8px + safe-area-inset-bottom` offset is not counted as drift.

Do not stack speculative transforms / `!important` patches. Only if the installed-device diagnostic reproduces real drift should we test an iOS-standalone shell/internal-scroller architecture.

---"""
b, n = re.subn(r"## 5\. iOS standalone PWA bottom navigation drift\n.*?\n---", section5, b, count=1, flags=re.S)
if n != 1:
    raise SystemExit("bugs section 5 not found")

whybug = """## 12. Goal / WHY canonical cloud population

**Status:** **OPEN DATA-POPULATION PROOF; NO EVIDENCE OF RECENT GOAL-STORE LOSS.**

Canonical Goal store = `rpg_goals_v1`, which is already included in `RPG_SYNC_KEYS` and is the only Goal source used by the shipped WHY layer.

Read-only cloud audit on 6 Sep 2026:
- current `app_state.key='rpg'` does **not** contain `rpg_goals_v1`;
- private backup `app_state_backup_20260829_phase1` also did **not** contain `rpg_goals_v1`;
- legacy standalone `app_state.key='goals'` only contains June-era keys and is not the canonical Goal schema/source.

Therefore do **not** auto-import the legacy row or call this a recent deletion. Next proof is device-local:
1. open `character.html#goals` on Joey's real installed app;
2. if current Goals are present locally, allow normal RPG sync to populate cloud and re-audit;
3. if local Goals are empty too, enter Joey's current Goals deliberately and then add explicit `linkedSkills` — never infer links or taxonomy automatically.

---

"""
if "## 12. Goal / WHY canonical cloud population" not in b:
    marker = "# Regression-locked / resolved technical classes"
    if marker not in b:
        raise SystemExit("bugs regression marker missing")
    b = b.replace(marker, whybug + marker, 1)
bugs.write_text(b)

state = Path("PROJECT-HQ-STATE.json")
j = json.loads(state.read_text())
done = j.setdefault("completedThisPass", [])
line = "iPhone Device QA zero-baseline corrected: intentional 8px + safe-area offset is excluded before fixed-bottom drift is reported; PR smoke run 229 passed and production is READY"
if line not in done:
    done.append(line)
j["whyGoalsAudit"] = {
    "verifiedAt": "2026-09-06",
    "canonicalKey": "rpg_goals_v1",
    "currentRpgCloudHasCanonicalGoals": False,
    "backup20260829HasCanonicalGoals": False,
    "legacyStandaloneGoalsRowExists": True,
    "legacyStandaloneGoalsRowScope": "June-era data only; not canonical WHY source",
    "evidenceOfRecentCanonicalGoalLoss": False,
    "nextProof": "Open canonical Goals on Joey device. If local Goals exist, allow normal RPG sync and re-audit; if local is empty too, enter current Goals deliberately."
}
rel = j.setdefault("release", {})
rel["iphoneDeviceQaMainSha"] = "e56dd3eb8b9ba084de90dd3389003e54dc791abc"
rel["iphoneDeviceQaBaselineFixMainSha"] = "e56dd3eb8b9ba084de90dd3389003e54dc791abc"
rel["iphoneDeviceQaProductionDeployment"] = "dpl_81g6BRyafi8ssPpnZes6BPV94XUY"
rel["iphoneDeviceQaProductionState"] = "READY"
state.write_text(json.dumps(j, ensure_ascii=False, indent=2) + "\n")
