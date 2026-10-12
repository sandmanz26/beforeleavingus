import { useRef, useState } from 'react'
import { Btn } from '../components/bits'
import { ChipInput } from '../components/ChipInput'
import { Icon } from '../components/Icon'
import { Recorder } from '../components/Recorder'
import { Logo, VoiceStamp } from '../components/Stamp'
import { analyseBlob, NoVoiceError, qualityIssue, type VoiceFeatures } from '../lib/audio/features'
import { Link, navigate } from '../lib/router'
import { emptyPatterns, nowIso, relationLabel, useStore, voiceStrength } from '../lib/store'
import type { Member, Patterns } from '../lib/types'

// Voice enrolment (PRD F-B1–F-B3): consent first, then short recordings
// analysed on this device, then the words that make you *you*.

const PROMPTS = [
  { text: 'Say your name and today’s date.', hint: 'A warm-up. Speak the way you normally would.' },
  { text: '“The old blue car is parked by the garden gate, and the kettle’s on.”', hint: 'Read this out loud.' },
  { text: '“Could you call me back when you get this? I’ll be home after six.”', hint: 'Read this out loud.' },
  { text: 'How do you say hello when you ring family?', hint: 'Say it exactly the way you usually do.' },
  { text: 'Tell us about something you did this week.', hint: 'Just talk for ten seconds or so.' },
]
const MEMBER_PROMPTS = [PROMPTS[0], PROMPTS[1], PROMPTS[3]]

type Step = 'consent' | 'record' | 'patterns' | 'done'

export function Setup({ memberId }: { memberId?: string }) {
  const { data, update } = useStore()
  const member = data?.members.find((m) => (memberId ? m.id === memberId : m.self))
  const [step, setStep] = useState<Step>('consent')
  const [samples, setSamples] = useState<VoiceFeatures[]>([])
  if (!data || !member) {
    return (
      <main className="setup">
        <p>We couldn’t find that person. <Link to="/app/family">Back to family</Link></p>
      </main>
    )
  }
  const self = !!member.self
  const prompts = self ? PROMPTS : MEMBER_PROMPTS
  const steps: Step[] = ['consent', 'record', 'patterns', 'done']

  const save = (s: VoiceFeatures[]) =>
    update((d) => {
      const m = d.members.find((x) => x.id === member.id)!
      const now = nowIso()
      m.voiceprint = { samples: s, consentAt: m.voiceprint?.consentAt ?? now, updatedAt: now }
      m.status = 'enrolled'
    })

  return (
    <main className="setup">
      <header className="setup__top">
        <Link to="/app" className="brand"><Logo size={26} /><span>kinvoice</span></Link>
        <ol className="setup__progress" aria-label="Progress">
          {['Consent', 'Your voice', 'How you talk', 'Ready'].map((l, i) => (
            <li key={l} className={i < steps.indexOf(step) ? 'is-done' : i === steps.indexOf(step) ? 'is-on' : ''}>{l}</li>
          ))}
        </ol>
        <Link to={self ? '/app' : `/app/family/${member.id}`} className="setup__skip">Finish later</Link>
      </header>

      {step === 'consent' && <Consent member={member} onNext={() => setStep('record')} />}
      {step === 'record' && (
        <Record
          member={member}
          prompts={prompts}
          onDone={(s) => {
            setSamples(s)
            save(s)
            setStep('patterns')
          }}
        />
      )}
      {step === 'patterns' && (
        <PatternStep
          member={member}
          onDone={(p) => {
            update((d) => {
              d.members.find((x) => x.id === member.id)!.patterns = p
            })
            setStep('done')
          }}
        />
      )}
      {step === 'done' && <Done member={{ ...member, voiceprint: { samples, consentAt: '', updatedAt: '' } }} />}
    </main>
  )
}

function Consent({ member, onNext }: { member: Member; onNext: () => void }) {
  const [ok, setOk] = useState(false)
  const self = !!member.self
  return (
    <section className="setup__card">
      {!self && (
        <p className="handover">
          <Icon name="people" size={24} /> Hand this device to <b>{member.name}</b>. This part is for them.
        </p>
      )}
      <h1 className="display display--s">{self ? 'Before we start' : `${member.name}, this is your voice`}</h1>
      <p className="lede">{self ? 'KinVoice is going to learn what your voice sounds like, so it can tell when someone is pretending to be you.' : `Your family wants to be able to tell when someone pretends to be you. Only you can agree to that.`}</p>
      <ul className="promise">
        <li><Icon name="mic" size={22} /><span><b>{self ? '5' : '3'} short recordings</b>, about ten seconds each.</span></li>
        <li><Icon name="lock" size={22} /><span><b>Analysed on this device.</b> The recordings are thrown away; only a voiceprint — numbers about how you sound — is kept.</span></li>
        <li><Icon name="cross" size={22} /><span><b>Never used to copy your voice.</b> Not for any reason.</span></li>
        <li><Icon name="trash" size={22} /><span><b>Yours to pause or delete</b> at any time.</span></li>
      </ul>
      <label className="check">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <span>{self ? 'I agree to KinVoice creating a voiceprint of my voice.' : `I’m ${member.name}, and I agree to KinVoice creating a voiceprint of my voice for my family’s circle.`}</span>
      </label>
      <p className="tip"><Icon name="ear" size={20} /> Find a quiet spot. You’ll be asked to allow the microphone.</p>
      <Btn tone="yolk" big disabled={!ok} onClick={onNext} iconRight="right">I agree — let’s start</Btn>
    </section>
  )
}

function Record({ member, prompts, onDone }: { member: Member; prompts: typeof PROMPTS; onDone: (s: VoiceFeatures[]) => void }) {
  const [i, setI] = useState(0)
  const [got, setGot] = useState<VoiceFeatures[]>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const file = useRef<HTMLInputElement>(null)

  const take = async (blob: Blob) => {
    setBusy(true)
    setMsg(null)
    try {
      const f = await analyseBlob(blob)
      const issue = qualityIssue(f)
      if (issue) {
        setMsg(issue)
      } else {
        const next = [...got, f]
        setGot(next)
        if (next.length >= prompts.length) onDone(next)
        else setI(i + 1)
      }
    } catch (e) {
      setMsg(e instanceof NoVoiceError ? 'We couldn’t hear a voice clearly. Try again a little closer to the microphone.' : (e as Error).message)
    }
    setBusy(false)
  }

  const p = prompts[i]
  return (
    <section className="setup__card setup__card--record">
      <p className="eyebrow">Recording {i + 1} of {prompts.length}{member.self ? '' : ` · ${member.name}`}</p>
      <div className="prompt">
        <p className="prompt__text">{p.text}</p>
        <p className="prompt__hint">{p.hint}</p>
      </div>
      <div className="setup__dots" aria-hidden>
        {prompts.map((_, n) => <span key={n} className={n < got.length ? 'is-done' : n === i ? 'is-on' : ''} />)}
      </div>
      {busy ? (
        <p className="analysing"><span className="spinner" aria-hidden /> Listening back…</p>
      ) : (
        <Recorder key={i} maxSec={12} minSec={3} onDone={take} label="Tap to record" />
      )}
      {msg && <p className="form-error" role="alert">{msg}</p>}
      {got.length > 0 && !msg && !busy && <p className="ok-line"><Icon name="tick" size={18} stroke={3} /> Got recording {got.length}. Nice and clear.</p>}
      <p className="alt">
        No microphone? <button className="link" onClick={() => file.current?.click()}>Upload a recording instead</button>
        <input ref={file} type="file" accept="audio/*" hidden onChange={(e) => e.target.files?.[0] && take(e.target.files[0])} />
      </p>
    </section>
  )
}

const CALLS = ['Mum', 'Mom', 'Mam', 'Ma', 'Nan', 'Nana', 'Gran', 'Dad', 'Grandad']
const HELLOS = ['Hiya', 'Hey', 'Hello', 'Alright', 'Hi there']
const BYES = ['Love you', 'Speak soon', 'Bye for now', 'Take care', 'Love you loads']

function PatternStep({ member, onDone }: { member: Member; onDone: (p: Patterns) => void }) {
  const [p, setP] = useState<Patterns>(member.patterns ?? emptyPatterns())
  const self = !!member.self
  const set = (k: keyof Patterns) => (v: string[]) => setP({ ...p, [k]: v })
  const neverSuggest = ['Mum', 'Mom', 'Mother', 'Mam'].filter((x) => !p.callsThem.includes(x) && p.callsThem.some((c) => ['Mum', 'Mom', 'Mam', 'Ma'].includes(c)))
  return (
    <section className="setup__card">
      <h1 className="display display--s">{self ? 'How do you talk to your family?' : `How does ${member.name} talk to you?`}</h1>
      <p className="lede">A copied voice gets the sound, not the habits. These words help KinVoice spot an impostor even when the voice is close.</p>
      <ChipInput label={self ? 'What do you call the person you ring most?' : `What does ${member.name} call you?`} values={p.callsThem} onChange={set('callsThem')} suggestions={CALLS} />
      <ChipInput label="Names that would never be used" hint="A scammer saying one of these is a red flag." values={p.neverSays} onChange={set('neverSays')} suggestions={neverSuggest} strike />
      <ChipInput label="How you say hello" values={p.greetings} onChange={set('greetings')} suggestions={HELLOS} />
      <ChipInput label="How you say goodbye" values={p.signoffs} onChange={set('signoffs')} suggestions={BYES} />
      <ChipInput label="Words or phrases you use a lot" hint="Optional" values={p.phrases} onChange={set('phrases')} />
      <div className="setup__actions">
        <Btn tone="ghost" onClick={() => onDone(p)}>Skip for now</Btn>
        <Btn tone="yolk" big onClick={() => onDone(p)} iconRight="right">Save</Btn>
      </div>
    </section>
  )
}

function Done({ member }: { member: Member }) {
  const self = !!member.self
  return (
    <section className="setup__card setup__card--done">
      <div className="reveal"><VoiceStamp member={member} size={150} /></div>
      <h1 className="display display--s">{self ? 'Your voiceprint is ready.' : `${member.name}’s voiceprint is ready.`}</h1>
      <p className="lede">This stamp is drawn from {self ? 'your' : `${member.name}’s`} own voice — no two look alike. Strength: <b>{voiceStrength(member)}</b>.</p>
      <p className="muted">{relationLabel(member.relation)} · {member.voiceprint?.samples.length} recordings analysed, none kept.</p>
      <div className="setup__actions">
        {self ? (
          <>
            <Btn tone="paper" onClick={() => navigate('/app/family')} icon="invite">Invite your family</Btn>
            <Btn tone="yolk" big onClick={() => navigate('/app')} iconRight="right">Go to KinVoice</Btn>
          </>
        ) : (
          <Btn tone="yolk" big onClick={() => navigate('/app/family')} iconRight="right">Back to family</Btn>
        )}
      </div>
    </section>
  )
}
