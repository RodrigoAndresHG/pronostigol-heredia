import type { VercelRequest, VercelResponse } from '@vercel/node';
import { leerTodosLosResultados } from './_lib/resultados.js';
import { calcularPosiciones } from '../src/lib/posiciones.js';

/**
 * Endpoint /api/posiciones — tabla de posiciones de la fase de grupos.
 * Lee los resultados guardados y calcula los 12 grupos. Devuelve la
 * estructura completa aunque no haya resultados (todos en cero).
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const resultados = await leerTodosLosResultados();
    const grupos = calcularPosiciones(resultados);
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=120');
    return res.status(200).json({ grupos });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
}
