import { obtenerCliente } from './almacen.js';
import { resultadoDesdeGoles, type ResultadoReal } from './calificacion.js';

/**
 * Adaptador de la tabla `resultados` — el marcador final de cada partido.
 *
 * A diferencia de `predicciones` (una fila por generación), aquí hay UNA
 * fila por partido: el resultado no cambia. Por eso usamos UPSERT sobre
 * `partido_id` (que es UNIQUE en el esquema).
 *
 * Sobre estos datos se calculan el Brier por IA, la curva de calibración y
 * la autopsia. La INGESTA del marcador (desde API-Football) vive en el cron
 * `api/cron/cerrar-partidos.ts`; aquí solo está la persistencia.
 */

export interface ResultadoPartido {
  partidoId: string;
  golesLocal: number;
  golesVisitante: number;
  resultadoReal: ResultadoReal;
  registradoEn: string;
}

interface FilaResultado {
  partido_id: string;
  goles_local: number;
  goles_visitante: number;
  resultado_real: string;
  registrado_en: string;
}

function aResultado(f: FilaResultado): ResultadoPartido {
  return {
    partidoId: f.partido_id,
    golesLocal: f.goles_local,
    golesVisitante: f.goles_visitante,
    resultadoReal: f.resultado_real as ResultadoReal,
    registradoEn: f.registrado_en,
  };
}

/**
 * Inserta o actualiza el marcador de un partido. Deriva el 1X2 desde los
 * goles para no depender de que quien llame lo calcule. Idempotente.
 */
export async function guardarResultado(
  partidoId: string,
  golesLocal: number,
  golesVisitante: number
): Promise<ResultadoPartido> {
  const cliente = obtenerCliente();
  if (!cliente) {
    throw new Error('Supabase no configurada — no hay dónde guardar el resultado.');
  }
  const resultadoReal = resultadoDesdeGoles(golesLocal, golesVisitante);
  const { data, error } = await cliente
    .from('resultados')
    .upsert(
      {
        partido_id: partidoId,
        goles_local: golesLocal,
        goles_visitante: golesVisitante,
        resultado_real: resultadoReal,
      },
      { onConflict: 'partido_id' }
    )
    .select('partido_id, goles_local, goles_visitante, resultado_real, registrado_en')
    .single();

  if (error) throw new Error(`Error guardando resultado: ${error.message}`);
  return aResultado(data as FilaResultado);
}

/** Lee el resultado de un partido, o null si aún no se ha jugado/ingerido. */
export async function leerResultado(
  partidoId: string
): Promise<ResultadoPartido | null> {
  const cliente = obtenerCliente();
  if (!cliente) return null;
  const { data, error } = await cliente
    .from('resultados')
    .select('partido_id, goles_local, goles_visitante, resultado_real, registrado_en')
    .eq('partido_id', partidoId)
    .limit(1);
  if (error) {
    console.error('Error leyendo resultado:', error);
    return null;
  }
  if (!data || data.length === 0) return null;
  return aResultado(data[0] as FilaResultado);
}

/** Lee TODOS los resultados (para el historial / boletín). */
export async function leerTodosLosResultados(): Promise<ResultadoPartido[]> {
  const cliente = obtenerCliente();
  if (!cliente) return [];
  const { data, error } = await cliente
    .from('resultados')
    .select('partido_id, goles_local, goles_visitante, resultado_real, registrado_en');
  if (error) {
    console.error('Error leyendo resultados:', error);
    return [];
  }
  return (data ?? []).map((f) => aResultado(f as FilaResultado));
}
