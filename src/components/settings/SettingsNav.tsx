import {
  ChevronRight,
  Lock,
  LogOut,
  Sun,
  Type,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { SettingsSection } from "@/types/theme";

type SettingsNavProps = {
  activeSection: SettingsSection;
  onSelect: (section: SettingsSection) => void;
  variant?: "sidebar" | "list";
  onNavigate?: (section: SettingsSection) => void;
};

const items = [
  { id: "color-theme" as const, label: "Color Theme", icon: Sun },
  { id: "font-theme" as const, label: "Font Theme", icon: Type },
  { id: "password" as const, label: "Change Password", icon: Lock },
];

export function SettingsNav({
  activeSection,
  onSelect,
  variant = "sidebar",
  onNavigate,
}: SettingsNavProps) {
  if (variant === "list") {
    return (
      <nav className="px-4 py-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    onNavigate?.(item.id);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
                >
                  <Icon className="h-5 w-5 text-muted" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted" />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="my-4 border-t border-border" />

        <button
          type="button"
          onClick={() => onSelect("logout")}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          <LogOut className="h-5 w-5 text-muted" />
          Logout
        </button>
      </nav>
    );
  }

  return (
    <nav className="w-56 shrink-0 border-r border-border bg-surface px-3 py-6">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-card-selected text-foreground"
                    : "text-foreground hover:bg-surface-muted",
                )}
              >
                <Icon className="h-4 w-4 text-muted" />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive ? <ChevronRight className="h-4 w-4 text-muted" /> : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="my-4 border-t border-border" />

      <button
        type="button"
        onClick={() => onSelect("logout")}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
      >
        <LogOut className="h-4 w-4 text-muted" />
        Logout
      </button>
    </nav>
  );
}
