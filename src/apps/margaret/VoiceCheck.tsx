import { useEffect, useState } from 'react'
import { MEMBERS } from '../../data/family'
import { Btn, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { checkWords } from '../../lib/patternCheck'
import { useWorld } from '../../store/world'
import type { VoiceMessage } from '../../data/messages'
import { BackBar } from './Margaret'
import { FamilyStrip } from './FamilyStrip'

// F-D1: voice-message check against the sender's speech pattern (F-B1),
// with a one-tap hand-off to F-C3 (ask them on their own phone).

export function VoiceCheck({ onBack }: { onBack: () => void }) {
  const { w, dispatch } = useWorld()
  const inc = w.incident?.kind === 'message' ? w.incident : null
  const [openId, setOpenId] = useState<string | null>(inc?.messageId ?? null)
  const answered = !!inc?.outcome
  useEffect(() => {
    if (answered && inc?.messageId) setOpenId(inc.messageId)
  }, [answered, inc?.messageId])
  const msg = w.messages.find((m) => m.id === openId)

  if (!msg) {
    const sorted = [...w.messages].sort((a, b) => (a.id === w.freshMessage ? -1 : b.id === w.freshMessage ? 1 : 0))
    return (
      <div className="m-page">
        <BackBar onBack={onBack} title="Voice messages" />
        <p className="m-body">Pick one to check how it compares with the way that person talks to you.</p>
        <ul className="m-inbox">
          {sorted.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => {
                  setOpenId(m.id)
                  dispatch({ type: 'message-open', id: m.id })
                }}
              >
                {m.fromSaved ? <Stamp id={m.claims} size={40} /> : <span className="m-inbox__unknown"><Icon name="handset" size={24} /></span>}
                <span className="m-inbox__from">
                  <b>{m.from}</b>
                  <small>{m.receivedAt} · {m.length}</small>
                </span>
                {w.freshMessage === m.id && <em className="m-tile__new">New</em>}
                <Icon name="chevron" size={22} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return <MessageDetail msg={msg} onBack={() => setOpenId(null)} />
}

function MessageDetail({ msg, onBack }: { msg: VoiceMessage; onBack: () => void }) {
  const { w, dispatch } = useWorld()
  const inc = w.incident?.kind === 'message' && w.incident.messageId === msg.id ? w.incident : null
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const claimed = MEMBERS[msg.claims]
  const profile = w.profiles[msg.claims as 'david' | 'emma' | 'rob']
  // v2: the comparison runs as soon as the message opens (roast #12).
  const result = checkWords(msg.transcript, profile, claimed.name)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setPos((p) => (p >= msg.bars.length ? (setPlaying(false), 0) : p + 1)), 120)
    return () => clearInterval(t)
  }, [playing, msg.bars.length])

  if (inc?.outcome) {
    const by = MEMBERS[inc.outcome.by]
    const no = inc.outcome.kind !== 'yes-me'
    return (
      <div className="m-crisis">
        <section className="m-outcome" style={{ ['--who' as string]: by.color }}>
          <Stamp id={inc.outcome.by} size={96} />
          <h1 className="m-outcome__head">{no ? `${by.name} answered: “I didn’t send that.”` : `${by.name} answered: “Yes, that was me.”`}</h1>
          <p className="m-body">Answered on {by.name}’s own phone, just now.</p>
          {no && <p className="m-body m-body--strong">You don’t need to reply to it.</p>}
        </section>
        <div className="m-dock">
          <Btn tone="ink" big onClick={() => dispatch({ type: 'clear-incident' })}>Okay</Btn>
        </div>
      </div>
    )
  }

  return (
    <div className="m-crisis">
      <div className="m-page">
        <BackBar onBack={onBack} title="Voice message" />
        <section className="m-result">
          <p className="m-from">
            {msg.fromSaved ? <>From <b>{msg.from}</b></> : <>From <b>{msg.from}</b> — not saved in your phone. It says it’s {claimed.name}.</>}
          </p>
          <h2 className={`m-result__head is-${result.summary}`}>{result.headline}</h2>
          <ul className="m-findings">
            {result.findings.map((f, i) => (
              <li key={i} className={`is-${f.tone}`}>
                <span className="m-findings__mark">
                  <Icon name={f.tone === 'match' ? 'tick' : f.tone === 'differs' ? 'cross' : 'info'} size={20} stroke={3} />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
          {result.summary === 'matches' && <p className="m-body m-muted">Words can be copied too. If a message ever asks for money, check with family first.</p>}
        </section>
        <details className="m-heard">
          <summary>
            <Icon name="voicenote" size={24} /> Listen and read it again
          </summary>
          <div className="m-player">
            <button className="m-player__play" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
              <Icon name={playing ? 'pause' : 'play'} size={30} />
            </button>
            <div className="m-player__wave" aria-hidden>
              {msg.bars.map((b, i) => (
                <span key={i} style={{ height: `${b}%` }} className={i < pos ? 'is-played' : ''} />
              ))}
            </div>
            <span className="m-player__len">{msg.length}</span>
          </div>
          <blockquote className="m-transcript">{msg.transcript}</blockquote>
        </details>
        {inc && <FamilyStrip inc={inc} />}
      </div>
      <div className="m-dock">
        {inc ? (
          <p className="m-dock__wait"><Icon name="clock" size={22} /> Waiting for {claimed.name}. You can go back home — the answer will appear here.</p>
        ) : result.summary === 'matches' ? (
          <>
            <Btn tone="ink" big onClick={onBack}>Done</Btn>
            <Btn tone="paper" icon="people" onClick={() => dispatch({ type: 'message-ask', messageId: msg.id })}>Ask {claimed.name} anyway</Btn>
          </>
        ) : (
          <Btn tone="ink" big icon="people" onClick={() => dispatch({ type: 'message-ask', messageId: msg.id })}>
            Ask {claimed.name} on {claimed.name}’s own phone
          </Btn>
        )}
      </div>
    </div>
  )
}
