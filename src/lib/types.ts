import type { VoiceFeatures } from './audio/features'

export type Relation = 'me' | 'mother' | 'father' | 'grandmother' | 'grandfather' | 'son' | 'daughter' | 'grandson' | 'granddaughter' | 'brother' | 'sister' | 'partner' | 'other'

// How a person talks to their family (PRD F-B1): the part a voice clone doesn't copy.
export interface Patterns {
  callsThem: string[] // what they call the person they usually ring (e.g. “Mum”, “Nan”)
  neverSays: string[] // names they'd never use
  greetings: string[]
  signoffs: string[]
  phrases: string[]
}

export interface Voiceprint {
  samples: VoiceFeatures[]
  consentAt: string
  updatedAt: string
  synthetic?: boolean // sample family: made-up numbers, no recordings
}

export interface Member {
  id: string
  name: string
  relation: Relation
  color: string
  phone?: string
  self?: boolean
  status: 'invited' | 'enrolled' | 'paused'
  voiceprint?: Voiceprint
  patterns?: Patterns
  sample?: boolean
  invitedAt?: string
}

export type Verdict = 'likely-fake' | 'no-match' | 'sounds-like' | 'unclear'

export interface Signal {
  key: string
  label: string // how it reads when the clue is found
  clear: string // how it reads when it isn't
  found: boolean
  detail: string
}

export interface Finding {
  tone: 'match' | 'differs' | 'flag' | 'info'
  text: string
}

export interface CheckResult {
  verdict: Verdict
  headline: string
  sub: string
  claimedId: string | null // who the voice claims to be
  comparedId: string | null // whose voiceprint we compared against
  voiceMatch: number | null // 0–100
  bestOthers: { id: string; score: number }[]
  words: { summary: 'matches' | 'mixed' | 'differs' | 'no-profile' | 'none'; findings: Finding[] }
  ai: Signal[]
  scam: string[]
}

export interface Check {
  id: string
  at: string
  source: 'record' | 'upload' | 'sample'
  label: string
  transcript: string
  result: CheckResult
  asked?: boolean // a confirmation request went to the person
}

export interface FamilyQuestion {
  id: string
  ask: string
  answer: string
  knownBy: string[]
}

export interface Account {
  id: string
  name: string
  email: string
  pw: string // SHA-256 of the password — this is a front-end prototype, not real auth
  createdAt: string
}

export interface UserData {
  members: Member[] // members[0] is always the account holder
  checks: Check[]
  questions: FamilyQuestion[]
}
