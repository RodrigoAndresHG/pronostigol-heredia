import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { partidoPorId } from '../datos/partidos.js';
import { equipoPorId } from '../datos/equipos.js';
import { hechosDePartido } from '../datos/dossiers.js';
import { calcularProbabilidadBase } from '../lib/modeloBase.js';
import { useAdmin } from '../lib/useAdmin.js';
import { usePrediccionApi, type EstadoApi } from '../lib/usePrediccionApi.js';
import { fechaCompleta, horaLocal } from '../lib/zonaHoraria';
import BarraProbabilidad from '../componentes/BarraProbabilidad';
import TarjetaIASkeleton from '../componentes/TarjetaIASkeleton';
import MesaDeliberacion from '../componentes/MesaDeliberacion';
import SenalValor from '../componentes/SenalValor';
import DesgloseModeloBase from '../componentes/DesgloseModeloBase';
import AcordeonDossier from '../componentes/AcordeonDossier';
import AnatomiaDesacuerdo from '../componentes/AnatomiaDesacuerdo';
import { CanalWhatsApp } from '../componentes/Llamados';
import BotonCompartir from '../componentes/BotonCompartir';
import FotoEstadio from '../componentes/visual/FotoEstadio';
import type { Prediccion } from '../tipos';

/**
 * Detalle del partido — pieza central, editorial.
 *
 *   1. Banda admin (sólo con código).
 *   2. Hero full-bleed con foto del estadio específico + códigos de equipo.
 *   3. Ficha de equipos (rating).
 *   4. Capa 1 (modelo) + desglose.
 *   5. Capa 2 (las 3 IAs) según estado.
 */
function DetallePartido() {
  const { idPartido } = useParams();
  const partido = idPartido ? partidoPorId(idPartido) : undefined;
  const { codigoAdmin, cerrarSesion } = useAdmin();

  const modelo = useMemo(
    () => (partido ? calcularProbabilidadBase(partido) : null),
    [partido]
  );
  const { estado, generar, generando } = usePrediccionApi(partido?.id, codigoAdmin);

  if (!partido || !modelo) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
        <p className="kicker text-alerta">Error 404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-tinta-titulo">
          Partido no encontrado
        </h1>
        <p className="mt-2 text-tinta-cuerpo">
          El partido <span className="font-mono text-tinta-titulo">{idPartido}</span> no existe.
        </p>
        <Link to="/calendario" className="inline-block mt-5 font-mono text-[13px] text-verde">
          ← Volver al calendario
        </Link>
      </div>
    );
  }

  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);
  const probabilidadBase =
    estado.tipo === 'ok' ? estado.prediccion.probabilidadBase : modelo.probabilidad;

  return (
    <div>
      {codigoAdmin && <BandaAdmin onCerrarSesion={cerrarSesion} />}

      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[58vh] flex items-end overflow-hidden">
        <FotoEstadio sede={partido.sede} overlayInferior={0.95} />
        <div className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 pb-12 pt-24">
          <Link to="/calendario" className="font-mono text-[12px] text-tinta-mute hover:text-tinta-cuerpo transition-colors">
            ← Calendario
          </Link>
          <p className="kicker mt-5">
            {partido.grupo ? `Grupo ${partido.grupo}` : partido.fase} ·{' '}
            {fechaCompleta(partido.fechaISO)}
          </p>
          <h1 className="mt-3 font-display font-bold text-tinta-titulo leading-[1.04] tracking-tight text-4xl sm:text-6xl">
            {local.nombre}
            <span className="text-tinta-mute"> vs </span>
            {visitante.nombre}
          </h1>
          <p className="mt-4 font-mono text-[13px] text-tinta-cuerpo uppercase tracking-wide">
            {partido.sede} · {horaLocal(partido.fechaISO)} local
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 space-y-10">
        {/* Ficha de equipos */}
        <section className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8 border-b border-tinta-linea pb-10">
          <FichaEquipo rol="Local" codigo={local.id} nombre={local.nombre} rating={local.rating} />
          <span className="font-display italic text-2xl text-tinta-mute">vs.</span>
          <FichaEquipo rol="Visitante" codigo={visitante.id} nombre={visitante.nombre} rating={visitante.rating} alinearDerecha />
        </section>

        {/* Capa 1 */}
        <section className="rounded-lg bg-tinta-tarjeta border border-tinta-linea p-6">
          <BarraProbabilidad
            kicker="Capa 1 · Probabilidad base (modelo estadístico)"
            local={probabilidadBase.local}
            empate={probabilidadBase.empate}
            visitante={probabilidadBase.visitante}
            codigoLocal={local.id}
            codigoVisitante={visitante.id}
          />
          <p className="mt-4 text-sm text-tinta-mute leading-relaxed max-w-lectura">
            Rating Elo, ventaja de sede, forma y descanso — sin opinión
            cualitativa. Las IAs parten de aquí.
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
          codigoLocal={local.id}
          codigoVisitante={visitante.id}
          idPartido={partido.id}
          tituloCompartir={`${local.nombre} vs ${visitante.nombre}`}
        />
      </div>
    </div>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────

function BandaAdmin({ onCerrarSesion }: { onCerrarSesion: () => void }) {
  return (
    <div className="bg-verde/10 border-b border-verde/20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-2 flex items-center justify-between font-mono text-[12px]">
        <span className="text-verde">● MODO ADMIN · puedes generar y publicar</span>
        <button onClick={onCerrarSesion} className="text-tinta-mute hover:text-tinta-cuerpo underline">
          cerrar sesión
        </button>
      </div>
    </div>
  );
}

function FichaEquipo({
  rol,
  codigo,
  nombre,
  rating,
  alinearDerecha = false,
}: {
  rol: string;
  codigo: string;
  nombre: string;
  rating: number;
  alinearDerecha?: boolean;
}) {
  return (
    <div className={alinearDerecha ? 'text-right' : 'text-left'}>
      <p className="kicker">{rol}</p>
      <p className="mt-2 font-mono text-2xl sm:text-3xl text-tinta-titulo font-semibold">
        {codigo}
      </p>
      <p className="mt-1 font-display text-xl sm:text-2xl text-tinta-cuerpo leading-tight">
        {nombre}
      </p>
      <p className="mt-2 font-mono text-[12px] text-tinta-mute">ELO {rating}</p>
    </div>
  );
}

interface BloqueProps {
  estado: EstadoApi;
  codigoAdmin: string | null;
  generando: boolean;
  onGenerar: () => void;
  codigoLocal: string;
  codigoVisitante: string;
  idPartido: string;
  tituloCompartir: string;
}

function BloqueCapa2({
  estado,
  codigoAdmin,
  generando,
  onGenerar,
  codigoLocal,
  codigoVisitante,
  idPartido,
  tituloCompartir,
}: BloqueProps) {
  if (generando) return <BloqueCargando />;

  if (estado.tipo === 'cargando') {
    return (
      <section className="rounded-lg border border-tinta-linea bg-tinta-tarjeta p-8 text-center">
        <p className="font-mono text-[13px] text-tinta-mute animate-pulse-señal uppercase tracking-wide">
          Cargando predicción publicada…
        </p>
      </section>
    );
  }

  if (estado.tipo === 'error') {
    return (
      <section className="rounded-lg border border-peligro/30 bg-peligro/[0.06] p-6">
        <p className="kicker text-peligro">Error</p>
        <h3 className="mt-2 font-display text-xl font-semibold text-tinta-titulo">
          No se pudo cargar la predicción
        </h3>
        <p className="mt-1 font-mono text-[12px] text-tinta-cuerpo break-words">{estado.mensaje}</p>
        {codigoAdmin && (
          <button
            onClick={onGenerar}
            className="mt-4 px-5 py-2.5 rounded-md bg-peligro text-white font-semibold text-sm"
          >
            Reintentar generación
          </button>
        )}
      </section>
    );
  }

  if (estado.tipo === 'sin-prediccion') {
    return codigoAdmin ? (
      <BloqueAdminGenerar onGenerar={onGenerar} />
    ) : (
      <section className="rounded-lg border border-tinta-linea bg-tinta-tarjeta p-8 sm:p-10 text-center">
        <p className="kicker">Capa 2</p>
        <h3 className="mt-3 font-display text-2xl font-semibold text-tinta-titulo">
          Predicción pendiente
        </h3>
        <p className="mt-2 text-[15px] text-tinta-cuerpo max-w-[42ch] mx-auto leading-relaxed">
          Las predicciones de las 3 IAs se publican automáticamente cada mañana.
          Vuelve antes del kickoff.
        </p>
      </section>
    );
  }

  return (
    <PrediccionPublicada
      prediccion={estado.prediccion}
      guardadaEn={estado.guardadaEn}
      codigoAdmin={codigoAdmin}
      onRegenerar={onGenerar}
      codigoLocal={codigoLocal}
      codigoVisitante={codigoVisitante}
      idPartido={idPartido}
      tituloCompartir={tituloCompartir}
    />
  );
}

function BloqueAdminGenerar({ onGenerar }: { onGenerar: () => void }) {
  return (
    <section className="rounded-lg border border-dashed border-verde/40 bg-verde/[0.04] p-8 text-center">
      <p className="kicker text-verde">Capa 2 · Admin</p>
      <h3 className="mt-3 font-display text-2xl font-semibold text-tinta-titulo">
        Las 3 IAs aún no han razonado
      </h3>
      <p className="mt-2 text-[15px] text-tinta-cuerpo max-w-[44ch] mx-auto leading-relaxed">
        Al generar, se envía el contexto del partido y la Capa 1 a Claude, GPT y
        Gemini en paralelo. La predicción queda publicada con timestamp.
      </p>
      <button
        onClick={onGenerar}
        className="mt-6 px-6 py-3 rounded-md bg-verde text-tinta-fondo font-semibold text-[15px] hover:bg-verde-hover transition-colors"
      >
        Generar y publicar
      </button>
    </section>
  );
}

function BloqueCargando() {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-verde/20 bg-verde/[0.04] p-5 text-center">
        <p className="kicker text-verde">Consultando en paralelo</p>
        <p className="mt-2 text-[15px] text-tinta-cuerpo">
          Cada modelo razona sobre el mismo prompt. 5–20 segundos.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <TarjetaIASkeleton ia="Claude" />
        <TarjetaIASkeleton ia="GPT" />
        <TarjetaIASkeleton ia="Gemini" />
      </div>
    </div>
  );
}

function PrediccionPublicada({
  prediccion,
  guardadaEn,
  codigoAdmin,
  onRegenerar,
  codigoLocal,
  codigoVisitante,
  idPartido,
  tituloCompartir,
}: {
  prediccion: Prediccion;
  guardadaEn: string | null;
  codigoAdmin: string | null;
  onRegenerar: () => void;
  codigoLocal: string;
  codigoVisitante: string;
  idPartido: string;
  tituloCompartir: string;
}) {
  // Los hechos que recibieron las IAs: preferimos el dossier guardado en la
  // predicción (lo que realmente vieron); si es una predicción antigua sin
  // dossier, caemos a los hechos actuales del partido.
  const partido = partidoPorId(prediccion.partidoId);
  const hechos =
    prediccion.dossier ?? (partido ? hechosDePartido(partido) : null);
  const nombreLocal = partido ? equipoPorId(partido.equipoLocalId).nombre : codigoLocal;
  const nombreVisitante = partido
    ? equipoPorId(partido.equipoVisitanteId).nombre
    : codigoVisitante;
  const esDesacuerdo = prediccion.veredicto === 'desacuerdo';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between font-mono text-[11px] text-tinta-mute">
        <span className="uppercase tracking-wide">
          {guardadaEn ? `Publicada ${formatearFecha(guardadaEn)}` : 'Guardada'}
        </span>
        {codigoAdmin && (
          <button onClick={onRegenerar} className="text-verde hover:text-verde-hover transition-colors">
            ↺ regenerar
          </button>
        )}
      </div>

      {/* La pieza estrella: el debate de las 3 IAs en vivo */}
      <MesaDeliberacion
        prediccion={prediccion}
        codigoLocal={codigoLocal}
        codigoVisitante={codigoVisitante}
      />

      {/* Los hechos verificados que recibieron las IAs (anclaje visible) */}
      {hechos && (
        <AcordeonDossier
          hechos={hechos}
          codigoLocal={codigoLocal}
          codigoVisitante={codigoVisitante}
          nombreLocal={nombreLocal}
          nombreVisitante={nombreVisitante}
        />
      )}

      {/* Anatomía del desacuerdo: sólo cuando las IAs divergen */}
      {esDesacuerdo && (
        <AnatomiaDesacuerdo
          prediccion={prediccion}
          codigoLocal={codigoLocal}
          codigoVisitante={codigoVisitante}
        />
      )}

      <SenalValor prediccion={prediccion} />

      {/* Compartir como imagen — el motor de viralidad */}
      <section className="rounded-lg border border-tinta-linea bg-tinta-tarjeta p-5">
        <p className="kicker mb-3">Compartir</p>
        <BotonCompartir
          idPartido={idPartido}
          titulo={tituloCompartir}
          veredicto={prediccion.veredicto}
        />
      </section>

      {/* Captación: acaba de consumir una predicción → máximo interés */}
      <CanalWhatsApp variante="banda" />
    </div>
  );
}

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default DetallePartido;
