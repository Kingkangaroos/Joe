(function(){
'use strict';

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function node(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function excerpt(recipe){
  var src=(recipe.methodText||recipe.ingredientsText||recipe.notes||'').split('\n').filter(Boolean);
  return src.slice(0,7).join('\n');
}
function prettySource(recipe){return recipe.source==='Notion'?'Notion import':'Gamenfy';}

var state={index:0,busy:false,gesture:null,timer:0,sheets:[],faces:[],count:0,reduced:false};

function openRecipe(index){
  if(typeof window.openRecipeEditor==='function') window.openRecipeEditor(index);
}

function makeButton(label,fn){
  var b=node('button',null,label);b.type='button';b.addEventListener('click',function(e){e.stopPropagation();fn();});return b;
}

function setAccessible(face,yes){
  if(!face)return;
  face.inert=!yes;face.setAttribute('aria-hidden',String(!yes));
  face.querySelectorAll('button,a').forEach(function(el){el.tabIndex=yes?0:-1;});
}

function sync(){
  var book=document.getElementById('recipeBook');
  var open=document.getElementById('cookbookOpen');
  var prev=document.getElementById('cookbookPrev');
  var next=document.getElementById('cookbookNext');
  var counter=document.getElementById('cookbookCounter');
  var status=document.getElementById('cookbookStatus');
  if(!book)return;
  book.classList.toggle('is-closed',state.index===0);
  state.sheets.forEach(function(s,n){
    s.classList.toggle('turned',n<state.index);
    s.style.zIndex=n<state.index?n+1:state.count-n;
    setAccessible(state.faces[n]&&state.faces[n].front,n===state.index);
    setAccessible(state.faces[n]&&state.faces[n].back,n===state.index-1);
  });
  var final=book.querySelector('.cookbook-final');
  setAccessible(final,state.index===state.count);
  if(open)open.hidden=state.index!==0;
  if(prev)prev.disabled=state.index===0||state.busy;
  if(next)next.disabled=state.index===state.count||state.busy;
  if(counter)counter.textContent=String(state.index).padStart(2,'0')+' / '+String(state.count).padStart(2,'0');
  var recipes=typeof loadRecipes==='function'?loadRecipes():[];
  if(status){
    status.textContent=state.index===0?'Cover':state.index===state.count?'Einde van het boek':((recipes[state.index-1]&&recipes[state.index-1].name)||'Recept');
  }
}

function go(target){
  target=Math.max(0,Math.min(state.count,Number(target)));
  if(!Number.isInteger(target)||target===state.index)return;
  clearTimeout(state.timer);state.busy=false;
  state.sheets.forEach(function(s){s.classList.remove('flipping','dragging');s.style.removeProperty('transform');});
  if(!state.reduced&&Math.abs(target-state.index)===1){
    var leaf=state.sheets[target>state.index?state.index:state.index-1];
    if(leaf){
      leaf.classList.add('flipping');state.busy=true;
      state.timer=setTimeout(function(){leaf.classList.remove('flipping');state.busy=false;sync();},870);
    }
  }
  state.index=target;sync();
}

function buildBook(){
  var book=document.getElementById('recipeBook');
  if(!book||typeof loadRecipes!=='function')return;
  var recipes=loadRecipes();
  book.innerHTML='';
  state.index=0;state.busy=false;state.sheets=[];state.faces=[];state.count=recipes.length+1;
  state.reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var left=node('div','book-board board-left');
  var right=node('div','book-board board-right');
  var stack=node('div','paper-stack');
  var spine=node('div','book-spine');
  var final=node('section','cookbook-final');
  final.append(node('small',null,'JOEY’S KITCHEN · END'));
  final.append(node('h3',null,'Nog één recept\nvoor het boek.'));
  final.append(node('p',null,'Voeg nieuwe gerechten toe vanuit je Cooking skill. Nieuwe recepten verschijnen automatisch in deze editie.'));
  final.append(makeButton('+ Nieuw recept',function(){openRecipe(null);}));
  book.append(left,right,stack,spine,final);

  for(var n=0;n<state.count;n++){
    var leaf=node('div','recipe-leaf');
    var front=node('section','recipe-page');
    var back=node('section','recipe-page recipe-page-back');
    if(n===0){
      front.classList.add('recipe-cover');
      front.append(node('span','cover-brand',"JOEY'S KITCHEN"));
      front.append(node('span','cover-mark',''));
      front.append(node('div','cover-title','Recipe\nBook.'));
      front.append(node('p','cover-sub','Favorieten, meal prep en recepten die het waard zijn om nog een keer te maken.'));
      front.append(makeButton('Begin met bladeren ↗',function(){go(1);}));
      var cb=node('div','cover-bottom');cb.append(node('span',null,'PERSONAL EDITION'),node('span',null,'VOL. 01'));front.append(cb);

      back.classList.add('recipe-intro-page');
      back.append(node('small',null,'KITCHEN NOTES / 01'));
      back.append(node('h3',null,'Niet zoeken.\nGewoon koken.'));
      back.append(node('p',null,'Je recepten staan hier als een echt kookboek. Tik op “Open recept” voor ingrediënten, bereidingswijze, notities en de optionele macro-calculator.'));
      back.append(node('span',null,recipes.length+' recepten in deze editie'));
    }else{
      (function(recipe,recipeIdx,pageNo){
        front.classList.add('recipe-photo');
        if(recipe.coverImage){
          var img=node('img');img.src=recipe.coverImage;img.alt=recipe.name;img.loading='lazy';img.draggable=false;front.append(img);
        }
        var shade=node('div','photo-shade');
        shade.append(node('small',null,'RECIPE '+String(pageNo).padStart(2,'0')+' · '+prettySource(recipe).toUpperCase()));
        var bottom=node('div','photo-bottom'),leftCopy=node('div');
        leftCopy.append(node('h3',null,recipe.name));
        var tags=node('div','photo-tags');
        (recipe.tags||[]).slice(0,3).forEach(function(t){tags.append(node('i',null,t));});
        leftCopy.append(tags);bottom.append(leftCopy,makeButton('Open ↗',function(){openRecipe(recipeIdx);}));shade.append(bottom);front.append(shade);

        back.classList.add('recipe-info');
        back.append(node('small',null,(recipe.tags||[]).slice(0,2).join(' · ').toUpperCase()||'RECIPE NOTES'));
        back.append(node('h3',null,recipe.name));
        back.append(node('p','recipe-excerpt',excerpt(recipe)||'Dit recept is nog een draft. Open het om ingrediënten en stappen toe te voegen.'));
        var footer=node('div','info-footer');
        footer.append(node('span',null,(recipe.servings||1)+' portie'+((recipe.servings||1)===1?'':'s')),makeButton('Open recept ↗',function(){openRecipe(recipeIdx);}));
        back.append(footer);
      })(recipes[n-1],n-1,n);
    }
    leaf.append(front,back);book.append(leaf);state.sheets.push(leaf);state.faces.push({front:front,back:back});
  }

  book.onkeydown=function(e){
    if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)||state.busy)return;
    e.preventDefault();
    go(e.key==='Home'?0:e.key==='End'?state.count:state.index+(e.key==='ArrowRight'?1:-1));
  };

  book.onpointerdown=function(e){
    if(state.busy||(e.button!==undefined&&e.button!==0)||e.target.closest('button,a,input,textarea,select'))return;
    state.gesture={x:e.clientX,y:e.clientY,id:e.pointerId,progress:0,leaf:null,direction:0};
  };
  book.onpointermove=function(e){
    var g=state.gesture;if(!g||g.id!==e.pointerId)return;
    var dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(!g.leaf){
      if(Math.abs(dy)>14&&Math.abs(dy)>Math.abs(dx)){state.gesture=null;return;}
      if(Math.abs(dx)<16||Math.abs(dx)<Math.abs(dy)*1.35)return;
      g.direction=dx<0?1:-1;
      var no=g.direction===1?state.index:state.index-1;
      if(!state.sheets[no]){state.gesture=null;return;}
      g.leaf=state.sheets[no];g.leaf.classList.add('dragging');
      if(book.setPointerCapture)book.setPointerCapture(e.pointerId);
    }
    e.preventDefault();
    var travel=g.direction===1?-dx:dx;
    g.progress=Math.min(1,Math.max(0,travel/(book.getBoundingClientRect().width*.48)));
    g.leaf.style.transform='rotateY('+(g.direction===1?-180*g.progress:-180+180*g.progress)+'deg)';
    g.leaf.style.zIndex=state.count+5;
  };
  function finish(e,cancelled){
    var g=state.gesture;if(!g||(e.pointerId!==undefined&&g.id!==e.pointerId))return;
    state.gesture=null;
    if(g.leaf){
      g.leaf.classList.remove('dragging');g.leaf.style.removeProperty('transform');
      if(!cancelled&&g.progress>.22)go(state.index+g.direction);else sync();
    }
    if(book.hasPointerCapture&&book.hasPointerCapture(g.id))book.releasePointerCapture(g.id);
  }
  book.onpointerup=function(e){finish(e,false);};
  book.onpointercancel=function(e){finish(e,true);};
  sync();
}

window.renderRecipeBook=buildBook;

document.addEventListener('DOMContentLoaded',function(){
  var open=document.getElementById('cookbookOpen');
  var prev=document.getElementById('cookbookPrev');
  var next=document.getElementById('cookbookNext');
  var top=document.getElementById('cookbookTopView');
  if(open)open.addEventListener('click',function(){go(1);});
  if(prev)prev.addEventListener('click',function(){if(!state.busy)go(state.index-1);});
  if(next)next.addEventListener('click',function(){if(!state.busy)go(state.index+1);});
  if(top)top.addEventListener('click',function(){
    var book=document.getElementById('recipeBook');if(!book)return;
    var flat=book.classList.toggle('is-top');
    top.setAttribute('aria-pressed',String(flat));top.textContent=flat?'Perspectief':'Bovenaanzicht';
  });
  buildBook();
});
}());
