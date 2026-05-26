/**
 * Verificación del código de admin.
 *
 * El código se envía en el header `X-Codigo-Admin`. Comparamos contra
 * la env var `CODIGO_ADMIN`. La comparación es "constant-time" para
 * evitar timing attacks — sobrecarga teórica para una app personal,
 * pero buen hábito y le da seriedad a la marca.
 *
 * Fail-closed: si CODIGO_ADMIN no está configurada, ningún POST se
 * autoriza. Sin código en env, no hay generaciones — es más seguro
 * exigir el setup explícito que dejar la puerta abierta por descuido.
 */

export function esAdmin(codigoRecibido: string | undefined | null): boolean {
  const esperado = process.env.CODIGO_ADMIN;

  // Fail-closed: sin CODIGO_ADMIN configurado, no se acepta nada.
  if (!esperado || esperado.length < 16) return false;
  if (!codigoRecibido) return false;
  if (codigoRecibido.length !== esperado.length) return false;

  // Comparación de tiempo constante.
  let diff = 0;
  for (let i = 0; i < codigoRecibido.length; i++) {
    diff |= codigoRecibido.charCodeAt(i) ^ esperado.charCodeAt(i);
  }
  return diff === 0;
}
