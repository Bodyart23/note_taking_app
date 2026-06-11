import { cn, formatNoteDate } from "@/lib/utils";
import type { Note } from "@/types/note";

import { TagBadge } from "./TagBadge";

type NoteListItemProps = {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export function NoteListItem({ note, isSelected, onSelect }: NoteListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(note.id)}
      className={cn(
        "w-full px-5 py-4 text-left transition-colors",
        isSelected
          ? "mx-2 my-1 w-[calc(100%-1rem)] rounded-lg bg-selected"
          : "border-b border-border hover:bg-surface-muted",
      )}
    >
      <h3 className="text-base font-bold text-foreground">{note.title}</h3>
      {note.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      ) : null}
      <p className="mt-2 text-xs text-muted">{formatNoteDate(note.updatedAt)}</p>
    </button>
  );
}
