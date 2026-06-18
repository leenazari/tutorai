# Tutorai 3-Stage Assessment Upgrade

This turns each scenario into a three stage adaptive role play that ends with a full scorecard, mapped to real UK assessment frameworks (Care Certificate, Care Act, Mental Capacity Act, NMC, NEWS2).

## IMPORTANT: the database is already done

I have already added the new database columns to your Supabase project (stage_scores, transcript, framework, stage). You do NOT need to touch Supabase. Just upload these files.

## Files in this zip (10 files, all in the src folder)

```
src/
├── types.ts                                    REPLACES
├── lib/
│   └── scenarios.ts                            REPLACES (now has 3 stages + framework refs)
├── components/
│   └── Tutor.tsx                               REPLACES (3-stage state machine)
└── app/
    ├── teacher/
    │   └── page.tsx                            REPLACES (stages, frameworks, transcript)
    └── api/
        ├── feedback/route.ts                   REPLACES (now a harmless stub, replaced by score)
        ├── next-question/route.ts              NEW (adaptive question generator)
        ├── score/route.ts                      NEW (full scorecard engine)
        └── teacher/
            ├── sessions/route.ts               NEW (correct /api location)
            └── competencies/route.ts           NEW (correct /api location)
```

## How to install

1. Unzip this folder on your computer
2. Go to https://github.com/leenazari/tutorai
3. Click "Add file" then "Upload files"
4. Drag the whole `src` folder into the upload box
5. GitHub keeps the structure, overwrites the changed files, and adds the new ones
6. Scroll down, commit changes
7. Wait about 2 minutes for Vercel to redeploy

That is the only required step. The build has been tested end to end and passes.

## Optional tidy-up (not required, will not break anything)

Your repo currently has two route files in the wrong place (left over from earlier). They are now dead and unused, replaced by the correct ones under api/teacher. If you want a clean repo you can delete these two files in the GitHub web UI (open the file, click the bin icon, commit):

- src/app/teacher/sessions/route.ts
- src/app/teacher/competencies/route.ts

Leaving them does no harm. They are just unused endpoints.

## What changed for the user

- Each scenario now runs as THREE stages. Stage 1 is the same for every candidate (fair assessment). Stages 2 and 3 adapt their wording to what the candidate just said, so it feels like a real conversation, but everyone is still assessed on the same competencies.
- After stage 3, the candidate sees the friendly summary (strengths, improvements, encouragement, action plan).
- The teacher dashboard now shows the overall band, a per-stage breakdown, the 6 category scores, every competency tagged to its real framework reference, and the full three-stage transcript.

## Cost note

Each full assessment now makes 3 AI calls (2 adaptive questions on Haiku, 1 scorecard on Haiku) instead of 1. That is roughly 1.5 to 2 pence per assessment, up from about half a penny. Still very cheap. The rate limiter is still on the to-do list and matters a little more now.

## Models used

- Adaptive questions: Claude Haiku 4.5 (fast, short)
- Scorecard: Claude Haiku 4.5 (the AI only judges met/partial/not_met and writes the summary; all the maths and framework mapping is done in code, so the scores are deterministic and the framework references are always correct)
