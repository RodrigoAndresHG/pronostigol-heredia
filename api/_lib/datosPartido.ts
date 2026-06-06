import { partidoPorId } from '../../src/datos/partidos.js';
import { equipoPorId } from '../../src/datos/equipos.js';
import { estadioPorSede } from '../../src/datos/estadios.js';
import { leerUltimaPrediccion } from './almacen.js';
import type { Partido, Equipo, Prediccion } from '../../src/tipos/index.js';

/**
 * Resolutor compartido: dado un partidoId, junta todo lo que necesitan
 * tanto la generación de la imagen OG (og-imagen.tsx) como la inyección
 * de meta tags (meta.ts). Centraliza la lógica para no duplicarla.
 */
export interface DatosPartido {
  partido: Partido;
  local: Equipo;
  visitante: Equipo;
  estadioSlug: string | null;
  estadioNombre: string | null;
  prediccion: Prediccion | null;
  /** Timestamp ISO de cuándo se guardó la predicción (para versionar caché). */
  generadaEn: string | null;
}

export async function resolverDatosPartido(
  partidoId: string
): Promise<DatosPartido | null> {
  const partido = partidoPorId(partidoId);
  if (!partido) return null;

  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);
  const estadio = estadioPorSede(partido.sede);

  let prediccion: Prediccion | null = null;
  let generadaEn: string | null = null;
  try {
    const guardada = await leerUltimaPrediccion(partidoId);
    if (guardada) {
      prediccion = guardada.prediccion;
      generadaEn = guardada.generadaEn;
    }
  } catch {
    // Sin Supabase o sin predicción: la tarjeta cae al modo "solo equipos".
  }

  return {
    partido,
    local,
    visitante,
    estadioSlug: estadio?.slug ?? null,
    estadioNombre: estadio?.nombre ?? null,
    prediccion,
    generadaEn,
  };
}
