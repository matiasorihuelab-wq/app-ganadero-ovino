// ============================================================================
//  Necesidades Energéticas (NEB) — calculadora dinámica.
//  Modelo transparente basado en energía metabolizable (Mcal EM/día):
//    · Mantenimiento  = aMant × PV^0.75
//    · Ajuste climático (frío) = 1 + max(0, Tcrítica − T) × coefFrío
//    · Ajuste por condición corporal objetivo (>3 suma energía de recuperación)
//    · Ganancia       = (g/día / 1000) × Mcal por kg de PV ganado
//  Ración (kg MS/día) = NEB / densidad energética del forraje (Mcal EM/kg MS)
//  Coeficientes editables; valores por defecto de referencia para ovinos.
// ============================================================================
import type { Inputs, Resultados } from './types'

export interface NebParams {
  temperatura: number       // °C promedio
  tempCritica: number       // °C umbral de estrés por frío
  coefFrio: number          // incremento por °C bajo el umbral (fracción)
  condicionObjetivo: number // 1-5
  ganancia: number          // g/día
  aMant: number             // Mcal EM / PV^0.75 / día
  mcalPorKgGanancia: number // Mcal EM por kg de PV ganado
  densidadForraje: number   // Mcal EM / kg MS
  precioRacion: number      // USD / kg MS
}

export const NEB_DEFAULT: NebParams = {
  temperatura: 15,
  tempCritica: 20,
  coefFrio: 0.015,
  condicionObjetivo: 3,
  ganancia: 0,
  aMant: 0.1,
  mcalPorKgGanancia: 6,
  densidadForraje: 2.0,
  precioRacion: 0,
}

export interface NebFila {
  categoria: string
  cantidad: number
  pesoVivo: number
  mantenimiento: number // Mcal EM/día
  climatico: number     // Mcal extra por frío
  condicion: number     // Mcal extra por condición
  ganancia: number      // Mcal extra por ganancia
  total: number         // Mcal EM/día por animal
  uf: number            // equivalente UF (Mcal/1.7)
  racionKg: number      // kg MS/día por animal
  costoDia: number      // USD/día por animal
  costoDiaTotal: number // USD/día × cantidad
}

export interface NebResultado {
  filas: NebFila[]
  totalMcalDia: number
  totalRacionKg: number
  totalCostoDia: number
  totalCostoAnual: number
}

export function calcularNEB(inp: Inputs, r: Resultados, p: NebParams): NebResultado {
  const pa = inp.pesoAdulto || 0
  // Categorías representativas con su peso vivo y cantidad (desde el rebaño)
  const ovejas = inp.ovejasEncarneradas
  const filaCat = (clave: string) => r.filas.find((f) => f.clave === clave)?.cantidad ?? 0
  const corderos = filaCat('cord_dest') + filaCat('cord_dl_v') + filaCat('cord_dl')
  const corderas = filaCat('corderas_dl_v') + filaCat('corderas_dl')
  const borregos = filaCat('bgos') + filaCat('bgas_se') + filaCat('capones6') + filaCat('capones8')
  const carneros = filaCat('carneros')

  const cats: { categoria: string; cantidad: number; pesoVivo: number }[] = [
    { categoria: 'Oveja adulta', cantidad: ovejas, pesoVivo: pa },
    { categoria: 'Corderos', cantidad: corderos, pesoVivo: pa * 0.5 },
    { categoria: 'Corderas reposición', cantidad: corderas, pesoVivo: pa * 0.55 },
    { categoria: 'Borregos / recría', cantidad: borregos, pesoVivo: pa * 0.75 },
    { categoria: 'Carneros', cantidad: carneros, pesoVivo: pa * 1.25 },
  ].filter((c) => c.cantidad > 0.01 && c.pesoVivo > 0)

  const climFactor = 1 + Math.max(0, p.tempCritica - p.temperatura) * p.coefFrio
  const condExtra = Math.max(0, p.condicionObjetivo - 3) * 0.1 // +10% por punto sobre CC 3

  const filas: NebFila[] = cats.map((c) => {
    const mant = p.aMant * Math.pow(c.pesoVivo, 0.75)
    const climatico = mant * (climFactor - 1)
    const condicion = mant * condExtra
    const gananciaMcal = (p.ganancia / 1000) * p.mcalPorKgGanancia
    const total = mant + climatico + condicion + gananciaMcal
    const racionKg = p.densidadForraje ? total / p.densidadForraje : 0
    const costoDia = racionKg * p.precioRacion
    return {
      categoria: c.categoria,
      cantidad: c.cantidad,
      pesoVivo: c.pesoVivo,
      mantenimiento: mant,
      climatico,
      condicion,
      ganancia: gananciaMcal,
      total,
      uf: total / 1.7,
      racionKg,
      costoDia,
      costoDiaTotal: costoDia * c.cantidad,
    }
  })

  const totalMcalDia = filas.reduce((s, f) => s + f.total * f.cantidad, 0)
  const totalRacionKg = filas.reduce((s, f) => s + f.racionKg * f.cantidad, 0)
  const totalCostoDia = filas.reduce((s, f) => s + f.costoDiaTotal, 0)
  return {
    filas,
    totalMcalDia,
    totalRacionKg,
    totalCostoDia,
    totalCostoAnual: totalCostoDia * 365,
  }
}
