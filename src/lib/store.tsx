import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { VoiceFeatures } from './audio/features'
import type { Account, Member, Patterns, Relation, UserData } from './types'

// Accounts and data live in this browser (localStorage). There is no
// server yet: this is the web prototype. Recordings are never stored —
// only the numbers a voiceprint is made of.

const ACCOUNTS = 'kin.accounts'
const SESSION = 'kin.session'
const dataKey = (id: string) => `kin.data.${id}`

export const COLORS = ['#17697A', '#3D5FD6', '#7D3C6B', '#8A5A2B', '#5B5F97', '#A0442C', '#2E6B4F']

const read = <T,>(k: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(k)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* storage full or blocked */
  }
}

async function hash(pw: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`kin:${pw}`))
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
export const nowIso = () => new Date().toISOString()

export const RELATIONS: { v: Relation; label: string }[] = [
  { v: 'mother', label: 'Mother' },
  { v: 'father', label: 'Father' },
  { v: 'grandmother', label: 'Grandmother' },
  { v: 'grandfather', label: 'Grandfather' },
  { v: 'son', label: 'Son' },
  { v: 'daughter', label: 'Daughter' },
  { v: 'grandson', label: 'Grandson' },
  { v: 'granddaughter', label: 'Granddaughter' },
  { v: 'brother', label: 'Brother' },
  { v: 'sister', label: 'Sister' },
  { v: 'partner', label: 'Partner' },
  { v: 'other', label: 'Other' },
]
export const relationLabel = (r: Relation) => (r === 'me' ? 'You' : RELATIONS.find((x) => x.v === r)?.label ?? 'Family')

export const emptyPatterns = (): Patterns => ({ callsThem: [], neverSays: [], greetings: [], signoffs: [], phrases: [] })

function freshData(acc: Account): UserData {
  return {
    members: [{ id: 'me', name: acc.name.split(' ')[0] || acc.name, relation: 'me', color: '#14233D', self: true, status: 'invited', patterns: emptyPatterns() }],
    checks: [],
    questions: [],
  }
}

// ── Sample family: made-up voiceprints so a check can be tried straight away.
function synthVoice(pitch: number, cv: number, centroid: number, seed: number, n = 4): VoiceFeatures[] {
  const bands = (j: number) =>
    Array.from({ length: 16 }, (_, i) => {
      const formant = Math.exp(-(((i - 4 - (pitch > 170 ? 1.2 : 0)) / 3.2) ** 2)) * 1.4 + Math.exp(-(((i - 10) / 2.4) ** 2)) * 0.6
      return -3.2 + formant - i * 0.09 + Math.sin(i * 1.3 + seed) * 0.18 + Math.sin(i * 0.7 + j) * 0.04
    })
  return Array.from({ length: n }, (_, j) => ({
    duration: 7 + j,
    voicedSec: 5 + j * 0.4,
    pitch: pitch * (1 + Math.sin(seed + j) * 0.03),
    pitchCv: cv + Math.sin(j + seed) * 0.02,
    centroid: centroid * (1 + Math.cos(seed + j) * 0.04),
    rolloff: centroid * 2.1,
    flatness: 0.18,
    loudCv: 0.42,
    pauseRatio: 0.21,
    noiseFloor: 0.002,
    bands: bands(j),
    bandwidth: 7800,
    clipped: 0,
    level: 0.06,
  }))
}

export const SAMPLE_VOICES = {
  emma: { pitch: 218, cv: 0.21, centroid: 1950, seed: 1.7 },
  tom: { pitch: 118, cv: 0.17, centroid: 1450, seed: 4.2 },
}

export function sampleFamily(): Member[] {
  const at = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  return [
    {
      id: 'sample_emma', name: 'Emma', relation: 'daughter', color: COLORS[1], sample: true, status: 'enrolled', phone: '(202) 555-0177',
      voiceprint: { samples: synthVoice(SAMPLE_VOICES.emma.pitch, SAMPLE_VOICES.emma.cv, SAMPLE_VOICES.emma.centroid, SAMPLE_VOICES.emma.seed), consentAt: at, updatedAt: at, synthetic: true },
      patterns: { callsThem: ['Mum'], neverSays: ['Mom', 'Mother'], greetings: ['Hiya Mum', 'Hiya'], signoffs: ['Love you loads'], phrases: ['literally'] },
    },
    {
      id: 'sample_tom', name: 'Tom', relation: 'son', color: COLORS[0], sample: true, status: 'enrolled', phone: '(202) 555-0142',
      voiceprint: { samples: synthVoice(SAMPLE_VOICES.tom.pitch, SAMPLE_VOICES.tom.cv, SAMPLE_VOICES.tom.centroid, SAMPLE_VOICES.tom.seed), consentAt: at, updatedAt: at, synthetic: true },
      patterns: { callsThem: ['Mum'], neverSays: ['Mom', 'Mother'], greetings: ['Alright Mum', 'Alright'], signoffs: ['Speak soon'], phrases: [] },
    },
    { id: 'sample_margaret', name: 'Margaret', relation: 'mother', color: COLORS[2], sample: true, status: 'invited', invitedAt: at, phone: '(202) 555-0118', patterns: emptyPatterns() },
  ]
}

// ── Sample clips: suspicious calls and voice notes, as features + words.
export const SAMPLE_CLIPS: { id: string; label: string; detail: string; claims: string; transcript: string; features: VoiceFeatures }[] = [
  {
    id: 'clip_newnumber',
    label: 'Voice note from a new number',
    detail: '20 seconds · says it’s Tom',
    claims: 'sample_tom',
    transcript: 'Hello Mom, it’s me, Tom. My phone’s broken, so this is my new number. I need help paying a bill today — can you send it now? Don’t bother calling the old number.',
    features: { ...synthVoice(165, 0.05, 1700, 9.1, 1)[0], pauseRatio: 0.03, loudCv: 0.15, noiseFloor: 0.0001, voicedSec: 14 },
  },
  {
    id: 'clip_arrest',
    label: 'Crying call: “I’ve been arrested”',
    detail: '35 seconds · says it’s Emma',
    claims: 'sample_emma',
    transcript: 'Mum, it’s me, I crashed the car and the police arrested me. I need eight thousand dollars for bail right now. A courier will come to collect it. Please don’t tell anyone.',
    features: { ...synthVoice(SAMPLE_VOICES.emma.pitch * 1.06, 0.06, 1850, 2.4, 1)[0], pauseRatio: 0.02, loudCv: 0.16, noiseFloor: 0.0002, voicedSec: 22 },
  },
  {
    id: 'clip_emma',
    label: 'Voice note from Emma’s usual number',
    detail: '9 seconds · says it’s Emma',
    claims: 'sample_emma',
    transcript: 'Hiya Mum! The cat literally knocked your glasses off the table again, sorry! Love you loads.',
    features: synthVoice(SAMPLE_VOICES.emma.pitch, SAMPLE_VOICES.emma.cv, SAMPLE_VOICES.emma.centroid, SAMPLE_VOICES.emma.seed, 1)[0],
  },
]

interface Store {
  account: Account | null
  data: UserData | null
  signUp: (name: string, email: string, pw: string) => Promise<string | null>
  signIn: (email: string, pw: string) => Promise<string | null>
  signOut: () => void
  update: (fn: (d: UserData) => void) => void
  deleteAccount: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(() => {
    const id = read<string | null>(SESSION, null)
    return read<Account[]>(ACCOUNTS, []).find((a) => a.id === id) ?? null
  })
  const [data, setData] = useState<UserData | null>(() => (account ? read<UserData | null>(dataKey(account.id), null) ?? freshData(account) : null))

  useEffect(() => {
    if (account && data) write(dataKey(account.id), data)
  }, [account, data])

  const signUp = useCallback(async (name: string, email: string, pw: string) => {
    const accounts = read<Account[]>(ACCOUNTS, [])
    const e = email.trim().toLowerCase()
    if (accounts.some((a) => a.email === e)) return 'There’s already an account with this email. Sign in instead.'
    const acc: Account = { id: uid('acc'), name: name.trim(), email: e, pw: await hash(pw), createdAt: nowIso() }
    write(ACCOUNTS, [...accounts, acc])
    write(SESSION, acc.id)
    const d = freshData(acc)
    write(dataKey(acc.id), d)
    setAccount(acc)
    setData(d)
    return null
  }, [])

  const signIn = useCallback(async (email: string, pw: string) => {
    const acc = read<Account[]>(ACCOUNTS, []).find((a) => a.email === email.trim().toLowerCase())
    if (!acc || acc.pw !== (await hash(pw))) return 'That email and password don’t match an account on this device.'
    write(SESSION, acc.id)
    setAccount(acc)
    setData(read<UserData | null>(dataKey(acc.id), null) ?? freshData(acc))
    return null
  }, [])

  const signOut = useCallback(() => {
    write(SESSION, null)
    setAccount(null)
    setData(null)
  }, [])

  const update = useCallback((fn: (d: UserData) => void) => {
    setData((d) => {
      if (!d) return d
      const next = structuredClone(d)
      fn(next)
      return next
    })
  }, [])

  const deleteAccount = useCallback(() => {
    if (!account) return
    try {
      localStorage.removeItem(dataKey(account.id))
    } catch {
      /* ignore */
    }
    write(ACCOUNTS, read<Account[]>(ACCOUNTS, []).filter((a) => a.id !== account.id))
    write(SESSION, null)
    setAccount(null)
    setData(null)
  }, [account])

  return <Ctx.Provider value={{ account, data, signUp, signIn, signOut, update, deleteAccount }}>{children}</Ctx.Provider>
}

export function useStore() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore outside StoreProvider')
  return c
}

export const me = (d: UserData) => d.members[0]
export const voiceStrength = (m?: Member) => {
  const n = m?.voiceprint?.samples.length ?? 0
  return n >= 5 ? 'Strong' : n >= 3 ? 'Good' : n > 0 ? 'Needs more' : 'Not set up'
}
