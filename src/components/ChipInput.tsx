import { useState } from 'react'
import { Icon } from './Icon'

// Type a word and press Enter, or tap a suggestion. Used for speech patterns.
export function ChipInput({ label, hint, values, onChange, suggestions = [], strike = false }: {
  label: string
  hint?: string
  values: string[]
  onChange: (v: string[]) => void
  suggestions?: string[]
  strike?: boolean
}) {
  const [text, setText] = useState('')
  const add = (v: string) => {
    const t = v.trim()
    if (t && !values.some((x) => x.toLowerCase() === t.toLowerCase())) onChange([...values, t])
    setText('')
  }
  const left = suggestions.filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()))
  return (
    <div className="chips">
      <label className="chips__label">
        {label}
        {hint && <small>{hint}</small>}
      </label>
      <div className="chips__box">
        {values.map((v) => (
          <span key={v} className={`chip${strike ? ' chip--strike' : ''}`}>
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
              <Icon name="cross" size={14} stroke={3} />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add(text)
            }
          }}
          onBlur={() => text && add(text)}
          placeholder={values.length ? 'Add another' : 'Type and press Enter'}
          aria-label={label}
        />
      </div>
      {left.length > 0 && (
        <div className="chips__suggest">
          {left.map((s) => (
            <button key={s} onClick={() => add(s)}>
              <Icon name="plus" size={14} stroke={3} /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
