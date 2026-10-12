import { fftMag, hann } from './fft'

// On-device voice features. Everything here runs in the browser: the
// recording never leaves the device, only these numbers are kept.

export interface VoiceFeatures {
  duration: number // seconds analysed
  voicedSec: number // seconds with a voice in them
  pitch: number // median fundamental frequency, Hz
  pitchCv: number // how much the pitch moves (std / mean)
  centroid: number // spectral centroid, Hz — the “brightness” of the voice
  rolloff: number // 85% energy roll-off, Hz
  flatness: number // 0 (tonal) … 1 (noise-like)
  loudCv: number // how much loudness moves while speaking
  pauseRatio: number // share of gaps between the first and last word
  noiseFloor: number // RMS of the quietest moments
  bands: number[] // 16-band spectral envelope (log energy), the voice's “colour”
  bandwidth: number // Hz below which 99% of energy sits (source quality)
  clipped: number // share of clipped samples
  level: number // loudness of the voiced parts (RMS)
}

const SR = 16000
const N = 1024
const HOP = 512
const MAX_SEC = 30
const BANDS = 16

const mel = (f: number) => 2595 * Math.log10(1 + f / 700)
const imel = (m: number) => 700 * (10 ** (m / 2595) - 1)
const EDGES = Array.from({ length: BANDS + 1 }, (_, i) => imel(mel(80) + ((mel(7600) - mel(80)) * i) / BANDS))

const pct = (arr: number[], p: number) => {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))]
}
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)
const std = (a: number[]) => {
  const m = mean(a)
  return Math.sqrt(mean(a.map((x) => (x - m) ** 2)))
}

export class NoVoiceError extends Error {}

export async function analyseBlob(blob: Blob): Promise<VoiceFeatures> {
  const bytes = await blob.arrayBuffer()
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new AC()
  let audio: AudioBuffer
  try {
    audio = await ctx.decodeAudioData(bytes)
  } catch {
    throw new Error('We couldn’t open this file. Try an MP3, M4A, WAV or a voice note.')
  } finally {
    ctx.close()
  }
  const bandwidth = measureBandwidth(audio)
  const seconds = Math.min(audio.duration, MAX_SEC)
  const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(seconds * SR)), SR)
  const src = off.createBufferSource()
  src.buffer = audio
  src.connect(off.destination)
  src.start()
  const mono = (await off.startRendering()).getChannelData(0)
  return extract(mono, bandwidth)
}

function measureBandwidth(audio: AudioBuffer) {
  const data = audio.getChannelData(0)
  const n = 2048
  const win = hann(n)
  const acc = new Float32Array(n / 2)
  const step = Math.max(n, Math.floor(data.length / 60))
  for (let s = 0; s + n < data.length; s += step) {
    const f = new Float32Array(n)
    for (let i = 0; i < n; i++) f[i] = data[s + i] * win[i]
    const m = fftMag(f)
    for (let i = 0; i < m.length; i++) acc[i] += m[i] * m[i]
  }
  const total = acc.reduce((a, b) => a + b, 0)
  if (!total) return 0
  let run = 0
  for (let i = 0; i < acc.length; i++) {
    run += acc[i]
    if (run >= total * 0.99) return (i * audio.sampleRate) / n
  }
  return audio.sampleRate / 2
}

export function extract(x: Float32Array, bandwidth = 0): VoiceFeatures {
  const win = hann(N)
  const frames = Math.max(0, Math.floor((x.length - N) / HOP) + 1)
  const rms: number[] = []
  for (let f = 0; f < frames; f++) {
    let s = 0
    for (let i = 0; i < N; i++) s += x[f * HOP + i] ** 2
    rms.push(Math.sqrt(s / N))
  }
  const thr = Math.max(0.006, pct(rms, 0.9) * 0.2)
  const voiced = rms.map((r) => r > thr)
  const first = voiced.indexOf(true)
  const last = voiced.lastIndexOf(true)

  const pitches: number[] = []
  const cents: number[] = []
  const rolls: number[] = []
  const flats: number[] = []
  const loud: number[] = []
  const bandAcc = new Array(BANDS).fill(0)
  let bandFrames = 0
  const minLag = Math.floor(SR / 400)
  const maxLag = Math.ceil(SR / 70)
  const frame = new Float32Array(N)

  for (let f = 0; f < frames; f++) {
    if (!voiced[f]) continue
    const off = f * HOP
    for (let i = 0; i < N; i++) frame[i] = x[off + i]
    loud.push(rms[f])

    // pitch: normalised autocorrelation
    let best = 0
    let bestLag = 0
    for (let lag = minLag; lag <= maxLag; lag++) {
      let num = 0
      let e1 = 0
      let e2 = 0
      for (let i = 0; i + lag < N; i++) {
        num += frame[i] * frame[i + lag]
        e1 += frame[i] * frame[i]
        e2 += frame[i + lag] * frame[i + lag]
      }
      const r = num / (Math.sqrt(e1 * e2) || 1)
      if (r > best) {
        best = r
        bestLag = lag
      }
    }
    if (best > 0.45 && bestLag) pitches.push(SR / bestLag)

    // spectrum
    const w = new Float32Array(N)
    for (let i = 0; i < N; i++) w[i] = frame[i] * win[i]
    const mag = fftMag(w)
    let tot = 0
    let wsum = 0
    let logSum = 0
    for (let k = 1; k < mag.length; k++) {
      const p = mag[k] * mag[k] + 1e-12
      tot += p
      wsum += p * ((k * SR) / N)
      logSum += Math.log(p)
    }
    cents.push(wsum / tot)
    flats.push(Math.exp(logSum / (mag.length - 1)) / (tot / (mag.length - 1)))
    let run = 0
    for (let k = 1; k < mag.length; k++) {
      run += mag[k] * mag[k]
      if (run >= tot * 0.85) {
        rolls.push((k * SR) / N)
        break
      }
    }
    for (let b = 0; b < BANDS; b++) {
      const lo = Math.floor((EDGES[b] * N) / SR)
      const hi = Math.max(lo + 1, Math.floor((EDGES[b + 1] * N) / SR))
      let e = 0
      for (let k = lo; k < hi; k++) e += mag[k] * mag[k]
      bandAcc[b] += Math.log10(e / (hi - lo) + 1e-10)
    }
    bandFrames++
  }

  const voicedFrames = voiced.filter(Boolean).length
  if (voicedFrames < 8 || pitches.length < 5) throw new NoVoiceError('We couldn’t hear a voice clearly in this recording.')

  const span = last - first + 1
  const gaps = voiced.slice(first, last + 1).filter((v) => !v).length
  const pitchMed = pct(pitches, 0.5)
  // keep pitch values near the median (octave errors)
  const clean = pitches.filter((p) => p > pitchMed / 1.8 && p < pitchMed * 1.8)
  let clippedN = 0
  for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > 0.985) clippedN++

  return {
    duration: x.length / SR,
    voicedSec: (voicedFrames * HOP) / SR,
    pitch: pitchMed,
    pitchCv: std(clean) / (mean(clean) || 1),
    centroid: mean(cents),
    rolloff: mean(rolls),
    flatness: mean(flats),
    loudCv: std(loud) / (mean(loud) || 1),
    pauseRatio: span > 0 ? gaps / span : 0,
    noiseFloor: pct(rms, 0.1),
    bands: bandAcc.map((v) => v / Math.max(1, bandFrames)),
    bandwidth,
    clipped: clippedN / Math.max(1, x.length),
    level: mean(loud),
  }
}

// Enrolment needs a clean, long-enough sample.
export function qualityIssue(f: VoiceFeatures): string | null {
  if (f.voicedSec < 2) return 'That was a bit short. Try speaking for a few seconds longer.'
  if (f.level < 0.012) return 'That was very quiet. Move a little closer to the microphone.'
  if (f.clipped > 0.01) return 'That was too loud and crackled. Move back a little.'
  return null
}
