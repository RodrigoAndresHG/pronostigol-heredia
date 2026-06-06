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
 * LMS / workshop de la metodología HeredIA.
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
  try {
    const u = new URL(LMS_URL);
    u.searchParams.set('utm_source', 'pronostigol');
    u.searchParams.set('utm_medium', 'app');
    u.searchParams.set('utm_campaign', 'mundial2026');
    u.searchParams.set('utm_content', contenido);
    return u.toString();
  } catch {
    return LMS_URL;
  }
}
