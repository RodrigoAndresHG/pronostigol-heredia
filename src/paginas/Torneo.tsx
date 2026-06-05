import {
  Maple,
  Zayu,
  Clutch,
  Pelota,
} from '../componentes/visual/Mascotas';

/**
 * Explicador del Mundial 2026 con diseño visual.
 *
 * Bloques:
 *   1. Hero con título + las 3 mascotas decorativas + pelotas flotando.
 *   2. Datos clave: 48 equipos, 12 grupos, 3 países, fechas.
 *   3. Diagrama visual del bracket (grupos → R32 → R16 → QF → SF → Final).
 *   4. Explicación de los mejores terceros.
 *   5. Las 16 sedes anunciadas.
 *   6. Partido inaugural y final destacados.
 */
function Torneo() {
  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradiente-hero text-white px-4 py-12">
        <div className="absolute top-6 right-6 opacity-50">
          <Maple tamano={80} />
        </div>
        <div className="absolute top-20 right-24 opacity-40 hidden sm:block">
          <Zayu tamano={70} />
        </div>
        <div className="absolute top-32 right-44 opacity-30 hidden sm:block">
          <Clutch tamano={60} />
        </div>
        <div
          className="absolute bottom-6 left-6 opacity-20 animate-flotar"
          style={{ animationDelay: '0.5s' }}
        >
          <Pelota tamano={50} />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-marca-acento font-bold">
            La guía rápida
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold mt-3 leading-tight">
            El Mundial 2026,
            <br />
            <span className="text-marca-acento">en simple.</span>
          </h1>
          <p className="mt-5 text-white/85 leading-relaxed text-lg max-w-xl">
            Por primera vez 48 equipos, tres países, una Ronda de 32 nueva
            y nuevos criterios para clasificar. Todo lo que necesitas para
            seguirlo bien.
          </p>
        </div>
      </section>

      <div className="px-4 space-y-12 max-w-3xl mx-auto">
        {/* DATOS CLAVE */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CajaDatos numero="48" etiqueta="Equipos" color="text-marca-primario" />
          <CajaDatos numero="12" etiqueta="Grupos" color="text-marca-acento" />
          <CajaDatos numero="3" etiqueta="Países" color="text-mundial-rojo" />
          <CajaDatos numero="104" etiqueta="Partidos" color="text-mundial-azul" />
        </section>

        {/* DIAGRAMA DEL BRACKET */}
        <section>
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-marca-primario font-bold">
              El camino al trofeo
            </p>
            <h2 className="font-display text-3xl font-bold text-marca-tinta mt-2">
              De 48 a 1
            </h2>
          </div>

          <div className="rounded-2xl bg-white border border-marca-grisLinea p-5">
            <DiagramaBracket />
          </div>
        </section>

        {/* MEJORES TERCEROS */}
        <BloqueExplicacion
          titulo="Cómo se clasifican los 8 mejores terceros"
          cuerpo="Se comparan los 12 terceros de cada grupo por puntos, diferencia de gol y goles a favor. Los 8 mejores avanzan a la Ronda de 32; los 4 restantes quedan eliminados. Esto significa que un empate temprano puede pesar muchísimo — un punto puede ser la diferencia entre seguir en el torneo o irse a casa."
          icono="📊"
        />

        {/* SEDES */}
        <section>
          <div className="text-center mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-marca-primario font-bold">
              16 sedes oficiales
            </p>
            <h2 className="font-display text-3xl font-bold text-marca-tinta mt-2">
              Los estadios
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <CajaSedes
              pais="México"
              bandera="🇲🇽"
              sedes={[
                'Estadio Azteca (CDMX)',
                'Estadio Akron (Guadalajara)',
                'Estadio BBVA (Monterrey)',
              ]}
            />
            <CajaSedes
              pais="Estados Unidos"
              bandera="🇺🇸"
              sedes={[
                'MetLife (NY/NJ)',
                'SoFi (Los Ángeles)',
                'AT&T (Dallas)',
                'NRG (Houston)',
                'Mercedes-Benz (Atlanta)',
                'Gillette (Boston)',
                'Arrowhead (Kansas City)',
                'Hard Rock (Miami)',
                'Lincoln Financial (Filadelfia)',
                "Levi's (San Francisco)",
                'Lumen Field (Seattle)',
              ]}
            />
            <CajaSedes
              pais="Canadá"
              bandera="🇨🇦"
              sedes={['BMO Field (Toronto)', 'BC Place (Vancouver)']}
            />
          </div>
        </section>

        {/* PARTIDOS DESTACADOS */}
        <section className="grid sm:grid-cols-2 gap-4">
          <PartidoHito
            etiqueta="Inaugural"
            equipos="México vs Sudáfrica"
            fecha="11 de junio de 2026"
            sede="Estadio Azteca, CDMX"
            color="bg-gradient-to-br from-mundial-cesped to-marca-primario"
            emoji="🎉"
          />
          <PartidoHito
            etiqueta="Final"
            equipos="Por definir"
            fecha="19 de julio de 2026"
            sede="MetLife Stadium, Nueva Jersey"
            color="bg-gradient-to-br from-marca-acento to-mundial-rojo"
            emoji="🏆"
          />
        </section>
      </div>
    </div>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────

function CajaDatos({
  numero,
  etiqueta,
  color,
}: {
  numero: string;
  etiqueta: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-marca-grisLinea p-4 text-center hover:shadow-md transition-shadow">
      <p className={`font-display text-4xl sm:text-5xl font-bold ${color}`}>
        {numero}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-marca-grisTexto font-semibold">
        {etiqueta}
      </p>
    </div>
  );
}

function DiagramaBracket() {
  const fases = [
    { numero: 48, nombre: 'Fase de grupos', color: 'bg-marca-primario' },
    { numero: 32, nombre: 'Ronda de 32', color: 'bg-marca-primarioOscuro' },
    { numero: 16, nombre: 'Octavos', color: 'bg-mundial-cesped' },
    { numero: 8, nombre: 'Cuartos', color: 'bg-marca-acento' },
    { numero: 4, nombre: 'Semifinales', color: 'bg-mundial-rojo' },
    { numero: 2, nombre: 'Final', color: 'bg-marca-tinta' },
  ];

  return (
    <div className="space-y-3">
      {fases.map((fase, indice) => {
        const ancho = `${(fase.numero / 48) * 100}%`;
        return (
          <div
            key={fase.nombre}
            className="flex items-center gap-3 animate-subir"
            style={{ animationDelay: `${indice * 0.07}s` }}
          >
            <div
              className={`${fase.color} text-white rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm`}
              style={{ width: ancho, minWidth: '110px' }}
            >
              <span className="font-display font-bold text-lg">
                {fase.numero}
              </span>
              <span className="text-xs uppercase tracking-wider opacity-90 truncate">
                {fase.nombre}
              </span>
            </div>
          </div>
        );
      })}
      <p className="text-xs text-marca-grisTexto/70 text-center mt-4 italic">
        Tras la Ronda de 32, todo es a eliminación directa con tiempo extra y
        penales si hace falta.
      </p>
    </div>
  );
}

function BloqueExplicacion({
  titulo,
  cuerpo,
  icono,
}: {
  titulo: string;
  cuerpo: string;
  icono: string;
}) {
  return (
    <section className="rounded-2xl bg-white border border-marca-grisLinea p-5">
      <div className="text-3xl mb-2">{icono}</div>
      <h2 className="font-display text-xl font-bold text-marca-tinta">
        {titulo}
      </h2>
      <p className="mt-2 text-marca-grisTexto leading-relaxed">{cuerpo}</p>
    </section>
  );
}

function CajaSedes({
  pais,
  bandera,
  sedes,
}: {
  pais: string;
  bandera: string;
  sedes: string[];
}) {
  return (
    <div className="rounded-2xl bg-white border border-marca-grisLinea p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{bandera}</span>
        <h3 className="font-display font-bold text-marca-tinta">{pais}</h3>
        <span className="ml-auto text-xs text-marca-grisTexto/70 font-mono">
          {sedes.length}
        </span>
      </div>
      <ul className="space-y-1.5 text-sm text-marca-grisTexto">
        {sedes.map((sede) => (
          <li key={sede} className="flex items-start gap-2">
            <span className="text-marca-primario font-bold mt-0.5">·</span>
            <span>{sede}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PartidoHito({
  etiqueta,
  equipos,
  fecha,
  sede,
  color,
  emoji,
}: {
  etiqueta: string;
  equipos: string;
  fecha: string;
  sede: string;
  color: string;
  emoji: string;
}) {
  return (
    <div
      className={`rounded-2xl ${color} text-white p-5 shadow-md hover:shadow-xl transition-shadow relative overflow-hidden`}
    >
      <div className="absolute top-3 right-3 text-4xl opacity-40">{emoji}</div>
      <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-90">
        {etiqueta}
      </p>
      <p className="font-display text-2xl font-bold mt-2 leading-tight">
        {equipos}
      </p>
      <p className="mt-3 text-sm opacity-90">{fecha}</p>
      <p className="text-xs opacity-75">{sede}</p>
    </div>
  );
}

export default Torneo;
