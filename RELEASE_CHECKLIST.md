# Checklist de liberación

Pasos para liberar una versión (RC o final). Reutilizable. Marcar todo antes de
compartir/publicar.

## 1. Calidad automatizada (todo en verde)

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run validate     # motor vs Excel (18/18)
```

- [ ] `lint` sin errores.
- [ ] `typecheck` sin errores.
- [ ] `test` (Vitest) todo en verde.
- [ ] `build` (Web/PWA) genera `dist/` sin errores.
- [ ] `validate` confirma la coincidencia con el Excel.
- [ ] CI en verde en la rama (GitHub Actions).

## 2. Versionado

- [ ] `package.json` → `version` actualizada.
- [ ] `src/version.ts` → `APP_VERSION` / `APP_VERSION_LABEL` / `APP_ESTADO` coherentes.
- [ ] La versión se ve en la interfaz (badge del header).
- [ ] `CHANGELOG.md` con la entrada de esta versión (fecha + cambios).

## 3. Empaquetado

```bash
npm run package
```

- [ ] `release/` generada con: `web/`, `app-rentabilidad-ovina.html`, `VERSION.txt`,
      `CHANGELOG.md`, `LEEME.txt`.
- [ ] `VERSION` (raíz) y `release/VERSION.txt` tienen versión, fecha, **commit** y estado
      correctos.

## 4. Revisión manual (smoke test)

Probar **en al menos un navegador** (idealmente 2) y, si se puede, en celular:

- [ ] **Archivo único:** abrir `release/app-rentabilidad-ovina.html` con doble clic →
      carga, "Cargar ejemplo" muestra resultados, sin errores de consola.
- [ ] **Web/PWA:** servir `release/web/` (o `npm run preview`) → carga, instalable, y
      tras un "redeploy" sirve la versión nueva (no cacheada vieja).
- [ ] Las **3 pestañas** (Dashboard, Evolución, Energético) renderizan.
- [ ] **Guardar / cargar / comparar** escenarios funciona; el borrador se restaura al
      recargar.
- [ ] **Exportaciones:**
  - [ ] CSV (📊) descarga y abre bien (números y categorías correctos).
  - [ ] **Impresión / PDF** (📥): revisar la **vista previa** — el reporte sale limpio y
        **los gráficos se ven** (riesgo conocido de Recharts en impresión).
- [ ] **Responsive:** el layout se apila bien en pantalla angosta.
- [ ] Sin **errores en la consola** del navegador.

## 5. Documentación

- [ ] `docs/usuario/` al día (instalación, uso, FAQ, limitaciones, requisitos, reportar).
- [ ] `BETA_TEST.md` (si aplica a la etapa) con el contacto de reporte completado.
- [ ] `docs/usuario/limitaciones.md` refleja el estado real (p. ej. auditoría Excel).

## 6. Git

- [ ] Working tree limpio; cambios commiteados.
- [ ] Tag de la versión si corresponde (p. ej. `v1.0.0-rc.1`).
- [ ] `release/` NO se commitea (es regenerable; está en `.gitignore`).

## 7. Distribución

- [ ] Definir el canal (mail/pendrive para archivo único; hosting para Web/PWA).
- [ ] Verificar que el destinatario recibe el `LEEME.txt`.
- [ ] El repositorio sigue **privado** (no publicar el código).
