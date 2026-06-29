import { useMemo, useState } from 'react'
import { NumberField, SelectField } from './Campos'
import { fmtNum } from '../utils/format'
import { requirementProvider, type IdCategoria } from '../nutrition/requirements'
import { calcularRequerimiento, type AnalisisForraje } from '../nutrition/calcular'

// ============================================================================
//  Requerimientos Nutricionales.
//  Consulta requerimientos OFICIALES (NRC y, en el futuro, INRA/AFRC/CSIRO) vía
//  el provider. No modela ni estima: solo consulta y balancea contra el forraje.
// ============================================================================

export default function Nutricion() {
  const categorias = requirementProvider.categorias()

  const [catId, setCatId] = useState<IdCategoria>(categorias[0].id)
  const cat = categorias.find((c) => c.id === catId) ?? categorias[0]
  const [estadoId, setEstadoId] = useState(cat.estados[0].id)
  const [pesoVivo, setPesoVivo] = useState(0)
  const [cantidad, setCantidad] = useState(0)
  const [forraje, setForraje] = useState<AnalisisForraje>({ emMcalKgMs: 0, pbPorc: 0, fdnPorc: 0, fdaPorc: 0 })
  const setF = (p: Partial<AnalisisForraje>) => setForraje((prev) => ({ ...prev, ...p }))

  const cambiarCategoria = (id: IdCategoria) => {
    setCatId(id)
    const nueva = categorias.find((c) => c.id === id) ?? categorias[0]
    setEstadoId(nueva.estados[0].id)
  }

  const res = useMemo(
    () => calcularRequerimiento(requirementProvider, { categoria: catId, estado: estadoId, pesoVivoKg: pesoVivo }, cantidad, forraje),
    [catId, estadoId, pesoVivo, cantidad, forraje],
  )

  return (
    <div>
      {/* Requerimientos del rodeo */}
      <div className="kpi-card">
        <h3>🐑 Requerimientos del rodeo</h3>
        <div className="grid2">
          <SelectField label="Categoría animal" value={catId} onChange={cambiarCategoria}
            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))} />
          <SelectField label="Estado fisiológico" value={estadoId} onChange={setEstadoId}
            options={cat.estados.map((e) => ({ value: e.id, label: e.nombre }))} />
          <NumberField label="Peso vivo promedio" value={pesoVivo} onChange={setPesoVivo} suffix="kg" />
          <NumberField label="Cantidad de animales" value={cantidad} onChange={setCantidad} suffix="#" />
        </div>
      </div>

      {/* Análisis del forraje (consume el análisis químico; hoy solo EM entra al cálculo) */}
      <div className="kpi-card">
        <h3>🌿 Análisis del forraje</h3>
        <div className="grid2">
          <NumberField label="EM del forraje" value={forraje.emMcalKgMs} onChange={(v) => setF({ emMcalKgMs: v })} suffix="Mcal/kg MS" step={0.1} />
          <NumberField label="PB" value={forraje.pbPorc ?? 0} onChange={(v) => setF({ pbPorc: v })} suffix="%" hint="informativo" />
          <NumberField label="FDN" value={forraje.fdnPorc ?? 0} onChange={(v) => setF({ fdnPorc: v })} suffix="%" hint="informativo" />
          <NumberField label="FDA" value={forraje.fdaPorc ?? 0} onChange={(v) => setF({ fdaPorc: v })} suffix="%" hint="informativo" />
        </div>
      </div>

      {/* Resultado */}
      <div className="kpi-card">
        <h3>📋 Resultado</h3>
        {res.disponible ? (
          <>
            <div className="kpi-mini-grid">
              <div className="kpi-mini"><div className="v">{fmtNum(res.emPorAnimalDia, 2)}</div><div className="k">Mcal EM / animal / día</div></div>
              <div className="kpi-mini"><div className="v">{fmtNum(res.emRodeoDia, 1)}</div><div className="k">Mcal EM del rodeo / día</div></div>
              <div className="kpi-mini"><div className="v">{fmtNum(res.kgMsRequeridosDia, 1)}</div><div className="k">kg MS requeridos / día</div></div>
            </div>
            <p className="hint" style={{ marginTop: 8 }}>Fuente: {res.fuente}</p>
          </>
        ) : (
          <div className="aviso info">
            <span>🟡</span>
            <span>Requerimiento no disponible: la tabla oficial ({requirementProvider.nombre}) todavía no tiene
              cargados estos valores. Ver <code>docs/nutricion/</code>.</span>
          </div>
        )}
      </div>

      {/* Balance */}
      {res.disponible && (
        <div className="kpi-card">
          <h3>⚖️ Balance</h3>
          <div className="kpi-line"><span className="lbl">Necesidad energética</span><span className="val">{fmtNum(res.necesidadEnergetica, 1)} Mcal EM</span></div>
          <div className="kpi-line"><span className="lbl">Oferta energética</span><span className="val">{fmtNum(res.ofertaEnergetica, 1)} Mcal EM</span></div>
          <div className="kpi-line total"><span className="lbl">Balance</span><span className={'val ' + (res.balance >= 0 ? 'pos' : 'neg')}>{(res.balance >= 0 ? '+' : '') + fmtNum(res.balance, 1)} Mcal EM</span></div>
        </div>
      )}
    </div>
  )
}
