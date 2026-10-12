import { useState } from 'react'
import { MEMBERS, type MemberId } from '../../data/family'
import { Btn, Pill, Spec, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { useWorld } from '../../store/world'

// F-C2: family questions as recipe cards. The “stranger test” keeps
// answers off the internet (P-03, T-01). Margaret never memorises them.

const TESTS = [
  { k: 'offline', label: 'Not findable online', hint: 'Never posted, tagged or captioned anywhere.' },
  { k: 'notPersonalData', label: 'Not a birthday, school, pet or street', hint: 'Those leak in data breaches.' },
  { k: 'recognisable', label: 'Mum knows it instantly', hint: 'If she has to think, it won’t work in a panic.' },
] as const

export function Questions() {
  const { w, dispatch } = useWorld()
  const [shown, setShown] = useState<string[]>([])
  const [adding, setAdding] = useState(false)

  return (
    <div className="d-page">
      <header className="d-head">
        <div>
          <p className="d-eyebrow">Instead of a password</p>
          <h1 className="d-title">Family questions</h1>
        </div>
      </header>
      <p className="d-muted">Mum never has to remember these. When someone asks for help, KinVoice shows her one the caller should know, and what answer to listen for.</p>

      {w.questions.map((q) => {
        const pass = q.offline && q.notPersonalData && q.recognisable
        const open = shown.includes(q.id)
        return (
          <article key={q.id} className={`d-recipe${pass ? '' : ' is-weak'}`}>
            <Spec ids="F-C2" />
            <p className="d-recipe__q">{q.ask}</p>
            <button className="d-recipe__a" onClick={() => setShown(open ? shown.filter((x) => x !== q.id) : [...shown, q.id])}>
              <Icon name={open ? 'eyeoff' : 'eye'} size={20} />
              {open ? q.answer : 'Show answer'}
            </button>
            <footer>
              <span className="d-recipe__who">
                {q.madeWith.map((m) => <Stamp key={m} id={m} size={22} />)}
              </span>
              <small>Practised {q.practicedDaysAgo === 0 ? 'today' : `${q.practicedDaysAgo} days ago`}</small>
              {pass ? <Pill tone="ink" icon="tick">Passes the stranger test</Pill> : <Pill tone="red" icon="info">Fails the stranger test</Pill>}
            </footer>
            {q.warning && !pass && (
              <div className="d-warn">
                <span>{q.warning} Replace it — KinVoice won’t use it until you do.</span>
                <Btn tone="paper" icon="trash" onClick={() => dispatch({ type: 'question-remove', id: q.id })}>Remove</Btn>
              </div>
            )}
          </article>
        )
      })}

      {adding ? <AddQuestion done={() => setAdding(false)} /> : <Btn tone="paper" icon="plus" onClick={() => setAdding(true)}>Write a new question</Btn>}
    </div>
  )
}

function AddQuestion({ done }: { done: () => void }) {
  const { dispatch } = useWorld()
  const [ask, setAsk] = useState('')
  const [answer, setAnswer] = useState('')
  const [who, setWho] = useState<MemberId[]>(['margaret', 'david'])
  const [tests, setTests] = useState<Record<string, boolean>>({})
  const allTests = TESTS.every((t) => tests[t.k])
  const ok = ask.trim().length > 6 && answer.trim().length > 1 && allTests

  return (
    <section className="d-card d-form">
      <Spec ids="F-C2 F-A3" />
      <h2>New question</h2>
      <label>
        Question Mum will ask
        <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="What did we call the caravan?" />
      </label>
      <label>
        Answer to listen for
        <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="The Tin Can" />
      </label>
      <p className="d-label">Who knows it</p>
      <div className="d-chips">
        {(['margaret', 'david', 'emma', 'rob'] as MemberId[]).map((m) => (
          <button key={m} className={`d-chip d-chip--btn${who.includes(m) ? ' is-on' : ''}`} onClick={() => setWho(who.includes(m) ? who.filter((x) => x !== m) : [...who, m])}>
            {MEMBERS[m].name}
          </button>
        ))}
      </div>
      <p className="d-label">The stranger test</p>
      {TESTS.map((t) => (
        <label key={t.k} className="d-check">
          <input type="checkbox" checked={!!tests[t.k]} onChange={(e) => setTests({ ...tests, [t.k]: e.target.checked })} />
          <span>
            <b>{t.label}</b>
            <small>{t.hint}</small>
          </span>
        </label>
      ))}
      <div className="d-form__actions">
        <Btn tone="ghost" onClick={done}>Cancel</Btn>
        <Btn
          tone="ink"
          disabled={!ok}
          onClick={() => {
            dispatch({ type: 'question-add', q: { id: `q-${Date.now()}`, ask: ask.trim(), answer: answer.trim(), madeWith: who, practicedDaysAgo: 0, offline: true, notPersonalData: true, recognisable: true } })
            done()
          }}
        >
          Save question
        </Btn>
      </div>
      {!allTests && <p className="d-muted">Tick all three to save. A question that fails one is worse than none.</p>}
    </section>
  )
}
