# Arquitectura — App Ganadero Ovino

> Describe la arquitectura **actual** y las **fronteras** (boundaries) entre sus
> partes. Las decisiones que dan forma a esta arquitectura se registran en los
> [ADR](./adr/). Este documento se actualiza cuando una frontera cambia.

## Vista general

App Ganadero Ovino es una **SPA** (Single Page Application) **client-side**, sin
backend, sin base de datos y sin autenticación. Toda la lógica corre en el navegador.

```
┌─────────────────────────────────────────────────────────────┐
│                        Navegador                             │
│                                                             │
│   UI (React)  ──usa──▶  Motor de cálculo (TS puro)          │
│      │                                                       │
│      └──usa──▶  Persistencia (interfaz)  ──▶  localStorage   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Stack: **React 18 + TypeScript + Vite**. Gráficos con Recharts. Empaquetado como SPA,
PWA instalable y archivo HTML único offline.

## Fronteras (boundaries)

La arquitectura se organiza alrededor de cuatro fronteras. Mantenerlas limpias es lo
que permite que el proyecto evolucione sin reescrituras.

### 1. Motor de cálculo — `src/engine/` (núcleo)

El **activo principal** del proyecto. TypeScript **puro**, sin ninguna dependencia de
React ni del navegador. Convierte un objeto de entrada (`Inputs`) en resultados
(`Resultados`) de forma determinística.

- `types.ts` — modelo de datos (`Inputs`, `Resultados`): el **contrato** del núcleo.
- `calc.ts` — motor principal; réplica fiel del modelo Excel (cada bloque cita su celda).
- `presets.ts` — preset vacío (genérico) y preset de ejemplo (Merino, usado por QA).
- `timeline.ts` — evolución temporal / flujo de caja mensual.
- `neb.ts` — necesidades energéticas por categoría.

**Regla dura:** el motor no conoce a la UI ni a la persistencia. Cualquier cambio que
mueva un número validado contra el Excel se verifica con `npm run validate` (18/18).

**Por qué importa:** al ser puro y aislado, el motor es testeable, portable y reusable
(p. ej. desde un backend o un script) sin arrastrar la UI. Es la pieza con mayor vida
útil esperada.

### 2. Interfaz de usuario — `src/components/`, `src/App.tsx`

Capa de presentación en React. **Depende** del motor (le pasa `Inputs`, muestra
`Resultados`), pero el motor **no depende** de ella.

- `Formulario` + `Campos` — entrada de datos.
- `Resultados` (dashboard), `Timeline` (evolución), `Neb` (energético) — visualización.
- `Modales` — guardar / cargar / comparar escenarios (consume la persistencia).
- `App.tsx` — composición y estado de UI; recalcula vía `useMemo(calcular, [inputs])`.

Utilidades de presentación en `src/utils/`: `format` (números/monedas), `validaciones`
(avisos al usuario), `exportar` (CSV/PDF).

### 3. Persistencia — escenarios del usuario

Hoy el estado de trabajo vive en memoria (React) y los **escenarios guardados** se
persisten en `localStorage` (clave `ganadero_escenarios_v1`).

**Frontera (implementada):** la persistencia está aislada detrás de un **puerto**
(interfaz) `EscenarioRepository`, con un **adapter** sobre `localStorage` como única
implementación. La UI depende de la interfaz, no de `localStorage` directamente. Ver
[ADR-0002](./adr/0002-storage-abstraction.md). Estructura en `src/persistence/`:

- `escenario-repository.ts` — el **puerto** `EscenarioRepository` (`listar` / `guardar`
  / `eliminar`) y el tipo `Escenario`.
- `local-storage-escenario-repository.ts` — el **adapter** sobre la Web Storage API;
  único código que toca `localStorage`. Recibe el `Storage` por parámetro (inyectable,
  testeable).
- `borrador-repository.ts` — segundo **puerto** `BorradorRepository` (`cargar` / `guardar`
  / `limpiar`) y su adapter, para el **borrador en curso** (autoguardado, clave
  `ganadero_borrador_v1`), independiente de los escenarios con nombre.
- `index.ts` — **composition root**: los singletons `escenarioRepository` y
  `borradorRepository` que usa la app. Migrar a otra implementación es cambiar solo acá.

**Contrato de datos:** un `Escenario` es `{ id, nombre, fecha, inputs }`. Las claves
(`ganadero_escenarios_v1`, `ganadero_borrador_v1`) y el esquema son **compatibilidad
hacia atrás**: romperlos invalidaría datos guardados. Al cargar, `sanitizeInputs()`
(en `presets.ts`) mergea sobre el preset vacío y garantiza invariantes (p. ej.
`medicamentos` array), tolerando esquemas viejos; un cambio de formato mayor requiere
una estrategia de migración y su ADR.

### 4. Futura integración con backend (no implementada)

No existe backend hoy, y es deliberado ([ADR-0001](./adr/0001-client-side-first.md)).
La frontera de persistencia (punto 3) es el **punto de extensión** previsto: el día que
exista una necesidad real (multiusuario, respaldo, multi-dispositivo, integración con
el ecosistema del SUL), se implementa un nuevo adapter del puerto `EscenarioRepository`
(p. ej. uno HTTP contra una API) **sin tocar la UI ni el motor**.

Migrar a backend implicará, además, convertir el puerto a **asíncrono** (la red lo es);
ese cambio es una migración deliberada y futura, documentada como trade-off en
[ADR-0002](./adr/0002-storage-abstraction.md). No se anticipa hoy para no agregar
complejidad (estados de carga, manejo de errores) que aún no hace falta.

## Flujo de datos

```
Usuario → Formulario → Inputs → calcular(Inputs) → Resultados → Dashboard/Charts
                          │
                          └→ EscenarioRepository.guardar() → localStorage
```

El cálculo es **síncrono y en tiempo real**: cada cambio en `Inputs` recalcula
`Resultados` vía `useMemo`. No hay efectos de red ni asincronía en el camino principal.

## Calidad y verificación

- **CI** (`.github/workflows/ci.yml`): en cada push y PR corre `lint → typecheck →
  test → build → validate`.
- **`test`** — suite Vitest del motor y sus módulos (`calc`, `timeline`, `neb`), de
  `validaciones`, de `sanitizeInputs` y de los adapters de persistencia (con un
  `Storage` en memoria, gracias a la inyección del puerto).
- **`validate`** compara el motor contra el Excel de referencia (18/18, < 1e-6).
- **Definición de "build verde":** los cinco pasos anteriores en verde.

## Limitaciones conocidas y deuda técnica

- **`calcular()` es una función monolítica (~330 líneas) con variables nombradas por
  celda del Excel (`B2`, `C23`…).** Es la mayor deuda de mantenibilidad del proyecto,
  pero su refactor (descomponer en funciones puras por bloque, extraer constantes del
  modelo) está **deliberadamente diferido**: (1) el motor está congelado hasta validar
  contra el Excel definitivo; (2) la secuencia correcta es Excel → ampliar tests a las
  6 categorías de venta → recién entonces descomponer, usando los tests como red. Hacerlo
  antes arriesgaría la fidelidad ya validada sin beneficio inmediato y habría que rehacer
  parte tras los ajustes del Excel. Decisión consciente de costo/beneficio, no omisión.
- **Vulnerabilidades dev-only en `esbuild`/`vite`** (`npm audit`: 1 moderate, 1 high).
  Afectan únicamente al **servidor de desarrollo** local, no al artefacto de producción
  (`dist/`, que no incluye Vite/esbuild). El fix obliga a **Vite 5 → 8** (cambio mayor
  con breaking changes). Se difiere a un **PR dedicado de upgrade de Vite** con su
  propia validación; no se mezcla con trabajo de fundaciones.
- **Cobertura de tests parcial.** El motor (`calc`/`timeline`/`neb`), `validaciones`,
  `sanitizeInputs` y la persistencia tienen tests; **falta cobertura de componentes**
  de UI (hoy verificados por browser-bench manual). Ampliarla es deuda priorizada.
- **Persistencia client-only.** Adecuada para la etapa actual; su evolución a backend
  está prevista detrás del puerto `EscenarioRepository` (ver punto 4).

## Mapa de carpetas (resumen)

```
src/
  engine/        # núcleo de cálculo (TS puro, sin UI) + tests *.test.ts
  components/    # UI React (incluye ErrorBoundary)
  persistence/   # puertos EscenarioRepository + BorradorRepository + adapters
  utils/         # presentación: format, validaciones, exportar
  App.tsx, main.tsx, styles.css, version.ts
scripts/         # validate.ts (motor vs Excel), package-release.mjs, gen-icons.mjs
docs/            # vision, architecture, distribucion, v1-backlog, production-review,
                 # BASELINE_RC1, CHANGE_POLICY, adr/, usuario/, excel-audit/
release/         # (generado por npm run package) paquete de distribución, gitignored
.github/workflows/ci.yml
```
