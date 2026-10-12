import { useCallback, useEffect, useRef, useState } from 'react'

// Microphone recording with a live level meter. Uses MediaRecorder; the
// audio stays in memory on this device.
export type RecState = 'idle' | 'asking' | 'recording' | 'done' | 'denied' | 'unsupported'

export function useRecorder(maxSec = 12) {
  const [state, setState] = useState<RecState>(() =>
    typeof window !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function' && 'MediaRecorder' in window ? 'idle' : 'unsupported',
  )
  const [level, setLevel] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const rec = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const raf = useRef(0)
  const ctx = useRef<AudioContext | null>(null)
  const started = useRef(0)

  const cleanup = useCallback(() => {
    cancelAnimationFrame(raf.current)
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    ctx.current?.close().catch(() => {})
    ctx.current = null
  }, [])

  const stop = useCallback(() => {
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop()
  }, [])

  const start = useCallback(async () => {
    setBlob(null)
    setElapsed(0)
    setState('asking')
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } })
      stream.current = s
      const chunks: Blob[] = []
      const r = new MediaRecorder(s)
      rec.current = r
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      r.onstop = () => {
        setBlob(new Blob(chunks, { type: r.mimeType || 'audio/webm' }))
        setState('done')
        setLevel(0)
        cleanup()
      }
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ac = new AC()
      ctx.current = ac
      const an = ac.createAnalyser()
      an.fftSize = 1024
      ac.createMediaStreamSource(s).connect(an)
      const buf = new Float32Array(an.fftSize)
      started.current = performance.now()
      const loop = () => {
        an.getFloatTimeDomainData(buf)
        let sum = 0
        for (const v of buf) sum += v * v
        setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 6))
        const sec = (performance.now() - started.current) / 1000
        setElapsed(sec)
        if (sec >= maxSec) stop()
        else raf.current = requestAnimationFrame(loop)
      }
      r.start()
      setState('recording')
      loop()
    } catch {
      cleanup()
      setState('denied')
    }
  }, [cleanup, maxSec, stop])

  const reset = useCallback(() => {
    setBlob(null)
    setElapsed(0)
    setState((s) => (s === 'unsupported' ? s : 'idle'))
  }, [])

  useEffect(() => () => {
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop()
    cleanup()
  }, [cleanup])

  return { state, level, elapsed, blob, start, stop, reset }
}
