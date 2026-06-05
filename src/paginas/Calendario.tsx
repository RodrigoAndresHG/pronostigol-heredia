import { useMemo, useState } from 'react';
import { PARTIDOS } from '../datos/partidos';
import { EQUIPOS } from '../datos/equipos';
import { LETRAS_GRUPOS } from '../datos/grupos';
import { claveDiaLocal, fechaCompleta, zonaDelUsuario } from '../lib/zonaHoraria';
import TarjetaPartido from '../componentes/TarjetaPartido';

/**
 * Página de calendario.
 *
 * - Filtra por equipo y por grupo.
 * - Agrupa los partidos por día local del usuario y muestra una
 *   cabecera con la fecha completa.
 * - Las horas se muestran en la zona horaria detectada del navegador
 *   (default: Ecuador / GMT-5).
 */
function Calendario() {
  const [filtroEquipo, setFiltroEquipo] = useState<string>('');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('');

  // Lista de equipos ordenada alfabéticamente para el dropdown.
  const equiposOrdenados = useMemo(
    () => [...EQUIPOS].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    []
  );

  // Aplicamos los filtros a la lista completa.
  const partidosFiltrados = useMemo(() => {
    return PARTIDOS.filter((partido) => {
      if (
        filtroEquipo &&
        partido.equipoLocalId !== filtroEquipo &&
        partido.equipoVisitanteId !== filtroEquipo
      ) {
        return false;
      }
      if (filtroGrupo && partido.grupo !== filtroGrupo) {
        return false;
      }
      return true;
    });
  }, [filtroEquipo, filtroGrupo]);

  // Agrupamos por día local del usuario (no por UTC) para que partidos
  // que en UTC son al día siguiente caigan en el día correcto del usuario.
  const partidosPorDia = useMemo(() => {
    const mapa = new Map<string, typeof partidosFiltrados>();
    for (const partido of partidosFiltrados) {
      const clave = claveDiaLocal(partido.fechaISO);
      if (!mapa.has(clave)) mapa.set(clave, []);
      mapa.get(clave)!.push(partido);
    }
    return mapa;
  }, [partidosFiltrados]);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
      {/* Cabecera */}
      <div>
        <h1 className="font-display text-3xl font-bold text-marca-tinta">
          Calendario
        </h1>
        <p className="text-sm text-marca-grisTexto mt-1">
          Horas en tu zona ({zonaDelUsuario()}) · {PARTIDOS.length} partidos
          en fase de grupos
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-marca-grisTexto font-semibold">
            Equipo
          </span>
          <select
            value={filtroEquipo}
            onChange={(e) => setFiltroEquipo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-marca-grisLinea bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {equiposOrdenados.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.banderaEmoji} {equipo.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-marca-grisTexto font-semibold">
            Grupo
          </span>
          <select
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-marca-grisLinea bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {LETRAS_GRUPOS.map((letra) => (
              <option key={letra} value={letra}>
                Grupo {letra}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Listado agrupado por día */}
      {partidosPorDia.size === 0 ? (
        <p className="text-center text-marca-grisTexto py-10">
          No hay partidos que coincidan con los filtros.
        </p>
      ) : (
        <div className="space-y-6">
          {[...partidosPorDia.entries()].map(([clave, partidos]) => (
            <section key={clave}>
              <h2 className="font-display text-sm font-semibold text-marca-grisTexto uppercase tracking-wider mb-3">
                {fechaCompleta(partidos[0].fechaISO)}
              </h2>
              <div className="space-y-2">
                {partidos.map((partido) => (
                  <TarjetaPartido key={partido.id} partido={partido} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default Calendario;
