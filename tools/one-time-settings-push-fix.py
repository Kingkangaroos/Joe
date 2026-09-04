from pathlib import Path
import re

p=Path('settings.html')
s=p.read_text(encoding='utf-8')

anchor='<script src="xp.js?v=10.98" defer></script>'
push='<script src="push.js?v=10.98" defer></script>'
if push not in s:
    if s.count(anchor)!=1:
        raise SystemExit('xp script anchor count != 1')
    s=s.replace(anchor, anchor+'\n'+push, 1)

old="""        <div class="toggle-label">Daily reminder</div>
        <div class="toggle-sub">Get a push notification when it's time for check-in</div>"""
new="""        <div class="toggle-label">Push on this device</div>
        <div class="toggle-sub">Register or remove this device for real Gamenfy push notifications</div>"""
if s.count(old)!=1:
    raise SystemExit('notification copy anchor count != 1')
s=s.replace(old,new,1)

pattern=re.compile(r"function requestNotificationPermission\(\) \{[\s\S]*?\n\}\n\nfunction scheduleReminder\(\) \{[\s\S]*?\n\}\n\nfunction updateNotifUI\(enabled\) \{[\s\S]*?\n\}\n\nwindow\.toggleNotifications = function\(checked\) \{[\s\S]*?\n\};")
if len(pattern.findall(s))!=1:
    raise SystemExit('legacy notification block count != 1')
replacement="""async function requestNotificationPermission() {
  if (!window.GamenfyPush) {
    showToast('Push client is not ready yet', true);
    updateNotifUI(false, 'not-ready');
    return false;
  }
  const result = await window.GamenfyPush.enable();
  if (result && result.ok) {
    const settings = loadNotifSettings();
    settings.enabled = true;
    saveNotifSettings(settings);
    updateNotifUI(true, 'enabled');
    showToast('✓ Push enabled on this device');
    return true;
  }
  const reason = (result && result.reason) || 'failed';
  updateNotifUI(false, reason);
  showToast(reason === 'denied' ? 'Permission denied — check browser settings' : 'Push could not be enabled', true);
  return false;
}

// v2.1: the old in-page clock reminder was not background push. Real delivery
// now belongs to the service-worker subscription + server push job.
function updateNotifUI(enabled, state) {
  const toggle = document.getElementById('notifToggle');
  const timeRow = document.getElementById('notifTimeRow');
  const status  = document.getElementById('notifStatus');
  if (toggle) toggle.checked = !!enabled;
  if (timeRow) timeRow.style.display = 'none';
  if (status) {
    status.textContent = state === 'needs-standalone'
      ? 'Add Gamenfy to your Home Screen to enable iPhone push'
      : state === 'denied'
        ? 'Push permission is blocked in browser settings'
        : enabled
          ? '✓ This device is subscribed to Gamenfy push'
          : 'Push is off on this device';
  }
}

window.toggleNotifications = async function(checked) {
  const toggle = document.getElementById('notifToggle');
  if (toggle) toggle.disabled = true;
  try {
    if (checked) {
      await requestNotificationPermission();
      return;
    }
    if (!window.GamenfyPush || !window.GamenfyPush.disable) {
      updateNotifUI(true, 'not-ready');
      showToast('Push client is not ready yet', true);
      return;
    }
    const result = await window.GamenfyPush.disable();
    if (!result || !result.ok) {
      updateNotifUI(true, (result && result.reason) || 'failed');
      showToast('Could not remove this device from push', true);
      return;
    }
    const settings = loadNotifSettings();
    settings.enabled = false;
    saveNotifSettings(settings);
    updateNotifUI(false, 'ready');
    showToast('Push disabled on this device');
  } finally {
    if (toggle) toggle.disabled = false;
  }
};"""
s=pattern.sub(replacement,s,count=1)

pattern2=re.compile(r"function initNotifUI\(\) \{[\s\S]*?\n\}")
if len(pattern2.findall(s))!=1:
    raise SystemExit('initNotifUI block count != 1')
replacement2="""async function initNotifUI() {
  const timeRow = document.getElementById('notifTimeRow');
  if (timeRow) timeRow.style.display = 'none';
  if (!window.GamenfyPush) { updateNotifUI(false, 'not-ready'); return; }
  try {
    const state = await window.GamenfyPush.status();
    const enabled = state === 'enabled';
    updateNotifUI(enabled, state);
    const settings = loadNotifSettings();
    if (settings.enabled !== enabled) {
      settings.enabled = enabled;
      saveNotifSettings(settings);
    }
  } catch (e) {
    updateNotifUI(false, 'failed');
  }
}"""
s=pattern2.sub(replacement2,s,count=1)

if 'scheduleReminder()' in s:
    raise SystemExit('legacy scheduleReminder still referenced')
if 'window.GamenfyPush.enable()' not in s or 'window.GamenfyPush.disable()' not in s:
    raise SystemExit('real push client not wired')

p.write_text(s,encoding='utf-8')
