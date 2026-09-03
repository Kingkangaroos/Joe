/* Health Trail Lab prototype v1.1 — ChatGPT (OpenAI)
   Read-only: public Daily Mission levels + Fitbit recovery signals.
*/
(function(){
  'use strict';
  var ART_VERSION='1.13';
  var SB_URL='https://ttxjsoahmtennnufgeqx.supabase.co';
  var refreshInFlight=null;

  function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
  function number(value){value=Number(value);return Number.isFinite(value)?value:null;}
  function average(values){return values.length?values.reduce(function(sum,value){return sum+value;},0)/values.length:null;}
  function median(values){
    values=values.filter(function(value){return value!==null;}).sort(function(a,b){return a-b;});
    if(!values.length)return null;
    var middle=Math.floor(values.length/2);
    return values.length%2?values[middle]:(values[middle-1]+values[middle])/2;
  }
  function dateKey(date){date=date||new Date();return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
  function missionScore(defs,habits){
    defs=defs||{};habits=habits||{};
    var keys=Object.keys(defs).filter(function(key){var def=defs[key];return def&&def.isHabit&&def.active!==false&&!def.private;});
    var scores=keys.map(function(key){return number((habits[key]||{}).score);}).filter(function(value){return value!==null;}).map(function(value){return clamp(value,0,10);});
    return {score:average(scores),count:scores.length,total:keys.length};
  }
  function recoveryScore(data,today){
    data=data||{};today=today||dateKey();
    var dates=Object.keys(data).sort(),day=data[today],sourceDate=today;
    if(!day&&dates.length){sourceDate=dates[dates.length-1];day=data[sourceDate];}
    if(!day)return {score:null,components:[],date:null};
    var history=dates.filter(function(key){return key<sourceDate;}).slice(-14).map(function(key){return data[key]||{};});
    var components=[];
    var sleep=number(day.sleepMinutes);
    if(sleep!==null)components.push({key:'sleep',score:clamp((sleep-300)/18,0,10),value:sleep});
    var hrv=number(day.hrvMs),hrvBase=median(history.map(function(item){return number(item.hrvMs);}));
    if(hrv!==null)components.push({key:'hrv',score:hrvBase?clamp(5+((hrv/hrvBase)-1)*20,0,10):5,value:hrv,baseline:hrvBase});
    var rhr=number(day.restingHR),rhrBase=median(history.map(function(item){return number(item.restingHR);}));
    if(rhr!==null)components.push({key:'rhr',score:rhrBase?clamp(5+((rhrBase-rhr)/rhrBase)*25,0,10):5,value:rhr,baseline:rhrBase});
    return {score:average(components.map(function(item){return item.score;})),components:components,date:sourceDate};
  }
  function totalScore(missions,recovery){
    if(missions===null&&recovery===null)return null;
    if(missions===null)return recovery;
    if(recovery===null)return missions;
    return missions*.7+recovery*.3;
  }
  function band(score){
    if(score===null)return {key:'building',label:'Wacht op data',message:'Zodra je missies geladen zijn, begint je trail te leven.'};
    if(score<3)return {key:'critical',label:'Noodstand',message:'Eerst herstellen: pak vandaag één makkelijke missie en bouw vanaf daar.'};
    if(score<5)return {key:'building',label:'Herpakken',message:'Je staat nog niet stil. Eén goede missie trekt de rest van je dag mee.'};
    if(score<7)return {key:'building',label:'Opbouwen',message:'De basis staat. Maak de dag af en schuif richting het sterke deel van de trail.'};
    if(score<9)return {key:'strong',label:'Sterk',message:'Je systeem draait sterk. Hou de lijn vast zonder je herstel te vergeten.'};
    return {key:'king',label:'King mode',message:'Missies en herstel staan allebei hoog. Dit is het tempo dat je wilt beschermen.'};
  }
  function formatScore(value){return value===null?'—':value.toFixed(1);}
  function getHabits(){
    try{if(typeof window.getHabits==='function')return window.getHabits()||{};}catch(e){}
    try{return JSON.parse(localStorage.getItem('rpg_habits_v1'))||{};}catch(e){return {};}
  }
  function render(fitbit){
    var root=document.getElementById('healthTrail');if(!root)return;
    var missions=missionScore(window.RPG_DEFAULT_SKILLS,getHabits());
    var recovery=recoveryScore(fitbit||{},dateKey());
    var total=totalScore(missions.score,recovery.score),state=band(total);
    var visual=total===null?0:clamp(total,0,10),level=Math.round(visual),art=Math.max(1,level);
    root.dataset.band=state.key;
    root.style.setProperty('--ht-progress',(visual*10)+'%');
    root.style.setProperty('--ht-runner',(8+visual*8.4)+'%');
    root.style.setProperty('--ht-speed',(1.25-visual*.055).toFixed(2)+'s');
    document.getElementById('htLevel').textContent=String(level);
    document.getElementById('htRunnerLevel').textContent='LEVEL '+level;
    document.getElementById('htCharacter').src='img/lab/park31/steps/l'+String(art).padStart(2,'0')+'.webp?v='+ART_VERSION;
    document.getElementById('htCharacter').alt='Steps companion at Health Trail level '+level;
    document.getElementById('htTotal').textContent=formatScore(total);
    document.getElementById('htMissions').textContent=formatScore(missions.score);
    document.getElementById('htMissionMeta').textContent=missions.count+' missies geladen';
    document.getElementById('htRecovery').textContent=formatScore(recovery.score);
    document.getElementById('htRecoveryMeta').textContent=recovery.score===null?'Fitbit nog niet geladen':recovery.components.length+' herstelsignalen';
    document.getElementById('htMessage').textContent=state.label+' — '+state.message;
  }
  async function loadFitbit(){
    if(typeof window.gamenfyAuthedFetch!=='function')return null;
    try{
      var response=await window.gamenfyAuthedFetch(SB_URL+'/rest/v1/app_state?key=eq.health_fitbit&select=data');
      if(!response.ok)return null;
      var rows=await response.json();return ((rows[0]||{}).data)||null;
    }catch(e){return null;}
  }
  function refresh(){
    // Coalesce rapid mission/sync events so reconciliation cannot fan out
    // duplicate Fitbit reads while still updating the mission component instantly.
    render(null);
    if(refreshInFlight)return refreshInFlight;
    refreshInFlight=loadFitbit().then(function(fitbit){if(fitbit)render(fitbit);return fitbit;}).finally(function(){refreshInFlight=null;});
    return refreshInFlight;
  }
  function start(){
    if(!document.getElementById('healthTrail'))return;
    refresh();
    window.addEventListener('storage',function(event){if(!event.key||event.key==='rpg_habits_v1'||event.key==='rpg_habitlog_v1')refresh();});
    window.addEventListener('gamenfy:daily-mission-change',refresh);
    window.addEventListener('gamenfy:auto-habits-changed',refresh);
    window.addEventListener('gamenfy:remote-state-applied',refresh);
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh();});
    setInterval(refresh,60000);
  }
  window.GamenfyHealthTrail={missionScore:missionScore,recoveryScore:recoveryScore,totalScore:totalScore,band:band,render:render,refresh:refresh};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();