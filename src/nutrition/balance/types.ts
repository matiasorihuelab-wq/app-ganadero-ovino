import type { NutrienteId } from '../nutrientes'
import type { AnalisisForraje } from '../forraje/types'
import type { RequerimientoNutricional } from '../requirements/types'

// ============================================================================
//  Balance nutricional — OFERTA (forraje) vs REQUERIMIENTO (tabla oficial).
//
//  ⚠️ FUTURO: la lógica de comparación todavía NO se implementa (esta etapa es solo
//  arquitectura). Acá quedan los CONTRATOS para que, el día que se implemente, la UI y
//  los providers ya tengan la forma esperada. No hay fórmulas propias: el balance es
//  una comparación directa entre lo que la tabla oficial requiere y lo que el análisis
//  del forraje ofrece.
// ============================================================================

export type EstadoBalance = 'deficit' | 'adecuado' | 'exceso'

export interface BalanceNutriente {
  nutriente: NutrienteId
  requerido: number
  ofrecido: number
  diferencia: number        // ofrecido − requerido (en la unidad del nutriente)
  estado: EstadoBalance
}

export interface BalanceNutricional {
  porNutriente: BalanceNutriente[]
  /** Nutrientes limitantes (déficit), ordenados por severidad. */
  limitantes: NutrienteId[]
  deficiencias: NutrienteId[]
  excesos: NutrienteId[]
}

/**
 * Contrato de la futura comparación oferta vs requerimiento. NO implementado todavía.
 * El día que se implemente vivirá en este módulo (`src/nutrition/balance/`).
 */
export interface ComparadorNutricional {
  comparar(oferta: AnalisisForraje, requerimiento: RequerimientoNutricional): BalanceNutricional
}
