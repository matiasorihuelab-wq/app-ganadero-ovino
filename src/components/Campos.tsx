import { useId, type ReactNode } from 'react'
import { round } from '../utils/format'

interface NumProps {
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
  step?: number
  pct?: boolean // muestra/edita como porcentaje (0-1 interno)
  suffix?: string
}

/** Coerción a número no-negativo: descarta NaN y recorta negativos a 0.
 *  Todos los campos numéricos del modelo son no-negativos. (M7) */
export function aNumeroNoNeg(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

/** Evita que rodar la rueda del mouse sobre un input numérico enfocado cambie su
 *  valor sin que el usuario lo note al desplazarse por el formulario. */
function blurEnRueda(e: React.WheelEvent<HTMLInputElement>): void {
  e.currentTarget.blur()
}

export function NumberField({ label, value, onChange, hint, step, pct, suffix }: NumProps) {
  const id = useId()
  const shown = pct ? round(value * 100, 4) : value
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {suffix && <span className="hint">({suffix})</span>}
        {hint && <span className="hint">— {hint}</span>}
      </label>
      <input
        id={id}
        className="num-input"
        type="number"
        min={0}
        step={step ?? (pct ? 1 : 'any')}
        value={Number.isFinite(shown) ? shown : 0}
        onWheel={blurEnRueda}
        onChange={(e) => {
          const safe = aNumeroNoNeg(e.target.value)
          onChange(pct ? safe / 100 : safe)
        }}
      />
    </div>
  )
}

export function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function SelectField<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function Section({ title, defaultOpen, count, children }: { title: string; defaultOpen?: boolean; count?: string; children: ReactNode }) {
  return (
    <details className="section" open={defaultOpen}>
      <summary>
        {title}
        {count && <span className="num">{count}</span>}
      </summary>
      <div className="body">{children}</div>
    </details>
  )
}
