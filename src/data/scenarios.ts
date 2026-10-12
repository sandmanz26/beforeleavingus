import type { MemberId } from './family'
import type { Reply } from '../store/types'

export interface CallSetup {
  number: string
  shownAs?: MemberId // caller ID shows a saved family name (spoofed)
  claims: MemberId | 'other'
  ringAfterSec: number
}

export interface Scenario {
  id: string
  title: string
  line: string
  refs: string[]
  call?: CallSetup
  freshMessage?: string
  away?: { member: MemberId; label: string; until: string }
  // Members who won't pick up (in class, in a meeting). Their phone shows face-down.
  busy?: { member: MemberId; label: string }[]
  autoReplies?: { member: MemberId; afterSec: number; reply: Reply }[]
  spamCalls?: number
  pastLoss?: boolean
  steps: { who: MemberId | 'any'; text: string }[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'S-01',
    title: '“Nan, I’ve been arrested.”',
    line: 'Tuesday, 11:00. Unknown number. “Emma” is crying: she crashed a car, needs $8,000 bail, a courier will collect it. “Don’t tell Mum.” Emma is in a lecture.',
    refs: ['P-01', 'P-04', 'P-05', 'P-10', 'P-11', 'T-04', 'T-05', 'T-06'],
    call: { number: '(202) 555-0199', claims: 'emma', ringAfterSec: 2 },
    busy: [{ member: 'emma', label: 'In a lecture' }],
    steps: [
      { who: 'margaret', text: 'Answer the call, then tap the yellow “Asking for help?” tab.' },
      { who: 'margaret', text: 'Pick Emma. Work through one question per screen.' },
      { who: 'emma', text: 'Emma is in a lecture — leave her phone alone. After 45 seconds the tree moves on.' },
      { who: 'david', text: 'Answer from David’s phone: “I know where Emma is”.' },
    ],
  },
  {
    id: 'S-02',
    title: 'The “new number” voice note',
    line: 'A 20-second voice note in David’s voice: phone broken, new number, needs a bill paid. David has never called her “Mom” or opened with “Hello”.',
    refs: ['P-01', 'P-06', 'T-03', 'T-04'],
    freshMessage: 'm-newnumber',
    steps: [
      { who: 'margaret', text: 'Tap “Check a voice message”, then the new one at the top.' },
      { who: 'margaret', text: 'Read what doesn’t match, then ask David on his own phone.' },
      { who: 'david', text: 'Answer: “No, I didn’t send it.”' },
    ],
  },
  {
    id: 'S-03',
    title: 'The forgotten password',
    line: 'The family agreed a password a year ago. Margaret forgot it existed. A caller says he’s David.',
    refs: ['P-09', 'T-05'],
    call: { number: '(202) 555-0121', claims: 'david', ringAfterSec: 2 },
    steps: [
      { who: 'margaret', text: 'Answer, open the help tab, pick David.' },
      { who: 'margaret', text: 'Notice: she never needs to remember anything. The app shows the question and the answer to listen for.' },
      { who: 'david', text: 'On David’s phone, answer “That’s not me.”' },
    ],
  },
  {
    id: 'S-04',
    title: 'A true emergency',
    line: 'Emma did crash, and calls from a friend’s phone, hoarse. The product must speed this up — never block it.',
    refs: ['P-07', 'T-05'],
    call: { number: '(202) 555-0156', claims: 'emma', ringAfterSec: 2 },
    steps: [
      { who: 'margaret', text: 'Answer, open the help tab, pick Emma.' },
      { who: 'emma', text: 'On Emma’s phone, tap “Yes, it’s me”.' },
      { who: 'any', text: 'Watch the pause end and David get told to help — no money from Margaret.' },
    ],
  },
  {
    id: 'S-05',
    title: 'Ashamed, three weeks later',
    line: 'Margaret lost $3,000 in gift cards and has told no one, afraid her sons will take over her money.',
    refs: ['P-14', 'T-07'],
    pastLoss: true,
    steps: [
      { who: 'margaret', text: 'Tap “Something already happened” at the bottom of Margaret’s home.' },
      { who: 'margaret', text: 'Notice: telling family is her choice, and “keep it to myself” is a proper option.' },
      { who: 'david', text: 'On David’s Home, open “If Mum tells you something happened”.' },
    ],
  },
  {
    id: 'S-06',
    title: 'Five spam calls a day',
    line: 'Sales calls and robocalls all morning. Margaret has learned to ignore every warning — including the ones that matter.',
    refs: ['P-12'],
    spamCalls: 5,
    steps: [
      { who: 'margaret', text: 'Watch the calls ring and stop. KinVoice says nothing.' },
      { who: 'margaret', text: 'Afterwards: one quiet line on Margaret’s home. No alarms.' },
      { who: 'david', text: 'David sees only a count in his Log.' },
    ],
  },
  {
    id: 'S-07',
    title: 'Emma is on a plane',
    line: 'Someone claiming to be Emma calls while she’s flying to Lisbon. David is in a meeting.',
    refs: ['P-10', 'P-13', 'T-06'],
    call: { number: '(202) 555-0187', claims: 'emma', ringAfterSec: 2 },
    away: { member: 'emma', label: 'On a flight', until: '18:00' },
    busy: [{ member: 'david', label: 'In a meeting' }],
    steps: [
      { who: 'margaret', text: 'Answer, open the help tab, pick Emma.' },
      { who: 'any', text: 'Emma marked herself away, so she’s skipped at once. David doesn’t answer.' },
      { who: 'rob', text: 'On Rob’s phone: “It isn’t Emma — I know where she is.”' },
    ],
  },
  {
    id: 'S-08',
    title: 'The number looks right',
    line: 'Caller ID says “Emma” — the scammer copied her number. Margaret feels reassured because the name matches.',
    refs: ['P-01', 'T-04'],
    call: { number: '(202) 555-0177', shownAs: 'emma', claims: 'emma', ringAfterSec: 2 },
    steps: [
      { who: 'margaret', text: 'Read the note under the caller’s name before answering.' },
      { who: 'margaret', text: 'Answer, open the help tab, pick Emma.' },
      { who: 'emma', text: 'On Emma’s phone: “That’s not me.”' },
    ],
  },
]
