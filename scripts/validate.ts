// QA: valida el motor contra los valores de referencia del Excel.
// Comparte los casos/valores con la suite Vitest vía el módulo de fixtures
// (fuente única). Salida legible con OK/XX por celda; exit 0 si todo coincide.
import { calcular } from '../src/engine/calc.ts'
import { CASOS_EXCEL, coincide } from '../src/engine/__tests__/excel-fixtures.ts'

let ok = true
for (const caso of CASOS_EXCEL) {
  console.log(`\n— ${caso.nombre} —`)
  const r = calcular(caso.inputs) as unknown as Record<string, number>
  for (const [clave, { celda, valor }] of Object.entries(caso.esperado)) {
    const got = r[clave]
    const pass = coincide(got, valor)
    if (!pass) ok = false
    const etiqueta = `${clave} (${celda})`
    console.log(
      `${pass ? 'OK ' : 'XX '} ${etiqueta.padEnd(28)} got=${got.toFixed(6).padStart(16)}  exp=${valor.toFixed(6).padStart(16)}  ${pass ? '' : `(diff ${Math.abs(got - valor)})`}`,
    )
  }
}
console.log('\n' + (ok ? '✅ TODOS LOS VALORES COINCIDEN CON EL EXCEL' : '❌ HAY DIFERENCIAS'))
process.exit(ok ? 0 : 1)
