import { useState } from 'react'
import { Btn, Pill, Toggle } from '../../components/bits'
import { ChipInput } from '../../components/ChipInput'
import { Icon } from '../../components/Icon'
import { VoiceStamp } from '../../components/Stamp'
import { Link, navigate } from '../../lib/router'
import { COLORS, emptyPatterns, nowIso, RELATIONS, relationLabel, sampleFamily, uid, useStore, voiceStrength } from '../../lib/store'
import type { Member, Patterns, Relation } from '../../lib/types'
import { PageHead } from './Shell'

// PRD F-B3 (consent), F-C2 (family questions), J4 (set up together).
export function Family() {
  const { data, update } = useStore()
  const [adding, setAdding] = useState(false)
  if (!data) return null
  const family = data.members.filter((m) => !m.self)
  return (
    <div className="page">
      <PageHead eyebrow="Your circle" title="Family">
        {!adding && <Btn tone="yolk" icon="invite" onClick={() => setAdding(true)}>Add family member</Btn>}
      </PageHead>
      <p className="lede lede--s">Add the people a scammer would pretend to be — and the people most likely to get that call. Each person records their own voice, with their own consent.</p>

      {adding && <AddMember onDone={() => setAdding(false)} />}

      {family.length === 0 && !adding ? (
        <section className="empty">
          <Icon name="people" size={40} />
          <h2>No family yet</h2>
          <p>Invite your children, parents or grandparents. Or try KinVoice with a sample family first.</p>
          <div className="row-btns">
            <Btn tone="yolk" icon="invite" onClick={() => setAdding(true)}>Add family member</Btn>
            <Btn tone="paper" onClick={() => update((d) => { d.members.push(...sampleFamily()) })}>Add a sample family</Btn>
          </div>
        </section>
      ) : (
        <ul className="members">
          {family.map((m) => (
            <li key={m.id}>
              <Link to={`/app/family/${m.id}`} className="member">
                <VoiceStamp member={m} size={56} dim={!m.voiceprint} />
                <span className="member__main">
                  <b>{m.name}{m.sample && <Pill tone="line">Sample</Pill>}</b>
                  <small>{relationLabel(m.relation)}</small>
                </span>
                <span className="member__status">
                  {m.status === 'enrolled' && m.voiceprint && <Pill tone="ink" icon="tick">Voiceprint · {voiceStrength(m)}</Pill>}
                  {m.status === 'invited' && <Pill tone="yolk" icon="clock">Invited</Pill>}
                  {m.status === 'paused' && <Pill tone="line" icon="pause">Paused</Pill>}
                </span>
                <Icon name="chevron" size={20} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Questions />
    </div>
  )
}

function AddMember({ onDone }: { onDone: () => void }) {
  const { data, update } = useStore()
  const [name, setName] = useState('')
  const [relation, setRelation] = useState<Relation>('daughter')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const add = (thenRecord: boolean) => {
    if (name.trim().length < 2) return setErr('Add their name.')
    const id = uid('m')
    const used = data?.members.length ?? 1
    update((d) => {
      d.members.push({ id, name: name.trim(), relation, phone: phone.trim() || undefined, color: COLORS[used % COLORS.length], status: 'invited', invitedAt: nowIso(), patterns: emptyPatterns() })
    })
    onDone()
    navigate(thenRecord ? `/setup/${id}` : `/app/family/${id}`)
  }
  return (
    <section className="panel form-panel">
      <h2>Add a family member</h2>
      <div className="form-grid">
        <label className="field">Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emma" /></label>
        <label className="field">
          They are your…
          <select value={relation} onChange={(e) => setRelation(e.target.value as Relation)}>
            {RELATIONS.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
          </select>
        </label>
        <label className="field">Phone number <small>Optional — for “Call them” buttons</small><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(202) 555-0177" inputMode="tel" /></label>
      </div>
      {err && <p className="form-error">{err}</p>}
      <div className="row-btns">
        <Btn tone="yolk" icon="invite" onClick={() => add(false)}>Send an invite</Btn>
        <Btn tone="paper" icon="mic" onClick={() => add(true)}>They’re with me — record now</Btn>
        <Btn tone="ghost" onClick={onDone}>Cancel</Btn>
      </div>
    </section>
  )
}

function Questions() {
  const { data, update } = useStore()
  const [open, setOpen] = useState(false)
  const [ask, setAsk] = useState('')
  const [answer, setAnswer] = useState('')
  const [tests, setTests] = useState([false, false, false])
  const [shown, setShown] = useState<string[]>([])
  if (!data) return null
  const ok = ask.trim().length > 6 && answer.trim().length > 1 && tests.every(Boolean)
  return (
    <section className="panel">
      <header className="panel__head">
        <div>
          <h2>Family questions</h2>
          <p className="muted small">A question only family can answer. KinVoice suggests it whenever a voice doesn’t check out.</p>
        </div>
        {!open && <Btn tone="paper" icon="plus" onClick={() => setOpen(true)}>Add a question</Btn>}
      </header>
      {data.questions.length === 0 && !open && <p className="muted">No family question yet. Pick something only your family knows — never a birthday, school or pet’s name.</p>}
      <ul className="questions">
        {data.questions.map((q) => (
          <li key={q.id} className="recipe">
            <p className="recipe__q">{q.ask}</p>
            <button className="recipe__a" onClick={() => setShown(shown.includes(q.id) ? shown.filter((x) => x !== q.id) : [...shown, q.id])}>
              <Icon name={shown.includes(q.id) ? 'eyeoff' : 'eye'} size={18} /> {shown.includes(q.id) ? q.answer : 'Show answer'}
            </button>
            <button className="recipe__del" onClick={() => update((d) => { d.questions = d.questions.filter((x) => x.id !== q.id) })} aria-label="Delete question"><Icon name="trash" size={18} /></button>
          </li>
        ))}
      </ul>
      {open && (
        <div className="form-panel">
          <div className="form-grid">
            <label className="field">Question<input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="What did we call the old blue car?" /></label>
            <label className="field">Answer to listen for<input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Bluebell" /></label>
          </div>
          <p className="field-label">The stranger test</p>
          {['It’s not findable online — never posted, tagged or captioned', 'It’s not a birthday, school, pet or street name', 'Everyone in the family knows it instantly'].map((t, i) => (
            <label key={t} className="check">
              <input type="checkbox" checked={tests[i]} onChange={(e) => setTests(tests.map((x, j) => (j === i ? e.target.checked : x)))} />
              <span>{t}</span>
            </label>
          ))}
          <div className="row-btns">
            <Btn tone="yolk" disabled={!ok} onClick={() => {
              update((d) => { d.questions.push({ id: uid('q'), ask: ask.trim(), answer: answer.trim(), knownBy: d.members.map((m) => m.id) }) })
              setOpen(false); setAsk(''); setAnswer(''); setTests([false, false, false])
            }}>Save question</Btn>
            <Btn tone="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
          </div>
          {!tests.every(Boolean) && <p className="muted small">Tick all three to save. A question a stranger could look up is worse than none.</p>}
        </div>
      )}
    </section>
  )
}

export function MemberPage({ id }: { id: string }) {
  const { data, update } = useStore()
  const [copied, setCopied] = useState(false)
  const [confirm, setConfirm] = useState(false)
  if (!data) return null
  const m = data.members.find((x) => x.id === id)
  if (!m || m.self) {
    return <div className="page"><p>We couldn’t find that person. <Link to="/app/family">Back to family</Link></p></div>
  }
  const set = (fn: (x: Member) => void) => update((d) => { const x = d.members.find((y) => y.id === id); if (x) fn(x) })
  const invite = `${location.origin}${location.pathname}#/join/${m.id}`

  return (
    <div className="page page--narrow">
      <Link to="/app/family" className="back"><Icon name="left" size={20} /> Family</Link>
      <section className="profile-hero">
        <VoiceStamp member={m} size={110} dim={!m.voiceprint} />
        <div>
          <p className="eyebrow">{relationLabel(m.relation)}{m.sample ? ' · Sample' : ''}</p>
          <h1 className="display display--s">{m.name}</h1>
          <p className="muted">{m.voiceprint ? `Voiceprint · ${voiceStrength(m)} · ${m.voiceprint.samples.length} recordings${m.voiceprint.synthetic ? ' (sample data)' : ''}` : 'No voiceprint yet'}</p>
        </div>
      </section>

      {!m.voiceprint && (
        <section className="panel">
          <h2>{m.name} needs to add their voice</h2>
          <p className="muted">Only {m.name} can do this — it’s their voice and their consent.</p>
          <div className="row-btns">
            <Btn tone="yolk" icon="invite" onClick={() => { navigator.clipboard?.writeText(invite).catch(() => {}); setCopied(true) }}>{copied ? 'Invite link copied' : 'Copy invite link'}</Btn>
            <Btn tone="paper" icon="mic" onClick={() => navigate(`/setup/${m.id}`)}>{m.name} is with me — record here</Btn>
          </div>
          {copied && <p className="muted small">Send it to {m.name} by text or WhatsApp. In this web beta, invites only work on this browser — recording together here is the quickest way.</p>}
        </section>
      )}

      <section className="panel">
        <h2>How {m.name} talks to you</h2>
        <p className="muted small">Helps KinVoice spot an impostor who gets the voice right but the words wrong.</p>
        <PatternsEditor value={m.patterns ?? emptyPatterns()} onChange={(p) => set((x) => { x.patterns = p })} who={m.name} />
      </section>

      <section className="panel">
        <h2>Contact</h2>
        <label className="field">Phone number<input defaultValue={m.phone ?? ''} onBlur={(e) => set((x) => { x.phone = e.target.value.trim() || undefined })} placeholder="(202) 555-0177" inputMode="tel" /></label>
      </section>

      {m.voiceprint && (
        <section className="panel">
          <div className="setting">
            <span><b>Match against {m.name}’s voiceprint</b><small>Turn off to pause it without deleting it.</small></span>
            <Toggle on={m.status !== 'paused'} label="Use voiceprint" onChange={(on) => set((x) => { x.status = on ? 'enrolled' : 'paused' })} />
          </div>
          <div className="row-btns">
            <Btn tone="paper" icon="mic" onClick={() => navigate(`/setup/${m.id}`)}>Re-record with {m.name}</Btn>
            <Btn tone="ghost" icon="trash" onClick={() => set((x) => { x.voiceprint = undefined; x.status = 'invited' })}>Delete voiceprint</Btn>
          </div>
        </section>
      )}

      <section className="danger">
        {confirm ? (
          <p>Remove {m.name} from your circle? <button className="link" onClick={() => { update((d) => { d.members = d.members.filter((x) => x.id !== id) }); navigate('/app/family') }}>Yes, remove</button> · <button className="link" onClick={() => setConfirm(false)}>Cancel</button></p>
        ) : (
          <button className="link" onClick={() => setConfirm(true)}>Remove {m.name} from your circle</button>
        )}
      </section>
    </div>
  )
}

const CALLS = ['Mum', 'Mom', 'Mam', 'Ma', 'Nan', 'Nana', 'Gran', 'Dad', 'Grandad']
export function PatternsEditor({ value, onChange, who }: { value: Patterns; onChange: (p: Patterns) => void; who: string }) {
  const set = (k: keyof Patterns) => (v: string[]) => onChange({ ...value, [k]: v })
  const they = who === 'you' ? 'you' : 'they'
  return (
    <div className="patterns">
      <ChipInput label={who === 'you' ? 'What you call the person you ring most' : `What ${who} calls you`} values={value.callsThem} onChange={set('callsThem')} suggestions={CALLS} />
      <ChipInput label="Names that would never be used" values={value.neverSays} onChange={set('neverSays')} suggestions={['Mom', 'Mother', 'Mum'].filter((x) => !value.callsThem.includes(x))} strike />
      <ChipInput label={`How ${they} say hello`} values={value.greetings} onChange={set('greetings')} suggestions={['Hiya', 'Hey', 'Hello', 'Alright']} />
      <ChipInput label={`How ${they} say goodbye`} values={value.signoffs} onChange={set('signoffs')} suggestions={['Love you', 'Speak soon', 'Take care']} />
      <ChipInput label={`Words or phrases ${they} use a lot`} values={value.phrases} onChange={set('phrases')} />
    </div>
  )
}
