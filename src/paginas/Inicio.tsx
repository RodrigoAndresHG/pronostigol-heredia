import { Link } from 'react-router-dom';
import { PARTIDOS } from '../datos/partidos.ts';
import { equipoPorId } from '../datos/equipos.ts';
import { estadioPorSede, rutaImagenEstadio } from '../datos/estadios.ts';
import TarjetaPartido from '../componentes/TarjetaPartido';
import CuentaRegresiva from '../componentes/visual/CuentaRegresiva';
import {
  EmblemaAlce,
  EmblemaJaguar,
  EmblemaAguila,
  PatronMexico,
  PatronUSA,
  PatronCanada,
} from '../componentes/visual/Emblemas';
import { fechaCompleta, horaLocal } from '../lib/zonaHoraria';

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
  const inaugural = PARTIDOS[0];
  const local = equipoPorId(inaugural.equipoLocalId);
  const visitante = equipoPorId(inaugural.equipoVisitanteId);
  const estadio = estadioPorSede(inaugural.sede);
  const proximos = PARTIDOS.slice(0, 6);

  return (
    <div>
      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        {/* Foto de fondo */}
        {estadio && (
          <img
            src={rutaImagenEstadio(estadio.slug)}
            alt={`${estadio.nombre}, ${estadio.ciudad}`}
            className="foto-tratada absolute inset-0 w-full h-full object-cover"
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

        <div className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 pb-16 pt-28">
          <p className="kicker text-cyan">
            Mundial 2026 · 11 jun — 19 jul · Consenso de 3 IAs
          </p>
          <h1 className="mt-4 font-display font-bold text-tinta-titulo leading-[1.02] tracking-tight text-[2.75rem] sm:text-7xl max-w-[16ch]">
            Predicciones que tres modelos firman juntos.
          </h1>
          <p className="mt-6 font-display text-xl sm:text-2xl text-tinta-cuerpo leading-snug max-w-[46ch]">
            Claude, GPT y Gemini analizan cada partido. Mostramos dónde
            coinciden, dónde no, y cuándo el mercado podría equivocarse.
          </p>

          {/* Cuenta regresiva al inaugural */}
          <div className="mt-10 pt-8 border-t border-tinta-lineaFuerte/40 max-w-2xl">
            <p className="kicker">Faltan para el partido inaugural</p>
            <div className="mt-4">
              <CuentaRegresiva
                fechaObjetivoISO={inaugural.fechaISO}
                textoFinalizado="El Mundial ya empezó"
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-tinta-mute">
              <span className="text-tinta-cuerpo font-semibold">{local.id}</span>
              <span>vs</span>
              <span className="text-tinta-cuerpo font-semibold">{visitante.id}</span>
              <span className="text-tinta-linea">·</span>
              <span>{fechaCompleta(inaugural.fechaISO)}</span>
              <span className="text-tinta-linea">·</span>
              <span>{horaLocal(inaugural.fechaISO)}</span>
            </div>
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/calendario"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-verde text-tinta-fondo font-semibold text-[15px] hover:bg-verde-hover transition-colors"
            >
              Ver calendario <span aria-hidden>→</span>
            </Link>
            <Link
              to="/torneo"
              className="inline-flex items-center px-6 py-3 rounded-md border border-tinta-lineaFuerte text-tinta-cuerpo font-medium text-[15px] hover:border-tinta-mute hover:text-tinta-titulo transition-colors"
            >
              Conocer el torneo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── METODOLOGÍA ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <p className="kicker">La metodología</p>
        <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-tinta-titulo leading-[1.08] max-w-[20ch]">
          Dos capas. Tres IAs. Cero caja negra.
        </h2>

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
        <p className="kicker">Tres países · Tres mascotas · Un torneo</p>
        <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-tinta-titulo leading-[1.08]">
          Maple, Zayu y Clutch.
        </h2>
        <p className="mt-3 font-display text-lg text-tinta-cuerpo max-w-[52ch] leading-snug">
          Por primera vez el Mundial se juega en tres países. Cada uno trae su
          mascota oficial — un alce, un jaguar y un águila.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          <TarjetaPais
            kicker="Mascota oficial · Canadá"
            nombre="Maple"
            descripcion="Un alce arquero, artista del estilo urbano. Representa a Canadá."
            sedes="Toronto · Vancouver"
            emblema={<EmblemaAlce tamano={72} className="text-pais-canada" />}
            patron={<PatronCanada className="w-32 h-24 text-pais-canada" />}
          />
          <TarjetaPais
            kicker="Mascota oficial · México"
            nombre="Zayu"
            descripcion="Un jaguar delantero, símbolo de fuerza y orgullo prehispánico."
            sedes="CDMX · Guadalajara · Monterrey"
            emblema={<EmblemaJaguar tamano={72} className="text-pais-mexico" />}
            patron={<PatronMexico className="w-40 h-8 text-pais-mexico" />}
          />
          <TarjetaPais
            kicker="Mascota oficial · EE. UU."
            nombre="Clutch"
            descripcion="Un águila mediocampista. Encarna liderazgo bajo presión."
            sedes="11 sedes, de Seattle a Miami"
            emblema={<EmblemaAguila tamano={72} className="text-pais-usa" />}
            patron={<PatronUSA className="w-28 h-28 text-pais-usa" />}
          />
        </div>
      </section>

      {/* ─── MATCHDAY ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="flex items-baseline justify-between border-b border-tinta-linea pb-4">
          <div>
            <p className="kicker">Matchday</p>
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
            <TarjetaPartido key={partido.id} partido={partido} mostrarFecha />
          ))}
        </div>
      </section>

      {/* ─── CTA FINAL ─────────────────────────────────────────────── */}
      <section className="border-t border-tinta-linea bg-tinta-tarjeta">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <p className="kicker">La promesa</p>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-tinta-titulo leading-[1.08] max-w-[18ch]">
            Tres IAs. Un consenso. Cero adivinanzas.
          </h2>
          <p className="mt-4 max-w-lectura text-[17px] text-tinta-cuerpo leading-relaxed">
            No publicamos un generador automático que cualquiera dispara.
            Publicamos predicciones razonadas, con timestamp, antes del partido —
            y después mostramos los aciertos y los fallos sin maquillaje.
          </p>
          <Link
            to="/historial"
            className="inline-flex items-center gap-2 mt-7 px-6 py-3 rounded-md bg-verde text-tinta-fondo font-semibold text-[15px] hover:bg-verde-hover transition-colors"
          >
            Ver el historial <span aria-hidden>→</span>
          </Link>
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
  emblema,
  patron,
}: {
  kicker: string;
  nombre: string;
  descripcion: string;
  sedes: string;
  emblema: React.ReactNode;
  patron: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-tinta-linea bg-tinta-tarjeta p-7 hover:border-tinta-lineaFuerte transition-colors duration-200 ease-editorial">
      {/* Patrón cultural sutil al fondo */}
      <div className="absolute bottom-3 right-3 opacity-[0.07] pointer-events-none">
        {patron}
      </div>
      <div className="relative">
        <p className="kicker">{kicker}</p>
        <div className="mt-5">{emblema}</div>
        <h3 className="mt-5 font-display text-4xl font-semibold text-tinta-titulo">
          {nombre}
        </h3>
        <p className="mt-2 font-display text-[17px] text-tinta-cuerpo leading-snug max-w-[34ch]">
          {descripcion}
        </p>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-wide text-tinta-mute">
          {sedes}
        </p>
      </div>
    </div>
  );
}

export default Inicio;
