import { MEMBERS } from '../../data/family'
import type { Incident } from '../../store/types'

export interface Fact {
  tone: 'flag' | 'note'
  icon: string
  text: string
}

// “What we know so far” — facts, never a verdict about who is calling.
export function factsFor(inc: Incident): Fact[] {
  const out: Fact[] = []
  if (inc.callerShownAs) out.push({ tone: 'note', icon: 'handset', text: `The screen says “${MEMBERS[inc.callerShownAs].name}”. Names on a screen can be copied.` })
  else if (inc.callerNumber && !inc.callerSaved) out.push({ tone: 'note', icon: 'handset', text: 'A number you haven’t saved.' })
  if (inc.claimed === 'other') out.push({ tone: 'note', icon: 'bank', text: 'Police, courts and hospitals don’t collect money over the phone.' })
  if (inc.question === 'said') out.push({ tone: 'note', icon: 'card', text: 'They knew the family answer.' })
  if (inc.question === 'wrong') out.push({ tone: 'flag', icon: 'card', text: 'They didn’t know the family answer.' })
  if (inc.question === 'dodged') out.push({ tone: 'flag', icon: 'card', text: 'They avoided the family question.' })
  if (inc.money === 'yes') out.push({ tone: 'flag', icon: 'coin', text: 'They want money.' })
  if (inc.method === 'gift') out.push({ tone: 'flag', icon: 'gift', text: 'Gift cards. Family and banks never ask for these.' })
  if (inc.method === 'crypto') out.push({ tone: 'flag', icon: 'coin', text: 'Bitcoin. Family and banks never ask for this.' })
  if (inc.method === 'cash') out.push({ tone: 'flag', icon: 'door', text: 'A stranger collecting cash at your door.' })
  if (inc.method === 'transfer') out.push({ tone: 'flag', icon: 'transfer', text: 'A bank transfer. Once sent, it’s very hard to get back.' })
  if (inc.secret === 'yes') out.push({ tone: 'flag', icon: 'hush', text: 'They asked you to keep it secret.' })
  return out
}
