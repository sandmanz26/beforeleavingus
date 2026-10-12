# KinVoice: clickable prototype

A front-end-only prototype of **KinVoice**, a family speech-pattern check against AI voice-clone scams, built from *PRD KinVoice v2*.
It uses React, TypeScript and Vite. There is no backend: four family phones run off one shared, simulated world with mock data, so a tap on one phone shows up on the others.

```bash
npm install
npm run dev          # http://localhost:5173
npm run copy-guard   # PRD rules: no verdict words in UI copy; every feature traced to P/T/S
npm run build
```

## How to demo
1. Pick a **story** (S-01 to S-08 from the PRD) on the left, or from **Stories** on smaller screens. Each story resets the family and sets the scene. The steps tell you which phone to use.
2. Drive the phones by hand: Margaret (protected, 79), David (circle keeper), and Emma and Rob, who share the third slot.
3. **Spec tags** shows every feature's PRD reference where it lives. Click a tag for its card.
4. **Feature map** shows the attack chain T-01 to T-07, problem coverage, and every scenario, each playable.
5. **Design review** is the roast of v1: findings, v1 screenshots, and what v2 changed.
6. The clock runs at 10× by default, so the 45-second phone-tree wait takes 4.5 seconds and the 10-minute pause takes about a minute.

## Where things are
```
src/
  data/        prd.ts (P/T/S/F registry) · family.ts · scenarios.ts · messages.ts · roast.ts
  store/       world.tsx — the shared simulation: incidents, phone tree, family calls, consent
  lib/         patternCheck.ts — F-D1 word comparison (never a verdict)
  apps/        margaret/ david/ emma/ rob/ shared/AskCard.tsx
  components/  Icon (bespoke set) · Kettle (signature dial) · Phone · FamilyCall · bits
  stage/       Stage · Storyboard · FeatureMap · SpecSheet · Review
docs/
  PRODUCT.md   principles, confirmation rule, feature registry, design system, hypotheses
  ROAST.md     the v1 critique and the v2 fixes
```
