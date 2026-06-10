import { Plus } from "lucide-react";

import type { Note } from "@/types/note";

import { NoteListItem } from "./NoteListItem";

type NoteListProps = {
  title: string;
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  isLoading?: boolean;
};

export function NoteList({
  title,
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  isLoading,
}: NoteListProps) {
  return (
    <section className="flex h-full min-h-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <button
          type="button"
          onClick={onCreateNote}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
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
