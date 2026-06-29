import type { Inputs, Resultados } from '../engine/types'

export interface Aviso { tipo: 'warn' | 'err' | 'info'; msg: string }

export function validar(inp: Inputs, r: Resultados): Aviso[] {
  const a: Aviso[] = []
  if (inp.ovejasEncarneradas <= 0)
    a.push({ tipo: 'info', msg: 'Ingresá la cantidad de ovejas encarneradas para comenzar.' })
  if (inp.precioCarneBase <= 0 && inp.micronaje <= 0)
    a.push({ tipo: 'warn', msg: 'Completá precios (carne / micronaje de lana) para obtener resultados.' })
  // Avisos de inputs que rompen el cálculo sin previo aviso (V1-09).
  // Solo cuando el usuario ya está cargando datos (ovejas > 0), para no hacer ruido en vacío.
  const cargando = inp.ovejasEncarneradas > 0
  if (cargando && inp.precioDolar <= 0 && (inp.salarioMensualUYU > 0 || inp.costoEsquilaUYU > 0))
    a.push({ tipo: 'err', msg: 'Cotización del dólar en 0: los valores en UYU (salario, esquila) no se convierten correctamente. Ingresá UYU/USD.' })
  if (cargando && inp.precioCarneBase > 0 && inp.rendimientoCanal <= 0)
    a.push({ tipo: 'warn', msg: 'Rendimiento de canal en 0: el ingreso por carne queda anulado.' })
  if (cargando && inp.supPropiedad + inp.supArrendada <= 0)
    a.push({ tipo: 'warn', msg: 'Superficie total en 0: no se pueden calcular los indicadores por hectárea.' })
  if (cargando && inp.senaladaBase <= 0)
    a.push({ tipo: 'warn', msg: 'Señalada en 0: no se generan corderos (sin producción de carne de cordero).' })
  if (inp.cantTrabajadores > 0 && inp.salarioMensualUYU <= 0)
    a.push({ tipo: 'warn', msg: 'Hay trabajadores cargados pero el salario mensual es 0: la mano de obra queda en 0.' })
  if (inp.dotacionSegura > 1.5)
    a.push({ tipo: 'warn', msg: 'Dotación muy alta (>1,5 UG/ha). Verificar sostenibilidad del campo.' })
  const morts = [
    ['ovejas', inp.mortOvejas], ['corderos señalada-destete', inp.mortCordSenDest],
    ['corderos destete-esquila', inp.mortCordDestEsq], ['corderos destete-venta', inp.mortCordDestVenta],
    ['solteros', inp.mortSolteros],
  ] as const
  for (const [nombre, m] of morts) {
    if (m > 0.3) a.push({ tipo: 'err', msg: `Mortandad de ${nombre} >30% — revisá el valor (debe ser fracción 0-1).` })
    else if (m > 0.1) a.push({ tipo: 'warn', msg: `Mortandad de ${nombre} elevada (${(m * 100).toFixed(0)}%). Revisar sanidad.` })
  }
  if (inp.micronaje > 30) a.push({ tipo: 'warn', msg: 'Micronaje >30 µ: lana muy gruesa, revisar genética.' })
  if (inp.micronaje > 0 && inp.micronaje < 15) a.push({ tipo: 'warn', msg: 'Micronaje <15 µ: valor inusualmente fino, verificar.' })
  if (inp.pesoAdulto > 0 && inp.pesoAdulto < 25) a.push({ tipo: 'warn', msg: 'Peso adulto <25 kg: verificar.' })
  if (inp.fechaEncarnerada && inp.fechaDestete && inp.fechaEncarnerada >= inp.fechaDestete)
    a.push({ tipo: 'warn', msg: 'La fecha de encarnerada debería ser anterior al destete.' })
  if (r.margenNeto < 0 && r.ingresoBruto > 0)
    a.push({ tipo: 'err', msg: 'RENTABILIDAD NEGATIVA: el margen neto es menor a cero.' })
  return a
}
