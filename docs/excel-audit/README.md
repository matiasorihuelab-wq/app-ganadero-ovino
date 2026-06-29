# Auditoría de fidelidad con el Excel

> **Estructura preparada, auditoría aún no ejecutada.** Esta carpeta deja lista la
> infraestructura documental para comparar, fórmula por fórmula y valor por valor, el
> motor de cálculo de la app contra el **Excel de referencia** (la fuente de verdad del
> modelo). La auditoría arranca cuando esté disponible el Excel definitivo.

## Objetivo

Confirmar que la app **reproduce exactamente** el Excel para **todas** las categorías de
venta y ramas del modelo, no solo el preset hoy validado (`Cord Dest`). Donde haya
diferencias, decidir si se ajusta la app o el Excel, y dejar registro.

## Estado actual (punto de partida)

- El motor coincide con el Excel en **18 valores** para el escenario `Cord Dest`
  (`npm run validate`, < 1e-6). Esos valores viven en
  `src/engine/__tests__/excel-fixtures.ts` (fuente única, usada por la suite y por
  `validate.ts`).
- Hay **dudas de fidelidad ya identificadas y marcadas en el código** con `TODO(excel)`
  (ver [mapeo-celdas.md](mapeo-celdas.md)). Ninguna se tocó: el motor está congelado.

## Cómo se hará (proceso, cuando empiece)

1. **Versionar el Excel** en [`referencia/`](referencia/) (repo privado).
2. **Extraer los valores esperados por celda** del Excel (idealmente con un script, no a
   mano) para cada [caso de validación](casos-de-validacion.md), y cargarlos como nuevos
   casos en `excel-fixtures.ts`.
3. **Correr `npm test` / `npm run validate`** y registrar cada diferencia en una copia de
   [plantilla-comparacion.md](plantilla-comparacion.md).
4. Para cada diferencia: decidir (ajustar app / ajustar Excel / documentar), aplicar el
   cambio **con los tests como red**, y volver a validar.
5. Resolver las dudas `TODO(excel)` listadas en [mapeo-celdas.md](mapeo-celdas.md).

## Archivos de esta carpeta

- [`casos-de-validacion.md`](casos-de-validacion.md) — qué escenarios/ramas hay que cubrir.
- [`mapeo-celdas.md`](mapeo-celdas.md) — correspondencia salida de la app ↔ celda del
  Excel, y las dudas `TODO(excel)` abiertas.
- [`plantilla-comparacion.md`](plantilla-comparacion.md) — plantilla para registrar la
  comparación de cada caso.
- [`referencia/`](referencia/) — acá va el Excel de referencia (todavía no incorporado).

## Regla durante la beta

Hasta que empiece esta auditoría, **no se modifica ninguna fórmula del motor**. Las
dudas se documentan, no se "corrigen" por suposición.
