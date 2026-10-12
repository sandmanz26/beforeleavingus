# KinVoice (web)

KinVoice protects families from AI voice-clone scams. You **register**, **teach KinVoice your voice** and how you talk, **invite your family**, and when a call or voice note sounds off you **check it**. KinVoice tells you whether it sounds like the person it claims to be, and what to do next.

This is the web version. It's front-end only (React 19 + TypeScript + Vite), with no backend:
- Accounts and data are stored in the browser (localStorage).
- Recordings are analysed **in the browser** with the Web Audio API and then thrown away. Only the voiceprint numbers are kept.

```bash
npm install
npm run dev          # http://localhost:5173  (microphone needs localhost or https)
npm run copy-guard   # PRD rule: never “safe”, “real” or “verified” in UI copy
npm run build
```

## What's in it
| Area | What it does |
|---|---|
| Website (`/`) | Landing page: the problem, how it works, what KinVoice checks, privacy, the coming app, FAQ |
| Sign up / sign in | Mock accounts stored in this browser |
| Voice setup (`/setup`) | Consent → 5 short recordings (mic or upload) → how you talk (pet names, greetings, words you'd never use) → your voiceprint stamp |
| Check a voice | Record (call on speaker) or upload a voice note, pick who it claims to be, optionally add the words → verdict, voice match %, word check, AI-voice clues, scam-script signs, and what to do now |
| Family | Invite members or record them on this device (with their own consent), family questions, pause or delete voiceprints |
| My voice, History, 10-minute pause, Help, Settings | Voiceprint details and controls, past checks, a pause timer, shame-free recovery steps |

## How the check works
1. **Voiceprint.** Each recording is reduced to pitch, pitch movement, a 16-band spectral envelope (the voice's “colour”), brightness, pauses and loudness variation. A voiceprint is the average over several recordings.
2. **Match.** A new clip is compared with the claimed person's voiceprint; a large pitch gap caps the score.
3. **Words.** If the words are added, they're compared with that person's speech patterns (e.g. “Mom” vs “Mum”) and scanned for the scam script (new number, urgency, secrecy, gift cards, courier, bail).
4. **AI clues.** Flat pitch, no breathing pauses, even loudness, and digital silence between words.
5. **Verdict.** *Likely fake*, *Doesn't sound like X*, *Sounds like X* or *Can't be sure*. Never “real”, “safe” or “verified” (PRD §1). A match still says to confirm money requests with family.

These are on-device heuristics, not a trained deepfake model. That needs a backend (see `docs/PRODUCT.md`, roadmap).

## Code map
```
src/
  pages/         Landing · Auth · Setup (enrolment) · app/ (Shell, Home, Check, Result, Family, Misc)
  lib/audio/     features.ts (analysis) · voiceprint.ts (match + verdict) · useRecorder.ts · fft.ts
  lib/           store.tsx (accounts, data, sample family) · patternCheck.ts · router.tsx · speech.ts · types.ts
  components/    Stamp (voiceprint stamp) · Recorder · ChipInput · Kettle · Icon · bits
docs/            PRODUCT.md · ROAST.md
```
