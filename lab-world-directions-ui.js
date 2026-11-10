const $=id=>document.getElementById(id);
let world='garden';
export const worlds={
 garden:{name:'Daylight Garden',tag:'01 / DAYLIGHT GARDEN',title:'Even landen. Dan verder.',description:'Een open tuin, zacht groen en warm daglicht. De rustige kandidaat voor je dagelijkse Home.',sky:'#e7ecdd',ground:'#9db38b',trunk:'#9b7c5c',leaf:'#668861',stone:'#e7dec4',light:'#fff1d1'},
 night:{name:'Midnight Observatory',tag:'02 / MIDNIGHT OBSERVATORY',title:'Ruimte voor je volgende stap.',description:'Een nachtelijke tuin met sterren en lichtbakens. Een mogelijke sfeer voor je avondplanning.',sky:'#151e36',ground:'#343a5d',trunk:'#4a4665',leaf:'#74729c',stone:'#9d9bc7',light:'#b8c5ff'},
 paper:{name:'Paper Quest',tag:'03 / PAPER QUEST',title:'Schrijf je eigen avontuur.',description:'Papierkleuren, hoekige bomen en een route als een kleine landkaart. Een warmere, grafische richting.',sky:'#eee3ca',ground:'#c7b68e',trunk:'#99734b',leaf:'#a69666',stone:'#f6ecd6',light:'#fff2d1'},
 clay:{name:'Clay Studio',tag:'04 / CLAY STUDIO',title:'Kleine stappen. Mooie vormen.',description:'Terracotta, zachte ronde bomen en een compacte speelwereld. Tactiel en vriendelijk.',sky:'#f0d9cd',ground:'#c99c86',trunk:'#ad7965',leaf:'#d9ad9a',stone:'#f3cdb6',light:'#ffe4d0'},
 arcade:{name:'Neon Arcade',tag:'05 / NEON ARCADE',title:'Ready voor je volgende missie?',description:'Een donkere wereld met mintgroene paden en lichtgevende bakens. Meer gamegevoel, meer contrast.',sky:'#111b29',ground:'#213f45',trunk:'#3b5c63',leaf:'#58bda5',stone:'#73dbc1',light:'#a6ffe1'}
};
const reviewKey='gamenfy_lab_world_studio_v1';
let review={favorite:null,notes:{}};
try{const saved=JSON.parse(localStorage.getItem(reviewKey));if(saved&&typeof saved==='object'){review.favorite=Object.hasOwn(worlds,saved.favorite)?saved.favorite:null;if(saved.notes&&typeof saved.notes==='object')for(const key of Object.keys(worlds))if(typeof saved.notes[key]==='string')review.notes[key]=saved.notes[key].slice(0,4000);}}catch{}
function saveReview(){try{localStorage.setItem(reviewKey,JSON.stringify(review));$('saveStatus').textContent='Bewaard op dit apparaat.';}catch{$('saveStatus').textContent='Bewaren lukt hier niet. Houd je notitie zelf bij.';}}
function setWorld(key){
 if(!Object.hasOwn(worlds,key))return;
 world=key;const style=worlds[key];document.body.dataset.world=key;
 $('worldTag').textContent=style.tag;$('worldTitle').textContent=style.title;$('reviewTitle').textContent=style.name;$('worldDescription').textContent=style.description;
 document.querySelectorAll('[data-world-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.worldChoice===key)));
 $('reviewNote').value=review.notes[key]||'';updateFavorite();
 dispatchEvent(new CustomEvent('gamenfy:lab-world',{detail:key}));
}
function updateFavorite(){const selected=review.favorite===world;$('favoriteWorld').setAttribute('aria-pressed',String(selected));$('favoriteWorld').textContent=selected?'♥ Jouw favoriete sfeer':'♡ Bewaar deze sfeer';}
document.querySelectorAll('[data-world-choice]').forEach(b=>b.onclick=()=>setWorld(b.dataset.worldChoice));
$('favoriteWorld').onclick=()=>{review.favorite=review.favorite===world?null:world;saveReview();updateFavorite();};
$('reviewNote').maxLength=4000;$('reviewNote').oninput=()=>{review.notes[world]=$('reviewNote').value;saveReview();};
setWorld(review.favorite||'garden');
