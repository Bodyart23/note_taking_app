import { NextRequest, NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { createNote, getNotes } from "@/lib/notes-store";
import type { CreateNoteInput } from "@/types/note";

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

  const body = (await request.json()) as CreateNoteInput;
  const note = await createNote(authResult.userId, body);
  return NextResponse.json(note, { status: 201 });
}
