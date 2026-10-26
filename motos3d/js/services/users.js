/* =====================================================================
   users.js — Servicio de usuarios: consulta, alta y activación/desactivación.
   Contiene las reglas de negocio; no toca el DOM.
   ===================================================================== */
(function (App) {
  "use strict";

  const { KEYS } = App.Config;
  const S = App.Storage;

  const all = () => S.getLocal(KEYS.users, []);
  const save = (users) => S.setLocal(KEYS.users, users);

  App.Users = {
    // Crea los usuarios de demostración la primera vez que se abre la app.
    ensureSeed() { if (!S.hasLocal(KEYS.users)) save(App.Seed.users); },

    all,
    students: () => all().filter((u) => u.rol === "estudiante"),
    findById: (id) => all().find((u) => u.id === id) || null,
    findByCredentials: (correo, clave) => all().find((u) => u.correo === correo && u.clave === clave) || null,

    // Devuelve { ok, user } o { ok:false, error }
    addStudent({ nombre, correo, clave }) {
      nombre = (nombre || "").trim();
      correo = (correo || "").trim().toLowerCase();
      if (!nombre || !correo || !clave) return { ok: false, error: "Completa nombre, correo y contraseña temporal." };
      if (!App.Utils.isEmail(correo)) return { ok: false, error: "El correo no es válido." };
      const users = all();
      if (users.some((u) => u.correo === correo)) return { ok: false, error: "Ya existe un usuario con ese correo." };
      const user = { id: Math.max(0, ...users.map((u) => u.id)) + 1, nombre, correo, clave, rol: "estudiante", activo: true };
      users.push(user);
      save(users);
      return { ok: true, user };
    },

    // Activa o desactiva una cuenta (baja lógica: el historial se conserva).
    toggleActive(id) {
      const users = all();
      const u = users.find((x) => x.id === id);
      if (!u) return false;
      u.activo = !u.activo;
      save(users);
      return true;
    }
  };
})(window.App);
