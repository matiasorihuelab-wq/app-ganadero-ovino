# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/).

## [1.0.0-rc.3] — 2026-06-29 — Beta cerrada (RC3) — build para SUL

Build de la **beta cerrada** con técnicos del SUL: la app queda lista para compartir por
un enlace público. **Sin cambios funcionales** en el motor económico (congelado, 18/18) ni
en el módulo nutricional (congelado "🚧 En construcción"). Trabajo de preparación,
documentación y empaquetado.

### Beta — preparación final
- **Módulo nutricional** confirmado como **🚧 En construcción**, con texto que aclara que
  se incorporará en una **futura versión** usando tablas oficiales (NRC, INRA, AFRC, etc.).
  No se agregó lógica, cálculos, tablas, providers ni arquitectura.
- **Sistema de reporte terminado:** botón **🐞 Reportar o sugerir** (Error / Sugerencia /
  Mejora) + **📋 Copiar diagnóstico**. Formulario especificado (incluye *Tipo de reporte*
  y *Fecha*; sin institución) y documentado.
- **Revisión integral de beta** (UX, textos, responsive, impresión, exportaciones,
  persistencia, offline, GitHub Pages) — ver `docs/BETA_READY.md`.
- Documentación nueva: **`docs/BETA_READY.md`** (cómo publicar/distribuir) y
  **`docs/CONTINUACION_CHATGPT.md`** (traspaso completo de contexto).
- `release/`, `VERSION` y `CHANGELOG` regenerados como **RC3 / Beta cerrada**.

## [1.0.0-rc.2] — 2026-06-29 — Release Candidate (RC2)

Build de la **beta cerrada** con técnicos del SUL. Incluye el rediseño del **módulo
nutricional** y la preparación de la **distribución**. El **motor económico permanece
intacto** (validado 18/18 contra el Excel).

### Beta — distribución
- El **módulo nutricional queda congelado** y claramente identificado como
  **"🚧 En construcción"** en la interfaz (banner + pestaña) y en la documentación. No se
  elimina lo hecho; su desarrollo se retoma más adelante.
- El botón de reporte pasa a **"🐞 Reportar o sugerir"**: el formulario admite **errores,
  sugerencias y mejoras** (campo *Tipo de reporte*). Documentación de usuario y de
  despliegue sincronizadas con el nuevo flujo.
- `index.html`: metadatos **Open Graph** para una mejor vista previa al compartir el
  enlace (WhatsApp, etc.).
- Estado visible de la app: **Beta cerrada**.

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
  tablas) y el documento de traspaso de contexto.

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
