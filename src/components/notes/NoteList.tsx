import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";

import { GoBackButton } from "./GoBackButton";
import { NoteListItem } from "./NoteListItem";

type NoteListProps = {
  title: string;
  subtitle?: string;
  notes: Note[];
  variant?: "desktop" | "mobile";
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onGoBack?: () => void;
  isLoading?: boolean;
};

export function NoteList({
  title,
  subtitle,
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onGoBack,
  isLoading,
}: NoteListProps) {
  return (
    <section className="flex h-full min-h-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-6">
        {onGoBack ? (
          <GoBackButton onClick={onGoBack} className="mb-4" />
        ) : null}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {subtitle ? (
              <p className="mt-2 text-sm text-muted">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onCreateNote}
            aria-label="Create New Note"
            className={cn(
              "absolute flex bottom-20 right-20 shrink-0 items-center justify-center rounded-4xl bg-brand text-white transition-colors hover:bg-brand-hover lg:hidden",
              "h-15 w-15",
            )}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onCreateNote}
          className="mt-4 hidden w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover lg:flex"
        >
          <Plus className="h-4 w-4" />
          Create New Note
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="px-5 py-4 text-sm text-muted">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted">No notes found.</p>
        ) : (
          notes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelect={onSelectNote}
            />
          ))
        )}
      </div>
    </section>
  );
}
