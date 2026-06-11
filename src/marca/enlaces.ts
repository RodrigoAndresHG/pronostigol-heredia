/**
 * Enlaces externos de la marca HeredIA + helpers de seguimiento.
 *
 * TODO lo de captación de tráfico (WhatsApp, LMS) sale de aquí. Si cambias
 * una URL, la cambias una sola vez en este archivo.
 */

/** Canal de WhatsApp (broadcast) donde publicas predicciones. */
export const WHATSAPP_CANAL =
  'https://whatsapp.com/channel/0029VbD3AGkLikg5aJbgRq0l';

/**
 * LMS / plataforma de la metodología HeredIA.
 * ⚠️ CONFIRMA O AJUSTA esta URL — la puse desde tu dominio conocido.
 */
export const LMS_URL = 'https://builder.rodriheredia.com';

/**
 * Devuelve la URL del LMS con parámetros UTM, para que en tus analytics
 * puedas ver QUÉ página de PronostiGol te manda más estudiantes.
 *
 * `contenido` identifica el punto exacto del que vino el clic
 * (ej. 'historial', 'inicio-final', 'footer'). Así sabes qué convierte.
 */
export function lmsConSeguimiento(contenido: string): string {
  return conUtm(LMS_URL, contenido);
}

/**
 * Igual que `lmsConSeguimiento` pero para el Canal de WhatsApp. Así, en tus
 * analytics, ves desde qué punto de la app (barra, modal, card, footer…)
 * vino cada suscripción al canal.
 */
export function canalConSeguimiento(contenido: string): string {
  return conUtm(WHATSAPP_CANAL, contenido);
}

/** Añade los UTMs estándar de la campaña a una URL. */
function conUtm(base: string, contenido: string): string {
  try {
    const u = new URL(base);
    u.searchParams.set('utm_source', 'pronostigol');
    u.searchParams.set('utm_medium', 'app');
    u.searchParams.set('utm_campaign', 'mundial2026');
    u.searchParams.set('utm_content', contenido);
    return u.toString();
  } catch {
    return base;
  }
}
