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
}

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing ANTHROPIC_API_KEY. Set it in your environment." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as FeedbackRequest;
    const { scenarioId, studentAnswer } = body;

    if (!studentAnswer || studentAnswer.trim().length < 3) {
      return NextResponse.json(
        { error: "No answer received." },
        { status: 400 },
      );
    }

    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found." },
        { status: 404 },
      );
    }

    const prompt = `You are an AI tutor giving feedback to a learner studying ${scenario.subject}, specifically on ${scenario.topic}.

They were given this brief:
${scenario.casePlainText}

They were asked: "${scenario.questionText}"

Rubric:
${scenario.rubric}

The learner's spoken answer (voice-transcribed, may have minor transcription quirks): "${studentAnswer}"

Give feedback. Be warm, direct, not patronising, not robotic. Match how a real trainer in this field would speak. Respond with ONLY valid JSON in this exact shape, no preamble, no code fences:

{
  "strengths": ["short bullet 1", "short bullet 2"],
  "missed": ["short bullet on what they missed or got wrong"],
  "suggestion": "One practical tip, one sentence",
  "followUp": "One probing follow-up question phrased as if spoken aloud",
  "rating": "developing",
  "spokenSummary": "A natural 2-3 sentence spoken summary the tutor will read aloud. Conversational British English. Do not use em dashes."
}

Rating must be exactly one of: "developing", "good", "excellent".`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
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
