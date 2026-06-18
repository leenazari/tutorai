# tutorai

AI voice tutor for vocational training. Scenario-based spoken assessment with structured feedback

Live at https://tutorai-red.vercel.app

## What it does

Each scenario runs as a three stage adaptive assessment. Stage one is the same for every candidate so results are comparable. Stages two and three adapt their wording to what the candidate just said, while still assessing a fixed set of competencies. The session ends with a scorecard mapped to real UK assessment frameworks (Care Certificate, Care Act 2014, Mental Capacity Act, NMC, NEWS2).

Students see a friendly summary. Teachers see the full scorecard with a per stage breakdown, the six category scores, every competency tagged to its framework reference, and the complete transcript.

## Scenarios

- Social care: safeguarding home visit
- Social care: challenging behaviour in dementia care
- Nursing: recognising patient deterioration

## Stack

- Next.js 14, TypeScript, Tailwind
- Anthropic Claude Haiku 4.5
- Supabase (Postgres)
- Browser Web Speech API for voice in and out
- Hosted on Vercel, London region

## Teacher dashboard

Available at /teacher (password protected).

---

Build note: deployment refresh.
