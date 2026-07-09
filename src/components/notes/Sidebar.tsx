import { Archive, ChevronRight, Home, Settings, Tag } from "lucide-react";

import { cn } from "@/lib/utils";

import { Logo } from "./Logo";

export type NavView = "all" | "archived" | "tags" | "settings";

type SidebarProps = {
  activeView: NavView;
  selectedTag: string | null;
  tags: string[];
  onNavigate: (view: NavView) => void;
  onSelectTag: (tag: string | null) => void;
  onOpenSettings?: () => void;
};

export function Sidebar({
  activeView,
  selectedTag,
  tags,
  onNavigate,
  onSelectTag,
  onOpenSettings,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface-muted">
      <div className="border-b border-border px-5 py-6">
        <Logo />
      </div>

      <nav className="border-b border-border px-3 py-4">
        <SidebarLink
          icon={Home}
          label="All Notes"
          isActive={activeView === "all" && !selectedTag}
          showChevron
          onClick={() => {
            onSelectTag(null);
            onNavigate("all");
          }}
        />
        <SidebarLink
          icon={Archive}
          label="Archived Notes"
          isActive={activeView === "archived"}
          onClick={() => {
            onSelectTag(null);
            onNavigate("archived");
          }}
        />
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 text-sm font-medium text-muted">Tags</p>
        <ul className="mt-2 space-y-1">
          {tags.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onClick={() => {
                  onNavigate("all");
                  onSelectTag(tag);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  selectedTag === tag
                    ? "bg-brand text-white"
                    : "text-foreground hover:bg-surface",
                )}
              >
                <Tag
                  className={cn(
                    "h-4 w-4",
                    selectedTag === tag ? "text-white" : "text-muted",
                  )}
                />
                <span className="flex-1 text-left">{tag}</span>
                {selectedTag === tag ? (
                  <ChevronRight className="h-4 w-4 text-white" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border px-3 py-4">
        <SidebarLink
          icon={Settings}
          label="Settings"
          isActive={activeView === "settings"}
          onClick={() => {
            onOpenSettings?.();
            onNavigate("settings");
          }}
        />
      </div>
    </aside>
  );
}

type SidebarLinkProps = {
  icon: typeof Home;
  label: string;
  isActive?: boolean;
  showChevron?: boolean;
  onClick: () => void;
};

function SidebarLink({
  icon: Icon,
  label,
  isActive,
  showChevron,
  onClick,
}: SidebarLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-selected text-brand"
          : "text-foreground hover:bg-surface",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      {showChevron && isActive ? (
        <ChevronRight className="h-4 w-4 text-brand" />
      ) : null}
    </button>
  );
}
