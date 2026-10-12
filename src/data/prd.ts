// Traceability registry. PRD rule: every feature must name the problem (P-xx),
// attack stage (T-xx) or scenario (S-xx) it solves. A feature with no reference
// is not built — scripts/copy-guard.mjs checks that every feature has one.

export type Person = 'Margaret' | 'David' | 'Emma' | 'Rob'

export const PROBLEMS: Record<string, { name: string; group: string; symptom: string }> = {
  'P-01': { name: 'Ears can no longer be trusted', group: 'Perception', symptom: '“It really was his voice.”' },
  'P-02': { name: 'The phone line hides the flaws', group: 'Perception', symptom: 'Oddness excused as “he’s in shock”.' },
  'P-03': { name: 'Cloning material is everywhere', group: 'Perception', symptom: 'Young relatives don’t see their videos as raw material.' },
  'P-04': { name: 'Urgency switches off reasoning', group: 'Psychology', symptom: 'Acts within minutes without asking anyone.' },
  'P-05': { name: '“Don’t tell Mum” cuts the safety net', group: 'Psychology', symptom: 'Family finds out after the money is gone.' },
  'P-06': { name: 'Love beats suspicion', group: 'Psychology', symptom: 'Ignores warning signs she noticed herself.' },
  'P-07': { name: 'Fear of abandoning family who need help', group: 'Psychology', symptom: 'Stays on the line “just in case”.' },
  'P-08': { name: 'Doesn’t know this threat exists', group: 'Knowledge', symptom: '46% never heard of voice-clone scams.' },
  'P-09': { name: 'Family password never made, or forgotten', group: 'Knowledge', symptom: '“We talked about it” — nobody remembers it.' },
  'P-10': { name: '“Call them back” fails in practice', group: 'Knowledge', symptom: 'Goes back to the scammer after no answer.' },
  'P-11': { name: 'Payments can’t be reversed', group: 'Structural', symptom: 'Gift cards, crypto, couriers, instant transfer.' },
  'P-12': { name: 'Warning fatigue', group: 'Structural', symptom: 'Ignores every warning, including the right one.' },
  'P-13': { name: 'Family doesn’t know a crisis is happening', group: 'Structural', symptom: 'Family was reachable — nobody told them.' },
  'P-14': { name: 'Shame keeps victims silent', group: 'Afterwards', symptom: 'Report to bank delayed for weeks.' },
}

export const STAGES: Record<string, { name: string; scammer: string; weakness: string }> = {
  'T-01': { name: 'Recon', scammer: 'Finds an older target and her family online', weakness: 'Only has public information' },
  'T-02': { name: 'Voice grab', scammer: 'Downloads seconds of a grandchild’s audio', weakness: 'Short clips, not how they talk in private' },
  'T-03': { name: 'Clone', scammer: 'Builds a synthetic voice', weakness: 'Pet names and habits don’t come with it' },
  'T-04': { name: 'Contact', scammer: 'Calls from an unknown number, or “this is my new number”', weakness: 'Number doesn’t match saved contacts' },
  'T-05': { name: 'Staged crisis', scammer: 'Emergency + secrecy + time pressure', weakness: 'Doesn’t know family secrets' },
  'T-06': { name: 'Payment orders', scammer: 'Transfer, gift cards, crypto, courier', weakness: 'Can’t control other family members' },
  'T-07': { name: 'Cash-out', scammer: 'Moves the money fast', weakness: '—' },
}

export const SCENARIOS_REF: Record<string, string> = {
  'S-01': '“Nan, I’ve been arrested.”',
  'S-02': 'Voice message from a “new number”',
  'S-03': 'The forgotten password',
  'S-04': 'A true emergency (must not be blocked)',
  'S-05': 'Ashamed after being tricked',
  'S-06': 'Flood of spam calls',
  'S-07': 'The claimed person can’t answer',
  'S-08': 'The number looks right',
}

export const JOBS: Record<string, string> = {
  J1: 'Margaret: when a panicked “grandchild” calls, someone helps me check it’s them.',
  J2: 'Margaret: when I’m unsure, one button brings my family in.',
  J3: 'David: when I’m in a meeting, I hear about an attempt at once and answer in one tap.',
  J4: 'David: setting up protection takes one afternoon with the family.',
  J5: 'Emma: when someone copies my voice, I can prove it isn’t me in seconds.',
  J6: 'Margaret: if I’m tricked, I’m treated without being made to feel foolish.',
}

export interface Feature {
  id: string
  group: keyof typeof GROUPS
  name: string
  does: string
  problems: string[]
  stages: string[]
  scenarios: string[]
  jobs: string[]
  lives: Person[]
}

export const GROUPS = {
  A: 'Circle & alerts',
  B: 'Speech-pattern profile',
  C: 'In the moment',
  D: 'Message check',
  E: 'Habits & learning',
  F: 'Afterwards',
} as const

export const FEATURES: Feature[] = [
  { id: 'F-A1', group: 'A', name: 'Family alert', does: 'One rare alert to the circle, only when someone claims to be family and asks for help. Answer with one tap.', problems: ['P-13', 'P-12'], stages: ['T-05', 'T-06'], scenarios: ['S-01', 'S-06'], jobs: ['J3'], lives: ['David', 'Rob'] },
  { id: 'F-A2', group: 'A', name: 'Quiet filter', does: 'Sales and spam calls never raise an alert. They show up once, as a count.', problems: ['P-12'], stages: ['T-04'], scenarios: ['S-06'], jobs: [], lives: ['Margaret', 'David'] },
  { id: 'F-A3', group: 'A', name: 'Afternoon setup', does: 'A six-step checklist the family finishes together in one afternoon.', problems: ['P-09', 'P-08'], stages: ['T-03'], scenarios: ['S-03'], jobs: ['J4'], lives: ['David'] },
  { id: 'F-A4', group: 'A', name: 'Away status', does: 'Members say “on a flight until 6pm”, so the phone tree skips straight past them.', problems: ['P-10'], stages: ['T-05'], scenarios: ['S-07'], jobs: [], lives: ['Emma'] },

  { id: 'F-B1', group: 'B', name: 'How you talk to her', does: 'Names you call her, how you say hello and goodbye, words you’d never use.', problems: ['P-01', 'P-02'], stages: ['T-03'], scenarios: ['S-02'], jobs: ['J5'], lives: ['Emma', 'David'] },
  { id: 'F-B2', group: 'B', name: 'Build it on your own phone', does: 'Each person fills in their own pattern. Optional voice notes are read for words only; the voice itself is never kept.', problems: ['P-03'], stages: ['T-03'], scenarios: ['S-02'], jobs: ['J5'], lives: ['Emma'] },
  { id: 'F-B3', group: 'B', name: 'Your pattern, your say', does: 'Nobody’s pattern exists without their own consent. Pause or delete it any time.', problems: ['P-03'], stages: ['T-03'], scenarios: ['S-02'], jobs: ['J5'], lives: ['Emma', 'Rob', 'David'] },
  { id: 'F-B4', group: 'B', name: 'Keep it fresh', does: 'A nudge when a pattern is over 90 days old — nicknames drift.', problems: ['P-01'], stages: ['T-03'], scenarios: ['S-02'], jobs: [], lives: ['Emma', 'David'] },

  { id: 'F-C1', group: 'C', name: '“Someone’s asking for help” button', does: 'One big button, reachable during a call. Starts the pause and brings the family in.', problems: ['P-04', 'P-05', 'P-07'], stages: ['T-05'], scenarios: ['S-01'], jobs: ['J1', 'J2'], lives: ['Margaret'] },
  { id: 'F-C2', group: 'C', name: 'Family question', does: 'The app shows a question only family can answer, and what to listen for. Nobody has to remember a password.', problems: ['P-09', 'P-01'], stages: ['T-05'], scenarios: ['S-03', 'S-08'], jobs: ['J1'], lives: ['Margaret', 'David'] },
  { id: 'F-C3', group: 'C', name: '“Is this you?” on their own phone', does: 'The person being impersonated is asked directly on their own phone. Their answer reaches Margaret in seconds.', problems: ['P-01', 'P-05', 'P-13'], stages: ['T-05'], scenarios: ['S-01', 'S-04', 'S-08'], jobs: ['J1', 'J5'], lives: ['Emma', 'David', 'Rob'] },
  { id: 'F-C4', group: 'C', name: 'Kettle pause', does: 'A 10-minute pause on sending anything. It works even if every other check fails, and only ends early when family answers from their own phone.', problems: ['P-04', 'P-11', 'P-06'], stages: ['T-06'], scenarios: ['S-01', 'S-04'], jobs: ['J1'], lives: ['Margaret'] },
  { id: 'F-C5', group: 'C', name: 'Phone tree', does: 'No answer in 45 seconds? The next person is asked. Margaret sees a calm “nobody yet”, never silence.', problems: ['P-10', 'P-13'], stages: ['T-06'], scenarios: ['S-07'], jobs: ['J2'], lives: ['Margaret', 'David', 'Rob'] },
  { id: 'F-C6', group: 'C', name: 'Number note', does: 'Says whether the number is saved — and that a name on screen can be copied, so it’s never treated as proof.', problems: ['P-01'], stages: ['T-04'], scenarios: ['S-08'], jobs: [], lives: ['Margaret'] },

  { id: 'F-D1', group: 'D', name: 'Voice-message check', does: 'Compares a message’s words with how that person really talks to her: “Mom” vs “Mum”, “Hello” vs “Hiya”.', problems: ['P-01', 'P-02', 'P-06'], stages: ['T-04'], scenarios: ['S-02'], jobs: ['J1'], lives: ['Margaret', 'David'] },

  { id: 'F-E1', group: 'E', name: 'Two-minute stories', does: 'What voice copying is, told plainly. At most one a week.', problems: ['P-08'], stages: ['T-01'], scenarios: ['S-06'], jobs: [], lives: ['Margaret'] },
  { id: 'F-E2', group: 'E', name: 'Family practice', does: 'A monthly two-minute rehearsal David starts. The button and the question become habit.', problems: ['P-09', 'P-04'], stages: ['T-05'], scenarios: ['S-03'], jobs: ['J4'], lives: ['David', 'Margaret'] },
  { id: 'F-E3', group: 'E', name: 'Voice footprint', does: 'Shows young members where their voice is public, and what not to post about Nan.', problems: ['P-03'], stages: ['T-01', 'T-02'], scenarios: ['S-02'], jobs: ['J5'], lives: ['Emma'] },

  { id: 'F-F1', group: 'F', name: 'Something already happened', does: 'Shame-free recovery: what to tell the bank, word for word, and her choice of who else hears.', problems: ['P-14', 'P-11'], stages: ['T-07'], scenarios: ['S-05'], jobs: ['J6'], lives: ['Margaret'] },
  { id: 'F-F2', group: 'F', name: 'How to talk about it', does: 'For David: what to say, and what never to say, when Mum tells you.', problems: ['P-14'], stages: ['T-07'], scenarios: ['S-05'], jobs: ['J6'], lives: ['David'] },
]

export const featureById = (id: string) => FEATURES.find((f) => f.id === id)
