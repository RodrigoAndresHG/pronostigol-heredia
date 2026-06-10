import { predecir } from './core.js';
import { leerUltimaPrediccion, guardarPrediccion } from './almacen.js';
import { esAdmin } from './admin.js';
import { partidoPorId } from '../../src/datos/partidos.js';
import { calcularProbabilidadBase } from '../../src/lib/modeloBase.js';
import { hechosDePartido } from '../../src/datos/dossiers.js';
import { construirPrompt } from './prompt.js';

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

  // ?soloPrompt=1 → devuelve el prompt EXACTO (anclado a hechos) sin llamar
  // a las IAs ni a Supabase. Alimenta el botón "Copiar este caso como prompt"
  // de la Anatomía del Desacuerdo: transparencia operativa total.
  if (req.query?.soloPrompt) {
    const partido = partidoPorId(partidoId);
    if (!partido) {
      return { status: 404, json: { error: 'Partido no encontrado.' } };
    }
    const { probabilidad, desglose } = calcularProbabilidadBase(partido);
    const dossier = hechosDePartido(partido);
    const { sistema, usuario } = construirPrompt(
      partido,
      probabilidad,
      desglose,
      dossier
    );
    return { status: 200, json: { sistema, usuario } };
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
