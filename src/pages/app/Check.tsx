import { useCallback, useRef, useState } from 'react'
import { Btn } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { Recorder } from '../../components/Recorder'
import { VoiceStamp } from '../../components/Stamp'
import { analyseBlob, NoVoiceError, type VoiceFeatures } from '../../lib/audio/features'
import { judge } from '../../lib/audio/voiceprint'
import { navigate } from '../../lib/router'
import { nowIso, SAMPLE_CLIPS, sampleFamily, uid, useStore } from '../../lib/store'
import type { Check as CheckT } from '../../lib/types'
import { canTranscribe } from '../../lib/speech'
import { PageHead } from './Shell'

// PRD F-D1 + F-B1: one page, three short questions, one button.
type Source = 'record' | 'upload' | 'sample'

export function Check() {
  const { data, update } = useStore()
  const [source, setSource] = useState<Source>('record')
  const [clip, setClip] = useState<{ features: VoiceFeatures; label: string; source: Source } | null>(null)
  const [claimed, setClaimed] = useState<string | null | undefined>(undefined) // undefined = not chosen, null = not sure
  const [words, setWords] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [steps, setSteps] = useState(0)
  const file = useRef<HTMLInputElement>(null)
  const onWords = useCallback((t: string) => setWords(t), [])
  if (!data) return null

  const people = data.members
  const take = async (blob: Blob, label: string, src: Source) => {
    setErr(null)
    setBusy('Listening to the recording…')
    try {
      const f = await analyseBlob(blob)
      setClip({ features: f, label, source: src })
    } catch (e) {
      setErr(e instanceof NoVoiceError ? 'We couldn’t hear a voice clearly in that. Try a recording with less background noise.' : (e as Error).message)
    }
    setBusy(null)
  }

  const pickSample = (id: string) => {
    const s = SAMPLE_CLIPS.find((c) => c.id === id)!
    if (!data.members.some((m) => m.id === s.claims)) update((d) => { d.members.push(...sampleFamily().filter((m) => !d.members.some((x) => x.id === m.id))) })
    setClip({ features: s.features, label: s.label, source: 'sample' })
    setClaimed(s.claims)
    setWords(s.transcript)
  }

  const run = async () => {
    if (!clip) return
    setBusy('Checking')
    for (let i = 1; i <= 4; i++) {
      setSteps(i)
      await new Promise((r) => setTimeout(r, 450))
    }
    const who = claimed ? data.members.find((m) => m.id === claimed) ?? null : null
    const result = judge({ clip: clip.features, transcript: words, claimed: who, members: data.members })
    const c: CheckT = { id: uid('chk'), at: nowIso(), source: clip.source, label: clip.label, transcript: words, result }
    update((d) => { d.checks.unshift(c) })
    navigate(`/app/check/${c.id}`)
  }

  const ready = !!clip && claimed !== undefined
  return (
    <div className="page page--narrow">
      <PageHead eyebrow="Check a voice" title="Does this sound like them?" />

      <section className="step-card">
        <h2><span className="n">1</span> The voice</h2>
        {clip ? (
          <div className="clip">
            <Icon name="voicenote" size={28} />
            <span><b>{clip.label}</b><small>{clip.source === 'sample' ? 'Sample' : `${clip.features.duration.toFixed(0)} seconds · ${clip.features.voicedSec.toFixed(0)}s of speech`}</small></span>
            <button className="link" onClick={() => { setClip(null); setWords('') }}>Change</button>
          </div>
        ) : (
          <>
            <div className="seg-tabs" role="tablist">
              {([['record', 'Record it', 'mic'], ['upload', 'Upload a file', 'voicenote'], ['sample', 'Try a sample', 'play']] as const).map(([v, l, ic]) => (
                <button key={v} role="tab" aria-selected={source === v} className={source === v ? 'is-on' : ''} onClick={() => setSource(v)}>
                  <Icon name={ic} size={20} /> {l}
                </button>
              ))}
            </div>
            {busy && !steps ? (
              <p className="analysing"><span className="spinner" aria-hidden /> {busy}</p>
            ) : source === 'record' ? (
              <div className="rec-wrap">
                <Recorder maxSec={30} minSec={3} onDone={(b) => take(b, `Recording, ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, 'record')} onTranscript={onWords} label="Tap to record the voice" />
                <p className="tip"><Icon name="handset" size={20} /> On a call? Put it on speaker and hold your phone near this screen. Play a voice note out loud the same way.</p>
              </div>
            ) : source === 'upload' ? (
              <div
                className="drop"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const f = e.dataTransfer.files[0]
                  if (f) take(f, f.name, 'upload')
                }}
              >
                <Icon name="voicenote" size={34} />
                <p><b>Drop a voice note or call recording here</b><br />MP3, M4A, WAV, OGG or WebM</p>
                <Btn tone="paper" onClick={() => file.current?.click()}>Choose a file</Btn>
                <input ref={file} type="file" accept="audio/*,.m4a,.opus,.ogg" hidden onChange={(e) => e.target.files?.[0] && take(e.target.files[0], e.target.files[0].name, 'upload')} />
              </div>
            ) : (
              <ul className="samples">
                {SAMPLE_CLIPS.map((s) => (
                  <li key={s.id}>
                    <button onClick={() => pickSample(s.id)}>
                      <Icon name="play" size={18} />
                      <span><b>{s.label}</b><small>{s.detail}</small></span>
                    </button>
                  </li>
                ))}
                <li className="muted small">Samples use a made-up family (Emma and Tom) so you can see a full result.</li>
              </ul>
            )}
            {err && <p className="form-error" role="alert">{err}</p>}
          </>
        )}
      </section>

      <section className={`step-card${clip ? '' : ' is-locked'}`}>
        <h2><span className="n">2</span> Who does it claim to be?</h2>
        <div className="who">
          {people.map((m) => {
            const usable = !!m.voiceprint && m.status !== 'paused'
            return (
              <button key={m.id} className={`who__opt${claimed === m.id ? ' is-on' : ''}`} onClick={() => setClaimed(m.id)} disabled={!clip}>
                <VoiceStamp member={m} size={44} dim={!usable} />
                <b>{m.self ? 'Me' : m.name}</b>
                <small>{usable ? 'Voiceprint ready' : 'No voiceprint — words only'}</small>
              </button>
            )
          })}
          <button className={`who__opt${claimed === null ? ' is-on' : ''}`} onClick={() => setClaimed(null)} disabled={!clip}>
            <span className="who__unknown"><Icon name="info" size={26} /></span>
            <b>I’m not sure</b>
            <small>Compare with everyone</small>
          </button>
        </div>
      </section>

      <section className={`step-card${clip ? '' : ' is-locked'}`}>
        <h2><span className="n">3</span> What did they say? <em>Optional</em></h2>
        <p className="muted small">{canTranscribe() ? 'We fill this in while you record, where your browser allows. ' : ''}Type or paste the words — we check them for scam signs and for how that person usually talks.</p>
        <textarea rows={4} value={words} onChange={(e) => setWords(e.target.value)} placeholder="e.g. “Mum, it’s me, I’ve lost my phone, this is my new number…”" disabled={!clip} />
      </section>

      {busy && steps > 0 ? (
        <section className="checking" aria-live="polite">
          {['Matching the voice', 'Comparing the words', 'Looking for AI clues', 'Checking for a scam script'].map((s, i) => (
            <p key={s} className={i < steps - 1 ? 'is-done' : i === steps - 1 ? 'is-on' : ''}>
              {i < steps - 1 ? <Icon name="tick" size={18} stroke={3} /> : <span className="spinner spinner--s" aria-hidden />} {s}
            </p>
          ))}
        </section>
      ) : (
        <Btn tone="yolk" big disabled={!ready} onClick={run} icon="ear">Check this voice</Btn>
      )}

      <aside className="soon">
        <Icon name="handset" size={24} />
        <p><b>Coming in the KinVoice app:</b> record the call you’re on with one tap and send it to Kin while you’re still talking.</p>
      </aside>
    </div>
  )
}
