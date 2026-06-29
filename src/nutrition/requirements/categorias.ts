import type { Categoria } from './types'

// ============================================================================
//  Catálogo de categorías y estados fisiológicos.
//  Es la TAXONOMÍA del módulo (no son valores de requerimientos: esos vienen de la
//  tabla oficial, en el provider). Ampliable: agregar estados/categorías acá.
//
//  Cada estado puede declarar `nivelesProductivos` cuando el requerimiento dependa de
//  un nivel productivo (p. ej. producción de leche en lactancia). Hoy se dejan sin
//  niveles (estructura lista, sin datos inventados); se cargan junto con las tablas.
// ============================================================================

export const CATEGORIAS: Categoria[] = [
  {
    id: 'ovejas',
    nombre: 'Ovejas',
    estados: [
      { id: 'mantenimiento', nombre: 'Mantenimiento' },
      { id: 'servicio', nombre: 'Servicio' },
      { id: 'gestacion_temprana', nombre: 'Gestación temprana' },
      { id: 'gestacion_media', nombre: 'Gestación media' },
      { id: 'gestacion_final', nombre: 'Gestación final' },
      { id: 'lactancia_simple', nombre: 'Lactancia simple' },
      { id: 'lactancia_doble', nombre: 'Lactancia doble' },
      { id: 'recuperacion_postdestete', nombre: 'Recuperación postdestete' },
    ],
  },
  {
    id: 'borregas',
    nombre: 'Borregas',
    estados: [
      { id: 'crecimiento', nombre: 'Crecimiento' },
      { id: 'pre_servicio', nombre: 'Pre servicio' },
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
      { id: 'recuperacion', nombre: 'Recuperación' },
    ],
  },
]
