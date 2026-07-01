// ============================================================================
//  Análisis crítico del establecimiento + sensibilidad económica.
//
//  Módulo PURO y additivo: NO modifica el motor. Toma los indicadores ya
//  calculados (Resultados) y los Inputs, arma un JSON estructurado de indicadores
//  y produce, de forma DETERMINÍSTICA (sin IA en tiempo de ejecución):
//    - diagnóstico técnico            - puntos débiles / fortalezas
//    - interpretación de eficiencia   - recomendaciones priorizadas
//    - análisis de sensibilidad económica (base / optimista / pesimista)
//
//  La sensibilidad reutiliza el motor validado `calcular` con Inputs perturbados
//  (no hay fórmulas nuevas: se recalcula el mismo modelo).
// ============================================================================
import type { Inputs, Resultados } from './types'
import { calcular } from './calc'

// ---------- JSON estructurado de indicadores (entrada del análisis) ----------
export interface IndicadoresInforme {
  predio: string
  raza: string
  categoriaVenta: string
  // Escala
  ovejasEncarneradas: number
  superficieTotalHa: number
  totalAnimales: number
  totalUG: number
  // Reproducción / dinámica
  senaladaPct: number
  reposicionPct: number
  mortOvejasPct: number
  mortCorderosPct: number
  // Producción
  lanaPorCabKg: number
  lanaPorHaKg: number
  micronaje: number
  carneKg: number
  // Carga
  dotacionSeguraUGHa: number
  dotacionRealUGHa: number
  // Económicos (USD)
  ingresoBruto: number
  costosDirectos: number
  costosFijos: number
  margenBruto: number
  margenNeto: number
  margenNetoHa: number
  margenNetoPorOveja: number
  ibLanaPct: number
  ibCarnePct: number
  ingresoPorUG: number
}

export type Severidad = 'critico' | 'alto' | 'medio' | 'ok'
export type Prioridad = 'alta' | 'media' | 'baja'

export interface Hallazgo { titulo: string; detalle: string; severidad: Severidad }
export interface Recomendacion { area: string; prioridad: Prioridad; texto: string }

export interface EscenarioEcon {
  nombre: 'Base' | 'Optimista' | 'Pesimista'
  descripcion: string
  ingresoBruto: number
  margenNeto: number
  margenNetoHa: number
  deltaVsBasePct: number
}

export interface SensibilidadVar {
  variable: string
  descripcion: string
  // Se muestran los extremos ±10 % ordenados por resultado (peor/mejor), no por
  // dirección de la variable: así el signo del efecto no confunde cuando el modelo
  // tiene comportamientos no monótonos por categoría (el margen sigue siendo real).
  margenPeor: number
  margenBase: number
  margenMejor: number
  amplitud: number      // margenMejor − margenPeor (magnitud del impacto, ≥ 0)
}

export interface Informe {
  fecha: string
  vacio: boolean
  indicadores: IndicadoresInforme
  diagnostico: string[]
  eficiencia: string[]
  hallazgos: Hallazgo[]
  recomendaciones: Recomendacion[]
  sensibilidadVariables: SensibilidadVar[]
  escenarios: EscenarioEcon[]
}

// ---------- Indicadores ----------
export function construirIndicadores(inp: Inputs, r: Resultados): IndicadoresInforme {
  return {
    predio: inp.nombrePredio || '(sin nombre)',
    raza: inp.raza || '(genérico)',
    categoriaVenta: inp.categoriaVenta,
    ovejasEncarneradas: inp.ovejasEncarneradas,
    superficieTotalHa: r.superficieTotal,
    totalAnimales: r.totalAnimales,
    totalUG: r.totalUG,
    // clamp a ≥0: defiende el informe ante datos almacenados fuera de rango (no confía
    // en el input; los porcentajes negativos no tienen sentido productivo).
    senaladaPct: Math.max(0, inp.senaladaBase) * 100,
    reposicionPct: Math.max(0, inp.porcReposicion) * 100,
    mortOvejasPct: Math.max(0, inp.mortOvejas) * 100,
    mortCorderosPct: Math.max(0, inp.mortCordSenDest) * 100,
    lanaPorCabKg: r.lanaPorCab,
    lanaPorHaKg: r.superficieTotal ? r.totalLanaKg / r.superficieTotal : 0,
    micronaje: r.micronajePonderado,
    carneKg: r.totalCarneKg,
    dotacionSeguraUGHa: inp.dotacionSegura,
    dotacionRealUGHa: r.dotacionOvinos,
    ingresoBruto: r.ingresoBruto,
    costosDirectos: r.costosDirectosTotal,
    costosFijos: r.costosFijosTotal,
    margenBruto: r.margenBruto,
    margenNeto: r.margenNeto,
    margenNetoHa: r.margenNetoHa,
    margenNetoPorOveja: r.margenNetoPorOveja,
    ibLanaPct: r.ibLanaPct,
    ibCarnePct: r.ibCarnePct,
    ingresoPorUG: r.ibUG,
  }
}

// ---------- Sensibilidad (reutiliza el motor validado) ----------
interface Deltas { precioCarne?: number; rendimiento?: number; mortFactor?: number; costoFactor?: number }

function conDeltas(inp: Inputs, d: Deltas): Inputs {
  const fc = d.costoFactor ?? 1
  const fm = d.mortFactor ?? 1
  return {
    ...inp,
    precioCarneBase: inp.precioCarneBase * (d.precioCarne ?? 1),
    rendimientoCanal: Math.min(1, inp.rendimientoCanal * (d.rendimiento ?? 1)),
    mortOvejas: Math.min(1, inp.mortOvejas * fm),
    mortCordSenDest: Math.min(1, inp.mortCordSenDest * fm),
    mortCordDestEsq: Math.min(1, inp.mortCordDestEsq * fm),
    mortCordDestVenta: Math.min(1, inp.mortCordDestVenta * fm),
    mortSolteros: Math.min(1, inp.mortSolteros * fm),
    medicamentos: inp.medicamentos.map((m) => ({ ...m, precio: m.precio * fc })),
    costoClostridiosis: inp.costoClostridiosis * fc,
    costoBano: inp.costoBano * fc,
    costoEctima: inp.costoEctima * fc,
    costoEsquilaUYU: inp.costoEsquilaUYU * fc,
    precioRacionCN: inp.precioRacionCN * fc,
    costoVerdeoHa: inp.costoVerdeoHa * fc,
  }
}

function margenCon(inp: Inputs, d: Deltas): number {
  return calcular(conDeltas(inp, d)).margenNeto
}

function escenarios(inp: Inputs, base: Resultados): EscenarioEcon[] {
  const defs: { nombre: EscenarioEcon['nombre']; descripcion: string; d: Deltas }[] = [
    { nombre: 'Base', descripcion: 'Datos actuales, sin cambios.', d: {} },
    {
      nombre: 'Optimista',
      descripcion: 'Precio carne +10 %, rendimiento +5 %, mortandad −30 %, costos variables −5 %.',
      d: { precioCarne: 1.1, rendimiento: 1.05, mortFactor: 0.7, costoFactor: 0.95 },
    },
    {
      nombre: 'Pesimista',
      descripcion: 'Precio carne −10 %, rendimiento −5 %, mortandad +30 %, costos variables +5 %.',
      d: { precioCarne: 0.9, rendimiento: 0.95, mortFactor: 1.3, costoFactor: 1.05 },
    },
  ]
  const baseMN = base.margenNeto
  return defs.map(({ nombre, descripcion, d }) => {
    const rr = nombre === 'Base' ? base : calcular(conDeltas(inp, d))
    const deltaVsBasePct = baseMN !== 0 ? ((rr.margenNeto - baseMN) / Math.abs(baseMN)) * 100 : 0
    return {
      nombre,
      descripcion,
      ingresoBruto: rr.ingresoBruto,
      margenNeto: rr.margenNeto,
      margenNetoHa: rr.margenNetoHa,
      deltaVsBasePct,
    }
  })
}

function sensibilidadVariables(inp: Inputs, base: Resultados): SensibilidadVar[] {
  const mn = base.margenNeto
  const v = (variable: string, descripcion: string, d1: Deltas, d2: Deltas): SensibilidadVar => {
    const m1 = margenCon(inp, d1)
    const m2 = margenCon(inp, d2)
    const margenPeor = Math.min(m1, m2)
    const margenMejor = Math.max(m1, m2)
    return { variable, descripcion, margenPeor, margenBase: mn, margenMejor, amplitud: margenMejor - margenPeor }
  }
  return [
    v('Precio de la carne', 'Precio base de carne ±10 %', { precioCarne: 0.9 }, { precioCarne: 1.1 }),
    v('Peso / rendimiento de venta', 'Rendimiento de canal ±10 %', { rendimiento: 0.9 }, { rendimiento: 1.1 }),
    v('Mortandad', 'Mortandad ±10 %', { mortFactor: 0.9 }, { mortFactor: 1.1 }),
    v('Costos variables', 'Costos variables ±10 %', { costoFactor: 0.9 }, { costoFactor: 1.1 }),
  ]
}

// ---------- Narrativa (determinística) ----------
const usd = (n: number) => '$ ' + Math.round(n).toLocaleString('es-UY')
const pct = (n: number, d = 0) => n.toFixed(d) + ' %'

function diagnostico(x: IndicadoresInforme): string[] {
  const p: string[] = []
  p.push(
    `El establecimiento "${x.predio}" (raza ${x.raza}) maneja ${Math.round(x.ovejasEncarneradas).toLocaleString('es-UY')} ` +
    `ovejas encarneradas sobre ${Math.round(x.superficieTotalHa).toLocaleString('es-UY')} ha, con un stock total de ` +
    `${Math.round(x.totalAnimales).toLocaleString('es-UY')} animales (${x.totalUG.toFixed(0)} UG). ` +
    `El sistema comercializa la categoría "${x.categoriaVenta}".`,
  )
  const rentable = x.margenNeto >= 0
  p.push(
    `El resultado económico ${rentable ? 'es POSITIVO' : 'es NEGATIVO'}: el margen neto es ${usd(x.margenNeto)} ` +
    `(${usd(x.margenNetoHa)}/ha y ${usd(x.margenNetoPorOveja)}/oveja). ` +
    `Los ingresos brutos son ${usd(x.ingresoBruto)}, con costos directos de ${usd(x.costosDirectos)} y ` +
    `costos fijos/comercialización de ${usd(x.costosFijos)}.`,
  )
  p.push(
    `La estructura de ingresos se compone en ${pct(x.ibLanaPct)} de lana y ${pct(x.ibCarnePct)} de carne. ` +
    (x.ibLanaPct >= 85 || x.ibCarnePct >= 85
      ? 'El ingreso depende fuertemente de un solo producto, lo que aumenta la exposición a la volatilidad de ese precio.'
      : 'El ingreso muestra una diversificación razonable entre lana y carne.'),
  )
  return p
}

function eficiencia(x: IndicadoresInforme): string[] {
  const e: string[] = []
  e.push(
    `Producción de lana: ${x.lanaPorCabKg.toFixed(2)} kg/cabeza y ${x.lanaPorHaKg.toFixed(1)} kg/ha, ` +
    `con un micronaje ponderado de ${x.micronaje.toFixed(1)} µ ` +
    (x.micronaje > 0 && x.micronaje <= 20 ? '(lana fina, de mayor valor).'
      : x.micronaje > 24 ? '(lana gruesa, con menor precio relativo).'
        : '(finura media).'),
  )
  const carga = x.dotacionSeguraUGHa > 0 ? x.dotacionRealUGHa / x.dotacionSeguraUGHa : 0
  e.push(
    `Carga animal: la dotación real es ${x.dotacionRealUGHa.toFixed(2)} UG/ha frente a una dotación segura de ` +
    `${x.dotacionSeguraUGHa.toFixed(2)} UG/ha. ` +
    (carga > 1.1 ? 'El campo está SOBRECARGADO respecto de su capacidad segura.'
      : carga > 0 && carga < 0.7 ? 'El campo está SUBUTILIZADO: hay margen para aumentar la carga o la producción.'
        : 'La carga se ubica dentro de un rango razonable respecto de la capacidad segura.'),
  )
  e.push(
    `Eficiencia económica: el ingreso bruto por UG es ${usd(x.ingresoPorUG)} y el margen neto por oveja ` +
    `${usd(x.margenNetoPorOveja)}. La señalada es ${pct(x.senaladaPct)} (corderos por oveja) y la reposición ${pct(x.reposicionPct)}.`,
  )
  return e
}

function hallazgos(x: IndicadoresInforme): Hallazgo[] {
  const h: Hallazgo[] = []
  const carga = x.dotacionSeguraUGHa > 0 ? x.dotacionRealUGHa / x.dotacionSeguraUGHa : 0

  if (x.margenNeto < 0)
    h.push({ titulo: 'Rentabilidad negativa', severidad: 'critico', detalle: `El margen neto es ${usd(x.margenNeto)}: el sistema no cubre sus costos.` })
  if (x.mortOvejasPct > 6)
    h.push({ titulo: 'Mortandad de ovejas elevada', severidad: 'alto', detalle: `Mortandad de ovejas de ${pct(x.mortOvejasPct)} (referencia deseable < 4 %).` })
  else if (x.mortOvejasPct > 3)
    h.push({ titulo: 'Mortandad de ovejas moderada', severidad: 'medio', detalle: `Mortandad de ovejas de ${pct(x.mortOvejasPct)}; conviene monitorearla.` })
  if (x.mortCorderosPct > 12)
    h.push({ titulo: 'Alta mortandad de corderos', severidad: 'alto', detalle: `Mortandad señalada-destete de ${pct(x.mortCorderosPct)} (referencia < 10 %).` })
  if (x.senaladaPct > 0 && x.senaladaPct < 70)
    h.push({ titulo: 'Señalada baja', severidad: 'alto', detalle: `Señalada de ${pct(x.senaladaPct)}: baja eficiencia reproductiva.` })
  else if (x.senaladaPct >= 70 && x.senaladaPct < 85)
    h.push({ titulo: 'Señalada mejorable', severidad: 'medio', detalle: `Señalada de ${pct(x.senaladaPct)}: hay margen de mejora reproductiva.` })
  if (carga > 1.1)
    h.push({ titulo: 'Sobrecarga del campo', severidad: 'alto', detalle: `La dotación real (${x.dotacionRealUGHa.toFixed(2)}) supera a la segura (${x.dotacionSeguraUGHa.toFixed(2)}) UG/ha.` })
  else if (carga > 0 && carga < 0.7)
    h.push({ titulo: 'Subutilización de la carga', severidad: 'medio', detalle: 'La carga está por debajo de la capacidad segura; hay potencial ocioso.' })
  if (x.ingresoBruto > 0 && x.costosFijos / x.ingresoBruto > 0.4)
    h.push({ titulo: 'Peso alto de costos fijos', severidad: 'medio', detalle: `Los costos fijos/comercialización representan ${pct((x.costosFijos / x.ingresoBruto) * 100)} del ingreso bruto.` })
  if (x.micronaje > 24)
    h.push({ titulo: 'Lana gruesa', severidad: 'medio', detalle: `Micronaje de ${x.micronaje.toFixed(1)} µ: castiga el precio de la lana.` })
  if (x.ibLanaPct >= 85 || x.ibCarnePct >= 85)
    h.push({ titulo: 'Baja diversificación de ingresos', severidad: 'medio', detalle: 'Más del 85 % del ingreso proviene de un solo producto.' })

  // Fortalezas
  if (x.margenNeto >= 0)
    h.push({ titulo: 'Sistema rentable', severidad: 'ok', detalle: `Margen neto positivo de ${usd(x.margenNeto)}.` })
  if (x.mortOvejasPct > 0 && x.mortOvejasPct <= 3 && x.mortCorderosPct > 0 && x.mortCorderosPct <= 10)
    h.push({ titulo: 'Buen control de mortandad', severidad: 'ok', detalle: 'Las mortandades se ubican dentro de rangos deseables.' })
  if (x.senaladaPct >= 85)
    h.push({ titulo: 'Buena eficiencia reproductiva', severidad: 'ok', detalle: `Señalada de ${pct(x.senaladaPct)}.` })

  return h
}

function recomendaciones(x: IndicadoresInforme): Recomendacion[] {
  const r: Recomendacion[] = []
  const carga = x.dotacionSeguraUGHa > 0 ? x.dotacionRealUGHa / x.dotacionSeguraUGHa : 0

  // Manejo reproductivo
  if (x.senaladaPct > 0 && x.senaladaPct < 85)
    r.push({ area: 'Manejo reproductivo', prioridad: x.senaladaPct < 70 ? 'alta' : 'media',
      texto: 'Mejorar la señalada: llegar al servicio con buena condición corporal (flushing), diagnóstico de gestación (ecografía) para manejo diferencial, y ajustar la relación carnero/oveja y su estado sanitario/reproductivo.' })
  else
    r.push({ area: 'Manejo reproductivo', prioridad: 'baja',
      texto: 'Sostener la eficiencia reproductiva actual con condición corporal al servicio y control sanitario de carneros.' })

  // Mortalidad
  if (x.mortOvejasPct > 4 || x.mortCorderosPct > 10)
    r.push({ area: 'Mortalidad', prioridad: (x.mortOvejasPct > 6 || x.mortCorderosPct > 12) ? 'alta' : 'media',
      texto: 'Reducir la mortandad con un plan sanitario preventivo (parasitosis, clostridiosis), manejo de la parición (potreros de menor exposición, vigilancia) y refugio/abrigo en climas adversos.' })
  else
    r.push({ area: 'Mortalidad', prioridad: 'baja',
      texto: 'Mantener el calendario sanitario preventivo y el registro de causas de muerte para detectar desvíos a tiempo.' })

  // Eficiencia productiva
  if (x.micronaje > 24 || x.lanaPorCabKg < 3)
    r.push({ area: 'Eficiencia productiva', prioridad: 'media',
      texto: 'Mejorar el producto lana: selección/genética orientada a afinar el micronaje y aumentar el vellón por cabeza, y cuidar el acondicionamiento de esquila para preservar valor.' })
  else
    r.push({ area: 'Eficiencia productiva', prioridad: 'baja',
      texto: 'Conservar la calidad de lana lograda y evaluar la certificación (p. ej. Grifa Verde) para capturar premios por finura.' })

  // Nutrición y carga
  if (carga > 1.1)
    r.push({ area: 'Nutrición y carga', prioridad: 'alta',
      texto: 'Ajustar la carga a la dotación segura para no comprometer la condición corporal ni el campo; priorizar la suplementación estratégica en gestación y lactancia.' })
  else if (carga > 0 && carga < 0.7)
    r.push({ area: 'Nutrición y carga', prioridad: 'media',
      texto: 'Aprovechar la capacidad ociosa: evaluar aumentar la carga o el peso de venta, con un plan de alimentación (verdeos/suplementación) que sostenga la ganancia.' })
  else
    r.push({ area: 'Nutrición y carga', prioridad: 'baja',
      texto: 'Mantener el balance carga–oferta forrajera y reservar suplementación para los momentos críticos del ciclo.' })

  // Manejo general
  if (x.ingresoBruto > 0 && x.costosFijos / x.ingresoBruto > 0.4)
    r.push({ area: 'Manejo general', prioridad: 'media',
      texto: 'Revisar los costos de estructura y comercialización: negociar comisiones/fletes, concentrar ventas y evaluar canales que reduzcan la intermediación.' })
  r.push({ area: 'Manejo general', prioridad: 'baja',
    texto: 'Llevar registros productivos y económicos por categoría para decidir con datos, y comparar escenarios antes de aplicar cambios en el campo.' })

  const orden: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 }
  return r.sort((a, b) => orden[a.prioridad] - orden[b.prioridad])
}

// ---------- Punto de entrada ----------
export function generarInforme(inp: Inputs, r: Resultados): Informe {
  const indicadores = construirIndicadores(inp, r)
  const vacio = r.ingresoBruto === 0 && r.costosFijosTotal === 0
  const fecha = new Date().toLocaleDateString('es-UY')
  if (vacio) {
    return { fecha, vacio, indicadores, diagnostico: [], eficiencia: [], hallazgos: [], recomendaciones: [], sensibilidadVariables: [], escenarios: [] }
  }
  return {
    fecha,
    vacio,
    indicadores,
    diagnostico: diagnostico(indicadores),
    eficiencia: eficiencia(indicadores),
    hallazgos: hallazgos(indicadores),
    recomendaciones: recomendaciones(indicadores),
    // Base efectiva CLAMPEADA (mismo saneo que aplican las perturbaciones): garantiza
    // que Base y escenarios/sensibilidad partan del mismo punto aunque el input traiga
    // rendimiento/mortandad fuera de rango (>1). Para datos válidos es idéntica a `r`.
    sensibilidadVariables: sensibilidadVariables(inp, calcular(conDeltas(inp, {}))),
    escenarios: escenarios(inp, calcular(conDeltas(inp, {}))),
  }
}
