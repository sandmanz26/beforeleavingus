import { useEffect, useRef, useState } from 'react'
import { useRecorder } from '../lib/audio/useRecorder'
import { canTranscribe, listen } from '../lib/speech'
import { Icon } from './Icon'

// One big button. Tap to record, tap to stop. A ring shows that the
// microphone hears you; the timer shows how long is left.
export function Recorder({ maxSec = 12, minSec = 3, onDone, onTranscript, label = 'Tap to record', compact = false }: {
  maxSec?: number
  minSec?: number
  onDone: (blob: Blob) => void
  onTranscript?: (t: string) => void
  label?: string
  compact?: boolean
}) {
  const r = useRecorder(maxSec)
  const [words, setWords] = useState('')
  const stopListen = useRef<() => void>(() => {})
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    if (r.state === 'recording' && onTranscript && canTranscribe()) {
      stopListen.current = listen((t) => {
        setWords(t)
        onTranscript(t)
      })
    }
    if (r.state !== 'recording') stopListen.current()
  }, [r.state, onTranscript])

  useEffect(() => {
    if (r.state === 'done' && r.blob) {
      done.current(r.blob)
      r.reset()
    }
  }, [r.state, r.blob, r])

  if (r.state === 'unsupported')
    return <p className="rec__note">This browser can’t record audio. Try Chrome, Edge or Safari — or upload a recording instead.</p>
  if (r.state === 'denied')
    return (
      <div className="rec__note">
        <p><b>KinVoice can’t hear your microphone.</b> Allow microphone access in your browser’s address bar, then try again.</p>
        <button className="link" onClick={r.reset}>Try again</button>
      </div>
    )

  const recording = r.state === 'recording'
  const left = Math.max(0, maxSec - r.elapsed)
  const canStop = r.elapsed >= minSec
  return (
    <div className={`rec${compact ? ' rec--compact' : ''}${recording ? ' is-on' : ''}`}>
      <button
        className="rec__btn"
        onClick={() => (recording ? canStop && r.stop() : r.start())}
        aria-label={recording ? 'Stop recording' : label}
        style={{ ['--lvl' as string]: r.level.toFixed(3) }}
        disabled={r.state === 'asking'}
      >
        <span className="rec__ring" aria-hidden />
        <Icon name={recording ? 'pause' : 'mic'} size={compact ? 30 : 40} stroke={2.6} />
      </button>
      <div className="rec__meta" aria-live="polite">
        {r.state === 'asking' && <b>Allow the microphone…</b>}
        {r.state === 'idle' && <b>{label}</b>}
        {recording && (
          <>
            <b>Listening… {Math.ceil(left)}s left</b>
            <span>{canStop ? 'Tap again when you’re finished.' : 'Keep going…'}</span>
          </>
        )}
        {recording && words && <q className="rec__words">{words}</q>}
      </div>
    </div>
  )
}
