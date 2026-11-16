(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const home=$('home-screen'),game=$('game-screen'),detail=$('level-detail-overlay');
 const names={1:'Começando a aventura',2:'Mais frutas, mais desafios',3:'Hora de pensar rápido',4:'Desafio tropical',5:'Grande combinação'};
 let selected=1,unlocked=1,noticeTimer=null;
 function readProgress(){try{const n=Number(localStorage.getItem('fruitmatch.unlocked'));return Number.isInteger(n)?Math.max(1,Math.min(5,n)):1;}catch(_){return 1;}}
 function saveProgress(){try{localStorage.setItem('fruitmatch.unlocked',String(unlocked));}catch(_){}}
 function readResults(){try{return JSON.parse(localStorage.getItem('fruitmatch.results')||'{}')||{};}catch(_){return {};}}
 function saveResults(results){try{localStorage.setItem('fruitmatch.results',JSON.stringify(results));}catch(_){}}
 function formatTime(value){return String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');}
 function updateMap(){
  const results=readResults();
  document.querySelectorAll('.level-node').forEach(node=>{const n=Number(node.dataset.level),record=results[n];node.disabled=n>unlocked;node.classList.toggle('current',n===selected);node.querySelector('span').textContent=n>unlocked?'🔒':record?'⭐'.repeat(record.stars):'☆';});
  $('world-progress').textContent=unlocked+' / 5';
  $('selected-level').textContent=String(selected).padStart(2,'0')+' · '+names[selected];
  const record=results[selected];
  $('level-record').textContent=record?'Melhor resultado: '+'⭐'.repeat(record.stars)+'☆'.repeat(3-record.stars)+' · '+formatTime(record.seconds):'Ainda não concluída · 3 estrelas sem erros';
 }
 function openLevelDetails(n){
  if(n>unlocked||n<1)return;
  selected=n;updateMap();
  const record=readResults()[selected];
  $('level-detail-title').textContent='FASE '+String(selected).padStart(2,'0');
  $('level-detail-stars').textContent=record?'⭐'.repeat(record.stars)+'☆'.repeat(3-record.stars):'☆☆☆';
  $('level-detail-stars').setAttribute('aria-label',(record?.stars||0)+' de 3 estrelas');
  $('level-detail-time').textContent=record?formatTime(record.seconds):'--:--';
  $('level-detail-status').textContent=record?'Concluída':'Não concluída';
  detail.classList.remove('hidden');
 }
 function closeLevelDetails(){detail.classList.add('hidden');}
 function showNotice(message){$('home-notice').textContent=message;$('home-notice').classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('home-notice').classList.remove('show'),2400);}
 function showHome(){game.classList.add('hidden');home.classList.remove('hidden');$('home-coins').textContent=$('game-coins').textContent;document.dispatchEvent(new Event('fruitmatch:stop'));updateMap();}
 function showGame(){closeLevelDetails();home.classList.add('hidden');game.classList.remove('hidden');document.dispatchEvent(new CustomEvent('fruitmatch:start',{detail:{level:selected}}));}
 document.querySelectorAll('.level-node').forEach(node=>node.addEventListener('click',()=>openLevelDetails(Number(node.dataset.level))));
 $('play-button').addEventListener('click',showGame);
 $('level-detail-play').addEventListener('click',showGame);
 $('level-detail-close').addEventListener('click',closeLevelDetails);
 detail.addEventListener('click',event=>{if(event.target===detail)closeLevelDetails();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeLevelDetails();});
 $('back-home').addEventListener('click',showHome);
 document.addEventListener('fruitmatch:exit',showHome);
 document.addEventListener('fruitmatch:won',event=>{
  unlocked=Math.max(unlocked,Math.min(5,event.detail.level+1));saveProgress();
  const results=readResults(),key=String(event.detail.level),candidate={seconds:event.detail.seconds,stars:event.detail.stars,mistakes:event.detail.mistakes};
  const previous=results[key];
  if(!previous||candidate.stars>previous.stars||(candidate.stars===previous.stars&&candidate.seconds<previous.seconds))results[key]=candidate;
  saveResults(results);$('home-coins').textContent=event.detail.coins;updateMap();
 });
 document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.nav-item').forEach(item=>item.classList.remove('active'));button.classList.add('active');
  const messages={map:'Selecione uma fase no mapa para jogar.',friends:'Amigos: sistema de convites será integrado na próxima etapa.',ranking:'Ranking: classificação online será integrada na próxima etapa.',shop:'Loja: moedas e diamantes estarão disponíveis nesta área.',upgrades:'Upgrades: recursos especiais serão adicionados nesta área.',videos:'Vídeos premiados: integração com anúncios será adicionada nesta área.'};
  showNotice(messages[button.dataset.panel]||messages.map);
 }));
 unlocked=readProgress();updateMap();
})();