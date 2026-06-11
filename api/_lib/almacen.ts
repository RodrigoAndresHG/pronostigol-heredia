import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Prediccion } from '../../src/tipos/index.js';

/**
 * Adaptador de Supabase para la tabla `predicciones`.
 *
 * Las predicciones se guardan como JSON en una columna jsonb. Cada
 * generación inserta una fila nueva (no sobrescribe) — la historia
 * queda auditable. Para leer, traemos la fila más reciente por
 * `partido_id` ordenando por `generada_en desc`.
 *
 * El cliente vive cacheado a nivel de módulo para no recrearlo en cada
 * request. Si Supabase no está configurada (env vars faltantes),
 * `obtenerCliente` devuelve null y las funciones lo manejan
 * graceful — esto pasa en local cuando aún no se han pegado las claves.
 */

let clienteCache: SupabaseClient | null = null;

/** Cliente de Supabase con service_role, cacheado. null si falta config. */
export function obtenerCliente(): SupabaseClient | null {
  if (clienteCache) return clienteCache;
  // En el servidor leemos SUPABASE_URL o VITE_SUPABASE_URL (la misma URL,
  // el prefijo VITE_ es porque también la usa el frontend; aquí da igual).
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  clienteCache = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return clienteCache;
}

export interface PrediccionGuardada {
  prediccion: Prediccion;
  /** Timestamp ISO en que se guardó. Se muestra en la UI. */
  generadaEn: string;
}

/**
 * Devuelve la última predicción guardada para un partido, o null si:
 *   - Supabase no está configurada.
 *   - No hay ninguna predicción todavía para ese partido.
 */
export async function leerUltimaPrediccion(
  partidoId: string
): Promise<PrediccionGuardada | null> {
  const cliente = obtenerCliente();
  if (!cliente) return null;

  const { data, error } = await cliente
    .from('predicciones')
    .select('payload, generada_en')
    .eq('partido_id', partidoId)
    .order('generada_en', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error leyendo predicción:', error);
    return null;
  }
  if (!data || data.length === 0) return null;

  return {
    prediccion: data[0].payload as Prediccion,
    generadaEn: data[0].generada_en as string,
  };
}

/**
 * Inserta una predicción nueva. Lanza error si Supabase no está
 * configurada — la generación NO debe fallar silenciosamente,
 * porque si se quedó sin guardar perdemos el trabajo de las 3 IAs.
 */
export async function guardarPrediccion(
  partidoId: string,
  prediccion: Prediccion
): Promise<{ generadaEn: string }> {
  const cliente = obtenerCliente();
  if (!cliente) {
    throw new Error(
      'Supabase no configurada (faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY).'
    );
  }

  const { data, error } = await cliente
    .from('predicciones')
    .insert({ partido_id: partidoId, payload: prediccion })
    .select('generada_en')
    .single();

  if (error) {
    throw new Error(`Error guardando predicción: ${error.message}`);
  }
  return { generadaEn: data.generada_en as string };
}

/**
 * Devuelve la predicción MÁS RECIENTE de cada partido (una por partido_id).
 * Se usa en el endpoint de historial para calcular el track-record sobre
 * todos los partidos con predicción. Trae todas las filas ordenadas por
 * fecha desc y se queda con la primera de cada partido.
 */
export async function leerUltimasDeTodos(): Promise<PrediccionGuardada[]> {
  const cliente = obtenerCliente();
  if (!cliente) return [];

  const { data, error } = await cliente
    .from('predicciones')
    .select('partido_id, payload, generada_en')
    .order('generada_en', { ascending: false });

  if (error) {
    console.error('Error leyendo predicciones:', error);
    return [];
  }

  const vistos = new Set<string>();
  const ultimas: PrediccionGuardada[] = [];
  for (const fila of data ?? []) {
    const pid = fila.partido_id as string;
    if (vistos.has(pid)) continue;
    vistos.add(pid);
    ultimas.push({
      prediccion: fila.payload as Prediccion,
      generadaEn: fila.generada_en as string,
    });
  }
  return ultimas;
}

/** True si las env vars de Supabase están todas configuradas. */
export function supabaseConfigurado(): boolean {
  return Boolean(
    (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
