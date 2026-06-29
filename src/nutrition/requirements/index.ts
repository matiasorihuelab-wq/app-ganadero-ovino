import { createNRCProvider } from './nrc-provider'
import type { NutrientRequirementProvider } from './types'

export type {
  Categoria,
  EstadoFisiologico,
  NivelProductivo,
  IdCategoria,
  ConsultaRequerimiento,
  RequerimientoNutricional,
  NutrientRequirementProvider,
} from './types'

/**
 * Composition root del módulo nutricional: el provider de requerimientos activo.
 * Para cambiar de sistema de referencia (INRA, AFRC, CSIRO…) se reemplaza SOLO esta
 * línea por otro provider que implemente NutrientRequirementProvider; ni la UI ni el
 * resto del módulo cambian.
 */
export const requirementProvider: NutrientRequirementProvider = createNRCProvider()
