import { Link } from 'react-router-dom';
import { LISTA_ESTADIOS, rutaImagenEstadio } from '../datos/estadios.js';
import { estadioPorSede } from '../datos/estadios.js';
import { PARTIDOS } from '../datos/partidos.js';
import { CanalWhatsApp } from '../componentes/Llamados';

/**
 * Explicador del Mundial 2026, editorial.
 *
 *   1. Hero con foto del Azteca (estadio inaugural).
 *   2. Números clave (48/104/39/16).
 *   3. Bracket: el camino de 48 a 1.
 *   4. Cómo clasifican los mejores terceros.
 *   5. Grilla de las 16 sedes con foto real.
 */
function Torneo() {
  const inaugural = PARTIDOS[0];
  const estadioInaugural = estadioPorSede(inaugural.sede);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[52vh] flex items-end overflow-hidden">
        {estadioInaugural && (
          <img
            src={rutaImagenEstadio(estadioInaugural.slug)}
            alt={estadioInaugural.nombre}
            className="foto-tratada absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'grayscale(0.4) contrast(1.05) brightness(0.5)' }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,22,40,0.5) 0%, rgba(10,22,40,0.96) 100%)',
          }}
        />
        <div className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 pb-12 pt-28">
          <p className="kicker text-cyan">Torneo · Estructura y números</p>
          <h1 className="mt-3 font-display font-bold text-tinta-titulo leading-[1.04] tracking-tight text-4xl sm:text-6xl max-w-[18ch]">
            48 selecciones. 16 ciudades. Un campeón.
          </h1>
          <p className="mt-4 font-display text-xl text-tinta-cuerpo max-w-[48ch] leading-snug">
            Por primera vez el Mundial cambia de formato: tres países, 12 grupos
            y una nueva Ronda de 32.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 space-y-20">
        {/* NÚMEROS CLAVE */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-tinta-linea border border-tinta-linea rounded-lg overflow-hidden">
          <NumeroClave numero="48" etiqueta="Selecciones" />
          <NumeroClave numero="104" etiqueta="Partidos" />
          <NumeroClave numero="39" etiqueta="Días" />
          <NumeroClave numero="16" etiqueta="Sedes" />
        </section>

        {/* BRACKET */}
        <section>
          <p className="kicker">El camino al trofeo</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-tinta-titulo">
            De 48 a 1
          </h2>
          <div className="mt-8 space-y-2.5">
            {FASES.map((fase, i) => (
              <div
                key={fase.nombre}
                className="flex items-center gap-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="flex items-center gap-3 rounded-md bg-tinta-tarjeta border border-tinta-linea px-4 py-3"
                  style={{ width: `${Math.max((fase.n / 48) * 100, 22)}%` }}
                >
                  <span className="font-display font-bold text-2xl text-tinta-titulo tabular">
                    {fase.n}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-tinta-mute truncate">
                    {fase.nombre}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 font-mono text-[12px] text-tinta-mute max-w-lectura leading-relaxed">
            Tras la Ronda de 32, todo es eliminación directa — con tiempo extra y
            penales si hace falta.
          </p>
        </section>

        {/* MEJORES TERCEROS */}
        <section className="rounded-lg border border-tinta-linea bg-tinta-tarjeta p-6 sm:p-8 max-w-3xl">
          <p className="kicker">El detalle clave</p>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo">
            Los 8 mejores terceros
          </h2>
          <p className="mt-3 text-[15px] text-tinta-cuerpo leading-relaxed">
            Avanzan los dos primeros de cada grupo (24 equipos) más los 8 mejores
            terceros, elegidos por puntos, diferencia de gol y goles a favor.
            Por eso un empate temprano puede pesar muchísimo: un solo punto separa
            seguir en el torneo de volver a casa.
          </p>
        </section>

        {/* SEDES */}
        <section>
          <p className="kicker">16 sedes oficiales</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-tinta-titulo">
            Los estadios
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LISTA_ESTADIOS.map((e) => (
              <article
                key={e.slug}
                className="relative aspect-[4/3] rounded-lg overflow-hidden border border-tinta-linea group"
              >
                <img
                  src={rutaImagenEstadio(e.slug)}
                  alt={`${e.nombre}, ${e.ciudad}`}
                  loading="lazy"
                  className="foto-tratada absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-editorial"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(10,22,40,0.1) 30%, rgba(10,22,40,0.95) 100%)',
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <p className="font-mono text-[10px] uppercase tracking-kicker text-cyan">
                    {e.ciudad}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-tinta-titulo leading-tight">
                    {e.nombre}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] text-tinta-mute tabular">
                    {e.capacidad.toLocaleString('es')} asientos
                  </p>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-5 font-mono text-[11px] text-tinta-mute">
            Fotos vía Wikimedia Commons ·{' '}
            <Link to="/creditos" className="text-verde hover:text-verde-hover">
              ver créditos →
            </Link>
          </p>
        </section>

        {/* Captación: fan que llegó por el torneo → al canal */}
        <CanalWhatsApp variante="linea" contexto="predicción del Mundial" />
      </div>
    </div>
  );
}

const FASES = [
  { n: 48, nombre: 'Fase de grupos' },
  { n: 32, nombre: 'Ronda de 32' },
  { n: 16, nombre: 'Octavos' },
  { n: 8, nombre: 'Cuartos' },
  { n: 4, nombre: 'Semifinales' },
  { n: 2, nombre: 'Final' },
];

function NumeroClave({ numero, etiqueta }: { numero: string; etiqueta: string }) {
  return (
    <div className="bg-tinta-tarjeta p-6 sm:p-8 text-center">
      <p className="font-display text-4xl sm:text-6xl font-bold text-tinta-titulo tabular">
        {numero}
      </p>
      <p className="kicker mt-2">{etiqueta}</p>
    </div>
  );
}

export default Torneo;
