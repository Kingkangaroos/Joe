/* Visible product sprint — ChatGPT (OpenAI), updated 2026-09-10 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

const finance=read('finance.html');
assert.ok(finance.includes('data-tab="ventures"'));
assert.ok(finance.includes('ventures-workspace.html?embed=1'));
assert.ok(!finance.includes('<button class="bot-tab" data-tab="portfolio">'),'Portfolio is parked, not a visible Finance tab');
assert.ok(finance.includes("['net','subs','wish','ventures','debts']"));

const workspace=read('ventures-workspace.html');
assert.ok(workspace.includes('data-gamenfy-scope="personal"'));
assert.ok(workspace.includes('Project Headquarters')||workspace.includes('Headquarters'),'Project Headquarters remains the durable product source entry');
assert.ok(workspace.includes('Productielijn'),'Visual production remains a first-class Ventures space');
assert.ok(workspace.includes('website-ventures-ops.html'));
assert.ok(workspace.includes('website-ventures-higgsfield-review.html'));
assert.ok(workspace.includes('website-ventures-selected-assets.html'));
assert.ok(workspace.includes('website-ventures-higgsfield-prompt-board.html'),'Targeted generation queue is reachable');
assert.ok(workspace.includes("rpg_venture_notes_v1"));
assert.ok(workspace.includes('P0 · Mijn eigen website · v1.5'),'Current Agency v1.5 remains visibly P0');

const character=read('character.html');
const toolbar=character.slice(character.indexOf('<div class="skills-toolbar"'),character.indexOf('<!-- SKILLS VIEW -->'));
assert.ok(toolbar.includes('⚔️ Skills')&&toolbar.includes('🎯 Goals'));
assert.ok(!toolbar.includes('Ventures')&&!toolbar.includes('Lab')&&!toolbar.includes('HQ'));
assert.ok(character.includes('await window.gamenfyAuthReady'));
assert.ok(character.includes('if(fitbitReadSucceeded) hmData = out'));
assert.ok(!character.includes('Fitbit koppelen is tijdelijk gepauzeerd tijdens de accountbeveiliging'));

const home=read('index.html');
assert.ok(home.includes('id="dayArcCard" style="display:none"'));
assert.ok(home.includes('id="checkinWrap" style="display:none!important" data-retired="true"'));
assert.ok(home.includes('id="weeklyWrap" style="display:none!important" data-retired="true"'));
assert.ok(home.includes('privacy=all'));
assert.ok(home.includes('gamenfy:park31-height'));
assert.ok(home.includes('id="gratitudeHomeCard"'));

const park=read('park31.js');
assert.ok(park.includes('function missionCopy(mission)'));
assert.ok(park.includes("type:'gamenfy:park31-height'"));
assert.ok(park.includes("privateKeys:PRIVATE_MISSIONS"));

const routes=read('routes.html');
assert.ok(routes.includes('rtBookTap()'));
assert.ok(routes.includes('rtBookViewer'));
assert.ok(routes.includes('const max = 1200'));

const jarvis=read('jarvis.html');
assert.ok(jarvis.includes('🧪 Lab'));
assert.ok(jarvis.includes('🗂 Headquarters'));

const reconcile=read('autohabit-reconcile.js');
assert.ok(reconcile.includes('function stableJson(value)'));
assert.ok(reconcile.includes("gamenfy:cloud-sync-ready"));
assert.ok(reconcile.includes('baselineRetryCount < 8'));
assert.ok(!reconcile.includes("method: 'POST'"),'reconciler still must not direct-write cloud app_state');
console.log('visible product sprint smoke passed');
