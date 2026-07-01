// ============================================================================
//  Observabilidad ligera — logging LOCAL de uso en campo (sin backend, sin APIs
//  externas). Guarda eventos en localStorage como un buffer acotado. Es
//  best-effort: nunca rompe la UI si el almacenamiento falla o está lleno.
//
//  No registra datos personales: el `context` debe llevar solo metadatos
//  (banderas, contadores, nombres de evento), nunca valores sensibles del usuario.
// ============================================================================

export interface EventoLog {
  event: string
  timestamp: string   // ISO 8601
  context: Record<string, unknown>
}

const KEY = 'ganadero_eventos_v1'
const MAX = 300 // buffer acotado: se descartan los más viejos

function storageDefault(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

function leer(storage: Storage): EventoLog[] {
  try {
    const raw = storage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/** Registra un evento de uso. `storage` es inyectable (default: localStorage). */
export function logEvent(
  event: string,
  context: Record<string, unknown> = {},
  storage: Storage | null = storageDefault(),
): void {
  if (!storage) return
  try {
    const arr = leer(storage)
    arr.push({ event, timestamp: new Date().toISOString(), context })
    if (arr.length > MAX) arr.splice(0, arr.length - MAX)
    storage.setItem(KEY, JSON.stringify(arr))
  } catch {
    /* observabilidad best-effort: nunca debe tumbar la app */
  }
}

/** Devuelve los eventos registrados (para análisis de uso). */
export function getEventos(storage: Storage | null = storageDefault()): EventoLog[] {
  return storage ? leer(storage) : []
}

/** Borra el registro de eventos. */
export function clearEventos(storage: Storage | null = storageDefault()): void {
  try {
    storage?.removeItem(KEY)
  } catch {
    /* noop */
  }
}

/**
 * Expone helpers en consola para inspección en campo (sin backend):
 *   ganaderoObs.eventos()  → lista de eventos
 *   ganaderoObs.limpiar()  → borra el registro
 */
export function exponerEnConsola(): void {
  if (typeof window === 'undefined') return
  ;(window as unknown as { ganaderoObs?: unknown }).ganaderoObs = {
    eventos: () => getEventos(),
    limpiar: () => clearEventos(),
  }
}
