import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { partidoPorId } from '../datos/partidos.ts';
import { equipoPorId } from '../datos/equipos.ts';
import { prediccionPara } from '../datos/predicciones.ts';
import { calcularProbabilidadBase } from '../lib/modeloBase.ts';
import { usePrediccionApi } from '../lib/usePrediccionApi.ts';
import { fechaCompleta, horaLocal } from '../lib/zonaHoraria';
import BarraProbabilidad from '../componentes/BarraProbabilidad';
import TarjetaIA from '../componentes/TarjetaIA';
import TarjetaIASkeleton from '../componentes/TarjetaIASkeleton';
import VeredictoSintesis from '../componentes/VeredictoSintesis';
import SenalValor from '../componentes/SenalValor';
import DesgloseModeloBase from '../componentes/DesgloseModeloBase';

/**
 * Página de detalle del partido — la pieza central de la app.
 *
 * Composición:
 *   1. Cabecera con los dos equipos y la hora local.
 *   2. Capa 1 — Probabilidad base del modelo (siempre disponible).
 *   3. Expandible "Cómo lo calculó".
 *   4. Capa 2 — Las 3 IAs. Si el partido tiene mock, se muestra directo.
 *      Si no, se muestra un botón "Consultar a las 3 IAs" que dispara
 *      la llamada a /api/predecir. Mientras carga, se ven skeletons.
 *   5. Señal de valor (cuando la haya, Fase 4 la rellena con mercado real).
 *   6. Botón de compartir (placeholder de Fase 6).
 */
function DetallePartido() {
  const { idPartido } = useParams();
  const partido = idPartido ? partidoPorId(idPartido) : undefined;

  // Capa 1 — instantánea, depende sólo del partido.
  const modelo = useMemo(
    () => (partido ? calcularProbabilidadBase(partido) : null),
    [partido]
  );

  // Si hay predicción mock para este partido, la usamos. Si no, dejamos
  // que el hook gestione la llamada al backend.
  const prediccionMock = partido ? prediccionPara(partido.id) : null;
  const { estado, generar, reiniciar } = usePrediccionApi(partido?.id);

  // La "predicción efectiva" prioriza el mock (demos/casos pre-cargados).
  // Si no hay mock pero el API ya respondió, usamos esa.
  const prediccionEfectiva =
    prediccionMock ?? (estado.tipo === 'ok' ? estado.prediccion : null);

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
  const probabilidadBase =
    prediccionEfectiva?.probabilidadBase ?? modelo.probabilidad;

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

      {/* Capa 1 */}
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

      {/* Capa 2: una de cuatro situaciones según hay mock, hay API, o no */}
      {prediccionEfectiva ? (
        <BloquePrediccionCompleta
          prediccion={prediccionEfectiva}
          esRemota={!prediccionMock && estado.tipo === 'ok'}
          onRegenerar={reiniciar}
        />
      ) : estado.tipo === 'cargando' ? (
        <BloqueCargando />
      ) : estado.tipo === 'error' ? (
        <BloqueError mensaje={estado.mensaje} onReintentar={generar} />
      ) : (
        <BloqueIdle onGenerar={generar} />
      )}

      {/* Compartir — placeholder */}
      <section className="rounded-2xl bg-white border border-dashed border-marca-grisLinea p-4 text-center">
        <button
          disabled
          className="text-sm text-marca-grisTexto cursor-not-allowed"
        >
          📷 Compartir esta predicción (Fase 6)
        </button>
      </section>
    </div>
  );
}

// ─── Sub-bloques por estado ──────────────────────────────────────────

/**
 * Caso "ya hay predicción": muestra el veredicto, prob final, las 3 IAs
 * y la señal de valor. Si la prediccion vino del API (no del mock), añade
 * un pequeño botón "regenerar" por si el usuario quiere disparar de nuevo.
 */
function BloquePrediccionCompleta({
  prediccion,
  esRemota,
  onRegenerar,
}: {
  prediccion: import('../tipos').Prediccion;
  esRemota: boolean;
  onRegenerar: () => void;
}) {
  return (
    <>
      <VeredictoSintesis
        veredicto={prediccion.veredicto}
        nota={prediccion.notaVeredicto}
      />

      <section className="rounded-2xl bg-white border border-marca-grisLinea p-4">
        <BarraProbabilidad
          titulo="Capa 2 · Probabilidad final (consenso de 3 IAs)"
          local={prediccion.probabilidadFinal.local}
          empate={prediccion.probabilidadFinal.empate}
          visitante={prediccion.probabilidadFinal.visitante}
        />
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg font-semibold text-marca-tinta">
            Lo que dijo cada IA
          </h2>
          {esRemota && (
            <button
              onClick={onRegenerar}
              className="text-xs text-marca-primario font-medium hover:underline"
              title="Limpia el caché de sesión y permite volver a consultar"
            >
              ↺ Regenerar
            </button>
          )}
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {prediccion.respuestasIA.map((respuesta) => (
            <TarjetaIA key={respuesta.ia} respuesta={respuesta} />
          ))}
        </div>
      </section>

      <SenalValor prediccion={prediccion} />
    </>
  );
}

/**
 * Estado "cargando": 3 skeletons de IA + mensaje explicativo.
 */
function BloqueCargando() {
  return (
    <>
      <div className="rounded-2xl bg-marca-primario/5 border border-marca-primario/20 p-4 text-center">
        <p className="font-display font-semibold text-marca-tinta">
          Consultando a las 3 IAs en paralelo…
        </p>
        <p className="mt-1 text-sm text-marca-grisTexto">
          Cada modelo razona sobre el mismo prompt. Suele tomar entre 5 y 20 segundos.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <TarjetaIASkeleton ia="Claude" />
        <TarjetaIASkeleton ia="GPT" />
        <TarjetaIASkeleton ia="Gemini" />
      </div>
    </>
  );
}

/**
 * Estado "error": mensaje del error + botón de reintento.
 */
function BloqueError({
  mensaje,
  onReintentar,
}: {
  mensaje: string;
  onReintentar: () => void;
}) {
  return (
    <section className="rounded-2xl bg-red-50 border border-red-200 p-4">
      <p className="font-display font-semibold text-red-800">
        No se pudo generar la predicción
      </p>
      <p className="mt-1 text-sm text-red-700 break-words">{mensaje}</p>
      <button
        onClick={onReintentar}
        className="mt-3 inline-block px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700"
      >
        Reintentar
      </button>
    </section>
  );
}

/**
 * Estado "idle": invitamos al usuario a disparar la consulta a las IAs.
 * Es manual a propósito — evita quemar tokens al explorar el calendario.
 */
function BloqueIdle({ onGenerar }: { onGenerar: () => void }) {
  return (
    <section className="rounded-2xl border-2 border-dashed border-marca-primario/40 bg-white p-5 text-center">
      <p className="font-display font-semibold text-marca-tinta">
        Capa 2 · Las 3 IAs aún no han razonado
      </p>
      <p className="mt-1 text-sm text-marca-grisTexto leading-relaxed">
        Al presionar el botón se envía el contexto del partido y la Capa 1
        a Claude, GPT y Gemini en paralelo. Cada uno devuelve su propia
        probabilidad, confianza y explicación.
      </p>
      <button
        onClick={onGenerar}
        className="mt-4 inline-block px-5 py-2.5 rounded-full bg-marca-primario text-white font-medium hover:bg-marca-primarioOscuro transition-colors"
      >
        🧠 Consultar a las 3 IAs
      </button>
      <p className="mt-2 text-xs text-marca-grisTexto/70">
        El resultado se guarda en tu sesión — no se vuelve a consultar al refrescar.
      </p>
    </section>
  );
}

export default DetallePartido;
