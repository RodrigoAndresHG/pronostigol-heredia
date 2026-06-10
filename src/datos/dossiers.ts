import type { DossierEquipo, HechosPartido, Partido } from '../tipos/index.js';

/**
 * Dossier de hechos verificados por equipo — la "Capa 1.5" que ancla a
 * las 3 IAs en la realidad actual y mata las alucinaciones.
 *
 * Por qué existe:
 *   El prompt invitaba a las IAs a ajustar por "forma reciente, lesiones,
 *   narrativa" pero NO les daba esos datos. Cada IA los rellenaba desde su
 *   memoria de entrenamiento (con fecha de corte) → datos viejos. Evidencia
 *   real: Claude escribió "bajo Sánchez Bas" para Ecuador, cuyo DT actual
 *   es Sebastián Beccacece. Aquí entregamos los hechos como ÚNICA fuente de
 *   verdad permitida, y el prompt prohíbe inventar fuera de ellos.
 *
 * Verificado con fuentes web recientes (2025-2026) por un panel de agentes,
 * no de memoria. Los 48 quedaron con confianza alta. Mantenerlo es
 * responsabilidad editorial del dueño: un dato malo aquí es peor que ninguno.
 */

/** Fecha del dataset. Se muestra al usuario junto a los hechos. */
export const CAPTURADO_EL = '2026-06-10';

/**
 * Hechos por código ISO3 de equipo. Si un equipo no está aquí, el prompt
 * cae a la regla "sin hechos verificados, no inventes" — nunca alucina.
 */
export const DOSSIERS: Record<string, DossierEquipo> = {
  // ── Grupo A ──
  MEX: {
    dt: "Javier Aguirre",
    dtDesde: "ago 2024",
    estrella: "Santiago Giménez",
    formaReciente: "Clasificó automáticamente como país anfitrión; cierra preparación con balance positivo (14 victorias en 26 partidos bajo Aguirre) de cara al torneo.",
    notaTorneo: "Triple anfitrión que abre el Mundial el 11 de junio en el Estadio Azteca ante Sudáfrica, en la que será la última etapa de Aguirre antes de ceder el puesto a Rafa Márquez.",
    confianza: "alta",
  },
  RSA: {
    dt: "Hugo Broos",
    dtDesde: "may 2021",
    estrella: "Ronwen Williams",
    formaReciente: "Clasificó como líder de su grupo CAF el 14 de octubre de 2025, pese a una deducción de puntos por alinear a un jugador inelegible (Mokoena) que la había hecho ceder temporalmente el liderato.",
    notaTorneo: "Bafana Bafana regresa a un Mundial tras 16 años (su última cita fue como anfitrión en 2010) y será el rival inaugural de México; Broos anunció que se retira tras el torneo.",
    confianza: "alta",
  },
  KOR: {
    dt: "Hong Myung-bo",
    dtDesde: "jul 2024",
    estrella: "Son Heung-min",
    formaReciente: "Clasificó invicto en la tercera ronda asiática (AFC) con 6 victorias y 4 empates, asegurando su undécima participación mundialista consecutiva.",
    notaTorneo: "Corea disputa su 11.º Mundial seguido con Son Heung-min (hoy en LAFC) como capitán y figura en lo que sería su cuarta cita mundialista; Hong, que ya dirigió en 2014, busca redimirse.",
    confianza: "alta",
  },
  CZE: {
    dt: "Miroslav Koubek",
    dtDesde: "dic 2025",
    estrella: "Patrik Schick",
    formaReciente: "Clasificó por el repechaje europeo en marzo de 2026, ganando por penales a Irlanda (2-2, 4-3) y a Dinamarca (2-2, 3-1) tras quedar segunda en su grupo de clasificación.",
    notaTorneo: "Chequia vuelve a un Mundial tras 20 años (último: 2006) de la mano de Koubek, de 74 años —el DT más veterano del torneo—, que asumió en diciembre de 2025 reemplazando al despedido Ivan Hašek.",
    confianza: "alta",
  },
  // ── Grupo B ──
  CAN: {
    dt: "Jesse Marsch",
    dtDesde: "may 2024",
    estrella: "Alphonso Davies",
    formaReciente: "Clasificó automáticamente como país coanfitrión del Mundial 2026 junto a EE. UU. y México; llega tras buenos resultados en amistosos y Copa América 2024.",
    notaTorneo: "Coanfitrión que abre el grupo ante Bosnia el 12 de junio en Toronto, con Marsch buscando consolidar la mejor generación de su historia.",
    confianza: "alta",
  },
  BIH: {
    dt: "Sergej Barbarez",
    dtDesde: "abr 2024",
    estrella: "Edin Dzeko",
    formaReciente: "Clasificó vía repechaje europeo: venció a Gales 4-2 y a Italia 4-1 en penales (marzo 2026), tras una de sus mejores campañas de eliminatoria.",
    notaTorneo: "Regreso a un Mundial tras 12 años (primero desde 2014), liderado por el capitán y leyenda Edin Dzeko y la sorpresa Barbarez.",
    confianza: "alta",
  },
  QAT: {
    dt: "Julen Lopetegui",
    dtDesde: "may 2025",
    estrella: "Akram Afif",
    formaReciente: "Clasificó en la cuarta ronda asiática (AFC): venció 2-1 a EAU el 14 de octubre de 2025 para asegurar su segunda presencia mundialista.",
    notaTorneo: "Bicampeón de la Copa Asiática (2019 y 2024) que llega de la mano del español Lopetegui buscando borrar el flojo Mundial 2022 como anfitrión.",
    confianza: "alta",
  },
  SUI: {
    dt: "Murat Yakin",
    dtDesde: "ago 2021",
    estrella: "Granit Xhaka",
    formaReciente: "Clasificó de forma directa como primero del Grupo B de la UEFA, con cuatro victorias y dos empates, por delante de Kosovo, Eslovenia y Suecia.",
    notaTorneo: "Selección sólida y experimentada liderada por el capitán Granit Xhaka (su cuarto Mundial), aspirando a superar por fin la barrera de cuartos de final.",
    confianza: "alta",
  },
  // ── Grupo C ──
  BRA: {
    dt: "Carlo Ancelotti",
    dtDesde: "may 2025",
    estrella: "Vinícius Júnior",
    formaReciente: "Clasificó 5º en la eliminatoria CONMEBOL con 28 puntos (8 victorias, 4 empates, 6 derrotas en 18 partidos), una campaña irregular para sus estándares.",
    notaTorneo: "Pentacampeón en busca de su sexta estrella, con el italiano Ancelotti como primer DT extranjero de su historia y el regreso de Neymar a los 34 años.",
    confianza: "alta",
  },
  MAR: {
    dt: "Mohamed Ouahbi",
    dtDesde: "mar 2026",
    estrella: "Achraf Hakimi",
    formaReciente: "Primer país africano en clasificar al Mundial 2026, con una racha de 19 victorias consecutivas entre 2024 y 2025; campeón de la Copa Africana 2025 (título otorgado 3-0 por forfait tras la apelación).",
    notaTorneo: "Semifinalista histórico de Qatar 2022 que llega con DT nuevo: Walid Regragui renunció en marzo 2026 y lo reemplazó Ouahbi (campeón del Mundial Sub-20) meses antes del torneo.",
    confianza: "alta",
  },
  HAI: {
    dt: "Sébastien Migné",
    dtDesde: "jun 2024",
    estrella: "Duckens Nazon",
    formaReciente: "Terminó primero en su grupo de la tercera ronda de la eliminatoria CONCACAF para sellar la clasificación directa; Nazon fue el máximo goleador de esa fase (6 goles).",
    notaTorneo: "Debutante del ciclo: regresa al Mundial por primera vez desde 1974 (52 años de sequía), con plantel mayoritariamente de la diáspora y el francés Migné al mando.",
    confianza: "alta",
  },
  SCO: {
    dt: "Steve Clarke",
    dtDesde: "may 2019",
    estrella: "Scott McTominay",
    formaReciente: "Clasificó 2do de grupo con un 4-2 sobre Dinamarca el 18-nov-2025; primer Mundial desde 1998.",
    notaTorneo: "Vuelve a un Mundial tras 28 años; cae en el Grupo C con Brasil, Marruecos y Haití.",
    confianza: "alta",
  },
  // ── Grupo D ──
  USA: {
    dt: "Mauricio Pochettino",
    dtDesde: "sep 2024",
    estrella: "Christian Pulisic",
    formaReciente: "Clasificó automáticamente como país anfitrión; preparación 2025-2026 con amistosos, sin ruta de eliminatorias.",
    notaTorneo: "Anfitrión del Mundial por primera vez desde 1994, con Pochettino afrontando su primer Mundial como entrenador.",
    confianza: "alta",
  },
  PAR: {
    dt: "Gustavo Alfaro",
    dtDesde: "ago 2024",
    estrella: "Gustavo Gómez",
    formaReciente: "Clasificó por las Eliminatorias Sudamericanas tras una racha invicta de nueve partidos con Alfaro (incluyó triunfos sobre Brasil, Argentina y Uruguay); selló el cupo con empate ante Ecuador.",
    notaTorneo: "Vuelve al Mundial tras 16 años de ausencia (su última participación fue Sudáfrica 2010).",
    confianza: "alta",
  },
  AUS: {
    dt: "Tony Popovic",
    dtDesde: "sep 2024",
    estrella: "Jackson Irvine",
    formaReciente: "Clasificó de forma directa (sexta participación consecutiva) ganando sus dos últimos partidos en junio 2025: 1-0 a Japón y 2-1 a Arabia Saudita.",
    notaTorneo: "Popovic, miembro de la 'Generación Dorada' de 2006, llega con la meta declarada de alcanzar por primera vez los cuartos de final.",
    confianza: "alta",
  },
  TUR: {
    dt: "Vincenzo Montella",
    dtDesde: "sep 2023",
    estrella: "Arda Güler",
    formaReciente: "Terminó segundo en su grupo de clasificación europea (detrás de España) y avanzó por repechaje venciendo 1-0 a Rumania y 1-0 a Kosovo en marzo 2026.",
    notaTorneo: "Regresa a un Mundial tras 24 años de ausencia (su última cita fue Corea-Japón 2002, donde fue tercera).",
    confianza: "alta",
  },
  // ── Grupo E ──
  GER: {
    dt: "Julian Nagelsmann",
    dtDesde: "sep 2023",
    estrella: "Florian Wirtz",
    formaReciente: "Clasificó como primero del Grupo A de la eliminatoria UEFA: perdió el debut 0-2 ante Eslovaquia pero ganó los cinco partidos siguientes y selló el boleto con un 6-0 a Eslovaquia el 17 de noviembre de 2025.",
    notaTorneo: "Gigante herido tras los fracasos de Rusia 2018 y Qatar 2022, apuesta por un equipo joven y ofensivo con Nagelsmann, el DT más joven del Mundial (38 años).",
    confianza: "alta",
  },
  CUW: {
    dt: "Dick Advocaat",
    dtDesde: "may 2026 (segunda etapa; primera etapa hasta feb 2026)",
    estrella: "Leandro Bacuna",
    formaReciente: "Clasificó por primera vez en su historia como líder del Grupo B de la tercera fase de Concacaf, sellando el boleto con un empate 0-0 ante Jamaica de visitante el 18 de noviembre de 2025.",
    notaTorneo: "El país menos poblado en llegar a un Mundial; vivió un drama dirigencial cuando los jugadores y el patrocinador forzaron la salida de Fred Rutten y el regreso de Advocaat, que a sus 78 años será el DT más longevo de la historia del torneo.",
    confianza: "alta",
  },
  CIV: {
    dt: "Emerse Faé",
    dtDesde: "feb 2024",
    estrella: "Franck Kessié",
    formaReciente: "Terminó invicta la eliminatoria africana como líder de su grupo, con ocho victorias y dos empates, clasificando a un Mundial por primera vez desde Brasil 2014.",
    notaTorneo: "Campeón de la Copa Africana de Naciones 2023 con Faé, que tomó el equipo como interino a mitad del torneo y lo llevó al título venciendo 2-1 a Nigeria en la final.",
    confianza: "alta",
  },
  ECU: {
    dt: "Sebastián Beccacece",
    dtDesde: "ago 2024",
    estrella: "Moisés Caicedo",
    formaReciente: "Clasificó segundo de la eliminatoria sudamericana con 29 puntos pese a arrancar con una sanción de -3 puntos, encadenando una racha histórica de invicto rumbo al Mundial.",
    notaTorneo: "La Tri llega con una defensa sólida y una generación de jóvenes figuras (Caicedo, Hincapié, Pacho) bajo el método analítico de Beccacece, ilusionada con superar fases.",
    confianza: "alta",
  },
  // ── Grupo F ──
  NED: {
    dt: "Ronald Koeman",
    dtDesde: "ene 2023",
    estrella: "Virgil van Dijk",
    formaReciente: "Clasificó como líder invicto del Grupo G de UEFA (solo cedió dos empates ante Polonia), aunque llegó al torneo con dudas tras amistosos flojos.",
    notaTorneo: "Generación talentosa con Van Dijk como capitán que busca volver a pelear un título tras los cuartos de final de 2022.",
    confianza: "alta",
  },
  JPN: {
    dt: "Hajime Moriyasu",
    dtDesde: "jul 2018",
    estrella: "Takefusa Kubo",
    formaReciente: "Primera selección del mundo en sellar el boleto a 2026 (8va Copa consecutiva); ganó 7, empató 2 y perdió 1 para liderar su grupo asiático, con victorias recientes ante Escocia e Inglaterra.",
    notaTorneo: "Potencia asiática consolidada bajo Moriyasu que tras vencer a España y Alemania en 2022 sueña con superar por primera vez los octavos de final.",
    confianza: "alta",
  },
  SWE: {
    dt: "Graham Potter",
    dtDesde: "oct 2025",
    estrella: "Viktor Gyökeres",
    formaReciente: "Clasificó por la repesca: tras un grupo desastroso que costó el puesto a Jon Dahl Tomasson, Potter encadenó victorias en play-offs ante Ucrania (3-1) y Polonia para sellar el boleto.",
    notaTorneo: "El inglés Graham Potter rescató in extremis a una Suecia con el dúo goleador Gyökeres-Isak, tras una clasificación al borde del fracaso.",
    confianza: "alta",
  },
  TUN: {
    dt: "Sabri Lamouchi",
    dtDesde: "ene 2026",
    estrella: "Ellyes Skhiri",
    formaReciente: "Clasificó como primera selección de la historia en hacerlo sin recibir goles (campaña CAF 2026, 9 de 10 victorias); el técnico que clasificó fue Sami Trabelsi, destituido en enero 2026 tras la eliminación en octavos de la CAN 2025.",
    notaTorneo: "Séptima Copa del Mundo de las Águilas de Cartago; en el Grupo F con Países Bajos, Japón y Suecia, buscan superar por primera vez la fase de grupos con un proyecto renovado bajo Lamouchi.",
    confianza: "alta",
  },
  // ── Grupo G ──
  BEL: {
    dt: "Rudi Garcia",
    dtDesde: "ene 2025",
    estrella: "Kevin De Bruyne",
    formaReciente: "Clasificó como líder invicto del Grupo J de la UEFA, con goleadas como 7-0 a Liechtenstein y 6-0 a Kazajistán.",
    notaTorneo: "Gran favorita del Grupo G, con una generación dorada veterana (De Bruyne, Lukaku, Courtois) buscando redimirse tras el flojo Mundial 2022.",
    confianza: "alta",
  },
  EGY: {
    dt: "Hossam Hassan",
    dtDesde: "feb 2024",
    estrella: "Mohamed Salah",
    formaReciente: "Clasificó como líder invicto del Grupo A de la CAF; Salah aportó 9 goles en las eliminatorias africanas.",
    notaTorneo: "En su cuarto Mundial, los Faraones de Salah y Marmoush sueñan con superar la fase de grupos por primera vez en su historia.",
    confianza: "alta",
  },
  IRN: {
    dt: "Amir Ghalenoei",
    dtDesde: "mar 2023",
    estrella: "Mehdi Taremi",
    formaReciente: "Clasificó muy pronto (marzo 2025) ganando su grupo del tercer ronda de la AFC, perdiendo solo uno de 16 partidos de eliminatorias.",
    notaTorneo: "Séptima Copa del Mundo (cuarta consecutiva), apoyándose en el goleador Taremi y buscando por fin pasar de la fase de grupos.",
    confianza: "alta",
  },
  NZL: {
    dt: "Darren Bazeley",
    dtDesde: "2023",
    estrella: "Chris Wood",
    formaReciente: "Dominó la clasificación de la OFC (29 goles a favor y solo 1 en contra en 5 partidos) y selló el boleto venciendo 3-0 a Nueva Caledonia en la final (24 mar 2025).",
    notaTorneo: "Apenas su tercer Mundial y primero desde 2010; los All Whites de Chris Wood persiguen su histórica primera victoria mundialista.",
    confianza: "alta",
  },
  // ── Grupo H ──
  ESP: {
    dt: "Luis de la Fuente",
    dtDesde: "dic 2022",
    estrella: "Lamine Yamal",
    formaReciente: "Clasificó como líder invicto de su grupo UEFA y llega como campeona de la Eurocopa 2024 y de la Nations League 2023, entre las máximas favoritas al título.",
    notaTorneo: "Vigente campeona de Europa y gran favorita, busca su segundo título mundial tras el de 2010.",
    confianza: "alta",
  },
  CPV: {
    dt: "Bubista (Pedro Leitão Brito)",
    dtDesde: "ene 2020",
    estrella: "Ryan Mendes",
    formaReciente: "Clasificó por primera vez en su historia al ganar su grupo de la CAF con 8 victorias en 10 partidos por delante de Camerún y Angola; sello el boleto el 13-oct-2025 venciendo 3-0 a Esuatini.",
    notaTorneo: "Debutante absoluto: el segundo país más pequeño en llegar a un Mundial, la gran historia de superación del torneo.",
    confianza: "alta",
  },
  KSA: {
    dt: "Georgios Donis",
    dtDesde: "abr 2026",
    estrella: "Salem Al-Dawsari",
    formaReciente: "Clasificó sufriendo: necesitó una cuarta ronda extra de la AFC (superando a Irak e Indonesia) tras quedar tercera detrás de Japón y Australia en la fase anterior.",
    notaTorneo: "Séptimo Mundial de los 'Halcones Verdes', que cambiaron de DT a 2 meses del torneo y sueñan con repetir el batacazo ante Argentina de Qatar 2022.",
    confianza: "alta",
  },
  URU: {
    dt: "Marcelo Bielsa",
    dtDesde: "may 2023",
    estrella: "Federico Valverde",
    formaReciente: "Clasificó cuarta en las Eliminatorias Sudamericanas con 28 puntos (7 victorias, 7 empates, 4 derrotas), sellando su boleto al vencer 3-0 a Perú; quinta participación consecutiva.",
    notaTorneo: "Bielsa anunció que dejará la Celeste tras el Mundial: su último baile al frente de una generación joven que busca devolver a Uruguay al protagonismo.",
    confianza: "alta",
  },
  // ── Grupo I ──
  FRA: {
    dt: "Didier Deschamps",
    dtDesde: "jul 2012",
    estrella: "Kylian Mbappé (capitán)",
    formaReciente: "Clasificó como líder de su grupo UEFA; llega 3ra del ranking FIFA con una de las plantillas más profundas del torneo.",
    notaTorneo: "Es el último torneo de Deschamps tras 14 años al mando (Zidane lo reemplazará después del Mundial); Mbappé busca su segundo título y acercarse al récord de goles de Klose.",
    confianza: "alta",
  },
  SEN: {
    dt: "Pape Thiaw",
    dtDesde: "dic 2024",
    estrella: "Sadio Mané",
    formaReciente: "Clasificó al Mundial en octubre 2025 (Mané fue máximo goleador de su grupo eliminatorio con 5 goles); récord de Thiaw de 18-3-3.",
    notaTorneo: "Thiaw llevó a Senegal a la final de la AFCON 2025: ganaron 1-0 a Marruecos en cancha (ene 2026), pero la CAF anuló el resultado en marzo 2026 y dio el título a Marruecos; Senegal apeló ante el TAS. Mané jugará su último Mundial.",
    confianza: "alta",
  },
  IRQ: {
    dt: "Graham Arnold",
    dtDesde: "may 2025",
    estrella: "Aymen Hussein",
    formaReciente: "Clasificó tras un largo proceso de eliminatorias, sellando el cupo con un repechaje intercontinental ganado 2-1 a Bolivia (31 mar 2026), con gol decisivo de Aymen Hussein.",
    notaTorneo: "Vuelve al Mundial tras 40 años; el australiano Arnold (exDT de los Socceroos en Qatar 2022) tomó el cargo en 2025 reemplazando a Jesús Casas y su gol ante Bolivia desató feriado nacional en Irak.",
    confianza: "alta",
  },
  NOR: {
    dt: "Ståle Solbakken",
    dtDesde: "dic 2020",
    estrella: "Erling Haaland (Martin Ødegaard es el capitán)",
    formaReciente: "Clasificó dominando su grupo UEFA (incluido un 11-1 a Moldavia y un 4-1 en Italia); Haaland marcó 16 goles en la eliminatoria, igualando el récord de Lewandowski.",
    notaTorneo: "Noruega vuelve a un Mundial tras 28 años de ausencia; debut mundialista de Haaland y Ødegaard, que cargan con la ilusión de toda una nación.",
    confianza: "alta",
  },
  // ── Grupo J ──
  ARG: {
    dt: "Lionel Scaloni",
    dtDesde: "ago 2018",
    estrella: "Lionel Messi",
    formaReciente: "Clasificó como líder de las Eliminatorias Conmebol con varias fechas de anticipación (38 puntos en 18 partidos), venciendo a Brasil ida y vuelta.",
    notaTorneo: "Campeona defensora del Mundial 2022; Messi afronta su sexto y probablemente último Mundial buscando repetir el título.",
    confianza: "alta",
  },
  ALG: {
    dt: "Vladimir Petković",
    dtDesde: "feb 2024",
    estrella: "Riyad Mahrez",
    formaReciente: "Clasificó como ganadora del Grupo G de la eliminatoria CAF (8 victorias en 10 partidos), sellando el boleto el 9 de octubre de 2025 con un 3-0 a Somalia inspirado por Mahrez.",
    notaTorneo: "Los Fennecs regresan a un Mundial por primera vez desde 2014, tras 12 años de ausencia.",
    confianza: "alta",
  },
  AUT: {
    dt: "Ralf Rangnick",
    dtDesde: "jun 2022",
    estrella: "David Alaba",
    formaReciente: "Clasificó directo como líder de su grupo UEFA (por delante de Bosnia, Rumania, Chipre y San Marino), ganando 6 de 8 partidos.",
    notaTorneo: "Austria vuelve a un Mundial por primera vez desde 1998, tras 28 años de ausencia, con Rangnick como artífice de un equipo moderno y agresivo.",
    confianza: "alta",
  },
  JOR: {
    dt: "Jamal Sellami",
    dtDesde: "2024",
    estrella: "Mousa Al-Tamari",
    formaReciente: "Selló su histórica primera clasificación en la eliminatoria asiática el 5 de junio de 2025 con un 3-0 de visita ante Omán.",
    notaTorneo: "Jordania debuta en una Copa del Mundo; subcampeona de la Copa Asiática 2023, lidera su ataque Al-Tamari, apodado el 'Messi jordano'.",
    confianza: "alta",
  },
  // ── Grupo K ──
  POR: {
    dt: "Roberto Martínez",
    dtDesde: "ene 2023",
    estrella: "Cristiano Ronaldo",
    formaReciente: "Clasificó como cabeza de su grupo europeo de eliminatorias y llega como campeón de la UEFA Nations League 2025 (venció a España en penales en junio 2025).",
    notaTorneo: "Generación dorada que busca su primer Mundial con Ronaldo, posiblemente en su última cita mundialista, bajo la guía de Roberto Martínez.",
    confianza: "alta",
  },
  COD: {
    dt: "Sébastien Desabre",
    dtDesde: "ago 2022",
    estrella: "Yoane Wissa",
    formaReciente: "Clasificó por la repesca intercontinental tras vencer 1-0 a Jamaica en la prórroga (31 marzo 2026) en Guadalajara, México.",
    notaTorneo: "Los Leopardos regresan a un Mundial 52 años después (última vez 1974) de la mano del francés Desabre.",
    confianza: "alta",
  },
  UZB: {
    dt: "Fabio Cannavaro",
    dtDesde: "oct 2025",
    estrella: "Abdukodir Khusanov",
    formaReciente: "Clasificó por primera vez en su historia tras terminar segundo de su grupo final de la AFC (detrás de Irán); el técnico de la clasificación fue Timur Kapadze, reemplazado por Cannavaro en octubre 2025.",
    notaTorneo: "Debut mundialista absoluto de Uzbekistán, dirigido por el campeón del mundo 2006 Fabio Cannavaro.",
    confianza: "alta",
  },
  COL: {
    dt: "Néstor Lorenzo",
    dtDesde: "jun 2022",
    estrella: "Luis Díaz",
    formaReciente: "Clasificó directamente al terminar tercera en las eliminatorias CONMEBOL con 28 puntos (18 partidos), por delante de Uruguay y Brasil por diferencia de gol.",
    notaTorneo: "Colombia vuelve al Mundial tras ausentarse en 2022, con la generación de Luis Díaz y James Rodríguez y tras ser finalista de la Copa América 2024.",
    confianza: "alta",
  },
  // ── Grupo L ──
  ENG: {
    dt: "Thomas Tuchel",
    dtDesde: "ene 2025",
    estrella: "Harry Kane",
    formaReciente: "Clasificó como líder de su grupo en las eliminatorias UEFA; Tuchel nombró su plantel de 26 en mayo de 2026.",
    notaTorneo: "Los Three Lions buscan su primer título mundial desde 1966, ahora bajo el alemán Tuchel y con Kane disputando su tercer Mundial como capitán.",
    confianza: "alta",
  },
  CRO: {
    dt: "Zlatko Dalic",
    dtDesde: "oct 2017",
    estrella: "Luka Modric",
    formaReciente: "Clasificó dominante como líder de grupo UEFA: 7 victorias en 8 partidos, 26 goles a favor y solo 4 en contra, sellando el boleto el 14-nov-2025.",
    notaTorneo: "Subcampeón en 2018 y tercero en 2022, Croacia llega con Modric de 40 años disputando su sexto Mundial, récord histórico, ya como jugador del AC Milan.",
    confianza: "alta",
  },
  GHA: {
    dt: "Carlos Queiroz",
    dtDesde: "abr 2026",
    estrella: "Mohammed Kudus (fuera por lesión); en cancha, Thomas Partey / Inaki Williams como referentes",
    formaReciente: "Otto Addo clasificó a Ghana líder de su grupo CAF (8 triunfos, 1 empate, 1 derrota), pero fue despedido el 31-mar-2026 tras goleadas en amistosos; Queiroz asumió el 14-abr-2026.",
    notaTorneo: "Los Black Stars cambiaron de DT a 10 semanas del Mundial: el veterano Queiroz dirige su quinto Mundial consecutivo, pero pierde a su figura Kudus por lesión.",
    confianza: "alta",
  },
  PAN: {
    dt: "Thomas Christiansen",
    dtDesde: "jul 2020",
    estrella: "Ismael Díaz",
    formaReciente: "Clasificó directo como líder del Octagonal final de Concacaf, sellando el boleto el 18-nov-2025 con un 3-0 sobre El Salvador.",
    notaTorneo: "En apenas su segunda participación mundialista, Panamá sueña con ser la sorpresa del torneo, el 'Marruecos de 2026' según Christiansen.",
    confianza: "alta",
  },
};

/** Devuelve el dossier de un equipo, o null si aún no está verificado. */
export function dossierEquipo(id: string): DossierEquipo | null {
  return DOSSIERS[id] ?? null;
}

/**
 * Construye los hechos de un partido. Devuelve null si falta el dossier de
 * cualquiera de los dos equipos — en ese caso el prompt usa la regla dura
 * "sin hechos, no inventes" en lugar de datos a medias.
 */
export function hechosDePartido(partido: Partido): HechosPartido | null {
  const local = dossierEquipo(partido.equipoLocalId);
  const visitante = dossierEquipo(partido.equipoVisitanteId);
  if (!local || !visitante) return null;
  return { local, visitante, capturadoEl: CAPTURADO_EL };
}

