/* Park 2.0 compatibility loader + Park 3.0 read-only Lab mount
   Performed-by: ChatGPT (OpenAI)
   Keeps the approved Park 2.0 and Park 3.0 implementations pinned as rollback/reference.
   Current mission mutations belong to Park 3.1 / canonical Daily Mission controllers.
*/
(function(){
  'use strict';

  var LEGACY='https://cdn.jsdelivr.net/gh/Kingkangaroos/Joe@38d16df06cd5a94ec8de4fb31360f60345189e93/park2.js';

  function loadLegacyPark2(){
    if(document.querySelector('script[data-park2-legacy]'))return;
    var script=document.createElement('script');
    script.src=LEGACY;
    script.async=false;
    script.dataset.park2Legacy='true';
    script.onerror=function(){console.error('[Park 2.0] legacy rollback script failed to load');};
    document.head.appendChild(script);
  }

  // Park 3.0 is intentionally frozen as rollback/reference. Its old action
  // button predates the canonical Walking/Sleep manual-off + XP contracts and
  // must therefore never be allowed to mutate current mission data from Lab.
  // Keep the cards/detail preview interactive, but intercept only the legacy
  // Complete/Undo action at the host boundary. park3.* itself stays untouched.
  function lockPark3Reference(frame){
    if(!frame||frame.dataset.park3ReferenceLocked==='1')return;
    var doc;
    try{doc=frame.contentDocument||frame.contentWindow.document;}catch(e){return;}
    if(!doc)return;
    frame.dataset.park3ReferenceLocked='1';

    function markAction(){
      var btn=doc.getElementById('p3Action');
      if(!btn)return;
      if(btn.textContent!=='Reference only · use Park 3.1')btn.textContent='Reference only · use Park 3.1';
      btn.classList.remove('done');
      btn.setAttribute('aria-disabled','true');
      btn.setAttribute('title','Park 3.0 is frozen rollback/reference. Update Daily Missions in Park 3.1.');
    }
    function blockLegacyMutation(event){
      var target=event&&event.target;
      var btn=target&&target.closest?target.closest('#p3Action'):null;
      if(!btn)return;
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
      markAction();
    }

    doc.addEventListener('click',blockLegacyMutation,true);
    markAction();
    try{
      var observer=new MutationObserver(markAction);
      if(doc.body)observer.observe(doc.body,{childList:true,subtree:true,characterData:true});
      frame.__gamenfyPark3ReferenceObserver=observer;
    }catch(e){}
  }
  window.__gamenfyLockPark3Reference=lockPark3Reference;

  function mountPark3(){
    var park2=document.getElementById('park2');
    if(!park2||document.getElementById('park3Lab'))return;
    var park2Heading=park2.previousElementSibling;
    var heading=document.createElement('div');
    heading.className='sec-head';
    heading.textContent='Park 3.0 · Daily Mission Evolution Plaza';

    var section=document.createElement('section');
    section.id='park3Lab';
    section.style.cssText='margin-bottom:20px;border:1px solid #d8d2ee;border-radius:18px;overflow:hidden;background:#100b2b;box-shadow:0 14px 34px -26px rgba(30,15,80,.65)';
    section.innerHTML='<div style="display:flex;align-items:center;gap:10px;padding:12px 13px;background:linear-gradient(135deg,#19113d,#28165c);color:#fff">'
      +'<span style="font-size:24px">🎡</span>'
      +'<span style="min-width:0;flex:1"><strong style="display:block;font:800 14px var(--font-display)">Park 3.0 reference</strong><small style="display:block;margin-top:2px;color:#cfc7ed;font-size:9px;line-height:1.35">Exacte Level 1–10 companion-art · frozen rollback · mission updates via Park 3.1</small></span>'
      +'<span style="flex:0 0 auto;padding:8px 9px;border:1px solid rgba(255,255,255,.18);border-radius:10px;color:#dcd7ef;font:800 9px var(--font-display)">Read-only</span>'
      +'</div>'
      +'<iframe title="Park 3.0 Daily Mission Evolution Plaza — read-only reference" src="park3.html?embed=1" loading="eager" onload="window.__gamenfyLockPark3Reference(this)" style="display:block;width:100%;height:760px;border:0;background:#09071a"></iframe>';

    var parent=park2.parentNode;
    if(park2Heading&&park2Heading.parentNode===parent){
      parent.insertBefore(heading,park2Heading);
      parent.insertBefore(section,park2Heading);
    }else{
      parent.insertBefore(heading,park2);
      parent.insertBefore(section,park2);
    }
  }

  loadLegacyPark2();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountPark3);
  else mountPark3();
})();