import { Routes, Route } from 'react-router-dom';
import BarraNavegacion from './componentes/BarraNavegacion';
import AvisoLegal from './componentes/AvisoLegal';
import Inicio from './paginas/Inicio';
import Calendario from './paginas/Calendario';
import DetallePartido from './paginas/DetallePartido';
import Historial from './paginas/Historial';
import Torneo from './paginas/Torneo';
import Creditos from './paginas/Creditos';

/**
 * Componente raíz.
 *
 * Layout editorial: barra sticky + main full-width (cada página decide su
 * propio max-width interno, lo que permite heros full-bleed con foto) +
 * footer con aviso legal y enlaces.
 */
function App() {
  return (
    <div className="min-h-screen flex flex-col bg-tinta-fondo">
      <BarraNavegacion />

      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/partido/:idPartido" element={<DetallePartido />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/torneo" element={<Torneo />} />
          <Route path="/creditos" element={<Creditos />} />
        </Routes>
      </main>

      <AvisoLegal />
    </div>
  );
}

export default App;
