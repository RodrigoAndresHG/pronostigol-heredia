import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { usePicks } from './usePicks.ts';
import {
  EVENTO_ABRIR_REGISTRO,
  marcarRegistroEnviado,
  registroEnviado,
} from './registro.ts';
import { evento } from '../captacion/analitica.ts';

/**
 * B2 — El momento de conversión de "Compite contra las IAs".
 *
 * El registro es RECOMPENSA, no peaje. Este panel NUNCA se ve antes de que el
 * usuario interactúe: se abre solo tras su PRIMER pick de la sesión (no al
 * cargar con picks viejos), o cuando algo dispara EVENTO_ABRIR_REGISTRO (el
 * botón "Competir contra las IAs" de Mi Ranking).
 *
 * El correo viaja a /api/registro (serverless), que añade la X-API-Key del LMS
 * en el servidor y dispara el enlace mágico. El navegador nunca ve esa key.
 * Cierra fácil (X, clic fuera, Escape) y jamás bloquea la app.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Estado = 'idle' | 'enviando' | 'ok' | 'error';

function PanelRegistro() {
  const reduce = useReducedMotion();
  const { picks } = usePicks();
  const total = Object.keys(picks).length;

  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');
  const [mensajeError, setMensajeError] = useState('');

  // Picks al montar (usuario que vuelve): NO dispara el panel.
  const totalInicial = useRef(total);
  const yaAutoAbierto = useRef(false);

  // Auto-abrir UNA vez, sólo tras un pick NUEVO de esta sesión.
  useEffect(() => {
    if (yaAutoAbierto.current || registroEnviado()) return;
    if (total > totalInicial.current) {
      yaAutoAbierto.current = true;
      setAbierto(true);
      evento('juego_registro_mostrado', { origen: 'primer_pick' });
    }
  }, [total]);

  // Apertura manual (botón de Mi Ranking).
  useEffect(() => {
    const abrir = () => {
      setAbierto(true);
      evento('juego_registro_mostrado', { origen: 'manual' });
    };
    window.addEventListener(EVENTO_ABRIR_REGISTRO, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR_REGISTRO, abrir);
  }, []);

  // Escape cierra.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto]);

  // partidoId "actual" = el del último pick hecho.
  function partidoActual(): string | undefined {
    let mejor: { id: string; ts: number } | null = null;
    for (const [id, p] of Object.entries(picks)) {
      if (!mejor || p.ts > mejor.ts) mejor = { id, ts: p.ts };
    }
    return mejor?.id;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const correo = email.trim().toLowerCase();
    if (!EMAIL_RE.test(correo)) {
      setEstado('error');
      setMensajeError('Escribe un correo válido.');
      return;
    }
    setEstado('enviando');
    setMensajeError('');
    try {
      const r = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, partidoId: partidoActual() }),
      });
      const data = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!r.ok || !data.ok) {
        setEstado('error');
        setMensajeError(data.error || 'No se pudo registrar. Intenta de nuevo.');
        return;
      }
      marcarRegistroEnviado();
      setEstado('ok');
      evento('juego_registro_enviado');
    } catch {
      setEstado('error');
      setMensajeError('Sin conexión con el servidor. Intenta de nuevo.');
    }
  }

  const cerrar = () => setAbierto(false);

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
          onClick={cerrar}
          role="dialog"
          aria-modal="true"
          aria-labelledby="panel-registro-titulo"
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
              onClick={cerrar}
              aria-label="Cerrar"
              className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-md text-tinta-mute hover:text-tinta-titulo transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="m6 6 12 12" />
                <path d="m18 6-12 12" />
              </svg>
            </button>

            {estado === 'ok' ? (
              <div>
                <p className="kicker text-verde">Listo</p>
                <h2
                  id="panel-registro-titulo"
                  className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo leading-snug"
                >
                  Revisa tu correo.
                </h2>
                <p className="mt-2 text-[15px] text-tinta-cuerpo leading-relaxed">
                  Te enviamos un enlace mágico: tócalo para activar tu cuenta.
                  Tus pronósticos ya quedaron guardados.
                </p>
                <button
                  onClick={cerrar}
                  className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 rounded-md bg-verde text-tinta-fondo font-semibold text-[15px] hover:bg-verde-hover transition-colors"
                >
                  Seguir pronosticando
                </button>
              </div>
            ) : (
              <div>
                <p className="kicker text-cyan">Tu ranking vs las 3 IAs</p>
                <h2
                  id="panel-registro-titulo"
                  className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo leading-snug"
                >
                  Compite contra Claude, GPT y Gemini.
                </h2>
                <p className="mt-2 text-[15px] text-tinta-cuerpo leading-relaxed">
                  Guarda tus pronósticos y mira si le ganas a las 3 IAs. Cuenta
                  gratis, te llega un enlace mágico a tu correo, sin contraseña.
                </p>

                <form onSubmit={enviar} className="mt-6 flex flex-col gap-3">
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (estado === 'error') setEstado('idle');
                    }}
                    placeholder="tu@correo.com"
                    aria-label="Tu correo"
                    aria-invalid={estado === 'error'}
                    className="w-full px-4 py-3 rounded-md bg-tinta-fondo border border-tinta-lineaFuerte text-tinta-titulo text-[15px] placeholder:text-tinta-mute focus:border-verde focus:outline-none"
                  />
                  {estado === 'error' && (
                    <p className="font-mono text-[12px] text-peligro" role="alert">
                      {mensajeError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={estado === 'enviando'}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-verde text-tinta-fondo font-semibold text-[15px] hover:bg-verde-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {estado === 'enviando' ? 'Enviando…' : 'Competir contra las IAs'}
                  </button>
                </form>

                <p className="mt-3 font-mono text-[11px] text-tinta-mute leading-relaxed">
                  Sin contraseñas. Puedes seguir jugando aunque no te registres:
                  tus picks ya están guardados en este dispositivo.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PanelRegistro;
