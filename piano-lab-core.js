(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PianoLabCore=api;})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 const names=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
 function noteName(n){return Number.isFinite(n)?names[((Math.round(n)%12)+12)%12]+(Math.floor(Math.round(n)/12)-1):'—';}
 function frequency(n){return 440*Math.pow(2,(n-69)/12);}
 // YIN difference with cumulative mean normalization. A single fundamental,
 // never a claim of polyphonic or vocal-technique analysis.
 function detectPitch(samples,sampleRate){
  let rms=0,mean=0;for(const x of samples)mean+=x;mean/=samples.length;
  const size=Math.min(2048,Math.floor(samples.length/2));
  for(let i=0;i<size;i++)rms+=(samples[i]-mean)**2;rms=Math.sqrt(rms/size);
  if(rms<.008)return null;
  const min=Math.max(2,Math.floor(sampleRate/1200)),max=Math.min(size-1,Math.ceil(sampleRate/65));
  const diff=new Float64Array(max+1);let total=0,tau=-1;
  for(let lag=1;lag<=max;lag++){
   let sum=0;for(let j=0;j<size;j++){const d=samples[j]-samples[j+lag];sum+=d*d;}
   total+=sum;diff[lag]=total>0?sum*lag/total:1;
  }
  for(let i=min;i<max;i++){if(diff[i]<.13){while(i+1<max&&diff[i+1]<diff[i])i++;tau=i;break;}}
  if(tau<0)return null;
  const left=diff[tau-1],mid=diff[tau],right=diff[tau+1],den=2*(2*mid-right-left);
  const refined=tau+(den?(right-left)/den:0),hz=sampleRate/refined;
  const midi=69+12*Math.log2(hz/440),note=Math.round(midi);
  if(note<38||note>86)return null;
  return {hz,midi,note,cents:(midi-note)*100,confidence:1-diff[tau],rms};
 }
 function parseMidi(arrayBuffer){
  const data=new Uint8Array(arrayBuffer);if(data.length>2*1024*1024)throw Error('MIDI is te groot (maximaal 2 MB).');
  let p=0;const ensure=n=>{if(p+n>data.length)throw Error('MIDI-bestand is afgebroken.');};
  const u8=()=>{ensure(1);return data[p++];},u16=()=>u8()*256+u8(),u32=()=>u16()*65536+u16();
  const tag=()=>String.fromCharCode(u8(),u8(),u8(),u8());
  const variable=()=>{let n=0;for(let i=0;i<4;i++){const b=u8();n=n*128+(b&127);if(!(b&128))return n;}throw Error('Ongeldige MIDI-tijdcode.');};
  if(tag()!=='MThd')throw Error('Dit is geen standaard MIDI-bestand.');
  const header=u32();if(header<6)throw Error('Ongeldige MIDI-header.');ensure(header);
  const format=u16(),trackCount=u16(),division=u16();p+=header-6;
  if(format>1||division&0x8000||!division||trackCount>128)throw Error('Gebruik MIDI type 0 of 1 met een gewone beat-tijdlijn.');
  const notes=[],tempos=[{tick:0,tempo:500000,order:-1}];let eventOrder=0;
  for(let track=0;track<trackCount;track++){
   if(tag()!=='MTrk')throw Error('MIDI-track ontbreekt.');const len=u32();ensure(len);const end=p+len;
   let tick=0,running=0,trackName='Track '+(track+1);const active=new Map(),pending=new Map(),pedal=new Set();
   function closeNote(key,at){const list=active.get(key);if(!list?.length)return;const n=list.shift();if(!list.length)active.delete(key);const channel=Number(key.split(':')[0]);if(pedal.has(channel)){if(!pending.has(channel))pending.set(channel,[]);pending.get(channel).push(n);}else notes.push({...n,endTick:Math.max(at,n.tick+1)});}
   while(p<end){
    tick+=variable();if(tick>division*100000)throw Error('MIDI-tijdlijn is te lang.');
    let status=u8();if(status<128){if(!running)throw Error('MIDI running status ontbreekt.');p--;status=running;}
    if(status===255){running=0;const type=u8(),length=variable();ensure(length);if(p+length>end)throw Error('Ongeldig MIDI-meta-event.');
     if(type===81&&length===3){const tempo=data[p]*65536+data[p+1]*256+data[p+2];if(tempo>0)tempos.push({tick,tempo,order:eventOrder++});}
     if(type===3)trackName=new TextDecoder().decode(data.subarray(p,p+length)).slice(0,80);
     p+=length;if(type===47)break;continue;
    }
    if(status===240||status===247){running=0;const length=variable();ensure(length);p+=length;if(p>end)throw Error('Ongeldig MIDI-sysex-event.');continue;}
    if(status<128||status>=240)throw Error('Niet-ondersteund MIDI-event.');running=status;
    const command=status>>4,channel=status&15,a=u8(),b=command===12||command===13?0:u8();
    if(a>127||b>127||p>end)throw Error('Ongeldige MIDI-data.');
    const key=channel+':'+a;
    if(command===9&&b>0&&channel!==9){if(!active.has(key))active.set(key,[]);active.get(key).push({tick,note:a,velocity:b/127,track,trackName,channel});}
    if(command===8||(command===9&&b===0))closeNote(key,tick);
    if(command===11&&a===64){if(b>=64)pedal.add(channel);else {pedal.delete(channel);for(const n of pending.get(channel)||[])notes.push({...n,endTick:Math.max(tick,n.tick+1)});pending.delete(channel);}}
    if(notes.length>12000)throw Error('Te veel noten (maximaal 12.000).');
   }
   for(const list of active.values())for(const n of list)notes.push({...n,endTick:Math.max(tick,n.tick+division/4)});
   for(const list of pending.values())for(const n of list)notes.push({...n,endTick:Math.max(tick,n.tick+division/4)});
   p=end;
  }
  tempos.sort((a,b)=>a.tick-b.tick||a.order-b.order);let sec=0,lastTick=0,lastTempo=500000;
  const map=tempos.map(t=>{sec+=(t.tick-lastTick)/division*lastTempo/1e6;lastTick=t.tick;lastTempo=t.tempo;return {...t,sec};});
  function seconds(tick){let lo=0,hi=map.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(map[mid].tick<=tick)lo=mid;else hi=mid-1;}const t=map[lo];return t.sec+(tick-t.tick)/division*t.tempo/1e6;}
  const result=notes.filter(n=>n.note>=21&&n.note<=108).map(n=>({note:n.note,start:seconds(n.tick),duration:Math.max(.02,seconds(n.endTick)-seconds(n.tick)),velocity:n.velocity,track:n.track,trackName:n.trackName,channel:n.channel})).sort((a,b)=>a.start-b.start||a.note-b.note);
  if(!result.length)throw Error('Geen pianonoten gevonden. Drumkanaal 10 wordt overgeslagen.');
  const duration=Math.max(...result.map(n=>n.start+n.duration));if(duration>1200||result.length>12000)throw Error('Gebruik een MIDI van maximaal 20 minuten en 12.000 noten.');
  return {notes:result,duration,bpm:Math.round(60e6/([ ...map ].reverse().find(t=>t.tick===0)?.tempo||500000)),tempoChanges:map.length};
 }
 function groupNotes(notes,hand='both',split=60,monophonic=false,start=0,end=Infinity){
  const filtered=notes.filter(n=>n.start>=start&&n.start<end&&(hand==='both'||(hand==='left'?n.note<split:n.note>=split))).sort((a,b)=>a.start-b.start||a.note-b.note);
  const groups=[];for(const n of filtered){const previous=groups.at(-1);if(!monophonic&&previous&&Math.abs(previous.start-n.start)<.035){if(!previous.notes.includes(n.note))previous.notes.push(n.note);}else groups.push({start:n.start,notes:[n.note]});}return groups;
 }
 function parseLrc(text){const rows=[];for(const line of text.split(/\r?\n/)){const tags=[...line.matchAll(/\[(\d{1,3}):(\d{2}(?:\.\d+)?)\]/g)];const words=line.replace(/\[[^\]]*\]/g,'').trim();for(const m of tags)if(Number(m[2])<60)rows.push({time:Number(m[1])*60+Number(m[2]),text:words});}return rows.sort((a,b)=>a.time-b.time);}
 function createJudge(groups){let index=0,hits=0,wrong=0;let chord=new Set();return {
  get index(){return index;},get total(){return groups.length;},get hits(){return hits;},get wrong(){return wrong;},get expected(){return groups[index]?.notes||[];},get done(){return index>=groups.length;},
  input(note){if(index>=groups.length)return {done:true,kind:'finished'};if(!groups[index].notes.includes(note)){wrong++;return {kind:'wrong',expected:groups[index].notes.slice()};}if(chord.has(note))return {kind:'held'};chord.add(note);hits++;if(groups[index].notes.every(n=>chord.has(n))){index++;chord=new Set();return {kind:'correct',done:index>=groups.length};}return {kind:'partial'};}
 };}
 // Original technical warmups, not transcriptions or backing tracks of the named songs.
 function makeExercise(index){
  const pitches=[[60,62,64,67,64,62,60,59],[60,64,67,72,67,64,62,67],[60,60,63,65,67,65,63,60],[60,64,67,71,69,67,64,62]][index%4];
  const notes=[];for(let i=0;i<32;i++)notes.push({note:pitches[i%8],start:i*.6,duration:.43,velocity:.65,track:1,trackName:'Eigen warming-up',channel:0});
  for(let i=0;i<8;i++)notes.push({note:[48,45,53,55][i%4],start:i*2.4,duration:2.1,velocity:.45,track:0,trackName:'Bas',channel:0});
  return {notes:notes.sort((a,b)=>a.start-b.start||a.note-b.note),duration:19.2,bpm:100};
 }
 return {noteName,frequency,detectPitch,parseMidi,groupNotes,parseLrc,createJudge,makeExercise};
});
