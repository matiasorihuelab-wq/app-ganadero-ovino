# Casos de validación

Lista de escenarios que la auditoría debe comparar contra el Excel. Hoy solo está
cubierto el caso 1 (`Cord Dest`, 18 valores). El resto está **pendiente**: cada uno se
agregará como un caso en `src/engine/__tests__/excel-fixtures.ts` con sus valores
esperados extraídos del Excel.

Marcá el estado: `[ ]` pendiente · `[x]` validado · `[~]` con diferencias a resolver.

## Por categoría de venta (rama del `switch` de `calc.ts`)

El preset de ejemplo usa `Cord Dest`; las otras 5 categorías **no están validadas** y
ejercitan ramas distintas de cantidades, pesos, precios e ingresos de carne.

- [x] **Cord Dest** — Cordero al destete (caso base actual, 18 valores).
- [ ] **Cord Pz** — Cordero pesado.
- [ ] **Cord Pes** — Cordero pesado (alternativo).
- [ ] **Bgos 4D** — Borrego 2-4 dientes.
- [ ] **Cap 6/8D** — Capón 6/8 dientes.
- [ ] **Cap 8D** — Capón 8+ dientes.

## Por rama de cálculo no ejercitada en el preset

El preset deja varias ramas en 0 o sin activar; hay que validarlas con datos que las
ejerciten:

- [ ] **Alimentación (R13) > 0** — con `Suplemento sobre CN` y con `Verdeos` activos
  (hoy el preset usa `Campo Natural` → R13 = 0). Cubre `AK19`, `AO24` y la condición
  `AD3` de gestantes.
- [ ] **Renta (P22) > 0** — con `supArrendada > 0` (hoy 0 → renta nunca se ejercita).
  **Verificar acá la duda de monedas** (ver [mapeo-celdas.md](mapeo-celdas.md), M4).
- [ ] **Certificación** — con `certificacion = true` (cubre el premio `L13`).
- [ ] **Precio de lana modo "últimos 3"** — cubre la curva `polyUlt3` (hoy se usa
  "últimos 2").
- [ ] **Señalada alta (> 0.85)** — activa `AD3` (suplementación de gestantes); además
  **resolver la escala % vs ratio** (M2).

## Plantilla por caso

Para cada caso, registrar en una copia de [plantilla-comparacion.md](plantilla-comparacion.md):
inputs usados, valores esperados (del Excel, con su celda), valores de la app, y el
resultado (coincide / diferencia / acción).
