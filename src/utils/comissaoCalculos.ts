export function calcularHorasBde(b: any): number {
  let horas = 0;
  if (b.hora_inicio_jornada && b.hora_fim_jornada) {
    const [h1, m1] = b.hora_inicio_jornada.split(':').map(Number);
    const [h2, m2] = b.hora_fim_jornada.split(':').map(Number);
    if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
      horas = Math.max(0, ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60);
    }
  }
  if (horas <= 0 && b.total_hours) horas = Number(b.total_hours) || 0;
  if (horas <= 0 && b.final_hourmeter && b.initial_hourmeter) {
    horas = Math.max(0, Number(b.final_hourmeter) - Number(b.initial_hourmeter));
  }
  if (b.motivo_parada && horas > 1) horas = Math.max(0, horas - 1);
  return horas;
}
