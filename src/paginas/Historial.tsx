/**
 * Página de historial de predicciones.
 *
 * Placeholder de Fase 0. En la Fase 5 se conecta a Supabase y muestra
 * todas las predicciones pasadas con su resultado real, marcando
 * aciertos y fallos sin maquillaje. La transparencia es el producto.
 */
function Historial() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold text-marca-tinta">
        Historial
      </h1>
      <p className="text-marca-grisTexto">
        Aquí se publicarán todas las predicciones pasadas con su resultado
        real, acierto o fallo, y la tasa de acierto acumulada. Sin filtros,
        sin esconder los errores.
      </p>

      <div className="rounded-2xl border border-dashed border-marca-grisLinea p-6 bg-white text-center">
        <p className="text-marca-grisTexto">
          Próximamente · Fase 5
        </p>
      </div>
    </div>
  );
}

export default Historial;
