// Marker for the deployed `fitbit-sync` Supabase Edge Function.
// The real implementation and secrets live in Supabase, not in this repository.
//
// Verified against deployed ACTIVE function v16 on 2026-09-03:
// - Google Health API v4, Europe/Amsterdam.
// - Daily steps/AZM/distance + sleep + RHR/HRV/SpO2/breathing rate -> app_state.health_fitbit.
// - Sync window refreshes the latest 14 calendar days; health_fitbit retains up to 60 dated days.
// - SLEEP DATE CONTRACT: sleepMinutes is assigned to the civil END/wake date
//   (interval.civilEndTime, falling back to endTime + endUtcOffset), not the bedtime/start date.
//   Multiple sleep sessions ending on the same civil day are summed for that wake date.
// - Daily Mission completion thresholds are NOT owned by this ingest function;
//   they are applied by the client reconciler (`autohabit-reconcile.js`).
//
// Historical setup notes: see FITBIT-SETUP.md.
