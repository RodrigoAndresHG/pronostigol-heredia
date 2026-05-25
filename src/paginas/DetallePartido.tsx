import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { partidoPorId } from '../datos/partidos.ts';
import { equipoPorId } from '../datos/equipos.ts';
import { prediccionPara } from '../datos/predicciones.ts';
import { calcularProbabilidadBase } from '../lib/modeloBase.ts';
import { fechaCompleta, horaLocal } from '../lib/zonaHoraria';
import BarraProbabilidad from '../componentes/BarraProbabilidad';
import TarjetaIA from '../componentes/TarjetaIA';
import VeredictoSintesis from '../componentes/VeredictoSintesis';
import SenalValor from '../componentes/SenalValor';
import DesgloseModeloBase from '../componentes/DesgloseModeloBase';

/**
 * Página de detalle del partido — la pieza central de la app.
 *
 * Composición vertical en móvil (de arriba a abajo):
 *   1. Cabecera con los dos equipos y la hora local.
 *   2. Capa 1 — Probabilidad base del modelo (siempre disponible).
 *   2b. Expandible "Cómo lo calculó" con el desglose del modelo.
 *   3. Veredicto sintetizado de las 3 IAs (si ya hay predicción).
 *   4. Capa 2 — Probabilidad final (consenso ponderado).
 *   5. Las 3 tarjetas de IA.
 *   6. Señal de valor vs mercado.
 *   7. Botón de compartir (placeholder de Fase 6).
 *
 * Si todavía no se generó la predicción de las IAs, mostramos sólo la
 * Capa 1 (que ya está viva) y avisamos que la Capa 2 entra antes del kickoff.
 */
function DetallePartido() {
  const { idPartido } = useParams();
  const partido = idPartido ? partidoPorId(idPartido) : undefined;

  // Compute Capa 1 con cualquier partido válido. useMemo porque depende del id.
  const modelo = useMemo(
    () => (partido ? calcularProbabilidadBase(partido) : null),
    [partido]
  );

  // Manejo defensivo: ID inexistente.
  if (!partido || !modelo) {
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

  // Si hay predicción, usamos su base (que ya viene del modelo). Si no,
  // mostramos directamente la salida del modelo. En ambos casos es la
  // misma fuente — la Capa 1 vive aunque las IAs aún no hayan hablado.
  const probabilidadBase = prediccion?.probabilidadBase ?? modelo.probabilidad;

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
            <p className="text-xs text-marca-grisTexto">Rating {local.rating}</p>
          </div>
          <div className="text-marca-grisTexto text-2xl font-display">vs</div>
          <div className="text-center">
            <div className="text-5xl">{visitante.banderaEmoji}</div>
            <p className="mt-2 font-display font-semibold text-marca-tinta">
              {visitante.nombre}
            </p>
            <p className="text-xs text-marca-grisTexto">Rating {visitante.rating}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-center text-marca-grisTexto">
          {fechaCompleta(partido.fechaISO)} · {partido.sede}
        </p>
      </section>

      {/* Capa 1 — probabilidad base (siempre visible) */}
      <section className="rounded-2xl bg-white border border-marca-grisLinea p-4">
        <BarraProbabilidad
          titulo="Capa 1 · Probabilidad base (modelo estadístico)"
          local={probabilidadBase.local}
          empate={probabilidadBase.empate}
          visitante={probabilidadBase.visitante}
        />
        <p className="mt-3 text-xs text-marca-grisTexto leading-relaxed">
          Calculada con rating Elo, ventaja de sede, forma y descanso —
          sin opinión cualitativa. Las IAs (Capa 2) parten de aquí.
        </p>
      </section>

      {/* Expandible: cómo lo calculó */}
      <DesgloseModeloBase
        desglose={modelo.desglose}
        equipoLocalId={partido.equipoLocalId}
        equipoVisitanteId={partido.equipoVisitanteId}
      />

      {/* Caso sin predicción de IAs */}
      {!prediccion ? (
        <section className="rounded-2xl border border-dashed border-marca-grisLinea p-6 bg-white text-center">
          <p className="text-marca-grisTexto">
            La Capa 1 ya está lista. Las 3 IAs (Capa 2) generan su
            predicción automáticamente antes del kickoff.
          </p>
          <p className="mt-2 text-xs text-marca-grisTexto/70">
            (Fase 3 — backend con Claude + GPT + Gemini.)
          </p>
        </section>
      ) : (
        <>
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

          {/* Las 3 IAs en grilla en pantallas grandes, apiladas en móvil/tablet */}
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
