import { useMemo } from 'react'
import type { Inputs, Resultados } from '../engine/types'
import { generarInforme, type Prioridad, type Severidad } from '../engine/analisis'
import { exportarPDF } from '../utils/exportar'
import { logEvent } from '../observabilidad'
import { fmtUSD, fmtNum } from '../utils/format'
import { APP_VERSION_LABEL } from '../version'

const SEV_LABEL: Record<Severidad, string> = { critico: 'Crítico', alto: 'Alto', medio: 'Medio', ok: 'Fortaleza' }
const PRIO_LABEL: Record<Prioridad, string> = { alta: 'Alta', media: 'Media', baja: 'Baja' }

export default function Informe({ inp, r }: { inp: Inputs; r: Resultados }) {
  const informe = useMemo(() => generarInforme(inp, r), [inp, r])

  if (informe.vacio) {
    return (
      <div className="empty-state">
        <div className="big">📋</div>
        <h2>Informe de análisis crítico</h2>
        <p>Cargá los datos de tu establecimiento (o usá <strong>"Cargar ejemplo"</strong>) para generar el diagnóstico,<br />las recomendaciones y el análisis de sensibilidad económica.</p>
      </div>
    )
  }

  const ind = informe.indicadores
  const baseMN = informe.escenarios.find((e) => e.nombre === 'Base')?.margenNeto ?? 0

  return (
    <div className="informe">
      <div className="informe-head">
        <div>
          <h2 style={{ marginBottom: 2 }}>📋 Informe de Análisis Crítico</h2>
          <div className="hint">{ind.predio} · {ind.raza} · {informe.fecha} · versión {APP_VERSION_LABEL}</div>
        </div>
        <button className="btn-sec no-print" onClick={() => { logEvent('informe_pdf'); exportarPDF() }} title="Imprimir / guardar como PDF">📥 Descargar informe (PDF)</button>
      </div>

      {/* 1. Diagnóstico */}
      <div className="kpi-card">
        <h3>1 · Diagnóstico técnico del sistema productivo</h3>
        {informe.diagnostico.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {/* 2. Eficiencia */}
      <div className="kpi-card">
        <h3>2 · Interpretación de la eficiencia productiva</h3>
        {informe.eficiencia.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {/* 3. Puntos débiles / fortalezas */}
      <div className="kpi-card">
        <h3>3 · Puntos débiles y fortalezas</h3>
        <table className="tbl">
          <thead><tr><th>Severidad</th><th>Hallazgo</th><th>Detalle</th></tr></thead>
          <tbody>
            {informe.hallazgos.map((h, i) => (
              <tr key={i}>
                <td><span className={'sev sev-' + h.severidad}>{SEV_LABEL[h.severidad]}</span></td>
                <td>{h.titulo}</td>
                <td>{h.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Recomendaciones */}
      <div className="kpi-card">
        <h3>4 · Recomendaciones técnicas priorizadas</h3>
        <table className="tbl">
          <thead><tr><th>Prioridad</th><th>Área</th><th>Recomendación</th></tr></thead>
          <tbody>
            {informe.recomendaciones.map((rec, i) => (
              <tr key={i}>
                <td><span className={'prio prio-' + rec.prioridad}>{PRIO_LABEL[rec.prioridad]}</span></td>
                <td>{rec.area}</td>
                <td>{rec.texto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Sensibilidad económica */}
      <div className="kpi-card">
        <h3>5 · Análisis de sensibilidad económica</h3>
        <p className="hint" style={{ marginTop: -2 }}>
          Escenarios recalculados con el mismo motor de cálculo, variando los supuestos indicados.
        </p>
        <h4 style={{ marginBottom: 4 }}>Escenarios</h4>
        <table className="tbl">
          <thead><tr><th>Escenario</th><th>Supuestos</th><th>Ingreso bruto</th><th>Margen neto</th><th>Margen/ha</th><th>Δ vs base</th></tr></thead>
          <tbody>
            {informe.escenarios.map((e) => (
              <tr key={e.nombre} className={e.nombre === 'Base' ? 'total' : ''}>
                <td><strong>{e.nombre}</strong></td>
                <td>{e.descripcion}</td>
                <td className="num">{fmtUSD(e.ingresoBruto, 0)}</td>
                <td className={'num ' + (e.margenNeto >= 0 ? 'pos' : 'neg')}>{fmtUSD(e.margenNeto, 0)}</td>
                <td className={'num ' + (e.margenNetoHa >= 0 ? 'pos' : 'neg')}>{fmtUSD(e.margenNetoHa, 1)}</td>
                <td className={'num ' + (e.deltaVsBasePct >= 0 ? 'pos' : 'neg')}>{e.nombre === 'Base' || baseMN === 0 ? '—' : (e.deltaVsBasePct >= 0 ? '+' : '') + fmtNum(e.deltaVsBasePct, 0) + ' %'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4 style={{ marginBottom: 4, marginTop: 12 }}>Sensibilidad por variable</h4>
        <p className="hint" style={{ marginTop: -2 }}>
          Cuánto puede variar el margen neto si cada variable cambia <strong>±10 %</strong>; se muestran el
          resultado en el sentido más y menos favorable (la amplitud indica la magnitud del impacto).
        </p>
        <table className="tbl">
          <thead><tr><th>Variable</th><th>Caso menos favorable</th><th>Base</th><th>Caso más favorable</th><th>Amplitud</th></tr></thead>
          <tbody>
            {informe.sensibilidadVariables.map((s) => (
              <tr key={s.variable}>
                <td>{s.variable}<div className="mt">{s.descripcion}</div></td>
                <td className={'num ' + (s.margenPeor >= 0 ? 'pos' : 'neg')}>{fmtUSD(s.margenPeor, 0)}</td>
                <td className="num">{fmtUSD(s.margenBase, 0)}</td>
                <td className={'num ' + (s.margenMejor >= 0 ? 'pos' : 'neg')}>{fmtUSD(s.margenMejor, 0)}</td>
                <td className="num">{fmtUSD(s.amplitud, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="hint">
        Este informe es una herramienta de apoyo a la decisión: el diagnóstico y las recomendaciones se generan a partir
        de tus indicadores; los escenarios recalculan el modelo con supuestos explícitos. Verificá siempre con criterio técnico local.
      </p>
    </div>
  )
}
