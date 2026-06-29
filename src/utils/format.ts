export const fmtUSD = (n: number, dec = 0): string => {
  if (!isFinite(n)) n = 0
  return '$ ' + n.toLocaleString('es-UY', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}
export const fmtNum = (n: number, dec = 1): string => {
  if (!isFinite(n)) n = 0
  return n.toLocaleString('es-UY', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}
export const fmtPct = (n: number, dec = 1): string => fmtNum(n, dec) + ' %'

/** Redondea a `dec` decimales. Helper único (antes duplicado en Campos y Resultados). */
export const round = (n: number, dec = 0): number => {
  const f = 10 ** dec
  return Math.round(n * f) / f
}
