import { useMemo, useState } from 'react'
import { NumberField, SelectField } from './Campos'
import { fmtNum } from '../utils/format'
import { requirementProvider, type IdCategoria } from '../nutrition/requirements'
import { definicionNutriente } from '../nutrition/nutrientes'

// ============================================================================
//  Requerimientos Nutricionales — motor de CONSULTA.
//  No calcula ni modela: consulta los requerimientos oficiales (NRC y, en el futuro,
//  INRA/AFRC/CSIRO) vía el provider y los muestra. El análisis del forraje y el balance
//  (oferta vs requerimiento) son etapas futuras: la arquitectura ya está preparada.
// ============================================================================

export default function Nutricion() {
  const categorias = requirementProvider.categorias()

  const [catId, setCatId] = useState<IdCategoria>(categorias[0].id)
  const cat = categorias.find((c) => c.id === catId) ?? categorias[0]
  const [estadoId, setEstadoId] = useState(cat.estados[0].id)
  const estado = cat.estados.find((e) => e.id === estadoId) ?? cat.estados[0]
  const [nivelId, setNivelId] = useState('')
  const [pesoVivo, setPesoVivo] = useState(0)

  // Nivel productivo: solo "cuando corresponda" (si el estado lo declara).
  const niveles = estado.nivelesProductivos ?? []
  const nivelActivo = niveles.length ? (niveles.find((n) => n.id === nivelId)?.id ?? niveles[0].id) : undefined

  const cambiarCategoria = (id: IdCategoria) => {
    setCatId(id)
    const nueva = categorias.find((c) => c.id === id) ?? categorias[0]
    setEstadoId(nueva.estados[0].id)
    setNivelId('')
  }
  const cambiarEstado = (id: string) => {
    setEstadoId(id)
    setNivelId('')
  }

  const req = useMemo(
    () => requirementProvider.requerimiento({ categoria: catId, estado: estadoId, pesoVivoKg: pesoVivo, nivelProductivo: nivelActivo }),
    [catId, estadoId, pesoVivo, nivelActivo],
  )

  return (
    <div>
      {/* Módulo congelado para la beta: claramente identificado como en construcción. */}
      <div className="aviso warn" style={{ marginBottom: 12 }}>
        <span>🚧</span>
        <span>
          <strong>En construcción.</strong> Los Requerimientos Nutricionales se incorporarán en
          una <strong>futura versión</strong>, usando tablas oficiales (NRC, INRA, AFRC, etc.).
          Por ahora esta sección no es funcional.
        </span>
      </div>

      {/* Animal a consultar */}
      <div className="kpi-card">
        <h3>🐑 Animal a consultar</h3>
        <div className="grid2">
          <SelectField label="Categoría animal" value={catId} onChange={cambiarCategoria}
            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))} />
          <SelectField label="Estado fisiológico" value={estadoId} onChange={cambiarEstado}
            options={cat.estados.map((e) => ({ value: e.id, label: e.nombre }))} />
          {niveles.length > 0 && (
            <SelectField label="Nivel productivo" value={nivelActivo ?? ''} onChange={setNivelId}
              options={niveles.map((n) => ({ value: n.id, label: n.nombre }))} />
          )}
          <NumberField label="Peso vivo" value={pesoVivo} onChange={setPesoVivo} suffix="kg" />
        </div>
      </div>

      {/* Requerimiento (consulta a la tabla oficial) */}
      <div className="kpi-card">
        <h3>📋 Requerimiento nutricional ({requirementProvider.nombre})</h3>
        {req ? (
          <>
            {req.valores.map((v) => {
              const def = definicionNutriente(v.nutriente)
              return (
                <div className="kpi-line" key={v.nutriente}>
                  <span className="lbl">{def ? def.nombre : v.nutriente}</span>
                  <span className="val">{fmtNum(v.valor, 2)} {v.unidad}</span>
                </div>
              )
            })}
            <p className="hint" style={{ marginTop: 8 }}>Fuente: {req.fuente}</p>
          </>
        ) : (
          <div className="aviso info">
            <span>🟡</span>
            <span>Requerimiento no disponible: la tabla oficial ({requirementProvider.nombre}) todavía no tiene
              cargados estos valores. Ver <code>docs/nutricion/</code>.</span>
          </div>
        )}
      </div>

      {/* Etapas futuras (arquitectura ya preparada) */}
      <div className="kpi-card">
        <h3>🔜 Próximamente</h3>
        <p className="hint">
          <strong>Análisis químico del forraje</strong> (oferta nutricional) y <strong>balance</strong> oferta vs
          requerimiento: energía, proteína y minerales, con deficiencias, excesos y nutrientes limitantes. La
          arquitectura ya está preparada (ver <code>docs/nutricion/</code>); falta cargar las tablas oficiales y
          desarrollar el análisis.
        </p>
      </div>
    </div>
  )
}
