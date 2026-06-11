"use client";

import { Clock, Tag } from "lucide-react";
import { useState } from "react";

import {
  cn,
  formatLastEdited,
  parseTagsInput,
  tagsToInput,
} from "@/lib/utils";
import type { Note } from "@/types/note";

type NoteEditorProps = {
  note: Note | null;
  isDirty: boolean;
  onChange: (updates: Partial<Pick<Note, "title" | "content" | "tags">>) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  variant?: "desktop" | "mobile";
  className?: string;
};

export function NoteEditor({
  note,
  isDirty,
  onChange,
  onSave,
  onCancel,
  onDelete,
  onArchive,
  variant = "desktop",
  className,
}: NoteEditorProps) {
  const noteId = note?.id ?? null;
  const [tagsInput, setTagsInput] = useState(() =>
    note ? tagsToInput(note.tags) : "",
  );
  const [tagsNoteId, setTagsNoteId] = useState(noteId);

  if (noteId !== tagsNoteId) {
    setTagsNoteId(noteId);
    setTagsInput(note ? tagsToInput(note.tags) : "");
  }

  if (!note) {
    return (
      <section
        className={cn(
          "flex h-full items-center justify-center bg-surface px-6 text-center",
          className,
        )}
      >
        <p className="text-sm text-muted">
          Select a note to view or edit, or create a new one.
        </p>
      </section>
    );
  }

  const lastEdited = isDirty ? null : note.updatedAt;

  return (
    <section className={cn("flex h-full min-h-0 flex-col bg-surface", className)}>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 lg:px-8">
        <input
          type="text"
          value={note.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Enter a title..."
          className="w-full bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted lg:text-3xl"
        />

        <div className="mt-6 space-y-4 border-b border-border pb-6">
          <div className="flex items-start gap-3">
            <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Tags</p>
              <input
                type="text"
                value={tagsInput}
                onChange={(event) => {
                  setTagsInput(event.target.value);
                  onChange({ tags: parseTagsInput(event.target.value) });
                }}
                placeholder="Add tags separated by commas (e.g. Work, Planning)"
                className="mt-1 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 shrink-0 text-muted" />
            <div>
              <p className="text-sm font-medium text-foreground">Last edited</p>
              <p className="text-sm text-muted">{formatLastEdited(lastEdited)}</p>
            </div>
          </div>
        </div>

        <textarea
          value={note.content}
          onChange={(event) => onChange({ content: event.target.value })}
          placeholder="Start typing your note here..."
          className="mt-6 min-h-[280px] w-full resize-none bg-transparent text-sm leading-7 text-foreground outline-none placeholder:text-muted lg:min-h-[360px]"
        />
      </div>

      {variant === "desktop" ? (
        <div className="flex items-center gap-3 border-t border-border px-5 py-4 lg:px-8">
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Save Note
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-surface-muted px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-border"
          >
            Cancel
          </button>
          {onArchive ? (
            <button
              type="button"
              onClick={onArchive}
              className="ml-auto text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {note.isArchived ? "Unarchive" : "Archive"}
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-sm font-medium text-error transition-colors hover:opacity-80"
            >
              Delete
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
