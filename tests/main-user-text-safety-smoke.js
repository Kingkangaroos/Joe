/* Main synced free-text rendering safety — ChatGPT (OpenAI) */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');

assert.ok(src.includes('const hint = it.hint ? ` <span class="agenda-block-hint">· ${escapeHtml(it.hint)}</span>` : \'\';'),
  'agenda custom hints must be escaped before innerHTML');
assert.ok(src.includes('${escapeHtml(it.icon||\'•\')}'),
  'agenda icon text must be inert');
assert.ok(src.includes('${escapeHtml(it.label)}${hint}'),
  'agenda custom labels must be escaped before innerHTML');
assert.ok(!src.includes('${it.label}${hint}'),
  'raw stored agenda labels must never return to an innerHTML template');
assert.ok(src.includes("'<div><div class=\"nextmove-venture\">' + escapeHtml(v.name) + '</div>'"),
  'venture names must be escaped in Next Move');
assert.ok(src.includes("'<div class=\"nextmove-title\">' + escapeHtml(nx.step.title) + '</div>'"),
  'venture step titles must be escaped in Next Move');
assert.ok(src.includes("'<div class=\"nextmove-title\">' + escapeHtml(m.title) + '</div>'"),
  'custom Next Move titles must be escaped');
assert.ok(!src.includes("'<div class=\"nextmove-title\">' + m.title + '</div>'"),
  'raw custom move titles must not be injected into Main HTML');
assert.ok(src.includes("'<div class=\"focus-kicker\">'+escapeHtml(s.ventureName)+'</div>'"),
  'focus overlay venture text must be escaped');
assert.ok(src.includes("'<div class=\"focus-title\">'+escapeHtml(s.title)+'</div>'"),
  'focus overlay title must be escaped');
assert.ok(!src.includes("'<div class=\"focus-title\">'+s.title+'</div>'"),
  'raw focus titles must not be injected into overlay HTML');
assert.ok(src.includes("'<div class=\"ci-row-title\">' + escapeHtml(nx.step.title) + '</div>'"),
  'check-in venture step titles must be escaped');
assert.ok(src.includes("<div class=\"ci-row-kind\">' + escapeHtml(v.name) + '</div>'"),
  'check-in venture names must be escaped');
assert.ok(!src.includes("<div class=\"ci-row-kind\">' + v.name + '</div>'"),
  'raw venture names must not return to check-in HTML');
assert.ok(src.includes("'<div class=\"ci-row-title\">' + escapeHtml(m.label) + '</div>'"),
  'check-in mission labels must be inert text');
assert.ok(src.includes("'<div class=\"ci-row-why\">' + escapeHtml(whyShort) + '</div>'"),
  'check-in mission why copy must be inert text');
assert.ok(src.includes("<div class=\"ci-row-kind\">'+escapeHtml(nx.v.name)+'</div>'"),
  'choice gate venture names must be escaped');
assert.ok(src.includes("<div class=\"ci-row-title\">'+escapeHtml(nx.nx.step.title)+'</div>'"),
  'choice gate venture step titles must be escaped');
assert.ok(!src.includes("<div class=\"ci-row-title\">'+nx.nx.step.title+'</div>'"),
  'raw choice-gate step titles must not be injected');
assert.ok(src.includes("'<div class=\"todo-text\">'+escapeHtml(t.text)+'</div>'"),
  'existing To-Do escaping must remain intact');
assert.ok(src.includes("btn.textContent=d.label||key;"),
  'Gratitude cloud labels must render through textContent, never raw innerHTML');
assert.ok(src.includes("word.textContent=d.label||key;"),
  'Gratitude detail labels must render through textContent, never raw innerHTML');

console.log('Main user-text safety smoke: agenda, Next Move, focus, check-in, choice gate, To-Do and Gratitude render stored free text inertly.');
