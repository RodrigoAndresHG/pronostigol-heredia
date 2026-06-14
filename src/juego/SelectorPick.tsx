import { useState } from 'react';
import type { Partido } from '../tipos';
import { equipoPorId } from '../datos/equipos';
import type { ConsensoPartido } from '../../api/predicciones.ts';
import { usePicks } from './usePicks.ts';
import type { ResultadoPick } from './picks.ts';

/**
 * "Compite contra las IAs" — selector de pronóstico bajo una tarjeta de
 * partido futuro. Cero fricción: tres botones (Local / Empate / Visitante),
 * se guarda al instante en localStorage. Una vez elegido, enfrenta el pick
 * del usuario contra lo que dicen las 3 IAs y deja afinar el marcador (bonus).
 *
 * No navega (vive FUERA del <Link> de la tarjeta). El panel de registro se
 * dispara solo, a nivel de App, tras el primer pick.
 */

interface Props {
  partido: Partido;
  /** Consenso de las 3 IAs para este partido (si ya hay predicción). */
  consenso?: ConsensoPartido;
}

const ETIQUETA_RESULTADO: Record<ResultadoPick, string> = {
  local: 'gana el local',
  empate: 'empate',
  visitante: 'gana el visitante',
};

function SelectorPick({ partido, consenso }: Props) {
  const { picks, setPick, quitarPick } = usePicks();
  const pick = picks[partido.id];
  const local = equipoPorId(partido.equipoLocalId);
  const visitante = equipoPorId(partido.equipoVisitanteId);
  const [verMarcador, setVerMarcador] = useState(false);

  const opciones: { valor: ResultadoPick; codigo: string }[] = [
    { valor: 'local', codigo: local.id },
    { valor: 'empate', codigo: 'EMP' },
    { valor: 'visitante', codigo: visitante.id },
  ];

  function elegir(valor: ResultadoPick) {
    if (pick?.resultado === valor) {
      quitarPick(partido.id);
      setVerMarcador(false);
    } else {
      setPick(partido.id, {
        resultado: valor,
        golesLocal: pick?.golesLocal,
        golesVisitante: pick?.golesVisitante,
      });
    }
  }

  function fijarMarcador(gl?: number, gv?: number) {
    if (!pick) return;
    setPick(partido.id, {
      resultado: pick.resultado,
      golesLocal: gl,
      golesVisitante: gv,
    });
  }

  // ¿El pick del usuario coincide con el favorito de las IAs?
  const codigoConsenso = consenso
    ? consenso.favorito === 'local'
      ? local.id
      : consenso.favorito === 'visitante'
        ? visitante.id
        : 'EMP'
    : null;
  const coincide = pick && consenso && pick.resultado === consenso.favorito;

  return (
    <div className="px-4 sm:px-5 pb-4 -mt-1">
      <div className="rounded-lg border border-tinta-linea bg-tinta-fondo/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="kicker text-[10px]">Tu pronóstico</p>
          {pick && (
            <button
              type="button"
              onClick={() => elegir(pick.resultado)}
              className="font-mono text-[10px] text-tinta-mute hover:text-peligro transition-colors"
            >
              × quitar
            </button>
          )}
        </div>

        {/* Selector Local / Empate / Visitante */}
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {opciones.map((o) => {
            const activo = pick?.resultado === o.valor;
            return (
              <button
                key={o.valor}
                type="button"
                onClick={() => elegir(o.valor)}
                aria-pressed={activo}
                title={ETIQUETA_RESULTADO[o.valor]}
                className={[
                  'py-2 rounded-md font-mono text-[13px] font-semibold border transition-colors duration-200',
                  activo
                    ? 'bg-verde text-tinta-fondo border-verde'
                    : 'bg-tinta-tarjeta text-tinta-cuerpo border-tinta-linea hover:border-tinta-mute hover:text-tinta-titulo',
                ].join(' ')}
              >
                {o.codigo}
              </button>
            );
          })}
        </div>

        {/* Tú vs las IAs */}
        {pick && (
          <div className="mt-2.5 flex items-center justify-between gap-2 font-mono text-[11px]">
            <span className="text-tinta-mute">
              Las IAs:{' '}
              {consenso ? (
                <span className={coincide ? 'text-verde' : 'text-cyan'}>
                  {codigoConsenso} {consenso.pct}%
                </span>
              ) : (
                <span className="text-tinta-mute">aún sin pronóstico</span>
              )}
            </span>
            {consenso && (
              <span
                className={[
                  'shrink-0 uppercase tracking-wide',
                  coincide ? 'text-verde' : 'text-cyan',
                ].join(' ')}
              >
                {coincide ? '✓ coinciden' : '⚔ los desafías'}
              </span>
            )}
          </div>
        )}

        {/* Marcador opcional (bonus, no afecta el ranking) */}
        {pick && (
          <div className="mt-2.5 border-t border-tinta-linea pt-2.5">
            {verMarcador ||
            pick.golesLocal !== undefined ||
            pick.golesVisitante !== undefined ? (
              <div className="flex items-center justify-center gap-2 font-mono">
                <span className="text-[11px] text-tinta-mute w-10 text-right">
                  {local.id}
                </span>
                <CampoGol
                  valor={pick.golesLocal}
                  onChange={(n) => fijarMarcador(n, pick.golesVisitante)}
                  aria-label={`Goles de ${local.nombre}`}
                />
                <span className="text-tinta-mute">–</span>
                <CampoGol
                  valor={pick.golesVisitante}
                  onChange={(n) => fijarMarcador(pick.golesLocal, n)}
                  aria-label={`Goles de ${visitante.nombre}`}
                />
                <span className="text-[11px] text-tinta-mute w-10">
                  {visitante.id}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setVerMarcador(true)}
                className="w-full text-center font-mono text-[11px] text-tinta-mute hover:text-verde transition-colors"
              >
                + arriesga un marcador exacto
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CampoGol({
  valor,
  onChange,
  'aria-label': ariaLabel,
}: {
  valor?: number;
  onChange: (n?: number) => void;
  'aria-label': string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={20}
      value={valor ?? ''}
      aria-label={ariaLabel}
      onChange={(e) => {
        const v = e.target.value;
        if (v === '') return onChange(undefined);
        const n = Math.max(0, Math.min(20, Math.floor(Number(v))));
        onChange(Number.isFinite(n) ? n : undefined);
      }}
      className="w-12 py-1.5 text-center rounded-md bg-tinta-tarjeta border border-tinta-linea text-tinta-titulo text-[15px] font-semibold focus:border-verde focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

export default SelectorPick;
