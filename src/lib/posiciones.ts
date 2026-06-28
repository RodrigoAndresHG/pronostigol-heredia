import type { LetraGrupo } from '../tipos/index.js';
import { EQUIPOS } from '../datos/equipos.js';
import { partidoPorId } from '../datos/partidos.js';
import { LETRAS_GRUPOS } from '../datos/grupos.js';

/**
 * Tabla de posiciones de la fase de grupos — lógica PURA.
 *
 * Parte de los 48 equipos en cero y aplica cada resultado jugado: 3 puntos
 * por victoria, 1 por empate. Ordena cada grupo por puntos, diferencia de
 * goles y goles a favor (desempates estándar; no incluye el head-to-head de
 * FIFA, suficiente para una vista pública en vivo). Se ve desde el día 1 y
 * se llena solo con cada resultado.
 */

export interface FilaPosicion {
  equipoId: string;
  /** Partidos jugados. */
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  /** Goles a favor / en contra / diferencia. */
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

export interface GrupoPosiciones {
  grupo: LetraGrupo;
  filas: FilaPosicion[];
}

interface ResultadoMin {
  partidoId: string;
  golesLocal: number;
  golesVisitante: number;
}

export function calcularPosiciones(resultados: ResultadoMin[]): GrupoPosiciones[] {
  const tabla = new Map<string, FilaPosicion>();
  for (const e of EQUIPOS) {
    tabla.set(e.id, {
      equipoId: e.id,
      pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0,
    });
  }

  for (const r of resultados) {
    const p = partidoPorId(r.partidoId);
    if (!p || p.fase !== 'grupos') continue; // sólo fase de grupos (no R32+)
    const local = tabla.get(p.equipoLocalId);
    const visitante = tabla.get(p.equipoVisitanteId);
    if (!local || !visitante) continue;

    const gl = r.golesLocal;
    const gv = r.golesVisitante;
    local.pj++; visitante.pj++;
    local.gf += gl; local.gc += gv;
    visitante.gf += gv; visitante.gc += gl;

    if (gl > gv) {
      local.pg++; local.pts += 3; visitante.pp++;
    } else if (gl < gv) {
      visitante.pg++; visitante.pts += 3; local.pp++;
    } else {
      local.pe++; visitante.pe++; local.pts++; visitante.pts++;
    }
  }

  for (const f of tabla.values()) f.dg = f.gf - f.gc;

  return LETRAS_GRUPOS.map((grupo) => {
    const filas = EQUIPOS.filter((e) => e.grupo === grupo).map((e) => tabla.get(e.id)!);
    filas.sort(
      (a, b) =>
        b.pts - a.pts ||
        b.dg - a.dg ||
        b.gf - a.gf ||
        a.equipoId.localeCompare(b.equipoId)
    );
    return { grupo, filas };
  });
}
