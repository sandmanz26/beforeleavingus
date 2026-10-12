import { MEMBERS, type MemberId } from '../data/family'
import { elapsed, nameFor, useWorld } from '../store/world'
import { Stamp } from './bits'
import { Icon } from './Icon'

// OS-level call screens for calls between family members' saved numbers.
// This is how “ring them back” (P-10) becomes one tap and actually rings.
export function FamilyCallLayer({ me, suppressIncoming = false }: { me: MemberId; suppressIncoming?: boolean }) {
  const { w, dispatch } = useWorld()
  const fc = w.familyCall
  if (!fc || (fc.from !== me && fc.to !== me)) return null
  const other = fc.from === me ? fc.to : fc.from
  const label = (id: MemberId) => (id === 'margaret' && me !== 'margaret' ? nameFor(w, me) : MEMBERS[id].name)

  if (fc.state === 'ringing' && fc.to === me) {
    if (suppressIncoming) return null
    return (
      <div className="os-call os-call--family">
        <p className="os-call__label">Incoming call · mobile</p>
        <Stamp id={other} size={72} />
        <p className="os-call__who">{label(other)}</p>
        <p className="os-call__num">{MEMBERS[other].phone}</p>
        <div className="os-call__actions">
          <button className="os-btn os-btn--decline" onClick={() => dispatch({ type: 'ring-end' })} aria-label="Decline">
            <Icon name="handset" size={34} style={{ transform: 'rotate(135deg)' }} />
            <span>Decline</span>
          </button>
          <button className="os-btn os-btn--accept" onClick={() => dispatch({ type: 'ring-answer' })} aria-label="Answer">
            <Icon name="handset" size={34} />
            <span>Answer</span>
          </button>
        </div>
      </div>
    )
  }

  if (fc.from === me && fc.state !== 'active') {
    const missed = fc.state === 'missed'
    return (
      <div className="os-call os-call--family">
        <p className="os-call__label">{missed ? 'No answer' : 'Calling…'}</p>
        <Stamp id={other} size={72} dim={missed} />
        <p className="os-call__who">{label(other)}</p>
        <p className="os-call__num">{missed ? `${label(other)} may be busy. Try someone else in the family.` : MEMBERS[other].phone}</p>
        <div className="os-call__actions os-call__actions--one">
          <button className="os-btn os-btn--decline" onClick={() => dispatch({ type: 'ring-end' })} aria-label={missed ? 'Close' : 'End call'}>
            <Icon name={missed ? 'cross' : 'handset'} size={34} style={missed ? undefined : { transform: 'rotate(135deg)' }} />
            <span>{missed ? 'Close' : 'End'}</span>
          </button>
        </div>
      </div>
    )
  }

  if (fc.state === 'active') {
    return (
      <div className="os-call os-call--family os-call--live">
        <p className="os-call__label">On a call · {elapsed(fc.startedAt, w.now)}</p>
        <Stamp id={other} size={72} />
        <p className="os-call__who">{label(other)}</p>
        <p className="os-call__num">Saved number · {MEMBERS[other].phone}</p>
        <div className="os-call__actions os-call__actions--one">
          <button className="os-btn os-btn--decline" onClick={() => dispatch({ type: 'ring-end' })} aria-label="End call">
            <Icon name="handset" size={34} style={{ transform: 'rotate(135deg)' }} />
            <span>End</span>
          </button>
        </div>
      </div>
    )
  }
  return null
}
