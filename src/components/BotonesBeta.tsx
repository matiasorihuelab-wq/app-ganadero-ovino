import { useState } from 'react'
import { abrirReporte, copiarDiagnostico } from '../bug-report'

/**
 * Botones de soporte de la beta (additivos, no afectan el cálculo ni la UI existente):
 * abrir el formulario de reporte y copiar información de diagnóstico.
 */
export default function BotonesBeta() {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    const ok = await copiarDiagnostico()
    setCopiado(ok)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <>
      <button
        className="btn-sec"
        onClick={abrirReporte}
        title="Reportá un error o enviá una sugerencia/mejora — abre el formulario en una pestaña nueva"
      >
        🐞 Reportar o sugerir
      </button>
      <button
        className="btn-sec"
        onClick={copiar}
        title="Copia datos de diagnóstico (versión, navegador, sistema) para pegar en el formulario o enviar por WhatsApp"
      >
        {copiado ? '✓ Diagnóstico copiado' : '📋 Copiar diagnóstico'}
      </button>
    </>
  )
}
