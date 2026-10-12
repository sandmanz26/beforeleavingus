import type { ReactNode } from 'react'
import { MEMBERS, type MemberId } from '../data/family'
import { useWorld } from '../store/world'
import { Btn } from './bits'
import { Icon } from './Icon'

export function Phone({ who, children, className = '' }: { who: MemberId; children: ReactNode; className?: string }) {
  const { w, dispatch } = useWorld()
  const time = new Date(w.now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const busy = w.busy[who]
  return (
    <div className={`k-phone k-phone--${who} ${className}`} data-who={who}>
      <div className="k-phone__status" aria-hidden>
        <span>{time}</span>
        <span className="k-phone__glyphs">
          <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" /><rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" opacity=".35" /></svg>
          <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".75" y=".75" width="21.5" height="10.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="3" width="14" height="6" rx="1.5" fill="currentColor" /><rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor" /></svg>
        </span>
      </div>
      <div className="k-phone__screen">{children}</div>
      {busy && (
        <div className="k-busy">
          <Icon name="pause" size={34} />
          <p className="k-busy__title">{MEMBERS[who].name}’s phone is face-down</p>
          <p className="k-busy__sub">{busy} — notifications on silent.</p>
          <Btn tone="paper" onClick={() => dispatch({ type: 'pick-up', member: who })}>Pick it up anyway</Btn>
        </div>
      )}
    </div>
  )
}
