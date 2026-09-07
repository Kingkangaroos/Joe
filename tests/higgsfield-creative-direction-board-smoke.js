/* Higgsfield Creative Direction Round 01 — ChatGPT (OpenAI), 2026-09-07 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const board=fs.readFileSync('website-ventures-higgsfield-prompt-board.html','utf8');
const line=fs.readFileSync('website-ventures-production-line-v3.html','utf8');
for(const label of ['White Precision','Warm Architectural','Hybrid Precision Luxury','Dark Tech']) assert.ok(board.includes(label),label+' direction exists');
for(const concept of ['Transformation Sculpture','Website as Luxury Product','Material Performance']) assert.ok(board.includes(concept),concept+' hero concept exists');
assert.ok(board.includes('50% HARD STOP'),'credit half-way review gate is explicit');
assert.ok(board.includes('Work + Unlimited verification'),'Work browser unlimited proof test is documented');
assert.ok(board.includes('real experienced European plumbing/service technician'),'technician prompt is concrete');
assert.ok(line.includes('website-ventures-higgsfield-prompt-board.html'),'Production Line v3 links the prompt board');
console.log('Higgsfield creative direction board smoke passed.');
