import { useParams } from 'react-router-dom';

/**
 * Página de detalle de un partido — la pieza central de la app.
 *
 * Placeholder de Fase 0. Aquí vivirá:
 *   - Cabecera con los dos equipos y la hora local.
 *   - Probabilidad base (Capa 1, modelo estadístico).
 *   - 3 tarjetas de IA en paralelo con su probabilidad,
 *     confianza y explicación (Capa 2).
 *   - Veredicto sintetizado: consenso o desacuerdo.
 *   - Señal de valor vs mercado.
 *   - Botón de compartir.
 */
function DetallePartido() {
  // Recogemos el ID del partido desde la URL para que ya esté listo
  // cuando carguemos datos reales. En Fase 0 sólo lo mostramos.
  const { idPartido } = useParams();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold text-marca-tinta">
        Detalle del partido
      </h1>
      <p className="text-marca-grisTexto">
        Partido <code className="text-sm bg-marca-grisLinea/50 px-1.5 py-0.5 rounded">{idPartido ?? '—'}</code>.
        Aquí se mostrará el análisis completo: probabilidad base, las 3 IAs
        lado a lado, el veredicto y la señal de valor vs mercado.
      </p>

      <div className="rounded-2xl border border-dashed border-marca-grisLinea p-6 bg-white text-center">
        <p className="text-marca-grisTexto">
          Próximamente · Fase 1–3
        </p>
      </div>
    </div>
  );
}

export default DetallePartido;
