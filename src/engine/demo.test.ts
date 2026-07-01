import { describe, it, expect } from 'vitest'
import { calcular } from './calc'
import { DEMO_STATE } from './presets'

// El seed por defecto ("Cargar ejemplo") es CICOMA-SUL y debe ser un escenario de
// resultados POSITIVOS (alto desempeño). Independiente del fixture de QA (QA_FIXTURE).
describe('preset demo CICOMA-SUL', () => {
  const r = calcular(DEMO_STATE)

  it('se llama CICOMA-SUL', () => {
    expect(DEMO_STATE.nombrePredio).toBe('CICOMA-SUL')
  })

  it('produce un margen neto positivo (alto desempeño)', () => {
    expect(r.margenNeto).toBeGreaterThan(0)
    expect(r.margenBruto).toBeGreaterThan(0)
    expect(r.margenNetoHa).toBeGreaterThan(0)
  })

  it('todos los resultados son finitos', () => {
    expect(Number.isFinite(r.margenNeto)).toBe(true)
    expect(Number.isFinite(r.ingresoBruto)).toBe(true)
  })
})
