(() => {
 'use strict';
 const FRUITS=['🍓','🍊','🍇','🍋','🍉','🍍','🥝','🍒'];
 const SIZE=24,MAX_TRAY=5;
 const $=id=>document.getElementById(id);
 const boardEl=$('board'),trayEl=$('tray');
 let board=[],tray=[],score=0,history=[],ended=false,level=1,coins=500,seconds=0,timerId=null,outcome=null;
 function readCoins(){try{const n=Number(localStorage.getItem('fruitmatch.coins'));return Number.isFinite(n)&&n>=0?n:500;}catch(_){return 500;}}
 function writeCoins(){try{localStorage.setItem('fruitmatch.coins',String(coins));}catch(_){}}
 function shuffleArray(items){for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
 function formatTime(){return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
 function save(){history.push({board:[...board],tray:[...tray],score,seconds});if(history.length>30)history.shift();}
 function start(levelNumber=level){
  level=Number(levelNumber)||1;board=shuffleArray(FRUITS.flatMap(f=>[f,f,f]));tray=[];score=0;history=[];ended=false;outcome=null;seconds=0;
  clearInterval(timerId);$('timer').textContent='00:00';timerId=setInterval(()=>{seconds++;$('timer').textContent=formatTime();},1000);
  $('overlay').classList.add('hidden');$('game-level').textContent=String(level).padStart(2,'0');$('game-coins').textContent=coins;render();
 }
 function getHintFruit(){const counts={};for(const f of tray)counts[f]=(counts[f]||0)+1;for(const f of board)if(f)counts[f]=(counts[f]||0)+1;return FRUITS.find(f=>counts[f]>=3&&board.includes(f))||null;}
 function render(){
  boardEl.innerHTML='';
  board.forEach((fruit,index)=>{const tile=document.createElement('button');tile.type='button';tile.className='fruit'+(fruit?'':' empty');tile.textContent=fruit||'';tile.disabled=!fruit||ended;tile.setAttribute('aria-label',fruit?'Escolher '+fruit:'Espaço vazio');tile.addEventListener('click',()=>choose(index));boardEl.appendChild(tile);});
  trayEl.innerHTML='';for(let i=0;i<MAX_TRAY;i++){const slot=document.createElement('div');slot.className='slot'+(tray[i]?' filled':'');slot.textContent=tray[i]||'';trayEl.appendChild(slot);}
  $('tray-count').textContent=tray.length+' / '+MAX_TRAY;$('score').textContent=score.toLocaleString('pt-BR');$('game-coins').textContent=coins;
  $('undo').disabled=!history.length||ended||coins<100;$('shuffle').disabled=ended||board.filter(Boolean).length<2||coins<150;$('hint').disabled=ended||!getHintFruit()||coins<50;
 }
 function choose(index){
  if(ended||!board[index])return;save();const fruit=board[index];board[index]=null;tray.push(fruit);
  const matches=tray.filter(item=>item===fruit).length;
  if(matches>=3){let removed=0;tray=tray.filter(item=>{if(item===fruit&&removed<3){removed++;return false;}return true;});score+=30;}
  if(board.every(item=>!item)){finish(true);return;}
  if(tray.length>=MAX_TRAY){finish(false);return;}render();
 }
 function finish(won){
  if(ended)return;ended=true;outcome=won?'won':'lost';clearInterval(timerId);render();
  $('modal-icon').textContent=won?'🏆':'💫';$('modal-eyebrow').textContent=won?'MISSÃO CONCLUÍDA':'FIM DE JOGO';
  $('modal-title').textContent=won?'Você conseguiu!':'A reserva lotou!';
  $('modal-message').textContent=won?'Fase concluída em '+formatTime()+'. Pontuação: '+score+'.':'Não há espaço livre na reserva. Tente novamente!';
  $('modal-action').textContent=won?'VOLTAR AO MAPA':'TENTAR NOVAMENTE';$('overlay').classList.remove('hidden');
  if(won){coins+=50;writeCoins();$('game-coins').textContent=coins;document.dispatchEvent(new CustomEvent('fruitmatch:won',{detail:{level,coins,score,seconds}}));}
 }
 function undo(){if(!history.length||ended||coins<100)return;coins-=100;writeCoins();const previous=history.pop();board=previous.board;tray=previous.tray;score=previous.score;seconds=previous.seconds;$('timer').textContent=formatTime();render();}
 function shuffle(){if(ended||coins<150)return;save();coins-=150;writeCoins();const positions=board.map((f,i)=>f?i:-1).filter(i=>i>=0);const values=shuffleArray(positions.map(i=>board[i]));positions.forEach((p,i)=>board[p]=values[i]);render();}
 function hint(){if(ended||coins<50)return;const fruit=getHintFruit();if(!fruit)return;coins-=50;writeCoins();$('game-coins').textContent=coins;[...boardEl.children].forEach((tile)=>{if(tile.textContent===fruit)tile.animate([{transform:'scale(1)',filter:'brightness(1)'},{transform:'scale(1.13)',filter:'brightness(1.8)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:700});});render();}
 $('undo').addEventListener('click',undo);$('shuffle').addEventListener('click',shuffle);$('hint').addEventListener('click',hint);
 $('modal-action').addEventListener('click',()=>{if(outcome==='won'){ $('overlay').classList.add('hidden');document.dispatchEvent(new Event('fruitmatch:exit'));}else{start(level);}});
 document.addEventListener('fruitmatch:start',event=>start(event.detail?.level||1));
 document.addEventListener('fruitmatch:stop',()=>clearInterval(timerId));
 coins=readCoins();$('home-coins').textContent=coins;
})();