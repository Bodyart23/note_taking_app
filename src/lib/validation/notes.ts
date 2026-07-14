import { z } from "zod";

const noteTitleSchema = z
  .string()
  .trim()
  .max(500, { message: "Title must be at most 500 characters." });

const noteContentSchema = z
  .string()
  .max(50_000, { message: "Content must be at most 50,000 characters." });

const noteTagSchema = z
  .string()
  .trim()
  .min(1, { message: "Tags cannot be empty." })
  .max(50, { message: "Each tag must be at most 50 characters." });

const noteTagsSchema = z
  .array(noteTagSchema)
  .max(20, { message: "A note can have at most 20 tags." });

const noteFieldsSchema = z.object({
  title: noteTitleSchema.optional(),
  content: noteContentSchema.optional(),
  tags: noteTagsSchema.optional(),
  isArchived: z.boolean().optional(),
});

/** Rejects unknown keys (e.g. userId) so they never reach the data layer. */
export const createNoteSchema = noteFieldsSchema.strict();

export const updateNoteSchema = noteFieldsSchema
  .strict()
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined ||
      data.tags !== undefined ||
      data.isArchived !== undefined,
    { message: "At least one field is required." },
  );

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
