/**
 * "Juega contra las 3 IAs" — almacenamiento de los pronósticos del usuario.
 *
 * SIN cuenta y SIN fricción: los picks viven en localStorage, por dispositivo.
 * El registro (correo + enlace mágico al LMS) es RECOMPENSA opcional, nunca
 * un requisito para jugar. Esta capa no sabe nada de cuentas ni de red.
 */

export type ResultadoPick = 'local' | 'empate' | 'visitante';

export interface Pick {
  resultado: ResultadoPick;
  /** Marcador opcional (bonus); no afecta el cálculo del ranking. */
  golesLocal?: number;
  golesVisitante?: number;
  /** Cuándo se hizo (ms). */
  ts: number;
}

/** partidoId → Pick. */
export type Picks = Record<string, Pick>;

const CLAVE = 'pg_mis_picks';
/** Evento interno para que la UI reaccione al cambiar un pick. */
const EVENTO = 'pg:picks';

export function cargarPicks(): Picks {
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Picks) : {};
  } catch {
    return {};
  }
}

function escribir(picks: Picks): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(picks));
  } catch {
    /* almacenamiento lleno / bloqueado: el pick vive solo en memoria */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENTO));
  }
}

export function guardarPick(partidoId: string, pick: Omit<Pick, 'ts'>): Picks {
  const picks = cargarPicks();
  picks[partidoId] = { ...pick, ts: Date.now() };
  escribir(picks);
  return picks;
}

export function borrarPick(partidoId: string): Picks {
  const picks = cargarPicks();
  delete picks[partidoId];
  escribir(picks);
  return picks;
}

/** ¿El usuario ya hizo al menos un pick? (gatillo del panel de registro). */
export function hayAlgunPick(): boolean {
  return Object.keys(cargarPicks()).length > 0;
}

export const EVENTO_PICKS = EVENTO;
