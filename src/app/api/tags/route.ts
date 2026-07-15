import { NextRequest, NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { getAllTags } from "@/lib/notes-store";

export async function GET(request: NextRequest) {
  const authResult = await requireUserId();
  if (authResult instanceof NextResponse) return authResult;

  const archivedParam = request.nextUrl.searchParams.get("archived");

  const tags = await getAllTags(
    authResult.userId,
    archivedParam === null ? undefined : archivedParam === "true",
  );
  return NextResponse.json(tags);
}
