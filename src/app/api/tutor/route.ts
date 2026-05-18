import { NextResponse } from "next/server";
import { createTutorResponse } from "@/lib/tutor-service";
import { getDefaultCoursePacket, saveTutorExchange } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    conceptId?: string;
    explanation?: string;
  };

  if (!body.conceptId || !body.explanation?.trim()) {
    return NextResponse.json(
      { error: "Concept and teach-back explanation are required." },
      { status: 400 },
    );
  }

  const packet = await getDefaultCoursePacket();
  const result = await createTutorResponse({
    packet,
    conceptId: body.conceptId,
    explanation: body.explanation,
  }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Tutor check failed.";
    if (message.startsWith("Concept not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  });

  if (result instanceof NextResponse) {
    return result;
  }

  await saveTutorExchange({
    attempt: result.attempt,
    turn: result.turn,
  });

  return NextResponse.json(result);
}
