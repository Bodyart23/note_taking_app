"use client";

import { ChevronLeft } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { SettingsSection } from "@/types/theme";

import { ColorThemeSettings } from "./ColorThemeSettings";
import { SettingsNav } from "./SettingsNav";
import { ChangePasswordSettings } from "./ChangePasswordSettings";

type SettingsPanelProps = {
  className?: string;
  variant?: "desktop" | "mobile";
  mobileView?: "menu" | "color-theme" | "password";
  onMobileViewChange?: (view: "menu" | "color-theme" | "password") => void;
};

function renderActiveSection(section: SettingsSection) {
  switch (section) {
    case "color-theme":
      return <ColorThemeSettings />;
    case "password":
      return <ChangePasswordSettings />;
    default:
      return <PlaceholderSection section={section} />;
  }
}

export function SettingsPanel({
  className,
  variant = "desktop",
  mobileView = "menu",
  onMobileViewChange,
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("color-theme");

  if (variant === "mobile" && mobileView === "menu") {
    return (
      <section className={cn("flex min-h-0 flex-1 flex-col bg-surface", className)}>
        <div className="px-4 py-5">
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        </div>
        <SettingsNav
          variant="list"
          activeSection={activeSection}
          onSelect={setActiveSection}
          onNavigate={(section) => {
            if (section === "color-theme" || section === "password") {
              onMobileViewChange?.(section);
            }
          }}
        />
      </section>
    );
  }

  if (variant === "mobile" && mobileView === "color-theme") {
    return (
      <section className={cn("flex min-h-0 flex-1 flex-col bg-surface", className)}>
        <button
          type="button"
          onClick={() => onMobileViewChange?.("menu")}
          className="flex items-center gap-1 px-4 py-4 text-sm font-medium text-muted"
        >
          <ChevronLeft className="h-4 w-4" />
          Settings
        </button>
        <ColorThemeSettings className="flex-1" />
      </section>
    );
  }

  if (variant === "mobile" && mobileView === "password") {
    return (
      <section className="flex min-h-0 flex-1 flex-col bg-surface">
        <button
          type="button"
          onClick={() => onMobileViewChange?.("menu")}
          className="flex items-center gap-1 px-4 py-4 text-sm font-medium text-muted"
        >
          <ChevronLeft className="h-4 w-4" />
          Settings
        </button>
        <ChangePasswordSettings />
      </section>
    );
  }

  return (
    <section className={cn("col-span-2 flex min-h-0 flex-col bg-surface", className)}>
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <h2 className="mr-4 text-2xl font-bold text-foreground">Settings</h2>
      </div>

      <div className="flex min-h-0 flex-1">
        <SettingsNav
          activeSection={activeSection}
          onSelect={setActiveSection}
        />

        <div className="min-w-0 flex-1 overflow-y-auto">
        {renderActiveSection(activeSection)}
        </div>
      </div>
    </section>
  );
}

function PlaceholderSection({ section }: { section: SettingsSection }) {
  const labels: Record<SettingsSection, string> = {
    "color-theme": "Color Theme",
    "font-theme": "Font Theme",
    password: "Change Password",
    logout: "Logout",
  };

  return (
    <div className="px-6 py-6 lg:px-8">
      <h3 className="text-xl font-bold text-foreground">{labels[section]}</h3>
      <p className="mt-2 text-sm text-muted">This section is coming soon.</p>
    </div>
  );
}
