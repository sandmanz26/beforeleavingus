import { MEMBERS, type MemberId } from '../../data/family'
import { Btn, Spec, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { KettleDial, mmss } from '../../components/Kettle'
import { useWorld } from '../../store/world'
import type { Incident, PayMethod } from '../../store/types'
import { FamilyStrip } from './FamilyStrip'
import { factsFor } from './facts'

// F-C1 → F-C2 → F-C4 with F-C3/F-C5 running underneath.
// Rule: one decision per screen, short sentences, big targets.
// Crisis screens drop the display face entirely — character when calm,
// clarity in a crisis.

export function CheckFlow() {
  const { w, dispatch } = useWorld()
  const inc = w.incident!
  if (inc.closed) return <Closing inc={inc} />
  if (inc.outcome) return <Outcome inc={inc} />

  const step = !inc.claimed
    ? 'who'
    : inc.question === null
      ? 'question'
      : inc.money === null
        ? 'money'
        : inc.money === 'yes' && !inc.method
          ? 'method'
          : inc.secret === null
            ? 'secret'
            : 'pause'

  const left = inc.pauseEndsAt - w.now
  const onCall = w.call?.state === 'active'

  return (
    <div className={`m-crisis${inc.practice ? ' is-practice' : ''}`}>
      <header className="m-crisis__bar">
        <span className="m-crisis__pause">
          <Spec ids="F-C4" place="inline" />
          <Icon name="kettle" size={26} />
          <span>
            Pause <b>{mmss(left)}</b>
          </span>
        </span>
        <button className="m-crisis__out" onClick={() => dispatch({ type: 'close', how: 'hung-up' })}>
          {onCall ? 'I’ve hung up' : 'Stop'}
        </button>
      </header>
      {inc.practice && <p className="m-practice">Practice from David. Nothing is being sent anywhere.</p>}
      {step !== 'who' && step !== 'pause' && <FamilyStrip inc={inc} />}

      {step === 'who' && <Who />}
      {step === 'question' && <Question inc={inc} />}
      {step === 'money' && (
        <Ask
          title="Are they asking for money?"
          options={[
            { label: 'Yes', act: () => dispatch({ type: 'money', v: 'yes' }) },
            { label: 'Not yet', act: () => dispatch({ type: 'money', v: 'notyet' }) },
            { label: 'No', act: () => dispatch({ type: 'money', v: 'no' }) },
          ]}
        />
      )}
      {step === 'method' && <Method />}
      {step === 'secret' && (
        <Ask
          title="Did they ask you to keep it secret?"
          hint="Like “Don’t tell Mum” or “Don’t tell anyone”."
          options={[
            { label: 'Yes', act: () => dispatch({ type: 'secret', v: 'yes' }) },
            { label: 'No', act: () => dispatch({ type: 'secret', v: 'no' }) },
          ]}
        />
      )}
      {step === 'pause' && <Pause inc={inc} left={left} onCall={onCall} />}
    </div>
  )
}

function Who() {
  const { dispatch } = useWorld()
  const people: (MemberId | 'other')[] = ['emma', 'david', 'rob', 'other']
  return (
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
      <p className="m-calm">Your pause has started. Nothing can be sent for ten minutes.</p>
    </section>
  )
}

function Question({ inc }: { inc: Incident }) {
  const { w, dispatch } = useWorld()
  const q = w.questions.find((x) => x.id === inc.questionId)
  if (!q) return null
  return (
    <section className="m-step">
      <Spec ids="F-C2" />
      <p className="m-label">Ask them this</p>
      <div className="m-card">
        <p className="m-card__q">“{q.ask}”</p>
      </div>
      <p className="m-listen">
        <Icon name="ear" size={26} />
        <span>
          Listen for <b>{q.answer}</b>
          <small>Don’t say it out loud.</small>
        </span>
      </p>
      <div className="m-answers">
        <Btn tone="paper" big onClick={() => dispatch({ type: 'question', result: 'said' })}>They said it</Btn>
        <Btn tone="paper" big onClick={() => dispatch({ type: 'question', result: 'wrong' })}>They got it wrong</Btn>
        <Btn tone="paper" big onClick={() => dispatch({ type: 'question', result: 'dodged' })}>They avoided it</Btn>
      </div>
    </section>
  )
}

function Ask({ title, hint, options }: { title: string; hint?: string; options: { label: string; act: () => void }[] }) {
  return (
    <section className="m-step">
      <h1 className="m-q">{title}</h1>
      {hint && <p className="m-hint">{hint}</p>}
      <div className="m-answers">
        {options.map((o) => (
          <Btn key={o.label} tone="paper" big onClick={o.act}>{o.label}</Btn>
        ))}
      </div>
    </section>
  )
}

const METHODS: { v: PayMethod; label: string; icon: string }[] = [
  { v: 'gift', label: 'Gift cards', icon: 'gift' },
  { v: 'cash', label: 'Cash collected at the door', icon: 'door' },
  { v: 'transfer', label: 'Bank transfer', icon: 'transfer' },
  { v: 'crypto', label: 'Bitcoin', icon: 'coin' },
  { v: 'other', label: 'Another way', icon: 'info' },
]

function Method() {
  const { dispatch } = useWorld()
  return (
    <section className="m-step">
      <h1 className="m-q">How do they want it?</h1>
      <div className="m-methods">
        {METHODS.map((m) => (
          <button key={m.v} className="m-method" onClick={() => dispatch({ type: 'method', v: m.v })}>
            <Icon name={m.icon} size={34} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function Pause({ inc, left, onCall }: { inc: Incident; left: number; onCall: boolean }) {
  const { w, dispatch } = useWorld()
  const total = w.settings.pauseMinutes * 60_000
  const done = left <= 0
  const facts = factsFor(inc)
  return (
    <section className="m-step m-pause">
      <Spec ids="F-C4" />
      <div className="m-pause__dial">
        <KettleDial left={left} total={total} size={200} />
        <p className="m-pause__time">
          <b>{mmss(left)}</b>
          <span>{done ? 'pause over' : 'left'}</span>
        </p>
      </div>
      {done ? (
        <>
          <h1 className="m-display">The kettle’s boiled.</h1>
          <p className="m-body">Still no word from family. Please don’t send money until someone in your family answers on their own phone.</p>
        </>
      ) : (
        <>
          <h1 className="m-display">Put the kettle on.</h1>
          <p className="m-body">Don’t send anything while it boils. Family who love you will wait ten minutes.</p>
        </>
      )}
      {inc.secret === 'yes' && (
        <p className="m-callout">
          <Icon name="hush" size={26} /> Asking you to keep a secret is a trick. You’re allowed to tell anyone.
        </p>
      )}
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
      <div className="m-answers">
        {onCall ? (
          <Btn tone="red" big icon="handset" onClick={() => dispatch({ type: 'close', how: 'hung-up' })}>Hang up</Btn>
        ) : (
          <Btn tone="ink" big onClick={() => dispatch({ type: 'close', how: 'done' })}>I’m done</Btn>
        )}
        <Btn tone="paper" icon="handset" onClick={() => dispatch({ type: 'reply', member: 'david', reply: 'calling' })}>Ring David</Btn>
      </div>
    </section>
  )
}

function Outcome({ inc }: { inc: Incident }) {
  const { w, dispatch } = useWorld()
  const o = inc.outcome!
  const by = MEMBERS[o.by]
  const claimed = inc.claimed && inc.claimed !== 'other' ? MEMBERS[inc.claimed] : null
  const onCall = w.call?.state === 'active'
  if (o.kind === 'yes-me') {
    return (
      <section className="m-outcome" style={{ ['--who' as string]: by.color }}>
        <Spec ids="F-C3 F-C4" />
        <Stamp id={o.by} size={96} />
        <h1 className="m-outcome__head">{by.name} answered: “Yes, it’s me.”</h1>
        <p className="m-body">Answered on {by.name}’s own phone, just now. The pause is over.</p>
        <p className="m-callout is-family">
          <Icon name="heart" size={26} /> David is sorting out what {by.name} needs. You don’t need to send anything.
        </p>
        <div className="m-answers">
          <Btn tone="ink" big onClick={() => dispatch({ type: 'close', how: 'done' })}>Okay</Btn>
        </div>
      </section>
    )
  }
  const head = o.kind === 'not-me' ? `${by.name} answered: “That’s not me.”` : `${by.name} answered: “It isn’t ${claimed?.name ?? 'family'}.”`
  const sub = o.kind === 'not-me' ? `Answered on ${by.name}’s own phone, just now.` : `${by.name} knows where ${claimed?.name ?? 'they'} is right now.`
  return (
    <section className="m-outcome" style={{ ['--who' as string]: by.color }}>
      <Spec ids="F-C3" />
      <Stamp id={o.by} size={96} />
      <h1 className="m-outcome__head">{head}</h1>
      <p className="m-body">{sub}</p>
      <p className="m-body m-body--strong">{onCall ? 'You can hang up now. You don’t need to explain.' : 'You don’t need to do anything else.'}</p>
      <div className="m-answers">
        {onCall ? (
          <Btn tone="red" big icon="handset" onClick={() => dispatch({ type: 'close', how: 'hung-up' })}>Hang up</Btn>
        ) : (
          <Btn tone="ink" big onClick={() => dispatch({ type: 'close', how: 'done' })}>Okay</Btn>
        )}
      </div>
    </section>
  )
}

function Closing({ inc }: { inc: Incident }) {
  const { dispatch } = useWorld()
  const yes = inc.outcome?.kind === 'yes-me'
  const head = inc.practice ? 'Practice done.' : yes ? 'Help is on its way.' : 'Well done, Margaret.'
  const body = inc.practice
    ? 'That’s all it takes: the yellow button, then one question at a time.'
    : yes
      ? 'David is looking after it. You did exactly the right thing by checking first.'
      : 'You checked with family before doing anything. That’s exactly right.'
  return (
    <section className="m-closing">
      <Icon name={inc.practice ? 'tick' : 'heart'} size={56} className="m-closing__icon" />
      <h1 className="m-display m-display--xl">{head}</h1>
      <p className="m-body">{body}</p>
      {!inc.practice && !yes && <p className="m-body m-muted">If that number rings again, you don’t have to answer. David can see what happened, so you won’t need to explain it twice.</p>}
      <Btn tone="ink" big onClick={() => dispatch({ type: 'clear-incident' })}>Back to home</Btn>
    </section>
  )
}
