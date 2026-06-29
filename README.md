# 🐑 App de Análisis de Rentabilidad Ovina

Aplicación web (React + TypeScript + Vite) para analizar la rentabilidad económica y
productiva de un sistema ganadero **ovino**. Es un **template genérico**: sirve para
cualquier raza (Corriedale, Merino Dohne, Merino Australiano, etc.) y todos los campos
arrancan en 0 / vacío. El usuario carga sus propios datos.

El motor de cálculo está diseñado para replicar **fielmente** la lógica de la planilla
Excel de referencia (modelo Merino Australiano): cascada de categorías con mortandad
acumulativa, producción de lana por micronaje (curva de precio), estructura de costos
detallada (sanidad por medicamento, esquila, alimentación, comercialización) y márgenes
finales. Hoy coincide con el Excel en **18 valores del escenario de ejemplo**; la
**auditoría de fidelidad completa** (todas las categorías) está pendiente.

> **Estado: RC3 — Beta cerrada.** Build preparado para una **beta cerrada** con técnicos
> del SUL. El **motor económico** sigue siendo la **baseline RC1 congelada** (validado
> 18/18 contra el Excel; su auditoría completa queda pendiente). El **módulo de
> Requerimientos Nutricionales** está **🚧 en construcción** (se incorporará en una futura
> versión con tablas oficiales). Antes de cualquier cambio del motor económico, leé
> [docs/BASELINE_RC1.md](docs/BASELINE_RC1.md) y [docs/CHANGE_POLICY.md](docs/CHANGE_POLICY.md).
> Para publicar/distribuir la beta, ver [docs/BETA_READY.md](docs/BETA_READY.md).

## Cómo correr

```bash
npm install
npm run dev           # servidor de desarrollo en http://localhost:5174
npm run build         # build web/PWA en /dist (para publicar online)
npm run build:single  # único HTML autocontenido en /dist-single (doble clic, offline)
npm run preview       # previsualiza el build /dist localmente
npm run package       # arma el paquete de distribución en /release (beta)
```

Detalle de cada formato (cuándo usar cada uno, limitaciones, recomendación):
ver [docs/distribucion.md](docs/distribucion.md).

## Calidad

```bash
npm run lint        # ESLint
npm run typecheck   # tipos (tsc --noEmit)
npm test            # suite del motor (Vitest)
npm run validate    # motor vs Excel (18/18)
```

La CI (GitHub Actions) corre todo esto en cada push y Pull Request.

## Publicar una nueva RC

La app se publica como enlace público vía **GitHub Pages**, de forma **automática**.
Guía completa y configuración inicial: [docs/DEPLOY_GITHUB_PAGES.md](docs/DEPLOY_GITHUB_PAGES.md).

1. **Generar el paquete** (local, opcional para revisar): `npm run package` → `release/`.
2. **Actualizar versión** (`package.json`, `src/version.ts`) y `CHANGELOG.md`.
3. **Subir los cambios a la rama de distribución** (`main`):
   ```bash
   git checkout main && git merge <rama-de-trabajo> && git push origin main
   ```
4. **La publicación se dispara sola**: el workflow `deploy-pages.yml` corre
   lint → typecheck → test → validate → build → package y publica `release/web`.
   (También se puede lanzar a mano desde **Actions → Deploy a GitHub Pages → Run workflow**.)
5. **Verificar que terminó**: en la pestaña **Actions** el workflow queda en verde; el
   job *deploy* muestra la URL publicada (campo *page_url*).
6. **Enlace público** (el que usan los técnicos del SUL):
   `https://matiasorihuelab-wq.github.io/app-ganadero-ovino/`

## Verificación de fórmulas (QA)

`npm run validate` (o `npm test`) carga el preset de ejemplo y compara 18 resultados
clave contra los números del Excel. Los valores esperados viven en
`src/engine/__tests__/excel-fixtures.ts` (fuente única, compartida por la suite Vitest
y el script de validación).

Todos coinciden con precisión < 1e-6 (ingresos, costos directos, costos fijos, margen
bruto/neto, lana, micronaje ponderado, UG, dotación, etc.) **para el escenario de
ejemplo** (`Cord Dest`). La validación del resto de categorías es parte de la auditoría
pendiente (ver [docs/excel-audit/](docs/excel-audit/)).

## Estructura

```
src/
  engine/
    types.ts      # modelo de datos (Inputs / Resultados)
    calc.ts       # motor de cálculo — réplica fiel del Excel (cada bloque cita su celda)
    presets.ts    # preset vacío (genérico) + preset ejemplo (Merino Australiano)
  components/
    Formulario.tsx   # formulario por secciones colapsables
    Resultados.tsx   # dashboard KPIs + gráficos (Recharts) + tablas
    Modales.tsx      # guardar / cargar / comparar escenarios
    Campos.tsx       # inputs reutilizables
  persistence/       # puertos/adapters de persistencia (localStorage)
    escenario-repository.ts        # escenarios con nombre
    borrador-repository.ts         # autoguardado del borrador actual
  utils/
    format.ts        # formato USD / números / %
    validaciones.ts  # avisos y advertencias
    exportar.ts      # exportar CSV / PDF (print)
  version.ts         # versión visible de la app (RC3)
docs/                # vision, architecture, distribucion, v1-backlog, production-review,
                     # BASELINE_RC1, CHANGE_POLICY, adr/, usuario/ (manual), excel-audit/
```

## Funcionalidades

- Cálculo en **tiempo real** al editar cualquier input.
- Tres vistas en el panel de resultados (pestañas): **Dashboard**, **Evolución** y **Requerimientos** (nutricionales).
- Botón **"Cargar ejemplo"** (Merino Australiano) para QA / demostración.
- **Guardar / cargar / comparar** escenarios (localStorage).
- **Exportar** a CSV y a PDF (vía impresión del navegador).
- **Validaciones** y advertencias (dotación, mortandad, micronaje, rentabilidad negativa).
- Diseño responsive (2 columnas en desktop, apilado en mobile) con paleta ruralista.

## Fase 4 — Capacidades adicionales

- **📅 Evolución temporal (cash flow mes a mes):** distribuye los totales anuales en un
  calendario de 12 meses según el ciclo productivo (encarnerada → esquila → venta). Los
  ingresos de lana se ubican en el mes de esquila, los de carne en el de venta, y los
  costos fijos / mano de obra se prorratean. La **suma anual reconcilia exactamente** con
  el margen neto del dashboard. Incluye gráfico de barras + línea de cash flow acumulado.
  Motor: `src/engine/timeline.ts`.
- **🥗 Requerimientos nutricionales:** **motor de consulta** de requerimientos
  **oficiales** (NRC y, a futuro, INRA/AFRC/CSIRO) según categoría, estado fisiológico,
  peso vivo y nivel productivo. **No calcula ni modela**: consulta tablas auditables vía
  un *Requirement Provider*. El análisis químico del forraje y el balance oferta vs
  requerimiento son etapas futuras (arquitectura ya preparada). Ver
  [docs/nutricion/](docs/nutricion/). Módulo: `src/nutrition/`, UI `src/components/Nutricion.tsx`.

## Notas sobre el modelo

- El **precio de la lana** se deriva de una curva polinómica del micronaje ponderado
  (promedio últimos 2 o 3 años), tal como en el Excel original.
- Los **precios de carne** se derivan de un precio base (cordero pesado 4ta balanza):
  cordero destete = base×0,45 (en pie), oveja descarte = base−0,50, capón = (base−0,50)+0,15.
- Los **costos de sanidad** se calculan por categoría combinando el costo/kg de cada
  medicamento (dosis × precio / volumen) con el peso de prorrateo y un coeficiente de
  seguridad, replicando las fórmulas por categoría del Excel.
