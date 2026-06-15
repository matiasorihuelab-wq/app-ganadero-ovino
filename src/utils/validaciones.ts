import type { Inputs, Resultados } from '../engine/types'

export interface Aviso { tipo: 'warn' | 'err' | 'info'; msg: string }

export function validar(inp: Inputs, r: Resultados): Aviso[] {
  const a: Aviso[] = []
  if (inp.ovejasEncarneradas <= 0)
    a.push({ tipo: 'info', msg: 'Ingresá la cantidad de ovejas encarneradas para comenzar.' })
  if (inp.precioCarneBase <= 0 && inp.micronaje <= 0)
    a.push({ tipo: 'warn', msg: 'Completá precios (carne / micronaje de lana) para obtener resultados.' })
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
