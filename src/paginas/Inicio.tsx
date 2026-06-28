import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PartidoCalificado } from '../tipos';
import { PARTIDOS } from '../datos/partidos.js';
import { equipoPorId } from '../datos/equipos.js';
import { estadioPorSede, rutaImagenEstadio } from '../datos/estadios.js';
import TarjetaJugable from '../juego/TarjetaJugable';
import { usePredicciones } from '../juego/usePredicciones';
import CuentaRegresiva from '../componentes/visual/CuentaRegresiva';
import CapaParticulas from '../componentes/visual/CapaParticulas';
import LlaveCompacta from '../componentes/LlaveCompacta';
import { CanalWhatsApp, PuenteMetodo } from '../componentes/Llamados';
import Reveal from '../movimiento/Reveal';
import { claveDiaLocal, fechaCompleta, horaLocal } from '../lib/zonaHoraria';

/**
 * Inicio editorial.
 *
 *   1. Hero full-bleed con foto del estadio inaugural + cuenta regresiva.
 *   2. Metodología (tres pasos, layout editorial).
 *   3. Mascotas: tres países, emblemas line-art propios + patrón cultural.
 *   4. Matchday: lista de próximos partidos.
 *   5. CTA final hacia el método.
 */
function Inicio() {
  // El hero apunta al PRÓXIMO partido (no al inaugural, ya jugado): el siguiente
  // con kickoff futuro; si el torneo terminó, el último del calendario.
  const proximo = useMemo(() => {
    const ahora = new Date().getTime();
    const futuros = PARTIDOS.filter((p) => new Date(p.fechaISO).getTime() > ahora);
    return futuros[0] ?? PARTIDOS[PARTIDOS.length - 1];
  }, []);
  const local = equipoPorId(proximo.equipoLocalId);
  const visitante = equipoPorId(proximo.equipoVisitanteId);
  const estadio = estadioPorSede(proximo.sede);

  // "Próximos partidos" acorde al día: desde hoy hacia adelante. Incluye los
  // de hoy ya jugados (que muestran su marcador y el sello IA). Si el torneo
  // ya terminó, cae a los últimos 6.
  const proximos = useMemo(() => {
    const hoy = claveDiaLocal(new Date().toISOString());
    const desdeHoy = PARTIDOS.filter((p) => claveDiaLocal(p.fechaISO) >= hoy);
    return (desdeHoy.length ? desdeHoy : PARTIDOS.slice(-6)).slice(0, 6);
  }, []);

  // Resultados ya jugados, para el sello IA ✓/✗ en los partidos finalizados.
  const [resultadosPorId, setResultadosPorId] = useState<Map<string, PartidoCalificado>>(
    () => new Map()
  );
  const consensos = usePredicciones();
  useEffect(() => {
    let cancelado = false;
    fetch('/api/historial')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { registros?: PartidoCalificado[] } | null) => {
        if (!cancelado && d?.registros) {
          setResultadosPorId(new Map(d.registros.map((r) => [r.partidoId, r])));
        }
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div>
      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="hero-grano relative min-h-[88vh] flex items-end overflow-hidden">
        {/* Foto de fondo con Ken Burns lento */}
        {estadio && (
          <img
            src={rutaImagenEstadio(estadio.slug)}
            alt={`${estadio.nombre}, ${estadio.ciudad}`}
            fetchPriority="high"
            decoding="async"
            className="hero-kenburns foto-tratada absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'grayscale(0.4) contrast(1.05) brightness(0.5)' }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,22,40,0.55) 0%, rgba(10,22,40,0.75) 55%, rgba(10,22,40,0.97) 100%)',
          }}
        />
        {/* Aliento de marca + partículas de luz */}
        <div className="hero-respira" />
        <CapaParticulas className="z-[1]" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pb-16 pt-28">
          <Reveal>
            <p className="kicker text-cyan">
              Mundial 2026 · Eliminatorias · Consenso de 3 IAs
            </p>
            <h1 className="mt-4 font-display font-bold text-tinta-titulo leading-[1.02] tracking-tight text-[2.75rem] sm:text-7xl max-w-[16ch]">
              El Mundial, leído por tres IAs.
            </h1>
            <p className="mt-6 font-display text-xl sm:text-2xl text-tinta-cuerpo leading-snug max-w-[46ch]">
              Claude, GPT y Gemini predicen cada cruce de la llave. Mira dónde
              coinciden, dónde chocan, y si aciertan.
            </p>
          </Reveal>

          {/* Cuenta regresiva al próximo partido */}
          <div className="mt-10 pt-8 border-t border-tinta-lineaFuerte/40 max-w-2xl">
            <p className="kicker">Faltan para el próximo partido</p>
            <div className="mt-4">
              <CuentaRegresiva
                fechaObjetivoISO={proximo.fechaISO}
                textoFinalizado="Hay partido en juego"
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-tinta-mute">
              <span className="text-tinta-cuerpo font-semibold">
                {local.banderaEmoji} {local.id}
              </span>
              <span>vs</span>
              <span className="text-tinta-cuerpo font-semibold">
                {visitante.id} {visitante.banderaEmoji}
              </span>
              <span className="text-tinta-linea">·</span>
              <span>{fechaCompleta(proximo.fechaISO)}</span>
              <span className="text-tinta-linea">·</span>
              <span>{horaLocal(proximo.fechaISO)}</span>
            </div>
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#llave"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-verde text-tinta-fondo font-semibold text-[15px] hover:bg-verde-hover transition-colors"
            >
              Ver la llave <span aria-hidden>↓</span>
            </a>
            <Link
              to="/calendario"
              className="inline-flex items-center px-6 py-3 rounded-md border border-tinta-lineaFuerte text-tinta-cuerpo font-medium text-[15px] hover:border-tinta-mute hover:text-tinta-titulo transition-colors"
            >
              Calendario
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LA LLAVE (protagonista) ────────────────────────────────── */}
      <section
        id="llave"
        className="scroll-mt-20 max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24"
      >
        <Reveal>
          <LlaveCompacta />
        </Reveal>
      </section>

      {/* ─── EL CALENDARIO (junto a la llave) ───────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        <div className="flex items-baseline justify-between border-b border-tinta-linea pb-4">
          <div>
            <p className="kicker">El calendario</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo">
              Próximos partidos
            </h2>
          </div>
          <Link to="/calendario" className="font-mono text-[13px] text-verde hover:text-verde-hover transition-colors whitespace-nowrap">
            Ver todo →
          </Link>
        </div>
        <div className="mt-4 divide-y divide-tinta-linea">
          {proximos.map((partido) => (
            <TarjetaJugable
              key={partido.id}
              partido={partido}
              mostrarFecha
              resultado={resultadosPorId.get(partido.id)}
              consenso={consensos.get(partido.id)}
            />
          ))}
        </div>

        {/* Captación: el fan que mira los próximos partidos → al canal */}
        <div className="mt-8">
          <CanalWhatsApp variante="banda" />
        </div>
      </section>

      {/* ─── METODOLOGÍA ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <Reveal>
          <p className="kicker">La metodología</p>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-tinta-titulo leading-[1.08] max-w-[20ch]">
            Dos capas. Tres IAs. Cero caja negra.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px bg-tinta-linea border border-tinta-linea rounded-lg overflow-hidden sm:grid-cols-3">
          <PasoMetodo
            numero="01"
            titulo="Modelo base"
            texto="Una probabilidad estadística transparente: rating Elo, ventaja de sede, forma y descanso. Cada número es auditable."
          />
          <PasoMetodo
            numero="02"
            titulo="Las tres IAs"
            texto="Claude, GPT y Gemini reciben el mismo prompt y la base. Cada una ajusta con contexto y explica su razonamiento."
          />
          <PasoMetodo
            numero="03"
            titulo="Síntesis honesta"
            texto="Si coinciden, es consenso. Si no, mostramos el desacuerdo. Y comparamos contra el mercado para detectar valor."
          />
        </div>
      </section>

      {/* ─── TRES PAÍSES / MASCOTAS ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <Reveal>
          <p className="kicker">Tres países · Tres mascotas · Un torneo</p>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-tinta-titulo leading-[1.08]">
            Maple, Zayu y Clutch.
          </h2>
          <p className="mt-3 font-display text-lg text-tinta-cuerpo max-w-[52ch] leading-snug">
            Por primera vez el Mundial se juega en tres países. Cada uno trae su
            mascota oficial — un alce, un jaguar y un águila.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          <TarjetaPais
            kicker="Mascota oficial · Canadá"
            nombre="Maple"
            descripcion="Un alce arquero, artista del estilo urbano. Representa a Canadá."
            sedes="Toronto · Vancouver"
            imagen="/mascotas/Maple.avif"
          />
          <TarjetaPais
            kicker="Mascota oficial · México"
            nombre="Zayu"
            descripcion="Un jaguar delantero, símbolo de fuerza y orgullo prehispánico."
            sedes="CDMX · Guadalajara · Monterrey"
            imagen="/mascotas/Zayu.avif"
          />
          <TarjetaPais
            kicker="Mascota oficial · EE. UU."
            nombre="Clutch"
            descripcion="Un águila mediocampista. Encarna liderazgo bajo presión."
            sedes="11 sedes, de Seattle a Miami"
            imagen="/mascotas/Clutch.avif"
          />
        </div>
        <p className="mt-4 font-mono text-[11px] text-tinta-mute">
          Mascotas oficiales © FIFA ·{' '}
          <Link to="/creditos" className="text-verde hover:text-verde-hover">
            créditos →
          </Link>
        </p>
      </section>

      {/* ─── CIERRE: puente al método (LMS) ────────────────────────── */}
      <section className="border-t border-tinta-linea bg-tinta-tarjeta">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <PuenteMetodo variante="banda" contenido="metodologia" gancho="metodo" />
        </div>
      </section>
    </div>
  );
}

function PasoMetodo({
  numero,
  titulo,
  texto,
}: {
  numero: string;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="bg-tinta-fondo p-7 sm:p-8">
      <span className="font-mono text-sm text-verde">{numero}</span>
      <h3 className="mt-3 font-display text-2xl font-semibold text-tinta-titulo">
        {titulo}
      </h3>
      <p className="mt-2 text-[15px] text-tinta-cuerpo leading-relaxed">{texto}</p>
    </div>
  );
}

function TarjetaPais({
  kicker,
  nombre,
  descripcion,
  sedes,
  imagen,
}: {
  kicker: string;
  nombre: string;
  descripcion: string;
  sedes: string;
  imagen: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-tinta-linea aspect-[3/4]">
      {/* Mascota oficial a sangre completa (trae su fondo de color FIFA) */}
      <img
        src={imagen}
        alt={`${nombre}, mascota oficial del Mundial 2026`}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-500 ease-editorial"
      />
      {/* Overlay degradado hacia el midnight para legibilidad del texto */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,22,40,0) 35%, rgba(10,22,40,0.85) 80%, rgba(10,22,40,0.97) 100%)',
        }}
      />
      {/* Texto editorial overlaid abajo */}
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="kicker text-tinta-titulo/80">{kicker}</p>
        <h3 className="mt-2 font-display text-4xl font-semibold text-tinta-titulo drop-shadow">
          {nombre}
        </h3>
        <p className="mt-2 font-display text-[16px] text-tinta-cuerpo leading-snug max-w-[34ch]">
          {descripcion}
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-tinta-cuerpo/70">
          {sedes}
        </p>
      </div>
    </article>
  );
}

export default Inicio;
