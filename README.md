# 🚌 Jerez Bus

**Consulta los autobuses de Jerez sin complicarte.**

Una app independiente para consultar líneas, encontrar paradas cercanas y preparar tus trayectos. Creada ante la carencia de una buena app de autobuses por parte del Ayuntamiento de Jerez, con una idea sencilla: saber dónde coger el bus, a qué hora sale y dónde bajarte.

### [👉 Abrir Jerez Bus](https://jerez-bus-facil.andreszambranalinare.chatgpt.site)

Sin registro. Puedes usarla desde el navegador o añadirla a la pantalla de inicio del móvil.

> **Los horarios son programados, no llegadas en tiempo real por GPS.** La app consulta fuentes oficiales, pero no puede garantizar que un autobús llegue a la hora indicada.

## Qué puedes hacer

| Función | Para qué sirve |
| --- | --- |
| **Líneas y paradas** | Consultar los autobuses que pasan por una parada y sus horarios disponibles. |
| **Cómo llegar** | Buscar origen y destino para ver opciones de viaje, dónde subir y dónde bajar. |
| **Tu ubicación** | Usar la ubicación del dispositivo, con tu permiso, para encontrar paradas cercanas. |
| **Fecha y hora** | Preparar un viaje para otro momento, por ejemplo mañana por la mañana. |
| **Rutas favoritas** | Guardar tus trayectos y abrirlos desde la pantalla de Líneas. |
| **Último tramo a pie** | Ver desde qué parada caminar hasta el destino y abrir el recorrido en Google Maps. |
| **Próxima salida** | Ver cuánto falta para una salida según el horario publicado. |

Los favoritos se guardan en el navegador del dispositivo. No se sincronizan entre móviles ni ordenadores.

## Cómo usarla

1. Abre la app y consulta una línea o busca una parada.
2. Para preparar un trayecto, indica **dónde estás** y **a dónde quieres llegar**. Puedes buscar una dirección o usar tu ubicación.
3. Elige la fecha y la hora si quieres consultar un viaje futuro.
4. Revisa las opciones: parada de subida, línea, salida y parada de bajada.
5. Pulsa **Ver último tramo** para consultar el recorrido a pie hasta tu destino.
6. Guarda el trayecto como favorito para tenerlo a mano la próxima vez.

## Instalar en iPhone con Safari

1. Abre [Jerez Bus](https://jerez-bus-facil.andreszambranalinare.chatgpt.site) en **Safari**.
2. Pulsa **Compartir**.
3. Selecciona **Añadir a la pantalla de inicio**.
4. Confirma con **Añadir**.

Después podrás abrirla desde su icono. Para usar tu ubicación, permite el acceso cuando el dispositivo lo solicite. La consulta de horarios y direcciones necesita conexión; no se garantiza funcionamiento sin internet.

## De dónde salen los datos

- **Autobuses urbanos:** horarios publicados por COMUJESA.
- **Autobuses metropolitanos:** información del Consorcio de Transportes Bahía de Cádiz.
- **Direcciones:** búsquedas con Photon sobre datos de OpenStreetMap.
- **Recorrido a pie:** enlace a Google Maps desde las coordenadas de la parada hasta el destino.

Si el servicio de horarios urbanos no responde y existe una consulta guardada, la app la muestra con un aviso. Una consulta guardada puede estar desactualizada.

### Cómo interpretar los tiempos

- **“Sale en X minutos”** indica el tiempo hasta una salida programada; no mide la posición del autobús.
- **Los minutos a pie son aproximados.**
- No se calcula una duración total del viaje en bus sin datos fiables.
- Las opciones de viaje no garantizan transbordos ni contemplan todas las incidencias, desvíos o retrasos.

Esta aplicación es un proyecto independiente y no representa al Ayuntamiento, a COMUJESA ni al Consorcio. Para un viaje importante, contrasta el horario con el operador.

## Código y desarrollo

El repositorio incluye **`jerez-bus-source.zip`**, con el código de la versión 16 publicada el **1 de octubre de 2026**. El código está distribuido dentro del ZIP; todavía no aparece descomprimido como carpetas en el repositorio.

### Requisitos

- **Node.js 22.13.0 o superior**
- **pnpm 11.25.0**, según `package.json`

### Ejecutar en local

Descarga `jerez-bus-source.zip`, extráelo y abre una terminal en la carpeta que contiene `package.json`:

```sh
pnpm install
pnpm dev
```

Abre la dirección que aparezca en la terminal.

### Comprobar y compilar

```sh
pnpm exec tsc --noEmit
pnpm build
```

### Tecnologías

**React · TypeScript · Vinext · Vite · Tailwind CSS · Cloudflare Workers**

| Carpeta | Contenido |
| --- | --- |
| `app/` | Pantallas y rutas de la aplicación. |
| `app/api/` | Consultas del servidor para horarios y direcciones. |
| `components/` | Componentes de la interfaz. |
| `lib/` | Lógica de trayectos, favoritos, horarios y datos de consulta. |
| `public/` | Iconos y recursos públicos. |

El ZIP no incluye dependencias instaladas, credenciales ni archivos de compilación. Tampoco incluye la configuración que vincula el proyecto con su alojamiento actual. Para desplegarlo en otro servicio, configura un entorno compatible con las rutas del servidor; publicar únicamente archivos estáticos no cubre todas sus funciones.

## Ayuda a mejorar Jerez Bus

¿Una parada aparece mal, una ruta no tiene sentido o encuentras un fallo? Abre una **issue** e indica:

- Línea y parada afectadas.
- Fecha y hora consultadas.
- Qué esperabas y qué apareció.
- Captura, si ayuda, ocultando direcciones personales y tu ubicación exacta.

## Autor

**Andrés Zambrana Linares**

Una herramienta nacida de una necesidad cotidiana: consultar los autobuses de Jerez de forma más cómoda y compartirla con quien la necesite.

