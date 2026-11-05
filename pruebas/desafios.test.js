const { JSDOM } = require("jsdom");
const fs = require("fs");
const root = require("path").join(__dirname, "..", "simulador") + "/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log("  ✗ FALLA:", m); } else console.log("  ✓", m); };

async function boot(id) {
  const dom = new JSDOM(`<body><div id="app"><aside id="info"></aside><div id="info-body"></div><button id="btn-engine"></button><button id="btn-taller"></button></div></body>`,
    { runScripts: "outside-only", url: "http://localhost/simulador.html?modo=desafio&id=" + id, pretendToBeVisual: true });
  const w = dom.window, posted = [];
  Object.defineProperty(w, "parent", { value: { postMessage: (m) => posted.push(m) }, configurable: true });
  let fake = 1000; w.performance.now = () => fake;
  // --- simulador simulado (mismo contrato que window.__sim) ---
  const ws = { on: false, out: new Map(), items: {}, hist: [], fx: {}, tip: "" };
  const PARTS = { Motor_Bujia: ["m", "Sin bujía no hay chispa."], Cadena_Pinon_Delantero: ["t", "x"], Cadena_Transmision: ["t", "x"], Componente_Electrico_Regulador: ["e", "x"], Refrig_Tapa_Radiador: ["r", "x"], Freno_Delantero_Pastillas: ["f", "Sin pastillas no frena."] };
  Object.keys(PARTS).forEach((n) => (ws.items[n] = {}));
  const DEPS = { Cadena_Pinon_Delantero: ["Cadena_Transmision"] };
  const sim = { on: false, starting: false, gear: 0, rpm: 0, v: 0, temp: 85, drainT: 0, clutchBtn: false, keys: { shift: false } };
  const fx = () => { const o = ws.out; return { noStart: o.has("Motor_Bujia"), noDrive: o.has("Cadena_Pinon_Delantero") || o.has("Cadena_Transmision"), drain: o.has("Componente_Electrico_Regulador"), overheat: o.has("Refrig_Tapa_Radiador") }; };
  const refresh = () => { ws.fx = fx(); w.dispatchEvent(new w.Event("ws-change")); };
  const expand = (n) => [n].concat(DEPS[n] || []);
  const bridge = {
    ws, sim, DEPS, PARTS, pretty: (n) => n.replace(/_/g, " "), levelOf: (n) => (PARTS[n] ? 1 : 3),
    wsEnter() { ws.on = true; }, isReady: () => true,
    wsRemove(n) { const names = expand(n).filter((x) => ws.items[x] && !ws.out.has(x)); if (!names.length) return; names.forEach((x) => ws.out.set(x, ws.out.size)); ws.hist.push({ type: "rem", names }); refresh(); },
    wsInstall(names, rec = true) { names = [].concat(names).filter((x) => ws.out.has(x)); if (!names.length) return; names.forEach((x) => ws.out.delete(x)); if (rec) ws.hist.push({ type: "add", names }); refresh(); },
    wsUndo() { const a = ws.hist.pop(); if (!a) return; if (a.type === "rem") bridge.wsInstall(a.names, false); else a.names.forEach((x) => ws.out.set(x, 0)), refresh(); },
    wsRefresh: refresh
  };
  w.__sim = bridge; ws.fx = fx();
  for (const f of ["desafios/registro.js", "desafios/d1-bujia.js", "desafios/d2-transmision.js", "desafios/d3-falla-combinada.js", "desafio-runtime.js"]) w.eval(fs.readFileSync(root + f, "utf8"));
  const $ = (s) => w.document.querySelector(s), click = (s) => $(s).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  const select = (n) => w.dispatchEvent(new w.CustomEvent("sim-select", { detail: n }));
  w.document.getElementById("btn-engine").addEventListener("click", () => { if (!sim.on && !ws.fx.noStart) sim.on = true; }); // lo que haría el simulador real
  await sleep(450);
  ok(!$("#dz-start").disabled, "[" + id + "] el simulador carga y habilita «Comenzar»");
  click("#dz-start"); await sleep(50);
  return { w, $, click, select, ws, sim, bridge, posted, tick: async (adv) => { if (adv) fake += adv; await sleep(260); }, steps: () => w.document.querySelectorAll(".dz-steps li.done").length, msg: () => ($(".dz-msg") || {}).textContent || "", sleep };
}

(async () => {
  console.log("DESAFÍO 1");
  let t = await boot("desafio-1");
  ok(t.ws.out.has("Motor_Bujia") && t.ws.on, "arranca en modo taller con la bujía fuera");
  t.select("Freno_Delantero_Pastillas"); ok(t.steps() === 0, "seleccionar antes de tiempo no avanza");
  t.click("#btn-engine"); await t.tick(); ok(t.steps() === 1 && /confirmada/.test(t.msg()), "paso 1: intento de arranque con la falla");
  t.select("Freno_Delantero_Pastillas"); ok(t.steps() === 1 && /no es la que impide/.test(t.msg()), "pieza equivocada: pista, sin error");
  t.bridge.wsInstall(["Motor_Bujia"]); await t.sleep(30);
  ok(/primero identifica/i.test(t.msg()) && t.ws.out.has("Motor_Bujia"), "instalar ANTES de identificar: error de orden y se revierte");
  ok(t.ws.hist.length === 0, "el historial queda limpio tras revertir");
  t.bridge.wsRemove("Freno_Delantero_Pastillas"); await t.sleep(30);
  ok(/no está relacionada/.test(t.msg()) && /Sin pastillas/.test(t.msg()), "retirar pieza sana: error explicado");
  t.click('[data-dz="deshacer"]'); await t.sleep(30);
  ok(!t.ws.out.has("Freno_Delantero_Pastillas"), "«Deshacer» corrige el error");
  t.select("Motor_Bujia"); ok(t.steps() === 2, "paso 2: identifica la bujía");
  t.click('[data-dz="instalar"]'); await t.sleep(30); ok(t.steps() === 3, "paso 3: instalar (botón de la pieza seleccionada)");
  await t.tick(); ok(t.steps() === 3, "aún no cuenta: el motor no ha arrancado");
  t.click("#btn-engine"); await t.tick(); await t.tick();
  ok(!t.$("#dz-fin").hidden && t.posted.length === 1, "desafío completado y resultado enviado");
  const res = t.posted[0]; ok(res.tipo === "desafio-resultado" && res.desafio === "desafio-1" && res.ok && res.errores === 2 && res.pasos === 4, "resultado: " + JSON.stringify({ e: res.errores, p: res.pistas, a: res.acciones.length }));

  console.log("DESAFÍO 2");
  t = await boot("desafio-2");
  ok(t.ws.out.has("Cadena_Pinon_Delantero") && t.ws.out.has("Cadena_Transmision"), "faltan piñón y cadena (dependencia)");
  t.sim.on = true; await t.tick(); ok(t.steps() === 1, "paso 1: arranca");
  t.sim.gear = 1; t.sim.rpm = 3000; await t.tick(); ok(t.steps() === 2, "paso 2: gira y no avanza (se comprueba el síntoma)");
  t.select("Cadena_Transmision"); ok(t.steps() === 2 && /primera del recorrido/.test(t.msg()), "elegir la cadena en vez del piñón: pista");
  t.select("Cadena_Pinon_Delantero"); ok(t.steps() === 3, "paso 3: identifica el piñón");
  t.bridge.wsInstall(["Cadena_Transmision"]); await t.sleep(30);
  ok(/antes de montar la cadena/.test(t.msg()) && t.ws.out.has("Cadena_Transmision"), "cadena antes del piñón: error de orden, se revierte");
  t.bridge.wsInstall(["Cadena_Pinon_Delantero"]); await t.sleep(30); ok(t.steps() === 4, "paso 4: piñón instalado");
  t.bridge.wsInstall(["Cadena_Transmision"]); await t.sleep(30); ok(t.steps() === 5, "paso 5: cadena instalada");
  t.sim.v = 0.2; await t.tick(); ok(t.steps() === 5, "sin avanzar no se da por resuelto");
  t.sim.v = 3; await t.tick(); await t.tick(); ok(!t.$("#dz-fin").hidden && t.posted[0].errores === 1, "completado con 1 error de orden");

  console.log("DESAFÍO 3");
  t = await boot("desafio-3");
  ok(t.ws.out.size === 2, "dos piezas fuera, de sistemas distintos");
  t.sim.on = true; t.sim.drainT = 10; await t.tick(); t.sim.on = false; await t.tick();
  ok(t.steps() === 0, "apagado manual (no por batería) no cuenta");
  t.sim.on = true; await t.tick(); t.sim.drainT = 24.8; await t.tick(); t.sim.on = false; t.sim.drainT = 0; await t.tick();
  ok(t.steps() === 1, "paso 1: se apagó por batería agotada");
  t.bridge.wsInstall(["Refrig_Tapa_Radiador"]); await t.sleep(30);
  ok(/una falla a la vez/.test(t.msg()) && t.ws.out.has("Refrig_Tapa_Radiador"), "reparar la 2.ª falla antes: error de orden");
  t.select("Refrig_Tapa_Radiador"); ok(t.steps() === 1, "elegir la tapa para el síntoma eléctrico: no avanza");
  t.select("Componente_Electrico_Regulador"); ok(t.steps() === 2, "paso 2: regulador");
  t.bridge.wsInstall(["Componente_Electrico_Regulador"]); await t.sleep(30); ok(t.steps() === 3, "paso 3: regulador instalado");
  t.sim.on = true; t.sim.temp = 106; await t.tick(); ok(t.steps() === 4, "paso 4: sobrecalentamiento detectado");
  t.select("Refrig_Tapa_Radiador"); ok(t.steps() === 5, "paso 5: tapa identificada");
  t.bridge.wsInstall(["Refrig_Tapa_Radiador"]); await t.sleep(30); ok(t.steps() === 6, "paso 6: tapa instalada");
  t.sim.temp = 97; await t.tick(); ok(t.steps() === 6, "aún no pasaron 15 s estables");
  await t.tick(16000); await t.tick(); ok(!t.$("#dz-fin").hidden && t.posted.length === 1, "paso 7 y verificación final: completado");
  console.log(fails ? "\nFALLARON " + fails : "\nTODO OK"); process.exit(fails ? 1 : 0);
})();
