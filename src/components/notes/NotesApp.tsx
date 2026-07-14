"use client";

import { DesktopNotesLayout } from "./DesktopNotesLayout";
import { MobileNotesLayout } from "./MobileNotesLayout";
import { NoteConfirmModals } from "./NoteConfirmModals";
import { useNotesData } from "./hooks/useNotesData";
import { useNotesNavigation } from "./hooks/useNotesNavigation";

export function NotesApp() {
  const nav = useNotesNavigation();
  const data = useNotesData({
    activeView: nav.activeView,
    searchQuery: nav.searchQuery,
    selectedTag: nav.selectedTag,
    applyTagFilter: nav.applyTagFilter,
    goToAllNotes: nav.goToAllNotes,
    goToArchivedNotes: nav.goToArchivedNotes,
    enterEditor: nav.enterEditor,
    leaveEditor: nav.leaveEditor,
    navigateForCreateNote: nav.navigateForCreateNote,
  });

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <DesktopNotesLayout
        activeView={nav.activeView}
        selectedTag={nav.selectedTag}
        tags={data.tags}
        searchQuery={nav.searchQuery}
        onSearchChange={nav.setSearchQuery}
        listTitle={nav.listTitle}
        listSubtitle={nav.listSubtitle}
        notes={data.visibleNotes}
        selectedNoteId={data.selectedNoteId}
        editorNote={data.editorNote}
        isDirty={data.isDirty}
        isLoading={data.isLoading}
        error={data.error}
        onDesktopNavigate={nav.handleDesktopNavigate}
        onDesktopSelectTag={nav.handleDesktopSelectTag}
        onOpenSettings={nav.handleOpenSettings}
        onSelectNote={data.selectNote}
        onCreateNote={data.handleCreateNote}
        onDraftChange={data.handleDraftChange}
        onSave={() => void data.handleSave()}
        onCancel={data.handleCancel}
        onDelete={data.requestDelete}
        onArchive={data.requestArchive}
      />

      <MobileNotesLayout
        activeView={nav.activeView}
        mobileScreen={nav.mobileScreen}
        mobileSettingsView={nav.mobileSettingsView}
        onMobileSettingsViewChange={nav.setMobileSettingsView}
        selectedTag={nav.selectedTag}
        searchQuery={nav.searchQuery}
        onSearchChange={nav.setSearchQuery}
        showMobileSearch={nav.showMobileSearch}
        listTitle={nav.listTitle}
        listSubtitle={nav.listSubtitle}
        notes={data.visibleNotes}
        tags={data.tags}
        selectedNoteId={data.selectedNoteId}
        editorNote={data.editorNote}
        isDirty={data.isDirty}
        isLoading={data.isLoading}
        error={data.error}
        onMobileBack={nav.handleMobileBack}
        onMobileNavigate={nav.handleMobileNavigate}
        onSelectNote={data.selectNote}
        onCreateNote={data.handleCreateNote}
        onSelectTag={nav.handleSelectTag}
        onBackFromTagNotes={nav.handleBackFromTagNotes}
        onDraftChange={data.handleDraftChange}
        onSave={() => void data.handleSave()}
        onCancel={data.handleCancel}
        onDelete={data.requestDelete}
        onArchive={data.requestArchive}
      />

      <NoteConfirmModals
        confirmAction={data.confirmAction}
        isConfirming={data.isConfirming}
        isArchivedNote={data.isArchivedNote}
        onConfirm={data.handleConfirm}
        onCancel={data.clearConfirmAction}
      />
    </div>
  );
}
