const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path");
const root = require("path").join(__dirname, "..");
const html = fs.readFileSync(root + "/index.html", "utf8");
const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/", pretendToBeVisual: true });
const w = dom.window;
w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
for (const s of srcs) { try { w.eval(fs.readFileSync(path.join(root, s), "utf8")); } catch (e) { console.error("ERROR en", s, e); process.exit(1); } }
const App = w.App, $ = (s) => w.document.querySelector(s);
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("  ✗ FALLA:", m); } else console.log("  ✓", m); };

console.log("Login y estado inicial");
let r = App.Auth.login("estudiante@demo.com", "1234", "estudiante"); ok(r.ok, "login estudiante");
const uid = r.user.id;
ok(App.Progress.status(uid, 1).codigo === "disponible", "M1 disponible");
ok(App.Progress.status(uid, 2).codigo === "bloqueado", "M2 bloqueado");
ok(!App.Progress.canExam(uid, 1).ok, "no puede evaluar sin estudiar");
ok(!App.Progress.canChallenge(uid, 1).ok, "no puede desafío sin evaluar");
ok(App.Progress.completeLesson(uid, 2, "m2-l1").ok === false, "no se estudia un módulo bloqueado");

console.log("Interfaz del estudiante");
App.Views.Student.render(r.user);
ok(/Módulo 1/.test($("#st-main").textContent) && /Bloqueado/.test($("#st-main").textContent), "inicio muestra módulos y estados");
const click = (sel) => { const e = $(sel); if (!e) throw new Error("no existe " + sel); e.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); };
click('[data-a="open-module"][data-mod="1"]');
ok(/Lo que te falta/.test($("#st-main").textContent), "pantalla de módulo muestra lo que falta");
ok($('[data-a="start-exam"]') === null, "evaluación aún no disponible");
click('[data-a="open-lesson"][data-idx="0"]');
ok(/Lección 1 de 10/.test($("#st-main").textContent), "abre lección 1");
for (let i = 0; i < 10; i++) click('[data-a="lesson-next"]');
ok(App.Progress.status(uid, 1).lDone === 10, "10 lecciones completadas");
ok(/Terminaste las lecciones/.test($("#st-main").textContent), "vuelve al módulo con aviso");

console.log("Actividades");
click('[data-a="open-activity"][data-act="m1-a1"]');
click('[data-a="check-activity"]');
ok(/por corregir/.test($("#st-main").textContent), "actividad vacía no se aprueba");
const a1 = App.Course.activitiesOf(1)[0];
w.document.querySelectorAll("#st-main select[data-i]").forEach((s) => { s.value = a1.items[Number(s.dataset.i)].r; });
click('[data-a="check-activity"]');
ok(App.Progress.activityDone(uid, 1, "m1-a1"), "actividad 1 completada");
click('[data-a="back-module"]'); click('[data-a="open-activity"][data-act="m1-a2"]');
const a2 = App.Course.activitiesOf(1)[1];
w.document.querySelectorAll("#st-main select[data-i]").forEach((s) => { s.value = a2.items[Number(s.dataset.i)].r; });
click('[data-a="check-activity"]');
ok(App.Progress.status(uid, 1).codigo === "evaluacion", "estado: evaluación pendiente");
// ordenar
const act2 = App.Course.activitiesOf(2)[0];
ok(act2.tipo === "ordenar", "M2 tiene actividad de ordenar");

console.log("Evaluación (fallar y luego aprobar)");
click('[data-a="back-module"]'); click('[data-a="start-exam"]');
ok(/Instrucciones/.test($("#st-main").textContent), "instrucciones iniciales");
click('[data-a="exam-begin"]');
ok(/Pregunta 1 de 10/.test($("#st-main").textContent), "indicador de progreso");
click('[data-a="exam-finish"]');
ok(/Te faltan por responder/.test($("#st-main").textContent), "confirmación avisa preguntas sin responder");
click('[data-a="exam-send"]');
ok(/No aprobado/.test($("#st-main").textContent), "0 % no aprueba");
let st = App.Progress.status(uid, 1);
ok(!st.evalOk && st.intentos === 1 && st.codigo === "evaluacion", "intento registrado, sigue pendiente");
ok(!App.Progress.canChallenge(uid, 1).ok, "desafío sigue bloqueado");
click('[data-a="start-exam"]'); click('[data-a="exam-begin"]');
const bank = App.Exams.bank();
for (let i = 0; i < 10; i++) {
  const radios = [...w.document.querySelectorAll('input[name=opt]')];
  const qid = radios[0].dataset.q, q = bank.find((x) => x.id === qid);
  const target = radios.find((x) => x.value === q.correcta);
  target.checked = true; target.dispatchEvent(new w.Event("change", { bubbles: true }));
  if (i < 9) click('[data-a="exam-next"]');
}
click('[data-a="exam-finish"]');
ok(/Respondiste todas/.test($("#st-main").textContent), "confirmación: todas respondidas");
click('[data-a="exam-send"]');
ok(/100 %/.test($("#st-main").textContent) && /Aprobado/.test($("#st-main").textContent), "100 % aprueba");
st = App.Progress.status(uid, 1);
ok(st.evalOk && st.codigo === "desafio" && st.intentos === 2, "estado: desafío pendiente, 2 intentos");
ok(App.Progress.isLocked(uid, 2), "M2 sigue bloqueado hasta superar el desafío");

console.log("Desafío (registro de resultado)");
const def = App.Challenges.forModule(1);
ok(def && def.id === "desafio-1" && def.pasos.length === 4, "definición del desafío 1");
ok(!App.Progress.recordChallenge(uid, 1, { desafio: "desafio-2", ok: true, pasos: 4 }).ok, "rechaza resultado de otro desafío");
ok(!App.Progress.recordChallenge(uid, 1, { desafio: "desafio-1", ok: false, pasos: 4 }).ok, "rechaza resultado no superado");
ok(!App.Progress.recordChallenge(uid, 2, { desafio: "desafio-2", ok: true, pasos: 6 }).ok, "rechaza desafío de módulo bloqueado");
ok(App.Progress.status(uid, 1).codigo === "desafio", "nada cambió con resultados inválidos");
const good = App.Progress.recordChallenge(uid, 1, { desafio: "desafio-1", ok: true, pasos: 4, errores: 1, pistas: 2, duracionSeg: 120, acciones: [1, 2] });
ok(good.ok && good.completado && good.siguiente === 2, "resultado válido completa M1 y habilita M2");
ok(App.Progress.status(uid, 1).codigo === "completado" && App.Progress.status(uid, 2).codigo === "disponible", "M1 completado, M2 disponible");
ok(App.Progress.overall(uid) > 0, "avance general calculado");

console.log("Umbral configurable y banco");
ok(App.Progress.umbral() === 70, "umbral por defecto 70");
ok(App.Progress.setUmbral(80).ok && App.Progress.umbral() === 80, "umbral editable");
ok(!App.Progress.setUmbral(0).ok, "umbral inválido rechazado");
App.Progress.setUmbral(70);
const q = App.Exams.questionsOf(1)[0]; const bad = JSON.parse(JSON.stringify(q)); bad.texto = "";
ok(!App.Exams.saveQuestion(bad).ok, "pregunta sin enunciado rechazada");
const nq = { id: App.Exams.newId(1), modulo: 1, tipo: "opcion", texto: "¿Prueba?", explicacion: "Sí.", correcta: "o1", opciones: [{ id: "o0", texto: "No" }, { id: "o1", texto: "Sí" }] };
ok(App.Exams.saveQuestion(nq).ok && App.Exams.questionsOf(1).length === 11, "pregunta nueva agregada (11)");
ok(App.Exams.draw(1).length === 10, "la evaluación usa 10 preguntas");
App.Exams.deleteQuestion(nq.id); ok(App.Exams.questionsOf(1).length === 10, "pregunta eliminada");

console.log("Panel administrador / docente");
App.Auth.logout();
for (const [mail, pass, perm] of [["admin@demo.com", "admin123", true], ["docente@demo.com", "docente123", false]]) {
  const rr = App.Auth.login(mail, pass, "staff"); ok(rr.ok, "login " + rr.user.rol);
  App.Views.Admin.init && 0;

  App.Views.Admin.render(rr.user);
  ok(App.Auth.can(rr.user, "ajustes.editar") === perm, "permiso ajustes: " + perm);
  click('[data-tab="progreso"]');
  ok(/Carlos/.test($("#prog-body").textContent) && /Completado y aprobado/.test($("#prog-body").textContent), "tabla de progreso con demo");
  const btn = $("[data-detail]"); btn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  ok(/Detalle de/.test($("#prog-detail").textContent), "detalle de estudiante");
  click('[data-tab="preguntas"]'); ok(w.document.querySelectorAll("#q-list li").length === 10, "10 preguntas listadas");
  ok(($("#q-add").hidden) === !perm, "agregar pregunta solo admin");
  ok(w.document.querySelector('[data-tab="ajustes"]').hidden === !perm, "pestaña Ajustes solo admin");
  App.Auth.logout();
}
console.log(fails ? "\nFALLARON " + fails : "\nTODO OK");
process.exit(fails ? 1 : 0);
