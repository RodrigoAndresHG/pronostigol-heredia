import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PARTIDOS } from '../../src/datos/partidos.ts';
import { predecir } from '../_lib/core.ts';
import {
  leerUltimaPrediccion,
  guardarPrediccion,
  supabaseConfigurado,
} from '../_lib/almacen.ts';

/**
 * Cron diario: genera predicciones para los partidos próximos.
 *
 * Configurado en vercel.json para correr a las 06:00 UTC (01:00 Ecuador,
 * 02:00 EDT, 04:00 CDMX) — antes de cualquier kickoff matutino del día.
 *
 * Vercel envía automáticamente un header `Authorization: Bearer <CRON_SECRET>`
 * a las rutas listadas en `crons` cuando `CRON_SECRET` está en las env vars
 * del proyecto. Sin ese secreto, devolvemos 401.
 *
 * Estrategia:
 *   1. Filtramos partidos con kickoff en las próximas 36 horas.
 *   2. Para cada uno, leemos si ya hay predicción.
 *      Si no hay, o la última tiene > 12h, regeneramos.
 *   3. Generamos todas en paralelo (Promise.allSettled) — si una falla,
 *      las otras igual quedan.
 *   4. Devolvemos resumen para auditoría desde el dashboard de Vercel.
 */

export const config = {
  // Hobby plan permite hasta 60s. Pro hasta 300. Más que suficiente para
  // 5-6 predicciones en paralelo a 5-20s cada una.
  maxDuration: 60,
};

const VENTANA_HORAS = 36;
const TTL_HORAS = 12;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // ── Autenticación: sólo Vercel Cron debe poder llamarnos ───────────
  const authHeader = req.headers.authorization;
  const esperado = process.env.CRON_SECRET;

  if (!esperado || esperado.length < 16) {
    return res.status(500).json({
      error:
        'CRON_SECRET no configurada en el servidor (mínimo 16 caracteres).',
    });
  }
  if (authHeader !== `Bearer ${esperado}`) {
    return res.status(401).json({ error: 'Cron no autorizado.' });
  }
  if (!supabaseConfigurado()) {
    return res
      .status(500)
      .json({ error: 'Supabase no está configurada — no hay dónde guardar.' });
  }

  const ahora = new Date();
  const limite = new Date(ahora.getTime() + VENTANA_HORAS * 60 * 60 * 1000);
  const ttlMs = TTL_HORAS * 60 * 60 * 1000;

  // 1. Filtrar partidos dentro de la ventana.
  const proximos = PARTIDOS.filter((p) => {
    const k = new Date(p.fechaISO);
    return k > ahora && k <= limite;
  });

  // 2. Decidir cuáles regenerar.
  const aGenerar: typeof proximos = [];
  for (const partido of proximos) {
    try {
      const guardada = await leerUltimaPrediccion(partido.id);
      if (!guardada) {
        aGenerar.push(partido);
        continue;
      }
      const edadMs = ahora.getTime() - new Date(guardada.generadaEn).getTime();
      if (edadMs > ttlMs) aGenerar.push(partido);
    } catch {
      // Si falla la lectura, mejor regenerar que omitir.
      aGenerar.push(partido);
    }
  }

  // 3. Generar todas en paralelo.
  const resultados = await Promise.allSettled(
    aGenerar.map(async (partido) => {
      const prediccion = await predecir(partido.id);
      await guardarPrediccion(partido.id, prediccion);
      return partido.id;
    })
  );

  const exitosas = resultados
    .filter(
      (r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled'
    )
    .map((r) => r.value);
  const fallidas = resultados
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => ({
      error: r.reason instanceof Error ? r.reason.message : String(r.reason),
    }));

  return res.status(200).json({
    ejecutadoEn: ahora.toISOString(),
    ventanaHoras: VENTANA_HORAS,
    ttlHoras: TTL_HORAS,
    candidatos: proximos.length,
    aGenerar: aGenerar.length,
    exitosas: exitosas.length,
    idsExitosos: exitosas,
    fallidas: fallidas.length,
    erroresFallidas: fallidas,
  });
}
