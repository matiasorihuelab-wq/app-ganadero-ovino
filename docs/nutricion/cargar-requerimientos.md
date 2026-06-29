# Cómo cargar los requerimientos oficiales

> En esta etapa solo está la **infraestructura**: las tablas están **vacías a
> propósito**. Esta guía explica cómo cargar los datos oficiales cuando se incorporen.

## Dónde van los datos

En `src/nutrition/requirements/nrc-provider.ts`, en la constante **`TABLA_NRC`**. Cada
fila es el requerimiento para una **categoría + estado fisiológico + rango de peso vivo**
y, *cuando corresponda*, un **nivel productivo**:

```ts
{
  categoria: 'ovejas',
  estado: 'gestacion_final',
  // nivelProductivo: 'mellizos',   // solo si el estado lo requiere
  pesoMinKg: 50,
  pesoMaxKg: 60,
  requerimiento: {
    fuente: 'NRC 2007, Small Ruminants, Tabla XX-X',  // OBLIGATORIA
    valores: [
      { nutriente: 'em',        valor: 0, unidad: 'Mcal EM/día' },
      { nutriente: 'proteina',  valor: 0, unidad: 'g/día' },
      { nutriente: 'consumoMs', valor: 0, unidad: 'kg MS/día' },
      { nutriente: 'calcio',    valor: 0, unidad: 'g/día' },
      { nutriente: 'fosforo',   valor: 0, unidad: 'g/día' },
      // … los nutrientes que publique la tabla
    ],
  },
}
```

### Reglas

- **Toda fila lleva `fuente`** con la referencia bibliográfica exacta (sistema, año,
  tabla/página). Sin fuente, el dato no se carga.
- Los `nutriente` deben existir en el catálogo `src/nutrition/nutrientes.ts`. Para un
  nutriente nuevo, agregarlo primero allí (un id + su definición).
- Las categorías, estados y niveles productivos deben existir en
  `src/nutrition/requirements/categorias.ts` (mismos `id`).
- Tabular por **rango de peso** (como las tablas NRC). El provider elige la fila cuyo
  rango contiene el peso vivo, y cuyo `nivelProductivo` coincide (o no aplica).
- **No** copiar tablas sin permiso ni usar datos sin referencia.

## Pasos

1. Conseguir la tabla oficial (p. ej. *NRC, Nutrient Requirements of Small Ruminants,
   2007*) en formato citable.
2. Si hace falta, agregar nutrientes al catálogo (`nutrientes.ts`) y/o estados/niveles
   (`categorias.ts`).
3. Cargar las filas en `TABLA_NRC` con su `fuente`.
4. Agregar un caso de test representativo en
   `src/nutrition/requirements/provider.test.ts`.
5. `npm run lint && npm run typecheck && npm test && npm run build`.

## Actualizar a una versión nueva del NRC (u otro sistema)

- **Misma fuente, valores nuevos:** actualizar las filas de `TABLA_NRC` y la `fuente`
  (año/edición). Registrar el cambio en `CHANGELOG.md`.
- **Otro sistema** (INRA / AFRC / CSIRO): crear un provider nuevo
  (`createINRAProvider()`, etc.) que implemente `NutrientRequirementProvider`, con su
  propia tabla y referencias; cambiar la línea del composition root en
  `src/nutrition/requirements/index.ts`. **No se toca la UI.**
- Si conviene elegir el sistema en tiempo de ejecución, exponer varios providers y
  seleccionar uno; la interfaz `NutrientRequirementProvider` ya lo permite.

## Qué NO hacer en esta etapa

- No cargar valores todavía (solo infraestructura).
- No descargar datos de internet ni copiar tablas.
- No usar datos sin referencia bibliográfica.
