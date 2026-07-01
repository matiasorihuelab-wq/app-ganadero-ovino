import { describe, it, expect, beforeEach } from 'vitest'
import { logEvent, getEventos, clearEventos } from './observabilidad'

// Storage falso en memoria (vitest corre en 'node', sin localStorage).
function fakeStorage(): Storage {
  const m = new Map<string, string>()
  return {
    get length() { return m.size },
    clear() { m.clear() },
    getItem: (k) => (m.has(k) ? m.get(k)! : null),
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => { m.delete(k) },
    setItem: (k, v) => { m.set(k, String(v)) },
  } as Storage
}

describe('observabilidad (logging local)', () => {
  let st: Storage
  beforeEach(() => { st = fakeStorage() })

  it('registra un evento con event, timestamp ISO y context', () => {
    logEvent('app_abierta', { version: 'RC3' }, st)
    const [e] = getEventos(st)
    expect(e.event).toBe('app_abierta')
    expect(e.context).toEqual({ version: 'RC3' })
    expect(() => new Date(e.timestamp).toISOString()).not.toThrow()
    expect(e.timestamp).toBe(new Date(e.timestamp).toISOString())
  })

  it('acumula eventos en orden', () => {
    logEvent('a', {}, st)
    logEvent('b', {}, st)
    expect(getEventos(st).map((x) => x.event)).toEqual(['a', 'b'])
  })

  it('acota el buffer (no crece sin límite)', () => {
    for (let i = 0; i < 500; i++) logEvent('x', { i }, st)
    const ev = getEventos(st)
    expect(ev.length).toBeLessThanOrEqual(300)
    // conserva los más recientes
    expect((ev[ev.length - 1].context as { i: number }).i).toBe(499)
  })

  it('clearEventos borra el registro', () => {
    logEvent('a', {}, st)
    clearEventos(st)
    expect(getEventos(st)).toHaveLength(0)
  })

  it('es best-effort: sin storage no lanza y no registra', () => {
    expect(() => logEvent('a', {}, null)).not.toThrow()
    expect(getEventos(null)).toEqual([])
  })

  it('tolera un registro corrupto sin lanzar', () => {
    st.setItem('ganadero_eventos_v1', 'no-es-json')
    expect(() => logEvent('a', {}, st)).not.toThrow()
    // tras un valor corrupto, reinicia el buffer con el evento nuevo
    expect(getEventos(st).map((x) => x.event)).toEqual(['a'])
  })
})
