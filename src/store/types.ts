import type { MemberId, Profile, Question } from '../data/family'
import type { VoiceMessage } from '../data/messages'

// Replies a family member can give from their own phone.
// not-me / yes-me: only the person being impersonated.
// knows-not: someone else who knows where they are.
export type Reply = 'not-me' | 'yes-me' | 'knows-not' | 'calling' | 'unsure'

export type QResult = 'said' | 'wrong' | 'dodged' | 'skipped'
export type Money = 'yes' | 'no' | 'notyet'
export type PayMethod = 'gift' | 'transfer' | 'cash' | 'crypto' | 'other'

export interface Ask {
  member: MemberId
  sentAt: number
  state: 'asking' | 'answered' | 'away'
  reply?: Reply
  at?: number
}

export interface Incident {
  id: string
  kind: 'call' | 'message'
  practice: boolean
  startedAt: number
  pauseEndsAt: number
  claimed: MemberId | 'other' | null
  callerNumber?: string
  callerShownAs?: MemberId
  callerSaved: boolean
  messageId?: string
  questionId?: string
  question: QResult | null
  money: Money | null
  method: PayMethod | null
  secret: 'yes' | 'no' | null
  tree: MemberId[]
  asks: Ask[]
  outcome: { kind: 'not-me' | 'yes-me' | 'knows-not'; by: MemberId; at: number } | null
  calling: MemberId | null
  closed: null | { how: 'hung-up' | 'done'; at: number }
}

export interface Call {
  state: 'ringing' | 'active' | 'ended' | 'missed'
  number: string
  shownAs?: MemberId
  saved: boolean
  spam?: boolean
  startedAt: number
}

export interface LogEntry {
  id: string
  at: string
  kind: 'attempt' | 'quiet' | 'practice' | 'consent' | 'setup' | 'message'
  title: string
  detail?: string
}

export interface Settings {
  pauseMinutes: number
  escalateAfterSec: number
  weeklySummary: boolean
}

export interface Away {
  label: string
  until: string
}

export interface World {
  now: number
  speed: number
  scenarioId: string | null
  profiles: Record<Exclude<MemberId, 'margaret'>, Profile>
  questions: Question[]
  order: MemberId[] // phone tree after the impersonated person
  away: Partial<Record<MemberId, Away>>
  busy: Partial<Record<MemberId, string>>
  autoReplies: { member: MemberId; afterSec: number; reply: Reply }[]
  settings: Settings
  call: Call | null
  queue: { at: number; type: 'ring' | 'spam' | 'spam-end' | 'consent-ask'; payload?: string }[]
  incident: Incident | null
  pastIncidents: Incident[]
  messages: VoiceMessage[]
  freshMessage: string | null
  quietToday: number
  log: LogEntry[]
  drill: 'none' | 'scheduled' | 'done'
  pastLoss: boolean
  disclosedTo: MemberId | null
  robNudged: boolean
  seenBy: Partial<Record<MemberId, string[]>> // dismissed banner ids
}
