import { calcular } from '../src/engine/calc.ts'
import { INPUTS_EJEMPLO } from '../src/engine/presets.ts'

const r = calcular(INPUTS_EJEMPLO)

// Targets = valores calculados por el Excel (data_only) para el ejemplo Cord Dest
const targets: Record<string, [number, number]> = {
  'Ingreso lana (C39)': [r.ingresoLana, 18969.352135854202],
  'Ingreso carne (C41)': [r.ingresoCarne, 21388.539672],
  'Ingreso bruto (C57)': [r.ingresoBruto, 40357.891807854205],
  'Total lana kg (C45)': [r.totalLanaKg, 3751.8035759999993],
  'Total carne kg (C46)': [r.totalCarneKg, 14587.032],
  'Micronaje pond (C48)': [r.micronajePonderado, 20.24457534980504],
  'Sanidad (P13)': [r.costoSanidadTotal, 4040.7427605599996],
  'Esquila (Q13)': [r.costoEsquilaTotal, 3419.383347692308],
  'Alimentacion (R13)': [r.costoAlimTotal, 0],
  'Carneros (S13)': [r.costoCarnerosTotal, 2666.666666666667],
  'Costos directos (P25)': [r.costosDirectosTotal, 10126.792774918973],
  'Mano de obra (P21)': [r.manoDeObra, 73193.93846153846],
  'Costos fijos (P26)': [r.costosFijosTotal, 76418.44167441403],
  'Margen bruto (C64)': [r.margenBruto, 30231.099032935224],
  'Margen neto (C72)': [r.margenNeto, -46187.34264147881],
  'Total UG (G35)': [r.totalUG, 121.4246578800937],
  'Dotacion ovinos (C52)': [r.dotacionOvinos, 0.2033913867338253],
  'Total animales (C35)': [r.totalAnimales, 962.016],
}

let ok = true
for (const [k, [got, exp]] of Object.entries(targets)) {
  const diff = Math.abs(got - exp)
  const rel = exp !== 0 ? diff / Math.abs(exp) : diff
  const pass = rel < 1e-6 || diff < 1e-6
  if (!pass) ok = false
  console.log(
    `${pass ? 'OK ' : 'XX '} ${k.padEnd(24)} got=${got.toFixed(6).padStart(16)}  exp=${exp.toFixed(6).padStart(16)}  ${pass ? '' : `(diff ${diff})`}`,
  )
}
console.log('\n' + (ok ? '✅ TODOS LOS VALORES COINCIDEN CON EL EXCEL' : '❌ HAY DIFERENCIAS'))
process.exit(ok ? 0 : 1)
