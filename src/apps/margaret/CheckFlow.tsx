import type { ReactNode } from 'react'
import { MEMBERS, type MemberId } from '../../data/family'
import { Btn, Dot, Spec, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { KettleDial, mmss } from '../../components/Kettle'
import { elapsed, useWorld } from '../../store/world'
import type { Incident, PayMethod } from '../../store/types'
import type { World } from '../../store/types'
import { FamilyStrip } from './FamilyStrip'
import { factsFor } from './facts'

// F-C1 → F-C2 → F-C4, with F-C3/F-C5 running underneath.
// v2 rules (see docs/ROAST.md):
//  · three taps to the pause: who → family question → what they want
//  · one header, one decision, and the decision lives in a dock that
//    never scrolls away
//  · every step can go back
//  · the pause is her promise — we never claim to block a payment
// Crisis screens drop the display face: character when calm, clarity in a crisis.

export function CheckFlow() {
  const { w } = useWorld()
  const inc = w.incident!
  if (inc.closed) return <Closing inc={inc} />
  if (inc.outcome) return <Outcome inc={inc} />

  const step = !inc.claimed ? 'who' : inc.question === null ? 'question' : inc.money === null ? 'want' : 'pause'

  return (
    <div className={`m-crisis${inc.practice ? ' is-practice' : ''}`}>
      <CrisisHeader inc={inc} />
      {inc.practice && <p className="m-practice">Practice from David. Nothing goes to anyone outside the family.</p>}
      {inc.secondhand ? (
        <SecondHand inc={inc} />
      ) : (
        <>
          {step === 'who' && <Who />}
          {step === 'question' && <Question inc={inc} />}
          {step === 'want' && <Want />}
          {step === 'pause' && <Pause inc={inc} />}
        </>
      )}
    </div>
  )
}

// ── One header: the kettle timer and the live family line, together. ──
function CrisisHeader({ inc }: { inc: Incident }) {
  const { w, dispatch } = useWorld()
  const onCall = w.call?.state === 'active'
  return (
    <header className="m-head">
      <Spec ids="F-C4 F-C5" />
      <div className="m-head__row">
        <span className="m-head__pause">
          <Icon name="kettle" size={28} />
          <b>{mmss(inc.pauseEndsAt - w.now)}</b>
          <span>pause</span>
        </span>
        <button className="m-head__out" onClick={() => dispatch({ type: 'close', how: 'hung-up' })}>
          {onCall ? 'I’ve hung up' : 'Stop'}
        </button>
      </div>
      <LiveLine w={w} inc={inc} />
    </header>
  )
}

function LiveLine({ w, inc }: { w: World; inc: Incident }) {
  if (!inc.claimed) return <p className="m-head__live">Tap who they say they are. We’ll ask them on their own phone.</p>
  const asking = inc.asks.filter((a) => a.state === 'asking')
  const away = inc.asks.filter((a) => a.state === 'away')
  const lastSent = Math.max(...inc.asks.map((a) => a.sentAt))
  const exhausted = inc.asks.length >= inc.tree.length && w.now - lastSent >= w.settings.escalateAfterSec * 1000
  if (!asking.length) return <p className="m-head__live">Nobody to ask right now.</p>
  const names = asking.map((a) => MEMBERS[a.member].name).join(' and ')
  const since = elapsed(asking[asking.length - 1].sentAt, w.now)
  return (
    <p className="m-head__live">
      <Dot pulse />
      {away.length > 0 && <span className="m-head__away">{MEMBERS[away[0].member].name} is away · </span>}
      {exhausted ? <>Nobody has answered yet. That’s normal.</> : <>Asking <b>{names}</b> · {since}</>}
    </p>
  )
}

// ── Dock: the decision, pinned to the bottom. Family calls ring in here too. ──
function Dock({ children }: { children?: ReactNode }) {
  const { w, dispatch } = useWorld()
  const fc = w.familyCall
  const ringing = fc && fc.to === 'margaret' && fc.state === 'ringing' ? MEMBERS[fc.from] : null
  return (
    <div className="m-dock">
      {ringing && (
        <div className="m-waiting" role="alert">
          <Spec ids="F-C5" />
          <Stamp id={ringing.id} size={40} />
          <p><b>{ringing.name} is ringing you</b> on {ringing.name}’s usual number.</p>
          <Btn tone="ink" big icon="handset" onClick={() => dispatch({ type: 'ring-answer' })}>Hang up and answer {ringing.name}</Btn>
        </div>
      )}
      {children}
    </div>
  )
}

function BackLink() {
  const { dispatch } = useWorld()
  return (
    <button className="m-backlink" onClick={() => dispatch({ type: 'back' })}>
      <Icon name="left" size={22} /> Back
    </button>
  )
}

function Who() {
  const { dispatch } = useWorld()
  const people: (MemberId | 'other')[] = ['emma', 'david', 'rob', 'other']
  return (
    <>
      <section className="m-step">
        <Spec ids="F-C1" />
        <h1 className="m-q">Who do they say they are?</h1>
        <div className="m-who">
          {people.map((p) => (
            <button key={p} className="m-who__tile" onClick={() => dispatch({ type: 'claim', who: p })}>
              <Stamp id={p} size={62} />
              <span>{p === 'other' ? 'Police, lawyer or hospital' : MEMBERS[p].name}</span>
            </button>
          ))}
        </div>
        <p className="m-calm">For the next ten minutes, don’t send anything — whatever they say.</p>
      </section>
      <Dock />
    </>
  )
}

function Question({ inc }: { inc: Incident }) {
  const { w, dispatch } = useWorld()
  const q = w.questions.find((x) => x.id === inc.questionId)
  if (!q) return null
  return (
    <>
      <section className="m-step">
        <Spec ids="F-C2" />
        <p className="m-label">Ask them this</p>
        <div className="m-card m-card--ask">
          <p className="m-card__q">“{q.ask}”</p>
          <p className="m-listen">
            <Icon name="ear" size={26} />
            <span>
              Listen for <b>{q.answer}</b>
              <small>Don’t say it out loud.</small>
            </span>
          </p>
        </div>
      </section>
      <Dock>
        <div className="m-dock__answers">
          <Btn tone="paper" onClick={() => dispatch({ type: 'question', result: 'said' })}>They said it</Btn>
          <Btn tone="paper" onClick={() => dispatch({ type: 'question', result: 'wrong' })}>They got it wrong</Btn>
          <Btn tone="paper" onClick={() => dispatch({ type: 'question', result: 'dodged' })}>They avoided it</Btn>
        </div>
        <BackLink />
      </Dock>
    </>
  )
}

const WANTS: { v: PayMethod | 'none'; label: string; icon: string }[] = [
  { v: 'gift', label: 'Gift cards', icon: 'gift' },
  { v: 'cash', label: 'Cash, collected at the door', icon: 'door' },
  { v: 'transfer', label: 'A bank transfer', icon: 'transfer' },
  { v: 'crypto', label: 'Bitcoin', icon: 'coin' },
  { v: 'other', label: 'Money, some other way', icon: 'info' },
  { v: 'none', label: 'Not money — yet', icon: 'clock' },
]

function Want() {
  const { dispatch } = useWorld()
  return (
    <>
      <section className="m-step">
        <h1 className="m-q">What are they asking for?</h1>
        <div className="m-methods">
          {WANTS.map((m) => (
            <button key={m.v} className="m-method" onClick={() => dispatch({ type: 'want', v: m.v })}>
              <Icon name={m.icon} size={32} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </section>
      <Dock>
        <BackLink />
      </Dock>
    </>
  )
}

// Who to ring after hanging up: the circle keeper, unless they're the one being impersonated.
function ringTarget(w: World, inc: Incident): MemberId {
  return (w.order.find((m) => m !== inc.claimed && !w.away[m]) ?? 'david') as MemberId
}

function Pause({ inc }: { inc: Incident }) {
  const { w, dispatch } = useWorld()
  const left = inc.pauseEndsAt - w.now
  const total = w.settings.pauseMinutes * 60_000
  const done = left <= 0
  const facts = factsFor(inc)
  const onCall = w.call?.state === 'active'
  const target = MEMBERS[ringTarget(w, inc)]
  return (
    <>
      <section className="m-step m-pause">
        <Spec ids="F-C4" />
        <div className="m-pause__dial">
          <KettleDial left={left} total={total} size={128} />
          <div>
            <p className="m-pause__kicker">{done ? 'The kettle’s boiled.' : 'Put the kettle on.'}</p>
            <p className="m-pause__time"><b>{mmss(left)}</b> {done ? 'pause over' : 'to go'}</p>
          </div>
        </div>
        <h1 className="m-q">{done ? 'Still nothing from family. Keep waiting — don’t send anything.' : 'Don’t send anything for ten minutes.'}</h1>
        {onCall && (
          <div className="m-script">
            <p className="m-label">Say this to them</p>
            <p className="m-script__line">“I’ll ring you back in ten minutes.”</p>
            <p className="m-script__then">If they won’t wait, hang up.</p>
          </div>
        )}
        {inc.question === 'said' && (
          <p className="m-note"><Icon name="card" size={24} /> They knew the family answer. Even so, let family sort out any money.</p>
        )}
        <p className="m-note"><Icon name="hush" size={24} /> Whatever they said, you’re allowed to tell family.</p>
        <FamilyStrip inc={inc} />
        {facts.length > 0 && (
          <section className="m-facts">
            <h2>What we know so far</h2>
            <ul>
              {facts.map((f, i) => (
                <li key={i} className={`is-${f.tone}`}>
                  <Icon name={f.icon} size={24} />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
      <Dock>
        {onCall ? (
          <>
            <Btn tone="red" big icon="handset" onClick={() => dispatch({ type: 'close', how: 'hung-up' })}>Hang up</Btn>
            <Btn tone="paper" icon="handset" onClick={() => dispatch({ type: 'hangup-ring', to: target.id })}>Hang up and ring {target.name}</Btn>
          </>
        ) : (
          <>
            <Btn tone="ink" big onClick={() => dispatch({ type: 'close', how: 'done' })}>I’m done</Btn>
            <Btn tone="paper" icon="handset" onClick={() => dispatch({ type: 'hangup-ring', to: target.id })}>Ring {target.name}</Btn>
          </>
        )}
      </Dock>
    </>
  )
}

// A relative's answer: useful, never final (roast #6, S-04).
function SecondHand({ inc }: { inc: Incident }) {
  const { w, dispatch } = useWorld()
  const by = MEMBERS[inc.secondhand!.by]
  const claimed = inc.claimed && inc.claimed !== 'other' ? MEMBERS[inc.claimed] : null
  const onCall = w.call?.state === 'active'
  return (
    <>
      <section className="m-outcome m-outcome--soft" style={{ ['--who' as string]: by.color }}>
        <Spec ids="F-C5 F-C3" />
        <Stamp id={by.id} size={64} />
        <h1 className="m-outcome__head m-outcome__head--s">{by.name} answered: “I know where {claimed?.name ?? 'they are'}{claimed ? ' is' : ''} right now.”</h1>
        {claimed && <p className="m-body">We’re still asking {claimed.name} on {claimed.name}’s own phone.</p>}
        <p className="m-body m-body--strong">You can hang up. If it was {claimed?.name ?? 'family'}, {claimed?.name ?? 'they'} will ring you on the usual number.</p>
      </section>
      <Dock>
        {onCall ? (
          <Btn tone="red" big icon="handset" onClick={() => dispatch({ type: 'close', how: 'hung-up' })}>Hang up</Btn>
        ) : (
          <Btn tone="ink" big onClick={() => dispatch({ type: 'close', how: 'done' })}>Okay</Btn>
        )}
        {claimed && <Btn tone="paper" icon="handset" onClick={() => dispatch({ type: 'hangup-ring', to: claimed.id })}>{onCall ? 'Hang up and ring' : 'Ring'} {claimed.name}</Btn>}
      </Dock>
    </>
  )
}

function Outcome({ inc }: { inc: Incident }) {
  const { w, dispatch } = useWorld()
  const o = inc.outcome!
  const by = MEMBERS[o.by]
  const onCall = w.call?.state === 'active'
  if (o.kind === 'yes-me') {
    return (
      <div className="m-crisis">
        <section className="m-outcome" style={{ ['--who' as string]: by.color }}>
          <Spec ids="F-C3 F-A1" />
          <Stamp id={o.by} size={96} />
          <h1 className="m-outcome__head">{by.name} answered: “Yes, it’s me.”</h1>
          <p className="m-body">Answered on {by.name}’s own phone, just now. The pause is over.</p>
          <p className="m-callout is-family">
            <Icon name="heart" size={26} /> David has been asked to help {by.name}. You don’t need to send anything.
          </p>
        </section>
        <Dock>
          <Btn tone="ink" big onClick={() => dispatch({ type: 'close', how: 'done' })}>Okay</Btn>
        </Dock>
      </div>
    )
  }
  return (
    <div className="m-crisis">
      <section className="m-outcome" style={{ ['--who' as string]: by.color }}>
        <Spec ids="F-C3" />
        <Stamp id={o.by} size={96} />
        <h1 className="m-outcome__head">{by.name} answered: “That’s not me.”</h1>
        <p className="m-body">Answered on {by.name}’s own phone, just now.</p>
        <p className="m-body m-body--strong">{onCall ? 'You can hang up now. You don’t need to explain.' : 'You don’t need to do anything else.'}</p>
      </section>
      <Dock>
        {onCall ? (
          <Btn tone="red" big icon="handset" onClick={() => dispatch({ type: 'close', how: 'hung-up' })}>Hang up</Btn>
        ) : (
          <Btn tone="ink" big onClick={() => dispatch({ type: 'close', how: 'done' })}>Okay</Btn>
        )}
        <Btn tone="paper" icon="handset" onClick={() => dispatch({ type: 'hangup-ring', to: by.id })}>{onCall ? 'Hang up and ring' : 'Ring'} {by.name}</Btn>
      </Dock>
    </div>
  )
}

function Closing({ inc }: { inc: Incident }) {
  const { dispatch } = useWorld()
  const yes = inc.outcome?.kind === 'yes-me'
  const who = inc.outcome ? MEMBERS[inc.outcome.by].name : ''
  const head = inc.practice ? 'Practice done.' : yes ? 'Help is on its way.' : 'You checked first.'
  const body = inc.practice
    ? 'That’s all it takes: the yellow button, then one question at a time.'
    : yes
      ? `David has been asked to help ${who}. Checking first is what the family hoped you’d do.`
      : 'That’s what the family hoped you’d do. David can see what happened, so you won’t need to explain it twice.'
  return (
    <section className="m-closing">
      <Icon name={inc.practice ? 'tick' : 'heart'} size={56} className="m-closing__icon" />
      <h1 className="m-display m-display--xl">{head}</h1>
      <p className="m-body">{body}</p>
      {!inc.practice && !yes && <p className="m-body m-muted">If that number rings again, you don’t have to answer.</p>}
      <Btn tone="ink" big onClick={() => dispatch({ type: 'clear-incident' })}>Back to home</Btn>
    </section>
  )
}
