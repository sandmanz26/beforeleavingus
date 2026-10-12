import { createContext, useContext, useEffect, useState } from 'react'
import { MEMBERS, type MemberId } from '../data/family'
import { Stamp } from '../components/bits'
import { Icon } from '../components/Icon'
import { useWorld } from '../store/world'
import type { World } from '../store/types'
import { MargaretApp } from '../apps/margaret/Margaret'
import { DavidApp } from '../apps/david/David'
import { EmmaApp } from '../apps/emma/Emma'
import { RobApp } from '../apps/rob/Rob'

const APPS: Record<MemberId, () => React.JSX.Element> = {
  margaret: MargaretApp,
  david: DavidApp,
  emma: EmmaApp,
  rob: RobApp,
}
const PROFILE_KEY = 'kinvoice.profile'
const ORDER: MemberId[] = ['margaret', 'david', 'emma', 'rob']

const Ctx = createContext<{ me: MemberId; leave: () => void }>({ me: 'margaret', leave: () => {} })
export const useMe = () => useContext(Ctx)

function readProfile(): MemberId | null {
  try {
    const v = localStorage.getItem(PROFILE_KEY)
    return v && v in MEMBERS ? (v as MemberId) : null
  } catch {
    return null
  }
}

export function Shell() {
  const [me, setMe] = useState<MemberId | null>(readProfile)
  useEffect(() => {
    try {
      if (me) localStorage.setItem(PROFILE_KEY, me)
      else localStorage.removeItem(PROFILE_KEY)
    } catch {
      /* fine without it */
    }
    window.scrollTo(0, 0)
  }, [me])

  if (!me) return <ProfilePicker onPick={setMe} />
  const App = APPS[me]
  return (
    <Ctx.Provider value={{ me, leave: () => setMe(null) }}>
      <div className={`app app--${me}`}>
        <App />
      </div>
    </Ctx.Provider>
  )
}

// What's waiting for each person — shown on the picker so nobody misses a request.
export function waitingFor(w: World, id: MemberId): string | null {
  const inc = w.incident && !w.incident.closed ? w.incident : null
  if (id === 'margaret') {
    if (inc && (inc.outcome || inc.secondhand)) return 'Family has answered'
    if (w.drill === 'scheduled') return 'A practice from David'
    if (w.freshMessage) return '1 new voice message'
    return null
  }
  const asking = inc?.asks.some((a) => a.member === id && a.state === 'asking')
  if (asking) return id === 'emma' ? 'Nan is asking: is this you?' : 'Mum needs an answer'
  if (id === 'david') {
    if (inc && !inc.asks.some((a) => a.member === 'david' && a.state === 'answered')) return inc.outcome?.kind === 'yes-me' ? 'Hand-off: help needed' : 'Mum is checking a call'
    if (w.disclosedTo === 'david') return 'Mum wants to talk'
  }
  if (id === 'rob' && w.robNudged && w.profiles.rob.consent === 'waiting') return 'David asked you something'
  return null
}

function ProfilePicker({ onPick }: { onPick: (m: MemberId) => void }) {
  const { w, dispatch } = useWorld()
  const [confirm, setConfirm] = useState(false)
  return (
    <main className="picker">
      <div className="picker__brand">
        <Logo />
        <span>kinvoice</span>
      </div>
      <h1 className="picker__title">Who’s using this phone?</h1>
      <p className="picker__sub">The Hale family circle</p>
      <ul className="picker__grid">
        {ORDER.map((id) => {
          const m = MEMBERS[id]
          const note = waitingFor(w, id)
          return (
            <li key={id}>
              <button className="picker__card" onClick={() => onPick(id)}>
                <Stamp id={id} size={76} />
                <b>{m.name}</b>
                <small>{m.roleLabel}</small>
                {note && <em className="picker__note"><span className="k-dot is-pulse" aria-hidden /> {note}</em>}
              </button>
            </li>
          )
        })}
      </ul>
      <footer className="picker__foot">
        <p>Sample family. Everything stays on this device.</p>
        {confirm ? (
          <span className="picker__confirm">
            Start the sample family over?
            <button onClick={() => { dispatch({ type: 'reset' }); setConfirm(false) }}>Yes, reset</button>
            <button onClick={() => setConfirm(false)}>Cancel</button>
          </span>
        ) : (
          <button className="picker__reset" onClick={() => setConfirm(true)}>
            <Icon name="undo" size={16} /> Reset sample data
          </button>
        )}
      </footer>
    </main>
  )
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M4 14 16 4l12 10v11a3 3 0 0 1-3 3H13l-6 4v-4H7a3 3 0 0 1-3-3z" fill="var(--navy)" />
      <path d="M11 17v3M14.5 14v9M18 16v5M21.5 17.5v2" stroke="var(--yolk)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

// The small stamp in each app's header: who you are, and the way out.
export function MeButton({ big = false }: { big?: boolean }) {
  const { me, leave } = useMe()
  const { w } = useWorld()
  const [open, setOpen] = useState(false)
  const others = ORDER.filter((id) => id !== me && waitingFor(w, id))
  return (
    <>
      <button className={`me-btn${big ? ' me-btn--big' : ''}`} onClick={() => setOpen(true)} aria-label={`Signed in as ${MEMBERS[me].name}. Switch profile`}>
        <Stamp id={me} size={big ? 34 : 28} />
        {others.length > 0 && <span className="me-btn__dot" aria-hidden />}
      </button>
      {open && (
        <div className="sheet" role="dialog" aria-label="Profile" onClick={() => setOpen(false)}>
          <div className="sheet__panel" onClick={(e) => e.stopPropagation()}>
            <div className="sheet__who">
              <Stamp id={me} size={48} />
              <div>
                <b>{MEMBERS[me].full}</b>
                <small>{MEMBERS[me].roleLabel} · Hale family circle</small>
              </div>
            </div>
            {others.length > 0 && (
              <ul className="sheet__waiting">
                {others.map((id) => (
                  <li key={id}><Stamp id={id} size={22} /> {MEMBERS[id].name}: {waitingFor(w, id)}</li>
                ))}
              </ul>
            )}
            <button className="k-btn k-btn--ink" onClick={leave}>
              <Icon name="people" size={24} />
              <span className="k-btn__label">Switch profile</span>
            </button>
            <button className="k-btn k-btn--ghost" onClick={() => setOpen(false)}>
              <span className="k-btn__label">Close</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
