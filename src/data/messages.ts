import type { MemberId } from './family'

export interface VoiceMessage {
  id: string
  from: string // what the phone shows
  fromSaved: boolean
  claims: MemberId // who the speaker says they are
  length: string
  receivedAt: string
  transcript: string
  bars: number[] // fake waveform
}

const wave = (seed: number, n = 42) =>
  Array.from({ length: n }, (_, i) => {
    const v = Math.abs(Math.sin(i * 0.7 + seed) * 0.6 + Math.sin(i * 0.23 + seed * 2) * 0.4)
    return Math.round(18 + v * 82)
  })

export const MESSAGES: VoiceMessage[] = [
  {
    id: 'm-newnumber',
    from: '(202) 555-0134',
    fromSaved: false,
    claims: 'david',
    length: '0:20',
    receivedAt: 'Today, 10:41',
    transcript:
      'Hello Mom, it’s me, David. My phone’s broken, so this is my new number. I need help paying a bill today — can you send it now? I’ll pay you back Friday. Don’t bother calling the old number.',
    bars: wave(1.3),
  },
  {
    id: 'm-emma',
    from: 'Emma',
    fromSaved: true,
    claims: 'emma',
    length: '0:09',
    receivedAt: 'Yesterday, 19:02',
    transcript: 'Hiya Nan! Biscuit knocked your reading glasses off the table again on our video call, sorry! Love you loads, byeee.',
    bars: wave(4.1),
  },
  {
    id: 'm-rob',
    from: 'Rob',
    fromSaved: true,
    claims: 'rob',
    length: '0:11',
    receivedAt: 'Sunday, 16:30',
    transcript: 'Ma, it’s Rob. I’ll pop round Sunday with the shopping. Ring me if you need anything before then.',
    bars: wave(2.7),
  },
]
