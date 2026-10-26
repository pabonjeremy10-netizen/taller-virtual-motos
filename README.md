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

## Estructura y responsabilidades

```
motos3d/
├─ index.html                  Solo estructura (4 vistas: login, estudiante, admin, simulador)
├─ css/
│  ├─ base.css                 Colores, reinicio, botones y chips
│  ├─ login.css                Pantalla de acceso
│  ├─ dashboard.css            Menús de estudiante y administrador
│  └─ simulador-contenedor.css Barra y marco que contiene el simulador
├─ js/
│  ├─ core/                    Núcleo sin lógica de negocio
│  │  ├─ config.js             Constantes (ruta del simulador, claves de almacenamiento)
│  │  ├─ storage.js            ÚNICO lugar que usa localStorage/sessionStorage
│  │  └─ utils.js              Helpers (escape de HTML, formato de fecha, correo)
│  ├─ data/seed.js             Datos de demostración y contenido de ejemplo
│  ├─ services/                Reglas de negocio (no tocan el DOM)
│  │  ├─ auth.js               Login, sesión, roles (RBAC) y permisos por vista
│  │  ├─ users.js              Alta, consulta y activar/desactivar estudiantes
│  │  └─ activity.js           Historial de prácticas y datos de reportes
│  ├─ ui/gauge.js              Tacómetro decorativo del login
│  ├─ views/                   Una por pantalla: leen el DOM y llaman a los servicios
│  │  ├─ login.view.js
│  │  ├─ student.view.js
│  │  ├─ admin.view.js
│  │  └─ simulator.view.js     Abre el iframe y registra la práctica (con duración)
│  └─ app.js                   Arranque y enrutador (decide qué vista ver según sesión y rol)
└─ simulador/                  El simulador 3D, independiente de la autenticación
   ├─ simulador.html           Interfaz y lógica del simulador
   ├─ css/simulador.css        Estilos del simulador
   └─ assets/
      ├─ modelo-moto.js        Modelo 3D (GLB comprimido en base64) — datos, no editar
      └─ sonido-arranque.js    Sonido del arranque (MP3 en base64) — datos, no editar
```

Flujo: `views` → `services` → `storage`. Las vistas nunca guardan datos directamente, y los servicios nunca tocan el DOM. Para pasar a un servidor real, solo se reescriben `storage.js` y los servicios.

## Límites conocidos

- Es una simulación del lado del navegador: las contraseñas están en texto plano en `seed.js` y cualquiera puede abrir `simulador/simulador.html` directamente. La protección real requiere un servidor (backend) y contraseñas con hash.
- Los scripts son clásicos (no módulos ES) para que todo funcione con doble clic. El script principal del simulador sigue dentro de `simulador.html` porque los módulos ES externos los bloquea el navegador al abrir archivos locales; si lo sirves con un servidor local (por ejemplo la extensión Live Server de VS Code) se puede separar también.
