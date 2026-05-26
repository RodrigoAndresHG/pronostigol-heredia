# PronostiGol HeredIA

> Predicciones del Mundial 2026 con consenso de 3 IAs y señales de valor vs mercado.
> Vitrina pública de la metodología **HeredIA** aplicada a fútbol.

---

## ¿Qué hace esta app?

Para cada partido del Mundial 2026 (11 jun – 19 jul) entrega:

1. **Probabilidad base** calculada con un modelo estadístico simple y explicable
   (rating Elo + forma + descanso + sede).
2. **Tres IAs en paralelo** (Claude, GPT, Gemini) opinando sobre el mismo
   partido, con su propia probabilidad ajustada, confianza y explicación.
3. **Síntesis honesta**: si las IAs coinciden → consenso de alta confianza;
   si discrepan → se muestra el desacuerdo en lugar de esconderlo.
4. **Señal de valor**: la probabilidad final se compara contra la cuota del
   mercado. Si hay diferencia significativa, se marca y se explica.
5. **Historial completo** con aciertos y fallos, sin maquillaje.

Las predicciones **no son consejo de apuestas** — son análisis con fines
informativos.

---

## Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind v3 + react-router 7
- **PWA:** `vite-plugin-pwa` (instalable en pantalla de inicio)
- **Backend ligero:** funciones serverless en `/api` (Node, despliegue en Vercel)
- **Persistencia:** Supabase (Postgres) — Fase 5
- **APIs externas:** football-data.org + The Odds API — Fase 4

---

## Cómo correrlo en local

Requisitos: Node ≥ 20, npm ≥ 10.

```bash
git clone <url-del-repo> pronostigol-heredia
cd pronostigol-heredia
npm install

# Copia el archivo de ejemplo y, cuando vayas a probar integraciones,
# llena las claves. Mientras estén vacías, la app cae a datos mock.
cp .env.example .env.local

npm run dev
```

Abre <http://localhost:5173>. La app es mobile-first; abre el devtool de
móvil (Cmd+Shift+M en Chrome) para verla como en celular.

---

## Variables de entorno

Todas viven en `.env.local` (NUNCA en el repo). Ver `.env.example` para el
listado completo y de dónde sacar cada clave.

| Variable                       | Fase | Para qué                                  |
| ------------------------------ | ---- | ----------------------------------------- |
| `ANTHROPIC_API_KEY`            | 3    | IA #1 — Claude                            |
| `OPENAI_API_KEY`               | 3    | IA #2 — GPT                               |
| `GOOGLE_API_KEY`               | 3    | IA #3 — Gemini                            |
| `FOOTBALL_DATA_API_KEY`        | 4    | Calendario y resultados                   |
| `ODDS_API_KEY`                 | 4    | Cuotas del mercado                        |
| `VITE_SUPABASE_URL`            | 5    | Lectura de historial desde el frontend    |
| `VITE_SUPABASE_ANON_KEY`       | 5    | Lectura de historial desde el frontend    |
| `SUPABASE_SERVICE_ROLE_KEY`    | 5    | Escritura de predicciones desde `/api`    |

**Regla de oro:** sólo las claves prefijadas con `VITE_` se exponen al
navegador. Todas las claves de IA y las de servicio se quedan en
serverless y se llaman a través de `/api/*`.

---

## Despliegue en Vercel

1. Crea un repo en GitHub y sube este proyecto.
2. En Vercel: **New Project → Import** del repo.
3. Vercel detecta Vite automáticamente. Confirma:
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Project Settings → Environment Variables**: pega cada variable de
   `.env.example` con su valor. Marca el entorno (Production / Preview /
   Development).
5. Deploy. En cada push a `main` Vercel redespliega.

Las funciones de la carpeta `/api` se despliegan como serverless functions
automáticamente — no necesitas un servidor aparte.

---

## Estructura del proyecto

```
pronostigol-heredia/
├── api/                       # Funciones serverless (Vercel + middleware de Vite)
│   ├── predecir.ts            # POST /api/predecir
│   └── _lib/
│       ├── core.ts            # función predecir() — 3 IAs en paralelo + síntesis
│       ├── prompt.ts          # construye el prompt idéntico para las 3
│       ├── parser.ts          # extracción + normalización de JSON
│       ├── iaClaude.ts        # adaptador Anthropic
│       ├── iaGPT.ts           # adaptador OpenAI
│       ├── iaGemini.ts        # adaptador Google
│       └── sintesis.ts        # veredicto consenso/desacuerdo + prob final
├── public/                    # Estáticos (favicon, íconos PWA)
├── scripts/
│   └── validar-datos.ts       # Verifica integridad del dataset
├── tests/
│   └── modeloBase.test.ts     # Tests del modelo base
├── src/
│   ├── componentes/           # Piezas reutilizables
│   ├── paginas/               # Una por ruta
│   ├── lib/                   # modeloBase, usePrediccionApi, zonaHoraria, formato
│   ├── datos/                 # Equipos, grupos, partidos, predicciones mock
│   ├── tipos/                 # Tipos TS compartidos
│   ├── App.tsx                # Layout + rutas
│   ├── main.tsx               # Punto de entrada
│   └── index.css              # Tailwind + estilos base
├── .env.example               # Plantilla de variables
├── tailwind.config.js         # Paleta de marca HeredIA
├── vite.config.ts             # Vite + PWA + middleware /api dev
├── vite-plugin-api-dev.ts     # Plugin que sirve /api durante npm run dev
└── vercel.json                # Configuración de despliegue
```

---

## Modelo "publicación" — quién genera vs quién lee

Las predicciones funcionan en un modelo editorial:

- **Tú generas** (admin con código). Disparas las 3 IAs cuando quieras.
- **El público lee.** Cualquiera que entra al partido ve la última
  predicción publicada con su timestamp. Cero tokens quemados.
- **Se guarda en Supabase.** Cada generación inserta una fila nueva
  (no sobreescribe) — el historial queda auditable.

### Setup de Supabase (~10 min, una vez)

1. Crea un proyecto en `supabase.com` (nombre: `pronostigol-heredia`).
2. **SQL Editor → New query**: pega el contenido de `supabase/schema.sql`
   y dale Run. Verifica que aparezca la tabla `predicciones` en el
   Table Editor.
3. **Project Settings → API**: anota
   - Project URL → `VITE_SUPABASE_URL`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (NUNCA al frontend)

### Setup del código admin

Genera un código aleatorio largo:
```bash
openssl rand -hex 32
```
Y mételo en `.env.local` como `CODIGO_ADMIN`. Mínimo 16 caracteres
(el backend rechaza claves cortas).

### `.env.local` completa para empezar

```env
# Las 3 IAs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Tu código admin
CODIGO_ADMIN=<resultado de openssl rand -hex 32>
```

### Flujo en local

1. `npm run dev`.
2. Abre `http://localhost:5173/partido/A-MD1-1?admin=<tu-codigo-admin>`.
   El query param se guarda en localStorage y se limpia de la URL.
3. Verás la banda "🔐 Modo admin" y el botón "Generar y publicar predicción".
4. Tocas el botón. 5-20 segundos después la predicción está publicada.
5. Cierra sesión o abre una ventana incognito: verás la misma predicción
   pero sin botón — eres "el público" ahora.

Sin `?admin=...`, eres visitante. Sólo ves las predicciones publicadas.

---

## Roadmap

| Fase | Entregable                                            | Estado |
| ---- | ----------------------------------------------------- | ------ |
| 0    | Esqueleto desplegable + landing                       | ✅      |
| 1    | UI completa con dataset oficial (48 equipos, 72 partidos) | ✅  |
| 2    | Modelo base de probabilidad (Elo + sede + forma + descanso) | ✅ |
| 3    | Backend serverless con las 3 IAs + síntesis           | ✅      |
| 3.5  | Modelo publicación: admin genera, Supabase persiste, público lee | ✅ |
| 4    | Datos reales de fútbol y cuotas de mercado            | ⏳      |
| 5    | Supabase: persistencia + historial real               | ⏳      |
| 6    | Compartir, íconos PWA, pulido visual                  | ⏳      |
| 7    | Launch · 11 de junio de 2026                          | ⏳      |

---

## Aviso

Las predicciones de PronostiGol HeredIA son análisis con fines informativos
y de entretenimiento. **No constituyen consejo de apuestas ni garantía de
resultado.**
