import { useEffect, useMemo, useRef, useState } from 'react'
import type { Inputs } from './engine/types'
import { calcular } from './engine/calc'
import { INPUTS_VACIO, DEMO_STATE, sanitizeInputs } from './engine/presets'
import { validar } from './utils/validaciones'
import { exportarCSV, exportarPDF } from './utils/exportar'
import { borradorRepository } from './persistence'
import { APP_VERSION, APP_VERSION_LABEL, APP_ESTADO } from './version'
import Formulario from './components/Formulario'
import ResultadosPanel from './components/Resultados'
import Timeline from './components/Timeline'
import Informe from './components/Informe'
import Nutricion from './components/Nutricion'
import { ModalGuardar, ModalCargar, ModalComparar } from './components/Modales'
import BotonesBeta from './components/BotonesBeta'
import Documentacion from './components/Documentacion'
import { logEvent, exponerEnConsola } from './observabilidad'

type ModalActivo = null | 'guardar' | 'cargar' | 'comparar'
type Vista = 'dashboard' | 'timeline' | 'informe' | 'nutricion'

// Registro de apertura una sola vez por carga de página (resiste el doble-invoke de
// StrictMode en dev; se reinicia al recargar). Observabilidad, no afecta la lógica.
let aperturaRegistrada = false

// Borrador inicial: lo guardado (saneado sobre el vacío para tolerar campos que
// falten o esquemas viejos/corruptos) o el preset vacío. (M3)
function inicial(): Inputs {
  const guardado = borradorRepository.cargar()
  return guardado ? sanitizeInputs(guardado) : INPUTS_VACIO
}

export default function App() {
  const [inp, setInp] = useState<Inputs>(inicial)
  const [modal, setModal] = useState<ModalActivo>(null)
  const [vista, setVista] = useState<Vista>('dashboard')

  // Autoguardado del borrador con debounce (no escribe en cada tecla). (M3, H-14)
  useEffect(() => {
    const id = setTimeout(() => borradorRepository.guardar(inp), 400)
    return () => clearTimeout(id)
  }, [inp])

  // Flush del último cambio al ocultar/cerrar la pestaña (no perder lo tipeado
  // dentro de la ventana de debounce).
  const inpRef = useRef(inp)
  inpRef.current = inp
  useEffect(() => {
    const flush = () => { if (document.visibilityState === 'hidden') borradorRepository.guardar(inpRef.current) }
    document.addEventListener('visibilitychange', flush)
    return () => document.removeEventListener('visibilitychange', flush)
  }, [])

  const set = (patch: Partial<Inputs>) => setInp((prev) => ({ ...prev, ...patch }))
  const r = useMemo(() => calcular(inp), [inp])
  const avisos = useMemo(() => validar(inp, r), [inp, r])

  // ---- Observabilidad ligera (local, sin backend) ----
  const rRef = useRef(r)
  rRef.current = r
  // Referencia del último inp registrado: sólo se loguea ante un cambio real de estado
  // (un edit produce un objeto nuevo). Evita logs espurios en mount y en StrictMode.
  const ultimoInpLogueado = useRef(inp)
  const cargaProgramatica = useRef(false) // ejemplo/limpiar/escenario no son "ediciones"

  useEffect(() => {
    if (!aperturaRegistrada) {
      aperturaRegistrada = true
      logEvent('app_abierta', { version: APP_VERSION })
    }
    exponerEnConsola()
  }, [])

  // "cambios en inputs del predio" + "ejecución de cálculo" (con debounce, sin datos sensibles)
  useEffect(() => {
    if (inp === ultimoInpLogueado.current) return // sin cambio real de estado
    ultimoInpLogueado.current = inp
    if (cargaProgramatica.current) { cargaProgramatica.current = false; return }
    const id = setTimeout(() => {
      logEvent('inputs_editados')
      logEvent('calculo_ejecutado', { rentable: (rRef.current?.margenNeto ?? 0) >= 0 })
    }, 1200)
    return () => clearTimeout(id)
  }, [inp])

  // "uso del módulo de sensibilidad" (vive en la pestaña Informe). Solo cuando el
  // informe tiene contenido (con datos): el estado vacío no computa sensibilidad.
  useEffect(() => {
    const rr = rRef.current
    const informeConDatos = !!rr && !(rr.ingresoBruto === 0 && rr.costosFijosTotal === 0)
    if (vista === 'informe' && informeConDatos) logEvent('sensibilidad_usada')
  }, [vista])

  // ¿Hay datos cargados? (para confirmar antes de pisarlos). El borrador se
  // autoguarda, así que reemplazar sin avisar perdería el trabajo en curso.
  const tieneDatos = () => JSON.stringify(inp) !== JSON.stringify(INPUTS_VACIO)
  const cargarEjemplo = () => { if (!tieneDatos() || confirm('¿Cargar el ejemplo y reemplazar los datos actuales?')) { cargaProgramatica.current = true; setInp(DEMO_STATE); logEvent('ejemplo_cargado', { predio: 'CICOMA-SUL' }) } }
  // ¿el formulario actual es exactamente el ejemplo CICOMA-SUL? (para cambiar la sugerencia).
  const ejemploCargado = JSON.stringify(inp) === JSON.stringify(DEMO_STATE)
  const limpiar = () => { if (confirm('¿Vaciar todos los campos?')) { if (inp !== INPUTS_VACIO) cargaProgramatica.current = true; setInp(INPUTS_VACIO) } }
  const cargarEscenario = (inputs: Inputs) => { if (!tieneDatos() || confirm('¿Cargar este escenario y reemplazar los datos actuales?')) { cargaProgramatica.current = true; setInp(inputs) } }

  return (
    <>
      <header className="header">
        <div>
          <h1>🐑 Análisis de Rentabilidad Ovina <span className="ver-badge" title={`${APP_ESTADO} · ${APP_VERSION}`}>{APP_VERSION_LABEL}</span></h1>
          <div className="sub">Template genérico · cualquier raza · cálculos en tiempo real</div>
        </div>
        <div className="raza-input">
          <label>Raza</label>
          <input value={inp.raza} placeholder="Ej: Corriedale, Merino…" onChange={(e) => set({ raza: e.target.value })} />
        </div>
        <div className="spacer" />
        <div className="toolbar">
          <button className="btn-sec" onClick={cargarEjemplo} disabled={ejemploCargado} title="Carga el establecimiento de ejemplo CICOMA-SUL (reemplaza los datos actuales)">{ejemploCargado ? '✓ Ejemplo cargado' : 'Cargar ejemplo: CICOMA-SUL'}</button>
          <button className="btn-sec" onClick={limpiar}>Limpiar</button>
          <button className="btn-sec" onClick={() => setModal('guardar')}>💾 Guardar</button>
          <button className="btn-sec" onClick={() => setModal('cargar')}>📂 Cargar</button>
          <button className="btn-sec" onClick={() => setModal('comparar')}>🔄 Comparar</button>
          <button className="btn-sec" onClick={() => exportarCSV(inp, r)}>📊 CSV</button>
          <button className="btn-sec" onClick={exportarPDF}>📥 PDF</button>
          <Documentacion />
          <BotonesBeta />
        </div>
      </header>

      <div className="layout">
        <div className="col-form">
          <Formulario inp={inp} set={set} />
        </div>
        <div className="col-result">
          <div className="tabs">
            <button className={vista === 'dashboard' ? 'tab on' : 'tab'} onClick={() => setVista('dashboard')}>📊 Dashboard</button>
            <button className={vista === 'timeline' ? 'tab on' : 'tab'} onClick={() => setVista('timeline')}>📅 Evolución</button>
            <button className={vista === 'informe' ? 'tab on' : 'tab'} onClick={() => setVista('informe')}>📋 Informe</button>
            <button className={vista === 'nutricion' ? 'tab on' : 'tab'} onClick={() => setVista('nutricion')} title="Módulo en construcción">🚧 Requerimientos</button>
          </div>
          {avisos.length > 0 && (
            <div className="avisos">
              {avisos.map((a, i) => (
                <div key={i} className={'aviso ' + a.tipo}>
                  <span>{a.tipo === 'err' ? '🔴' : a.tipo === 'warn' ? '⚠️' : '🟡'}</span>
                  <span>{a.msg}</span>
                </div>
              ))}
            </div>
          )}
          {vista === 'dashboard' && <ResultadosPanel r={r} />}
          {vista === 'timeline' && <Timeline inp={inp} r={r} />}
          {vista === 'informe' && <Informe inp={inp} r={r} />}
          {vista === 'nutricion' && <Nutricion />}
        </div>
      </div>

      {modal === 'guardar' && <ModalGuardar inp={inp} onClose={() => setModal(null)} />}
      {modal === 'cargar' && <ModalCargar onClose={() => setModal(null)} onLoad={cargarEscenario} />}
      {modal === 'comparar' && <ModalComparar actual={inp} onClose={() => setModal(null)} />}
    </>
  )
}
