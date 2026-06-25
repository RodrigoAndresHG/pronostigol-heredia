import type { LetraGrupo } from '../tipos/index.js';
import { calcularPosiciones } from './posiciones.js';
import { LETRAS_GRUPOS } from '../datos/grupos.js';
import { PARTIDOS } from '../datos/partidos.js';
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

export interface CruceResuelto {
  numero: number;
  local: OcupanteSlot;
  visitante: OcupanteSlot;
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

  const cruces32: CruceResuelto[] = RONDA_32.map((c) => ({
    numero: c.numero,
    local: ocupante(c.local),
    visitante: ocupante(c.visitante),
  }));

  // Árbol completo en columnas para dibujar la llave. La R32 va resuelta y en
  // orden "planar"; las rondas siguientes muestran al ganador pendiente de cada
  // cruce previo ("Gan. 73") — se irán resolviendo en una fase posterior.
  const porNumero = new Map(cruces32.map((c) => [c.numero, c]));
  const pendiente = (n: number): OcupanteSlot => ({
    etiqueta: `Gan. ${n}`,
    confirmado: false,
  });
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
        local: pendiente(a.localDe),
        visitante: pendiente(a.visitanteDe),
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
