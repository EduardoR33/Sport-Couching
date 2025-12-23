export function obtenerJugadores() {
  return JSON.parse(localStorage.getItem('jugadores')) || [];
}

export function guardarJugadores(jugadores) {
  localStorage.setItem('jugadores', JSON.stringify(jugadores));
}

export function guardarEvaluacion(jugador) {
  const jugadores = obtenerJugadores();
  const index = jugadores.findIndex(j => j.id === jugador.id);

  if (index >= 0) {
    jugadores[index] = jugador;
  } else {
    jugadores.push(jugador);
  }

  guardarJugadores(jugadores);
}