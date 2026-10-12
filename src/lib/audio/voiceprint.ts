import type { VoiceFeatures } from './features'
import { compareWords, scamSigns } from '../patternCheck'
import type { CheckResult, Member, Signal, Verdict } from '../types'

// Matching a voice to a voiceprint, and turning every signal into one
// plain-language verdict. Never says “real”, “safe” or “verified” (PRD §1):
// a voice that matches can still be cloned, so the best we say is
// “sounds like”, and we always point back to the family.

const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length)

export interface Summary {
  pitch: number
  pitchCv: number
  centroid: number
  bands: number[]
}

export function summarise(samples: VoiceFeatures[]): Summary {
  return {
    pitch: Math.exp(mean(samples.map((s) => Math.log(s.pitch)))),
    pitchCv: mean(samples.map((s) => s.pitchCv)),
    centroid: Math.exp(mean(samples.map((s) => Math.log(s.centroid)))),
    bands: samples[0].bands.map((_, i) => mean(samples.map((s) => s.bands[i]))),
  }
}

const shape = (b: number[]) => {
  const m = mean(b)
  const d = b.map((x) => x - m)
  const n = Math.sqrt(d.reduce((a, x) => a + x * x, 0)) || 1
  return d.map((x) => x / n)
}

// 0–100: how closely this voice matches the voiceprint.
export function match(clip: VoiceFeatures, s: Summary): number {
  const semis = 12 * Math.log2(clip.pitch / s.pitch)
  const sPitch = Math.exp(-((semis / 3.5) ** 2))
  const a = shape(clip.bands)
  const b = shape(s.bands)
  const cos = a.reduce((acc, x, i) => acc + x * b[i], 0)
  const sBands = Math.min(1, Math.max(0, (cos - 0.5) / 0.45))
  const sCent = Math.exp(-((Math.log(clip.centroid / s.centroid) / 0.35) ** 2))
  const sCv = Math.exp(-(((clip.pitchCv - s.pitchCv) / 0.12) ** 2))
  // A big pitch gap (e.g. a man's voice claiming to be a woman) caps the score:
  // close tone colour alone shouldn't make two different people “match”.
  const base = 0.45 * sPitch + 0.35 * sBands + 0.12 * sCent + 0.08 * sCv
  return Math.round(100 * base * (0.35 + 0.65 * sPitch))
}

// Clues that a voice may be generated. Weak on their own — shown as clues, never proof.
export function aiSignals(f: VoiceFeatures): Signal[] {
  return [
    { key: 'flat', label: 'Flat, unchanging pitch', clear: 'Pitch rises and falls naturally', found: f.pitchCv < 0.07, detail: 'People’s pitch rises and falls as they talk. Many AI voices stay oddly flat.' },
    { key: 'breath', label: 'No pauses to breathe', clear: 'Natural pauses to breathe', found: f.voicedSec > 4 && f.pauseRatio < 0.06, detail: 'People leave small gaps to breathe and think. Generated speech often runs on without them.' },
    { key: 'even', label: 'Unnaturally even loudness', clear: 'Loudness varies like a person’s', found: f.loudCv < 0.2, detail: 'A person’s volume wobbles. Generated speech is often evenly loud from start to finish.' },
    { key: 'silent', label: 'Perfect digital silence between words', clear: 'Normal background sound between words', found: f.noiseFloor < 0.0004, detail: 'Phones and rooms always add a little noise. Total silence between words suggests the audio was made, not recorded.' },
  ]
}

export function judge(opts: {
  clip: VoiceFeatures | null
  transcript: string
  claimed: Member | null
  members: Member[]
}): CheckResult {
  const { clip, transcript, claimed, members } = opts
  const withPrint = members.filter((m) => m.voiceprint?.samples.length && m.status !== 'paused')
  const ai = clip ? aiSignals(clip) : []
  const aiFound = ai.filter((s) => s.found).length
  const scam = scamSigns(transcript)

  let compared: Member | null = null
  let voiceMatch: number | null = null
  const scores = clip ? withPrint.map((m) => ({ id: m.id, score: match(clip, summarise(m.voiceprint!.samples)) })).sort((a, b) => b.score - a.score) : []
  if (claimed && claimed.voiceprint?.samples.length && claimed.status !== 'paused') {
    compared = claimed
    voiceMatch = scores.find((s) => s.id === claimed.id)?.score ?? null
  } else if (!claimed && scores.length) {
    compared = members.find((m) => m.id === scores[0].id) ?? null
    voiceMatch = scores[0].score
  }
  const nameOf = (m: Member | null) => (m ? (m.self ? 'you' : m.name) : 'them')
  const target = claimed ?? compared
  const words = compareWords(transcript, target?.patterns, target ? (target.self ? 'you' : target.name) : 'them')

  let verdict: Verdict
  const differs = words.summary === 'differs'
  if (voiceMatch !== null) {
    if (voiceMatch < 50 && (aiFound >= 2 || scam.length >= 2 || differs)) verdict = 'likely-fake'
    else if (voiceMatch < 60) verdict = 'no-match'
    else if (aiFound >= 3 || (differs && scam.length >= 2)) verdict = 'likely-fake'
    else if (voiceMatch >= 75 && aiFound <= 1 && !differs) verdict = 'sounds-like'
    else verdict = 'unclear'
  } else {
    verdict = aiFound >= 2 || scam.length >= 2 ? 'likely-fake' : 'unclear'
  }

  const who = nameOf(target)
  const Who = who === 'you' ? 'You' : who
  const copy: Record<Verdict, [string, string]> = {
    'likely-fake': ['This is likely fake.', target ? `It doesn’t sound like ${who === 'you' ? 'your voice' : who}, and it shows signs of a scam.` : 'It shows several signs of a generated voice or a scam script.'],
    'no-match': claimed
      ? [who === 'you' ? 'This doesn’t sound like you.' : `This doesn’t sound like ${who}.`, `The voice doesn’t match ${who === 'you' ? 'your' : `${who}’s`} voiceprint.`]
      : ['This doesn’t sound like anyone in your circle.', 'It doesn’t match any voiceprint you have. If it claims to be family, check with them directly.'],
    'sounds-like': [who === 'you' ? 'This sounds like you.' : `This sounds like ${who}.`, `The voice matches ${who === 'you' ? 'your' : `${who}’s`} voiceprint. Voices can still be copied — if it asks for money, confirm with ${who === 'you' ? 'family' : who} on a number you already have.`],
    unclear: ['We can’t be sure.', claimed && !compared ? `${Who} ${who === 'you' ? 'haven’t' : 'hasn’t'} taught KinVoice ${who === 'you' ? 'your' : 'their'} voice yet, so we checked everything else.` : 'Some things match and some don’t. Treat it with care.'],
  }

  return {
    verdict,
    headline: copy[verdict][0],
    sub: copy[verdict][1],
    claimedId: claimed?.id ?? null,
    comparedId: compared?.id ?? null,
    voiceMatch,
    bestOthers: scores.filter((s) => s.id !== compared?.id).slice(0, 2),
    words,
    ai,
    scam,
  }
}

