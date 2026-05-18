import { NextResponse } from "next/server";
import { createSourceId, ingestSourceFile } from "@/lib/ingestion";
import { getDefaultCourseId, importSourceIntoCourse } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxImportBytes = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => {
    return typeof value === "object" && "arrayBuffer" in value && "name" in value;
  });

  if (files.length === 0) {
    return NextResponse.json({ error: "No source files were provided." }, { status: 400 });
  }

  const imported = [];
  for (const file of files) {
    if (file.size > maxImportBytes) {
      return NextResponse.json(
        { error: `${file.name} is larger than the 25 MB local import limit.` },
        { status: 413 },
      );
    }

    const now = new Date();
    const { source, chunks } = await ingestSourceFile({
      id: createSourceId(file.name, now),
      filename: file.name,
      bytes: new Uint8Array(await file.arrayBuffer()),
      addedAt: now.toISOString(),
    });
    const artifacts = await importSourceIntoCourse({
      courseId: getDefaultCourseId(),
      source,
      chunks,
      now: now.toISOString(),
    });

    imported.push({
      id: source.id,
      title: source.title,
      chunks: chunks.length,
      concepts: artifacts.concepts.length,
      quizzes: artifacts.quizItems.length,
      reviewCards: artifacts.reviewCards.length,
    });
  }

  return NextResponse.json({ imported });
}
