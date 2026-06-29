# Limitaciones conocidas (RC1)

Esta versión es un **Release Candidate** para una beta cerrada. Es funcional y estable,
pero conviene tener presente lo siguiente.

## Sobre los cálculos

- **El motor económico todavía no fue auditado contra el Excel definitivo.** Reproduce
  fielmente el modelo de referencia en el escenario de ejemplo validado, pero algunas
  fórmulas, coeficientes o valores podrían **ajustarse** tras esa auditoría. Tomá los
  resultados como una **muy buena aproximación**, no como cifras finales.
- Las vistas **Evolución** (mes a mes) y **Energético (NEB)** son **estimaciones propias
  de la app** (no provienen del Excel): sirven para orientar, no como números exactos.

## Sobre los datos

- Los datos viven **solo en el navegador y dispositivo que uses**. No hay sincronización
  ni respaldo en la nube. Si cambiás de equipo o de navegador, o borrás los datos de
  navegación, **no se trasladan**.
- Todavía **no hay exportar/importar** la lista de escenarios a un archivo para
  respaldarla o moverla a otra máquina (sí podés exportar el resumen de resultados a CSV).

## Sobre el uso

- El **PDF** se genera con la función de impresión del navegador; el resultado puede
  variar un poco según el navegador. Conviene revisar la **vista previa** antes de
  guardar.
- Es una herramienta de **análisis de rentabilidad**, no un sistema de gestión: no lleva
  trazabilidad individual de animales ni stock en tiempo real.

## Qué NO es una limitación

- No necesita internet (archivo único), ni instalación, ni cuenta de usuario.
- Tus datos son privados (no salen de tu equipo).

> Si encontrás algo que parezca un error de cálculo, **reportalo igual** (ver
> [Cómo reportar errores](reportar-errores.md)): nos ayuda a preparar la auditoría con
> el Excel.
