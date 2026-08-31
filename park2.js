/* Park 2.0 compatibility loader + Park 3.0 Lab mount
   Performed-by: ChatGPT (OpenAI)
   Keeps the approved Park 2.0 implementation pinned as rollback and mounts Park 3.0 visibly in Lab.
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

  function mountPark3(){
    var grid=document.querySelector('.chatgpt-lab-grid');
    if(grid&&!grid.querySelector('[data-park3-card]')){
      var card=document.createElement('a');
      card.className='chatgpt-lab-card';
      card.href='#park3Lab';
      card.dataset.park3Card='true';
      card.innerHTML='<span class="chatgpt-lab-icon">🎡</span>'
        +'<span><strong>Park 3.0</strong><small>11 Daily Missions · live evoluties Level 1–10</small></span>'
        +'<em>Nieuw</em>';
      grid.insertBefore(card,grid.firstChild);
    }

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
      +'<span style="min-width:0;flex:1"><strong style="display:block;font:800 14px var(--font-display)">Park 3.0 is live</strong><small style="display:block;margin-top:2px;color:#cfc7ed;font-size:9px;line-height:1.35">Exacte Level 1–10 companion-art · zelfde levels als Today’s Missions</small></span>'
      +'<a href="park3.html" style="flex:0 0 auto;padding:8px 9px;border-radius:10px;background:#fff;color:#17112f;text-decoration:none;font:800 9px var(--font-display)">Open ↗</a>'
      +'</div>'
      +'<iframe title="Park 3.0 Daily Mission Evolution Plaza" src="park3.html?embed=1" loading="eager" style="display:block;width:100%;height:760px;border:0;background:#09071a"></iframe>';

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