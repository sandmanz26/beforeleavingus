// Mock family circle. All names, numbers and banks are fictional
// (555-01xx numbers are reserved for fiction).

export type MemberId = 'margaret' | 'david' | 'emma' | 'rob'
export const VERIFIERS: MemberId[] = ['david', 'emma', 'rob']

export interface Member {
  id: MemberId
  name: string
  full: string
  age: number
  relation: string // relation to Margaret
  role: 'protected' | 'admin' | 'member' | 'backup'
  roleLabel: string
  color: string
  phone: string
}

export const MEMBERS: Record<MemberId, Member> = {
  margaret: { id: 'margaret', name: 'Margaret', full: 'Margaret Hale', age: 79, relation: 'Mum & Nan', role: 'protected', roleLabel: 'Protected', color: 'var(--plum)', phone: '(202) 555-0118' },
  david: { id: 'david', name: 'David', full: 'David Hale', age: 52, relation: 'Son', role: 'admin', roleLabel: 'Circle keeper', color: 'var(--teal)', phone: '(202) 555-0142' },
  emma: { id: 'emma', name: 'Emma', full: 'Emma Hale', age: 22, relation: 'Granddaughter', role: 'member', roleLabel: 'Member', color: 'var(--cornflower)', phone: '(202) 555-0177' },
  rob: { id: 'rob', name: 'Rob', full: 'Rob Hale', age: 48, relation: 'Son', role: 'backup', roleLabel: 'Backup', color: 'var(--umber)', phone: '(202) 555-0163' },
}

export type Consent = 'agreed' | 'waiting' | 'paused'

export interface Profile {
  member: MemberId
  callsHer: string[]
  neverSays: string[]
  greetings: string[]
  signoffs: string[]
  habits: string[]
  consent: Consent
  consentDate?: string
  updatedDaysAgo: number
  notesRead: number
}

export const PROFILES: Record<Exclude<MemberId, 'margaret'>, Profile> = {
  david: {
    member: 'david',
    callsHer: ['Mum'],
    neverSays: ['Mom', 'Mother', 'Margaret'],
    greetings: ['Hiya Mum', 'Hiya'],
    signoffs: ['Speak soon, love you', 'Love you, Mum'],
    habits: ['Asks about the garden first', 'Rings on Sunday evenings'],
    consent: 'agreed',
    consentDate: '14 Sep 2026',
    updatedDaysAgo: 28,
    notesRead: 9,
  },
  emma: {
    member: 'emma',
    callsHer: ['Nan', 'Nana'],
    neverSays: ['Grandma', 'Granny', 'Gran'],
    greetings: ['Hiya Nan', 'Nanaaa'],
    signoffs: ['Love you loads', 'Byeee'],
    habits: ['Talks fast, laughs mid-sentence', 'Mentions Biscuit the cat'],
    consent: 'agreed',
    consentDate: '14 Sep 2026',
    updatedDaysAgo: 112,
    notesRead: 14,
  },
  rob: {
    member: 'rob',
    callsHer: [],
    neverSays: [],
    greetings: [],
    signoffs: [],
    habits: [],
    consent: 'waiting',
    updatedDaysAgo: 0,
    notesRead: 0,
  },
}

export interface Question {
  id: string
  ask: string
  answer: string
  madeWith: MemberId[]
  practicedDaysAgo: number
  // “Stranger test”: could someone outside the family find this?
  offline: boolean // not on social media
  notPersonalData: boolean // not a birthday, school, pet name, street
  recognisable: boolean // Margaret knows it instantly
  warning?: string
}

export const QUESTIONS: Question[] = [
  { id: 'q-car', ask: 'What did we call the old blue car?', answer: 'Bluebell', madeWith: ['margaret', 'david', 'rob'], practicedDaysAgo: 12, offline: true, notPersonalData: true, recognisable: true },
  { id: 'q-pud', ask: 'What pudding does Nan always burn at Christmas?', answer: 'Treacle tart', madeWith: ['margaret', 'emma', 'david'], practicedDaysAgo: 34, offline: true, notPersonalData: true, recognisable: true },
  { id: 'q-pier', ask: 'Where did Grandad teach us to fish?', answer: 'Filey pier', madeWith: ['margaret', 'rob'], practicedDaysAgo: 61, offline: false, notPersonalData: true, recognisable: true, warning: 'Rob posted a photo tagged “Filey pier, fishing with Dad” in 2019.' },
]

export const BANK = { name: 'Harbour Bank', line: '(202) 555-0100', note: 'Fraud line, open 24 hours' }

export const callsHer = (id: MemberId) =>
  id === 'margaret' ? 'Margaret' : PROFILES[id].callsHer[0] ?? 'Mum'
