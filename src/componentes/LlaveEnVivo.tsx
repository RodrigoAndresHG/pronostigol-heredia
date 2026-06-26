import { useEffect, useRef, useState } from 'react';
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

          {/* LLAVE ESPEJADA: dos mitades que convergen en la final, al centro. */}
          <LlaveEspejada llave={llave} />

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

interface ColumnaLlave {
  fase: string;
  etiqueta: string;
  nivel: number;
  cruces: CruceResuelto[];
}

/** Nivel de cada fase: fija la altura de banda (BANDA_BASE · 2^nivel). */
const NIVEL: Record<string, number> = { r32: 0, r16: 1, cuartos: 2, semis: 3 };

/**
 * La llave dibujada como cuadro ESPEJADO, al estilo del bracket oficial: la
 * mitad izquierda fluye hacia la derecha, la derecha hacia la izquierda, y
 * ambas convergen en la final, al centro. Cada ronda se parte por la mitad: los
 * datos vienen en orden planar, así que la primera mitad es el lado izquierdo.
 */
function LlaveEspejada({ llave }: { llave: Llave }) {
  // El cuadro tiene ancho fijo (~1140px): casi siempre desborda. Mostramos el
  // hint de "desliza" solo cuando de verdad hay scroll horizontal.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const medir = () => setOverflow(el.scrollWidth > el.clientWidth + 4);
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  const sinFinal = llave.rondas.filter((r) => r.fase !== 'final');
  const final = llave.rondas.find((r) => r.fase === 'final')?.cruces[0];
  const col = (r: RondaLlave, cruces: CruceResuelto[]): ColumnaLlave => ({
    fase: r.fase,
    etiqueta: r.etiqueta,
    nivel: NIVEL[r.fase],
    cruces,
  });
  // Cada ronda se parte por la mitad (orden planar: 1.ª mitad = lado izquierdo).
  // Ambos lados se construyen en orden CRONOLÓGICO (R32→semis) para que el DOM
  // sea lógico para lectores de pantalla; el lado derecho se espeja sólo con
  // CSS (flex-row-reverse), así visualmente las semis quedan junto al centro.
  const izq = sinFinal.map((r) => col(r, r.cruces.slice(0, r.cruces.length / 2)));
  const der = sinFinal.map((r) => col(r, r.cruces.slice(r.cruces.length / 2)));

  return (
    <div className="mt-4">
      {overflow && (
        <p className="mb-2 font-mono text-[10px] text-tinta-mute uppercase tracking-wide">
          Desliza para ver toda la llave →
        </p>
      )}
      <div ref={scrollRef} className="overflow-x-auto pb-4">
        <div className="flex items-start w-max mx-auto">
          <div
            className="flex"
            role="group"
            aria-label="Mitad izquierda del cuadro, de la Ronda de 32 a la semifinal"
          >
            {izq.map((c) => (
              <ColumnaLado key={`i-${c.fase}`} col={c} lado="izq" />
            ))}
          </div>
          <Centro final={final} />
          <div
            className="flex flex-row-reverse"
            role="group"
            aria-label="Mitad derecha del cuadro, de la Ronda de 32 a la semifinal"
          >
            {der.map((c) => (
              <ColumnaLado key={`d-${c.fase}`} col={c} lado="der" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColumnaLado({ col, lado }: { col: ColumnaLlave; lado: 'izq' | 'der' }) {
  const banda = BANDA_BASE * 2 ** col.nivel;
  const der = lado === 'der';
  const esR32 = col.fase === 'r32';
  return (
    <div
      className="flex flex-col min-w-[124px]"
      role="group"
      aria-label={`${col.etiqueta} · mitad ${der ? 'derecha' : 'izquierda'}`}
    >
      <p className="h-6 font-mono text-[9px] uppercase tracking-wide text-tinta-mute text-center">
        {col.etiqueta}
      </p>
      <div className="flex flex-col">
        {col.cruces.map((c) => (
          <div
            key={c.numero}
            className="flex items-center relative"
            style={{ height: banda }}
          >
            {/* Unión de los dos clasificados previos, del lado exterior. */}
            {!esR32 && (
              <span
                className={`absolute top-1/4 h-1/2 w-px bg-tinta-linea ${der ? 'right-0' : 'left-0'}`}
              />
            )}
            {!esR32 && (
              <span
                className={`absolute top-1/2 w-2.5 h-px bg-tinta-linea ${der ? 'right-0' : 'left-0'}`}
              />
            )}
            {/* Tramo hacia el centro (la ronda siguiente). */}
            <span
              className={`absolute top-1/2 w-2.5 h-px bg-tinta-linea ${der ? 'left-0' : 'right-0'}`}
            />
            <Cruce c={c} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Columna central: el trofeo y la final, alineada con las dos semifinales. */
function Centro({ final }: { final?: CruceResuelto }) {
  return (
    <div
      className="flex flex-col items-center min-w-[152px] px-2"
      role="group"
      aria-label="Final"
    >
      <div className="h-6" />
      {/* La TARJETA va centrada en el eje (igual que las semis); el trofeo y el
          rótulo flotan justo encima sin desplazar su centro. */}
      <div
        className="flex items-center justify-center"
        style={{ height: BANDA_BASE * 8 }}
      >
        {final && (
          <div className="relative w-[148px]">
            <div className="absolute bottom-full inset-x-0 mb-2 flex flex-col items-center">
              <span className="text-4xl leading-none" aria-hidden="true">
                🏆
              </span>
              <span className="kicker mt-1 whitespace-nowrap">La final</span>
            </div>
            <Cruce c={final} />
          </div>
        )}
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
