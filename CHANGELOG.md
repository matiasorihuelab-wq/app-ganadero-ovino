# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/).

## [1.0.0-rc.2] — 2026-06-29 — Release Candidate (RC2)

Rediseño del **módulo nutricional**. El **motor económico permanece intacto** (validado
18/18 contra el Excel); el cambio está **aislado** en `src/nutrition/`.

### Cambiado
- El módulo nutricional pasa de un **modelo energético propio (NEB)** a un **motor de
  consulta de requerimientos oficiales** (NRC y, a futuro, INRA/AFRC/CSIRO). La app **no
  calcula ni modela**: consulta tablas auditables según **categoría, estado fisiológico,
  peso vivo y nivel productivo**.
- La pestaña "🔥 Energético" pasó a "🥗 Requerimientos".

### Agregado
- Arquitectura por **providers** (`NutrientRequirementProvider` → `NRCProvider`),
  intercambiable sin tocar la UI.
- **Catálogo de nutrientes** compartido y ampliable (`src/nutrition/nutrientes.ts`):
  energía, proteína, consumo, minerales mayores y traza, vitaminas.
- Contratos **futuros** (solo tipos, sin lógica) para el **análisis químico del forraje**
  (`forraje/`) y el **balance** oferta vs requerimiento (`balance/`).
- Documentación: `docs/nutricion/` (objetivo, arquitectura, flujo, providers, cómo cargar
  tablas) y `docs/CONTINUACION_PROYECTO.md`.

### Eliminado
- Todo el modelo NEB propio: mantenimiento `PV^0,75`, coeficientes editables, ajuste por
  frío, temperatura, condición corporal, ganancia diaria, parámetros del modelo.

### Pendiente (no incluido en esta etapa, por diseño)
- Cargar las **tablas oficiales NRC** (hoy la estructura está vacía a propósito).
- Desarrollar el **análisis químico del forraje** y el **balance** nutricional.

## [1.0.0-rc.1] — 2026-06-29 — Release Candidate (RC1)

Primer **Release Candidate**, listo para una **beta cerrada** con usuarios reales.
El motor económico se auditará contra el Excel de referencia en una etapa posterior
(puede haber ajustes de fórmulas).

### Funcionalidad
- Cálculo de **rentabilidad ovina en tiempo real** (réplica del modelo Excel de
  referencia): ingresos por lana y carne, costos directos y fijos, márgenes.
- Tres vistas: **Dashboard**, **Evolución** (flujo de caja mes a mes) y **Energético**
  (necesidades energéticas / NEB).
- **Guardar / cargar / comparar** escenarios; **autoguardado** del borrador en curso.
- **Exportar** a CSV y **reporte de impresión / PDF**.
- **Validaciones y avisos** (dotación, mortandad, micronaje, rentabilidad negativa,
  datos faltantes).
- Dos formatos de distribución: **Web/PWA** instalable y **archivo único** offline.

### Calidad
- Motor de cálculo **validado contra el Excel** (18/18 valores, < 1e-6).
- Suite de **tests automatizados** (Vitest) del motor, validaciones y persistencia, +
  **CI** (lint, typecheck, test, build, validate) en cada cambio.
- **Robustez:** ErrorBoundary, saneamiento de datos persistidos (no se rompe con
  escenarios viejos), escrituras a almacenamiento a prueba de fallos.
- **Accesibilidad** de formularios (labels asociados), modales con teclado (Escape).
- **PWA** con estrategia de cache que evita servir versiones viejas tras una
  actualización.

### Conocido / pendiente
- **Auditoría de fidelidad con el Excel definitivo** pendiente: algunas fórmulas/valores
  podrían ajustarse. Ver `docs/usuario/limitaciones.md`.
- Los datos se guardan **solo en el navegador** (sin sincronización ni respaldo en la
  nube todavía).
