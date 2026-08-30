/* Daily Mission Windows — ChatGPT Option-D companion bridge v11.72
   Replaces only the six explicit art-pending placeholders with ChatGPT-created
   Option-D companion assets. Existing real Park-D PNGs remain untouched.
*/
(function(){
  'use strict';
  var ASSETS={
    nutrition:'img/lab/park2/nutrition.svg',
    teeth:'img/lab/park2/teeth.svg',
    household:'img/lab/park2/household.svg',
    gratitude:'img/lab/park2/gratitude.svg',
    screen_time:'img/lab/park2/screen-time.svg',
    cold_shower:'img/lab/park2/cold-shower.svg'
  };
  function upgrade(scope){
    (scope||document).querySelectorAll('.dw-window[data-mission]').forEach(function(room){
      var key=room.getAttribute('data-mission'),src=ASSETS[key];
      if(!src)return;
      room.querySelectorAll('.dw-pending').forEach(function(pending){
        var img=document.createElement('img');
        img.src=src;
        img.alt=(room.querySelector('.dw-label strong')||{}).textContent||key;
        img.draggable=false;
        img.dataset.chatgptOptionD='true';
        pending.replaceWith(img);
      });
    });
  }
  function start(){
    upgrade(document);
    var observer=new MutationObserver(function(records){records.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType===1)upgrade(n);});});});
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('gamenfy:daily-mission-change',function(){upgrade(document);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
