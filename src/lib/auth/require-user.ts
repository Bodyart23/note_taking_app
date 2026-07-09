import { NextResponse } from "next/server";

import { auth } from "@/auth";

export async function requireUserId(): Promise<
  { userId: string } | NextResponse
> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return { userId: session.user.id };
}
