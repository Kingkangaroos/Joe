# Finance budget and annual goal horizon

Requested by Joey; implemented by ChatGPT (OpenAI), 2026-10-18.

## User behaviour

- Finance has a Budget tab, directly reachable at `finance.html?tab=budget`.
- A budget period runs from the 22nd through the 21st, using Amsterdam calendar days. It is never approximated as four weeks.
- The user enters a discretionary budget after fixed costs/reserves. Existing subscription payments and net worth accounts are not counted or deducted automatically.
- The view shows period budget, registered spend, remaining money, daily allowance and allowance for the next seven days (or fewer at period end). Remaining money is divided over all days left, including today. Allowances round down to whole cents; overspend never becomes a negative spending allowance.
- Budget edits preview the resulting remaining money and allowance before saving. The new amount applies to the current cycle and future cycles. Prior cycle amounts retain their original effective budget.
- Users can record individual dated expenses or update their current spent total. A total update records only the signed difference, preventing double counting. Entries can be removed and the most recent removal restored. Earlier periods accept backdated expenses.
- Rollover is derived from dates. It works after a period away from the app, requires no background timer or scheduled destructive reset, and preserves previous period records. Unrecorded months explicitly say no expenses were booked; they do not assert actual savings.
- No budget or spending is seeded from remembered income figures. No goal, balance or habit XP is changed by budgeting.

## Storage

`nw:budget:settings:v1` holds a budget change schedule with effective cycle start dates and integer cents. Each cycle's ledger has its own `nw:budget:period:YYYY-MM-22` key. Both are inside the existing Finance `nw:` sync prefix, using the existing owner-scoped sync and dirty journal; there is no new backend or second data authority.

Viewing, refreshing and rolling over are read-only. Form writes re-read storage, retain inputs on errors and refresh on existing cloud/storage events without replacing unfinished form inputs. This change does not alter the shared sync protocol.

## Goals

The annual horizon appears above the existing Skills > Goals overview. Retrieved original user messages discussed the annual goals on 18 July 2026. At Joey's request, the shared timer runs to 18 July 2027. On 18 October 2026 it shows 92 elapsed days and 273 days remaining. It measures elapsed time separately from outcome progress. It does not rewrite individual goal deadlines, including the separately discussed 27 March 2027 money horizon. Expired goals and progress are retained.

## Verification and limits

- Salary-cycle arithmetic, Amsterdam midnight, leap years, currency parsing, cents, overspend, budget history and annual timer tests pass.
- Real budget form handlers were exercised in an isolated DOM/storage harness: previews, expense/total updates, escaping, delete/undo, persistence, failed-save input retention, remote refresh, rollover and backdated corrections pass.
- The existing Finance tab contract was updated to permit Budget while retaining all existing tabs.
- Full smoke suite: 125 of 127 pass. Two existing failures (`park31-smoke.js`, `spar-product-pass-smoke.js`) concern Park artwork/script version expectations outside these changed files.
- Visual browser verification could not run: no local browser executable is installed, the browser download failed, and the cloud browser could not reach the local test server. No mobile screenshot or authenticated cloud round-trip is claimed. iPhone/PWA confirmation is outstanding.

Rollback: revert this change. Existing stored budget records stay preserved; unrelated Finance and RPG records are unchanged.
