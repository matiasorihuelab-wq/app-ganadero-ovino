import type { Categoria } from './types'

// ============================================================================
//  Catálogo de categorías y estados fisiológicos.
//  Es la TAXONOMÍA del módulo (no son valores de requerimientos: esos vienen de la
//  tabla oficial en el provider). Ampliable: agregar estados/categorías acá.
// ============================================================================

export const CATEGORIAS: Categoria[] = [
  {
    id: 'ovejas',
    nombre: 'Ovejas',
    estados: [
      { id: 'vacia', nombre: 'Vacía' },
      { id: 'servicio', nombre: 'Servicio' },
      { id: 'gestacion_temprana', nombre: 'Gestación temprana' },
      { id: 'ultimo_tercio', nombre: 'Último tercio' },
      { id: 'lactancia_simple', nombre: 'Lactancia simple' },
      { id: 'lactancia_mellizos', nombre: 'Lactancia mellizos' },
    ],
  },
  {
    id: 'borregas',
    nombre: 'Borregas',
    estados: [
      { id: 'crecimiento', nombre: 'Crecimiento' },
      { id: 'servicio', nombre: 'Servicio' },
      { id: 'gestacion', nombre: 'Gestación' },
      { id: 'lactancia', nombre: 'Lactancia' },
    ],
  },
  {
    id: 'carneros',
    nombre: 'Carneros',
    estados: [
      { id: 'mantenimiento', nombre: 'Mantenimiento' },
      { id: 'servicio', nombre: 'Servicio' },
    ],
  },
]
