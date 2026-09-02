/* Potloodscroll browserless smoke test
   Performed-by: ChatGPT (OpenAI)
   Run with: node tests/scroll-site-smoke.js */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'site-klus-scroll.html'), 'utf8');
const lab = fs.readFileSync(path.join(root, 'lab.html'), 'utf8');
const sites = fs.readFileSync(path.join(root, 'sites.html'), 'utf8');

assert.match(html, /id="pencilGuide"/, 'the pencil has a real SVG motion path');
assert.match(html, /class="draft-line"/, 'the blueprint exposes draw-on-scroll paths');
assert.match(html, /getPointAtLength/, 'scroll progress moves the pencil along its path');
assert.match(html, /--build-progress/, 'the drawing transforms into the finished room');
assert.match(html, /prefers-reduced-motion:reduce/, 'reduced motion is supported');
assert.match(html, /@media\(max-width:719px\)/, 'the story has a dedicated phone layout');
assert.match(html, /\.story-copy\{min-height:265px\}/, 'phone copy reserves enough vertical room before the blueprint');
assert.match(html, /@media\(max-width:719px\) and \(max-height:730px\)/, 'short phone screens get a compact composition');
assert.match(html, /data-project-state="before"/, 'the project comparison has a before control');
assert.match(html, /data-project-state="after"/, 'the project comparison has an after control');
assert.match(html, /Demoformulier · er worden geen gegevens verstuurd/, 'the prototype never pretends to submit personal data');
assert.doesNotMatch(lab, /href="site-klus-scroll\.html"/, 'the Lab does not hide this experiment behind a link');
assert.match(sites, /href="site-klus-scroll\.html"/, 'the examples overview links to the experiment');

const scripts = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g));
assert.ok(scripts.length, 'the scroll prototype contains its controller');
scripts.forEach((match, index) => {
  assert.doesNotThrow(() => new Function(match[1]), 'inline script ' + (index + 1) + ' has valid syntax');
});

const style = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
let depth = 0;
for (const character of style) {
  if (character === '{') depth += 1;
  if (character === '}') depth -= 1;
  assert.ok(depth >= 0, 'CSS never closes before it opens');
}
assert.equal(depth, 0, 'CSS braces are balanced');

console.log('Potloodscroll smoke test passed: path drawing, build transition, project toggle, reduced motion and link-free Lab separation are wired.');
