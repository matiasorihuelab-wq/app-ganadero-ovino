import { describe, it, expect } from 'vitest'
import { validar } from './validaciones'
import { calcular } from '../engine/calc'
import { INPUTS_VACIO, INPUTS_EJEMPLO } from '../engine/presets'
import type { Inputs } from '../engine/types'

const avisar = (inp: Inputs) => validar(inp, calcular(inp))
const tieneMsg = (inp: Inputs, frag: string) => avisar(inp).some((a) => a.msg.includes(frag))

describe('validaciones', () => {
  it('preset vacío: pide cargar ovejas', () => {
    expect(tieneMsg(INPUTS_VACIO, 'ovejas encarneradas')).toBe(true)
  })

  it('mortandad >30% genera error', () => {
    const inp = { ...INPUTS_EJEMPLO, mortOvejas: 0.35 }
    const a = avisar(inp)
    expect(a.some((x) => x.tipo === 'err' && x.msg.includes('Mortandad'))).toBe(true)
  })

  it('cotización del dólar en 0 con salario en UYU: error', () => {
    expect(tieneMsg({ ...INPUTS_EJEMPLO, precioDolar: 0 }, 'dólar en 0')).toBe(true)
  })

  it('rendimiento de canal en 0 avisa', () => {
    expect(tieneMsg({ ...INPUTS_EJEMPLO, rendimientoCanal: 0 }, 'Rendimiento de canal')).toBe(true)
  })

  it('superficie total en 0 avisa', () => {
    expect(tieneMsg({ ...INPUTS_EJEMPLO, supPropiedad: 0, supArrendada: 0 }, 'Superficie total')).toBe(true)
  })

  it('no hace ruido sobre dólar/rendimiento en el preset válido', () => {
    expect(tieneMsg(INPUTS_EJEMPLO, 'dólar en 0')).toBe(false)
    expect(tieneMsg(INPUTS_EJEMPLO, 'Rendimiento de canal')).toBe(false)
  })

  it('rentabilidad negativa con ingreso > 0 se reporta', () => {
    expect(tieneMsg(INPUTS_EJEMPLO, 'RENTABILIDAD NEGATIVA')).toBe(true)
  })
})
