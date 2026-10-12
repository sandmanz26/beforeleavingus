# KinVoice: product spec for the prototype

Source: *PRD KinVoice v2 — Verifikasi Pola Bicara Keluarga Melawan Penipuan Suara AI* (draft v2, discovery).
This prototype is front-end only, with mock data. Every family member's phone runs off one shared, simulated “world” (`src/store/world.tsx`), so a tap on Emma's phone changes Margaret's screen.

## The thesis, as built
1. **Scammers copy a voice, not a relationship.** The strongest signals are what the family knows (the family question, pet names) and who is present (the person answering on their own phone). Acoustic analysis is not one of them.
2. **Older people lose to panic and isolation, not to stupidity.** The product brings the family into the moment within seconds.
3. **Success means no money moves before the check is done.** The kettle pause protects her even if every other check fails.

## Design principles
| Principle | What it means on screen |
|---|---|
| **Design for 80, panicking, shaking hands** | Margaret's body text is 21px and targets are at least 62px. There is one decision per screen, and it lives in a dock that never scrolls away. Every step has Back. |
| **Report what family said, never a verdict** | Headlines quote family members: *Emma answered: “That's not me.”* The UI never says safe, real, verified, genuine or fake, and Margaret never sees the word “scam”. `npm run copy-guard` enforces this. |
| **Only the named person's answer is final** | A relative's *“I know where Emma is”* is shown as their view. Emma keeps being asked and can override it (S-04). |
| **The pause is a promise, not a brake** | We never claim to block a payment. Margaret gets words to say: *“I'll ring you back in ten minutes.”* |
| **Rare, meaningful alerts** | The family is alerted only when someone claims to be family and asks for help. Spam is counted quietly and nothing more (P-12). |
| **Your voice, your say** | No speech pattern exists without that person's consent, built on their own phone. Voices are never kept or copied. |
| **Character when calm, clarity in a crisis** | The display face (Caprasimo) appears on calm screens. Crisis screens use only Atkinson Hyperlegible. |

### The confirmation rule (stand-in for PRD §14, which this draft does not include)
- **Final:** the impersonated person taps *“That's not me”* or *“Yes, it's me”* on their own enrolled phone.
- **Supporting, never final:** a relative's *“I know where they are”*, the family question answer, the words in a voice note, and a saved number or name on screen. A name on screen is explicitly *not* evidence (S-08).
- Even a final *“Yes, it's me”* doesn't send Margaret's money. It hands the situation to the circle keeper.

## Personas → phones
| Phone | Persona | What they do here |
|---|---|---|
| **Margaret**, 79 | Protected (B) | Uses the yellow help button, the family question, the kettle pause, the voice-note check, “Something already happened” and stories. |
| **David**, 52 | Circle keeper (A) | Gets one-tap alerts, sees the live phone tree, hands off, and manages the circle, questions, setup, log and settings. |
| **Emma**, 22 | Member (C) | Answers *“Is this you?”*, sets away status, builds her pattern with consent, and works through her voice footprint. |
| **Rob**, 48 | Backup (D) | Has a lock screen only: answers as a backup verifier and gives consent when nudged. |

## Feature registry
Every feature cites a PRD problem (P), attack stage (T) or scenario (S). In the app, open **Feature map**, or turn on **Spec tags** to see each feature where it lives.

| ID | Feature | Refs |
|---|---|---|
| F-A1 | Family alert: one tap to answer | P-13 P-12 · T-05 T-06 · S-01 S-06 |
| F-A2 | Quiet filter: spam only counted | P-12 · T-04 · S-06 |
| F-A3 | Afternoon setup checklist | P-09 P-08 · T-03 · S-03 |
| F-A4 | Away status skips you in the tree | P-10 · T-05 · S-07 |
| F-B1 | How you talk to her (names, hello, bye, never-says) | P-01 P-02 · T-03 · S-02 |
| F-B2 | Built on your own phone; voice never kept | P-03 · T-03 · S-02 |
| F-B3 | Consent: pause or delete any time | P-03 · T-03 · S-02 |
| F-B4 | Freshness nudge after 90 days | P-01 · T-03 · S-02 |
| F-C1 | “Someone's asking for help” button | P-04 P-05 P-07 · T-05 · S-01 |
| F-C2 | Family question, with the answer to listen for | P-09 P-01 · T-05 · S-03 S-08 |
| F-C3 | “Is this you?” on their own phone | P-01 P-05 P-13 · T-05 · S-01 S-04 S-08 |
| F-C4 | Kettle pause (10 minutes; can be longer, never shorter) | P-04 P-11 P-06 · T-06 · S-01 S-04 |
| F-C5 | Phone tree with 45-second escalation, and real family calls | P-10 P-13 · T-06 · S-07 |
| F-C6 | Number note (a name on screen can be copied) | P-01 · T-04 · S-08 |
| F-D1 | Voice-message word check | P-01 P-02 P-06 · T-04 · S-02 |
| F-E1 | Two-minute stories | P-08 · T-01 · S-06 |
| F-E2 | Monthly family practice | P-09 P-04 · T-05 · S-03 |
| F-E3 | Voice footprint for young members | P-03 · T-01 T-02 · S-02 |
| F-F1 | Something already happened: shame-free recovery | P-14 P-11 · T-07 · S-05 |
| F-F2 | How to talk about it (for David) | P-14 · T-07 · S-05 |

All 14 problems are covered. T-02 (voice grab) is only reduced, by F-E3, because the PRD assumes the voice has already leaked. The real breaks come at T-05 and T-06.

## Core flow: Margaret, mid-call (v2)
```
answer call ─▶ yellow button ─▶ Who? ─▶ Family question ─▶ What do they want? ─▶ Kettle pause
                    │ (pause starts)  │ (named person asked on their own phone; 45 s → next in tree)
                    ▼                 ▼
          any time: “That's not me” / “Yes, it's me” / relative's view / “David is ringing you”
```
Three taps to the pause. A family member's answer interrupts any step.

## Design system
- **Palette (kitchen enamelware):** duck egg `#DCE8E4`, enamel `#FCFDFB`, rim navy `#14233D`, pillar-box red `#C42B1C` (hang up only), yolk `#F4B740` (help and pause only). Each family member has a colour: plum, teal, cornflower, umber.
- **Type:** Caprasimo for calm display moments; Atkinson Hyperlegible Next for everything a person must read (designed by the Braille Institute for low vision); Atkinson Hyperlegible Mono for timers and numbers.
- **Signature:** the kettle on a kitchen-timer dial (F-C4).
- **Objects, not widgets:** family as postage stamps, questions as recipe cards, Rob's whole app as a lock screen, and pressable enamel slabs for buttons.
- **Icons:** a bespoke 32-grid set drawn for household objects: kettle, handset, recipe card, doorstep, footprint.

## Hypotheses (PRD §17: unvalidated)
- A pause that is only a promise still changes behaviour under pressure. Test with role-play.
- Claimed members answer within 45 seconds often enough to matter. The escalation timing is a guess.
- Older users find the yellow button mid-call. The prototype assumes an in-call overlay the OS may not allow.
- Bank partnerships could turn the promise into a hard brake (PRD §2.3).
- Word-level pattern checks catch “Mom vs Mum” style slips more often than they cry wolf. This needs real voice-note data and consent research.
