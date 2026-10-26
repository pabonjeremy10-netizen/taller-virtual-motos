/* =====================================================================
   auth.js — Autenticación, sesión y control de acceso por rol (RBAC).
   ===================================================================== */
(function (App) {
  "use strict";

  const { KEYS } = App.Config;
  const S = App.Storage;

  const isStaff = (user) => user.rol === "admin" || user.rol === "docente";

  // Qué vistas puede abrir cada rol.
  const RULES = {
    student: (u) => u.rol === "estudiante",
    admin: isStaff,
    simulator: () => true
  };

  App.Auth = {
    isStaff,
    canAccess: (user, view) => !!user && !!RULES[view] && RULES[view](user),
    homeFor: (user) => (isStaff(user) ? "admin" : "student"),

    // rolSeleccionado: "estudiante" | "staff" (lo que eligió la persona en el formulario)
    // Devuelve { ok:true, user } o { ok:false, error }
    login(correo, clave, rolSeleccionado) {
      correo = (correo || "").trim().toLowerCase();
      if (!correo || !clave) return { ok: false, error: "Escribe tu correo y tu contraseña." };
      if (!App.Utils.isEmail(correo)) return { ok: false, error: "El correo no es válido. Ejemplo: nombre@colegio.edu.co" };

      const user = App.Users.findByCredentials(correo, clave);
      if (!user) return { ok: false, error: "Correo o contraseña incorrectos." };
      if (!user.activo) return { ok: false, error: "Tu cuenta está desactivada. Habla con el administrador." };
      if ((rolSeleccionado === "estudiante") !== (user.rol === "estudiante"))
        return { ok: false, error: "Esta cuenta no corresponde al rol seleccionado." };

      S.setSession(KEYS.session, { id: user.id });
      return { ok: true, user };
    },

    // Usuario con sesión válida (y todavía activo) o null.
    current() {
      const session = S.getSession(KEYS.session);
      if (!session) return null;
      const user = App.Users.findById(session.id);
      if (user && user.activo) return user;
      S.removeSession(KEYS.session);
      return null;
    },

    logout() { S.removeSession(KEYS.session); }
  };
})(window.App);
