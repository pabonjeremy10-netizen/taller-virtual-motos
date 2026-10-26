/* =====================================================================
   utils.js — Funciones auxiliares sin lógica de negocio.
   ===================================================================== */
(function (App) {
  "use strict";

  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  App.Utils = {
    $: (selector, root = document) => root.querySelector(selector),
    $$: (selector, root = document) => [...root.querySelectorAll(selector)],
    // Escapa texto antes de insertarlo como HTML (evita inyección de código).
    esc: (text) => String(text).replace(/[&<>"']/g, (c) => ESC[c]),
    isEmail: (text) => /^\S+@\S+\.\S+$/.test(text),
    formatDate: (iso) => new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }),
    formatDuration(seconds) {
      if (!seconds || seconds < 1) return "—";
      if (seconds < 60) return seconds + " s";
      const min = Math.round(seconds / 60);
      return min < 60 ? min + " min" : Math.floor(min / 60) + " h " + (min % 60) + " min";
    }
  };
})(window.App);
