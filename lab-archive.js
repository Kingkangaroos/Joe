(function(){
  'use strict';
  var map={park31:['park31'],health:['healthTrail'],park2:['park2'],garden:['missionGarden'],animation:['at1Wrap'],skills:['wbar','cbar','scene','det']};
  var ids=map[new URLSearchParams(location.search).get('experiment')];if(!ids)return;
  function mount(){var main=document.createElement('main');main.style.cssText='max-width:720px;margin:auto;padding:12px';ids.forEach(function(id){var el=document.getElementById(id);if(el)main.append(el);});var old=document.querySelector('.wrap');if(old)old.hidden=true;document.body.append(main);window.dispatchEvent(new Event('resize'));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
