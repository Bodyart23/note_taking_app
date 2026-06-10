import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  className,
  placeholder = "Search by title, content, or tags...",
}: SearchBarProps) {
  return (
    <label
      className={cn(
        "flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
      />
    </label>
  );
}
