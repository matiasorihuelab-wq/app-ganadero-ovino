# Módulo de Requerimientos Nutricionales

> Reemplaza al antiguo "Análisis Energético (NEB)". Cambio **conceptual**, no un
> arreglo de software. El motor económico permanece **congelado** (RC1); este cambio es
> exclusivo del módulo nutricional.

## Por qué se eliminó el modelo energético anterior

La implementación anterior desarrolló un **modelo energético propio**: mantenimiento por
`PV^0,75`, coeficientes editables, ajuste por frío, temperatura ambiental y crítica,
condición corporal objetivo y ganancia diaria esperada. Aunque era correcto como
software, **no representaba el objetivo científico del proyecto**: convertía a la app en
un **simulador metabólico** con ecuaciones propias.

El objetivo del proyecto no es construir un modelo propio, sino una **herramienta de
consulta** de información técnica **oficial y auditable**.

## Por qué se usan tablas oficiales

La app debe responder una sola pregunta:

> *"¿Cuántos kg de materia seca necesita consumir diariamente este rodeo según los
> requerimientos nutricionales oficiales?"*

No estima, no modela, no ajusta, no inventa ecuaciones: **consulta tablas técnicas**
(NRC y, en el futuro, INRA / AFRC / CSIRO). Cada valor tiene **referencia bibliográfica**.

### Ventajas del nuevo enfoque

- **Auditable y trazable:** cada número proviene de una fuente citada, no de una ecuación
  propia. Apto para decisiones técnicas y para revisión científica.
- **Simple:** la interfaz pide solo lo necesario (categoría, estado, peso, cantidad) y
  consulta; sin parámetros que el usuario deba calibrar.
- **Intercambiable:** soportar otro sistema (INRA, AFRC, CSIRO) es agregar un provider,
  sin tocar la interfaz ni el cálculo.
- **Defendible:** "lo dice el NRC" es más sólido que "lo estima nuestro modelo".

## Arquitectura (Requirement Provider)

La UI **nunca** conoce de dónde vienen los datos. Habla con un puerto.

```
UI (components/Nutricion.tsx)
   ↓ usa
nutrition/calcular.ts            (cálculo puro: consulta + balance, sin modelar)
   ↓ consulta
NutrientRequirementProvider      (puerto, nutrition/requirements/types.ts)
   ↓ implementado por
NRCProvider                      (nutrition/requirements/nrc-provider.ts)
   ↓ lee
TABLA_NRC                        (datos oficiales — hoy VACÍA, solo estructura)
```

Archivos:
- `src/nutrition/requirements/types.ts` — tipos de dominio y la interfaz
  `NutrientRequirementProvider`.
- `src/nutrition/requirements/categorias.ts` — catálogo de categorías y estados
  fisiológicos (taxonomía, ampliable).
- `src/nutrition/requirements/nrc-provider.ts` — provider NRC (estructura de tabla,
  **sin datos** todavía).
- `src/nutrition/requirements/index.ts` — composition root: el provider activo.
- `src/nutrition/calcular.ts` — cálculo puro (consulta + balance contra el forraje).
- `src/components/Nutricion.tsx` — la interfaz.

**Para cambiar de sistema de referencia** (INRA, AFRC, CSIRO): crear
`createINRAProvider()` (etc.) implementando `NutrientRequirementProvider` y cambiar la
única línea de `nutrition/requirements/index.ts`. La UI y el cálculo no cambian.

## Integración con el análisis del forraje

El cálculo combina el requerimiento (del provider) con la **EM del forraje**:

```
necesidad   = EM requerida/animal × cantidad
kg MS req.  = necesidad / EM del forraje
oferta      = consumo esperado/animal × EM forraje × cantidad
balance     = oferta − necesidad
```

> **Nota (estado del proyecto):** al hacer este cambio **no existía** en la app un
> análisis químico del forraje compartido (EM/PB/FDN/FDA). Por eso el módulo recoge esos
> valores en su propia sección "Análisis del forraje", **detrás del mismo seam** de datos.
> Si más adelante se incorpora un análisis de forraje a nivel app, el módulo lo consume
> desde ahí **sin duplicar** ni cambiar la UI. Hoy el cálculo usa solo **EM**; PB/FDN/FDA
> se recogen como estructura para ampliaciones futuras.

## Cómo incorporar las tablas y actualizar versiones

Ver [cargar-requerimientos.md](cargar-requerimientos.md).
