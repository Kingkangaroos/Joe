(function(){
 'use strict';
 const C=window.PianoLabCore,$=id=>document.getElementById(id);
 const songs=[
  {id:'raye',title:'Escapism.',artist:'RAYE & 070 Shake',color:'#51434f',goal:'Voorbereiding: herhaalde patronen en een rustige, onafhankelijke bas. De eigen oefening is geen transcriptie van Escapism.',source:'https://www.musicnotes.com/sheetmusic/escapism/125508'},
  {id:'marina',title:'Primadonna',artist:'MARINA',color:'#554865',goal:'Voorbereiding: gelijkmatige beweging en vloeiende sprongen in je rechterhand. Daarna kun je de echte partij als MIDI laden.',source:'https://www.musicnotes.com/sheetmusic/primadonna/74877'},
  {id:'summer',title:'Hot Girl Summer',artist:'Megan Thee Stallion · Nicki Minaj · Ty Dolla $ign',color:'#6a443c',goal:'Voorbereiding: een herhalend patroon stabiel houden, zodat er ruimte blijft om mee te zingen of te rappen.',source:'https://www.youtube.com/watch?v=FbcLcSY2au4'},
  {id:'mariah',title:'We Belong Together',artist:'Mariah Carey',color:'#3a575c',goal:'Voorbereiding: gebroken akkoorden met een zachte bas. Laad daarna jouw eigen arrangement van de echte ballad.',source:'https://www.musicnotes.com/sheetmusic/we-belong-together/14351'}
 ];
 const sessions=songs.map((s,i)=>({score:C.makeExercise(i),imported:false,fileName:'Eigen technische warming-up',lyrics:'',lrc:[],audioURL:null}));
 let selected=0,context=null,output=null,voices=new Set(),playback=null,practice=null,stream=null,analyser=null,micSource=null,micToken=0,micFrame=0,micLast=0,micCandidate=null,micStable=0,micLatched=null,micQuiet=0,midiAccess=null,midiInput=null,input='screen',micMuteUntil=0,loadToken=0;
 const text=(id,value)=>{$(id).textContent=value;};
 const message=value=>text('coachText',value);
 const time=value=>Math.floor(Math.max(0,value)/60)+':'+String(Math.floor(Math.max(0,value)%60)).padStart(2,'0');
 const session=()=>sessions[selected];
 function setInput(value){input=value;text('inputMode',value==='mic'?'Microfoon':value==='midi'?'MIDI':'Schermklavier');}
 function selectedNotes(all=false){return session().score.notes.filter(n=>all||$('hand').value==='both'||($('hand').value==='left'?n.note<Number($('split').value):n.note>=Number($('split').value)));}
 function bounds(){
  const duration=session().score.duration;if(!$('loop').checked)return {start:0,end:duration};
  const start=Number($('loopStart').value),end=Number($('loopEnd').value);
  if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>duration+.01){text('loopMessage','Kies een geldig fragment binnen '+duration.toFixed(1)+' seconden.');return null;}
  text('loopMessage','');return {start,end:Math.min(end,duration)};
 }
 async function audioContext(){
  if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Deze browser ondersteunt geen Web Audio.');context=new Audio({latencyHint:'interactive'});output=context.createGain();output.gain.value=.3;output.connect(context.destination);}
  if(context.state!=='running')await context.resume();return context;
 }
 function tone(note,duration=.5,velocity=.65,when){
  if(!context||context.state!=='running')return;
  if(voices.size>=32){const first=voices.values().next().value;try{first.osc.stop();}catch{}voices.delete(first);}
  const at=when??context.currentTime,osc=context.createOscillator(),gain=context.createGain();
  const real=new Float32Array(9),imag=new Float32Array([0,1,.28,.13,.08,.05,.03,.02,.01]);
  osc.setPeriodicWave(context.createPeriodicWave(real,imag));osc.frequency.value=C.frequency(note);
  const length=Math.max(.08,Math.min(duration,8)),level=Math.max(.01,Math.min(1,velocity))*.45;
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(level,at+.008);gain.gain.exponentialRampToValueAtTime(Math.max(.002,level*.15),at+length*.8);gain.gain.exponentialRampToValueAtTime(.001,at+length+.12);
  osc.connect(gain);gain.connect(output);const voice={osc,gain};voices.add(voice);osc.onended=()=>{voices.delete(voice);osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+length+.14);
 }
 function silence(){for(const v of voices){try{v.osc.stop();v.osc.disconnect();v.gain.disconnect();}catch{}}voices.clear();}
 function clearKeys(){document.querySelectorAll('.key').forEach(k=>k.classList.remove('expected','played','wrong'));}
 function highlightExpected(){clearKeys();const notes=practice?.judge.expected||[];for(const n of notes)document.querySelector('[data-note="'+n+'"]')?.classList.add('expected');text('expectedNote',notes.length?notes.map(C.noteName).join(' + '):'—');}
 function showNote(note,wrong=false){const key=document.querySelector('[data-note="'+note+'"]');if(key){key.classList.add(wrong?'wrong':'played');setTimeout(()=>{key.classList.remove('wrong','played');},200);}}
 function stats(){text('stepCount',practice?practice.judge.index+' / '+practice.judge.total:'0 / 0');text('wrongCount',practice?String(practice.judge.wrong):'0');highlightExpected();}
 function stopPlayback(){if(playback){cancelAnimationFrame(playback.frame);playback=null;}silence();$('playReference').classList.remove('active');$('singMidi').classList.remove('active');setCursor(0);}
 function stopPractice(){practice=null;$('waitPractice').classList.remove('active');clearKeys();text('expectedNote','—');}
 function stopMic(){micToken++;cancelAnimationFrame(micFrame);if(stream){for(const track of stream.getTracks())track.stop();stream=null;}micSource?.disconnect();micSource=null;analyser=null;micCandidate=null;micStable=0;micLatched=null;micQuiet=0;$('startMic').textContent='Microfoon aan';$('startMic').classList.remove('active');$('inputLevel').style.width='0%';text('inputStatus','Microfoon uit · audio blijft op dit apparaat');if(input==='mic')setInput('screen');}
 function disconnectMidi(){if(midiInput)midiInput.onmidimessage=null;midiInput=null;if(midiAccess)midiAccess.onstatechange=null;midiAccess=null;$('midiDevice').hidden=true;$('connectMidi').textContent='Verbind MIDI';$('connectMidi').classList.remove('active');if(input==='midi')setInput('screen');}
 function stopAll(){loadToken++;stopPlayback();stopPractice();stopMic();disconnectMidi();$('backingAudio').pause();message('Alles gestopt. Start een invoerroute als je verder wilt oefenen.');text('heardNote','Klaar om te luisteren.');}
 function setCursor(position){const line=$('playCursor');if(line){const x=Math.min(1000,Math.max(0,position/session().score.duration*1000));line.setAttribute('x1',x);line.setAttribute('x2',x);}text('timeDisplay',time(position)+' / '+time(session().score.duration));updateLyrics(position);}
 function renderRoll(){
  const notes=selectedNotes(),svg=$('noteRoll'),ns='http://www.w3.org/2000/svg';svg.replaceChildren();
  const range=notes.length?[Math.min(...notes.map(n=>n.note))-1,Math.max(...notes.map(n=>n.note))+1]:[48,84];const span=Math.max(12,range[1]-range[0]);
  function shape(tag,attributes){const el=document.createElementNS(ns,tag);for(const [key,value]of Object.entries(attributes))el.setAttribute(key,value);svg.append(el);return el;}
  for(let i=0;i<9;i++)shape('line',{x1:i*125,x2:i*125,y1:0,y2:220,stroke:'#34394b','stroke-width':1});
  for(let n=range[0];n<=range[1];n++)if(n%12===0){const y=208-(n-range[0])/span*194;shape('line',{x1:0,x2:1000,y1:y,y2:y,stroke:'#34394b','stroke-width':1});}
  for(const n of notes.slice(0,12000))shape('rect',{x:n.start/session().score.duration*1000,y:208-(n.note-range[0])/span*194,width:Math.max(1,n.duration/session().score.duration*1000),height:Math.min(12,180/span),rx:2,fill:n.note<Number($('split').value)?'#e3b6c9':'#bbdfc9',opacity:.85});
  shape('line',{id:'playCursor',x1:0,x2:0,y1:0,y2:220,stroke:'#fff','stroke-width':2});
  text('rollLabel','Notenrol · '+({right:'rechterhand',left:'linkerhand',both:'beide handen'}[$('hand').value])+' · C4-toetsgrens aanpasbaar');setCursor(0);
 }
 async function startPlayback(sing=false){
  const token=++loadToken;stopPlayback();stopPractice();$('backingAudio').pause();stopMic();
  const range=bounds();if(!range)return;const notes=selectedNotes(sing).filter(n=>n.start>=range.start&&n.start<range.end);if(!notes.length){message('Dit fragment bevat geen noten voor deze hand. Kies Beide of een ander fragment.');return;}
  try{await audioContext();if(token!==loadToken)return;}catch(e){message(e.message);return;}
  const rate=Number($('speed').value)/100;
  playback={notes,index:0,anchor:context.currentTime+.08,start:range.start,end:range.end,rate,frame:0};$(sing?'singMidi':'playReference').classList.add('active');
  message(sing?'Zangmodus: MIDI-begeleiding speelt, pianobeoordeling is uit.':'Luistermodus: referentienoten spelen, beoordeling en microfoon staan uit.');
  function tick(){
   const state=playback;if(!state)return;
   const position=state.start+Math.max(0,context.currentTime-state.anchor)*state.rate;
   while(state.index<state.notes.length){const n=state.notes[state.index],at=state.anchor+(n.start-state.start)/state.rate;if(at>context.currentTime+.1)break;tone(n.note,Math.min(n.duration,state.end-n.start)/state.rate,n.velocity,Math.max(context.currentTime,at));state.index++;}
   setCursor(Math.min(position,state.end));
   if(position>=state.end+.05){if($('loop').checked){silence();state.index=0;state.anchor=context.currentTime+.08;}else{stopPlayback();message('Luisteren klaar. Nu zelf? Kies Oefen · wacht op mij.');return;}}
   state.frame=requestAnimationFrame(tick);
  }tick();
 }
 function startPractice(){
  loadToken++;stopPlayback();$('backingAudio').pause();const range=bounds();if(!range)return;
  const groups=C.groupNotes(session().score.notes,$('hand').value,Number($('split').value),input==='mic',range.start,range.end);
  if(!groups.length){message('Geen noten in dit fragment voor deze hand.');return;}
  practice={judge:C.createJudge(groups),groups};$('waitPractice').classList.add('active');stats();setCursor(groups[0].start);
  message(input==='mic'?'Speel de opgelichte noot. Bij een akkoord speel je de noten apart; dit is geen akkoordherkenning.':'Speel de opgelichte noten. De partij wacht totdat alle gevraagde toetsen zijn gespeeld.');
 }
 function receiveNote(note,source){
  if(!Number.isInteger(note)||note<21||note>108)return;
  text('heardNote',C.noteName(note)+(source==='mic'?' · geschat':''));let wrong=false;
  if(practice){const result=practice.judge.input(note);wrong=result.kind==='wrong';
   if(wrong)message('Je speelde '+C.noteName(note)+'. Probeer '+result.expected.map(C.noteName).join(' + ')+'.');
   else if(result.kind==='correct'){message(result.done?'Fragment afgerond. Goed gedaan. Probeer het nog eens of kies een ander fragment.':'Goed. Volgende: '+practice.judge.expected.map(C.noteName).join(' + ')+'.');}
   else if(result.kind==='partial')message('Die noot is goed. Maak het akkoord af.');
   stats();if(practice.groups[practice.judge.index])setCursor(practice.groups[practice.judge.index].start);
   if(result.done){$('waitPractice').classList.remove('active');if($('loop').checked){practice={judge:C.createJudge(practice.groups),groups:practice.groups};stats();$('waitPractice').classList.add('active');}}
  }showNote(note,wrong);
 }
 async function startMicrophone(){
  if(stream){stopPractice();stopMic();return;}
  if(!navigator.mediaDevices?.getUserMedia){message('Microfoon is hier niet beschikbaar. Open de proef direct via HTTPS in Safari of Chrome.');return;}
  loadToken++;disconnectMidi();stopPlayback();stopPractice();$('backingAudio').pause();const token=++micToken;
  $('startMic').disabled=true;text('inputStatus','Wachten op jouw microfoontoestemming…');
  try{
   await audioContext();if(token!==micToken)return;const acquired=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:1},video:false});
   if(token!==micToken){acquired.getTracks().forEach(t=>t.stop());return;}
   stream=acquired;micSource=context.createMediaStreamSource(stream);analyser=context.createAnalyser();analyser.fftSize=4096;micSource.connect(analyser);
   for(const track of stream.getAudioTracks())track.onended=()=>{if(stream){stopPractice();stopMic();message('Microfoonverbinding gestopt. Je kunt hem opnieuw aanzetten.');}};
   setInput('mic');$('startMic').textContent='Microfoon uit';$('startMic').classList.add('active');text('inputStatus','Live microfoon · alleen lokale analyse · geen opname');message('Speel één losse noot, laat los, en speel opnieuw. Gebruik Oefen om de referentie te volgen.');
   const samples=new Float32Array(analyser.fftSize);micLast=0;
   function listen(now){
    if(!analyser||token!==micToken)return;micFrame=requestAnimationFrame(listen);if(now-micLast<90)return;micLast=now;
    analyser.getFloatTimeDomainData(samples);let rms=0;for(const x of samples)rms+=x*x;rms=Math.sqrt(rms/samples.length);$('inputLevel').style.width=Math.min(100,rms*450)+'%';
    if(context.currentTime<micMuteUntil)return;
    const pitch=C.detectPitch(samples,context.sampleRate);
    if(!pitch){micStable=0;micCandidate=null;micQuiet++;if(micQuiet>=2)micLatched=null;if(rms>.01)text('heardNote','Toon onduidelijk · speel één noot');return;}
    micQuiet=0;text('heardNote',C.noteName(pitch.note)+' · '+Math.round(pitch.cents)+' cent · geschat');
    if(micCandidate===pitch.note)micStable++;else {micCandidate=pitch.note;micStable=1;}
    if(micStable>=2&&micLatched!==pitch.note){micLatched=pitch.note;receiveNote(pitch.note,'mic');}
   }micFrame=requestAnimationFrame(listen);
  }catch(e){if(token===micToken){stopMic();message(e.name==='NotAllowedError'?'Geen microfoontoestemming. Je kunt nog met het schermklavier of MIDI oefenen.':'Microfoon kon niet starten. Controleer de ingang en probeer opnieuw.');}}
  finally{$('startMic').disabled=false;}
 }
 function listMidi(){
  const select=$('midiDevice'),previous=select.value;select.replaceChildren();for(const device of midiAccess.inputs.values()){const option=document.createElement('option');option.value=device.id;option.textContent=device.name||'MIDI-keyboard';select.append(option);}
  if([...select.options].some(o=>o.value===previous))select.value=previous;select.hidden=false;
  if(!select.options.length){message('MIDI-toegang is aan, maar er is nog geen keyboard aangesloten. Verbind USB/MIDI.');if(input==='midi'){stopPractice();setInput('screen');}}bindMidi();
 }
 function bindMidi(){
  if(midiInput)midiInput.onmidimessage=null;midiInput=midiAccess?.inputs.get($('midiDevice').value)||null;if(!midiInput)return;
  setInput('midi');text('inputStatus','MIDI-invoer · toetsen lokaal gelezen');midiInput.onmidimessage=event=>{const [status,note,velocity]=event.data;if((status&240)===144&&velocity>0)receiveNote(note,'midi');};
 }
 async function connectMidi(){
  if(midiAccess){stopPractice();disconnectMidi();return;}
  if(!navigator.requestMIDIAccess){message('Deze browser biedt geen Web MIDI aan. Gebruik de microfoon of probeer MIDI via Chrome op je Mac.');return;}
  stopPractice();stopMic();stopPlayback();$('backingAudio').pause();const token=++loadToken;
  try{const access=await navigator.requestMIDIAccess({sysex:false});if(token!==loadToken)return;midiAccess=access;midiAccess.onstatechange=listMidi;listMidi();$('connectMidi').textContent='MIDI loskoppelen';$('connectMidi').classList.add('active');}
  catch(e){message('MIDI-toegang niet beschikbaar of niet toegestaan. Je kunt de microfoon of het schermklavier gebruiken.');}
 }
 function updateLyrics(position){const lines=session().lrc;if(!lines.length){text('lyricLine','');return;}let line='';for(const row of lines){if(row.time>position)break;line=row.text;}text('lyricLine',line);}
 function refreshSource(){
  const data=session();text('sourceBadge',data.imported?'JOUW MIDI':'EIGEN WARMING-UP');text('sourceNotice',data.imported?'Je hoort en oefent de noten uit jouw MIDI: '+data.fileName+'. Deze proef verifieert niet of dit bestand overeenkomt met het genoemde liedje.':'Je hoort een eigen technische oefening, niet de instrumental van dit nummer. Laad een passende MIDI of eigen backingtrack voor het echte liedje.');
  text('midiFileInfo',data.fileName+' · '+data.score.notes.length+' noten · alleen deze sessie lokaal');$('loopStart').value=0;$('loopEnd').value=data.score.duration.toFixed(1);$('loopStart').max=data.score.duration;$('loopEnd').max=data.score.duration;renderKeyboard();renderRoll();
 }
 function chooseSong(index){
  stopAll();selected=index;const song=songs[index],data=session();document.querySelectorAll('[data-song]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.song)===index)));
  text('artistName',song.artist);text('songTitle',song.title);text('songGoal',song.goal);$('scoreLink').href=song.source;$('scoreLink').textContent=index===2?'Officiële songreferentie ↗':'Bekijk gelicentieerde bladmuziek ↗';
  $('lyricsText').value=data.lyrics;$('lyricsPanel').hidden=!$('showLyrics').checked;$('backingAudio').removeAttribute('src');$('backingAudio').hidden=!data.audioURL;if(data.audioURL)$('backingAudio').src=data.audioURL;$('backingAudio').load();text('audioStatus',data.audioURL?'Jouw lokale backingtrack is geladen.':'Nog geen backingtrack geladen.');text('stepCount','0 / 0');text('wrongCount','0');refreshSource();message('Kies luisteren, oefenen, of zet een invoerroute aan. De eigen warming-up is meteen speelbaar.');
 }
 for(const [i,song] of songs.entries()){
  const button=document.createElement('button');button.className='songCard';button.dataset.song=i;button.style.setProperty('--song-color',song.color);button.setAttribute('aria-pressed',String(i===0));
  const nr=document.createElement('small');nr.textContent='0'+(i+1)+' / SONGPROJECT';const title=document.createElement('b');title.textContent=song.title;const artist=document.createElement('small');artist.textContent=song.artist;button.append(nr,title,artist);button.onclick=()=>chooseSong(i);$('songGrid').append(button);
 }
 function renderKeyboard(){
  const pitches=session().score.notes.map(n=>n.note),first=Math.max(21,Math.floor(Math.min(48,...pitches)/12)*12),last=Math.min(108,Math.ceil(Math.max(84,...pitches)/12)*12);
  const isBlack=n=>[1,3,6,8,10].includes(n%12);let whites=0;for(let n=first;n<=last;n++)if(!isBlack(n))whites++;
  const inner=document.createElement('div');inner.className='keysInner';inner.style.minWidth=(whites*30)+'px';$('keyboard').replaceChildren(inner);let whiteIndex=0;
  for(let n=first;n<=last;n++){
   const black=isBlack(n),key=document.createElement('button');key.dataset.note=n;key.className='key'+(black?' black':'');key.textContent=black?'':C.noteName(n);key.setAttribute('aria-label',C.noteName(n));
   key.style.left=((black?whiteIndex-.32:whiteIndex)/whites*100)+'%';key.style.width=((black?.6:1)/whites*100)+'%';if(!black)whiteIndex++;
   key.onclick=async()=>{const token=loadToken;try{await audioContext();if(token!==loadToken)return;if(input!=='mic')tone(n,.4);else micMuteUntil=context.currentTime+.7;receiveNote(n,'screen');}catch(e){message(e.message);}};inner.append(key);
  }
 }
 $('playReference').onclick=()=>startPlayback(false);$('singMidi').onclick=()=>startPlayback(true);$('stopAll').onclick=stopAll;
 $('startMic').onclick=startMicrophone;$('connectMidi').onclick=connectMidi;$('midiDevice').onchange=()=>{stopPractice();bindMidi();};$('waitPractice').onclick=startPractice;
 $('freeListen').onclick=()=>{stopPlayback();stopPractice();$('backingAudio').pause();message(input==='screen'?'Vrij spelen via het schermklavier. Zet de microfoon aan om je echte piano te horen.':'Vrij spelen: herkenning staat aan, er wordt niet tegen een partij beoordeeld.');};
 for(const id of ['hand','split'])$(id).onchange=()=>{stopPlayback();stopPractice();renderRoll();message('Partij aangepast. Start de oefening opnieuw als je klaar bent.');};
 $('speed').oninput=()=>{text('speedValue',$('speed').value+'%');if(playback){stopPlayback();message('Snelheid aangepast. Start luisteren opnieuw.');}};
 for(const id of ['loop','loopStart','loopEnd'])$(id).onchange=()=>{stopPlayback();stopPractice();bounds();};
 $('midiFile').onchange=async event=>{
  const file=event.target.files?.[0];if(!file)return;stopPlayback();stopPractice();const owner=selected,token=++loadToken;
  try{if(file.size>2*1024*1024)throw Error('Gebruik een MIDI van maximaal 2 MB.');const score=C.parseMidi(await file.arrayBuffer());if(token!==loadToken||selected!==owner)return;sessions[owner].score=score;sessions[owner].imported=true;sessions[owner].fileName=file.name;refreshSource();message('MIDI geladen. Controleer de juiste hand en het oefenfragment.');}catch(e){message(e.message);}finally{event.target.value='';}
 };
 $('useWarmup').onclick=()=>{loadToken++;stopPlayback();stopPractice();session().score=C.makeExercise(selected);session().imported=false;session().fileName='Eigen technische warming-up';refreshSource();};
 $('audioFile').onchange=event=>{
  const file=event.target.files?.[0];if(!file)return;stopPlayback();stopPractice();stopMic();
  if(file.size>50*1024*1024){text('audioStatus','Gebruik audio van maximaal 50 MB.');return;}
  if(session().audioURL)URL.revokeObjectURL(session().audioURL);session().audioURL=URL.createObjectURL(file);$('backingAudio').src=session().audioURL;$('backingAudio').hidden=false;text('audioStatus',file.name+' · alleen deze sessie lokaal');event.target.value='';
 };
 $('backingAudio').addEventListener('play',()=>{loadToken++;stopPlayback();stopPractice();stopMic();message('Backingtrack speelt. Pianobeoordeling is uit; je kunt meezingen.');});
 $('backingAudio').addEventListener('error',()=>text('audioStatus','Deze audio kon niet afspelen. Probeer MP3, M4A of WAV.'));
 $('backingAudio').addEventListener('timeupdate',()=>updateLyrics($('backingAudio').currentTime));
 $('showLyrics').onchange=()=>{$('lyricsPanel').hidden=!$('showLyrics').checked;};
 $('lyricsText').maxLength=40000;$('lyricsText').oninput=()=>{session().lyrics=$('lyricsText').value;session().lrc=C.parseLrc(session().lyrics);updateLyrics($('backingAudio').paused?0:$('backingAudio').currentTime);};
 $('lyricsFile').onchange=async event=>{const file=event.target.files?.[0];if(!file)return;const owner=selected;if(file.size>100000){message('Gebruik een tekstbestand van maximaal 100 KB.');return;}const words=await file.text();if(owner!==selected)return;$('lyricsText').value=words.slice(0,40000);$('lyricsText').oninput();event.target.value='';};
 $('clearLyrics').onclick=()=>{$('lyricsText').value='';$('lyricsText').oninput();};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
 addEventListener('pagehide',()=>{stopAll();for(const data of sessions)if(data.audioURL)URL.revokeObjectURL(data.audioURL);context?.close();});
 chooseSong(0);
})();
