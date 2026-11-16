(() => {
  const FRUITS = ["🍓","🍊","🍇","🍋","🍉","🍍","🥝"];
  const SIZE = 25;
  let board = [];
  let tray = [];
  let score = 0;
  let history = [];
  let ended = false;
  let level = 1;

  const $ = (id) => document.getElementById(id);
  const boardEl = $("board");
  const trayEl = $("tray");

  function saveState() {
    history.push({board:[...board],tray:[...tray],score});
    if (history.length > 20) history.shift();
  }

  function newBoard() {
    board = Array.from({length:SIZE}, () => FRUITS[Math.floor(Math.random()*FRUITS.length)]);
    tray = [];
    score = 0;
    history = [];
    ended = false;
    $("overlay").classList.add("hidden");
    render();
  }

  function render() {
    boardEl.innerHTML = "";
    board.forEach((fruit,index) => {
      const tile = document.createElement("button");
      tile.className = "fruit" + (fruit ? "" : " empty");
      tile.type = "button";
      tile.textContent = fruit || "";
      tile.setAttribute("aria-label", fruit ? "Escolher " + fruit : "Espaço vazio");
      tile.disabled = !fruit || ended;
      tile.addEventListener("click", () => choose(index));
      boardEl.appendChild(tile);
    });

    trayEl.innerHTML = "";
    for (let i=0;i<5;i++) {
      const slot = document.createElement("div");
      slot.className = "slot" + (tray[i] ? " filled" : "");
      slot.textContent = tray[i] || "";
      trayEl.appendChild(slot);
    }
    $("tray-count").textContent = tray.length + " / 5";
    $("score").textContent = score.toLocaleString("pt-BR");
    $("level").textContent = String(level).padStart(2,"0");
    $("undo").disabled = !history.length || ended;
    $("shuffle").disabled = ended || board.filter(Boolean).length < 2;
    $("tray-hint").textContent = tray.length ? "Continue combinando. Não deixe os espaços lotarem!" : "Toque nas frutas para colocá-las aqui.";
  }

  function choose(index) {
    if (ended || !board[index]) return;
    saveState();
    const fruit = board[index];
    board[index] = null;
    tray.push(fruit);
    const count = tray.filter(item => item === fruit).length;
    if (count >= 3) {
      let removed = 0;
      tray = tray.filter(item => {
        if (item === fruit && removed < 3) { removed++; return false; }
        return true;
      });
      score += 30;
      $("tray-hint").textContent = "Boa! Três frutas combinadas! ✨";
    }
    if (board.every(item => !item)) {
      ended = true;
      render();
      showModal(true);
      return;
    }
    if (tray.length >= 5) {
      ended = true;
      render();
      showModal(false);
      return;
    }
    render();
  }

  function showModal(won) {
    $("modal-icon").textContent = won ? "🏆" : "💫";
    $("modal-eyebrow").textContent = won ? "MISSÃO CONCLUÍDA" : "FIM DE JOGO";
    $("modal-title").textContent = won ? "Você conseguiu!" : "A reserva lotou!";
    $("modal-message").textContent = won ? "Todas as frutas foram retiradas do tabuleiro. Pontuação: " + score + " pontos." : "Não há mais espaço para guardar frutas. Tente outra estratégia!";
    $("modal-action").textContent = won ? "PRÓXIMA FASE" : "TENTAR NOVAMENTE";
    $("overlay").classList.remove("hidden");
  }

  $("undo").addEventListener("click", () => {
    if (!history.length || ended) return;
    const previous = history.pop();
    board = previous.board;
    tray = previous.tray;
    score = previous.score;
    render();
  });

  $("shuffle").addEventListener("click", () => {
    if (ended) return;
    saveState();
    const positions = board.map((fruit,index) => fruit ? index : -1).filter(index => index >= 0);
    const values = positions.map(index => board[index]);
    for (let i=values.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [values[i],values[j]]=[values[j],values[i]];
    }
    positions.forEach((position,i) => board[position]=values[i]);
    render();
  });

  $("restart").addEventListener("click", newBoard);
  $("modal-action").addEventListener("click", () => {
    if (board.every(item => !item)) level++;
    newBoard();
  });

  newBoard();
})();