# Distribución y empaquetado

> Cómo generar, usar y elegir cada formato de entrega de la app. Todos los builds
> producen la **misma app**; cambian el empaquetado y el canal de distribución.
> Verificado end-to-end (M8): ver "Checklist de verificación" al final.

## Resumen rápido

| Formato | Comando | Salida | Para quién |
|---------|---------|--------|-----------|
| Desarrollo | `npm run dev` | servidor en `localhost:5174` | desarrollo |
| Web / PWA | `npm run build` | `dist/` (varios archivos) | **usuarios finales online** |
| Archivo único | `npm run build:single` | `dist-single/index.html` (1 archivo) | **usuarios offline / compartir directo** |
| Previsualizar build web | `npm run preview` | sirve `dist/` localmente | QA del build antes de publicar |

---

## 1. Desarrollo — `npm run dev`

- **Qué:** servidor de desarrollo de Vite con recarga en caliente (HMR) en
  `http://localhost:5174`.
- **Cuándo:** mientras se programa.
- **Limitaciones:** no es para distribuir. El **service worker NO se registra en
  dev** (a propósito: cacheaba módulos y servía la app vieja); por eso el
  comportamiento PWA solo se ve en el build web.

## 2. Web / PWA — `npm run build`

- **Qué:** build de producción optimizado en `dist/`: `index.html` + assets
  hasheados (`assets/index-XXedición.js/.css`) + `manifest.webmanifest` + `sw.js`
  + íconos. **Instalable como PWA** (ícono en escritorio/móvil, funciona offline
  tras la primera visita).
- **Cómo publicar:** subir el contenido de `dist/` a cualquier hosting de
  estáticos (Netlify Drop, Vercel, GitHub Pages, un servidor propio). **Debe
  servirse por HTTP/HTTPS** (el service worker no funciona en `file://`).
- **Previsualizar antes de publicar:** `npm run preview` (sirve `dist/` local).
- **Estrategia de cache (importante para deploys):** el `sw.js` usa
  **network-first** para la navegación/HTML y **stale-while-revalidate** para los
  assets. Esto evita que un usuario vea una versión vieja tras un deploy: online
  siempre recibe el `index.html` más reciente, que referencia los assets nuevos
  (hasheados). El cache está **versionado** (`rentab-ovina-v2`) y se limpian los
  anteriores al activarse.
- **Limitaciones:** requiere un hosting y conexión para la primera carga; la
  propagación del service worker actualizado a usuarios con uno viejo instalado
  puede tardar hasta ~24 h (el navegador revalida `sw.js`); `skipWaiting` +
  `clients.claim` lo aceleran.
- **Recomendado para:** **usuarios finales** (es el canal principal: instalable,
  actualizable, offline).

## 3. Archivo único — `npm run build:single`

- **Qué:** un **único** `dist-single/index.html` (~640 KB) con **todo inline**
  (JS + CSS + íconos como data URI). Sin dependencias externas, sin PWA.
- **Cómo usar:** se abre con **doble clic** (protocolo `file://`), funciona
  **100% offline**, sin instalar nada ni necesitar un servidor. Ideal para
  enviarlo por mail / compartir en un pendrive / una demo rápida.
- **Limitaciones:**
  - **No es PWA:** no se instala ni cachea (no aplica en `file://`); por eso este
    build **omite el manifest y el service worker** a propósito.
  - Archivo grande (~640 KB) por llevar todo embebido.
  - Los escenarios guardados viven en el `localStorage` del navegador con el que
    se abre; abrir el archivo en otra máquina/navegador no los trae.
- **Recomendado para:** **compartir directo / offline / demos**, cuando no hay (o
  no se quiere) un hosting.

## 4. Íconos — `node scripts/gen-icons.mjs`

- Regenera `public/icon-192.png` e `icon-512.png` a partir de `public/sheep.svg`
  (usa `sharp`). Solo hace falta correrlo si se cambia el SVG. Los PNG están
  versionados, así que un build normal no lo requiere.

---

## ¿Cuál elegir?

- **Usuario final, con internet:** Web / PWA (`npm run build`) publicado en un
  hosting. Es instalable y se actualiza solo.
- **Compartir rápido / sin servidor / offline:** Archivo único
  (`npm run build:single`) — un solo archivo que se abre con doble clic.
- **Desarrollo:** `npm run dev`.

Ambos builds de producción son la misma app y los mismos cálculos; la diferencia
es el empaquetado y si hay PWA o no.

---

## Checklist de verificación (M8 — hecho)

Antes de declarar una entrega, todo esto debe estar verde:

```bash
npm run lint        # estilo/errores
npm run typecheck   # tipos (tsc --noEmit)
npm test            # suite del motor (Vitest)
npm run build       # build web/PWA
npm run validate    # motor vs Excel (18/18)
npm run build:single
```

Verificado end-to-end (29/06/2026):

- **Web/PWA (`dist/`):** arranca, el service worker se registra y queda activo
  (`rentab-ovina-v2`), `manifest.webmanifest` válido (3 íconos), `icon-192` e
  `icon-512` cargan.
- **Archivo único (`dist-single/`):** la salida es **un solo** `index.html` sin
  ninguna referencia externa; la app y el motor funcionan (una sola petición de
  red: el propio HTML); sin errores de consola.
- **Dev (`npm run dev`):** el service worker **no** se registra (correcto).
