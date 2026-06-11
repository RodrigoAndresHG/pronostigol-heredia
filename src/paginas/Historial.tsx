import { useEffect, useState } from 'react';
import type {
  Actor,
  BoletinActor,
  HistorialResponse,
  PartidoCalificado,
} from '../tipos';
import { partidoPorId } from '../datos/partidos.js';
import { equipoPorId } from '../datos/equipos.js';
import { PuenteMetodo } from '../componentes/Llamados';
import CurvaCalibracion from '../componentes/CurvaCalibracion';

/**
 * Historial editorial — el track-record REAL de la app (Fase 9).
 *
 * Ya no es mock: trae de /api/historial el Boletín de Calibración (Brier
 * por IA), la curva de calibración de confianza y los partidos calificados.
 * La transparencia es el producto: los fallos pesan igual que los aciertos,
 * y el Brier mide la HONESTIDAD probabilística, no solo el acierto crudo.
 */

const COLOR_ACTOR: Record<Actor, string> = {
  Claude: 'text-verde',
  GPT: 'text-cyan',
  Gemini: 'text-alerta',
  Consenso: 'text-tinta-titulo',
  'Modelo base': 'text-tinta-mute',
};

function Historial() {
  const [datos, setDatos] = useState<HistorialResponse | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    let cancelado = false;
    fetch('/api/historial')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: HistorialResponse) => {
        if (!cancelado) {
          setDatos(d);
          setEstado('ok');
        }
      })
      .catch(() => {
        if (!cancelado) setEstado('error');
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const hayDatos = datos && datos.partidosCalificados > 0;
  const totalCalibracion = datos?.calibracion.reduce((s, c) => s + c.n, 0) ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-12">
      <header className="border-b border-tinta-linea pb-8">
        <p className="kicker">Historial · Los recibos del método</p>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold text-tinta-titulo leading-[1.05]">
          ¿Quién razona mejor?
        </h1>
        <p className="mt-3 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
          Cada partido jugado califica a las 3 IAs, al consenso y al modelo
          base con el Brier Score —que premia la honestidad probabilística, no
          el acierto a ciegas—. Sin esconder los fallos: eso es lo que hace
          creíble el método.
        </p>
      </header>

      {estado === 'cargando' && (
        <p className="mt-10 font-mono text-[13px] text-tinta-mute animate-pulse-señal uppercase tracking-wide">
          Calculando el track-record…
        </p>
      )}

      {estado === 'error' && (
        <p className="mt-10 font-mono text-[13px] text-alerta">
          No se pudo cargar el historial. Intenta recargar.
        </p>
      )}

      {estado === 'ok' && !hayDatos && <EstadoVacio />}

      {estado === 'ok' && hayDatos && (
        <>
          {/* ── Boletín de Calibración ─────────────────────────────── */}
          <section className="mt-10">
            <div className="flex items-baseline justify-between border-b border-tinta-linea pb-3">
              <p className="kicker">Boletín de calibración</p>
              <span className="font-mono text-[11px] text-tinta-mute">
                {datos!.partidosCalificados} partido
                {datos!.partidosCalificados === 1 ? '' : 's'} calificado
                {datos!.partidosCalificados === 1 ? '' : 's'}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {datos!.boletin.map((b, i) => (
                <FilaBoletin key={b.actor} fila={b} rango={i} esLider={i === 0} />
              ))}
            </div>
            <p className="mt-4 font-mono text-[11px] text-tinta-mute leading-relaxed max-w-lectura">
              Brier: menor es mejor (0 = perfecto, 0.667 = no saber nada). Mide
              si la probabilidad estaba bien puesta, no solo si acertó el
              ganador.
            </p>
          </section>

          {/* ── Termómetro de honestidad ───────────────────────────── */}
          <section className="mt-12">
            <p className="kicker">Termómetro de honestidad</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo leading-snug max-w-[24ch]">
              Cuando dicen estar seguras, ¿lo están?
            </h2>
            <p className="mt-2 max-w-lectura text-[14px] text-tinta-cuerpo leading-relaxed">
              La confianza que declaran las IAs contra su acierto real. Sobre la
              diagonal: demasiado cautas. Debajo: sobreconfiadas.
            </p>
            <div className="mt-6 rounded-lg bg-tinta-tarjeta border border-tinta-linea p-5">
              {totalCalibracion >= 4 ? (
                <CurvaCalibracion cubetas={datos!.calibracion} />
              ) : (
                <p className="font-mono text-[13px] text-tinta-mute py-8 text-center">
                  Faltan datos para la curva. Vuelve tras un par de jornadas.
                </p>
              )}
            </div>
          </section>

          {/* ── Partidos calificados ───────────────────────────────── */}
          <section className="mt-12">
            <p className="kicker border-b border-tinta-linea pb-3">Partidos calificados</p>
            <div className="mt-2 divide-y divide-tinta-linea">
              {datos!.registros.map((reg) => (
                <RegistroPartido key={reg.partidoId} reg={reg} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Captación: quien evalúa la credibilidad → al método (LMS) */}
      <div className="mt-12">
        <PuenteMetodo variante="banda" contenido="historial" gancho="credibilidad" />
      </div>
    </div>
  );
}

function FilaBoletin({
  fila,
  rango,
  esLider,
}: {
  fila: BoletinActor;
  rango: number;
  esLider: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
        esLider ? 'border-verde/30 bg-verde/[0.04]' : 'border-tinta-linea bg-tinta-tarjeta'
      }`}
    >
      <span className="font-mono text-[13px] text-tinta-mute w-5 shrink-0">{rango + 1}</span>
      <div className="min-w-0 flex-1">
        <span className={`font-mono text-[15px] font-semibold ${COLOR_ACTOR[fila.actor]}`}>
          {fila.actor}
        </span>
        {esLider && (
          <span className="ml-2 font-mono text-[10px] uppercase tracking-wide text-verde">
            ● líder
          </span>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-display text-2xl font-bold tabular text-tinta-titulo leading-none">
          {fila.brierPromedio.toFixed(3)}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wide text-tinta-mute mt-1">Brier</p>
      </div>
      <div className="text-right shrink-0 w-16">
        <p className="font-mono text-[15px] text-tinta-cuerpo tabular">
          {fila.aciertos}/{fila.total}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wide text-tinta-mute mt-1">aciertos</p>
      </div>
    </div>
  );
}

function RegistroPartido({ reg }: { reg: PartidoCalificado }) {
  const partido = partidoPorId(reg.partidoId);
  if (!partido) return null;
  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);
  return (
    <article className="py-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-tinta-mute uppercase tracking-wide">
          {partido.grupo ? `Grupo ${partido.grupo}` : partido.fase}
        </span>
        <span
          className={`font-mono text-[11px] uppercase tracking-wide ${reg.consensoAcerto ? 'text-verde' : 'text-peligro'}`}
        >
          {reg.consensoAcerto ? '✓ El consenso acertó' : '✗ El consenso falló'}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 font-mono">
        <span className="text-tinta-titulo font-semibold w-12">{local.id}</span>
        <span className="text-tinta-titulo text-2xl font-display font-semibold tabular">
          {reg.golesLocal}–{reg.golesVisitante}
        </span>
        <span className="text-tinta-titulo font-semibold w-12">{visitante.id}</span>
        <span className="text-tinta-mute text-sm hidden sm:inline">
          {local.nombre} vs {visitante.nombre}
        </span>
      </div>
    </article>
  );
}

function EstadoVacio() {
  return (
    <section className="mt-10 rounded-lg border border-dashed border-tinta-lineaFuerte bg-tinta-tarjeta p-8 sm:p-12 text-center">
      <p className="kicker text-verde">El Mundial acaba de empezar</p>
      <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo leading-snug max-w-[28ch] mx-auto">
        Aún no hay partidos jugados que calificar.
      </h2>
      <p className="mt-3 max-w-lectura mx-auto text-[15px] text-tinta-cuerpo leading-relaxed">
        En cuanto se jueguen los primeros partidos, aquí aparecerá el
        track-record real: qué tan acertadas y calibradas estuvieron las 3 IAs,
        el consenso y el modelo base. Vuelve después del primer pitazo.
      </p>
    </section>
  );
}

export default Historial;
