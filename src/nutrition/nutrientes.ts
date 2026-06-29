// ============================================================================
//  Catálogo de nutrientes — compartido por TODO el módulo nutricional.
//
//  Es la lista única y AMPLIABLE de nutrientes que el sistema entiende. Hoy la usan
//  los requerimientos oficiales; mañana la usarán el análisis químico del forraje
//  (oferta) y el balance (oferta vs requerimiento). Agregar un nutriente nuevo es
//  sumar un id acá + su definición: ni la UI ni los providers necesitan cambiar.
//
//  ⚠️ Este archivo NO contiene valores: solo identifica nutrientes y su unidad
//  típica. Los valores provienen de tablas oficiales (requerimiento) o de un
//  análisis de laboratorio (oferta).
// ============================================================================

/** Identificador de nutriente. Ampliar la unión para soportar más nutrientes. */
export type NutrienteId =
  // Energía / proteína / consumo
  | 'em'            // Energía metabolizable
  | 'proteina'      // Proteína (cruda / metabolizable, según la tabla)
  | 'consumoMs'     // Consumo esperado de materia seca
  // Minerales mayores
  | 'calcio'
  | 'fosforo'
  | 'magnesio'
  | 'potasio'
  | 'sodio'
  | 'azufre'
  // Minerales traza
  | 'cobre'
  | 'zinc'
  | 'manganeso'
  | 'hierro'
  | 'molibdeno'
  | 'selenio'
  | 'cobalto'
  // Vitaminas
  | 'vitaminaA'
  | 'vitaminaD'
  | 'vitaminaE'

/** Agrupación para presentar/ordenar los nutrientes. */
export type GrupoNutriente = 'energia' | 'proteina' | 'consumo' | 'mineral' | 'vitamina'

export interface DefinicionNutriente {
  id: NutrienteId
  nombre: string
  grupo: GrupoNutriente
  /** Unidad típica del REQUERIMIENTO (referencial; cada valor lleva su propia unidad,
   *  porque la oferta del forraje suele expresarse distinto —p. ej. % o mg/kg MS). */
  unidad: string
}

/**
 * Un valor de nutriente: sirve tanto para un requerimiento (de la tabla oficial)
 * como, en el futuro, para la oferta (análisis del forraje). Lleva su propia unidad.
 */
export interface ValorNutriente {
  nutriente: NutrienteId
  valor: number
  unidad: string
}

/** Catálogo. Orden = orden de presentación. Ampliable. */
export const NUTRIENTES: DefinicionNutriente[] = [
  { id: 'em', nombre: 'Energía metabolizable', grupo: 'energia', unidad: 'Mcal EM/día' },
  { id: 'proteina', nombre: 'Proteína', grupo: 'proteina', unidad: 'g/día' },
  { id: 'consumoMs', nombre: 'Consumo esperado', grupo: 'consumo', unidad: 'kg MS/día' },
  { id: 'calcio', nombre: 'Calcio', grupo: 'mineral', unidad: 'g/día' },
  { id: 'fosforo', nombre: 'Fósforo', grupo: 'mineral', unidad: 'g/día' },
  { id: 'magnesio', nombre: 'Magnesio', grupo: 'mineral', unidad: 'g/día' },
  { id: 'potasio', nombre: 'Potasio', grupo: 'mineral', unidad: 'g/día' },
  { id: 'sodio', nombre: 'Sodio', grupo: 'mineral', unidad: 'g/día' },
  { id: 'azufre', nombre: 'Azufre', grupo: 'mineral', unidad: 'g/día' },
  { id: 'cobre', nombre: 'Cobre', grupo: 'mineral', unidad: 'mg/día' },
  { id: 'zinc', nombre: 'Zinc', grupo: 'mineral', unidad: 'mg/día' },
  { id: 'manganeso', nombre: 'Manganeso', grupo: 'mineral', unidad: 'mg/día' },
  { id: 'hierro', nombre: 'Hierro', grupo: 'mineral', unidad: 'mg/día' },
  { id: 'molibdeno', nombre: 'Molibdeno', grupo: 'mineral', unidad: 'mg/día' },
  { id: 'selenio', nombre: 'Selenio', grupo: 'mineral', unidad: 'mg/día' },
  { id: 'cobalto', nombre: 'Cobalto', grupo: 'mineral', unidad: 'mg/día' },
  { id: 'vitaminaA', nombre: 'Vitamina A', grupo: 'vitamina', unidad: 'UI/día' },
  { id: 'vitaminaD', nombre: 'Vitamina D', grupo: 'vitamina', unidad: 'UI/día' },
  { id: 'vitaminaE', nombre: 'Vitamina E', grupo: 'vitamina', unidad: 'UI/día' },
]

const POR_ID = new Map<NutrienteId, DefinicionNutriente>(NUTRIENTES.map((n) => [n.id, n]))

/** Definición de un nutriente por id (o undefined si no está en el catálogo). */
export function definicionNutriente(id: NutrienteId): DefinicionNutriente | undefined {
  return POR_ID.get(id)
}
