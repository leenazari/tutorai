import { NextResponse } from "next/server";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase";
import type { Feedback } from "@/types";

export const runtime = "nodejs";

interface CategoryScoreBucket {
  points: number;
  max: number;
  percentage: number | null;
}

interface SaveSessionRequest {
  scenarioId: string;
  scenarioSubject: string;
  scenarioTopic: string;
  studentName: string;
  studentEmail: string;
  studentAnswer: string;
  feedback: Feedback;
  competencyCategories: Record<string, string>;
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabaseServer) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as SaveSessionRequest;
    const {
      scenarioId,
      scenarioSubject,
      scenarioTopic,
      studentName,
      studentEmail,
      studentAnswer,
      feedback,
      competencyCategories,
    } = body;

    if (!studentEmail || !studentName) {
      return NextResponse.json(
        { error: "Missing student name or email." },
        { status: 400 },
      );
    }

    const { data: student, error: studentError } = await supabaseServer
      .from("students")
      .upsert(
        { email: studentEmail.toLowerCase().trim(), name: studentName.trim() },
        { onConflict: "email" },
      )
      .select()
      .single();

    if (studentError || !student) {
      console.error("Student upsert error:", studentError);
      return NextResponse.json(
        { error: "Could not save student." },
        { status: 500 },
      );
    }

    const pct = feedback.teacher.maxPoints > 0
      ? Math.round((feedback.teacher.totalPoints / feedback.teacher.maxPoints) * 100)
      : 0;

    const categoryScores: Record<string, CategoryScoreBucket> = {};

    for (const score of feedback.teacher.competencyScores) {
      const category = competencyCategories[score.competencyId] || "subject_knowledge";
      if (!categoryScores[category]) {
        categoryScores[category] = { points: 0, max: 0, percentage: null };
      }
      const pts = score.status === "met" ? 2 : score.status === "partial" ? 1 : 0;
      categoryScores[category].points += pts;
      categoryScores[category].max += 2;
    }

    for (const cat of Object.keys(categoryScores)) {
      const c = categoryScores[cat];
      c.percentage = c.max > 0 ? Math.round((c.points / c.max) * 100) : null;
    }

    const { data: session, error: sessionError } = await supabaseServer
      .from("sessions")
      .insert({
        student_id: student.id,
        scenario_id: scenarioId,
        scenario_subject: scenarioSubject,
        scenario_topic: scenarioTopic,
        student_answer: studentAnswer,
        rating: feedback.teacher.rating,
        total_points: feedback.teacher.totalPoints,
        max_points: feedback.teacher.maxPoints,
        percentage: pct,
        teacher_summary: feedback.teacher.overallSummary,
        student_strengths: feedback.student.strengths,
        student_improvements: feedback.student.improvements,
        student_action_plan: feedback.student.actionPlan,
        student_encouragement: feedback.student.encouragement,
        category_scores: categoryScores,
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error("Session insert error:", sessionError);
      return NextResponse.json(
        { error: "Could not save session." },
        { status: 500 },
      );
    }

    const scoreRows = feedback.teacher.competencyScores.map((cs) => ({
      session_id: session.id,
      competency_id: cs.competencyId,
      label: cs.label,
      category: competencyCategories[cs.competencyId] || "subject_knowledge",
      status: cs.status,
      points: cs.status === "met" ? 2 : cs.status === "partial" ? 1 : 0,
      justification: cs.justification,
    }));

    const { error: scoresError } = await supabaseServer
      .from("competency_scores")
      .insert(scoreRows);

    if (scoresError) {
      console.error("Competency scores insert error:", scoresError);
    }

    return NextResponse.json({ sessionId: session.id, saved: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Save session API error:", error);
    return NextResponse.json(
      { error: `Save failed. ${message}` },
      { status: 500 },
    );
  }
}
