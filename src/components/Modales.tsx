import { useState } from 'react'
import type { Inputs } from '../engine/types'
import { calcular } from '../engine/calc'
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
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
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
        const r = calcular(e.inputs)
        return (
          <div className="scn-row" key={e.id}>
            <div className="nm">{e.nombre}<div className="mt">{e.fecha} · MN {fmtUSD(r.margenNeto, 0)}</div></div>
            <button className="btn-pri" onClick={() => { onLoad(e.inputs); onClose() }}>Cargar</button>
            <button className="btn-danger" onClick={() => { escenarioRepository.eliminar(e.id); setLista(escenarioRepository.listar()) }}>Eliminar</button>
          </div>
        )
      })}
      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <button className="btn-ghost" onClick={onClose}>Cerrar</button>
      </div>
    </Backdrop>
  )
}

export function ModalComparar({ actual, onClose }: { actual: Inputs; onClose: () => void }) {
  const lista = escenarioRepository.listar()
  const [bId, setBId] = useState(lista[0]?.id || '')
  const b = lista.find((e) => e.id === bId)
  const rA = calcular(actual)
  const rB = b ? calcular(b.inputs) : null

  // [etiqueta, A, B, decimales, esMoneda]
  const filas: [string, number, number, number, boolean][] = rB
    ? [
        ['Ingreso bruto', rA.ingresoBruto, rB.ingresoBruto, 0, true],
        ['Costos directos', rA.costosDirectosTotal, rB.costosDirectosTotal, 0, true],
        ['Costos fijos', rA.costosFijosTotal, rB.costosFijosTotal, 0, true],
        ['Margen bruto', rA.margenBruto, rB.margenBruto, 0, true],
        ['Margen neto', rA.margenNeto, rB.margenNeto, 0, true],
        ['Margen neto / ha', rA.margenNetoHa, rB.margenNetoHa, 1, true],
        ['Lana (kg)', rA.totalLanaKg, rB.totalLanaKg, 0, false],
        ['Animales', rA.totalAnimales, rB.totalAnimales, 0, false],
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
          {filas.map(([lbl, va, vb, dec, money]) => {
            const delta = va - vb
            const cls = delta >= 0 ? 'pos' : 'neg'
            const fmt = (n: number) => (money ? fmtUSD(n, dec) : fmtNum(n, dec))
            return (
              <Cells key={lbl} lbl={lbl} a={fmt(va)} b={fmt(vb)} d={(delta >= 0 ? '+' : '') + fmtNum(delta, dec)} cls={cls} />
            )
          })}
        </div>
      ) : <p className="hint">Guardá al menos un escenario para comparar.</p>}
      <div style={{ textAlign: 'right', marginTop: 12 }}>
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
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={wide ? { width: 'min(760px, 94vw)' } : undefined} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
