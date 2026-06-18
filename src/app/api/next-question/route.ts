import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getScenarioById } from "@/lib/scenarios";
import type { TranscriptTurn } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 20;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface NextQuestionRequest {
  scenarioId: string;
  nextStage: number;
  transcript: TranscriptTurn[];
}

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing ANTHROPIC_API_KEY." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as NextQuestionRequest;
    const { scenarioId, nextStage, transcript } = body;

    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
    }

    const stageDef = scenario.stages.find((s) => s.stage === nextStage);
    if (!stageDef) {
      return NextResponse.json({ error: "Stage not found." }, { status: 404 });
    }

    const history = transcript
      .map((t) => `STAGE ${t.stage} QUESTION: ${t.question}\nLEARNER ANSWER: ${t.answer}`)
      .join("\n\n");

    const prompt = `You are an AI assessor running a spoken role play assessment for a learner studying ${scenario.subject}, on ${scenario.topic}.

THE SCENARIO:
${scenario.casePlainText}

WHAT HAS HAPPENED SO FAR:
${history}

You are now moving to stage ${nextStage}, titled "${stageDef.title}".
The purpose of this stage: ${stageDef.focus}

A suggested starting point for this stage is: "${stageDef.openingQuestion}"

Write the single question or prompt you say to the learner to begin this stage. Adapt it naturally so it acknowledges or follows on from what they just said, but keep the assessment moving toward the purpose above. Stay in role as a calm, professional assessor.

Rules:
- One or two sentences only. Spoken aloud, so keep it natural and warm.
- British English. Do not use the word "read". Do not use em dashes.
- Do not give feedback or hints about whether their previous answer was good or bad. Just move the scenario forward.
- Output only the spoken question text. No labels, no quotation marks, no preamble.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("")
      .trim();

    const question = text || stageDef.openingQuestion;

    return NextResponse.json({ question, title: stageDef.title, stage: nextStage });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Next question API error:", error);
    return NextResponse.json(
      { error: `Could not generate next question. ${message}` },
      { status: 500 },
    );
  }
}
