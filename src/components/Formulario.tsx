import type { Inputs, CategoriaVenta, SistemaEngorde, ModoPrecios } from '../engine/types'
import { NumberField, TextField, DateField, SelectField, Section } from './Campos'

const CATEGORIAS: { value: CategoriaVenta; label: string }[] = [
  { value: 'Cord Dest', label: 'Cordero Destete' },
  { value: 'Cord Pz', label: 'Cordero Pesado' },
  { value: 'Cord Pes', label: 'Cordero Pesado (alt.)' },
  { value: 'Bgos 4D', label: 'Borrego 2-4 dientes' },
  { value: 'Cap 6/8D', label: 'Capón 6/8 dientes' },
  { value: 'Cap 8D', label: 'Capón 8+ dientes' },
]
const SISTEMAS: { value: SistemaEngorde; label: string }[] = [
  { value: 'Campo Natural', label: 'Campo Natural' },
  { value: 'Supl. sobre CN', label: 'Suplemento sobre CN' },
  { value: 'Verdeos', label: 'Verdeos' },
]
const MODOS: { value: ModoPrecios; label: string }[] = [
  { value: 'últimos 2', label: 'Promedio últimos 2 años' },
  { value: 'últimos 3', label: 'Promedio últimos 3 años' },
]

export default function Formulario({ inp, set }: { inp: Inputs; set: (p: Partial<Inputs>) => void }) {
  const med = (i: number, patch: Partial<Inputs['medicamentos'][number]>) => {
    const m = inp.medicamentos.map((x, idx) => (idx === i ? { ...x, ...patch } : x))
    set({ medicamentos: m })
  }
  return (
    <div>
      {/* 1. Predio */}
      <Section title="1 · Identificación y Predio" defaultOpen>
        <TextField label="Nombre del predio" value={inp.nombrePredio} onChange={(v) => set({ nombrePredio: v })} placeholder="Ej: Estancia La Esperanza" />
        <div className="grid2">
          <NumberField label="Ovejas madres encarneradas" value={inp.ovejasEncarneradas} onChange={(v) => set({ ovejasEncarneradas: v })} suffix="#" />
          <NumberField label="Peso adulto ovejas" value={inp.pesoAdulto} onChange={(v) => set({ pesoAdulto: v })} suffix="kg" />
          <NumberField label="Dotación total segura" value={inp.dotacionSegura} onChange={(v) => set({ dotacionSegura: v })} suffix="UG/ha" step={0.1} />
          <NumberField label="% reposición anual" value={inp.porcReposicion} onChange={(v) => set({ porcReposicion: v })} pct suffix="%" />
          <NumberField label="Superficie propia" value={inp.supPropiedad} onChange={(v) => set({ supPropiedad: v })} suffix="ha" />
          <NumberField label="Superficie arrendada" value={inp.supArrendada} onChange={(v) => set({ supArrendada: v })} suffix="ha" />
          <NumberField label="Cantidad de trabajadores" value={inp.cantTrabajadores} onChange={(v) => set({ cantTrabajadores: v })} suffix="#" />
        </div>
      </Section>

      {/* 2. Configuración productiva */}
      <Section title="2 · Configuración Productiva">
        <SelectField label="Categoría de venta" value={inp.categoriaVenta} onChange={(v) => set({ categoriaVenta: v })} options={CATEGORIAS} />
        <NumberField label="Señalada / corderos por oveja" value={inp.senaladaBase} onChange={(v) => set({ senaladaBase: v })} pct suffix="%" hint="marcación lograda" />
        <div className="grid2">
          <SelectField label="Engorde de corderos" value={inp.sistemaEngordeCorderos} onChange={(v) => set({ sistemaEngordeCorderos: v })} options={SISTEMAS} />
          <SelectField label="Engorde de borregos" value={inp.sistemaEngordeBgos} onChange={(v) => set({ sistemaEngordeBgos: v })} options={SISTEMAS} />
          <DateField label="Fecha encarnerada" value={inp.fechaEncarnerada} onChange={(v) => set({ fechaEncarnerada: v })} />
          <DateField label="Fecha esquila" value={inp.fechaEsquila} onChange={(v) => set({ fechaEsquila: v })} />
          <DateField label="Fecha destete" value={inp.fechaDestete} onChange={(v) => set({ fechaDestete: v })} />
          <DateField label="Fecha de venta" value={inp.fechaVenta} onChange={(v) => set({ fechaVenta: v })} />
          <NumberField label="Cotización dólar" value={inp.precioDolar} onChange={(v) => set({ precioDolar: v })} suffix="UYU/USD" />
        </div>
      </Section>

      {/* 3. Genética y lana */}
      <Section title="3 · Genética y Calidad de Lana">
        <div className="grid2">
          <NumberField label="Micronaje" value={inp.micronaje} onChange={(v) => set({ micronaje: v })} suffix="µ" step={0.5} />
          <NumberField label="% peso en lana sucia" value={inp.porcPesoLanaSucia} onChange={(v) => set({ porcPesoLanaSucia: v })} pct suffix="%" />
        </div>
        <SelectField label="Precio de lana (curva por micronaje)" value={inp.modoPrecios} onChange={(v) => set({ modoPrecios: v })} options={MODOS} />
        <div className="checkbox-row">
          <input id="cert" type="checkbox" checked={inp.certificacion} onChange={(e) => set({ certificacion: e.target.checked })} />
          <label htmlFor="cert">Acondicionamiento / Certificación Grifa Verde (premio según finura)</label>
        </div>
      </Section>

      {/* 4. Mortandad */}
      <Section title="4 · Mortandad">
        <div className="grid2">
          <NumberField label="Ovejas" value={inp.mortOvejas} onChange={(v) => set({ mortOvejas: v })} pct suffix="%" />
          <NumberField label="Corderos señalada-destete" value={inp.mortCordSenDest} onChange={(v) => set({ mortCordSenDest: v })} pct suffix="%" />
          <NumberField label="Corderos destete-esquila" value={inp.mortCordDestEsq} onChange={(v) => set({ mortCordDestEsq: v })} pct suffix="%" />
          <NumberField label="Corderos destete-venta" value={inp.mortCordDestVenta} onChange={(v) => set({ mortCordDestVenta: v })} pct suffix="%" />
          <NumberField label="Solteros (esquila-esquila)" value={inp.mortSolteros} onChange={(v) => set({ mortSolteros: v })} pct suffix="%" />
        </div>
      </Section>

      {/* 5. Precios de carne */}
      <Section title="5 · Precios de Carne">
        <div className="grid2">
          <NumberField label="Precio carne base" value={inp.precioCarneBase} onChange={(v) => set({ precioCarneBase: v })} suffix="USD/kg" hint="cordero pesado 4ta balanza" step={0.1} />
          <NumberField label="Rendimiento canal" value={inp.rendimientoCanal} onChange={(v) => set({ rendimientoCanal: v })} pct suffix="%" />
        </div>
        <p className="hint" style={{ marginTop: 4 }}>
          El modelo deriva los demás precios: cordero destete = base×0,45 (en pie); oveja descarte = base−0,50; capón = (base−0,50)+0,15.
        </p>
      </Section>

      {/* 6. Sanidad */}
      <Section title="6 · Costos de Sanidad">
        <table className="tbl med-table">
          <thead>
            <tr><th>Medicamento</th><th>Precio env. (USD)</th><th>Volumen</th><th>Dosis</th></tr>
          </thead>
          <tbody>
            {inp.medicamentos.map((m, i) => (
              <tr key={i}>
                <td><input className="txt" value={m.nombre} onChange={(e) => med(i, { nombre: e.target.value })} /></td>
                <td><input type="number" value={m.precio} onChange={(e) => med(i, { precio: +e.target.value })} /></td>
                <td><input type="number" value={m.volumen} onChange={(e) => med(i, { volumen: +e.target.value })} /></td>
                <td><input type="number" step="0.001" value={m.dosis} onChange={(e) => med(i, { dosis: +e.target.value })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-add" style={{ marginTop: 8 }} onClick={() => set({ medicamentos: [...inp.medicamentos, { nombre: 'Nuevo', precio: 0, volumen: 1000, dosis: 0.1, frecuencia: '' }] })}>+ Agregar medicamento</button>
        <div className="grid3" style={{ marginTop: 12 }}>
          <NumberField label="Clostridiosis" value={inp.costoClostridiosis} onChange={(v) => set({ costoClostridiosis: v })} suffix="USD/cab" step={0.01} />
          <NumberField label="Baño inmersión" value={inp.costoBano} onChange={(v) => set({ costoBano: v })} suffix="USD/cab" step={0.01} />
          <NumberField label="Ectima" value={inp.costoEctima} onChange={(v) => set({ costoEctima: v })} suffix="USD/cab" step={0.01} />
        </div>
        <NumberField label="Coeficiente de seguridad" value={inp.coefSeguridad} onChange={(v) => set({ coefSeguridad: v })} hint="pérdidas, residuo, dosificación extra" step={0.05} />
      </Section>

      {/* 7. Otros costos operativos */}
      <Section title="7 · Esquila, Alimentación y Comercialización">
        <div className="grid3">
          <NumberField label="Esquila (costo base)" value={inp.costoEsquilaUYU} onChange={(v) => set({ costoEsquilaUYU: v })} suffix="UYU/an" />
          <NumberField label="Factor esquila" value={inp.factorEsquila} onChange={(v) => set({ factorEsquila: v })} step={0.01} />
          <NumberField label="Adicional esquila" value={inp.adicionalEsquilaUSD} onChange={(v) => set({ adicionalEsquilaUSD: v })} suffix="USD" step={0.05} />
        </div>
        <div className="grid2">
          <NumberField label="Precio ración (supl. CN)" value={inp.precioRacionCN} onChange={(v) => set({ precioRacionCN: v })} suffix="USD/kg" step={0.05} />
          <NumberField label="Suplemento diario" value={inp.suplDiarioCN} onChange={(v) => set({ suplDiarioCN: v })} suffix="kg/d" step={0.1} />
          <NumberField label="Duración suplementación" value={inp.duracionCN} onChange={(v) => set({ duracionCN: v })} suffix="días" />
          <NumberField label="Costo verdeos" value={inp.costoVerdeoHa} onChange={(v) => set({ costoVerdeoHa: v })} suffix="USD/ha" />
        </div>
      </Section>

      {/* 8. Carneros y costos fijos */}
      <Section title="8 · Carneros y Costos Fijos">
        <div className="grid3">
          <NumberField label="Precio carnero" value={inp.precioCarnero} onChange={(v) => set({ precioCarnero: v })} suffix="USD" />
          <NumberField label="Ovejas por carnero" value={inp.ovejasPorCarnero} onChange={(v) => set({ ovejasPorCarnero: v })} suffix="#" />
          <NumberField label="Vida útil carnero" value={inp.vidaCarneroAnios} onChange={(v) => set({ vidaCarneroAnios: v })} suffix="años" />
        </div>
        <div className="grid2">
          <NumberField label="Salario mensual" value={inp.salarioMensualUYU} onChange={(v) => set({ salarioMensualUYU: v })} suffix="UYU/mes" />
          <NumberField label="Sueldos/año (aguinaldo)" value={inp.aguinaldoFactor} onChange={(v) => set({ aguinaldoFactor: v })} step={0.5} />
          <NumberField label="Cargas sociales" value={inp.cargasSociales} onChange={(v) => set({ cargasSociales: v })} step={0.005} />
          <NumberField label="Renta tierra" value={inp.rentaHa} onChange={(v) => set({ rentaHa: v })} suffix="USD/ha" />
          <NumberField label="Contribución" value={inp.contribucionHa} onChange={(v) => set({ contribucionHa: v })} suffix="USD/ha" />
        </div>
      </Section>
    </div>
  )
}
