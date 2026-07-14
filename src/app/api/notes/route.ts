import { NextRequest, NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { createNote, getNotes } from "@/lib/notes-store";
import { createNoteSchema } from "@/lib/validation/notes";

export async function GET(request: NextRequest) {
  const authResult = await requireUserId();
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = request.nextUrl;
  const archivedParam = searchParams.get("archived");
  const search = searchParams.get("search") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;

  const notes = await getNotes({
    userId: authResult.userId,
    archived: archivedParam === null ? undefined : archivedParam === "true",
    search,
    tag,
  });

  return NextResponse.json(notes);
}

export async function POST(request: NextRequest) {
  const authResult = await requireUserId();
  if (authResult instanceof NextResponse) return authResult;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const note = await createNote(authResult.userId, parsed.data);
  return NextResponse.json(note, { status: 201 });
}
