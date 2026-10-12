import { useState } from 'react'
import { BANK, MEMBERS, type MemberId } from '../../data/family'
import { Btn, Pill, Segmented, Spec, Toggle } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { checkWords } from '../../lib/patternCheck'
import { useWorld } from '../../store/world'
import type { World } from '../../store/types'

function SubHead({ back, eyebrow, title }: { back: () => void; eyebrow: string; title: string }) {
  return (
    <header className="d-head d-head--sub">
      <button className="d-iconbtn" onClick={back} aria-label="Back">
        <Icon name="left" size={22} />
      </button>
      <div>
        <p className="d-eyebrow">{eyebrow}</p>
        <h1 className="d-title">{title}</h1>
      </div>
    </header>
  )
}

// F-A3: the afternoon setup, derived from live state.
export function setupSteps(w: World) {
  const agreed = (['david', 'emma', 'rob'] as const).filter((m) => w.profiles[m].consent === 'agreed').length
  const good = w.questions.filter((q) => q.offline && q.notPersonalData && q.recognisable).length
  const weak = w.questions.find((q) => !(q.offline && q.notPersonalData && q.recognisable))
  return [
    { short: 'Mum’s phone', title: 'KinVoice on Mum’s phone', detail: 'Big text on. Yellow button on her home screen.', done: true },
    { short: 'invite family', title: 'Invite the family', detail: '3 of 3 joined.', done: true },
    { short: 'Rob’s pattern', title: 'Everyone adds how they talk to Mum', detail: `${agreed} of 3 agreed, each on their own phone.`, done: agreed === 3, action: agreed < 3 ? 'nudge' : undefined },
    { short: 'questions', title: 'Write 3 family questions together', detail: weak ? `${good} pass the stranger test. “${weak.ask}” needs replacing.` : `${good} pass the stranger test.`, done: good >= 3 && !weak, action: good >= 3 && !weak ? undefined : 'questions' },
    { short: 'practice', title: 'Run the first practice with Mum', detail: 'Sunday — 4 seconds to find the button.', done: true },
    { short: 'bank', title: 'Add Mum’s bank fraud line', detail: `${BANK.name} · ${BANK.line}`, done: true },
  ]
}

export function Setup({ back, goTab }: { back: () => void; goTab: (t: string) => void }) {
  const { w, dispatch } = useWorld()
  const steps = setupSteps(w)
  return (
    <div className="d-page">
      <SubHead back={back} eyebrow="About an hour, at the kitchen table" title="Afternoon setup" />
      <Spec ids="F-A3" />
      <ol className="d-steps">
        {steps.map((s, i) => (
          <li key={s.title} className={s.done ? 'is-done' : ''}>
            <span className="d-steps__mark">{s.done ? <Icon name="tick" size={18} stroke={3} /> : i + 1}</span>
            <div>
              <b>{s.title}</b>
              <small>{s.detail}</small>
              {s.action === 'nudge' && (w.robNudged ? <Pill tone="line" icon="tick">Nudge sent to Rob</Pill> : <Btn tone="paper" icon="bell" onClick={() => dispatch({ type: 'nudge-rob' })}>Nudge Rob</Btn>)}
              {s.action === 'questions' && <Btn tone="paper" iconRight="right" onClick={() => goTab('questions')}>Fix questions</Btn>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function Settings({ back }: { back: () => void }) {
  const { w, dispatch } = useWorld()
  return (
    <div className="d-page">
      <SubHead back={back} eyebrow="Mum’s circle" title="Settings" />
      <section className="d-card d-card--line">
        <Spec ids="F-A1 F-A2" />
        <h2>When you hear from us</h2>
        <div className="d-setting">
          <span>
            <b>Only when someone claims to be family and needs help</b>
            <small>This can’t be widened. Constant alerts are how people learn to ignore the one that matters.</small>
          </span>
          <Icon name="lock" size={22} />
        </div>
        <div className="d-setting">
          <span>
            <b>Weekly quiet summary</b>
            <small>One message on Sunday: how many calls were screened.</small>
          </span>
          <Toggle label="Weekly quiet summary" on={w.settings.weeklySummary} onChange={(v) => dispatch({ type: 'settings', patch: { weeklySummary: v } })} />
        </div>
      </section>
      <section className="d-card d-card--line">
        <Spec ids="F-C4" />
        <h2>Kettle pause</h2>
        <p className="d-muted">Nothing can be sent while it runs. It ends early only when the person named answers on their own phone. It can be longer, never shorter.</p>
        <Segmented
          label="Pause length"
          value={w.settings.pauseMinutes}
          options={[{ v: 10, label: '10 min' }, { v: 15, label: '15 min' }, { v: 20, label: '20 min' }]}
          onChange={(v) => dispatch({ type: 'settings', patch: { pauseMinutes: v } })}
        />
      </section>
      <section className="d-card d-card--line">
        <Spec ids="F-F1" />
        <h2>Mum’s bank</h2>
        <div className="d-setting">
          <span>
            <b>{BANK.name}</b>
            <small>{BANK.line} · shown to Mum if something already happened</small>
          </span>
          <Icon name="bank" size={22} />
        </div>
      </section>
    </div>
  )
}

const TALK = [
  { say: 'I’m so glad you told me.', not: 'How could you fall for that?' },
  { say: 'They’re professionals. They do this all day.', not: 'I told you about these calls.' },
  { say: 'What would help you most right now?', not: 'I’ll take over your banking from now on.' },
  { say: 'Shall we ring the bank together?', not: 'Why didn’t you ring me first?' },
]

// F-F2: for the adult child — keep Mum talking, keep Mum in charge (P-14).
export function TalkGuide({ back }: { back: () => void }) {
  return (
    <div className="d-page">
      <SubHead back={back} eyebrow="Takes a minute to read" title="How to talk about it" />
      <Spec ids="F-F2" />
      <p className="d-lede">The biggest risk now isn’t the money. It’s Mum deciding never to tell you next time.</p>
      <ul className="d-talk">
        {TALK.map((t) => (
          <li key={t.say}>
            <p className="d-talk__say"><Icon name="tick" size={18} stroke={3} /> {t.say}</p>
            <p className="d-talk__not"><Icon name="cross" size={18} stroke={3} /> {t.not}</p>
          </li>
        ))}
      </ul>
      <section className="d-card d-card--line">
        <h2>The first 24 hours</h2>
        <p className="d-muted">Bank first, then a report. After that, nothing about Mum’s money changes unless she asks for it.</p>
      </section>
    </div>
  )
}

const SAMPLE = 'Hello Mom, it’s me. I lost my phone so this is my new number. Can you buy some gift cards today? Don’t tell anyone, I’ll explain later.'

// F-D1 for the admin: paste what a message said and compare the words.
export function MessageCheck({ back }: { back: () => void }) {
  const { w } = useWorld()
  const [text, setText] = useState(SAMPLE)
  const [who, setWho] = useState<Exclude<MemberId, 'margaret'>>('david')
  const [ran, setRan] = useState(false)
  const result = checkWords(text, w.profiles[who], MEMBERS[who].name)
  return (
    <div className="d-page">
      <SubHead back={back} eyebrow="Words only — never a verdict" title="Check a message" />
      <Spec ids="F-D1 F-B1" />
      <section className="d-card d-form">
        <label>
          What the message said
          <textarea rows={5} value={text} onChange={(e) => { setText(e.target.value); setRan(false) }} />
        </label>
        <p className="d-label">Who it claims to be</p>
        <div className="d-chips">
          {(['david', 'emma', 'rob'] as const).map((m) => (
            <button key={m} className={`d-chip d-chip--btn${who === m ? ' is-on' : ''}`} onClick={() => { setWho(m); setRan(false) }}>
              {MEMBERS[m].name}
            </button>
          ))}
        </div>
        <Btn tone="ink" icon="ear" onClick={() => setRan(true)}>Compare with {MEMBERS[who].name}’s pattern</Btn>
      </section>
      {ran && (
        <section className="d-card">
          <h2>{result.headline}</h2>
          <ul className="d-findings">
            {result.findings.map((f, i) => (
              <li key={i} className={`is-${f.tone}`}>
                <Icon name={f.tone === 'match' ? 'tick' : f.tone === 'differs' ? 'cross' : 'info'} size={18} stroke={3} />
                {f.text}
              </li>
            ))}
          </ul>
          <p className="d-muted">This compares words with how {MEMBERS[who].name} talks to Mum. It can’t tell who is speaking — asking {MEMBERS[who].name} directly can.</p>
        </section>
      )}
    </div>
  )
}
