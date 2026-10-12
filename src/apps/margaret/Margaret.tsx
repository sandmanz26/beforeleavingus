import { useState } from 'react'
import { MEMBERS, type MemberId } from '../../data/family'
import { Btn, Spec, Stamp } from '../../components/bits'
import { Icon, RingingIcon } from '../../components/Icon'
import { FamilyCallLayer } from '../../components/FamilyCall'
import { elapsed, useWorld } from '../../store/world'
import { CheckFlow } from './CheckFlow'
import { Happened } from './Happened'
import { Stories } from './Stories'
import { VoiceCheck } from './VoiceCheck'

type Screen = 'home' | 'voice' | 'happened' | 'stories'

export function MargaretApp() {
  const { w, dispatch } = useWorld()
  const [screen, setScreen] = useState<Screen>('home')
  const inc = w.incident
  const call = w.call

  if (call?.state === 'ringing') return <IncomingCall />

  let body
  if (inc && inc.kind === 'call') body = <CheckFlow />
  else if (screen === 'voice' || (inc?.kind === 'message' && inc.outcome)) body = <VoiceCheck onBack={() => setScreen('home')} />
  else if (screen === 'happened') body = <Happened onBack={() => setScreen('home')} />
  else if (screen === 'stories') body = <Stories onBack={() => setScreen('home')} />
  else body = <Home go={setScreen} />

  const callActive = call?.state === 'active'
  const inCrisis = !!inc && inc.kind === 'call' && !inc.closed
  return (
    <div className="m-app">
      <FamilyCallLayer me="margaret" suppressIncoming={inCrisis} />
      {callActive && (
        <div className="m-incall">
          <Icon name="handset" size={18} />
          <span className="m-incall__who">{call.shownAs ? MEMBERS[call.shownAs].name : call.number}</span>
          <span className="m-incall__t">{elapsed(call.startedAt, w.now)}</span>
          <button
            className="m-incall__end"
            onClick={() => (inc && !inc.closed ? dispatch({ type: 'close', how: 'hung-up' }) : dispatch({ type: 'call-decline' }))}
          >
            End
          </button>
        </div>
      )}
      {body}
      {/* On home the big yellow button already is the tab (roast #9). */}
      {callActive && (!inc || inc.kind !== 'call') && !(screen === 'home' && !inc) && (
        <button className="m-helptab" onClick={() => dispatch({ type: 'help' })}>
          <Spec ids="F-C1" place="tl" />
          <RingingIcon size={30} />
          <span>
            <b>Asking for help or money?</b>
            Tap here
          </span>
        </button>
      )}
    </div>
  )
}

function greeting(now: number) {
  const h = new Date(now).getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function Home({ go }: { go: (s: Screen) => void }) {
  const { w, dispatch } = useWorld()
  const date = new Date(w.now).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const family: MemberId[] = ['david', 'emma', 'rob']
  return (
    <div className="m-home">
      <p className="m-date">{date}</p>
      <h1 className="m-display m-display--xl">
        {greeting(w.now)},<br />Margaret.
      </h1>

      <section className="m-fam" aria-label="Ring your family">
        <Spec ids="F-C5" />
        <ul>
          {family.map((id) => (
            <li key={id}>
              <button onClick={() => dispatch({ type: 'ring', from: 'margaret', to: id })} aria-label={`Ring ${MEMBERS[id].name}`}>
                <Stamp id={id} size={52} />
                <span>{MEMBERS[id].name}</span>
                <i className="m-fam__ring"><Icon name="handset" size={14} stroke={3} /></i>
              </button>
            </li>
          ))}
        </ul>
        <p>Tap a face to ring them.</p>
      </section>

      <button className="m-help" onClick={() => dispatch({ type: 'help' })}>
        <Spec ids="F-C1" />
        <RingingIcon size={40} />
        <span className="m-help__text">
          <b>Someone’s asking for help or money</b>
          <span>Tap here — even in the middle of a call.</span>
        </span>
      </button>

      {w.drill === 'scheduled' && (
        <div className="m-drill">
          <Spec ids="F-E2" />
          <p>
            <b>David set up a practice.</b> Two minutes. Nothing goes outside the family.
          </p>
          <Btn tone="ink" onClick={() => dispatch({ type: 'practice-start' })}>Start the practice</Btn>
        </div>
      )}

      <button className="m-tile m-tile--wide" onClick={() => go('voice')}>
        <Spec ids="F-D1" />
        <Icon name="voicenote" size={34} />
        <span>Check a voice message</span>
        {w.freshMessage ? <em className="m-tile__new">1 new</em> : <Icon name="chevron" size={22} />}
      </button>

      <p className="m-quiet">
        <Spec ids="F-A2" place="inline" />
        <Icon name="quiet" size={22} />
        {w.quietToday} calls today looked like sales calls. Nothing for you to do.
      </p>

      <nav className="m-links">
        <button onClick={() => go('happened')}>
          <Spec ids="F-F1" place="inline" />
          <Icon name="buoy" size={24} />
          Something already happened
          <Icon name="chevron" size={20} />
        </button>
        <button onClick={() => go('stories')}>
          <Spec ids="F-E1" place="inline" />
          <Icon name="book" size={24} />
          Why the family set this up
          <Icon name="chevron" size={20} />
        </button>
      </nav>
    </div>
  )
}

function IncomingCall() {
  const { w, dispatch } = useWorld()
  const c = w.call!
  const shown = c.shownAs ? MEMBERS[c.shownAs] : null
  return (
    <div className="os-call">
      <p className="os-call__label">{c.spam ? 'Incoming call' : 'Incoming call · mobile'}</p>
      <p className="os-call__who">{shown ? shown.name : c.number}</p>
      {shown && <p className="os-call__num">{c.number}</p>}
      {!c.spam && (
        <div className="os-note">
          <Spec ids="F-C6" />
          <p className="os-note__brand">KinVoice</p>
          {shown ? (
            <p>
              The screen says “{shown.name}”. <b>Names on a screen can be copied</b>, so this doesn’t tell us who’s calling.
            </p>
          ) : (
            <p>
              <b>A number you haven’t saved.</b> If they ask for help or money, tap the yellow tab.
            </p>
          )}
        </div>
      )}
      <div className="os-call__actions">
        <button className="os-btn os-btn--decline" onClick={() => dispatch({ type: 'call-decline' })} aria-label="Decline">
          <Icon name="handset" size={34} style={{ transform: 'rotate(135deg)' }} />
          <span>Decline</span>
        </button>
        <button className="os-btn os-btn--accept" onClick={() => dispatch({ type: 'call-answer' })} aria-label="Answer">
          <Icon name="handset" size={34} />
          <span>Answer</span>
        </button>
      </div>
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
