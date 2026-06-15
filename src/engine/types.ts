// ============================================================================
//  Modelo de datos — App de Rentabilidad Ovina (template genérico)
//  Los nombres reflejan la lógica del Excel de referencia (Merino Australiano)
//  pero la app es GENÉRICA: todos los valores arrancan en 0 / vacío.
// ============================================================================

export type CategoriaVenta =
  | 'Cord Dest' // Cordero al destete (venta en pie)
  | 'Cord Pz'   // Cordero pesado (carcasa)
  | 'Cord Pes'  // Cordero pesado alternativo
  | 'Bgos 4D'   // Borrego 2-4 dientes
  | 'Cap 6/8D'  // Capón 6/8 dientes
  | 'Cap 8D'    // Capón 8+ dientes

export type SistemaEngorde = 'Campo Natural' | 'Supl. sobre CN' | 'Verdeos'
export type ModoPrecios = 'últimos 2' | 'últimos 3'

export interface Medicamento {
  nombre: string
  precio: number       // precio del envase (USD)  -> AQ
  volumen: number      // volumen/peso del envase para prorratear  -> denominador
  dosis: number        // fracción de dosis por aplicación  -> coeficiente
  frecuencia: string    // etiqueta informativa (ej: "1 cada 10")
  // costo/kg de PV = dosis * precio / volumen   (replica AO = coef*AQ/vol)
}

export interface Inputs {
  // ---- Bloque A: Predio ----
  nombrePredio: string
  raza: string
  dotacionSegura: number       // B2  (UG/ha)
  pesoAdulto: number           // B3  (kg)
  supPropiedad: number         // E3  (ha)
  supArrendada: number         // E5  (ha)
  cantTrabajadores: number     // G8
  ovejasEncarneradas: number   // B12
  porcReposicion: number       // B5  (0-1)

  // ---- Bloque B: Configuración productiva ----
  categoriaVenta: CategoriaVenta // B6
  sistemaEngordeCorderos: SistemaEngorde // B7
  sistemaEngordeBgos: SistemaEngorde     // B8
  senaladaBase: number         // B4  corderos logrados por oveja (0-1.x)
  fechaEncarnerada: string     // B9
  fechaDestete: string         // B10
  fechaVenta: string           // B11
  fechaEsquila: string         // esquila (para evolución temporal / cash flow)
  precioDolar: number          // L10 (UYU/USD)
  modoPrecios: ModoPrecios     // E19

  // ---- Bloque C: Genética y lana ----
  micronaje: number            // B13 (micras)
  porcPesoLanaSucia: number    // B14 (0-1)
  certificacion: boolean       // L12 (Grifa Verde / acondicionamiento)

  // ---- Bloque D: Mortandad ----
  mortOvejas: number           // B16
  mortCordSenDest: number      // B17
  mortCordDestEsq: number      // B18
  mortCordDestVenta: number    // B19
  mortSolteros: number         // B20

  // ---- Bloque E: Precios de carne ----
  precioCarneBase: number      // G13 (USD/kg) base del modelo
  rendimientoCanal: number     // I (0-1) rendimiento en 4ta balanza

  // ---- Bloque F: Costos de sanidad ----
  medicamentos: Medicamento[]  // tabla de medicamentos (AN/AO/AQ)
  costoClostridiosis: number   // AK8 (USD/cab)
  costoBano: number            // AK9 (USD/cab)
  costoEctima: number          // AK10 (USD/cab)
  coefSeguridad: number        // 1.1
  pesoDosisAdulto: number      // AF (kg) peso para prorratear dosis adultos
  pesoDosisCordero: number     // AF cordero venta
  pesoDosisRecria: number      // AF recría

  // ---- Carneros ----
  precioCarnero: number        // 440 (USD) costo de reposición de un carnero
  ovejasPorCarnero: number     // 33  ovejas servidas por carnero
  vidaCarneroAnios: number     // 3   años de vida útil
  relacionCarnerosStock: number // 0.035 carneros por oveja en stock

  // ---- Esquila ----
  costoEsquilaUYU: number      // base UYU (ej 108) para AB3
  factorEsquila: number        // 1.22
  adicionalEsquilaUSD: number  // 0.1

  // ---- Alimentación / Suplementación ----
  // Suplemento sobre CN (AK15..AK19)
  precioRacionCN: number       // AK15 (USD/kg)
  suplDiarioCN: number         // AK16 (kg/d)
  duracionCN: number           // AK17 (días)
  // Verdeos (AO15..AO24)
  costoVerdeoHa: number        // AO23 total verdeo (USD/ha) simplificado

  // ---- Bloque G: Costos fijos ----
  salarioMensualUYU: number    // 31612 base mensual UYU
  aguinaldoFactor: number      // 14 (sueldos/año equiv)
  cargasSociales: number       // 1.075
  rentaHa: number              // Q22 (USD/ha sobre arrendada)
  contribucionHa: number       // Q23 (USD/ha sobre propiedad)
}

export interface FilaCategoria {
  clave: string
  nombre: string
  cantidad: number      // C
  pesoLana: number      // E (kg lana/cab)
  micras: number        // F
  ug: number            // G
  costoSanidad: number  // AA (USD/cab)
  costoEsquila: number  // AB
  costoAlim: number     // AD
  costoCarnero: number  // AE
}

export interface Resultados {
  filas: FilaCategoria[]
  // Producción
  totalLanaKg: number          // C45
  lanaPorCab: number           // C47
  micronajePonderado: number   // C48
  totalCarneKg: number         // C46
  precioLanaUSD: number        // V4
  // Ingresos
  ingresoLana: number          // C39
  ingresoCarne: number         // C41
  ingresoBruto: number         // C57
  // Costos directos
  costoSanidadTotal: number    // P13
  costoEsquilaTotal: number    // Q13
  costoAlimTotal: number       // R13
  costoCarnerosTotal: number   // S13
  costosDirectosTotal: number  // P25
  // Comercialización + fijos
  comisiones: number           // P16
  imeba: number                // P17
  inia: number                 // P18
  mevir: number                // P19
  inac: number                 // P20
  manoDeObra: number           // P21
  renta: number                // P22
  contribucion: number         // P23
  costosFijosTotal: number     // P26
  // Márgenes
  margenBruto: number          // C64
  margenBrutoHa: number        // C65
  ingresoCapital: number       // C70
  margenNeto: number           // C72
  margenNetoHa: number         // C73
  margenNetoPorOveja: number
  // Stock / dotación
  totalAnimales: number        // C35
  totalUG: number              // G35
  dotacionOvinos: number       // C52
  superficieTotal: number      // E6
  ibUG: number                 // C61
  ibLanaPct: number            // C40
  ibCarnePct: number           // C42
}
