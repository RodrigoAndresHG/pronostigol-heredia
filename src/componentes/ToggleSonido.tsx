import { useSonidoUI } from '../movimiento/SonidoContext.tsx';

/**
 * Botón discreto para activar/desactivar los micro-sonidos de UI.
 * Vive en la barra de navegación. Apagado por defecto; la preferencia
 * persiste. El acto de activarlo habilita el audio (gesto del usuario).
 */
function ToggleSonido() {
  const { activo, toggle } = useSonidoUI();

  return (
    <button
      onClick={() => void toggle()}
      aria-pressed={activo}
      aria-label={activo ? 'Desactivar sonidos de interfaz' : 'Activar sonidos de interfaz'}
      title={activo ? 'Sonido: encendido' : 'Sonido: apagado'}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
        activo ? 'text-verde' : 'text-tinta-mute hover:text-tinta-cuerpo'
      }`}
    >
      {activo ? (
        // Bocina con ondas
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      ) : (
        // Bocina tachada
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="m23 9-6 6" />
          <path d="m17 9 6 6" />
        </svg>
      )}
    </button>
  );
}

export default ToggleSonido;
