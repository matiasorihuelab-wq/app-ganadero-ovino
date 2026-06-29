# Revisión de candidato a producción — v1

> Auditoría integral (consistencia, mantenibilidad, deuda, UX, rendimiento,
> correctitud) hecha sobre la v1 antes de consolidarla, con el motor de cálculo
> congelado (las dudas de fidelidad con el Excel son una etapa posterior). 31
> hallazgos verificados + 8 adicionales. Este documento registra el veredicto y qué
> se resolvió vs. qué se difirió.

## Veredicto de madurez

La v1 llegó a un **nivel adecuado para consolidarse**. El cluster de robustez que la
bloqueaba (cargar escenarios de esquema viejo podía crashear la app) **se corrigió y
quedó cubierto por tests**. Lo pendiente es **pulido y optimización opinable**, no
re-arquitectura. Las fundaciones son sólidas: motor puro y validado, persistencia
detrás de puertos, CI completo (lint→typecheck→test→build→validate).

## Resuelto en esta etapa

**Robustez (lo que bloqueaba):**
- `sanitizeInputs()`: cargar borrador/escenario/comparar mergea sobre el preset vacío
  y garantiza `medicamentos` array → no más TypeError con esquemas viejos/corruptos.
- `try/catch` en `setItem` (borrador y escenarios) → el autoguardado no tumba la UI.
- Autoguardado con **debounce** + flush al ocultar la pestaña.
- **ErrorBoundary** raíz: ante cualquier excepción, mensaje con recargar/limpiar en
  vez de pantalla en blanco.

**Consistencia / a11y / UX:**
- Tabla de medicamentos: saneamiento numérico compartido (no más negativos/NaN).
- Campos asocian `<label htmlFor>` con `<input id>` (lectores de pantalla).
- Guarda `onWheel`: la rueda del mouse ya no cambia valores al hacer scroll.
- Confirmación antes de eliminar/cargar escenarios; modales cierran con **Escape**
  (`role="dialog"`).

**Mantenibilidad:**
- `round` unificado en `format.ts`; suma de comercialización calculada una sola vez.

**Tests / hygiene / docs:**
- Tests de `sanitizeInputs`, `validaciones` y los adapters de persistencia (48 en total).
- `.gitignore` de artefactos de tooling; ids con `crypto.randomUUID`; `<noscript>` +
  `<meta description>`; fallback offline del SW; `architecture.md` sincronizado.

## Diferido (backlog post-consolidación, priorizado)

Ninguno bloquea la v1. Orden sugerido por valor/costo:

| Ítem | Qué | Por qué se difiere |
|------|-----|--------------------|
| H-05 | Permitir vaciar un campo numérico al reescribir (hoy fuerza 0) | Cambio al input base usado en todo el form; UX real, merece su propio cambio + bench |
| H-06 | Unificar el input del NEB con `NumberField` | Menor; se cierra junto con H-05 (un helper de input) |
| H-22 | Empty-states unificados en las 3 vistas + ARIA de pestañas | Pulido de UX/a11y |
| H-15/H-16 | Memoizar Recharts/datos; code-split de recharts (solo build web) | Rendimiento: medir antes; hoy imperceptible |
| H-20 | Endurecer el CSV (escapar `;`/comillas, filtrar filas vacías, no-finitos) | Riesgo acotado (datos propios, app local) |
| H-11 | Mover ratios /ha y % al motor | Toca el contrato del motor → junto a la etapa Excel |
| H-23/H-24 | Bordes del Timeline (mensaje de fechas, índice de venta en mes base) | Etiqueta descriptiva; toca `timeline.ts` |
| H-07 (resto) | Focus-trap completo en modales | Escape/role ya hechos; el trap es lo costoso |
| H-12, H-17, H-19, H-21, H-25, H-27, H-28 | Tupla→interface, memos marginales, estilos inline, etc. | Opinables / marginales |
| — | Export/import de escenarios (JSON), versionado de esquema, indicador de "guardado" | Features/robustez de producto, fuera del alcance de pulido |

## Riesgo residual a verificar manualmente

- **Gráficos en la impresión/PDF:** el reporte usa `window.print()` con `@media print`.
  Los charts usan `ResponsiveContainer` con **altura fija** (210/230) y ancho 100%, así
  que el riesgo de salir vacíos es menor al habitual, pero **conviene una prueba de
  vista previa de impresión** antes de un demo público. Si salieran cortados, el fix es
  fijar un ancho explícito en el CSS de impresión.
