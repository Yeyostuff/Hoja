# Hoja — Lector EPUB 📖

Aplicación web de lectura EPUB, hecha con **React + Vite + epub.js**, instalable como PWA en Android, iPhone y computadoras. Diseñada para publicar directamente en **Vercel**.

## Funciones

- Importar varios archivos `.epub` sin enviarlos a ningún servidor.
- Biblioteca local con títulos, autores, portadas tipográficas y porcentaje leído.
- Lectura por páginas y lectura con desplazamiento vertical.
- Tamaño de letra, tipografía, interlineado y márgenes configurables.
- Temas papel, sepia y noche.
- Índice de capítulos, marcadores y guardado automático de posición.
- Controles táctiles (deslizar), teclado (flechas) y botones.
- PWA con interfaz y recursos almacenados para trabajar sin conexión luego de la primera carga.

## Requisitos

Node.js 20.19+ o 22.12+ y npm.

## Desarrollo local

```bash
npm install
npm run dev
```

Visita la URL local que muestra Vite, habitualmente `http://localhost:5173`.

Para compilar:

```bash
npm run build
npm run preview
```

La carpeta `dist/` es la versión publicable.

## Publicación en GitHub y Vercel

1. Crea un repositorio de GitHub.
2. Sube **el contenido de esta carpeta** (incluidos `package.json`, `vite.config.js`, `src`, `public` e `index.html`). No subas `node_modules` ni `dist`.
3. En Vercel, elige **Add New → Project → Import Git Repository**.
4. Framework preset: **Vite** (normalmente detectado automáticamente).
5. Build command: `npm run build`. Output directory: `dist`. Install command: `npm install`.
6. Publica. No hacen falta variables de entorno ni una base de datos externa.

## Instalación como aplicación

- **Android (Chrome):** abre la URL pública → menú → *Instalar aplicación* / *Agregar a pantalla principal*.
- **iPhone (Safari):** abre la URL pública → *Compartir* → *Agregar a pantalla de inicio*.

## Datos y privacidad

Los archivos EPUB se guardan en **IndexedDB** dentro del navegador. El progreso y los marcadores también se guardan ahí; los ajustes visuales se almacenan en `localStorage`. **No hay sincronización** entre dispositivos: importar un libro en el teléfono no lo importa automáticamente en una computadora. No hay cuentas de usuario ni subida de archivos.

**Advertencia:** borrar los datos del sitio, usar navegación privada, desinstalar la PWA o determinadas políticas de limpieza del sistema puede eliminar libros y progreso. Conserva copias de los EPUB originales. El almacenamiento disponible depende del navegador/dispositivo.

Solo se admiten EPUB **sin DRM**. La representación depende del formato interno de cada libro. Algunas tipografías y estilos embebidos pueden diferir; los EPUB de maquetación fija pueden tener limitaciones. Las transiciones usan un sombreado/deslizamiento visual: **no hay giro físico 3D de la hoja**.

La interfaz se almacena para trabajar sin conexión tras una primera visita y activación de la PWA. Los EPUB importados previamente estarán disponibles sin internet si su almacenamiento local no ha sido borrado. Google Fonts pueden necesitar conexión en la primera visita; la app tiene fuentes locales alternativas.

## Estructura

```text
hoja-lector/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── db.js
    └── styles.css
```

## Mejoras posibles

Sincronización entre dispositivos, imágenes reales de portada, resaltado/notas, búsquedas dentro del texto, exportación de respaldos, más idiomas y animación 3D experimental.
