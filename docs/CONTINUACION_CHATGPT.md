# Continuación del proyecto — Traspaso completo de contexto

> Documento **maestro** para retomar el desarrollo en una conversación nueva sin perder
> contexto. Pensado para que otro arquitecto continúe **sin preguntar nada**.
> Última actualización: **2026-06-29** — versión **1.0.0-rc.3 / RC3 (Beta cerrada)**.

---

## 1. Estado actual

Aplicación **web (SPA)** para analizar la **rentabilidad económica y productiva** de un
establecimiento **ovino**, replicando fielmente una planilla Excel de referencia. Sin
backend; datos en `localStorage`. Se distribuye como Web/PWA y como archivo único offline.

- **Versión:** `1.0.0-rc.3` · etiqueta visible **RC3** · estado **Beta cerrada**.
- **PUBLICADA y en línea:** https://matiasorihuelab-wq.github.io/app-ganadero-ovino/
  (repo público, GitHub Pages vía Actions, deploy automático en cada push a `main`).
- **Rama de trabajo:** `feat/v1-funcionalidad`. **Rama de distribución:** `main`.
- **Calidad (todo verde):** lint, typecheck, test (48), validate (18/18 motor vs Excel),
  build, package. CI en cada push/PR.
- **Objetivo inmediato:** **beta cerrada** con técnicos del SUL (compartir por enlace
  público). Ver [BETA_READY.md](BETA_READY.md).

## 2. Arquitectura

Dos piezas grandes, desacopladas:

1. **Motor económico** (`src/engine/`) — TS puro, sin UI. `calc.ts` replica el Excel celda
   a celda. **Congelado** (baseline RC1). Es el activo principal.
2. **Módulo de Requerimientos Nutricionales** (`src/nutrition/`) — motor de **consulta**
   de tablas oficiales vía providers. **Congelado / 🚧 En construcción** (no funcional).

La UI (`src/components/`, `src/App.tsx`) depende del motor; el motor no depende de la UI.
La persistencia está detrás de **puertos** (`src/persistence/`) con adapters de
`localStorage` inyectables.

```
UI (React)  ──►  motor económico (engine)        ──►  Resultados (dashboard, timeline)
   │
   └──►  persistencia (puertos + adapters localStorage)
   └──►  módulo nutricional (provider de requerimientos)  [CONGELADO]
```

## 3. Decisiones de diseño (las importantes)

- **El motor de cálculo es el activo principal** y es independiente de la UI. Cualquier
  número validado contra el Excel se reverifica con `npm run validate` (18/18, < 1e-6).
- **Persistencia desacoplada por interfaz** (ADR-0002): `EscenarioRepository` (escenarios
  con nombre) y `BorradorRepository` (autoguardado). Hoy `localStorage`; mañana un backend
  sin tocar la UI.
- **Client-side primero** (ADR-0001): sin servidor mientras no haya necesidad real.
- **Módulo nutricional = consulta, no simulación.** Se descartó un modelo energético propio
  (NEB). Debe usar **tablas oficiales** (NRC, INRA, AFRC, CSIRO) vía un
  `NutrientRequirementProvider`. **Hoy está congelado y marcado "En construcción".**
- **Porcentajes** se guardan como fracción (0–1) internamente; se editan como % en el form.
- **UI y textos en español** (productores rurales); paleta ruralista en `styles.css`.
- **Distribución por GitHub Pages** con publicación automática; reporte vía Google Forms.

## 4. Funcionalidades terminadas

- Cálculo de **rentabilidad ovina en tiempo real** (ingresos lana/carne, costos, márgenes).
- **Dashboard** (KPIs + gráficos Recharts) y **Evolución** (cash flow mes a mes, reconcilia
  con el margen neto).
- **Guardar / cargar / comparar** escenarios; **autoguardado** del borrador.
- **Exportar** CSV (descarga) y PDF (vía `window.print()` + `@media print`).
- **Validaciones y avisos** (dotación, mortandad, micronaje, rentabilidad negativa…).
- **PWA**: manifest + service worker (offline), instalable. Archivo único offline.
- **Sistema de reporte** beta (botón **🐞 Reportar o sugerir** + **📋 Copiar diagnóstico**).

## 5. Funcionalidades congeladas

- **Motor económico (baseline congelada desde RC1):** no tocar fórmulas/cálculos/resultados
  sin leer `BASELINE_RC1.md` + `CHANGE_POLICY.md`. El código del motor no cambió desde el
  tag `v1.0.0-rc.1`; la app avanzó a RC3 por trabajo fuera del motor.
- **Módulo de Requerimientos Nutricionales:** congelado y marcado **🚧 En construcción**.
  Existe la arquitectura (catálogo de nutrientes, tipos, interfaces, provider NRC con tabla
  **vacía**, contratos futuros de forraje y balance), pero **no se debe seguir
  desarrollando** por ahora. No agregar lógica, cálculos, tablas, providers ni arquitectura.

## 6. Funcionalidades futuras

- **Nutrición:** cargar tablas oficiales NRC (con referencia bibliográfica), definir niveles
  productivos, desarrollar el **análisis químico del forraje** (oferta) y el **balance**
  oferta vs requerimiento (deficiencias, excesos, limitantes, recomendaciones,
  suplementación). Toda la arquitectura ya está esbozada en `src/nutrition/` (ver
  [nutricion/README.md](nutricion/README.md)).
- **Auditoría completa del motor** contra el Excel (todas las categorías).
- **Backend / multiusuario** si el uso lo justifica (la persistencia ya está desacoplada).

## 7. Pendientes priorizados

1. **(Beta)** Crear el Google Forms y pegar su URL en `BUG_REPORT_URL` (`src/bug-report.ts`).
   *(Único pendiente para activar el botón de reporte; la app ya está publicada.)*
2. **(Calidad)** Mejorar foco de teclado (`:focus-visible`) para accesibilidad.
4. **(Motor)** Auditoría completa contra el Excel.
5. **(Nutrición, cuando se descongele)** Cargar tablas NRC + análisis de forraje + balance.

## 8. Estructura del repositorio

```
src/
  engine/        # motor económico (congelado): types, calc, presets, timeline + tests
  nutrition/     # Requerimientos Nutricionales (CONGELADO, "En construcción")
    nutrientes.ts            # catálogo de nutrientes compartido y ampliable
    requirements/{types,categorias,nrc-provider,index,provider.test}.ts
    forraje/types.ts         # contrato OFERTA (futuro, sin lógica)
    balance/types.ts         # contrato BALANCE (futuro, sin lógica)
  components/    # UI React: Formulario, Resultados, Timeline, Nutricion, Modales, Campos,
                 #   ErrorBoundary, BotonesBeta (reporte beta)
  persistence/   # EscenarioRepository + BorradorRepository + adapters localStorage
  utils/         # format, validaciones, exportar (CSV/PDF)
  bug-report.ts  # BUG_REPORT_URL + diagnóstico (beta)
  version.ts     # versión/estado visibles
  App.tsx, main.tsx, styles.css
scripts/         # validate.ts (motor vs Excel), package-release.mjs, gen-icons.mjs
docs/            # vision, architecture, adr/, nutricion/, usuario/, excel-audit/,
                 # BASELINE_RC1, CHANGE_POLICY, DEPLOY_GITHUB_PAGES, BETA_READY,
                 # CONTINUACION_CHATGPT (este documento)
.github/workflows/  # ci.yml (calidad) + deploy-pages.yml (publicación)
release/         # (generado por npm run package) paquete de distribución, gitignored
```

## 9. Convenciones

- **Idioma:** dominio y UI en español; nombres de providers/arquitectura en inglés donde el
  usuario lo definió (`NutrientRequirementProvider`, `NRCProvider`).
- **Commits:** Conventional Commits (`feat`, `fix`, `docs`, `chore`, `refactor`…), en
  español, con `Co-Authored-By` cuando corresponde. Flujo de **PR sobre `main`**.
- **Tests:** Vitest, archivos `*.test.ts` junto al código.
- **Gráficos:** Recharts con `isAnimationActive={false}` (se recalculan en tiempo real).
- **Porcentajes:** fracción (0–1) interna; % en el form.
- **TODO(excel):** marcar dudas de fidelidad contra el Excel.

## 10. Reglas que NO deben romperse

1. **No tocar el motor económico** (`src/engine/`, `scripts/validate.ts`) sin seguir
   `CHANGE_POLICY.md`. Tras cualquier cambio: `npm run validate` debe dar **18/18**.
2. **No “descongelar” el módulo nutricional** sin instrucción explícita: hoy es
   **"En construcción"**, sin lógica/tablas/providers nuevos.
3. **No agregar dependencias pesadas** sin justificación.
4. **Privacidad de datos:** los datos del usuario son **locales** (`localStorage`); no se
   suben a ningún servidor. *(El repositorio es **público** desde la publicación de la beta.)*
5. **Verde antes de avanzar:** lint + typecheck + test + validate + build en CI.
6. **Datos nutricionales sin fuente = prohibidos** (cada fila lleva referencia bibliográfica).

## 11. Proceso de releases

1. Cambios + commit en la rama de trabajo.
2. Bump de versión: `src/version.ts` (`APP_VERSION`, `APP_VERSION_LABEL`) + `package.json`.
3. Entrada en `CHANGELOG.md` (formato Keep a Changelog).
4. `npm run package` → regenera `release/` (web + archivo único + metadatos) y `VERSION`
   (el label `RCn` se **deriva** del sufijo `-rc.N`).
5. Verificación completa en verde.
6. Merge a `main` → el workflow publica en Pages.

## 12. Proceso de auditoría (fidelidad vs Excel)

- El objetivo de fondo es que **18 → todas** las categorías coincidan con el Excel oficial.
- Material y procedimiento en [excel-audit/](excel-audit/) y `BASELINE_RC1.md`.
- Cualquier ajuste de fórmula pasa por `CHANGE_POLICY.md` y se reverifica con `validate`.

## 13. Proceso de validación

- `npm run validate` (y `npm test`) cargan el preset de ejemplo (**Merino, "Cord Dest"**) y
  comparan **18 resultados** contra los del Excel (fuente única:
  `src/engine/__tests__/excel-fixtures.ts`). Precisión < 1e-6.
- Cubre ingresos, costos directos/fijos, márgenes bruto/neto, lana, micronaje, UG, dotación.
- El resto de categorías es parte de la auditoría pendiente.

## 14. Funcionamiento de GitHub Pages

- App **compatible con subdirectorio**: `base: './'` (rutas relativas), manifest/SW/íconos
  relativos, **sin enrutador** (una sola ruta).
- El **service worker** se registra solo en PROD y sobre http(s) (`./sw.js`), estrategia
  *network-first* en navegación (los usuarios online reciben la versión nueva).
- Publicación automática vía `.github/workflows/deploy-pages.yml` (publica `release/web`).
- **Publicado:** repo **público**, Pages **habilitado** (Source: GitHub Actions, gratuito).
  URL pública en línea: `https://matiasorihuelab-wq.github.io/app-ganadero-ovino/`.
- Guía completa: [DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md) y [BETA_READY.md](BETA_READY.md).

## 15. Funcionamiento del sistema de reportes

- **`src/bug-report.ts`:** `BUG_REPORT_URL` (placeholder → reemplazar por el Google Forms),
  `abrirReporte()` (abre en pestaña nueva), `infoDiagnostico()`/`copiarDiagnostico()`
  (versión, fecha/hora, navegador, SO, idioma, user agent; **sin datos personales**).
- **`src/components/BotonesBeta.tsx`:** botones **🐞 Reportar o sugerir** y **📋 Copiar
  diagnóstico** (en la toolbar de `App.tsx`).
- **Formulario (externo, Google Forms):** Tipo (Error/Sugerencia/Mejora), Nombre, Correo,
  Teléfono (opcional), Fecha, ¿qué intentabas?/¿qué ocurrió?/¿qué esperabas?, ¿se reproduce?,
  Navegador, SO, Versión, captura. **Sin institución.** Cómo crearlo: [BETA_READY.md](BETA_READY.md).

## 16. Próximos pasos recomendados

1. **Lanzar la beta:** la app **ya está publicada**; crear el formulario, pegar la URL en
   `BUG_REPORT_URL` y compartir el enlace + `BETA_TEST.md` con los técnicos del SUL.
2. **Recoger feedback** unas semanas; priorizar fixes de UX/textos (sin tocar el motor).
3. **Auditoría del motor** contra el Excel (todas las categorías).
4. **Descongelar nutrición** (cuando se decida): cargar tablas NRC → análisis de forraje →
   balance, siguiendo `nutricion/README.md`.
5. (Opcional) Pequeñas mejoras de accesibilidad (`:focus-visible`) y de vista previa del
   enlace (OG image).

## 17. Comandos clave

```bash
npm run dev        # desarrollo (http://localhost:5174)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest
npm run validate   # motor vs Excel (18/18)
npm run build      # build Web/PWA
npm run package    # arma release/ (web + archivo único + metadatos)
```
