import { useEffect, useState } from 'react';
import type {
  Llave,
  RondaLlave,
  CruceResuelto,
  OcupanteSlot,
  TerceroFila,
} from '../lib/eliminatorias';
import { equipoPorId } from '../datos/equipos.js';
import { TERCEROS_QUE_CLASIFICAN } from '../datos/eliminatorias.js';

/**
 * Altura (px) de la banda de un cruce de la PRIMERA columna (Ronda de 32). Cada
 * ronda siguiente tiene la mitad de cruces, así que su banda mide el doble
 * (BANDA_BASE · 2^nivel) y todas las columnas terminan con la MISMA altura
 * total (16·base = 8·2base = …). Así la llave alinea sola, sin altura mágica.
 */
const BANDA_BASE = 60;

/**
 * La Llave Final EN VIVO, dibujada como árbol (R32 → Octavos → Cuartos →
 * Semis → Final). Trae /api/llave (derivado de los resultados reales) y ubica a
 * los clasificados en su slot. Los cruces directos (1º/2º) se confirman al
 * cerrar cada grupo; los slots de tercero muestran sus grupos candidatos hasta
 * que cierren los 12 grupos (Anexo C). Debajo, la carrera por los mejores
 * terceros: el ranking en vivo de los 12 terceros.
 */
function LlaveEnVivo() {
  const [llave, setLlave] = useState<Llave | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    let cancelado = false;
    fetch('/api/llave')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http'))))
      .then((d: { llave: Llave }) => {
        if (!cancelado) {
          setLlave(d.llave);
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

  return (
    <section>
      <p className="kicker">La llave en vivo</p>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-tinta-titulo">
        El cuadro, de la Ronda de 32 a la final
      </h2>
      <p className="mt-3 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
        Se llena solo con cada resultado. Los{' '}
        <span className="text-verde">clasificados directos</span> (1º y 2º) se
        fijan al cerrar su grupo; los cruces con tercero muestran sus grupos
        candidatos hasta que cierren los 12 grupos.
      </p>

      {estado === 'cargando' && (
        <p className="mt-8 font-mono text-[13px] text-tinta-mute animate-pulse-señal uppercase tracking-wide">
          Cargando la llave…
        </p>
      )}
      {estado === 'error' && (
        <p className="mt-8 font-mono text-[13px] text-alerta">
          No se pudo cargar la llave. Intenta recargar.
        </p>
      )}

      {estado === 'ok' && llave && (
        <>
          {llave.gruposCompletos < 12 && (
            <p className="mt-5 font-mono text-[11px] text-tinta-mute leading-relaxed border-l-2 border-tinta-linea pl-3">
              {llave.gruposCompletos}/12 grupos cerrados. La ubicación exacta de
              los 8 mejores terceros se fija con la tabla oficial de FIFA (Anexo
              C) al completarse la fase de grupos.
            </p>
          )}

          <p className="mt-6 sm:hidden font-mono text-[10px] text-tinta-mute uppercase tracking-wide">
            Desliza para ver toda la llave →
          </p>

          {/* ÁRBOL DE LA LLAVE */}
          <div className="mt-4 overflow-x-auto pb-4">
            <div className="flex items-start min-w-[860px]">
              {llave.rondas.map((ronda, i) => (
                <ColumnaRonda
                  key={ronda.fase}
                  ronda={ronda}
                  nivel={i}
                  primera={i === 0}
                  ultima={i === llave.rondas.length - 1}
                />
              ))}
            </div>
          </div>

          {/* CARRERA POR LOS TERCEROS */}
          <div className="mt-12">
            <p className="kicker">El detalle clave</p>
            <h3 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo">
              Carrera por los 8 mejores terceros
            </h3>
            <p className="mt-3 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
              Avanzan los 8 mejores de los 12 terceros, por puntos, diferencia de
              gol y goles a favor. Un empate temprano puede costar el torneo: un
              punto separa seguir de volver a casa.
            </p>
            <CarreraTerceros terceros={llave.terceros} />
          </div>
        </>
      )}
    </section>
  );
}

function ColumnaRonda({
  ronda,
  nivel,
  primera,
  ultima,
}: {
  ronda: RondaLlave;
  nivel: number;
  primera: boolean;
  ultima: boolean;
}) {
  // Banda de altura fija por cruce: doble en cada ronda → columnas alineadas.
  const banda = BANDA_BASE * 2 ** nivel;
  return (
    <div className="flex flex-col flex-1 min-w-[150px]" role="group" aria-label={ronda.etiqueta}>
      <p className="h-6 font-mono text-[10px] uppercase tracking-wide text-tinta-mute text-center">
        {ronda.etiqueta}
      </p>
      <div className="flex flex-col">
        {ronda.cruces.map((c) => (
          <div
            key={c.numero}
            className="flex items-center relative"
            style={{ height: banda }}
          >
            {/* Conector vertical que une a los dos clasificados previos. */}
            {!primera && (
              <span className="absolute left-0 top-1/4 h-1/2 w-px bg-tinta-linea" />
            )}
            {/* Tramo horizontal del conector vertical hacia este cruce. */}
            {!primera && (
              <span className="absolute left-0 top-1/2 w-2.5 h-px bg-tinta-linea" />
            )}
            {/* Tramo horizontal hacia la ronda siguiente. */}
            {!ultima && (
              <span className="absolute right-0 top-1/2 w-2.5 h-px bg-tinta-linea" />
            )}
            <Cruce c={c} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Cruce({ c }: { c: CruceResuelto }) {
  return (
    <article
      aria-label={`Partido ${c.numero}: ${c.local.etiqueta} contra ${c.visitante.etiqueta}`}
      className="flex-1 mx-2.5 rounded-md border border-tinta-linea bg-tinta-tarjeta px-2.5 py-1"
    >
      <p className="font-mono text-[9px] leading-none uppercase tracking-wide text-tinta-mute mb-1">
        M{c.numero}
      </p>
      <div className="space-y-0.5">
        <Ocupante o={c.local} />
        <Ocupante o={c.visitante} />
      </div>
    </article>
  );
}

function Ocupante({ o }: { o: OcupanteSlot }) {
  if (!o.equipoId) {
    // Slot sin resolver: etiqueta ("1A", "3º C/E/F/H/I", "Gan. 73").
    return (
      <p className="font-mono text-[11px] text-tinta-mute truncate">{o.etiqueta}</p>
    );
  }
  const e = equipoPorId(o.equipoId);
  return (
    <p className="flex items-center gap-1.5">
      <span className={o.provisional ? 'opacity-70' : ''}>{e.banderaEmoji}</span>
      <span
        className={`font-semibold text-[13px] ${
          o.provisional ? 'text-tinta-cuerpo' : 'text-tinta-titulo'
        }`}
      >
        {e.id}
      </span>
      {o.provisional && (
        <span className="ml-auto font-mono text-[8px] uppercase tracking-wide text-tinta-mute border border-tinta-linea rounded px-1">
          prov
        </span>
      )}
    </p>
  );
}

function CarreraTerceros({ terceros }: { terceros: TerceroFila[] }) {
  return (
    <div className="mt-6 rounded-lg border border-tinta-linea bg-tinta-tarjeta overflow-hidden max-w-2xl">
      <table className="w-full text-left">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-wide text-tinta-mute">
            <th className="py-2 pl-4 font-normal w-6">#</th>
            <th className="py-2 font-normal">Tercero</th>
            <th className="py-2 px-1 text-center font-normal">Gr</th>
            <th className="py-2 px-1 text-center font-normal">DG</th>
            <th className="py-2 px-2 pr-4 text-center font-normal">Pts</th>
          </tr>
        </thead>
        <tbody className="font-mono text-[13px]">
          {terceros.map((tf, i) => (
            <FilaTercero
              key={tf.equipoId}
              tf={tf}
              pos={i + 1}
              corte={i === TERCEROS_QUE_CLASIFICAN - 1}
            />
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 border-t border-tinta-linea font-mono text-[10px] text-tinta-mute uppercase tracking-wide">
        <span className="text-verde">●</span> clasifican (8 mejores) · línea de
        corte tras el 8.º
      </p>
    </div>
  );
}

function FilaTercero({
  tf,
  pos,
  corte,
}: {
  tf: TerceroFila;
  pos: number;
  corte: boolean;
}) {
  const e = equipoPorId(tf.equipoId);
  const dg = tf.dg > 0 ? `+${tf.dg}` : `${tf.dg}`;
  return (
    <tr
      className={`border-t border-tinta-linea ${
        tf.clasifica ? 'bg-verde/[0.05]' : ''
      } ${corte ? 'border-b-2 border-b-verde/40' : ''}`}
    >
      <td className="py-2.5 pl-4">
        <span className={tf.clasifica ? 'text-verde font-semibold' : 'text-tinta-mute'}>
          {pos}
        </span>
      </td>
      <td className="py-2.5">
        <span className="text-tinta-titulo font-semibold">
          {e.banderaEmoji} {e.id}
        </span>
        <span className="hidden sm:inline font-sans text-[12px] text-tinta-mute ml-2">
          {e.nombre}
        </span>
        {!tf.confirmado && (
          <span className="ml-2 font-mono text-[9px] uppercase tracking-wide text-tinta-mute">
            prov
          </span>
        )}
      </td>
      <td className="px-1 text-center text-tinta-cuerpo">{tf.grupo}</td>
      <td
        className={`px-1 text-center tabular ${
          tf.dg > 0 ? 'text-verde' : tf.dg < 0 ? 'text-tinta-mute' : 'text-tinta-cuerpo'
        }`}
      >
        {dg}
      </td>
      <td className="px-2 pr-4 text-center text-tinta-titulo font-semibold tabular">
        {tf.pts}
      </td>
    </tr>
  );
}

export default LlaveEnVivo;
