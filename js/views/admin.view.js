/* =====================================================================
   admin.view.js — Menú de administrador/docente: usuarios, progreso,
   banco de preguntas, reportes, ajustes y simulador.
   Los permisos finos (editar banco, ajustes) se consultan con App.Auth.can.
   ===================================================================== */
(function (App) {
  "use strict";

  const { $, $$, esc, formatDate, formatDuration } = App.Utils;
  const UI = App.UI;
  let user = null;
  let detailId = null;      // estudiante abierto en "Progreso"
  let editing = null;       // pregunta en edición

  /* ---------- Usuarios ---------- */
  function renderUsers() {
    const rows = App.Users.students();
    $("#users-body").innerHTML = rows.length ? rows.map((u) => `
      <tr><td>${esc(u.nombre)}</td><td>${esc(u.correo)}</td>
      <td><span class="chip ${u.activo ? "ok" : "off"}">${u.activo ? "Activo" : "Desactivado"}</span></td>
      <td><button class="btn small" data-toggle="${u.id}">${u.activo ? "Desactivar" : "Activar"}</button></td></tr>`).join("")
      : `<tr><td colspan="4" class="muted">No hay estudiantes. Agrega el primero con el formulario.</td></tr>`;
  }

  /* ---------- Progreso (seguimiento académico) ---------- */
  function renderProgress() {
    const students = App.Users.students();
    const mods = App.Course.modules();
    const rows = students.map((u) => {
      const sts = mods.map((m) => App.Progress.status(u.id, m.id));
      const tries = App.Progress.attemptsOf(u.id);
      const best = tries.length ? Math.max(...tries.map((t) => t.porcentaje)) : null;
      return { u, sts, overall: App.Progress.overall(u.id), tries, best, chals: App.Progress.challengesOf(u.id).length };
    });
    const done = rows.filter((r) => r.sts.every((s) => s.codigo === "completado")).length;
    const avg = rows.length ? Math.round(rows.reduce((n, r) => n + r.overall, 0) / rows.length) : 0;
    $("#prog-stats").innerHTML = [[students.length, "Estudiantes"], [avg + " %", "Avance promedio"], [done, "Curso completado"], [rows.reduce((n, r) => n + r.chals, 0), "Desafíos superados"]]
      .map(([n, t]) => `<div class="stat"><b>${n}</b>${t}</div>`).join("");

    // Dificultades: estudiantes con 2 o más evaluaciones no aprobadas en un módulo sin aprobar
    const hard = [];
    rows.forEach((r) => mods.forEach((m) => {
      const fails = r.tries.filter((t) => t.modulo === m.id && !t.aprobado).length;
      const s = r.sts[m.id - 1];
      if (fails >= 2 && !s.evalOk) hard.push(`${r.u.nombre} · Módulo ${m.id} (${fails} intentos sin aprobar)`);
    }));
    $("#prog-hard").innerHTML = hard.length ? `<div class="banner bad"><b>Posibles dificultades:</b> ${hard.map(esc).join("; ")}.</div>` : "";

    $("#prog-body").innerHTML = rows.length ? rows.map((r) => `
      <tr><td>${esc(r.u.nombre)}</td><td>${UI.bar(r.overall, r.overall === 100 ? "ok" : "")}<small>${r.overall} %</small></td>
      ${r.sts.map((s) => `<td>${UI.estado(s)}</td>`).join("")}
      <td>${r.best === null ? "—" : r.best + " %"}</td><td>${r.chals}</td>
      <td><button class="btn small" data-detail="${r.u.id}">Ver detalle</button></td></tr>`).join("")
      : `<tr><td colspan="8" class="muted">No hay estudiantes.</td></tr>`;
    renderDetail();
  }

  function renderDetail() {
    const box = $("#prog-detail");
    const u = detailId ? App.Users.findById(detailId) : null;
    if (!u) { box.innerHTML = ""; return; }
    const tries = App.Progress.attemptsOf(u.id).slice().reverse();
    const chals = App.Progress.challengesOf(u.id).slice().reverse();
    const mods = App.Course.modules().map((m) => { const s = App.Progress.status(u.id, m.id); return `<li><b>Módulo ${m.id}</b> · ${UI.estado(s)} · lecciones ${s.lDone}/${s.lessons} · actividades ${s.aDone}/${s.acts} · evaluación ${s.evalOk ? "aprobada" : "pendiente"} · desafío ${s.desafioOk ? "superado" : "pendiente"}</li>`; }).join("");
    box.innerHTML = `<h3>Detalle de ${esc(u.nombre)}</h3><ul class="plain">${mods}</ul>
      <h4>Evaluaciones</h4>${tries.length ? `<div class="tbl-wrap"><table><thead><tr><th>Módulo</th><th>Fecha</th><th>Calificación</th><th>Resultado</th></tr></thead><tbody>${tries.map((t) => `<tr><td>${t.modulo}</td><td>${esc(formatDate(t.fecha))}</td><td>${t.correctas}/${t.total} · ${t.porcentaje} %</td><td>${t.aprobado ? UI.chip("Aprobado", "ok") : UI.chip("No aprobado", "off")}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Sin evaluaciones.</p>`}
      <h4>Desafíos prácticos</h4>${chals.length ? `<div class="tbl-wrap"><table><thead><tr><th>Módulo</th><th>Fecha</th><th>Errores</th><th>Pistas</th><th>Tiempo</th></tr></thead><tbody>${chals.map((c) => `<tr><td>${c.modulo}</td><td>${esc(formatDate(c.fecha))}</td><td>${c.errores}</td><td>${c.pistas}</td><td>${esc(formatDuration(c.duracionSeg))}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Sin desafíos superados.</p>`}`;
  }

  /* ---------- Reportes de uso ---------- */
  function renderReports() {
    const students = App.Users.students();
    const { rows, totalPractices } = App.Activity.summary(students);
    const max = Math.max(1, ...rows.map((r) => r.count));
    $("#stats").innerHTML = [[students.length, "Estudiantes"], [students.filter((u) => u.activo).length, "Cuentas activas"], [totalPractices, "Prácticas registradas"]]
      .map(([n, t]) => `<div class="stat"><b>${n}</b>${t}</div>`).join("");
    $("#report-body").innerHTML = rows.length ? rows.map((r) => `
      <tr><td>${esc(r.user.nombre)}</td><td>${r.count}</td>
      <td><span class="bar" style="width:${Math.round((r.count / max) * 120)}px"></span></td>
      <td>${esc(formatDuration(r.seconds))}</td>
      <td class="muted">${r.last ? esc(formatDate(r.last)) : "Sin prácticas"}</td></tr>`).join("")
      : `<tr><td colspan="5" class="muted">Aún no hay datos de uso.</td></tr>`;
  }

  /* ---------- Banco de preguntas ---------- */
  const TIPOS = { opcion: "Selección múltiple", vf: "Verdadero o falso", situacion: "Situación" };
  const currentMod = () => Number($("#q-mod").value) || 1;

  function renderBank() {
    const mod = currentMod(), list = App.Exams.questionsOf(mod), edit = App.Auth.can(user, "banco.editar");
    const need = App.Config.EXAM_SIZE;
    $("#q-count").innerHTML = list.length >= need
      ? `${list.length} preguntas en el banco. Cada evaluación usa ${need}${list.length > need ? " elegidas al azar" : ""}.`
      : `<span class="msg is-error">Hay ${list.length} preguntas: se necesitan al menos ${need} para habilitar la evaluación.</span>`;
    $("#q-add").hidden = !edit;
    $("#q-reset").hidden = !edit;
    $("#q-list").innerHTML = list.map((q, i) => `<li class="qrow"><div><b>${i + 1}.</b> ${esc(q.texto)} ${UI.chip(TIPOS[q.tipo] || q.tipo)}
        <div class="muted small-t">Correcta: ${esc((q.opciones.find((o) => o.id === q.correcta) || {}).texto || "—")}</div></div>
        ${edit ? `<div class="qbtns"><button class="btn small" data-qedit="${esc(q.id)}">Editar</button><button class="btn small" data-qdel="${esc(q.id)}">Eliminar</button></div>` : ""}</li>`).join("");
    renderEditor();
  }

  function blankQuestion(mod) {
    return { id: App.Exams.newId(mod), modulo: mod, tipo: "opcion", texto: "", explicacion: "", correcta: "o0", opciones: [0, 1, 2, 3].map((i) => ({ id: "o" + i, texto: "" })), nuevo: true };
  }
  function renderEditor() {
    const box = $("#q-editor");
    if (!editing) { box.innerHTML = ""; return; }
    const q = editing, vf = q.tipo === "vf";
    const opts = vf ? [{ id: "o0", texto: "Verdadero" }, { id: "o1", texto: "Falso" }] : q.opciones.concat(Array.from({ length: Math.max(0, 4 - q.opciones.length) }, (_, i) => ({ id: "o" + (q.opciones.length + i), texto: "" })));
    box.innerHTML = `<div class="editor"><h3>${q.nuevo ? "Nueva pregunta" : "Editar pregunta"} · Módulo ${q.modulo}</h3>
      <label class="field"><span>Tipo</span><select id="qe-tipo">${Object.keys(TIPOS).map((k) => `<option value="${k}" ${q.tipo === k ? "selected" : ""}>${TIPOS[k]}</option>`).join("")}</select></label>
      <label class="field"><span>Enunciado</span><textarea id="qe-texto" rows="2">${esc(q.texto)}</textarea></label>
      <fieldset><legend>Opciones (marca la correcta)</legend>${opts.map((o, i) => `<div class="orow"><input type="radio" name="qe-ok" value="${o.id}" ${q.correcta === o.id ? "checked" : ""} aria-label="Correcta"><input type="text" data-opt="${o.id}" value="${esc(o.texto)}" ${vf ? "readonly" : ""} placeholder="Opción ${i + 1}"></div>`).join("")}</fieldset>
      <label class="field"><span>Retroalimentación (explicación que verá el estudiante)</span><textarea id="qe-expl" rows="2">${esc(q.explicacion)}</textarea></label>
      <p id="qe-msg" class="msg" role="status"></p>
      <div class="navrow"><button class="btn primary" id="qe-save">Guardar pregunta</button><button class="btn" id="qe-cancel">Cancelar</button></div></div>`;
  }
  function readEditor() {
    editing.tipo = $("#qe-tipo").value; editing.texto = $("#qe-texto").value; editing.explicacion = $("#qe-expl").value;
    const checked = $("input[name=qe-ok]:checked"); editing.correcta = checked ? checked.value : "";
    if (editing.tipo === "vf") editing.opciones = [{ id: "o0", texto: "Verdadero" }, { id: "o1", texto: "Falso" }];
    else editing.opciones = $$("#q-editor [data-opt]").map((i) => ({ id: i.dataset.opt, texto: i.value }));
  }

  /* ---------- Ajustes ---------- */
  function renderSettings() {
    $("#set-umbral").value = App.Progress.umbral();
    $("#set-umbral").disabled = !App.Auth.can(user, "ajustes.editar");
    $("#set-save").hidden = !App.Auth.can(user, "ajustes.editar");
  }

  function setMessage(sel, text, isError) {
    const el = $(sel);
    el.textContent = text;
    el.classList.toggle("is-error", isError);
    el.classList.toggle("is-ok", !isError);
  }

  /* ---------- Pestañas ---------- */
  const TABS = ["usuarios", "progreso", "preguntas", "reportes", "ajustes", "simulador"];
  function showTab(name) {
    $$("[data-tab]").forEach((x) => x.setAttribute("aria-selected", String(x.dataset.tab === name)));
    TABS.forEach((n) => { $("#tab-" + n).hidden = n !== name; });
    if (name === "progreso") renderProgress();
    if (name === "preguntas") renderBank();
    if (name === "reportes") renderReports();
    if (name === "ajustes") renderSettings();
  }

  App.Views.Admin = {
    init() {
      $$("[data-tab]").forEach((tab) => tab.addEventListener("click", () => showTab(tab.dataset.tab)));

      $("#users-body").addEventListener("click", (e) => {
        const id = Number(e.target.dataset.toggle);
        if (id && App.Users.toggleActive(id)) { renderUsers(); renderReports(); }
      });
      $("#add-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const r = App.Users.addStudent({ nombre: $("#n-nombre").value, correo: $("#n-correo").value, clave: $("#n-clave").value });
        if (!r.ok) return setMessage("#add-msg", r.error, true);
        e.target.reset(); renderUsers(); renderReports();
        setMessage("#add-msg", "Estudiante agregado: " + r.user.nombre + ".", false);
      });

      $("#prog-body").addEventListener("click", (e) => {
        const id = Number(e.target.dataset.detail);
        if (id) { detailId = id; renderDetail(); $("#prog-detail").scrollIntoView({ behavior: "smooth", block: "nearest" }); }
      });

      // Banco de preguntas
      $("#q-mod").addEventListener("change", () => { editing = null; renderBank(); });
      $("#q-add").addEventListener("click", () => { editing = blankQuestion(currentMod()); renderEditor(); });
      $("#q-reset").addEventListener("click", () => {
        if (!confirm("¿Restablecer el banco de preguntas original? Se perderán tus cambios.")) return;
        App.Exams.resetBank(); editing = null; renderBank();
      });
      $("#q-list").addEventListener("click", (e) => {
        const ed = e.target.dataset.qedit, del = e.target.dataset.qdel;
        if (ed) { editing = JSON.parse(JSON.stringify(App.Exams.bank().find((q) => q.id === ed))); renderEditor(); }
        if (del && confirm("¿Eliminar esta pregunta del banco?")) { App.Exams.deleteQuestion(del); editing = null; renderBank(); }
      });
      $("#q-editor").addEventListener("change", (e) => { if (e.target.id === "qe-tipo") { readEditor(); renderEditor(); } });
      $("#q-editor").addEventListener("click", (e) => {
        if (e.target.id === "qe-cancel") { editing = null; renderEditor(); }
        if (e.target.id === "qe-save") {
          readEditor();
          const clean = Object.assign({}, editing); delete clean.nuevo;
          clean.opciones = clean.opciones.filter((o) => o.texto.trim());
          const r = App.Exams.saveQuestion(clean);
          if (!r.ok) return setMessage("#qe-msg", r.error, true);
          editing = null; renderBank();
        }
      });

      // Ajustes
      $("#set-save").addEventListener("click", () => {
        if (!App.Auth.can(user, "ajustes.editar")) return;
        const r = App.Progress.setUmbral($("#set-umbral").value);
        setMessage("#set-msg", r.ok ? "Porcentaje mínimo guardado: " + App.Progress.umbral() + " %." : r.error, !r.ok);
      });

      // Probar desafíos como supervisor
      $("#chal-preview").addEventListener("click", (e) => {
        const id = e.target.dataset.preview;
        if (id) App.Router.go("simulator", { modo: "desafio", id });
      });
    },

    render(currentUser) {
      user = currentUser; detailId = null; editing = null;
      $("#ad-name").textContent = user.nombre + " (" + user.rol + ")";
      // Mostrar solo las pestañas permitidas
      $$("[data-perm]").forEach((t) => { t.hidden = !App.Auth.can(user, t.dataset.perm); });
      $("#q-mod").innerHTML = App.Course.modules().map((m) => `<option value="${m.id}">Módulo ${m.id} — ${esc(m.titulo)}</option>`).join("");
      $("#chal-preview").innerHTML = App.Challenges.all().map((d) => `<button class="btn" data-preview="${esc(d.id)}">Desafío ${d.modulo}: ${esc(d.titulo)}</button>`).join(" ");
      renderUsers();
      showTab("usuarios");
    }
  };
})(window.App);
