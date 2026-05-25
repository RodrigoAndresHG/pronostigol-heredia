import type { LetraGrupo } from '../tipos';
import { EQUIPOS } from './equipos.ts';

/**
 * Las 12 letras de grupo en orden.
 */
export const LETRAS_GRUPOS: LetraGrupo[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
];

/**
 * Devuelve los 4 equipos de un grupo dado, en el orden en que aparecen
 * en `EQUIPOS` (que coincide con la lista oficial: cabeza de serie primero).
 */
export function equiposDelGrupo(letra: LetraGrupo) {
  return EQUIPOS.filter((equipo) => equipo.grupo === letra);
}
