/* =====================================================================
   config.js — Configuración global. Aquí nace el espacio de nombres App,
   al que se enganchan todas las demás capas.
   ===================================================================== */
window.App = window.App || {};
App.Views = {};

App.Config = Object.freeze({
  // Ruta del simulador 3D (relativa a index.html). Cámbiala si mueves la carpeta.
  SIMULATOR_URL: "simulador/simulador.html",
  // Claves usadas en el almacenamiento del navegador.
  KEYS: Object.freeze({
    session: "motos3d.session", users: "motos3d.users", log: "motos3d.log",
    progress: "motos3d.progreso", attempts: "motos3d.intentos", challenges: "motos3d.desafios",
    settings: "motos3d.ajustes", bank: "motos3d.banco"
  }),
  EXAM_SIZE: 10,        // preguntas por evaluación
  PASS_DEFAULT: 70      // % mínimo para aprobar (configurable desde Administración)
});
