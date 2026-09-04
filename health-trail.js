/* Health Trail Lab prototype v1.27 — ChatGPT (OpenAI)
   Read-only: public Daily Mission levels + Fitbit recovery signals + cautious
   personal-baseline insights. This is a wearable trend experiment, not diagnosis.
*/
(function(){
  'use strict';
  var ART_VERSION='1.13';
  var SB_URL='https://ttxjsoahmtennnufgeqx.supabase.co';
  var SLEEP_MISSION_MINUTES=420;
  var SLEEP_ADVICE_MARGIN=15;
  var refreshInFlight=null;
  var lastFitbit=null;

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
  function minutesLabel(value){
    value=Math.max(0,Math.round(number(value)||0));
    var h=Math.floor(value/60),m=value%60;
    return h+'u'+(m?String(m).padStart(2,'0'):'00');
  }
  function signed(value,suffix){
    value=Math.round(value||0);
    return (value>0?'+':'')+value+(suffix||'');
  }
  function previousDayKey(day){
    var p=String(day||'').split('-').map(Number);
    if(p.length!==3||!p[0]||!p[1]||!p[2])return null;
    return dateKey(new Date(p[0],p[1]-1,p[2]-1));
  }
  function recoverySourceLabel(sourceDate,today){
    if(!sourceDate)return 'geen Fitbit-bron';
    today=today||dateKey();
    if(sourceDate===today)return 'vandaag';
    if(sourceDate===previousDayKey(today))return 'gisteren';
    return sourceDate;
  }
  function missionScore(defs,habits){
    defs=defs||{};habits=habits||{};
    var keys=Object.keys(defs).filter(function(key){var def=defs[key];return def&&def.isHabit&&def.active!==false&&!def.private;});
    var scores=keys.map(function(key){return number((habits[key]||{}).score);}).filter(function(value){return value!==null;}).map(function(value){return clamp(value,0,10);});
    return {score:average(scores),count:scores.length,total:keys.length};
  }
  function recoveryScore(data,today){
    data=data||{};today=today||dateKey();
    // Reuse the same real-calendar source contract as Health Insights. Fitbit
    // rows also contain metadata keys such as `source` and `updated`; sorting all
    // object keys can otherwise make `updated` look like the latest "day" during
    // the first minutes after midnight before today's Fitbit row exists.
    var source=sourceFor(data,today),dates=source.dates,day=source.day,sourceDate=source.date;
    if(!day)return {score:null,components:[],date:null};
    var history=dates.filter(function(key){return key<sourceDate;}).slice(-14).map(function(key){return data[key]||{};});
    var components=[];
    var sleep=number(day.sleepMinutes);
    if(sleep!==null)components.push({key:'sleep',score:clamp((sleep-300)/18,0,10),value:sleep});

    // HRV/RHR are useful relative signals, but one or two prior nights are not a
    // meaningful personal baseline. Until five valid historical measurements are
    // available, keep that component neutral at 5 rather than overreacting.
    var hrv=number(day.hrvMs),hrvValues=history.map(function(item){return number(item.hrvMs);}).filter(function(value){return value!==null;});
    var hrvBase=hrvValues.length>=5?median(hrvValues):null;
    if(hrv!==null)components.push({key:'hrv',score:hrvBase?clamp(5+((hrv/hrvBase)-1)*20,0,10):5,value:hrv,baseline:hrvBase});
    var rhr=number(day.restingHR),rhrValues=history.map(function(item){return number(item.restingHR);}).filter(function(value){return value!==null;});
    var rhrBase=rhrValues.length>=5?median(rhrValues):null;
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

  // ── Read-only Fitbit insight engine ────────────────────────────────
  // Principles:
  // - compare to Joey's own recent wearable baseline, not population cut-offs;
  // - require >=5 historical values before calling a personal-baseline change;
  // - a recovery warning requires HRV + resting HR to move together;
  // - sleep uses the exact 7h mission as a goal, but a <=15 minute miss alone is
  //   neutral advice rather than a recovery warning;
  // - steps only nudge later in the day, never label early-day inactivity as failure;
  // - intentionally do not interpret SpO2/breathing/skin-temperature as diagnosis.
  function valuesFor(data,dates,key){
    return dates.map(function(day){return number((data[day]||{})[key]);}).filter(function(value){return value!==null;});
  }
  function sourceFor(data,today){
    var dates=Object.keys(data||{}).filter(function(day){return /^\d{4}-\d{2}-\d{2}$/.test(day)&&day<=today;}).sort();
    var sourceDate=dates.length?dates[dates.length-1]:null;
    return {dates:dates,date:sourceDate,day:sourceDate?(data[sourceDate]||{}):null};
  }
  function healthInsights(data,today,hour){
    data=data||{};today=today||dateKey();
    if(hour===undefined||hour===null)hour=(new Date()).getHours();
    hour=Number(hour);
    var source=sourceFor(data,today);
    if(!source.day)return [{key:'waiting',tone:'neutral',priority:0,title:'Nog geen Fitbit-trend',body:'Zodra er genoeg dagen binnen zijn, vergelijkt dit experiment je herstel met je eigen recente baseline.',meta:'Read-only · geen diagnose'}];

    var day=source.day,sourceDate=source.date,dates=source.dates;
    // Yesterday is still a valid pre-sync fallback (sleep is assigned to wake day),
    // but older Fitbit data must not produce advice that sounds current.
    if(sourceDate<previousDayKey(today)){
      return [{
        key:'stale_source',tone:'neutral',priority:5,
        title:'Fitbit-data is niet actueel',
        body:'De laatste bruikbare wearabledata is van '+sourceDate+'. Ik geef geen herstel- of activiteitsadvies alsof dit over vandaag gaat; na een nieuwere sync komen de normale inzichten terug.',
        meta:'Read-only · bron '+sourceDate+' · geen actuele actie'
      }];
    }
    var historyDates=dates.filter(function(d){return d<sourceDate;}).slice(-14);
    var hrvHistory=valuesFor(data,historyDates,'hrvMs');
    var rhrHistory=valuesFor(data,historyDates,'restingHR');
    var stepsHistory=valuesFor(data,historyDates,'steps');
    var hrvBase=hrvHistory.length>=5?median(hrvHistory):null;
    var rhrBase=rhrHistory.length>=5?median(rhrHistory):null;
    var stepsBase=stepsHistory.length>=5?median(stepsHistory):null;
    var hrv=number(day.hrvMs),rhr=number(day.restingHR),steps=number(day.steps),sleep=number(day.sleepMinutes);
    var insights=[];

    // Require two independent recovery signals to move together before warning.
    if(hrv!==null&&rhr!==null&&hrvBase!==null&&rhrBase!==null){
      var hrvDelta=((hrv/hrvBase)-1)*100;
      var rhrDelta=rhr-rhrBase;
      if(hrvDelta<=-12&&rhrDelta>=4){
        insights.push({
          key:'recovery_load',tone:'watch',priority:100,
          title:'Herstelsignalen wijken samen af',
          body:'HRV staat '+Math.abs(Math.round(hrvDelta))+'% onder je eigen recente mediaan en rusthartslag '+signed(rhrDelta,' bpm')+' erboven. Kies desnoods een lichtere trainingsdag en geef slaap/herstel voorrang.',
          meta:'Twee signalen · vergeleken met jouw eigen baseline'
        });
      }else if(hrvDelta>=-5&&rhrDelta<=1){
        insights.push({
          key:'recovery_steady',tone:'good',priority:20,
          title:'Herstelsignalen zijn stabiel',
          body:'HRV en rusthartslag geven samen geen duidelijke herstelwaarschuwing tegenover je recente baseline. Gebruik hoe je je voelt als laatste check.',
          meta:'HRV + rusthartslag · persoonlijke baseline'
        });
      }
    }

    // Separate a real decline versus personal baseline from merely being under
    // the app's exact 7h mission. The mission remains 420 minutes; the 15-minute
    // margin only prevents a tiny miss from becoming a standalone warning.
    var recentSleepDates=dates.slice(-3);
    var recentSleep=valuesFor(data,recentSleepDates,'sleepMinutes');
    var baselineEnd=recentSleepDates.length?recentSleepDates[0]:sourceDate;
    var sleepBaseDates=dates.filter(function(d){return d<baselineEnd;}).slice(-14);
    var sleepBaseValues=valuesFor(data,sleepBaseDates,'sleepMinutes');
    var sleepBase=sleepBaseValues.length>=5?median(sleepBaseValues):null;
    var recentSleepAvg=recentSleep.length>=2?average(recentSleep):null;
    var sleepAdviceFloor=SLEEP_MISSION_MINUTES-SLEEP_ADVICE_MARGIN;
    var sleepInsightAdded=false;
    if(recentSleepAvg!==null&&sleepBase!==null&&recentSleepAvg<=sleepBase-45){
      sleepInsightAdded=true;
      insights.push({
        key:'sleep_trend',tone:'watch',priority:90,
        title:'Slaap is echt gedaald tegenover je baseline',
        body:'Je recente gemiddelde is '+minutesLabel(recentSleepAvg)+', ongeveer '+Math.round(sleepBase-recentSleepAvg)+' minuten onder je eerdere persoonlijke mediaan van '+minutesLabel(sleepBase)+'. Maak van extra slaapruimte vanavond de simpelste herstelactie.',
        meta:recentSleep.length+' recente nachten · duidelijke daling vs eigen baseline'
      });
    }else if(recentSleepAvg!==null&&recentSleepAvg<sleepAdviceFloor){
      sleepInsightAdded=true;
      insights.push({
        key:'sleep_consistency',tone:'watch',priority:85,
        title:'Je 7u-slaapmissie is nog niet je vaste baseline',
        body:'Je recente gemiddelde is '+minutesLabel(recentSleepAvg)+', duidelijk onder je 7u-missie.'+(sleepBase!==null?' Je eerdere persoonlijke mediaan ligt rond '+minutesLabel(sleepBase)+', dus dit lijkt niet automatisch op een plotselinge verslechtering.':'')+' De winst zit hier vooral in structureel meer slaapruimte maken.',
        meta:recentSleep.length+' recente nachten · mission consistency'
      });
    }else if(recentSleepAvg!==null&&recentSleepAvg<SLEEP_MISSION_MINUTES){
      sleepInsightAdded=true;
      var recentGap=Math.max(1,Math.round(SLEEP_MISSION_MINUTES-recentSleepAvg));
      insights.push({
        key:'sleep_near_goal',tone:'neutral',priority:35,
        title:'Dicht bij je 7u-slaapmissie',
        body:'Je recente gemiddelde is '+minutesLabel(recentSleepAvg)+', nog ongeveer '+recentGap+' minuten onder je 7u-missie.'+(sleepBase!==null?' Je eerdere persoonlijke mediaan ligt rond '+minutesLabel(sleepBase)+'.':'')+' De missie blijft exact 7 uur; deze kleine missiegap is op zichzelf geen herstelwaarschuwing.',
        meta:recentSleep.length+' recente nachten · adviesbuffer '+SLEEP_ADVICE_MARGIN+' min · missie blijft 7u exact'
      });
    }
    if(!sleepInsightAdded&&sleep!==null&&sleep<sleepAdviceFloor){
      insights.push({
        key:'sleep_short',tone:'watch',priority:75,
        title:'Onder je 7u-slaapmissie',
        body:'De laatste geregistreerde slaap is '+minutesLabel(sleep)+'. Plan vanavond wat extra slaapruimte in plaats van dit ene wearable-getal als diagnose te zien.',
        meta:'Mission threshold · niet-medische wearabletrend'
      });
    }else if(!sleepInsightAdded&&sleep!==null&&sleep<SLEEP_MISSION_MINUTES){
      var singleGap=Math.max(1,Math.round(SLEEP_MISSION_MINUTES-sleep));
      insights.push({
        key:'sleep_near_goal',tone:'neutral',priority:35,
        title:'Dicht bij je 7u-slaapmissie',
        body:'De laatste geregistreerde slaap is '+minutesLabel(sleep)+', ongeveer '+singleGap+' minuten onder je 7u-missie. De missie blijft exact 7 uur; deze kleine missiegap is op zichzelf geen herstelwaarschuwing.',
        meta:'Adviesbuffer '+SLEEP_ADVICE_MARGIN+' min · missie blijft 7u exact'
      });
    }

    // Activity nudge only when the day is mature enough to judge progress.
    if(sourceDate===today&&Number.isFinite(hour)&&hour>=18&&steps!==null&&steps<10000){
      var lowVsSelf=stepsBase!==null&&steps<stepsBase*.70;
      if(lowVsSelf||steps<6500){
        insights.push({
          key:'steps_evening',tone:'action',priority:55,
          title:'Nog ruimte voor een korte wandeling',
          body:'Je staat op '+Math.round(steps).toLocaleString('nl-NL')+' stappen. Als het vanavond past, is een korte wandeling de meest directe manier om je 10k-missie nog dichterbij te brengen.',
          meta:stepsBase!==null?'Avondcheck · eigen activiteitsbaseline':'Avondcheck · 10k-missie'
        });
      }
    }

    // If baseline data is still thin, say so instead of inventing certainty.
    var baselineSignals=(hrvBase!==null?1:0)+(rhrBase!==null?1:0)+(sleepBase!==null?1:0)+(stepsBase!==null?1:0);
    if(!insights.length){
      insights.push({
        key:'quiet',tone:'neutral',priority:10,
        title:baselineSignals>=2?'Geen duidelijke afwijking':'Baseline wordt nog opgebouwd',
        body:baselineSignals>=2?'De beschikbare wearabletrends geven nu geen duidelijke actie bovenop je gewone missies. Dat is ook een geldige uitkomst.':'Er zijn nog te weinig consistente historische dagen om HRV, rusthartslag, slaap en activiteit stevig met jezelf te vergelijken.',
        meta:baselineSignals+' persoonlijke baseline-signalen beschikbaar'
      });
    }

    var sourceLabel=recoverySourceLabel(sourceDate,today);
    insights.forEach(function(item){item.meta=(item.meta||'')+' · bron '+sourceLabel;});
    insights.sort(function(a,b){return b.priority-a.priority;});
    return insights.slice(0,3);
  }

  function formatScore(value){return value===null?'—':value.toFixed(1);}
  function getHabits(){
    try{if(typeof window.getHabits==='function')return window.getHabits()||{};}catch(e){}
    try{return JSON.parse(localStorage.getItem('rpg_habits_v1'))||{};}catch(e){return {};}
  }
  function ensureInsightsUi(root){
    var wrap=document.getElementById('htInsights');
    if(wrap)return wrap;
    wrap=document.createElement('div');
    wrap.id='htInsights';
    wrap.className='ht-insights';
    wrap.innerHTML='<div class="ht-insights-head"><span><i></i> Health Insights</span><small>persoonlijke wearabletrends</small></div><div id="htInsightList" class="ht-insight-list"></div><p class="ht-insight-note">Read-only experiment · geen diagnose. Bij aanhoudende afwijkingen én klachten is een zorgprofessional een betere bron dan je wearable.</p>';
    var host=null;
    try{host=root.querySelector('.ht-readout');}catch(e){}
    (host||root).appendChild(wrap);
    return wrap;
  }
  function renderInsights(root,fitbit){
    if(!root)return;
    ensureInsightsUi(root);
    var list=document.getElementById('htInsightList');
    if(!list)return;
    var items=healthInsights(fitbit||{},dateKey(),(new Date()).getHours());
    list.innerHTML=items.map(function(item){
      return '<article class="ht-insight ht-insight--'+item.tone+'" data-insight="'+item.key+'"><div class="ht-insight-dot"></div><div><strong>'+item.title+'</strong><p>'+item.body+'</p><small>'+item.meta+'</small></div></article>';
    }).join('');
  }
  function render(fitbit){
    var root=document.getElementById('healthTrail');if(!root)return;
    var today=dateKey();
    var missions=missionScore(window.RPG_DEFAULT_SKILLS,getHabits());
    var recovery=recoveryScore(fitbit||{},today);
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
    document.getElementById('htRecoveryMeta').textContent=recovery.score===null?'Fitbit nog niet geladen':recovery.components.length+' herstelsignalen · '+recoverySourceLabel(recovery.date,today);
    document.getElementById('htMessage').textContent=state.label+' — '+state.message;
    renderInsights(root,fitbit||{});
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
    // Preserve the last good read-only snapshot while a newer one is fetched.
    // First load still renders honestly without Fitbit; later focus/minute refreshes
    // no longer flash recovery away or temporarily change the combined Trail score.
    render(lastFitbit);
    if(refreshInFlight)return refreshInFlight;
    refreshInFlight=loadFitbit().then(function(fitbit){
      if(fitbit){lastFitbit=fitbit;render(lastFitbit);}
      return fitbit;
    }).finally(function(){refreshInFlight=null;});
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
  window.GamenfyHealthTrail={missionScore:missionScore,recoveryScore:recoveryScore,totalScore:totalScore,band:band,healthInsights:healthInsights,recoverySourceLabel:recoverySourceLabel,render:render,refresh:refresh};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();