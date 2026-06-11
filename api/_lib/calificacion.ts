import type { DistribucionResultado } from '../../src/tipos/index.js';

/**
 * Calificación de predicciones contra el resultado real — lógica PURA.
 *
 * Es el corazón del "accountability" de la app: una vez jugado el partido,
 * mide qué tan bien razonó cada IA. No usa solo acierto/fallo (eso miente:
 * acertar al favorito no dice si estabas bien calibrado), sino el Brier
 * Score, que premia la HONESTIDAD probabilística.
 *
 * Todo aquí es función pura sobre datos ya guardados (las probabilidades de
 * las IAs viven en el payload jsonb) — cero llamadas externas, fácil de
 * testear con `tsx --test`.
 */

export type ResultadoReal = 'local' | 'empate' | 'visitante';

/** Deriva el resultado (1X2) desde el marcador final. */
export function resultadoDesdeGoles(
  golesLocal: number,
  golesVisitante: number
): ResultadoReal {
  if (golesLocal > golesVisitante) return 'local';
  if (golesLocal < golesVisitante) return 'visitante';
  return 'empate';
}

/**
 * Brier Score multicategoría sobre los 3 resultados posibles.
 *
 *   BS = Σ (probabilidad_k − resultado_k)²   con resultado_k ∈ {0,1}
 *
 * Rango 0..2. MENOR es MEJOR.
 *   - Predecir 100% el resultado correcto → 0 (perfecto).
 *   - Predecir 100% un resultado incorrecto → 2 (lo peor).
 *   - Decir 33/33/33 siempre → 0.667 (la "línea base de la ignorancia").
 *
 * Premia decir 60% cuando pasa ~60% de las veces; castiga la falsa certeza.
 */
export function brier(d: DistribucionResultado, real: ResultadoReal): number {
  const oLocal = real === 'local' ? 1 : 0;
  const oEmpate = real === 'empate' ? 1 : 0;
  const oVisitante = real === 'visitante' ? 1 : 0;
  return (
    (d.local - oLocal) ** 2 +
    (d.empate - oEmpate) ** 2 +
    (d.visitante - oVisitante) ** 2
  );
}

/** El resultado al que la distribución le da MÁS probabilidad. */
export function resultadoPredicho(d: DistribucionResultado): ResultadoReal {
  if (d.local >= d.empate && d.local >= d.visitante) return 'local';
  if (d.visitante >= d.empate && d.visitante >= d.local) return 'visitante';
  return 'empate';
}

/** ¿La predicción "acertó" en el sentido crudo (su favorito fue el resultado)? */
export function acerto(d: DistribucionResultado, real: ResultadoReal): boolean {
  return resultadoPredicho(d) === real;
}

/**
 * Cubeta de confianza (0-100) para la curva de calibración.
 * Agrupa en rangos de 10 desde 50; todo lo menor a 50 cae en "<50".
 */
export type CubetaConfianza = '<50' | '50-60' | '60-70' | '70-80' | '80-90' | '90-100';

export function cubetaConfianza(confianza: number): CubetaConfianza {
  const c = Math.max(0, Math.min(100, confianza));
  if (c < 50) return '<50';
  if (c < 60) return '50-60';
  if (c < 70) return '60-70';
  if (c < 80) return '70-80';
  if (c < 90) return '80-90';
  return '90-100';
}

/** Etiqueta honesta de calibración de un caso individual (para la Autopsia). */
export function etiquetaCalibracion(
  d: DistribucionResultado,
  real: ResultadoReal
): 'calibrada' | 'sobreconfiada' | 'cauta' {
  const pAsignada = d[real]; // probabilidad que le dio al resultado real
  const bs = brier(d, real);
  if (acerto(d, real)) {
    // Acertó: ¿estaba segura (bien) o dudosa (cauta pero acertó)?
    return pAsignada >= 0.5 ? 'calibrada' : 'cauta';
  }
  // Falló: si además estaba muy segura del favorito equivocado, sobreconfiada.
  return bs > 1 ? 'sobreconfiada' : 'calibrada';
}
