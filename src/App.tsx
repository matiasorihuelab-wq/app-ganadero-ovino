import { useEffect, useMemo, useRef, useState } from 'react'
import type { Inputs } from './engine/types'
import { calcular } from './engine/calc'
import { INPUTS_VACIO, INPUTS_EJEMPLO, sanitizeInputs } from './engine/presets'
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

type ModalActivo = null | 'guardar' | 'cargar' | 'comparar'
type Vista = 'dashboard' | 'timeline' | 'informe' | 'nutricion'

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

  // ¿Hay datos cargados? (para confirmar antes de pisarlos). El borrador se
  // autoguarda, así que reemplazar sin avisar perdería el trabajo en curso.
  const tieneDatos = () => JSON.stringify(inp) !== JSON.stringify(INPUTS_VACIO)
  const cargarEjemplo = () => { if (!tieneDatos() || confirm('¿Cargar el ejemplo y reemplazar los datos actuales?')) setInp(INPUTS_EJEMPLO) }
  const limpiar = () => { if (confirm('¿Vaciar todos los campos?')) setInp(INPUTS_VACIO) }
  const cargarEscenario = (inputs: Inputs) => { if (!tieneDatos() || confirm('¿Cargar este escenario y reemplazar los datos actuales?')) setInp(inputs) }

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
          <button className="btn-sec" onClick={cargarEjemplo}>Cargar ejemplo</button>
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
