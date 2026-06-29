import { useEffect, useState } from 'react'
import type { Inputs } from '../engine/types'
import { calcular } from '../engine/calc'
import { sanitizeInputs } from '../engine/presets'
import { escenarioRepository, type Escenario } from '../persistence'
import { fmtUSD, fmtNum } from '../utils/format'

export function ModalGuardar({ inp, onClose }: { inp: Inputs; onClose: () => void }) {
  const [nombre, setNombre] = useState(inp.nombrePredio || '')
  return (
    <Backdrop onClose={onClose}>
      <h2>💾 Guardar escenario</h2>
      <div className="field">
        <label>Nombre del escenario</label>
        <input autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Merino Aust. 2024 Pesado" />
      </div>
      <div className="modal-actions">
        <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn-pri" disabled={!nombre.trim()} onClick={() => { escenarioRepository.guardar(nombre.trim(), inp); onClose() }}>Guardar</button>
      </div>
    </Backdrop>
  )
}

export function ModalCargar({ onClose, onLoad }: { onClose: () => void; onLoad: (inp: Inputs) => void }) {
  const [lista, setLista] = useState<Escenario[]>(escenarioRepository.listar())
  return (
    <Backdrop onClose={onClose}>
      <h2>📂 Cargar escenario</h2>
      {lista.length === 0 && <p className="hint">No hay escenarios guardados todavía.</p>}
      {lista.map((e) => {
        const r = calcular(sanitizeInputs(e.inputs))
        return (
          <div className="scn-row" key={e.id}>
            <div className="nm">{e.nombre}<div className="mt">{e.fecha} · MN {fmtUSD(r.margenNeto, 0)}</div></div>
            <button className="btn-pri" onClick={() => { onLoad(sanitizeInputs(e.inputs)); onClose() }}>Cargar</button>
            <button className="btn-danger" onClick={() => { if (confirm(`¿Eliminar el escenario "${e.nombre}"?`)) { escenarioRepository.eliminar(e.id); setLista(escenarioRepository.listar()) } }}>Eliminar</button>
          </div>
        )
      })}
      <div className="modal-actions">
        <button className="btn-ghost" onClick={onClose}>Cerrar</button>
      </div>
    </Backdrop>
  )
}

/** Una fila de la grilla de comparación A vs B. */
interface FilaComparacion {
  etiqueta: string
  a: number
  b: number
  dec: number      // decimales a mostrar
  moneda: boolean  // formatear como USD (true) o como cantidad (false)
}

export function ModalComparar({ actual, onClose }: { actual: Inputs; onClose: () => void }) {
  const lista = escenarioRepository.listar()
  const [bId, setBId] = useState(lista[0]?.id || '')
  const b = lista.find((e) => e.id === bId)
  const rA = calcular(actual)
  const rB = b ? calcular(sanitizeInputs(b.inputs)) : null

  const filas: FilaComparacion[] = rB
    ? [
        { etiqueta: 'Ingreso bruto', a: rA.ingresoBruto, b: rB.ingresoBruto, dec: 0, moneda: true },
        { etiqueta: 'Costos directos', a: rA.costosDirectosTotal, b: rB.costosDirectosTotal, dec: 0, moneda: true },
        { etiqueta: 'Costos fijos', a: rA.costosFijosTotal, b: rB.costosFijosTotal, dec: 0, moneda: true },
        { etiqueta: 'Margen bruto', a: rA.margenBruto, b: rB.margenBruto, dec: 0, moneda: true },
        { etiqueta: 'Margen neto', a: rA.margenNeto, b: rB.margenNeto, dec: 0, moneda: true },
        { etiqueta: 'Margen neto / ha', a: rA.margenNetoHa, b: rB.margenNetoHa, dec: 1, moneda: true },
        { etiqueta: 'Lana (kg)', a: rA.totalLanaKg, b: rB.totalLanaKg, dec: 0, moneda: false },
        { etiqueta: 'Animales', a: rA.totalAnimales, b: rB.totalAnimales, dec: 0, moneda: false },
      ]
    : []

  return (
    <Backdrop onClose={onClose} wide>
      <h2>🔄 Comparar escenarios</h2>
      <div className="field">
        <label>Escenario B (A = configuración actual)</label>
        <select value={bId} onChange={(e) => setBId(e.target.value)}>
          {lista.length === 0 && <option value="">— sin escenarios guardados —</option>}
          {lista.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>
      {rB ? (
        <div className="cmp-grid">
          <div className="h">Indicador</div><div className="h">A (actual)</div><div className="h">B</div><div className="h">Δ</div>
          {filas.map(({ etiqueta, a, b, dec, moneda }) => {
            const delta = a - b
            const cls = delta >= 0 ? 'pos' : 'neg'
            const fmt = (n: number) => (moneda ? fmtUSD(n, dec) : fmtNum(n, dec))
            return (
              <Cells key={etiqueta} lbl={etiqueta} a={fmt(a)} b={fmt(b)} d={(delta >= 0 ? '+' : '') + fmtNum(delta, dec)} cls={cls} />
            )
          })}
        </div>
      ) : <p className="hint">Guardá al menos un escenario para comparar.</p>}
      <div className="modal-actions">
        <button className="btn-ghost" onClick={onClose}>Cerrar</button>
      </div>
    </Backdrop>
  )
}

function Cells({ lbl, a, b, d, cls }: { lbl: string; a: string; b: string; d: string; cls: string }) {
  return (
    <>
      <div>{lbl}</div>
      <div className="v">{a}</div>
      <div className="v">{b}</div>
      <div className={'v ' + cls}>{d}</div>
    </>
  )
}

function Backdrop({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  // Cerrar con Escape (expectativa universal de un diálogo).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" style={wide ? { width: 'min(760px, 94vw)' } : undefined} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
