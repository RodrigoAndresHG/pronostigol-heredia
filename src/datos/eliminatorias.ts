import type { LetraGrupo } from '../tipos/index.js';

/**
 * Estructura FIJA de la Ronda de 32 del Mundial 2026 (partidos M73–M88).
 *
 * El cuadro NO se sortea: cada posición de grupo cae en un slot predefinido
 * por FIFA. Verificado contra Wikipedia, Sky Sports y worldcupwiki (coinciden
 * exactamente). Hay tres tipos de slot:
 *   - ganador  → 1º de un grupo (p. ej. 1A)
 *   - segundo  → 2º de un grupo (p. ej. 2B)
 *   - tercero  → uno de los 8 mejores terceros, de un subconjunto de 5 grupos
 *
 * La UBICACIÓN exacta de cada tercero en su slot la define la tabla de
 * combinaciones de FIFA (Anexo C, 495 filas) y sólo se conoce al cerrarse los
 * 12 grupos. Hasta entonces, el slot muestra sus grupos candidatos.
 */

export type TipoSlot = 'ganador' | 'segundo' | 'tercero';

export interface SlotRef {
  tipo: TipoSlot;
  /** Grupo de origen para ganador/segundo. */
  grupo?: LetraGrupo;
  /** Grupos candidatos (5) para un slot de tercero. */
  candidatos?: LetraGrupo[];
  /** Texto corto para mostrar mientras el slot no está resuelto: "1A", "3º C/E/F/H/I". */
  etiqueta: string;
}

export interface CruceR32 {
  /** Número de partido oficial (73–88). */
  numero: number;
  local: SlotRef;
  visitante: SlotRef;
}

// Constructores compactos de slot.
const g = (grupo: LetraGrupo): SlotRef => ({ tipo: 'ganador', grupo, etiqueta: `1${grupo}` });
const s = (grupo: LetraGrupo): SlotRef => ({ tipo: 'segundo', grupo, etiqueta: `2${grupo}` });
const t = (candidatos: LetraGrupo[]): SlotRef => ({
  tipo: 'tercero',
  candidatos,
  etiqueta: `3º ${candidatos.join('/')}`,
});

/** Los 16 cruces de la Ronda de 32, en orden de partido (M73–M88). */
export const RONDA_32: CruceR32[] = [
  { numero: 73, local: s('A'), visitante: s('B') },
  { numero: 74, local: g('E'), visitante: t(['A', 'B', 'C', 'D', 'F']) },
  { numero: 75, local: g('F'), visitante: s('C') },
  { numero: 76, local: g('C'), visitante: s('F') },
  { numero: 77, local: g('I'), visitante: t(['C', 'D', 'F', 'G', 'H']) },
  { numero: 78, local: s('E'), visitante: s('I') },
  { numero: 79, local: g('A'), visitante: t(['C', 'E', 'F', 'H', 'I']) },
  { numero: 80, local: g('L'), visitante: t(['E', 'H', 'I', 'J', 'K']) },
  { numero: 81, local: g('D'), visitante: t(['B', 'E', 'F', 'I', 'J']) },
  { numero: 82, local: g('G'), visitante: t(['A', 'E', 'H', 'I', 'J']) },
  { numero: 83, local: s('K'), visitante: s('L') },
  { numero: 84, local: g('H'), visitante: s('J') },
  { numero: 85, local: g('B'), visitante: t(['E', 'F', 'G', 'I', 'J']) },
  { numero: 86, local: g('J'), visitante: s('H') },
  { numero: 87, local: g('K'), visitante: t(['D', 'E', 'I', 'J', 'L']) },
  { numero: 88, local: s('D'), visitante: s('G') },
];

/** Fases de eliminación directa posteriores a la Ronda de 32. */
export type FaseLlave = 'r16' | 'cuartos' | 'semis' | 'final';

export interface CruceAvance {
  numero: number;
  fase: FaseLlave;
  /** Este cruce lo juega el GANADOR de estos dos partidos previos. */
  localDe: number;
  visitanteDe: number;
}

/**
 * Árbol de avance R16→Final, verificado contra el cuadro oficial de FIFA.
 * El orden dentro de cada fase es "planar": cada par consecutivo alimenta el
 * mismo cruce de la ronda siguiente, para que la llave se dibuje sin cruces.
 */
export const AVANCE: CruceAvance[] = [
  // Octavos (M89–M96)
  { numero: 89, fase: 'r16', localDe: 74, visitanteDe: 77 },
  { numero: 90, fase: 'r16', localDe: 73, visitanteDe: 75 },
  { numero: 93, fase: 'r16', localDe: 83, visitanteDe: 84 },
  { numero: 94, fase: 'r16', localDe: 81, visitanteDe: 82 },
  { numero: 91, fase: 'r16', localDe: 76, visitanteDe: 78 },
  { numero: 92, fase: 'r16', localDe: 79, visitanteDe: 80 },
  { numero: 95, fase: 'r16', localDe: 86, visitanteDe: 88 },
  { numero: 96, fase: 'r16', localDe: 85, visitanteDe: 87 },
  // Cuartos (M97–M100)
  { numero: 97, fase: 'cuartos', localDe: 89, visitanteDe: 90 },
  { numero: 98, fase: 'cuartos', localDe: 93, visitanteDe: 94 },
  { numero: 99, fase: 'cuartos', localDe: 91, visitanteDe: 92 },
  { numero: 100, fase: 'cuartos', localDe: 95, visitanteDe: 96 },
  // Semifinales (M101–M102)
  { numero: 101, fase: 'semis', localDe: 97, visitanteDe: 98 },
  { numero: 102, fase: 'semis', localDe: 99, visitanteDe: 100 },
  // Final (M104)
  { numero: 104, fase: 'final', localDe: 101, visitanteDe: 102 },
];

/**
 * Orden vertical (de arriba a abajo) de los 16 cruces de la Ronda de 32 para
 * dibujar la llave: cada par consecutivo alimenta el mismo octavo.
 */
export const ORDEN_R32: number[] = [
  74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87,
];

/** Metadatos de cada columna de la llave, de izquierda a derecha. */
export const COLUMNAS_LLAVE: { fase: 'r32' | FaseLlave; etiqueta: string }[] = [
  { fase: 'r32', etiqueta: 'Ronda de 32' },
  { fase: 'r16', etiqueta: 'Octavos' },
  { fase: 'cuartos', etiqueta: 'Cuartos' },
  { fase: 'semis', etiqueta: 'Semis' },
  { fase: 'final', etiqueta: 'Final' },
];

/** Cuántos partidos tiene cada grupo en la fase de grupos (para saber si cerró). */
export const PARTIDOS_POR_GRUPO = 6;

/** Cuántos de los 12 terceros clasifican a la Ronda de 32. */
export const TERCEROS_QUE_CLASIFICAN = 8;
