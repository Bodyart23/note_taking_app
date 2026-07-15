import { NextResponse, type NextRequest } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { changeUserPassword } from "@/lib/users";
import { changePasswordSchema } from "@/lib/validation/auth";

export async function PATCH(request: NextRequest) {
  const authResult = await requireUserId();
  if (authResult instanceof NextResponse) return authResult;

  // Keyed by user id: verifying the current password makes this endpoint an
  // authenticated brute-force oracle without a limit.
  const rate = checkRateLimit("change-password", authResult.userId, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.ok) return rateLimitResponse(rate.retryAfterSeconds);

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { message: "New password must be different from the current password." },
      { status: 400 },
    );
  }

  const result = await changeUserPassword({
    userId: authResult.userId,
    currentPassword,
    newPassword,
  });

  if (!result.ok) {
    const message =
      result.reason === "invalid-current-password"
        ? "Current password is incorrect."
        : "User not found.";

    return NextResponse.json({ message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
