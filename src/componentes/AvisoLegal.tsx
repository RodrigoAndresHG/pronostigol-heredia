/**
 * Aviso legal permanente al pie de la app.
 *
 * Crítico: las predicciones no son consejo de apuestas. Este componente
 * vive siempre visible en el layout para que cualquier captura de
 * pantalla que se comparta también incluya el aviso.
 */
function AvisoLegal() {
  return (
    <footer className="mt-12 border-t border-marca-grisLinea bg-white">
      <div className="max-w-3xl mx-auto px-4 py-6 text-xs text-marca-grisTexto leading-relaxed">
        <p className="font-semibold text-marca-tinta mb-1">
          Aviso importante
        </p>
        <p>
          Las predicciones de PronostiGol HeredIA son análisis con fines
          informativos y de entretenimiento. No constituyen consejo de
          apuestas ni garantía de resultado. Apuesta sólo lo que estés
          dispuesto a perder y, sobre todo, infórmate por tu cuenta.
        </p>
        <p className="mt-3 text-marca-grisTexto/70">
          © {new Date().getFullYear()} HeredIA · Hecho desde Ambato, Ecuador.
        </p>
      </div>
    </footer>
  );
}

export default AvisoLegal;
