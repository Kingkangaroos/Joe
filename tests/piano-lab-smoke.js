'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../piano-lab-core.js');
function signal(f,sampleRate=48000){return Float32Array.from({length:4096},(_,i)=>.22*Math.sin(2*Math.PI*f*i/sampleRate)+.055*Math.sin(4*Math.PI*f*i/sampleRate));}
for(const sampleRate of [44100,48000])for(const note of [38,48,60,69,72,84]){
 const pitch=C.detectPitch(signal(C.frequency(note),sampleRate),sampleRate);assert(pitch,'detect '+note);assert.equal(pitch.note,note);assert(Math.abs(pitch.cents)<9,'cent deviation '+note);
}
assert.equal(C.detectPitch(new Float32Array(4096),48000),null);
const noise=Float32Array.from({length:4096},(_,i)=>Math.sin(i*i*1.618)*.2);assert.equal(C.detectPitch(noise,48000),null);
assert.equal(C.noteName(60),'C4');assert.equal(C.noteName(69),'A4');assert.equal(C.frequency(69),440);
const source=[{note:48,start:0},{note:60,start:0},{note:64,start:0},{note:67,start:.5}];
assert.deepEqual(C.groupNotes(source,'right',60,false).map(g=>g.notes),[[60,64],[67]]);
assert.deepEqual(C.groupNotes(source,'both',60,true).map(g=>g.notes),[[48],[60],[64],[67]]);
assert.deepEqual(C.groupNotes(source,'left',60,false).map(g=>g.notes),[[48]]);
const judge=C.createJudge([{start:0,notes:[60,64]},{start:1,notes:[67]}]);
assert.equal(judge.input(62).kind,'wrong');assert.equal(judge.index,0);assert.equal(judge.input(60).kind,'partial');assert.equal(judge.input(60).kind,'held');assert.equal(judge.input(64).kind,'correct');assert.equal(judge.index,1);assert.equal(judge.input(67).done,true);assert.equal(judge.input(67).kind,'finished');assert.equal(judge.hits,3);assert.equal(judge.wrong,1);
assert.deepEqual(C.parseLrc('[00:02.50][00:04.00] user supplied line\n[ar:metadata]\n[00:03.00]next').map(x=>x.time),[2.5,3,4]);
function vlq(n){const bytes=[n&127];while(n>>=7)bytes.unshift((n&127)|128);return bytes;}
function midi(track,format=0){const head=Buffer.from([77,84,104,100,0,0,0,6,0,format,0,1,1,224]);const th=Buffer.from([77,84,114,107,0,0,0,0]);th.writeUInt32BE(track.length,4);const out=Buffer.concat([head,th,Buffer.from(track)]);return out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength);}
const track=[0,255,81,3,15,66,64,0,144,60,100,...vlq(480),128,60,0,0,255,81,3,7,161,32,0,144,64,100,...vlq(480),64,0,0,255,47,0]; // 60 BPM first beat, then 120 BPM; running status note-off.
const parsed=C.parseMidi(midi(track));assert.equal(parsed.notes.length,2);assert.equal(parsed.bpm,60);assert.equal(parsed.notes[0].duration,1);assert.equal(parsed.notes[1].start,1);assert.equal(parsed.notes[1].duration,.5);
const sustain=C.parseMidi(midi([0,144,60,100,0,176,64,127,...vlq(240),128,60,0,...vlq(240),176,64,0,0,255,47,0]));assert.equal(sustain.notes[0].duration,.5);
assert.throws(()=>C.parseMidi(new Uint8Array([1,2,3]).buffer));assert.throws(()=>C.parseMidi(midi(track,2)),/type 0 of 1/);assert.throws(()=>C.parseMidi(midi([0,255,1,127])),/afgebroken/);
for(let i=0;i<4;i++){const ex=C.makeExercise(i);assert(ex.notes.length>32);assert(C.groupNotes(ex.notes,'right').length>20);}
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'piano-lab.html'),'utf8'),ui=fs.readFileSync(path.join(root,'piano-lab.js'),'utf8');
assert(!/fetch\(|MediaRecorder|localStorage|addXP\(|rpg_/.test(ui),'no upload, recording, persistence or XP mutation');
assert(html.includes('geen originele opnames'));assert(ui.includes('echoCancellation:false'));assert(ui.includes("if(token!==micToken){acquired.getTracks().forEach(t=>t.stop());return;}"));
assert(ui.includes("document.addEventListener('visibilitychange'"));assert(ui.includes("sysex:false"));
assert(fs.readFileSync(path.join(root,'lab.html'),'utf8').includes('piano-lab.html'));
assert(fs.readFileSync(path.join(root,'character.html'),'utf8').includes("skillKey==='piano'"));
console.log('PASS Piano Lab: pitch across sample rates, silence/noise, MIDI tempo/running status/sustain/errors, hands/chords/wait judge, LRC, privacy and lifecycle. Real instrument/microphone accuracy remains unverified.');
