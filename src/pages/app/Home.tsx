import { Btn } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { VoiceStamp } from '../../components/Stamp'
import { Link, navigate } from '../../lib/router'
import { me, relationLabel, sampleFamily, useStore, voiceStrength } from '../../lib/store'
import { VerdictChip, when } from './common'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function Home() {
  const { data, update } = useStore()
  if (!data) return null
  const self = me(data)
  const family = data.members.filter((m) => !m.self)
  const enrolled = !!self.voiceprint
  const hasPatterns = !!(self.patterns?.callsThem.length || self.patterns?.greetings.length)
  const steps = [
    { done: true, label: 'Create your account' },
    { done: enrolled, label: 'Teach KinVoice your voice', to: '/setup' },
    { done: hasPatterns, label: 'Add how you talk to family', to: '/app/voice' },
    { done: family.length > 0, label: 'Invite your family', to: '/app/family' },
    { done: data.questions.length > 0, label: 'Agree a family question', to: '/app/family' },
  ]
  const left = steps.filter((s) => !s.done).length

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="display display--s">{greeting()}, {self.name}.</h1>
        </div>
      </header>

      {!enrolled && (
        <section className="callout callout--setup">
          <VoiceStamp member={self} size={64} />
          <div>
            <h2>Teach KinVoice your voice</h2>
            <p>Five short recordings, about two minutes. Then nobody can pretend to be you without KinVoice noticing.</p>
          </div>
          <Btn tone="yolk" onClick={() => navigate('/setup')} iconRight="right">Start</Btn>
        </section>
      )}

      <section className="check-cta">
        <div>
          <h2>Got a call or voice note that feels off?</h2>
          <p>Upload it or record it on speaker. KinVoice tells you if it sounds like them — in seconds.</p>
        </div>
        <Btn tone="ink" big icon="ear" onClick={() => navigate('/app/check')}>Check a voice</Btn>
      </section>

      <div className="grid-2">
        <section className="panel">
          <header className="panel__head">
            <h2>Your circle</h2>
            <Link to="/app/family" className="link">Manage</Link>
          </header>
          <ul className="circle">
            {[self, ...family].map((m) => (
              <li key={m.id}>
                <Link to={m.self ? '/app/voice' : `/app/family/${m.id}`}>
                  <VoiceStamp member={m} size={52} dim={!m.voiceprint} />
                  <b>{m.self ? 'You' : m.name}</b>
                  <small>{m.voiceprint ? voiceStrength(m) : m.status === 'invited' ? 'Invited' : 'No voiceprint'}</small>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/app/family" className="circle__add">
                <span><Icon name="plus" size={26} /></span>
                <b>Add</b>
                <small>Family</small>
              </Link>
            </li>
          </ul>
          {family.length === 0 && (
            <p className="muted small">
              Want to try it first? <button className="link" onClick={() => update((d) => { d.members.push(...sampleFamily()) })}>Add a sample family</button> with ready-made voiceprints.
            </p>
          )}
        </section>

        {left > 0 ? (
          <section className="panel">
            <header className="panel__head">
              <h2>Get fully set up</h2>
              <span className="muted small">{steps.length - left} of {steps.length}</span>
            </header>
            <ol className="todo">
              {steps.map((s) => (
                <li key={s.label} className={s.done ? 'is-done' : ''}>
                  <span className="todo__mark">{s.done ? <Icon name="tick" size={16} stroke={3} /> : null}</span>
                  {s.done || !s.to ? <span>{s.label}</span> : <Link to={s.to}>{s.label}</Link>}
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <section className="panel">
            <header className="panel__head"><h2>You’re all set</h2></header>
            <p className="muted">Your voice, your family and your family question are in place. Keep KinVoice in mind whenever a call asks for money.</p>
          </section>
        )}
      </div>

      <section className="panel">
        <header className="panel__head">
          <h2>Recent checks</h2>
          {data.checks.length > 0 && <Link to="/app/history" className="link">See all</Link>}
        </header>
        {data.checks.length === 0 ? (
          <p className="muted">Nothing checked yet. When something sounds off, it’ll show up here.</p>
        ) : (
          <ul className="rows">
            {data.checks.slice(0, 4).map((c) => {
              const who = data.members.find((m) => m.id === c.result.claimedId)
              return (
                <li key={c.id}>
                  <Link to={`/app/check/${c.id}`} className="row">
                    <VerdictChip v={c.result.verdict} />
                    <span className="row__main">
                      <b>{c.label}</b>
                      <small>{who ? `Claimed to be ${who.self ? 'you' : `${who.name} (${relationLabel(who.relation).toLowerCase()})`}` : 'Unknown caller'} · {when(c.at)}</small>
                    </span>
                    <Icon name="chevron" size={20} />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
