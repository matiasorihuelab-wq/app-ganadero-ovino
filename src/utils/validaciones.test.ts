import { describe, it, expect } from 'vitest'
import { validar } from './validaciones'
import { calcular } from '../engine/calc'
import { INPUTS_VACIO, QA_FIXTURE } from '../engine/presets'
import type { Inputs } from '../engine/types'

const avisar = (inp: Inputs) => validar(inp, calcular(inp))
const tieneMsg = (inp: Inputs, frag: string) => avisar(inp).some((a) => a.msg.includes(frag))

describe('validaciones', () => {
  it('preset vacío: pide cargar ovejas', () => {
    expect(tieneMsg(INPUTS_VACIO, 'ovejas encarneradas')).toBe(true)
  })

  it('mortandad >30% genera error', () => {
    const inp = { ...QA_FIXTURE, mortOvejas: 0.35 }
    const a = avisar(inp)
    expect(a.some((x) => x.tipo === 'err' && x.msg.includes('Mortandad'))).toBe(true)
  })

  it('cotización del dólar en 0 con salario en UYU: error', () => {
    expect(tieneMsg({ ...QA_FIXTURE, precioDolar: 0 }, 'dólar en 0')).toBe(true)
  })

  it('rendimiento de canal en 0 avisa', () => {
    expect(tieneMsg({ ...QA_FIXTURE, rendimientoCanal: 0 }, 'Rendimiento de canal')).toBe(true)
  })

  it('superficie total en 0 avisa', () => {
    expect(tieneMsg({ ...QA_FIXTURE, supPropiedad: 0, supArrendada: 0 }, 'Superficie total')).toBe(true)
  })

  it('no hace ruido sobre dólar/rendimiento en el preset válido', () => {
    expect(tieneMsg(QA_FIXTURE, 'dólar en 0')).toBe(false)
    expect(tieneMsg(QA_FIXTURE, 'Rendimiento de canal')).toBe(false)
  })

  it('rentabilidad negativa con ingreso > 0 se reporta', () => {
    expect(tieneMsg(QA_FIXTURE, 'RENTABILIDAD NEGATIVA')).toBe(true)
  })
})
