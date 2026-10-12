import { Icon } from '../../components/Icon'
import type { Verdict } from '../../lib/types'

export const VERDICT: Record<Verdict, { label: string; icon: string }> = {
  'likely-fake': { label: 'Likely fake', icon: 'cross' },
  'no-match': { label: 'Doesn’t match', icon: 'info' },
  'sounds-like': { label: 'Sounds like them', icon: 'tick' },
  unclear: { label: 'Can’t be sure', icon: 'info' },
}

export function VerdictChip({ v }: { v: Verdict }) {
  return (
    <span className={`vchip vchip--${v}`}>
      <Icon name={VERDICT[v].icon} size={14} stroke={3} /> {VERDICT[v].label}
    </span>
  )
}

export function when(iso: string) {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  const t = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (days === 0 && new Date().getDate() === d.getDate()) return `Today ${t}`
  if (days <= 1) return `Yesterday ${t}`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
