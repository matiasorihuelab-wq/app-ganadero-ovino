# Cómo cargar los requerimientos oficiales

> En esta etapa solo está la **infraestructura**: las tablas están **vacías a
> propósito**. Esta guía explica cómo cargar los datos oficiales cuando se incorporen.

## Dónde van los datos

En `src/nutrition/requirements/nrc-provider.ts`, en la constante **`TABLA_NRC`**. Cada
fila es un requerimiento para una **categoría + estado fisiológico + rango de peso vivo**:

```ts
{
  categoria: 'ovejas',
  estado: 'ultimo_tercio',
  pesoMinKg: 60,
  pesoMaxKg: 70,
  requerimiento: {
    emMcalDia: 0,          // Mcal EM / animal / día (requerimiento energético)
    consumoMsKgDia: 0,     // kg MS / animal / día (consumo esperado)
    proteinaGDia: 0,       // g de proteína / día (opcional, ampliación)
    fuente: 'NRC 2007, Small Ruminants, Tabla XX-X',  // OBLIGATORIA
  },
}
```

### Reglas

- **Toda fila lleva `fuente`** con la referencia bibliográfica exacta (sistema, año,
  tabla/página). Sin fuente, el dato no se carga.
- Las categorías y estados deben existir en
  `src/nutrition/requirements/categorias.ts` (mismos `id`). Para una categoría/estado
  nuevo, agregarlo allí primero.
- Tabular por **rango de peso** (como las tablas NRC). El provider elige la fila cuyo
  rango contiene el peso vivo ingresado.
- **No** copiar tablas sin permiso ni usar datos sin referencia.

## Pasos

1. Conseguir la tabla oficial (p. ej. *NRC, Nutrient Requirements of Small Ruminants,
   2007*) en formato citable.
2. Cargar las filas en `TABLA_NRC` con su `fuente`.
3. Agregar/ajustar categorías y estados en `categorias.ts` si hace falta.
4. Verificar con tests (idealmente, un caso por categoría/estado representativo en
   `src/nutrition/calcular.test.ts`).
5. `npm run lint && npm run typecheck && npm test && npm run build`.

## Actualizar a una versión nueva del NRC (u otro sistema)

- **Misma fuente, valores nuevos:** actualizar las filas de `TABLA_NRC` y la `fuente`
  (año/edición). Registrar el cambio en `CHANGELOG.md`.
- **Otro sistema** (INRA / AFRC / CSIRO): crear un provider nuevo
  (`createINRAProvider()`, etc.) que implemente `NutrientRequirementProvider`, con su
  propia tabla y referencias; cambiar la línea del composition root en
  `src/nutrition/requirements/index.ts`. **No se toca la UI ni el cálculo.**
- Si conviene elegir el sistema en tiempo de ejecución, exponer varios providers y
  seleccionar uno; la interfaz `NutrientRequirementProvider` ya lo permite.

## Qué NO hacer en esta etapa

- No cargar valores todavía (solo infraestructura).
- No descargar datos de internet ni copiar tablas.
- No usar datos sin referencia bibliográfica.
