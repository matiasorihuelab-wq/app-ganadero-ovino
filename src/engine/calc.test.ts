import { describe, it, expect } from 'vitest'
import { calcular } from './calc'
import { INPUTS_VACIO } from './presets'
import type { CategoriaVenta } from './types'
import { CASOS_EXCEL, coincide } from './__tests__/excel-fixtures'

// ============================================================================
//  Tests del motor de cálculo.
//  (1) Fidelidad con el Excel: valores exactos por caso (hoy solo 'Cord Dest').
//  (2) Propiedades: invariantes que NO dependen del Excel y cubren ramas que la
//      validación de un solo preset no ejercita.
// ============================================================================

describe('fidelidad con el Excel', () => {
  for (const caso of CASOS_EXCEL) {
    describe(caso.nombre, () => {
      const r = calcular(caso.inputs) as unknown as Record<string, number>
      for (const [clave, { celda, valor }] of Object.entries(caso.esperado)) {
        it(`${clave} (${celda}) ≈ ${valor}`, () => {
          expect(coincide(r[clave], valor)).toBe(true)
        })
      }
    })
  }
})

describe('propiedades del motor (independientes del Excel)', () => {
  it('el preset vacío no lanza y produce números finitos', () => {
    const r = calcular(INPUTS_VACIO)
    expect(Number.isFinite(r.margenNeto)).toBe(true)
    expect(Number.isFinite(r.ingresoBruto)).toBe(true)
    expect(Number.isFinite(r.totalAnimales)).toBe(true)
  })

  it('sin ovejas encarneradas no hay stock ni ingresos', () => {
    const r = calcular({ ...INPUTS_VACIO, ovejasEncarneradas: 0 })
    expect(r.totalAnimales).toBe(0)
    expect(r.ingresoBruto).toBe(0)
    expect(r.totalLanaKg).toBe(0)
  })

  it('cada categoría de venta corre sin lanzar y da resultados finitos', () => {
    const categorias: CategoriaVenta[] = [
      'Cord Dest', 'Cord Pz', 'Cord Pes', 'Bgos 4D', 'Cap 6/8D', 'Cap 8D',
    ]
    for (const categoriaVenta of categorias) {
      const r = calcular({ ...CASOS_EXCEL[0].inputs, categoriaVenta })
      expect(Number.isFinite(r.margenNeto), `categoría ${categoriaVenta}`).toBe(true)
      expect(r.totalAnimales, `categoría ${categoriaVenta}`).toBeGreaterThan(0)
    }
  })

  it('el cálculo es determinístico (misma entrada → misma salida)', () => {
    const a = calcular(CASOS_EXCEL[0].inputs)
    const b = calcular(CASOS_EXCEL[0].inputs)
    expect(a).toEqual(b)
  })

  it('más ovejas encarneradas no reduce el ingreso bruto', () => {
    const base = { ...CASOS_EXCEL[0].inputs }
    const menos = calcular({ ...base, ovejasEncarneradas: 300 })
    const mas = calcular({ ...base, ovejasEncarneradas: 600 })
    expect(mas.ingresoBruto).toBeGreaterThanOrEqual(menos.ingresoBruto)
  })
})
