import { useEffect, useState } from 'react';
import type { GoleadorAgregado } from '../tipos';
import { equipoPorId } from '../datos/equipos.js';
import { dossierEquipo } from '../datos/dossiers.js';

/**
 * Tabla de goleadores del torneo (Feature 4). Se nutre en vivo de
 * openfootball (sin API key). Se auto-oculta hasta que haya goles.
 *
 * El gancho del método: si un goleador es la "figura" que el Dossier le dio
 * a las IAs (campo `estrella`), se marca con ★ — el hecho que recibieron las
 * IAs, confirmado en la cancha.
 */

function esFiguraDelDossier(equipoId: string, nombre: string): boolean {
  const star = dossierEquipo(equipoId)?.estrella;
  if (!star) return false;
  const apellido = nombre.trim().split(' ').pop()?.toLowerCase() ?? '';
  return (
    star === nombre ||
    (apellido.length > 2 && star.toLowerCase().includes(apellido))
  );
}

function GoleadoresTorneo() {
  const [goleadores, setGoleadores] = useState<GoleadorAgregado[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetch('/api/goleadores')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelado && d) setGoleadores(d.goleadores ?? []);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  if (!goleadores || goleadores.length === 0) return null;
  const top = goleadores.slice(0, 12);

  return (
    <section className="mt-12">
      <p className="kicker">Goleadores del torneo</p>
      <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo leading-snug">
        Quién la está metiendo.
      </h2>
      <p className="mt-2 max-w-lectura text-[14px] text-tinta-cuerpo leading-relaxed">
        En vivo. La ★ marca a la figura que el Dossier le dio a las IAs como
        referente del equipo — el hecho, confirmado en la cancha.
      </p>

      <div className="mt-4 divide-y divide-tinta-linea border-y border-tinta-linea">
        {top.map((g, i) => (
          <FilaGoleador key={`${g.equipoId}|${g.nombre}`} g={g} rango={i} />
        ))}
      </div>
    </section>
  );
}

function FilaGoleador({ g, rango }: { g: GoleadorAgregado; rango: number }) {
  const equipo = equipoPorId(g.equipoId);
  const figura = esFiguraDelDossier(g.equipoId, g.nombre);
  return (
    <div className="py-3 flex items-center gap-4">
      <span className="font-mono text-[13px] text-tinta-mute w-5 shrink-0">{rango + 1}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] text-tinta-titulo leading-tight">
          {g.nombre}
          {figura && (
            <span className="ml-2 font-mono text-[11px] text-verde" title="Figura del dossier">
              ★ figura
            </span>
          )}
        </p>
        <p className="font-mono text-[11px] text-tinta-mute mt-0.5">
          {equipo.id} · {equipo.nombre}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span className="font-display text-2xl font-bold tabular text-verde leading-none">
          {g.goles}
        </span>
        {g.penales > 0 && (
          <span className="font-mono text-[10px] text-tinta-mute ml-1">
            ({g.penales} de penal)
          </span>
        )}
      </div>
    </div>
  );
}

export default GoleadoresTorneo;
