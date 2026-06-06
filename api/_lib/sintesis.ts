import type {
  DistribucionResultado,
  RespuestaIA,
  Veredicto,
} from '../../src/tipos/index.js';

/**
 * Sintetiza las respuestas de las 3 IAs en un veredicto único.
 *
 * Reglas clave:
 *   1. Si UNA o MÁS IAs fallaron, se sintetiza con las que respondieron.
 *      Las fallidas siguen apareciendo en la lista para transparencia.
 *   2. Probabilidad final = promedio ponderado por confianza.
 *      Si una IA dice 90 de confianza, pesa más que una con 50.
 *   3. Veredicto = "consenso" si las 3 (o las disponibles) caen dentro
 *      de `UMBRAL_DESACUERDO` puntos porcentuales entre sí en P(local)
 *      y P(visitante). Si no, "desacuerdo".
 *   4. La nota explica el veredicto en lenguaje humano: cuánto se
 *      separaron y quién fue el más alejado.
 */

/** Si la diferencia entre la IA más optimista y la más pesimista supera
 *  este umbral en cualquier resultado (local/empate/visitante), se marca
 *  como desacuerdo. 12 puntos porcentuales es un valor razonable. */
const UMBRAL_DESACUERDO = 0.12;

export interface ResultadoSintesis {
  probabilidadFinal: DistribucionResultado;
  veredicto: Veredicto;
  notaVeredicto: string;
}

export function sintetizar(respuestas: RespuestaIA[]): ResultadoSintesis {
  const validas = respuestas.filter((r) => !r.error);

  if (validas.length === 0) {
    return {
      probabilidadFinal: { local: 0, empate: 0, visitante: 0 },
      veredicto: 'desacuerdo',
      notaVeredicto:
        'Ninguna de las IAs respondió correctamente. No hay base para sintetizar — revisa las claves de API o el estado de cada proveedor.',
    };
  }

  // ── Probabilidad final: promedio ponderado por confianza ───────────
  const sumaConfianzas = validas.reduce((acc, r) => acc + r.confianza, 0);
  // Si todas las IAs reportaron confianza 0 (caso raro), caemos a promedio simple.
  const pesoIgual = sumaConfianzas === 0;
  const pesoDe = (r: RespuestaIA) =>
    pesoIgual ? 1 / validas.length : r.confianza / sumaConfianzas;

  const probabilidadFinal: DistribucionResultado = {
    local: validas.reduce((acc, r) => acc + r.probabilidad.local * pesoDe(r), 0),
    empate: validas.reduce(
      (acc, r) => acc + r.probabilidad.empate * pesoDe(r),
      0
    ),
    visitante: validas.reduce(
      (acc, r) => acc + r.probabilidad.visitante * pesoDe(r),
      0
    ),
  };

  // ── Veredicto: medimos el "spread" entre las IAs ───────────────────
  const probsLocal = validas.map((r) => r.probabilidad.local);
  const probsVisitante = validas.map((r) => r.probabilidad.visitante);
  const probsEmpate = validas.map((r) => r.probabilidad.empate);
  const spreadLocal = Math.max(...probsLocal) - Math.min(...probsLocal);
  const spreadVisitante = Math.max(...probsVisitante) - Math.min(...probsVisitante);
  const spreadEmpate = Math.max(...probsEmpate) - Math.min(...probsEmpate);
  const spreadMaximo = Math.max(spreadLocal, spreadVisitante, spreadEmpate);

  const veredicto: Veredicto =
    spreadMaximo > UMBRAL_DESACUERDO ? 'desacuerdo' : 'consenso';
  const notaVeredicto = construirNota(
    veredicto,
    validas,
    respuestas.length,
    spreadMaximo
  );

  return { probabilidadFinal, veredicto, notaVeredicto };
}

function construirNota(
  veredicto: Veredicto,
  validas: RespuestaIA[],
  totalIAs: number,
  spreadMaximo: number
): string {
  const spreadPts = Math.round(spreadMaximo * 100);
  const fallidas = totalIAs - validas.length;
  const sufijoFallos =
    fallidas > 0
      ? ` (${fallidas} IA${fallidas === 1 ? '' : 's'} no respondió, sintetizado con ${validas.length})`
      : '';

  if (veredicto === 'consenso') {
    return `Las ${validas.length} IAs coinciden — diferencia máxima entre ellas: ${spreadPts} puntos porcentuales${sufijoFallos}. Confianza alta en el veredicto sintetizado.`;
  }

  // Identificar quién es el outlier para enriquecer la nota.
  // Outlier = la IA cuya probabilidad de local está más lejos del promedio.
  const promedioLocal =
    validas.reduce((acc, r) => acc + r.probabilidad.local, 0) / validas.length;
  const outlier = validas.reduce((peor, r) =>
    Math.abs(r.probabilidad.local - promedioLocal) >
    Math.abs(peor.probabilidad.local - promedioLocal)
      ? r
      : peor
  );

  return `Las IAs discrepan en ${spreadPts} puntos porcentuales${sufijoFallos}. El caso más alejado del promedio es ${outlier.ia} (${Math.round(outlier.probabilidad.local * 100)}% para el local frente al promedio de ${Math.round(promedioLocal * 100)}%). El desacuerdo es información: aquí el partido es genuinamente difícil de leer.`;
}
