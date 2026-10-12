# KinVoice

**KinVoice** is a family speech-pattern check against AI voice-clone scams, built from *PRD KinVoice v2*.
It is a front-end-only React web app (React 19, TypeScript, Vite) running on mock data. There is no backend.

```bash
npm install
npm run dev          # http://localhost:5173
npm run copy-guard   # PRD rules: no verdict words in UI copy; every feature traced to P/T/S
npm run build
```

## Using it
1. Open the app and pick who's using this phone: **Margaret** (protected, 79), **David** (circle keeper), **Emma** (member) or **Rob** (backup).
2. Each person gets their own KinVoice. Margaret's is built for an 80-year-old in a panic. David's manages the circle. Emma's and Rob's answer “Is this you?” on their own phones.
3. All profiles share one sample family, saved on this device. If Margaret taps the yellow button and says the caller claims to be Emma, switch to Emma (tap your stamp, top right, then **Switch profile**). Her request is waiting there. Answer it and switch back to Margaret to see the result.
4. Timers run in real time: the phone tree asks the next person after 45 seconds, and the pause lasts 10 minutes.
5. **Reset sample data** on the profile screen starts the family over.

“Ring David” and similar buttons are ordinary `tel:` links, so on a phone they open the dialler.

## Where things are
```
src/
  shell/       Shell.tsx — profile picker, profile sheet, app shell
  apps/        margaret/ david/ emma/ rob/ shared/AskCard.tsx
  store/       world.tsx — the family's shared state: checks, phone tree, consent (saved to localStorage)
  lib/         patternCheck.ts — F-D1 word comparison (never a verdict)
  data/        family.ts · messages.ts · prd.ts (feature → P/T/S traceability)
  components/  Icon (bespoke set) · Kettle (pause dial) · bits
docs/
  PRODUCT.md   principles, confirmation rule, feature registry, design system, hypotheses
  ROAST.md     design critiques and what changed because of them
```
