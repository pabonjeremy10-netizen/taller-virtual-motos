/* =====================================================================
   exams.js — Banco de preguntas, armado y calificación de evaluaciones.
   La calificación se hace aquí (capa de servicio), nunca en la vista, y
   guarda cada intento. Al pasar al backend, grade() se ejecuta en el
   servidor y las respuestas correctas dejan de viajar al navegador.
   ===================================================================== */
(function (App) {
  "use strict";

  const { KEYS, EXAM_SIZE } = App.Config;
  const S = App.Storage;

  const bank = () => (S.hasLocal(KEYS.bank) ? S.getLocal(KEYS.bank, []) : App.Course.seedQuestions());
  const saveBank = (list) => S.setLocal(KEYS.bank, list);
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const attempts = () => S.getLocal(KEYS.attempts, []);

  App.Exams = {
    bank,
    questionsOf: (mod) => bank().filter((q) => q.modulo === mod),
    hasEnough: (mod) => bank().filter((q) => q.modulo === mod).length >= EXAM_SIZE,

    // Banco administrable (solo administración)
    saveQuestion(q) {
      const err = this.validate(q);
      if (err) return { ok: false, error: err };
      const list = bank();
      const i = list.findIndex((x) => x.id === q.id);
      if (i >= 0) list[i] = q; else list.push(q);
      saveBank(list);
      return { ok: true };
    },
    deleteQuestion(id) { saveBank(bank().filter((q) => q.id !== id)); },
    resetBank() { localStorage.removeItem(KEYS.bank); },
    newId(mod) { const nums = bank().filter((q) => q.modulo === mod).map((q) => Number(String(q.id).split("-q")[1]) || 0); return "m" + mod + "-q" + (Math.max(0, ...nums) + 1); },
    validate(q) {
      if (!q.texto || !q.texto.trim()) return "Escribe el enunciado de la pregunta.";
      if (!q.opciones || q.opciones.length < 2) return "Agrega al menos dos opciones.";
      if (q.opciones.some((o) => !o.texto || !o.texto.trim())) return "Todas las opciones deben tener texto.";
      if (!q.opciones.some((o) => o.id === q.correcta)) return "Marca cuál es la opción correcta.";
      if (!q.explicacion || !q.explicacion.trim()) return "Escribe la retroalimentación que verá el estudiante.";
      return null;
    },

    // Arma una evaluación: 10 preguntas (al azar si el banco tiene más), con opciones mezcladas
    draw(mod) {
      const pool = this.questionsOf(mod);
      const chosen = shuffle(pool).slice(0, EXAM_SIZE);
      return chosen.map((q) => Object.assign({}, q, { opciones: q.tipo === "vf" ? q.opciones.slice() : shuffle(q.opciones) }));
    },

    // Calificación pura (no guarda nada)
    grade(questionIds, answers) {
      const byId = new Map(bank().map((q) => [q.id, q]));
      const detalle = questionIds.map((id) => {
        const q = byId.get(id);
        const elegida = answers[id] || null;
        return { id, ok: !!q && elegida === q.correcta, elegida, correcta: q ? q.correcta : null };
      });
      const correctas = detalle.filter((d) => d.ok).length;
      const total = detalle.length;
      return { detalle, correctas, total, porcentaje: total ? Math.round((correctas / total) * 100) : 0 };
    },

    // Califica, registra el intento y actualiza el progreso. Devuelve { ok, intento } o { ok:false, error }
    submit(user, mod, questionIds, answers, duracionSeg) {
      const gate = App.Progress.canExam(user.id, mod);
      if (!gate.ok) return { ok: false, error: gate.motivo };
      if (!questionIds.length) return { ok: false, error: "La evaluación no tiene preguntas." };
      const g = this.grade(questionIds, answers);
      const umbral = App.Progress.umbral();
      const list = attempts();
      const intento = {
        id: Math.max(0, ...list.map((x) => x.id || 0)) + 1, userId: user.id, modulo: mod, fecha: new Date().toISOString(),
        preguntas: questionIds, respuestas: answers, correctas: g.correctas, total: g.total, porcentaje: g.porcentaje,
        umbral, aprobado: g.porcentaje >= umbral, duracionSeg: Number(duracionSeg) || 0
      };
      list.push(intento);
      S.setLocal(KEYS.attempts, list);
      App.Progress.markExam(user.id, mod, intento.aprobado);
      return { ok: true, intento, detalle: g.detalle };
    }
  };
})(window.App);
