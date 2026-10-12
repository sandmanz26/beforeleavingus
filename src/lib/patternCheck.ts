import type { Finding, Patterns } from './types'

// Compares the WORDS of a call or voice note with how that person talks
// (PRD F-B1, F-D1), and spots the scam script (PRD §3: urgency, secrecy,
// new number, irreversible payment). Pure text heuristics.

const norm = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"')
const has = (text: string, phrase: string) =>
  new RegExp(`(^|[^a-z])${phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z])`).test(text)

const SCAM: { re: RegExp; text: string }[] = [
  { re: /new number|my phone('s| is)? (broken|broke|lost|dead|smashed)|lost my phone|changed my number/, text: 'Says it’s a new number' },
  { re: /(don't|do not) (bother )?(call|ring)|old number|can't (call|ring) me/, text: 'Tells you not to call the usual number' },
  { re: /\b(money|pay|paying|bill|bail|transfer|loan|fee|wire|send it|\$\d|£\d)/, text: 'Asks for money' },
  { re: /\b(today|right now|urgent|asap|immediately|hurry|quick(ly)?)\b|send it now/, text: 'Pushes you to act fast' },
  { re: /(don't|do not) tell|keep (this|it) (between|secret|quiet)|our secret|nobody (needs to|can) know/, text: 'Asks you to keep it secret' },
  { re: /gift ?cards?|itunes|google play|steam card/, text: 'Wants gift cards' },
  { re: /bitcoin|crypto|btc/, text: 'Wants Bitcoin or crypto' },
  { re: /courier|(come|send someone) (to|round)|pick (it )?up|collect (it|the)/, text: 'Someone will come to collect cash' },
  { re: /arrest|police|jail|lawyer|accident|hospital|crash/, text: 'An emergency story (arrest, accident, hospital)' },
]

export function scamSigns(raw: string): string[] {
  const t = norm(raw)
  return SCAM.filter((s) => s.re.test(t)).map((s) => s.text)
}

export function compareWords(raw: string, p: Patterns | undefined, name: string): { summary: 'matches' | 'mixed' | 'differs' | 'no-profile' | 'none'; findings: Finding[] } {
  const text = norm(raw).trim()
  if (!text) return { summary: 'none', findings: [] }
  if (!p || (!p.callsThem.length && !p.greetings.length)) {
    return { summary: 'no-profile', findings: [{ tone: 'info', text: `${name} hasn’t added speech patterns yet, so we can only check the voice.` }] }
  }
  const findings: Finding[] = []
  let matches = 0
  let differs = 0
  for (const n of p.neverSays) {
    if (has(text, n)) {
      findings.push({ tone: 'differs', text: `Says “${n}” — ${name} says “${p.callsThem[0] ?? '…'}”` })
      differs++
    }
  }
  const used = p.callsThem.find((n) => has(text, n))
  if (used) {
    findings.push({ tone: 'match', text: `Says “${used}”, like ${name} does` })
    matches++
  }
  const opening = text.split(/[,.!?—-]/)[0].trim()
  const greet = p.greetings.find((g) => opening.startsWith(norm(g)) || text.startsWith(norm(g)))
  if (greet) {
    findings.push({ tone: 'match', text: `Opens with “${greet}”, like ${name}` })
    matches++
  } else if (p.greetings.length && /^(hello|hi|hey|good (morning|afternoon|evening)|mom|mum|ma|nan|gran|dad)/.test(opening)) {
    findings.push({ tone: 'differs', text: `Opens with “${raw.split(/[,.!?—-]/)[0].trim()}” — ${name} usually says “${p.greetings[0]}”` })
    differs++
  }
  const bye = p.signoffs.find((s) => has(text, s))
  if (bye) {
    findings.push({ tone: 'match', text: `Ends with “${bye}”, like ${name}` })
    matches++
  }
  const phrase = p.phrases.find((s) => has(text, s))
  if (phrase) {
    findings.push({ tone: 'match', text: `Uses “${phrase}”, one of ${name}’s phrases` })
    matches++
  }
  if (!findings.length) findings.push({ tone: 'info', text: `None of ${name}’s usual words came up. That isn’t a red flag on its own.` })
  return { summary: differs ? 'differs' : matches ? 'matches' : 'mixed', findings }
}
