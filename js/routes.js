const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

let rutas = [];
let rutaActual = null;

const colores = {
  WR: '#FFD700',
  QB: '#00E5FF',
  RB: '#FF5252',
  C: '#FFFFFF'
};

canvas.addEventListener('click', e => {
  // 👉 si no hay ruta, se crea automáticamente
  if (!rutaActual) {
    const posicion = document.getElementById('posicionRuta').value;
    rutaActual = { posicion, puntos: [] };
    rutas.push(rutaActual);
  }

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  rutaActual.puntos.push({ x, y });
  dibujarCampo();
});
