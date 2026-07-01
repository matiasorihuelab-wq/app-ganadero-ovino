import { describe, it, expect } from 'vitest'
import { calcular } from './calc'
import { INPUTS_DEMO } from './presets'

// El seed por defecto ("Cargar ejemplo") es CICOMA-SUL y debe ser un escenario de
// resultados POSITIVOS (alto desempeño). Independiente del fixture de QA (INPUTS_EJEMPLO).
describe('preset demo CICOMA-SUL', () => {
  const r = calcular(INPUTS_DEMO)

  it('se llama CICOMA-SUL', () => {
    expect(INPUTS_DEMO.nombrePredio).toBe('CICOMA-SUL')
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
