import { describe, it, expect } from 'vitest'
import { sanitizeInputs, INPUTS_VACIO } from './presets'

describe('sanitizeInputs', () => {
  it('rellena campos faltantes desde INPUTS_VACIO', () => {
    const r = sanitizeInputs({ ovejasEncarneradas: 500 })
    expect(r.ovejasEncarneradas).toBe(500)
    expect(r.pesoAdulto).toBe(INPUTS_VACIO.pesoAdulto)
    expect(r.coefSeguridad).toBe(INPUTS_VACIO.coefSeguridad)
  })

  it('garantiza que medicamentos sea un array aunque venga inválido', () => {
    for (const malo of [undefined, null, 'x', 42, {}]) {
      const r = sanitizeInputs({ medicamentos: malo } as unknown)
      expect(Array.isArray(r.medicamentos)).toBe(true)
      expect(r.medicamentos.length).toBeGreaterThan(0)
    }
  })

  it('preserva un medicamentos válido', () => {
    const meds = [{ nombre: 'X', precio: 1, volumen: 100, dosis: 0.1, frecuencia: '' }]
    expect(sanitizeInputs({ medicamentos: meds }).medicamentos).toEqual(meds)
  })

  it('tolera entradas no-objeto sin lanzar', () => {
    for (const malo of [null, undefined, 'abc', 7]) {
      expect(() => sanitizeInputs(malo)).not.toThrow()
      expect(Array.isArray(sanitizeInputs(malo).medicamentos)).toBe(true)
    }
  })
})
