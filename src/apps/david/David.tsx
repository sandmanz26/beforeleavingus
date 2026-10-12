import { useEffect, useState } from 'react'
import { MEMBERS, type MemberId } from '../../data/family'
import { Btn, Pill, Spec, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { activeIncident, elapsed, useWorld } from '../../store/world'
import { AnsweredCard, AskCard, HandoffCard } from '../shared/AskCard'
import { FamilyCallLayer } from '../../components/FamilyCall'
import { Circle } from './Circle'
import { Questions } from './Questions'
import { Log } from './Log'
import { MessageCheck, Settings, Setup, TalkGuide, setupSteps } from './Subpages'

type Tab = 'home' | 'circle' | 'questions' | 'log'
export type Sub = null | 'setup' | 'settings' | 'talk' | 'check'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'circle', label: 'Circle', icon: 'tree' },
  { id: 'questions', label: 'Questions', icon: 'card' },
  { id: 'log', label: 'Log', icon: 'list' },
]

export function DavidApp() {
  const [tab, setTab] = useState<Tab>('home')
  const [sub, setSub] = useState<Sub>(null)

  let content
  if (sub === 'setup') content = <Setup back={() => setSub(null)} goTab={(t) => { setSub(null); setTab(t as Tab) }} />
  else if (sub === 'settings') content = <Settings back={() => setSub(null)} />
  else if (sub === 'talk') content = <TalkGuide back={() => setSub(null)} />
  else if (sub === 'check') content = <MessageCheck back={() => setSub(null)} />
  else if (tab === 'home') content = <Home open={setSub} />
  else if (tab === 'circle') content = <Circle />
  else if (tab === 'questions') content = <Questions />
  else content = <Log />

  return (
    <div className="d-app">
      <FamilyCallLayer me="david" />
      <Banner onOpen={() => { setSub(null); setTab('home') }} />
      <div className="d-scroll">{content}</div>
      <nav className="d-tabs" aria-label="David’s app">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id && !sub ? 'is-on' : ''} onClick={() => { setSub(null); setTab(t.id) }}>
            <Icon name={t.icon} size={22} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

// OS notification banner — the only interruption David ever gets (F-A1).
// v2: sits in the flow (never on top of the card it announces) and folds
// away after a few seconds (roast #13).
function Banner({ onOpen }: { onOpen: () => void }) {
  const { w, dispatch } = useWorld()
  const inc = activeIncident(w)
  const id = inc ? `${inc.id}:start` : ''
  const [gone, setGone] = useState<string | null>(null)
  useEffect(() => {
    if (!id) return
    const t = setTimeout(() => setGone(id), 5000)
    return () => clearTimeout(t)
  }, [id])
  if (!inc || !inc.claimed) return null
  if (w.seenBy.david?.includes(id) || gone === id) return null
  const who = inc.claimed === 'other' ? 'an official' : MEMBERS[inc.claimed].name
  return (
    <button className="os-banner" onClick={() => { dispatch({ type: 'seen', member: 'david', id }); onOpen() }}>
      <span className="os-banner__app">KinVoice · now</span>
      <b>{inc.kind === 'message' ? `Mum got a voice note claiming to be ${who}` : `Mum is checking a call from “${who}”`}</b>
      <span>Tap to answer. One tap is enough.</span>
    </button>
  )
}

function Home({ open }: { open: (s: Sub) => void }) {
  const { w, dispatch } = useWorld()
  const inc = activeIncident(w)
  const recent = !inc && w.incident?.closed ? w.incident : null
  const steps = setupSteps(w)
  const doneSteps = steps.filter((s) => s.done).length
  const attempts = w.log.filter((l) => l.kind === 'attempt' && l.at.startsWith('Today')).length

  return (
    <div className="d-page">
      <header className="d-head">
        <div>
          <p className="d-eyebrow">Circle keeper</p>
          <h1 className="d-title">Mum’s circle</h1>
        </div>
        <button className="d-iconbtn" onClick={() => open('settings')} aria-label="Settings">
          <Icon name="sliders" size={24} />
        </button>
      </header>

      {inc ? <Live /> : recent ? <AnsweredCard me="david" inc={recent} /> : null}

      {w.disclosedTo === 'david' && (
        <section className="d-card d-card--plum">
          <Spec ids="F-F2" />
          <h2>Mum wants to talk to you about money she lost.</h2>
          <p>She chose to tell you. Read this before you ring — it takes a minute.</p>
          <Btn tone="ink" iconRight="right" onClick={() => open('talk')}>How to talk about it</Btn>
        </section>
      )}

      {!inc && (
        <section className="d-calm">
          <Spec ids="F-A2" />
          <Icon name="quiet" size={30} />
          <div>
            <h2>{attempts ? `${attempts} attempt${attempts > 1 ? 's' : ''} today — handled.` : 'All quiet.'}</h2>
            <p>{w.quietToday} sales calls screened today without bothering Mum. You only hear from us when someone claims to be family.</p>
          </div>
        </section>
      )}

      <button className="d-row" onClick={() => open('setup')}>
        <Spec ids="F-A3" />
        <span className="d-row__icon"><Icon name="calendar" size={24} /></span>
        <span className="d-row__body">
          <b>Afternoon setup</b>
          <span className="d-progress"><span style={{ width: `${(doneSteps / steps.length) * 100}%` }} /></span>
          <small>{doneSteps} of {steps.length} done{doneSteps < steps.length ? ` · next: ${steps.find((s) => !s.done)?.short}` : ''}</small>
        </span>
        <Icon name="chevron" size={20} />
      </button>

      <section className="d-card">
        <Spec ids="F-E2" />
        <h2>Practice with Mum</h2>
        {w.drill === 'none' && (
          <>
            <p>Last run Sunday — she found the yellow button in 4 seconds. A two-minute practice once a month keeps it a habit.</p>
            <Btn tone="paper" icon="play" onClick={() => dispatch({ type: 'drill-schedule' })}>Send Mum a practice now</Btn>
          </>
        )}
        {w.drill === 'scheduled' && <p><Pill tone="yolk" icon="clock">Waiting for Mum</Pill> It’s on her home screen. She starts it when she’s ready.</p>}
        {w.drill === 'done' && <p><Pill tone="ink" icon="tick">Done today</Pill> Next one is due in a month.</p>}
      </section>

      <div className="d-tools">
        <button className="d-tool" onClick={() => open('check')}>
          <Spec ids="F-D1" />
          <Icon name="voicenote" size={26} />
          <span>Check a message someone sent Mum</span>
        </button>
        <button className="d-tool" onClick={() => open('talk')}>
          <Spec ids="F-F2" />
          <Icon name="heart" size={26} />
          <span>If Mum tells you something happened</span>
        </button>
      </div>
    </div>
  )
}

function Live() {
  const { w } = useWorld()
  const inc = activeIncident(w)!
  const mine = inc.asks.find((a) => a.member === 'david')
  const answered = mine?.state === 'answered'
  const step = !inc.claimed ? 'Choosing who it is' : inc.question === null ? 'Asking the family question' : inc.money === null ? 'Being asked about money' : inc.secret === null && inc.kind === 'call' ? 'Answering questions' : 'On the kettle pause'
  return (
    <div className="d-live">
      {inc.outcome?.kind === 'yes-me' && inc.outcome.by !== 'david' ? (
        <HandoffCard inc={inc} />
      ) : inc.outcome ? (
        <section className="ask ask--done">
          <Stamp id={inc.outcome.by} size={40} />
          <p className="ask__head ask__head--s">{MEMBERS[inc.outcome.by].name} answered “That’s not me”. Mum has been told she can hang up.</p>
        </section>
      ) : answered ? (
        <AnsweredCard me="david" inc={inc} />
      ) : (
        <AskCard me="david" inc={inc} />
      )}
      <section className="d-card d-card--line">
        <Spec ids="F-C5" />
        <h2 className="d-small">Phone tree, live</h2>
        <ul className="d-tree">
          {inc.tree.map((m: MemberId) => {
            const a = inc.asks.find((x) => x.member === m)
            const st = !a ? 'Not asked yet' : a.state === 'away' ? `Away · ${w.away[m]?.label}` : a.state === 'asking' ? `Asking · ${elapsed(a.sentAt, w.now)}` : `Answered`
            return (
              <li key={m} className={a ? `is-${a.state}` : 'is-wait'}>
                <Stamp id={m} size={28} />
                <span>{MEMBERS[m].name}</span>
                <small>{st}</small>
              </li>
            )
          })}
        </ul>
        {inc.kind === 'call' && <p className="d-muted">Mum’s screen: {step.toLowerCase()}.</p>}
      </section>
    </div>
  )
}
