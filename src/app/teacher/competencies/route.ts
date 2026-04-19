import { NextResponse } from "next/server";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password;
    const sessionId = body.sessionId;

    if (!password || password !== process.env.TEACHER_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabaseServer) {
      return NextResponse.json({ error: "Database not configured." }, { status: 500 });
    }

    const result = await supabaseServer
      .from("competency_scores")
      .select("*")
      .eq("session_id", sessionId);

    if (result.error) {
      console.error("Competencies query error:", result.error);
      return NextResponse.json({ error: "Could not fetch competencies." }, { status: 500 });
    }

    return NextResponse.json({ competencyScores: result.data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Competencies API error:", error);
    return NextResponse.json({ error: "Failed. " + message }, { status: 500 });
  }
}
