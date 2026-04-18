import { NextResponse } from "next/server";

export const runtime = "nodejs";

const VOICE_ID = "QMSGabqYzk8YAneQYYvR";
const MODEL_ID = "eleven_turbo_v2_5";

interface TTSRequest {
  text: string;
}

export async function POST(request: Request) {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing ELEVENLABS_API_KEY. Add it in Vercel settings." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as TTSRequest;
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text provided." },
        { status: 400 },
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs error:", errText);
      return NextResponse.json(
        { error: `TTS provider error: ${errText.slice(0, 200)}` },
        { status: response.status },
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: `TTS failed. ${message}` },
      { status: 500 },
    );
  }
}
