/* =====================================================================
   registro.js — Registro de desafíos. Cada desafío vive en su propio
   archivo (d1-…, d2-…, d3-…) y se registra aquí. Para crear uno nuevo:
   1) copia un archivo existente, 2) cambia id/módulo/pasos, 3) añádelo
   con <script> en simulador.html e index.html. No hay que tocar el
   simulador ni el motor de desafíos (desafio-runtime.js).

   Formato de un desafío (ver d1-bujia.js como ejemplo comentado):
     id, modulo, nivel, titulo, situacion, objetivo, condiciones[]
     inicial: { faltantes: [nombres de pieza del modelo 3D] }
     pasos[]: { id, texto, tipo, ... }   tipos:
        "intento-arranque"  → pulsar «Encender motor» con la falla presente
        "seleccionar"       → elegir la pieza correcta (pieza | piezas)
        "instalar"          → volver a instalar la pieza (pieza | piezas)
        "retirar"           → retirar la pieza (pieza | piezas)
        "estado"            → comprobar un estado de la moto (cond)
     cada paso: ok (mensaje al cumplirlo), mal (si eligen otra pieza),
                pistas[] (de la más suave a la más clara),
                ordenMsg (si intentan adelantar este paso)
     final: { mensaje }
   ===================================================================== */
(function (w) {
  "use strict";
  const lista = {};
  w.DESAFIOS = {
    registrar(d) { lista[d.id] = d; },
    obtener: (id) => lista[id] || null,
    delModulo: (m) => Object.values(lista).find((d) => d.modulo === m) || null,
    todos: () => Object.values(lista).sort((a, b) => a.modulo - b.modulo)
  };
})(window);
