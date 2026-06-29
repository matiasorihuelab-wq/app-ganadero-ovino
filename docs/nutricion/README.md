# Módulo de Requerimientos Nutricionales

> Reemplaza al antiguo "Análisis Energético (NEB)". La app **no calcula** requerimientos:
> los **consulta** desde tablas oficiales. El motor económico permanece **congelado**;
> este módulo es independiente y aislado.

## Objetivo

Que la aplicación pueda responder, **consultando tablas oficiales** (NRC inicialmente; en
el futuro INRA, AFRC, CSIRO…), preguntas como:

> *"Una oveja de 55 kg en gestación final necesita: tanta energía metabolizable, tanta
> proteína, tanto consumo esperado, tanto calcio, tanto fósforo, etc."*

Esos valores provienen del **NRC, no del código**. No hay modelo propio, ni coeficientes
inventados, ni simulación fisiológica.

## Principio

- La app **consulta** requerimientos oficiales.
- Después (etapa futura) los **compara** contra la **oferta** del forraje (análisis
  químico) y genera el **balance** (energía, proteína, minerales; deficiencias, excesos,
  nutrientes limitantes, recomendaciones).

## El requerimiento depende de varias variables

No solo del peso vivo. Depende de:

- **categoría** (Ovejas, Borregas, Carneros)
- **estado fisiológico** (gestación, lactancia, servicio, mantenimiento…)
- **peso vivo**
- **nivel productivo**, *cuando corresponda* (p. ej. nivel de producción de leche)

Cada combinación consulta su fila en la tabla oficial. **Nunca se calcula.**

## Arquitectura (Providers)

La UI nunca conoce la fuente de los datos. Habla con un puerto.

```
UI (components/Nutricion.tsx)
   ↓ consulta
NutrientRequirementProvider        (puerto — requirements/types.ts)
   ↓ implementado por
NRCProvider                        (requirements/nrc-provider.ts)   ← hoy
INRAProvider / AFRCProvider / …    (futuro, misma interfaz)
   ↓ lee
TABLA_NRC                          (datos oficiales — hoy VACÍA, solo estructura)
```

Cambiar de sistema de referencia = un provider nuevo + cambiar **una línea** del
composition root (`requirements/index.ts`). La UI no cambia.

### Modelo de datos

Todo se apoya en un **catálogo de nutrientes compartido y ampliable**
(`src/nutrition/nutrientes.ts`): EM, proteína, consumo, calcio, fósforo, magnesio,
potasio, sodio, azufre, cobre, zinc, manganeso, hierro, molibdeno, selenio, cobalto,
vitaminas A/D/E… Agregar un nutriente es sumar un id al catálogo; ni la UI ni los
providers cambian. Un requerimiento es una lista de `ValorNutriente` + su `fuente`.

### Estructura de archivos

```
src/nutrition/
  nutrientes.ts                 # catálogo de nutrientes (compartido, ampliable)
  requirements/
    types.ts                    # Categoria, EstadoFisiologico, NivelProductivo,
                                 #   Consulta, Requerimiento, NutrientRequirementProvider
    categorias.ts               # taxonomía: categorías + estados fisiológicos
    nrc-provider.ts             # NRCProvider (estructura de tabla, SIN datos todavía)
    index.ts                    # composition root: provider activo
    provider.test.ts            # tests de arquitectura
  forraje/
    types.ts                    # AnalisisForraje (OFERTA) — FUTURO, solo contrato
  balance/
    types.ts                    # BalanceNutricional + ComparadorNutricional — FUTURO, solo contrato
src/components/Nutricion.tsx    # UI de consulta
```

## Flujo

```
Usuario elige categoría → estado fisiológico → (nivel productivo si corresponde) → peso vivo
   ↓
La UI consulta el Provider
   ↓
El Provider busca en la tabla oficial la fila correspondiente
   ↓
Devuelve el requerimiento multi-nutriente (o null si aún no hay dato)
   ↓
La UI lo muestra, citando la fuente
```

## Integración futura con el análisis químico del forraje

El **análisis químico de la pastura** (oferta nutricional) será un módulo aparte que
cargará MS, PB, FDN, FDA, EM, digestibilidad, minerales (Ca, P, Mg, K, Na, S, Cu, Zn, Mn,
Fe, Mo, Se, Co), vitaminas (A, D, E)… usando el **mismo catálogo de nutrientes**. Su
contrato de datos ya existe (`forraje/types.ts`), **sin desarrollarse todavía**.

## Integración futura con el balance y la suplementación

Con la oferta (forraje) y el requerimiento (tabla), un **comparador** producirá el
**balance** por nutriente (déficit / adecuado / exceso), los **nutrientes limitantes** y
las **recomendaciones** (incluida la futura **suplementación**). El contrato ya existe
(`balance/types.ts`), **sin lógica todavía** (no hay fórmulas propias: el balance es una
comparación directa oferta vs requerimiento).

## Estado actual

- ✅ Arquitectura, tipos, interfaces, modelo de datos y UI de consulta: **listos**.
- ⏳ Tablas oficiales (NRC): **no cargadas** todavía → ver
  [cargar-requerimientos.md](cargar-requerimientos.md).
- ⏳ Análisis químico del forraje y balance: **solo contratos** (a desarrollar).
