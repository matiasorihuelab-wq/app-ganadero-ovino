import type { Inputs, Resultados } from '../engine/types'

function descargar(nombre: string, contenido: string, tipo: string) {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}

export function exportarCSV(inp: Inputs, r: Resultados) {
  const sep = ';'
  const rows: (string | number)[][] = [
    ['App Rentabilidad Ovina — Reporte'],
    ['Predio', inp.nombrePredio || '(sin nombre)'],
    ['Raza', inp.raza || '(genérico)'],
    [],
    ['PRODUCCIÓN'],
    ['Total lana limpia (kg)', r.totalLanaKg.toFixed(1)],
    ['Lana por cabeza (kg)', r.lanaPorCab.toFixed(2)],
    ['Micronaje ponderado (µ)', r.micronajePonderado.toFixed(2)],
    ['Total carne (kg)', r.totalCarneKg.toFixed(1)],
    ['Total animales en stock', r.totalAnimales.toFixed(0)],
    [],
    ['CATEGORÍAS', 'Cantidad', 'Lana kg/cab', 'Micras', 'Sanidad/cab', 'Esquila/cab'],
    ...r.filas.map((f) => [f.nombre, f.cantidad.toFixed(1), f.pesoLana.toFixed(2), f.micras ? f.micras.toFixed(1) : '', f.costoSanidad.toFixed(2), f.costoEsquila.toFixed(2)]),
    [],
    ['INGRESOS'],
    ['Ingreso lana (USD)', r.ingresoLana.toFixed(2)],
    ['Ingreso carne (USD)', r.ingresoCarne.toFixed(2)],
    ['Ingreso bruto (USD)', r.ingresoBruto.toFixed(2)],
    [],
    ['COSTOS DIRECTOS'],
    ['Sanidad', r.costoSanidadTotal.toFixed(2)],
    ['Esquila', r.costoEsquilaTotal.toFixed(2)],
    ['Alimentación', r.costoAlimTotal.toFixed(2)],
    ['Carneros', r.costoCarnerosTotal.toFixed(2)],
    ['Total directos', r.costosDirectosTotal.toFixed(2)],
    [],
    ['COSTOS FIJOS / COMERCIALIZACIÓN'],
    ['Comisiones', r.comisiones.toFixed(2)],
    ['IMEBA', r.imeba.toFixed(2)],
    ['INIA', r.inia.toFixed(2)],
    ['MEVIR', r.mevir.toFixed(2)],
    ['INAC', r.inac.toFixed(2)],
    ['Mano de obra', r.manoDeObra.toFixed(2)],
    ['Renta', r.renta.toFixed(2)],
    ['Contribución', r.contribucion.toFixed(2)],
    ['Total fijos', r.costosFijosTotal.toFixed(2)],
    [],
    ['RESULTADO'],
    ['Margen bruto (USD)', r.margenBruto.toFixed(2)],
    ['Ingreso de capital (USD)', r.ingresoCapital.toFixed(2)],
    ['Margen neto (USD)', r.margenNeto.toFixed(2)],
    ['Margen neto / ha', r.margenNetoHa.toFixed(2)],
    ['Margen neto / oveja madre', r.margenNetoPorOveja.toFixed(2)],
  ]
  const csv = rows.map((r) => r.join(sep)).join('\n')
  descargar(`rentabilidad_${(inp.nombrePredio || 'predio').replace(/\s+/g, '_')}.csv`, '﻿' + csv, 'text/csv;charset=utf-8')
}

export function exportarPDF() {
  // Reutiliza el diálogo de impresión del navegador (Guardar como PDF)
  window.print()
}
