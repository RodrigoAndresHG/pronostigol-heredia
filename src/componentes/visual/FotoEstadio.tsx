import { useState } from 'react';
import { estadioPorSede, rutaImagenEstadio } from '../../datos/estadios.js';

/**
 * Renderiza la foto real de un estadio como fondo tratado (grayscale +
 * overlay vertical hacia el fondo midnight), con la atribución legal en
 * la esquina. Si la sede no tiene foto en el registro, cae a un fondo
 * sólido con el patrón de greca, sin romperse.
 *
 * Uso típico: como `position: absolute inset-0` detrás del contenido del
 * hero, con el contenido encima en z superior.
 */

interface Props {
  sede: string;
  /** Si true, muestra el crédito de autoría en la esquina inferior izquierda. */
  mostrarCredito?: boolean;
  /** Intensidad del overlay inferior (0..1). Default 0.92. */
  overlayInferior?: number;
  className?: string;
}

function FotoEstadio({
  sede,
  mostrarCredito = true,
  overlayInferior = 0.92,
  className = '',
}: Props) {
  const estadio = estadioPorSede(sede);
  const [error, setError] = useState(false);

  // Fallback: sin foto disponible → fondo sólido con un degradado de dos pasos
  // del mismo tono (nunca dos hues — disciplina editorial).
  if (!estadio || error) {
    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={{
          background: 'linear-gradient(180deg, #111E33 0%, #0A1628 100%)',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <img
        src={rutaImagenEstadio(estadio.slug)}
        alt={`${estadio.nombre}, ${estadio.ciudad}`}
        loading="lazy"
        onError={() => setError(true)}
        className="foto-tratada w-full h-full object-cover"
      />
      {/* Overlay vertical: transparente arriba → midnight abajo. Un solo tono. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(10,22,40,0.35) 0%, rgba(10,22,40,${overlayInferior}) 92%)`,
        }}
      />
      {/* Crédito legal — rasgo editorial, no letra chica oculta. */}
      {mostrarCredito && (
        <a
          href={estadio.credito.fuente}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 left-3 z-10 font-mono text-[10px] text-tinta-mute/80 hover:text-tinta-mute transition-colors"
        >
          FOTO: {estadio.credito.autor.toUpperCase()} / WIKIMEDIA / {estadio.credito.licencia}
        </a>
      )}
    </div>
  );
}

export default FotoEstadio;
