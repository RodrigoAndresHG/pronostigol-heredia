import type { VercelRequest, VercelResponse } from '@vercel/node';
import type {
  Actor,
  BoletinActor,
  CubetaCalibracion,
  DistribucionResultado,
  HistorialResponse,
  PartidoCalificado,
  Prediccion,
} from '../src/tipos/index.js';
import { leerUltimasDeTodos } from './_lib/almacen.js';
import { leerTodosLosResultados, type ResultadoPartido } from './_lib/resultados.js';
import {
  acerto,
  brier,
  cubetaConfianza,
  type ResultadoReal,
} from './_lib/calificacion.js';

/**
 * Endpoint /api/historial — el track-record REAL de la app.
 *
 * Cruza las predicciones guardadas (cuyas probabilidades viven en el
 * payload jsonb) con los resultados reales y calcula, sin re-llamar a
 * ninguna IA:
 *   - El Boletín de Calibración: Brier promedio + acierto por actor
 *     (cada IA, el consenso y el modelo base), ordenado por Brier.
 *   - La curva de calibración: confianza declarada vs acierto real.
 *   - Los registros por partido para el Historial.
 *
 * `calcularHistorial` es pura para poder testearla con `tsx --test`.
 */

const ORDEN_CUBETAS = ['<50', '50-60', '60-70', '70-80', '80-90', '90-100'];

export function calcularHistorial(
  predicciones: Prediccion[],
  resultados: ResultadoPartido[]
): HistorialResponse {
  const mapaResultado = new Map(resultados.map((r) => [r.partidoId, r]));

  const acc = new Map<Actor, { brier: number; aciertos: number; total: number }>();
  const sumar = (actor: Actor, d: DistribucionResultado, real: ResultadoReal) => {
    const a = acc.get(actor) ?? { brier: 0, aciertos: 0, total: 0 };
    a.brier += brier(d, real);
    if (acerto(d, real)) a.aciertos += 1;
    a.total += 1;
    acc.set(actor, a);
  };

  const cubetas = new Map<string, { n: number; sumConf: number; aciertos: number }>();
  const registros: PartidoCalificado[] = [];

  for (const pred of predicciones) {
    const res = mapaResultado.get(pred.partidoId);
    if (!res) continue;
    const real = res.resultadoReal;

    for (const r of pred.respuestasIA) {
      if (r.error) continue;
      sumar(r.ia, r.probabilidad, real);
      const cb = cubetaConfianza(r.confianza);
      const c = cubetas.get(cb) ?? { n: 0, sumConf: 0, aciertos: 0 };
      c.n += 1;
      c.sumConf += r.confianza;
      if (acerto(r.probabilidad, real)) c.aciertos += 1;
      cubetas.set(cb, c);
    }

    sumar('Consenso', pred.probabilidadFinal, real);
    sumar('Modelo base', pred.probabilidadBase, real);

    registros.push({
      partidoId: pred.partidoId,
      golesLocal: res.golesLocal,
      golesVisitante: res.golesVisitante,
      resultadoReal: real,
      veredicto: pred.veredicto,
      consensoAcerto: acerto(pred.probabilidadFinal, real),
    });
  }

  const boletin: BoletinActor[] = [...acc.entries()]
    .map(([actor, a]) => ({
      actor,
      brierPromedio: a.total ? a.brier / a.total : 0,
      aciertos: a.aciertos,
      total: a.total,
      tasaAcierto: a.total ? a.aciertos / a.total : 0,
    }))
    .sort((x, y) => x.brierPromedio - y.brierPromedio);

  const calibracion: CubetaCalibracion[] = ORDEN_CUBETAS.filter((r) =>
    cubetas.has(r)
  ).map((rango) => {
    const c = cubetas.get(rango)!;
    return {
      rango,
      n: c.n,
      confianzaPromedio: c.n ? c.sumConf / c.n : 0,
      tasaAciertoReal: c.n ? (c.aciertos / c.n) * 100 : 0,
    };
  });

  return {
    partidosCalificados: registros.length,
    boletin,
    calibracion,
    registros,
  };
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const [predGuardadas, resultados] = await Promise.all([
      leerUltimasDeTodos(),
      leerTodosLosResultados(),
    ]);
    const predicciones = predGuardadas.map((p) => p.prediccion);
    const historial = calcularHistorial(predicciones, resultados);
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=120');
    return res.status(200).json(historial);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}
