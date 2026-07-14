import { NextRequest, NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { deleteNote, getNoteById, updateNote } from "@/lib/notes-store";
import { updateNoteSchema } from "@/lib/validation/notes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const authResult = await requireUserId();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;
  const note = await getNoteById(authResult.userId, id);

  if (!note) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireUserId();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const note = await updateNote(authResult.userId, id, parsed.data);

  if (!note) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const authResult = await requireUserId();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;
  const deleted = await deleteNote(authResult.userId, id);

  if (!deleted) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
