import { useMemo, useState } from 'react'
import type { Inputs, Resultados } from '../engine/types'
import { calcularNEB, NEB_DEFAULT, type NebParams } from '../engine/neb'
import { fmtUSD, fmtNum } from '../utils/format'

export default function Neb({ inp, r }: { inp: Inputs; r: Resultados }) {
  const [p, setP] = useState<NebParams>({ ...NEB_DEFAULT, precioRacion: inp.precioRacionCN || 0 })
  const setF = (patch: Partial<NebParams>) => setP((prev) => ({ ...prev, ...patch }))
  const res = useMemo(() => calcularNEB(inp, r, p), [inp, r, p])

  const sinPeso = !inp.pesoAdulto || !inp.ovejasEncarneradas

  return (
    <div>
      <div className="kpi-card">
        <h3>🔥 Análisis Energético (NEB)</h3>
        {sinPeso && (
          <div className="aviso info" style={{ marginBottom: 12 }}>
            <span>🟡</span>
            <span>Cargá <strong>peso adulto</strong> y <strong>ovejas madres</strong> en el formulario para calcular las necesidades energéticas del rebaño.</span>
          </div>
        )}
        <div className="grid3">
          <Num label="Temperatura promedio" suf="°C" v={p.temperatura} on={(v) => setF({ temperatura: v })} />
          <Num label="Condición corporal objetivo" suf="1-5" v={p.condicionObjetivo} on={(v) => setF({ condicionObjetivo: v })} step={0.5} />
          <Num label="Ganancia esperada" suf="g/día" v={p.ganancia} on={(v) => setF({ ganancia: v })} />
        </div>
        <details className="section" style={{ marginTop: 4 }}>
          <summary>Coeficientes del modelo (avanzado)</summary>
          <div className="body grid3">
            <Num label="Temp. crítica frío" suf="°C" v={p.tempCritica} on={(v) => setF({ tempCritica: v })} />
            <Num label="Incremento por °C frío" suf="frac" v={p.coefFrio} on={(v) => setF({ coefFrio: v })} step={0.005} />
            <Num label="Coef. mantenimiento" suf="Mcal/PV^0.75" v={p.aMant} on={(v) => setF({ aMant: v })} step={0.005} />
            <Num label="Mcal por kg ganancia" suf="Mcal/kg" v={p.mcalPorKgGanancia} on={(v) => setF({ mcalPorKgGanancia: v })} step={0.5} />
            <Num label="Densidad forraje" suf="Mcal/kg MS" v={p.densidadForraje} on={(v) => setF({ densidadForraje: v })} step={0.1} />
            <Num label="Precio ración" suf="USD/kg MS" v={p.precioRacion} on={(v) => setF({ precioRacion: v })} step={0.05} />
          </div>
        </details>
        <div className="kpi-mini-grid" style={{ marginTop: 12 }}>
          <div className="kpi-mini"><div className="v">{fmtNum(res.totalMcalDia, 0)}</div><div className="k">Mcal EM / día (rebaño)</div></div>
          <div className="kpi-mini"><div className="v">{fmtNum(res.totalRacionKg, 0)}</div><div className="k">kg MS / día</div></div>
          <div className="kpi-mini"><div className="v">{fmtUSD(res.totalCostoDia, 0)}</div><div className="k">costo ración / día</div></div>
        </div>
      </div>

      <details className="section" open>
        <summary>NEB por categoría (por animal)</summary>
        <div className="body" style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Categoría</th><th>Cant.</th><th>PV (kg)</th><th>Mant.</th><th>+Frío</th><th>+Gan.</th>
                <th>NEB total</th><th>UF</th><th>Ración kg MS</th><th>Costo/día</th>
              </tr>
            </thead>
            <tbody>
              {res.filas.map((f, i) => (
                <tr key={i}>
                  <td>{f.categoria}</td>
                  <td className="num">{fmtNum(f.cantidad, 0)}</td>
                  <td className="num">{fmtNum(f.pesoVivo, 0)}</td>
                  <td className="num">{fmtNum(f.mantenimiento, 2)}</td>
                  <td className="num">{fmtNum(f.climatico, 2)}</td>
                  <td className="num">{fmtNum(f.ganancia, 2)}</td>
                  <td className="num"><strong>{fmtNum(f.total, 2)}</strong></td>
                  <td className="num">{fmtNum(f.uf, 2)}</td>
                  <td className="num">{fmtNum(f.racionKg, 2)}</td>
                  <td className="num">{f.costoDia > 0 ? fmtUSD(f.costoDia, 2) : '—'}</td>
                </tr>
              ))}
              {res.filas.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--texto-suave)' }}>Sin datos: cargá peso adulto y rebaño.</td></tr>
              )}
            </tbody>
          </table>
          <p className="hint" style={{ marginTop: 8 }}>
            NEB en <strong>Mcal de energía metabolizable por día</strong>. UF = equivalente en unidades forrajeras (Mcal/1,7).
            Mantenimiento = coef × PV<sup>0,75</sup>; el ajuste por frío aplica bajo la temperatura crítica; la ración
            se calcula con la densidad energética del forraje elegido. Costo anual estimado de suplementación:
            <strong> {fmtUSD(res.totalCostoAnual, 0)}</strong>.
          </p>
        </div>
      </details>
    </div>
  )
}

function Num({ label, suf, v, on, step }: { label: string; suf: string; v: number; on: (v: number) => void; step?: number }) {
  return (
    <div className="field">
      <label>{label} <span className="hint">({suf})</span></label>
      <input className="num-input" type="number" step={step ?? 'any'} value={Number.isFinite(v) ? v : 0}
        onChange={(e) => on(e.target.value === '' ? 0 : parseFloat(e.target.value))} />
    </div>
  )
}
