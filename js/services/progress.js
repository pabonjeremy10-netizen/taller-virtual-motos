/* =====================================================================
   progress.js — Progreso académico y reglas de desbloqueo.
   Todas las reglas están AQUÍ (no en las vistas). Hoy se guardan en el
   navegador; al pasar al backend esta capa se reemplaza por llamadas a la
   API y las reglas se validan en el servidor (ver README, fase 4).

   Modelo (equivale a las tablas futuras):
     progreso[userId][módulo] = { lecciones[], actividades[], evalAprobada,
                                  desafioAprobado, completadoEn, … }
     intentos[]   → evaluaciones presentadas (en exams.js)
     desafios[]   → resultados de desafíos prácticos
     ajustes      → { umbral }
   Un módulo se completa SOLO con las dos condiciones independientes:
   evaluación aprobada Y desafío práctico superado.
   ===================================================================== */
(function (App) {
  "use strict";

  const { KEYS } = App.Config;
  const S = App.Storage;
  const C = () => App.Course;

  const empty = () => ({ lecciones: [], actividades: [], evalAprobada: false, evalFecha: null, desafioAprobado: false, desafioFecha: null, completadoEn: null });
  const readAll = () => S.getLocal(KEYS.progress, {});
  const rec = (userId, mod) => Object.assign(empty(), (readAll()[userId] || {})[mod] || {});
  function update(userId, mod, fn) {
    const all = readAll();
    all[userId] = all[userId] || {};
    const r = Object.assign(empty(), all[userId][mod] || {});
    fn(r);
    all[userId][mod] = r;
    S.setLocal(KEYS.progress, all);
    return r;
  }
  const ids = (list) => list.map((x) => x.id);
  const countDone = (done, list) => ids(list).filter((id) => done.includes(id)).length;

  const isComplete = (userId, mod) => { const r = rec(userId, mod); return r.evalAprobada && r.desafioAprobado; };
  const isLocked = (userId, mod) => mod > 1 && !isComplete(userId, mod - 1);
  const attempts = () => S.getLocal(KEYS.attempts, []);
  const results = () => S.getLocal(KEYS.challenges, []);

  const LABELS = {
    bloqueado: "Bloqueado", disponible: "Disponible", progreso: "En progreso",
    evaluacion: "Evaluación pendiente", desafio: "Desafío práctico pendiente", completado: "Completado y aprobado"
  };

  /* Estado completo de un módulo para un estudiante */
  function status(userId, mod) {
    const r = rec(userId, mod), lessons = C().lessonsOf(mod), acts = C().activitiesOf(mod);
    const l = countDone(r.lecciones, lessons), a = countDone(r.actividades, acts);
    const study = l === lessons.length && a === acts.length;
    const mine = attempts().filter((x) => x.userId === userId && x.modulo === mod);
    const best = mine.length ? Math.max(...mine.map((x) => x.porcentaje)) : null;
    const total = lessons.length + acts.length + 2;
    const pct = Math.round(((l + a + (r.evalAprobada ? 1 : 0) + (r.desafioAprobado ? 1 : 0)) / total) * 100);
    const locked = isLocked(userId, mod);

    let codigo;
    if (locked) codigo = "bloqueado";
    else if (r.evalAprobada && r.desafioAprobado) codigo = "completado";
    else if (r.evalAprobada) codigo = "desafio";
    else if (study) codigo = "evaluacion";
    else if (l + a > 0 || mine.length) codigo = "progreso";
    else codigo = "disponible";

    const pendientes = [];
    if (!locked) {
      if (l < lessons.length) pendientes.push("Completar las lecciones (" + l + "/" + lessons.length + ")");
      if (a < acts.length) pendientes.push("Realizar las actividades (" + a + "/" + acts.length + ")");
      if (!r.evalAprobada) pendientes.push("Aprobar la evaluación con " + umbral() + " % o más");
      if (!r.desafioAprobado) pendientes.push("Superar el desafío práctico en el simulador");
    }
    return {
      mod, codigo, etiqueta: LABELS[codigo], locked, pct, lessons: lessons.length, lDone: l, acts: acts.length, aDone: a,
      study, evalOk: r.evalAprobada, desafioOk: r.desafioAprobado, best, intentos: mine.length, pendientes, record: r
    };
  }

  function umbral() {
    const v = Number((S.getLocal(KEYS.settings, {}) || {}).umbral);
    return v >= 1 && v <= 100 ? v : App.Config.PASS_DEFAULT;
  }

  App.Progress = {
    LABELS, status, umbral, isComplete, isLocked,
    setUmbral(v) {
      v = Math.round(Number(v));
      if (!(v >= 1 && v <= 100)) return { ok: false, error: "Escribe un porcentaje entre 1 y 100." };
      const cfg = S.getLocal(KEYS.settings, {}) || {};
      cfg.umbral = v; S.setLocal(KEYS.settings, cfg);
      return { ok: true };
    },

    ensureSeed() {
      if (!S.hasLocal(KEYS.progress)) S.setLocal(KEYS.progress, App.Seed.progress());
      if (!S.hasLocal(KEYS.attempts)) S.setLocal(KEYS.attempts, App.Seed.attempts());
      if (!S.hasLocal(KEYS.challenges)) S.setLocal(KEYS.challenges, App.Seed.challengeResults());
    },

    // Lecciones y actividades
    lessonDone: (userId, mod, id) => rec(userId, mod).lecciones.includes(id),
    activityDone: (userId, mod, id) => rec(userId, mod).actividades.includes(id),
    completeLesson(userId, mod, id) {
      if (isLocked(userId, mod)) return { ok: false, error: "Este módulo está bloqueado." };
      update(userId, mod, (r) => { if (!r.lecciones.includes(id)) r.lecciones.push(id); });
      return { ok: true };
    },
    completeActivity(userId, mod, id) {
      if (isLocked(userId, mod)) return { ok: false, error: "Este módulo está bloqueado." };
      update(userId, mod, (r) => { if (!r.actividades.includes(id)) r.actividades.push(id); });
      return { ok: true };
    },

    // Reglas de acceso
    canExam(userId, mod) {
      const st = status(userId, mod);
      if (st.locked) return { ok: false, motivo: "Completa primero el módulo anterior." };
      if (!st.study) return { ok: false, motivo: "Completa todas las lecciones y actividades para habilitar la evaluación." };
      return { ok: true };
    },
    canChallenge(userId, mod) {
      const st = status(userId, mod);
      if (st.locked) return { ok: false, motivo: "Completa primero el módulo anterior." };
      if (!st.evalOk) return { ok: false, motivo: "Aprueba la evaluación para desbloquear el desafío práctico." };
      return { ok: true };
    },

    // Se llama desde exams.js cuando se califica un intento
    markExam(userId, mod, aprobado) {
      return update(userId, mod, (r) => {
        if (aprobado && !r.evalAprobada) { r.evalAprobada = true; r.evalFecha = new Date().toISOString(); }
        if (r.evalAprobada && r.desafioAprobado && !r.completadoEn) r.completadoEn = new Date().toISOString();
      });
    },

    // Resultado enviado por el simulador. Devuelve { ok, completado, siguiente } o { ok:false, error }
    recordChallenge(userId, mod, res) {
      const gate = this.canChallenge(userId, mod);
      if (!gate.ok) return { ok: false, error: gate.motivo };
      const def = App.Challenges.forModule(mod);
      if (!def || !res || res.desafio !== def.id || res.ok !== true || res.pasos !== def.pasos.length)
        return { ok: false, error: "El resultado del desafío no es válido." };
      const list = results();
      list.push({
        id: Math.max(0, ...list.map((x) => x.id || 0)) + 1, userId, modulo: mod, desafio: def.id, fecha: new Date().toISOString(),
        ok: true, errores: Number(res.errores) || 0, pistas: Number(res.pistas) || 0, duracionSeg: Number(res.duracionSeg) || 0,
        acciones: Array.isArray(res.acciones) ? res.acciones.length : 0
      });
      S.setLocal(KEYS.challenges, list);
      const r = update(userId, mod, (x) => {
        if (!x.desafioAprobado) { x.desafioAprobado = true; x.desafioFecha = new Date().toISOString(); }
        if (x.evalAprobada && x.desafioAprobado && !x.completadoEn) x.completadoEn = new Date().toISOString();
      });
      const completado = !!(r.evalAprobada && r.desafioAprobado);
      const siguiente = completado && C().module(mod + 1) ? mod + 1 : null;
      return { ok: true, completado, siguiente };
    },

    // Consultas para paneles
    attemptsOf: (userId, mod) => attempts().filter((x) => x.userId === userId && (!mod || x.modulo === mod)),
    challengesOf: (userId, mod) => results().filter((x) => x.userId === userId && (!mod || x.modulo === mod)),
    overall(userId) {
      const sts = C().modules().map((m) => status(userId, m.id));
      return Math.round(sts.reduce((n, s) => n + s.pct, 0) / sts.length);
    },
    nextModule(userId) {
      return C().modules().find((m) => { const s = status(userId, m.id); return !s.locked && s.codigo !== "completado"; }) || null;
    }
  };
})(window.App);
