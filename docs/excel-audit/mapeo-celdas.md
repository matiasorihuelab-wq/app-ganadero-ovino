# Mapeo de celdas y dudas abiertas

## Salida de la app ↔ celda del Excel

Cada campo de `Resultados` (ver `src/engine/types.ts`) cita su celda del Excel. Los
**18 ya validados** (en `src/engine/__tests__/excel-fixtures.ts`) están marcados ✔.

| Campo (`Resultados`) | Celda | Validado |
|----------------------|-------|:--------:|
| `ingresoLana` | C39 | ✔ |
| `ingresoCarne` | C41 | ✔ |
| `ingresoBruto` | C57 | ✔ |
| `totalLanaKg` | C45 | ✔ |
| `totalCarneKg` | C46 | ✔ |
| `micronajePonderado` | C48 | ✔ |
| `costoSanidadTotal` | P13 | ✔ |
| `costoEsquilaTotal` | Q13 | ✔ |
| `costoAlimTotal` | R13 | ✔ (solo = 0) |
| `costoCarnerosTotal` | S13 | ✔ |
| `costosDirectosTotal` | P25 | ✔ |
| `manoDeObra` | P21 | ✔ |
| `costosFijosTotal` | P26 | ✔ |
| `margenBruto` | C64 | ✔ |
| `margenNeto` | C72 | ✔ |
| `totalUG` | G35 | ✔ |
| `dotacionOvinos` | C52 | ✔ |
| `totalAnimales` | C35 | ✔ |
| `lanaPorCab` | C47 | — |
| `precioLanaUSD` | V4 | — |
| `comisiones` / `imeba` / `inia` / `mevir` / `inac` | P16–P20 | — |
| `renta` | P22 | — (ver M4) |
| `contribucion` | P23 | — (ver M4) |
| `margenBrutoHa` / `margenNetoHa` | C65 / C73 | — |
| `ingresoCapital` | C70 | — |
| `ibUG` / `ibLanaPct` / `ibCarnePct` | C61 / C40 / C42 | — |

## Dudas de fidelidad abiertas (`TODO(excel)` en el código)

Marcadas en el código, **sin tocar**. La auditoría debe resolver cada una:

| ID | Dónde | Duda | A confirmar |
|----|-------|------|-------------|
| **M4** | `calc.ts` (P21/P22/P23) | **Mezcla de monedas:** mano de obra divide por la cotización (UYU→USD) pero renta/contribución **no**. Si en el Excel están en UYU, P22/P23 estarían inflados ~×cotización. | ¿`rentaHa`/`contribucionHa` en USD o UYU en el Excel? Validar con `supArrendada > 0`. |
| **M6** | `presets.ts` | El preset "vacío" trae `rentaHa = 60`, `contribucionHa = 8` (no 0): un predio nuevo genera renta/contribución "fantasma". | ¿Son constantes del modelo o deben arrancar en 0? |
| **V1-03** | `calc.ts` (AD3) | Umbral de suplementación de gestantes `señalada > 0.85` está marcado "aprox.". | ¿Cuál es la condición real del Excel? |
| **V1-04** | `calc.ts` | Pesos de venta/UG (`E11..E17`) hardcodeados y precios de carne derivados por coeficientes fijos (`×0.45`, `−0.5`, `+0.15`). | ¿Son celdas editables/independientes en el Excel? |
| **V1-06** | `calc.ts` / `types.ts` | `costoVerdeoHa` "simplificado" en una fórmula fija vs. la estructura `AO15..AO24` del Excel. | ¿Coincide `AO24` con un caso de verdeos activos? |
| **M2** | `Formulario.tsx` | La señalada se edita como % pero el modelo la usa como "corderos/oveja" (puede ser > 1). | ¿Unidad/escala correcta según el Excel? |

> Estas dudas también están en `docs/v1-backlog.md` (balde 2) y resumidas en
> `docs/production-review.md`.
