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
 * La estructura es la de cualquier app web mobile-first:
 *   [Barra de navegación fija arriba]
 *   [Contenido de la ruta activa]
 *   [Aviso legal de "fines informativos" siempre visible]
 *
 * Las rutas están en español a propósito: aparecen en la URL y
 * refuerzan la marca HeredIA en hispanohablante.
 */
function App() {
  return (
    <div className="min-h-screen flex flex-col bg-marca-grisFondo">
      <BarraNavegacion />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
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
