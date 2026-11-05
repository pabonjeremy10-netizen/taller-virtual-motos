/* =====================================================================
   exam.view.js — Evaluación de 10 preguntas: instrucciones, navegación,
   indicador de progreso, confirmación, calificación y retroalimentación.
   La calificación y el registro del intento los hace App.Exams.
   ===================================================================== */
(function (App) {
  "use strict";

  const { esc } = App.Utils;
  const UI = App.UI;
  const SV = App.Views.Student;
  const TIPOS = { opcion: "Selección múltiple", vf: "Verdadero o falso", situacion: "Análisis de una situación" };
  let exam = null;      // evaluación en curso { mod, qs, answers, idx, t0, confirming, error }
  let result = null;    // último resultado { mod, intento, qs, detalle }

  const backBtn = (mod) => `<button class="btn small back" data-a="back-module" data-mod="${mod}">← Volver al módulo ${mod}</button>`;
  const optText = (q, id) => { const o = q.opciones.find((x) => x.id === id); return o ? o.texto : "Sin responder"; };

  SV.actions["start-exam"] = (el) => {
    const mod = Number(el.dataset.mod), user = SV.user();
    const gate = App.Progress.canExam(user.id, mod);
    if (!gate.ok || !App.Exams.hasEnough(mod)) return;
    exam = { mod, qs: App.Exams.draw(mod), answers: {}, idx: -1, t0: null, confirming: false, error: "" };
    SV.go("exam", { mod });
  };

  function intro() {
    const m = App.Course.module(exam.mod);
    return `${backBtn(exam.mod)}<section class="panel exam">
      <h1>Evaluación · Módulo ${m.id}: ${esc(m.titulo)}</h1>
      <h3>Instrucciones</h3>
      <ul class="plain">
        <li>La evaluación tiene <b>${exam.qs.length} preguntas</b> de distintos tipos: selección múltiple, verdadero o falso y análisis de situaciones.</li>
        <li>Puedes ir y volver entre preguntas y cambiar tus respuestas antes de finalizar.</li>
        <li>Para aprobar necesitas <b>${App.Progress.umbral()} %</b> o más. Si no lo logras, repasas las lecciones y vuelves a intentarlo.</li>
        <li>Antes de enviar verás cuántas preguntas te faltan. Al terminar recibes tu calificación y la explicación de cada respuesta.</li>
        <li>Aprobar la evaluación desbloquea el desafío práctico en el simulador.</li>
      </ul>
      <div class="navrow"><button class="btn primary" data-a="exam-begin">Comenzar evaluación</button></div></section>`;
  }
  SV.actions["exam-begin"] = () => { exam.idx = 0; exam.t0 = Date.now(); SV.draw(); };

  function question() {
    const q = exam.qs[exam.idx], n = exam.qs.length, answered = Object.keys(exam.answers).length;
    const pills = exam.qs.map((x, i) => `<button class="pill ${exam.answers[x.id] ? "answered" : ""} ${i === exam.idx ? "current" : ""}" data-a="exam-goto" data-i="${i}" aria-label="Pregunta ${i + 1}${exam.answers[x.id] ? " respondida" : ""}">${i + 1}</button>`).join("");
    const opts = q.opciones.map((o) => `<label class="opt ${exam.answers[q.id] === o.id ? "sel" : ""}"><input type="radio" name="opt" value="${esc(o.id)}" data-change="exam-answer" data-q="${esc(q.id)}" ${exam.answers[q.id] === o.id ? "checked" : ""}><span>${esc(o.texto)}</span></label>`).join("");
    const missing = exam.qs.map((x, i) => (exam.answers[x.id] ? null : i + 1)).filter(Boolean);
    const confirm = exam.confirming ? `<div class="confirm" role="alertdialog" aria-label="Confirmar envío">
        <p><b>¿Enviar la evaluación?</b></p>
        <p class="muted">${missing.length ? "Te faltan por responder las preguntas: " + missing.join(", ") + ". Las preguntas sin responder cuentan como incorrectas." : "Respondiste todas las preguntas. Después de enviar no podrás cambiar tus respuestas."}</p>
        ${exam.error ? `<p class="msg is-error">${esc(exam.error)}</p>` : ""}
        <div class="navrow"><button class="btn" data-a="exam-cancel">Seguir revisando</button><button class="btn primary" data-a="exam-send">Enviar evaluación</button></div></div>` : "";
    return `<section class="panel exam">
      <div class="exam-top"><b>Pregunta ${exam.idx + 1} de ${n}</b><span class="muted">${answered} respondida${answered === 1 ? "" : "s"}</span></div>
      ${UI.bar((answered / n) * 100)}<div class="pills">${pills}</div>
      <p class="qtype">${esc(TIPOS[q.tipo] || "Pregunta")}</p>
      <h2 class="qtext">${esc(q.texto)}</h2>
      <div class="opts" role="radiogroup">${opts}</div>
      <div class="navrow">
        <button class="btn" data-a="exam-prev" ${exam.idx === 0 ? "disabled" : ""}>← Anterior</button>
        ${exam.idx < n - 1 ? `<button class="btn" data-a="exam-next">Siguiente →</button>` : ""}
        <button class="btn primary" data-a="exam-finish">Finalizar evaluación</button>
      </div>${confirm}</section>`;
  }

  SV.screens.exam = () => {
    if (!exam) return `<div class="panel"><p class="muted">No hay una evaluación en curso.</p><button class="btn" data-a="home">Volver al curso</button></div>`;
    return exam.idx < 0 ? intro() : question();
  };
  SV.actions["exam-answer"] = (el) => { exam.answers[el.dataset.q] = el.value; SV.draw(); };
  SV.actions["exam-goto"] = (el) => { exam.idx = Number(el.dataset.i); exam.confirming = false; SV.draw(); };
  SV.actions["exam-prev"] = () => { exam.idx = Math.max(0, exam.idx - 1); exam.confirming = false; SV.draw(); };
  SV.actions["exam-next"] = () => { exam.idx = Math.min(exam.qs.length - 1, exam.idx + 1); exam.confirming = false; SV.draw(); };
  SV.actions["exam-finish"] = () => { exam.confirming = true; exam.error = ""; SV.draw(); };
  SV.actions["exam-cancel"] = () => { exam.confirming = false; SV.draw(); };
  SV.actions["exam-send"] = () => {
    const res = App.Exams.submit(SV.user(), exam.mod, exam.qs.map((q) => q.id), exam.answers, Math.round((Date.now() - exam.t0) / 1000));
    if (!res.ok) { exam.error = res.error; return SV.draw(); }
    result = { mod: exam.mod, intento: res.intento, detalle: res.detalle, qs: exam.qs };
    exam = null;
    SV.go("result", { mod: result.mod });
  };

  SV.screens.result = () => {
    if (!result) return `<div class="panel"><button class="btn" data-a="home">Volver al curso</button></div>`;
    const { intento: it, detalle, qs, mod } = result;
    const items = qs.map((q, i) => {
      const d = detalle[i];
      return `<li class="rq ${d.ok ? "good" : "bad"}"><div class="rq-h"><span class="num ${d.ok ? "ok" : "no"}">${d.ok ? "✓" : "✗"}</span><b>${i + 1}. ${esc(q.texto)}</b></div>
        <p>Tu respuesta: <b>${esc(d.elegida ? optText(q, d.elegida) : "Sin responder")}</b></p>
        ${d.ok ? "" : `<p>Respuesta correcta: <b>${esc(optText(q, q.correcta))}</b></p>`}
        <p class="muted">${esc(q.explicacion)}</p></li>`;
    }).join("");
    const next = it.aprobado
      ? `<div class="banner ok">¡Aprobaste! El desafío práctico del simulador ya está desbloqueado.</div><div class="navrow"><button class="btn primary" data-a="start-challenge" data-mod="${mod}">Ir al desafío práctico</button><button class="btn" data-a="back-module" data-mod="${mod}">Volver al módulo</button></div>`
      : `<div class="banner bad">No alcanzaste el ${it.umbral} % necesario. Repasa las lecciones, revisa las explicaciones de abajo y vuelve a intentarlo.</div><div class="navrow"><button class="btn" data-a="back-module" data-mod="${mod}">Repasar el módulo</button><button class="btn primary" data-a="start-exam" data-mod="${mod}">Volver a intentar</button></div>`;
    return `<section class="panel exam"><h1>Resultado de la evaluación</h1>
      <div class="score ${it.aprobado ? "ok" : "bad"}"><b>${it.porcentaje} %</b><span>${it.correctas} de ${it.total} correctas · mínimo ${it.umbral} %</span>${UI.chip(it.aprobado ? "Aprobado" : "No aprobado", it.aprobado ? "ok" : "off")}</div>
      ${next}<h3>Retroalimentación</h3><ul class="rqs">${items}</ul></section>`;
  };
})(window.App);
