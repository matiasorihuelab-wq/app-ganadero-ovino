# 🐑 App de Análisis de Rentabilidad Ovina

Aplicación web (React + TypeScript + Vite) para analizar la rentabilidad económica y
productiva de un sistema ganadero **ovino**. Es un **template genérico**: sirve para
cualquier raza (Corriedale, Merino Dohne, Merino Australiano, etc.) y todos los campos
arrancan en 0 / vacío. El usuario carga sus propios datos.

El motor de cálculo replica **exactamente** la lógica de la planilla Excel de referencia
(modelo Merino Australiano): cascada de categorías con mortandad acumulativa, producción
de lana por micronaje (curva de precio), estructura de costos detallada (sanidad por
medicamento, esquila, alimentación, comercialización) y márgenes finales.

## Cómo correr

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5174
npm run build    # build de producción en /dist
```

## Verificación de fórmulas (QA)

El archivo `scripts/validate.ts` carga el preset de ejemplo (valores exactos del Excel)
y compara 18 resultados clave contra los números que produce el Excel:

```bash
node --experimental-strip-types scripts/validate.ts
```

Todos los valores coinciden con precisión < 1e-6 (ingresos, costos directos, costos
fijos, margen bruto/neto, lana, micronaje ponderado, UG, dotación, etc.).

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
  utils/
    format.ts        # formato USD / números / %
    scenarios.ts     # persistencia de escenarios (localStorage)
    validaciones.ts  # avisos y advertencias
    exportar.ts      # exportar CSV / PDF (print)
```

## Funcionalidades

- Cálculo en **tiempo real** al editar cualquier input.
- Tres vistas en el panel de resultados (pestañas): **Dashboard**, **Evolución** y **Energético**.
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
- **🔥 Análisis energético (NEB):** calculadora de necesidades energéticas por categoría
  (Mcal EM/día), con ajustes dinámicos por temperatura (estrés por frío), condición
  corporal objetivo y ganancia diaria esperada. Calcula mantenimiento (coef × PV^0,75),
  ración recomendada (kg MS/día según densidad del forraje) y costo equivalente. Todos los
  coeficientes son editables. Motor: `src/engine/neb.ts`.

## Notas sobre el modelo

- El **precio de la lana** se deriva de una curva polinómica del micronaje ponderado
  (promedio últimos 2 o 3 años), tal como en el Excel original.
- Los **precios de carne** se derivan de un precio base (cordero pesado 4ta balanza):
  cordero destete = base×0,45 (en pie), oveja descarte = base−0,50, capón = (base−0,50)+0,15.
- Los **costos de sanidad** se calculan por categoría combinando el costo/kg de cada
  medicamento (dosis × precio / volumen) con el peso de prorrateo y un coeficiente de
  seguridad, replicando las fórmulas por categoría del Excel.
