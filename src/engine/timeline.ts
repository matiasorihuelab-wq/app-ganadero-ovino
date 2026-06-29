// ============================================================================
//  Evolución temporal — distribuye los totales ANUALES (ya validados) en un
//  calendario de 12 meses según el ciclo productivo. La suma mensual reconcilia
//  exactamente con el margen neto anual.
// ============================================================================
import type { Inputs, Resultados } from './types'

export interface MesFlujo {
  etiqueta: string
  animales: string
  ingresos: number
  costos: number
  flujo: number
  acumulado: number
  // desglose
  ingLana: number
  ingCarne: number
  cSanidad: number
  cEsquila: number
  cAlim: number
  cComercial: number
  cManoObra: number
  cFijos: number
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function parseMes(s: string): { y: number; m: number } | null {
  if (!s) return null
  const [y, m] = s.split('-').map(Number)
  if (!y || !m) return null
  return { y, m: m - 1 }
}

// índice 0-11 de una fecha respecto del mes de inicio
function idxRelativo(fecha: string, baseY: number, baseM: number): number | null {
  const p = parseMes(fecha)
  if (!p) return null
  const diff = (p.y - baseY) * 12 + (p.m - baseM)
  return ((diff % 12) + 12) % 12
}

export function construirTimeline(inp: Inputs, r: Resultados): MesFlujo[] {
  // Mes base: encarnerada, o enero del año en curso si no hay fecha
  const base = parseMes(inp.fechaEncarnerada) ?? { y: new Date().getFullYear(), m: 0 }
  const meses: MesFlujo[] = Array.from({ length: 12 }, (_, i) => {
    const m = (base.m + i) % 12
    const y = base.y + Math.floor((base.m + i) / 12)
    return blank(`${MESES[m]} ${y}`)
  })

  const idxVenta = idxRelativo(inp.fechaVenta, base.y, base.m) ?? 6
  const idxEsquila = idxRelativo(inp.fechaEsquila, base.y, base.m) ?? 4
  const idxDestete = idxRelativo(inp.fechaDestete, base.y, base.m)
  // parición ≈ encarnerada + 5 meses (gestación ovina ~150 días)
  const idxParicion = 5

  // ---- Ingresos ----
  meses[idxEsquila].ingLana += r.ingresoLana
  meses[idxVenta].ingCarne += r.ingresoCarne

  // ---- Costos puntuales ----
  meses[idxEsquila].cEsquila += r.costoEsquilaTotal
  const comercial = r.comisiones + r.imeba + r.inia + r.mevir + r.inac
  meses[idxVenta].cComercial += comercial

  // ---- Sanidad: repartida en eventos sanitarios (encarnerada, parición, destete) ----
  const eventos = [0, idxParicion, idxDestete ?? idxVenta].filter((x): x is number => x != null)
  const porEvento = r.costoSanidadTotal / eventos.length
  eventos.forEach((e) => (meses[e].cSanidad += porEvento))

  // ---- Alimentación: ventana de suplementación que termina en la venta ----
  const mesesSupl = Math.max(1, Math.round(inp.duracionCN / 30))
  if (r.costoAlimTotal > 0) {
    const porMes = r.costoAlimTotal / mesesSupl
    for (let k = 0; k < mesesSupl; k++) {
      const idx = ((idxVenta - k) % 12 + 12) % 12
      meses[idx].cAlim += porMes
    }
  }

  // ---- Carneros (reposición): en el mes de encarnerada ----
  const carneros = r.costoCarnerosTotal
  meses[0].cFijos += carneros // se trata como inversión puntual al inicio

  // ---- Mano de obra y fijos (renta+contribución): mensual ----
  const manoMes = r.manoDeObra / 12
  const fijosMes = (r.renta + r.contribucion) / 12
  meses.forEach((mm) => {
    mm.cManoObra += manoMes
    mm.cFijos += fijosMes
  })

  // ---- Consolidar + acumulado + descripción de animales ----
  const ovejas = inp.ovejasEncarneradas
  const corderos = Math.round(ovejas * inp.senaladaBase * (1 - inp.mortCordSenDest))
  let acum = 0
  meses.forEach((mm, i) => {
    mm.ingresos = mm.ingLana + mm.ingCarne
    mm.costos = mm.cSanidad + mm.cEsquila + mm.cAlim + mm.cComercial + mm.cManoObra + mm.cFijos
    mm.flujo = mm.ingresos - mm.costos
    acum += mm.flujo
    mm.acumulado = acum
    // descripción de stock
    const hayCorderos = i >= idxParicion && i < (idxVenta || 12)
    mm.animales = hayCorderos
      ? `${ovejas} ov + ${corderos} cord`
      : `${ovejas} ovejas`
  })

  return meses
}

function blank(etiqueta: string): MesFlujo {
  return {
    etiqueta, animales: '', ingresos: 0, costos: 0, flujo: 0, acumulado: 0,
    ingLana: 0, ingCarne: 0, cSanidad: 0, cEsquila: 0, cAlim: 0, cComercial: 0, cManoObra: 0, cFijos: 0,
  }
}
