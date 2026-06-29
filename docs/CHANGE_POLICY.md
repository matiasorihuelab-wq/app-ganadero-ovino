# Política de cambios — etapa de auditoría del Excel

> Reglas técnicas para mantener la **trazabilidad científica** del modelo económico
> durante la auditoría de fidelidad contra el Excel oficial. Complementa
> [BASELINE_RC1.md](BASELINE_RC1.md). Aplica desde la baseline RC1 hasta el cierre de la
> auditoría.

## Principio rector

El motor de cálculo es un **artefacto científico**: cada número que produce debe poder
**justificarse y trazarse** a una celda del Excel de referencia. Por eso, durante la
auditoría **nada del motor cambia sin evidencia y sin registro**.

## Cambios PERMITIDOS

- **Agregar casos de validación** en `src/engine/__tests__/excel-fixtures.ts` (un caso por
  categoría/rama, con valores esperados extraídos del Excel).
- **Ajustar una fórmula/constante de `src/engine/calc.ts`** cuando la auditoría demuestre
  una diferencia real con el Excel, siguiendo el flujo de abajo.
- **Documentación**: `docs/excel-audit/`, `CHANGELOG.md`, ADRs.
- **Resolver un `TODO(excel)`** ya marcado en el código (ver
  [excel-audit/mapeo-celdas.md](excel-audit/mapeo-celdas.md)).
- Corregir un **error objetivo de transcripción** del modelo (p. ej. una celda mal
  copiada), documentándolo igual.

## Cambios PROHIBIDOS

- Modificar el motor **por suposición, estética o "prolijidad"** (sin evidencia del Excel).
- **Refactors** del motor (descomponer `calcular()`, renombrar variables-celda, extraer
  constantes): quedan para **después** de la auditoría (decisión registrada en
  [architecture.md](architecture.md)).
- Cambiar **UI, funcionalidades, arquitectura o formatos persistidos**.
- "Arreglar" un valor para que coincida **sin entender la causa raíz**.
- Romper los **18 valores base** ya validados sin una decisión explícita y documentada.

## Cómo documentar cada diferencia

Por cada diferencia detectada, completar una copia de
[excel-audit/plantilla-comparacion.md](excel-audit/plantilla-comparacion.md) con:

1. **Caso e inputs** usados.
2. **Celda del Excel**, valor esperado y valor de la app, y el **Δ**.
3. **Causa raíz** (qué fórmula/celda y por qué difiere).
4. **Decisión** (ver criterios abajo) y su justificación.
5. **Resultado** tras el cambio (tests/validate en verde).

## ¿Modificar el motor o el Excel de referencia?

| Situación | Acción |
|-----------|--------|
| El Excel es correcto y la app calcula distinto | **Ajustar la app** (`calc.ts`) para reproducir el Excel. |
| La app refleja una regla agronómica/económica correcta y el Excel tiene un **error** | **No tocar la app**; reportar el error del Excel y, si se corrige, **versionar el Excel nuevo** en `excel-audit/referencia/` y registrar el cambio. |
| Ambos difieren de la realidad (error compartido) | Detener, escalar la decisión al titular del proyecto; documentar antes de cambiar nada. |
| La diferencia viene de una **aproximación ya marcada** (`TODO(excel)`) | Reemplazar la aproximación por la regla real del Excel, documentando el antes/después. |

> Regla de oro: **la app se ajusta al Excel oficial**, salvo evidencia clara de que el
> Excel está equivocado. En ese caso, se cambia el Excel (no la app) y se versiona.

## ¿Cuándo crear un ADR?

Crear un nuevo [ADR](adr/) cuando la decisión:

- cambia un **criterio de modelado** (p. ej. resolver la unidad de la señalada, o la
  moneda de renta/contribución);
- introduce una **regla nueva** o cambia el significado de una salida;
- decide **corregir el Excel** en lugar de la app;
- o cualquier decisión que un mantenedor futuro necesitaría entender.

Un ajuste numérico puntual trazado en `excel-audit/` **no** requiere ADR; un cambio de
criterio, **sí**.

## Disciplina de commits

- **Un cambio (una diferencia) por commit.**
- Mensaje que **cite la celda/caso** y la justificación (p. ej.
  `fix(engine): AD3 usa la condición real del Excel (caso Cord Pz, celda ...)`).
- `npm test` / `npm run validate` **verdes** antes de commitear.
- Working tree limpio; sin cambios a medias.

## Definición de "auditoría cerrada"

La auditoría se considera completa cuando:

- Hay un caso de validación por **cada categoría de venta** y por cada rama relevante
  (alimentación, renta, certificación, modo de precios), todos en verde.
- Todos los `TODO(excel)` están **resueltos** (corregidos o confirmados como correctos).
- Cada diferencia quedó **documentada** con su decisión.
- Recién entonces se levanta el congelamiento del motor para la etapa de refactor
  (ver la decisión diferida en [architecture.md](architecture.md)).
