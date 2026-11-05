/* =====================================================================
   course.js — Contenido del curso: módulos, lecciones, actividades y el
   banco de preguntas inicial. Es solo contenido (datos); no tiene lógica.
   En la fase con base de datos estas estructuras pasan a las tablas
   modulos, lecciones, actividades, preguntas y opciones.
   ===================================================================== */
(function (App) {
  "use strict";

  /* ---------- Módulos ---------- */
  const modules = [
    { id: 1, titulo: "Fundamentos", nivel: "Nivel básico", clase: "basico",
      objetivo: "Reconocer los componentes principales de una motocicleta, identificar sus sistemas y comprender sus funciones básicas." },
    { id: 2, titulo: "Sistemas mecánicos", nivel: "Nivel intermedio", clase: "intermedio",
      objetivo: "Comprender cómo funcionan los sistemas mecánicos y eléctricos y cómo se relacionan sus componentes." },
    { id: 3, titulo: "Diagnóstico y análisis", nivel: "Nivel avanzado", clase: "avanzado",
      objetivo: "Integrar lo aprendido para analizar situaciones mecánicas, relacionar síntomas con componentes y proponer un diagnóstico." }
  ];

  /* ---------- Lecciones: { id, titulo, texto:[párrafos], claves:[ideas clave] } ---------- */
  const L = (id, titulo, texto, claves) => ({ id, titulo, texto, claves });
  const lessons = {
    1: [
      L("m1-l1", "Introducción a la mecánica de motocicletas", [
        "La mecánica de motocicletas estudia cómo funcionan las motos, cómo se revisan y cómo se reparan cuando fallan. Una moto no es una sola máquina: es un conjunto de sistemas (motor, transmisión, frenos, suspensión, sistema eléctrico y ruedas) que trabajan juntos, y cuando uno falla suele afectar a los demás.",
        "Un buen mecánico no cambia piezas al azar: primero entiende qué hace cada pieza, observa el síntoma y después interviene."],
        ["Una moto es un conjunto de sistemas que dependen unos de otros.", "Antes de reparar hay que entender qué hace cada pieza.", "La seguridad va primero: motor frío, herramienta adecuada y moto estable."]),
      L("m1-l2", "Reconocimiento general de una motocicleta", [
        "Al mirar una moto de lado se distinguen sus partes principales: el chasis (la estructura), el motor en el centro, la rueda delantera con su horquilla, la rueda trasera con el basculante, el manillar con los mandos, el depósito de combustible y el asiento.",
        "Para hablar con precisión, el lado izquierdo y el derecho se cuentan siempre desde la posición del piloto sentado, no desde quien mira la moto de frente."],
        ["Chasis, motor, ruedas, manillar, depósito y asiento son las partes más visibles.", "Izquierda y derecha se definen desde el piloto sentado."]),
      L("m1-l3", "Identificación de los principales componentes", [
        "Cada sistema tiene componentes característicos. En el motor: pistón, biela, cigüeñal y bujía. En la transmisión: embrague, caja de cambios, piñón, cadena y corona. En los frenos: palanca, bomba, pinza, pastillas y disco. En la suspensión: horquilla, amortiguador y resorte. En el sistema eléctrico: batería, bobina, regulador y arnés de cables.",
        "En el simulador 3D puedes tocar cada pieza para ver su nombre, su función y qué ocurre si falta."],
        ["Saber a qué sistema pertenece cada pieza es el primer paso del diagnóstico.", "Usa el simulador para explorar las piezas una por una."]),
      L("m1-l4", "Función del motor", [
        "El motor transforma la energía química de la gasolina en movimiento. Dentro del cilindro, la mezcla de aire y combustible se quema, empuja al pistón y ese movimiento de sube y baja se convierte en giro gracias a la biela y al cigüeñal.",
        "La Bajaj Pulsar NS200 del simulador tiene un motor monocilíndrico de cuatro tiempos de unos 200 cc, refrigerado por líquido. La cilindrada es el volumen total que recorre el pistón dentro del cilindro."],
        ["Energía química, calor y movimiento.", "Pistón, biela y cigüeñal convierten el sube y baja en giro."]),
      L("m1-l5", "Componentes básicos de la transmisión", [
        "La transmisión lleva la fuerza del motor hasta la rueda trasera. El embrague conecta y desconecta el motor de la caja de cambios; la caja ofrece varias marchas; y la cadena, que va del piñón delantero a la corona trasera, entrega el giro a la rueda.",
        "Piñón, cadena y corona se desgastan juntos, por eso se suelen cambiar como un kit."],
        ["Recorrido de la fuerza: embrague, caja de cambios, piñón, cadena, corona y rueda.", "El kit de arrastre (piñón, cadena y corona) se cambia completo."]),
      L("m1-l6", "Sistema de frenos", [
        "Los frenos de disco detienen la moto por fricción: al apretar la palanca, la bomba envía líquido a presión hasta la pinza, y la pinza aprieta las pastillas contra el disco. Esa fricción convierte el movimiento en calor.",
        "El freno delantero hace la mayor parte del frenado, porque al frenar el peso de la moto se traslada hacia adelante."],
        ["Palanca, bomba, líquido, pinza, pastillas y disco.", "El freno delantero es el más importante."]),
      L("m1-l7", "Suspensión", [
        "La suspensión absorbe las irregularidades del camino para que las ruedas no pierdan contacto con el suelo y el piloto vaya cómodo y seguro. Adelante trabaja la horquilla; atrás, el monoamortiguador con su resorte, montado sobre el basculante.",
        "El resorte absorbe el golpe y el amortiguador controla el rebote para que la moto no siga saltando."],
        ["Resorte: absorbe el golpe. Amortiguador: frena el rebote.", "Una suspensión en mal estado afecta la estabilidad y el frenado."]),
      L("m1-l8", "Sistema eléctrico básico", [
        "La batería almacena la energía que necesitan el motor de arranque, la ECU y las luces con el motor apagado. Cuando el motor gira, el alternador genera corriente y el regulador-rectificador la ajusta a unos 12 V para cargar la batería y alimentar la moto.",
        "Para encender la mezcla, la bobina eleva el voltaje y la bujía produce la chispa. El arnés de cables comunica todos estos componentes."],
        ["Batería, alternador y regulador forman el circuito de carga.", "Bobina y bujía producen la chispa."]),
      L("m1-l9", "Ruedas y neumáticos", [
        "Cada rueda está formada por el rin, el neumático, el buje y la válvula de aire. Los neumáticos son el único contacto de la moto con el suelo, por eso su presión y su desgaste afectan directamente el agarre y la frenada.",
        "Los valores de presión los indica el fabricante; en la NS200 del simulador, por ejemplo, son 25 PSI adelante y 28 PSI atrás con un solo ocupante."],
        ["Revisa la presión con los neumáticos fríos.", "Un neumático desgastado o mal inflado reduce el agarre."]),
      L("m1-l10", "Conceptos fundamentales de mantenimiento", [
        "El mantenimiento preventivo son las revisiones y cambios programados que se hacen antes de que aparezca la falla; el correctivo es la reparación que se hace cuando algo ya falló. El preventivo es más barato y más seguro.",
        "Revisiones básicas: nivel de aceite, presión de neumáticos, lubricación y holgura de la cadena, estado de frenos y luces. El manual del fabricante indica cada cuántos kilómetros se hace cada una."],
        ["Prevenir cuesta menos que corregir.", "El manual del fabricante es la guía de referencia."])
    ],
    2: [
      L("m2-l1", "Funcionamiento del motor de cuatro tiempos", [
        "El ciclo de cuatro tiempos tiene cuatro pasos: admisión (entra la mezcla de aire y combustible), compresión (el pistón sube y comprime la mezcla), explosión o expansión (la chispa de la bujía enciende la mezcla y empuja al pistón hacia abajo) y escape (el pistón sube y expulsa los gases quemados).",
        "Para completar el ciclo el cigüeñal da dos vueltas y solo hay una explosión; por eso el motor aprovecha la inercia para mantener el giro."],
        ["Admisión, compresión, explosión y escape.", "Dos vueltas del cigüeñal por ciclo completo."]),
      L("m2-l2", "Relación entre pistón, biela y cigüeñal", [
        "El pistón sube y baja dentro del cilindro; la biela lo une con el cigüeñal; y el cigüeñal gira. Es un mecanismo que convierte un movimiento de vaivén en un movimiento circular, que es el que se necesita para mover la moto.",
        "Si falta o falla una de estas tres piezas, el motor no puede funcionar: sin pistón no hay compresión, sin biela la fuerza no llega al cigüeñal y sin cigüeñal no hay giro de salida."],
        ["El pistón sube y baja; el cigüeñal gira; la biela los une.", "Las tres piezas son imprescindibles."]),
      L("m2-l3", "Sistema de alimentación", [
        "El sistema de alimentación lleva el combustible al motor en la cantidad correcta. El combustible sale del depósito, pasa por la bomba y llega al inyector (o al carburador en motos más antiguas), donde se mezcla con el aire limpio que entra por el filtro.",
        "La ECU, o computadora del motor, controla cuánto combustible se inyecta según las condiciones de funcionamiento."],
        ["Depósito, bomba, inyector y cilindro.", "El filtro de aire protege al motor de la suciedad."]),
      L("m2-l4", "Admisión y escape", [
        "Las válvulas de admisión dejan entrar la mezcla al cilindro y las de escape dejan salir los gases quemados; ambas se abren y se cierran en el momento justo del ciclo. Los gases recorren el colector y el silenciador, que reduce el ruido y contiene el catalizador.",
        "Si el escape se modifica o falta una parte, cambia la contrapresión: el motor pierde fuerza y la mezcla se desajusta."],
        ["Admisión: entra la mezcla. Escape: salen los gases.", "Un escape incompleto le quita fuerza al motor."]),
      L("m2-l5", "Sistema de transmisión", [
        "La caja de cambios tiene varias relaciones de transmisión (la NS200 del simulador tiene seis marchas). En las marchas cortas, como la primera, la moto tiene más fuerza y menos velocidad; en las marchas largas, como la sexta, tiene más velocidad y menos fuerza.",
        "Además de la caja existe una relación final entre el piñón delantero y la corona trasera: una corona más grande da más fuerza, una más pequeña da más velocidad."],
        ["Marcha corta: más fuerza, menos velocidad.", "Marcha larga: más velocidad, menos fuerza."]),
      L("m2-l6", "Funcionamiento del embrague", [
        "El embrague está formado por discos de fricción y discos de acero apretados por resortes. Con la palanca suelta, los discos se pegan y transmiten la fuerza del motor a la caja; al apretar la palanca, los discos se separan y el motor queda desconectado.",
        "Por eso se aprieta el embrague para cambiar de marcha: sin él se castigan los engranajes de la caja."],
        ["Palanca suelta: el motor mueve la caja. Palanca apretada: se desconectan.", "Cambiar de marcha sin embrague daña la caja."]),
      L("m2-l7", "Sistema de frenado", [
        "En un freno hidráulico, la fuerza de la mano se convierte en presión del líquido de frenos. El líquido no se comprime, así que esa presión llega hasta la pinza y empuja las pastillas contra el disco.",
        "Si entra aire al circuito la palanca se siente esponjosa y frena menos; se corrige purgando el sistema. El ABS evita que la rueda se bloquee en frenadas fuertes."],
        ["El líquido transmite la fuerza de la palanca a la pinza.", "El aire en el circuito vuelve esponjosa la palanca."]),
      L("m2-l8", "Sistema eléctrico y encendido", [
        "El circuito de encendido sigue un orden: la batería entrega energía a la ECU, la ECU decide el momento de la chispa, la bobina eleva el voltaje y la bujía produce la chispa dentro del cilindro. El motor de arranque hace girar el cigüeñal para iniciar el funcionamiento.",
        "Si falla cualquier eslabón de esta cadena, la moto no arranca."],
        ["Batería, ECU, bobina y bujía, en ese orden.", "Un solo eslabón roto impide el arranque."]),
      L("m2-l9", "Sistema de refrigeración", [
        "El motor produce mucho calor. El líquido refrigerante circula por el motor, absorbe calor y pasa por el radiador, donde el aire lo enfría; un ventilador ayuda cuando la moto va despacio. En la NS200 del simulador el ventilador arranca a 95 °C y se detiene a 90 °C.",
        "La tapa del radiador mantiene la presión del sistema y el vaso de expansión guarda el exceso de líquido. Nunca se abre la tapa con el motor caliente: hay presión y puede salir líquido hirviendo."],
        ["Refrigerante, radiador, ventilador, tapa y vaso de expansión.", "Nunca abras el radiador con el motor caliente."]),
      L("m2-l10", "Identificación de problemas mecánicos comunes", [
        "Muchos síntomas tienen causas típicas. No arranca: batería, bujía, combustible o circuito de encendido. El motor gira pero la moto no avanza: cadena, piñón o embrague. Frena poco: líquido, pastillas o aire en el circuito. Se calienta: nivel de refrigerante, tapa o radiador.",
        "Relacionar el síntoma con el sistema es el primer paso para encontrar la pieza responsable."],
        ["Síntoma, sistema y pieza: ese es el camino.", "Empieza por las causas más simples y probables."])
    ],
    3: [
      L("m3-l1", "Relación entre los diferentes sistemas", [
        "Los sistemas de la moto no trabajan aislados. El sistema eléctrico alimenta la inyección y el encendido; la refrigeración protege al motor; la transmisión depende de que el motor entregue fuerza. Por eso un síntoma en un sistema puede tener su causa en otro.",
        "Pensar en relaciones evita el error de cambiar una pieza que solo mostraba el síntoma."],
        ["Un síntoma puede venir de otro sistema.", "Piensa siempre en qué depende de qué."]),
      L("m3-l2", "Funcionamiento integrado del motor", [
        "Para funcionar, el motor necesita a la vez: aire, combustible, chispa, compresión, lubricación y refrigeración. Si falta cualquiera de estos elementos, el motor no arranca, pierde fuerza o se daña.",
        "Por eso, ante una falla, conviene recorrer esta lista mentalmente y descartar una condición a la vez."],
        ["Aire, combustible, chispa y compresión producen la combustión.", "Lubricación y refrigeración lo mantienen vivo."]),
      L("m3-l3", "Análisis de situaciones mecánicas", [
        "Analizar una situación es reunir información antes de actuar: qué dice el cliente, cuándo aparece la falla (en frío, en caliente, al acelerar), qué se escucha, qué se ve y qué se siente. Cada dato descarta posibles causas.",
        "Escribir los síntomas ayuda a no olvidarlos y a comparar antes y después de la reparación."],
        ["Observa, pregunta y prueba antes de desmontar.", "Cada dato descarta causas posibles."]),
      L("m3-l4", "Identificación de posibles causas de fallas", [
        "Con los síntomas se arma una lista de hipótesis ordenadas de la más simple y probable a la más compleja. Por ejemplo, si la moto no arranca, se revisa primero el combustible y la batería, y solo después los componentes internos del motor.",
        "Una hipótesis se confirma o se descarta con una prueba concreta, no con una suposición."],
        ["Ordena las hipótesis de lo simple a lo complejo.", "Confirma cada hipótesis con una prueba."]),
      L("m3-l5", "Relación entre síntomas y componentes", [
        "Algunos ejemplos: el motor se apaga solo y las luces pierden fuerza, que apunta a la carga de la batería (regulador o alternador); la temperatura sube sin control, que apunta a la refrigeración (nivel, tapa o radiador); el motor sube de revoluciones pero la moto no avanza, que apunta a la transmisión (cadena, piñón o embrague).",
        "Estas relaciones se aprenden entendiendo qué hace cada pieza, no memorizando listas."],
        ["Se apaga y pierde luz: sistema de carga.", "Se calienta: refrigeración. Gira pero no avanza: transmisión."]),
      L("m3-l6", "Comprensión de problemas del sistema eléctrico", [
        "Las fallas eléctricas más comunes son: batería descargada o con bornes flojos, regulador defectuoso que no carga la batería, bobina o bujía que no producen chispa y cables o conectores en mal estado. En una falla de carga, el motor funciona mientras la batería tenga energía y luego se apaga.",
        "Un problema eléctrico casi nunca se arregla cambiando piezas al azar: se sigue el recorrido de la corriente."],
        ["Una batería que se agota con el motor encendido apunta al regulador o al alternador.", "Sigue el recorrido de la corriente."]),
      L("m3-l7", "Análisis de problemas de transmisión", [
        "Una cadena floja, seca o desgastada produce tirones y ruido; un embrague que patina hace que el motor suba de revoluciones sin que la moto acelere; una pieza faltante en el recorrido de la fuerza hace que el motor gire sin mover la rueda.",
        "Para diagnosticar se sigue el recorrido de la fuerza, del motor a la rueda, y se busca dónde se interrumpe."],
        ["Busca dónde se interrumpe el recorrido de la fuerza.", "Cadena, piñón y corona se revisan como conjunto."]),
      L("m3-l8", "Interpretación de situaciones mecánicas complejas", [
        "A veces hay dos o más fallas a la vez, y los síntomas se mezclan. La estrategia es corregir una falla a la vez y verificar el resultado antes de pasar a la siguiente; así se sabe qué arregló cada intervención.",
        "Si después de una reparación el síntoma sigue, la hipótesis era incorrecta o había otra causa: se vuelve a analizar."],
        ["Corrige una falla a la vez y verifica.", "Si el síntoma sigue, vuelve a analizar."]),
      L("m3-l9", "Identificación de componentes afectados", [
        "Una falla puede dañar otras piezas: una cadena floja desgasta el piñón y la corona, un motor que se sobrecalienta puede deformar la culata, una batería descargada a fondo se arruina. Identificar los componentes afectados evita que la falla vuelva a aparecer.",
        "Al reparar, conviene revisar también las piezas relacionadas con la causa."],
        ["Una falla puede arrastrar a otras piezas.", "Revisa las piezas relacionadas con la causa."]),
      L("m3-l10", "Fundamentos del diagnóstico mecánico", [
        "El diagnóstico sigue un método: verificar el síntoma, hacer una inspección visual, formular hipótesis, probar o reparar la causa más probable y verificar que la falla desapareció. Cada paso se apoya en el anterior.",
        "Este método es el que vas a aplicar en el desafío final del simulador."],
        ["Síntoma, inspección, hipótesis, prueba y verificación.", "Verificar al final es parte de la reparación."])
    ]
  };

  /* ---------- Actividades de aprendizaje ----------
     tipo "relacionar": cada ítem { t: término, r: respuesta correcta }
     tipo "ordenar":    pasos[] en el orden correcto */
  const activities = {
    1: [
      { id: "m1-a1", titulo: "Relaciona cada sistema con su función", tipo: "relacionar",
        instrucciones: "Elige la función que corresponde a cada sistema de la motocicleta.",
        items: [
          { t: "Motor", r: "Convierte la energía del combustible en movimiento" },
          { t: "Frenos", r: "Detienen la moto por fricción" },
          { t: "Suspensión", r: "Absorbe las irregularidades del camino" },
          { t: "Transmisión", r: "Lleva la fuerza del motor a la rueda trasera" },
          { t: "Sistema eléctrico", r: "Genera la chispa y alimenta las luces" },
          { t: "Ruedas y neumáticos", r: "Mantienen el contacto con el suelo" }] },
      { id: "m1-a2", titulo: "¿A qué sistema pertenece cada pieza?", tipo: "relacionar",
        instrucciones: "Relaciona cada componente con el sistema al que pertenece.",
        items: [
          { t: "Pistón", r: "Motor" }, { t: "Disco de freno", r: "Frenos" }, { t: "Cadena", r: "Transmisión" },
          { t: "Batería", r: "Sistema eléctrico" }, { t: "Amortiguador", r: "Suspensión" }, { t: "Rin", r: "Ruedas" }] }
    ],
    2: [
      { id: "m2-a1", titulo: "Ordena los cuatro tiempos del motor", tipo: "ordenar",
        instrucciones: "Escribe el número de orden (1 a 4) de cada tiempo, empezando por el primero del ciclo.",
        pasos: ["Admisión: entra la mezcla de aire y combustible", "Compresión: el pistón sube y comprime la mezcla", "Explosión: la chispa enciende la mezcla y empuja al pistón", "Escape: salen los gases quemados"] },
      { id: "m2-a2", titulo: "Del síntoma al sistema", tipo: "relacionar",
        instrucciones: "Elige el sistema que revisarías primero para cada síntoma.",
        items: [
          { t: "No arranca: no hay chispa", r: "Sistema de encendido" },
          { t: "El motor sube de revoluciones, pero la moto no avanza", r: "Transmisión y embrague" },
          { t: "La palanca de freno se siente esponjosa", r: "Frenos hidráulicos" },
          { t: "La temperatura del motor sube sin control", r: "Refrigeración" }] }
    ],
    3: [
      { id: "m3-a1", titulo: "Del síntoma al componente probable", tipo: "relacionar",
        instrucciones: "Elige el componente que sospecharías primero para cada síntoma.",
        items: [
          { t: "Se apaga sola a los pocos segundos y las luces pierden fuerza", r: "Regulador-rectificador o batería" },
          { t: "La temperatura sube y el motor se apaga", r: "Tapa o nivel del radiador" },
          { t: "Tirones y ruido metálico al acelerar", r: "Cadena, piñón y corona" },
          { t: "El motor sube de rpm pero la moto no acelera", r: "Discos de fricción del embrague" }] },
      { id: "m3-a2", titulo: "Ordena el método de diagnóstico", tipo: "ordenar",
        instrucciones: "Escribe el número de orden (1 a 5) de cada paso del diagnóstico.",
        pasos: ["Verificar y registrar el síntoma", "Hacer una inspección visual", "Formular hipótesis sobre la causa", "Probar o reparar la causa más probable", "Verificar que la falla desapareció"] }
    ]
  };

  /* ---------- Banco de preguntas inicial ----------
     q(módulo, nº, tipo, enunciado, [correcta, mala1, mala2, mala3…], explicación)
     La primera opción es la correcta (en verdadero/falso, la primera indica la respuesta); el orden se mezcla al presentar la evaluación. */
  const q = (mod, n, tipo, texto, opts, explicacion) => {
    const vf = tipo === "vf";   // verdadero/falso: siempre en el orden Verdadero, Falso
    const opciones = vf ? [{ id: "o0", texto: "Verdadero" }, { id: "o1", texto: "Falso" }] : opts.map((t, i) => ({ id: "o" + i, texto: t }));
    return { id: "m" + mod + "-q" + n, modulo: mod, tipo, texto, explicacion, opciones, correcta: vf && opts[0] === "Falso" ? "o1" : "o0" };
  };
  const VF = ["Verdadero", "Falso"];
  const questions = [
    q(1, 1, "opcion", "¿Cuál es la función principal del motor de una motocicleta?", ["Convertir la energía del combustible en movimiento", "Absorber los golpes del camino", "Almacenar la energía eléctrica", "Detener la moto por fricción"], "El motor transforma la energía química de la gasolina en movimiento mediante la combustión dentro del cilindro."),
    q(1, 2, "opcion", "¿Cuál de estas piezas pertenece al sistema de transmisión?", ["Cadena", "Disco de freno", "Bujía", "Amortiguador"], "La cadena lleva el giro del piñón delantero a la corona de la rueda trasera."),
    q(1, 3, "vf", "Verdadero o falso: el freno de disco frena la moto por fricción entre las pastillas y el disco.", VF, "Las pastillas se aprietan contra el disco y esa fricción convierte el movimiento en calor."),
    q(1, 4, "opcion", "¿Qué componente absorbe los golpes del terreno en la parte trasera de la moto?", ["El monoamortiguador con su resorte", "El disco de freno", "La cadena", "El regulador"], "El resorte absorbe el golpe y el amortiguador controla el rebote."),
    q(1, 5, "opcion", "¿Qué pieza produce la chispa que enciende la mezcla de aire y combustible?", ["La bujía", "El filtro de aire", "El radiador", "La corona"], "La bobina eleva el voltaje y la bujía produce la chispa dentro del cilindro."),
    q(1, 6, "vf", "Verdadero o falso: la presión de los neumáticos no influye en la seguridad al manejar.", ["Falso", "Verdadero"], "La presión y el desgaste afectan directamente el agarre y la distancia de frenado."),
    q(1, 7, "opcion", "¿Qué componentes se encargan de cargar la batería mientras el motor funciona?", ["El alternador junto con el regulador-rectificador", "La bobina y la bujía", "El motor de arranque", "El faro y el piloto"], "El alternador genera la corriente y el regulador-rectificador la ajusta a unos 12 V para cargar la batería."),
    q(1, 8, "situacion", "Un estudiante nota que la palanca del freno delantero queda muy blanda. ¿A qué sistema pertenece el problema?", ["Frenos", "Suspensión", "Sistema eléctrico", "Transmisión"], "La palanca, la bomba, las mangueras y la pinza forman el sistema de frenos."),
    q(1, 9, "opcion", "¿Qué es el mantenimiento preventivo?", ["Revisiones y cambios programados antes de que aparezca la falla", "La reparación que se hace después de una avería", "Cambiar todas las piezas cada mes", "Lavar la moto"], "El preventivo evita fallas y sale más barato y más seguro que el correctivo."),
    q(1, 10, "opcion", "¿Cómo se llama el aro metálico que sostiene el neumático?", ["Rin", "Buje", "Disco", "Eje"], "El rin sostiene el neumático y transmite al suelo la fuerza de dirección y frenado."),

    q(2, 1, "opcion", "¿Cuál es el orden correcto de los cuatro tiempos del motor?", ["Admisión, compresión, explosión, escape", "Compresión, admisión, escape, explosión", "Admisión, explosión, compresión, escape", "Escape, admisión, explosión, compresión"], "Entra la mezcla, se comprime, se enciende y empuja al pistón, y finalmente salen los gases."),
    q(2, 2, "opcion", "¿Cuántas vueltas da el cigüeñal en un ciclo completo de cuatro tiempos?", ["Dos", "Una", "Cuatro", "Media"], "Cada tiempo corresponde a una carrera del pistón; cuatro carreras son dos vueltas del cigüeñal."),
    q(2, 3, "opcion", "¿Cuál es la función de la biela?", ["Unir el pistón con el cigüeñal y convertir el vaivén en giro", "Encender la mezcla", "Enfriar el cilindro", "Regular el combustible"], "Sin la biela la fuerza de la explosión no llega al cigüeñal."),
    q(2, 4, "vf", "Verdadero o falso: al apretar la palanca del embrague, los discos de fricción y de acero se separan.", VF, "Al separarse los discos el motor queda desconectado de la caja de cambios."),
    q(2, 5, "opcion", "¿En qué orden llega la energía hasta producir la chispa?", ["Batería, ECU, bobina, bujía", "Bujía, bobina, ECU, batería", "ECU, batería, bujía, bobina", "Bobina, batería, bujía, ECU"], "La batería alimenta a la ECU, que decide el momento; la bobina eleva el voltaje y la bujía hace la chispa."),
    q(2, 6, "opcion", "¿Qué ofrece una marcha corta, como la primera?", ["Más fuerza y menos velocidad", "Más velocidad y menos fuerza", "Más velocidad y más fuerza", "Menos consumo siempre"], "Las marchas cortas multiplican la fuerza a costa de la velocidad."),
    q(2, 7, "situacion", "El motor gira normal, pero al soltar el embrague y acelerar la moto no avanza. ¿Qué sistema revisarías primero?", ["Transmisión (embrague y cadena)", "Refrigeración", "Sistema de luces", "Suspensión delantera"], "Si el motor funciona pero la fuerza no llega a la rueda, la interrupción está en la transmisión."),
    q(2, 8, "opcion", "En un freno hidráulico, ¿qué transmite la fuerza de la palanca hasta la pinza?", ["El líquido de frenos a presión", "Un cable de acero", "El aire", "La cadena"], "El líquido no se comprime, por eso la presión llega completa a la pinza."),
    q(2, 9, "opcion", "¿Por qué no se debe abrir la tapa del radiador con el motor caliente?", ["El sistema está presurizado y puede salir líquido hirviendo", "Porque se daña la tapa", "Porque el motor se apaga", "No hay ningún motivo"], "La presión y el vapor pueden causar quemaduras graves."),
    q(2, 10, "opcion", "¿Qué válvulas permiten que la mezcla entre al cilindro?", ["Las válvulas de admisión", "Las válvulas de escape", "Las válvulas del neumático", "Las válvulas del radiador"], "Las de admisión dejan entrar la mezcla; las de escape dejan salir los gases quemados."),

    q(3, 1, "situacion", "Una moto arranca, pero se apaga sola a los pocos segundos y las luces pierden fuerza. ¿Cuál es la causa más probable?", ["La batería no se recarga (regulador o alternador)", "La cadena está floja", "Las pastillas están gastadas", "El neumático tiene poca presión"], "Si la batería se agota con el motor funcionando, el circuito de carga no está cargando."),
    q(3, 2, "situacion", "El motor de arranque gira bien, pero no hay chispa en el cilindro. ¿Qué componentes revisarías?", ["Bujía, bobina y ECU", "Radiador y ventilador", "Pinza y disco de freno", "Horquilla y amortiguador"], "La chispa depende del circuito de encendido: ECU, bobina y bujía."),
    q(3, 3, "situacion", "La temperatura del motor sube hasta que se apaga. ¿Qué revisarías primero?", ["Nivel de refrigerante, tapa y radiador", "La cadena", "El filtro de aire", "Los espejos"], "Un sobrecalentamiento apunta al sistema de refrigeración."),
    q(3, 4, "vf", "Verdadero o falso: con dos fallas a la vez conviene corregir una, verificar el resultado y luego pasar a la siguiente.", VF, "Así se sabe qué arregló cada intervención y se evita mezclar causas."),
    q(3, 5, "opcion", "Una cadena muy floja y seca, si no se corrige, termina provocando:", ["Desgaste acelerado del piñón y la corona", "Que se llene el depósito", "Mayor presión en los neumáticos", "Que la batería cargue mejor"], "Piñón, cadena y corona se desgastan juntos; una cadena en mal estado arrastra a los otros dos."),
    q(3, 6, "situacion", "Una moto no arranca, no se oye el motor de arranque y las luces no encienden. ¿Qué revisas primero?", ["La batería y sus bornes", "El silenciador", "El rin trasero", "La horquilla"], "Sin energía en la batería no funcionan ni el arranque ni las luces."),
    q(3, 7, "opcion", "¿Cuál es el orden correcto del método de diagnóstico?", ["Verificar el síntoma, inspeccionar, formular hipótesis, probar o reparar, verificar el resultado", "Cambiar piezas, probar, preguntar al cliente, inspeccionar", "Reparar, inspeccionar, verificar el síntoma, formular hipótesis", "Formular hipótesis y reparar sin probar"], "Cada paso se apoya en el anterior; verificar al final confirma que la falla desapareció."),
    q(3, 8, "situacion", "La palanca del freno delantero se siente esponjosa y frena menos de lo normal. ¿Cuál es la causa más probable?", ["Aire en el circuito hidráulico", "Exceso de aire en el neumático", "Una bujía desgastada", "Cadena sin lubricar"], "El aire se comprime, a diferencia del líquido, y la presión no llega completa a la pinza."),
    q(3, 9, "situacion", "El motor sube de revoluciones pero la moto casi no acelera. ¿Qué componente sospechas?", ["Discos de fricción del embrague gastados", "Una direccional", "El espejo retrovisor", "La tapa del depósito"], "Si el embrague patina, el motor gira sin transmitir toda la fuerza a la caja."),
    q(3, 10, "situacion", "Un técnico cambió una pieza y la moto sigue con el mismo síntoma. ¿Qué debe hacer?", ["Volver a analizar: la pieza cambiada quizá no era la causa", "Cambiar otra pieza al azar", "Entregar la moto igual", "Cambiar todas las piezas del sistema"], "Si el síntoma sigue, la hipótesis era incorrecta o hay otra causa; se vuelve a analizar.")
  ];

  App.Course = {
    modules: () => modules,
    module: (id) => modules.find((m) => m.id === id) || null,
    lessonsOf: (id) => lessons[id] || [],
    activitiesOf: (id) => activities[id] || [],
    seedQuestions: () => JSON.parse(JSON.stringify(questions))
  };
})(window.App);
