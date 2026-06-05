/**
 * Las 3 mascotas del Mundial 2026 — Maple, Zayu y Clutch.
 *
 * Estas son ilustraciones ORIGINALES estilizadas, inspiradas en (pero
 * deliberadamente distintas de) las mascotas oficiales de FIFA. Sirven
 * como elemento de marca para reforzar la identidad del torneo en la app.
 *
 * Cada componente es un SVG puro inline — cero descargas, escala a
 * cualquier tamaño, y respeta la paleta de marca + Mundial.
 */

interface PropsMascota {
  tamano?: number;
  className?: string;
}

/** Maple — alce canadiense. Estilo plano + geométrico. */
export function Maple({ tamano = 160, className = '' }: PropsMascota) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Maple, mascota canadiense del Mundial 2026"
    >
      {/* Fondo circular */}
      <defs>
        <linearGradient id="bgMaple" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEE2E2" />
          <stop offset="100%" stopColor="#FECACA" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#bgMaple)" />

      {/* Astas geométricas */}
      <g fill="#78350F">
        <path d="M55 70 L42 38 L30 45 L38 60 L25 55 L34 75 Z" />
        <path d="M145 70 L158 38 L170 45 L162 60 L175 55 L166 75 Z" />
      </g>

      {/* Cabeza */}
      <ellipse cx="100" cy="118" rx="58" ry="65" fill="#92400E" />

      {/* Orejas */}
      <ellipse
        cx="58"
        cy="85"
        rx="16"
        ry="22"
        fill="#92400E"
        transform="rotate(-20 58 85)"
      />
      <ellipse
        cx="142"
        cy="85"
        rx="16"
        ry="22"
        fill="#92400E"
        transform="rotate(20 142 85)"
      />
      <ellipse
        cx="58"
        cy="85"
        rx="9"
        ry="14"
        fill="#FCA5A5"
        transform="rotate(-20 58 85)"
      />
      <ellipse
        cx="142"
        cy="85"
        rx="9"
        ry="14"
        fill="#FCA5A5"
        transform="rotate(20 142 85)"
      />

      {/* Hocico */}
      <ellipse cx="100" cy="148" rx="38" ry="32" fill="#B45309" />

      {/* Ojos */}
      <circle cx="78" cy="110" r="9" fill="#FFFFFF" />
      <circle cx="122" cy="110" r="9" fill="#FFFFFF" />
      <circle cx="78" cy="112" r="5" fill="#1F2937" />
      <circle cx="122" cy="112" r="5" fill="#1F2937" />
      <circle cx="80" cy="110" r="2" fill="#FFFFFF" />
      <circle cx="124" cy="110" r="2" fill="#FFFFFF" />

      {/* Nariz */}
      <ellipse cx="100" cy="142" rx="11" ry="8" fill="#1F2937" />

      {/* Boca */}
      <path
        d="M82 162 Q100 170 118 162"
        stroke="#1F2937"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Hoja de maple decorativa */}
      <g transform="translate(168 158) scale(0.7)">
        <path
          d="M0 -16 L4 -8 L12 -10 L8 -2 L18 0 L8 4 L12 12 L4 8 L0 18 L-4 8 L-12 12 L-8 4 L-18 0 L-8 -2 L-12 -10 L-4 -8 Z"
          fill="#DC2626"
        />
      </g>
    </svg>
  );
}

/** Zayu — jaguar mexicano. Estilo plano + motivos geométricos. */
export function Zayu({ tamano = 160, className = '' }: PropsMascota) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Zayu, mascota mexicana del Mundial 2026"
    >
      <defs>
        <linearGradient id="bgZayu" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#bgZayu)" />

      {/* Orejas con marcas mayas */}
      <path d="M50 60 L65 35 L80 60 Z" fill="#F59E0B" />
      <path d="M150 60 L135 35 L120 60 Z" fill="#F59E0B" />
      <path d="M55 60 L65 45 L75 60 Z" fill="#1F2937" />
      <path d="M145 60 L135 45 L125 60 Z" fill="#1F2937" />

      {/* Cabeza */}
      <ellipse cx="100" cy="115" rx="60" ry="60" fill="#F59E0B" />

      {/* Manchas estilizadas (motivos mayas) */}
      <g fill="#92400E" opacity="0.85">
        <circle cx="65" cy="100" r="6" />
        <circle cx="75" cy="88" r="4" />
        <circle cx="135" cy="100" r="6" />
        <circle cx="125" cy="88" r="4" />
        <circle cx="58" cy="130" r="5" />
        <circle cx="142" cy="130" r="5" />
        <circle cx="100" cy="78" r="4" />
      </g>

      {/* Patrón maya geométrico en la frente */}
      <g fill="#1F2937">
        <rect x="86" y="90" width="3" height="8" />
        <rect x="92" y="92" width="3" height="6" />
        <rect x="98" y="90" width="3" height="8" />
        <rect x="104" y="92" width="3" height="6" />
        <rect x="110" y="90" width="3" height="8" />
      </g>

      {/* Hocico */}
      <ellipse cx="100" cy="142" rx="35" ry="28" fill="#FBBF24" />

      {/* Ojos amarillos felinos */}
      <ellipse cx="80" cy="112" rx="10" ry="11" fill="#FFFFFF" />
      <ellipse cx="120" cy="112" rx="10" ry="11" fill="#FFFFFF" />
      <ellipse cx="80" cy="113" rx="5" ry="9" fill="#16A34A" />
      <ellipse cx="120" cy="113" rx="5" ry="9" fill="#16A34A" />
      <ellipse cx="80" cy="113" rx="1.5" ry="7" fill="#1F2937" />
      <ellipse cx="120" cy="113" rx="1.5" ry="7" fill="#1F2937" />
      <circle cx="82" cy="110" r="1.5" fill="#FFFFFF" />
      <circle cx="122" cy="110" r="1.5" fill="#FFFFFF" />

      {/* Nariz */}
      <path d="M93 138 L107 138 L100 148 Z" fill="#1F2937" />

      {/* Boca felina */}
      <path
        d="M100 148 L100 158"
        stroke="#1F2937"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M100 158 Q88 162 80 158"
        stroke="#1F2937"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M100 158 Q112 162 120 158"
        stroke="#1F2937"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Colmillos */}
      <path d="M88 160 L86 168 L91 165 Z" fill="#FFFFFF" />
      <path d="M112 160 L114 168 L109 165 Z" fill="#FFFFFF" />
    </svg>
  );
}

/** Clutch — águila estadounidense. Estilo plano + plumas geométricas. */
export function Clutch({ tamano = 160, className = '' }: PropsMascota) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Clutch, mascota estadounidense del Mundial 2026"
    >
      <defs>
        <linearGradient id="bgClutch" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#BFDBFE" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#bgClutch)" />

      {/* Cabeza blanca del águila calva */}
      <ellipse cx="100" cy="105" rx="60" ry="58" fill="#F8FAFC" />

      {/* Plumas de la corona */}
      <g fill="#F8FAFC">
        <path d="M70 50 Q60 35 75 30 L80 55 Z" />
        <path d="M85 42 Q80 28 95 25 L98 50 Z" />
        <path d="M115 42 Q120 28 105 25 L102 50 Z" />
        <path d="M130 50 Q140 35 125 30 L120 55 Z" />
      </g>

      {/* Plumas laterales con sombra */}
      <g fill="#E2E8F0">
        <ellipse cx="50" cy="105" rx="12" ry="35" transform="rotate(-15 50 105)" />
        <ellipse cx="150" cy="105" rx="12" ry="35" transform="rotate(15 150 105)" />
      </g>

      {/* Cuerpo café (parte inferior) */}
      <path
        d="M55 145 Q100 175 145 145 Q145 165 100 178 Q55 165 55 145 Z"
        fill="#78350F"
      />

      {/* Plumas del pecho */}
      <g fill="#92400E" opacity="0.8">
        <path d="M80 150 L85 165 L75 160 Z" />
        <path d="M95 150 L100 168 L90 162 Z" />
        <path d="M105 150 L110 168 L100 162 Z" />
        <path d="M120 150 L125 165 L115 160 Z" />
      </g>

      {/* Pico amarillo */}
      <path
        d="M85 122 L100 145 L115 122 Q100 130 85 122 Z"
        fill="#F59E0B"
      />
      <path
        d="M85 122 L100 145 L115 122 L100 125 Z"
        fill="#D97706"
      />

      {/* Ojos fieros */}
      <circle cx="78" cy="105" r="10" fill="#FFFFFF" />
      <circle cx="122" cy="105" r="10" fill="#FFFFFF" />
      <circle cx="78" cy="106" r="6" fill="#F59E0B" />
      <circle cx="122" cy="106" r="6" fill="#F59E0B" />
      <circle cx="78" cy="106" r="3" fill="#1F2937" />
      <circle cx="122" cy="106" r="3" fill="#1F2937" />
      <circle cx="80" cy="104" r="1.5" fill="#FFFFFF" />
      <circle cx="124" cy="104" r="1.5" fill="#FFFFFF" />

      {/* Ceja fiera */}
      <path
        d="M68 95 L88 100"
        stroke="#1F2937"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M132 95 L112 100"
        stroke="#1F2937"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Estrella azul (acento) */}
      <g transform="translate(160 50) scale(0.9)">
        <path
          d="M0 -10 L3 -3 L10 -3 L4 2 L7 10 L0 5 L-7 10 L-4 2 L-10 -3 L-3 -3 Z"
          fill="#2563EB"
        />
      </g>
    </svg>
  );
}

/** Pelota de fútbol estilizada — para decoración. */
export function Pelota({ tamano = 60, className = '' }: PropsMascota) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="30" cy="30" r="28" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2" />
      <polygon points="30,12 38,18 35,28 25,28 22,18" fill="#1F2937" />
      <polygon points="14,25 22,18 25,28 18,35 10,32" fill="#1F2937" />
      <polygon points="46,25 38,18 35,28 42,35 50,32" fill="#1F2937" />
    </svg>
  );
}

/**
 * Tarjeta de mascota completa: la ilustración + nombre + país anfitrión.
 */
export function TarjetaMascota({
  mascota,
  nombre,
  pais,
  banderaEmoji,
  className = '',
}: {
  mascota: 'maple' | 'zayu' | 'clutch';
  nombre: string;
  pais: string;
  banderaEmoji: string;
  className?: string;
}) {
  const Componente =
    mascota === 'maple' ? Maple : mascota === 'zayu' ? Zayu : Clutch;
  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-marca-grisLinea hover:shadow-lg transition-all ${className}`}
    >
      <Componente tamano={140} className="animate-flotar" />
      <p className="text-2xl">{banderaEmoji}</p>
      <p className="font-display font-bold text-xl text-marca-tinta">
        {nombre}
      </p>
      <p className="text-xs uppercase tracking-wider text-marca-grisTexto">
        {pais}
      </p>
    </div>
  );
}
