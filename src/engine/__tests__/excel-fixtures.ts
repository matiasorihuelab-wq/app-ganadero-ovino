// ============================================================================
//  Fixtures de referencia del Excel — fuente ÚNICA de los valores esperados.
//  La consumen tanto la suite de tests (calc.test.ts) como el script de QA
//  (scripts/validate.ts), para no duplicar los números del Excel.
//
//  TODO(excel): hoy hay un solo caso ('Cord Dest', el ejemplo Merino). Cuando esté
//  el Excel definitivo, agregar un caso por categoría de venta y por rama no cubierta
//  (alimentación, renta>0, certificación, modoPrecios 'últimos 3'). Ver docs/v1-backlog.md
//  (V1-01, V1-02). Idealmente extraer estos valores del Excel con un script, no a mano.
// ============================================================================
import type { Inputs, Resultados } from '../types.ts'
import { INPUTS_EJEMPLO } from '../presets.ts'

/** Una clave numérica de Resultados con su celda del Excel y el valor esperado. */
export interface ValorEsperado {
  celda: string
  valor: number
}

export interface CasoExcel {
  nombre: string
  inputs: Inputs
  esperado: Partial<Record<keyof Resultados, ValorEsperado>>
}

export const CASOS_EXCEL: CasoExcel[] = [
  {
    nombre: 'Cord Dest — Merino Australiano (ejemplo)',
    inputs: INPUTS_EJEMPLO,
    esperado: {
      ingresoLana: { celda: 'C39', valor: 18969.352135854202 },
      ingresoCarne: { celda: 'C41', valor: 21388.539672 },
      ingresoBruto: { celda: 'C57', valor: 40357.891807854205 },
      totalLanaKg: { celda: 'C45', valor: 3751.8035759999993 },
      totalCarneKg: { celda: 'C46', valor: 14587.032 },
      micronajePonderado: { celda: 'C48', valor: 20.24457534980504 },
      costoSanidadTotal: { celda: 'P13', valor: 4040.7427605599996 },
      costoEsquilaTotal: { celda: 'Q13', valor: 3419.383347692308 },
      costoAlimTotal: { celda: 'R13', valor: 0 },
      costoCarnerosTotal: { celda: 'S13', valor: 2666.666666666667 },
      costosDirectosTotal: { celda: 'P25', valor: 10126.792774918973 },
      manoDeObra: { celda: 'P21', valor: 73193.93846153846 },
      costosFijosTotal: { celda: 'P26', valor: 76418.44167441403 },
      margenBruto: { celda: 'C64', valor: 30231.099032935224 },
      margenNeto: { celda: 'C72', valor: -46187.34264147881 },
      totalUG: { celda: 'G35', valor: 121.4246578800937 },
      dotacionOvinos: { celda: 'C52', valor: 0.2033913867338253 },
      totalAnimales: { celda: 'C35', valor: 962.016 },
    },
  },
]

/** Coincidencia con el Excel: relativa < 1e-6, o absoluta < 1e-6 (para valores ~0). */
export function coincide(got: number, esperado: number): boolean {
  const diff = Math.abs(got - esperado)
  const rel = esperado !== 0 ? diff / Math.abs(esperado) : diff
  return rel < 1e-6 || diff < 1e-6
}
