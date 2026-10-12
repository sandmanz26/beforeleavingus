import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'ink' | 'paper' | 'red' | 'yolk' | 'ghost'
  big?: boolean
  icon?: string
  iconRight?: string
  href?: string // e.g. tel: — ringing someone opens the phone's own dialler
  children: ReactNode
}
export function Btn({ tone = 'ink', big, icon, iconRight, children, className = '', href, ...rest }: BtnProps) {
  const cls = `k-btn k-btn--${tone}${big ? ' k-btn--big' : ''} ${className}`
  const inner = (
    <>
      {icon && <Icon name={icon} size={big ? 34 : 24} stroke={big ? 2.6 : 2.4} />}
      <span className="k-btn__label">{children}</span>
      {iconRight && <Icon name={iconRight} size={big ? 30 : 22} className="k-btn__end" />}
    </>
  )
  if (href) {
    return (
      <a
        className={cls}
        href={href}
        onClick={rest.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    )
  }
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
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
