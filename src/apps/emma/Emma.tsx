import { useState } from 'react'
import { Btn, Pill, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { useWorld } from '../../store/world'
import { AnsweredCard, AskCard } from '../shared/AskCard'
import { MeButton } from '../../shell/Shell'

type Screen = 'home' | 'pattern' | 'footprint' | 'consent'

export function EmmaApp() {
  const { w } = useWorld()
  const [screen, setScreen] = useState<Screen>('home')
  const inc = w.incident
  const mine = inc?.asks.find((a) => a.member === 'emma')

  if (inc && !inc.closed && mine?.state === 'asking')
    return (
      <div className="e-app e-app--ask">
        <div className="ask-top"><MeButton /></div>
        <AskCard me="emma" inc={inc} />
      </div>
    )

  return (
    <div className="e-app">
      {screen === 'home' && <Home go={setScreen} />}
      {screen === 'pattern' && <Pattern back={() => setScreen('home')} />}
      {screen === 'footprint' && <Footprint back={() => setScreen('home')} />}
      {screen === 'consent' && <ConsentPage back={() => setScreen('home')} />}
    </div>
  )
}

const AWAY = [
  { label: 'In class', icon: 'book' },
  { label: 'At work', icon: 'calendar' },
  { label: 'On a flight', icon: 'plane' },
  { label: 'Driving', icon: 'clock' },
]

function Home({ go }: { go: (s: Screen) => void }) {
  const { w, dispatch } = useWorld()
  const p = w.profiles.emma
  const away = w.away.emma
  const inc = w.incident
  const stale = p.consent === 'agreed' && p.updatedDaysAgo > 90
  const until = new Date(w.now + 2 * 3600_000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="e-page">
      <div className="e-top">
        <p className="e-eyebrow">Nan’s circle</p>
        <MeButton />
      </div>
      <h1 className="e-title">Hiya, Emma.</h1>

      {inc && inc.asks.some((a) => a.member === 'emma' && a.state === 'answered') && <AnsweredCard me="emma" inc={inc} />}

      <section className="e-role">
        <Stamp id="emma" size={44} />
        <p>If someone copies your voice and rings Nan, <b>her phone asks you first</b>. You answer right here, in one tap.</p>
      </section>

      <section className="e-card">
        <h2>Can’t pick up for a while?</h2>
        {away ? (
          <div className="e-away">
            <Pill tone="yolk" icon="plane">{away.label} until {away.until}</Pill>
            <p>Nan’s checks skip straight to David while you’re away.</p>
            <Btn tone="paper" onClick={() => dispatch({ type: 'away', member: 'emma', away: null })}>I’m back</Btn>
          </div>
        ) : (
          <>
            <p className="e-muted">Tell the circle, and checks skip straight to the next person. Scammers pick these moments on purpose.</p>
            <div className="e-chips">
              {AWAY.map((a) => (
                <button key={a.label} className="e-chip" onClick={() => dispatch({ type: 'away', member: 'emma', away: { label: a.label, until } })}>
                  <Icon name={a.icon} size={18} /> {a.label}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      <button className="e-row" onClick={() => go('pattern')}>
        <span className="e-row__icon"><Icon name="voicenote" size={24} /></span>
        <span className="e-row__body">
          <b>How you talk to Nan</b>
          <small>
            {p.consent === 'agreed' ? `“${p.greetings[0]}” · calls her ${p.callsHer.join(' / ')}` : 'Not set up'}
          </small>
          {stale && <Pill tone="yolk" icon="clock">{p.updatedDaysAgo} days old — refresh</Pill>}
        </span>
        <Icon name="chevron" size={20} />
      </button>

      <button className="e-row" onClick={() => go('footprint')}>
        <span className="e-row__icon"><Icon name="footprint" size={24} /></span>
        <span className="e-row__body">
          <b>Your voice online</b>
          <small>41 public videos with your voice · 2 of 5 tips done</small>
        </span>
        <Icon name="chevron" size={20} />
      </button>

      <button className="e-row" onClick={() => go('consent')}>
        <span className="e-row__icon"><Icon name="lock" size={24} /></span>
        <span className="e-row__body">
          <b>Your pattern, your say</b>
          <small>{p.consent === 'agreed' ? `Agreed ${p.consentDate} · pause or delete any time` : p.consent === 'paused' ? 'Paused' : 'Nothing stored'}</small>
        </span>
        <Icon name="chevron" size={20} />
      </button>
    </div>
  )
}

const NAMES = ['Nan', 'Nana', 'Nanna', 'Gran', 'Granny', 'Grandma']
const HELLOS = ['Hiya Nan', 'Nanaaa', 'Hey Nan', 'Hello Grandma']
const BYES = ['Love you loads', 'Byeee', 'Speak soon', 'Take care']

function Pattern({ back }: { back: () => void }) {
  const { w, dispatch } = useWorld()
  const p = w.profiles.emma
  const [names, setNames] = useState<string[]>(p.callsHer.length ? p.callsHer : ['Nan'])
  const [hellos, setHellos] = useState<string[]>(p.greetings)
  const [byes, setByes] = useState<string[]>(p.signoffs)
  const [notes, setNotes] = useState(p.notesRead)
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const never = NAMES.filter((n) => !names.includes(n) && n !== 'Nanna')

  return (
    <div className="e-page">
      <header className="e-back">
        <button onClick={back} aria-label="Back"><Icon name="left" size={22} /></button>
        <span>How you talk to Nan</span>
      </header>
      <p className="e-muted">A copied voice gets your sound. It doesn’t get these. Tap what’s true for you.</p>

      <h2 className="e-q">What do you call her?</h2>
      <div className="e-chips">
        {NAMES.map((n) => <button key={n} className={`e-chip${names.includes(n) ? ' is-on' : ''}`} onClick={() => toggle(names, setNames, n)}>{n}</button>)}
      </div>
      <h2 className="e-q">How do you say hello?</h2>
      <div className="e-chips">
        {HELLOS.map((n) => <button key={n} className={`e-chip${hellos.includes(n) ? ' is-on' : ''}`} onClick={() => toggle(hellos, setHellos, n)}>{n}</button>)}
      </div>
      <h2 className="e-q">How do you say bye?</h2>
      <div className="e-chips">
        {BYES.map((n) => <button key={n} className={`e-chip${byes.includes(n) ? ' is-on' : ''}`} onClick={() => toggle(byes, setByes, n)}>{n}</button>)}
      </div>
      <h2 className="e-q">You’d never say</h2>
      <div className="e-chips">
        {never.map((n) => <span key={n} className="e-chip e-chip--no">{n}</span>)}
      </div>

      <section className="e-card e-card--line">
        <h2>Old voice notes to Nan</h2>
        <p className="e-muted">Read on this phone for words like “Hiya Nan”. Your voice itself is never kept, and never copied.</p>
        <Btn tone="paper" icon="mic" onClick={() => setNotes(notes + 3)}>{notes} read · add 3 more</Btn>
      </section>

      <Btn
        tone="ink"
        big
        onClick={() => {
          dispatch({ type: 'profile', member: 'emma', patch: { callsHer: names, greetings: hellos, signoffs: byes, neverSays: never, notesRead: notes, updatedDaysAgo: 0 } })
          if (p.consent !== 'agreed') dispatch({ type: 'consent', member: 'emma', consent: 'agreed' })
          back()
        }}
      >
        Save
      </Btn>
    </div>
  )
}

const TIPS = [
  { t: 'Never post what you call Nan', d: '“Nan”, “Nanaaa” — that’s your pattern. Keep it off captions.', done: true },
  { t: 'Keep family-question answers offline', d: 'No “Bluebell” in your posts, ever.', done: true },
  { t: 'Tell Nan you’ll never ask for money by voice note', d: 'Say it out loud next visit. It sticks.', done: false },
  { t: 'Untag Nan’s town from old posts', d: 'Scammers use it to find her number.', done: false },
  { t: 'Make TikTok friends-only — or decide it’s public', d: 'Either is fine. Just choose on purpose.', done: false },
]

function Footprint({ back }: { back: () => void }) {
  const [done, setDone] = useState(TIPS.map((t) => t.done))
  return (
    <div className="e-page">
      <header className="e-back">
        <button onClick={back} aria-label="Back"><Icon name="left" size={22} /></button>
        <span>Your voice online</span>
      </header>
      <p className="e-lede">Three seconds of your voice is enough to copy it. You don’t have to stop posting — just keep the family stuff out.</p>
      <ul className="e-sources">
        <li><b>TikTok</b><span>41 public videos with your voice</span></li>
        <li><b>Instagram</b><span>12 public reels</span></li>
        <li><b>YouTube</b><span>Nothing public</span></li>
      </ul>
      <h2 className="e-q">{done.filter(Boolean).length} of {TIPS.length} done</h2>
      <ul className="e-tips">
        {TIPS.map((t, i) => (
          <li key={t.t}>
            <button className={done[i] ? 'is-on' : ''} onClick={() => setDone(done.map((d, j) => (j === i ? !d : d)))} aria-pressed={done[i]}>
              <span className="e-tips__box">{done[i] && <Icon name="tick" size={16} stroke={3.2} />}</span>
              <span>
                <b>{t.t}</b>
                <small>{t.d}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ConsentPage({ back }: { back: () => void }) {
  const { w, dispatch } = useWorld()
  const p = w.profiles.emma
  return (
    <div className="e-page">
      <header className="e-back">
        <button onClick={back} aria-label="Back"><Icon name="left" size={22} /></button>
        <span>Your pattern, your say</span>
      </header>
      <section className="e-card e-card--line">
        <h2>What’s kept</h2>
        <ul className="e-list">
          <li><Icon name="tick" size={18} stroke={3} /> The words you chose: what you call Nan, hello, bye.</li>
          <li><Icon name="tick" size={18} stroke={3} /> Who can see it: Nan’s KinVoice. David sees a summary.</li>
        </ul>
        <h2>What’s never kept</h2>
        <ul className="e-list e-list--no">
          <li><Icon name="cross" size={18} stroke={3} /> Your voice. KinVoice never makes a copy of anyone’s voice, for any reason.</li>
          <li><Icon name="cross" size={18} stroke={3} /> Your messages. Voice notes are read for words, then forgotten.</li>
        </ul>
      </section>
      {p.consent === 'agreed' && (
        <>
          <Btn tone="paper" icon="pause" onClick={() => dispatch({ type: 'consent', member: 'emma', consent: 'paused' })}>Pause my pattern</Btn>
          <Btn tone="ghost" icon="trash" onClick={() => { dispatch({ type: 'consent', member: 'emma', consent: 'waiting' }); dispatch({ type: 'profile', member: 'emma', patch: { callsHer: [], greetings: [], signoffs: [], neverSays: [], notesRead: 0 } }) }}>Delete it completely</Btn>
        </>
      )}
      {p.consent === 'paused' && <Btn tone="ink" onClick={() => dispatch({ type: 'consent', member: 'emma', consent: 'agreed' })}>Turn it back on</Btn>}
      {p.consent === 'waiting' && <p className="e-muted">Nothing is stored. Set it up again from “How you talk to Nan” if you change your mind.</p>}
    </div>
  )
}
