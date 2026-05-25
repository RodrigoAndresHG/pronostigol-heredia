/**
 * Página de calendario.
 *
 * Placeholder de Fase 0. En la Fase 1 se llenará con el dataset
 * mock de 48 equipos + 12 grupos, filtros y conversión de zona
 * horaria al huso del usuario.
 */
function Calendario() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold text-marca-tinta">
        Calendario
      </h1>
      <p className="text-marca-grisTexto">
        Aquí vivirá la lista de partidos del Mundial 2026, con filtros por
        equipo y por grupo, y la hora convertida automáticamente a tu zona
        horaria (Ecuador / GMT-5 por defecto).
      </p>

      <div className="rounded-2xl border border-dashed border-marca-grisLinea p-6 bg-white text-center">
        <p className="text-marca-grisTexto">
          Próximamente · Fase 1
        </p>
      </div>
    </div>
  );
}

export default Calendario;
