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
├── api/                  # Funciones serverless (Fase 3+)
├── public/               # Estáticos (favicon, íconos PWA)
├── src/
│   ├── componentes/      # Piezas reutilizables (BarraNavegacion, AvisoLegal)
│   ├── paginas/          # Una por ruta (Inicio, Calendario, DetallePartido, …)
│   ├── lib/              # Lógica de negocio (modeloBase, sintesis) — Fase 2+
│   ├── datos/            # Mocks y datasets estáticos — Fase 1
│   ├── tipos/            # Tipos TypeScript compartidos — Fase 1
│   ├── App.tsx           # Layout + rutas
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Tailwind + estilos base
├── .env.example          # Plantilla de variables (sin secretos)
├── tailwind.config.js    # Paleta de marca HeredIA
├── vite.config.ts        # Vite + PWA
└── vercel.json           # Configuración de despliegue
```

---

## Roadmap

| Fase | Entregable                                            | Estado |
| ---- | ----------------------------------------------------- | ------ |
| 0    | Esqueleto desplegable + landing                       | ✅      |
| 1    | UI completa con dataset mock (48 equipos, 12 grupos)  | ⏳      |
| 2    | Modelo base de probabilidad (Elo + forma + descanso)  | ⏳      |
| 3    | Backend serverless con las 3 IAs + síntesis           | ⏳      |
| 4    | Datos reales de fútbol y cuotas de mercado            | ⏳      |
| 5    | Supabase: persistencia + historial real               | ⏳      |
| 6    | Compartir, íconos PWA, pulido visual                  | ⏳      |
| 7    | Launch · 11 de junio de 2026                          | ⏳      |

---

## Aviso

Las predicciones de PronostiGol HeredIA son análisis con fines informativos
y de entretenimiento. **No constituyen consejo de apuestas ni garantía de
resultado.**
