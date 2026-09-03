/* Daily Mission presentation copy — Fitbit-backed missions
   Performed-by: ChatGPT (OpenAI)
   Presentation only: completion thresholds remain owned by autohabit-reconcile.js.
*/
(function () {
  'use strict';

  const copy = {
    sleep: 'Sleep 7+ hours. Fitbit can auto-complete this from 420+ sleep minutes on the day you wake up. A completed day moves the 0–10 level +1; a missed closed day moves it -1.',
    walking: 'Reach 10,000 steps in the calendar day. Fitbit can auto-complete this when the daily total reaches 10k. A completed day moves the 0–10 level +1; a missed closed day moves it -1.'
  };

  window.GAMENFY_DAILY_MISSION_COPY = Object.freeze({ ...copy });

  // xp.js owns the definitions and loads before this file on Daily Windows.
  // Patch copy only; never mutate thresholds, score, XP or completion history here.
  const defs = window.RPG_DEFAULT_SKILLS || {};
  Object.keys(copy).forEach((key) => {
    if (defs[key]) defs[key].habitDesc = copy[key];
  });
})();
