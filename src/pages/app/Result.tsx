import { Btn } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { VoiceStamp } from '../../components/Stamp'
import { Link, navigate } from '../../lib/router'
import { useStore } from '../../lib/store'
import type { Check, Member } from '../../lib/types'
import { when } from './common'

// The answer. Plain words first, the evidence second, what to do third.
// Never “real”, “safe” or “verified” (PRD §1): a match is “sounds like”,
// and every path ends at the family (PRD thesis).

export function Result({ id }: { id: string }) {
  const { data, update } = useStore()
  if (!data) return null
  const c = data.checks.find((x) => x.id === id)
  if (!c) return <div className="page"><p>We couldn’t find that check. <Link to="/app/history">See history</Link></p></div>
  const r = c.result
  const claimed = data.members.find((m) => m.id === r.claimedId) ?? null
  const compared = data.members.find((m) => m.id === r.comparedId) ?? null
  const target = claimed ?? compared
  const name = target ? (target.self ? 'you' : target.name) : 'them'
  const aiFound = r.ai.filter((s) => s.found).length
  const question = data.questions.find((q) => !target || q.knownBy.includes(target.id)) ?? data.questions[0]

  return (
    <div className="page page--narrow">
      <Link to="/app/check" className="back"><Icon name="left" size={20} /> New check</Link>

      <section className={`verdict-hero verdict-hero--${r.verdict}`}>
        <div className="verdict-hero__text">
          <p className="eyebrow">{c.label} · {when(c.at)}{c.source === 'sample' ? ' · Sample' : ''}</p>
          <h1>{r.headline}</h1>
          <p>{r.sub}</p>
        </div>
        {r.voiceMatch !== null && compared && (
          <div className="dial" style={{ ['--p' as string]: r.voiceMatch }}>
            <VoiceStamp member={compared} size={46} />
            <b>{r.voiceMatch}%</b>
            <small>match with {compared.self ? 'your voice' : `${compared.name}’s voice`}</small>
          </div>
        )}
      </section>

      <section className="todo-now">
        <h2>What to do now</h2>
        <Actions c={c} target={target} name={name} question={question?.ask} answer={question?.answer} onAsk={() => update((d) => { const x = d.checks.find((k) => k.id === c.id); if (x) x.asked = true })} />
      </section>

      <h2 className="section-title">Why we think so</h2>
      <div className="evidence">
        <article className="ev">
          <header><Icon name="voicenote" size={24} /><h3>The voice</h3></header>
          {r.voiceMatch === null ? (
            <p className="muted">{claimed && !claimed.voiceprint ? `${claimed.self ? 'You haven’t' : `${claimed.name} hasn’t`} recorded a voiceprint yet, so we couldn’t compare the voice.` : 'There was no voiceprint to compare with.'}</p>
          ) : (
            <>
              <div className="bar"><span style={{ width: `${r.voiceMatch}%` }} /></div>
              <p>{r.voiceMatch >= 75 ? 'Pitch, tone and rhythm are close to' : r.voiceMatch >= 60 ? 'Partly similar to' : 'Pitch, tone and rhythm are different from'} {compared?.self ? 'your voiceprint' : `${compared?.name}’s voiceprint`}.</p>
              {r.bestOthers.length > 0 && r.verdict !== 'sounds-like' && (
                <p className="muted small">Other voices in your circle: {r.bestOthers.map((o) => { const m = data.members.find((x) => x.id === o.id); return `${m?.self ? 'you' : m?.name} ${o.score}%` }).join(' · ')}</p>
              )}
            </>
          )}
        </article>

        <article className="ev">
          <header><Icon name="people" size={24} /><h3>The words</h3></header>
          {r.words.summary === 'none' ? (
            <p className="muted">No words were added, so we only checked the sound.</p>
          ) : (
            <ul className="findings">
              {r.words.findings.map((f, i) => (
                <li key={i} className={`is-${f.tone}`}><Icon name={f.tone === 'match' ? 'tick' : f.tone === 'differs' ? 'cross' : 'info'} size={16} stroke={3} /> {f.text}</li>
              ))}
            </ul>
          )}
        </article>

        <article className="ev">
          <header><Icon name="ear" size={24} /><h3>AI voice clues</h3><span className="ev__count">{aiFound} of {r.ai.length}</span></header>
          <ul className="findings">
            {r.ai.map((s) => (
              <li key={s.key} className={s.found ? 'is-flag' : 'is-clear'} title={s.detail}>
                <Icon name={s.found ? 'info' : 'tick'} size={16} stroke={3} /> {s.found ? s.label : s.clear}
              </li>
            ))}
          </ul>
          <p className="muted small">Clues, not proof. Good AI voices can pass these; phone lines can trip them.</p>
        </article>

        <article className="ev">
          <header><Icon name="hush" size={24} /><h3>Scam script</h3><span className="ev__count">{r.scam.length}</span></header>
          {r.scam.length ? (
            <ul className="findings">{r.scam.map((s) => <li key={s} className="is-differs"><Icon name="cross" size={16} stroke={3} /> {s}</li>)}</ul>
          ) : (
            <p className="muted">{c.transcript ? 'None of the usual scam lines came up.' : 'Add what they said to check for scam lines.'}</p>
          )}
        </article>
      </div>

      {c.transcript && (
        <details className="transcript">
          <summary>What they said</summary>
          <blockquote>{c.transcript}</blockquote>
        </details>
      )}

      <p className="fine">
        <Icon name="lock" size={16} /> Analysed on this device. KinVoice gives a strong signal, not a guarantee — for anything involving money, confirm with the person on a number you already have.
      </p>
    </div>
  )
}

function Actions({ c, target, name, question, answer, onAsk }: { c: Check; target: Member | null; name: string; question?: string; answer?: string; onAsk: () => void }) {
  const v = c.result.verdict
  const tel = target?.phone ? `tel:${target.phone.replace(/[^\d+]/g, '')}` : undefined
  const other = target && !target.self
  return (
    <ol className="actions">
      {v !== 'sounds-like' ? (
        <li className="actions__key"><Icon name="cross" size={22} stroke={3} /><span><b>Don’t send money, gift cards or codes.</b> Whatever the story, it can wait.</span></li>
      ) : (
        <li className="actions__key actions__key--ok"><Icon name="info" size={22} /><span><b>If they ask for money, still confirm first.</b> A good copy can sound right.</span></li>
      )}
      {other && (
        <li>
          <Icon name="handset" size={22} />
          <span><b>Hang up and call {name} on the number you already have.</b> Not the number that called you.</span>
          {tel && <Btn tone="paper" href={tel} icon="handset">Call {name}</Btn>}
        </li>
      )}
      {other && (
        <li>
          <Icon name="people" size={22} />
          <span><b>Ask {name} to confirm in KinVoice.</b> They’ll get a “Was this you?” on their own phone.</span>
          {c.asked ? (
            <span className="sent"><Icon name="tick" size={16} stroke={3} /> Request saved. In the web beta it can’t reach {name}’s phone yet — call to be sure.</span>
          ) : (
            <Btn tone="paper" onClick={onAsk}>Send request</Btn>
          )}
        </li>
      )}
      {question && v !== 'sounds-like' && (
        <li>
          <Icon name="card" size={22} />
          <span><b>Ask your family question:</b> “{question}” <span className="muted">— listen for “{answer}”.</span></span>
        </li>
      )}
      {v !== 'sounds-like' && (
        <li>
          <Icon name="kettle" size={22} />
          <span><b>Take ten minutes.</b> Scammers rush you. Family will wait.</span>
          <Btn tone="paper" onClick={() => navigate('/app/pause')}>Start a 10-minute pause</Btn>
        </li>
      )}
      <li>
        <Icon name="buoy" size={22} />
        <span>Already sent money? <Link to="/app/help" className="link">Here’s what to do</Link> — no judgement.</span>
      </li>
    </ol>
  )
}
