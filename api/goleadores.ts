import type { VercelRequest, VercelResponse } from '@vercel/node';
import { obtenerGoleadores } from './_lib/openfootball.js';

/**
 * Endpoint /api/goleadores — tabla de goleadores del torneo, en vivo desde
 * openfootball (datos abiertos, sin API key). Se cachea unos minutos en el
 * edge para no golpear la fuente en cada visita.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const goleadores = await obtenerGoleadores();
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    return res.status(200).json({ goleadores });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}
