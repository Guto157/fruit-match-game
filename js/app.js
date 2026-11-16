(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const home=$('home-screen'),game=$('game-screen'),detail=$('level-detail-overlay');
 const names={1:'Primeiros passos',2:'Tabuleiro ampliado',3:'Seis colunas',4:'Desafio em expansão',5:'Grande tabuleiro'};
 const worlds=[['ILHA TROPICAL','🌴'],['PRAIA DOURADA','🏖️'],['FLORESTA VERDE','🌳'],['MONTANHAS GELADAS','❄️'],['REINO MÁGICO','✨']];
 let selected=1,unlocked=1,currentWorld=0,noticeTimer=null;
 function readProgress(){try{const n=Number(localStorage.getItem('fruitmatch.unlocked'));let value=Number.isInteger(n)?Math.max(1,Math.min(50,n)):1;const results=JSON.parse(localStorage.getItem('fruitmatch.results')||'{}')||{};if(value===5&&results['5'])value=6;return value;}catch(_){return 1;}}
 function saveProgress(){try{localStorage.setItem('fruitmatch.unlocked',String(unlocked));}catch(_){}}
 function readResults(){try{return JSON.parse(localStorage.getItem('fruitmatch.results')||'{}')||{};}catch(_){return {};}}
 function saveResults(results){try{localStorage.setItem('fruitmatch.results',JSON.stringify(results));}catch(_){}}
 function formatTime(value){return String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');}
 function changeWorld(delta){currentWorld=Math.max(0,Math.min(4,currentWorld+delta));selected=currentWorld*10+1;updateMap();}
 function updateMap(){
  const results=readResults(),start=currentWorld*10+1,end=start+9;
  $('world-icon').textContent=worlds[currentWorld][1];$('world-name').textContent=worlds[currentWorld][0];$('world-subtitle').textContent='Mundo '+(currentWorld+1)+' · Fases '+start+' a '+end;
  $('world-progress').textContent=unlocked+' / 50';$('world-prev').disabled=currentWorld===0;$('world-next').disabled=currentWorld===4;
  const map=$('level-map');map.innerHTML='';
  for(let n=start;n<=end;n++){const record=results[n],node=document.createElement('button');node.type='button';node.className='level-node';node.dataset.level=String(n);node.disabled=n>unlocked;node.innerHTML='<small>FASE</small><b>'+n+'</b><span>'+(n>unlocked?'🔒':record?'⭐'.repeat(record.stars):'☆')+'</span>';if(n===selected)node.classList.add('current');node.addEventListener('click',()=>openLevelDetails(n));map.appendChild(node);}
  $('selected-level').textContent=String(selected).padStart(2,'0')+' · '+(names[selected]||'Desafio '+selected);
  const record=results[selected];$('level-record').textContent=record?'Melhor resultado: '+'⭐'.repeat(record.stars)+'☆'.repeat(3-record.stars)+' · '+formatTime(record.seconds):'Ainda não concluída · 3 estrelas sem erros';
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
 $('world-prev').addEventListener('click',()=>changeWorld(-1));$('world-next').addEventListener('click',()=>changeWorld(1));
 $('play-button').addEventListener('click',showGame);
 $('level-detail-play').addEventListener('click',showGame);
 $('level-detail-close').addEventListener('click',closeLevelDetails);
 detail.addEventListener('click',event=>{if(event.target===detail)closeLevelDetails();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeLevelDetails();closeShop();}});
 $('back-home').addEventListener('click',showHome);
 document.addEventListener('fruitmatch:exit',showHome);
 document.addEventListener('fruitmatch:won',event=>{
  unlocked=Math.max(unlocked,Math.min(50,event.detail.level+1));saveProgress();
  const results=readResults(),key=String(event.detail.level),candidate={seconds:event.detail.seconds,stars:event.detail.stars,mistakes:event.detail.mistakes};
  const previous=results[key];
  if(!previous||candidate.stars>previous.stars||(candidate.stars===previous.stars&&candidate.seconds<previous.seconds))results[key]=candidate;
  saveResults(results);$('home-coins').textContent=event.detail.coins;updateMap();
 });
 const shopOverlay=$('shop-overlay');
 const shopPrices={undo:80,extraSlot:120,hint:40};
 function readInventory(){try{const data=JSON.parse(localStorage.getItem('fruitmatch.inventory')||'{}')||{};return {undo:Math.max(0,Number(data.undo)||0),extraSlot:Math.max(0,Number(data.extraSlot)||0),hint:Math.max(0,Number(data.hint)||0)};}catch(_){return {undo:0,extraSlot:0,hint:0};}}
 function renderShop(){const saved=localStorage.getItem('fruitmatch.coins'),balance=Math.max(0,saved===null?(Number($('home-coins').textContent)||0):(Number(saved)||0)),stock=readInventory();$('shop-coins').textContent=balance.toLocaleString('pt-BR');Object.keys(stock).forEach(key=>$('stock-'+key).textContent='No estoque: '+stock[key]);}
 function openShop(){renderShop();shopOverlay.classList.remove('hidden');}
 function closeShop(){shopOverlay.classList.add('hidden');}
 $('shop-close').addEventListener('click',closeShop);
 shopOverlay.addEventListener('click',event=>{if(event.target===shopOverlay)closeShop();});
 shopOverlay.querySelectorAll('[data-buy]').forEach(button=>button.addEventListener('click',()=>{
  const item=button.dataset.buy,cost=shopPrices[item],balance=Math.max(0,Number(localStorage.getItem('fruitmatch.coins'))||0);
  if(balance<cost){showNotice('Moedas insuficientes para essa compra.');return;}
  const stock=readInventory();stock[item]++;localStorage.setItem('fruitmatch.inventory',JSON.stringify(stock));localStorage.setItem('fruitmatch.coins',String(balance-cost));
  $('home-coins').textContent=balance-cost;renderShop();showNotice('Item comprado e guardado no estoque!');
 }));
 document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.nav-item').forEach(item=>item.classList.remove('active'));button.classList.add('active');
  const panel=button.dataset.panel;
  if(panel==='shop'){openShop();return;}
  const messages={map:'Selecione uma fase no mapa para jogar.',friends:'Amigos: sistema de convites será integrado na próxima etapa.',ranking:'Ranking: classificação online será integrada na próxima etapa.',upgrades:'Upgrades: recursos especiais serão adicionados nesta área.',videos:'Vídeos premiados: integração com anúncios será adicionada nesta área.'};
  showNotice(messages[panel]||messages.map);
 }));

 unlocked=readProgress();updateMap();
})();