import { loadEnv, type Plugin } from 'vite';

/**
 * Plugin de Vite que sirve /api/* localmente durante `npm run dev`,
 * usando el mismo código que despliega Vercel en producción.
 *
 * Por qué existe:
 *   Vercel Functions sólo se ejecutan en su plataforma o con `vercel dev`.
 *   Pero para iterar rápido queremos que `npm run dev` baste.
 *   Este middleware monta los handlers de /api como middleware Express-ish
 *   en el server de Vite, llamando a la misma función `manejarPrediccion`
 *   que el handler de Vercel — así dev y prod son indistinguibles.
 *
 * También carga .env.local en process.env (Vite no lo hace para SSR
 * por defecto). Sin esto las claves de API no llegan al handler.
 */
export function apiDevPlugin(): Plugin {
  return {
    name: 'pronostigol-api-dev',

    config(_config, { mode }) {
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

        const url = new URL(req.url, 'http://localhost');
        if (url.pathname !== '/api/predecir') return next();

        try {
          // Construimos el objeto que espera el router.
          const query: Record<string, string | undefined> = {};
          for (const [k, v] of url.searchParams.entries()) {
            query[k] = v;
          }

          let body: unknown = {};
          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(chunk as Buffer);
            }
            const texto = Buffer.concat(chunks).toString('utf-8');
            if (texto) {
              try {
                body = JSON.parse(texto);
              } catch {
                /* JSON inválido; el router devolverá 400 al ver partidoId faltante */
              }
            }
          }

          const headers: Record<string, string | undefined> = {};
          for (const [k, v] of Object.entries(req.headers)) {
            headers[k.toLowerCase()] = Array.isArray(v) ? v[0] : v;
          }

          // Llamamos al router compartido (el mismo que usa Vercel).
          const mod = await server.ssrLoadModule('/api/_lib/router.ts');
          const manejar = mod.manejarPrediccion as (entrada: {
            method: string;
            query: Record<string, string | undefined>;
            body: unknown;
            headers: Record<string, string | undefined>;
          }) => Promise<{ status: number; json: Record<string, unknown> }>;

          const resultado = await manejar({
            method: req.method ?? 'GET',
            query,
            body,
            headers,
          });

          res.statusCode = resultado.status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Cache', 'BYPASS-DEV');
          res.end(JSON.stringify(resultado.json));
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
