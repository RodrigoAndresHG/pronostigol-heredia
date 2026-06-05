import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { partidoPorId } from '../datos/partidos.ts';
import { equipoPorId } from '../datos/equipos.ts';
import { calcularProbabilidadBase } from '../lib/modeloBase.ts';
import { useAdmin } from '../lib/useAdmin.ts';
import { usePrediccionApi, type EstadoApi } from '../lib/usePrediccionApi.ts';
import { fechaCompleta, horaLocal } from '../lib/zonaHoraria';
import BarraProbabilidad from '../componentes/BarraProbabilidad';
import TarjetaIA from '../componentes/TarjetaIA';
import TarjetaIASkeleton from '../componentes/TarjetaIASkeleton';
import VeredictoSintesis from '../componentes/VeredictoSintesis';
import SenalValor from '../componentes/SenalValor';
import DesgloseModeloBase from '../componentes/DesgloseModeloBase';
import { EstadioPanoramico } from '../componentes/visual/Estadio';
import type { Prediccion } from '../tipos';

/**
 * Página de detalle del partido — pieza central, con diseño impactante.
 *
 * Composición:
 *   1. Banda admin (sólo con código).
 *   2. Hero del partido: banner panorámico de estadio + banderas
 *      gigantes + nombres + hora local.
 *   3. Capa 1 (modelo base) + desglose expandible.
 *   4. Capa 2 (las 3 IAs) según estado.
 */

const BANDERAS_PAIS_ANFITRION: Record<string, string> = {
  México: '🇲🇽',
  'Estados Unidos': '🇺🇸',
  Canadá: '🇨🇦',
};

function DetallePartido() {
  const { idPartido } = useParams();
  const partido = idPartido ? partidoPorId(idPartido) : undefined;
  const { codigoAdmin, cerrarSesion } = useAdmin();

  const modelo = useMemo(
    () => (partido ? calcularProbabilidadBase(partido) : null),
    [partido]
  );

  const { estado, generar, generando } = usePrediccionApi(
    partido?.id,
    codigoAdmin
  );

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
  const banderaAnfitrion = BANDERAS_PAIS_ANFITRION[partido.paisAnfitrion] ?? '🌎';
  const probabilidadBase =
    estado.tipo === 'ok' ? estado.prediccion.probabilidadBase : modelo.probabilidad;

  return (
    <div className="space-y-6 pt-4">
      {codigoAdmin && (
        <div className="mx-4">
          <BandaAdmin onCerrarSesion={cerrarSesion} />
        </div>
      )}

      {/* Migaja */}
      <div className="px-4">
        <Link to="/calendario" className="inline-block text-sm text-marca-primario font-semibold">
          ← Calendario
        </Link>
      </div>

      {/* HERO con estadio panorámico */}
      <section className="relative overflow-hidden bg-marca-tinta text-white">
        <EstadioPanoramico
          ancho={800}
          alto={200}
          paisAnfitrion={partido.paisAnfitrion}
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="relative px-4 py-6 sm:py-8 backdrop-blur-[1px] bg-marca-tinta/40">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between text-xs text-white/85">
              <span className="uppercase tracking-[0.25em] font-bold">
                {partido.grupo ? `Grupo ${partido.grupo}` : partido.fase}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-base">{banderaAnfitrion}</span>
                <span className="font-mono">{horaLocal(partido.fechaISO)}</span>
              </span>
            </div>

            <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
              <div className="text-center">
                <div className="text-6xl sm:text-7xl drop-shadow-lg animate-aparecer">
                  {local.banderaEmoji}
                </div>
                <p className="mt-3 font-display font-bold text-xl sm:text-2xl">
                  {local.nombre}
                </p>
                <p className="text-xs text-white/70 uppercase tracking-wider">
                  Local · Rating {local.rating}
                </p>
              </div>

              <div className="text-white/50 font-display text-xl sm:text-2xl tracking-widest">
                vs
              </div>

              <div className="text-center">
                <div
                  className="text-6xl sm:text-7xl drop-shadow-lg animate-aparecer"
                  style={{ animationDelay: '0.15s' }}
                >
                  {visitante.banderaEmoji}
                </div>
                <p className="mt-3 font-display font-bold text-xl sm:text-2xl">
                  {visitante.nombre}
                </p>
                <p className="text-xs text-white/70 uppercase tracking-wider">
                  Visitante · Rating {visitante.rating}
                </p>
              </div>
            </div>

            <p className="mt-6 text-xs text-center text-white/80">
              {fechaCompleta(partido.fechaISO)} · {partido.sede}
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 space-y-6 max-w-3xl mx-auto">
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

        <DesgloseModeloBase
          desglose={modelo.desglose}
          equipoLocalId={partido.equipoLocalId}
          equipoVisitanteId={partido.equipoVisitanteId}
        />

        {/* Capa 2 */}
        <BloqueCapa2
          estado={estado}
          codigoAdmin={codigoAdmin}
          generando={generando}
          onGenerar={generar}
        />
      </div>
    </div>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────

function BandaAdmin({ onCerrarSesion }: { onCerrarSesion: () => void }) {
  return (
    <div className="rounded-xl bg-marca-tinta text-white px-4 py-2 flex items-center justify-between text-sm">
      <span>🔐 Modo admin · puedes generar y publicar predicciones</span>
      <button
        onClick={onCerrarSesion}
        className="text-xs underline opacity-80 hover:opacity-100"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

interface BloqueCapa2Props {
  estado: EstadoApi;
  codigoAdmin: string | null;
  generando: boolean;
  onGenerar: () => void;
}

function BloqueCapa2({ estado, codigoAdmin, generando, onGenerar }: BloqueCapa2Props) {
  if (generando) return <BloqueCargandoGeneracion />;

  if (estado.tipo === 'cargando') {
    return (
      <section className="rounded-2xl border border-dashed border-marca-grisLinea p-6 bg-white text-center">
        <p className="text-marca-grisTexto animate-pulse">
          Cargando última predicción publicada…
        </p>
      </section>
    );
  }

  if (estado.tipo === 'error') {
    return (
      <section className="rounded-2xl bg-red-50 border border-red-200 p-4">
        <p className="font-display font-semibold text-red-800">
          No se pudo cargar la predicción
        </p>
        <p className="mt-1 text-sm text-red-700 break-words">{estado.mensaje}</p>
        {codigoAdmin && (
          <button
            onClick={onGenerar}
            className="mt-3 inline-block px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            Reintentar generación
          </button>
        )}
      </section>
    );
  }

  if (estado.tipo === 'sin-prediccion') {
    return codigoAdmin ? (
      <BloqueAdminPuedeGenerar onGenerar={onGenerar} />
    ) : (
      <section className="rounded-2xl bg-gradient-to-br from-marca-primario/5 to-marca-acento/5 border border-marca-grisLinea p-6 text-center">
        <p className="text-3xl mb-2">⏳</p>
        <p className="font-display font-bold text-marca-tinta text-lg">
          Predicción pendiente
        </p>
        <p className="mt-1 text-sm text-marca-grisTexto">
          Las predicciones se publican automáticamente cada mañana.
          Vuelve antes del kickoff.
        </p>
      </section>
    );
  }

  return (
    <BloquePrediccionPublicada
      prediccion={estado.prediccion}
      guardadaEn={estado.guardadaEn}
      codigoAdmin={codigoAdmin}
      onRegenerar={onGenerar}
    />
  );
}

function BloqueAdminPuedeGenerar({ onGenerar }: { onGenerar: () => void }) {
  return (
    <section className="rounded-2xl border-2 border-dashed border-marca-primario/40 bg-white p-5 text-center">
      <p className="font-display font-semibold text-marca-tinta">
        Capa 2 · Las 3 IAs no se han consultado todavía
      </p>
      <p className="mt-1 text-sm text-marca-grisTexto leading-relaxed">
        Al presionar el botón se envía el contexto del partido y la Capa 1
        a Claude, GPT y Gemini en paralelo. La predicción se guarda con
        timestamp y queda visible para todos los visitantes.
      </p>
      <button
        onClick={onGenerar}
        className="mt-4 inline-block px-5 py-2.5 rounded-full bg-marca-primario text-white font-medium hover:bg-marca-primarioOscuro transition-colors"
      >
        🧠 Generar y publicar predicción
      </button>
    </section>
  );
}

function BloqueCargandoGeneracion() {
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

function BloquePrediccionPublicada({
  prediccion,
  guardadaEn,
  codigoAdmin,
  onRegenerar,
}: {
  prediccion: Prediccion;
  guardadaEn: string | null;
  codigoAdmin: string | null;
  onRegenerar: () => void;
}) {
  return (
    <>
      <VeredictoSintesis
        veredicto={prediccion.veredicto}
        nota={prediccion.notaVeredicto}
      />

      <div className="flex items-center justify-between text-xs text-marca-grisTexto px-1">
        <span>
          {guardadaEn
            ? `📌 Publicada ${formatearFechaPublicacion(guardadaEn)}`
            : '📌 Predicción guardada'}
        </span>
        {codigoAdmin && (
          <button
            onClick={onRegenerar}
            className="text-marca-primario font-semibold hover:underline"
            title="Vuelve a consultar las 3 IAs y guarda una nueva versión"
          >
            ↺ Regenerar
          </button>
        )}
      </div>

      <section className="rounded-2xl bg-white border border-marca-grisLinea p-4">
        <BarraProbabilidad
          titulo="Capa 2 · Probabilidad final (consenso de 3 IAs)"
          local={prediccion.probabilidadFinal.local}
          empate={prediccion.probabilidadFinal.empate}
          visitante={prediccion.probabilidadFinal.visitante}
        />
      </section>

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

      <SenalValor prediccion={prediccion} />
    </>
  );
}

function formatearFechaPublicacion(iso: string): string {
  const fecha = new Date(iso);
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
}

export default DetallePartido;
