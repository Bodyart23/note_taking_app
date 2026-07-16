import { describe, it, expect } from "vitest";

import { createNoteSchema, updateNoteSchema } from "@/lib/validation/notes";

describe("notes schemas", () => {
  it("rejects unknown fields on create (strict)", () => {
    const result = createNoteSchema.safeParse({
      title: "Hello",
      userId: "attacker",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toBeTruthy();
    }
  });

  it("requires at least one field on update", () => {
    const result = updateNoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects mass-assignment attempts on update", () => {
    const result = updateNoteSchema.safeParse({
      userId: "attacker",
      title: "New title",
    });

    expect(result.success).toBe(false);
  });

  it("enforces tags limits", () => {
    const tooManyTags = Array.from({ length: 21 }, (_, i) => `t${i}`);
    const result = updateNoteSchema.safeParse({ tags: tooManyTags });
    expect(result.success).toBe(false);
  });
});

