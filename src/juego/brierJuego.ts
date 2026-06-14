/**
 * "Compite contra las IAs" — Brier del usuario, AISLADO del cálculo del
 * servidor.
 *
 * El usuario no declara probabilidades: hace un pick duro (Local / Empate /
 * Visitante). Eso equivale a una distribución {1,0,0} sobre el resultado
 * elegido. Su Brier por partido es entonces:
 *   - 0 si acertó el resultado.
 *   - 2 si falló.
 * (Σ (p_k − o_k)² con p concentrado en una sola categoría.)
 *
 * El promedio sobre sus partidos jugados se compara, en el MISMO leaderboard,
 * contra el Brier de Claude/GPT/Gemini/Consenso/Modelo base, que el servidor
 * ya calcula con `api/_lib/calificacion.ts`. No tocamos esa lógica: esta vive
 * aparte y sólo produce la fila "TÚ".
 */

import type { ResultadoPick } from './picks.ts';

export type ResultadoReal = 'local' | 'empate' | 'visitante';

/** Brier de un pick duro contra el resultado real: 0 si acierta, 2 si falla. */
export function brierPickDuro(pick: ResultadoPick, real: ResultadoReal): number {
  const p = (k: ResultadoReal) => (pick === k ? 1 : 0);
  const o = (k: ResultadoReal) => (real === k ? 1 : 0);
  return (
    (p('local') - o('local')) ** 2 +
    (p('empate') - o('empate')) ** 2 +
    (p('visitante') - o('visitante')) ** 2
  );
}

export interface RankingUsuario {
  /** Partidos jugados que el usuario predijo (sobre los que se calcula). */
  total: number;
  /** Cuántos acertó (resultado exacto 1X2). */
  aciertos: number;
  /** Brier promedio. Menor es mejor. 0 si no hay partidos calificables. */
  brierPromedio: number;
  /** aciertos / total, 0..1. */
  tasaAcierto: number;
}

/**
 * Calcula el desempeño del usuario sobre los partidos que YA se jugaron y que
 * él predijo. `resultados` mapea partidoId → resultado real (sólo partidos con
 * marcador). Los picks de partidos aún no jugados se ignoran.
 */
export function calcularRankingUsuario(
  picks: Record<string, { resultado: ResultadoPick }>,
  resultados: Map<string, ResultadoReal>
): RankingUsuario {
  let total = 0;
  let aciertos = 0;
  let sumaBrier = 0;
  for (const [partidoId, pick] of Object.entries(picks)) {
    const real = resultados.get(partidoId);
    if (!real) continue;
    total += 1;
    if (pick.resultado === real) aciertos += 1;
    sumaBrier += brierPickDuro(pick.resultado, real);
  }
  return {
    total,
    aciertos,
    brierPromedio: total ? sumaBrier / total : 0,
    tasaAcierto: total ? aciertos / total : 0,
  };
}
