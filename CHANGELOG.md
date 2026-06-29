# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/).

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
