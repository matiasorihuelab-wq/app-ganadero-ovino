import type { ValorNutriente } from '../nutrientes'

// ============================================================================
//  Análisis químico del forraje — OFERTA nutricional.
//
//  ⚠️ FUTURO: el módulo de carga/laboratorio todavía NO se desarrolla. Acá queda
//  solo el CONTRATO de datos, reutilizando el catálogo de nutrientes compartido
//  (src/nutrition/nutrientes.ts). Cuando se implemente, la oferta se expresará como
//  una lista de `ValorNutriente` (MS, PB, FDN, FDA, EM, digestibilidad, minerales,
//  vitaminas…), ampliable sin tocar este contrato.
// ============================================================================

export interface AnalisisForraje {
  /** Identificación de la muestra (opcional). */
  nombre?: string
  /** Valores medidos por el análisis (cada uno con su unidad). */
  valores: ValorNutriente[]
  /** Laboratorio / fecha del análisis (opcional). */
  fuente?: string
}
