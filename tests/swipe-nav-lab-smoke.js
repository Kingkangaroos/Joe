/* Swipe Navigation Lab regression guard — ChatGPT (OpenAI), 2026-09-06 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'lab-swipe-nav.html'),'utf8');
const lab=fs.readFileSync(path.join(root,'lab.html'),'utf8');

assert.match(src,/touch-action:pan-y/,'vertical browser scrolling must remain the default gesture owner');
assert.match(src,/H_RATIO=1\.28/,'horizontal intent needs a meaningful axis ratio');
assert.match(src,/COMMIT_PX=72/,'slow swipes require a substantial distance');
assert.match(src,/COMMIT_RATIO=\.18/,'distance threshold also scales with viewport width');
assert.match(src,/FLICK_VELOCITY=\.55/,'intentional quick flicks remain possible');
assert.match(src,/blockedTarget\(event\.target\)/,'interactive controls are excluded from page swiping');
assert.match(src,/input,textarea,select,button,a/,'forms and links must keep native interaction');
assert.match(src,/\[data-swipe-exempt\]/,'nested horizontal surfaces can opt out');
assert.match(src,/\.hscroll/,'horizontal carousels are protected from the parent navigator');
assert.match(src,/event\.preventDefault\(\);[\s\S]*var drag=dx/,'default touch behavior is cancelled only after horizontal lock');
assert.match(src,/if\(gesture\.axis==='y'\)return/,'vertical lock exits without hijacking scrolling');
assert.match(src,/index===0&&dx>0/,'left boundary has rubber-band resistance');
assert.match(src,/index===slides\.length-1&&dx<0/,'right boundary has rubber-band resistance');
assert.match(src,/data-index="0"[\s\S]*data-index="4"/,'all five current major bottom tabs are represented');
assert.match(src,/Main[\s\S]*Body[\s\S]*Skills[\s\S]*Finance[\s\S]*Jarvis/,'prototype mirrors current topbar.js navigation order');
assert.doesNotMatch(src,/localStorage\.setItem|supabase|fetch\(/,'Lab prototype must remain read-only and disconnected from user data');
assert.match(lab,/href="lab-swipe-nav\.html"/,'normal ChatGPT Lab must expose the Swipe Navigation prototype');
console.log('Swipe Navigation Lab smoke: vertical-first axis lock, control safety, nested horizontal opt-out, boundaries and five-tab parity are guarded.');
