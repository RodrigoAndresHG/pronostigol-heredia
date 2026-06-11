import { track } from '@vercel/analytics';

/**
 * Envoltorio mínimo sobre Vercel Analytics. Registra un evento custom sin
 * reventar si Analytics no está disponible (p. ej. en local sin el script).
 * Los eventos solo se cuentan en producción con Web Analytics activado.
 */
export function evento(
  nombre: string,
  props?: Record<string, string | number | boolean>
): void {
  try {
    track(nombre, props);
  } catch {
    /* sin Analytics: no pasa nada */
  }
}
