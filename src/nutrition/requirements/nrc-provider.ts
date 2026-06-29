import type {
  Categoria,
  ConsultaRequerimiento,
  IdCategoria,
  NutrientRequirementProvider,
  RequerimientoNutricional,
} from './types'
import { CATEGORIAS } from './categorias'

// ============================================================================
//  Provider NRC — Nutrient Requirements of Small Ruminants (NRC, 2007).
//
//  ⚠️ La tabla está VACÍA a propósito: en esta etapa solo se prepara la
//  infraestructura. NO se cargan datos oficiales todavía.
//  Cargar los valores en TABLA_NRC con su referencia bibliográfica (ver
//  docs/nutricion/). Hasta entonces, `requerimiento()` devuelve null y la UI
//  informa que el requerimiento no está disponible.
// ============================================================================

/**
 * Una fila de la tabla oficial: el requerimiento (multi-nutriente) para una
 * categoría + estado + rango de peso vivo y, cuando corresponda, un nivel productivo.
 * Las tablas NRC tabulan por peso, por eso el dato va por rango.
 */
interface FilaTablaNRC {
  categoria: IdCategoria
  estado: string
  /** Nivel productivo, cuando el estado lo requiere (debe coincidir con el de la consulta). */
  nivelProductivo?: string
  pesoMinKg: number
  pesoMaxKg: number
  requerimiento: RequerimientoNutricional
}

/**
 * Tabla NRC. VACÍA: solo estructura. Ejemplo del formato esperado (comentado):
 *
 *   {
 *     categoria: 'ovejas', estado: 'gestacion_final',
 *     pesoMinKg: 50, pesoMaxKg: 60,
 *     requerimiento: {
 *       fuente: 'NRC 2007, Small Ruminants, Tabla ...',
 *       valores: [
 *         { nutriente: 'em',        valor: 0, unidad: 'Mcal EM/día' },
 *         { nutriente: 'proteina',  valor: 0, unidad: 'g/día' },
 *         { nutriente: 'consumoMs', valor: 0, unidad: 'kg MS/día' },
 *         { nutriente: 'calcio',    valor: 0, unidad: 'g/día' },
 *         { nutriente: 'fosforo',   valor: 0, unidad: 'g/día' },
 *       ],
 *     },
 *   },
 *
 * TODO(nrc): cargar los valores oficiales del NRC 2007 con su referencia.
 */
const TABLA_NRC: FilaTablaNRC[] = [
  // (sin datos todavía — ver docs/nutricion/)
]

export function createNRCProvider(): NutrientRequirementProvider {
  return {
    nombre: 'NRC',
    categorias(): Categoria[] {
      return CATEGORIAS
    },
    requerimiento(consulta: ConsultaRequerimiento): RequerimientoNutricional | null {
      const fila = TABLA_NRC.find(
        (f) =>
          f.categoria === consulta.categoria &&
          f.estado === consulta.estado &&
          (f.nivelProductivo === undefined || f.nivelProductivo === consulta.nivelProductivo) &&
          consulta.pesoVivoKg >= f.pesoMinKg &&
          consulta.pesoVivoKg <= f.pesoMaxKg,
      )
      return fila ? fila.requerimiento : null
    },
  }
}
