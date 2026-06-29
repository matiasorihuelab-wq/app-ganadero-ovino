# Backlog v1 — funcionalidad pendiente

> Resultado de la auditoría de completitud (4 lentes + síntesis + verificación
> adversarial). Todos los ítems fueron **confirmados contra el código**. Estrategia
> de etapa: ver [[v1-excel-fidelity-strategy]] / `docs/vision.md`.
>
> **Regla:** no se modifica ninguna fórmula del motor ante una duda de fidelidad con
> el Excel; esas dudas quedan como `TODO(excel)` en el código y en el Balde 2. La
> validación fina contra el Excel definitivo es una etapa posterior.

Estado: `[ ]` pendiente · `[x]` hecho · `[~]` parcial/diferido.

## 🟢 Balde 1 — Construible sin el Excel (foco de esta etapa)

| ID | Pendiente | Req. v1 | Costo | Estado |
|----|-----------|---------|-------|--------|
| V1-07 | Exponer en el form los 4 inputs que el motor usa pero quedan fijos al preset (`pesoDosisAdulto/Cordero/Recria`, `relacionCarnerosStock`) | Sí | Bajo | [x] |
| M3 | Autoguardar el borrador actual y restaurarlo al recargar | Sí | Medio | [x] |
| V1-09 | Ampliar validaciones (precioDolar=0, rendimiento=0, superficie=0, señalada=0, salario con trabajadores>0) | Sí | Bajo | [x] |
| M7 | Rechazar valores negativos en los campos numéricos (sin `min`/clamp hoy) | Sí | Bajo | [x] |
| V1-14 | Mostrar `ingresoCapital` (C70) en Indicadores + CSV (ya se calcula) | Sí | Bajo | [x] |
| V1-11 | Botón eliminar fila en la tabla de medicamentos | Sí | Bajo | [x] |
| V1-12 | Confirmar "Cargar ejemplo" antes de sobrescribir | Probable | Bajo | [x] |
| V1-10 | Mostrar avisos de validación en las 3 pestañas (hoy solo Dashboard) | Probable | Bajo | [x] |
| V1-08 | Hoja de estilo `@media print` para el reporte PDF (hoy imprime la UI viva) | Probable | Medio | [ ] |
| V1-13 | Comparar: mostrar kg/animales con unidad, no como `$` | Probable | Bajo | [ ] |
| V1-15 | Mostrar `lanaPorCab` (C47) como KPI en el dashboard | Opcional | Bajo | [ ] |
| V1-16 | Columnas de costo por categoría (esquila/alim/carnero) en la tabla de detalle | Opcional | Bajo | [ ] |
| V1-20 | Timeline: usar cantidades del motor (`r.filas`) para la etiqueta de animales | Opcional | Bajo | [ ] |
| V1-21 | Quitar línea muerta `cSanidad += 0` en timeline | Opcional | Bajo | [ ] |
| V1-22 | Unificar formato de micras 0 (CSV vs dashboard) | Opcional | Bajo | [ ] |
| V1-17 | NEB: decidir si persiste (mover a Inputs) o documentarlo como calculadora efímera | Opcional | Medio | [ ] |
| V1-18 | NEB: agregar columna `+Condición` que falta para que las componentes sumen el total | Opcional | Bajo | [ ] |
| V1-19 | NEB: badge "estimación no validada contra el Excel" | Opcional | Bajo | [ ] |
| V1-23 | Campo huérfano `Medicamento.frecuencia`: exponer o eliminar | Opcional | Bajo | [ ] |
| V1-24 | Comparar dos escenarios guardados entre sí + aviso A==B | Opcional | Medio | [ ] |
| V1-25 | CSV: incluir Timeline, NEB y metadatos de cabecera (fecha, raza, ratios /ha /UG) | Opcional | Medio | [ ] |
| M5 | Identidad de versión del modelo (trazar la app a una revisión del Excel) | Probable | Bajo | [ ] |
| M8 | Verificar/documentar `build:single` + íconos + PWA (empaquetado de la v1) | Probable | Bajo | [ ] |

## 🔴 Balde 2 — Requiere el Excel definitivo (etapa posterior — solo `TODO(excel)` por ahora)

| ID | Duda de fidelidad | Acción ahora |
|----|-------------------|--------------|
| V1-01 | Versionar el Excel en el repo + trazar los 18 targets a celdas | `TODO`: estructura de tests lista para enchufar |
| V1-02 | Validar las 6 categorías de venta + rama de alimentación (hoy solo 'Cord Dest') | `TODO`: casos QA a agregar con el Excel |
| **M4** | ⚠️ Mezcla de monedas en renta/contribución (posible ~39×) — `calc.ts:278-282` | `TODO(excel)` en el código, **no tocar** |
| **M6** | ⚠️ El preset "vacío" trae `rentaHa=60`/`contribucionHa=8` no-cero — `presets.ts:79-80` | `TODO(excel)`, **decisión de producto pendiente** |
| V1-03 | Umbral de gestantes `AD3 = B4>0.85` (marcado "aprox.") — `calc.ts:176` | `TODO(excel)` |
| V1-04 | Pesos de venta/UG y precios de carne hardcodeados — `calc.ts:113,228-232` | `TODO(excel)` |
| V1-05 | Renta P22, curva V4, premio por certificación sin validar | `TODO(excel)` |
| V1-06 | `costoVerdeoHa` simplificado vs. estructura AO15..AO24 — `types.ts:94` | `TODO(excel)` |
| M2 | ¿`señalada` (B4) es % o "corderos/oveja" (puede ser >1)? | `TODO(excel)` |

## 🔵 Balde 3 — Tests del motor (preparar infraestructura ahora)

| ID | Pendiente | Estado |
|----|-----------|--------|
| M1 | Suite de tests del motor (Vitest): runner + casos + CI. Empezar envolviendo los 18 valores actuales de 'Cord Dest' y dejar la estructura lista para sumar casos por categoría cuando llegue el Excel. | [x] |

> Balde 2: todas las dudas de fidelidad tienen su `TODO(excel)` en el código
> (commit `docs(engine): flag Excel-fidelity doubts`). No se tocó ninguna fórmula.

## Confirmado YA completo (no re-trabajar)

- El motor coincide con el Excel para 'Cord Dest' (18/18 en `validate.ts`, <1e-6).
- Todos los Inputs que el motor usa están en el Formulario **salvo** los de V1-07.
- La vista Energético **sí** permite editar los 9 coeficientes de NEB (no usa solo defaults).
- El CSV ya exporta `lanaPorCab` y `costoEsquila`/cab (aunque el dashboard no los muestre).
- "Limpiar" ya pide confirmación; raza/nombrePredio se exponen y exportan bien.
