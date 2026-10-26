/* =====================================================================
   activity.js — Historial de prácticas en el simulador y datos de reportes.
   ===================================================================== */
(function (App) {
  "use strict";

  const { KEYS } = App.Config;
  const S = App.Storage;

  const all = () => S.getLocal(KEYS.log, []);
  const save = (log) => S.setLocal(KEYS.log, log);

  App.Activity = {
    ensureSeed() { if (!S.hasLocal(KEYS.log)) save(App.Seed.log()); },
    all,
    byUser: (correo) => all().filter((l) => l.correo === correo),

    // Registra el inicio de una práctica y devuelve su id (para cerrarla después).
    start(correo) {
      const log = all();
      const id = Math.max(0, ...log.map((l) => l.id || 0)) + 1;
      log.push({ id, correo, fecha: new Date().toISOString(), duracionSeg: 0 });
      save(log);
      return id;
    },

    // Guarda cuánto duró la práctica.
    end(id) {
      const log = all();
      const entry = log.find((l) => l.id === id);
      if (!entry) return;
      entry.duracionSeg = Math.max(0, Math.round((Date.now() - new Date(entry.fecha).getTime()) / 1000));
      save(log);
    },

    // Resumen por estudiante para la pestaña de reportes.
    summary(students) {
      const log = all();
      const rows = students.map((user) => {
        const mine = log.filter((l) => l.correo === user.correo);
        return {
          user,
          count: mine.length,
          seconds: mine.reduce((sum, l) => sum + (l.duracionSeg || 0), 0),
          last: mine.length ? mine.map((l) => l.fecha).sort().pop() : null
        };
      });
      return { rows, totalPractices: rows.reduce((sum, r) => sum + r.count, 0) };
    }
  };
})(window.App);
