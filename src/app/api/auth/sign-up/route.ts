import { NextResponse, type NextRequest } from "next/server";

import { createUser, getUserByEmail } from "@/lib/users";
import { signUpSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password, name } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { message: "An account with this email already exists." },
      { status: 409 },
    );
  }

  try {
    await createUser({ email, password, name });
  } catch {
    // Handles the race where two requests pass the existence check and the
    // unique index rejects the second insert.
    return NextResponse.json(
      { message: "Could not create account. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
