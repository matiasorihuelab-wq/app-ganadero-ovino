# Continuación del proyecto — App de Rentabilidad Ovina

> Documento de **traspaso de contexto**. Sirve para retomar el desarrollo en una
> conversación nueva sin perder el hilo. Última actualización: **2026-06-29** (RC2).

## 1. Estado actual

- **Versión:** `1.0.0-rc.2` (RC2). Etiqueta visible en la app: **RC2**.
- **Rama de trabajo:** `feat/v1-funcionalidad`. Rama de distribución: `main`.
- **App:** SPA React + TypeScript + Vite. Sin backend. Persistencia en `localStorage`.
  Se distribuye como Web/PWA y como archivo único offline.
- **Calidad (todo en verde):** `lint`, `typecheck`, `test` (48), `validate` (18/18 motor
  vs Excel), `build`, `package`. CI en cada push/PR.
- **Dos grandes piezas:**
  1. **Motor económico** (`src/engine/`) — **congelado** (baseline RC1). Réplica fiel del
     Excel. **No se toca** sin leer `docs/BASELINE_RC1.md` + `docs/CHANGE_POLICY.md`.
  2. **Módulo de Requerimientos Nutricionales** (`src/nutrition/`) — **rediseñado en
     RC2** como motor de consulta (ver punto 2), pero **congelado / "🚧 En construcción"**:
     su desarrollo está **detenido** (marcado así en la UI) hasta tener las tablas
     oficiales. No eliminar lo hecho; no seguir desarrollándolo por ahora.

## 2. Arquitectura vigente

```
src/
  engine/        # motor económico (TS puro, congelado). calc.ts replica el Excel celda a celda.
  nutrition/     # Requerimientos Nutricionales (motor de CONSULTA, no calcula)
    nutrientes.ts            # catálogo de nutrientes compartido y ampliable
    requirements/
      types.ts               # Categoria, EstadoFisiologico, NivelProductivo, Consulta,
                             #   Requerimiento, NutrientRequirementProvider (puerto)
      categorias.ts          # taxonomía: Ovejas/Borregas/Carneros + estados
      nrc-provider.ts        # NRCProvider — estructura de tabla, SIN datos todavía
      index.ts               # composition root: provider activo (NRC)
      provider.test.ts       # tests de arquitectura
    forraje/types.ts         # AnalisisForraje (OFERTA) — contrato FUTURO, sin lógica
    balance/types.ts         # BalanceNutricional + ComparadorNutricional — contrato FUTURO
  components/    # UI React. Nutricion.tsx = UI del módulo nutricional.
  persistence/   # puertos EscenarioRepository + BorradorRepository (localStorage)
  utils/         # format, validaciones, exportar (CSV/PDF)
  bug-report.ts  # botón "Reportar o sugerir" + diagnóstico (beta)
  version.ts     # versión visible (RC2)
```

**Principio del módulo nutricional:** la app **consulta** requerimientos oficiales; **no
los calcula**. La UI nunca conoce la fuente: habla con un `NutrientRequirementProvider`.
Cambiar de sistema (NRC → INRA/AFRC/CSIRO) = un provider nuevo + una línea en `index.ts`.
Detalle completo en [docs/nutricion/README.md](nutricion/README.md).

## 3. Decisiones importantes tomadas

- **El motor económico es el activo principal y permanece congelado** (RC1). Cualquier
  número validado contra el Excel se reverifica con `npm run validate`.
- **El módulo nutricional NO es un simulador metabólico.** Se eliminó el modelo propio
  (NEB: `PV^0,75`, coeficientes, ajuste por frío, etc.). Es un **motor de consulta** de
  tablas oficiales, auditable y trazable (cada dato cita su fuente).
- **El requerimiento depende de categoría + estado fisiológico + peso vivo + nivel
  productivo** (cuando corresponda), no solo del peso.
- **Catálogo de nutrientes único y ampliable** (`nutrientes.ts`), compartido por
  requerimiento (hoy) y por forraje/balance (futuro).
- **Forraje y balance se dejan como contratos (tipos), sin lógica.** No se inventan
  fórmulas ni datos: el balance será una comparación directa oferta vs requerimiento.
- **Distribución beta:** GitHub Pages con publicación automática (workflow) + botón de
  reporte de problemas. Ver `docs/DEPLOY_GITHUB_PAGES.md`.
- **Repo privado** (no publicar). Flujo de PR sobre `main`.

## 4. Qué quedó terminado

- ✅ Motor económico estable y validado (18/18).
- ✅ Módulo nutricional **rearquitecturado** (RC2): catálogo, tipos, interfaces, provider
  NRC (estructura), UI de consulta, tests de arquitectura.
- ✅ Contratos futuros de forraje y balance (tipos).
- ✅ Documentación del módulo (`docs/nutricion/`) y este documento de continuación.
- ✅ Infraestructura de distribución beta (Pages + workflow + botón de reporte).
- ✅ Versión y CHANGELOG actualizados a RC2; `release/` regenerado.

## 5. Qué quedó pendiente (por diseño)

- ⏳ **Cargar las tablas oficiales NRC** en `src/nutrition/requirements/nrc-provider.ts`
  (`TABLA_NRC`, hoy vacía). Guía: [docs/nutricion/cargar-requerimientos.md](nutricion/cargar-requerimientos.md).
- ⏳ **Definir niveles productivos** concretos por estado (estructura lista en
  `categorias.ts`, sin datos).
- ⏳ **Desarrollar el análisis químico del forraje** (oferta) — hoy solo el contrato.
- ⏳ **Implementar el balance** oferta vs requerimiento (deficiencias, excesos,
  limitantes, recomendaciones, suplementación) — hoy solo el contrato.
- ⏳ **Auditoría completa del motor** contra el Excel (todas las categorías, no solo el
  escenario de ejemplo). Ver `docs/excel-audit/`.
- ⏳ **GitHub Pages en repo privado** puede requerir plan Pro (ver punto 7).

## 6. Próximos pasos recomendados (orden sugerido)

1. **Cargar la primera tabla NRC** (p. ej. ovejas en gestación/lactancia) con sus
   referencias, y un test por fila representativa. Esto vuelve útil la consulta.
2. Definir los **niveles productivos** que el NRC tabula (lactancia simple/doble, etc.).
3. Diseñar e implementar el **módulo de análisis del forraje** (oferta) reutilizando
   `nutrientes.ts` y el contrato `forraje/types.ts`.
4. Implementar el **comparador de balance** (`balance/types.ts`) y su UI.
5. Retomar la **auditoría del motor económico** contra el Excel.

## 7. Riesgos conocidos

- **GitHub Pages desde repo privado** puede requerir **GitHub Pro**. Verificar en
  *Settings → Pages*; alternativas: Pro, repo público (no deseado), o Netlify/Vercel.
  Detalle en `docs/DEPLOY_GITHUB_PAGES.md`.
- **No romper la coincidencia con el Excel.** Tras cualquier cambio en `src/engine/`,
  correr `npm run validate` (18/18). El motor está congelado: cambios requieren leer la
  política de cambios.
- **Datos sin fuente:** ninguna tabla del módulo nutricional debe cargarse sin referencia
  bibliográfica (regla del provider).
- **El botón "Reportar o sugerir"** usa `BUG_REPORT_URL` en `src/bug-report.ts`, que es
  un **placeholder**: hay que pegar la URL real del formulario para que sea operativo.

## 8. Ubicación de la documentación

| Tema | Archivo |
|------|---------|
| Visión / propósito | [docs/vision.md](vision.md) |
| Arquitectura general | [docs/architecture.md](architecture.md) |
| Decisiones de diseño | [docs/adr/](adr/) |
| Baseline congelada (motor) | [docs/BASELINE_RC1.md](BASELINE_RC1.md), [docs/CHANGE_POLICY.md](CHANGE_POLICY.md) |
| **Módulo nutricional** | [docs/nutricion/README.md](nutricion/README.md) |
| Cargar tablas NRC | [docs/nutricion/cargar-requerimientos.md](nutricion/cargar-requerimientos.md) |
| Distribución / Pages | [docs/DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md), [docs/distribucion.md](distribucion.md) |
| Auditoría del Excel | [docs/excel-audit/](excel-audit/) |
| Manual de usuario | [docs/usuario/](usuario/) |
| Cambios por versión | [CHANGELOG.md](../CHANGELOG.md) |
| Instrucciones para Claude | [CLAUDE.md](../CLAUDE.md) |

## 9. Comandos clave

```bash
npm run dev            # desarrollo (http://localhost:5174)
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm test               # Vitest
npm run validate       # motor vs Excel (18/18)
npm run build          # build Web/PWA
npm run package        # arma release/ (web + archivo único + metadatos)
```
