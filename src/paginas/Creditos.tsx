import { LISTA_ESTADIOS } from '../datos/estadios.ts';

/**
 * Página de créditos. Indexa todas las fotos de estadios con su autor,
 * licencia y enlace a Wikimedia Commons. Cumplir la atribución CC es
 * obligación legal; mostrarla así, abierta y ordenada, es además un rasgo
 * editorial al estilo NYT / The Athletic.
 */
function Creditos() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-12">
      <header className="border-b border-tinta-linea pb-8 max-w-lectura">
        <p className="kicker">Créditos e imágenes</p>
        <h1 className="mt-3 font-display text-4xl sm:text-6xl font-semibold text-tinta-titulo leading-[1.05]">
          De dónde vienen las fotos.
        </h1>
        <p className="mt-4 text-[15px] text-tinta-cuerpo leading-relaxed">
          Todas las fotografías de estadios provienen de Wikimedia Commons bajo
          licencias Creative Commons o dominio público. Aquí están sus autores y
          licencias, como exige cada licencia y como manda la honestidad
          editorial.
        </p>
      </header>

      {/* Tabla de atribuciones */}
      <section className="mt-10">
        <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 pb-3 border-b border-tinta-linea kicker">
          <span>Estadio</span>
          <span>Ciudad</span>
          <span>Autor</span>
          <span>Licencia</span>
        </div>
        <div className="divide-y divide-tinta-linea">
          {LISTA_ESTADIOS.map((e) => (
            <a
              key={e.slug}
              href={e.credito.fuente}
              target="_blank"
              rel="noopener noreferrer"
              className="grid sm:grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-1 sm:gap-4 py-4 group hover:bg-tinta-tarjeta -mx-3 px-3 rounded-md transition-colors"
            >
              <span className="font-display text-lg text-tinta-titulo group-hover:text-verde transition-colors">
                {e.nombre}
              </span>
              <span className="font-mono text-[13px] text-tinta-cuerpo">{e.ciudad}</span>
              <span className="font-mono text-[13px] text-tinta-mute">{e.credito.autor}</span>
              <span className="font-mono text-[12px] text-tinta-mute uppercase">
                {e.credito.licencia}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Nota sobre mascotas */}
      <section className="mt-16 max-w-lectura border-t border-tinta-linea pt-8">
        <p className="kicker">Sobre las mascotas</p>
        <p className="mt-3 text-[15px] text-tinta-cuerpo leading-relaxed">
          Maple, Zayu y Clutch son marcas registradas de la FIFA. PronostiGol
          HeredIA no reproduce su diseño oficial: los emblemas que ves son
          ilustraciones geométricas propias de un alce, un jaguar y un águila,
          creadas para esta web. Los nombres se mencionan sólo con fines
          informativos.
        </p>
      </section>

      {/* Tipografía / tooling */}
      <section className="mt-12 max-w-lectura border-t border-tinta-linea pt-8">
        <p className="kicker">Tipografía y herramientas</p>
        <ul className="mt-3 space-y-1.5 font-mono text-[13px] text-tinta-mute">
          <li>Fraunces, Inter y JetBrains Mono — Google Fonts (SIL OFL 1.1)</li>
          <li>React · Vite · Tailwind CSS · Vercel</li>
          <li>Predicciones: Claude (Anthropic), GPT (OpenAI), Gemini (Google)</li>
        </ul>
      </section>
    </div>
  );
}

export default Creditos;
