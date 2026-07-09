import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { getAllTags } from "@/lib/notes-store";

export async function GET() {
  const authResult = await requireUserId();
  if (authResult instanceof NextResponse) return authResult;

  const tags = await getAllTags(authResult.userId);
  return NextResponse.json(tags);
}
