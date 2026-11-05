/* =====================================================================
   challenges.js — Acceso a las definiciones de los desafíos. Las
   definiciones viven en simulador/desafios/ (una por archivo); aquí solo
   se consultan. La validación de pasos ocurre dentro del simulador.
   ===================================================================== */
(function (App) {
  "use strict";
  App.Challenges = {
    forModule: (mod) => (window.DESAFIOS && window.DESAFIOS.delModulo(mod)) || null,
    byId: (id) => (window.DESAFIOS && window.DESAFIOS.obtener(id)) || null,
    all: () => (window.DESAFIOS ? window.DESAFIOS.todos() : [])
  };
})(window.App);
