import {
  velocidad40,
  aceleracion10,
  explosividad,
  agilidad
} from './calculations.js';

import { guardarEvaluacion, obtenerJugadores } from './storage.js';

// =======================
// ELEMENTOS DEL DOM
// =======================
const form = document.getElementById('playerForm');
const resultado = document.getElementById('resultado');
const contenido = document.getElementById('resultadosContenido');
const rankingLista = document.getElementById('rankingLista');
const fichaJugador = document.getElementById('fichaJugador');
const fichaContenido = document.getElementById('fichaContenido');
const comparacion = document.getElementById('comparacion');
const comparacionContenido = document.getElementById('comparacionContenido');

const graficaSeccion = document.getElementById('graficaSeccion');
const ctxGrafica = document.getElementById('graficaJugador').getContext('2d');

let grafica = null;
let seleccionados = [];

// =======================
// INPUTS
// =======================
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

// =======================
// SUBMIT
// =======================
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
  const existe = jugadores.find(j =>
    j.nombre === data.nombre && j.posicion === data.posicion
  );

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

// =======================
// CÁLCULOS
// =======================
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
  C: { velocidad: 0.15, aceleracion: 0.15, explosividad: 0.4, agilidad: 0.3 }
};

function scorePorPosicion(metricas, posicion) {
  const p = pesosPorPosicion[posicion];
  return Number((
    metricas.velocidad * p.velocidad +
    metricas.aceleracion * p.aceleracion +
    metricas.explosividad * p.explosividad +
    metricas.agilidad * p.agilidad
  ).toFixed(2));
}

function nivelJugador(score) {
  if (score >= 85) return 'Elite';
  if (score >= 70) return 'Competitivo';
  return 'Desarrollo';
}

// =======================
// RESULTADOS
// =======================
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

// =======================
// RANKING
// =======================
function mostrarRanking() {
  const jugadores = obtenerJugadores();
  rankingLista.innerHTML = '';

  if (!jugadores.length) {
    rankingLista.innerHTML = '<li>No hay jugadores registrados</li>';
    return;
  }

  jugadores
    .sort((a, b) => b.score - a.score)
    .forEach((j, index) => {
      const li = document.createElement('li');

      li.innerHTML = `
        <strong>#${index + 1}</strong> ${j.nombre} (${j.posicion})<br>
        Score: <strong>${j.score}</strong> – ${j.nivel}
      `;

      li.style.cursor = 'pointer';

      li.addEventListener('click', () => {
        mostrarFicha(j);
        mostrarGrafica(j);
        seleccionarJugador(j);
        li.classList.add('seleccionado');
      });

      rankingLista.appendChild(li);
    });
}

// =======================
// FICHA
// =======================
function mostrarFicha(j) {
  fichaJugador.hidden = false;

  fichaContenido.innerHTML = `
    <p><strong>${j.nombre}</strong></p>
    <p>Edad: ${j.edad}</p>
    <p>Estatura: ${j.estatura} cm</p>
    <p>Peso: ${j.peso} kg</p>
    <p>Posición: ${j.posicion}</p>
    <hr>
    <p>40 yd: ${j.sprint40}s</p>
    <p>10 yd: ${j.sprint10}s</p>
    <p>Pro Agility: ${j.proAgility}s</p>
    <p>3 Cone: ${j.cone}s</p>
    <p>Salto Vertical: ${j.saltoVertical} cm</p>
    <p>Salto Largo: ${j.saltoLargo} cm</p>
  `;

  fichaJugador.scrollIntoView({ behavior: 'smooth' });
}

// =======================
// COMPARACIÓN
// =======================
function seleccionarJugador(jugador) {
  if (seleccionados.find(j => j.id === jugador.id)) return;

  seleccionados.push(jugador);

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
      <tr><td>Velocidad</td><td>${a.metricas.velocidad.toFixed(2)}</td><td>${b.metricas.velocidad.toFixed(2)}</td></tr>
      <tr><td>Aceleración</td><td>${a.metricas.aceleracion.toFixed(2)}</td><td>${b.metricas.aceleracion.toFixed(2)}</td></tr>
      <tr><td>Explosividad</td><td>${a.metricas.explosividad.toFixed(1)}</td><td>${b.metricas.explosividad.toFixed(1)}</td></tr>
      <tr><td>Agilidad</td><td>${a.metricas.agilidad.toFixed(2)}</td><td>${b.metricas.agilidad.toFixed(2)}</td></tr>
    </table>
  `;
}

// =======================
// GRÁFICA RADAR
// =======================
function mostrarGrafica(jugador) {
  graficaSeccion.hidden = false;

  // ⏳ esperar al siguiente repaint del navegador
  requestAnimationFrame(() => {
    const data = {
      labels: ['Velocidad', 'Aceleración', 'Explosividad', 'Agilidad'],
      datasets: [{
        label: jugador.nombre,
        data: [
          jugador.metricas.velocidad,
          jugador.metricas.aceleracion,
          jugador.metricas.explosividad,
          jugador.metricas.agilidad
        ],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.25)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
        pointRadius: 5
      }]
    };

    if (grafica) grafica.destroy();

    grafica = new Chart(ctxGrafica, {
      type: 'radar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  });
}

const btnPDF = document.getElementById('btnPDF');

btnPDF.addEventListener('click', generarPDF);

async function generarPDF() {
  fichaJugador.hidden = false;
  graficaSeccion.hidden = false;

  await new Promise(resolve => setTimeout(resolve, 300));

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');

  let y = 15;

  // ===== TÍTULO =====
  pdf.setFontSize(18);
  pdf.text('Flag Football Combine Report', 105, y, { align: 'center' });
  y += 10;

  // ===== FICHA (HTML → CANVAS) =====
  const fichaCanvas = await html2canvas(fichaJugador, {
    scale: 2,
    backgroundColor: '#ffffff'
  });

  const fichaImg = fichaCanvas.toDataURL('image/png');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const fichaHeight = (fichaCanvas.height * pageWidth) / fichaCanvas.width;

  pdf.addImage(fichaImg, 'PNG', 0, y, pageWidth, fichaHeight);
  y += fichaHeight + 10;

  // ===== GRÁFICA (DESDE CHART.JS) =====
  if (grafica) {
    const graficaImg = grafica.toBase64Image();

    pdf.setFontSize(14);
    pdf.text('Rendimiento Físico', 105, y, { align: 'center' });
    y += 5;

    pdf.addImage(graficaImg, 'PNG', 20, y, 170, 120);
  }

  pdf.save(`Combine_${nombre.value}.pdf`);
}

document.getElementById('btnPDF')
  .addEventListener('click', generarPDF);

// =======================
// INIT
// =======================
mostrarRanking();
