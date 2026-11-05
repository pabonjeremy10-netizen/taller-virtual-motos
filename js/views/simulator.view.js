/* =====================================================================
   simulator.view.js — Contenedor del simulador 3D (iframe).
   Modos:  práctica libre  |  desafío del curso (?modo=desafio&id=…).
   - Registra la práctica (duración) para el estudiante.
   - En un desafío, recibe el resultado del simulador (postMessage) y lo
     entrega al servicio de progreso, que decide si es válido.
   ===================================================================== */
(function (App) {
  "use strict";

  const { $ } = App.Utils;
  let practiceId = null;
  let cur = null;          // sesión abierta: { user, modo, mod, ret }
  let lastResult = null;   // respuesta del servicio de progreso al último resultado
  let onLeave = () => {};

  function endPractice() {
    if (practiceId === null) return;
    App.Activity.end(practiceId);
    practiceId = null;
  }

  function onMessage(e) {
    if (!cur || e.source !== $("#sim-frame").contentWindow) return;
    const d = e.data || {};
    if (d.tipo === "desafio-resultado") {
      // El personal solo prueba el desafío: no se registra nada.
      if (cur.modo === "desafio" && !App.Auth.isStaff(cur.user)) lastResult = App.Progress.recordChallenge(cur.user.id, cur.mod, d);
    } else if (d.tipo === "desafio-salir") {
      onLeave();
    }
  }

  App.Views.Simulator = {
    // onBack() lo define el enrutador (app.js)
    init(onBack) {
      onLeave = onBack;
      $("#sim-back").addEventListener("click", onBack);
      window.addEventListener("message", onMessage);
      window.addEventListener("pagehide", endPractice); // si cierran la pestaña
    },

    // opts: { modo: "practica" | "desafio", id, mod, ret }. Devuelve false si no se puede abrir.
    open(user, opts) {
      opts = opts || {};
      const staff = App.Auth.isStaff(user);
      const frame = $("#sim-frame");
      let src;
      if (opts.modo === "desafio") {
        const def = App.Challenges.byId(opts.id);
        if (!def) return false;
        if (!staff && !App.Progress.canChallenge(user.id, def.modulo).ok) return false;
        cur = { user, modo: "desafio", mod: def.modulo, ret: opts.ret };
        src = App.Config.SIMULATOR_URL + "?modo=desafio&id=" + encodeURIComponent(def.id) + "&t=" + Date.now();   // t fuerza una moto limpia
        $("#sim-mode").textContent = staff ? "Desafío " + def.modulo + " · modo supervisión" : "Desafío del Módulo " + def.modulo;
      } else {
        cur = { user, modo: "practica", ret: null };
        src = App.Config.SIMULATOR_URL + "?modo=practica";
        $("#sim-mode").textContent = staff ? "Modo supervisión" : "Modo práctica";
      }
      lastResult = null;
      endPractice();
      practiceId = staff ? null : App.Activity.start(user.correo);
      if (opts.modo === "desafio" || frame.getAttribute("src") !== src) frame.src = src;
      return true;
    },

    // Datos para volver al curso (p. ej. al módulo del desafío) con un aviso del resultado.
    takeReturn() {
      let nav = null;
      if (cur && cur.modo === "desafio" && cur.ret) {
        let aviso = null;
        if (lastResult && lastResult.ok) {
          aviso = lastResult.completado
            ? { tipo: "ok", texto: "¡Desafío superado! Completaste el Módulo " + cur.mod + (lastResult.siguiente ? ": ya está disponible el Módulo " + lastResult.siguiente + "." : ". ¡Terminaste el curso!") }
            : { tipo: "ok", texto: "¡Desafío superado!" };
        } else if (lastResult) {
          aviso = { tipo: "bad", texto: lastResult.error };
        }
        nav = Object.assign({}, cur.ret, { aviso });
      }
      lastResult = null; cur = null;
      return nav;
    },

    // Al volver al menú: termina la práctica pero deja el simulador cargado.
    close: endPractice,

    // Al cerrar sesión: además libera el simulador de la memoria.
    unload() {
      endPractice(); cur = null; lastResult = null;
      $("#sim-frame").src = "about:blank";
    }
  };
})(window.App);
