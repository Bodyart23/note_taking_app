import { Archive, Home, Search, Settings, Tag } from "lucide-react";

import { cn } from "@/lib/utils";

import type { NavView } from "./Sidebar";

type MobileBottomNavProps = {
  activeView: NavView | "search";
  onNavigate: (view: NavView | "search") => void;
};

const items = [
  { id: "all" as const, label: "Home", icon: Home },
  { id: "search" as const, label: "Search", icon: Search },
  { id: "archived" as const, label: "Archived", icon: Archive },
  { id: "tags" as const, label: "Tags", icon: Tag },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

export function MobileBottomNav({ activeView, onNavigate }: MobileBottomNavProps) {
  return (
    <nav className="grid grid-cols-5 border-t border-border bg-surface">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 border-r border-border px-2 py-3 last:border-r-0",
              isActive ? "text-brand" : "text-muted",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
