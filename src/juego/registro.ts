/**
 * Estado del registro al LMS (correo + enlace mágico), por dispositivo.
 *
 * El registro es RECOMPENSA, no peaje: nada de esto bloquea el juego. Sólo
 * recordamos si el usuario ya dejó su correo, para no volver a abrir el panel
 * automáticamente. La cuenta real vive en el LMS; aquí no hay sesión ni token.
 */

const CLAVE = 'pg_registro';
/** Evento para abrir el panel de registro desde cualquier parte de la app. */
export const EVENTO_ABRIR_REGISTRO = 'pg:abrir-registro';

/** ¿El usuario ya dejó su correo? (entonces no auto-abrir el panel). */
export function registroEnviado(): boolean {
  try {
    return localStorage.getItem(CLAVE) === 'enviado';
  } catch {
    return false;
  }
}

export function marcarRegistroEnviado(): void {
  try {
    localStorage.setItem(CLAVE, 'enviado');
  } catch {
    /* almacenamiento bloqueado: no es crítico */
  }
}

/** Abre el panel de registro (lo escucha <PanelRegistro/> montado en App). */
export function abrirRegistro(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_REGISTRO));
  }
}
