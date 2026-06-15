import type { Inputs } from '../engine/types'

const KEY = 'ganadero_escenarios_v1'

export interface Escenario {
  id: string
  nombre: string
  fecha: string
  inputs: Inputs
}

export function listarEscenarios(): Escenario[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function guardarEscenario(nombre: string, inputs: Inputs): Escenario {
  const lista = listarEscenarios()
  const id = 'scn_' + Math.random().toString(36).slice(2, 9)
  const e: Escenario = { id, nombre, fecha: new Date().toLocaleString('es-UY'), inputs }
  lista.push(e)
  localStorage.setItem(KEY, JSON.stringify(lista))
  return e
}

export function eliminarEscenario(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(listarEscenarios().filter((e) => e.id !== id)))
}
