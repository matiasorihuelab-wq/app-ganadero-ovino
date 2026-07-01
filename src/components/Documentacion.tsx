import { useEffect, useState } from 'react'

// Botón "Documentación": abre un modal con enlaces a los manuales en PDF.
// Los PDF se sirven desde /docs (copiados por el build desde public/docs).
const MANUALES = [
  { icono: '📘', titulo: 'Manual de Usuario', desc: 'Guía sencilla, paso a paso (sin tecnicismos).', archivo: 'MANUAL_USUARIO.pdf' },
  { icono: '📗', titulo: 'Manual Técnico', desc: 'Arquitectura, fórmulas y metodología de cálculo.', archivo: 'MANUAL_TECNICO.pdf' },
]

export default function Documentacion() {
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [abierto])

  const abrir = (archivo: string) => {
    const url = `${import.meta.env.BASE_URL}docs/${archivo}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <button className="btn-sec" onClick={() => setAbierto(true)} title="Manuales de usuario y técnico (PDF)">
        📄 Documentación
      </button>
      {abierto && (
        <div className="modal-bg" onClick={() => setAbierto(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Documentación" onClick={(e) => e.stopPropagation()}>
            <h2>📄 Documentación</h2>
            <p className="hint" style={{ marginTop: -6, marginBottom: 12 }}>Abrí los manuales en PDF (se abren en una pestaña nueva).</p>
            {MANUALES.map((m) => (
              <div className="scn-row" key={m.archivo}>
                <div className="nm">{m.icono} {m.titulo}<div className="mt">{m.desc}</div></div>
                <button className="btn-pri" onClick={() => abrir(m.archivo)}>Abrir PDF</button>
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setAbierto(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
