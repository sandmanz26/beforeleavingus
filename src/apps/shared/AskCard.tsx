import { MEMBERS, type MemberId } from '../../data/family'
import { Btn, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { mmss } from '../../components/Kettle'
import { elapsed, nameFor, telHref, useWorld } from '../../store/world'
import type { Incident, Reply } from '../../store/types'
import { factsFor } from '../margaret/facts'

// F-C3 / F-A1: the request a family member sees on their own phone.
// The impersonated person gets “Is this you?”; anyone else gets
// “Do you know where they are?”. One tap answers.

export function AskCard({ me, inc }: { me: MemberId; inc: Incident }) {
  const { w, dispatch } = useWorld()
  const claimed = inc.claimed && inc.claimed !== 'other' ? MEMBERS[inc.claimed] : null
  const isMe = inc.claimed === me
  const mum = nameFor(w, me)
  const reply = (r: Reply) => dispatch({ type: 'reply', member: me, reply: r })
  const msg = inc.kind === 'message' ? w.messages.find((m) => m.id === inc.messageId) : null
  const facts = factsFor(inc)

  return (
    <section className="ask" aria-live="assertive">
      <p className="ask__eyebrow">
        <span className="ask__badge">{inc.practice ? 'Practice' : 'Now'}</span>
        {mum}’s KinVoice · {elapsed(inc.startedAt, w.now)} ago
      </p>
      {isMe ? (
        <h1 className="ask__head">
          {msg ? `${mum} got a voice note from a new number. It says it’s you.` : `${mum} is on a call with someone who says they’re you.`}
        </h1>
      ) : (
        <h1 className="ask__head">
          {msg
            ? `${mum} got a voice note that says it’s ${claimed?.name}.`
            : claimed
              ? `${mum} is on a call with someone who says they’re ${claimed.name}.`
              : `${mum} is on a call with someone saying they’re police or a lawyer.`}
        </h1>
      )}
      {msg && <blockquote className="ask__quote">“{msg.transcript}”</blockquote>}
      {inc.question === 'said' && (
        <p className="ask__signal"><Icon name="card" size={18} /> The caller knew the family answer. If it might be {claimed?.name}, say so.</p>
      )}
      {!msg && facts.length > 0 && (
        <ul className="ask__facts">
          {facts.map((f, i) => (
            <li key={i}>
              <Icon name={f.icon} size={18} /> {f.text}
            </li>
          ))}
        </ul>
      )}
      {!msg && <p className="ask__pause"><Icon name="kettle" size={20} /> {mum} is on a {mmss(inc.pauseEndsAt - w.now)} pause, asked not to send anything.</p>}

      <div className="ask__actions">
        {isMe ? (
          <>
            <Btn tone="ink" big icon="cross" onClick={() => reply('not-me')}>{msg ? 'I didn’t send that' : 'That’s not me'}</Btn>
            <Btn tone="paper" icon="tick" onClick={() => reply('yes-me')}>{msg ? 'Yes, that was me' : 'Yes, it’s me — I need help'}</Btn>
          </>
        ) : (
          <>
            <Btn tone="ink" big onClick={() => reply('knows-not')}>
              I know where {claimed?.name ?? 'they are'}{claimed ? ' is' : ''} right now
            </Btn>
            <Btn tone="paper" icon="handset" href={telHref(MEMBERS.margaret.phone)} onClick={() => reply('calling')}>I’ll ring {mum} now</Btn>
            <Btn tone="ghost" onClick={() => reply('unsure')}>I don’t know — ask the next person</Btn>
          </>
        )}
      </div>
      <p className="ask__fine">{isMe ? `${mum} sees your answer word for word, with your name.` : `${mum} sees your answer with your name. Only ${claimed?.name ?? 'they'} can give the final word.`}</p>
    </section>
  )
}

// After answering: show exactly what Margaret now sees.
export function AnsweredCard({ me, inc }: { me: MemberId; inc: Incident }) {
  const { w } = useWorld()
  const mine = inc.asks.find((a) => a.member === me)
  const mum = nameFor(w, me)
  const text: Record<Reply, string> = {
    'not-me': `${mum} now sees: “${MEMBERS[me].name} answered: That’s not me.”`,
    'yes-me': `${mum} now sees: “${MEMBERS[me].name} answered: Yes, it’s me.” The pause has ended${me === 'david' ? '.' : ' and David has been asked to help you.'}`,
    'knows-not': `${mum} now sees: “${MEMBERS[me].name} answered: I know where ${inc.claimed && inc.claimed !== 'other' ? MEMBERS[inc.claimed].name : 'they are'} is right now.” ${inc.claimed && inc.claimed !== 'other' ? MEMBERS[inc.claimed].name : 'They'} is still being asked.`,
    calling: `${mum} sees “${MEMBERS[me].name} is ringing you now”. Ring ${MEMBERS.margaret.phone} if your phone didn’t open the call.`,
    unsure: 'Thanks. The next person in the phone tree is being asked.',
  }
  if (!mine?.reply) return null
  return (
    <section className="ask ask--done">
      <Stamp id={me} size={40} />
      <p className="ask__head ask__head--s">{text[mine.reply]}</p>
      {inc.closed && <p className="ask__fine">{mum} has finished the check.</p>}
    </section>
  )
}

// After the named person says “Yes, it’s me”: tell the circle keeper to act
// (roast #7 — we promised Margaret that David would help).
export function HandoffCard({ inc }: { inc: Incident }) {
  const { w } = useWorld()
  const o = inc.outcome!
  const who = MEMBERS[o.by]
  const facts = factsFor(inc).filter((f) => f.tone === 'flag')
  return (
    <section className="ask ask--handoff" style={{ ['--who' as string]: who.color }}>
      <p className="ask__eyebrow">
        <span className="ask__badge ask__badge--ink">Hand-off</span>
        {elapsed(o.at, w.now)} ago
      </p>
      <h1 className="ask__head">{who.name} answered “Yes, it’s me” and needs help.</h1>
      <p className="ask__body">Answered on {who.name}’s own phone. Mum has been told you’ll help, so she doesn’t send anything herself.</p>
      {facts.length > 0 && (
        <ul className="ask__facts">
          {facts.map((f, i) => (
            <li key={i}><Icon name={f.icon} size={18} /> {f.text}</li>
          ))}
        </ul>
      )}
      <div className="ask__actions">
        <Btn tone="ink" big icon="handset" href={telHref(who.phone)}>Ring {who.name}</Btn>
        <Btn tone="paper" icon="handset" href={telHref(MEMBERS.margaret.phone)}>Ring Mum</Btn>
      </div>
    </section>
  )
}
