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
  KEYS: Object.freeze({ session: "motos3d.session", users: "motos3d.users", log: "motos3d.log" })
});
