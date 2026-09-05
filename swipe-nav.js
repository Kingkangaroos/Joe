// Gamenfy cross-page swipe navigation engine — dormant by design.
// ChatGPT (OpenAI), 2026-09-06.
// IMPORTANT: this file never self-mounts. A page must explicitly call
// window.GamenfySwipeNav.mount() after Joey approves the installed-iPhone Lab feel.
(function(){
  'use strict';

  var ROUTES=[
    {key:'main',href:'index.html'},
    {key:'character',href:'character.html'},
    {key:'skills',href:'character.html#skills'},
    {key:'finance',href:'finance.html'},
    {key:'jarvis',href:'jarvis.html'}
  ];

  var DEFAULTS={
    axisStart:10,
    horizontalRatio:1.28,
    commitPx:72,
    commitRatio:0.18,
    flickMinPx:38,
    flickVelocity:0.55,
    edgeResistance:0.28,
    interactiveSelector:'input,textarea,select,button,a,[contenteditable="true"],[data-swipe-exempt],[role="slider"],[role="dialog"],[aria-modal="true"]'
  };

  function pageKey(loc){
    loc=loc||window.location;
    var path=String(loc.pathname||'').toLowerCase();
    var hash=String(loc.hash||'').toLowerCase();
    if(path.endsWith('/character.html')||path.endsWith('character.html'))return hash==='#skills'?'skills':'character';
    if(path.endsWith('/finance.html')||path.endsWith('finance.html'))return 'finance';
    if(path.endsWith('/jarvis.html')||path.endsWith('jarvis.html'))return 'jarvis';
    if(path.endsWith('/index.html')||path.endsWith('index.html')||path==='/'||path==='')return 'main';
    return null;
  }

  function routeIndex(key){
    for(var i=0;i<ROUTES.length;i++)if(ROUTES[i].key===key)return i;
    return -1;
  }

  function isModalOpen(doc){
    var body=doc.body;
    if(body&&(body.classList.contains('topbar-modal-open')||body.classList.contains('p31-modal-open')))return true;
    return !!doc.querySelector('[aria-modal="true"]:not([hidden]),.modal-bg:not([hidden]),.po-modal-bg:not([hidden]),.wt-overlay:not([hidden])');
  }

  function horizontallyScrollable(node,root){
    while(node&&node!==root&&node.nodeType===1){
      if(node.hasAttribute&&node.hasAttribute('data-swipe-exempt'))return true;
      try{
        var style=getComputedStyle(node);
        var ox=style.overflowX;
        if((ox==='auto'||ox==='scroll')&&node.scrollWidth>node.clientWidth+4)return true;
      }catch(e){}
      node=node.parentElement;
    }
    return false;
  }

  function blockedTarget(target,root,selector){
    if(!target||typeof target.closest!=='function')return false;
    if(target.closest(selector))return true;
    return horizontallyScrollable(target,root);
  }

  function mergeOptions(options){
    var out={};
    Object.keys(DEFAULTS).forEach(function(k){out[k]=DEFAULTS[k];});
    Object.keys(options||{}).forEach(function(k){out[k]=options[k];});
    return out;
  }

  function mount(options){
    options=mergeOptions(options);
    var root=options.root||document.documentElement;
    var doc=root.ownerDocument||document;
    var win=doc.defaultView||window;
    var navigate=typeof options.navigate==='function'?options.navigate:function(href){win.location.assign(href);};
    var onState=typeof options.onState==='function'?options.onState:function(){};
    var active=null;
    var destroyed=false;

    function emit(type,data){
      try{onState(Object.assign({type:type},data||{}));}catch(e){}
    }

    function currentIndex(){return routeIndex(pageKey(win.location));}

    function down(event){
      if(destroyed)return;
      if(event.isPrimary===false)return;
      if(event.pointerType==='mouse'&&event.button!==0)return;
      if(isModalOpen(doc)){emit('blocked',{reason:'modal'});return;}
      if(blockedTarget(event.target,root,options.interactiveSelector)){emit('blocked',{reason:'interactive'});return;}
      var idx=currentIndex();
      if(idx<0){emit('blocked',{reason:'unknown-route'});return;}
      active={
        id:event.pointerId,index:idx,x:event.clientX,y:event.clientY,lastX:event.clientX,
        lastT:performance.now(),axis:null,dx:0,dy:0,velocityX:0
      };
      emit('tracking',{index:idx,key:ROUTES[idx].key});
    }

    function move(event){
      if(!active||event.pointerId!==active.id)return;
      var now=performance.now();
      var dx=event.clientX-active.x;
      var dy=event.clientY-active.y;
      var adx=Math.abs(dx),ady=Math.abs(dy);
      var dt=Math.max(1,now-active.lastT);
      active.velocityX=(event.clientX-active.lastX)/dt;
      active.lastX=event.clientX;
      active.lastT=now;
      active.dx=dx;
      active.dy=dy;

      if(!active.axis&&Math.max(adx,ady)>=options.axisStart){
        if(adx>ady*options.horizontalRatio){
          active.axis='x';
          emit('axis',{axis:'x',dx:dx,dy:dy});
        }else if(ady>adx){
          active.axis='y';
          emit('axis',{axis:'y',dx:dx,dy:dy});
        }
      }
      if(active.axis==='y')return;
      if(active.axis!=='x')return;
      event.preventDefault();

      var atLeft=active.index===0&&dx>0;
      var atRight=active.index===ROUTES.length-1&&dx<0;
      emit('drag',{dx:(atLeft||atRight)?dx*options.edgeResistance:dx,rawDx:dx,edge:atLeft?'left':atRight?'right':null});
    }

    function finish(event,cancelled){
      if(!active||event.pointerId!==active.id)return;
      var g=active;
      active=null;
      if(cancelled){emit('cancel');return;}
      if(g.axis==='y'){emit('native-scroll');return;}
      if(g.axis!=='x'){emit('no-lock');return;}

      var width=Math.max(1,(root.getBoundingClientRect&&root.getBoundingClientRect().width)||win.innerWidth||1);
      var threshold=Math.max(options.commitPx,width*options.commitRatio);
      var enough=Math.abs(g.dx)>=threshold;
      var flick=Math.abs(g.dx)>=options.flickMinPx&&Math.abs(g.velocityX)>=options.flickVelocity;
      if(!enough&&!flick){emit('snapback',{dx:g.dx,threshold:threshold});return;}

      var direction=g.dx<0?1:-1;
      var next=Math.max(0,Math.min(ROUTES.length-1,g.index+direction));
      if(next===g.index){emit('boundary',{index:g.index,key:ROUTES[g.index].key});return;}
      var target=ROUTES[next];
      emit('navigate',{from:ROUTES[g.index].key,to:target.key,href:target.href,reason:enough?'distance':'flick'});
      navigate(target.href,{from:ROUTES[g.index],to:target,reason:enough?'distance':'flick'});
    }

    function up(event){finish(event,false);}
    function cancel(event){finish(event,true);}

    root.addEventListener('pointerdown',down);
    root.addEventListener('pointermove',move,{passive:false});
    root.addEventListener('pointerup',up);
    root.addEventListener('pointercancel',cancel);

    return {
      destroy:function(){
        if(destroyed)return;
        destroyed=true;active=null;
        root.removeEventListener('pointerdown',down);
        root.removeEventListener('pointermove',move);
        root.removeEventListener('pointerup',up);
        root.removeEventListener('pointercancel',cancel);
      },
      pageKey:function(){return pageKey(win.location);},
      routes:ROUTES.slice()
    };
  }

  window.GamenfySwipeNav={
    mount:mount,
    pageKey:pageKey,
    routes:ROUTES.slice(),
    defaults:Object.assign({},DEFAULTS)
  };
})();
