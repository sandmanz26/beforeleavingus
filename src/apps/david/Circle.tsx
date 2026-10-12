import { useState } from 'react'
import { MEMBERS } from '../../data/family'
import { Btn, Pill, Segmented, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { MeButton } from '../../shell/Shell'
import { useWorld } from '../../store/world'

// F-C5 phone tree order, F-A4 away status, F-B1/B3/B4 pattern summaries.
export function Circle() {
  const { w, dispatch } = useWorld()
  const [invited, setInvited] = useState(false)
  const move = (i: number, d: -1 | 1) => {
    const o = [...w.order]
    const j = i + d
    if (j < 0 || j >= o.length) return
    ;[o[i], o[j]] = [o[j], o[i]]
    dispatch({ type: 'order', order: o })
  }

  return (
    <div className="d-page">
      <header className="d-head">
        <div>
          <p className="d-eyebrow">4 people</p>
          <h1 className="d-title">The circle</h1>
        </div>
        <MeButton />
      </header>

      <section className="d-card d-card--line">
        <div className="d-protected">
          <Stamp id="margaret" size={48} />
          <div>
            <b>Margaret</b>
            <small>Protected · 79 · big text, one question per screen</small>
          </div>
        </div>
        <p className="d-muted">When someone claims to be one of you, that person is asked first on their own phone. If nobody answers, KinVoice moves down this list:</p>
        <ol className="d-order">
          {w.order.map((m, i) => {
            const p = w.profiles[m as 'david' | 'emma' | 'rob']
            const away = w.away[m]
            return (
              <li key={m}>
                <span className="d-order__n">{i + 1}</span>
                <Stamp id={m} size={36} />
                <span className="d-order__who">
                  <b>{MEMBERS[m].name}</b>
                  <small>{MEMBERS[m].relation} · {MEMBERS[m].roleLabel}</small>
                  {away && <Pill tone="yolk" icon="plane">{away.label} until {away.until}</Pill>}
                  {!away && p.consent !== 'agreed' && <Pill tone="line">Pattern {p.consent === 'waiting' ? 'not set up' : 'paused'}</Pill>}
                </span>
                <span className="d-order__move">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${MEMBERS[m].name} up`}><Icon name="up" size={18} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === w.order.length - 1} aria-label={`Move ${MEMBERS[m].name} down`}><Icon name="down" size={18} /></button>
                </span>
              </li>
            )
          })}
        </ol>
        <p className="d-label">Wait before asking the next person</p>
        <Segmented
          label="Wait before asking the next person"
          value={w.settings.escalateAfterSec}
          options={[{ v: 30, label: '30 sec' }, { v: 45, label: '45 sec' }, { v: 60, label: '1 min' }]}
          onChange={(v) => dispatch({ type: 'settings', patch: { escalateAfterSec: v } })}
        />
      </section>

      <h2 className="d-section">How each of you talks to Mum</h2>
      <p className="d-muted">Only each person can change their own. You see a summary.</p>
      {(['david', 'emma', 'rob'] as const).map((m) => {
        const p = w.profiles[m]
        const stale = p.consent === 'agreed' && p.updatedDaysAgo > 90
        return (
          <section key={m} className="d-card d-pattern">
            <header>
              <Stamp id={m} size={34} />
              <b>{MEMBERS[m].name}</b>
              {p.consent === 'agreed' && <Pill tone="ink" icon="tick">Agreed {p.consentDate}</Pill>}
              {p.consent === 'waiting' && <Pill tone="yolk" icon="clock">Waiting for {MEMBERS[m].name}</Pill>}
              {p.consent === 'paused' && <Pill tone="line" icon="pause">Paused by {MEMBERS[m].name}</Pill>}
            </header>
            {p.consent === 'agreed' ? (
              <>
                <dl>
                  <dt>Calls her</dt>
                  <dd>{p.callsHer.map((c) => <span key={c} className="d-chip">{c}</span>)}</dd>
                  <dt>Never says</dt>
                  <dd>{p.neverSays.map((c) => <span key={c} className="d-chip d-chip--no">{c}</span>)}</dd>
                  <dt>Says hello</dt>
                  <dd>{p.greetings.map((c) => <span key={c} className="d-chip">{c}</span>)}</dd>
                </dl>
                {stale && <p className="d-warn"><Icon name="clock" size={18} /> {p.updatedDaysAgo} days old. Nicknames drift — {MEMBERS[m].name} has been nudged to refresh it.</p>}
              </>
            ) : p.consent === 'waiting' ? (
              <>
                <p className="d-muted">Nothing is built until {MEMBERS[m].name} agrees on their own phone.</p>
                {w.robNudged ? <Pill tone="line" icon="tick">Nudge sent</Pill> : <Btn tone="paper" icon="bell" onClick={() => dispatch({ type: 'nudge-rob' })}>Nudge {MEMBERS[m].name}</Btn>}
              </>
            ) : (
              <p className="d-muted">{MEMBERS[m].name} paused it. Messages claiming to be {MEMBERS[m].name} can’t be compared until it’s back on.</p>
            )}
          </section>
        )
      })}

      <Btn tone="paper" icon="invite" onClick={() => setInvited(true)}>{invited ? 'Invite link copied — up to 8 people' : 'Invite someone to the circle'}</Btn>
    </div>
  )
}

