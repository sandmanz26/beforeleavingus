import { useState } from 'react'
import { MEMBERS, type MemberId } from '../../data/family'
import { Btn, Spec, Stamp } from '../../components/bits'
import { Icon, RingingIcon } from '../../components/Icon'
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
  return (
    <div className="m-app">
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
      {callActive && (!inc || inc.kind !== 'call') && (
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

      <ul className="m-fam" aria-label="Your family">
        {family.map((id) => (
          <li key={id}>
            <Stamp id={id} size={50} />
            <span>{MEMBERS[id].name}</span>
          </li>
        ))}
      </ul>

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
            <b>David set up a practice.</b> Two minutes. Nothing is sent anywhere.
          </p>
          <Btn tone="ink" onClick={() => dispatch({ type: 'practice-start' })}>Start the practice</Btn>
        </div>
      )}

      <div className="m-tiles">
        <button className="m-tile" onClick={() => go('voice')}>
          <Spec ids="F-D1" />
          <Icon name="voicenote" size={34} />
          <span>Check a voice message</span>
          {w.freshMessage && <em className="m-tile__new">1 new</em>}
        </button>
        <button className="m-tile" onClick={() => go('stories')}>
          <Spec ids="F-E1" />
          <Icon name="book" size={34} />
          <span>Why the family set this up</span>
        </button>
      </div>

      <p className="m-quiet">
        <Spec ids="F-A2" place="inline" />
        <Icon name="quiet" size={22} />
        {w.quietToday} calls today looked like sales calls. Nothing for you to do.
      </p>

      <button className="m-happened" onClick={() => go('happened')}>
        <Spec ids="F-F1" place="inline" />
        <Icon name="buoy" size={24} />
        Something already happened
        <Icon name="chevron" size={20} />
      </button>
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
