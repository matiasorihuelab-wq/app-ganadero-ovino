# Baseline RC1 — línea base congelada

> Documento de cierre de etapa. Si estás abriendo este proyecto por primera vez (incluso
> dentro de varios años), **leé esto primero**.

## Qué representa RC1

**RC1 (`1.0.0-rc.1`)** es el **último estado del software previo a la validación científica
del modelo económico contra el Excel oficial**. En este punto:

- El **software está estabilizado**: funcional, probado (CI verde: lint, typecheck, tests,
  build, validate) y empaquetado para distribución (`npm run package` → `release/`).
- La **arquitectura está congelada**: motor puro y aislado, persistencia detrás de puertos,
  UI desacoplada. Ver [architecture.md](architecture.md) y los [ADR](adr/).
- El **único trabajo pendiente** es la **auditoría de fidelidad** del motor de cálculo
  contra el Excel de referencia (ver [excel-audit/](excel-audit/)).

La identidad exacta de esta baseline (versión, fecha, commit) está en el archivo `VERSION`
(generado por `npm run package`) y, si se creó, en el tag de git `v1.0.0-rc.1`.

## Qué queda CONGELADO (no se toca en RC1 ni durante la auditoría, salvo el procedimiento de abajo)

- **El motor de cálculo** (`src/engine/calc.ts`, `presets.ts`, `types.ts`): ninguna
  fórmula, coeficiente, constante ni valor se modifica **sin** seguir el procedimiento de
  cambio (ver abajo y [CHANGE_POLICY.md](CHANGE_POLICY.md)).
- **La arquitectura general**: fronteras motor / UI / persistencia, los puertos, el flujo
  de datos. Nada de refactors estructurales.
- **La UI y el comportamiento**: pantallas, flujos, textos, formato de datos persistidos
  (claves de `localStorage`).
- **Las funcionalidades**: no se agregan nuevas en esta etapa.

## Qué PUEDE modificarse durante la auditoría

- **`src/engine/__tests__/excel-fixtures.ts`**: agregar casos de validación (un caso por
  categoría/rama) con los valores esperados extraídos del Excel.
- **`src/engine/calc.ts`**: ajustar una fórmula **solo** cuando la auditoría demuestre una
  diferencia real contra el Excel, y siguiendo el procedimiento (abajo).
- **`docs/excel-audit/`**: registrar comparaciones, diferencias y decisiones.
- **`docs/` y `CHANGELOG.md`**: documentar lo que la auditoría descubra/resuelva.
- **Las dudas ya marcadas con `TODO(excel)`** en el código (ver
  [excel-audit/mapeo-celdas.md](excel-audit/mapeo-celdas.md)).

## Qué NO debe modificarse durante la auditoría

- El motor **por suposición o "prolijidad"**: solo se cambia con evidencia del Excel.
- La UI, las funcionalidades, la arquitectura, los formatos persistidos.
- Optimizaciones de rendimiento o refactors generales (quedan para una etapa posterior;
  ver la deuda diferida en [production-review.md](production-review.md)).

## Procedimiento correcto para cualquier cambio del motor

Resumen (el detalle y los criterios están en [CHANGE_POLICY.md](CHANGE_POLICY.md)):

1. **Reproducir** la diferencia: cargar el caso del Excel en `excel-fixtures.ts` y correr
   `npm test` / `npm run validate` para ver el valor de la app vs. el esperado.
2. **Diagnosticar** la causa raíz (qué celda/fórmula difiere y por qué).
3. **Decidir** si corresponde ajustar la app o el Excel de referencia
   (ver criterios en CHANGE_POLICY).
4. **Documentar** la diferencia y la decisión en `docs/excel-audit/` (usar la plantilla).
5. **Aplicar** el cambio con los **tests como red** (deben seguir verdes; los 18 valores
   base no deben romperse salvo decisión explícita y documentada).
6. **Registrar** en `CHANGELOG.md` y, si la decisión es estructural o de criterio, crear un
   **ADR**.
7. **Un cambio por commit**, con mensaje que cite la celda/caso y la justificación.

## Estado de verificación de la baseline

Al congelar RC1, todo lo siguiente estaba en verde (reproducible con
[RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md)):

`npm run lint` · `npm run typecheck` · `npm test` · `npm run validate` (18/18) ·
`npm run build` · `npm run package`.

## Mapa de documentación

- [vision.md](vision.md) — propósito, alcance, principios.
- [architecture.md](architecture.md) — arquitectura y fronteras (congeladas).
- [adr/](adr/) — decisiones de arquitectura (registros **inmutables**).
- [distribucion.md](distribucion.md) — formatos de entrega.
- [v1-backlog.md](v1-backlog.md) — backlog de la v1 (qué se hizo / difirió).
- [production-review.md](production-review.md) — revisión de candidato a producción.
- [excel-audit/](excel-audit/) — infraestructura de la auditoría pendiente.
- [CHANGE_POLICY.md](CHANGE_POLICY.md) — política de cambios durante la auditoría.
- [usuario/](usuario/) — manual para usuarios finales.
