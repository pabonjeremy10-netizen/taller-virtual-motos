/* =====================================================================
   student.view.js — Panel del estudiante: inicio, módulos, historial y guías.
   Es el "marco" de la vista: guarda la pantalla actual y reparte los clics.
   Las lecciones/actividades (learn.view.js) y la evaluación (exam.view.js)
   se enganchan aquí con App.Views.Student.screens y .actions.
   ===================================================================== */
(function (App) {
  "use strict";

  const { $, esc, formatDate, formatDuration } = App.Utils;
  const UI = App.UI;
  let user = null;
  const state = { screen: "home", mod: 1, aviso: null };

  const screens = {};
  const actions = {};

  const mods = () => App.Course.modules();
  const st = (mod) => App.Progress.status(user.id, mod);
  const back = (label, a, extra) => `<button class="btn small back" data-a="${a}" ${extra || ""}>← ${esc(label)}</button>`;

  /* ---------- Inicio ---------- */
  function moduleCard(m) {
    const s = st(m.id);
    const sub = (t) => `<span class="sub">${t}</span>`;
    const rowStudy = s.study ? "✅" : s.locked ? "🔒" : sub(`${s.lDone + s.aDone}/${s.lessons + s.acts} · por completar`);
    const rowExam = s.evalOk ? `✅ ${sub("Aprobada" + (s.best !== null ? " · mejor " + s.best + " %" : ""))}` : (s.locked || !s.study) ? "🔒" : sub("Pendiente");
    const rowChal = s.desafioOk ? "✅" : s.evalOk ? sub("Pendiente") : "🔒";
    const open = s.locked
      ? `<span class="muted small-t">Completa el Módulo ${m.id - 1} para desbloquearlo</span>`
      : `<button class="btn ${s.codigo === "completado" ? "" : "primary"}" data-a="open-module" data-mod="${m.id}">${s.codigo === "disponible" ? "Empezar" : s.codigo === "completado" ? "Repasar" : "Continuar"}</button>`;
    return `<article class="mcard ${s.locked ? "locked" : ""} ${s.codigo === "completado" ? "done" : ""}">
      <header><h3>Módulo ${m.id} — ${esc(m.titulo)}</h3>${UI.nivel(m)}</header>
      <p class="muted meta">${App.Config.EXAM_SIZE} preguntas · 1 desafío práctico</p>
      ${UI.bar(s.pct, s.codigo === "completado" ? "ok" : "")}
      <ul class="rows">
        <li><span>📖 Lecciones y actividades</span><span>${rowStudy}</span></li>
        <li><span>📝 Evaluación</span><span>${rowExam}</span></li>
        <li><span>🔧 Desafío en el simulador</span><span>${rowChal}</span></li>
      </ul>
      <footer>${UI.estado(s)}${open}</footer>
    </article>`;
  }

  screens.home = () => {
    const next = App.Progress.nextModule(user.id);
    const overall = App.Progress.overall(user.id);
    return `<section class="welcome">
        <h1>Hola, ${esc(user.nombre.split(" ")[0])}</h1>
        <p class="muted lead">Estudia las lecciones, practica con las actividades, aprueba la evaluación y resuelve el desafío en el simulador 3D para avanzar de módulo.</p>
        <div class="overall"><span>Avance del curso</span>${UI.bar(overall, overall === 100 ? "ok" : "")}<b>${overall} %</b></div>
        <div class="cta-row">
          ${next ? `<button class="btn primary cta" data-a="open-module" data-mod="${next.id}">Continuar: Módulo ${next.id}</button>` : `<span class="estado st-ok">✅ ¡Completaste el curso!</span>`}
          <button class="btn cta" data-a="open-sim">Simulador libre 3D</button>
        </div>
      </section>
      <div class="course-head"><h2>Mi curso de mecánica</h2>${UI.chip(mods().length + " módulos")}</div>
      <div class="mgrid">${mods().map(moduleCard).join("")}</div>`;
  };

  /* ---------- Pantalla de un módulo ---------- */
  screens.module = () => {
    const m = App.Course.module(state.mod), s = st(m.id);
    if (s.locked) return `${back("Volver al curso", "home")}<div class="panel"><h2>Módulo bloqueado</h2><p class="muted">Completa el Módulo ${m.id - 1} (evaluación aprobada y desafío superado) para desbloquear este módulo.</p></div>`;

    const aviso = state.aviso ? `<div class="banner ${state.aviso.tipo}" role="status">${esc(state.aviso.texto)}</div>` : "";
    const lessons = App.Course.lessonsOf(m.id), acts = App.Course.activitiesOf(m.id);
    const lessonList = lessons.map((l, i) => {
      const d = App.Progress.lessonDone(user.id, m.id, l.id);
      return `<li><button class="rowbtn" data-a="open-lesson" data-mod="${m.id}" data-idx="${i}"><span class="num ${d ? "ok" : ""}">${d ? "✓" : i + 1}</span><span>${esc(l.titulo)}</span><span class="go">${d ? "Repasar" : "Estudiar"} →</span></button></li>`;
    }).join("");
    const actList = acts.map((a) => {
      const d = App.Progress.activityDone(user.id, m.id, a.id);
      return `<li><button class="rowbtn" data-a="open-activity" data-mod="${m.id}" data-act="${a.id}"><span class="num ${d ? "ok" : ""}">${d ? "✓" : "✎"}</span><span>${esc(a.titulo)}</span><span class="go">${d ? "Repetir" : "Hacer"} →</span></button></li>`;
    }).join("");

    const canExam = App.Progress.canExam(user.id, m.id), enough = App.Exams.hasEnough(m.id);
    const attempts = App.Progress.attemptsOf(user.id, m.id).slice().reverse();
    const examBtn = canExam.ok && enough
      ? `<button class="btn primary" data-a="start-exam" data-mod="${m.id}">${s.intentos ? "Volver a intentar" : "Presentar evaluación"}</button>`
      : `<button class="btn" disabled>Presentar evaluación</button><p class="muted small-t">${esc(canExam.ok ? "La evaluación se está actualizando. Intenta más tarde." : canExam.motivo)}</p>`;
    const attemptRows = attempts.length ? `<div class="tbl-wrap"><table><thead><tr><th>Fecha</th><th>Calificación</th><th>Resultado</th></tr></thead><tbody>${attempts.map((a) =>
      `<tr><td>${esc(formatDate(a.fecha))}</td><td>${a.correctas}/${a.total} · ${a.porcentaje} %</td><td>${a.aprobado ? UI.chip("Aprobado", "ok") : UI.chip("No aprobado", "off")}</td></tr>`).join("")}</tbody></table></div>` : "";

    const def = App.Challenges.forModule(m.id), canChal = App.Progress.canChallenge(user.id, m.id);
    const done = App.Progress.challengesOf(user.id, m.id);
    const last = done[done.length - 1];
    const chalBtn = def && canChal.ok
      ? `<button class="btn primary" data-a="start-challenge" data-mod="${m.id}">${s.desafioOk ? "Repetir el desafío" : "Ir al simulador"}</button>`
      : `<button class="btn" disabled>Ir al simulador</button><p class="muted small-t">${esc(def ? canChal.motivo : "Este desafío aún no está disponible.")}</p>`;

    return `${back("Volver al curso", "home")}${aviso}
      <section class="panel mhead"><div><h1>Módulo ${m.id} — ${esc(m.titulo)}</h1><p class="muted">${esc(m.objetivo)}</p></div><div class="mside">${UI.nivel(m)}${UI.estado(s)}</div>${UI.bar(s.pct, s.codigo === "completado" ? "ok" : "")}</section>
      ${s.pendientes.length ? `<section class="panel todo"><h2>Lo que te falta para continuar</h2><ul>${s.pendientes.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></section>` : `<section class="panel todo ok"><h2>¡Módulo completado!</h2><p>Aprobaste la evaluación y superaste el desafío práctico.</p></section>`}
      <section class="panel"><h2>1 · Lecciones <span class="muted small-t">${s.lDone}/${s.lessons}</span></h2><ul class="olist">${lessonList}</ul></section>
      <section class="panel"><h2>2 · Actividades de aprendizaje <span class="muted small-t">${s.aDone}/${s.acts}</span></h2><ul class="olist">${actList}</ul></section>
      <section class="panel"><h2>3 · Evaluación <span class="muted small-t">${App.Config.EXAM_SIZE} preguntas · mínimo ${App.Progress.umbral()} %</span></h2>
        <p class="muted">${s.evalOk ? "Evaluación aprobada. Puedes repetirla para repasar." : "Debes terminar las lecciones y actividades. Si no apruebas, repasas y vuelves a intentarlo."}</p>${examBtn}${attemptRows}</section>
      <section class="panel"><h2>4 · Desafío práctico en el simulador 3D</h2>
        ${def ? `<p><b>${esc(def.titulo)}</b> · ${esc(def.nivel)}</p><p class="muted">${esc(def.situacion)}</p>` : ""}
        ${last ? `<p class="muted small-t">Último resultado: superado el ${esc(formatDate(last.fecha))} · ${last.errores} errores · ${last.pistas} pistas · ${esc(formatDuration(last.duracionSeg))}.</p>` : ""}${chalBtn}</section>`;
  };

  /* ---------- Historial ---------- */
  screens.history = () => {
    const tries = App.Progress.attemptsOf(user.id).slice().reverse();
    const chals = App.Progress.challengesOf(user.id).slice().reverse();
    const practice = App.Activity.byUser(user.correo).slice().reverse();
    const tTable = tries.length ? `<div class="tbl-wrap"><table><thead><tr><th>Módulo</th><th>Fecha</th><th>Calificación</th><th>Resultado</th></tr></thead><tbody>${tries.map((a) =>
      `<tr><td>Módulo ${a.modulo}</td><td>${esc(formatDate(a.fecha))}</td><td>${a.correctas}/${a.total} · ${a.porcentaje} %</td><td>${a.aprobado ? UI.chip("Aprobado", "ok") : UI.chip("No aprobado", "off")}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Aún no has presentado evaluaciones.</p>`;
    const cTable = chals.length ? `<div class="tbl-wrap"><table><thead><tr><th>Desafío</th><th>Fecha</th><th>Errores</th><th>Pistas</th><th>Tiempo</th></tr></thead><tbody>${chals.map((c) =>
      `<tr><td>Módulo ${c.modulo}</td><td>${esc(formatDate(c.fecha))}</td><td>${c.errores}</td><td>${c.pistas}</td><td>${esc(formatDuration(c.duracionSeg))}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Aún no has superado desafíos.</p>`;
    const pList = practice.length ? `<ul class="list">${practice.map((l) => `<li><span>Sesión en el simulador <span class="muted">· ${esc(formatDuration(l.duracionSeg))}</span></span><span class="muted">${esc(formatDate(l.fecha))}</span></li>`).join("")}</ul>` : `<p class="muted">Todavía no has entrado al simulador.</p>`;
    return `${back("Volver al curso", "home")}<section class="panel"><h2>Evaluaciones presentadas</h2>${tTable}</section><section class="panel"><h2>Desafíos superados</h2>${cTable}</section><section class="panel"><h2>Sesiones en el simulador</h2>${pList}</section>`;
  };

  screens.guides = () => `${back("Volver al curso", "home")}<section class="panel"><h2>Guías de mecánica y taller</h2><ul class="list">${App.Seed.guides.map(([t, d]) =>
    `<li><div><strong>${esc(t)}</strong><br><span class="muted">${esc(d)}</span></div></li>`).join("")}</ul></section>`;

  /* ---------- Acciones (data-a) ---------- */
  actions["home"] = () => go("home");
  actions["open-module"] = (el) => go("module", { mod: Number(el.dataset.mod), aviso: null });
  actions["open-sim"] = () => App.Router.go("simulator");
  actions["start-challenge"] = (el) => {
    const mod = Number(el.dataset.mod), gate = App.Progress.canChallenge(user.id, mod), def = App.Challenges.forModule(mod);
    if (!gate.ok || !def) return;
    App.Router.go("simulator", { modo: "desafio", id: def.id, mod, ret: { screen: "module", mod } });
  };

  function draw() {
    const html = (screens[state.screen] || screens.home)();
    $("#st-main").innerHTML = html;
    $("#st-nav").querySelectorAll("[data-nav]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.nav === state.screen || (b.dataset.nav === "home" && ["module", "lesson", "activity", "exam", "result"].includes(state.screen)))));
  }
  function go(screen, params) {
    Object.assign(state, params || {}, { screen });
    if (!params || !("aviso" in params)) state.aviso = null;
    draw(); window.scrollTo(0, 0);
  }

  App.Views.Student = {
    screens, actions, state, go, draw,
    user: () => user,
    init() {
      $("#st-main").addEventListener("click", (e) => {
        const el = e.target.closest("[data-a]");
        if (el && !el.disabled && actions[el.dataset.a]) actions[el.dataset.a](el);
      });
      $("#st-main").addEventListener("change", (e) => { const el = e.target.closest("[data-change]"); if (el && actions[el.dataset.change]) actions[el.dataset.change](el); });
      $("#st-nav").addEventListener("click", (e) => { const b = e.target.closest("[data-nav]"); if (b) go(b.dataset.nav); });
    },
    // nav opcional: { screen, mod, aviso } para volver a un punto concreto (p. ej. tras un desafío)
    render(currentUser, nav) {
      user = currentUser;
      $("#st-name").textContent = user.nombre;
      if (nav && nav.screen) go(nav.screen, nav); else go("home", { aviso: null });
    }
  };
})(window.App);
