(() => {
 'use strict';
 const FRUITS=['🍓','🍊','🍇','🍋','🍉','🍍','🥝','🍒','🥥','🍈','🍐','🥭','🫐','🍑','🍏','🍌','🍎','🍅','🫒','🥑','🌰','🫑','🌶️','🍆'];
 let COLS=4,ROWS=6;
 const MAX_TRAY=5;
 function getLevelConfig(n){
  const fruitKinds=n<=5?[8,10,12,14,16][n-1]:Math.min(FRUITS.length,16+(n-5));
  const sizes={8:[4,6],9:[5,6],10:[5,6],11:[6,6],12:[6,6],13:[6,7],14:[6,7],15:[6,8],16:[6,8],17:[7,8],18:[7,8],19:[8,8],20:[8,8],21:[7,9]};
  let [cols,rows]=sizes[fruitKinds]||[8,9];
  if(fruitKinds>=22){const layouts=[[8,9],[9,8],[6,12],[12,6]];[cols,rows]=layouts[(n-11)%layouts.length];}
  return {cols,rows,fruitKinds};
 }
 const $=id=>document.getElementById(id);
 const boardEl=$('board'),trayEl=$('tray');
 let board=[],tray=[],score=0,history=[],ended=false,level=1,coins=500,seconds=0,timerId=null,outcome=null,mistakes=0;
 let nextTileId=1;
 function readCoins(){try{const n=Number(localStorage.getItem('fruitmatch.coins'));return Number.isFinite(n)&&n>=0?n:500;}catch(_){return 500;}}
 function writeCoins(){try{localStorage.setItem('fruitmatch.coins',String(coins));}catch(_){}}
 function shuffleArray(items){for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
 function formatTime(value=seconds){return String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');}
 function cloneTiles(items){return items.map(item=>item?{...item}:null);}
 function save(){history.push({board:cloneTiles(board),tray:cloneTiles(tray),score,seconds,mistakes});if(history.length>30)history.shift();}
 function start(levelNumber=level){
  level=Math.max(1,Math.min(50,Number(levelNumber)||1));
  const config=getLevelConfig(level);COLS=config.cols;ROWS=config.rows;
  boardEl.style.gridTemplateColumns='repeat('+COLS+',minmax(0,1fr))';
  boardEl.style.gridTemplateRows='repeat('+ROWS+',minmax(0,1fr))';
  boardEl.style.aspectRatio=COLS+'/'+ROWS;
  const tiles=shuffleArray(FRUITS.slice(0,config.fruitKinds).flatMap(f=>[1,2,3].map(()=>({id:nextTileId++,fruit:f}))));
  board=Array(COLS*ROWS).fill(null);tiles.forEach((tile,index)=>board[index]=tile);applyGravity();
  tray=[];score=0;history=[];ended=false;outcome=null;seconds=0;mistakes=0;
  clearInterval(timerId);$('timer').textContent='00:00';timerId=setInterval(()=>{seconds++;$('timer').textContent=formatTime();},1000);
  $('overlay').classList.add('hidden');$('game-level').textContent=String(level).padStart(2,'0');$('game-coins').textContent=coins;render();
 }
 function getHintFruit(){const counts={};for(const tile of tray)counts[tile.fruit]=(counts[tile.fruit]||0)+1;for(const tile of board)if(tile)counts[tile.fruit]=(counts[tile.fruit]||0)+1;return FRUITS.find(f=>counts[f]>=3&&board.some(t=>t?.fruit===f))||null;}
 function capturePositions(){const positions=new Map();boardEl.querySelectorAll('.fruit[data-tile-id]').forEach(el=>positions.set(Number(el.dataset.tileId),el.getBoundingClientRect()));return positions;}
 function render(animateFrom=null){
  boardEl.innerHTML='';
  board.forEach((tile,index)=>{const el=document.createElement('button');el.type='button';el.className='fruit'+(tile?'':' empty');el.textContent=tile?.fruit||'';el.disabled=!tile||ended;if(tile){el.dataset.tileId=String(tile.id);el.setAttribute('aria-label','Escolher '+tile.fruit);el.addEventListener('click',()=>choose(index));}else{el.setAttribute('aria-label','Espaço vazio');}boardEl.appendChild(el);});
  if(animateFrom){boardEl.querySelectorAll('.fruit[data-tile-id]').forEach(el=>{const old=animateFrom.get(Number(el.dataset.tileId));if(!old)return;const now=el.getBoundingClientRect();const dx=old.left-now.left,dy=old.top-now.top;if(Math.abs(dx)+Math.abs(dy)>1){el.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'translate(0,0)'}],{duration:360,easing:'cubic-bezier(.2,.75,.25,1)'});}});}
  trayEl.innerHTML='';for(let i=0;i<MAX_TRAY;i++){const slot=document.createElement('div');slot.className='slot'+(tray[i]?' filled':'');slot.textContent=tray[i]?.fruit||'';trayEl.appendChild(slot);}
  $('tray-count').textContent=tray.length+' / '+MAX_TRAY;$('score').textContent=score.toLocaleString('pt-BR');$('game-coins').textContent=coins;
  $('undo').disabled=!history.length||ended||coins<100;$('shuffle').disabled=ended||board.filter(Boolean).length<2||coins<150;$('hint').disabled=ended||!getHintFruit()||coins<50;
 }
 function applyGravity(){
  for(let col=0;col<COLS;col++){
   const remaining=[];for(let row=0;row<ROWS;row++){const tile=board[row*COLS+col];if(tile)remaining.push(tile);}
   for(let row=ROWS-1;row>=0;row--)board[row*COLS+col]=remaining.pop()||null;
  }
 }
 function choose(index){
  if(ended||!board[index])return;
  const oldPositions=capturePositions();save();
  const tile=board[index];board[index]=null;tray.push(tile);
  const matches=tray.filter(item=>item.fruit===tile.fruit).length;
  if(matches>=3){let removed=0;tray=tray.filter(item=>{if(item.fruit===tile.fruit&&removed<3){removed++;return false;}return true;});score+=30;}
  applyGravity();
  if(tray.length===4)mistakes++;
  if(board.every(item=>!item)){finish(true);return;}
  if(tray.length>=MAX_TRAY){finish(false);return;}
  render(oldPositions);
 }
 function starsForMistakes(count){return count===0?3:count===1?2:1;}
 function finish(won){
  if(ended)return;ended=true;outcome=won?'won':'lost';clearInterval(timerId);render();
  $('modal-icon').textContent=won?'🏆':'💫';$('modal-eyebrow').textContent=won?'MISSÃO CONCLUÍDA':'FIM DE JOGO';
  $('modal-title').textContent=won?'Você conseguiu!':'A reserva lotou!';
  if(won){const stars=starsForMistakes(mistakes);$('modal-message').textContent='Tempo: '+formatTime()+'. '+ 'Erros: '+mistakes+'.\n'+ 'Resultado: '+'⭐'.repeat(stars)+'☆'.repeat(3-stars)+'.';$('modal-action').textContent='VOLTAR AO MAPA';coins+=50;writeCoins();$('game-coins').textContent=coins;document.dispatchEvent(new CustomEvent('fruitmatch:won',{detail:{level,coins,score,seconds,mistakes,stars}}));}
  else{$('modal-message').textContent='Não há espaço livre na reserva. Tente novamente!';$('modal-action').textContent='TENTAR NOVAMENTE';}
  $('overlay').classList.remove('hidden');
 }
 function undo(){if(!history.length||ended||coins<100)return;coins-=100;writeCoins();const previous=history.pop();board=previous.board;tray=previous.tray;score=previous.score;seconds=previous.seconds;mistakes=previous.mistakes;$('timer').textContent=formatTime();render();}
 function shuffle(){if(ended||coins<150)return;save();coins-=150;writeCoins();const positions=board.map((t,i)=>t?i:-1).filter(i=>i>=0);const values=shuffleArray(positions.map(i=>board[i]));positions.forEach((p,i)=>board[p]=values[i]);render();}
 function hint(){if(ended||coins<50)return;const fruit=getHintFruit();if(!fruit)return;coins-=50;writeCoins();$('game-coins').textContent=coins;[...boardEl.children].forEach(tile=>{if(tile.textContent===fruit)tile.animate([{transform:'scale(1)',filter:'brightness(1)'},{transform:'scale(1.13)',filter:'brightness(1.8)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:700});});render();}
 $('undo').addEventListener('click',undo);$('shuffle').addEventListener('click',shuffle);$('hint').addEventListener('click',hint);
 $('modal-action').addEventListener('click',()=>{if(outcome==='won'){$('overlay').classList.add('hidden');document.dispatchEvent(new Event('fruitmatch:exit'));}else{start(level);}});
 document.addEventListener('fruitmatch:start',event=>start(event.detail?.level||1));
 document.addEventListener('fruitmatch:stop',()=>clearInterval(timerId));
 coins=readCoins();$('home-coins').textContent=coins;
})();