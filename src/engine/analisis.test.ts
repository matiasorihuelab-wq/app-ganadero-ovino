import { describe, it, expect } from 'vitest'
import { calcular } from './calc'
import { INPUTS_EJEMPLO, INPUTS_VACIO } from './presets'
import { generarInforme, construirIndicadores } from './analisis'

const finito = (n: number) => Number.isFinite(n)

describe('informe de análisis crítico', () => {
  const r = calcular(INPUTS_EJEMPLO)
  const inf = generarInforme(INPUTS_EJEMPLO, r)

  it('genera un informe completo con el ejemplo', () => {
    expect(inf.vacio).toBe(false)
    expect(inf.diagnostico.length).toBeGreaterThan(0)
    expect(inf.eficiencia.length).toBeGreaterThan(0)
    expect(inf.hallazgos.length).toBeGreaterThan(0)
    expect(inf.recomendaciones.length).toBeGreaterThanOrEqual(5)
  })

  it('produce 3 escenarios (base/optimista/pesimista) y 4 variables de sensibilidad', () => {
    expect(inf.escenarios.map((e) => e.nombre)).toEqual(['Base', 'Optimista', 'Pesimista'])
    expect(inf.sensibilidadVariables).toHaveLength(4)
  })

  it('el escenario Base coincide con el resultado del motor', () => {
    const base = inf.escenarios.find((e) => e.nombre === 'Base')!
    expect(base.margenNeto).toBeCloseTo(r.margenNeto, 6)
  })

  it('optimista mejora y pesimista empeora el margen respecto de base', () => {
    const m = (n: string) => inf.escenarios.find((e) => e.nombre === n)!.margenNeto
    expect(m('Optimista')).toBeGreaterThan(m('Base'))
    expect(m('Pesimista')).toBeLessThan(m('Base'))
  })

  it('todos los números del informe son finitos (sin NaN/Infinity)', () => {
    inf.escenarios.forEach((e) => {
      expect(finito(e.margenNeto)).toBe(true)
      expect(finito(e.margenNetoHa)).toBe(true)
      expect(finito(e.deltaVsBasePct)).toBe(true)
    })
    inf.sensibilidadVariables.forEach((s) => {
      expect(finito(s.margenPeor) && finito(s.margenBase) && finito(s.margenMejor) && finito(s.amplitud)).toBe(true)
    })
  })

  it('la sensibilidad por variable nunca tiene amplitud negativa (peor ≤ mejor)', () => {
    inf.sensibilidadVariables.forEach((s) => {
      expect(s.margenMejor).toBeGreaterThanOrEqual(s.margenPeor)
      expect(s.amplitud).toBeGreaterThanOrEqual(0)
    })
  })

  it('con rendimientoCanal fuera de rango (>1) el invariante optimista≥base≥pesimista se mantiene', () => {
    const raro = { ...INPUTS_EJEMPLO, rendimientoCanal: 1.5 }
    const infR = generarInforme(raro, calcular(raro))
    const m = (n: string) => infR.escenarios.find((e) => e.nombre === n)!.margenNeto
    expect(m('Optimista')).toBeGreaterThanOrEqual(m('Base'))
    expect(m('Pesimista')).toBeLessThanOrEqual(m('Base'))
  })

  it('las recomendaciones vienen ordenadas por prioridad (alta → baja)', () => {
    const orden = { alta: 0, media: 1, baja: 2 } as const
    for (let i = 1; i < inf.recomendaciones.length; i++) {
      expect(orden[inf.recomendaciones[i].prioridad]).toBeGreaterThanOrEqual(orden[inf.recomendaciones[i - 1].prioridad])
    }
  })

  it('indicadores: la señalada se expresa en % (fracción × 100)', () => {
    const ind = construirIndicadores(INPUTS_EJEMPLO, r)
    expect(ind.senaladaPct).toBeCloseTo(INPUTS_EJEMPLO.senaladaBase * 100, 6)
  })

  it('sin datos → informe vacío', () => {
    const vacio = generarInforme(INPUTS_VACIO, calcular(INPUTS_VACIO))
    expect(vacio.vacio).toBe(true)
    expect(vacio.escenarios).toHaveLength(0)
    expect(vacio.recomendaciones).toHaveLength(0)
  })
})
