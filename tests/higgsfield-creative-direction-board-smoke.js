/* Higgsfield targeted Unlimited queue — ChatGPT (OpenAI), 2026-09-10 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const board=read('website-ventures-higgsfield-prompt-board.html');
const review=read('website-ventures-higgsfield-review.html');
const queue=JSON.parse(read('WEBSITE-VENTURES-HIGGSFIELD-QUEUE.json'));
const archive=JSON.parse(read('WEBSITE-VENTURES-HIGGSFIELD-QUEUE-v3-archive.json'));
const line=JSON.parse(read('WEBSITE-VENTURES-PRODUCTION-LINE-V3.json'));
const workspace=read('ventures-workspace.html');

assert.equal(queue.version,4,'Targeted queue v4 is active');
assert.equal(queue.status.mode,'targeted-unlimited-sprint');
assert.equal(queue.status.nextBatch,null,'No obsolete mandatory next batch remains');
assert.ok(queue.status.historicalQueue.includes('v3-archive'),'Old queue remains archived');
assert.equal(archive.version,3,'Historical Batch 5-11 strategy remains recoverable');
assert.ok(archive.historicalJobs.includes('AG-HERO-FIRE-GLASS-001'),'Old Fire work is preserved as history');
assert.ok(queue.hardRules.some(x=>x.includes('Fire is optional')),'Fire is optional instead of a blocker');
assert.ok(queue.hardRules.some(x=>x.includes('Quality')&&x.includes('output count')),'Queue must favor usable quality over volume');
assert.ok(queue.hardRules.some(x=>x.includes('50%')),'Paid-credit half-way stop remains explicit');
assert.ok(queue.hardRules.some(x=>x.includes('real coded website UI')),'Generated fake website UI may not replace real code');

const names=queue.batches.map(b=>b.name);
assert.ok(names.some(x=>x.includes('Product A')),'Agency Product A finish inputs exist');
assert.ok(names.some(x=>x.includes('Premium Plumbing')),'Plumbing asset work exists');
assert.ok(names.some(x=>x.includes('Architectural Luxury')),'Architectural showcase asset work exists');
assert.ok(names.some(x=>x.includes('Performance')),'Performance showcase asset work exists');
assert.ok(names.some(x=>x.includes('Product / ad motion')),'Product-motion capability work exists');
const jobs=queue.batches.flatMap(b=>b.jobs||[]);
for(const j of jobs){
  assert.ok(j.id&&j.title&&j.purpose&&j.model&&j.aspectRatio&&j.quality&&j.count&&j.balance&&j.prompt&&j.gate,'Every active v4 job is copy-ready and gated: '+(j.id||'?'));
}
assert.ok(jobs.some(j=>j.id==='AG15-HERO-PRODUCT-A'),'Agency hero refinement job exists');
assert.ok(jobs.some(j=>j.id==='PL15-CHAR-MASTER'),'Recurring Plumbing identity lock exists');
assert.ok(jobs.some(j=>j.id==='PL15-HERO-WORK'),'Plumbing working hero exists after identity lock');
assert.ok(jobs.some(j=>j.id==='REN15-HERO'),'Architectural hero exists');
assert.ok(jobs.some(j=>j.id==='PERF15-HERO'),'Performance hero exists');
assert.ok(jobs.some(j=>j.id==='AD15-PRODUCT-MOTION'),'Product-motion proof path exists');
assert.ok(jobs.filter(j=>/MOTION/.test(j.id)).every(j=>j.reference),'Motion work must be reference-gated');
assert.ok(queue.finishGate.steps.some(x=>x.includes('Only then create mobile derivative, motion or higher-resolution master')),'Finish work stays winner-gated');

assert.ok(board.includes('Higgsfield Queue v4'),'Board surfaces the current queue version');
assert.ok(board.includes('Targeted Unlimited sprint'),'Board explains the sprint mode');
assert.ok(board.includes('Copy full setup'),'One-tap full setup copy exists');
assert.ok(board.includes('Copy prompt'),'Prompt-only copy exists');
assert.ok(board.includes('navigator.clipboard.writeText'),'Clipboard implementation exists');
assert.ok(board.includes("DONE_KEY='wv_higgsfield_queue_v4_done'"),'v4 manual progress persists locally');
assert.ok(board.includes('Fire no longer required')||board.includes('Fire is alleen nog'),'Board visibly retires the mandatory Fire gate');
assert.ok(board.includes('quality &gt; quantity'),'Board visibly reinforces curation');
assert.ok(review.includes("const KEY='wv_higgsfield_review_v2'"),'Existing variant review state remains preserved');

assert.equal(line.version,3.3,'Production Line is aligned with the targeted sprint');
assert.equal(line.activeGeneration.nextRequiredBatch,null,'Production Line no longer blocks on old batches');
assert.ok(line.activeGeneration.historicalNote.includes('Fire')&&line.activeGeneration.historicalNote.includes('no longer'),'Production Line retires Fire as a blocker');
assert.ok(workspace.includes('website-ventures-higgsfield-prompt-board.html'),'Ventures links the live targeted queue');
assert.ok(workspace.includes('Targeted Higgsfield Queue'),'Ventures labels the queue correctly');
console.log('Higgsfield targeted Unlimited queue v4 smoke passed.');
