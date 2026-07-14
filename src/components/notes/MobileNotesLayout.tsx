"use client";

import type { Note } from "@/types/note";

import { SettingsPanel } from "@/components/settings/SettingsPanel";

import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { NoteEditor } from "./NoteEditor";
import { NoteList } from "./NoteList";
import { SearchBar } from "./SearchBar";
import { TagsList } from "./TagsList";
import type { DraftNote, MobileScreen } from "./note-helpers";
import type {
  MobileSettingsView,
  NotesActiveView,
} from "./hooks/useNotesNavigation";

type MobileNotesLayoutProps = {
  activeView: NotesActiveView;
  mobileScreen: MobileScreen;
  mobileSettingsView: MobileSettingsView;
  onMobileSettingsViewChange: (view: MobileSettingsView) => void;
  selectedTag: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showMobileSearch: boolean;
  listTitle: string;
  listSubtitle?: string;
  notes: Note[];
  tags: string[];
  selectedNoteId: string | null;
  editorNote: Note | null;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
  onMobileBack: () => void;
  onMobileNavigate: (view: NotesActiveView) => void;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onSelectTag: (tag: string) => void;
  onBackFromTagNotes: () => void;
  onDraftChange: (updates: Partial<DraftNote>) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onArchive: () => void;
};

export function MobileNotesLayout({
  activeView,
  mobileScreen,
  mobileSettingsView,
  onMobileSettingsViewChange,
  selectedTag,
  searchQuery,
  onSearchChange,
  showMobileSearch,
  listTitle,
  listSubtitle,
  notes,
  tags,
  selectedNoteId,
  editorNote,
  isDirty,
  isLoading,
  error,
  onMobileBack,
  onMobileNavigate,
  onSelectNote,
  onCreateNote,
  onSelectTag,
  onBackFromTagNotes,
  onDraftChange,
  onSave,
  onCancel,
  onDelete,
  onArchive,
}: MobileNotesLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col lg:hidden">
      <MobileHeader
        mode={mobileScreen === "editor" ? "editor" : "main"}
        onBack={onMobileBack}
        onCancel={onCancel}
        onSave={onSave}
        onDelete={onDelete}
        onArchive={onArchive}
      />

      {error ? (
        <p className="border-b border-border bg-error-bg px-4 py-2 text-sm text-error">
          {error}
        </p>
      ) : null}

      {mobileScreen === "editor" ? (
        <NoteEditor
          note={editorNote}
          isDirty={isDirty}
          variant="mobile"
          className="flex-1"
          onChange={onDraftChange}
          onSave={onSave}
          onCancel={onCancel}
        />
      ) : activeView === "settings" || mobileScreen === "settings" ? (
        <SettingsPanel
          className="flex-1"
          variant="mobile"
          mobileView={mobileSettingsView}
          onMobileViewChange={onMobileSettingsViewChange}
        />
      ) : mobileScreen === "tag-notes" && selectedTag ? (
        <NoteList
          title={listTitle}
          subtitle={listSubtitle}
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={onSelectNote}
          onCreateNote={onCreateNote}
          onGoBack={onBackFromTagNotes}
          isLoading={isLoading}
        />
      ) : activeView === "tags" || mobileScreen === "tags" ? (
        <TagsList tags={tags} onSelectTag={onSelectTag} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {showMobileSearch ? (
            <div className="border-b border-border px-4 py-3">
              <SearchBar value={searchQuery} onChange={onSearchChange} />
            </div>
          ) : null}

          <NoteList
            title={listTitle}
            subtitle={listSubtitle}
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={onSelectNote}
            onCreateNote={onCreateNote}
            isLoading={isLoading}
          />
        </div>
      )}

      {mobileScreen !== "editor" ? (
        <MobileBottomNav
          activeView={activeView}
          onNavigate={onMobileNavigate}
        />
      ) : null}
    </div>
  );
}
