/* =====================================================================
   storage.js — Único lugar que toca localStorage / sessionStorage.
   Si algún día se cambia por una API/servidor, solo se reemplaza esta capa
   y los servicios.
   ===================================================================== */
(function (App) {
  "use strict";

  const parse = (raw, fallback) => {
    try { const v = JSON.parse(raw); return v ?? fallback; } catch { return fallback; }
  };

  App.Storage = {
    // Persistente (datos de la aplicación)
    getLocal: (key, fallback) => parse(localStorage.getItem(key), fallback),
    setLocal: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    hasLocal: (key) => localStorage.getItem(key) !== null,
    // De sesión (se pierde al cerrar la pestaña)
    getSession: (key) => parse(sessionStorage.getItem(key), null),
    setSession: (key, value) => sessionStorage.setItem(key, JSON.stringify(value)),
    removeSession: (key) => sessionStorage.removeItem(key)
  };
})(window.App);
