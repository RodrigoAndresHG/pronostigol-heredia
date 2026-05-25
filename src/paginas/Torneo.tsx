/**
 * Explicador del formato del Mundial 2026.
 *
 * Información estática que ya puede vivir desde la Fase 0,
 * porque no depende de ninguna API. La idea es explicar en
 * lenguaje sencillo el formato nuevo de 48 equipos.
 */
function Torneo() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="font-display text-3xl font-bold text-marca-tinta">
        El Mundial 2026, en simple
      </h1>

      <p className="text-marca-grisTexto leading-relaxed mt-2">
        Por primera vez el Mundial tiene <strong>48 equipos</strong>, se
        juega en tres países (Estados Unidos, México y Canadá) y estrena
        una <strong>Ronda de 32</strong> antes de los Octavos. Estos son
        los puntos que conviene tener claros para seguir el torneo.
      </p>

      <BloqueExplicacion
        titulo="Fase de grupos: 12 grupos de 4"
        cuerpo="Los 48 equipos se reparten en 12 grupos de 4. Cada equipo juega 3 partidos en su grupo. Avanzan los dos primeros de cada grupo (24 equipos) más los 8 mejores terceros."
      />
      <BloqueExplicacion
        titulo="La nueva Ronda de 32"
        cuerpo="Con 32 clasificados, la fase de eliminación arranca antes que en mundiales pasados. Es un partido a eliminación directa: el que pierde se va, el que gana pasa a Octavos."
      />
      <BloqueExplicacion
        titulo="Cómo se clasifican los 8 mejores terceros"
        cuerpo="Se comparan los terceros de los 12 grupos por puntos, diferencia de gol y goles a favor. Los 8 mejores avanzan; los 4 restantes quedan eliminados. Es donde un empate temprano puede pesar mucho."
      />
      <BloqueExplicacion
        titulo="De Octavos a la Final"
        cuerpo="Octavos (16), Cuartos (8), Semifinales (4), Tercer puesto y Final. Todo a eliminación directa, con tiempo extra y penales si hace falta."
      />
      <BloqueExplicacion
        titulo="Partido inaugural"
        cuerpo="Jueves 11 de junio de 2026, México vs Sudáfrica en el Estadio Azteca, Ciudad de México. Es la inauguración formal del torneo y el reencuentro del Azteca con un Mundial 36 años después de 1986."
      />
      <BloqueExplicacion
        titulo="Calendario clave"
        cuerpo="Fase de grupos: 11 al 27 de junio. Ronda de 32: 28 de junio al 3 de julio. Octavos: 4-7 de julio. Cuartos: 9-11 de julio. Semifinales: 14-15 de julio. Tercer puesto: 18 de julio. Final: domingo 19 de julio de 2026 en el MetLife Stadium, Nueva Jersey."
      />
    </article>
  );
}

/**
 * Pequeño bloque reutilizable para explicar cada concepto.
 */
function BloqueExplicacion({
  titulo,
  cuerpo,
}: {
  titulo: string;
  cuerpo: string;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-marca-grisLinea bg-white p-4">
      <h2 className="font-display text-lg font-semibold text-marca-tinta">
        {titulo}
      </h2>
      <p className="mt-1 text-marca-grisTexto leading-relaxed">{cuerpo}</p>
    </section>
  );
}

export default Torneo;
