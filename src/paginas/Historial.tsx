import { HISTORIAL, metricasHistorial } from '../datos/predicciones';
import { equipoPorId } from '../datos/equipos';
import { fechaCorta } from '../lib/zonaHoraria';
import { porcentaje } from '../lib/formato';

/**
 * Página de historial: predicciones pasadas con resultado real,
 * acierto/fallo y tasa de acierto acumulada. La transparencia es
 * el producto — los fallos se muestran exactamente igual que los aciertos.
 *
 * En la Fase 5 esto se conecta a Supabase; por ahora usamos mocks de
 * amistosos jugados durante mayo de 2026.
 */
function Historial() {
  const metricas = metricasHistorial();

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-marca-tinta">
          Historial
        </h1>
        <p className="text-sm text-marca-grisTexto mt-1">
          Todas las predicciones, con sus aciertos y sus fallos. Sin filtros.
        </p>
      </div>

      {/* Métricas resumen */}
      <section className="grid grid-cols-3 gap-3">
        <Metrica titulo="Predicciones" valor={String(metricas.total)} />
        <Metrica
          titulo="Aciertos"
          valor={`${metricas.aciertos}/${metricas.total}`}
          tono="primario"
        />
        <Metrica
          titulo="Tasa acierto"
          valor={porcentaje(metricas.tasaAcierto)}
          tono="primario"
        />
      </section>

      {/* Lista de registros */}
      <div className="space-y-3">
        {HISTORIAL.map((registro) => {
          const local = equipoPorId(registro.partido.equipoLocalId);
          const visitante = equipoPorId(registro.partido.equipoVisitanteId);
          return (
            <article
              key={registro.partido.id}
              className="rounded-2xl bg-white border border-marca-grisLinea p-4"
            >
              <div className="flex items-center justify-between text-xs text-marca-grisTexto">
                <span>{fechaCorta(registro.partido.fechaISO)}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    registro.acerto
                      ? 'bg-marca-primario/15 text-marca-primarioOscuro'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {registro.acerto ? '✓ Acertó' : '✗ Falló'}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xl">{local.banderaEmoji}</span>
                  <span className="font-display font-semibold text-marca-tinta truncate">
                    {local.nombre}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-marca-tinta px-3">
                  {registro.partido.golesLocal}–{registro.partido.golesVisitante}
                </span>
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="font-display font-semibold text-marca-tinta truncate text-right">
                    {visitante.nombre}
                  </span>
                  <span className="text-xl">{visitante.banderaEmoji}</span>
                </div>
              </div>

              <p className="mt-2 text-xs text-marca-grisTexto leading-relaxed">
                <span className="font-semibold">
                  {registro.prediccion.veredicto === 'consenso'
                    ? 'Consenso'
                    : 'Desacuerdo'}
                  :
                </span>{' '}
                {registro.prediccion.notaVeredicto}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Metrica({
  titulo,
  valor,
  tono = 'neutro',
}: {
  titulo: string;
  valor: string;
  tono?: 'neutro' | 'primario';
}) {
  return (
    <div className="rounded-2xl bg-white border border-marca-grisLinea p-3 text-center">
      <p className="text-xs uppercase tracking-wider text-marca-grisTexto font-semibold">
        {titulo}
      </p>
      <p
        className={`mt-1 font-display text-2xl font-bold ${
          tono === 'primario' ? 'text-marca-primario' : 'text-marca-tinta'
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

export default Historial;
