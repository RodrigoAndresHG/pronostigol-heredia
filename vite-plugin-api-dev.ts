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

        // El cron en local no está soportado — Vercel lo ejecuta automático.
        // Si alguien lo intenta, mensaje claro en JSON, no falsa OK.
        if (url.pathname.startsWith('/api/cron/')) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error:
                'El cron sólo corre en producción (Vercel). En local actívalo manualmente llamando a POST /api/predecir.',
            })
          );
          return;
        }

        // /api/og-imagen → genera el PNG compartible (firma VercelRequest/Response).
        // Adaptamos el res de Node con un shim mínimo (status/send/setHeader).
        if (url.pathname === '/api/og-imagen') {
          try {
            const query: Record<string, string> = {};
            for (const [k, v] of url.searchParams.entries()) query[k] = v;

            const vreq = { query, headers: req.headers, method: req.method ?? 'GET' };
            const vres = {
              setHeader: (k: string, v: string) => res.setHeader(k, v),
              status(code: number) {
                res.statusCode = code;
                return this;
              },
              send(data: unknown) {
                res.end(data as Buffer | string);
                return this;
              },
            };

            const mod = await server.ssrLoadModule('/api/og-imagen.ts');
            await mod.default(vreq, vres);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
          }
          return;
        }

        // /api/registro → proxy POST al LMS. Parsea el body JSON y expone un
        // shim VercelRequest/Response con .json() sobre el res de Node.
        if (url.pathname === '/api/registro') {
          try {
            let body: unknown = {};
            if (req.method === 'POST') {
              const chunks: Buffer[] = [];
              for await (const chunk of req) chunks.push(chunk as Buffer);
              const texto = Buffer.concat(chunks).toString('utf-8');
              if (texto) {
                try {
                  body = JSON.parse(texto);
                } catch {
                  /* JSON inválido; el handler devolverá 400 por correo faltante */
                }
              }
            }
            const vreq = {
              method: req.method ?? 'GET',
              query: {},
              body,
              headers: req.headers,
            };
            const vres = {
              setHeader: (k: string, v: string) => res.setHeader(k, v),
              status(code: number) {
                res.statusCode = code;
                return this;
              },
              json(data: unknown) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return this;
              },
            };
            const mod = await server.ssrLoadModule('/api/registro.ts');
            await mod.default(vreq, vres);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
          }
          return;
        }

        // /api/historial, /api/goleadores, /api/posiciones, /api/predicciones →
        // endpoints JSON de lectura. Shim de VercelRequest/Response sobre Node.
        if (
          url.pathname === '/api/historial' ||
          url.pathname === '/api/goleadores' ||
          url.pathname === '/api/posiciones' ||
          url.pathname === '/api/predicciones'
        ) {
          try {
            const query: Record<string, string> = {};
            for (const [k, v] of url.searchParams.entries()) query[k] = v;
            const vreq = { query, headers: req.headers, method: req.method ?? 'GET' };
            const vres = {
              setHeader: (k: string, v: string) => res.setHeader(k, v),
              status(code: number) {
                res.statusCode = code;
                return this;
              },
              json(data: unknown) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return this;
              },
            };
            const mod = await server.ssrLoadModule(`${url.pathname}.ts`);
            await mod.default(vreq, vres);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
          }
          return;
        }

        // /api/meta sólo corre en producción (rewrite en vercel.json). En dev,
        // Vite sirve /partido/:id como SPA directamente.
        if (url.pathname === '/api/meta') {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'api/meta sólo corre en producción.' }));
          return;
        }

        // Cualquier otra ruta /api/* desconocida → 404 explícito.
        if (url.pathname !== '/api/predecir') {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({ error: `Ruta no encontrada: ${url.pathname}` })
          );
          return;
        }

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
          const mod = await server.ssrLoadModule('/api/_lib/router.js');
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
