import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { MEMBERS, type MemberId } from '../data/family'
import { useUI } from '../stage/ui'
import { Icon } from './Icon'

// ── Stamp: family members appear as postage stamps, the way their faces
// arrive on letters and in the address book by the phone.
export function Stamp({ id, size = 64, dim = false, title }: { id: MemberId | 'other'; size?: number; dim?: boolean; title?: string }) {
  const mask = useId()
  const w = size
  const h = Math.round(size * 1.16)
  const r = Math.max(1.6, size * 0.045)
  const step = r * 3.1
  const holes: [number, number][] = []
  for (let x = step / 2; x < w; x += step) holes.push([x, 0], [x, h])
  for (let y = step / 2; y < h; y += step) holes.push([0, y], [w, y])
  const m = id === 'other' ? null : MEMBERS[id]
  const color = m ? m.color : 'var(--navy-2)'
  const inset = r * 2.1
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={`k-stamp${dim ? ' is-dim' : ''}`} role="img" aria-label={title ?? m?.name ?? 'Someone official'}>
      <defs>
        <mask id={mask}>
          <rect width={w} height={h} fill="#fff" />
          {holes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#000" />
          ))}
        </mask>
      </defs>
      <rect width={w} height={h} fill="var(--enamel)" mask={`url(#${mask})`} />
      <rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={size * 0.04} fill={color} />
      {m ? (
        <text x={w / 2} y={h * 0.6} textAnchor="middle" fontFamily="var(--font-display)" fontSize={size * 0.5} fill="var(--enamel)">
          {m.name[0]}
        </text>
      ) : (
        <g transform={`translate(${w / 2 - size * 0.22} ${h / 2 - size * 0.24}) scale(${(size * 0.44) / 32})`} stroke="var(--enamel)" fill="none" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 12.5 16 5.5l11.5 7zM8 15.5v7.5M13 15.5v7.5M19 15.5v7.5M24 15.5v7.5M5.5 23h21M4 26.5h24" />
        </g>
      )}
      <rect x={inset} y={h - inset - size * 0.16} width={w - inset * 2} height={size * 0.16} fill="rgba(0,0,0,.18)" />
    </svg>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'ink' | 'paper' | 'red' | 'yolk' | 'ghost'
  big?: boolean
  icon?: string
  iconRight?: string
  children: ReactNode
}
export function Btn({ tone = 'ink', big, icon, iconRight, children, className = '', ...rest }: BtnProps) {
  return (
    <button className={`k-btn k-btn--${tone}${big ? ' k-btn--big' : ''} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={big ? 34 : 24} stroke={big ? 2.6 : 2.4} />}
      <span className="k-btn__label">{children}</span>
      {iconRight && <Icon name={iconRight} size={big ? 30 : 22} className="k-btn__end" />}
    </button>
  )
}

// ── Spec tag: the PM annotation layer. Every feature carries its PRD
// references; turning “Spec tags” on in the top bar reveals them.
export function Spec({ ids, place = 'tr' }: { ids: string; place?: 'tr' | 'tl' | 'inline' }) {
  const { specs, openFeature } = useUI()
  if (!specs) return null
  return (
    <span className={`k-spec k-spec--${place}`}>
      {ids.split(' ').map((id) => (
        <button key={id} className="k-spec__tag" onClick={(e) => { e.stopPropagation(); openFeature(id) }} title={`Open ${id} in the spec`}>
          {id}
        </button>
      ))}
    </span>
  )
}

export function Pill({ tone = 'plain', children, icon }: { tone?: 'plain' | 'yolk' | 'red' | 'ink' | 'line'; children: ReactNode; icon?: string }) {
  return (
    <span className={`k-pill k-pill--${tone}`}>
      {icon && <Icon name={icon} size={15} stroke={2.6} />}
      {children}
    </span>
  )
}

export function Dot({ tone = 'yolk', pulse }: { tone?: 'yolk' | 'red' | 'ink' | 'member'; pulse?: boolean }) {
  return <span className={`k-dot k-dot--${tone}${pulse ? ' is-pulse' : ''}`} aria-hidden />
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} className={`k-toggle${on ? ' is-on' : ''}`} onClick={() => onChange(!on)}>
      <span className="k-toggle__knob" />
    </button>
  )
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="k-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.v)} role="radio" aria-checked={o.v === value} className={o.v === value ? 'is-on' : ''} onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
