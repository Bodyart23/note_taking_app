import { Archive, ChevronLeft, Trash2 } from "lucide-react";

import { Logo } from "./Logo";

type MobileHeaderProps = {
  mode: "main" | "editor";
  onBack?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
};

export function MobileHeader({
  mode,
  onBack,
  onCancel,
  onSave,
  onDelete,
  onArchive,
}: MobileHeaderProps) {
  if (mode === "editor") {
    return (
      <header className="border-b border-border bg-surface">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            Go Back
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onArchive}
            >
              <Archive className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={onDelete}             
            >
              <Trash2 className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-medium text-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="text-sm font-medium text-brand"
            >
              Save Note
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-surface-muted px-4 py-4">
      <Logo />
    </header>
  );
}
