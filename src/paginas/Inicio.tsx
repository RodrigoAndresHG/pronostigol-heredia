import { Link } from 'react-router-dom';

/**
 * Página de inicio / landing.
 *
 * Su trabajo en la Fase 0 es:
 *   1. Decir qué es PronostiGol HeredIA en una frase.
 *   2. Mostrar las 3 piezas únicas (consenso, desacuerdo, valor).
 *   3. Llevar al usuario al calendario.
 *
 * Cuando entren más datos reales (Fases 1-4) sumaremos aquí
 * "próximos 3 partidos" como vista rápida.
 */
function Inicio() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="pt-6">
        <p className="text-xs uppercase tracking-widest text-marca-primario font-semibold">
          Mundial 2026 · Edición HeredIA
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-marca-tinta mt-2 leading-tight">
          Tres IAs piensan tu pronóstico.
          <span className="text-marca-primario"> En voz alta.</span>
        </h1>
        <p className="mt-4 text-marca-grisTexto text-lg leading-relaxed">
          Comparamos lo que dicen Claude, GPT y Gemini sobre cada partido,
          mostramos dónde coinciden, dónde no, y cuándo el mercado podría
          estar equivocado. Sin caja negra: cada predicción se explica.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/calendario"
            className="inline-block px-5 py-2.5 rounded-full bg-marca-primario text-white font-medium hover:bg-marca-primarioOscuro transition-colors"
          >
            Ver calendario
          </Link>
          <Link
            to="/torneo"
            className="inline-block px-5 py-2.5 rounded-full border border-marca-grisLinea text-marca-tinta font-medium hover:bg-white transition-colors"
          >
            ¿Cómo funciona el Mundial?
          </Link>
        </div>
      </section>

      {/* Las 3 piezas que nos diferencian */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Tarjeta
          titulo="Consenso de 3 IAs"
          texto="Cuando las tres coinciden, lo marcamos como alta confianza. Cuando no, lo decimos."
          emoji="🧠"
        />
        <Tarjeta
          titulo="Desacuerdo visible"
          texto="Si las IAs piensan distinto, exponemos por qué. El desacuerdo es información."
          emoji="⚖️"
        />
        <Tarjeta
          titulo="Señal de valor"
          texto="Comparamos contra la cuota del mercado. Si difiere mucho, te avisamos."
          emoji="🎯"
        />
      </section>

      {/* Estado actual honesto */}
      <section className="rounded-2xl border border-dashed border-marca-grisLinea p-5 bg-white">
        <p className="text-xs uppercase tracking-widest text-marca-acento font-semibold">
          Estado del proyecto
        </p>
        <p className="mt-2 text-marca-grisTexto">
          Estamos en Fase 0: esqueleto desplegado. Las predicciones reales
          empiezan a generarse antes del partido inaugural,{' '}
          <strong className="text-marca-tinta">11 de junio de 2026</strong>.
        </p>
      </section>
    </div>
  );
}

/**
 * Tarjeta pequeña reutilizada en la grilla del hero.
 * Definida acá porque sólo se usa en esta página.
 */
function Tarjeta({
  titulo,
  texto,
  emoji,
}: {
  titulo: string;
  texto: string;
  emoji: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-marca-grisLinea p-4">
      <div className="text-2xl">{emoji}</div>
      <h3 className="mt-2 font-display font-semibold text-marca-tinta">
        {titulo}
      </h3>
      <p className="mt-1 text-sm text-marca-grisTexto leading-relaxed">
        {texto}
      </p>
    </div>
  );
}

export default Inicio;
