import { NextResponse } from "next/server";

export const runtime = "nodejs";

// This endpoint has been replaced by /api/score (three stage assessment).
// Kept as a harmless stub so no manual file deletion is required.
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been replaced by /api/score." },
    { status: 410 },
  );
}
