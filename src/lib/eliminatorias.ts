import type { LetraGrupo } from '../tipos/index.js';
import { calcularPosiciones } from './posiciones.js';
import { LETRAS_GRUPOS } from '../datos/grupos.js';
import { PARTIDOS, partidoPorId } from '../datos/partidos.js';
import {
  RONDA_32,
  AVANCE,
  ORDEN_R32,
  COLUMNAS_LLAVE,
  PARTIDOS_POR_GRUPO,
  TERCEROS_QUE_CLASIFICAN,
  type SlotRef,
  type FaseLlave,
} from '../datos/eliminatorias.js';

/**
 * Llave en vivo — lógica PURA.
 *
 * Cruza la tabla de posiciones (derivada de los resultados reales) con la
 * estructura fija de la Ronda de 32 para ubicar a cada selección en su slot.
 *
 * Estados de un slot:
 *   - confirmado: el grupo ya cerró (6/6 partidos) → la posición es definitiva.
 *   - provisional: el grupo va avanzado (≥4 partidos) pero aún puede cambiar.
 *   - sin resolver: muy temprano, o es un slot de tercero (su ubicación exacta
 *     la fija el Anexo C de FIFA al cerrarse los 12 grupos). Se muestra la
 *     etiqueta ("1A", "3º C/E/F/H/I").
 *
 * Los terceros no se "ubican" en su slot todavía: primero porque los 8 mejores
 * no se conocen hasta cerrar los 12 grupos, y segundo porque el reparto a
 * slots requiere la tabla de combinaciones (Anexo C). Mientras tanto se publica
 * la CARRERA por los mejores terceros: el ranking en vivo de los 12 terceros.
 */

interface ResultadoMin {
  partidoId: string;
  golesLocal: number;
  golesVisitante: number;
}

/** Cuántos partidos del grupo se necesitan jugados para mostrar al ocupante provisional. */
const MIN_PARA_PROVISIONAL = 4;

export interface OcupanteSlot {
  /** Etiqueta del slot, siempre presente ("1A", "3º C/E/F/H/I"). */
  etiqueta: string;
  /** Equipo que ocupa el slot, si ya se puede mostrar. */
  equipoId?: string;
  /** El grupo cerró: la posición es definitiva. */
  confirmado: boolean;
  /** Se muestra al equipo pero el grupo aún no cierra (puede cambiar). */
  provisional?: boolean;
}

/** Marcador final de un cruce ya jugado. */
export interface ResultadoCruce {
  golesLocal: number;
  golesVisitante: number;
  /**
   * Lado ganador en los 90'. 'empate' = igualdad en tiempo reglamentario;
   * en eliminatoria se definiría por penales, dato que aún no guardamos, así
   * que un empate NO propaga ganador a la ronda siguiente.
   */
  ganador: 'local' | 'visitante' | 'empate';
}

export interface CruceResuelto {
  numero: number;
  local: OcupanteSlot;
  visitante: OcupanteSlot;
  /** Presente solo si el partido ya se jugó y su marcador está registrado. */
  resultado?: ResultadoCruce;
}

export interface TerceroFila {
  equipoId: string;
  grupo: LetraGrupo;
  pts: number;
  dg: number;
  gf: number;
  /** Está entre los 8 mejores terceros (provisional si su grupo no cerró). */
  clasifica: boolean;
  /** Su grupo ya cerró: su récord de tercero es definitivo. */
  confirmado: boolean;
}

export interface RondaLlave {
  fase: 'r32' | FaseLlave;
  etiqueta: string;
  cruces: CruceResuelto[];
}

export interface Llave {
  /** El árbol completo en columnas (R32→Final) para dibujar la llave. */
  rondas: RondaLlave[];
  /** Los 12 terceros ordenados; los 8 primeros clasifican. */
  terceros: TerceroFila[];
  /** Cuántos de los 12 grupos ya cerraron. */
  gruposCompletos: number;
}

export function construirLlave(resultados: ResultadoMin[]): Llave {
  const grupos = calcularPosiciones(resultados);
  const porGrupo = new Map(grupos.map((g) => [g.grupo, g]));

  // Partidos jugados por grupo → saber si el grupo cerró o va avanzado.
  const jugados = new Map<LetraGrupo, number>();
  for (const l of LETRAS_GRUPOS) jugados.set(l, 0);
  const conResultado = new Set(resultados.map((r) => r.partidoId));
  const resPorId = new Map(resultados.map((r) => [r.partidoId, r]));
  const ganadorDeGoles = (
    gl: number,
    gv: number
  ): 'local' | 'visitante' | 'empate' =>
    gl > gv ? 'local' : gv > gl ? 'visitante' : 'empate';
  for (const p of PARTIDOS) {
    if (p.grupo && conResultado.has(p.id)) {
      jugados.set(p.grupo, (jugados.get(p.grupo) ?? 0) + 1);
    }
  }
  const completo = (l: LetraGrupo) => (jugados.get(l) ?? 0) >= PARTIDOS_POR_GRUPO;

  const ocupante = (slot: SlotRef): OcupanteSlot => {
    // Los terceros no se ubican aún (dependen del Anexo C + cierre de grupos).
    if (slot.tipo === 'tercero' || !slot.grupo) {
      return { etiqueta: slot.etiqueta, confirmado: false };
    }
    const fila = porGrupo.get(slot.grupo)!.filas[slot.tipo === 'ganador' ? 0 : 1];
    const jug = jugados.get(slot.grupo) ?? 0;
    if (completo(slot.grupo)) {
      return { etiqueta: slot.etiqueta, equipoId: fila.equipoId, confirmado: true };
    }
    if (jug >= MIN_PARA_PROVISIONAL) {
      return {
        etiqueta: slot.etiqueta,
        equipoId: fila.equipoId,
        confirmado: false,
        provisional: true,
      };
    }
    return { etiqueta: slot.etiqueta, confirmado: false };
  };

  // Con los 12 grupos cerrados, la R32 ya está definida: usamos los fixtures
  // con equipos resueltos como fuente de verdad — eso ubica también a los
  // terceros (Anexo C). Antes de eso, derivamos por slot desde las posiciones
  // (llenado en vivo: 1º/2º provisional→confirmado, terceros como etiqueta).
  const todosLosGruposCerrados = LETRAS_GRUPOS.every(completo);
  const cruces32: CruceResuelto[] = RONDA_32.map((c) => {
    const fixture = todosLosGruposCerrados ? partidoPorId(`R32-${c.numero}`) : undefined;
    const base: CruceResuelto =
      fixture && fixture.fase === 'r32'
        ? {
            numero: c.numero,
            local: { etiqueta: c.local.etiqueta, equipoId: fixture.equipoLocalId, confirmado: true },
            visitante: {
              etiqueta: c.visitante.etiqueta,
              equipoId: fixture.equipoVisitanteId,
              confirmado: true,
            },
          }
        : {
            numero: c.numero,
            local: ocupante(c.local),
            visitante: ocupante(c.visitante),
          };
    // Si el partido ya se jugó, adjuntamos su marcador final.
    const r = resPorId.get(`R32-${c.numero}`);
    if (r) {
      base.resultado = {
        golesLocal: r.golesLocal,
        golesVisitante: r.golesVisitante,
        ganador: ganadorDeGoles(r.golesLocal, r.golesVisitante),
      };
    }
    return base;
  });

  // Quién avanza: ganador (en los 90') de cada cruce ya resuelto. Un empate no
  // resuelve avance (faltarían los penales). Hoy solo la R32 tiene resultados;
  // al cargar fixtures de rondas posteriores (Fase B) este mapa los cubrirá.
  const ganadorDe = new Map<number, string>();
  for (const c of cruces32) {
    if (c.resultado && c.resultado.ganador !== 'empate') {
      const idGanador =
        c.resultado.ganador === 'local' ? c.local.equipoId : c.visitante.equipoId;
      if (idGanador) ganadorDe.set(c.numero, idGanador);
    }
  }

  // Árbol completo en columnas para dibujar la llave. La R32 va resuelta y en
  // orden "planar"; las rondas siguientes muestran al ganador pendiente de cada
  // cruce previo ("Gan. 73") — se irán resolviendo en una fase posterior.
  const porNumero = new Map(cruces32.map((c) => [c.numero, c]));
  // Slot de una ronda posterior: si el cruce que lo alimenta ya tiene ganador,
  // se ubica al equipo; si no, se muestra "Gan. N" a la espera del resultado.
  const slotAvance = (n: number): OcupanteSlot => {
    const id = ganadorDe.get(n);
    return id
      ? { etiqueta: `Gan. ${n}`, equipoId: id, confirmado: true }
      : { etiqueta: `Gan. ${n}`, confirmado: false };
  };
  const rondas: RondaLlave[] = COLUMNAS_LLAVE.map(({ fase, etiqueta }) => {
    if (fase === 'r32') {
      return {
        fase,
        etiqueta,
        cruces: ORDEN_R32.map((n) => porNumero.get(n)!),
      };
    }
    return {
      fase,
      etiqueta,
      cruces: AVANCE.filter((a) => a.fase === fase).map((a) => ({
        numero: a.numero,
        local: slotAvance(a.localDe),
        visitante: slotAvance(a.visitanteDe),
      })),
    };
  });

  // Carrera por los mejores terceros: el 3.º de cada grupo, rankeado global.
  const terceros: TerceroFila[] = LETRAS_GRUPOS.map((l) => {
    const f = porGrupo.get(l)!.filas[2];
    return {
      equipoId: f.equipoId,
      grupo: l,
      pts: f.pts,
      dg: f.dg,
      gf: f.gf,
      clasifica: false,
      confirmado: completo(l),
    };
  });
  terceros.sort(
    (a, b) =>
      b.pts - a.pts ||
      b.dg - a.dg ||
      b.gf - a.gf ||
      a.equipoId.localeCompare(b.equipoId)
  );
  terceros.forEach((tf, i) => {
    tf.clasifica = i < TERCEROS_QUE_CLASIFICAN;
  });

  const gruposCompletos = LETRAS_GRUPOS.filter(completo).length;

  return { rondas, terceros, gruposCompletos };
}
