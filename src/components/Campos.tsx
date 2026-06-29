import type { ReactNode } from 'react'

interface NumProps {
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
  step?: number
  pct?: boolean // muestra/edita como porcentaje (0-1 interno)
  suffix?: string
}

export function NumberField({ label, value, onChange, hint, step, pct, suffix }: NumProps) {
  const shown = pct ? round(value * 100, 4) : value
  return (
    <div className="field">
      <label>
        {label} {suffix && <span className="hint">({suffix})</span>}
        {hint && <span className="hint">— {hint}</span>}
      </label>
      <input
        className="num-input"
        type="number"
        min={0}
        step={step ?? (pct ? 1 : 'any')}
        value={Number.isFinite(shown) ? shown : 0}
        onChange={(e) => {
          // Todos los campos del modelo son no-negativos: se descarta NaN y se
          // recortan negativos a 0 para no producir cantidades/UG negativas. (M7)
          const raw = parseFloat(e.target.value)
          const safe = Number.isFinite(raw) ? Math.max(0, raw) : 0
          onChange(pct ? safe / 100 : safe)
        }}
      />
    </div>
  )
}

export function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function SelectField<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
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

function round(n: number, d: number) {
  const f = 10 ** d
  return Math.round(n * f) / f
}
