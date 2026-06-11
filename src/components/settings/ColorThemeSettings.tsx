"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { ColorTheme } from "@/types/theme";

const themeOptions = [
  {
    id: "light" as const,
    label: "Light Mode",
    description: "Pick a clean and classic light theme",
    icon: Sun,
  },
  {
    id: "dark" as const,
    label: "Dark Mode",
    description: "Select a sleek and modern dark theme",
    icon: Moon,
  },
  {
    id: "system" as const,
    label: "System",
    description: "Adapts to your device's theme",
    icon: Monitor,
  },
];

type ColorThemeSettingsProps = {
  className?: string;
};

type ColorThemeFormProps = {
  className?: string;
  theme: ColorTheme;
  resolvedTheme?: string;
  setTheme: (theme: ColorTheme) => void;
};

export function ColorThemeSettings({ className }: ColorThemeSettingsProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (!theme) {
    return (
      <div className={cn("px-6 py-6 lg:px-8", className)}>
        <p className="text-sm text-muted">Loading theme settings...</p>
      </div>
    );
  }

  return (
    <ColorThemeForm
      key={theme}
      className={className}
      theme={theme as ColorTheme}
      resolvedTheme={resolvedTheme}
      setTheme={setTheme}
    />
  );
}

function ColorThemeForm({
  className,
  theme,
  resolvedTheme,
  setTheme,
}: ColorThemeFormProps) {
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(theme);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col px-6 py-6 lg:px-8", className)}>
      <div>
        <h3 className="text-xl font-bold text-foreground">Color Theme</h3>
        <p className="mt-1 text-sm text-muted">Choose your color theme:</p>
      </div>

      <div className="mt-6 space-y-3">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedTheme === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedTheme(option.id)}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-colors",
                isSelected
                  ? "border-brand bg-card-selected"
                  : "border-border bg-surface hover:bg-surface-muted",
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                <Icon className="h-5 w-5 text-foreground" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {option.description}
                </span>
              </span>

              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  isSelected
                    ? "border-brand bg-brand"
                    : "border-radio-border bg-transparent",
                )}
                aria-hidden="true"
              >
                {isSelected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {resolvedTheme ? (
          <p className="mr-auto text-xs text-muted">
            Active: {theme === "system" ? `System (${resolvedTheme})` : resolvedTheme}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setTheme(selectedTheme)}
          disabled={selectedTheme === theme}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}
