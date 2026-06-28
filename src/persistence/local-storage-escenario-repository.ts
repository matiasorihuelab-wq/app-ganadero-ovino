import type { Inputs } from '../engine/types'
import type { Escenario, EscenarioRepository } from './escenario-repository'

/** Clave de almacenamiento. Es compatibilidad hacia atrás: cambiarla invalida
 *  los escenarios ya guardados por los usuarios. */
const KEY = 'ganadero_escenarios_v1'

/**
 * Adapter del puerto {@link EscenarioRepository} sobre la Web Storage API.
 *
 * Es el ÚNICO lugar del código que conoce `localStorage` y el formato de
 * serialización. Depende de la interfaz `Storage` del DOM (no del global
 * `localStorage` directamente), lo que permite inyectar un almacén falso en tests.
 *
 * @param storage almacén a usar; por defecto `window.localStorage`.
 */
export function createLocalStorageEscenarioRepository(
  storage: Storage = window.localStorage,
): EscenarioRepository {
  function leer(): Escenario[] {
    try {
      return JSON.parse(storage.getItem(KEY) || '[]')
    } catch {
      return []
    }
  }

  function escribir(lista: Escenario[]): void {
    storage.setItem(KEY, JSON.stringify(lista))
  }

  return {
    listar: leer,

    guardar(nombre: string, inputs: Inputs): Escenario {
      const lista = leer()
      const id = 'scn_' + Math.random().toString(36).slice(2, 9)
      const escenario: Escenario = { id, nombre, fecha: new Date().toLocaleString('es-UY'), inputs }
      lista.push(escenario)
      escribir(lista)
      return escenario
    },

    eliminar(id: string): void {
      escribir(leer().filter((e) => e.id !== id))
    },
  }
}
