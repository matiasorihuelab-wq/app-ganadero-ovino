// ============================================================================
//  Motor de cálculo — Réplica fiel de la lógica del Excel "Planilla MO"
//  Cada bloque indica la(s) celda(s) del Excel que reproduce.
// ============================================================================
import type { Inputs, Resultados, FilaCategoria, Medicamento } from './types'

const SI: string = 'SI'
const NO: string = 'NO'

// AO_i = dosis * precio / volumen   (costo USD por kg de peso vivo, por medicamento)
function aoCosto(m: Medicamento): number {
  if (!m || !m.volumen) return 0
  return (m.dosis * m.precio) / m.volumen
}

export function calcular(inp: Inputs): Resultados {
  // ---------- Atajos ----------
  const B2 = inp.dotacionSegura
  const B3 = inp.pesoAdulto
  const B4 = inp.senaladaBase
  const B5 = inp.porcReposicion
  const B6 = inp.categoriaVenta
  const B12 = inp.ovejasEncarneradas
  const B13 = inp.micronaje
  const B14 = inp.porcPesoLanaSucia
  const B16 = inp.mortOvejas
  const B17 = inp.mortCordSenDest
  const B18 = inp.mortCordDestEsq
  const B19 = inp.mortCordDestVenta
  const B20 = inp.mortSolteros
  const E3 = inp.supPropiedad
  const E5 = inp.supArrendada
  const G8 = inp.cantTrabajadores
  const L10 = inp.precioDolar || 1
  const coef = inp.coefSeguridad || 1
  const I = inp.rendimientoCanal // I12..I17

  const E6 = E5 + E3 // Sup total

  // ---------- Banderas SI/NO por categoría (B24..B33) ----------
  const B24 = B6 === 'Cord Dest' ? SI : NO
  const B25 = B6 === 'Cord Pz' || B6 === 'Cord Pes' ? SI : NO
  const B26 = B25 === SI ? SI : B6 === 'Cord Dest' ? SI : NO
  const B27 = B25 === SI ? NO : B24 === SI ? NO : SI
  const B28 = SI // siempre
  const B29 = B6 === 'Bgos 4D' || B6 === 'Cap 6/8D' || B6 === 'Cap 8D' ? SI : NO
  const B30 = B29
  const B31 = SI // ovejas descarte siempre
  const B32 = B6 === 'Cap 6/8D' || B6 === 'Cap 8D' ? SI : NO
  const B33 = B6 === 'Cap 8D' ? SI : NO

  // ---------- Cantidades por categoría (cascada con mortandad) ----------
  const C23 = B12 // Ovejas de cría
  // C26 Corderas DL (venta) — depende sólo de la base
  let C26 = 0
  if (B6 === 'Cord Pes')
    C26 = (C23 * B4 * (1 - B17) * (1 - B19)) / 2 - C23 * B16 - C23 * B5
  else if (B6 === 'Cord Pz') C26 = (C23 * B4 * (1 - B17) * (1 - B19)) / 2 - C23 * B5
  else if (B6 === 'Cord Dest')
    C26 = (C23 * B4 * (1 - B17) * (1 - B19)) / 2 - C23 * B16 - C23 * B5
  // C24 Corderos vendidos al destete
  const C24 = B24 === SI ? C23 * B4 * (1 - B17) - C26 : 0
  // C25 Corderos DL (venta)
  const C25 = B25 === SI ? (C23 * B4 * (1 - B17) * (1 - B19)) / 2 : 0
  // C27 Corderos DL
  const C27 = B27 === SI ? (C23 * B4 * (1 - B17) * (1 - B18)) / 2 : 0
  // C28 Corderas DL
  const C28 = B28 === SI ? (C23 * B4 * (1 - B17) * (1 - B18)) / 2 - C26 : 0
  // C29 Bgas 2-4D S/e
  const C29 = B29 === SI ? (C28 - (C23 * B5 + C23 * B16)) * (1 - B20) : 0
  // C30 Bgos 2-4D
  const C30 = B30 === SI ? C27 * (1 - B20) : 0
  // C31 Ovejas descarte
  const C31 = B31 === SI ? C23 * B5 * (1 - B16) : 0
  // C32 Capones 6D
  const C32 = B32 === SI ? C30 * (1 - B20) : 0
  // C33 Capones 8D
  const C33 = B33 === SI ? C32 * (1 - B20) : 0
  // C34 Carneros
  const C34 = C23 * inp.relacionCarnerosStock

  // ---------- Pesos de lana (E) y micras (F) por categoría ----------
  // Necesitamos C35 que depende de I22 = C35/E6 que depende de E23... el Excel
  // usa I22 sólo para decidir E23 (>=2 ov/ha reduce vellón 10%). Resolvemos:
  const C35_pre = C23 + C25 + C26 + C27 + C28 + C29 + C30 + C31 + C32 + C33 + C34 // = SUM(C23:C34)-C24
  const I22 = E6 ? C35_pre / E6 : 0
  const E23 = I22 >= 2 ? B3 * B14 * 0.9 : B3 * B14
  const E25 = B6 === 'Cord Pz' ? E23 * 0.4 : E23 * 0.7
  const E26 = E25
  const E27 = E23 * 0.7
  const E28 = E23 * 0.7
  const E29 = E23
  const E30 = E23 * 1.08
  const E31 = E23 * 0.9
  const E32 = E30 * 1.05
  const E33 = E30
  const E34 = E23 * 1.2

  const F23 = B13
  const fMenor = (b: string) => (b === NO ? 0 : F23 < 22 ? F23 - 2 : F23 - 4)
  const F25 = fMenor(B25)
  const F26 = fMenor(B26)
  const F27 = fMenor(B27)
  const F28 = fMenor(B28)
  const F29 = B29 === NO ? 0 : F23
  const F30 = B30 === NO ? 0 : F23
  const F31 = B31 === NO ? 0 : F23 * 1.03
  const F32 = B32 === NO ? 0 : F23 * 1.03
  const F33 = B33 === NO ? 0 : F23 * 1.03
  const F34 = F23 * 1.05

  // ---------- UG (unidades ganaderas) por categoría ----------
  const E12 = 40, E13 = 40, E15 = 42, E17 = 40 // pesos estándar (modelo)
  const G23 = (-0.0000666667 * B3 ** 2 + 0.009 * B3 - 0.1233) * C23
  const ugCordero = (peso: number, c: number) =>
    (-0.0002 * peso ** 2 + 0.021 * peso - 0.43) * 0.75 * c + c * 0.25 * 0.04
  const G25 =
    B6 === 'Cord Pz'
      ? (-0.0002 * E12 ** 2 + 0.021 * E12 - 0.43) * C25 * 0.375 + C25 * 0.25 * 0.04
      : ugCordero(E13, C25)
  const G26 =
    B6 === 'Cord Pz'
      ? (-0.0002 * E12 ** 2 + 0.021 * E12 - 0.43) * C26 * 0.375 + C26 * 0.25 * 0.04
      : ugCordero(E13, C26)
  const G27 =
    (-0.0002 * (B3 * 0.8) ** 2 + 0.021 * (B3 * 0.8) - 0.43) * 0.5 * C27 + C27 * 0.25 * 0.04
  const G28 =
    (-0.0002 * (B3 * 0.8) ** 2 + 0.021 * (B3 * 0.8) - 0.43) * 0.5 * C28 + C28 * 0.25 * 0.04
  const G29 = (0.0000666667 * E17 ** 2 - 0.005 * E17 + 0.2233) * C29
  const G30 = (0.0000666667 * B3 ** 2 - 0.005 * B3 + 0.2233) * C30
  const G31 = (0.0000666667 * E17 ** 2 - 0.005 * E17 + 0.2033) * C31
  const G32 = (0.0000666667 * E15 ** 2 - 0.005 * E15 + 0.2233) * C32
  const G33 = (0.0000666667 * E15 ** 2 - 0.005 * E15 + 0.2233) * C33
  const G34 = (0.0000666667 * (B3 * 1.25) ** 2 - 0.005 * (B3 * 1.25) + 0.2533) * C34
  const G35 = G23 + G25 + G26 + G27 + G28 + G29 + G30 + G31 + G32 + G33 + G34

  // ---------- Costos de SANIDAD por categoría (AA) ----------
  const ao = inp.medicamentos.map(aoCosto) // ao[0..7] = AO3..AO10
  const a = (i: number) => ao[i] ?? 0
  const AK8 = inp.costoClostridiosis
  const AK9 = inp.costoBano
  const AK10 = inp.costoEctima
  const AFa = inp.pesoDosisAdulto      // 60
  const AFc = inp.pesoDosisCordero     // 45
  const AFr = inp.pesoDosisRecria      // 35

  // AA3 ovejas de cría
  const AA3 =
    (a(0) + AFa * a(1) + AFa * a(2) + AFa * a(0) + AFa * a(3) + AFa * a(4) +
      AFa * a(5) + AFa * a(1) + AK8 * 2 + AFa * a(6) + AK9) * coef
  // AA4 corderos destete
  const AA4 = (AK8 * 2 + AK10 + AFa * a(6) + AK9) * coef
  // AA5 corderos DL venta (AF=45)
  const AA5 =
    (AFc * a(7) + AFc * a(6) + AFc * a(3) + AFc * a(0) + AFc * a(1) + AFc * a(5) +
      AFc * a(1) + AK8 * 3 + AK9 + AK10) * coef
  // AA6/AA7/AA8 (ovejas refugo / carneros / borregos)  AF=60
  const AA68 =
    (AFa * a(0) + AFa * a(1) + AFa * a(2) + AFa * a(0) + AFa * a(3) + AK8 + AK9) * coef
  const AA7 = AA68
  const AA8 = AA68
  // AA9 corderos recría (AF=35)
  const AA9 =
    (AFr * a(7) + AFr * a(6) + AFr * a(3) + AFr * a(0) + AFr * a(1) + AFr * a(5) +
      AFr * a(1) + AK8 * 3 + AK9 + AK10) * coef

  // ---------- ESQUILA (AB) ----------
  const AB3 = (inp.costoEsquilaUYU * inp.factorEsquila) / L10 + inp.adicionalEsquilaUSD
  const AB7 = AB3 * 2 // carneros

  // ---------- ALIMENTACIÓN (AD) ----------
  const AK19 = inp.precioRacionCN * inp.suplDiarioCN * inp.duracionCN * 1.1 // supl/CN
  const AO24 = ((100 / 180) * inp.costoVerdeoHa) / 15 // verdeos por cab
  const alimSegun = (sis: string) =>
    sis === 'Verdeos' ? AO24 : sis === 'Supl. sobre CN' ? AK19 : 0
  const AD3 = B4 > 0.85 ? AK19 : 0 // gestantes (aprox.)
  const AD5 = alimSegun(inp.sistemaEngordeCorderos)
  const AD8 = alimSegun(inp.sistemaEngordeBgos)

  // ---------- CARNEROS (AE) ----------
  const AE3 =
    inp.precioCarnero /
    ((inp.ovejasPorCarnero || 1) * (inp.vidaCarneroAnios || 1))

  // ---------- Columnas P (sanidad) Q (esquila) R (alim) S (carneros) ----------
  // Mapeo fila->fórmula según Excel
  const P3 = C23 * AA3, Q3 = C23 * AB3, R3 = C23 * AD3, S3 = C23 * AE3
  const P4 = C24 * AA4
  const P5 = C25 * AA5, Q5 = C25 * AB3, R5 = C25 * AD5
  const P6 = C26 * AA5, Q6 = C26 * AB3, R6 = C26 * AD5
  const P7 = C27 * AA9, Q7 = C27 * AB3
  const P8 = C28 * AA9, Q8 = C28 * AB3
  const P9 = C29 * AA8, Q9 = C29 * AB3, R9 = C29 * AD8
  const P10 = C30 * AA8, Q10 = C30 * AB3, R10 = C30 * AD8
  const P11 = C31 * AA5, Q11 = C31 * AB3
  const P12 = C34 * AA7, Q12 = C34 * AB7

  const P13 = P3 + P4 + P5 + P6 + P7 + P8 + P9 + P10 + P11 + P12 // Sanidad
  const Q13 = Q3 + Q5 + Q6 + Q7 + Q8 + Q9 + Q10 + Q11 + Q12 // Esquila
  const R13 = R3 + R5 + R6 + R9 + R10 // Alimentación
  const S13 = S3 // Carneros
  const P25 = P13 + Q13 + R13 + S13 // Costos directos total

  // ---------- PRODUCCIÓN de lana ----------
  // C45 = SUMPRODUCT(C, E)   (incluye todas; C24 aporta 0 porque E24=0)
  const pares: [number, number, number][] = [
    [C23, E23, F23], [C25, E25, F25], [C26, E26, F26], [C27, E27, F27],
    [C28, E28, F28], [C29, E29, F29], [C30, E30, F30], [C31, E31, F31],
    [C34, E34, F34], [C32, E32, F32], [C33, E33, F33],
  ]
  const C45 = pares.reduce((s, [c, e]) => s + c * e, 0)
  const sumCE = pares.reduce((s, [c, e]) => s + c * e, 0)
  const sumCEF = pares.reduce((s, [c, e, f]) => s + c * e * f, 0)
  const C35 = C35_pre
  const C47 = C35 ? sumCE / C35 : 0 // lana/cab
  const C48 = sumCE ? sumCEF / sumCE : 0 // micronaje ponderado

  // ---------- Precio de lana (V4) — curva de precio por micronaje ----------
  const L13 = inp.certificacion ? premioCertificacion(C48) : 0
  const polyUlt2 = 0.0372 * C48 ** 2 - 2.3241 * C48 + 37.311
  const polyUlt3 = 0.0301 * C48 ** 2 - 2.0157 * C48 + 34.744
  const V4 = (inp.modoPrecios === 'últimos 3' ? polyUlt3 : polyUlt2) + L13
  const E20 = C48 < 22 ? 1 : 0.7 // subproductos (10% del vellón)
  const C39 = C45 * 0.9 * V4 + C45 * 0.1 * E20 // Ingreso lana

  // ---------- Precios de carne derivados (G) ----------
  const G13 = inp.precioCarneBase
  const G11 = G13 * 0.45 // cordero destete (en pie)
  const G12 = G13, G14 = G13, G17 = G13
  const G16 = G13 - 0.5 // oveja descarte
  const G15 = G16 + 0.15 // capón
  const E11 = 23, E14 = 48, E16 = 50 // pesos de venta estándar (modelo)
  const I16 = I

  // ---------- Ingreso por carne (C41) ----------
  let C41 = 0
  switch (B6) {
    case 'Cord Dest':
      C41 = E11 * G11 * C24 + E16 * G16 * I16 * C31
      break
    case 'Cord Pz':
      C41 = C25 * E12 * G12 * I + C26 * E12 * G12 * I + C31 * E16 * G16 * I16
      break
    case 'Cord Pes':
      C41 = C25 * E13 * G13 * I + C26 * E13 * G13 * I + C31 * E16 * G16 * I16
      break
    case 'Bgos 4D':
      C41 = C29 * E17 * G17 * I + C30 * E14 * G14 * I + C31 * E16 * G16 * I16
      break
    case 'Cap 6/8D':
      C41 = C29 * E17 * G17 * I + C31 * E16 * G16 * I16 + C32 * E15 * G15 * I
      break
    case 'Cap 8D':
      C41 = C33 * E15 * G15 * I + C29 * E17 * G17 * I + C31 * E16 * G16 * I16
      break
  }

  // ---------- Total carne (kg) C46 ----------
  let C46 = 0
  switch (B6) {
    case 'Cord Dest': C46 = E11 * C24 + E16 * C31; break
    case 'Cord Pz': C46 = C25 * E12 + C26 * E12 + C31 * E16; break
    case 'Cord Pes': C46 = C25 * E13 + C26 * E13 + C31 * E16; break
    case 'Bgos 4D': C46 = C29 * E17 + C30 * E14 + C31 * E16; break
    case 'Cap 6/8D': C46 = C29 * E17 + C31 * E16 + C32 * E15; break
    case 'Cap 8D': C46 = C33 * E15 + C29 * E17 + C31 * E16; break
  }

  // ---------- Ingreso bruto ----------
  const C57 = C39 + C41

  // ---------- Comercialización + costos fijos ----------
  const P16 = C39 * 0.02 + C41 * 0.02 // comisiones
  const P17 = C39 * 0.025 + C41 * 0.02 // IMEBA
  const P18 = (C39 + C41) * 0.00125 // INIA
  const P19 = (C39 + C41) * 0.00125 // MEVIR
  const P20 = C41 * 0.00125 // INAC
  const P21 =
    G8 * (((inp.salarioMensualUYU * inp.aguinaldoFactor) * inp.cargasSociales) / L10)
  const C52 = E6 ? G35 / E6 : 0 // dotación ovinos
  const P22 = B2 ? (C52 / B2) * (E5 * inp.rentaHa) : 0 // renta
  const P23 = (E3 > 0 ? E3 * inp.contribucionHa : 0) * (B2 ? C52 / B2 : 0) // contribución
  const P26 = P16 + P17 + P18 + P19 + P20 + P21 + P22 + P23

  // ---------- Márgenes ----------
  const C64 = C57 - P25 // Margen bruto
  const C70 = C64 - P16 - P17 - P18 - P19 - P20 - P21 - P23 // Ingreso de capital
  const C72 = C64 - P26 // Margen neto
  const C73 = E6 ? C72 / E6 : 0
  const ibUG = G35 ? C57 / G35 : 0
  const ibLanaPct = C39 + C41 ? (C39 / (C39 + C41)) * 100 : 0
  const ibCarnePct = C39 + C41 ? (C41 / (C39 + C41)) * 100 : 0

  // ---------- Filas para tablas/visualización ----------
  const filas: FilaCategoria[] = [
    fila('ovejas', 'Ovejas de cría', C23, E23, F23, G23, AA3, AB3, AD3, AE3),
    fila('cord_dest', 'Corderos venta destete', C24, 0, 0, 0, AA4, 0, 0, 0),
    fila('cord_dl_v', 'Corderos DL (venta)', C25, E25, F25, G25, AA5, AB3, AD5, 0),
    fila('corderas_dl_v', 'Corderas DL (venta)', C26, E26, F26, G26, AA5, AB3, AD5, 0),
    fila('cord_dl', 'Corderos DL', C27, E27, F27, G27, AA9, AB3, 0, 0),
    fila('corderas_dl', 'Corderas DL', C28, E28, F28, G28, AA9, AB3, 0, 0),
    fila('bgas_se', 'Borregas 2-4D S/e', C29, E29, F29, G29, AA8, AB3, AD8, 0),
    fila('bgos', 'Borregos 2-4D', C30, E30, F30, G30, AA8, AB3, AD8, 0),
    fila('ovejas_desc', 'Ovejas descarte', C31, E31, F31, G31, AA5, AB3, 0, 0),
    fila('capones6', 'Capones 6D', C32, E32, F32, G32, AA8, AB3, 0, 0),
    fila('capones8', 'Capones 8D', C33, E33, F33, G33, AA8, AB3, 0, 0),
    fila('carneros', 'Carneros', C34, E34, F34, G34, AA7, AB7, 0, 0),
  ]

  return {
    filas,
    totalLanaKg: C45,
    lanaPorCab: C47,
    micronajePonderado: C48,
    totalCarneKg: C46,
    precioLanaUSD: V4,
    ingresoLana: C39,
    ingresoCarne: C41,
    ingresoBruto: C57,
    costoSanidadTotal: P13,
    costoEsquilaTotal: Q13,
    costoAlimTotal: R13,
    costoCarnerosTotal: S13,
    costosDirectosTotal: P25,
    comisiones: P16,
    imeba: P17,
    inia: P18,
    mevir: P19,
    inac: P20,
    manoDeObra: P21,
    renta: P22,
    contribucion: P23,
    costosFijosTotal: P26,
    margenBruto: C64,
    margenBrutoHa: E6 ? C64 / E6 : 0,
    ingresoCapital: C70,
    margenNeto: C72,
    margenNetoHa: C73,
    margenNetoPorOveja: C23 ? C72 / C23 : 0,
    totalAnimales: C35,
    totalUG: G35,
    dotacionOvinos: C52,
    superficieTotal: E6,
    ibUG,
    ibLanaPct,
    ibCarnePct,
  }
}

function premioCertificacion(micronaje: number): number {
  // L13: premio por certificación según finura (sólo si certifica)
  if (micronaje < 20) return 1
  if (micronaje < 25) return 0.7
  return 0.5
}

function fila(
  clave: string, nombre: string, cantidad: number, pesoLana: number,
  micras: number, ug: number, costoSanidad: number, costoEsquila: number,
  costoAlim: number, costoCarnero: number,
): FilaCategoria {
  return { clave, nombre, cantidad, pesoLana, micras, ug, costoSanidad, costoEsquila, costoAlim, costoCarnero }
}
