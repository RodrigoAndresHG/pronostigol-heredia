import type { VercelRequest, VercelResponse } from '@vercel/node';
import { manejarPrediccion } from './_lib/router.js';

/**
 * Endpoint /api/predecir.
 *
 * Este archivo es sólo el envoltorio para Vercel. La lógica real
 * (GET público, POST admin, integración con Supabase) vive en
 * api/_lib/router.ts, que también se llama desde el middleware de
 * Vite en desarrollo. Mantenerlo aquí pequeño asegura que producción
 * y dev compartan exactamente el mismo comportamiento.
 *
 * Tiempo máximo: 30 segundos. Las 3 IAs en paralelo suelen tardar
 * 5-15 segundos.
 */

export const config = {
  maxDuration: 30,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { status, json } = await manejarPrediccion({
    method: req.method ?? 'GET',
    query: req.query as Record<string, string | undefined>,
    body: req.body,
    headers: req.headers as Record<string, string | undefined>,
  });
  return res.status(status).json(json);
}
