# Despliegue en GitHub Pages

Guía paso a paso para publicar la app como un enlace público mediante **GitHub Pages**,
con publicación **automática** vía GitHub Actions. Pensada para que cualquier técnico
pueda repetir el proceso.

> **El repositorio sigue privado.** Lo que se publica es **solo la app compilada**
> (`release/web`), no el código fuente.

## ⚠️ Antes de empezar: Pages en repo privado

El repositorio es **privado**. Publicar un sitio de Pages **público** desde un repo
privado **puede requerir un plan pago** (GitHub Pro/Team) según tu cuenta. Verificalo en
**Settings → Pages**:

- Si te deja elegir **Source: GitHub Actions** → estás listo (seguí abajo).
- Si te pide **actualizar el plan** → tenés tres opciones:
  1. **GitHub Pro** (mantiene el repo privado y publica un sitio público) — recomendado.
  2. Hacer el repositorio **público** (no recomendado en esta etapa).
  3. Usar otro hosting de estáticos (Netlify/Vercel) que publica desde un repo privado en
     su plan gratuito (mismo `release/web`).

El resto de esta guía asume la opción 1 o 2 (GitHub Pages).

## 1. Repositorio

Ya existe: **`matiasorihuelab-wq/app-ganadero-ovino`** (privado). No hay que crear nada.
Para repetir en otro repo: crear el repo, `git push` del proyecto, y seguir desde el
paso 2.

## 2. Rama de distribución

La publicación se dispara desde la rama **`main`** (configurada en
`.github/workflows/deploy-pages.yml`). Llevá el código a `main`:

```bash
git checkout main
git merge feat/v1-funcionalidad      # o la rama donde esté el trabajo
git push origin main
```

> Si preferís otra rama de distribución, cambiá `branches: [main]` en el workflow.

## 3. Configurar GitHub Pages

1. En GitHub: **Settings → Pages**.
2. En **Build and deployment → Source**, elegí **GitHub Actions**.
3. Listo. No hace falta elegir carpeta ni rama: lo maneja el workflow.

## 4. Activar el workflow

El workflow `.github/workflows/deploy-pages.yml` ya está en el repo. Se activa solo al
hacer push a `main` (o manualmente desde **Actions → Deploy a GitHub Pages → Run
workflow**). En cada corrida:

1. Instala dependencias, corre **lint, typecheck, tests, validate, build, package**.
2. Publica **`release/web`** en GitHub Pages.

Si alguno de los pasos de calidad falla, **no publica** (es una salvaguarda).

## 5. Publicar una nueva Release Candidate

1. Hacer los cambios y commitearlos en la rama de trabajo.
2. Actualizar la **versión** (`package.json`, `src/version.ts`) y el `CHANGELOG.md`.
3. Llevar a `main` (`git merge` + `git push origin main`).
4. El workflow corre y publica automáticamente. Seguir el progreso en **Actions**.

## 6. Actualizar una RC existente (re-publicar)

Cualquier nuevo push a `main` **re-publica** (sobrescribe el sitio). Si solo cambió
documentación o un texto, igual: push a `main` → se publica la versión nueva.

> La PWA usa estrategia *network-first*, así que los usuarios online reciben la versión
> nueva en la siguiente carga (no quedan con una vieja cacheada).

## 7. Volver a una versión anterior (rollback)

Como cada publicación corresponde a un commit, para volver atrás:

```bash
# Opción A: revertir el último cambio y re-publicar
git checkout main
git revert <commit-malo>
git push origin main

# Opción B: re-publicar un commit/tag anterior conocido (p. ej. la baseline)
git checkout main
git reset --hard v1.0.0-rc.1      # CUIDADO: descarta lo posterior en main
git push --force-with-lease origin main
```

La opción A (revert) es la más segura porque no reescribe la historia. Tras el push, el
workflow re-publica el estado elegido.

## 8. El enlace público

Una vez publicado, la app queda en:

```
https://matiasorihuelab-wq.github.io/app-ganadero-ovino/
```

Ese es el enlace que se comparte con los técnicos del SUL. (Si cambiás el nombre del
repo o el owner, la URL cambia en consecuencia: `https://<owner>.github.io/<repo>/`.)

La URL exacta también aparece al terminar el workflow (job **deploy**, campo
*page_url*) y en **Settings → Pages**.

## 9. Formulario de reporte (errores / sugerencias / mejoras)

El botón **🐞 Reportar o sugerir** abre un formulario externo. Para dejarlo operativo:

1. **Crear el formulario** (lo más simple: Google Forms, gratis) con estos campos
   (**no pedir institución**):
   - Nombre · Correo electrónico · Teléfono (opcional)
   - **Tipo de reporte:** Error / Sugerencia / Mejora *(opción única)*
   - ¿Qué estabas intentando hacer? · ¿Qué ocurrió? · ¿Qué esperabas que ocurriera?
   - ¿Se puede repetir? (Siempre / A veces / Una sola vez / No sé)
   - Navegador (Chrome / Edge / Firefox / Safari / Otro)
   - Sistema operativo (Windows / Android / iPhone-iPad / Mac / Linux / Otro)
   - Versión de la aplicación (texto; el usuario la copia con **📋 Diagnóstico**)
   - Captura de pantalla (subir archivo)
2. **Copiar el enlace** del formulario (en Google Forms: *Enviar → 🔗 → Copiar*).
3. **Pegarlo** en `src/bug-report.ts`, en la constante `BUG_REPORT_URL` (reemplaza el
   placeholder), commitear y publicar (push a `main`).

> El flujo de usuario está documentado en
> [docs/usuario/reportar-errores.md](usuario/reportar-errores.md).

## Notas técnicas

- La app es **compatible con subdirectorio** por diseño: `base: './'` (rutas relativas),
  manifest/SW/íconos relativos y **sin enrutador** (una sola ruta). No requiere ajustes
  para servir desde `/<repo>/`.
- El workflow publica `release/web` (build Web/PWA), no `dist-single` (ese es para
  compartir el archivo único por separado).
