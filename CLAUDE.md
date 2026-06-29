# App de Análisis de Rentabilidad Ovina

Aplicación web (React + TypeScript + Vite) para analizar la rentabilidad económica y
productiva de un establecimiento **ovino**. Es un **template genérico** (sirve para
cualquier raza); todos los campos arrancan en 0 y el usuario carga sus datos.

El motor de cálculo está diseñado para replicar **fielmente** una planilla Excel de
referencia (modelo Merino Australiano). La validación (`npm run validate` / `npm test`)
compara 18 resultados clave del escenario de ejemplo contra los números del Excel
(coinciden con precisión < 1e-6).

> **Estado: Release Candidate (RC1) — baseline congelada.** No agregar funcionalidades ni
> refactorizar el motor. El único trabajo pendiente es la auditoría de fidelidad contra el
> Excel oficial. Procedimiento obligatorio para cualquier cambio del motor:
> ver `docs/BASELINE_RC1.md` y `docs/CHANGE_POLICY.md`.

## Comandos

```bash
npm install
npm run dev            # servidor de desarrollo (http://localhost:5174)
npm run lint           # ESLint
npm run typecheck      # tipos (tsc --noEmit)
npm test               # suite Vitest (motor, validaciones, persistencia)
npm run validate       # QA: valida el motor vs Excel (18/18)
npm run build          # build web/PWA en dist/
npm run build:single   # build de un solo archivo HTML autocontenido en dist-single/
npm run package        # arma el paquete de distribución en release/ (RC1)
node scripts/gen-icons.mjs                             # regenera los íconos PNG desde el SVG
```

## Arquitectura

- `src/engine/` — lógica pura (sin UI):
  - `types.ts` — modelo de datos (`Inputs` / `Resultados`).
  - `calc.ts` — **motor principal**, réplica fiel del Excel (cada bloque cita su celda).
  - `presets.ts` — preset vacío (genérico) y preset ejemplo (Merino Australiano para QA).
  - `timeline.ts` — evolución temporal / cash flow mensual (reconcilia con el margen neto).
- `src/nutrition/` — **Requerimientos Nutricionales** (módulo separado del motor
  económico): consulta tablas oficiales (NRC…) vía un `NutrientRequirementProvider`. No
  modela: consulta. Ver `docs/nutricion/`.
- `src/components/` — UI: `Formulario`, `Resultados` (dashboard), `Timeline`,
  `Nutricion` (requerimientos), `Modales` (guardar/cargar/comparar escenarios), `Campos`
  (inputs reutilizables), `ErrorBoundary`.
- `src/persistence/` — persistencia detrás de puertos: `EscenarioRepository`
  (escenarios con nombre) y `BorradorRepository` (autoguardado), con adapters de
  `localStorage` inyectables. Ver ADR-0002.
- `src/utils/` — `format`, `validaciones`, `exportar` (CSV/PDF).

## Reglas / convenciones

- **No romper la coincidencia con el Excel.** Tras cualquier cambio en `src/engine/calc.ts`
  correr `scripts/validate.ts`: los 18 valores deben seguir coincidiendo.
- Los porcentajes se guardan como fracción (0–1) internamente; en el form se editan como %.
- La UI y los textos están en español (productores rurales). Paleta ruralista en `styles.css`.
- Gráficos con Recharts; usar `isAnimationActive={false}` (se recalculan en tiempo real).

## Empaquetado para compartir

- `npm run package` → arma `release/` con ambos formatos + metadatos (versión, fecha,
  commit). Es la forma recomendada de generar el entregable. Ver `docs/distribucion.md`.
- `npm run build:single` → un único `dist-single/index.html` autocontenido (abre con doble
  clic, offline).
- `npm run build` → carpeta `dist/` (PWA instalable: manifest + service worker + íconos),
  pensada para publicar online (ej: Netlify Drop).
