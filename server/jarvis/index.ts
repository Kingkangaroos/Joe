// Deployed Jarvis function source lives in Supabase Edge Functions; this repo file is a durable deployment marker only.
// Current deployed version audited 2026-09-04: v9, owner JWT + explicit owner validation, function calling/action queue/voice/Fitbit context.
//
// IMPORTANT DEPLOY BLOCKERS before the next Jarvis version:
// 1. Move the server-only AI-provider credential out of deployed source into a Supabase Edge Function environment secret; rotate the old credential after verification.
// 2. Correct Jarvis's public Daily Mission membership to the canonical active/non-private 11:
//    budgeting, sleep, nutrition, walking, teeth, household, meditation, gratitude, good_deed, screen_time, cold_shower.
//    grounding is disabled; no_porn + weed_control are private; Tennis/Reading/Finger Whistling are normal skills.
//
// Do not copy any deployed credential values into this repository. See server/jarvis/README.md and BUGS-ACTIVE.md.
