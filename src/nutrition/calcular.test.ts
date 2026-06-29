import { describe, it, expect } from 'vitest'
import { calcularRequerimiento } from './calcular'
import { requirementProvider } from './requirements'
import type { NutrientRequirementProvider, RequerimientoNutricional } from './requirements'

/** Provider stub: devuelve un requerimiento fijo, para probar el CÁLCULO sin
 *  depender de la tabla oficial (que en esta etapa está vacía a propósito). */
function stubProvider(req: RequerimientoNutricional | null): NutrientRequirementProvider {
  return {
    nombre: 'STUB',
    categorias: () => requirementProvider.categorias(),
    requerimiento: () => req,
  }
}

const consulta = { categoria: 'ovejas' as const, estado: 'ultimo_tercio', pesoVivoKg: 60 }

describe('cálculo de requerimientos nutricionales', () => {
  it('sin dato en la tabla → resultado no disponible (todo en 0)', () => {
    // El provider real (NRC) tiene la tabla vacía en esta etapa.
    const r = calcularRequerimiento(requirementProvider, consulta, 100, { emMcalKgMs: 2.2 })
    expect(r.disponible).toBe(false)
    expect(r.emRodeoDia).toBe(0)
    expect(r.kgMsRequeridosDia).toBe(0)
  })

  it('escala el requerimiento por la cantidad de animales', () => {
    const p = stubProvider({ emMcalDia: 2, consumoMsKgDia: 1.5, fuente: 'test' })
    const r = calcularRequerimiento(p, consulta, 100, { emMcalKgMs: 2.0 })
    expect(r.disponible).toBe(true)
    expect(r.emPorAnimalDia).toBe(2)
    expect(r.emRodeoDia).toBe(200)          // 2 × 100
    expect(r.necesidadEnergetica).toBe(200)
  })

  it('kg MS requeridos = necesidad / EM del forraje', () => {
    const p = stubProvider({ emMcalDia: 2, consumoMsKgDia: 1.5, fuente: 'test' })
    const r = calcularRequerimiento(p, consulta, 100, { emMcalKgMs: 2.0 })
    expect(r.kgMsRequeridosDia).toBeCloseTo(100, 6) // 200 / 2.0
  })

  it('oferta y balance se calculan desde el consumo esperado y la EM del forraje', () => {
    const p = stubProvider({ emMcalDia: 2, consumoMsKgDia: 1.5, fuente: 'test' })
    const r = calcularRequerimiento(p, consulta, 100, { emMcalKgMs: 2.0 })
    expect(r.ofertaEnergetica).toBeCloseTo(1.5 * 2.0 * 100, 6) // 300
    expect(r.balance).toBeCloseTo(300 - 200, 6)                // +100
  })

  it('EM de forraje 0 no divide por cero', () => {
    const p = stubProvider({ emMcalDia: 2, consumoMsKgDia: 1.5, fuente: 'test' })
    const r = calcularRequerimiento(p, consulta, 100, { emMcalKgMs: 0 })
    expect(r.kgMsRequeridosDia).toBe(0)
  })
})
