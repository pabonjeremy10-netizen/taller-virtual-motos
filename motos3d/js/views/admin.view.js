/* =====================================================================
   admin.view.js — Menú de administrador/docente: usuarios y reportes.
   ===================================================================== */
(function (App) {
  "use strict";

  const { $, $$, esc, formatDate, formatDuration } = App.Utils;

  function renderUsers() {
    const rows = App.Users.students();
    $("#users-body").innerHTML = rows.length ? rows.map((u) => `
      <tr><td>${esc(u.nombre)}</td><td>${esc(u.correo)}</td>
      <td><span class="chip ${u.activo ? "ok" : "off"}">${u.activo ? "Activo" : "Desactivado"}</span></td>
      <td><button class="btn small" data-toggle="${u.id}">${u.activo ? "Desactivar" : "Activar"}</button></td></tr>`).join("")
      : `<tr><td colspan="4" class="muted">No hay estudiantes. Agrega el primero con el formulario.</td></tr>`;
  }

  function renderReports() {
    const students = App.Users.students();
    const { rows, totalPractices } = App.Activity.summary(students);
    const max = Math.max(1, ...rows.map((r) => r.count));
    $("#stats").innerHTML = [
      [students.length, "Estudiantes"],
      [students.filter((u) => u.activo).length, "Cuentas activas"],
      [totalPractices, "Prácticas registradas"]
    ].map(([n, t]) => `<div class="stat"><b>${n}</b>${t}</div>`).join("");

    $("#report-body").innerHTML = rows.length ? rows.map((r) => `
      <tr><td>${esc(r.user.nombre)}</td><td>${r.count}</td>
      <td><span class="bar" style="width:${Math.round((r.count / max) * 120)}px"></span></td>
      <td>${esc(formatDuration(r.seconds))}</td>
      <td class="muted">${r.last ? esc(formatDate(r.last)) : "Sin prácticas"}</td></tr>`).join("")
      : `<tr><td colspan="5" class="muted">Aún no hay datos de uso.</td></tr>`;
  }

  function setMessage(text, isError) {
    const el = $("#add-msg");
    el.textContent = text;
    el.classList.toggle("is-error", isError);
    el.classList.toggle("is-ok", !isError);
  }

  App.Views.Admin = {
    init() {
      // Pestañas
      $$("[data-tab]").forEach((tab) => tab.addEventListener("click", () => {
        $$("[data-tab]").forEach((x) => x.setAttribute("aria-selected", String(x === tab)));
        ["usuarios", "reportes", "simulador"].forEach((n) => { $("#tab-" + n).hidden = n !== tab.dataset.tab; });
        if (tab.dataset.tab === "reportes") renderReports();
      }));

      // Activar / desactivar estudiante
      $("#users-body").addEventListener("click", (e) => {
        const id = Number(e.target.dataset.toggle);
        if (id && App.Users.toggleActive(id)) { renderUsers(); renderReports(); }
      });

      // Agregar estudiante
      $("#add-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const result = App.Users.addStudent({ nombre: $("#n-nombre").value, correo: $("#n-correo").value, clave: $("#n-clave").value });
        if (!result.ok) return setMessage(result.error, true);
        e.target.reset();
        renderUsers(); renderReports();
        setMessage("Estudiante agregado: " + result.user.nombre + ".", false);
      });
    },

    render(user) {
      $("#ad-name").textContent = user.nombre + " (" + user.rol + ")";
      renderUsers();
      renderReports();
    }
  };
})(window.App);
