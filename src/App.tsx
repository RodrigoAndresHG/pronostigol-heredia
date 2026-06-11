import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import BarraNavegacion from './componentes/BarraNavegacion';
import AvisoLegal from './componentes/AvisoLegal';
import BarraCaptura from './captacion/BarraCaptura';
import ModalCaptura from './captacion/ModalCaptura';
import Inicio from './paginas/Inicio';
import Calendario from './paginas/Calendario';
import DetallePartido from './paginas/DetallePartido';
import Historial from './paginas/Historial';
import Torneo from './paginas/Torneo';
import Creditos from './paginas/Creditos';

/**
 * Componente raíz.
 *
 * Layout editorial: barra sticky + main full-width + footer. Las rutas
 * hacen una transición suave (fade + 8px) entre sí vía AnimatePresence.
 * `mode="wait"` espera la salida antes de montar la nueva; `initial={false}`
 * evita animar la primera carga (no daña LCP).
 */
function App() {
  const location = useLocation();
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen flex flex-col bg-tinta-fondo">
      <BarraNavegacion />

      <main className="flex-1 w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={reduce ? { duration: 0 } : { duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={<Inicio />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/partido/:idPartido" element={<DetallePartido />} />
              <Route path="/historial" element={<Historial />} />
              <Route path="/torneo" element={<Torneo />} />
              <Route path="/creditos" element={<Creditos />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <AvisoLegal />

      {/* Captación de audiencia (Mundial 2026) — componentes aislados */}
      <BarraCaptura />
      <ModalCaptura />
      <Analytics />
    </div>
  );
}

export default App;
