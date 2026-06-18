import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getScenarioById } from "@/lib/scenarios";
import { percentageToRating } from "@/lib/categories";
import type {
  TranscriptTurn,
  CompetencyScore,
  StageScore,
  CategoryScore,
  Feedback,
} from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ScoreRequest {
  scenarioId: string;
  transcript: TranscriptTurn[];
  studentName?: string;
  studentEmail?: string;
}

interface ModelCompetency {
  competencyId: string;
  status: "met" | "partial" | "not_met";
  justification: string;
}

interface ModelOutput {
  competencies: ModelCompetency[];
  student: {
    strengths: string[];
    improvements: string[];
    actionPlan: string[];
    encouragement: string;
    spokenSummary: string;
  };
  teacherSummary: string;
}

function pointsFor(status: string): number {
  if (status === "met") return 2;
  if (status === "partial") return 1;
  return 0;
}

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing ANTHROPIC_API_KEY." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as ScoreRequest;
    const { scenarioId, transcript } = body;

    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
    }

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "No transcript received." }, { status: 400 });
    }

    const transcriptText = transcript
      .map((t) => `STAGE ${t.stage} (${t.title})\nASSESSOR: ${t.question}\nLEARNER: ${t.answer}`)
      .join("\n\n");

    const competenciesText = scenario.competencies
      .map(
        (c) =>
          `[${c.id}] (stage ${c.stage}) ${c.label}: ${c.lookFor}`,
      )
      .join("\n");

    const prompt = `You are an AI assessor marking a three stage spoken role play for a learner studying ${scenario.subject}, on ${scenario.topic}.

THE SCENARIO:
${scenario.casePlainText}

THE FULL ASSESSMENT TRANSCRIPT:
${transcriptText}

MARK THE LEARNER AGAINST THESE COMPETENCIES. Each competency notes which stage it mainly relates to, but you may credit evidence from anywhere in the transcript:
${competenciesText}

For each competency assign a status:
- "met" = clearly and substantially demonstrated
- "partial" = touched on but incomplete, shallow, or unclear
- "not_met" = not demonstrated

Be strict but fair. If something was only implied, it is "partial" at most. Do not be generous for the sake of kindness. Teachers and awarding bodies rely on accurate marking.

Then write a STUDENT facing summary in warm, plain English. Treat them as an adult learner. Do not mention points, scores, competency names, or framework references in the student summary.

Output ONLY valid JSON in exactly this shape. No code fences. No em dashes. Keep strings concise.

{
  "competencies": [
    {"competencyId": "exact id from the list", "status": "met", "justification": "one short factual sentence for the teacher"}
  ],
  "student": {
    "strengths": ["1 sentence", "1 sentence"],
    "improvements": ["1 sentence", "1 sentence"],
    "actionPlan": ["1 sentence", "1 sentence"],
    "encouragement": "1 warm sentence",
    "spokenSummary": "2 sentence warm summary in British English, names one strength and points toward the action plan, avoids the word read"
  },
  "teacherSummary": "2 to 3 sentence assessor analysis of where the learner is and what they need next"
}

The competencies array must contain exactly ${scenario.competencies.length} entries, one per competency listed above, using the exact competencyId values.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1600,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const model = JSON.parse(cleaned) as ModelOutput;

    // Build a lookup of the model's verdicts
    const verdictById: Record<string, ModelCompetency> = {};
    for (const m of model.competencies || []) {
      verdictById[m.competencyId] = m;
    }

    // Enrich each competency from scenario data, compute points server-side
    const competencyScores: CompetencyScore[] = scenario.competencies.map((c) => {
      const verdict = verdictById[c.id];
      const status = verdict ? verdict.status : "not_met";
      return {
        competencyId: c.id,
        label: c.label,
        category: c.category,
        framework: c.framework,
        stage: c.stage,
        status,
        justification: verdict ? verdict.justification : "Not addressed in the assessment.",
      };
    });

    const totalPoints = competencyScores.reduce(
      (sum, c) => sum + pointsFor(c.status),
      0,
    );
    const maxPoints = scenario.competencies.length * 2;
    const percentage =
      maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const rating = percentageToRating(percentage);

    // Per stage scores
    const stageScores: StageScore[] = scenario.stages.map((st) => {
      const inStage = competencyScores.filter((c) => c.stage === st.stage);
      const pts = inStage.reduce((sum, c) => sum + pointsFor(c.status), 0);
      const max = inStage.length * 2;
      return {
        stage: st.stage,
        title: st.title,
        points: pts,
        max,
        percentage: max > 0 ? Math.round((pts / max) * 100) : 0,
      };
    });

    // Per category scores
    const categoryScores: Record<string, CategoryScore> = {};
    for (const c of competencyScores) {
      if (!categoryScores[c.category]) {
        categoryScores[c.category] = { points: 0, max: 0, percentage: null };
      }
      categoryScores[c.category].points += pointsFor(c.status);
      categoryScores[c.category].max += 2;
    }
    for (const key of Object.keys(categoryScores)) {
      const cat = categoryScores[key];
      cat.percentage = cat.max > 0 ? Math.round((cat.points / cat.max) * 100) : null;
    }

    const feedback: Feedback = {
      teacher: {
        rating,
        totalPoints,
        maxPoints,
        percentage,
        competencyScores,
        stageScores,
        categoryScores,
        overallSummary: model.teacherSummary || "",
      },
      student: {
        rating,
        strengths: model.student?.strengths || [],
        improvements: model.student?.improvements || [],
        actionPlan: model.student?.actionPlan || [],
        encouragement: model.student?.encouragement || "",
        spokenSummary: model.student?.spokenSummary || "",
      },
    };

    return NextResponse.json({ feedback });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Score API error:", error);
    return NextResponse.json(
      { error: `Scoring failed. ${message}` },
      { status: 500 },
    );
  }
}
