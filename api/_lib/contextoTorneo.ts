import { PARTIDOS } from '../../src/datos/partidos.js';
import { equipoPorId } from '../../src/datos/equipos.js';
import type { LetraGrupo, Partido } from '../../src/tipos/index.js';
import type { ResultadoPartido } from './resultados.js';

/**
 * Contexto intra-torneo: lo que YA pasó en el Mundial antes de un partido,
 * derivado puramente del calendario + los resultados verificados de Supabase.
 *
 * Por qué existe:
 *   El dossier (Capa 1.5) ancla a las IAs a hechos PREVIOS al torneo (DT,
 *   figura, cómo clasificó) pero está congelado al 2026-06-10. A medida que
 *   el Mundial avanza (MD2, MD3, eliminatorias) las IAs predecían "a ciegas":
 *   no sabían que Brasil ya empató dos veces, ni que Noruega clasificó. Un
 *   analista humano usaría esa forma intra-torneo. Esto se la entrega — como
 *   MÁS hechos verificados, no como opinión, preservando la garantía
 *   anti-alucinación.
 *
 * Anti data-leakage (regla dura):
 *   Sólo se incluyen partidos cuyo kickoff es ANTERIOR al del partido a
 *   predecir (`fechaISO <` estricto). Así la predicción nunca ve el futuro,
 *   y regenerarla más tarde da el MISMO contexto (determinista respecto al
 *   partido, no al reloj). Dos partidos simultáneos (los dos MD3 de un grupo
 *   son a la misma hora) no se conocen entre sí — correcto.
 */

/** Un partido ya jugado por un equipo, visto desde su perspectiva. */
export interface PartidoJugado {
  rivalId: string;
  rivalNombre: string;
  /** El equipo de interés jugó de local en este partido. */
  esLocal: boolean;
  /** Jornada (1, 2, 3) extraída del id del partido. */
  matchday: number;
  golesAFavor: number;
  golesEnContra: number;
  resultado: 'G' | 'E' | 'P';
}

/** Récord acumulado de un equipo en lo que va del torneo. */
export interface RecordEquipo {
  equipoId: string;
  nombre: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  pts: number;
  /** Sus partidos jugados, ordenados por jornada. */
  partidos: PartidoJugado[];
}

/** Una fila de la tabla del grupo, tal como estaba antes del partido. */
export interface FilaTabla {
  equipoId: string;
  nombre: string;
  pj: number;
  pts: number;
  /** Diferencia de gol (gf - gc). */
  dif: number;
  gf: number;
}

/** El contexto completo que se inyecta al prompt (null si no aporta nada). */
export interface ContextoTorneo {
  local: RecordEquipo;
  visitante: RecordEquipo;
  grupo?: LetraGrupo;
  /** Tabla del grupo ordenada (sólo en fase de grupos). */
  tabla?: FilaTabla[];
}

/** Extrae el número de jornada del id "X-MDn-m". Devuelve 0 si no matchea. */
function matchdayDe(id: string): number {
  const m = id.match(/-MD(\d)-/);
  return m ? Number(m[1]) : 0;
}

/**
 * Calcula el récord de un equipo usando sólo partidos con kickoff anterior a
 * `fechaCorte` que ya tengan resultado. Función pura.
 */
function recordDe(
  equipoId: string,
  fechaCorte: string,
  resPorId: Map<string, ResultadoPartido>
): RecordEquipo {
  const partidos: PartidoJugado[] = [];
  let g = 0;
  let e = 0;
  let p = 0;
  let gf = 0;
  let gc = 0;

  for (const m of PARTIDOS) {
    if (m.fechaISO >= fechaCorte) continue; // anti-leakage: sólo el pasado
    const esLocal = m.equipoLocalId === equipoId;
    const esVisitante = m.equipoVisitanteId === equipoId;
    if (!esLocal && !esVisitante) continue;

    const r = resPorId.get(m.id);
    if (!r) continue; // programado o aún sin marcador ingerido

    const golesAFavor = esLocal ? r.golesLocal : r.golesVisitante;
    const golesEnContra = esLocal ? r.golesVisitante : r.golesLocal;
    const resultado: 'G' | 'E' | 'P' =
      golesAFavor > golesEnContra ? 'G' : golesAFavor < golesEnContra ? 'P' : 'E';

    if (resultado === 'G') g++;
    else if (resultado === 'E') e++;
    else p++;
    gf += golesAFavor;
    gc += golesEnContra;

    const rivalId = esLocal ? m.equipoVisitanteId : m.equipoLocalId;
    partidos.push({
      rivalId,
      rivalNombre: equipoPorId(rivalId).nombre,
      esLocal,
      matchday: matchdayDe(m.id),
      golesAFavor,
      golesEnContra,
      resultado,
    });
  }

  partidos.sort((a, b) => a.matchday - b.matchday);

  return {
    equipoId,
    nombre: equipoPorId(equipoId).nombre,
    pj: g + e + p,
    g,
    e,
    p,
    gf,
    gc,
    pts: g * 3 + e,
    partidos,
  };
}

/**
 * Construye el contexto intra-torneo para un partido. Devuelve null cuando
 * ninguno de los dos equipos ha jugado todavía (típicamente MD1): en ese
 * caso no hay nada verificado que aportar y el prompt omite el bloque.
 */
export function construirContextoTorneo(
  partido: Partido,
  resultados: ResultadoPartido[]
): ContextoTorneo | null {
  const resPorId = new Map(resultados.map((r) => [r.partidoId, r]));
  const fechaCorte = partido.fechaISO;

  const local = recordDe(partido.equipoLocalId, fechaCorte, resPorId);
  const visitante = recordDe(partido.equipoVisitanteId, fechaCorte, resPorId);

  if (local.pj === 0 && visitante.pj === 0) return null;

  let tabla: FilaTabla[] | undefined;
  if (partido.grupo) {
    const idsGrupo = new Set<string>();
    for (const m of PARTIDOS) {
      if (m.grupo === partido.grupo) {
        idsGrupo.add(m.equipoLocalId);
        idsGrupo.add(m.equipoVisitanteId);
      }
    }
    tabla = [...idsGrupo]
      .map((id) => {
        const r = recordDe(id, fechaCorte, resPorId);
        return {
          equipoId: id,
          nombre: r.nombre,
          pj: r.pj,
          pts: r.pts,
          dif: r.gf - r.gc,
          gf: r.gf,
        };
      })
      // Orden simple: puntos, luego diferencia de gol, luego goles a favor.
      // No replica todos los desempates FIFA (head-to-head, fair play), por
      // eso el prompt lo etiqueta como orden aproximado.
      .sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
  }

  return {
    local,
    visitante,
    grupo: partido.grupo,
    ...(tabla ? { tabla } : {}),
  };
}
