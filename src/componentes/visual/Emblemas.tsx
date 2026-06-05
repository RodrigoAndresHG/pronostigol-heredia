/**
 * Emblemas line-art de los tres animales-mascota del Mundial 2026.
 *
 * IMPORTANTE: NO son las mascotas oficiales de FIFA (Maple/Zayu/Clutch están
 * protegidas como marca; usar su imagen es ilegal). Estos son emblemas
 * geométricos ORIGINALES — alce, jaguar y águila — en estilo line-art
 * heráldico, monocromos, stroke fino. Evocan al animal sin reproducir
 * ningún diseño protegido. Se referencian junto al nombre oficial sólo
 * como mención editorial-informativa.
 *
 * Estilo: viewBox 64, stroke 1.5, color heredado de `currentColor` (se
 * controla con la clase `text-*` del contenedor). Sin relleno.
 */

interface PropsEmblema {
  tamano?: number;
  className?: string;
}

/** Alce — Canadá. Cornamenta palmeada + perfil. */
export function EmblemaAlce({ tamano = 64, className = '' }: PropsEmblema) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Emblema de alce (Canadá)"
    >
      {/* Cornamenta izquierda */}
      <path d="M24 22 C18 18 14 19 11 14 M24 22 C17 21 13 23 9 20 M24 22 C19 25 15 27 12 26" />
      {/* Cornamenta derecha */}
      <path d="M40 22 C46 18 50 19 53 14 M40 22 C47 21 51 23 55 20 M40 22 C45 25 49 27 52 26" />
      {/* Orejas */}
      <path d="M24 23 C22 20 20 20 19 22" />
      <path d="M40 23 C42 20 44 20 45 22" />
      {/* Cabeza / hocico alargado */}
      <path d="M24 24 C24 30 26 36 28 42 C29 46 30 49 32 50 C34 49 35 46 36 42 C38 36 40 30 40 24" />
      {/* Ojos */}
      <circle cx="28" cy="30" r="1" fill="currentColor" stroke="none" />
      <circle cx="36" cy="30" r="1" fill="currentColor" stroke="none" />
      {/* Hocico */}
      <path d="M30 46 C31 47 33 47 34 46" />
    </svg>
  );
}

/** Jaguar — México. Cabeza felina + rosetas. */
export function EmblemaJaguar({ tamano = 64, className = '' }: PropsEmblema) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Emblema de jaguar (México)"
    >
      {/* Orejas */}
      <path d="M20 22 C18 16 20 14 24 17" />
      <path d="M44 22 C46 16 44 14 40 17" />
      {/* Contorno de la cabeza */}
      <path d="M22 20 C16 26 16 36 22 42 C26 46 30 48 32 48 C34 48 38 46 42 42 C48 36 48 26 42 20" />
      {/* Ojos felinos */}
      <path d="M25 30 C26 28 29 28 30 30" />
      <path d="M34 30 C35 28 38 28 39 30" />
      {/* Nariz + tabique */}
      <path d="M30 36 L32 38 L34 36 M32 38 L32 41" />
      {/* Bigotes */}
      <path d="M27 39 L21 38 M27 41 L22 42" />
      <path d="M37 39 L43 38 M37 41 L42 42" />
      {/* Rosetas (manchas) */}
      <circle cx="24" cy="25" r="1" fill="currentColor" stroke="none" />
      <circle cx="40" cy="25" r="1" fill="currentColor" stroke="none" />
      <circle cx="20" cy="34" r="1" fill="currentColor" stroke="none" />
      <circle cx="44" cy="34" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Águila — Estados Unidos. Cabeza en perfil + pico ganchudo. */
export function EmblemaAguila({ tamano = 64, className = '' }: PropsEmblema) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Emblema de águila (Estados Unidos)"
    >
      {/* Corona de la cabeza */}
      <path d="M22 24 C24 16 32 13 40 16" />
      {/* Nuca y cuello */}
      <path d="M22 24 C20 30 22 36 27 40 C30 42 34 43 38 42" />
      {/* Plumas del cuello (3 trazos) */}
      <path d="M24 32 C27 33 30 33 33 32" />
      <path d="M25 37 C28 39 32 39 36 38" />
      {/* Frente al pico */}
      <path d="M40 16 C45 18 47 22 46 26" />
      {/* Pico ganchudo */}
      <path d="M46 26 L54 27 C56 27 56 30 53 31 L46 30 Z" />
      {/* Línea del pico */}
      <path d="M46 28 L53 28.5" />
      {/* Ojo fiero */}
      <circle cx="42" cy="24" r="1.4" fill="currentColor" stroke="none" />
      <path d="M39 22 C40 21 42 21 43 22" />
    </svg>
  );
}

/**
 * Patrones culturales sutiles por país, como overlay de fondo (opacidad baja).
 * Se renderizan en SVG inline para escalar y permitir cambiar de color.
 *
 *   - México: greca escalonada de Mitla (zapoteca).
 *   - USA: sunburst Art Deco (Chrysler).
 *   - Canadá: ovoide formline (Haida) — sólo la geometría abstracta.
 */

export function PatronMexico({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Greca Mitla: escalones repetidos */}
      {[0, 24, 48, 72, 96].map((x) => (
        <path
          key={x}
          d={`M${x} 20 L${x} 12 L${x + 4} 12 L${x + 4} 6 L${x + 12} 6 L${x + 12} 12 L${x + 16} 12 L${x + 16} 20`}
        />
      ))}
    </svg>
  );
}

export function PatronUSA({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      {/* Sunburst Chrysler: rayos desde la base + arcos */}
      {Array.from({ length: 9 }).map((_, i) => {
        const ang = (Math.PI * (i + 1)) / 10;
        const x2 = 50 + Math.cos(ang) * 60;
        const y2 = 100 - Math.sin(ang) * 60;
        return <line key={i} x1="50" y1="100" x2={x2} y2={y2} />;
      })}
      {[20, 35, 50, 65].map((r) => (
        <path key={r} d={`M${50 - r} 100 A${r} ${r} 0 0 1 ${50 + r} 100`} />
      ))}
    </svg>
  );
}

export function PatronCanada({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 60"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {/* Ovoide Haida abstracto (sin figuras sagradas) */}
      <path d="M16 30 C16 16 28 12 40 12 C56 12 68 18 68 30 C68 42 56 48 40 48 C26 48 16 44 16 30 Z" />
      <path d="M28 26 C28 20 34 19 40 19 C48 19 52 22 52 27 C52 31 48 33 42 33 C34 33 28 31 28 26 Z" />
      <circle cx="40" cy="26" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
