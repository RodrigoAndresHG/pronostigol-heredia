import { Link } from 'react-router-dom';
import { CanalWhatsApp, PuenteMetodo } from './Llamados';

/**
 * Pie de página editorial. Captación global (WhatsApp + plataforma) +
 * aviso legal permanente + enlaces. Vive siempre visible para que
 * cualquier captura incluya el aviso.
 */
function AvisoLegal() {
  return (
    <footer className="mt-20 border-t border-tinta-linea bg-tinta-tarjeta">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        {/* Captación global — ambos destinos, compactos */}
        <div className="grid gap-3 sm:grid-cols-2 pb-10 mb-10 border-b border-tinta-linea">
          <CanalWhatsApp variante="linea" contexto="predicción" />
          <PuenteMetodo variante="linea" contenido="prefooter" />
        </div>

        <div className="grid gap-8 sm:grid-cols-[2fr_1fr]">
          {/* Aviso */}
          <div className="max-w-lectura">
            <p className="kicker">Aviso</p>
            <p className="mt-3 font-display text-lg text-tinta-titulo leading-snug">
              Análisis con fines informativos y de entretenimiento.
            </p>
            <p className="mt-2 text-sm text-tinta-cuerpo leading-relaxed">
              Las predicciones de PronostiGol HeredIA no constituyen consejo de
              apuestas ni garantía de resultado. Apuesta sólo lo que estés
              dispuesto a perder, y sobre todo, infórmate por tu cuenta.
            </p>
          </div>

          {/* Enlaces */}
          <div>
            <p className="kicker">Secciones</p>
            <ul className="mt-3 space-y-2 font-mono text-[13px]">
              <li>
                <Link to="/calendario" className="text-tinta-mute hover:text-verde transition-colors">
                  Calendario
                </Link>
              </li>
              <li>
                <Link to="/historial" className="text-tinta-mute hover:text-verde transition-colors">
                  Historial
                </Link>
              </li>
              <li>
                <Link to="/torneo" className="text-tinta-mute hover:text-verde transition-colors">
                  El torneo
                </Link>
              </li>
              <li>
                <Link to="/creditos" className="text-tinta-mute hover:text-verde transition-colors">
                  Créditos e imágenes
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-tinta-linea flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-tinta-mute">
          <span>© {new Date().getFullYear()} HEREDIA · AMBATO, ECUADOR</span>
          <span>MUNDIAL 2026 · 3 IAs EN CONSENSO</span>
        </div>
      </div>
    </footer>
  );
}

export default AvisoLegal;
