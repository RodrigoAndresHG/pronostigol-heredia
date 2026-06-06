import { HISTORIAL, metricasHistorial } from '../datos/predicciones';
import { equipoPorId } from '../datos/equipos';
import { fechaCorta } from '../lib/zonaHoraria';
import { porcentaje } from '../lib/formato';
import { PuenteMetodo } from '../componentes/Llamados';

/**
 * Historial editorial: predicciones pasadas con su resultado real,
 * acierto/fallo y tasa acumulada. La transparencia es el producto —
 * los fallos se muestran igual que los aciertos.
 */
function Historial() {
  const m = metricasHistorial();

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-12">
      <header className="border-b border-tinta-linea pb-8">
        <p className="kicker">Historial · Transparencia total</p>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold text-tinta-titulo leading-[1.05]">
          Los aciertos y los fallos.
        </h1>
        <p className="mt-3 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
          Todas las predicciones pasadas con su resultado real. Sin filtros, sin
          esconder los errores — eso es lo que hace creíble el método.
        </p>
      </header>

      {/* Métricas grandes */}
      <section className="mt-10 grid grid-cols-3 gap-px bg-tinta-linea border border-tinta-linea rounded-lg overflow-hidden">
        <Metrica valor={String(m.total)} etiqueta="Predicciones" />
        <Metrica valor={`${m.aciertos}/${m.total}`} etiqueta="Aciertos" acento />
        <Metrica valor={porcentaje(m.tasaAcierto)} etiqueta="Tasa de acierto" acento />
      </section>

      {/* Lista */}
      <section className="mt-10 divide-y divide-tinta-linea">
        {HISTORIAL.map((reg) => {
          const local = equipoPorId(reg.partido.equipoLocalId);
          const visitante = equipoPorId(reg.partido.equipoVisitanteId);
          return (
            <article key={reg.partido.id} className="py-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-tinta-mute uppercase tracking-wide">
                  {fechaCorta(reg.partido.fechaISO)}
                </span>
                <span
                  className={`font-mono text-[11px] uppercase tracking-wide ${reg.acerto ? 'text-verde' : 'text-peligro'}`}
                >
                  {reg.acerto ? '✓ Acertó' : '✗ Falló'}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-4 font-mono">
                <span className="text-tinta-titulo font-semibold w-12">{local.id}</span>
                <span className="text-tinta-titulo text-2xl font-display font-semibold tabular">
                  {reg.partido.golesLocal}–{reg.partido.golesVisitante}
                </span>
                <span className="text-tinta-titulo font-semibold w-12">{visitante.id}</span>
                <span className="text-tinta-mute text-sm hidden sm:inline">
                  {local.nombre} vs {visitante.nombre}
                </span>
              </div>

              <p className="mt-3 max-w-lectura text-[14px] text-tinta-cuerpo leading-relaxed">
                <span className={`font-mono text-[11px] uppercase tracking-wide ${reg.prediccion.veredicto === 'consenso' ? 'text-verde' : 'text-cyan'}`}>
                  {reg.prediccion.veredicto}
                </span>{' '}
                — {reg.prediccion.notaVeredicto}
              </p>
            </article>
          );
        })}
      </section>

      {/* Captación: quien evalúa la credibilidad → al método (LMS) */}
      <div className="mt-12">
        <PuenteMetodo variante="banda" contenido="historial" gancho="credibilidad" />
      </div>
    </div>
  );
}

function Metrica({
  valor,
  etiqueta,
  acento = false,
}: {
  valor: string;
  etiqueta: string;
  acento?: boolean;
}) {
  return (
    <div className="bg-tinta-tarjeta p-5 sm:p-7 text-center">
      <p className={`font-display text-3xl sm:text-5xl font-bold tabular ${acento ? 'text-verde' : 'text-tinta-titulo'}`}>
        {valor}
      </p>
      <p className="kicker mt-2">{etiqueta}</p>
    </div>
  );
}

export default Historial;
