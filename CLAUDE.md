# App de Análisis de Rentabilidad Ovina

Aplicación web (React + TypeScript + Vite) para analizar la rentabilidad económica y
productiva de un establecimiento **ovino**. Es un **template genérico** (sirve para
cualquier raza); todos los campos arrancan en 0 y el usuario carga sus datos.

El motor de cálculo replica **exactamente** la lógica de una planilla Excel de referencia
(modelo Merino Australiano). La validación está en `scripts/validate.ts` y compara 18
resultados clave contra los números del Excel (deben coincidir con precisión < 1e-6).

## Comandos

```bash
npm install
npm run dev            # servidor de desarrollo (http://localhost:5174)
npm run build          # build web/PWA en dist/
npm run build:single   # build de un solo archivo HTML autocontenido en dist-single/
node --experimental-strip-types scripts/validate.ts   # QA: valida el motor vs Excel
node scripts/gen-icons.mjs                             # regenera los íconos PNG desde el SVG
```

## Arquitectura

- `src/engine/` — lógica pura (sin UI):
  - `types.ts` — modelo de datos (`Inputs` / `Resultados`).
  - `calc.ts` — **motor principal**, réplica fiel del Excel (cada bloque cita su celda).
  - `presets.ts` — preset vacío (genérico) y preset ejemplo (Merino Australiano para QA).
  - `timeline.ts` — evolución temporal / cash flow mensual (reconcilia con el margen neto).
  - `neb.ts` — necesidades energéticas (NEB) por categoría.
- `src/components/` — UI: `Formulario`, `Resultados` (dashboard), `Timeline`, `Neb`,
  `Modales` (guardar/cargar/comparar escenarios), `Campos` (inputs reutilizables).
- `src/utils/` — `format`, `scenarios` (localStorage), `validaciones`, `exportar` (CSV/PDF).

## Reglas / convenciones

- **No romper la coincidencia con el Excel.** Tras cualquier cambio en `src/engine/calc.ts`
  correr `scripts/validate.ts`: los 18 valores deben seguir coincidiendo.
- Los porcentajes se guardan como fracción (0–1) internamente; en el form se editan como %.
- La UI y los textos están en español (productores rurales). Paleta ruralista en `styles.css`.
- Gráficos con Recharts; usar `isAnimationActive={false}` (se recalculan en tiempo real).

## Empaquetado para compartir

- `npm run build:single` → un único `dist-single/index.html` autocontenido (abre con doble
  clic, offline). Es la base de la "App de Escritorio".
- `npm run build` → carpeta `dist/` (PWA instalable: manifest + service worker + íconos),
  pensada para publicar online (ej: Netlify Drop).
