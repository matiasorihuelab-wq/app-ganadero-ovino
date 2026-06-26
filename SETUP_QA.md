# Setup de QA — code review con ChatGPT (codex-bridge) + browser bench

Guía para dejar funcionando en ESTA computadora (máquina nueva, nada
pre-instalado) dos cosas:

- **(A) Code review automático con ChatGPT/Codex** — un MCP server `codex-bridge`.
- **(B) Browser bench** — prueba autónoma de la app en `localhost:5174`.

Stack del proyecto: SPA React + TypeScript + Vite, sin backend, sin DB, sin auth.
SO objetivo: Windows 11 + PowerShell. Node/npm/npx ya presentes.

---

## Archivos de este paquete y dónde van

```
.mcp.json                      -> raíz del proyecto
scripts/bench_app.mjs          -> scripts/  (launcher del dev server)
scripts/fix-codex-binary.ps1   -> scripts/  (parche de contingencia, ver Parte A)
CLAUDE.md                      -> raíz del proyecto (protocolo de autonomía)
SETUP_QA.md                    -> este archivo (doc, puede ir a docs/)
```

También hay que:
- agregar 3 scripts a `package.json` (ver Parte B)
- agregar 2 líneas a `.gitignore` (ver Parte B)

---

## Parte A — code review con ChatGPT (codex-bridge)

El MCP `codex-bridge` corre OpenAI Codex (motor de ChatGPT) para revisar tus
diffs y devolver un veredicto (approve / request_changes / reject) con archivo
y línea. La autenticación usa tu cuenta de ChatGPT vía login en el navegador.

### A.1 — Instalar el codex CLI global (una vez por máquina)

```
npm install -g @openai/codex
```

Esto sirve para dos cosas: poder hacer `codex login`, y tener un `codex.exe`
nuevo por si hay que aplicar el parche de A.4.

### A.2 — Loguearse con la cuenta de ChatGPT (una vez por máquina)

```
codex login
```

Abre el navegador. Logueate con la MISMA cuenta de ChatGPT que usás para esto.
Eso escribe `~/.codex/auth.json` (queda guardado en la máquina; no hay que
repetirlo salvo que el token se revoque).

### A.3 — Registrar el MCP en el proyecto

Copiar `.mcp.json` a la raíz del proyecto (ya viene en este paquete).
Después **reiniciar Claude Code** en el proyecto para que cargue el MCP server.

### A.4 — Probar, y parchear SOLO si hace falta

Con Claude Code reabierto, pedile una review (`review_code` sobre cualquier
cambio). Posibles resultados:

- **Funciona** (devuelve veredicto) -> listo, nada más que hacer.
- **`UNKNOWN_ERROR: refresh token revoked`** -> el login venció. Re-correr
  `codex login`.
- **`MODEL_ERROR ... 'gpt-5.3-codex' not supported with a ChatGPT account`** ->
  bug conocido del bridge con cuentas ChatGPT. Correr el parche:

  ```
  powershell -ExecutionPolicy Bypass -File scripts\fix-codex-binary.ps1
  ```

  Reemplaza el binario viejo que trae el bridge por el codex global nuevo.
  Reiniciar Claude Code y reintentar. (Reversible: deja backups `.0128.bak`.)
  Si en el futuro npx vuelve a bajar el bridge, re-correr el parche.

> Resumen Parte A: `npm i -g @openai/codex` → `codex login` → copiar `.mcp.json`
> → reiniciar Claude Code → probar review → (si error de modelo) correr el .ps1.

---

## Parte B — browser bench (prueba autónoma en localhost)

### B.1 — Copiar el launcher

`scripts/bench_app.mjs` ya viene en el paquete. Levanta Vite en :5174 de forma
controlada (mata stale, no abre pestañas sueltas, espera a que responda,
registra commit).

### B.2 — Agregar scripts a package.json

En la sección `"scripts"` de `package.json`, agregar:

```json
"bench:start":  "node scripts/bench_app.mjs start",
"bench:status": "node scripts/bench_app.mjs status",
"bench:stop":   "node scripts/bench_app.mjs stop"
```

### B.3 — Ignorar los artefactos del bench

Agregar a `.gitignore`:

```
.bench_app.json
.bench_app.log
```

### B.4 — "Build verde" de esta app

Antes de dar una fase por terminada, ambos deben pasar:

```
npm run build
node --experimental-strip-types scripts/validate.ts
```

> Nota: `validate.ts` imprime al final un `Assertion failed ... async.c` de libuv
> (Node 24 en Windows). Es ruido de teardown, NO una falla. Confiá en el exit
> code (0 = ok), nunca en ese stderr.

### B.5 — Cómo se corre un bench

1. `npm run bench:start`
2. `npm run bench:status` -> debe decir `LISTO PARA BENCH: true`. Solo entonces
   el bench es válido (confirma que el server responde y que el código corriendo
   es el commit actual).
3. Con el browser MCP disponible (Claude-in-Chrome o el de preview), abrir
   `http://localhost:5174` y validar como usuario real. **Priorizar aserciones
   de DOM y de `localStorage` sobre screenshots** (en este proyecto el screenshot
   da timeout con los gráficos Recharts; el DOM es confiable).
4. Si se tocó `localStorage`, guardarlo antes y restaurarlo después.
5. `npm run bench:stop`.

Flujos recomendados para el primer bench: ver el prompt de implementación
(`PROMPT_IMPLEMENTACION.md`).
