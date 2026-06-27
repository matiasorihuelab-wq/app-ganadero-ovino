# CLAUDE.md — Protocolo de autonomía (App Rentabilidad Ovina)

Versión liviana del protocolo. Esta app es una SPA React + TS + Vite, sin
backend, sin DB, sin auth. El estado persiste en `localStorage`
(clave `ganadero_escenarios_v1`). El motor de cálculo (`src/engine/calc.ts`)
está validado contra un Excel de referencia (18/18 vía `scripts/validate.ts`).

## Roles

- **Code** (Claude Code): único escritor del repo. Implementa, testea, commitea.
- **ChatGPT/Codex** (vía MCP `codex-bridge`): auditor externo, solo lee.
- **Mauri**: decisor de producto + validación visual final.

## Los oráculos

### [BENCH] — Code puede seguir solo
Si las aserciones automáticas pasan, Code avanza sin preguntar. El bench acá es:
- `npm run build` (tsc -b + vite build) en verde.
- `node --experimental-strip-types scripts/validate.ts` con exit 0 (18/18 vs Excel).
  (El `Assertion failed ... async.c` de libuv al cerrar es ruido, no falla.
   Vale el exit code, no el stderr.)

### [BROWSER-BENCH] — Code valida en la app real
Cuando el cambio toca UI, cálculo visible, gráficos o persistencia, Code abre
`localhost:5174` y valida como usuario antes de reportar. Procedimiento:
1. `npm run bench:start` y `npm run bench:status` -> `LISTO PARA BENCH: true`.
2. Navegar con el browser MCP; **aserciones de DOM y `localStorage`**, no
   solo screenshots (el screenshot da timeout con Recharts).
3. Si se toca `localStorage`, guardarlo antes y restaurarlo después.
4. `npm run bench:stop`.
5. Reportar: qué se validó, qué no, datos tocados, datos restaurados, artifacts.

## [STOP] — Code para y pregunta a Mauri

Code se detiene y espera decisión cuando el cambio toca:
- **El motor de cálculo** (`src/engine/`): cualquier cambio que mueva un número
  que hoy coincide con el Excel. Es el corazón validado de la app.
- **El formato de persistencia**: la clave o el esquema de
  `localStorage` (`ganadero_escenarios_v1`). Romperlo invalida escenarios
  guardados del usuario.
- **Algo visible al usuario** donde el criterio es subjetivo (UX, diseño).
- **Una regresión que Code no sabe explicar.**

Al parar: reportar qué decisión hace falta, las opciones con consecuencias y
una recomendación tentativa con motivo.

## Reglas núcleo

- No modificar tests/acceptance para que pase la implementación.
- Debug por diagnóstico: hipótesis de causa raíz antes de cambiar.
- Workspace limpio al parar: build verde o marcado roto, sin ediciones a medias.
- Un concern por commit. Build verde antes de commitear.
- Cuando un cambio toca el motor de cálculo o el formato de persistencia,
  pedir review a `codex-bridge` antes de commitear.

## Auditoría con ChatGPT/Codex (codex-bridge)

Llamar al auditor cuando el cambio toca el motor de cálculo, la persistencia,
firmas públicas, o al cerrar un bloque de trabajo de más de un archivo.
NO en cada fix chico, refactor local o cambio solo-docs. Actitud crítica de
los dos lados: Code no le cree todo al auditor ni viceversa.

## Definition of Done

Una fase está DONE solo si:
- `npm run build` verde + `validate.ts` exit 0.
- Si tocó UI / persistencia / gráficos: [BROWSER-BENCH] ejecutado (o
  [BROWSER-HUMAN] pendiente marcado con motivo), con artifacts reportados.
- Si se tocó `localStorage` real: restaurado y reportado.
- Docs actualizados si cambia comportamiento observable.
- Working tree limpio.
