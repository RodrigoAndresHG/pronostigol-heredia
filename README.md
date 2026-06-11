# PronostiGol HeredIA

> **Predicciones del Mundial 2026 con el consenso (y el desacuerdo) de 3 IAs, ancladas a hechos verificados y con rendición de cuentas pública.**
> Vitrina pública de la metodología **HeredIA**: razonamiento con IA aplicado a decisiones reales.

App: **https://pronostigol.rodriheredia.com** · Stack: React + Vite + TypeScript + funciones serverless en Vercel + Supabase.

Este documento es la referencia completa de la app: qué hace, cómo está construida, cómo razona, qué datos usa, cómo se despliega y cómo se opera. Está pensado para entenderse de cabo a rabo sin leer el código.

---

## Índice

1. [Qué es y para quién](#1-qué-es-y-para-quién)
2. [La idea central (el diferenciador)](#2-la-idea-central-el-diferenciador)
3. [Cómo razona: el pipeline de predicción por capas](#3-cómo-razona-el-pipeline-de-predicción-por-capas)
4. [Las funcionalidades, fase por fase](#4-las-funcionalidades-fase-por-fase)
5. [Arquitectura técnica](#5-arquitectura-técnica)
6. [Estructura del proyecto](#6-estructura-del-proyecto)
7. [Endpoints de la API](#7-endpoints-de-la-api)
8. [Tareas programadas (crons)](#8-tareas-programadas-crons)
9. [Datos: fuentes y verdad](#9-datos-fuentes-y-verdad)
10. [Base de datos (Supabase)](#10-base-de-datos-supabase)
11. [Variables de entorno](#11-variables-de-entorno)
12. [Desarrollo local](#12-desarrollo-local)
13. [Despliegue (Vercel)](#13-despliegue-vercel)
14. [Tests](#14-tests)
15. [Marca, captación y monetización](#15-marca-captación-y-monetización)
16. [Decisiones de diseño y aprendizajes](#16-decisiones-de-diseño-y-aprendizajes)
17. [Roadmap / pendientes](#17-roadmap--pendientes)
18. [Aviso legal](#18-aviso-legal)

---

## 1. Qué es y para quién

PronostiGol HeredIA es una **PWA (aplicación web progresiva) mobile-first** que, para cada partido del Mundial 2026 (11 jun – 19 jul, 48 selecciones, 12 grupos), publica una predicción probabilística construida por **tres modelos de IA frontier** (Claude, GPT y Gemini) razonando en paralelo, más un modelo estadístico base transparente.

No es una app de apuestas ni de "tips". Su producto es la **transparencia del razonamiento**: muestra dónde las IAs coinciden, dónde discrepan, con qué hechos razonaron, y —una vez jugado el partido— qué tan acertadas y bien calibradas estuvieron. Es la **vitrina pública** de la metodología personal "HeredIA" del autor, que la monetiza con un workshop/LMS.

**Público:** aficionados al fútbol durante el Mundial (tráfico y viralidad) y, a través de ellos, personas interesadas en aprender a aplicar razonamiento con IA a su negocio (conversión al workshop).

**Lo que el usuario puede hacer:** sólo **visualizar**. No genera ni edita nada. Las predicciones se publican automáticamente cada mañana vía un cron. La generación está restringida a un rol admin (con código).

---

## 2. La idea central (el diferenciador)

La mayoría de los pronósticos venden **falsa certeza** ("gana X, fijo"). Esta app vende lo contrario: **honestidad sobre la incertidumbre**, y lo hace medible y auditable. Tres pilares:

1. **Consenso vs desacuerdo de 3 IAs.** Las tres reciben *exactamente el mismo prompt*. Si convergen, es consenso de alta confianza. Si divergen, el desacuerdo se muestra como una *feature* (es información: el partido es genuinamente difícil de leer), no se esconde.
2. **Anclaje a hechos (anti-alucinación).** Las IAs razonan **sólo** con un dossier de hechos verificados (DT actual, figura, forma) y tienen *prohibido inventar* datos que no estén ahí. Esto nació de un bug real: una IA citó a un entrenador que ya no dirigía a Ecuador porque el prompt le pedía "contexto" sin dárselo, y ella lo rellenaba desde su memoria de entrenamiento (con fecha de corte).
3. **Rendición de cuentas.** Una vez jugado el partido, la app califica con el **Brier Score** a cada IA (y al consenso, y al modelo base): no solo "acertó/falló", sino qué tan *calibrada* estaba la probabilidad. "El acierto bruto miente; la calibración no."

Ese tercer pilar es justo la lección que vende el workshop: *no le creas a una IA porque suene segura; verifica si su confianza está calibrada con datos*.

---

## 3. Cómo razona: el pipeline de predicción por capas

Para un partido, la predicción se construye en capas:

```
                 ┌──────────────────────────────────────────────────────────┐
  Partido (id) → │  CAPA 1 · Modelo base estadístico (transparente)          │
                 │  src/lib/modeloBase.ts                                     │
                 │  Rating Elo + ventaja de sede (anfitrión +120) + forma +   │
                 │  descanso  →  probabilidad {local, empate, visitante}      │
                 └──────────────────────────────────────────────────────────┘
                                          │
                 ┌──────────────────────────────────────────────────────────┐
                 │  CAPA 1.5 · Dossier de anclaje (hechos verificados)        │
                 │  src/datos/dossiers.ts                                     │
                 │  Por equipo: DT actual, figura, forma reciente, nota.      │
                 │  Verificado con fuentes web (no de memoria).               │
                 └──────────────────────────────────────────────────────────┘
                                          │
                 ┌──────────────────────────────────────────────────────────┐
                 │  CAPA 2 · Las 3 IAs en paralelo (mismo prompt)             │
                 │  api/_lib/{prompt,iaClaude,iaGPT,iaGemini}.ts              │
                 │  Cada una devuelve JSON estricto:                          │
                 │    { probabilidad, confianza 0-100, explicacion (3 frases),│
                 │      marcadorEsperado }                                    │
                 │  Regla dura: razona SOLO con los hechos; no inventes DTs,  │
                 │  jugadores ni estadísticas.                                │
                 └──────────────────────────────────────────────────────────┘
                                          │
                 ┌──────────────────────────────────────────────────────────┐
                 │  SÍNTESIS · api/_lib/sintesis.ts                           │
                 │  Probabilidad final = promedio ponderado por confianza.    │
                 │  Veredicto = consenso | desacuerdo (umbral 12 pts de       │
                 │  spread máximo entre IAs). Nota humana del veredicto.      │
                 └──────────────────────────────────────────────────────────┘
                                          │
                 ┌──────────────────────────────────────────────────────────┐
                 │  (Fase 4, PENDIENTE) Señal de valor vs cuota de mercado    │
                 └──────────────────────────────────────────────────────────┘
                                          │
                       Se guarda en Supabase (tabla `predicciones`, jsonb)
```

**Por qué es honesto el comparativo:** como las 3 IAs reciben *el mismo input exacto*, cualquier diferencia entre sus respuestas viene del modelo en sí, no de variaciones en el prompt.

Las tres se llaman con `Promise.all` (en paralelo). Si una falla, las otras dos igual responden y la síntesis lo dice ("1 IA no respondió, sintetizado con 2"). La tarjeta de la IA fallida muestra un mensaje limpio, nunca el error técnico crudo.

**Después del pitazo** (capa de accountability, Fase 9):

```
  Resultado real (openfootball) → tabla `resultados` (Supabase)
        │
        ├─ Brier por actor (cada IA, consenso, modelo base)  → Boletín de Calibración
        ├─ Confianza declarada vs acierto real               → Termómetro de honestidad
        ├─ Predicción guardada (inmutable) vs lo que pasó     → Autopsia del partido
        └─ Goleadores agregados                               → Tabla de goleadores
```

---

## 4. Las funcionalidades, fase por fase

La app se construyó por fases. Estado actual: **Fases 0–3.7, 6, 6.5, 8 y 9 completas. Fase 4 (cuotas reales) pendiente.**

### Predicción (Fases 1–3)
- **Capa 1 — modelo base** (`modeloBase.ts`): Elo + ventaja de sede (anfitrión en su país +120 Elo; "local" en sede neutral 0, porque la designación FIFA es administrativa) + forma + descanso. Devuelve probabilidad y un **desglose auditable** (componente "Cómo lo calculó la Capa 1").
- **Capa 2 — 3 IAs** (`api/_lib/core.ts`): backend serverless que orquesta las 3 llamadas, sintetiza y guarda.
- **Modelo de publicación**: el público sólo lee; un cron genera cada mañana; el admin puede regenerar.

### Pulido visual y movimiento (Fases 3.6–3.7, 6.5)
- Rediseño **editorial premium**: oscuro, tipografía Fraunces (display) + Inter (sans) + JetBrains Mono (datos), un solo acento verde, fotos reales de estadios tratadas, mascotas oficiales.
- **Sistema de movimiento** (Framer Motion): respeta `prefers-reduced-motion`, sólo anima `transform`/`opacity` (GPU), CLS 0.
- **Mesa de Deliberación** (`MesaDeliberacion.tsx`): la pieza estrella. Dramatiza la predicción ya publicada: las 3 IAs entran en cascada, su razonamiento se "escribe" en vivo (typing), los números cuentan hacia arriba, la barra se llena y aterriza el veredicto (destello verde si consenso, tensión cyan si desacuerdo). Micro-sonidos opcionales (apagados por defecto).

### Compartir (Fase 6)
- **Imagen OG** (`api/og-imagen.ts`, `@vercel/og`): PNG 1200×630 por partido para WhatsApp/redes, con fuentes embebidas. Fondo sólido midnight (no foto: pesa ~70 KB y WhatsApp sí muestra el thumbnail).
- **Meta tags por partido** (`api/meta.ts`): inyecta OG tags en el HTML para los crawlers (rewrite `/partido/:id` → `/api/meta`).

### Anclaje de datos y desacuerdo (Fase 8)
- **Dossier de anclaje** (`src/datos/dossiers.ts`): hechos verificados de los 48 equipos. Visible en el acordeón "Los hechos que recibieron las IAs".
- **Choque de IAs** (`og-imagen.ts?formato=vertical`): imagen vertical 9:16 que enfrenta cara a cara a las dos IAs más opuestas — el objeto compartible del desacuerdo, nativo de Stories/Reels.
- **Anatomía del desacuerdo** (`AnatomiaDesacuerdo.tsx`): cuando hay desacuerdo, desglosa *por qué* divergen (delta de cada IA vs base + factor declarado) y ofrece **"Copiar este caso como prompt"** (`/api/predecir?soloPrompt=1`) — regala el prompt real y reproducible, con puente al workshop.

### Accountability — "después del pitazo" (Fase 9)
- **Boletín de Calibración** (`Historial.tsx`): ranking Claude vs GPT vs Gemini vs Consenso vs Modelo base por **Brier Score** (menor es mejor; 0 = perfecto, 0.667 = no saber nada). El Historial dejó de ser mock y vive de datos reales.
- **Termómetro de honestidad** (`CurvaCalibracion.tsx`): curva (SVG dibujado a mano) que cruza la confianza declarada de las IAs contra su acierto real. Diagonal = calibración perfecta; encima = cautas; debajo = sobreconfiadas.
- **Autopsia del partido** (`Autopsia.tsx`): en el detalle de un partido jugado, qué dijo cada IA (probabilidad inmutable, guardada antes) vs qué pasó; etiqueta de calibración por IA; en desacuerdos, quién ganó la discusión.
- **Goleadores del torneo** (`GoleadoresTorneo.tsx`): tabla en vivo desde openfootball, con ★ marcando a la "figura" que el dossier dio a las IAs (el hecho, confirmado en la cancha).

---

## 5. Arquitectura técnica

**Frontend (SPA / PWA):**
- **React 19** + **Vite 8** + **TypeScript** + **Tailwind CSS 3**.
- **react-router-dom 7** (`BrowserRouter` + `<Routes>`).
- **vite-plugin-pwa** (manifest + service worker).
- **motion** (Framer Motion 12) para animaciones.
- Web Audio API para micro-sonidos sintetizados (sin assets).

**Backend (serverless):**
- **Funciones serverless de Vercel** (`@vercel/node`, runtime Node) bajo `/api`. **Aquí viven todas las claves de API** — nunca en el frontend.
- En **desarrollo**, un plugin de Vite (`vite-plugin-api-dev.ts`) sirve `/api/*` localmente llamando al *mismo* código que despliega Vercel, así dev y prod son indistinguibles.
- **Convención crítica de imports**: en `/api` los imports usan extensión `.js` (apuntando a archivos `.ts`), porque Vercel compila a `.js` y la resolución de módulos NodeNext lo exige. Romper esto da `ERR_MODULE_NOT_FOUND` en producción.

**Persistencia:**
- **Supabase** (Postgres). Tablas `predicciones` (jsonb, historial) y `resultados`. RLS: lectura pública con anon key; escritura sólo con la `service_role` key desde el backend.

**IA:**
- `@anthropic-ai/sdk` (Claude), `openai` (GPT), `@google/genai` (Gemini). Cada modelo es configurable por env var (`MODELO_CLAUDE`, `MODELO_GPT`, `MODELO_GEMINI`). Todas fuerzan salida JSON estricta.

**Generación de imágenes:** `@vercel/og` (Satori). Sin JSX en `/api` (Vercel no lo transpila ahí de forma fiable): se usa `React.createElement`. Fuentes embebidas como base64 (`api/_fontsData.ts`).

**Datos del Mundial en vivo:** `openfootball/worldcup.json` (JSON estático en GitHub, **gratis, sin API key, sin límite de tasa**) para resultados y goleadores.

---

## 6. Estructura del proyecto

```
pronostigol-heredia/
├── api/                                  # Funciones serverless (Vercel) — claves viven aquí
│   ├── predecir.ts                       # GET (público, lee) / POST (admin, genera) — envoltorio
│   ├── historial.ts                      # GET: track-record real (Brier + calibración)
│   ├── goleadores.ts                     # GET: tabla de goleadores (en vivo, openfootball)
│   ├── og-imagen.ts                      # PNG compartible (horizontal + ?formato=vertical "Choque")
│   ├── meta.ts                           # Inyecta OG meta tags por partido (para crawlers)
│   ├── _fontsData.ts                     # Fuentes WOFF en base64 (para @vercel/og)
│   ├── _htmlBase.ts                      # HTML del index incrustado (generado en build; gitignored)
│   ├── _lib/
│   │   ├── core.ts                       # predecir(): orquesta Capa 1 + dossier + 3 IAs + síntesis
│   │   ├── router.ts                     # Lógica pura de /api/predecir (GET/POST/soloPrompt/autopsia)
│   │   ├── prompt.ts                     # Construye el prompt idéntico para las 3 IAs (anclado a hechos)
│   │   ├── iaClaude.ts / iaGPT.ts / iaGemini.ts   # Integraciones de cada modelo
│   │   ├── parser.ts                     # Parseo tolerante del JSON que devuelven los modelos
│   │   ├── sintesis.ts                   # Consenso/desacuerdo + probabilidad final ponderada
│   │   ├── admin.ts                      # Verificación admin (comparación de tiempo constante)
│   │   ├── almacen.ts                    # Adaptador Supabase de `predicciones`
│   │   ├── resultados.ts                 # Adaptador Supabase de `resultados`
│   │   ├── calificacion.ts               # PURO: Brier, calibración, autopsia (testeable)
│   │   ├── openfootball.ts               # PURO+fetch: resultados y goleadores del Mundial 2026
│   │   └── datosPartido.ts               # Resolutor compartido (para og-imagen y meta)
│   └── cron/
│       ├── generar-predicciones.ts       # Cron: genera predicciones de partidos próximos (06:00 UTC)
│       └── cerrar-partidos.ts            # Cron: ingiere resultados jugados (09:00 UTC)
│
├── src/
│   ├── main.tsx                          # Providers: Router → Sonido → Motion → App
│   ├── App.tsx                           # Rutas + transiciones de página (AnimatePresence)
│   ├── tipos/index.ts                    # FUENTE ÚNICA DE VERDAD de todos los tipos
│   ├── paginas/                          # Inicio, Calendario, DetallePartido, Historial, Torneo, Creditos
│   ├── componentes/                      # UI (Mesa, TarjetaIA, Autopsia, AcordeonDossier, ...)
│   │   └── visual/                       # FotoEstadio, CuentaRegresiva, CapaParticulas
│   ├── movimiento/                       # Sistema de animación (Reveal, CountUp, useTyping, ...)
│   ├── datos/                            # equipos, partidos, grupos, estadios, dossiers, predicciones(mock)
│   ├── lib/                              # modeloBase, usePrediccionApi, useAdmin, formato, zonaHoraria
│   ├── marca/enlaces.ts                  # URLs de WhatsApp y LMS + UTMs
│   └── index.css                         # Tailwind + fuentes + clases editoriales
│
├── scripts/
│   ├── generar-lote.ts                   # Genera predicciones en lote contra producción (admin)
│   ├── regenerar-local.ts                # Genera con el código local y guarda (para aplicar cambios ya)
│   ├── verificar-ingesta.ts              # Verifica el pipeline de resultados (round-trip)
│   ├── validar-datos.ts                  # Valida integridad del dataset (48 equipos, 72 partidos, ...)
│   └── incrustar-html.mjs                # Post-build: incrusta dist/index.html en api/_htmlBase.ts
│
├── tests/                                # node:test vía tsx (modeloBase, calificacion, historial, openfootball)
├── supabase/schema.sql                   # Esquema: tablas `predicciones` y `resultados` + RLS
├── vercel.json                           # Rewrites + crons
├── vite-plugin-api-dev.ts                # Sirve /api/* en `npm run dev`
└── tailwind.config.js                    # Paleta "tinta" + verde/cyan, fuentes, keyframes
```

---

## 7. Endpoints de la API

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/predecir?partidoId=ID` | GET | Devuelve la última predicción guardada del partido. Si el partido ya se jugó, adjunta la **autopsia**. 404 si no hay predicción. |
| `/api/predecir?partidoId=ID&soloPrompt=1` | GET | Devuelve el prompt EXACTO (`{sistema, usuario}`) sin llamar a las IAs. Alimenta "Copiar este caso como prompt". |
| `/api/predecir` | POST | Genera y publica una predicción. **Requiere header `X-Codigo-Admin` válido** (si no, 401). Body: `{ partidoId }`. |
| `/api/historial` | GET | Track-record real: Boletín de Calibración (Brier por actor), curva de calibración y registros por partido. |
| `/api/goleadores` | GET | Tabla de goleadores del torneo, agregada en vivo desde openfootball. Cacheada ~5 min. |
| `/api/og-imagen?partidoId=ID` | GET | PNG 1200×630 compartible. Con `&formato=vertical` → 1080×1920 "Choque de IAs". |
| `/api/meta?idPartido=ID` | GET | HTML con OG meta tags del partido (sólo producción; rewrite desde `/partido/:id`). |
| `/api/cron/generar-predicciones` | GET | Cron protegido (`Authorization: Bearer <CRON_SECRET>`). |
| `/api/cron/cerrar-partidos` | GET | Cron protegido. Ingiere resultados. |

**Rutas del frontend (SPA):** `/` (Inicio), `/calendario`, `/partido/:idPartido`, `/historial`, `/torneo`, `/creditos`.

---

## 8. Tareas programadas (crons)

Definidas en `vercel.json`. Vercel las invoca enviando `Authorization: Bearer <CRON_SECRET>`.

| Cron | Horario | Qué hace |
|---|---|---|
| `generar-predicciones` | `0 6 * * *` (06:00 UTC / 01:00 Ecuador) | Genera/refresca predicciones de los partidos en las próximas **36 h**. Salta los que ya tienen una predicción de menos de **12 h** (no malgasta tokens). |
| `cerrar-partidos` | `0 9 * * *` (09:00 UTC) | Lee openfootball, detecta partidos ya jugados, hace **upsert** del marcador en `resultados` (idempotente). Eso enciende solo el Boletín, el Termómetro y la Autopsia. |

> En el plan Hobby de Vercel los crons corren una vez al día y la hora es aproximada. Ambos requieren `CRON_SECRET` configurada.

---

## 9. Datos: fuentes y verdad

| Dato | Archivo / fuente | Notas |
|---|---|---|
| 48 equipos + grupos | `src/datos/equipos.ts` | Sorteo del 5-dic-2025. Rating tipo Elo aproximado (se reemplazaría por puntos FIFA en Fase 4). |
| 72 partidos (fase de grupos) | `src/datos/partidos.ts` | Fechas en ISO 8601 UTC, sedes verificadas. IDs `GRUPO-MDx-N` (p. ej. `E-MD1-2`). |
| Estadios | `src/datos/estadios.ts` | Fotos tratadas + atribución. |
| **Dossier de hechos** | `src/datos/dossiers.ts` | DT actual, figura, forma, nota de torneo de los 48. Verificado con fuentes web (2026). **Mantenimiento editorial:** un dato malo aquí es peor que ninguno. |
| **Resultados + goleadores** | `openfootball/worldcup.json` (GitHub raw) | Gratis, sin API key, sin límite. `score.ft: [g1,g2]` + `goals1/goals2`. Se actualiza ~1 vez/día. |
| Cuotas de mercado | *(pendiente, Fase 4)* | The Odds API → habilitaría la "señal de valor". |

**Por qué openfootball y no API-Football:** el plan **gratuito** de API-Football **no da acceso a la temporada 2026** (solo 2022–2024). openfootball es gratis para 2026 y trae resultados y goleadores. El emparejamiento entre los nombres en inglés de openfootball y los códigos ISO3 propios (y la alineación de la orientación local/visitante) vive en `api/_lib/openfootball.ts` y está cubierto por tests.

---

## 10. Base de datos (Supabase)

Esquema en `supabase/schema.sql` (se ejecuta en el SQL Editor de Supabase).

**Tabla `predicciones`** — historial de generaciones (no se sobrescribe; se inserta una fila por generación; la UI lee la más reciente):
```sql
id uuid pk · partido_id text · generada_en timestamptz · payload jsonb
```
El `payload` es el objeto `Prediccion` completo (probabilidades, respuestas de las 3 IAs, veredicto, **dossier** usado, etc.).

**Tabla `resultados`** — una fila por partido jugado (UPSERT sobre `partido_id` UNIQUE):
```sql
id uuid pk · partido_id text UNIQUE · goles_local int · goles_visitante int
· resultado_real text · registrado_en timestamptz
```

**RLS** en ambas: lectura pública (SELECT con anon key); **sin** políticas de escritura → sólo la `service_role` (backend) puede insertar/actualizar.

---

## 11. Variables de entorno

Configurar en **Vercel → Settings → Environment Variables** (producción) y en `.env.local` (desarrollo; archivo oculto en la raíz).

| Variable | Para qué | Dónde |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude | backend |
| `OPENAI_API_KEY` | GPT | backend |
| `GOOGLE_API_KEY` | Gemini | backend |
| `MODELO_CLAUDE` / `MODELO_GPT` / `MODELO_GEMINI` | (opcional) elegir versión de cada modelo | backend |
| `VITE_SUPABASE_URL` | URL de Supabase | backend (y frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | escritura en Supabase | **sólo backend** |
| `CODIGO_ADMIN` | gate de generación (header `X-Codigo-Admin`) | backend |
| `CRON_SECRET` | autoriza los crons (Bearer token que envía Vercel) | backend |

> **Seguridad:** las claves nunca van al frontend ni se pegan en chats; viven en Vercel y en `.env.local`. Para meter un secreto en la terminal sin que quede en el historial: `read -rs "VAR?prompt: "; export VAR`.

---

## 12. Desarrollo local

```bash
npm install
npm run dev            # Vite + sirve /api/* localmente (mismo código que Vercel)
```

Scripts disponibles:

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | `tsc -b && vite build && node scripts/incrustar-html.mjs`. |
| `npm test` | Suite con `tsx --test` (lógica pura: modelo base, Brier, historial, openfootball). |
| `npm run validar-datos` | Valida integridad del dataset (48 equipos, 72 partidos, etc.). |
| `npm run generar-lote -- md1 --forzar` | Genera predicciones en lote contra **producción** (requiere `CODIGO_ADMIN`). Acepta `md1`/`md2`/`md3`/`todos` o un ID exacto. |
| `node --env-file=.env.local --import tsx scripts/regenerar-local.ts <id>` | Genera con el código **local** y guarda en Supabase (para aplicar cambios sin desplegar). |
| `node --env-file=.env.local --import tsx scripts/verificar-ingesta.ts` | Verifica el pipeline de resultados (round-trip). |

---

## 13. Despliegue (Vercel)

- **Build:** `npm run build` (definido en `vercel.json`). Salida en `dist`.
- **Rewrites** (`vercel.json`): `/partido/:id` → `/api/meta` (para OG tags); el resto del front → `/index.html` (SPA).
- **Crons** registrados desde `vercel.json` al desplegar.
- **Push a `main` → deploy automático.** Dominio: `pronostigol.rodriheredia.com`.
- Tras cambios en el pipeline o el dossier, las predicciones **ya guardadas no se actualizan solas**: hay que regenerarlas (cron diario, `generar-lote` o `regenerar-local`).

---

## 14. Tests

Suite con el runner integrado de Node vía `tsx --test` (`npm test`). Cubren la **lógica pura**:
- `modeloBase.test.ts` — invariantes del modelo base (probabilidades suman 1, bonus de sede, forma, descanso).
- `calificacion.test.ts` — Brier (perfecto=0, peor=2, ignorancia≈0.667), cubetas de confianza, etiqueta de calibración.
- `historial.test.ts` — agregación del Boletín (ranking por Brier, cubetas).
- `openfootball.test.ts` — emparejamiento partido↔calendario, **alineación de orientación** (swap de goles), agregación de goleadores, autogoles no cuentan.

---

## 15. Marca, captación y monetización

- **Marca:** la app es la **vitrina pública de la metodología HeredIA** (razonamiento con IA aplicado a negocios). La transparencia y el método *son* el producto.
- **Captación de tráfico:** módulos editoriales (no anuncios) hacia el **Canal de WhatsApp** (audiencia recurrente de fútbol) y hacia el **workshop/LMS** (`builder.rodriheredia.com`), con UTMs (`src/marca/enlaces.ts`). El logo de WhatsApp respeta las reglas de marca de Meta (verde oficial #25D366).
- **Conversión:** la "Anatomía del desacuerdo" regala el prompt real y enseña a auditar el razonamiento de 3 IAs → puente honesto al método. El Boletín/Termómetro son material de clase ("aquí están los recibos").

---

## 16. Decisiones de diseño y aprendizajes

- **Las 3 IAs reciben el MISMO prompt** — innegociable; es lo que hace honesto el comparativo.
- **Anclaje a hechos > confiar en la memoria del modelo.** El bug del "DT viejo" probó que pedir "contexto" sin darlo invita a alucinar. La solución (dossier + regla dura) volvió el bug *estructuralmente imposible*.
- **Calibración (Brier) > acierto crudo.** Acertar al favorito no dice si estabas bien calibrado.
- **Estética editorial premium** (oscuro, Fraunces, un solo acento) en vez de cartoon: el público general percibe seriedad.
- **Accesibilidad y performance**: `prefers-reduced-motion`, sólo GPU (transform/opacity), CLS 0, estados de error limpios.
- **Verificar contra la realidad, no contra la investigación**: "API-Football free cubre 2026" resultó falso al conectar; el pivote a openfootball salió de probar, no de asumir.
- **Imágenes OG sólidas, no foto**: una foto pesaba >800 KB y WhatsApp no mostraba el thumbnail; sólido pesa ~70 KB.
- **Convención `.js` en imports de `/api`**: obligatoria para que Vercel resuelva los módulos en producción.

---

## 17. Roadmap / pendientes

- **Fase 4 — Señal de valor**: integrar cuotas reales (The Odds API) para comparar la probabilidad final de las IAs contra el mercado y marcar "valor" donde difieran. Los tipos (`cuotaMercado`, `senalValor`) y la UI (`SenalValor.tsx`) ya existen; falta el adaptador de datos.
- **Calibrar el modelo base** con resultados históricos (2018/2022).
- **Imagen "veredicto" post-partido** (reverso compartible del Choque) usando la autopsia.
- **Cruce más rico jugador↔predicción** si aparece una fuente gratis de alineaciones/minutos para 2026.

---

## 18. Aviso legal

Las predicciones son **informativas y de entretenimiento**. No constituyen consejo de apuestas ni garantía de resultado. El fútbol es incierto por diseño — justamente por eso la app mide y muestra su propia incertidumbre con honestidad.

---

*PronostiGol HeredIA — construido por un solo desarrollador. Mundial FIFA 2026.*
