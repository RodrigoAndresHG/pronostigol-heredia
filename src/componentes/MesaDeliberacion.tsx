import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { Prediccion } from '../tipos';
import TarjetaIA from './TarjetaIA';
import BarraProbabilidad from './BarraProbabilidad';
import VeredictoSintesis from './VeredictoSintesis';
import { useSonidoUI } from '../movimiento/SonidoContext.tsx';

/**
 * "El debate de las 3 IAs en vivo" — la interacción estrella.
 *
 * Dramatiza la predicción YA publicada (no es streaming de red): las 3 IAs
 * entran en cascada y "escriben" su razonamiento, los números cuentan, la
 * barra se llena, y al final aterriza el veredicto: un "lock" verde si hay
 * consenso, o una tensión cyan latente si hay desacuerdo.
 *
 * Respeta prefers-reduced-motion: muestra todo el contenido final, estático
 * e instantáneo (las primitivas internas ya lo gestionan).
 */

const DURACION_DELIBERACION_MS = 3200;

function MesaDeliberacion({
  prediccion,
  codigoLocal,
  codigoVisitante,
}: {
  prediccion: Prediccion;
  codigoLocal: string;
  codigoVisitante: string;
}) {
  const reduce = useReducedMotion();
  const { play } = useSonidoUI();
  const [fase, setFase] = useState<'deliberando' | 'veredicto'>(
    reduce ? 'veredicto' : 'deliberando'
  );
  const yaJugo = useRef(false);
  const esConsenso = prediccion.veredicto === 'consenso';

  // Transición deliberando → veredicto tras la coreografía.
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setFase('veredicto'), DURACION_DELIBERACION_MS);
    return () => clearTimeout(t);
  }, [reduce]);

  // Sonido del clímax (una sola vez).
  useEffect(() => {
    if (fase === 'veredicto' && !yaJugo.current) {
      yaJugo.current = true;
      play(esConsenso ? 'success' : 'tick');
    }
  }, [fase, esConsenso, play]);

  return (
    <div className="space-y-8">
      {/* Kicker de fase: DELIBERANDO → VEREDICTO */}
      <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-kicker overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {fase === 'deliberando' ? (
            <motion.span
              key="delib"
              className="text-tinta-mute"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
            >
              Deliberando · 3 modelos
              <span className="text-verde animate-pulse-señal">▍</span>
            </motion.span>
          ) : (
            <motion.span
              key="vered"
              className={esConsenso ? 'text-verde' : 'text-cyan'}
              initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            >
              Veredicto · {esConsenso ? 'Consenso' : 'Desacuerdo'}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Las 3 IAs deliberando */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {prediccion.respuestasIA.map((r, i) => (
          <TarjetaIA
            key={r.ia}
            respuesta={r}
            codigoLocal={codigoLocal}
            codigoVisitante={codigoVisitante}
            modoMesa={!reduce}
            index={i}
          />
        ))}
      </div>

      {/* Convergencia: la barra final + el veredicto, al cerrar la deliberación */}
      <AnimatePresence>
        {fase === 'veredicto' && (
          <motion.div
            key="convergencia"
            className="space-y-6"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <section
              className={`rounded-lg bg-tinta-tarjeta border p-6 ${esConsenso ? 'border-verde/30' : 'border-cyan/30'} ${esConsenso && !reduce ? 'animate-glow-consenso' : ''}`}
            >
              <BarraProbabilidad
                kicker="Probabilidad final · consenso de 3 IAs"
                local={prediccion.probabilidadFinal.local}
                empate={prediccion.probabilidadFinal.empate}
                visitante={prediccion.probabilidadFinal.visitante}
                codigoLocal={codigoLocal}
                codigoVisitante={codigoVisitante}
                animarEntrada
              />
            </section>

            <VeredictoSintesis veredicto={prediccion.veredicto} nota={prediccion.notaVeredicto} animarNota />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MesaDeliberacion;
