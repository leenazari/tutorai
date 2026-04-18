import { NextResponse } from "next/server";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { password, sessionId } = (await request.json()) as {
      password?: string;
      sessionId?: string;
    };

    if (!password || password !== process.env.TEACHER_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 },
      );
    }

    if (!isSupabaseConfigured() || !supabaseServer) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 500 },
      );
    }

    const { data, error } = await supabaseServer
      .from("competency_scores")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      console.error("Competencies query error:", error);
      return NextResponse.json(
        { error: "Could not fetch competencies." },
        { status: 500 },
      );
    }

    return NextResponse.json({ competencyScores: data || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Competencies API error:", error);
    return NextResponse.json({ error: `Failed. ${message}` }, { status: 500 });
  }
}
