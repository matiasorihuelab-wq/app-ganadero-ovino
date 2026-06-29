import { createLocalStorageEscenarioRepository } from './local-storage-escenario-repository'
import { createLocalStorageBorradorRepository } from './draft-repository'
import type { EscenarioRepository } from './escenario-repository'
import type { BorradorRepository } from './draft-repository'

export type { Escenario, EscenarioRepository } from './escenario-repository'
export type { BorradorRepository } from './draft-repository'

/**
 * Composition root de la persistencia: instancias únicas que usa toda la app,
 * tipadas como sus puertos. Para migrar a otra implementación (p. ej. un backend
 * HTTP) se cambian SOLO estas líneas por otros adapters; los consumidores no cambian.
 */
export const escenarioRepository: EscenarioRepository = createLocalStorageEscenarioRepository()
export const borradorRepository: BorradorRepository = createLocalStorageBorradorRepository()
