import { useMemo, useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend,
} from 'recharts'
import type { Inputs, Resultados } from '../engine/types'
import { construirTimeline } from '../engine/timeline'
import { fmtUSD } from '../utils/format'

export default function Timeline({ inp, r }: { inp: Inputs; r: Resultados }) {
  const [verAcumulado, setVerAcumulado] = useState(true)
  const meses = useMemo(() => construirTimeline(inp, r), [inp, r])

  const data = meses.map((m) => ({
    name: m.etiqueta,
    Ingresos: Math.round(m.ingresos),
    Costos: -Math.round(m.costos),
    Flujo: Math.round(m.flujo),
    Acumulado: Math.round(m.acumulado),
  }))

  const sinFechas = !inp.fechaEncarnerada && !inp.fechaVenta
  const totalFlujo = meses.reduce((s, m) => s + m.flujo, 0)

  return (
    <div>
      <div className="kpi-card">
        <h3>📅 Evolución Temporal (Cash Flow mensual)</h3>
        {sinFechas && (
          <div className="aviso info" style={{ marginBottom: 12 }}>
            <span>🟡</span>
            <span>Cargá las fechas de <strong>encarnerada</strong>, <strong>esquila</strong> y <strong>venta</strong> (sección 2 del formulario) para ubicar ingresos y costos en el calendario real. Mostrando distribución estimada.</span>
          </div>
        )}
        <div className="checkbox-row" style={{ marginBottom: 4 }}>
          <input id="acum" type="checkbox" checked={verAcumulado} onChange={(e) => setVerAcumulado(e.target.checked)} />
          <label htmlFor="acum">Mostrar cash flow acumulado (línea)</label>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ left: 4, right: 8, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" height={56} interval={0} fontSize={10} />
            <YAxis tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)} fontSize={11} />
            <Tooltip formatter={(v: number) => fmtUSD(v)} />
            <Legend />
            <ReferenceLine y={0} stroke="#999" />
            <Bar dataKey="Ingresos" fill="#27ae60" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="Costos" fill="#e74c3c" radius={[0, 0, 3, 3]} isAnimationActive={false} />
            {verAcumulado && <Line type="monotone" dataKey="Acumulado" stroke="#4a90e2" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <details className="section" open>
        <summary>Detalle mes a mes</summary>
        <div className="body" style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Mes</th><th>Animales</th><th>Ingresos</th><th>Costos</th><th>Flujo</th><th>Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {meses.map((m, i) => (
                <tr key={i}>
                  <td>{m.etiqueta}</td>
                  <td style={{ textAlign: 'left' }}>{m.animales}</td>
                  <td className="num pos">{m.ingresos > 0 ? fmtUSD(m.ingresos) : '—'}</td>
                  <td className="num neg">{m.costos > 0 ? '−' + fmtUSD(m.costos) : '—'}</td>
                  <td className={'num ' + (m.flujo >= 0 ? 'pos' : 'neg')}>{fmtUSD(m.flujo)}</td>
                  <td className={'num ' + (m.acumulado >= 0 ? 'pos' : 'neg')}>{fmtUSD(m.acumulado)}</td>
                </tr>
              ))}
              <tr className="total">
                <td>TOTAL AÑO</td><td></td>
                <td className="num">{fmtUSD(meses.reduce((s, m) => s + m.ingresos, 0))}</td>
                <td className="num">−{fmtUSD(meses.reduce((s, m) => s + m.costos, 0))}</td>
                <td className={'num ' + (totalFlujo >= 0 ? 'pos' : 'neg')}>{fmtUSD(totalFlujo)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <p className="hint" style={{ marginTop: 8 }}>
            La suma anual coincide con el <strong>margen neto</strong> del dashboard. Los ingresos por lana se ubican
            en el mes de esquila y los de carne en el mes de venta; mano de obra y costos fijos se prorratean mensualmente.
          </p>
        </div>
      </details>
    </div>
  )
}
