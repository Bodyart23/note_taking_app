"use client";

import { Archive, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";

type NoteActionsProps = {
  note: Note | null;
  onDelete?: () => void;
  onArchive?: () => void;
  className?: string;
};

const actionButtonClass =
  "flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted";

export function NoteActions({
  note,
  onDelete,
  onArchive,
  className,
}: NoteActionsProps) {
  if (!note) {
    return null;
  }

  return (
    <section
      className={cn(
        "flex h-full w-1/4 shrink-0 flex-col bg-surface px-6 pt-6 border-l border-border",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-3">
        <button type="button" onClick={onArchive} className={actionButtonClass}>
          <Archive className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          {note.isArchived ? "Unarchive Note" : "Archive Note"}
        </button>

        <button type="button" onClick={onDelete} className={actionButtonClass}>
          <Trash2 className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          Delete Note
        </button>
      </div>
    </section>
  );
}
