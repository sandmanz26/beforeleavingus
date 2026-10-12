# Roast: KinVoice web, first build → fixes

I built the web product end to end, then tested it in a real browser:
- **Microphone:** Chromium's fake-audio input fed it real WAV files.
- **Synthetic test voices:** “Alex” (lower voice, natural rhythm), “Tom/Sam” (higher voice), and a robotic voice with flat pitch, no breaths and digital silence.

Then I reviewed it critically. What was wrong and what changed:

| # | Problem | Fix |
|---|---|---|
| 1 | **A different person scored 56%.** Tom's voice checked as Alex came out close to “maybe”: tone colour alone was propping the score up despite a huge pitch gap. | A large pitch gap now caps the score. Same voice: 97–100%. Different voice: 18%. Robot: 8%. |
| 2 | **“Ask Emma to confirm” promised an answer that could never arrive.** Without a backend, nothing reaches Emma's phone. That's the false reassurance the PRD warns about. | After sending, the page says plainly that the web beta can't reach their phone yet, and to call them. |
| 3 | **Double negatives in AI clues.** “No flat, unchanging pitch” takes a second read. | Each clue has a plain “all clear” line: “Pitch rises and falls naturally”. |
| 4 | **“Other voices in your circle: Tom 72%” on a “Sounds like you” result.** It plants doubt for no reason. | Other voices only show when the result is a mismatch or unclear, where they help (“maybe it was Tom”). |
| 5 | **In-page links (#how, #faq) would have broken the hash router** and sent people to a blank page. | Section links scroll instead of changing the URL. |

## Still not solved
- These are hand-made acoustic features, not a trained deepfake detector. Phone-line audio can trip the AI clues, and a good clone can pass them. The UI says “clues, not proof” for this reason.
- Invites and confirmation requests need a backend to reach other people.
- Sample family voiceprints are made-up numbers, so they match only the sample clips, not real voices.
