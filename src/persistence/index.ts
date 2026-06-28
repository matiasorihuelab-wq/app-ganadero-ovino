import { createLocalStorageEscenarioRepository } from './local-storage-escenario-repository'
import type { EscenarioRepository } from './escenario-repository'

export type { Escenario, EscenarioRepository } from './escenario-repository'

/**
 * Composition root de la persistencia: instancia única que usa toda la app,
 * tipada como el puerto {@link EscenarioRepository}.
 *
 * Para migrar a otra implementación (p. ej. un backend HTTP) se cambia SOLO esta
 * línea por otro adapter; ningún consumidor necesita modificarse.
 */
export const escenarioRepository: EscenarioRepository = createLocalStorageEscenarioRepository()
