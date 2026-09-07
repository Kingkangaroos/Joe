/* Project HQ note rescue / resync bridge
   ChatGPT (OpenAI) · 2026-09-07

   A user can have valid Project HQ notes in localStorage while the RPG cloud row
   is stale/missing the note key. Capture the local note payload BEFORE xp.js
   initializes RPG sync. Once sync reports ready, merge the captured notes back
   into whatever the server supplied and re-set the canonical key. Because
   sync.js has already wrapped localStorage by then, this becomes a normal dirty
   CAS write instead of a direct database bypass.
*/
(function () {
  'use strict';
  var NOTE_KEY = 'rpg_project_hq_notes_v1';
  var capturedRaw = null;
  try { capturedRaw = localStorage.getItem(NOTE_KEY); } catch (e) {}
  if (!capturedRaw) return;

  function parse(raw) {
    try {
      var value = JSON.parse(raw || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (e) { return {}; }
  }
  function signature(note) {
    return String(note && note.text || '') + '\u0000' + String(note && note.at || '');
  }
  function mergeNotes(a, b) {
    var out = {}, projects = {};
    Object.keys(a || {}).forEach(function (key) { projects[key] = true; });
    Object.keys(b || {}).forEach(function (key) { projects[key] = true; });
    Object.keys(projects).forEach(function (project) {
      var seen = {}, list = [];
      [a && a[project], b && b[project]].forEach(function (source) {
        (Array.isArray(source) ? source : []).forEach(function (note) {
          if (!note || typeof note !== 'object') return;
          var sig = signature(note);
          if (seen[sig]) return;
          seen[sig] = true;
          list.push({ text: String(note.text || ''), at: String(note.at || '') });
        });
      });
      out[project] = list;
    });
    return out;
  }

  var restored = false;
  function restoreCaptured() {
    if (restored) return;
    var currentRaw = null;
    try { currentRaw = localStorage.getItem(NOTE_KEY); } catch (e) {}
    var merged = mergeNotes(parse(currentRaw), parse(capturedRaw));
    try {
      localStorage.setItem(NOTE_KEY, JSON.stringify(merged));
      restored = true;
      window.dispatchEvent(new Event('gamenfy:project-hq-change'));
    } catch (e) {}
  }

  window.addEventListener('gamenfy:cloud-sync-ready', function (event) {
    if (event && event.detail && event.detail.appKey && event.detail.appKey !== 'rpg') return;
    restoreCaptured();
  });

  // Fallback for older/slow startup paths: only fire after the RPG registry
  // exists so the localStorage write is journaled by sync.js.
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    if (window.__cloudSyncRegistry && window.__cloudSyncRegistry.rpg) {
      clearInterval(timer);
      setTimeout(restoreCaptured, 1200);
    } else if (tries >= 20) clearInterval(timer);
  }, 250);

  window.GamenfyHqNoteRescue = { mergeNotes: mergeNotes, restore: restoreCaptured };
})();
