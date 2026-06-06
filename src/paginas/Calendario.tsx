import { useMemo, useState } from 'react';
import { PARTIDOS } from '../datos/partidos';
import { EQUIPOS } from '../datos/equipos';
import { LETRAS_GRUPOS } from '../datos/grupos';
import { claveDiaLocal, fechaCompleta, zonaDelUsuario } from '../lib/zonaHoraria';
import TarjetaPartido from '../componentes/TarjetaPartido';
import { CanalWhatsApp } from '../componentes/Llamados';

/**
 * Calendario editorial. Filtros como chips (equipo + grupo), partidos
 * agrupados por día local con header sticky. Horas en la zona del usuario.
 */
function Calendario() {
  const [filtroEquipo, setFiltroEquipo] = useState<string>('');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('');

  const equiposOrdenados = useMemo(
    () => [...EQUIPOS].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    []
  );

  const partidosFiltrados = useMemo(() => {
    return PARTIDOS.filter((partido) => {
      if (
        filtroEquipo &&
        partido.equipoLocalId !== filtroEquipo &&
        partido.equipoVisitanteId !== filtroEquipo
      ) {
        return false;
      }
      if (filtroGrupo && partido.grupo !== filtroGrupo) return false;
      return true;
    });
  }, [filtroEquipo, filtroGrupo]);

  const partidosPorDia = useMemo(() => {
    const mapa = new Map<string, typeof partidosFiltrados>();
    for (const partido of partidosFiltrados) {
      const clave = claveDiaLocal(partido.fechaISO);
      if (!mapa.has(clave)) mapa.set(clave, []);
      mapa.get(clave)!.push(partido);
    }
    return mapa;
  }, [partidosFiltrados]);

  const hayFiltro = filtroEquipo || filtroGrupo;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-12">
      {/* Cabecera editorial */}
      <header className="border-b border-tinta-linea pb-8">
        <p className="kicker">Calendario completo · {PARTIDOS.length} partidos</p>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold text-tinta-titulo leading-[1.05]">
          Todo el torneo, día por día.
        </h1>
        <p className="mt-3 font-mono text-[12px] text-tinta-mute uppercase tracking-wide">
          Horas en tu zona · {zonaDelUsuario()}
        </p>
      </header>

      {/* Filtros como chips */}
      <div className="mt-8 space-y-4">
        <ChipFila titulo="Grupo">
          <Chip activo={!filtroGrupo} onClick={() => setFiltroGrupo('')}>
            Todos
          </Chip>
          {LETRAS_GRUPOS.map((letra) => (
            <Chip key={letra} activo={filtroGrupo === letra} onClick={() => setFiltroGrupo(letra)}>
              {letra}
            </Chip>
          ))}
        </ChipFila>

        <div>
          <p className="kicker mb-2">Equipo</p>
          <select
            value={filtroEquipo}
            onChange={(e) => setFiltroEquipo(e.target.value)}
            className="w-full sm:w-auto bg-tinta-tarjeta border border-tinta-linea text-tinta-cuerpo font-mono text-sm rounded-md px-4 py-2.5 focus:border-verde focus:outline-none"
          >
            <option value="">Todos los equipos</option>
            {equiposOrdenados.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.id} · {equipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {hayFiltro && (
          <button
            onClick={() => {
              setFiltroEquipo('');
              setFiltroGrupo('');
            }}
            className="font-mono text-[12px] text-tinta-mute hover:text-verde transition-colors"
          >
            × limpiar filtros
          </button>
        )}
      </div>

      {/* Listado */}
      {partidosPorDia.size === 0 ? (
        <p className="text-center text-tinta-mute py-16 font-mono text-sm">
          No hay partidos con esos filtros.
        </p>
      ) : (
        <div className="mt-12 space-y-10">
          {[...partidosPorDia.entries()].map(([clave, partidos]) => (
            <section key={clave}>
              <div className="sticky top-16 z-10 bg-tinta-fondo/90 backdrop-blur-sm py-3 -mx-1 px-1 border-b border-tinta-linea flex items-baseline justify-between">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-tinta-titulo">
                  {fechaCompleta(partidos[0].fechaISO)}
                </h2>
                <span className="font-mono text-[11px] text-tinta-mute">
                  {partidos.length} {partidos.length === 1 ? 'partido' : 'partidos'}
                </span>
              </div>
              <div className="mt-2 divide-y divide-tinta-linea">
                {partidos.map((partido) => (
                  <TarjetaPartido key={partido.id} partido={partido} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Captación: fan navegando el fixture → al canal */}
      <div className="mt-12">
        <CanalWhatsApp variante="linea" contexto="predicción del día" />
      </div>
    </div>
  );
}

function ChipFila({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="kicker mb-2">{titulo}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3.5 py-1.5 rounded-full font-mono text-[12px] border transition-colors duration-200',
        activo
          ? 'bg-verde text-tinta-fondo border-verde font-semibold'
          : 'bg-transparent text-tinta-mute border-tinta-linea hover:border-tinta-mute hover:text-tinta-cuerpo',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default Calendario;
