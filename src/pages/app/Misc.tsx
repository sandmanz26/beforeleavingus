import { useEffect, useState } from 'react'
import { Btn, Toggle } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { KettleDial, mmss } from '../../components/Kettle'
import { VoiceStamp } from '../../components/Stamp'
import { Link, navigate } from '../../lib/router'
import { me, relationLabel, useStore, voiceStrength } from '../../lib/store'
import { VerdictChip, when } from './common'
import { PatternsEditor } from './Family'
import { PageHead } from './Shell'

// ── My voice: the voiceprint, the words, the controls (PRD F-B1–F-B4, F-E3)
export function MyVoice() {
  const { data, update } = useStore()
  const [confirm, setConfirm] = useState(false)
  if (!data) return null
  const self = me(data)
  const vp = self.voiceprint
  const age = vp ? Math.floor((Date.now() - new Date(vp.updatedAt).getTime()) / 86_400_000) : 0
  return (
    <div className="page page--narrow">
      <PageHead eyebrow="Your voiceprint" title="My voice" />
      <section className="profile-hero">
        <VoiceStamp member={self} size={110} dim={!vp} />
        <div>
          {vp ? (
            <>
              <h2>Strength: {voiceStrength(self)}</h2>
              <p className="muted">{vp.samples.length} recordings analysed · updated {age === 0 ? 'today' : `${age} days ago`} · recordings not kept</p>
              <div className="row-btns">
                <Btn tone="paper" icon="mic" onClick={() => navigate('/setup')}>Record again</Btn>
              </div>
            </>
          ) : (
            <>
              <h2>No voiceprint yet</h2>
              <p className="muted">Five short recordings, about two minutes.</p>
              <Btn tone="yolk" icon="mic" onClick={() => navigate('/setup')}>Teach KinVoice your voice</Btn>
            </>
          )}
        </div>
      </section>
      {vp && age > 90 && <p className="warn"><Icon name="clock" size={20} /> Your voiceprint is over 90 days old. Voices and habits drift — a quick re-record keeps checks sharp.</p>}

      {vp && (
        <section className="panel">
          <h2>What KinVoice learned</h2>
          <dl className="learned">
            <div><dt>Typical pitch</dt><dd>{Math.round(vp.samples.reduce((a, s) => a + s.pitch, 0) / vp.samples.length)} Hz</dd></div>
            <div><dt>Expressiveness</dt><dd>{(() => { const cv = vp.samples.reduce((a, s) => a + s.pitchCv, 0) / vp.samples.length; return cv > 0.18 ? 'Lively' : cv > 0.1 ? 'Even' : 'Calm' })()}</dd></div>
            <div><dt>Pauses</dt><dd>{Math.round((vp.samples.reduce((a, s) => a + s.pauseRatio, 0) / vp.samples.length) * 100)}% of speaking time</dd></div>
            <div><dt>Speech recorded</dt><dd>{Math.round(vp.samples.reduce((a, s) => a + s.voicedSec, 0))} seconds</dd></div>
          </dl>
        </section>
      )}

      <section className="panel">
        <h2>How you talk to your family</h2>
        <p className="muted small">If someone copies your voice, these words are what they’ll get wrong.</p>
        <PatternsEditor value={self.patterns ?? { callsThem: [], neverSays: [], greetings: [], signoffs: [], phrases: [] }} onChange={(p) => update((d) => { d.members[0].patterns = p })} who="you" />
      </section>

      <section className="panel">
        <h2>Keep your voice harder to copy</h2>
        <ul className="tips">
          <li><Icon name="footprint" size={22} /><span><b>Public videos are raw material.</b> Three seconds is enough to copy a voice. You don’t have to stop posting — just choose what’s public on purpose.</span></li>
          <li><Icon name="hush" size={22} /><span><b>Keep family words offline.</b> Never post what you call your mum or nan, or your family question’s answer.</span></li>
          <li><Icon name="handset" size={22} /><span><b>Tell your family:</b> “I will never ask for money in a voice note.” Say it out loud. It sticks.</span></li>
        </ul>
      </section>

      {vp && (
        <section className="panel">
          <div className="setting">
            <span><b>Match checks against my voiceprint</b><small>Pause it any time without deleting it.</small></span>
            <Toggle on={self.status !== 'paused'} label="Use my voiceprint" onChange={(on) => update((d) => { d.members[0].status = on ? 'enrolled' : 'paused' })} />
          </div>
          {confirm ? (
            <p>Delete your voiceprint? <button className="link" onClick={() => { update((d) => { d.members[0].voiceprint = undefined; d.members[0].status = 'invited' }); setConfirm(false) }}>Yes, delete it</button> · <button className="link" onClick={() => setConfirm(false)}>Cancel</button></p>
          ) : (
            <button className="link" onClick={() => setConfirm(true)}>Delete my voiceprint</button>
          )}
        </section>
      )}
    </div>
  )
}

export function History() {
  const { data } = useStore()
  if (!data) return null
  return (
    <div className="page page--narrow">
      <PageHead eyebrow="Everything you’ve checked" title="History">
        <Btn tone="yolk" icon="ear" onClick={() => navigate('/app/check')}>Check a voice</Btn>
      </PageHead>
      {data.checks.length === 0 ? (
        <section className="empty">
          <Icon name="list" size={40} />
          <h2>Nothing checked yet</h2>
          <p>When a call or voice note sounds off, check it — it’ll be saved here.</p>
        </section>
      ) : (
        <ul className="rows">
          {data.checks.map((c) => {
            const who = data.members.find((m) => m.id === c.result.claimedId)
            return (
              <li key={c.id}>
                <Link to={`/app/check/${c.id}`} className="row">
                  <VerdictChip v={c.result.verdict} />
                  <span className="row__main">
                    <b>{c.label}</b>
                    <small>{who ? `Claimed to be ${who.self ? 'you' : `${who.name} (${relationLabel(who.relation).toLowerCase()})`}` : 'Unknown caller'} · {when(c.at)}{c.result.voiceMatch !== null ? ` · ${c.result.voiceMatch}% voice match` : ''}</small>
                  </span>
                  <Icon name="chevron" size={20} />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// PRD F-C4: the pause. Ten minutes destroys the scammer's urgency.
export function Pause() {
  const TOTAL = 10 * 60_000
  const [end, setEnd] = useState(() => Date.now() + TOTAL)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [])
  const left = end - now
  return (
    <div className="page page--narrow pause">
      <Link to="/app" className="back"><Icon name="left" size={20} /> Home</Link>
      <div className="pause__dial">
        <KettleDial left={left} total={TOTAL} size={220} />
        <p className="pause__time"><b>{mmss(left)}</b>{left > 0 ? 'to go' : 'done'}</p>
      </div>
      <p className="pause__kicker">Put the kettle on.</p>
      <h1 className="pause__title">{left > 0 ? 'Don’t send anything for ten minutes.' : 'Ten minutes. Still not sure? Keep waiting.'}</h1>
      <div className="script">
        <p className="eyebrow">If they’re still on the line, say</p>
        <p className="script__line">“I’ll call you back in ten minutes.”</p>
        <p className="script__then">If they won’t wait, hang up. Family will wait. Scammers won’t.</p>
      </div>
      <ul className="tips">
        <li><Icon name="handset" size={22} /><span>Call the person on the number <b>you already have</b> — not the one that called you.</span></li>
        <li><Icon name="hush" size={22} /><span>Whatever they said, <b>you’re allowed to tell family.</b> Asking for secrecy is a trick.</span></li>
      </ul>
      <Btn tone="paper" onClick={() => setEnd(Date.now() + TOTAL)}>Restart the ten minutes</Btn>
    </div>
  )
}

// PRD F-F1: shame-free recovery.
export function Help() {
  return (
    <div className="page page--narrow">
      <PageHead eyebrow="Something happened?" title="You’re not in trouble." />
      <p className="lede">The people who do this are professional criminals. Being tricked is not your fault — it happens to careful, clever people every day. Here’s what to do, in order.</p>
      <ol className="help-steps">
        <li>
          <h2>Call your bank now</h2>
          <p>Use the number on the back of your card. Say: <q>I think I’ve been tricked into sending money. Please stop the payment and freeze my card.</q></p>
          <p className="muted small">Paid with gift cards? Call the number on the back of each card too. Sent crypto? Contact the exchange you used.</p>
        </li>
        <li>
          <h2>Report it</h2>
          <p>It helps stop them doing it to someone else.</p>
          <div className="row-btns">
            <Btn tone="paper" href="https://reportfraud.ftc.gov/">US: ReportFraud.ftc.gov</Btn>
            <Btn tone="paper" href="https://www.actionfraud.police.uk/">UK: Action Fraud</Btn>
          </div>
        </li>
        <li>
          <h2>Tell someone you trust</h2>
          <p>It’s your choice who, and when. Nobody needs to take over your money. Telling someone often makes the next call easier to spot.</p>
        </li>
        <li>
          <h2>Change what they might have</h2>
          <p>If you shared passwords, codes or card details, change them. Ignore follow-up calls offering to “recover” your money — that’s often the same people.</p>
        </li>
      </ol>
    </div>
  )
}

export function Settings() {
  const { account, data, signOut, deleteAccount } = useStore()
  const [confirm, setConfirm] = useState(false)
  if (!account || !data) return null
  return (
    <div className="page page--narrow">
      <PageHead eyebrow="Account" title="Settings" />
      <section className="panel">
        <dl className="learned">
          <div><dt>Name</dt><dd>{account.name}</dd></div>
          <div><dt>Email</dt><dd>{account.email}</dd></div>
          <div><dt>Member since</dt><dd>{new Date(account.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</dd></div>
          <div><dt>Family</dt><dd>{data.members.length - 1} people</dd></div>
        </dl>
      </section>
      <section className="panel">
        <h2>Your data</h2>
        <p className="muted">In this web beta, everything is stored in this browser: your account, voiceprints and checks. Recordings are analysed and then discarded. Nothing is uploaded.</p>
      </section>
      <div className="row-btns">
        <Btn tone="ink" onClick={() => { signOut(); navigate('/') }}>Sign out</Btn>
      </div>
      <section className="danger">
        {confirm ? (
          <p>Delete your account, voiceprints and history from this browser? <button className="link" onClick={() => { deleteAccount(); navigate('/') }}>Yes, delete everything</button> · <button className="link" onClick={() => setConfirm(false)}>Cancel</button></p>
        ) : (
          <button className="link" onClick={() => setConfirm(true)}>Delete my account</button>
        )}
      </section>
    </div>
  )
}

export function Join({ id }: { id: string }) {
  const { data, account } = useStore()
  const m = data?.members.find((x) => x.id === id)
  return (
    <main className="auth">
      <div className="auth__card">
        {m ? (
          <>
            <VoiceStamp member={m} size={80} />
            <h1 className="display display--s">{m.name}, you’ve been invited</h1>
            <p className="muted">{account?.name} added you to their KinVoice circle, so they can tell when someone pretends to be you. It takes about a minute, and only you can agree to it.</p>
            <Btn tone="yolk" big onClick={() => navigate(`/setup/${m.id}`)} iconRight="right">Add my voice</Btn>
          </>
        ) : (
          <>
            <h1 className="display display--s">Invite link</h1>
            <p className="muted">In this web beta, invites only open in the browser where they were created. Ask the person who invited you to record your voice together on their device.</p>
            <Btn tone="ink" onClick={() => navigate('/')}>Go to KinVoice</Btn>
          </>
        )}
      </div>
    </main>
  )
}
