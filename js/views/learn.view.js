/* =====================================================================
   learn.view.js — Lecciones y actividades de aprendizaje.
   ===================================================================== */
(function (App) {
  "use strict";

  const { $, $$, esc } = App.Utils;
  const UI = App.UI;
  const SV = App.Views.Student;
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const back = (a, mod) => `<button class="btn small back" data-a="${a}" data-mod="${mod}">← Volver al módulo ${mod}</button>`;
  let act = null;   // estado temporal de la actividad abierta

  /* ---------- Lecciones ---------- */
  SV.screens.lesson = () => {
    const { mod, idx } = SV.state, lessons = App.Course.lessonsOf(mod), l = lessons[idx];
    if (!l) return back("open-module", mod);
    const last = idx === lessons.length - 1;
    return `${back("open-module", mod)}
      <section class="panel lesson">
        <p class="muted small-t">Lección ${idx + 1} de ${lessons.length}</p>${UI.bar(((idx + 1) / lessons.length) * 100)}
        <h1>${esc(l.titulo)}</h1>
        ${UI.paragraphs(l.texto)}
        <aside class="keys"><h3>Ideas clave</h3><ul>${l.claves.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></aside>
        <div class="navrow">
          <button class="btn" data-a="lesson-prev" ${idx === 0 ? "disabled" : ""}>← Anterior</button>
          <button class="btn primary" data-a="lesson-next">${last ? "Completar lecciones" : "Completar y continuar →"}</button>
        </div>
      </section>`;
  };
  SV.actions["open-lesson"] = (el) => SV.go("lesson", { mod: Number(el.dataset.mod), idx: Number(el.dataset.idx) });
  SV.actions["lesson-prev"] = () => SV.go("lesson", { idx: Math.max(0, SV.state.idx - 1) });
  SV.actions["lesson-next"] = () => {
    const { mod, idx } = SV.state, lessons = App.Course.lessonsOf(mod), user = SV.user();
    App.Progress.completeLesson(user.id, mod, lessons[idx].id);
    if (idx < lessons.length - 1) return SV.go("lesson", { idx: idx + 1 });
    SV.go("module", { mod, aviso: { tipo: "ok", texto: "Terminaste las lecciones del módulo." } });
  };

  /* ---------- Actividades ---------- */
  function openActivity(mod, id) {
    const a = App.Course.activitiesOf(mod).find((x) => x.id === id);
    if (!a) return;
    act = { id, mod, answers: {}, marks: null, done: false };
    if (a.tipo === "relacionar") act.options = shuffle([...new Set(a.items.map((i) => i.r))]);
    else act.order = shuffle(a.pasos.map((_, i) => i));
    SV.go("activity", { mod, act: id });
  }
  SV.actions["open-activity"] = (el) => openActivity(Number(el.dataset.mod), el.dataset.act);
  SV.actions["back-module"] = (el) => SV.go("module", { mod: Number(el.dataset.mod), aviso: null });
  SV.actions["open-module-from-act"] = SV.actions["back-module"];

  SV.screens.activity = () => {
    const { mod } = SV.state;
    const a = App.Course.activitiesOf(mod).find((x) => act && x.id === act.id);
    if (!a) return `<button class="btn small back" data-a="back-module" data-mod="${mod}">← Volver al módulo ${mod}</button>`;
    const mark = (i) => (act.marks ? (act.marks[i] ? "good" : "bad") : "");
    const sym = (i) => (act.marks ? (act.marks[i] ? "✓" : "✗") : "");
    let rows;
    if (a.tipo === "relacionar") {
      rows = a.items.map((it, i) => `<div class="arow ${mark(i)}"><span class="at">${esc(it.t)}</span>
        <select data-i="${i}" aria-label="${esc(it.t)}"><option value="">Elige…</option>${act.options.map((o) => `<option value="${esc(o)}" ${act.answers[i] === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select><span class="mk">${sym(i)}</span></div>`).join("");
    } else {
      const n = a.pasos.length;
      rows = act.order.map((orig) => `<div class="arow ${mark(orig)}"><span class="at">${esc(a.pasos[orig])}</span>
        <select data-i="${orig}" aria-label="Orden"><option value="">Orden…</option>${Array.from({ length: n }, (_, k) => `<option value="${k + 1}" ${String(act.answers[orig]) === String(k + 1) ? "selected" : ""}>${k + 1}</option>`).join("")}</select><span class="mk">${sym(orig)}</span></div>`).join("");
    }
    const wrong = act.marks ? act.marks.filter((m) => !m).length : 0;
    const feedback = act.done
      ? `<div class="banner ok" role="status">¡Actividad completada! Todas tus respuestas son correctas.</div>`
      : act.marks ? `<div class="banner bad" role="status">Tienes ${wrong} respuesta${wrong === 1 ? "" : "s"} por corregir (marcadas con ✗). Revisa la lección y vuelve a comprobar.</div>` : "";
    return `<button class="btn small back" data-a="back-module" data-mod="${mod}">← Volver al módulo ${mod}</button>
      <section class="panel"><h1>${esc(a.titulo)}</h1><p class="muted">${esc(a.instrucciones)}</p>
        <div class="arows">${rows}</div>${feedback}
        <div class="navrow">${act.done ? `<button class="btn primary" data-a="back-module" data-mod="${mod}">Volver al módulo</button>` : `<button class="btn primary" data-a="check-activity">Comprobar respuestas</button>`}</div>
      </section>`;
  };

  SV.actions["check-activity"] = () => {
    const { mod } = SV.state, a = App.Course.activitiesOf(mod).find((x) => x.id === act.id), user = SV.user();
    $$("#st-main select[data-i]").forEach((s) => { act.answers[Number(s.dataset.i)] = s.value; });
    const n = a.tipo === "relacionar" ? a.items.length : a.pasos.length;
    act.marks = Array.from({ length: n }, (_, i) => (a.tipo === "relacionar" ? act.answers[i] === a.items[i].r : String(act.answers[i]) === String(i + 1)));
    act.done = act.marks.every(Boolean);
    if (act.done) App.Progress.completeActivity(user.id, mod, a.id);
    SV.draw();
  };
})(window.App);
