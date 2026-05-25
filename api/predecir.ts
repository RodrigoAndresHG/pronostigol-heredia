import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Prediccion } from '../src/tipos/index.ts';
import { predecir } from './_lib/core.ts';

/**
 * Endpoint: POST /api/predecir  (o GET con ?partidoId=...)
 *
 * Genera la predicción completa de un partido: la Capa 1 del modelo
 * estadístico + las opiniones de las 3 IAs + el veredicto sintetizado.
 *
 * Caché en memoria:
 *   - 30 minutos por partidoId.
 *   - Vive en la instancia de la función, así que sobrevive entre
 *     requests calientes. Vercel apaga la instancia tras ~5 min de
 *     inactividad, así que es un caché de "mejor esfuerzo". Sirve
 *     para evitar quemar tokens si el usuario refresca varias veces.
 *
 * Tiempo máximo de ejecución: 30 segundos. Las 3 IAs en paralelo
 * suelen tardar 5-15 segundos. 30s da margen para casos lentos.
 */

export const config = {
  maxDuration: 30,
};

interface EntradaCache {
  timestamp: number;
  prediccion: Prediccion;
}

const cache = new Map<string, EntradaCache>();
const TTL_CACHE_MS = 30 * 60 * 1000;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Sólo POST o GET' });
  }

  const partidoId =
    req.method === 'POST'
      ? (req.body?.partidoId as string | undefined)
      : (req.query?.partidoId as string | undefined);

  if (!partidoId || typeof partidoId !== 'string') {
    return res
      .status(400)
      .json({ error: 'Falta partidoId (string) en body o query.' });
  }

  // Cache hit
  const cached = cache.get(partidoId);
  if (cached && Date.now() - cached.timestamp < TTL_CACHE_MS) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cached.prediccion);
  }

  // Cache miss → llamada real
  try {
    const prediccion = await predecir(partidoId);
    cache.set(partidoId, { timestamp: Date.now(), prediccion });
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(prediccion);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error interno';
    return res.status(500).json({ error: mensaje });
  }
}
