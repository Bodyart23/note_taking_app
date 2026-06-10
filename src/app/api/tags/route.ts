import { NextResponse } from "next/server";

import { getAllTags } from "@/lib/notes-store";

export async function GET() {
  const tags = await getAllTags();
  return NextResponse.json(tags);
}
