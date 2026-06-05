import { Routes, Route } from 'react-router-dom';
import BarraNavegacion from './componentes/BarraNavegacion';
import AvisoLegal from './componentes/AvisoLegal';
import Inicio from './paginas/Inicio';
import Calendario from './paginas/Calendario';
import DetallePartido from './paginas/DetallePartido';
import Historial from './paginas/Historial';
import Torneo from './paginas/Torneo';

/**
 * Componente raíz.
 *
 * Layout:
 *   [Barra de navegación sticky arriba]
 *   [Main full-width — cada página maneja su propio max-width interno]
 *   [Aviso legal de "fines informativos" siempre visible]
 *
 * Decisión: el main NO impone max-width. Cada página decide si tiene
 * secciones full-bleed (hero) y constrains internamente lo demás.
 * Eso permite heros de impacto edge-to-edge y contenido legible al centro.
 */
function App() {
  return (
    <div className="min-h-screen flex flex-col bg-marca-grisFondo">
      <BarraNavegacion />

      <main className="flex-1 w-full pb-10">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/partido/:idPartido" element={<DetallePartido />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/torneo" element={<Torneo />} />
        </Routes>
      </main>

      <AvisoLegal />
    </div>
  );
}

export default App;
