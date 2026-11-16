(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const home=$('home-screen'),game=$('game-screen');
 const names={1:'Começando a aventura',2:'Mais frutas, mais desafios',3:'Hora de pensar rápido',4:'Desafio tropical',5:'Grande combinação'};
 let selected=1,unlocked=1,noticeTimer=null;
 function readProgress(){try{const n=Number(localStorage.getItem('fruitmatch.unlocked'));return Number.isInteger(n)?Math.max(1,Math.min(5,n)):1;}catch(_){return 1;}}
 function saveProgress(){try{localStorage.setItem('fruitmatch.unlocked',String(unlocked));}catch(_){}}
 function updateMap(){
  document.querySelectorAll('.level-node').forEach(node=>{const n=Number(node.dataset.level);node.disabled=n>unlocked;node.classList.toggle('current',n===selected);node.querySelector('span').textContent=n<=unlocked?'⭐':'🔒';});
  $('world-progress').textContent=unlocked+' / 5';
  $('selected-level').textContent=String(selected).padStart(2,'0')+' · '+names[selected];
 }
 function selectLevel(n){if(n>unlocked||n<1)return;selected=n;updateMap();}
 function showNotice(message){$('home-notice').textContent=message;$('home-notice').classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('home-notice').classList.remove('show'),2400);}
 function showHome(){game.classList.add('hidden');home.classList.remove('hidden');$('home-coins').textContent=$('game-coins').textContent;document.dispatchEvent(new Event('fruitmatch:stop'));}
 function showGame(){home.classList.add('hidden');game.classList.remove('hidden');document.dispatchEvent(new CustomEvent('fruitmatch:start',{detail:{level:selected}}));}
 document.querySelectorAll('.level-node').forEach(node=>node.addEventListener('click',()=>selectLevel(Number(node.dataset.level))));
 $('play-button').addEventListener('click',showGame);$('back-home').addEventListener('click',showHome);
 document.addEventListener('fruitmatch:exit',showHome);
 document.addEventListener('fruitmatch:won',event=>{unlocked=Math.max(unlocked,Math.min(5,event.detail.level+1));saveProgress();$('home-coins').textContent=event.detail.coins;updateMap();});
 document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.nav-item').forEach(item=>item.classList.remove('active'));button.classList.add('active');
  const messages={map:'Selecione uma fase no mapa para jogar.',friends:'Amigos: sistema de convites será integrado na próxima etapa.',ranking:'Ranking: classificação online será integrada na próxima etapa.',shop:'Loja: moedas e diamantes estarão disponíveis nesta área.',upgrades:'Upgrades: recursos especiais serão adicionados nesta área.',videos:'Vídeos premiados: integração com anúncios será adicionada nesta área.'};
  showNotice(messages[button.dataset.panel]||messages.map);
 }));
 unlocked=readProgress();selectLevel(1);
})();