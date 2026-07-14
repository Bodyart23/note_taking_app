import type { Note } from "@/types/note";

export type MobileScreen = "list" | "editor" | "tags" | "tag-notes" | "settings";
export type ConfirmAction = "delete" | "archive" | null;
export type DraftNote = Pick<Note, "title" | "content" | "tags">;

const LOCAL_NOTE_PREFIX = "local-";

export function isLocalNoteId(id: string): boolean {
  return id.startsWith(LOCAL_NOTE_PREFIX);
}

export function createLocalNote(): Note {
  const now = new Date();

  return {
    id: `${LOCAL_NOTE_PREFIX}${crypto.randomUUID()}`,
    userId: "",
    title: "Untitled Note",
    content: "",
    tags: [],
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function isDraftDirty(note: Note, draft: DraftNote): boolean {
  return (
    note.title !== draft.title ||
    note.content !== draft.content ||
    JSON.stringify(note.tags) !== JSON.stringify(draft.tags)
  );
}

export function draftFromNote(note: Note): DraftNote {
  return {
    title: note.title,
    content: note.content,
    tags: note.tags,
  };
}
