import type { Inputs, Medicamento } from './types'

// Estructura de medicamentos del modelo (nombres = lógica; precios los carga el usuario)
export const MEDICAMENTOS_BASE: Medicamento[] = [
  { nombre: 'Closantel', precio: 0, volumen: 500, dosis: 0.1, frecuencia: '1 cada 10' },
  { nombre: 'Levamisol', precio: 0, volumen: 500, dosis: 0.05, frecuencia: '1 cada 20' },
  { nombre: 'Moxidectina', precio: 0, volumen: 3000, dosis: 0.1, frecuencia: '1 cada 10' },
  { nombre: 'Rafoxanide + Lev + Iv', precio: 0, volumen: 3000, dosis: 0.1, frecuencia: '1 cada 10' },
  { nombre: 'Naphtalophos', precio: 0, volumen: 5000, dosis: 0.333, frecuencia: '1 cada 3' },
  { nombre: 'Rafoxanide', precio: 0, volumen: 3000, dosis: 0.1, frecuencia: '1 cada 10' },
  { nombre: 'Zolvix', precio: 0, volumen: 2500, dosis: 0.1, frecuencia: '1 cada 10' },
  { nombre: 'Startec', precio: 0, volumen: 5000, dosis: 0.2, frecuencia: '1 cada 5' },
]

// ============================================================================
//  PRESET GENÉRICO — todo en 0 / vacío. Sólo constantes estructurales del modelo.
// ============================================================================
export const INPUTS_VACIO: Inputs = {
  nombrePredio: '',
  raza: '',
  dotacionSegura: 0,
  pesoAdulto: 0,
  supPropiedad: 0,
  supArrendada: 0,
  cantTrabajadores: 0,
  ovejasEncarneradas: 0,
  porcReposicion: 0,

  categoriaVenta: 'Cord Dest',
  sistemaEngordeCorderos: 'Campo Natural',
  sistemaEngordeBgos: 'Campo Natural',
  senaladaBase: 0,
  fechaEncarnerada: '',
  fechaDestete: '',
  fechaVenta: '',
  fechaEsquila: '',
  precioDolar: 0,
  modoPrecios: 'últimos 2',

  micronaje: 0,
  porcPesoLanaSucia: 0,
  certificacion: false,

  mortOvejas: 0,
  mortCordSenDest: 0,
  mortCordDestEsq: 0,
  mortCordDestVenta: 0,
  mortSolteros: 0,

  precioCarneBase: 0,
  rendimientoCanal: 0,

  medicamentos: MEDICAMENTOS_BASE.map((m) => ({ ...m })),
  costoClostridiosis: 0,
  costoBano: 0,
  costoEctima: 0,
  coefSeguridad: 1.1,
  pesoDosisAdulto: 60,
  pesoDosisCordero: 45,
  pesoDosisRecria: 35,

  precioCarnero: 0,
  ovejasPorCarnero: 33,
  vidaCarneroAnios: 3,
  relacionCarnerosStock: 0.035,

  costoEsquilaUYU: 0,
  factorEsquila: 1.22,
  adicionalEsquilaUSD: 0,

  precioRacionCN: 0,
  suplDiarioCN: 0,
  duracionCN: 0,
  costoVerdeoHa: 0,

  salarioMensualUYU: 0,
  aguinaldoFactor: 14,
  cargasSociales: 1.075,
  // TODO(excel): rentaHa/contribucionHa NO son 0 en el preset "vacío", así que un
  // predio nuevo genera costo de renta/contribución "fantasma" (P22/P23>0) sin que el
  // usuario los cargue. Decidir si son constantes estructurales legítimas o deberían
  // arrancar en 0. No tocar hasta confirmar con el Excel. (M6)
  rentaHa: 60,
  contribucionHa: 8,
}

// ============================================================================
//  PRESET EJEMPLO — Merino Australiano (valores exactos del Excel de referencia)
//  Sólo para QA / demostración. Reproduce los números del Excel.
// ============================================================================
export const INPUTS_EJEMPLO: Inputs = {
  ...INPUTS_VACIO,
  nombrePredio: 'Ejemplo Merino Australiano',
  raza: 'Merino Australiano',
  dotacionSegura: 0.7,
  pesoAdulto: 47,
  supPropiedad: 597,
  supArrendada: 0,
  cantTrabajadores: 6,
  ovejasEncarneradas: 600,
  porcReposicion: 0.2,

  categoriaVenta: 'Cord Dest',
  senaladaBase: 0.8,
  fechaEncarnerada: '2024-03-15',
  fechaDestete: '2024-12-15',
  fechaVenta: '2024-09-15',
  fechaEsquila: '2024-07-15',
  precioDolar: 39,
  modoPrecios: 'últimos 2',

  micronaje: 20.5,
  porcPesoLanaSucia: 0.09,
  certificacion: false,

  mortOvejas: 0.04,
  mortCordSenDest: 0.03,
  mortCordDestEsq: 0.03,
  mortCordDestVenta: 0.03,
  mortSolteros: 0.03,

  precioCarneBase: 3.38,
  rendimientoCanal: 0.48,

  medicamentos: [
    { nombre: 'Closantel', precio: 17, volumen: 500, dosis: 0.1, frecuencia: '1 cada 10' },
    { nombre: 'Levamisol', precio: 10.6, volumen: 500, dosis: 0.05, frecuencia: '1 cada 20' },
    { nombre: 'Moxidectina', precio: 172, volumen: 3000, dosis: 0.1, frecuencia: '1 cada 10' },
    { nombre: 'Rafoxanide + Lev + Iv', precio: 108, volumen: 3000, dosis: 0.1, frecuencia: '1 cada 10' },
    { nombre: 'Naphtalophos', precio: 226, volumen: 5000, dosis: 0.333, frecuencia: '1 cada 3' },
    { nombre: 'Rafoxanide', precio: 71, volumen: 3000, dosis: 0.1, frecuencia: '1 cada 10' },
    { nombre: 'Zolvix', precio: 388, volumen: 2500, dosis: 0.1, frecuencia: '1 cada 10' },
    { nombre: 'Startec', precio: 495, volumen: 5000, dosis: 0.2, frecuencia: '1 cada 5' },
  ],
  costoClostridiosis: 15.56 / 120,
  costoBano: 0.3,
  costoEctima: 0.23 * 0.76,
  coefSeguridad: 1.1,

  precioCarnero: 440,
  ovejasPorCarnero: 33,
  vidaCarneroAnios: 3,
  relacionCarnerosStock: 0.035,

  costoEsquilaUYU: 108,
  factorEsquila: 1.22,
  adicionalEsquilaUSD: 0.1,

  precioRacionCN: 0.4,
  suplDiarioCN: 0.5,
  duracionCN: 90,
  costoVerdeoHa: 344,

  salarioMensualUYU: 31612,
  aguinaldoFactor: 14,
  cargasSociales: 1.075,
  rentaHa: 60,
  contribucionHa: 8,
}
