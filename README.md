# Interviewa AI Tutor

An AI voice tutor that presents scenario-based cases, listens to verbal answers, and gives structured feedback. Part of the Interviewa education product line. Built for social care, nursing, first aid, safeguarding, and any scenario-based vocational training.

## What it does

1. Tutor voice introduces a scenario while the brief appears on the right
2. Student reads the brief, taps the microphone, and speaks their answer
3. Claude evaluates the answer against a rubric and returns structured feedback (strengths, gaps, a tip, a follow-up question, an overall rating)
4. Tutor reads the feedback summary back aloud and can replay on demand

## Quick start (local)

Prerequisites: Node.js 20 or later (https://nodejs.org)

```bash
# 1. Install dependencies
npm install

# 2. Set up your environment variables
cp .env.example .env.local
# Open .env.local and add your Anthropic API key (sk-ant-...)

# 3. Run the dev server
npm run dev
```

Open http://localhost:3000 in Chrome or Edge. The Web Speech API for voice input is not fully supported in Firefox or Safari yet.

## Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this)
2. Go to https://vercel.com/new
3. Import the `tutorai` repo
4. In project settings, add an environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key (starts with `sk-ant-`)
5. Deploy

You'll get a public URL you can share with demo customers. The API key stays server-side, never in the browser.

## Project structure

```
tutorai/
├── src/
│   ├── app/
│   │   ├── api/feedback/route.ts   Server-side Claude call
│   │   ├── layout.tsx              Root layout, loads fonts
│   │   ├── page.tsx                Entry point, loads default scenario
│   │   └── globals.css             Tailwind + custom animations
│   ├── components/
│   │   └── Tutor.tsx               Main tutor UI
│   ├── hooks/
│   │   ├── useSpeechSynthesis.ts   Tutor voice out
│   │   └── useSpeechRecognition.ts Student voice in
│   ├── lib/
│   │   └── scenarios.ts            Scenario library (hardcoded for now)
│   └── types.ts                    Shared TypeScript types
├── package.json
├── tailwind.config.ts              Brand colours, fonts, animations
└── tsconfig.json
```

## Adding a new scenario

Edit `src/lib/scenarios.ts` and add a new entry to the `SCENARIOS` object. Each scenario needs:

- `id` (string, unique)
- `subject` (e.g. "Nursing")
- `topic` (e.g. "Medication administration")
- `introSpoken` (what the tutor says at the start)
- `questionText` (what the student sees)
- `caseFile` (the brief on the right)
- `rubric` (what a strong answer looks like, used to grade)
- `casePlainText` (a compact version of the brief used in the prompt)

To switch which scenario loads by default, change `getDefaultScenario()` in the same file, or update `src/app/page.tsx` to pass a specific scenario to the Tutor component.

## Known limitations (on purpose)

- **Browser voice only.** Tutor speech uses the Web Speech API, which sounds synthetic. Next iteration will swap to ElevenLabs.
- **No persistence.** Sessions are not saved. No database yet. Refresh loses the feedback.
- **No teacher authoring UI.** Scenarios are hardcoded. Teachers cannot add their own yet.
- **No auth.** Anyone with the URL can use it. Fine for demos, not for production.
- **Single scenario loaded at a time.** No picker UI yet.

## Roadmap

- [ ] ElevenLabs voice for natural-sounding tutor audio
- [ ] Supabase persistence for sessions, scenarios, and feedback history
- [ ] Teacher authoring screen (upload images, write brief, set rubric)
- [ ] Student accounts and progress tracking
- [ ] Scenario picker on the landing page
- [ ] White-label branding per institution

## Licence

All rights reserved. Part of the Innovation13 / Interviewa product line.
