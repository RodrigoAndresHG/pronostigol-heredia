import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy server-to-server hacia el LMS para el juego "Compite contra las IAs".
 *
 * El navegador manda SOLO el correo (y el partidoId actual). Esta función,
 * en el servidor, añade la X-API-Key (que vive en EXTERNAL_API_KEY, nunca en
 * el cliente) y la reenvía al LMS, que dispara el enlace mágico de activación.
 *
 * NUNCA expone la key. Si falta la env var, falla claro (no silenciosamente).
 */

const LMS_ENDPOINT = 'https://builder.rodriheredia.com/api/external/registro';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sólo POST.' });
  }

  const key = process.env.EXTERNAL_API_KEY;
  if (!key) {
    return res
      .status(500)
      .json({ error: 'EXTERNAL_API_KEY no configurada en el servidor.' });
  }

  const body = (req.body ?? {}) as { email?: string; partidoId?: string };
  const email = (body.email ?? '').trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Correo inválido.' });
  }

  try {
    const r = await fetch(LMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify({
        email,
        signupSource: 'pronostigol-juego',
        partidoId: typeof body.partidoId === 'string' ? body.partidoId : undefined,
      }),
    });
    const data = (await r.json().catch(() => ({}))) as { ok?: boolean; isNew?: boolean; error?: string };
    if (!r.ok) {
      return res.status(502).json({ error: data?.error || `El LMS respondió ${r.status}.` });
    }
    return res.status(200).json({ ok: true, isNew: !!data.isNew });
  } catch (err) {
    return res
      .status(502)
      .json({ error: err instanceof Error ? err.message : 'No se pudo contactar el LMS.' });
  }
}
