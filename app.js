const categories = [
  'Nombre de niña', 'Nombre de varón', 'Nombre de mascota', 'Nombre de superhéroe', 'Nombre de personaje de dibujos', 'Nombre que le pondrías a un bebé', 'Nombre que le pondrías a un perro', 'Nombre que le pondrías a un gato',
  'Comida', 'Fruta', 'Verdura', 'Golosina', 'Chocolate', 'Helado', 'Postre', 'Bebida', 'Algo que te gusta comer', 'Algo que no te gusta comer', 'Algo que comerías en una fiesta', 'Algo que comerías en el cine',
  'Algo que se come con cuchara', 'Algo que se come con la mano', 'Animal', 'Animal de granja', 'Animal salvaje', 'Animal que vuela', 'Animal que vive en el agua', 'Animal de cuatro patas', 'Animal pequeño', 'Animal grande',
  'Animal que da miedo', 'Animal que te gustaría tener', 'Animal que corre rápido', 'Animal que hace un ruido divertido', 'Juguete', 'Juego', 'Juego de mesa', 'Videojuego', 'Algo con lo que jugarías afuera',
  'Algo con lo que jugarías adentro', 'Algo que llevarías a una plaza', 'Algo que llevarías a la escuela', 'Personaje de dibujos animados', 'Superhéroe o superheroína', 'Princesa', 'Personaje de película',
  'Personaje de Disney', 'Personaje de anime', 'Villano', 'Personaje que te hace reír', 'Personaje que te gustaría ser', 'Personaje con el que te gustaría ser amigo', 'Cosa de la escuela', 'Cosa que hay en una mochila',
  'Cosa de la casa', 'Cosa de la cocina', 'Cosa del baño', 'Cosa que hay en un dormitorio', 'Prenda de ropa', 'Algo que te ponés en los pies', 'Algo que te ponés en la cabeza',
  'Algo que usás todos los días', 'Algo que llevás en el bolsillo', 'Algo que tiene botones', 'Algo que tiene ruedas', 'Algo que se puede abrir', 'Algo que se puede cerrar', 'País', 'Ciudad',
  'Lugar de vacaciones', 'Lugar donde hace mucho frío', 'Lugar donde hace mucho calor', 'Lugar donde hay agua', 'Lugar donde hay muchos animales', 'Lugar donde te gustaría viajar', 'Algo que encontrás en una plaza',
  'Algo que encontrás en un parque', 'Algo que encontrás en la playa', 'Algo que encontrás en el campo', 'Algo que encontrás en la calle', 'Algo que encontrás en el cielo', 'Algo de la naturaleza',
  'Algo que te hace reír', 'Algo que te da miedo', 'Algo que te pone feliz', 'Algo que te gusta mucho', 'Algo que no te gusta', 'Algo que te gustaría tener', 'Algo que te gustaría aprender',
  'Algo que te gustaría hacer', 'Algo que te gustaría regalar', 'Algo que harías si fueras invisible', 'Algo que llevarías a una isla desierta', 'Algo que harías si pudieras volar'
];

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V'];
const ROUND_TIME = 15;
const SUSPENSE_DURATION = 3000;

const app = document.querySelector('#app');

let state = 'setup';
let players = [];
let activePlayers = [];
let currentPlayerIndex = 0;
let currentCategory = null;
let currentLetter = null;
let timeLeft = ROUND_TIME;
let timerInterval = null;
let suspenseTimeout = null;
let usedCategories = [];
let lastEliminatedPlayer = null;

let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function beep(freq, duration, type, volume) {
  type = type || 'square';
  volume = volume || 0.15;
  try {
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
}

function playTick(secondsLeft) {
  if (secondsLeft <= 3) beep(900 + (4 - secondsLeft) * 150, 0.12, 'square', 0.18);
  else beep(600, 0.08, 'square', 0.12);
}

function playBuzzer() {
  try {
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.7);
  } catch (e) {
    console.error(e);
  }
}

function playSuspenseBeep() {
  beep(440, 0.1, 'sine', 0.1);
}

function playPassSound() {
  beep(880, 0.06, 'sine', 0.12);
  setTimeout(function() { beep(1320, 0.08, 'sine', 0.1); }, 60);
}

function playWinSound() {
  const freqs = [523, 659, 784, 1047];
  freqs.forEach(function(f, i) {
    setTimeout(function() { beep(f, 0.18, 'triangle', 0.15); }, i * 120);
  });
}

function pickCategory() {
  if (usedCategories.length >= categories.length) usedCategories = [];
  const remaining = categories.filter(function(c) { return !usedCategories.includes(c); });
  const cat = remaining[Math.floor(Math.random() * remaining.length)];
  usedCategories.push(cat);
  return cat;
}

function pickLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function clearTimers() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (suspenseTimeout) { clearTimeout(suspenseTimeout); suspenseTimeout = null; }
}

function startNewTurn() {
  clearTimers();
  currentCategory = pickCategory();
  currentLetter = null;
  state = 'suspense';
  render();

  playSuspenseBeep();
  suspenseTimeout = setTimeout(function() {
    playSuspenseBeep();
  }, SUSPENSE_DURATION / 2);

  suspenseTimeout = setTimeout(function() {
    currentLetter = pickLetter();
    timeLeft = ROUND_TIME;
    state = 'playing';
    render();
    startTimer();
  }, SUSPENSE_DURATION);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  playTick(timeLeft);
  timerInterval = setInterval(function() {
    timeLeft--;
    if (timeLeft <= 0) {
      clearTimers();
      playBuzzer();
      eliminateCurrentPlayer();
    } else {
      playTick(timeLeft);
      updateTimerDisplay();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.querySelector('.timer-display');
  if (el) {
    el.textContent = timeLeft;
    el.classList.toggle('timer-urgent', timeLeft <= 3);
  }
  const ring = document.querySelector('.timer-ring-fill');
  if (ring) {
    const pct = (timeLeft / ROUND_TIME) * 100;
    ring.style.strokeDashoffset = 283 - (283 * pct) / 100;
  }
}

function passTurn() {
  if (state !== 'playing') return;
  playPassSound();
  clearTimers();
  currentPlayerIndex = (currentPlayerIndex + 1) % activePlayers.length;
  startNewTurn();
}

function eliminateCurrentPlayer() {
  lastEliminatedPlayer = activePlayers[currentPlayerIndex];
  activePlayers.splice(currentPlayerIndex, 1);
  if (currentPlayerIndex >= activePlayers.length) currentPlayerIndex = 0;
  
  if (activePlayers.length <= 1) {
    state = 'winner';
    playWinSound();
    render();
  } else {
    state = 'eliminated';
    render();
  }
}

function continueWithoutPlayer() {
  if (activePlayers.length <= 1) {
    state = 'winner';
    playWinSound();
    render();
    return;
  }
  startNewTurn();
}

function newGame() {
  clearTimers();
  state = 'setup';
  players = [];
  activePlayers = [];
  currentPlayerIndex = 0;
  currentCategory = null;
  currentLetter = null;
  usedCategories = [];
  lastEliminatedPlayer = null;
  render();
}

function addPlayer(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  players.push(trimmed);
  render();
}

function removePlayer(index) {
  players.splice(index, 1);
  render();
}

function startGame() {
  if (players.length < 2) return;
  activePlayers = [...players];
  currentPlayerIndex = 0;
  usedCategories = [];
  startNewTurn();
}

function render() {
  if (!app) return;
  const screens = {
    setup: renderSetup,
    suspense: renderSuspense,
    playing: renderPlaying,
    eliminated: renderEliminated,
    winner: renderWinner,
  };
  app.innerHTML = screens[state]();
  attachHandlers();
}

function shell(inner, showReset) {
  if (showReset === undefined) showReset = true;
  const resetBtn = showReset && state !== 'setup' && state !== 'winner'
    ? '<button class="restart-button" type="button" data-action="newgame"><span aria-hidden="true">↻</span> Nueva partida</button>'
    : '';
  return '<div class="page-shell">' +
    '<header class="topbar">' +
      '<a class="brand" href="./" aria-label="App By Franmax, inicio">' +
        '<span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>' +
        '<span>App By Franmax</span>' +
      '</a>' +
      '<div class="top-actions">' +
        '<button class="icon-button" type="button" data-action="help" aria-label="Cómo jugar">?</button>' +
        resetBtn +
      '</div>' +
    '</header>' +
    '<main class="main-content">' + inner + '</main>' +
    '<footer class="footer"><span>App By Franmax</span><span>Creado para Pipi, Angeles y Lucca.</span></footer>' +
  '</div>' +
  helpModal();
}

function helpModal() {
  return '<div class="modal-backdrop" data-action="close-help" hidden>' +
    '<section class="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">' +
      '<button class="modal-close" type="button" data-action="close-help" aria-label="Cerrar">×</button>' +
      '<p class="eyebrow">Cómo jugar</p>' +
      '<h2 id="help-title">Basta Electrónico</h2>' +
      '<ol>' +
        '<li>Ingresá los nombres de los jugadores.</li>' +
        '<li>En cada turno la app te dará una categoría y una letra al azar.</li>' +
        '<li>Decí rápido una palabra que corresponda antes de que expire el tiempo.</li>' +
        '<li>Tocá el botón para pasar el celular al siguiente jugador. ¡La tarjeta y letra cambiarán!</li>' +
        '<li>Si se termina la cuenta regresiva, quedás eliminado. ¡Gana el último en pie!</li>' +
      '</ol>' +
      '<p class="modal-note">Pasen el celular entre ustedes en cada turno.</p>' +
    '</section>' +
  '</div>';
}

function renderSetup() {
  const playerList = players.map(function(p, i) {
    return '<li class="player-chip">' +
      '<span>' + escapeHtml(p) + '</span>' +
      '<button class="chip-remove" type="button" data-action="remove" data-index="' + i + '" aria-label="Quitar">×</button>' +
    '</li>';
  }).join('');

  const inputCount = Math.max(2, players.length);
  var playerInputs = '';
  for (var i = 0; i < inputCount; i++) {
    var val = players[i] || '';
    playerInputs += '<input class="name-input" type="text" data-index="' + i + '" value="' + escapeAttr(val) + '" placeholder="Jugador ' + (i + 1) + '" maxlength="20" />';
  }

  return shell(
    '<section class="setup-screen">' +
      '<p class="eyebrow">Creado para Pipi, Angeles y Lucca</p>' +
      '<h1>App By<br /><em>Franmax</em></h1>' +
      '<p class="lead">Basta Electrónico: pasen el celular, digan la palabra y que no se acabe el tiempo.</p>' +
      '<div class="setup-card">' +
        '<h2 class="setup-title">¿Quiénes van a jugar?</h2>' +
        '<p class="setup-hint">Escribí los nombres y después tocá Empezar. Mínimo 2 jugadores.</p>' +
        '<div class="name-inputs">' + playerInputs + '</div>' +
        '<button class="add-player-btn" type="button" data-action="addplayer">+ Agregar jugador</button>' +
        (players.length > 0 ? '<ul class="player-list">' + playerList + '</ul>' : '') +
        '<button class="start-game-btn" type="button" data-action="start">Empezar a jugar</button>' +
      '</div>' +
    '</section>',
    false
  );
}

function renderSuspense() {
  const playerName = escapeHtml(activePlayers[currentPlayerIndex] || '');
  return shell(
    '<section class="suspense-screen">' +
      '<div class="suspense-card">' +
        '<p class="suspense-turn-label">Le toca a</p>' +
        '<h2 class="suspense-player">' + playerName + '</h2>' +
        '<div class="suspense-spinner" aria-hidden="true">' +
          '<div class="spinner-ring"></div>' +
          '<div class="spinner-ring"></div>' +
          '<div class="spinner-ring"></div>' +
        '</div>' +
        '<p class="suspense-category-label">Categoría</p>' +
        '<h3 class="suspense-category">' + escapeHtml(currentCategory || '') + '</h3>' +
        '<p class="suspense-hint">Preparando la letra...</p>' +
      '</div>' +
    '</section>'
  );
}

function renderPlaying() {
  const playerName = escapeHtml(activePlayers[currentPlayerIndex] || '');
  const nextIndex = (currentPlayerIndex + 1) % activePlayers.length;
  const nextPlayer = escapeHtml(activePlayers[nextIndex] || '');
  const remaining = activePlayers.length;
  const ringDash = 283 - (283 * (timeLeft / ROUND_TIME)) / 100;

  return shell(
    '<section class="playing-screen">' +
      '<div class="playing-card">' +
        '<div class="playing-topline">' +
          '<span class="round-label">Le toca a</span>' +
          '<span class="remaining-label">' + remaining + ' ' + (remaining === 1 ? 'jugador' : 'jugadores') + ' en pie</span>' +
        '</div>' +
        '<h2 class="playing-player">' + playerName + '</h2>' +
        '<div class="category-letter-block">' +
          '<div class="category-block">' +
            '<p class="block-label">Categoría</p>' +
            '<h3 class="block-value category-value">' + escapeHtml(currentCategory || '') + '</h3>' +
          '</div>' +
          '<div class="letter-block">' +
            '<p class="block-label">Letra</p>' +
            '<h3 class="block-value letter-value">' + (currentLetter || '') + '</h3>' +
          '</div>' +
        '</div>' +
        '<div class="timer-section">' +
          '<div class="timer-ring">' +
            '<svg viewBox="0 0 100 100" class="timer-svg">' +
              '<circle class="timer-ring-bg" cx="50" cy="50" r="45" />' +
              '<circle class="timer-ring-fill" cx="50" cy="50" r="45" style="stroke-dashoffset: ' + ringDash + '" />' +
            '</svg>' +
            '<span class="timer-display ' + (timeLeft <= 3 ? 'timer-urgent' : '') + '">' + timeLeft + '</span>' +
          '</div>' +
        '</div>' +
        '<button class="pass-button" type="button" data-action="pass">' +
          '<span>¡Dije la palabra!</span>' +
          '<b>Pasar a ' + nextPlayer + ' →</b>' +
        '</button>' +
      '</div>' +
    '</section>'
  );
}

function renderEliminated() {
  const remainingList = activePlayers.map(function(p) { return '<li>' + escapeHtml(p) + '</li>'; }).join('');

  return shell(
    '<section class="eliminated-screen">' +
      '<div class="eliminated-card">' +
        '<div class="eliminated-icon" aria-hidden="true">⏰</div>' +
        '<h2>' + escapeHtml(lastEliminatedPlayer || 'Un jugador') + ' ha quedado fuera de esta ronda</h2>' +
        '<p class="eliminated-hint">Jugadores restantes:</p>' +
        '<ul class="remaining-players">' + remainingList + '</ul>' +
        '<div class="eliminated-actions">' +
          '<button class="btn-continue" type="button" data-action="continue">Seguir jugando</button>' +
          '<button class="btn-newgame" type="button" data-action="newgame">Iniciar nueva partida</button>' +
        '</div>' +
      '</div>' +
    '</section>'
  );
}

function renderWinner() {
  const winner = activePlayers[0] || '';
  return shell(
    '<section class="winner-screen">' +
      '<div class="winner-card">' +
        '<div class="winner-trophy" aria-hidden="true">🏆</div>' +
        '<p class="eyebrow">¡Fin de la partida!</p>' +
        '<h2>¡' + escapeHtml(winner) + ' es el ganador!</h2>' +
        '<p class="winner-hint">Sobreviviste a todas las rondas.</p>' +
        '<button class="btn-newgame btn-winner" type="button" data-action="newgame">Jugar de nuevo</button>' +
      '</div>' +
    '</section>',
    false
  );
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

function attachHandlers() {
  document.querySelectorAll('[data-action="pass"]').forEach(function(b) {
    b.addEventListener('click', function() { ensureAudio(); passTurn(); });
  });
  document.querySelectorAll('[data-action="continue"]').forEach(function(b) {
    b.addEventListener('click', continueWithoutPlayer);
  });
  document.querySelectorAll('[data-action="newgame"]').forEach(function(b) {
    b.addEventListener('click', newGame);
  });
  document.querySelectorAll('[data-action="start"]').forEach(function(b) {
    b.addEventListener('click', function() {
      collectNames();
      if (players.length >= 2) { ensureAudio(); startGame(); }
    });
  });
  document.querySelectorAll('[data-action="addplayer"]').forEach(function(b) {
    b.addEventListener('click', function() {
      collectNames();
      players.push('');
      render();
      const inputs = document.querySelectorAll('.name-input');
      if (inputs.length) inputs[inputs.length - 1].focus();
    });
  });
  document.querySelectorAll('[data-action="remove"]').forEach(function(b) {
    b.addEventListener('click', function(e) {
      collectNames();
      removePlayer(parseInt(e.currentTarget.dataset.index, 10));
    });
  });
  document.querySelectorAll('.name-input').forEach(function(input) {
    input.addEventListener('input', function() { collectNames(); });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        collectNames();
        if (players.length >= 2) { ensureAudio(); startGame(); }
      }
    });
  });
  
  const helpBtn = document.querySelector('[data-action="help"]');
  if (helpBtn) {
    helpBtn.addEventListener('click', function() {
      const modal = document.querySelector('.modal-backdrop');
      if (modal) modal.hidden = false;
    });
  }

  document.querySelectorAll('[data-action="close-help"]').forEach(function(b) {
    b.addEventListener('click', function(e) {
      if (e.target === e.currentTarget || e.currentTarget.classList.contains('modal-close')) {
        const modal = document.querySelector('.modal-backdrop');
        if (modal) modal.hidden = true;
      }
    });
  });
}

function collectNames() {
  const inputs = document.querySelectorAll('.name-input');
  const newPlayers = [];
  inputs.forEach(function(input) {
    const val = input.value.trim();
    if (val) newPlayers.push(val);
  });
  players = newPlayers;
}

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js').catch(function() {});
  });
}