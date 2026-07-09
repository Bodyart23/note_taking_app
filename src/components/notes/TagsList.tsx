import { Tag } from "lucide-react";

type TagsListProps = {
  tags: string[];
  onSelectTag: (tag: string) => void;
};

export function TagsList({ tags, onSelectTag }: TagsListProps) {
  return (
    <section className="flex-1 overflow-y-auto bg-surface">
      <div className="px-4 py-5">
        <h2 className="text-2xl font-bold text-foreground">Tags</h2>
      </div>

      <ul>
        {tags.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">No tags yet.</li>
        ) : (
          tags.map((tag) => (
            <li key={tag} className="border-b border-border">
              <button
                type="button"
                onClick={() => onSelectTag(tag)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                <Tag className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.75} />
                {tag}
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
