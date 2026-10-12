import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { PROFILES, QUESTIONS, type Consent, type MemberId, type Profile, type Question } from '../data/family'
import { MESSAGES } from '../data/messages'
import { SCENARIOS } from '../data/scenarios'
import type { Away, Incident, LogEntry, PayMethod, QResult, Reply, Settings, World } from './types'

// Simulated clock starts Tuesday 13 Oct 2026, 10:58:40 — S-01 happens “Tuesday, 11:00”.
const START = new Date(2026, 9, 13, 10, 58, 40).getTime()
const SPAM_NUMBERS = ['(202) 555-0190', '(800) 555-0131', '(202) 555-0108', '(888) 555-0172', '(202) 555-0115']

const BASE_LOG: LogEntry[] = [
  { id: 'l1', at: 'Mon 12 Oct', kind: 'quiet', title: '4 calls screened quietly', detail: 'Sales and robocalls. Mum wasn’t interrupted.' },
  { id: 'l2', at: 'Sun 11 Oct', kind: 'practice', title: 'Practice run with Mum', detail: 'She found the help tab in 4 seconds and used the car question.' },
  { id: 'l3', at: 'Fri 18 Sep', kind: 'message', title: 'Voice note checked: “Emma”', detail: 'Words matched how Emma talks to Nan. Nothing asked for money.' },
  { id: 'l4', at: 'Mon 14 Sep', kind: 'consent', title: 'Emma and David agreed to pattern profiles', detail: 'Built on their own phones. Voices not kept.' },
  { id: 'l5', at: 'Mon 14 Sep', kind: 'setup', title: 'Circle set up at Mum’s kitchen table', detail: '3 family questions written together. 52 minutes.' },
]

export function baseWorld(speed = 10, session = 0): World {
  return {
    session,
    now: START,
    speed,
    scenarioId: null,
    profiles: structuredClone(PROFILES),
    questions: structuredClone(QUESTIONS),
    order: ['david', 'emma', 'rob'],
    away: {},
    busy: {},
    autoReplies: [],
    settings: { pauseMinutes: 10, escalateAfterSec: 45, weeklySummary: true },
    call: null,
    familyCall: null,
    queue: [],
    incident: null,
    pastIncidents: [],
    messages: structuredClone(MESSAGES),
    freshMessage: null,
    quietToday: 3,
    log: BASE_LOG,
    drill: 'none',
    pastLoss: false,
    disclosedTo: null,
    robNudged: false,
    seenBy: {},
  }
}

export type Action =
  | { type: 'tick'; dt: number }
  | { type: 'speed'; speed: number }
  | { type: 'load'; id: string | null }
  | { type: 'call-answer' }
  | { type: 'call-decline' }
  | { type: 'help' }
  | { type: 'claim'; who: MemberId | 'other' }
  | { type: 'question'; result: QResult }
  | { type: 'want'; v: PayMethod | 'none' }
  | { type: 'back' }
  | { type: 'reply'; member: MemberId; reply: Reply }
  | { type: 'close'; how: 'hung-up' | 'done' }
  | { type: 'clear-incident' }
  | { type: 'message-ask'; messageId: string }
  | { type: 'message-open'; id: string }
  | { type: 'practice-start' }
  | { type: 'drill-schedule' }
  | { type: 'away'; member: MemberId; away: Away | null }
  | { type: 'profile'; member: Exclude<MemberId, 'margaret'>; patch: Partial<Profile> }
  | { type: 'consent'; member: Exclude<MemberId, 'margaret'>; consent: Consent }
  | { type: 'question-add'; q: Question }
  | { type: 'question-remove'; id: string }
  | { type: 'order'; order: MemberId[] }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'nudge-rob' }
  | { type: 'pick-up'; member: MemberId }
  | { type: 'seen'; member: MemberId; id: string }
  | { type: 'disclose'; member: MemberId | null }
  | { type: 'ring'; from: MemberId; to: MemberId }
  | { type: 'ring-answer' }
  | { type: 'ring-end' }
  | { type: 'hangup-ring'; to: MemberId }

let uid = 0
const nextId = (p: string) => `${p}-${Date.now().toString(36)}-${uid++}`

export const elapsed = (from: number, to: number) => {
  const s = Math.max(0, Math.round((to - from) / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function pickQuestion(qs: Question[], claimed: MemberId | 'other' | null) {
  const passes = (q: Question) => q.offline && q.notPersonalData && q.recognisable
  return (
    qs.find((q) => claimed && claimed !== 'other' && q.madeWith.includes(claimed) && passes(q)) ??
    qs.find(passes) ??
    qs[0]
  )
}

function askNext(w: World, inc: Incident) {
  for (const m of inc.tree) {
    if (inc.asks.some((a) => a.member === m)) continue
    if (w.away[m]) {
      inc.asks.push({ member: m, sentAt: w.now, state: 'away' })
      continue
    }
    inc.asks.push({ member: m, sentAt: w.now, state: 'asking' })
    return
  }
}

function applyReply(w: World, member: MemberId, reply: Reply) {
  const inc = w.incident
  if (!inc || inc.closed) return
  let ask = inc.asks.find((a) => a.member === member)
  if (!ask) {
    ask = { member, sentAt: w.now, state: 'answered' }
    inc.asks.push(ask)
  }
  ask.state = 'answered'
  ask.reply = reply
  ask.at = w.now
  if (inc.outcome) return
  if (member === inc.claimed && (reply === 'not-me' || reply === 'yes-me')) {
    // The named person's own answer is the only final one. It overrides a relative's view.
    inc.outcome = { kind: reply, by: member, at: w.now }
    if (reply === 'yes-me') inc.pauseEndsAt = w.now
  } else if (reply === 'knows-not') {
    inc.secondhand ??= { by: member, at: w.now }
  } else if (reply === 'calling') {
    inc.calling = member
    ring(w, member, 'margaret')
  } else if (reply === 'unsure') {
    askNext(w, inc)
  }
}

function ring(w: World, from: MemberId, to: MemberId) {
  if (w.familyCall && w.familyCall.state !== 'missed') return
  w.familyCall = { from, to, state: 'ringing', startedAt: w.now }
}

function closeIncident(w: World, how: 'hung-up' | 'done') {
  const inc = w.incident
  if (!inc || inc.closed) return
  inc.closed = { how, at: w.now }
  if (w.call && (w.call.state === 'active' || w.call.state === 'ringing')) w.call = null
  w.log = [logFor(w, inc), ...w.log]
  if (inc.practice) {
    w.drill = 'done'
    const q = w.questions.find((x) => x.id === inc.questionId)
    if (q) q.practicedDaysAgo = 0
  }
}

function newIncident(w: World, kind: Incident['kind'], extra: Partial<Incident> = {}): Incident {
  return {
    id: nextId('inc'),
    kind,
    practice: false,
    startedAt: w.now,
    pauseEndsAt: w.now + w.settings.pauseMinutes * 60_000,
    claimed: null,
    callerSaved: false,
    question: null,
    money: null,
    method: null,
    secret: null,
    tree: [],
    asks: [],
    outcome: null,
    secondhand: null,
    calling: null,
    closed: null,
    ...extra,
  }
}

function buildTree(w: World, claimed: MemberId | 'other') {
  return claimed === 'other' || claimed === 'margaret'
    ? [...w.order]
    : [claimed, ...w.order.filter((m) => m !== claimed)]
}

function clock(now: number) {
  return new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function logFor(w: World, inc: Incident): LogEntry {
  const who = inc.claimed && inc.claimed !== 'other' ? cap(inc.claimed) : 'an official'
  const how =
    inc.outcome?.kind === 'not-me' ? `${cap(inc.outcome.by)} answered “That’s not me”.`
    : inc.outcome?.kind === 'yes-me' ? `${cap(inc.outcome.by)} answered “Yes, it’s me” from their own phone.`
    : inc.secondhand ? `${cap(inc.secondhand.by)} answered “I know where ${who} is”.`
    : 'Nobody in the family had answered yet.'
  const ended = inc.closed?.how === 'hung-up' ? ` Mum hung up after ${elapsed(inc.startedAt, w.now)}.` : ''
  if (inc.practice) return { id: inc.id, at: `Today ${clock(w.now)}`, kind: 'practice', title: 'Practice run with Mum', detail: `Finished in ${elapsed(inc.startedAt, w.now)}. Question practised.` }
  if (inc.kind === 'message') return { id: inc.id, at: `Today ${clock(w.now)}`, kind: 'message', title: `Voice note claiming to be ${who}`, detail: how }
  const money = inc.money === 'yes' ? ` Asked for money${inc.method ? ` by ${METHOD_WORD[inc.method]}` : ''}. Nothing sent.` : ''
  return { id: inc.id, at: `Today ${clock(w.now)}`, kind: 'attempt', title: `Call claiming to be ${who}`, detail: `${how}${money}${ended}` }
}

export const METHOD_WORD: Record<PayMethod, string> = {
  gift: 'gift cards',
  transfer: 'bank transfer',
  cash: 'cash collected at the door',
  crypto: 'Bitcoin / crypto',
  other: 'another way',
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

function reducer(state: World, action: Action): World {
  const w: World = structuredClone(state)
  switch (action.type) {
    case 'tick': {
      w.now += action.dt * w.speed
      // scheduled events
      const due = w.queue.filter((q) => q.at <= w.now)
      w.queue = w.queue.filter((q) => q.at > w.now)
      for (const ev of due) {
        const sc = SCENARIOS.find((s) => s.id === w.scenarioId)
        if (ev.type === 'ring' && sc?.call) {
          w.call = { state: 'ringing', number: sc.call.number, shownAs: sc.call.shownAs, saved: !!sc.call.shownAs, startedAt: w.now }
        }
        if (ev.type === 'spam') {
          w.call = { state: 'ringing', number: ev.payload ?? 'Unknown', saved: false, spam: true, startedAt: w.now }
        }
        if (ev.type === 'spam-end' && w.call?.spam) {
          w.call = null
          w.quietToday += 1
        }
      }
      const inc = w.incident
      if (inc && !inc.closed && !inc.outcome && inc.claimed) {
        // phone tree: no answer in N seconds → ask the next person.
        // Stops once a relative has answered; the named person is still asked.
        const lastSent = Math.max(...inc.asks.map((a) => a.sentAt))
        const pending = inc.asks.some((a) => a.state === 'asking')
        if (!inc.secondhand && (!pending || w.now - lastSent >= w.settings.escalateAfterSec * 1000)) {
          if (inc.asks.length < inc.tree.length) askNext(w, inc)
        }
        for (const a of inc.asks) {
          if (a.state !== 'asking') continue
          const rule = inc.practice
            ? a.member === inc.claimed ? { afterSec: 20, reply: 'not-me' as Reply } : undefined
            : w.autoReplies.find((r) => r.member === a.member)
          if (rule && w.now - a.sentAt >= rule.afterSec * 1000) applyReply(w, a.member, rule.reply)
        }
      }
      // family calls: an unanswered ring gives up after 25 s; a face-down phone never answers
      const fc = w.familyCall
      if (fc?.state === 'ringing' && w.now - fc.startedAt > 25_000) fc.state = 'missed'
      if (fc?.state === 'active' && w.now - fc.startedAt > 90_000) w.familyCall = null
      return w
    }
    case 'speed':
      w.speed = action.speed
      return w
    case 'load': {
      const fresh = baseWorld(state.speed, state.session + 1)
      const sc = SCENARIOS.find((s) => s.id === action.id)
      fresh.scenarioId = action.id
      if (!sc) return fresh
      const sec = (n: number) => n * 1000 * fresh.speed
      if (sc.call) fresh.queue.push({ at: fresh.now + sec(sc.call.ringAfterSec), type: 'ring' })
      if (sc.freshMessage) {
        fresh.freshMessage = sc.freshMessage
      }
      if (sc.away) fresh.away[sc.away.member] = { label: sc.away.label, until: sc.away.until }
      for (const b of sc.busy ?? []) fresh.busy[b.member] = b.label
      fresh.autoReplies = sc.autoReplies ?? []
      if (sc.spamCalls) {
        for (let i = 0; i < sc.spamCalls; i++) {
          const t = fresh.now + sec(1.5 + i * 4)
          fresh.queue.push({ at: t, type: 'spam', payload: SPAM_NUMBERS[i % SPAM_NUMBERS.length] })
          fresh.queue.push({ at: t + sec(2.6), type: 'spam-end' })
        }
      }
      fresh.pastLoss = !!sc.pastLoss
      return fresh
    }
    case 'call-answer':
      if (w.call) w.call.state = 'active'
      return w
    case 'call-decline':
      w.call = null
      return w
    case 'help': {
      if (w.incident && !w.incident.closed && w.incident.kind === 'call') return w
      if (w.incident) w.pastIncidents.unshift(w.incident)
      const c = w.call && w.call.state === 'active' ? w.call : null
      w.incident = newIncident(w, 'call', {
        callerNumber: c?.number,
        callerShownAs: c?.shownAs,
        callerSaved: !!c?.saved,
      })
      return w
    }
    case 'practice-start': {
      w.incident = newIncident(w, 'call', { practice: true })
      return w
    }
    case 'claim': {
      const inc = w.incident
      if (!inc) return w
      inc.claimed = action.who
      inc.tree = buildTree(w, action.who)
      inc.questionId = pickQuestion(w.questions, action.who)?.id
      if (action.who === 'other') inc.question = 'skipped'
      askNext(w, inc)
      return w
    }
    case 'question':
      if (w.incident) w.incident.question = action.result
      return w
    case 'want': {
      const inc = w.incident
      if (!inc) return w
      inc.money = action.v === 'none' ? 'notyet' : 'yes'
      inc.method = action.v === 'none' ? null : action.v
      return w
    }
    case 'back': {
      // Undo the last answer. Going back past “who” withdraws every request
      // that was sent, so a mis-tap never leaves the wrong person pinged.
      const inc = w.incident
      if (!inc || inc.closed || inc.outcome) return w
      if (inc.money !== null) {
        inc.money = null
        inc.method = null
      } else if (inc.question !== null && inc.question !== 'skipped') {
        inc.question = null
      } else if (inc.claimed) {
        inc.claimed = null
        inc.tree = []
        inc.asks = []
        inc.question = null
        inc.questionId = undefined
        inc.secondhand = null
      }
      return w
    }
    case 'reply':
      applyReply(w, action.member, action.reply)
      return w
    case 'pick-up':
      delete w.busy[action.member]
      return w
    case 'close':
      closeIncident(w, action.how)
      return w
    case 'hangup-ring':
      closeIncident(w, 'hung-up')
      w.call = null
      if (w.familyCall?.state === 'missed') w.familyCall = null
      ring(w, 'margaret', action.to)
      return w
    case 'ring':
      if (w.familyCall?.state === 'missed') w.familyCall = null
      ring(w, action.from, action.to)
      return w
    case 'ring-answer': {
      const fc = w.familyCall
      if (!fc || fc.state !== 'ringing') return w
      // Margaret answering family while a stranger is on the line: hang up on the stranger.
      if (fc.to === 'margaret' && w.call) {
        closeIncident(w, 'hung-up')
        w.call = null
      }
      fc.state = 'active'
      fc.startedAt = w.now
      return w
    }
    case 'ring-end':
      w.familyCall = null
      return w
    case 'clear-incident':
      if (w.incident) {
        if (!w.incident.closed) {
          w.incident.closed = { how: 'done', at: w.now }
          w.log = [logFor(w, w.incident), ...w.log]
        }
        w.pastIncidents.unshift(w.incident)
        w.incident = null
      }
      return w
    case 'message-ask': {
      if (w.incident && !w.incident.closed) return w
      const msg = w.messages.find((m) => m.id === action.messageId)
      if (!msg) return w
      const inc = newIncident(w, 'message', { messageId: msg.id, claimed: msg.claims, callerNumber: msg.from, callerSaved: msg.fromSaved })
      inc.tree = buildTree(w, msg.claims)
      w.incident = inc
      askNext(w, inc)
      return w
    }
    case 'message-open':
      if (w.freshMessage === action.id) w.freshMessage = null
      return w
    case 'drill-schedule':
      w.drill = 'scheduled'
      return w
    case 'away':
      if (action.away) w.away[action.member] = action.away
      else delete w.away[action.member]
      return w
    case 'profile':
      w.profiles[action.member] = { ...w.profiles[action.member], ...action.patch }
      return w
    case 'consent': {
      const p = w.profiles[action.member]
      p.consent = action.consent
      if (action.consent === 'agreed') p.consentDate = 'Today'
      const name = cap(action.member)
      const title =
        action.consent === 'agreed' ? `${name} agreed to a pattern profile`
        : action.consent === 'paused' ? `${name} paused their pattern profile`
        : `${name} deleted their pattern profile`
      w.log = [{ id: nextId('log'), at: `Today ${clock(w.now)}`, kind: 'consent', title, detail: 'Their choice, made on their own phone.' }, ...w.log]
      return w
    }
    case 'question-add':
      w.questions.push(action.q)
      return w
    case 'question-remove':
      w.questions = w.questions.filter((q) => q.id !== action.id)
      return w
    case 'order':
      w.order = action.order
      return w
    case 'settings':
      w.settings = { ...w.settings, ...action.patch }
      return w
    case 'nudge-rob':
      w.robNudged = true
      return w
    case 'disclose':
      w.disclosedTo = action.member
      if (action.member) {
        w.log = [{ id: nextId('log'), at: `Today ${clock(w.now)}`, kind: 'attempt', title: `Mum chose to tell ${cap(action.member)} about money she lost`, detail: 'She asked for help. Read “How to talk about it” before you ring.' }, ...w.log]
      }
      return w
    case 'seen':
      w.seenBy[action.member] = [...(w.seenBy[action.member] ?? []), action.id]
      return w
  }
}

const Ctx = createContext<{ w: World; dispatch: Dispatch<Action> } | null>(null)

export function WorldProvider({ children }: { children: ReactNode }) {
  const [w, dispatch] = useReducer(reducer, undefined, () => baseWorld())
  useEffect(() => {
    let last = performance.now()
    const t = setInterval(() => {
      const n = performance.now()
      dispatch({ type: 'tick', dt: n - last })
      last = n
    }, 250)
    return () => clearInterval(t)
  }, [])
  return <Ctx.Provider value={{ w, dispatch }}>{children}</Ctx.Provider>
}

export function useWorld() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useWorld outside WorldProvider')
  return c
}

// What Margaret is called by each person — read from their live profile.
export function nameFor(w: World, by: MemberId) {
  if (by === 'margaret') return 'Margaret'
  return w.profiles[by].callsHer[0] ?? (by === 'emma' ? 'Nan' : 'Mum')
}

export const activeIncident = (w: World) => (w.incident && !w.incident.closed ? w.incident : null)
