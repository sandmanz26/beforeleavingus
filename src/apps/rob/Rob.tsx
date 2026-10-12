import { useState } from 'react'
import { Btn, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { useWorld } from '../../store/world'
import { MeButton } from '../../shell/Shell'
import { AnsweredCard, AskCard } from '../shared/AskCard'

// Rob: the backup who rarely opens the app (persona D). It's quiet until
// someone needs him — then it's one card with one-tap answers.
export function RobApp() {
  const { w, dispatch } = useWorld()
  const inc = w.incident
  const mine = inc?.asks.find((a) => a.member === 'rob')
  const p = w.profiles.rob
  const [pick, setPick] = useState<string | null>(null)

  if (inc && !inc.closed && mine?.state === 'asking')
    return (
      <div className="r-app r-app--ask">
        <div className="ask-top"><MeButton /></div>
        <AskCard me="rob" inc={inc} />
      </div>
    )

  const nudged = w.robNudged && p.consent === 'waiting'
  return (
    <div className="r-app">
      <div className="e-top">
        <p className="e-eyebrow">Mum’s circle</p>
        <MeButton />
      </div>
      <h1 className="r-title">Hello, Rob.</h1>

      {inc && mine?.state === 'answered' && <AnsweredCard me="rob" inc={inc} />}

      {nudged && (
        <section className="r-note">
          <p className="r-note__app">From David</p>
          <b>Add how you talk to Mum?</b>
          <p>One question. Nothing is kept until you agree, and your voice is never copied.</p>
          <p className="r-note__q">What do you call her?</p>
          <div className="r-chips">
            {['Ma', 'Mum', 'Mother'].map((n) => (
              <button key={n} className={`e-chip${pick === n ? ' is-on' : ''}`} onClick={() => setPick(n)}>{n}</button>
            ))}
          </div>
          <Btn
            tone="ink"
            disabled={!pick}
            onClick={() => {
              const all = ['Ma', 'Mum', 'Mother', 'Mom']
              dispatch({ type: 'profile', member: 'rob', patch: { callsHer: [pick!], neverSays: all.filter((x) => x !== pick), greetings: [`${pick}, it’s Rob`], signoffs: ['Ring me if you need anything'], updatedDaysAgo: 0 } })
              dispatch({ type: 'consent', member: 'rob', consent: 'agreed' })
            }}
          >
            I agree — save it
          </Btn>
        </section>
      )}

      {!(inc && mine) && !nudged && (
        <section className="r-quiet">
          <Stamp id="rob" size={44} />
          <div>
            <b>Nothing needs you.</b>
            <p>You’re number {w.order.indexOf('rob') + 1} in Mum’s phone tree. If someone claims to be family and nobody ahead of you answers, you’ll be asked here.</p>
          </div>
        </section>
      )}

      <ul className="r-facts">
        <li><Icon name={p.consent === 'agreed' ? 'tick' : 'clock'} size={20} /> {p.consent === 'agreed' ? `Your pattern is set: you call her “${p.callsHer[0]}”.` : 'Your pattern isn’t set up yet.'}</li>
        <li><Icon name="lock" size={20} /> KinVoice never keeps or copies anyone’s voice.</li>
      </ul>
    </div>
  )
}
