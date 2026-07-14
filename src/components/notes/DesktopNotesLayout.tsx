"use client";

import { Settings } from "lucide-react";
import { Fragment } from "react";

import type { Note } from "@/types/note";

import { SettingsPanel } from "@/components/settings/SettingsPanel";

import { NoteActions } from "./NoteAction";
import { NoteEditor } from "./NoteEditor";
import { NoteList } from "./NoteList";
import { SearchBar } from "./SearchBar";
import { Sidebar, type NavView } from "./Sidebar";
import type { DraftNote } from "./note-helpers";
import type { NotesActiveView } from "./hooks/useNotesNavigation";

type DesktopNotesLayoutProps = {
  activeView: NotesActiveView;
  selectedTag: string | null;
  tags: string[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  listTitle: string;
  listSubtitle?: string;
  notes: Note[];
  selectedNoteId: string | null;
  editorNote: Note | null;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
  onDesktopNavigate: (view: NavView) => void;
  onDesktopSelectTag: (tag: string | null) => void;
  onOpenSettings: () => void;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDraftChange: (updates: Partial<DraftNote>) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onArchive: () => void;
};

export function DesktopNotesLayout({
  activeView,
  selectedTag,
  tags,
  searchQuery,
  onSearchChange,
  listTitle,
  listSubtitle,
  notes,
  selectedNoteId,
  editorNote,
  isDirty,
  isLoading,
  error,
  onDesktopNavigate,
  onDesktopSelectTag,
  onOpenSettings,
  onSelectNote,
  onCreateNote,
  onDraftChange,
  onSave,
  onCancel,
  onDelete,
  onArchive,
}: DesktopNotesLayoutProps) {
  return (
    <div className="hidden h-full lg:grid lg:grid-cols-[16rem_20rem_1fr]">
      <Sidebar
        activeView={activeView === "search" ? "all" : activeView}
        selectedTag={selectedTag}
        tags={tags}
        onNavigate={onDesktopNavigate}
        onSelectTag={onDesktopSelectTag}
        onOpenSettings={onOpenSettings}
      />

      {activeView === "settings" ? (
        <SettingsPanel variant="desktop" />
      ) : (
        <Fragment>
          <NoteList
            title={listTitle}
            subtitle={listSubtitle}
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={onSelectNote}
            onCreateNote={onCreateNote}
            isLoading={isLoading}
          />

          <div className="flex min-h-0 flex-col">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4 bg-surface">
              <SearchBar
                value={searchQuery}
                onChange={onSearchChange}
                className="flex-1"
              />
              <button
                type="button"
                onClick={onOpenSettings}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>

            {error ? (
              <p className="border-b border-border bg-error-bg px-6 py-2 text-sm text-error">
                {error}
              </p>
            ) : null}
            <div className="flex h-full flex-row">
              <NoteEditor
                note={editorNote}
                isDirty={isDirty}
                className="w-3/4"
                onChange={onDraftChange}
                onSave={onSave}
                onCancel={onCancel}
              />
              <NoteActions
                note={editorNote}
                onDelete={onDelete}
                onArchive={onArchive}
              />
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
}
