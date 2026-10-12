import { useEffect, useState } from 'react'
import { MEMBERS, type MemberId } from '../data/family'
import { Stamp, Toggle } from '../components/bits'
import { Icon } from '../components/Icon'
import { Phone } from '../components/Phone'
import { activeIncident, useWorld } from '../store/world'
import { MargaretApp } from '../apps/margaret/Margaret'
import { DavidApp } from '../apps/david/David'
import { EmmaApp } from '../apps/emma/Emma'
import { RobApp } from '../apps/rob/Rob'
import { Storyboard } from './Storyboard'
import { FeatureMap } from './FeatureMap'
import { SpecSheet } from './SpecSheet'
import { Review } from './Review'
import { useUI } from './ui'

const APPS: Record<MemberId, () => React.JSX.Element> = {
  margaret: MargaretApp,
  david: DavidApp,
  emma: EmmaApp,
  rob: RobApp,
}

// v2 (roast #16): phones never overlap. Rail only when there's room for it.
function useLayout() {
  const q = () => {
    const x = window.innerWidth
    return { slots: x >= 1240 ? 3 : x >= 860 ? 2 : 1, rail: x >= 1600 }
  }
  const [l, setL] = useState(q)
  useEffect(() => {
    const on = () => setL(q())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return l
}

// Who needs attention right now — drives the dots on the phone switcher.
function useNeeds() {
  const { w } = useWorld()
  const inc = activeIncident(w)
  const needs: Partial<Record<MemberId, boolean>> = {}
  if (w.call?.state === 'ringing') needs.margaret = true
  if (inc) {
    for (const a of inc.asks) if (a.state === 'asking') needs[a.member] = true
    if (!inc.asks.some((a) => a.member === 'david' && a.state === 'answered')) needs.david = true
  }
  if (w.robNudged && w.profiles.rob.consent === 'waiting') needs.rob = true
  if (w.drill === 'scheduled') needs.margaret = true
  const fc = w.familyCall
  if (fc?.state === 'ringing') needs[fc.to] = true
  return needs
}

export function Stage() {
  const { slots, rail } = useLayout()
  const { specs, setSpecs, openFeature } = useUI()
  const { w } = useWorld()
  const [map, setMap] = useState(false)
  const [review, setReview] = useState(false)
  const [stories, setStories] = useState(false)
  const needs = useNeeds()
  const toggleSpecs = (v: boolean) => {
    setSpecs(v)
    if (!v) openFeature(null)
  }

  const groups: MemberId[][] =
    slots === 3 ? [['margaret'], ['david'], ['emma', 'rob']] : slots === 2 ? [['margaret'], ['david', 'emma', 'rob']] : [['margaret', 'david', 'emma', 'rob']]

  return (
    <div className={`st st--${slots}`}>
      <header className="st-top">
        <div className="st-brand">
          <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden>
            <path d="M4 14 16 4l12 10v11a3 3 0 0 1-3 3H13l-6 4v-4H7a3 3 0 0 1-3-3z" fill="var(--navy)" />
            <path d="M11 17v3M14.5 14v9M18 16v5M21.5 17.5v2" stroke="var(--yolk)" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span className="st-brand__name">kinvoice</span>
          <span className="st-brand__sub">Family voice check · clickable prototype · mock data</span>
        </div>
        <div className="st-tools">
          {!rail && (
            <button className="st-btn" onClick={() => setStories(true)} aria-label="Stories">
              <Icon name="book" size={20} /> <span className="st-btn__label">Stories</span>
            </button>
          )}
          <span className="st-switch">
            <Toggle on={specs} onChange={toggleSpecs} label="Show spec tags" />
            <span className="st-btn__label" aria-hidden>Spec tags</span>
          </span>
          <button className="st-btn" onClick={() => setMap(true)} aria-label="Feature map">
            <Icon name="map" size={20} /> <span className="st-btn__label">Feature map</span>
          </button>
          <button className="st-btn st-btn--roast" onClick={() => setReview(true)} aria-label="Design review">
            <Icon name="flame" size={20} /> <span className="st-btn__label">Design review</span>
          </button>
        </div>
      </header>

      <div className="st-body">
        {rail && (
          <aside className="st-rail">
            <Storyboard />
          </aside>
        )}
        <main className="st-phones">
          {groups.map((g, i) => (
            <Slot key={`${g.join('-')}${i}`} members={g} needs={needs} session={w.session} />
          ))}
        </main>
      </div>

      {stories && !rail && (
        <div className="st-drawer" role="dialog" aria-label="Stories">
          <div className="st-drawer__panel">
            <button className="st-close" onClick={() => setStories(false)} aria-label="Close stories">
              <Icon name="cross" size={22} />
            </button>
            <Storyboard onPlay={() => setStories(false)} />
          </div>
        </div>
      )}
      {map && <FeatureMap onClose={() => setMap(false)} />}
      {review && <Review onClose={() => setReview(false)} />}
      <SpecSheet />
    </div>
  )
}

function Slot({ members, needs, session }: { members: MemberId[]; needs: Partial<Record<MemberId, boolean>>; session: number }) {
  const [who, setWho] = useState<MemberId>(members[0])
  const { w } = useWorld()
  const inc = activeIncident(w)
  const current = members.includes(who) ? who : members[0]

  // Bring the phone that's being asked into view, the way it would buzz.
  const askingKey = inc?.asks.filter((a) => a.state === 'asking').map((a) => a.member).join(',') ?? ''
  useEffect(() => {
    const asking = askingKey.split(',').filter(Boolean) as MemberId[]
    const target = asking.reverse().find((m) => members.includes(m))
    // Never pull the view away from Margaret mid-check on a single-phone screen.
    if (target && !members.includes('margaret')) setWho(target)
  }, [askingKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // A family call rings the callee's phone into view too.
  const ringingTo = w.familyCall?.state === 'ringing' ? w.familyCall.to : null
  useEffect(() => {
    if (ringingTo && members.includes(ringingTo) && !members.includes('margaret')) setWho(ringingTo)
  }, [ringingTo]) // eslint-disable-line react-hooks/exhaustive-deps

  const App = APPS[current]
  const m = MEMBERS[current]
  return (
    <section className="st-slot">
      {members.length > 1 ? (
        <div className="st-tabs" role="tablist" aria-label="Whose phone">
          {members.map((id) => (
            <button key={id} role="tab" aria-selected={id === current} className={id === current ? 'is-on' : ''} onClick={() => setWho(id)}>
              <Stamp id={id} size={20} />
              {MEMBERS[id].name}
              {needs[id] && id !== current && <span className="st-tabs__dot" aria-label="needs attention" />}
            </button>
          ))}
        </div>
      ) : (
        <p className="st-tag">
          <Stamp id={current} size={22} />
          <b>{m.name}</b> · {m.age} · {m.roleLabel}
        </p>
      )}
      <Phone who={current}>
        {/* a new story remounts every app, so no screen carries over (roast #16) */}
        <App key={session} />
      </Phone>
    </section>
  )
}
