import { loadEnv, type Plugin } from 'vite';

/**
 * Plugin de Vite que sirve /api/* localmente durante `npm run dev`,
 * usando el mismo código que despliega Vercel en producción.
 *
 * Por qué existe:
 *   Vercel Functions sólo se ejecutan en su plataforma o con `vercel dev`.
 *   Pero para iterar rápido queremos que `npm run dev` (Vite) baste.
 *   Este middleware monta los handlers de /api como middleware Express-ish
 *   en el server de Vite.
 *
 * También se encarga de:
 *   - Cargar .env.local en process.env (Vite no lo hace para SSR por
 *     defecto). Sin esto las claves de API no llegan al handler.
 *   - Adaptar req/res de Node a la forma que esperan los handlers de Vercel.
 */
export function apiDevPlugin(): Plugin {
  return {
    name: 'pronostigol-api-dev',

    config(_config, { mode }) {
      // Cargamos todas las variables del .env (sin prefijo) y las metemos
      // en process.env para que las puedan leer los handlers /api.
      const env = loadEnv(mode, process.cwd(), '');
      for (const key of Object.keys(env)) {
        if (env[key] !== undefined && process.env[key] === undefined) {
          process.env[key] = env[key];
        }
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();

        // Sólo manejamos /api/predecir por ahora; el resto pasa al siguiente.
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname !== '/api/predecir') return next();

        try {
          // Leemos el body si es POST.
          let partidoId: string | undefined;
          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(chunk as Buffer);
            }
            const texto = Buffer.concat(chunks).toString('utf-8');
            if (texto) {
              try {
                const json = JSON.parse(texto);
                partidoId = json.partidoId;
              } catch {
                /* ignoramos JSON inválido y dejamos partidoId undefined */
              }
            }
          } else if (req.method === 'GET') {
            partidoId = url.searchParams.get('partidoId') ?? undefined;
          } else {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Sólo POST o GET' }));
            return;
          }

          if (!partidoId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Falta partidoId' }));
            return;
          }

          // Cargamos el módulo del core via SSR para que TS/ESM resuelva bien.
          const mod = await server.ssrLoadModule('/api/_lib/core.ts');
          const predecir = mod.predecir as (id: string) => Promise<unknown>;
          const prediccion = await predecir(partidoId);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'BYPASS-DEV');
          res.end(JSON.stringify(prediccion));
        } catch (err) {
          const mensaje = err instanceof Error ? err.message : String(err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: mensaje }));
        }
      });
    },
  };
}
