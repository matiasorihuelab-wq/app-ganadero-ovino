import type {
  ConsultaRequerimiento,
  NutrientRequirementProvider,
} from './requirements'

// ============================================================================
//  Cálculo de requerimientos nutricionales.
//  NO modela ni estima: consulta el requerimiento oficial (del provider) y lo
//  combina con el análisis del forraje. Flujo único, sin ecuaciones propias.
// ============================================================================

/** Análisis químico del forraje. Hoy el cálculo usa solo `emMcalKgMs`; el resto
 *  se recoge para mostrar y para ampliaciones futuras. */
export interface AnalisisForraje {
  emMcalKgMs: number  // Energía metabolizable (Mcal EM / kg MS) — único usado en el cálculo
  pbPorc?: number     // Proteína bruta (%)  — informativo / futuro
  fdnPorc?: number    // FDN (%)             — informativo / futuro
  fdaPorc?: number    // FDA (%)             — informativo / futuro
}

export interface ResultadoRequerimiento {
  /** false si la tabla oficial no tiene el dato para la consulta. */
  disponible: boolean
  emPorAnimalDia: number       // Mcal EM / animal / día (requerimiento)
  emRodeoDia: number           // Mcal EM / día del rodeo (= por animal × cantidad)
  kgMsRequeridosDia: number    // kg MS / día requeridos por el rodeo (= necesidad / EM forraje)
  necesidadEnergetica: number  // Mcal EM / día requeridas por el rodeo
  ofertaEnergetica: number     // Mcal EM / día que el rodeo puede consumir de este forraje
  balance: number              // oferta − necesidad (Mcal EM / día)
  fuente: string               // referencia bibliográfica del requerimiento
}

const VACIO: ResultadoRequerimiento = {
  disponible: false,
  emPorAnimalDia: 0,
  emRodeoDia: 0,
  kgMsRequeridosDia: 0,
  necesidadEnergetica: 0,
  ofertaEnergetica: 0,
  balance: 0,
  fuente: '',
}

/**
 * Consulta el requerimiento de la categoría/estado/peso, lo escala por la cantidad
 * de animales y lo balancea contra el aporte energético del forraje.
 *
 *   necesidad     = EM requerida/animal × cantidad
 *   kg MS req.    = necesidad / EM del forraje
 *   oferta        = consumo esperado/animal × EM forraje × cantidad
 *   balance       = oferta − necesidad
 */
export function calcularRequerimiento(
  provider: NutrientRequirementProvider,
  consulta: ConsultaRequerimiento,
  cantidadAnimales: number,
  forraje: AnalisisForraje,
): ResultadoRequerimiento {
  const req = provider.requerimiento(consulta)
  if (!req) return VACIO

  const cantidad = Math.max(0, cantidadAnimales)
  const emForraje = forraje.emMcalKgMs

  const emPorAnimalDia = req.emMcalDia
  const emRodeoDia = emPorAnimalDia * cantidad
  const necesidadEnergetica = emRodeoDia
  const kgMsRequeridosDia = emForraje > 0 ? necesidadEnergetica / emForraje : 0
  const ofertaEnergetica = req.consumoMsKgDia * emForraje * cantidad

  return {
    disponible: true,
    emPorAnimalDia,
    emRodeoDia,
    kgMsRequeridosDia,
    necesidadEnergetica,
    ofertaEnergetica,
    balance: ofertaEnergetica - necesidadEnergetica,
    fuente: req.fuente,
  }
}
