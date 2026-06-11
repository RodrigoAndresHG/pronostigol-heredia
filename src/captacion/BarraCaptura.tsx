import { useState } from 'react';
import { canalConSeguimiento } from '../marca/enlaces.ts';
import { evento } from './analitica.ts';

/**
 * Barra de captación sticky inferior (global). Empuja suave hacia el canal
 * de WhatsApp. Aislada: no toca el resto de la app. Si el visitante la
 * cierra, no reaparece en esa sesión (sessionStorage).
 *
 * Mobile-first, ≤56px, sobre el contenido (z-40) pero bajo el modal (z-50).
 * Renderiza un espaciador en flujo para no tapar el final del contenido.
 */

const CLAVE = 'pg:barra-captura-cerrada';

function leerCerrada(): boolean {
  try {
    return sessionStorage.getItem(CLAVE) === '1';
  } catch {
    return false;
  }
}

function BarraCaptura() {
  const [visible, setVisible] = useState(() => !leerCerrada());
  if (!visible) return null;

  const cerrar = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(CLAVE, '1');
    } catch {
      /* sin sessionStorage: solo se oculta en este render */
    }
    evento('captura_barra_cerrada');
  };

  return (
    <>
      {/* Espaciador en flujo: reserva 56px para que la barra fija no tape el final */}
      <div aria-hidden className="h-14" />

      <div className="fixed bottom-0 inset-x-0 z-40 h-14 bg-tinta-elevado/95 backdrop-blur-md border-t border-tinta-linea">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-8 flex items-center gap-3">
          <a
            href={canalConSeguimiento('barra')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => evento('captura_barra_click')}
            className="flex-1 min-w-0 flex items-center gap-2 group"
          >
            <span aria-hidden className="text-[15px] shrink-0">
              ⚽
            </span>
            <span className="truncate text-[13px] text-tinta-cuerpo">
              Las predicciones de cada jornada{' '}
              <span className="text-verde font-semibold group-hover:text-verde-hover transition-colors">
                — Únete al canal →
              </span>
            </span>
          </a>
          <button
            onClick={cerrar}
            aria-label="Cerrar barra"
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md text-tinta-mute hover:text-tinta-cuerpo transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default BarraCaptura;
