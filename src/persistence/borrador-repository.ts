import type { Inputs } from '../engine/types'

/** Clave del borrador en curso (distinta de los escenarios con nombre). */
const KEY = 'ganadero_borrador_v1'

/**
 * Puerto para el **borrador actual**: el estado de inputs que el usuario está
 * editando, autoguardado para que no se pierda al recargar o cerrar el navegador.
 * Es independiente de los escenarios con nombre ({@link EscenarioRepository}).
 */
export interface BorradorRepository {
  /** Devuelve el borrador guardado, o null si no hay / no se puede leer. */
  cargar(): Inputs | null
  /** Persiste el borrador actual. */
  guardar(inputs: Inputs): void
  /** Elimina el borrador. */
  limpiar(): void
}

/** Adapter de {@link BorradorRepository} sobre la Web Storage API (inyectable). */
export function createLocalStorageBorradorRepository(
  storage: Storage = window.localStorage,
): BorradorRepository {
  return {
    cargar() {
      try {
        const raw = storage.getItem(KEY)
        return raw ? (JSON.parse(raw) as Inputs) : null
      } catch {
        return null
      }
    },
    guardar(inputs: Inputs) {
      // No-op ante cuota llena / storage bloqueado (modo privado): no debe tumbar
      // la UI, sobre todo corriendo en cada cambio del borrador.
      try {
        storage.setItem(KEY, JSON.stringify(inputs))
      } catch {
        /* persistencia best-effort */
      }
    },
    limpiar() {
      storage.removeItem(KEY)
    },
  }
}
