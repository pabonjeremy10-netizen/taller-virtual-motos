# Simulador de Motos 3D — plataforma de aprendizaje

Plataforma educativa con inicio de sesión por rol (Estudiante / Administrador o docente) que da acceso a un simulador 3D de mecánica de motocicletas.

## Cómo ejecutarlo

1. Descomprime la carpeta `motos3d` completa (no muevas archivos sueltos).
2. Abre `index.html` con doble clic en Chrome o Edge.
3. Necesitas internet la primera vez: el simulador descarga Three.js desde un CDN y las fuentes de Google.

Cuentas de prueba (también hay atajos en la pantalla de acceso):

| Rol | Correo | Contraseña |
|---|---|---|
| Estudiante | estudiante@demo.com | 1234 |
| Administrador | admin@demo.com | admin123 |
| Docente | docente@demo.com | docente123 |

Para reiniciar los datos de prueba, borra los datos del sitio en el navegador.

## Qué hace la plataforma

Curso virtual con **3 módulos progresivos** (básico, intermedio, avanzado). Cada módulo tiene 10 lecciones, 2 actividades, una evaluación de 10 preguntas y un desafío práctico en el simulador 3D.

Para pasar al siguiente módulo el estudiante debe, en orden: completar lecciones y actividades → aprobar la evaluación (70 % o más, configurable) → superar el desafío práctico. Son **dos registros independientes** (evaluación y desafío); el módulo solo se completa con ambos.

- **Estudiante:** tarjetas de módulos con 6 estados (Bloqueado, Disponible, En progreso, Evaluación pendiente, Desafío práctico pendiente, Completado y aprobado), lecciones, actividades, evaluación con navegación y retroalimentación, historial y simulador libre.
- **Docente:** progreso académico por estudiante (detalle de intentos y desafíos, aviso de posibles dificultades), banco de preguntas (solo lectura), reportes, y prueba de los desafíos.
- **Administrador:** todo lo anterior + edición del banco de preguntas y ajuste del porcentaje mínimo.

### Los desafíos
Cada desafío es un archivo de datos en `simulador/desafios/` (qué piezas faltan al empezar, pasos, pistas, mensajes de error). El motor `simulador/desafio-runtime.js` valida **condiciones**, no clics: pieza correcta seleccionada, pieza instalada, orden de montaje, motor que arranca/avanza/se mantiene estable, y que la moto quede completa al final. Las acciones incorrectas se explican, se pueden deshacer y se cuentan como errores.

| Módulo | Desafío | Qué demuestra |
|---|---|---|
| 1 | La moto no arranca (falta la bujía) | Reconocer una pieza y su función |
| 2 | El motor gira pero la moto no avanza (faltan piñón y cadena) | Seguir el recorrido de la fuerza y montar en orden |
| 3 | Se apaga sola y se calienta (regulador + tapa del radiador) | Relacionar síntomas con componentes de dos sistemas y reparar una falla a la vez |

**Crear un desafío nuevo:** copia `d1-bujia.js`, cambia el contenido y añade el `<script>` en `index.html` y `simulador/simulador.html`. No hay que tocar el motor ni el resto del simulador.

## Estructura y responsabilidades

```
motos3d/
├─ index.html                  Solo estructura (vistas: login, estudiante, admin, simulador)
├─ css/                        base, login, dashboard, course (curso), simulador-contenedor
├─ js/
│  ├─ core/                    config (constantes), storage (ÚNICO lugar con localStorage), utils
│  ├─ data/
│  │  ├─ seed.js               Usuarios, guías y progreso de demostración
│  │  └─ course.js             Módulos, lecciones, actividades y banco de preguntas inicial
│  ├─ services/                Reglas de negocio (no tocan el DOM)
│  │  ├─ auth.js               Login, sesión, roles y permisos
│  │  ├─ users.js, activity.js Usuarios y prácticas
│  │  ├─ progress.js           Estados de módulo, desbloqueos y resultados de desafíos
│  │  ├─ exams.js              Banco, armado y calificación de evaluaciones, intentos
│  │  └─ challenges.js         Consulta de definiciones de desafíos
│  ├─ ui/                      gauge.js, components.js (barras, chips de estado)
│  ├─ views/                   student, learn (lecciones/actividades), exam, admin, simulator, login
│  └─ app.js                   Arranque y enrutador
├─ simulador/
│  ├─ simulador.html           Simulador 3D (+ 3 enganches mínimos para los desafíos)
│  ├─ desafio-runtime.js       Motor de desafíos (solo se activa con ?modo=desafio)
│  ├─ desafios/                registro.js + un archivo por desafío
│  ├─ css/simulador.css, desafio.css
│  └─ assets/                  Modelo 3D y sonido (datos, no editar)
└─ pruebas/                    Pruebas automáticas (opcionales): npm install && npm test
```

Flujo: `views` → `services` → `storage`. Para pasar a un servidor real solo se reescriben `storage.js` y los servicios.

## Hoja de ruta

1. ✅ Módulos, progresión y estados.
2. ✅ Evaluaciones: 30 preguntas, calificación, intentos y umbral configurable.
3. ✅ Desafíos con validador de objetivos.
4. ⏳ Backend (MySQL + API REST con Node o PHP): contraseñas con hash, calificación, desbloqueos y resultados de desafíos validados en el servidor.
5. ⏳ Reportes ampliados, gestión de lecciones/actividades desde el panel y guías paso a paso.

## Límites conocidos

- Todo se guarda en el navegador (`localStorage`). Por eso **no es seguro frente a trampas**: un estudiante con conocimientos podría modificar su progreso, y las calificaciones y los resultados de los desafíos se calculan en el navegador. Las reglas ya están separadas en `services/` para moverlas al servidor en la fase 4 (el simulador ya envía el registro de acciones del desafío para poder verificarlo allá). Las contraseñas están en texto plano en `seed.js`.
- Los datos antiguos del navegador siguen funcionando; para ver el curso desde cero borra los datos del sitio.
- Los scripts son clásicos (no módulos ES) para que todo funcione con doble clic. El script principal del simulador sigue dentro de `simulador.html` porque los módulos ES externos los bloquea el navegador al abrir archivos locales; si lo sirves con un servidor local (por ejemplo la extensión Live Server de VS Code) se puede separar también.
