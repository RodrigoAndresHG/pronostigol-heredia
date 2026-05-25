/**
 * Helpers para mostrar fechas y horas de partidos en la zona del usuario.
 *
 * Decisiones:
 *   - Todas las fechas viajan en ISO UTC. La conversión se hace al
 *     renderizar, NUNCA al guardar.
 *   - Detectamos la zona del usuario con `Intl.DateTimeFormat`. Si no
 *     se puede, caemos a "America/Guayaquil" (Rodrigo está en Ambato, Ecuador).
 *   - Idioma fijo "es-EC" para que las fechas salgan en español ecuatoriano.
 */

const ZONA_POR_DEFECTO = 'America/Guayaquil';
const LOCALE = 'es-EC';

/**
 * Devuelve la zona horaria detectada del navegador, o la zona Ecuador
 * como respaldo. Memoizado tras la primera llamada.
 */
let zonaCache: string | null = null;
export function zonaDelUsuario(): string {
  if (zonaCache) return zonaCache;
  try {
    zonaCache = Intl.DateTimeFormat().resolvedOptions().timeZone || ZONA_POR_DEFECTO;
  } catch {
    zonaCache = ZONA_POR_DEFECTO;
  }
  return zonaCache;
}

/**
 * Devuelve la fecha en formato corto, por ejemplo: "jue 11 jun".
 */
export function fechaCorta(isoUTC: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: zonaDelUsuario(),
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(isoUTC));
}

/**
 * Devuelve la hora local del usuario en formato 24h: "14:00".
 */
export function horaLocal(isoUTC: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: zonaDelUsuario(),
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(isoUTC));
}

/**
 * Cabecera de fecha completa: "Jueves 11 de junio de 2026".
 */
export function fechaCompleta(isoUTC: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: zonaDelUsuario(),
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoUTC));
}

/**
 * Clave de agrupación por día (en zona del usuario), p. ej. "2026-06-11".
 * Útil para agrupar partidos por fecha en la UI.
 */
export function claveDiaLocal(isoUTC: string): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: zonaDelUsuario(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoUTC));
  return partes; // ya viene como "YYYY-MM-DD"
}
