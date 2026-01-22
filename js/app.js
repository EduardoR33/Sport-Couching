import {
  velocidad40,
  aceleracion10,
  explosividad,
  agilidad
} from './calculations.js';

import { guardarEvaluacion, obtenerJugadores } from './storage.js';

/* =======================
   ELEMENTOS DOM
======================= */
const form = document.getElementById('playerForm');
const resultado = document.getElementById('resultado');
const contenido = document.getElementById('resultadosContenido');
const rankingLista = document.getElementById('rankingLista');
const fichaJugador = document.getElementById('fichaJugador');
const fichaContenido = document.getElementById('fichaContenido');
const comparacion = document.getElementById('comparacion');
const comparacionContenido = document.getElementById('comparacionContenido');
const graficaSeccion = document.getElementById('graficaSeccion');

const canvasGrafica = document.getElementById('graficaJugador');
const ctxGrafica = canvasGrafica.getContext('2d');

let grafica = null;
let seleccionados = [];

/* =======================
   INPUTS
======================= */
const nombre = document.getElementById('nombre');
const edad = document.getElementById('edad');
const estatura = document.getElementById('estatura');
const peso = document.getElementById('peso');
const posicion = document.getElementById('posicion');
const sprint40 = document.getElementById('sprint40');
const sprint10 = document.getElementById('sprint10');
const proAgility = document.getElementById('proAgility');
const cone = document.getElementById('cone');
const saltoVertical = document.getElementById('saltoVertical');
const saltoLargo = document.getElementById('saltoLargo');

/* =======================
   SUBMIT
======================= */
form.addEventListener('submit', e => {
  e.preventDefault();

  const data = {
    nombre: nombre.value,
    edad: Number(edad.value),
    estatura: Number(estatura.value),
    peso: Number(peso.value),
    posicion: posicion.value,
    sprint40: Number(sprint40.value),
    sprint10: Number(sprint10.value),
    proAgility: Number(proAgility.value),
    cone: Number(cone.value),
    saltoVertical: Number(saltoVertical.value),
    saltoLargo: Number(saltoLargo.value)
  };

  const metricas = calcularMetricas(data);
  const score = scorePorPosicion(metricas, data.posicion);
  const nivel = nivelJugador(score);

  const jugadores = obtenerJugadores();
  const existe = jugadores.find(j => j.nombre === data.nombre && j.posicion === data.posicion);

  const jugador = {
    id: existe ? existe.id : crypto.randomUUID(),
    ...data,
    metricas,
    score,
    nivel,
    fecha: new Date().toISOString()
  };

  guardarEvaluacion(jugador);
  mostrarResultados(metricas, score, nivel);
  mostrarRanking();
});

/* =======================
   CÁLCULOS
======================= */
function calcularMetricas(d) {
  return {
    velocidad: velocidad40(d.sprint40),
    aceleracion: aceleracion10(d.sprint10),
    explosividad: explosividad(d.saltoVertical, d.peso),
    agilidad: agilidad(d.proAgility, d.cone)
  };
}

const pesosPorPosicion = {
  QB: { velocidad: 0.25, aceleracion: 0.15, explosividad: 0.2, agilidad: 0.4 },
  WR: { velocidad: 0.35, aceleracion: 0.25, explosividad: 0.25, agilidad: 0.15 },
  DB: { velocidad: 0.3, aceleracion: 0.25, explosividad: 0.15, agilidad: 0.3 },
  RB: { velocidad: 0.3, aceleracion: 0.3, explosividad: 0.25, agilidad: 0.15 },
  C:  { velocidad: 0.15, aceleracion: 0.15, explosividad: 0.4, agilidad: 0.3 }
};

function scorePorPosicion(m, pos) {
  const p = pesosPorPosicion[pos];
  return Number((
    m.velocidad * p.velocidad +
    m.aceleracion * p.aceleracion +
    m.explosividad * p.explosividad +
    m.agilidad * p.agilidad
  ).toFixed(2));
}

function nivelJugador(score) {
  if (score >= 85) return 'Elite';
  if (score >= 70) return 'Competitivo';
  return 'Desarrollo';
}

/* =======================
   RESULTADOS
======================= */
function mostrarResultados(m, score, nivel) {
  resultado.hidden = false;
  contenido.innerHTML = `
    <p><strong>Velocidad:</strong> ${m.velocidad.toFixed(2)}</p>
    <p><strong>Aceleración:</strong> ${m.aceleracion.toFixed(2)}</p>
    <p><strong>Explosividad:</strong> ${m.explosividad.toFixed(1)}</p>
    <p><strong>Agilidad:</strong> ${m.agilidad.toFixed(2)}</p>
    <hr>
    <p><strong>Score:</strong> ${score}</p>
    <p><strong>Nivel:</strong> ${nivel}</p>
  `;
}

/* =======================
   RANKING
======================= */
function mostrarRanking() {
  const jugadores = obtenerJugadores();
  rankingLista.innerHTML = '';

  if (!jugadores.length) {
    rankingLista.innerHTML = '<li>No hay jugadores registrados</li>';
    return;
  }

  jugadores
    .sort((a, b) => b.score - a.score)
    .forEach((j, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>#${i + 1}</strong> ${j.nombre} (${j.posicion})<br>
        Score: <strong>${j.score}</strong> – ${j.nivel}
      `;
      li.style.cursor = 'pointer';

      li.onclick = () => {
        mostrarFicha(j);
        mostrarGrafica(j);
        seleccionarJugador(j);
      };

      rankingLista.appendChild(li);
    });
}

/* =======================
   FICHA
======================= */
function mostrarFicha(j) {
  fichaJugador.hidden = false;
  fichaContenido.innerHTML = `
    <p><strong>${j.nombre}</strong></p>
    <p>Edad: ${j.edad}</p>
    <p>Estatura: ${j.estatura} cm</p>
    <p>Peso: ${j.peso} kg</p>
    <p>Posición: ${j.posicion}</p>
  `;
}

/* =======================
   COMPARACIÓN
======================= */
function seleccionarJugador(j) {
  if (seleccionados.find(x => x.id === j.id)) return;
  seleccionados.push(j);

  if (seleccionados.length === 2) {
    mostrarComparacion(seleccionados[0], seleccionados[1]);
    seleccionados = [];
  }
}

function mostrarComparacion(a, b) {
  comparacion.hidden = false;
  comparacionContenido.innerHTML = `
    <table>
      <tr><th></th><th>${a.nombre}</th><th>${b.nombre}</th></tr>
      <tr><td>Score</td><td>${a.score}</td><td>${b.score}</td></tr>
    </table>
  `;
}

/* =======================
   GRÁFICA RADAR
======================= */
function mostrarGrafica(j) {
  graficaSeccion.hidden = false;

  requestAnimationFrame(() => {
    if (grafica) grafica.destroy();

    grafica = new Chart(ctxGrafica, {
      type: 'radar',
      data: {
        labels: ['Velocidad', 'Aceleración', 'Explosividad', 'Agilidad'],
        datasets: [{
          label: j.nombre,
          data: [
            j.metricas.velocidad,
            j.metricas.aceleracion,
            j.metricas.explosividad,
            j.metricas.agilidad
          ],
          backgroundColor: 'rgba(0, 132, 255, 0.35)',
          borderColor: '#0084ff',
          borderWidth: 3,
          pointBackgroundColor: '#ffcc00'
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: { beginAtZero: true, max: 100 }
        }
      }
    });
  });
}

/* =======================
   PDF
======================= */
const btnPDF = document.getElementById('btnPDF');
btnPDF.addEventListener('click', generarPDF);

async function generarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const canvas = await html2canvas(document.querySelector('main'));
  const img = canvas.toDataURL('image/png');

  pdf.addImage(img, 'PNG', 0, 0, 210, 297);
  pdf.save(`Combine_${nombre.value}.pdf`);
}

/* =======================
   INIT
======================= */
mostrarRanking();

// =======================
// PLAYBOOK – DIBUJO DE RUTAS
// =======================

const coloresPosicion = {
  QB: '#2563eb', // azul
  WR: '#dc2626', // rojo
  RB: '#16a34a', // verde
  C:  '#7c3aed', // morado
  DB: '#f97316'  // naranja
};

const field = document.getElementById('field');
const ctxField = field.getContext('2d');

let dibujando = false;
let ultimoX = 0;
let ultimoY = 0;

// Dibujar campo base
function dibujarCampoBase() {
  ctxField.clearRect(0, 0, field.width, field.height);

  // Fondo
  ctxField.fillStyle = '#0f7a3a';
  ctxField.fillRect(0, 0, field.width, field.height);

  // Bordes
  ctxField.strokeStyle = '#ffffff';
  ctxField.lineWidth = 2;
  ctxField.strokeRect(20, 20, field.width - 40, field.height - 40);

  // Yardas
  for (let i = 1; i <= 4; i++) {
    ctxField.beginPath();
    ctxField.moveTo(20, i * 90);
    ctxField.lineTo(field.width - 20, i * 90);
    ctxField.stroke();
  }
}

// Inicializar campo
dibujarCampoBase();

// ===== INICIO DE TRAZO =====
field.addEventListener('mousedown', e => {
  dibujando = true;
  const rect = field.getBoundingClientRect();
  ultimoX = e.clientX - rect.left;
  ultimoY = e.clientY - rect.top;
  ctxField.fillStyle = coloresPosicion[selectPosicionRuta.value];
  ctxField.beginPath();
 ctxField.arc(ultimoX, ultimoY, 6, 0, Math.PI * 2);
 ctxField.fill();
});

// ===== DIBUJAR RUTA =====
field.addEventListener('mousemove', e => {
  if (!dibujando) return;

  const rect = field.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const posicion = selectPosicionRuta.value;
  ctxField.strokeStyle = coloresPosicion[posicion] || '#facc15';
  ctxField.lineWidth = 4;
  ctxField.lineCap = 'round';

  ctxField.beginPath();
  ctxField.moveTo(ultimoX, ultimoY);
  ctxField.lineTo(x, y);
  ctxField.stroke();

  ultimoX = x;
  ultimoY = y;
});

// ===== TERMINAR TRAZO =====
field.addEventListener('mouseup', () => {
  dibujando = false;
});

field.addEventListener('mouseleave', () => {
  dibujando = false;
});

// ===== LIMPIAR CAMPO =====
document.getElementById('limpiarCampo')
  .addEventListener('click', () => {
    dibujarCampoBase();
  });

  const selectPosicionRuta = document.getElementById('posicionRuta');
