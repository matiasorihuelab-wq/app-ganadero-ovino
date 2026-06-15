import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import type { Inputs, Resultados } from '../engine/types'
import { fmtUSD, fmtNum, fmtPct } from '../utils/format'

const COLORS = ['#2d5016', '#8b7355', '#4a90e2', '#e0a800', '#27ae60', '#a0522d', '#7b68ee']

export default function ResultadosPanel({ inp, r }: { inp: Inputs; r: Resultados }) {
  const signo = (n: number) => (n >= 0 ? 'pos' : 'neg')

  const ingresoData = [
    { name: 'Lana', value: Math.max(0, r.ingresoLana) },
    { name: 'Carne', value: Math.max(0, r.ingresoCarne) },
  ].filter((d) => d.value > 0)

  const costoData = [
    { name: 'Sanidad', value: r.costoSanidadTotal },
    { name: 'Esquila', value: r.costoEsquilaTotal },
    { name: 'Alimentación', value: r.costoAlimTotal },
    { name: 'Carneros', value: r.costoCarnerosTotal },
    { name: 'Comercializ.', value: r.comisiones + r.imeba + r.inia + r.mevir + r.inac },
    { name: 'Mano de obra', value: r.manoDeObra },
    { name: 'Renta+Contr.', value: r.renta + r.contribucion },
  ].filter((d) => d.value > 0)

  const margenCatData = r.filas
    .filter((f) => f.cantidad > 0.01)
    .map((f) => ({ name: f.nombre, ug: round(f.ug) }))

  const sinDatos = r.ingresoBruto === 0 && r.costosFijosTotal === 0

  if (sinDatos) {
    return (
      <div className="empty-state">
        <div className="big">🐑</div>
        <h2>Comenzá a cargar tus datos</h2>
        <p>Ingresá las ovejas, pesos y precios en el formulario de la izquierda.<br />Los resultados se calculan en tiempo real.</p>
        <p className="hint">¿Querés ver un ejemplo? Usá el botón <strong>"Cargar ejemplo"</strong> arriba.</p>
      </div>
    )
  }

  return (
    <div>
      {/* KPIs principales */}
      <div className="kpi-card">
        <h3>📊 Resumen de Rentabilidad</h3>
        <div className="kpi-line"><span className="lbl">Ingresos totales</span><span className="val pos">{fmtUSD(r.ingresoBruto)}</span></div>
        <div className="kpi-line"><span className="lbl">Costos directos</span><span className="val neg">−{fmtUSD(r.costosDirectosTotal)}</span></div>
        <div className="kpi-line"><span className="lbl">Costos fijos</span><span className="val neg">−{fmtUSD(r.costosFijosTotal)}</span></div>
        <div className="kpi-line total"><span className="lbl">Margen neto total</span><span className={'val ' + signo(r.margenNeto)}>{fmtUSD(r.margenNeto)}</span></div>
        <div className="kpi-mini-grid">
          <div className="kpi-mini"><div className={'v ' + signo(r.margenNetoHa)}>{fmtUSD(r.margenNetoHa)}</div><div className="k">Margen / ha</div></div>
          <div className="kpi-mini"><div className={'v ' + signo(r.margenNetoPorOveja)}>{fmtUSD(r.margenNetoPorOveja, 1)}</div><div className="k">Margen / oveja</div></div>
          <div className="kpi-mini"><div className="v">{fmtNum(r.ingresoBruto ? (r.margenBruto / r.ingresoBruto) * 100 : 0, 0)}%</div><div className="k">Margen bruto</div></div>
        </div>
      </div>

      {/* Producción */}
      <div className="kpi-card">
        <h3>📈 Producción</h3>
        <div className="kpi-mini-grid">
          <div className="kpi-mini"><div className="v">{fmtNum(r.totalLanaKg, 0)}</div><div className="k">kg lana limpia/año</div></div>
          <div className="kpi-mini"><div className="v">{fmtNum(r.superficieTotal ? r.totalLanaKg / r.superficieTotal : 0, 1)}</div><div className="k">kg lana / ha</div></div>
          <div className="kpi-mini"><div className="v">{fmtNum(r.micronajePonderado, 1)}</div><div className="k">micronaje pond. (µ)</div></div>
          <div className="kpi-mini"><div className="v">{fmtNum(r.totalAnimales, 0)}</div><div className="k">animales en stock</div></div>
          <div className="kpi-mini"><div className="v">{fmtNum(r.totalCarneKg, 0)}</div><div className="k">kg carne</div></div>
          <div className="kpi-mini"><div className="v">{fmtNum(r.dotacionOvinos, 2)}</div><div className="k">dotación ovina (UG/ha)</div></div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <div className="chart-card">
          <h4>Composición de Ingresos</h4>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={ingresoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} isAnimationActive={false} label={(e: any) => `${e.name} ${(e.percent * 100).toFixed(0)}%`}>
                {ingresoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmtUSD(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h4>Desglose de Costos</h4>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={costoData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)} fontSize={11} />
              <YAxis type="category" dataKey="name" width={78} fontSize={11} />
              <Tooltip formatter={(v: number) => fmtUSD(v)} />
              <Bar dataKey="value" fill="#8b7355" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {costoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <h4>Unidades Ganaderas (UG) por categoría</h4>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={margenCatData} margin={{ left: 0, right: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} fontSize={10} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend />
              <Bar name="UG" dataKey="ug" fill="#2d5016" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla 1: producción / categorías */}
      <details className="section" open style={{ marginTop: 14 }}>
        <summary>Detalle por categoría animal</summary>
        <div className="body" style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Categoría</th><th>Cant.</th><th>Lana kg/cab</th><th>Micras</th><th>UG</th><th>Sanidad/cab</th></tr>
            </thead>
            <tbody>
              {r.filas.filter((f) => f.cantidad > 0.01).map((f) => (
                <tr key={f.clave}>
                  <td>{f.nombre}</td>
                  <td className="num">{fmtNum(f.cantidad, 0)}</td>
                  <td className="num">{fmtNum(f.pesoLana, 2)}</td>
                  <td className="num">{f.micras ? fmtNum(f.micras, 1) : '—'}</td>
                  <td className="num">{fmtNum(f.ug, 2)}</td>
                  <td className="num">{fmtUSD(f.costoSanidad, 2)}</td>
                </tr>
              ))}
              <tr className="total"><td>TOTAL</td><td className="num">{fmtNum(r.totalAnimales, 0)}</td><td className="num">{fmtNum(r.totalLanaKg, 0)} kg</td><td></td><td className="num">{fmtNum(r.totalUG, 1)}</td><td></td></tr>
            </tbody>
          </table>
        </div>
      </details>

      {/* Tabla 2: costos */}
      <details className="section" open>
        <summary>Desglose de costos</summary>
        <div className="body">
          <table className="tbl">
            <thead><tr><th>Concepto</th><th>USD</th></tr></thead>
            <tbody>
              <tr><td>Sanidad</td><td className="num">{fmtUSD(r.costoSanidadTotal, 0)}</td></tr>
              <tr><td>Esquila</td><td className="num">{fmtUSD(r.costoEsquilaTotal, 0)}</td></tr>
              <tr><td>Alimentación</td><td className="num">{fmtUSD(r.costoAlimTotal, 0)}</td></tr>
              <tr><td>Carneros (reposición)</td><td className="num">{fmtUSD(r.costoCarnerosTotal, 0)}</td></tr>
              <tr className="total"><td>Costos directos</td><td className="num">{fmtUSD(r.costosDirectosTotal, 0)}</td></tr>
              <tr><td>Comisiones + IMEBA + INIA + MEVIR + INAC</td><td className="num">{fmtUSD(r.comisiones + r.imeba + r.inia + r.mevir + r.inac, 0)}</td></tr>
              <tr><td>Mano de obra</td><td className="num">{fmtUSD(r.manoDeObra, 0)}</td></tr>
              <tr><td>Renta + Contribución</td><td className="num">{fmtUSD(r.renta + r.contribucion, 0)}</td></tr>
              <tr className="total"><td>Costos fijos + comercialización</td><td className="num">{fmtUSD(r.costosFijosTotal, 0)}</td></tr>
            </tbody>
          </table>
        </div>
      </details>

      {/* Tabla 3: indicadores */}
      <details className="section">
        <summary>Indicadores económicos</summary>
        <div className="body">
          <table className="tbl">
            <tbody>
              <tr><td>Ingreso bruto lana</td><td className="num">{fmtUSD(r.ingresoLana, 0)} ({fmtPct(r.ibLanaPct, 0)})</td></tr>
              <tr><td>Ingreso bruto carne</td><td className="num">{fmtUSD(r.ingresoCarne, 0)} ({fmtPct(r.ibCarnePct, 0)})</td></tr>
              <tr><td>IB / hectárea</td><td className="num">{fmtUSD(r.superficieTotal ? r.ingresoBruto / r.superficieTotal : 0, 1)}</td></tr>
              <tr><td>IB / UG</td><td className="num">{fmtUSD(r.ibUG, 1)}</td></tr>
              <tr><td>Margen bruto</td><td className="num">{fmtUSD(r.margenBruto, 0)}</td></tr>
              <tr><td>Margen bruto / ha</td><td className="num">{fmtUSD(r.margenBrutoHa, 1)}</td></tr>
              <tr><td>Precio lana aplicado</td><td className="num">{fmtUSD(r.precioLanaUSD, 2)}/kg</td></tr>
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

function round(n: number) { return Math.round(n * 100) / 100 }
