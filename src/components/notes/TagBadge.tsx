import { cn } from "@/lib/utils";

type TagBadgeProps = {
  tag: string;
  className?: string;
};

export function TagBadge({ tag, className }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-tag px-2.5 py-0.5 text-xs font-medium text-tag-foreground",
        className,
      )}
    >
      {tag}
    </span>
  );
}
