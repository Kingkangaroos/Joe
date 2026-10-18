# Mental health workbook scaffold

Requested by Joey on 2026-10-18; implemented by ChatGPT (OpenAI).

Entry points: Projects > Mental health and Skills > Goals > Blijheid > Open mijn persoonlijke werkboek. The deep link is `projects.html#mental-health`.

This is an empty personal workbook scaffold for later conversations, not an assessment or treatment program. It has six reflection/research chapters, a user-defined focus, optional links to existing Journaling/Meditation/Gratitude skills, custom chapters, free notes and a list of questions for the next discussion.

Creation waits for an authenticated Projects baseline and an explicit open request. No new database table, separate notes authority, habit, XP award or inferred mental-health score. It uses the existing `gamenfy_projects_v1` record and the existing owner-scoped Projects sync. Existing House Upgrade and other projects are retained. The workbook has a distinct renderer with no Shopping/Moodboard/health-percentage UI.

Chapter text is saved locally immediately on input through the existing sync path, with a manual save retry. Local success is not a separate cloud acknowledgment. The handoff button only copies the currently selected workbook after the user presses it; there is no automatic sharing or AI request. User-entered notes never belong in repository source or fixtures. Tests use synthetic text only.

Validation: the workbook regression exercises auth/baseline gating, idempotent creation, preserving existing project notes/tasks, immediate note writes, safe text rendering, selected-workbook export and save failure/retry. The existing Projects and Goals smoke tests also pass. Authenticated browser and real-device persistence verification remain pending a signed-in session; no account record was modified to manufacture verification.
