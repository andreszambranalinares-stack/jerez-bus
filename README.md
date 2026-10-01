# Jerez Bus

Creado ante la carencia de una buena app de autobuses por parte del Ayuntamiento de Jerez.

[Abrir la aplicación](https://jerez-bus-facil.andreszambranalinare.chatgpt.site)

Aplicación independiente para consultar líneas y paradas, buscar viajes por ubicación, elegir fecha y hora, guardar rutas favoritas y consultar el último tramo a pie.

## Código de la aplicación

El archivo **jerez-bus-source.zip** contiene el código completo de la versión publicada el 1 de octubre de 2026, incluidos los iconos y los datos de consulta. Se publica como archivo ZIP porque la integración de GitHub ha rechazado la escritura del árbol de archivos.

Descarga el ZIP y extráelo en una carpeta antes de instalar las dependencias. No incluye dependencias instaladas, credenciales, archivos de compilación ni la configuración vinculada al alojamiento actual.

## Ejecutar

Node.js 22.13 o superior y pnpm (versión indicada en package.json).

```sh
pnpm install
pnpm dev
```

```sh
pnpm exec tsc --noEmit
pnpm build
```

React, TypeScript, Vinext, Vite y Tailwind CSS. Las rutas del servidor de app/api consultan los servicios de horarios y direcciones. Para otro despliegue hay que configurar un alojamiento compatible con el servidor.

## Datos y límites

Horarios publicados por COMUJESA y el Consorcio de Transportes Bahía de Cádiz. Son horarios programados, no llegadas GPS en directo. Cuando falla el servicio oficial, se identifica la consulta guardada. Los minutos a pie son aproximados; no se muestra una duración total en bus sin datos fiables ni se garantizan transbordos.

Las búsquedas de direcciones usan Photon y OpenStreetMap. Los favoritos se guardan en el navegador del dispositivo.

## iPhone

Abre la app en Safari, pulsa Compartir y Añadir a la pantalla de inicio. No se garantiza funcionamiento sin conexión.
