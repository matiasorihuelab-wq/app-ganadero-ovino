# Beta cerrada — Guía de publicación y distribución (RC3)

> Estado: **PUBLICADA y en línea** para la beta cerrada con técnicos del SUL:
> **https://matiasorihuelab-wq.github.io/app-ganadero-ovino/** (repo público, Pages vía
> GitHub Actions). El motor económico está congelado (validado 18/18). El módulo
> nutricional queda **🚧 En construcción**.

## Qué quedó terminado

- **App funcional** (rentabilidad ovina): formulario, Dashboard, Evolución, guardar/
  cargar/comparar escenarios, autoguardado, exportar CSV/PDF, validaciones y avisos.
- **Distribución:** build Web/PWA con rutas relativas (compatible con subdirectorio),
  manifest + service worker (offline), workflow de GitHub Actions para publicar en Pages.
- **Sistema de reporte:** botón **🐞 Reportar o sugerir** (errores/sugerencias/mejoras) +
  **📋 Copiar diagnóstico** (versión, navegador, SO, sin datos personales).
- **Módulo nutricional** congelado y marcado **🚧 En construcción** (no funcional, por diseño).
- **Documentación** de usuario y técnica sincronizada; `VERSION`, `CHANGELOG` y `release/`
  regenerados como RC3 / Beta cerrada.

## Qué quedó pendiente

- **Pegar la URL real del formulario** en `src/bug-report.ts` (`BUG_REPORT_URL`, hoy
  placeholder). Ver más abajo. *(Único pendiente para que el botón de reporte funcione.)*
- **Auditoría completa del motor** contra el Excel (todas las categorías) — etapa futura.
- **Módulo nutricional** (tablas oficiales, análisis de forraje, balance) — congelado.
- Mejora menor de **accesibilidad**: reforzar estilos de foco de teclado (`:focus-visible`).

## Cómo publicar una nueva versión

1. Hacer los cambios en la rama de trabajo y commitear.
2. Actualizar la versión: `src/version.ts` (`APP_VERSION`, `APP_VERSION_LABEL`) y
   `package.json`. Agregar entrada en `CHANGELOG.md`.
3. `npm run package` (regenera `release/` + `VERSION` con la versión nueva).
4. Verificar en verde: `npm run lint && npm run typecheck && npm test && npm run validate && npm run build`.
5. Llevar a `main` (ver siguiente sección).

## Cómo publicar en GitHub Pages

1. **Settings → Pages → Source: GitHub Actions** — **ya está configurado** (repo público,
   Pages gratuito). No requiere ninguna acción adicional.
2. Llevar el código a `main`:
   ```bash
   git checkout main && git merge feat/v1-funcionalidad && git push origin main
   ```
3. El workflow `.github/workflows/deploy-pages.yml` corre lint → typecheck → test →
   validate → build → package y **publica `release/web`** automáticamente.
4. Seguir el progreso en **Actions**; la URL aparece en el job *deploy* y en Settings → Pages.

Detalle y rollback: [DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md).

## Cómo crear el formulario (Google Forms)

Crear un formulario con estos campos (**no pedir institución**):

- **Tipo de reporte:** Error / Sugerencia / Mejora *(opción única)*
- **Nombre** · **Correo electrónico** · **Teléfono** (opcional) · **Fecha**
- **¿Qué estabas intentando hacer?** · **¿Qué ocurrió?** · **¿Qué esperabas que ocurriera?**
- **¿Se puede volver a reproducir?** (Siempre / A veces / Solo una vez / No lo sé)
- **Navegador** · **Sistema operativo** · **Versión de la aplicación**
- **Adjuntar captura de pantalla** (tipo "Subir archivo")

Luego: **Enviar → 🔗 (enlace) → Copiar**.

## Cómo cambiar la URL del formulario

Pegar el enlace copiado en `src/bug-report.ts`:

```ts
export const BUG_REPORT_URL = 'https://forms.gle/...'   // ← reemplazar el placeholder
```

Commitear y publicar (push a `main`). El botón **🐞 Reportar o sugerir** abre esa URL.

## Cómo recibir los reportes

- **Google Forms** acumula las respuestas en su pestaña **Respuestas** y, opcionalmente,
  en una **hoja de cálculo** (Sheets) vinculada. Activá las **notificaciones por correo**
  (Respuestas → ⋮ → "Recibir notificaciones por correo electrónico de respuestas nuevas").
- El usuario puede pegar el resultado de **📋 Copiar diagnóstico** y adjuntar una captura,
  lo que facilita reproducir el caso.

## Cómo distribuir la app a los técnicos del SUL

1. Confirmar que Pages está publicado y la URL abre correctamente.
2. Compartir el **enlace público** por WhatsApp/mail:
   `https://matiasorihuelab-wq.github.io/app-ganadero-ovino/`
3. Adjuntar (o enlazar) la **[Guía de Beta](../BETA_TEST.md)**: qué probar y cómo reportar.
4. No hace falta instalar nada: abre en el navegador (PC o celular) y funciona offline
   una vez cargada (PWA).
