import { useMemo, useState } from 'react'
import type { Inputs } from './engine/types'
import { calcular } from './engine/calc'
import { INPUTS_VACIO, INPUTS_EJEMPLO } from './engine/presets'
import { validar } from './utils/validaciones'
import { exportarCSV, exportarPDF } from './utils/exportar'
import Formulario from './components/Formulario'
import ResultadosPanel from './components/Resultados'
import Timeline from './components/Timeline'
import Neb from './components/Neb'
import { ModalGuardar, ModalCargar, ModalComparar } from './components/Modales'

type ModalActivo = null | 'guardar' | 'cargar' | 'comparar'
type Vista = 'dashboard' | 'timeline' | 'neb'

export default function App() {
  const [inp, setInp] = useState<Inputs>(INPUTS_VACIO)
  const [modal, setModal] = useState<ModalActivo>(null)
  const [vista, setVista] = useState<Vista>('dashboard')

  const set = (patch: Partial<Inputs>) => setInp((prev) => ({ ...prev, ...patch }))
  const r = useMemo(() => calcular(inp), [inp])
  const avisos = useMemo(() => validar(inp, r), [inp, r])

  return (
    <>
      <header className="header">
        <div>
          <h1>🐑 Análisis de Rentabilidad Ovina</h1>
          <div className="sub">Template genérico · cualquier raza · cálculos en tiempo real</div>
        </div>
        <div className="raza-input">
          <label>Raza</label>
          <input value={inp.raza} placeholder="Ej: Corriedale, Merino…" onChange={(e) => set({ raza: e.target.value })} />
        </div>
        <div className="spacer" />
        <div className="toolbar">
          <button className="btn-sec" onClick={() => { const dirty = JSON.stringify(inp) !== JSON.stringify(INPUTS_VACIO); if (!dirty || confirm('¿Cargar el ejemplo y reemplazar los datos actuales?')) setInp(INPUTS_EJEMPLO) }}>Cargar ejemplo</button>
          <button className="btn-sec" onClick={() => { if (confirm('¿Vaciar todos los campos?')) setInp(INPUTS_VACIO) }}>Limpiar</button>
          <button className="btn-sec" onClick={() => setModal('guardar')}>💾 Guardar</button>
          <button className="btn-sec" onClick={() => setModal('cargar')}>📂 Cargar</button>
          <button className="btn-sec" onClick={() => setModal('comparar')}>🔄 Comparar</button>
          <button className="btn-sec" onClick={() => exportarCSV(inp, r)}>📊 CSV</button>
          <button className="btn-sec" onClick={exportarPDF}>📥 PDF</button>
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
            <button className={vista === 'neb' ? 'tab on' : 'tab'} onClick={() => setVista('neb')}>🔥 Energético</button>
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
          {vista === 'neb' && <Neb inp={inp} r={r} />}
        </div>
      </div>

      {modal === 'guardar' && <ModalGuardar inp={inp} onClose={() => setModal(null)} />}
      {modal === 'cargar' && <ModalCargar onClose={() => setModal(null)} onLoad={setInp} />}
      {modal === 'comparar' && <ModalComparar actual={inp} onClose={() => setModal(null)} />}
    </>
  )
}
