import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { canalConSeguimiento, lmsConSeguimiento } from '../marca/enlaces.ts';
import IconoWhatsApp from '../componentes/IconoWhatsApp';
import { evento } from './analitica.ts';

/**
 * Modal de captación, una sola vez por visitante. Aislado del resto.
 *
 * Trigger: a los 30 s O al ver la 2ª predicción (lo que ocurra primero).
 * Control con localStorage: si ya se mostró, no reaparece en 72 h.
 * Cierre fácil (X, clic fuera, Escape). NUNCA bloquea la navegación.
 */

const CLAVE_VISTO = 'pg:modal-captura-visto';
const VENTANA_MS = 72 * 60 * 60 * 1000; // 72 horas
const DELAY_MS = 30_000; // 30 segundos
const PARTIDOS_PARA_DISPARAR = 2;

function puedeMostrar(): boolean {
  try {
    const t = localStorage.getItem(CLAVE_VISTO);
    if (!t) return true;
    return Date.now() - Number(t) > VENTANA_MS;
  } catch {
    return true;
  }
}

function ModalCaptura() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const [abierto, setAbierto] = useState(false);
  const disparado = useRef(false);
  const partidosVistos = useRef(0);

  const disparar = useCallback(() => {
    if (disparado.current || !puedeMostrar()) return;
    disparado.current = true;
    setAbierto(true);
    try {
      localStorage.setItem(CLAVE_VISTO, String(Date.now()));
    } catch {
      /* sin localStorage: igual se muestra esta vez */
    }
    evento('captura_modal_mostrado');
  }, []);

  // Trigger 1: 30 segundos en la app.
  useEffect(() => {
    if (!puedeMostrar()) return;
    const id = setTimeout(disparar, DELAY_MS);
    return () => clearTimeout(id);
  }, [disparar]);

  // Trigger 2: al ver la 2ª predicción (segunda visita a /partido/*).
  useEffect(() => {
    if (location.pathname.startsWith('/partido/')) {
      partidosVistos.current += 1;
      if (partidosVistos.current >= PARTIDOS_PARA_DISPARAR) disparar();
    }
  }, [location.pathname, disparar]);

  const ocultar = () => setAbierto(false);
  const cerrar = (motivo: string) => {
    ocultar();
    evento('captura_modal_cerrado', { motivo });
  };

  // Escape cierra.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar('escape');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto]);

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(5, 12, 24, 0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => cerrar('fuera')}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-captura-titulo"
        >
          <motion.div
            className="relative w-full max-w-md rounded-lg border border-tinta-lineaFuerte bg-tinta-tarjeta p-6 sm:p-8"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => cerrar('x')}
              aria-label="Cerrar"
              className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-md text-tinta-mute hover:text-tinta-titulo transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="m6 6 12 12" />
                <path d="m18 6-12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <IconoWhatsApp className="w-5 h-5 text-[#25D366]" />
              <p className="kicker text-verde">Canal de WhatsApp · gratis</p>
            </div>

            <h2
              id="modal-captura-titulo"
              className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo leading-snug"
            >
              ¿Quieres las predicciones de cada jornada del Mundial?
            </h2>
            <p className="mt-2 text-[15px] text-tinta-cuerpo leading-relaxed">
              3 IAs, transparencia total, directo a tu WhatsApp. Gratis.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href={canalConSeguimiento('modal')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  evento('captura_modal_whatsapp');
                  ocultar();
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-verde text-tinta-fondo font-semibold text-[15px] hover:bg-verde-hover transition-colors"
              >
                <IconoWhatsApp className="w-5 h-5" />
                Únete al canal de WhatsApp
              </a>
              <a
                href={lmsConSeguimiento('modal')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  evento('captura_modal_explorar');
                  ocultar();
                }}
                className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-tinta-lineaFuerte text-tinta-cuerpo font-medium text-[15px] hover:border-cyan/40 hover:text-tinta-titulo transition-colors"
              >
                Explorar la plataforma
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ModalCaptura;
