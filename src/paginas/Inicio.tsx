import { Link } from 'react-router-dom';
import { PARTIDOS } from '../datos/partidos.ts';
import { equipoPorId } from '../datos/equipos.ts';
import TarjetaPartido from '../componentes/TarjetaPartido';
import CuentaRegresiva from '../componentes/visual/CuentaRegresiva';
import {
  Maple,
  Zayu,
  Clutch,
  TarjetaMascota,
  Pelota,
} from '../componentes/visual/Mascotas';
import { fechaCompleta, horaLocal } from '../lib/zonaHoraria';

/**
 * Página de inicio — hero de impacto + mascotas + metodología + próximos.
 *
 * Composición:
 *   1. Hero gigante con gradiente, cuenta regresiva al inaugural,
 *      banderas anfitrionas y CTA al calendario.
 *   2. Sección de mascotas (Maple/Zayu/Clutch).
 *   3. Las 3 piezas de la metodología HeredIA.
 *   4. Próximos partidos.
 *   5. Banner final hacia el explicador del torneo.
 */
function Inicio() {
  // Partido inaugural: el primero del calendario (ya está ordenado).
  const inaugural = PARTIDOS[0];
  const inauguralLocal = equipoPorId(inaugural.equipoLocalId);
  const inauguralVisitante = equipoPorId(inaugural.equipoVisitanteId);

  const proximos = PARTIDOS.slice(0, 4);

  return (
    <div className="space-y-12">
      {/* ───── HERO ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradiente-hero text-white px-4 py-12 sm:py-16">
        {/* Decoración: pelotas flotantes */}
        <div className="absolute top-8 right-8 opacity-30 animate-flotar">
          <Pelota tamano={70} />
        </div>
        <div
          className="absolute bottom-12 left-6 opacity-20 animate-flotar"
          style={{ animationDelay: '1s' }}
        >
          <Pelota tamano={48} />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-marca-acento font-bold">
            HeredIA · Mundial 2026
          </p>

          {/* Banderas anfitrionas grandes */}
          <p className="text-4xl mt-3 mb-2">🇲🇽 🇺🇸 🇨🇦</p>

          <h1 className="font-display text-5xl sm:text-7xl font-bold leading-[0.95] tracking-tight">
            Tres IAs
            <br />
            <span className="text-marca-acento">piensan</span> tu
            <br />
            pronóstico.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed max-w-xl">
            Comparamos lo que dicen Claude, GPT y Gemini sobre cada partido.
            Mostramos dónde coinciden, dónde no, y cuándo el mercado podría
            estar equivocado.
          </p>

          {/* Cuenta regresiva */}
          <div className="mt-10 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 p-5">
            <p className="text-xs uppercase tracking-widest text-white/70 mb-3">
              Faltan para el inaugural
            </p>
            <CuentaRegresiva
              fechaObjetivoISO={inaugural.fechaISO}
              textoFinalizado="¡El Mundial 2026 ya empezó!"
            />
            <div className="mt-5 flex items-center justify-center gap-3 text-sm text-white/85 flex-wrap">
              <span className="text-2xl">{inauguralLocal.banderaEmoji}</span>
              <span className="font-display font-semibold">
                {inauguralLocal.nombre}
              </span>
              <span className="opacity-50">vs</span>
              <span className="font-display font-semibold">
                {inauguralVisitante.nombre}
              </span>
              <span className="text-2xl">{inauguralVisitante.banderaEmoji}</span>
            </div>
            <p className="mt-2 text-xs text-center text-white/60">
              {fechaCompleta(inaugural.fechaISO)} · {horaLocal(inaugural.fechaISO)} ·{' '}
              {inaugural.sede}
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/calendario"
              className="inline-block px-6 py-3 rounded-full bg-marca-acento text-marca-tinta font-bold hover:bg-marca-acentoClaro transition-colors shadow-lg"
            >
              Ver calendario completo →
            </Link>
            <Link
              to="/torneo"
              className="inline-block px-6 py-3 rounded-full border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
            >
              ¿Cómo funciona el Mundial?
            </Link>
          </div>
        </div>
      </section>

      <div className="px-4 space-y-12 max-w-3xl mx-auto">
        {/* ───── MASCOTAS ──────────────────────────────────────────── */}
        <section className="animate-aparecer">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-marca-primario font-bold">
              Tres países, tres mascotas
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-marca-tinta mt-2">
              Maple, Zayu y Clutch
            </h2>
            <p className="mt-2 text-marca-grisTexto">
              Por primera vez el Mundial se juega en tres países. Cada uno
              trae su propia mascota.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TarjetaMascota
              mascota="maple"
              nombre="Maple"
              pais="Canadá"
              banderaEmoji="🇨🇦"
            />
            <TarjetaMascota
              mascota="zayu"
              nombre="Zayu"
              pais="México"
              banderaEmoji="🇲🇽"
            />
            <TarjetaMascota
              mascota="clutch"
              nombre="Clutch"
              pais="Estados Unidos"
              banderaEmoji="🇺🇸"
            />
          </div>
        </section>

        {/* ───── METODOLOGÍA ───────────────────────────────────────── */}
        <section>
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-marca-primario font-bold">
              La metodología
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-marca-tinta mt-2">
              Tres IAs. Un modelo base.
              <br />
              <span className="text-marca-primario">Cero caja negra.</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TarjetaMetodologia
              titulo="Consenso de 3 IAs"
              texto="Cuando Claude, GPT y Gemini coinciden, lo marcamos como alta confianza."
              icono="🧠"
              color="from-marca-primario/20 to-marca-primario/5"
              acento="text-marca-primario"
            />
            <TarjetaMetodologia
              titulo="Desacuerdo visible"
              texto="Si las IAs piensan distinto, exponemos por qué. El desacuerdo es información."
              icono="⚖️"
              color="from-marca-acento/20 to-marca-acento/5"
              acento="text-marca-acento"
            />
            <TarjetaMetodologia
              titulo="Señal de valor"
              texto="Comparamos contra la cuota del mercado. Si difiere mucho, te avisamos."
              icono="🎯"
              color="from-mundial-rojo/20 to-mundial-rojo/5"
              acento="text-mundial-rojo"
            />
          </div>
        </section>

        {/* ───── PRÓXIMOS PARTIDOS ─────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-marca-tinta">
              Próximos partidos
            </h2>
            <Link
              to="/calendario"
              className="text-sm text-marca-primario font-semibold hover:underline"
            >
              Ver todo →
            </Link>
          </div>
          <div className="space-y-2">
            {proximos.map((partido) => (
              <TarjetaPartido key={partido.id} partido={partido} />
            ))}
          </div>
        </section>

        {/* ───── BANNER FINAL ──────────────────────────────────────── */}
        <section className="rounded-3xl bg-gradiente-atardecer text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-50">
            <Maple tamano={70} />
          </div>
          <div className="absolute bottom-2 right-20 opacity-40 hidden sm:block">
            <Zayu tamano={60} />
          </div>
          <div className="absolute bottom-4 right-32 opacity-30 hidden sm:block">
            <Clutch tamano={50} />
          </div>
          <div className="relative max-w-md">
            <p className="text-xs uppercase tracking-[0.3em] font-bold">
              Formato nuevo
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 leading-tight">
              48 equipos, 12 grupos, ronda de 32.
            </h2>
            <p className="mt-2 text-white/90 leading-relaxed">
              Por primera vez el Mundial cambia su estructura. Te lo
              explicamos en lenguaje sencillo.
            </p>
            <Link
              to="/torneo"
              className="inline-block mt-4 px-5 py-2.5 rounded-full bg-white text-marca-tinta font-bold hover:bg-white/90 transition-colors"
            >
              Conocer el torneo →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function TarjetaMetodologia({
  titulo,
  texto,
  icono,
  color,
  acento,
}: {
  titulo: string;
  texto: string;
  icono: string;
  color: string;
  acento: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${color} border border-marca-grisLinea p-5 hover:shadow-md transition-all`}
    >
      <div className="text-3xl mb-2">{icono}</div>
      <h3 className={`font-display font-bold text-lg ${acento}`}>{titulo}</h3>
      <p className="mt-1 text-sm text-marca-grisTexto leading-relaxed">
        {texto}
      </p>
    </div>
  );
}

export default Inicio;
