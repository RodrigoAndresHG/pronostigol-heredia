import type { VercelRequest, VercelResponse } from '@vercel/node';
import { obtenerResultadosParaIngerir } from '../_lib/openfootball.js';
import { guardarResultado } from '../_lib/resultados.js';
import { supabaseConfigurado } from '../_lib/almacen.js';

/**
 * Cron de cierre: ingiere los marcadores de los partidos ya jugados y los
 * guarda en la tabla `resultados`. Eso enciende automáticamente el Boletín
 * de Calibración, el Termómetro y la Autopsia (que calculan el track-record
 * sobre predicción + resultado).
 *
 * Fuente: openfootball/worldcup.json (datos abiertos, sin API key). El
 * upsert es idempotente, así que correrlo de más no duplica ni rompe.
 *
 * Auth: igual que generar-predicciones — Vercel manda Bearer <CRON_SECRET>.
 */

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const esperado = process.env.CRON_SECRET;
  if (!esperado || esperado.length < 16) {
    return res
      .status(500)
      .json({ error: 'CRON_SECRET no configurada en el servidor.' });
  }
  if (req.headers.authorization !== `Bearer ${esperado}`) {
    return res.status(401).json({ error: 'Cron no autorizado.' });
  }
  if (!supabaseConfigurado()) {
    return res
      .status(500)
      .json({ error: 'Supabase no está configurada — no hay dónde guardar.' });
  }

  try {
    const aIngerir = await obtenerResultadosParaIngerir();

    const guardados: string[] = [];
    const fallidos: { partidoId: string; error: string }[] = [];
    for (const r of aIngerir) {
      try {
        await guardarResultado(r.partidoId, r.golesLocal, r.golesVisitante);
        guardados.push(r.partidoId);
      } catch (err) {
        fallidos.push({
          partidoId: r.partidoId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return res.status(200).json({
      ejecutadoEn: new Date().toISOString(),
      jugadosDetectados: aIngerir.length,
      guardados: guardados.length,
      idsGuardados: guardados,
      fallidos,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : String(err) });
  }
}
