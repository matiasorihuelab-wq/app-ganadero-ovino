import type { Inputs } from '../engine/types'

/** Un escenario guardado: una configuración de inputs con nombre y fecha. */
export interface Escenario {
  id: string
  nombre: string
  fecha: string
  inputs: Inputs
}

/**
 * Puerto de persistencia de escenarios (patrón ports & adapters).
 *
 * La aplicación depende de esta interfaz, NO de `localStorage` ni de ninguna
 * tecnología concreta. Hoy la implementa un adapter sobre `localStorage`; el día
 * que exista un backend, se implementa otro adapter (p. ej. HTTP) sin tocar la UI.
 *
 * Es síncrono por decisión deliberada (ver docs/adr/0002-storage-abstraction.md):
 * `localStorage` lo es y no queremos introducir asincronía antes de que un backend
 * real la requiera.
 */
export interface EscenarioRepository {
  /** Devuelve todos los escenarios guardados (lista vacía si no hay o si falla la lectura). */
  listar(): Escenario[]
  /** Crea y persiste un escenario nuevo a partir de un nombre y los inputs actuales. */
  guardar(nombre: string, inputs: Inputs): Escenario
  /** Elimina el escenario con el id dado (no-op si no existe). */
  eliminar(id: string): void
}
