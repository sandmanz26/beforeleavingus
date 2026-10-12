import { useState } from 'react'
import { Btn, Spec, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { useWorld } from '../../store/world'
import { AnsweredCard, AskCard } from '../shared/AskCard'

// Rob: backup verifier who barely opens the app (persona D). His whole
// experience is notifications — so it's a lock screen.
export function RobApp() {
  const { w, dispatch } = useWorld()
  const inc = w.incident
  const mine = inc?.asks.find((a) => a.member === 'rob')
  const p = w.profiles.rob
  const [pick, setPick] = useState<string | null>(null)
  const time = new Date(w.now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const date = new Date(w.now).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  if (inc && !inc.closed && mine?.state === 'asking')
    return (
      <div className="r-app r-app--ask">
        <AskCard me="rob" inc={inc} />
      </div>
    )

  return (
    <div className="r-app">
      <div className="r-lock">
        <p className="r-lock__date">{date}</p>
        <p className="r-lock__time">{time}</p>
      </div>

      {inc && mine?.state === 'answered' && <AnsweredCard me="rob" inc={inc} />}

      {w.robNudged && p.consent === 'waiting' && (
        <section className="r-note">
          <Spec ids="F-B3 F-B2" />
          <p className="r-note__app">KinVoice · David</p>
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

      {!(inc && mine) && !(w.robNudged && p.consent === 'waiting') && (
        <section className="r-note r-note--quiet">
          <Stamp id="rob" size={32} />
          <p>
            Nothing needs you. You’re number {w.order.indexOf('rob') + 1} in Mum’s phone tree.
            {p.consent === 'agreed' && <><br /><Icon name="tick" size={14} stroke={3} /> Your pattern is set.</>}
          </p>
        </section>
      )}
    </div>
  )
}
