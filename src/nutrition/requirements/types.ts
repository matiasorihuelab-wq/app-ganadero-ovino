import type { ValorNutriente } from '../nutrientes'

// ============================================================================
//  Requerimientos Nutricionales — tipos de dominio.
//
//  La aplicación NO calcula requerimientos: los CONSULTA desde tablas oficiales
//  (NRC y, en el futuro, INRA / AFRC / CSIRO). Sin modelo propio, sin coeficientes,
//  sin simulación. La UI nunca conoce la fuente: habla con un Provider.
// ============================================================================

/** Categorías animales soportadas (estructura ampliable). */
export type IdCategoria = 'ovejas' | 'borregas' | 'carneros'

/** Nivel productivo aplicable a un estado (p. ej. nivel de producción de leche en
 *  lactancia, o tasa de ganancia en crecimiento). El requerimiento puede depender de
 *  él "cuando corresponda". */
export interface NivelProductivo {
  id: string
  nombre: string
}

/** Estado fisiológico de una categoría. */
export interface EstadoFisiologico {
  id: string
  nombre: string
  /** Niveles productivos aplicables. Si está vacío/undefined, el requerimiento de este
   *  estado NO depende del nivel productivo (y la UI no pide ese dato). */
  nivelesProductivos?: NivelProductivo[]
}

/** Una categoría con sus estados fisiológicos. */
export interface Categoria {
  id: IdCategoria
  nombre: string
  estados: EstadoFisiologico[]
}

/**
 * Clave de consulta a la tabla oficial. El requerimiento depende de la categoría, el
 * estado fisiológico, el peso vivo y —cuando corresponda— el nivel productivo.
 */
export interface ConsultaRequerimiento {
  categoria: IdCategoria
  estado: string
  pesoVivoKg: number
  nivelProductivo?: string
}

/**
 * Requerimiento nutricional oficial para una consulta: un conjunto de nutrientes
 * (energía, proteína, consumo, minerales, vitaminas…) tal como los publica la tabla.
 * Se modela como lista de `ValorNutriente` para que agregar nutrientes no cambie el
 * tipo. Cada requerimiento cita su `fuente` (referencia bibliográfica, obligatoria).
 */
export interface RequerimientoNutricional {
  valores: ValorNutriente[]
  fuente: string
}

/**
 * Puerto: la app consulta requerimientos sin saber de qué sistema provienen.
 * Implementaciones futuras: NRCProvider (hoy), INRAProvider, AFRCProvider, CSIROProvider.
 */
export interface NutrientRequirementProvider {
  /** Nombre del sistema de referencia (p. ej. 'NRC'). */
  readonly nombre: string
  /** Catálogo de categorías y estados fisiológicos disponibles. */
  categorias(): Categoria[]
  /** Requerimiento para la consulta, o `null` si la tabla no tiene ese dato. */
  requerimiento(consulta: ConsultaRequerimiento): RequerimientoNutricional | null
}
