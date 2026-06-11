import type {
  Actor,
  Autopsia,
  AutopsiaActor,
  DistribucionResultado,
  Prediccion,
} from '../../src/tipos/index.js';

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

/**
 * Construye la "autopsia" de un partido jugado: cómo le fue a cada IA y al
 * consenso contra el resultado real. Pura: recibe la predicción guardada
 * (inmutable, generada antes del partido) y el marcador. No deriva tipos de
 * resultados.ts para evitar dependencia circular.
 */
export function construirAutopsia(
  prediccion: Prediccion,
  golesLocal: number,
  golesVisitante: number
): Autopsia {
  const resultadoReal = resultadoDesdeGoles(golesLocal, golesVisitante);

  const actores: AutopsiaActor[] = [];
  const agregar = (actor: Actor, d: DistribucionResultado) => {
    actores.push({
      actor,
      acerto: acerto(d, resultadoReal),
      brier: brier(d, resultadoReal),
      etiqueta: etiquetaCalibracion(d, resultadoReal),
      probAlResultado: d[resultadoReal],
    });
  };

  for (const r of prediccion.respuestasIA) {
    if (r.error) continue;
    agregar(r.ia, r.probabilidad);
  }
  agregar('Consenso', prediccion.probabilidadFinal);

  // En partidos de desacuerdo: ¿quién de las dos IAs más opuestas ganó?
  let notaDesacuerdo: string | undefined;
  if (prediccion.veredicto === 'desacuerdo') {
    const validas = prediccion.respuestasIA.filter((r) => !r.error);
    if (validas.length >= 2) {
      const ordenadas = [...validas].sort(
        (a, b) => b.probabilidad.local - a.probabilidad.local
      );
      const alta = ordenadas[0];
      const baja = ordenadas[ordenadas.length - 1];
      const ganador =
        alta.probabilidad[resultadoReal] >= baja.probabilidad[resultadoReal]
          ? alta
          : baja;
      const perdedor = ganador === alta ? baja : alta;
      const pct = (x: number) => Math.round(x * 100);
      notaDesacuerdo = `${ganador.ia} le dio ${pct(ganador.probabilidad[resultadoReal])}% al resultado real; ${perdedor.ia}, solo ${pct(perdedor.probabilidad[resultadoReal])}%.`;
    }
  }

  return { golesLocal, golesVisitante, resultadoReal, actores, notaDesacuerdo };
}
