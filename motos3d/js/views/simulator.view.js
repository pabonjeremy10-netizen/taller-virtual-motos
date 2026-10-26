/* =====================================================================
   simulator.view.js — Contenedor del simulador 3D (iframe) y registro de
   la práctica. El simulador en sí vive en la carpeta simulador/.
   ===================================================================== */
(function (App) {
  "use strict";

  const { $ } = App.Utils;
  let practiceId = null;

  // Cierra el registro de la práctica en curso (guarda la duración).
  function endPractice() {
    if (practiceId === null) return;
    App.Activity.end(practiceId);
    practiceId = null;
  }

  App.Views.Simulator = {
    // onBack() lo define el enrutador (app.js)
    init(onBack) {
      $("#sim-back").addEventListener("click", onBack);
      window.addEventListener("pagehide", endPractice); // si cierran la pestaña
    },

    // Estudiante: modo práctica (se registra). Administrador/docente: supervisión (no se registra).
    open(user) {
      const staff = App.Auth.isStaff(user);
      practiceId = staff ? null : App.Activity.start(user.correo);
      $("#sim-mode").textContent = staff ? "Modo supervisión" : "Modo práctica";
      const frame = $("#sim-frame");
      if (frame.getAttribute("src") !== App.Config.SIMULATOR_URL) frame.src = App.Config.SIMULATOR_URL;
    },

    // Al volver al menú: termina la práctica pero deja el simulador cargado.
    close: endPractice,

    // Al cerrar sesión: además libera el simulador de la memoria.
    unload() {
      endPractice();
      $("#sim-frame").src = "about:blank";
    }
  };
})(window.App);
