/* =====================================================================
   components.js — Piezas de interfaz reutilizables (devuelven HTML ya escapado).
   ===================================================================== */
(function (App) {
  "use strict";
  const { esc } = App.Utils;

  const CLASES = { bloqueado: "st-lock", disponible: "st-avail", progreso: "st-prog", evaluacion: "st-warn", desafio: "st-warn", completado: "st-ok" };
  const ICONOS = { bloqueado: "🔒", disponible: "▶", progreso: "⏳", evaluacion: "📝", desafio: "🔧", completado: "✅" };

  App.UI = {
    bar: (pct, extra) => `<div class="pbar ${extra || ""}" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`,
    chip: (text, cls) => `<span class="chip ${cls || ""}">${esc(text)}</span>`,
    estado: (st) => `<span class="estado ${CLASES[st.codigo]}">${ICONOS[st.codigo]} ${esc(st.etiqueta)}</span>`,
    nivel: (m) => `<span class="lvl lvl-${esc(m.clase)}">${esc(m.nivel)}</span>`,
    paragraphs: (list) => list.map((t) => `<p>${esc(t)}</p>`).join("")
  };
})(window.App);
