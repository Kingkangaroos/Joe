(function(){
  'use strict';
  const modes=document.querySelectorAll('[data-mode]'),note=document.getElementById('modeNote');
  modes.forEach(b=>b.addEventListener('click',()=>{const cinema=b.dataset.mode==='cinematic';document.body.classList.toggle('cinematic',cinema);modes.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));note.textContent=cinema?'Cinematic: dezelfde bron in een donkerder kader. Dit is een presentatievergelijking; er is nog geen AI-video gegenereerd.':'Direct: de propositie en voorbeelden staan voorop. Het beeld is een bestaande AI-studie, geen nieuwe generatie.';}));
  const dialog=document.getElementById('briefDialog'),form=document.getElementById('briefForm'),result=document.getElementById('briefResult'),output=document.getElementById('briefText'),status=document.getElementById('copyStatus');
  document.querySelectorAll('[data-brief]').forEach(b=>b.addEventListener('click',()=>{if(!dialog.open)dialog.showModal();}));
  document.getElementById('closeBrief').addEventListener('click',()=>dialog.close());
  form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);output.textContent=['Website Ventures · conceptbriefing','Bedrijf: '+d.get('business'),'Doel: '+d.get('goal'),'Toelichting: '+(String(d.get('note')||'').trim()||'Nog niet ingevuld'),'','Lokaal concept; niet verzonden.'].join('\n');result.hidden=false;status.textContent='Je concept staat hieronder. Er is niets verzonden.';result.scrollIntoView({block:'nearest'});});
  document.getElementById('copyBrief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(output.textContent);status.textContent='Gekopieerd. Je bepaalt zelf waar je dit deelt.';}catch(e){status.textContent='Kopiëren is niet beschikbaar. Selecteer en kopieer de tekst hierboven.';}});
})();
