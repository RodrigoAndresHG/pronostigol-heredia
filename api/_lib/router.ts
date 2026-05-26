import { predecir } from './core.ts';
import { leerUltimaPrediccion, guardarPrediccion } from './almacen.ts';
import { esAdmin } from './admin.ts';

/**
 * Router puro de /api/predecir, sin conocimiento de HTTP framework.
 *
 * Vive como función pura para que:
 *   - `api/predecir.ts` (Vercel) la llame envolviéndola en VercelRequest/Response.
 *   - `vite-plugin-api-dev.ts` (dev) la llame envolviéndola en Node req/res.
 *
 * Ambos consumidores le pasan {method, query, body, headers} y reciben
 * {status, json}. La función gestiona la lógica de GET vs POST, la
 * verificación de admin, y delega en core.predecir + almacen.
 */

export interface EntradaApi {
  method: string;
  query: Record<string, string | undefined>;
  body: unknown;
  headers: Record<string, string | undefined>;
}

export interface SalidaApi {
  status: number;
  json: Record<string, unknown>;
}

export async function manejarPrediccion(req: EntradaApi): Promise<SalidaApi> {
  if (req.method === 'GET') return manejarGet(req);
  if (req.method === 'POST') return manejarPost(req);
  return {
    status: 405,
    json: { error: 'Sólo GET (público) o POST (admin con código).' },
  };
}

async function manejarGet(req: EntradaApi): Promise<SalidaApi> {
  const partidoId = req.query?.partidoId;
  if (!partidoId || typeof partidoId !== 'string') {
    return { status: 400, json: { error: 'Falta partidoId en la query.' } };
  }
  try {
    const guardada = await leerUltimaPrediccion(partidoId);
    if (!guardada) {
      return {
        status: 404,
        json: { error: 'Aún no hay predicción publicada para este partido.' },
      };
    }
    return {
      status: 200,
      json: { ...guardada.prediccion, guardadaEn: guardada.generadaEn },
    };
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error interno';
    return { status: 500, json: { error: mensaje } };
  }
}

async function manejarPost(req: EntradaApi): Promise<SalidaApi> {
  const codigo = req.headers['x-codigo-admin'];
  if (!esAdmin(codigo ?? null)) {
    return {
      status: 401,
      json: {
        error:
          'Generación restringida. Se requiere header X-Codigo-Admin válido.',
      },
    };
  }

  const body = (req.body ?? {}) as { partidoId?: string };
  const partidoId = body.partidoId;
  if (!partidoId || typeof partidoId !== 'string') {
    return { status: 400, json: { error: 'Falta partidoId en el body.' } };
  }

  try {
    const prediccion = await predecir(partidoId);

    let guardadaEn: string | null = null;
    let errorGuardado: string | null = null;
    try {
      const resultado = await guardarPrediccion(partidoId, prediccion);
      guardadaEn = resultado.generadaEn;
    } catch (err) {
      errorGuardado = err instanceof Error ? err.message : String(err);
      console.error('No se pudo guardar la predicción:', errorGuardado);
    }

    return {
      status: 200,
      json: { ...prediccion, guardadaEn, errorGuardado },
    };
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'Error interno';
    return { status: 500, json: { error: mensaje } };
  }
}
