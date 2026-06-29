import { describe, it, expect } from 'vitest'
import { calcularNEB, NEB_DEFAULT } from './neb'
import { calcular } from './calc'
import { INPUTS_EJEMPLO, INPUTS_VACIO } from './presets'
import { coincide } from './__tests__/excel-fixtures'

describe('NEB (necesidades energéticas)', () => {
  it('las componentes de cada fila suman el NEB total', () => {
    // condición objetivo > 3 para que el sumando de condición no sea 0 (guarda V1-18)
    const params = { ...NEB_DEFAULT, condicionObjetivo: 4, ganancia: 100, precioRacion: 0.4 }
    const r = calcular(INPUTS_EJEMPLO)
    const res = calcularNEB(INPUTS_EJEMPLO, r, params)
    expect(res.filas.length).toBeGreaterThan(0)
    for (const f of res.filas) {
      expect(coincide(f.total, f.mantenimiento + f.climatico + f.condicion + f.ganancia)).toBe(true)
    }
  })

  it('los totales son finitos y no negativos', () => {
    const r = calcular(INPUTS_EJEMPLO)
    const res = calcularNEB(INPUTS_EJEMPLO, r, { ...NEB_DEFAULT, precioRacion: 0.4 })
    expect(Number.isFinite(res.totalMcalDia)).toBe(true)
    expect(res.totalMcalDia).toBeGreaterThanOrEqual(0)
    expect(res.totalCostoAnual).toBeGreaterThanOrEqual(0)
  })

  it('sin rebaño no hay filas ni necesidades', () => {
    const r = calcular(INPUTS_VACIO)
    const res = calcularNEB(INPUTS_VACIO, r, NEB_DEFAULT)
    expect(res.filas).toHaveLength(0)
    expect(res.totalMcalDia).toBe(0)
  })
})
