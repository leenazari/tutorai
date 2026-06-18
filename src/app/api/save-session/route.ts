import { NextResponse } from "next/server";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase";
import type { Feedback, TranscriptTurn } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 10;

interface SaveSessionRequest {
  scenarioId: string;
  scenarioSubject: string;
  scenarioTopic: string;
  studentName: string;
  studentEmail: string;
  transcript: TranscriptTurn[];
  feedback: Feedback;
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
      transcript,
      feedback,
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

    const teacher = feedback.teacher;
    const combinedAnswer = (transcript || [])
      .map((t) => `Stage ${t.stage}: ${t.answer}`)
      .join("\n\n");

    const { data: session, error: sessionError } = await supabaseServer
      .from("sessions")
      .insert({
        student_id: student.id,
        scenario_id: scenarioId,
        scenario_subject: scenarioSubject,
        scenario_topic: scenarioTopic,
        student_answer: combinedAnswer,
        rating: teacher.rating,
        total_points: teacher.totalPoints,
        max_points: teacher.maxPoints,
        percentage: teacher.percentage,
        teacher_summary: teacher.overallSummary,
        student_strengths: feedback.student.strengths,
        student_improvements: feedback.student.improvements,
        student_action_plan: feedback.student.actionPlan,
        student_encouragement: feedback.student.encouragement,
        category_scores: teacher.categoryScores,
        stage_scores: teacher.stageScores,
        transcript: transcript || [],
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

    const scoreRows = teacher.competencyScores.map((cs) => ({
      session_id: session.id,
      competency_id: cs.competencyId,
      label: cs.label,
      category: cs.category,
      framework: cs.framework,
      stage: cs.stage,
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
