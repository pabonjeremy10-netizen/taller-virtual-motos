/* =====================================================================
   student.view.js — Menú del estudiante: saludo, accesos directos y paneles.
   ===================================================================== */
(function (App) {
  "use strict";

  const { $, $$, esc, formatDate, formatDuration } = App.Utils;
  let user = null;

  const PANELS = {
    guias: () => `<h2>Guías de mecánica y taller</h2><ul class="list">${App.Seed.guides.map(([t, d]) =>
      `<li><div><strong>${esc(t)}</strong><br><span class="muted">${esc(d)}</span></div></li>`).join("")}</ul>`,

    historial: () => {
      const mine = App.Activity.byUser(user.correo).slice().reverse();
      if (!mine.length) return `<h2>Historial de prácticas</h2><p class="muted">Todavía no tienes prácticas. Entra al simulador para registrar la primera.</p>`;
      return `<h2>Historial de prácticas</h2><ul class="list">${mine.map((l) =>
        `<li><span>Práctica en el simulador <span class="muted">· ${esc(formatDuration(l.duracionSeg))}</span></span><span class="muted">${esc(formatDate(l.fecha))}</span></li>`).join("")}</ul>`;
    },

    evaluaciones: () => `<h2>Evaluaciones</h2><ul class="list">${App.Seed.exams.map(([t, e]) =>
      `<li><span>${esc(t)}</span><span class="chip ${e.startsWith("Comp") ? "ok" : ""}">${esc(e)}</span></li>`).join("")}</ul>`
  };

  function closePanel() {
    $("#st-panel").hidden = true;
    $$(".shortcut").forEach((b) => b.setAttribute("aria-pressed", "false"));
  }

  App.Views.Student = {
    init() {
      $$(".shortcut").forEach((btn) => btn.addEventListener("click", () => {
        const wasOpen = btn.getAttribute("aria-pressed") === "true";
        closePanel();
        if (wasOpen) return;
        btn.setAttribute("aria-pressed", "true");
        $("#st-panel").innerHTML = PANELS[btn.dataset.panel]();
        $("#st-panel").hidden = false;
      }));
    },

    render(currentUser) {
      user = currentUser;
      $("#st-name").textContent = user.nombre;
      $("#st-hello").textContent = "Hola, " + user.nombre.split(" ")[0];
      closePanel();
    }
  };
})(window.App);
