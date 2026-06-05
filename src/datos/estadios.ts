/**
 * Registro de estadios del Mundial 2026 con sus fotografías y atribuciones.
 *
 * Las fotos están descargadas de Wikimedia Commons a /public/estadios/{slug}.jpg
 * (versiones optimizadas a 1500px). CADA imagen lleva su licencia y atribución
 * exacta — es obligación legal (CC BY / CC BY-SA exigen crédito) y además es un
 * rasgo editorial: la página /creditos las indexa todas, al estilo NYT/The Athletic.
 *
 * El `sede` string debe COINCIDIR EXACTO con el campo `sede` de partidos.ts
 * para que el lookup funcione. Si cambias un nombre de sede allá, cámbialo aquí.
 */

export interface Estadio {
  /** Slug = nombre del archivo en /public/estadios/{slug}.jpg */
  slug: string;
  /** Nombre corto del estadio. */
  nombre: string;
  /** Ciudad. */
  ciudad: string;
  pais: 'México' | 'Estados Unidos' | 'Canadá';
  /** Capacidad aproximada (Mundial). */
  capacidad: number;
  /** Atribución legal completa (autor + licencia). */
  credito: {
    autor: string;
    licencia: string;
    /** URL a la página del archivo en Commons. */
    fuente: string;
  };
}

/**
 * Mapa: string de sede (como aparece en partidos.ts) → Estadio.
 */
export const ESTADIOS: Record<string, Estadio> = {
  'Estadio Azteca, CDMX': {
    slug: 'azteca',
    nombre: 'Estadio Azteca',
    ciudad: 'Ciudad de México',
    pais: 'México',
    capacidad: 83264,
    credito: {
      autor: 'ProtoplasmaKid',
      licencia: 'CC BY 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Vista_a%C3%A9rea_nocturna_del_Estadio_Azteca.jpg',
    },
  },
  'Estadio Akron, Guadalajara': {
    slug: 'akron',
    nombre: 'Estadio Akron',
    ciudad: 'Guadalajara',
    pais: 'México',
    capacidad: 48071,
    credito: {
      autor: 'Alejan98',
      licencia: 'CC0 1.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Estadio_Akron_02-07-2022_cabecera_sur_lado_derecho_(1).jpg',
    },
  },
  'Estadio BBVA, Monterrey': {
    slug: 'bbva',
    nombre: 'Estadio BBVA',
    ciudad: 'Monterrey',
    pais: 'México',
    capacidad: 53500,
    credito: {
      autor: 'Arne Müseler / arne-mueseler.com',
      licencia: 'CC BY-SA 3.0 DE',
      fuente: 'https://commons.wikimedia.org/wiki/File:Mexico_Guadalupe_Monterrey_Estadio_BBVA_Bancomer_fifa_world_cup_2026_1.JPG',
    },
  },
  'MetLife Stadium, Nueva York': {
    slug: 'metlife',
    nombre: 'MetLife Stadium',
    ciudad: 'Nueva York / Nueva Jersey',
    pais: 'Estados Unidos',
    capacidad: 82500,
    credito: {
      autor: 'Anthony Quintano',
      licencia: 'CC BY 2.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Metlife_stadium_(Aerial_view).jpg',
    },
  },
  'SoFi Stadium, Los Ángeles': {
    slug: 'sofi',
    nombre: 'SoFi Stadium',
    ciudad: 'Los Ángeles',
    pais: 'Estados Unidos',
    capacidad: 70240,
    credito: {
      autor: 'Benoit Prieur',
      licencia: 'CC0 1.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Aerial_view_of_SoFi_Stadium_(July_2022).jpg',
    },
  },
  'AT&T Stadium, Dallas': {
    slug: 'att',
    nombre: 'AT&T Stadium',
    ciudad: 'Dallas',
    pais: 'Estados Unidos',
    capacidad: 80000,
    credito: {
      autor: 'Scott Ellis (vsellis.com)',
      licencia: 'CC BY-SA 2.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Dallas-cowboys-stadium-at-night.jpg',
    },
  },
  'NRG Stadium, Houston': {
    slug: 'nrg',
    nombre: 'NRG Stadium',
    ciudad: 'Houston',
    pais: 'Estados Unidos',
    capacidad: 72220,
    credito: {
      autor: 'Michael Coppens',
      licencia: 'CC BY 2.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Nrgstadium.jpg',
    },
  },
  'Mercedes-Benz, Atlanta': {
    slug: 'mercedes',
    nombre: 'Mercedes-Benz Stadium',
    ciudad: 'Atlanta',
    pais: 'Estados Unidos',
    capacidad: 71000,
    credito: {
      autor: 'Droidman1231',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Mercedes-Benz_Stadium_Pedestrian_Bridge.jpg',
    },
  },
  'Gillette Stadium, Boston': {
    slug: 'gillette',
    nombre: 'Gillette Stadium',
    ciudad: 'Boston / Foxborough',
    pais: 'Estados Unidos',
    capacidad: 65878,
    credito: {
      autor: '4300streetcar',
      licencia: 'CC BY 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Gillette_Stadium_at_night_in_the_rain_November_2025.jpg',
    },
  },
  'Arrowhead, Kansas City': {
    slug: 'arrowhead',
    nombre: 'Arrowhead Stadium',
    ciudad: 'Kansas City',
    pais: 'Estados Unidos',
    capacidad: 76416,
    credito: {
      autor: 'Ichabod',
      licencia: 'CC BY-SA 3.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg',
    },
  },
  'Hard Rock Stadium, Miami': {
    slug: 'hardrock',
    nombre: 'Hard Rock Stadium',
    ciudad: 'Miami',
    pais: 'Estados Unidos',
    capacidad: 65326,
    credito: {
      autor: 'TheSoccerBoy',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Hard_Rock_Stadium_2017.jpg',
    },
  },
  'Lincoln Financial, Filadelfia': {
    slug: 'lincoln',
    nombre: 'Lincoln Financial Field',
    ciudad: 'Filadelfia',
    pais: 'Estados Unidos',
    capacidad: 69596,
    credito: {
      autor: 'Ron Reiring',
      licencia: 'CC BY 2.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Lincoln_Financial_Field_(Aerial_view).jpg',
    },
  },
  "Levi's Stadium, San Francisco": {
    slug: 'levis',
    nombre: "Levi's Stadium",
    ciudad: 'San Francisco / Santa Clara',
    pais: 'Estados Unidos',
    capacidad: 68500,
    credito: {
      autor: 'Gregory Varnum',
      licencia: 'CC BY-SA 4.0',
      fuente: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_California's_Great_Adventure_and_Levi's_Stadium_(4020).jpg",
    },
  },
  'Lumen Field, Seattle': {
    slug: 'lumen',
    nombre: 'Lumen Field',
    ciudad: 'Seattle',
    pais: 'Estados Unidos',
    capacidad: 68740,
    credito: {
      autor: 'SounderBruce',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Lumen_Field_north_side_at_dusk.jpg',
    },
  },
  'BMO Field, Toronto': {
    slug: 'bmo',
    nombre: 'BMO Field',
    ciudad: 'Toronto',
    pais: 'Canadá',
    capacidad: 45736,
    credito: {
      autor: 'Wladyslaw (Taxiarchos228)',
      licencia: 'CC BY-SA 3.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:Toronto_-_ON_-_BMO_Field.jpg',
    },
  },
  'BC Place, Vancouver': {
    slug: 'bcplace',
    nombre: 'BC Place',
    ciudad: 'Vancouver',
    pais: 'Canadá',
    capacidad: 54500,
    credito: {
      autor: 'DXR',
      licencia: 'CC BY-SA 4.0',
      fuente: 'https://commons.wikimedia.org/wiki/File:BC_Place,_Vancouver,_south_view_20240901_2.jpg',
    },
  },
};

/** Lista de estadios única (para la grilla de sedes en /torneo y /creditos). */
export const LISTA_ESTADIOS: Estadio[] = Object.values(ESTADIOS);

/**
 * Devuelve el estadio para una sede, o null si no está mapeada.
 * Robusto: si la sede no existe en el registro, la UI cae a un fondo sólido.
 */
export function estadioPorSede(sede: string): Estadio | null {
  return ESTADIOS[sede] ?? null;
}

/** Ruta pública de la imagen de un estadio. */
export function rutaImagenEstadio(slug: string): string {
  return `/estadios/${slug}.jpg`;
}
