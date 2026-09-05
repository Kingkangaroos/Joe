from pathlib import Path

p = Path('settings.html')
s = p.read_text(encoding='utf-8')

# Retire hidden legacy time-picker CSS.
css = '''/* ── Notification time picker ────────────────────── */
.notif-time {
  display:flex; align-items:center; gap:8px; margin-top:10px;
}
.notif-time input[type="time"] {
  background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1);
  border-radius:10px; color:var(--t1); font-family:var(--mono);
  font-size:14px; padding:8px 12px; outline:none;
  -webkit-appearance:none;
}
.notif-time input[type="time"]:focus { border-color:rgba(245,200,66,0.4); }
'''
assert css in s, 'legacy notification CSS anchor changed'
s = s.replace(css, '', 1)

# Retire hidden legacy 21:00 picker markup.
html = '''    <div class="notif-time" id="notifTimeRow" style="display:none">
      <span style="font-size:11px;color:var(--t3)">Remind me at</span>
      <input type="time" id="notifTime" value="21:00" onchange="saveNotifTime(this.value)">
      <span style="font-size:11px;color:var(--t3)">local time</span>
    </div>
'''
assert html in s, 'legacy notification markup anchor changed'
s = s.replace(html, '', 1)

# LAST_REMIND is not used by the real push subscription UI anymore. Keep any
# historical synced data inert in the RPG row; merely stop presenting/using it here.
s = s.replace("const LAST_REMIND  = 'rpg_last_reminder';\n", '', 1)

# Stored-quote XSS hardening: never concatenate user/synced quote text into HTML.
old_quotes = '''  quotes.forEach((q, i) => {
    const row = document.createElement('div');
    row.className = 'quote-item';
    row.innerHTML =
      '<div class="quote-text">' + q + '</div>' +
      '<button class="quote-del" onclick="deleteQuote(' + i + ')">×</button>';
    list.appendChild(row);
  });'''
new_quotes = '''  quotes.forEach((q, i) => {
    const row = document.createElement('div');
    row.className = 'quote-item';
    const text = document.createElement('div');
    text.className = 'quote-text';
    text.textContent = String(q || '');
    const del = document.createElement('button');
    del.className = 'quote-del';
    del.type = 'button';
    del.textContent = '×';
    del.addEventListener('click', () => window.deleteQuote(i));
    row.append(text, del);
    list.appendChild(row);
  });'''
assert old_quotes in s, 'quote renderer anchor changed'
s = s.replace(old_quotes, new_quotes, 1)

# updateNotifUI + initNotifUI both carried a permanently-hidden old picker.
# Remove every exact legacy row lookup/hide occurrence, not just the first.
s = s.replace("  const timeRow = document.getElementById('notifTimeRow');\n", '')
s = s.replace("  if (timeRow) timeRow.style.display = 'none';\n", '')

# Retire obsolete saveNotifTime function entirely.
legacy_fn = '''window.saveNotifTime = function(val) {
  const s = loadNotifSettings();
  s.time = val;
  saveNotifSettings(s);
  showToast('✓ Reminder time saved');
};

'''
assert legacy_fn in s, 'legacy saveNotifTime anchor changed'
s = s.replace(legacy_fn, '', 1)

assert 'notifTimeRow' not in s
assert 'saveNotifTime' not in s
assert "const LAST_REMIND" not in s

p.write_text(s, encoding='utf-8')

# Structural regression: quote text must be textContent and legacy reminder UI stays dead.
t = Path('tests/settings-security-push-legacy-smoke.js')
t.write_text(r'''/* Settings quote safety + legacy reminder retirement — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname,'..','settings.html'),'utf8');

assert.ok(src.includes("text.textContent = String(q || '')"),
  'user/synced quote content must be rendered via textContent');
assert.ok(!src.includes("'<div class=\"quote-text\">' + q"),
  'quote text must never be concatenated into innerHTML');
assert.ok(!src.includes('notifTimeRow'), 'obsolete hidden 21:00 picker must stay retired');
assert.ok(!src.includes('saveNotifTime'), 'obsolete local reminder-time writer must stay retired');
assert.ok(!src.includes("const LAST_REMIND  = 'rpg_last_reminder'"),
  'Settings must not revive the obsolete in-page reminder marker');
assert.ok(src.includes('window.GamenfyPush.enable()'), 'real push enable route must remain active');
assert.ok(src.includes('window.GamenfyPush.disable()'), 'real push disable route must remain active');

console.log('Settings safety smoke: synced quote text is inert text; obsolete 21:00 reminder UI stays retired; real push remains authoritative.');
''', encoding='utf-8')
