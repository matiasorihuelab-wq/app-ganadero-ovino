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
//  muestra "requerimiento no disponible (tabla pendiente de carga)".
// ============================================================================

/** Una fila de la tabla oficial: requerimiento para una categoría + estado en un
 *  rango de peso vivo. Los datos van por rango porque las tablas NRC tabulan por
 *  peso (p. ej. 50–60 kg). */
interface FilaTablaNRC {
  categoria: IdCategoria
  estado: string
  pesoMinKg: number
  pesoMaxKg: number
  requerimiento: RequerimientoNutricional
}

/**
 * Tabla NRC. VACÍA: solo estructura. Ejemplo del formato esperado (comentado):
 *
 *   {
 *     categoria: 'ovejas', estado: 'ultimo_tercio',
 *     pesoMinKg: 60, pesoMaxKg: 70,
 *     requerimiento: { emMcalDia: 0, consumoMsKgDia: 0, proteinaGDia: 0,
 *                      fuente: 'NRC 2007, Small Ruminants, Tabla ...' },
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
          consulta.pesoVivoKg >= f.pesoMinKg &&
          consulta.pesoVivoKg <= f.pesoMaxKg,
      )
      return fila ? fila.requerimiento : null
    },
  }
}
