import { describe, it, expect } from 'vitest'
import { createLocalStorageEscenarioRepository } from './local-storage-escenario-repository'
import { createLocalStorageBorradorRepository } from './draft-repository'
import { INPUTS_VACIO, INPUTS_EJEMPLO } from '../engine/presets'

/** Storage en memoria para tests (implementa la interfaz Web Storage). */
function fakeStorage(): Storage {
  const m = new Map<string, string>()
  return {
    get length() { return m.size },
    clear: () => m.clear(),
    getItem: (k) => (m.has(k) ? (m.get(k) as string) : null),
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => { m.delete(k) },
    setItem: (k, v) => { m.set(k, String(v)) },
  }
}

/** Storage que falla al escribir (cuota llena / modo privado). */
function failingStorage(): Storage {
  const base = fakeStorage()
  return { ...base, setItem: () => { throw new DOMException('QuotaExceededError') } } as Storage
}

describe('EscenarioRepository (localStorage adapter)', () => {
  it('guardar → listar → eliminar (ida y vuelta)', () => {
    const repo = createLocalStorageEscenarioRepository(fakeStorage())
    expect(repo.listar()).toEqual([])
    const e = repo.guardar('Mi escenario', INPUTS_EJEMPLO)
    expect(e.nombre).toBe('Mi escenario')
    expect(e.inputs.raza).toBe(INPUTS_EJEMPLO.raza)
    expect(repo.listar()).toHaveLength(1)
    repo.eliminar(e.id)
    expect(repo.listar()).toEqual([])
  })

  it('ids únicos entre escenarios', () => {
    const repo = createLocalStorageEscenarioRepository(fakeStorage())
    const a = repo.guardar('A', INPUTS_VACIO)
    const b = repo.guardar('B', INPUTS_VACIO)
    expect(a.id).not.toBe(b.id)
  })

  it('listar tolera JSON corrupto devolviendo []', () => {
    const s = fakeStorage()
    s.setItem('ganadero_escenarios_v1', '{no es json')
    expect(createLocalStorageEscenarioRepository(s).listar()).toEqual([])
  })

  it('guardar no lanza si el storage falla al escribir', () => {
    const repo = createLocalStorageEscenarioRepository(failingStorage())
    expect(() => repo.guardar('X', INPUTS_VACIO)).not.toThrow()
  })
})

describe('BorradorRepository (localStorage adapter)', () => {
  it('guardar → cargar → limpiar', () => {
    const repo = createLocalStorageBorradorRepository(fakeStorage())
    expect(repo.cargar()).toBeNull()
    repo.guardar({ ...INPUTS_VACIO, ovejasEncarneradas: 320 })
    expect(repo.cargar()?.ovejasEncarneradas).toBe(320)
    repo.limpiar()
    expect(repo.cargar()).toBeNull()
  })

  it('cargar tolera JSON corrupto devolviendo null', () => {
    const s = fakeStorage()
    s.setItem('ganadero_borrador_v1', '{roto')
    expect(createLocalStorageBorradorRepository(s).cargar()).toBeNull()
  })

  it('guardar no lanza si el storage falla', () => {
    const repo = createLocalStorageBorradorRepository(failingStorage())
    expect(() => repo.guardar(INPUTS_VACIO)).not.toThrow()
  })
})
