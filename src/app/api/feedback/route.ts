import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getScenarioById } from "@/lib/scenarios";
import type { Feedback } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

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
      .map((c, i) => `${i + 1}. [${c.id}] ${c.label}: ${c.lookFor}`)
      .join("\n");

    const maxPoints = scenario.competencies.length * 2;

    const prompt = `You are an AI tutor giving feedback to a learner studying ${scenario.subject}, on ${scenario.topic}.

SCENARIO:
${scenario.casePlainText}

QUESTION: "${scenario.questionText}"

STUDENT ANSWER (voice transcribed):
"${studentAnswer}"

SCORE THEM AGAINST THESE COMPETENCIES:
${competenciesText}

For each competency: "met" (2pts), "partial" (1pt), "not_met" (0pts). Be strict but fair.

Calculate total out of ${maxPoints}, convert to percentage, map to rating:
- 0-20%: "not_yet_ready"
- 21-40%: "developing"
- 41-60%: "competent"
- 61-80%: "strong"
- 81-100%: "excellent"

Output ONLY valid JSON. No code fences. No em dashes. Keep all strings concise.

{
  "teacher": {
    "rating": "developing",
    "totalPoints": 0,
    "maxPoints": ${maxPoints},
    "competencyScores": [
      {"competencyId": "id", "label": "label", "status": "met", "justification": "one short sentence"}
    ],
    "overallSummary": "2 sentence teacher analysis"
  },
  "student": {
    "rating": "developing",
    "strengths": ["1 sentence", "1 sentence"],
    "improvements": ["1 sentence", "1 sentence"],
    "actionPlan": ["1 sentence", "1 sentence"],
    "encouragement": "1 warm sentence",
    "spokenSummary": "2 sentence warm summary in British English"
  }
}

competencyScores must have ${scenario.competencies.length} entries in the order listed. Rating must match between teacher and student.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1200,
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
