/**
 * Helpers de formato visual reutilizados en varias páginas.
 */

/**
 * Convierte una probabilidad (0..1) a porcentaje entero: 0.421 → "42%".
 */
export function porcentaje(prob: number): string {
  return `${Math.round(prob * 100)}%`;
}

/**
 * Convierte una distribución [local, empate, visitante] a tres porcentajes
 * que SIEMPRE suman 100 (ajuste de redondeo asignado al mayor).
 */
export function porcentajesNormalizados(
  local: number,
  empate: number,
  visitante: number
): [string, string, string] {
  const vals = [local, empate, visitante].map((v) => Math.round(v * 100));
  const total = vals[0] + vals[1] + vals[2];
  const ajuste = 100 - total;
  if (ajuste !== 0) {
    // Asignamos el ajuste al valor más grande para que la suma cuadre.
    const indiceMayor = vals.indexOf(Math.max(...vals));
    vals[indiceMayor] += ajuste;
  }
  return [`${vals[0]}%`, `${vals[1]}%`, `${vals[2]}%`];
}

/**
 * Devuelve el ganador implícito de una distribución de probabilidad.
 */
export function ganadorImplicito(
  prob: { local: number; empate: number; visitante: number }
): 'local' | 'empate' | 'visitante' {
  if (prob.local >= prob.empate && prob.local >= prob.visitante) return 'local';
  if (prob.visitante >= prob.empate && prob.visitante >= prob.local) return 'visitante';
  return 'empate';
}
