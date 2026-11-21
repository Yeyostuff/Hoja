# Hoja — Lector EPUB 📖

Aplicación web de lectura EPUB, hecha con **React + Vite + epub.js**, instalable como PWA en Android, iPhone y computadoras. Diseñada para publicar directamente en **Vercel**.

## Funciones ""

- Importar varios archivos `.epub` sin enviarlos a ningún servidor.
- Biblioteca local con títulos, autores, portadas tipográficas y porcentaje leído.
- Lectura por páginas y lectura con desplazamiento vertical.
- Tamaño de letra, tipografía, interlineado y márgenes configurables.
- Temas papel, sepia y noche.
- Índice de capítulos, marcadores y guardado automático de posición.
- Controles táctiles (deslizar), teclado (flechas) y botones.
- PWA con interfaz y recursos almacenados para trabajar sin conexión luego de la primera carga.
- **Nuevo: lectura en voz alta (Play / Pausa / Detener)** mediante las voces del dispositivo; velocidad y voz configurables, avance al siguiente capítulo.

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

## Lectura en voz alta (nuevo)

Dentro de un libro pulsa el botón **▶ Play** en la barra inferior. También puedes tocar el icono de altavoz en la barra superior para elegir una voz y ajustar la velocidad de 0,65× a 1,75×. La aplicación divide los párrafos en fragmentos cortos para la narración y continúa al siguiente capítulo hasta terminar el libro. Play reanuda tras pausar; Detener cancela la narración. Al cambiar de capítulo manualmente o regresar a la biblioteca, la narración se detiene.

**iPhone/iOS:** utiliza `window.speechSynthesis` (Web Speech API). Safari/iOS puede pausar, interrumpir o impedir la reproducción al bloquear la pantalla, ir a otra aplicación o apagar la pantalla. No garantiza narración en segundo plano como una app nativa. Además, las voces disponibles y su calidad dependen de las voces instaladas en cada dispositivo. Para narración confiable con pantalla bloqueada se necesitaría generar archivos de audio (TTS servidor o nativo) y reproducirlos como medios, o crear una app nativa.

**Privacidad:** se utiliza la síntesis de voz que proporciona el sistema/navegador, sin subir los EPUB a un servidor desde esta aplicación. El proveedor de voz del dispositivo puede tener sus propios mecanismos de procesamiento.

## Actualización de un proyecto ya publicado

Sube los archivos de este ZIP **al mismo repositorio y rama** vinculados con Vercel, reemplazando los archivos anteriores. Conserva el mismo dominio para mantener acceso a los EPUB guardados en el navegador. Vercel desplegará la nueva versión automáticamente. Si la PWA continúa mostrando la versión antigua, cierra y vuelve a abrir la app después de actualizar la página.
