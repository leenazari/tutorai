import { NextResponse } from "next/server";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password;

    if (!password || password !== process.env.TEACHER_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseConfigured() || !supabaseServer) {
      return NextResponse.json({ error: "Database not configured." }, { status: 500 });
    }

    const result = await supabaseServer
      .from("sessions")
      .select("id, student_id, scenario_id, scenario_subject, scenario_topic, rating, percentage, total_points, max_points, teacher_summary, student_answer, category_scores, created_at, students!inner(name, email)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (result.error) {
      console.error("Sessions query error:", result.error);
      return NextResponse.json({ error: "Could not fetch sessions." }, { status: 500 });
    }

    const rows = result.data || [];
    const sessions = rows.map(function (row: any) {
      return {
        id: row.id,
        student_id: row.student_id,
        student_name: row.students ? row.students.name : "Unknown",
        student_email: row.students ? row.students.email : "",
        scenario_id: row.scenario_id,
        scenario_subject: row.scenario_subject,
        scenario_topic: row.scenario_topic,
        rating: row.rating,
        percentage: row.percentage,
        total_points: row.total_points,
        max_points: row.max_points,
        teacher_summary: row.teacher_summary,
        student_answer: row.student_answer,
        category_scores: row.category_scores || {},
        created_at: row.created_at,
      };
    });

    return NextResponse.json({ sessions: sessions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Teacher sessions API error:", error);
    return NextResponse.json({ error: "Failed. " + message }, { status: 500 });
  }
}
