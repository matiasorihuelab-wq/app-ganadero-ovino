import { describe, it, expect } from 'vitest'
import { construirTimeline } from './timeline'
import { calcular } from './calc'
import { QA_FIXTURE } from './presets'
import { coincide } from './__tests__/excel-fixtures'

describe('timeline (evolución mensual)', () => {
  const r = calcular(QA_FIXTURE)
  const meses = construirTimeline(QA_FIXTURE, r)

  it('devuelve 12 meses', () => {
    expect(meses).toHaveLength(12)
  })

  it('reconcilia: la suma del flujo mensual = margen neto anual', () => {
    const suma = meses.reduce((s, m) => s + m.flujo, 0)
    expect(coincide(suma, r.margenNeto)).toBe(true)
  })

  it('cada mes: flujo = ingresos - costos', () => {
    for (const m of meses) {
      expect(coincide(m.flujo, m.ingresos - m.costos)).toBe(true)
    }
  })

  it('el acumulado del último mes = suma total del flujo', () => {
    const suma = meses.reduce((s, m) => s + m.flujo, 0)
    expect(coincide(meses[11].acumulado, suma)).toBe(true)
  })
})
