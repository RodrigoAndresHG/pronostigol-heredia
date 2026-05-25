import { Link, useParams } from 'react-router-dom';
import { partidoPorId } from '../datos/partidos';
import { equipoPorId } from '../datos/equipos';
import { prediccionPara } from '../datos/predicciones';
import { fechaCompleta, horaLocal } from '../lib/zonaHoraria';
import BarraProbabilidad from '../componentes/BarraProbabilidad';
import TarjetaIA from '../componentes/TarjetaIA';
import VeredictoSintesis from '../componentes/VeredictoSintesis';
import SenalValor from '../componentes/SenalValor';

/**
 * Página de detalle del partido — la pieza central de la app.
 *
 * Composición vertical en móvil (de arriba a abajo):
 *   1. Cabecera con los dos equipos y la hora local.
 *   2. Probabilidad base (Capa 1).
 *   3. Veredicto sintetizado de las 3 IAs.
 *   4. Probabilidad final (consenso ponderado).
 *   5. Las 3 tarjetas de IA (en grilla en pantallas ≥sm).
 *   6. Señal de valor vs mercado.
 *   7. Botón de compartir (placeholder de Fase 6).
 */
function DetallePartido() {
  const { idPartido } = useParams();
  const partido = idPartido ? partidoPorId(idPartido) : undefined;

  // Manejo defensivo: ID inexistente. Mejor mostrar mensaje que crashear.
  if (!partido) {
    return (
      <div className="space-y-3">
        <h1 className="font-display text-2xl font-bold text-marca-tinta">
          Partido no encontrado
        </h1>
        <p className="text-marca-grisTexto">
          El partido <code>{idPartido}</code> no existe en el calendario.
        </p>
        <Link to="/calendario" className="inline-block text-marca-primario font-medium">
          ← Volver al calendario
        </Link>
      </div>
    );
  }

  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);
  const prediccion = prediccionPara(partido.id);

  return (
    <div className="space-y-6">
      {/* Migaja para volver */}
      <Link to="/calendario" className="inline-block text-sm text-marca-primario font-medium">
        ← Calendario
      </Link>

      {/* Cabecera del partido */}
      <section className="rounded-2xl bg-white border border-marca-grisLinea p-5">
        <div className="flex items-center justify-between text-xs text-marca-grisTexto">
          <span className="uppercase tracking-wider font-semibold">
            {partido.grupo ? `Grupo ${partido.grupo}` : partido.fase}
          </span>
          <span>{horaLocal(partido.fechaISO)}</span>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-center">
            <div className="text-5xl">{local.banderaEmoji}</div>
            <p className="mt-2 font-display font-semibold text-marca-tinta">
              {local.nombre}
            </p>
            <p className="text-xs text-marca-grisTexto">
              Rating {local.rating}
            </p>
          </div>
          <div className="text-marca-grisTexto text-2xl font-display">vs</div>
          <div className="text-center">
            <div className="text-5xl">{visitante.banderaEmoji}</div>
            <p className="mt-2 font-display font-semibold text-marca-tinta">
              {visitante.nombre}
            </p>
            <p className="text-xs text-marca-grisTexto">
              Rating {visitante.rating}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-center text-marca-grisTexto">
          {fechaCompleta(partido.fechaISO)} · {partido.sede}
        </p>
      </section>

      {/* Caso sin predicción todavía */}
      {!prediccion ? (
        <section className="rounded-2xl border border-dashed border-marca-grisLinea p-6 bg-white text-center">
          <p className="text-marca-grisTexto">
            La predicción para este partido aún no se ha generado. Volverá a
            poblarse automáticamente desde el backend antes del kickoff.
          </p>
        </section>
      ) : (
        <>
          {/* Capa 1 — probabilidad base */}
          <section className="rounded-2xl bg-white border border-marca-grisLinea p-4">
            <BarraProbabilidad
              titulo="Capa 1 · Probabilidad base (modelo estadístico)"
              local={prediccion.probabilidadBase.local}
              empate={prediccion.probabilidadBase.empate}
              visitante={prediccion.probabilidadBase.visitante}
            />
            <p className="mt-3 text-xs text-marca-grisTexto leading-relaxed">
              Calculada con ranking, forma reciente, sede y descanso —
              sin opinión cualitativa. Sirve como punto de partida para las IAs.
            </p>
          </section>

          {/* Veredicto sintetizado */}
          <VeredictoSintesis
            veredicto={prediccion.veredicto}
            nota={prediccion.notaVeredicto}
          />

          {/* Capa 2 — probabilidad final */}
          <section className="rounded-2xl bg-white border border-marca-grisLinea p-4">
            <BarraProbabilidad
              titulo="Capa 2 · Probabilidad final (consenso de 3 IAs)"
              local={prediccion.probabilidadFinal.local}
              empate={prediccion.probabilidadFinal.empate}
              visitante={prediccion.probabilidadFinal.visitante}
            />
          </section>

          {/* Las 3 IAs lado a lado.
              Se apilan en móvil/tableta y sólo pasan a grilla de 3 columnas
              en pantallas grandes (≥ lg, 1024px), donde hay espacio real
              para que cada tarjeta respire sin romper la leyenda interna. */}
          <section>
            <h2 className="font-display text-lg font-semibold text-marca-tinta mb-3">
              Lo que dijo cada IA
            </h2>
            <div className="grid gap-3 lg:grid-cols-3">
              {prediccion.respuestasIA.map((respuesta) => (
                <TarjetaIA key={respuesta.ia} respuesta={respuesta} />
              ))}
            </div>
          </section>

          {/* Señal de valor */}
          <SenalValor prediccion={prediccion} />

          {/* Compartir — placeholder */}
          <section className="rounded-2xl bg-white border border-dashed border-marca-grisLinea p-4 text-center">
            <button
              disabled
              className="text-sm text-marca-grisTexto cursor-not-allowed"
            >
              📷 Compartir esta predicción (Fase 6)
            </button>
          </section>
        </>
      )}
    </div>
  );
}

export default DetallePartido;
