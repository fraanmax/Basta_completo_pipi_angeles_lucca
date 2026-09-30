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

const app = document.querySelector('#app');
let deck = [];
let current = null;
let isDrawing = false;
let confirmReset = false;

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function resetGame() {
  deck = shuffle(categories);
  current = null;
  confirmReset = false;
  render();
}

function handleReset() {
  const used = categories.length - deck.length;
  if (used === 0 || confirmReset) {
    resetGame();
    return;
  }
  confirmReset = true;
  render();
  window.setTimeout(() => {
    if (confirmReset) {
      confirmReset = false;
      render();
    }
  }, 3000);
}

function drawCard() {
  if (isDrawing || deck.length === 0) return;
  isDrawing = true;
  window.setTimeout(() => {
    current = deck.pop();
    isDrawing = false;
    render();
  }, 180);
}

function render() {
  const available = deck.length;
  const used = categories.length - available;
  const progress = Math.round((used / categories.length) * 100);
  const isFinished = available === 0 && current !== null;
  const cardNumber = used;

  const resetLabel = confirmReset ? '¿Seguro? Tocá de nuevo' : 'Empezar de nuevo';
  const resetClass = confirmReset ? 'restart-button confirm' : 'restart-button';

  app.innerHTML = `
    <div class="page-shell">
      <header class="topbar">
        <a class="brand" href="./" aria-label="App By Franmax, inicio">
          <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
          <span>App By Franmax</span>
        </a>
        <div class="top-actions">
          <button class="icon-button" type="button" data-action="help" aria-label="Cómo jugar">?</button>
          <button class="${resetClass}" type="button" data-action="reset"><span aria-hidden="true">↻</span> ${resetLabel}</button>
        </div>
      </header>

      <main class="main-content">
        <section class="intro" aria-labelledby="page-title">
          <p class="eyebrow">Creado para Pipi, Angeles y Lucca</p>
          <h1 id="page-title">App By<br /><em>Franmax</em></h1>
          <p class="lead">Sacá una tarjeta, pensá rápido y dejá que empiece la ronda.</p>
        </section>

        <section class="game-card" aria-live="polite">
          <div class="card-topline">
            <span class="round-label">${isFinished ? 'Partida completa' : current ? 'Categoría actual' : 'Tu turno comienza aquí'}</span>
            <span class="remaining-label">${available} ${available === 1 ? 'disponible' : 'disponibles'}</span>
          </div>
          <div class="card-body ${current ? 'has-category' : ''} ${isFinished ? 'is-finished' : ''}">
            <div class="card-stamp" aria-hidden="true">${isFinished ? '✓' : String(cardNumber).padStart(2, '0')}</div>
            <p class="card-kicker">${isFinished ? '¡Ronda terminada!' : current ? 'Respondan todos' : '¿Listos?'}</p>
            <h2>${isFinished ? 'Salieron todas las tarjetas.' : current || 'Sacá una tarjeta'}</h2>
            <p class="card-hint">${isFinished ? 'Volvé a mezclar para jugar otra vez.' : current ? 'Cuando todos respondan, saquen la siguiente.' : 'La primera respuesta puede ser la más divertida.'}</p>
          </div>
          <div class="card-footer">
            <div class="progress-wrap" aria-label="${progress}% de tarjetas utilizadas">
              <div class="progress-meta"><span>Progreso de la partida</span><strong>${used} / ${categories.length}</strong></div>
              <div class="progress-track"><span style="width: ${progress}%"></span></div>
            </div>
            <button class="draw-button" type="button" data-action="${isFinished ? 'reset' : 'draw'}">
              <span>${isFinished ? 'Empezar de nuevo' : current ? 'Siguiente tarjeta' : 'Sacar tarjeta'}</span>
              <b aria-hidden="true">→</b>
            </button>
          </div>
        </section>

        <section class="tips" aria-label="Consejos de juego">
          <div class="tip"><span class="tip-number">01</span><div><h3>Piensen juntos</h3><p>No hay respuestas correctas o incorrectas. La idea es pasarla bien.</p></div></div>
          <div class="tip"><span class="tip-number">02</span><div><h3>Sin repetir</h3><p>Cada tarjeta aparece una sola vez por partida.</p></div></div>
          <div class="tip"><span class="tip-number">03</span><div><h3>Para todas las edades</h3><p>Categorías simples, familiares y algunas para reírse.</p></div></div>
        </section>
      </main>
      <footer class="footer"><span>App By Franmax</span><span>Creado para Pipi, Angeles y Lucca.</span></footer>
    </div>
    <div class="modal-backdrop" data-action="close-help" hidden>
      <section class="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <button class="modal-close" type="button" data-action="close-help" aria-label="Cerrar">×</button>
        <p class="eyebrow">Cómo jugar</p>
        <h2 id="help-title">Una ronda en tres pasos.</h2>
        <ol><li>Toquen <strong>Sacar tarjeta</strong>.</li><li>Todos piensan una respuesta para la categoría.</li><li>Cuando terminen, pasen a la siguiente.</li></ol>
        <p class="modal-note">Las tarjetas no se repiten hasta que termina la partida. Pueden jugar con o sin una letra.</p>
      </section>
    </div>
  `;

  document.querySelectorAll('[data-action="draw"]').forEach((button) => button.addEventListener('click', drawCard));
  document.querySelectorAll('[data-action="reset"]').forEach((button) => button.addEventListener('click', handleReset));
  document.querySelector('[data-action="help"]')?.addEventListener('click', () => {
    const modal = document.querySelector('.modal-backdrop');
    if (modal) modal.hidden = false;
  });
  document.querySelectorAll('[data-action="close-help"]').forEach((button) => button.addEventListener('click', (event) => {
    if (event.target === event.currentTarget || event.currentTarget.classList.contains('modal-close')) {
      const modal = document.querySelector('.modal-backdrop');
      if (modal) modal.hidden = true;
    }
  }));
}

resetGame();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
