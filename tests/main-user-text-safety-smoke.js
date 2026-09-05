/* Main synced free-text rendering safety — ChatGPT (OpenAI) */
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
