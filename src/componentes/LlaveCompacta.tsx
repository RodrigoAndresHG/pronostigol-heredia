import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Llave, CruceResuelto, OcupanteSlot } from '../lib/eliminatorias';
import type { ConsensoPartido } from '../../api/predicciones.ts';
import { equipoPorId } from '../datos/equipos.js';
import { partidoPorId } from '../datos/partidos.js';
import { usePredicciones } from '../juego/usePredicciones';

/**
 * La Llave, COMPACTA y mobile-first — pensada para el landing.
 *
 * El árbol completo (31 cruces) no cabe legible en un celular como cuadro
 * horizontal. Aquí se navega por RONDA (un selector de chips) y cada ronda es
 * una lista vertical: cero scroll lateral, todo entra en pantalla. Cada cruce
 * de la Ronda de 32 muestra el consenso de las 3 IAs (barra local/empate/
 * visitante) y enlaza a su desglose. El de Ecuador va resaltado.
 *
 * Trae /api/llave (estructura resuelta) + /api/predicciones (consenso). El
 * cuadro completo en árbol vive en /torneo para quien lo quiera.
 */
const CHIP: Record<string, string> = {
  r32: 'R32',
  r16: 'Octavos',
  cuartos: 'Cuartos',
  semis: 'Semis',
  final: 'Final',
};
const NUM_RONDA: Record<string, number> = { r32: 32, r16: 16, cuartos: 8, semis: 4, final: 2 };

function fechaCorta(iso: string): string {
  const d = new Date(iso);
  const dia = d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  const hora = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  return `${dia} · ${hora}`;
}

function LlaveCompacta() {
  const [llave, setLlave] = useState<Llave | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [faseSel, setFaseSel] = useState<string>('r32');
  const consensos = usePredicciones();

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

  const ronda = llave?.rondas.find((r) => r.fase === faseSel);
  // En R32 ordenamos por fecha (cronológico, lo más útil en el landing); en
  // rondas posteriores aún no hay fixtures, se deja el orden estructural.
  const cruces =
    ronda && faseSel === 'r32'
      ? [...ronda.cruces].sort((a, b) =>
          (partidoPorId(`R32-${a.numero}`)?.fechaISO ?? '').localeCompare(
            partidoPorId(`R32-${b.numero}`)?.fechaISO ?? ''
          )
        )
      : (ronda?.cruces ?? []);

  return (
    <section>
      <p className="kicker text-cyan">La llave en vivo</p>
      <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-tinta-titulo leading-[1.08]">
        Camino al título.
      </h2>
      <p className="mt-3 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
        Las eliminatorias, partido a partido — con lo que predicen las{' '}
        <span className="text-verde">3 IAs</span> en cada cruce. Toca cualquiera
        para ver el desglose.
      </p>

      {/* Mini-mapa del torneo: 32 → … → trofeo */}
      <div className="mt-6 flex items-center gap-1.5 font-mono text-[13px]">
        {['r32', 'r16', 'cuartos', 'semis', 'final'].map((f, i) => (
          <span key={f} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-tinta-linea">›</span>}
            <span className={f === faseSel ? 'text-verde font-semibold' : 'text-tinta-mute'}>
              {NUM_RONDA[f]}
            </span>
          </span>
        ))}
        <span className="text-tinta-linea">›</span>
        <span aria-hidden className="text-base leading-none">🏆</span>
      </div>

      {/* Selector de ronda */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(llave?.rondas ?? []).map((r) => {
          const activo = r.fase === faseSel;
          return (
            <button
              key={r.fase}
              onClick={() => setFaseSel(r.fase)}
              className={`shrink-0 font-mono text-[12px] px-3.5 py-1.5 rounded-full border transition-colors ${
                activo
                  ? 'bg-verde border-verde text-tinta-fondo font-semibold'
                  : 'border-tinta-linea text-tinta-cuerpo hover:border-tinta-mute'
              }`}
            >
              {CHIP[r.fase] ?? r.etiqueta}
            </button>
          );
        })}
      </div>

      {estado === 'cargando' && (
        <p className="mt-6 font-mono text-[13px] text-tinta-mute animate-pulse-señal uppercase tracking-wide">
          Cargando la llave…
        </p>
      )}
      {estado === 'error' && (
        <p className="mt-6 font-mono text-[13px] text-alerta">
          No se pudo cargar la llave. Intenta recargar.
        </p>
      )}

      {estado === 'ok' && ronda && (
        <div className="mt-5 space-y-2.5">
          {cruces.map((c) => (
            <FilaCruce
              key={c.numero}
              cruce={c}
              fase={faseSel}
              consenso={consensos.get(`R32-${c.numero}`)}
            />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link
          to="/torneo"
          className="inline-flex items-center gap-2 font-mono text-[13px] text-cyan hover:text-tinta-titulo transition-colors"
        >
          Ver el cuadro completo <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

function FilaCruce({
  cruce,
  fase,
  consenso,
}: {
  cruce: CruceResuelto;
  fase: string;
  consenso?: ConsensoPartido;
}) {
  const esR32 = fase === 'r32';
  const idPartido = `R32-${cruce.numero}`;
  const partido = esR32 ? partidoPorId(idPartido) : undefined;
  const ecuador =
    cruce.local.equipoId === 'ECU' || cruce.visitante.equipoId === 'ECU';

  const contenido = (
    <article
      className={`rounded-lg border bg-tinta-tarjeta px-4 py-3 transition-colors ${
        ecuador
          ? 'border-verde/50'
          : partido
            ? 'border-tinta-linea hover:border-tinta-mute'
            : 'border-tinta-linea/60'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wide text-tinta-mute">
          {partido ? fechaCorta(partido.fechaISO) : `Partido ${cruce.numero}`}
        </span>
        {ecuador ? (
          <span className="font-mono text-[9px] uppercase tracking-wide text-verde border border-verde/40 rounded px-1.5 py-px">
            🇪🇨 Ecuador
          </span>
        ) : partido ? (
          <span aria-hidden className="text-tinta-mute text-sm leading-none">
            ›
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <LadoEquipo o={cruce.local} destacado={consenso?.favorito === 'local'} />
        <span className="font-mono text-[11px] text-tinta-mute shrink-0">vs</span>
        <LadoEquipo o={cruce.visitante} destacado={consenso?.favorito === 'visitante'} alineadoDerecha />
      </div>

      {esR32 &&
        (consenso ? (
          <BarraConsenso consenso={consenso} />
        ) : (
          <p className="mt-2.5 font-mono text-[10px] uppercase tracking-wide text-tinta-mute">
            Las 3 IAs lo analizan pronto
          </p>
        ))}
    </article>
  );

  return partido ? (
    <Link to={`/partido/${idPartido}`} className="block">
      {contenido}
    </Link>
  ) : (
    contenido
  );
}

function LadoEquipo({
  o,
  destacado,
  alineadoDerecha,
}: {
  o: OcupanteSlot;
  destacado?: boolean;
  alineadoDerecha?: boolean;
}) {
  if (!o.equipoId) {
    return (
      <span
        className={`font-mono text-[12px] text-tinta-mute truncate ${alineadoDerecha ? 'text-right' : ''}`}
      >
        {o.etiqueta}
      </span>
    );
  }
  const e = equipoPorId(o.equipoId);
  return (
    <span
      className={`flex items-center gap-1.5 min-w-0 ${alineadoDerecha ? 'flex-row-reverse' : ''}`}
    >
      <span aria-hidden>{e.banderaEmoji}</span>
      <span
        className={`text-[15px] truncate ${
          destacado ? 'text-tinta-titulo font-semibold' : 'text-tinta-cuerpo'
        }`}
      >
        {e.id}
      </span>
    </span>
  );
}

function BarraConsenso({ consenso }: { consenso: ConsensoPartido }) {
  const [pl, pe, pv] = consenso.prob;
  const etiqFav =
    consenso.favorito === 'local'
      ? `${pl}%`
      : consenso.favorito === 'visitante'
        ? `${pv}%`
        : `empate ${pe}%`;
  return (
    <div className="mt-2.5">
      <div className="flex h-1.5 rounded-full overflow-hidden bg-tinta-fondo">
        <div className="bg-verde" style={{ width: `${pl}%` }} />
        <div className="bg-tinta-linea" style={{ width: `${pe}%` }} />
        <div className="bg-cyan" style={{ width: `${pv}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-tinta-mute">
        <span>
          <span className="text-verde">●</span> IA: favorito {etiqFav}
        </span>
        {consenso.marcador && <span>marcador {consenso.marcador}</span>}
      </div>
    </div>
  );
}

export default LlaveCompacta;
