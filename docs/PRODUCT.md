# KinVoice web: product spec

**Problem (from the PRD).** Scammers can clone a voice from a few seconds of public audio. Older people then get panicked calls or voice notes that sound exactly like a child or grandchild, and send money that can't be recovered.

**Product.** A website now, native apps next. People register, teach KinVoice their voice and speech patterns, bring their family in, and check any suspicious voice.

**PRD as knowledge.** The PRD shapes what the product checks and how it speaks:
- **Scammers copy a voice, not a relationship.** Words and family are the strongest signals.
- **Never give false reassurance.** No “real”, “safe” or “verified”.
- **Every path ends with the family**, on a number you already know.

## Users
- **Account holder** (often the adult child, 40–60). Sets up the circle and checks clips.
- **Family members** (the people likely to be impersonated, often children and grandchildren). Each records their own voice, with their own consent.
- **The person who gets the call** (often a parent or grandparent). Uses Check a voice, the pause and Help.

## Features and PRD links
| Feature | Where | PRD |
|---|---|---|
| Register / sign in (mock) | `/signup`, `/signin` | — |
| Voice enrolment: 5 prompts, mic or upload, quality checks | `/setup` | F-B2, T-03 |
| Speech patterns: what you call family, greetings, sign-offs, never-says, phrases | `/setup`, My voice, Member page | F-B1, P-01, S-02 |
| Consent first, analysed on-device, pause or delete | Setup, My voice, Member page | F-B3, PRD §1 |
| Freshness nudge after 90 days | My voice | F-B4 |
| Check a voice: record, upload or sample; claimed person; words | `/app/check` | F-D1, P-01, P-02, S-02 |
| Verdict + evidence: voice match, words, AI clues, scam script | `/app/check/:id` | F-D1, P-04, P-05, P-11 |
| What to do now: don't send money, call on the known number, ask to confirm, family question, pause | Result | F-C2, F-C3, F-C4, P-10 |
| Family circle: invite, record together, sample family | `/app/family` | J4, F-A3 |
| Family questions with the stranger test | Family | F-C2, P-09, S-03 |
| 10-minute pause | `/app/pause` | F-C4, P-04 |
| Shame-free recovery | `/app/help` | F-F1, P-14, S-05 |
| Voice footprint tips | My voice | F-E3, P-03 |
| Native app teaser: record a call, send to Kin | Landing, Check | roadmap |

## Rules
- **Verdict words:** “Likely fake”, “Doesn't sound like X”, “Sounds like X”, “Can't be sure”. Banned: “real”, “safe”, “verified”, “genuine”, “guaranteed”. `npm run copy-guard` enforces this.
- **A match is never final.** “Sounds like X” always adds: voices can be copied; confirm money requests with X on a number you already have.
- **Consent.** A family member's voiceprint is created only after that person ticks consent, on the device they're using.
- **Privacy.** Recordings are never stored or uploaded in the web beta. Only the voiceprint numbers are kept.

## Roadmap
1. **Backend:** real accounts, invites that reach family members' own devices, and “Was this you?” confirmation requests delivered as push notifications (F-C3).
2. **Server-side models:** a speaker-verification embedding (e.g. ECAPA-style) instead of hand-made features, and a trained synthetic-speech detector. Results still go through the same verdict wording.
3. **Native apps:** record the call you're on and **send to Kin** in one tap. Call-screening notes for unknown numbers (F-C6). The help button reachable mid-call (F-C1).
4. **Research:** test with 5–8 families. PRD §17 assumptions are hypotheses until then.
