import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/**
 * Red de contención de la UI: si un componente lanza durante el render, en vez de
 * dejar la pantalla en blanco muestra un mensaje con opciones de recuperación
 * (recargar, o limpiar el borrador guardado por si quedó corrupto). Pensado para
 * usuarios sin soporte técnico.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error): void {
    // Hook para un sink de logs futuro; por ahora a consola.
    console.error('Error no controlado en la app:', error)
  }

  private recargar = (): void => {
    window.location.reload()
  }

  private limpiarYRecargar = (): void => {
    try {
      localStorage.removeItem('ganadero_borrador_v1')
    } catch {
      /* best-effort */
    }
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <div className="big">⚠️</div>
          <h2>Ocurrió un error inesperado</h2>
          <p>La aplicación encontró un problema y no pudo continuar. Tus escenarios
            guardados no se perdieron.</p>
          <div className="acciones">
            <button className="btn-pri" onClick={this.recargar}>Recargar</button>
            <button className="btn-ghost" onClick={this.limpiarYRecargar}>
              Limpiar datos en edición y recargar
            </button>
          </div>
          <p className="hint">Si el problema persiste tras recargar, probá "Limpiar
            datos en edición" (descarta solo el borrador actual, no los escenarios guardados).</p>
        </div>
      )
    }
    return this.props.children
  }
}
