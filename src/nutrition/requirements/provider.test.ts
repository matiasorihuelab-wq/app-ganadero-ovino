import { describe, it, expect } from 'vitest'
import { requirementProvider } from './index'

// Tests de ARQUITECTURA: la tabla oficial está vacía a propósito en esta etapa, así
// que no hay valores que validar. Se verifica que el contrato del provider funcione.

describe('NutrientRequirementProvider (NRC)', () => {
  it('expone el sistema de referencia', () => {
    expect(requirementProvider.nombre).toBe('NRC')
  })

  it('expone las categorías y estados esperados', () => {
    const cats = requirementProvider.categorias()
    expect(cats.map((c) => c.id)).toEqual(['ovejas', 'borregas', 'carneros'])

    const ovejas = cats.find((c) => c.id === 'ovejas')!
    expect(ovejas.estados.map((e) => e.id)).toContain('gestacion_final')
    expect(ovejas.estados.map((e) => e.id)).toContain('lactancia_doble')

    const carneros = cats.find((c) => c.id === 'carneros')!
    expect(carneros.estados.map((e) => e.id)).toEqual(['mantenimiento', 'servicio', 'recuperacion'])
  })

  it('sin datos cargados, una consulta devuelve null (no inventa requerimientos)', () => {
    const r = requirementProvider.requerimiento({ categoria: 'ovejas', estado: 'gestacion_final', pesoVivoKg: 55 })
    expect(r).toBeNull()
  })
})
