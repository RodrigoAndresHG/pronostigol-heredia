import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Actor, BoletinActor, HistorialResponse } from '../tipos';
import { usePicks } from './usePicks.ts';
import { calcularRankingUsuario, type ResultadoReal } from './brierJuego.ts';
import { abrirRegistro, registroEnviado } from './registro.ts';

/**
 * B3 — "Mi Ranking": el desempeño del usuario en el MISMO leaderboard que las
 * 3 IAs, el consenso y el modelo base.
 *
 * No toca el cálculo del servidor: trae el boletín de /api/historial tal cual
 * y, si el usuario ya predijo partidos jugados, calcula su Brier (pick duro →
 * 0 si acierta, 2 si falla) y lo inserta como la fila "TÚ", reordenando por
 * Brier. Cero cuenta requerida: los picks viven en este dispositivo.
 */

const COLOR_ACTOR: Record<Actor, string> = {
  Claude: 'text-verde',
  GPT: 'text-cyan',
  Gemini: 'text-alerta',
  Consenso: 'text-tinta-titulo',
  'Modelo base': 'text-tinta-mute',
};

interface FilaRanking {
  actor: string;
  brierPromedio: number;
  aciertos: number;
  total: number;
  esUsuario: boolean;
}

function MiRanking() {
  const { picks } = usePicks();
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

  // Mapa partidoId → resultado real, sólo de partidos ya jugados.
  const resultados = useMemo(() => {
    const m = new Map<string, ResultadoReal>();
    for (const r of datos?.registros ?? []) m.set(r.partidoId, r.resultadoReal);
    return m;
  }, [datos]);

  const miRanking = useMemo(
    () => calcularRankingUsuario(picks, resultados),
    [picks, resultados]
  );

  const totalPicks = Object.keys(picks).length;

  // Leaderboard combinado: boletín de las IAs + (si aplica) la fila del usuario.
  const tabla = useMemo<FilaRanking[]>(() => {
    const base: FilaRanking[] = (datos?.boletin ?? []).map((b: BoletinActor) => ({
      actor: b.actor,
      brierPromedio: b.brierPromedio,
      aciertos: b.aciertos,
      total: b.total,
      esUsuario: false,
    }));
    // Sólo entras al ranking cuando se jugó al menos uno de tus pronósticos:
    // inyectar "TÚ — 0.000" sin partidos sería un falso perfecto.
    if (miRanking.total > 0) {
      base.push({
        actor: 'TÚ',
        brierPromedio: miRanking.brierPromedio,
        aciertos: miRanking.aciertos,
        total: miRanking.total,
        esUsuario: true,
      });
    }
    return base.sort((a, b) => a.brierPromedio - b.brierPromedio);
  }, [datos, miRanking]);

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-24 pb-12">
      <header className="border-b border-tinta-linea pb-8">
        <p className="kicker">Mi ranking · Tú contra las 3 IAs</p>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold text-tinta-titulo leading-[1.05]">
          ¿Le ganas a las máquinas?
        </h1>
        <p className="mt-3 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
          Cada vez que pronosticas un partido y se juega, tu acierto entra al
          mismo Boletín de Calibración que Claude, GPT y Gemini. Sin cuenta:
          tus picks viven en este dispositivo.
        </p>
      </header>

      {/* Resumen del usuario */}
      <section className="mt-8 grid grid-cols-3 gap-3">
        <Metrica
          valor={String(totalPicks)}
          etiqueta={totalPicks === 1 ? 'pronóstico' : 'pronósticos'}
        />
        <Metrica
          valor={miRanking.total ? `${miRanking.aciertos}/${miRanking.total}` : '—'}
          etiqueta="aciertos"
        />
        <Metrica
          valor={miRanking.total ? miRanking.brierPromedio.toFixed(3) : '—'}
          etiqueta="tu Brier"
          acento
        />
      </section>

      {totalPicks === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-tinta-lineaFuerte bg-tinta-tarjeta p-6 sm:p-8 text-center">
          <p className="kicker text-verde">Empieza a jugar</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-tinta-titulo leading-snug max-w-[26ch] mx-auto">
            Aún no has pronosticado ningún partido.
          </h2>
          <p className="mt-2 text-[15px] text-tinta-cuerpo leading-relaxed max-w-lectura mx-auto">
            Ve al calendario, elige quién gana y enfréntate a las 3 IAs. Toma
            segundos y no necesitas cuenta.
          </p>
          <Link
            to="/calendario"
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-md bg-verde text-tinta-fondo font-semibold text-[15px] hover:bg-verde-hover transition-colors"
          >
            Hacer mi primer pronóstico <span aria-hidden>→</span>
          </Link>
        </div>
      )}

      {totalPicks > 0 && miRanking.total === 0 && (
        <p className="mt-8 rounded-lg border border-tinta-linea bg-tinta-tarjeta px-4 py-4 font-mono text-[13px] text-tinta-cuerpo leading-relaxed">
          Ya tienes {totalPicks} pronóstico{totalPicks === 1 ? '' : 's'}. En
          cuanto se juegue alguno, aparecerás en el ranking de abajo con tu
          Brier real.
        </p>
      )}

      {/* Leaderboard */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between border-b border-tinta-linea pb-3">
          <p className="kicker">Boletín de calibración</p>
          {estado === 'ok' && datos && (
            <span className="font-mono text-[11px] text-tinta-mute">
              {datos.partidosCalificados} partido
              {datos.partidosCalificados === 1 ? '' : 's'} jugado
              {datos.partidosCalificados === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {estado === 'cargando' && (
          <p className="mt-6 font-mono text-[13px] text-tinta-mute animate-pulse-señal uppercase tracking-wide">
            Cargando el ranking…
          </p>
        )}
        {estado === 'error' && (
          <p className="mt-6 font-mono text-[13px] text-alerta">
            No se pudo cargar el ranking. Intenta recargar.
          </p>
        )}
        {estado === 'ok' && tabla.length === 0 && (
          <p className="mt-6 font-mono text-[13px] text-tinta-mute">
            Aún no hay partidos jugados que calificar. Vuelve tras el primer
            pitazo.
          </p>
        )}

        {estado === 'ok' && tabla.length > 0 && (
          <div className="mt-4 space-y-2">
            {tabla.map((fila, i) => (
              <Fila key={fila.actor} fila={fila} rango={i} />
            ))}
          </div>
        )}

        <p className="mt-4 font-mono text-[11px] text-tinta-mute leading-relaxed max-w-lectura">
          Brier: menor es mejor. Tú juegas a todo o nada (eliges un solo
          resultado), así que tu Brier vale 0 si aciertas y 2 si fallas — más
          extremo que el de las IAs, que reparten probabilidad.
        </p>
      </section>

      {/* CTA al registro (recompensa, no peaje) */}
      {!registroEnviado() && (
        <div className="mt-10 rounded-lg border border-cyan/30 bg-cyan/[0.04] p-6 text-center">
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-tinta-titulo leading-snug">
            Guarda tu ranking para siempre.
          </h2>
          <p className="mt-2 text-[14px] text-tinta-cuerpo leading-relaxed max-w-lectura mx-auto">
            Deja tu correo y recibe un enlace mágico para no perder tus
            pronósticos si cambias de dispositivo. Sin contraseña.
          </p>
          <button
            onClick={abrirRegistro}
            className="mt-5 inline-flex items-center justify-center px-6 py-3 rounded-md bg-verde text-tinta-fondo font-semibold text-[15px] hover:bg-verde-hover transition-colors"
          >
            Competir contra las IAs
          </button>
        </div>
      )}
    </div>
  );
}

function Metrica({
  valor,
  etiqueta,
  acento = false,
}: {
  valor: string;
  etiqueta: string;
  acento?: boolean;
}) {
  return (
    <div className="rounded-lg border border-tinta-linea bg-tinta-tarjeta px-3 py-4 text-center">
      <p
        className={`font-display text-2xl sm:text-3xl font-bold tabular leading-none ${
          acento ? 'text-verde' : 'text-tinta-titulo'
        }`}
      >
        {valor}
      </p>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-tinta-mute">
        {etiqueta}
      </p>
    </div>
  );
}

function Fila({ fila, rango }: { fila: FilaRanking; rango: number }) {
  const color = fila.esUsuario
    ? 'text-verde'
    : COLOR_ACTOR[fila.actor as Actor] ?? 'text-tinta-cuerpo';
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
        fila.esUsuario
          ? 'border-verde/50 bg-verde/[0.06]'
          : 'border-tinta-linea bg-tinta-tarjeta'
      }`}
    >
      <span className="font-mono text-[13px] text-tinta-mute w-5 shrink-0">
        {rango + 1}
      </span>
      <div className="min-w-0 flex-1">
        <span className={`font-mono text-[15px] font-semibold ${color}`}>
          {fila.actor}
        </span>
        {fila.esUsuario && (
          <span className="ml-2 font-mono text-[10px] uppercase tracking-wide text-verde">
            ● tú
          </span>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-display text-2xl font-bold tabular text-tinta-titulo leading-none">
          {fila.brierPromedio.toFixed(3)}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wide text-tinta-mute mt-1">
          Brier
        </p>
      </div>
      <div className="text-right shrink-0 w-16">
        <p className="font-mono text-[15px] text-tinta-cuerpo tabular">
          {fila.aciertos}/{fila.total}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wide text-tinta-mute mt-1">
          aciertos
        </p>
      </div>
    </div>
  );
}

export default MiRanking;
