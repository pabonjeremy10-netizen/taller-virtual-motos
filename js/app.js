/* =====================================================================
   app.js — Arranque y enrutador. Decide qué vista se muestra según la
   sesión y el rol, y conecta las vistas entre sí.
   ===================================================================== */
(function (App) {
  "use strict";

  const { $, $$ } = App.Utils;

  function show(view) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.dataset.view === view));
    window.scrollTo(0, 0);
  }

  // Navega a una vista respetando la sesión y el rol (RBAC centralizado).
  // opts: datos para la vista destino (p. ej. { modo: "desafio", id } o { screen: "module", mod })
  function go(view, opts) {
    const user = App.Auth.current();
    if (!user) return show("login");
    if (!App.Auth.canAccess(user, view)) { view = App.Auth.homeFor(user); opts = null; }
    if (view === "simulator" && App.Views.Simulator.open(user, opts) === false) { view = App.Auth.homeFor(user); opts = null; }
    if (view === "student") App.Views.Student.render(user, opts);
    if (view === "admin") App.Views.Admin.render(user);
    show(view);
  }

  function home(nav) {
    const user = App.Auth.current();
    go(user ? App.Auth.homeFor(user) : "login", nav);
  }

  function logout() {
    App.Views.Simulator.unload();
    App.Auth.logout();
    App.Views.Login.reset();
    show("login");
  }

  function boot() {
    App.Users.ensureSeed();
    App.Activity.ensureSeed();
    App.Progress.ensureSeed();

    App.Views.Login.init(home);
    App.Views.Student.init();
    App.Views.Admin.init();
    App.Views.Simulator.init(() => {
      const nav = App.Views.Simulator.takeReturn();   // si venía de un desafío, vuelve a su módulo
      App.Views.Simulator.close();
      home(nav);
    });

    $$("[data-logout]").forEach((b) => b.addEventListener("click", logout));
    $$("[data-open-simulator]").forEach((b) => b.addEventListener("click", () => go("simulator")));

    home(); // si ya hay sesión en esta pestaña, entra directo a su menú
  }

  App.Router = { go, home, logout };
  boot();
})(window.App);
