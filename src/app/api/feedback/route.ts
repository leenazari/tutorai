import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getScenarioById } from "@/lib/scenarios";

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
  const competencyIds = scenario.competencies.map((c) => c.id).join(", ");

  const prompt = `You are an AI tutor giving feedback to a learner studying ${scenario.subject}, on ${scenario.topic}.

SCENARIO:
${scenario.casePlainText}

QUESTION: "${scenario.questionText}"

STUDENT ANSWER (voice transcribed):
"${studentAnswer}"

SCORE THEM AGAINST THESE COMPETENCIES:
${competenciesText}

For each competency: "met" (2pts), "partial" (1pt), "not_met" (0pts). Be strict but fair. If something was only implied, it is "partial" at most.

Calculate total out of ${maxPoints}, convert to percentage, map to rating:
0-20% not_yet_ready, 21-40% developing, 41-60% competent, 61-80% strong, 81-100% excellent.

Output your response in EXACTLY this format, using these exact section markers each on their own line. Do NOT use JSON for the student sections. Do NOT use code fences. Do NOT use em dashes anywhere. Write the student-facing sections first, in order, then the data block last.

###STRENGTHS###
(2 to 4 lines, one strength per line, each a warm specific full sentence, no bullets or numbers)
###IMPROVEMENTS###
(2 to 3 lines, one area to improve per line, each a gentle full sentence, no bullets or numbers)
###ENCOURAGEMENT###
(one warm genuine sentence)
###ACTIONPLAN###
(2 to 3 lines, one concrete action per line to do before the next attempt, no bullets or numbers)
###SPOKEN###
(2 sentence summary the tutor reads aloud, British English, warm, names one strength and points toward the action plan. Avoid the word "read")
###DATA###
(a single line of compact JSON, no code fences, exactly this shape: {"rating":"developing","totalPoints":0,"maxPoints":${maxPoints},"competencyScores":[{"competencyId":"id","label":"label","status":"met","justification":"one short sentence"}],"overallSummary":"2 sentence teacher analysis"})

The competencyScores array must contain exactly ${scenario.competencies.length} entries, one per competency, using these exact competencyId values in this order: ${competencyIds}. The rating in DATA must match the bands above.`;

  const anthropicStream = anthropic.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 1200,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("Streaming error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
