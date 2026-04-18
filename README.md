# Interviewa AI Tutor

AI voice tutor for scenario-based vocational training. Shows a case brief, listens to a spoken answer, and returns structured feedback using Claude. Current scenario: social care safeguarding home visit.

Part of the Interviewa education product line, Innovation13.

## What it does

The tutor voice introduces a scenario. The student reads the case brief on screen, taps the microphone, and speaks their answer. Claude evaluates the response against a rubric and returns strengths, gaps, a tip, a follow-up question, and an overall rating. The tutor reads the summary back aloud.

Results are always instant. No waiting, no processing delay visible to the student beyond the few seconds Claude takes to think.

## Tech stack

- Next.js 14 with TypeScript and the App Router
- Tailwind CSS for styling
- Anthropic SDK, called server-side via a Next.js API route
- Web Speech API for voice input and output in the browser
- Hosted on Vercel

## Running it

This project is designed to run on Vercel. The Anthropic API key is stored as an environment variable in Vercel project settings, never in the code or the browser.

## Scenarios

Scenarios are currently defined in `src/lib/scenarios.ts`. One scenario is active: a social care safeguarding home visit. Each scenario contains a subject, topic, spoken intro, displayed question, case file for the right panel, and a rubric Claude uses to grade answers.

To add a new scenario, edit that file and add a new entry to the `SCENARIOS` object.

## Current limitations

- Browser text-to-speech, not ElevenLabs. Voice sounds synthetic.
- No persistence. Session data is not saved.
- Scenarios are hardcoded, no teacher authoring UI yet.
- No student accounts, no progress tracking.
- Anyone with the URL can use the feedback endpoint, which costs API credits.
- Chrome and Edge only for voice input. Safari and Firefox do not fully support the Web Speech API.

## Roadmap

- ElevenLabs for natural tutor voice
- Supabase for session persistence and scenario library
- Teacher authoring screen for scenario creation
- Student accounts and progress tracking
- Rate limiting on the feedback endpoint before sharing publicly
- Multiple scenarios with a picker

## Licence

All rights reserved. Innovation13 / Interviewa.
