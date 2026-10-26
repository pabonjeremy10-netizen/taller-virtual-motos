/* =====================================================================
   login.view.js — Pantalla de acceso. Solo lee el formulario y muestra el
   resultado; la validación vive en App.Auth.
   ===================================================================== */
(function (App) {
  "use strict";

  const { $, $$ } = App.Utils;

  App.Views.Login = {
    // onSuccess(user) lo define el enrutador (app.js)
    init(onSuccess) {
      App.Gauge.draw($("#gauge"));

      $("#login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const rol = $("input[name=rol]:checked").value;
        const result = App.Auth.login($("#correo").value, $("#clave").value, rol);
        if (!result.ok) return this.setError(result.error);
        this.setError("");
        onSuccess(result.user);
      });

      // Atajos para rellenar las cuentas de prueba
      $$("[data-demo]").forEach((btn) => btn.addEventListener("click", () => {
        const [correo, clave, rol] = btn.dataset.demo.split("|");
        $("#correo").value = correo;
        $("#clave").value = clave;
        $(`input[name=rol][value=${rol}]`).checked = true;
        this.setError("");
      }));
    },

    setError(text) { $("#login-error").textContent = text; },

    reset() { $("#login-form").reset(); this.setError(""); }
  };
})(window.App);
