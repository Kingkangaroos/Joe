from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Agenda blocks can contain Joey-entered custom labels. They are synced via
# rpg_agenda_v1:* and therefore must be inert text when rendered back into HTML.
old = """      const hint = it.hint ? ` <span class=\"agenda-block-hint\">· ${it.hint}</span>` : '';
      const half = (it.time % 1) ? `<span class=\"agenda-block-half\">:30</span>` : '';
      return `<div class=\"agenda-block${it.done?' done':''}\" style=\"background:${color}\" data-hour=\"${h}\" data-idx=\"${idx}\" onclick=\"toggleAgendaBlock('${key}',${h},${idx},event)\">
        ${half}<span class=\"agenda-block-icon\">${it.icon||'•'}</span>
        <span class=\"agenda-block-text\">${it.label}${hint}</span>
        <span class=\"agenda-block-x\" onclick=\"removeAgendaBlock('${key}',${h},${idx},event)\">×</span>
      </div>`;"""
new = """      const hint = it.hint ? ` <span class=\"agenda-block-hint\">· ${escapeHtml(it.hint)}</span>` : '';
      const half = (it.time % 1) ? `<span class=\"agenda-block-half\">:30</span>` : '';
      return `<div class=\"agenda-block${it.done?' done':''}\" style=\"background:${color}\" data-hour=\"${h}\" data-idx=\"${idx}\" onclick=\"toggleAgendaBlock('${key}',${h},${idx},event)\">
        ${half}<span class=\"agenda-block-icon\">${escapeHtml(it.icon||'•')}</span>
        <span class=\"agenda-block-text\">${escapeHtml(it.label)}${hint}</span>
        <span class=\"agenda-block-x\" onclick=\"removeAgendaBlock('${key}',${h},${idx},event)\">×</span>
      </div>`;"""
assert old in s, 'agenda renderer anchor changed'
s = s.replace(old, new, 1)

# Next Move includes user-authored venture names/step titles and custom move
# titles. Escape all free text before it enters card.innerHTML.
old2 = """  card.innerHTML = rows.map(({ v, nx }) =>
    '<div class=\"nextmove-row\" onclick=\"location.href=\\'character.html#ventures\\'\">' +
      '<div><div class=\"nextmove-venture\">' + v.name + '</div>' +
      '<div class=\"nextmove-title\">' + nx.step.title + '</div>' +
      (nx.step.minutes ? '<div class=\"nextmove-min\" style=\"display:inline-block;margin-top:4px\">~' + nx.step.minutes + ' min</div>' : '') + '</div>' +
      '<button class=\"nextmove-start\" onclick=\"event.stopPropagation();startFocus(\\'' + v.id + '\\',\\'' + nx.step.id + '\\')\">Start</button>' +
    '</div>'
  ).join('') + custom.map(m =>
    '<div class=\"nextmove-row\" onclick=\"if(confirm(\\'Remove this move?\\')) removeCustomMove(\\'' + m.id + '\\')\">' +
      '<div><div class=\"nextmove-venture\">Your move</div>' +
      '<div class=\"nextmove-title\">' + m.title + '</div>' +
      '<div class=\"nextmove-min\" style=\"display:inline-block;margin-top:4px\">~' + m.minutes + ' min</div></div>' +
      '<button class=\"nextmove-start\" onclick=\"event.stopPropagation();startFocusCustom(\\'' + m.id + '\\')\">Start</button>' +
    '</div>'
  ).join('');"""
new2 = """  card.innerHTML = rows.map(({ v, nx }) =>
    '<div class=\"nextmove-row\" onclick=\"location.href=\\'character.html#ventures\\'\">' +
      '<div><div class=\"nextmove-venture\">' + escapeHtml(v.name) + '</div>' +
      '<div class=\"nextmove-title\">' + escapeHtml(nx.step.title) + '</div>' +
      (nx.step.minutes ? '<div class=\"nextmove-min\" style=\"display:inline-block;margin-top:4px\">~' + nx.step.minutes + ' min</div>' : '') + '</div>' +
      '<button class=\"nextmove-start\" onclick=\"event.stopPropagation();startFocus(\\'' + v.id + '\\',\\'' + nx.step.id + '\\')\">Start</button>' +
    '</div>'
  ).join('') + custom.map(m =>
    '<div class=\"nextmove-row\" onclick=\"if(confirm(\\'Remove this move?\\')) removeCustomMove(\\'' + m.id + '\\')\">' +
      '<div><div class=\"nextmove-venture\">Your move</div>' +
      '<div class=\"nextmove-title\">' + escapeHtml(m.title) + '</div>' +
      '<div class=\"nextmove-min\" style=\"display:inline-block;margin-top:4px\">~' + m.minutes + ' min</div></div>' +
      '<button class=\"nextmove-start\" onclick=\"event.stopPropagation();startFocusCustom(\\'' + m.id + '\\')\">Start</button>' +
    '</div>'
  ).join('');"""
assert old2 in s, 'next-move renderer anchor changed'
s = s.replace(old2, new2, 1)

# Focus overlay repeats the same stored user text. Keep visual markup identical,
# but make the strings inert.
old3 = """  ov.innerHTML='<div class=\"focus-inner\">'+
    '<div class=\"focus-kicker\">'+s.ventureName+'</div>'+
    '<div class=\"focus-title\">'+s.title+'</div>'+"""
new3 = """  ov.innerHTML='<div class=\"focus-inner\">'+
    '<div class=\"focus-kicker\">'+escapeHtml(s.ventureName)+'</div>'+
    '<div class=\"focus-title\">'+escapeHtml(s.title)+'</div>'+"""
assert old3 in s, 'focus overlay anchor changed'
s = s.replace(old3, new3, 1)

p.write_text(s, encoding='utf-8')

Path('tests/main-user-text-safety-smoke.js').write_text(r'''/* Main synced free-text rendering safety — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');

assert.match(src,/agenda-block-hint[^`]*`[^`]*\$\{escapeHtml\(it\.hint\)\}/,
  'agenda custom hints must be escaped before innerHTML');
assert.ok(src.includes('${escapeHtml(it.icon||\'•\')}'),
  'agenda icon text must be inert');
assert.ok(src.includes('${escapeHtml(it.label)}${hint}'),
  'agenda custom labels must be escaped before innerHTML');
assert.ok(src.includes("'<div><div class=\"nextmove-venture\">' + escapeHtml(v.name) + '</div>'"),
  'venture names must be escaped in Next Move');
assert.ok(src.includes("'<div class=\"nextmove-title\">' + escapeHtml(nx.step.title) + '</div>'"),
  'venture step titles must be escaped in Next Move');
assert.ok(src.includes("'<div class=\"nextmove-title\">' + escapeHtml(m.title) + '</div>'"),
  'custom Next Move titles must be escaped');
assert.ok(src.includes("'<div class=\"focus-kicker\">'+escapeHtml(s.ventureName)+'</div>'"),
  'focus overlay venture text must be escaped');
assert.ok(src.includes("'<div class=\"focus-title\">'+escapeHtml(s.title)+'</div>'"),
  'focus overlay title must be escaped');
assert.ok(src.includes("'<div class=\"todo-text\">'+escapeHtml(t.text)+'</div>'"),
  'existing To-Do escaping must remain intact');
assert.ok(src.includes("words.map(w=>'<span class=\"grat-tag\">'+escapeHtml(w)+'</span>')"),
  'existing Gratitude escaping must remain intact');

console.log('Main user-text safety smoke: agenda, Next Move, focus, To-Do and Gratitude render stored free text inertly.');
''', encoding='utf-8')
