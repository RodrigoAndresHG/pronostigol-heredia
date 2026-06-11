import { canalConSeguimiento, lmsConSeguimiento } from '../marca/enlaces.ts';
import IconoWhatsApp from './IconoWhatsApp';

/**
 * Módulos de captación de tráfico — editoriales, no anuncios.
 *
 * Dos destinos:
 *   - CanalWhatsApp → suscripción al canal (audiencia recurrente de fútbol).
 *   - PuenteMetodo  → LMS / workshop (convierte al curioso del método).
 *
 * Cada uno tiene dos variantes:
 *   - "banda": módulo completo con kicker + titular Fraunces + CTA.
 *   - "linea": fila compacta para cierres de página sin robar protagonismo.
 *
 * Estética: superficie del mismo tono midnight, un solo acento. El logo de
 * WhatsApp usa su verde oficial #25D366 (única excepción cromática autorizada).
 */

// ─── Canal de WhatsApp ───────────────────────────────────────────────

export function CanalWhatsApp({
  variante = 'banda',
  contexto = 'predicción',
}: {
  variante?: 'banda' | 'linea';
  contexto?: string;
}) {
  if (variante === 'linea') {
    return (
      <a
        href={canalConSeguimiento('canal-linea')}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-4 rounded-lg border border-verde/25 bg-verde/[0.05] px-5 py-4 hover:border-verde/50 transition-colors duration-200 ease-editorial"
      >
        <span className="flex items-center gap-3">
          <IconoWhatsApp className="w-5 h-5 flex-shrink-0 text-[#25D366]" />
          <span className="text-[15px] text-tinta-cuerpo">
            Recibe cada {contexto} en el{' '}
            <span className="text-tinta-titulo font-semibold">Canal de WhatsApp</span>
          </span>
        </span>
        <span className="font-mono text-[13px] text-verde whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
          Unirme →
        </span>
      </a>
    );
  }

  return (
    <section className="rounded-lg border border-verde/25 bg-verde/[0.05] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <IconoWhatsApp className="w-6 h-6 text-[#25D366]" />
        <p className="kicker text-verde">Canal de WhatsApp · gratis</p>
      </div>
      <h3 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo leading-snug max-w-[24ch]">
        Recibe cada predicción antes del partido.
      </h3>
      <p className="mt-2 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
        El consenso de las 3 IAs y las señales de valor, directo a tu WhatsApp.
        Sin spam — solo predicciones.
      </p>
      <a
        href={canalConSeguimiento('canal-banda')}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-md bg-verde text-tinta-fondo font-semibold text-[15px] hover:bg-verde-hover transition-colors"
      >
        Unirme al canal <span aria-hidden>→</span>
      </a>
    </section>
  );
}

// ─── Puente al método / LMS ──────────────────────────────────────────

export function PuenteMetodo({
  variante = 'banda',
  contenido = 'app',
  gancho = 'general',
}: {
  variante?: 'banda' | 'linea';
  /** Identificador UTM del punto de origen del clic. */
  contenido?: string;
  /** Qué titular usar, según la página. */
  gancho?: 'general' | 'credibilidad' | 'metodo';
}) {
  const url = lmsConSeguimiento(contenido);

  const titulares: Record<string, string> = {
    general: 'Esto que ves, lo construyes tú.',
    credibilidad: 'La transparencia no es suerte: es método.',
    metodo: 'Tres IAs en consenso no es magia. Es un método.',
  };
  const titulo = titulares[gancho] ?? titulares.general;

  if (variante === 'linea') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-4 rounded-lg border border-tinta-lineaFuerte bg-tinta-elevado px-5 py-4 hover:border-cyan/40 transition-colors duration-200 ease-editorial"
      >
        <span className="text-[15px] text-tinta-cuerpo">
          Aprende a aplicar este método con IA a tu negocio
        </span>
        <span className="font-mono text-[13px] text-cyan whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
          El workshop →
        </span>
      </a>
    );
  }

  return (
    <section className="rounded-lg border border-tinta-lineaFuerte bg-tinta-elevado p-6 sm:p-8">
      <p className="kicker text-cyan">La metodología HeredIA</p>
      <h3 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-tinta-titulo leading-snug max-w-[26ch]">
        {titulo}
      </h3>
      <p className="mt-2 max-w-lectura text-[15px] text-tinta-cuerpo leading-relaxed">
        Comparar 3 IAs, medir su consenso y detectar dónde el mercado se
        equivoca es un proceso que puedes aplicar a tu negocio. Te enseño el
        método completo en el workshop.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-md border border-cyan/40 text-cyan font-semibold text-[15px] hover:bg-cyan/10 transition-colors"
      >
        Conocer el workshop <span aria-hidden>→</span>
      </a>
    </section>
  );
}
