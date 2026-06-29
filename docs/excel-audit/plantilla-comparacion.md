# Plantilla de comparación — Caso: «____»

> Copiá este archivo por cada caso de [casos-de-validacion.md](casos-de-validacion.md)
> (p. ej. `comparacion-cord-pz.md`) y completalo durante la auditoría.

## Identificación

- **Caso / categoría de venta:**
- **Qué rama ejercita:** (alimentación / renta / certificación / etc.)
- **Excel de referencia:** archivo y hoja · versión/fecha
- **Inputs usados:** (pegar el escenario o describir los campos no triviales)

## Comparación valor por valor

| Campo (`Resultados`) | Celda | Esperado (Excel) | Obtenido (app) | Δ | ¿Coincide (<1e-6)? | Nota |
|----------------------|-------|------------------|----------------|---|:------------------:|------|
| ingresoLana | C39 | | | | | |
| ingresoCarne | C41 | | | | | |
| ingresoBruto | C57 | | | | | |
| totalLanaKg | C45 | | | | | |
| totalCarneKg | C46 | | | | | |
| micronajePonderado | C48 | | | | | |
| costoSanidadTotal | P13 | | | | | |
| costoEsquilaTotal | Q13 | | | | | |
| costoAlimTotal | R13 | | | | | |
| costoCarnerosTotal | S13 | | | | | |
| costosDirectosTotal | P25 | | | | | |
| manoDeObra | P21 | | | | | |
| renta | P22 | | | | | |
| contribucion | P23 | | | | | |
| costosFijosTotal | P26 | | | | | |
| margenBruto | C64 | | | | | |
| margenNeto | C72 | | | | | |
| totalUG | G35 | | | | | |
| dotacionOvinos | C52 | | | | | |
| totalAnimales | C35 | | | | | |
| precioLanaUSD | V4 | | | | | |
| ingresoCapital | C70 | | | | | |

*(Agregar filas según el caso.)*

## Diferencias encontradas y decisión

| Campo / celda | Diferencia | Causa probable | Acción (ajustar app / ajustar Excel / documentar) | Estado |
|---------------|-----------|----------------|---------------------------------------------------|--------|
| | | | | |

## Cierre

- [ ] Valores esperados cargados como caso en `excel-fixtures.ts`.
- [ ] `npm test` / `npm run validate` en verde para este caso.
- [ ] Diferencias resueltas o documentadas.
