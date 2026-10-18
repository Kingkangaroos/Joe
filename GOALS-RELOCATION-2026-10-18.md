# Life goals move to Skills > Goals

Requested by Joey; implemented by ChatGPT (OpenAI), 2026-10-18.

Home's goal compass and weekly/monthly Command Quests move to the existing Goals view in `character.html#goals`. Home no longer mounts or loads those goal panels. Normal Daily Missions, agenda and other Home content remain in place.

The Goals view presents the five original life-plan categories, their near-term direction, outcome, measurement, unresolved timing and collapsible long-term plan. Additional body, business and home projects are separate. Sources are the original life plan in `GAMENFY-HISTORY-ARCHIVE.md`, the recent workout conversation and retrieved October clarifications.

Important distinctions:

- The original financial plan mixed net worth and cash at later ages. These are labeled as historical and not rewritten into cash targets.
- The near-term cash goal is EUR 50,000 self-earned and available. Earlier birthday timing and the later relative one-year statement conflict. New goal templates therefore have no automatic deadline. Explicit previously saved compass deadlines remain intact; its unconfirmed fallback birthday was removed.
- Prior assistant proposals (8/10 happiness, three energizing activities monthly, three new experiences yearly) are labeled unconfirmed. They do not become saved commitments.
- The overview is read-only until the user chooses to create or edit a goal. It does not seed goals or reset progress on page load.
- Goals continue to use `rpg_goals_v1`; the existing compass and weekly/monthly quests keep their existing storage. No new cloud source or account-data migration.
- The editor adds a category and measurement field, allows unresolved deadlines, preserves existing metadata and stable source references, and keeps the editor open if a save fails.

Validation: new life-goals smoke test plus relocation, goal retention, source-of-truth and Command Quest rollover checks pass. The unrelated pre-existing Park asset-version and product-pass tests remain failing. Browser inspection reached the account sign-in wall; authenticated visual verification is pending. No live account records were changed to manufacture test evidence.
