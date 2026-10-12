// Optional live transcript while recording, using the browser's own speech
// recognition where it exists (Chrome, Edge, Safari). Elsewhere the person
// can type what was said.
type Rec = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void
  onerror: () => void
  start: () => void
  stop: () => void
}

export const canTranscribe = () => typeof window !== 'undefined' && !!((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition)

export function listen(onText: (t: string) => void): () => void {
  const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec }
  const C = W.SpeechRecognition ?? W.webkitSpeechRecognition
  if (!C) return () => {}
  const r = new C()
  r.continuous = true
  r.interimResults = true
  r.lang = 'en-GB'
  r.onresult = (e) => {
    let t = ''
    for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript
    onText(t.trim())
  }
  r.onerror = () => {}
  try {
    r.start()
  } catch {
    /* already running */
  }
  return () => {
    try {
      r.stop()
    } catch {
      /* stopped */
    }
  }
}
