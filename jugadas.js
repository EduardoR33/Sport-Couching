// =======================
// SISTEMA DE JUGADAS
// =======================

const canvas = document.getElementById('campo');
const ctx = canvas.getContext('2d');

const btnJugadas = document.getElementById('btnJugadas');
const jugadasSeccion = document.getElementById('jugadasSeccion');
const guardarJugadaBtn = document.getElementById('guardarJugada');
const listaJugadas = document.getElementById('listaJugadas');
const nombreJugadaInput = document.getElementById('nombreJugada');
const tipoJugadaSelect = document.getElementById('tipoJugada');
const descripcionJugadaInput = document.getElementById('descripcionJugada');

let rutas = [];
let rutaActual = null;
let dibujando = false;

// =======================
// MOSTRAR SECCIÓN
// =======================
btnJugadas.addEventListener('click', () => {
  jugadasSeccion.hidden = !jugadasSeccion.hidden;
  dibujarCampo();
});

// =======================
// DIBUJAR CAMPO
// =======================
function dibujarCampo() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // fondo
  ctx.fillStyle = '#0f7a3a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // bordes
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // yardas
  ctx.lineWidth = 1;
  for (let i = 1; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(20, i * (canvas.height / 7));
    ctx.lineTo(canvas.width - 20, i * (canvas.height / 7));
    ctx.stroke();
  }

  // volver a dibujar rutas guardadas
  rutas.forEach(ruta => dibujarRuta(ruta));
}

// =======================
// DIBUJAR RUTA
// =======================
function dibujarRuta(ruta) {
  if (ruta.puntos.length === 0) return;

  // jugador
  const inicio = ruta.puntos[0];
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(inicio.x, inicio.y, 10, 0, Math.PI * 2);
  ctx.fill();

  // línea de ruta
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(inicio.x, inicio.y);

  for (let i = 1; i < ruta.puntos.length; i++) {
    ctx.lineTo(ruta.puntos[i].x, ruta.puntos[i].y);
  }

  ctx.stroke();
}

// =======================
// INTERACCIÓN
// =======================

// 👉 click = empieza ruta si no existe, y agrega puntos
canvas.addEventListener('mousedown', e => {
  dibujando = true;

  // si no hay ruta activa → crearla
  if (!rutaActual) {
    rutaActual = {
      puntos: []
    };
    rutas.push(rutaActual);
  }

  agregarPunto(e);
});

canvas.addEventListener('mousemove', e => {
  if (!dibujando || !rutaActual) return;
  agregarPunto(e);
});

canvas.addEventListener('mouseup', () => {
  dibujando = false;
});

canvas.addEventListener('mouseleave', () => {
  dibujando = false;
});

function agregarPunto(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  rutaActual.puntos.push({ x, y });
  dibujarCampo();
}

// =======================
// GUARDAR JUGADA
// =======================
guardarJugadaBtn.addEventListener('click', () => {
  if (!nombreJugadaInput.value || rutas.length === 0) {
    alert('Dibuja una jugada y ponle nombre');
    return;
  }

  const jugada = {
    id: crypto.randomUUID(),
    nombre: nombreJugadaInput.value,
    tipo: tipoJugadaSelect.value,
    descripcion: descripcionJugadaInput.value,
    rutas
  };

  const guardadas = JSON.parse(localStorage.getItem('jugadas')) || [];
  guardadas.push(jugada);
  localStorage.setItem('jugadas', JSON.stringify(guardadas));

  nombreJugadaInput.value = '';
  descripcionJugadaInput.value = '';
  rutas = [];
  rutaActual = null;

  dibujarCampo();
  mostrarJugadas();
});

// =======================
// LISTAR JUGADAS
// =======================
function mostrarJugadas() {
  listaJugadas.innerHTML = '';
  const jugadas = JSON.parse(localStorage.getItem('jugadas')) || [];

  jugadas.forEach(j => {
    const li = document.createElement('li');
    li.textContent = `📋 ${j.nombre} (${j.tipo})`;
    li.style.cursor = 'pointer';

    li.addEventListener('click', () => cargarJugada(j));
    listaJugadas.appendChild(li);
  });
}

// =======================
// CARGAR JUGADA
// =======================
function cargarJugada(jugada) {
  rutas = jugada.rutas;
  rutaActual = null;
  dibujarCampo();
}

// =======================
// INIT
// =======================
dibujarCampo();
mostrarJugadas();
