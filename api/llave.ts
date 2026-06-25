import type { VercelRequest, VercelResponse } from '@vercel/node';
import { leerTodosLosResultados } from './_lib/resultados.js';
import { construirLlave } from '../src/lib/eliminatorias.js';

/**
 * Endpoint /api/llave — la Ronda de 32 en vivo + la carrera por los mejores
 * terceros. Se deriva de los mismos resultados que alimentan /api/posiciones:
 * conforme cierran los grupos, los clasificados se ubican en su slot. Devuelve
 * la estructura completa aunque no haya resultados (todo sin resolver).
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const llave = construirLlave(await leerTodosLosResultados());
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=120');
    return res.status(200).json({ llave });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}
