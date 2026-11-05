/* Desafío 1 · Básico — Reconocer una pieza y reinstalarla.
   Aprendizaje: identificar la bujía y entender su función en el encendido. */
DESAFIOS.registrar({
  id: "desafio-1", modulo: 1, nivel: "Básico",
  titulo: "La moto no arranca",
  situacion: "Una Pulsar NS200 llegó al taller: el dueño dice que no enciende. En la última revisión, una pieza del sistema de encendido quedó fuera de su lugar y nadie la volvió a instalar.",
  objetivo: "Confirmar la falla, identificar la pieza que falta, instalarla y comprobar que el motor arranca.",
  condiciones: ["La moto está en el taller, con el motor apagado.", "Hay una pieza fuera de la moto, en la bandeja de piezas.", "No necesitas conocimientos avanzados: usa lo que aprendiste en las lecciones."],
  inicial: { faltantes: ["Motor_Bujia"] },
  pasos: [
    { id: "p1", tipo: "intento-arranque",
      texto: "Comprueba la falla: pulsa «Encender motor» y observa qué ocurre.",
      ok: "Falla confirmada: el motor no arranca. Ahora hay que averiguar por qué.",
      pistas: ["El botón «Encender motor» está en el panel «Simulador de funcionamiento», abajo."] },
    { id: "p2", tipo: "seleccionar", pieza: "Motor_Bujia",
      texto: "Identifica la pieza que falta en el encendido. Está en la bandeja de piezas: tócala (o elígela en la lista de piezas) para ver qué hace.",
      ok: "Correcto: es la bujía. Produce la chispa que enciende la mezcla al final de la compresión.",
      mal: "Esa pieza no es la que impide que el motor arranque. Busca la que produce la chispa.",
      pistas: ["La bandeja amarilla está frente a la moto: ahí quedan las piezas retiradas.", "Piensa qué pieza produce la chispa que enciende la mezcla de aire y combustible.", "Es la bujía. En «Sistemas» abre «Motor» y búscala en la lista."] },
    { id: "p3", tipo: "instalar", pieza: "Motor_Bujia",
      texto: "Instala la bujía: con la pieza seleccionada pulsa «Instalar pieza seleccionada» (o arrástrala de vuelta a la moto).",
      ok: "Bujía instalada. Ya puede saltar la chispa en el cilindro.",
      ordenMsg: "Muy bien, pero primero identifica la pieza (paso 2): así sabrás por qué es la responsable.",
      pistas: ["Primero selecciona la pieza; después pulsa «Instalar pieza seleccionada»."] },
    { id: "p4", tipo: "estado", cond: "arranca",
      texto: "Verifica la reparación: enciende el motor y comprueba que arranca.",
      ok: "¡El motor arrancó! La falla era la bujía que no estaba instalada.",
      pistas: ["Pulsa «Encender motor» y espera un par de segundos."] }
  ],
  final: { mensaje: "Reconociste la bujía, entendiste su función en el encendido y comprobaste la reparación." }
});
