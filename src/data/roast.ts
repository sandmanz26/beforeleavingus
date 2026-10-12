// The v1 design review, as data — rendered in the stage's “Design review”
// panel and mirrored in docs/ROAST.md. Images are v1 screenshots.

export interface RoastItem {
  n: number
  sev: 'Critical' | 'High' | 'Medium' | 'Low'
  title: string
  burn: string
  fix: string
  refs: string
  img?: string
}

export const ROAST: RoastItem[] = [
  {
    n: 1, sev: 'Critical', title: 'The pause lies.', img: 'v1-who.jpg', refs: 'F-C4 · PRD §1',
    burn: '“Nothing can be sent for ten minutes.” KinVoice can’t touch her bank, a gift-card till or a courier at the door. Telling an 80-year-old the app is blocking payments is exactly the false reassurance the PRD forbids — she may start the transfer because “the app will stop it”.',
    fix: 'The pause is her promise, not our brake. Copy says “Don’t send anything for ten minutes” and hands her the words to say: “I’ll ring you back in ten minutes.” A hard bank-side brake is listed as a partnership hypothesis, not shipped copy.',
  },
  {
    n: 2, sev: 'Critical', title: 'Five taps before the kettle.', img: 'v1-question.jpg', refs: 'F-C1 · P-04',
    burn: 'Who → question → money → method → secret → pause, with a sobbing “grandchild” on the line. Money and method were two screens for one decision. Nearly every scammer demands secrecy, so asking about it collected nothing.',
    fix: 'Who → family question → “What are they asking for?” (one screen) → pause. Secrecy becomes a standing line on the pause screen: “Whatever they said, you’re allowed to tell family.”',
  },
  {
    n: 3, sev: 'Critical', title: 'The most important button is below the fold.', img: 'v1-pause.jpg', refs: 'PRD §1 · one decision per screen',
    burn: 'Hang up sat under a dial, a headline, a callout, a family list and a facts list. “They avoided it” needed a scroll. Someone who doesn’t know there is more will never scroll to find it.',
    fix: 'An action dock pinned to the bottom of every crisis screen. Content scrolls behind it; the decision never does.',
  },
  {
    n: 4, sev: 'High', title: 'Three bars of chrome before the first word.', img: 'v1-question.jpg', refs: 'F-C3 · F-C5',
    burn: 'Call bar + yellow pause bar + “Your family” box ate ~190px before “Ask them this”. A status was sitting on top of the task.',
    fix: 'One header: kettle timer and the live family line (“Asking Emma · 0:12”) together. The full family list appears only on the pause screen.',
  },
  {
    n: 5, sev: 'High', title: 'No way back.', img: 'v1-who.jpg', refs: 'F-C1 · F-C3',
    burn: 'A shaky thumb taps Rob instead of Emma: Rob gets pinged, Emma never does, and there is no undo. Trembling hands are in the persona.',
    fix: 'Every step has Back. Changing who withdraws the wrong person’s request and asks the right one.',
  },
  {
    n: 6, sev: 'High', title: 'A second-hand “no” was treated as gospel.', img: 'v1-outcome.jpg', refs: 'S-04 · F-C3',
    burn: 'David’s “I know where Emma is” produced the same screen as Emma’s own denial. If David is wrong — S-04, Emma really did crash — Margaret hangs up on a true emergency.',
    fix: 'Only the named person’s own answer is final. A relative’s answer reads “David thinks this isn’t Emma”, Emma keeps being asked, and a later “Yes, it’s me” from Emma overrides it.',
  },
  {
    n: 7, sev: 'High', title: 'We promised David would help. Nobody told David.', refs: 'S-04 · F-A1',
    burn: 'After Emma’s “Yes, it’s me”, Margaret read “David is sorting out what Emma needs” — while David’s phone still showed a stale question card.',
    fix: 'Emma’s yes turns David’s card into a hand-off: “Emma says she needs help — ring Emma”, with what the caller asked for.',
  },
  {
    n: 8, sev: 'High', title: '“I’ll ring Mum now” rang nobody.', refs: 'P-10 · F-C5',
    burn: 'The family list said “Is ringing you now” and nothing rang. Worse, Margaret’s “Ring David” button quietly recorded David as having replied.',
    fix: 'Calls are real in the simulation. David’s tap rings Margaret (“David is ringing — hang up and answer”); Margaret’s “Hang up and ring David” rings David. Calling back on the saved number is one tap.',
  },
  {
    n: 9, sev: 'Medium', title: 'Two yellow buttons, one job.', img: 'v1-incall.jpg', refs: 'F-C1',
    burn: 'On a call, home showed the big yellow button and a sticky yellow tab covering the tiles. Same action, twice, fighting.',
    fix: 'On home, the big button is the tab. The floating tab appears only on other screens.',
  },
  {
    n: 10, sev: 'Medium', title: 'Stamps you can’t stamp.', refs: 'P-10',
    burn: 'The family stamps on Margaret’s home looked tappable and did nothing. She will tap them.',
    fix: 'Tap a face to ring that person on their saved number — practising the call-back habit every day.',
  },
  {
    n: 11, sev: 'Medium', title: 'Yellow means five things.', img: 'v1-pause.jpg', refs: 'P-12',
    burn: 'The help button, the pause, “waiting”, warning facts and spec tags were all yolk. When everything is yellow, nothing is.',
    fix: 'Yellow belongs to the help-and-pause system only. Warning facts get a red mark; spec tags become plain white luggage tags.',
  },
  {
    n: 12, sev: 'Medium', title: 'The voice check makes her work for the answer.', img: 'v1-voice.jpg', refs: 'F-D1',
    burn: 'Two taps and a long scroll before “Ask David”. The verdict-free headline was buried under the transcript.',
    fix: 'The comparison runs on open. Headline first, transcript folded away, the action docked.',
  },
  {
    n: 13, sev: 'Medium', title: 'The banner sits on the card it announces.', img: 'v1-banner.jpg', refs: 'F-A1',
    burn: 'David’s notification banner covered the top of the request it was telling him about, and never went away.',
    fix: 'The banner pushes content down instead of covering it, and folds away after a few seconds.',
  },
  {
    n: 14, sev: 'Low', title: '“Well done, Margaret” is how you talk to a child.', img: 'v1-closing.jpg', refs: 'J6 · P-14',
    burn: 'Praise like a gold star undermines the persona’s biggest fear — being treated as no longer capable.',
    fix: '“You checked first. That’s what the family hoped you’d do.” Respect, not applause.',
  },
  {
    n: 15, sev: 'Low', title: 'The kettle in the header reads as a house.', img: 'v1-question.jpg', refs: 'F-C4',
    burn: 'At 26px the kettle icon became a little house with a chimney — the signature, unreadable.',
    fix: 'Redrawn with an arched handle and a spout that reads at any size.',
  },
  {
    n: 16, sev: 'Low', title: 'The demo didn’t fit a laptop.', img: 'v1-stage.jpg', refs: 'Prototype',
    burn: 'At 1440px the phones overlapped the stories and Emma’s phone was clipped. Phones didn’t reset between stories. On mobile the top bar took two lines.',
    fix: 'Stories fold into a drawer below 1600px, phones size to the window, each story remounts every phone, and the mobile bar is one line.',
  },
]

export const KEEP = [
  'Family members as postage stamps — instantly “family”, not “users”.',
  'Outcome headlines are quotes from family, not system verdicts: “Emma answered: That’s not me.”',
  'The family question as a recipe card, with the answer to listen for. Nobody memorises a password.',
  'The kettle dial as the pause — the one memorable thing.',
  'Copy guard in the build: verdict words can’t ship.',
  'No pattern exists without the person’s own consent, built on their own phone.',
]

export const STILL = [
  'The pause is still only a promise. A hard brake needs bank partnerships (PRD §2.3) — a hypothesis to test, not a feature.',
  'If Emma’s phone is gone (lost, smashed), only the family question can carry S-04. We need research on how often that happens.',
  'Everything here is untested with real 80-year-olds. PRD §17 assumptions remain hypotheses until a moderated study with 5–8 Margarets.',
  'No text-size control yet — we rely on 21px base type and the phone’s own settings.',
]
