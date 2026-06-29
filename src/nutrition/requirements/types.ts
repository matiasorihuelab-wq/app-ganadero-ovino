// ============================================================================
//  Módulo de Requerimientos Nutricionales — tipos de dominio.
//
//  Este módulo NO modela ni estima: CONSULTA requerimientos provenientes de tablas
//  oficiales (NRC y, en el futuro, INRA / AFRC / CSIRO). La UI nunca conoce la
//  fuente de los datos: habla con un NutrientRequirementProvider.
// ============================================================================

/** Categorías animales soportadas (estructura ampliable). */
export type IdCategoria = 'ovejas' | 'borregas' | 'carneros'

/** Estado fisiológico (cada categoría define los suyos). */
export interface EstadoFisiologico {
  id: string
  nombre: string
}

/** Una categoría con sus estados fisiológicos. */
export interface Categoria {
  id: IdCategoria
  nombre: string
  estados: EstadoFisiologico[]
}

/** Clave de consulta a la tabla oficial. */
export interface ConsultaRequerimiento {
  categoria: IdCategoria
  estado: string
  pesoVivoKg: number
}

/**
 * Requerimiento nutricional oficial para una combinación categoría + estado +
 * peso vivo. Inicialmente la UI usa solo `emMcalDia` y `consumoMsKgDia`; el resto
 * queda como estructura para ampliar (proteína, fibras, minerales) sin romper nada.
 */
export interface RequerimientoNutricional {
  emMcalDia: number          // Mcal EM / animal / día (requerimiento energético)
  consumoMsKgDia: number     // kg MS / animal / día (consumo esperado / capacidad de ingesta)
  proteinaGDia?: number      // g de proteína / día (ampliación futura)
  /** Referencia bibliográfica del dato (p. ej. "NRC 2007, Tabla 11-1"). Obligatoria:
   *  ningún requerimiento se usa sin fuente. */
  fuente: string
}

/**
 * Puerto: la app consulta requerimientos sin saber de qué sistema provienen.
 * Implementaciones futuras: NRCProvider, INRAProvider, AFRCProvider, CSIROProvider.
 */
export interface NutrientRequirementProvider {
  /** Nombre del sistema de referencia (p. ej. 'NRC'). */
  readonly nombre: string
  /** Catálogo de categorías y estados fisiológicos disponibles. */
  categorias(): Categoria[]
  /** Requerimiento para la consulta, o `null` si la tabla no tiene ese dato. */
  requerimiento(consulta: ConsultaRequerimiento): RequerimientoNutricional | null
}
