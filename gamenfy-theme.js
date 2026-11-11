(function(root){
 'use strict';
 const zone='Europe/Amsterdam';
 function themeAt(date){const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',hourCycle:'h23'}).format(date));return hour>=7&&hour<19?'paper':'night';}
 function label(theme){return theme==='paper'?'Paper Quest':theme==='arcade'?'Neon Arcade':'Midnight Observatory';}
 const api={themeAt,label,timeZone:zone,dayStarts:7,nightStarts:19};
 if(typeof module==='object'&&module.exports){module.exports=api;return;}
 let preview=null,last=null;
 function apply(){const theme=preview||themeAt(new Date());document.documentElement.dataset.gamenfyTheme=theme;document.documentElement.style.colorScheme=theme==='paper'?'light':'dark';document.querySelectorAll('[data-gamenfy-theme-name]').forEach(e=>e.textContent=label(theme));const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='paper'?'#eee7d6':'#101624';if(theme!==last){last=theme;root.dispatchEvent(new CustomEvent('gamenfy:themechange',{detail:{theme,automatic:!preview}}));}}
 api.setPreview=function(theme){preview=['paper','night','arcade'].includes(theme)?theme:null;apply();};
 api.current=function(){return preview||themeAt(new Date());};
 root.GamenfyTheme=api;apply();setInterval(apply,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply();});document.addEventListener('DOMContentLoaded',apply,{once:true});
})(typeof window==='undefined'?this:window);
