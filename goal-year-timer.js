/* ChatGPT (OpenAI), 2026-10-18. Original annual goals discussed 2026-07-18.
   The shared annual horizon does not rewrite individual goal deadlines. */
(function (root) {
  'use strict';
  const START = '2026-07-18', END = '2027-07-18', DAY = 86400000;
  function snapshot(now = new Date()) {
    const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Amsterdam'}).format(now);
    const start = Date.parse(START+'T00:00:00Z'), end = Date.parse(END+'T00:00:00Z');
    const current = Date.parse(today+'T00:00:00Z');
    const elapsed = Math.max(0, Math.min((end-start)/DAY, (current-start)/DAY));
    return {start:START,end:END,remaining:Math.max(0,(end-current)/DAY),elapsed,percent:elapsed/(end-start)*DAY*100,overdue:current>end};
  }
  function render() {
    const host = document.getElementById('goalYearTimer'); if (!host) return;
    const s = snapshot();
    host.innerHTML = '<span class="lg-year-kicker">MIJN JAARDOELEN</span><div class="lg-year-number"><strong>'+s.remaining+'</strong><span>dagen over</span></div><p>18 juli 2026 → 18 juli 2027</p><div class="lg-year-track" role="progressbar" aria-label="Verstreken tijd van mijn doeljaar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(s.percent)+'"><i style="width:'+s.percent+'%"></i></div><p class="lg-year-note">'+(s.overdue?'Je doeljaar is afgelopen. Je doelen en voortgang blijven bewaard.':s.remaining===0?'Vandaag eindigt je doeljaar.':s.elapsed+' dagen verstreken · '+Math.round(s.percent)+'% van je tijd.')+' Dit meet tijd; je doelvoortgang staat hieronder.</p><details><summary>Waar komt deze datum vandaan?</summary><p>Je oorspronkelijke jaardoelen bespraken we op 18 juli 2026. Deze teller loopt één jaar vanaf dat gesprek. Een eigen deadline bij een afzonderlijk doel blijft gelden, ook de eerder besproken geldhorizon van 27 maart 2027.</p></details>';
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {snapshot};
  if (root && typeof document !== 'undefined') {
    root.GamenfyGoalYear = Object.freeze({snapshot,render});
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',render); else render();
    setInterval(render,60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
  }
})(typeof window!=='undefined'?window:null);
