/* =====================================================================
   desafio-runtime.js — Motor de desafíos del simulador.
   Se activa solo con  simulador.html?modo=desafio&id=desafio-N.
   Lee la definición del desafío (desafios/*.js), prepara la moto,
   valida CONDICIONES (no clics) y avisa a la página padre del resultado.
   Usa el puente window.__sim que expone simulador.html.
   ===================================================================== */
(function () {
  "use strict";
  const params = new URLSearchParams(location.search);
  if (params.get("modo") !== "desafio") return;
  const def = window.DESAFIOS && window.DESAFIOS.obtener(params.get("id"));
  if (!def) { console.warn("Desafío no encontrado:", params.get("id")); return; }

  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hasParent = window.parent && window.parent !== window;
  let S = null;                                   // puente (window.__sim)

  const st = {
    estado: "espera",          // espera → intro → juego → verificando → fin
    i: 0, hechos: [], ev: {}, errores: 0, pistas: 0, pistaIdx: {},
    acciones: [], sel: null, prevOut: new Set(), revirtiendo: false,
    malRetiradas: new Set(), flags: {}, estableMs: 0, last: 0,
    prevOn: false, prevDrainT: 0, prevTemp: 85, t0: 0, msg: null, msgKey: "", timer: null
  };

  /* ---------- Condiciones sobre el estado de la moto ---------- */
  const CONDS = {
    "arranca": () => S.sim.on,
    "no-avanza": () => S.sim.on && S.sim.gear >= 1 && S.sim.rpm >= 2500 && !(S.sim.clutchBtn || S.sim.keys.shift),
    "avanza": () => S.sim.on && S.sim.gear >= 1 && S.sim.v > 1,
    "apagado-bateria": () => !!st.flags.apagadoBateria,
    "sobrecalentado": () => S.sim.on && (S.sim.temp || 85) >= 105,
    "estable": () => st.estableMs >= 15000
  };

  /* ---------- Utilidades de definición ---------- */
  const piezasDe = (p) => [].concat(p.piezas || p.pieza || []);
  const pasoDePieza = (n, tipo) => def.pasos.findIndex((p) => p.tipo === tipo && piezasDe(p).includes(n));
  const permitidas = new Set();
  function expandir(n) { return [n].concat((S.DEPS[n] || [])); }
  function calcularPermitidas() {
    permitidas.clear();
    def.pasos.forEach((p) => piezasDe(p).forEach((n) => expandir(n).forEach((x) => permitidas.add(x))));
    def.inicial.faltantes.forEach((n) => expandir(n).forEach((x) => permitidas.add(x)));
  }
  const nombres = (arr) => arr.map((n) => S.pretty(n)).join(", ");

  /* ---------- Mensajes y registro ---------- */
  function setMsg(tipo, texto) { st.msg = { tipo, texto }; render(); }
  function log(tipo, pieza) { st.acciones.push({ t: Math.round((Date.now() - st.t0) / 1000), tipo, pieza: pieza || null }); }
  function error(texto, tipo, pieza) { st.errores++; log("error:" + tipo, pieza); setMsg("bad", texto); }

  /* ---------- Evaluación de pasos ---------- */
  function cumple(p) {
    switch (p.tipo) {
      case "instalar": return piezasDe(p).every((n) => !S.ws.out.has(n));
      case "retirar": return piezasDe(p).every((n) => S.ws.out.has(n));
      case "estado": return !!CONDS[p.cond] && CONDS[p.cond]();
      default: return !!st.ev[p.id];            // intento-arranque, seleccionar: por evento
    }
  }
  function evaluar() {
    if (st.estado === "juego") {
      let avanzo = false;
      while (st.i < def.pasos.length && cumple(def.pasos[st.i])) {
        const p = def.pasos[st.i];
        st.hechos.push(p.id); st.i++; avanzo = true; log("paso:" + p.id);
        st.msg = { tipo: "ok", texto: p.ok || "Paso completado." };
      }
      if (st.i >= def.pasos.length) st.estado = "verificando";
      if (avanzo) render();
    }
    if (st.estado === "verificando") verificar();
  }
  function verificar() {
    const fuera = [...S.ws.out.keys()];
    if (fuera.length) {
      const key = "fuera:" + fuera.join(",");
      if (st.msgKey !== key) { st.msgKey = key; setMsg("warn", "Todos los pasos están hechos, pero aún hay piezas fuera de la moto: " + nombres(fuera) + ". Reinstálalas para dar el desafío por terminado."); }
      return;
    }
    completar();
  }

  /* ---------- Eventos del simulador ---------- */
  function onSelect(name) {
    st.sel = name;
    const p = def.pasos[st.i];
    if (st.estado === "juego" && p && p.tipo === "seleccionar") {
      if (piezasDe(p).includes(name)) { st.ev[p.id] = true; log("seleccion:ok", name); evaluar(); return; }
      log("seleccion:otra", name);
      st.msg = { tipo: "warn", texto: (p.mal || "Esa no es la pieza que causa el problema. Revisa el síntoma y vuelve a intentar.") + " (Seleccionaste: " + S.pretty(name) + ".)" };
    }
    render();
  }
  function onEngineClick() {
    if (!S || st.estado !== "juego") return;
    if (!S.sim.on && !S.sim.starting && S.ws.fx.noStart) {
      const p = def.pasos[st.i];
      if (p && p.tipo === "intento-arranque") { st.ev[p.id] = true; log("intento-arranque"); setTimeout(evaluar, 0); }
    }
  }
  function revertirInstalacion(n) {
    st.revirtiendo = true;
    const h = S.ws.hist;
    if (h.length && h[h.length - 1].type === "add" && h[h.length - 1].names.includes(n)) h.pop();
    const antes = h.length;
    S.wsRemove(n, true);
    if (h.length > antes) h.pop();
    st.prevOut = new Set(S.ws.out.keys());
    st.revirtiendo = false;
    const info = $("#info"); if (info) info.classList.remove("show");
  }
  function onWsChange() {
    if (st.revirtiendo) return;
    if (st.estado !== "juego" && st.estado !== "verificando") return;
    const ahora = new Set(S.ws.out.keys());
    const retiradas = [...ahora].filter((n) => !st.prevOut.has(n));
    const instaladas = [...st.prevOut].filter((n) => !ahora.has(n));
    st.prevOut = ahora;

    retiradas.forEach((n) => {
      log("retirar", n);
      if (!permitidas.has(n)) {
        st.malRetiradas.add(n);
        const razon = S.PARTS[n] ? S.PARTS[n][1] : "";
        error("Retiraste «" + S.pretty(n) + "», pero esa pieza no está relacionada con esta falla. " + razon + " Pulsa «Deshacer» para volver a ponerla y revisa de nuevo el síntoma.", "retirar", n);
      } else if (pasoDePieza(n, "instalar") !== -1 && def.pasos[pasoDePieza(n, "instalar")] && st.hechos.includes(def.pasos[pasoDePieza(n, "instalar")].id)) {
        setMsg("warn", "Quitaste «" + S.pretty(n) + "», que ya habías instalado. Vuelve a instalarla para que el desafío pueda terminar.");
      }
    });
    instaladas.forEach((n) => {
      log("instalar", n);
      const idx = pasoDePieza(n, "instalar");
      if (idx > st.i) {                                    // intenta adelantarse a un paso posterior
        const msg = def.pasos[idx].ordenMsg || "Esa pieza corresponde a un paso posterior. Sigue el orden de los pasos.";
        revertirInstalacion(n);
        error(msg + " La pieza se volvió a retirar.", "orden", n);
      } else {
        st.malRetiradas.delete(n);
      }
    });
    evaluar(); render();
  }

  /* ---------- Reloj de la simulación (flags y tiempos) ---------- */
  function tick() {
    if (st.estado !== "juego" && st.estado !== "verificando") return;
    const s = S.sim, now = performance.now(), dt = st.last ? (now - st.last) : 0; st.last = now;
    if (st.prevOn && !s.on) {
      if (st.prevDrainT >= 24 && S.ws.fx.drain) st.flags.apagadoBateria = true;
    }
    st.prevOn = !!s.on; st.prevDrainT = s.drainT || 0; st.prevTemp = s.temp || 85;
    const estable = s.on && (s.temp || 85) < 100 && !S.ws.fx.overheat && !S.ws.fx.drain && !S.ws.fx.noStart;
    st.estableMs = estable ? st.estableMs + dt : 0;
    evaluar();
    const t = $("#dz-time"); if (t) t.textContent = fmt(Math.round((Date.now() - st.t0) / 1000));
    const bar = $("#dz-hold");
    if (bar) { const p = def.pasos[st.i]; bar.hidden = !(p && p.cond === "estable"); bar.firstElementChild.style.width = Math.min(100, st.estableMs / 150) + "%"; }
  }
  const fmt = (sec) => Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");

  /* ---------- Acciones del panel ---------- */
  function pista() {
    const p = def.pasos[st.i];
    if (!p) return;
    const lista = p.pistas || [], k = st.pistaIdx[p.id] || 0;
    if (k >= lista.length) { setMsg("warn", "No quedan más pistas para este paso. Relee la instrucción y explora la información de las piezas."); return; }
    st.pistaIdx[p.id] = k + 1; st.pistas++; log("pista", p.id);
    setMsg("hint", "Pista " + (k + 1) + ": " + lista[k]);
  }
  function instalarSel() {
    if (!st.sel) return setMsg("warn", "Primero selecciona una pieza (en la bandeja o en la lista de piezas).");
    if (!S.ws.out.has(st.sel)) return setMsg("warn", "«" + S.pretty(st.sel) + "» ya está instalada en la moto.");
    S.wsInstall([st.sel]);
  }
  function retirarSel() {
    if (!st.sel) return setMsg("warn", "Primero selecciona una pieza.");
    if (S.ws.out.has(st.sel)) return setMsg("warn", "«" + S.pretty(st.sel) + "» ya está fuera de la moto.");
    if (S.levelOf(st.sel) !== 1) return setMsg("warn", "«" + S.pretty(st.sel) + "» no se puede desmontar en el simulador.");
    S.wsRemove(st.sel);
  }
  function salir() { if (hasParent) window.parent.postMessage({ tipo: "desafio-salir", desafio: def.id }, "*"); }

  /* ---------- Inicio y final ---------- */
  function iniciar() {
    S.wsEnter();
    const btn = $("#btn-taller");
    if (btn) { btn.textContent = "Taller activo"; btn.classList.add("on"); btn.disabled = true; }
    S.ws.out.forEach((_, n) => S.wsInstall([n], false));           // arranca con la moto completa
    calcularPermitidas();
    def.inicial.faltantes.forEach((n) => { if (S.ws.items[n]) S.wsRemove(n, true); else console.warn("Pieza no encontrada en el modelo:", n); });
    S.ws.hist.length = 0; S.ws.tip = "";
    S.wsRefresh();
    const info = $("#info"); if (info) info.classList.remove("show");
    const body = $("#info-body"); if (body) body.innerHTML = "";
    st.prevOut = new Set(S.ws.out.keys());
    st.t0 = Date.now(); st.last = 0; st.estado = "juego";
    $("#app").classList.add("dz-on");
    $("#dz-intro").hidden = true; $("#dz-panel").hidden = false;
    st.msg = { tipo: "hint", texto: "Desafío iniciado. Sigue los pasos en orden." };
    render();
    st.timer = setInterval(tick, 200);
  }
  function completar() {
    if (st.estado === "fin") return;
    st.estado = "fin"; clearInterval(st.timer);
    const dur = Math.max(1, Math.round((Date.now() - st.t0) / 1000));
    const res = { tipo: "desafio-resultado", desafio: def.id, modulo: def.modulo, ok: true, errores: st.errores, pistas: st.pistas, duracionSeg: dur, pasos: def.pasos.length, acciones: st.acciones };
    if (hasParent) window.parent.postMessage(res, "*");
    const nota = st.errores === 0 && st.pistas === 0 ? "Impecable: sin errores y sin pistas." : st.errores <= 2 ? "Muy bien: lo resolviste con pocos errores." : "Superado: lo importante es que corregiste y aprendiste.";
    $("#dz-panel").hidden = true;
    const fin = $("#dz-fin");
    fin.innerHTML = '<div class="dz-card dz-card-ok"><div class="dz-big">🏆</div><h2>¡Felicitaciones! Desafío superado</h2>' +
      "<p><b>" + esc(def.titulo) + "</b></p><p>" + esc(def.final && def.final.mensaje || "") + "</p>" +
      '<div class="dz-stats"><span><b>' + st.errores + "</b>errores</span><span><b>" + st.pistas + "</b>pistas</span><span><b>" + fmt(dur) + "</b>tiempo</span></div>" +
      "<p class=\"dz-note\">" + esc(nota) + "</p>" +
      '<div class="dz-row">' + (hasParent ? '<button class="dz-btn primary" data-dz="volver">Volver al curso</button>' : "") + '<button class="dz-btn" data-dz="repetir">Repetir desafío</button></div></div>';
    fin.hidden = false;
  }

  /* ---------- Interfaz ---------- */
  function build() {
    const root = document.createElement("div");
    root.id = "dz-root";
    root.innerHTML = '<div id="dz-intro" class="dz-overlay" hidden></div><section id="dz-panel" hidden aria-label="Desafío"></section><div id="dz-fin" class="dz-overlay" hidden></div>';
    document.body.appendChild(root);
    $("#dz-intro").innerHTML = '<div class="dz-card"><span class="dz-chip">Desafío ' + def.modulo + " · " + esc(def.nivel) + "</span><h2>" + esc(def.titulo) + "</h2>" +
      "<h3>La situación</h3><p>" + esc(def.situacion) + "</p><h3>Tu objetivo</h3><p>" + esc(def.objetivo) + "</p>" +
      "<h3>Condiciones iniciales</h3><ul>" + def.condiciones.map((c) => "<li>" + esc(c) + "</li>").join("") + "</ul>" +
      '<p class="dz-note">Puedes usar pistas, deshacer acciones y corregir errores. Cada acción incorrecta se explica.</p>' +
      '<div class="dz-row"><button id="dz-start" class="dz-btn primary" disabled>Cargando simulador…</button>' + (hasParent ? '<button class="dz-btn" data-dz="salir">Volver</button>' : "") + "</div></div>";
    $("#dz-intro").hidden = false;
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-dz]"); if (!b) return;
      ({ pista, instalar: instalarSel, retirar: retirarSel, deshacer: () => S.wsUndo(), salir, volver: salir, repetir: () => location.reload(),
         plegar: () => { $("#dz-panel").classList.toggle("fold"); } })[b.dataset.dz]?.();
    });
    $("#dz-start").addEventListener("click", iniciar);
  }
  function render() {
    const panel = $("#dz-panel"); if (!panel || st.estado === "intro" || st.estado === "espera") return;
    const sel = st.sel ? S.pretty(st.sel) : "ninguna";
    const pasos = def.pasos.map((p, k) => {
      const hecho = k < st.i, actual = k === st.i && st.estado === "juego";
      return '<li class="' + (hecho ? "done" : actual ? "now" : "") + '"><span class="dz-dot">' + (hecho ? "✓" : k + 1) + "</span><span>" + esc(p.texto) + "</span></li>";
    }).join("");
    const msg = st.msg ? '<div class="dz-msg ' + st.msg.tipo + '" role="status">' + esc(st.msg.texto) + "</div>" : "";
    panel.innerHTML = '<div class="dz-head"><div><span class="dz-chip">Desafío ' + def.modulo + " · " + esc(def.nivel) + "</span><strong>" + esc(def.titulo) + '</strong></div><button class="dz-fold" data-dz="plegar" aria-label="Plegar o desplegar">▾</button></div>' +
      '<div class="dz-body"><ol class="dz-steps">' + pasos + "</ol>" + msg +
      '<div id="dz-hold" class="dz-hold" hidden><i></i></div>' +
      '<div class="dz-sel">Pieza seleccionada: <b>' + esc(sel) + "</b></div>" +
      '<div class="dz-row"><button class="dz-btn" data-dz="pista">💡 Pista</button><button class="dz-btn" data-dz="instalar">Instalar pieza seleccionada</button><button class="dz-btn" data-dz="retirar">Retirar</button><button class="dz-btn" data-dz="deshacer">Deshacer</button><button class="dz-btn ghost" data-dz="salir">Salir</button></div>' +
      '<div class="dz-foot"><span>Errores: <b>' + st.errores + "</b></span><span>Pistas: <b>" + st.pistas + '</b></span><span>Tiempo: <b id="dz-time">' + fmt(Math.round((Date.now() - st.t0) / 1000)) + "</b></span></div></div>";
  }

  /* ---------- Arranque ---------- */
  build();
  const engineBtn = $("#btn-engine");
  if (engineBtn) engineBtn.addEventListener("click", onEngineClick);   // se registra antes que el del simulador
  window.addEventListener("sim-select", (e) => onSelect(e.detail));
  window.addEventListener("ws-change", () => { if (S) onWsChange(); });
  const espera = setInterval(() => {
    if (window.__sim && window.__sim.isReady() && Object.keys(window.__sim.ws.items).length) {
      clearInterval(espera); S = window.__sim; st.estado = "intro";
      const b = $("#dz-start"); b.disabled = false; b.textContent = "Comenzar desafío";
    }
  }, 200);
})();
