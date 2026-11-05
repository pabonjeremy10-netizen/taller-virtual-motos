/* =====================================================================
   seed.js — Datos de demostración y contenido de ejemplo.
   NOTA: las contraseñas están en texto plano SOLO para esta simulación.
   En un sistema real se guardan como hash (bcrypt/Argon2) en el servidor.
   ===================================================================== */
(function (App) {
  "use strict";

  const daysAgo = (d) => new Date(Date.now() - d * 864e5).toISOString();

  App.Seed = {
    users: [
      { id: 1, nombre: "Laura Gómez",    correo: "estudiante@demo.com", clave: "1234",       rol: "estudiante", activo: true },
      { id: 2, nombre: "Carlos Pérez",   correo: "carlos@demo.com",     clave: "1234",       rol: "estudiante", activo: true },
      { id: 3, nombre: "Ana Ruiz",       correo: "ana@demo.com",        clave: "1234",       rol: "estudiante", activo: false },
      { id: 4, nombre: "Prof. Martínez", correo: "admin@demo.com",      clave: "admin123",   rol: "admin",      activo: true },
      { id: 5, nombre: "Docente Rojas",  correo: "docente@demo.com",    clave: "docente123", rol: "docente",    activo: true }
    ],
    log: () => [
      { id: 1, correo: "estudiante@demo.com", fecha: daysAgo(6), duracionSeg: 1260 },
      { id: 2, correo: "estudiante@demo.com", fecha: daysAgo(3), duracionSeg: 840 },
      { id: 3, correo: "estudiante@demo.com", fecha: daysAgo(1), duracionSeg: 1500 },
      { id: 4, correo: "carlos@demo.com",     fecha: daysAgo(4), duracionSeg: 600 },
      { id: 5, correo: "carlos@demo.com",     fecha: daysAgo(2), duracionSeg: 960 },
      { id: 6, correo: "ana@demo.com",        fecha: daysAgo(9), duracionSeg: 300 }
    ],
    guides: [
      ["Motor", "Convierte la combustión en movimiento: pistón, biela y cigüeñal."],
      ["Aire, combustible y escape", "Mezcla el aire con combustible y expulsa los gases quemados."],
      ["Transmisión", "Embrague, caja de cambios y cadena llevan la fuerza a la rueda trasera."],
      ["Frenos", "Disco, pinza y pastillas detienen la moto por fricción."],
      ["Suspensión", "Horquilla y amortiguador trasero absorben las irregularidades."],
      ["Sistema eléctrico", "Batería, bobina y bujía generan la chispa y alimentan las luces."],
      ["Refrigeración", "Mantiene el motor a su temperatura de trabajo."],
      ["Ruedas", "Neumático, rin y radios transmiten la tracción y soportan la carga."],
      ["Chasis y dirección", "Estructura que une todos los sistemas y permite girar."]
    ],
    // Progreso de demostración: Carlos ya terminó el Módulo 1 y empezó el 2; Laura empieza de cero.
    progress: () => {
      const ids = (m, n) => Array.from({ length: n }, (_, i) => "m" + m + "-l" + (i + 1));
      return {
        2: {
          1: { lecciones: ids(1, 10), actividades: ["m1-a1", "m1-a2"], evalAprobada: true, evalFecha: daysAgo(3), desafioAprobado: true, desafioFecha: daysAgo(2), completadoEn: daysAgo(2) },
          2: { lecciones: ids(2, 3), actividades: [], evalAprobada: false, evalFecha: null, desafioAprobado: false, desafioFecha: null, completadoEn: null }
        }
      };
    },
    attempts: () => [
      { id: 1, userId: 2, modulo: 1, fecha: daysAgo(4), preguntas: [], respuestas: {}, correctas: 6, total: 10, porcentaje: 60, umbral: 70, aprobado: false, duracionSeg: 380 },
      { id: 2, userId: 2, modulo: 1, fecha: daysAgo(3), preguntas: [], respuestas: {}, correctas: 8, total: 10, porcentaje: 80, umbral: 70, aprobado: true, duracionSeg: 340 }
    ],
    challengeResults: () => [
      { id: 1, userId: 2, modulo: 1, desafio: "desafio-1", fecha: daysAgo(2), ok: true, errores: 1, pistas: 1, duracionSeg: 410, acciones: 9 }
    ]
  };
})(window.App);
