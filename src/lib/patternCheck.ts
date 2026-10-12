import type { Profile } from '../data/family'

// F-D1: compares the *words* of a message with how that person talks to
// Margaret (F-B1). Pure client-side heuristics on mock transcripts. It never
// returns a verdict about who is speaking — only what matches and what doesn't.

export type Tone = 'match' | 'differs' | 'flag' | 'info'
export interface Finding {
  tone: Tone
  text: string
}
export interface CheckResult {
  summary: 'matches' | 'mixed' | 'differs' | 'no-profile'
  headline: string
  findings: Finding[]
}

const norm = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"')
const has = (text: string, phrase: string) =>
  new RegExp(`(^|[^a-z])${phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z])`).test(text)

const FLAGS: { re: RegExp; text: string }[] = [
  { re: /new number|my phone('s| is)? (broken|broke|lost|dead|smashed)|lost my phone|changed my number/, text: 'Says it’s a new number' },
  { re: /(don't|do not) (bother )?(call|ring)|old number|can't (call|ring) me/, text: 'Tells you not to ring the usual number' },
  { re: /\b(money|pay|paying|bill|bail|transfer|loan|fee|send it|\$\d|£\d)/, text: 'Asks for money' },
  { re: /\b(today|right now|urgent|asap|immediately|hurry|quick(ly)?)\b|send it now/, text: 'Wants it done fast' },
  { re: /(don't|do not) tell|keep (this|it) (between|secret|quiet)|our secret|nobody (needs to|can) know/, text: 'Asks you to keep it secret' },
  { re: /gift ?cards?|itunes|google play|steam card/, text: 'Wants gift cards — family and banks don’t ask for these' },
  { re: /bitcoin|crypto|btc/, text: 'Wants Bitcoin or crypto' },
  { re: /courier|(come|send someone) (to|round)|pick (it )?up|collect (it|the)/, text: 'Someone will come to collect it' },
]

export function checkWords(raw: string, profile: Profile, name: string): CheckResult {
  const text = norm(raw)
  const findings: Finding[] = []

  for (const f of FLAGS) if (f.re.test(text)) findings.push({ tone: 'flag', text: f.text })
  const flags = findings.length

  if (profile.consent !== 'agreed') {
    const why =
      profile.consent === 'paused'
        ? `${name} has paused their pattern, so there’s nothing to compare with.`
        : `${name} hasn’t agreed to a pattern yet, so there’s nothing to compare with.`
    findings.unshift({ tone: 'info', text: why })
    return {
      summary: 'no-profile',
      headline: flags ? `Check with ${name} before doing anything.` : `We can’t compare this with how ${name} talks.`,
      findings,
    }
  }

  let matches = 0
  let differs = 0
  const usual = profile.callsHer[0]

  for (const n of profile.neverSays) {
    if (has(text, n)) {
      findings.unshift({ tone: 'differs', text: `Calls you “${n}” — ${name} says “${usual}”` })
      differs++
    }
  }
  const used = profile.callsHer.find((n) => has(text, n))
  if (used) {
    findings.unshift({ tone: 'match', text: `Calls you “${used}”, like ${name} does` })
    matches++
  }

  const opening = text.split(/[,.!?—-]/)[0].trim()
  const greet = profile.greetings.find((g) => opening.startsWith(norm(g)) || text.startsWith(norm(g)))
  if (greet) {
    findings.unshift({ tone: 'match', text: `Starts with “${greet}”, like ${name}` })
    matches++
  } else if (/^(hello|hi|hey|good (morning|afternoon|evening)|mom|mum|ma|nan|gran)/.test(opening)) {
    const first = raw.split(/[,.!?—-]/)[0].trim()
    findings.unshift({ tone: 'differs', text: `Starts with “${first}” — ${name} starts with “${profile.greetings[0]}”` })
    differs++
  }

  const bye = profile.signoffs.find((s) => has(text, s))
  if (bye) {
    findings.push({ tone: 'match', text: `Ends with “${bye}”, like ${name}` })
    matches++
  }

  if (differs && flags) return { summary: 'differs', headline: `This isn’t how ${name} talks to you.`, findings }
  if (differs) return { summary: 'mixed', headline: `Some of this isn’t how ${name} usually talks to you.`, findings }
  if (flags) return { summary: 'mixed', headline: `It asks for something. Check with ${name} first.`, findings }
  if (matches) return { summary: 'matches', headline: `The words sound like ${name}.`, findings }
  return { summary: 'mixed', headline: `Not enough here to compare.`, findings }
}
