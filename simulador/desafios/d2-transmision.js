/* Desafío 2 · Intermedio — Problema dentro de un sistema (transmisión).
   Aprendizaje: seguir el recorrido de la fuerza y respetar el orden de montaje. */
DESAFIOS.registrar({
  id: "desafio-2", modulo: 2, nivel: "Intermedio",
  titulo: "El motor gira, pero la moto no avanza",
  situacion: "Después de un servicio, una Pulsar NS200 enciende sin problema, pero al soltar el embrague y acelerar el motor sube de revoluciones y la moto no se mueve. Algo en la transmisión quedó mal montado.",
  objetivo: "Diagnosticar por qué la fuerza del motor no llega a la rueda, identificar los componentes de la transmisión involucrados y reinstalarlos en el orden correcto.",
  condiciones: ["La moto está en el taller, con el motor apagado.", "Faltan piezas de la transmisión en la bandeja.", "Debes comprobar el síntoma antes de intervenir."],
  inicial: { faltantes: ["Cadena_Pinon_Delantero"] },   // al quitar el piñón, el simulador retira también la cadena
  pasos: [
    { id: "p1", tipo: "estado", cond: "arranca",
      texto: "Enciende el motor y comprueba que arranca con normalidad.",
      ok: "El motor arranca: el encendido, la alimentación y la batería están bien.",
      pistas: ["Pulsa «Encender motor» en el panel inferior."] },
    { id: "p2", tipo: "estado", cond: "no-avanza",
      texto: "Pon la primera marcha, suelta el embrague y acelera. Observa si la moto avanza.",
      ok: "Confirmado: el motor gira, pero la fuerza no llega a la rueda. La falla está entre el motor y la rueda: la transmisión.",
      pistas: ["En el panel elige la marcha 1 y sube el acelerador (o mantén la tecla W). No aprietes el embrague.", "Mantén el motor por encima de 2500 rpm unos segundos."] },
    { id: "p3", tipo: "seleccionar", pieza: "Cadena_Pinon_Delantero",
      texto: "Identifica la pieza que recibe el giro a la salida de la caja de cambios y arrastra la cadena. Selecciónala en la bandeja.",
      ok: "Correcto: el piñón delantero. Es el primer eslabón después de la caja de cambios.",
      mal: "Esa pieza no es la primera del recorrido. Recuerda: embrague → caja → piñón → cadena → corona → rueda.",
      pistas: ["Sigue el recorrido de la fuerza: ¿qué pieza va justo después de la caja de cambios?", "Es la rueda dentada pequeña que va junto al motor: el piñón delantero. Mira en «Sistemas» → «Transmisión»."] },
    { id: "p4", tipo: "instalar", pieza: "Cadena_Pinon_Delantero",
      texto: "Instala el piñón delantero. Es la pieza que recibe el giro, así que va primero.",
      ok: "Piñón instalado. Falta la cadena que lo une con la rueda.",
      pistas: ["Con el piñón seleccionado pulsa «Instalar pieza seleccionada»."] },
    { id: "p5", tipo: "instalar", pieza: "Cadena_Transmision",
      texto: "Ahora instala la cadena, que une el piñón delantero con la corona de la rueda trasera.",
      ok: "Cadena instalada: piñón, cadena y corona vuelven a formar el circuito completo.",
      ordenMsg: "Todavía no: antes de montar la cadena hay que instalar el piñón delantero, que es la pieza que la arrastra.",
      pistas: ["Selecciona la cadena en la bandeja y pulsa «Instalar pieza seleccionada»."] },
    { id: "p6", tipo: "estado", cond: "avanza",
      texto: "Comprueba la reparación: con la primera marcha puesta, suelta el embrague y acelera suavemente hasta que la moto avance.",
      ok: "¡La moto avanza! La fuerza vuelve a llegar a la rueda trasera.",
      pistas: ["Enciende el motor si se apagó, elige la marcha 1 y acelera poco a poco."] }
  ],
  final: { mensaje: "Seguiste el recorrido de la fuerza, encontraste los componentes involucrados y los montaste en el orden correcto." }
});
