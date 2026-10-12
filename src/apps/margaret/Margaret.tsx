import { useState } from 'react'
import { MEMBERS, type MemberId } from '../../data/family'
import { Btn, Stamp } from '../../components/bits'
import { Icon, RingingIcon } from '../../components/Icon'
import { telHref, useWorld } from '../../store/world'
import { MeButton } from '../../shell/Shell'
import { CheckFlow } from './CheckFlow'
import { Happened } from './Happened'
import { Stories } from './Stories'
import { VoiceCheck } from './VoiceCheck'

type Screen = 'home' | 'voice' | 'calls' | 'happened' | 'stories'

// Margaret's KinVoice. Designed for 80, panicking, shaking hands:
// 21px body, big targets, one decision per screen once something is wrong.
export function MargaretApp() {
  const { w } = useWorld()
  const [screen, setScreen] = useState<Screen>('home')
  const inc = w.incident
  const home = () => setScreen('home')

  let body
  if (inc && inc.kind === 'call') body = <CheckFlow />
  else if (screen === 'voice' || (inc?.kind === 'message' && inc.outcome)) body = <VoiceCheck onBack={home} />
  else if (screen === 'calls') body = <RecentCalls onBack={home} />
  else if (screen === 'happened') body = <Happened onBack={home} />
  else if (screen === 'stories') body = <Stories onBack={home} />
  else body = <Home go={setScreen} />

  return <div className="m-app">{body}</div>
}

function greeting(now: number) {
  const h = new Date(now).getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function Home({ go }: { go: (s: Screen) => void }) {
  const { w, dispatch } = useWorld()
  const date = new Date(w.now).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const family: MemberId[] = ['david', 'emma', 'rob']
  const sales = w.calls.filter((c) => c.kind === 'sales').length
  const unknown = w.calls.filter((c) => c.kind === 'unknown').length
  return (
    <div className="m-home">
      <div className="m-home__top">
        <p className="m-date">{date}</p>
        <MeButton />
      </div>
      <h1 className="m-display m-display--xl">
        {greeting(w.now)},<br />Margaret.
      </h1>

      <section className="m-fam" aria-label="Ring your family">
        <ul>
          {family.map((id) => (
            <li key={id}>
              <a href={telHref(MEMBERS[id].phone)} aria-label={`Ring ${MEMBERS[id].name}`}>
                <Stamp id={id} size={52} />
                <span>{MEMBERS[id].name}</span>
                <i className="m-fam__ring"><Icon name="handset" size={14} stroke={3} /></i>
              </a>
            </li>
          ))}
        </ul>
        <p>Tap a face to ring them.</p>
      </section>

      <button className="m-help" onClick={() => dispatch({ type: 'help' })}>
        <RingingIcon size={40} />
        <span className="m-help__text">
          <b>Someone’s asking for help or money</b>
          <span>Tap here — even in the middle of a call.</span>
        </span>
      </button>

      {w.drill === 'scheduled' && (
        <div className="m-drill">
          <p>
            <b>David set up a practice.</b> Two minutes. Nobody else is disturbed.
          </p>
          <Btn tone="ink" onClick={() => dispatch({ type: 'practice-start' })}>Start the practice</Btn>
        </div>
      )}

      <div className="m-tiles">
        <button className="m-tile" onClick={() => go('calls')}>
          <Icon name="handset" size={34} />
          <span>Recent calls</span>
          {unknown > 0 && <em className="m-tile__new">{unknown} unknown</em>}
        </button>
        <button className="m-tile" onClick={() => go('voice')}>
          <Icon name="voicenote" size={34} />
          <span>Voice messages</span>
          {w.freshMessage && <em className="m-tile__new">1 new</em>}
        </button>
      </div>

      <p className="m-quiet">
        <Icon name="quiet" size={22} />
        {sales} calls today looked like sales calls. Nothing for you to do.
      </p>

      <nav className="m-links">
        <button onClick={() => go('happened')}>
          <Icon name="buoy" size={24} />
          Something already happened
          <Icon name="chevron" size={20} />
        </button>
        <button onClick={() => go('stories')}>
          <Icon name="book" size={24} />
          How KinVoice works
          <Icon name="chevron" size={20} />
        </button>
      </nav>
    </div>
  )
}

// F-C6 + F-A2: what came in, with a plain note on each unknown number.
// Sales calls are folded away — counted, never announced.
function RecentCalls({ onBack }: { onBack: () => void }) {
  const { w, dispatch } = useWorld()
  const [showSales, setShowSales] = useState(false)
  const calls = w.calls.filter((c) => c.kind !== 'sales')
  const sales = w.calls.filter((c) => c.kind === 'sales')
  return (
    <div className="m-page">
      <BackBar onBack={onBack} title="Recent calls" />
      <ul className="m-calls">
        {calls.map((c) => (
          <li key={c.id} className={`is-${c.kind}`}>
            <div className="m-calls__row">
              {c.savedAs ? <Stamp id={c.savedAs} size={40} /> : <span className="m-inbox__unknown"><Icon name="handset" size={24} /></span>}
              <span className="m-calls__who">
                <b>{c.savedAs ? MEMBERS[c.savedAs].name : c.number}</b>
                <small>{c.at}</small>
              </span>
            </div>
            {c.kind === 'unknown' && (
              <>
                <p className="m-calls__note">A number you haven’t saved. If they asked for help or money, check it with family.</p>
                <Btn tone="yolk" icon="people" onClick={() => dispatch({ type: 'help', callId: c.id })}>Check this call</Btn>
              </>
            )}
            {c.kind === 'family' && (
              <button className="m-calls__also" onClick={() => dispatch({ type: 'help', callId: c.id })}>
                Asked for money? Names on a screen can be copied — check it
              </button>
            )}
          </li>
        ))}
      </ul>
      <button className="m-calls__sales" onClick={() => setShowSales(!showSales)} aria-expanded={showSales}>
        <Icon name="quiet" size={24} />
        <span>
          <b>{sales.length} sales calls, screened quietly</b>
          <small>Nothing for you to do.</small>
        </span>
        <Icon name={showSales ? 'up' : 'down'} size={20} />
      </button>
      {showSales && (
        <ul className="m-calls m-calls--sales">
          {sales.map((c) => (
            <li key={c.id}>
              <span className="m-calls__who">
                <b>{c.number}</b>
                <small>{c.at} · likely a sales call</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function BackBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <header className="m-back">
      <button onClick={onBack} aria-label="Back to home">
        <Icon name="left" size={28} />
        Home
      </button>
      <h1>{title}</h1>
    </header>
  )
}
