import { useEffect, useState } from 'react';
import type { GrupoPosiciones, FilaPosicion } from '../lib/posiciones';
import { equipoPorId } from '../datos/equipos.js';
import { CanalWhatsApp } from '../componentes/Llamados';

/**
 * Tabla de posiciones de la fase de grupos. Trae /api/posiciones (que se
 * calcula desde los resultados reales) y la pinta por grupo. Se ve desde el
 * día 1 con todos en cero y se llena solo con cada resultado. Los dos
 * primeros de cada grupo —que clasifican— van marcados en verde.
 */
function Posiciones() {
  const [grupos, setGrupos] = useState<GrupoPosiciones[] | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    let cancelado = false;
    fetch('/api/posiciones')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http'))))
      .then((d: { grupos: GrupoPosiciones[] }) => {
        if (!cancelado) {
          setGrupos(d.grupos ?? []);
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
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-12">
      <header className="border-b border-tinta-linea pb-8">
        <p className="kicker">Posiciones · Fase de grupos</p>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold text-tinta-titulo leading-[1.05]">
          Cómo va cada grupo.
        </h1>
        <p className="mt-3 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
          Se actualiza con cada resultado. Clasifican los <span className="text-verde">dos primeros</span> de
          cada grupo, más los 8 mejores terceros.
        </p>
      </header>

      {estado === 'cargando' && (
        <p className="mt-10 font-mono text-[13px] text-tinta-mute animate-pulse-señal uppercase tracking-wide">
          Cargando posiciones…
        </p>
      )}
      {estado === 'error' && (
        <p className="mt-10 font-mono text-[13px] text-alerta">
          No se pudieron cargar las posiciones. Intenta recargar.
        </p>
      )}

      {estado === 'ok' && grupos && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {grupos.map((g) => (
            <TablaGrupo key={g.grupo} g={g} />
          ))}
        </div>
      )}

      <div className="mt-12">
        <CanalWhatsApp variante="banda" />
      </div>
    </div>
  );
}

function TablaGrupo({ g }: { g: GrupoPosiciones }) {
  return (
    <section className="rounded-lg border border-tinta-linea bg-tinta-tarjeta overflow-hidden">
      <div className="px-4 py-3 border-b border-tinta-linea flex items-baseline justify-between">
        <p className="kicker">Grupo {g.grupo}</p>
        <span className="font-mono text-[10px] text-tinta-mute uppercase tracking-wide">
          <span className="text-verde">●</span> clasifican
        </span>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-wide text-tinta-mute">
            <th className="py-2 pl-4 font-normal w-6">#</th>
            <th className="py-2 font-normal">Equipo</th>
            <th className="py-2 px-1 text-center font-normal hidden sm:table-cell">G</th>
            <th className="py-2 px-1 text-center font-normal hidden sm:table-cell">E</th>
            <th className="py-2 px-1 text-center font-normal hidden sm:table-cell">P</th>
            <th className="py-2 px-1 text-center font-normal">PJ</th>
            <th className="py-2 px-1 text-center font-normal">DG</th>
            <th className="py-2 px-2 pr-4 text-center font-normal">Pts</th>
          </tr>
        </thead>
        <tbody className="font-mono text-[13px]">
          {g.filas.map((f, i) => (
            <FilaEquipo key={f.equipoId} f={f} pos={i + 1} clasifica={i < 2} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function FilaEquipo({ f, pos, clasifica }: { f: FilaPosicion; pos: number; clasifica: boolean }) {
  const e = equipoPorId(f.equipoId);
  const dg = f.dg > 0 ? `+${f.dg}` : `${f.dg}`;
  return (
    <tr className={`border-t border-tinta-linea ${clasifica ? 'bg-verde/[0.05]' : ''}`}>
      <td className="py-2.5 pl-4">
        <span className={clasifica ? 'text-verde font-semibold' : 'text-tinta-mute'}>{pos}</span>
      </td>
      <td className="py-2.5">
        <span className="text-tinta-titulo font-semibold">
          {e.banderaEmoji} {e.id}
        </span>
        <span className="hidden sm:inline font-sans text-[12px] text-tinta-mute ml-2">
          {e.nombre}
        </span>
      </td>
      <td className="px-1 text-center text-tinta-cuerpo hidden sm:table-cell">{f.pg}</td>
      <td className="px-1 text-center text-tinta-cuerpo hidden sm:table-cell">{f.pe}</td>
      <td className="px-1 text-center text-tinta-cuerpo hidden sm:table-cell">{f.pp}</td>
      <td className="px-1 text-center text-tinta-cuerpo">{f.pj}</td>
      <td className={`px-1 text-center tabular ${f.dg > 0 ? 'text-verde' : f.dg < 0 ? 'text-tinta-mute' : 'text-tinta-cuerpo'}`}>
        {dg}
      </td>
      <td className="px-2 pr-4 text-center text-tinta-titulo font-semibold tabular">{f.pts}</td>
    </tr>
  );
}

export default Posiciones;
