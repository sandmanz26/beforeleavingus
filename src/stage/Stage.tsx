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
import { useUI } from './ui'

const APPS: Record<MemberId, () => React.JSX.Element> = {
  margaret: MargaretApp,
  david: DavidApp,
  emma: EmmaApp,
  rob: RobApp,
}

function useSlots() {
  const q = () => (window.innerWidth >= 1360 ? 3 : window.innerWidth >= 900 ? 2 : 1)
  const [n, setN] = useState(q)
  useEffect(() => {
    const on = () => setN(q())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return n
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
  return needs
}

export function Stage() {
  const slots = useSlots()
  const { specs, setSpecs } = useUI()
  const [map, setMap] = useState(false)
  const [stories, setStories] = useState(false)
  const needs = useNeeds()

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
          {slots < 3 && (
            <button className="st-btn" onClick={() => setStories(true)}>
              <Icon name="book" size={20} /> Stories
            </button>
          )}
          <label className="st-switch">
            <Toggle on={specs} onChange={setSpecs} label="Show spec tags" />
            <span>Spec tags</span>
          </label>
          <button className="st-btn" onClick={() => setMap(true)}>
            <Icon name="map" size={20} /> Feature map
          </button>
        </div>
      </header>

      <div className="st-body">
        {slots === 3 && (
          <aside className="st-rail">
            <Storyboard />
          </aside>
        )}
        <main className="st-phones">
          {groups.map((g, i) => (
            <Slot key={g.join('-') + i} members={g} needs={needs} />
          ))}
        </main>
      </div>

      {stories && slots < 3 && (
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
      <SpecSheet />
    </div>
  )
}

function Slot({ members, needs }: { members: MemberId[]; needs: Partial<Record<MemberId, boolean>> }) {
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
        <App />
      </Phone>
    </section>
  )
}
