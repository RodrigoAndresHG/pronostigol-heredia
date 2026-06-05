/**
 * SVG silhouette de un estadio — se usa como decoración en tarjetas
 * de partido y como elemento de fondo en el detalle. Cero descargas.
 *
 * Tres variantes según el contexto:
 *   - `mini`: para tarjetas de calendario (40px alto, super compacto).
 *   - `mediano`: para banners de partido (100px alto).
 *   - `gigante`: para el hero del detalle de partido (180px alto).
 */

interface PropsEstadio {
  ancho?: number;
  alto?: number;
  colorPrimario?: string;
  colorSecundario?: string;
  className?: string;
}

/**
 * Estadio genérico — silueta tipo "bowl" con tribunas, cancha y luces.
 */
export function Estadio({
  ancho = 200,
  alto = 100,
  colorPrimario = '#0D9488',
  colorSecundario = '#14B8A6',
  className = '',
}: PropsEstadio) {
  return (
    <svg
      width={ancho}
      height={alto}
      viewBox="0 0 200 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Postes de luces */}
      <g>
        <line x1="20" y1="65" x2="20" y2="15" stroke="#475569" strokeWidth="1.5" />
        <rect x="14" y="10" width="12" height="6" fill="#FCD34D" />
        <circle cx="20" cy="13" r="3" fill="#FFFFFF" opacity="0.8" />

        <line x1="180" y1="65" x2="180" y2="15" stroke="#475569" strokeWidth="1.5" />
        <rect x="174" y="10" width="12" height="6" fill="#FCD34D" />
        <circle cx="180" cy="13" r="3" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* Tribuna exterior */}
      <ellipse cx="100" cy="85" rx="95" ry="14" fill={colorPrimario} />

      {/* Tribuna interior */}
      <ellipse cx="100" cy="80" rx="85" ry="20" fill={colorSecundario} />

      {/* Cancha verde */}
      <ellipse cx="100" cy="82" rx="65" ry="11" fill="#16A34A" />

      {/* Líneas de cancha */}
      <ellipse cx="100" cy="82" rx="55" ry="8" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" />
      <line x1="100" y1="74" x2="100" y2="90" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" />
      <circle cx="100" cy="82" r="6" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" />

      {/* Sombra base */}
      <ellipse cx="100" cy="98" rx="98" ry="3" fill="#0F172A" opacity="0.15" />
    </svg>
  );
}

/**
 * Mini-estadio para tarjetas — sólo silueta minimal.
 */
export function EstadioMini({
  ancho = 60,
  alto = 30,
  className = '',
}: PropsEstadio) {
  return (
    <svg
      width={ancho}
      height={alto}
      viewBox="0 0 60 30"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="30" cy="22" rx="28" ry="5" fill="#0D9488" opacity="0.4" />
      <ellipse cx="30" cy="20" rx="24" ry="6" fill="#14B8A6" opacity="0.6" />
      <ellipse cx="30" cy="21" rx="18" ry="3.5" fill="#16A34A" />
      {/* Mini postes */}
      <line x1="5" y1="18" x2="5" y2="6" stroke="#94A3B8" strokeWidth="0.8" />
      <circle cx="5" cy="5" r="1.5" fill="#FCD34D" />
      <line x1="55" y1="18" x2="55" y2="6" stroke="#94A3B8" strokeWidth="0.8" />
      <circle cx="55" cy="5" r="1.5" fill="#FCD34D" />
    </svg>
  );
}

/**
 * Banner panorámico de estadio — para hero del detalle de partido.
 */
export function EstadioPanoramico({
  ancho = 400,
  alto = 160,
  paisAnfitrion,
  className = '',
}: PropsEstadio & { paisAnfitrion?: 'México' | 'Estados Unidos' | 'Canadá' }) {
  // Color del cielo según país: México=cálido, USA=fresco, Canadá=más frío
  const cielos = {
    México: ['#FED7AA', '#FB923C'],
    'Estados Unidos': ['#BFDBFE', '#3B82F6'],
    Canadá: ['#DBEAFE', '#60A5FA'],
  };
  const cielo = paisAnfitrion
    ? cielos[paisAnfitrion]
    : ['#F1F5F9', '#94A3B8'];

  return (
    <svg
      width={ancho}
      height={alto}
      viewBox="0 0 400 160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cieloEstadio" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={cielo[0]} />
          <stop offset="100%" stopColor={cielo[1]} />
        </linearGradient>
        <linearGradient id="tribunaEstadio" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>

      {/* Cielo */}
      <rect width="400" height="100" fill="url(#cieloEstadio)" />

      {/* Postes de luces de fondo */}
      <g opacity="0.9">
        <rect x="40" y="20" width="3" height="50" fill="#1E293B" />
        <rect x="34" y="18" width="15" height="6" fill="#FCD34D" />
        <circle cx="42" cy="21" r="2.5" fill="#FFFFFF" opacity="0.8" />

        <rect x="357" y="20" width="3" height="50" fill="#1E293B" />
        <rect x="351" y="18" width="15" height="6" fill="#FCD34D" />
        <circle cx="358" cy="21" r="2.5" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* Tribuna trasera */}
      <ellipse cx="200" cy="110" rx="180" ry="35" fill="url(#tribunaEstadio)" />

      {/* Tribuna delantera */}
      <ellipse cx="200" cy="125" rx="195" ry="40" fill="#0F766E" />

      {/* Cancha */}
      <ellipse cx="200" cy="135" rx="140" ry="22" fill="#16A34A" />

      {/* Líneas de cancha */}
      <ellipse
        cx="200"
        cy="135"
        rx="125"
        ry="16"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.7"
      />
      <line
        x1="200"
        y1="118"
        x2="200"
        y2="152"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.7"
      />
      <circle cx="200" cy="135" r="13" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
      <circle cx="200" cy="135" r="2" fill="#FFFFFF" opacity="0.7" />

      {/* Sombra base */}
      <ellipse cx="200" cy="158" rx="200" ry="4" fill="#0F172A" opacity="0.3" />
    </svg>
  );
}
