import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getScenarioById } from "@/lib/scenarios";
import type { Feedback } from "@/types";

export const runtime = "nodejs";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface FeedbackRequest {
  scenarioId: string;
  studentAnswer: string;
  studentName?: string;
  studentEmail?: string;
}

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing ANTHROPIC_API_KEY." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as FeedbackRequest;
    const { scenarioId, studentAnswer } = body;

    if (!studentAnswer || studentAnswer.trim().length < 3) {
      return NextResponse.json({ error: "No answer received." }, { status: 400 });
    }

    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
    }

    const competenciesText = scenario.competencies
      .map(
        (c, i) =>
          `${i + 1}. [${c.id}] ${c.label}\n   Look for: ${c.lookFor}`,
      )
      .join("\n\n");

    const maxPoints = scenario.competencies.length * 2;
    const excellentThreshold = Math.ceil(maxPoints * 0.75);
    const goodThreshold = Math.ceil(maxPoints * 0.4);

    const prompt = `You are an AI tutor giving feedback to a learner studying ${scenario.subject}, on ${scenario.topic}.

THE SCENARIO THEY WERE GIVEN:
${scenario.casePlainText}

THEY WERE ASKED: "${scenario.questionText}"

THEIR SPOKEN ANSWER (voice-transcribed, minor errors are fine):
"${studentAnswer}"

YOU MUST SCORE THEM AGAINST THESE SPECIFIC COMPETENCIES:

${competenciesText}

For EACH competency, assign a status:
- "met" (2 points) = clearly and substantially covered
- "partial" (1 point) = touched on but incomplete, shallow, or unclear
- "not_met" (0 points) = did not address at all

Be strict but fair. If the student merely implied something without stating it, that is "partial" at most. Do not be generous for the sake of being kind. Teachers rely on accurate scoring.

Calculate total points out of ${maxPoints}. Overall rating:
- "excellent" if total >= ${excellentThreshold}
- "good" if total >= ${goodThreshold}
- "developing" otherwise

Produce TWO outputs:
1. TEACHER: structured per-competency breakdown with factual, concise justifications.
2. STUDENT: warm, encouraging, plain-English summary. NO mention of competencies, points, or scoring. Treat them as an adult learner, not a child. Specific, not generic.

Respond with ONLY valid JSON in this exact shape. No preamble, no code fences, no em dashes anywhere:

{
  "teacher": {
    "rating": "developing",
    "totalPoints": 0,
    "maxPoints": ${maxPoints},
    "competencyScores": [
      {
        "competencyId": "the id from the list above",
        "label": "the label from the list above",
        "status": "met",
        "justification": "one short sentence explaining why"
      }
    ],
    "overallSummary": "2 to 3 sentence teacher-facing analysis of where this student is at and what they need next"
  },
  "student": {
    "rating": "developing",
    "strengths": ["specific warm observation, one sentence each, 2 to 4 items"],
    "improvements": ["specific area to improve, phrased gently, one sentence each, 2 to 3 items"],
    "actionPlan": ["concrete thing to review or practice before next attempt, one sentence each, 2 to 3 items"],
    "encouragement": "one warm, genuine, not corny closing sentence",
    "spokenSummary": "2 to 3 sentence summary the tutor reads aloud. British English, conversational, warm. Name one strength, gesture toward the action plan."
  }
}

The rating in "student" must match the rating in "teacher". The competencyScores array must have exactly ${scenario.competencies.length} entries, one per competency, in the same order as listed above.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    const cleaned = text.replace(/```json|```/g, "").trim();
    const feedback = JSON.parse(cleaned) as Feedback;

    return NextResponse.json({ feedback });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: `Feedback generation failed. ${message}` },
      { status: 500 },
    );
  }
}
