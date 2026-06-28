# 0002 — Abstracción de persistencia (puerto `EscenarioRepository`)

- **Estado:** Aceptado (2026-06-28)
- **Relacionado con:** [ADR-0001](./0001-client-side-first.md) (client-side first).

## Contexto

Hoy el acceso a `localStorage` vive directo en `src/utils/scenarios.ts` (funciones
`listarEscenarios` / `guardarEscenario` / `eliminarEscenario`), consumido únicamente por
`src/components/Modales.tsx`. La encapsulación ya es razonable, pero la dependencia de
`localStorage` es **implícita y concreta**.

El camino de migración de [ADR-0001](./0001-client-side-first.md) exige que, el día que
exista un backend, podamos cambiar la implementación de persistencia **sin reescribir la
UI ni el motor**. Para eso, la app debe depender de una **abstracción**, no de
`localStorage`. Objetivo de este refactor: **desacoplar sin cambiar comportamiento ni
formato de datos**.

## Decisión

Introducir un **puerto de dominio** `EscenarioRepository` (patrón ports & adapters):

```ts
interface EscenarioRepository {
  listar(): Escenario[]
  guardar(nombre: string, inputs: Inputs): Escenario
  eliminar(id: string): void
}
```

con un **adapter** `createLocalStorageEscenarioRepository(storage)` como única
implementación, y un **composition root** (`src/persistence/index.ts`) que expone un
singleton `escenarioRepository` tipado como el puerto. La UI depende del puerto; el
adapter es el **único** código que toca `localStorage`.

## Decisiones de diseño y trade-offs

1. **Puerto de dominio vs. `Storage` key-value de bajo nivel.**
   Elegido: puerto de dominio (`listar/guardar/eliminar` de escenarios). Un `Storage`
   genérico `get/set/remove(key)` modela la *forma de localStorage*, pero el destino de
   migración es una **API de backend** (entidades y operaciones), no un almacén
   clave-valor. El puerto de dominio es el **seam correcto** para ese futuro. Costo: el
   puerto es específico de escenarios, no reutilizable para "cualquier dato" — pero eso
   es justo lo que se necesita hoy (YAGNI sobre un KV genérico).

2. **Puerto síncrono vs. asíncrono.**
   Elegido: **síncrono**. `localStorage` es síncrono; volver el puerto asíncrono hoy
   obligaría a estados de carga y manejo de re-render en la UI (un **cambio de
   comportamiento** y de complejidad) para una necesidad que **aún no existe**. Un
   backend **sí** requerirá un puerto asíncrono; esa será una **migración deliberada y
   futura** (cuando exista el backend), localizada al puerto y a sus llamadores, con su
   propio ADR. Preferimos **menor complejidad ahora** sobre anticipar (principio del
   proyecto). Trade-off documentado: la transición sync→async es trabajo futuro conocido.

3. **Composition root (singleton) vs. inyección de dependencias (React context).**
   Elegido: singleton de módulo (`escenarioRepository`) como raíz de composición. DI por
   context sería más "puro", pero agrega plumbing sin beneficio actual (una sola
   implementación, un solo consumidor). Cambiar de implementación es **una línea** en
   `index.ts`. Costo: el consumidor (Modales) queda acoplado al singleton; aceptable
   porque el **adapter** es testeable de forma aislada (ver punto 4) y hay un único
   consumidor.

4. **El adapter depende de la interfaz DOM `Storage` (inyectable), no de
   `window.localStorage` global.**
   `createLocalStorageEscenarioRepository(storage: Storage = window.localStorage)`. Esto
   permite **tests unitarios** con un `Storage` falso y evita el binding duro al global.

5. **Nombre `EscenarioRepository`, no `Storage`.**
   El proyecto se refirió a la abstracción como "Storage", pero ese nombre **colisiona
   con el tipo global `Storage`** del DOM. Se usa el término de dominio
   `EscenarioRepository` (repositorio), que además comunica mejor el rol.

## Consecuencias

### Positivas
- `localStorage` queda aislado en **un único adapter**; el resto de la app depende de la
  interfaz.
- Migrar a backend = **nuevo adapter** del puerto, sin tocar UI ni motor.
- Persistencia **testeable** (Storage inyectable).
- Frontera explícita y documentada (`src/persistence/`).

### Negativas (asumidas)
- Algo más de indirección (3 archivos en `src/persistence/` vs. 1 en `utils/`).
- El puerto síncrono necesitará una **migración a asíncrono** para el backend (conocida
  y documentada; no se paga su costo hasta que haga falta).

### Neutralidad de comportamiento
- **Sin cambio de comportamiento ni de formato de datos:** misma clave
  (`ganadero_escenarios_v1`), misma forma de `Escenario`, misma generación de `id` y
  `fecha`. Verificado por browser-bench (guardar → recargar → persiste; `localStorage`
  restaurado).

## Alternativas consideradas

- **`Storage` key-value de bajo nivel** — seam equivocado para migrar a una API (ver
  decisión 1).
- **Puerto asíncrono desde ya** — complejidad y cambio de comportamiento prematuros
  (decisión 2).
- **DI por React context** — plumbing sin beneficio actual (decisión 3).
- **Dejar `localStorage` directo** — descartada: bloquea el objetivo de migración de
  ADR-0001.
