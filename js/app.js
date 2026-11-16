(() => {
 let selected=1,unlocked=1;
 const $=id=>document.getElementById(id);
 const home=$("home-screen"),game=$("game-screen");
 const names={1:"Começando a aventura",2:"Mais frutas, mais desafios",3:"Hora de pensar rápido",4:"Desafio tropical",5:"Grande combinação"};
 function selectLevel(n){if(n>unlocked)return;selected=n;document.querySelectorAll(".level-node").forEach(node=>node.classList.toggle("current",Number(node.dataset.level)===selected));$("selected-level").textContent=String(n).padStart(2,"0")+" · "+(names[n]||"Nova aventura");}
 function showHome(){game.classList.add("hidden");home.classList.remove("hidden");document.dispatchEvent(new Event("fruitmatch:stop"));}
 function showGame(){home.classList.add("hidden");game.classList.remove("hidden");document.dispatchEvent(new CustomEvent("fruitmatch:start",{detail:{level:selected}}));}
 document.querySelectorAll(".level-node").forEach(node=>node.addEventListener("click",()=>selectLevel(Number(node.dataset.level))));
 $("play-button").addEventListener("click",showGame);
 $("back-home").addEventListener("click",showHome);
 document.addEventListener("fruitmatch:exit",showHome);
 document.addEventListener("fruitmatch:won",e=>{unlocked=Math.max(unlocked,Math.min(5,e.detail.level+1));document.querySelectorAll(".level-node").forEach(node=>{const n=Number(node.dataset.level);node.disabled=n>unlocked;node.querySelector("span").textContent=n<=unlocked?"⭐":"🔒";});$("home-coins").textContent=e.detail.coins;});
 document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));btn.classList.add("active");const panel=btn.dataset.panel;if(panel==="map"){$("home-notice").textContent="Selecione uma fase no mapa para jogar.";}else{const labels={friends:"Área de amigos será ativada na próxima etapa.",ranking:"Rankings serão ativados na próxima etapa.",shop:"Loja de moedas e diamantes em desenvolvimento.",upgrades:"Seus upgrades e recursos especiais ficarão aqui.",videos:"Vídeos premiados serão integrados ao AdMob."};$("home-notice").textContent=labels[panel];}$("home-notice").classList.add("show");clearTimeout(window.noticeTimer);window.noticeTimer=setTimeout(()=>$("home-notice").classList.remove("show"),2300);}));
 selectLevel(1);
})();