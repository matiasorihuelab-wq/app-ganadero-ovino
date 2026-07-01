import { APP_VERSION, APP_VERSION_LABEL } from './version'

// ============================================================================
//  Reporte de errores de la beta.
//  La URL del formulario es configurable: pegá acá la URL del formulario (Google
//  Forms, Tally, etc.) cuando lo crees. Ver docs/usuario/reportar-errores.md.
// ============================================================================

/** URL del formulario de reporte de problemas. REEMPLAZAR por la real. */
export const BUG_REPORT_URL = 'https://forms.gle/SNB65tBVXHMuUUGk7'

/** Abre el formulario de reporte en una pestaña nueva. */
export function abrirReporte(): void {
  window.open(BUG_REPORT_URL, '_blank', 'noopener,noreferrer')
}

function detectarNavegador(ua: string): string {
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Chrome\//.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari'
  return 'Otro'
}

function detectarSO(ua: string): string {
  if (/Windows/.test(ua)) return 'Windows'
  if (/Android/.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone / iPad'
  if (/Mac OS X|Macintosh/.test(ua)) return 'Mac'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Otro'
}

/** Texto de diagnóstico (sin datos personales) listo para pegar en el formulario
 *  o enviar por WhatsApp. */
export function infoDiagnostico(): string {
  const ua = navigator.userAgent
  const ahora = new Date()
  return [
    `Versión: ${APP_VERSION_LABEL} (${APP_VERSION})`,
    `Fecha: ${ahora.toLocaleDateString('es-UY')}`,
    `Hora: ${ahora.toLocaleTimeString('es-UY')}`,
    `Navegador: ${detectarNavegador(ua)}`,
    `Sistema operativo: ${detectarSO(ua)}`,
    `Idioma: ${navigator.language}`,
    `User Agent: ${ua}`,
  ].join('\n')
}

/** Copia la info de diagnóstico al portapapeles. Devuelve si lo logró. */
export async function copiarDiagnostico(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(infoDiagnostico())
    return true
  } catch {
    return false
  }
}
