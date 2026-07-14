"use client";

import { Settings } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import {
  createNote,
  deleteNote,
  fetchNotes,
  fetchTags,
  updateNote,
} from "@/lib/api-client";
import type { Note } from "@/types/note";

import { SettingsPanel } from "@/components/settings/SettingsPanel";

import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { NoteActions } from "./NoteAction";
import { NoteEditor } from "./NoteEditor";
import { NoteList } from "./NoteList";
import { SearchBar } from "./SearchBar";
import { Sidebar, type NavView } from "./Sidebar";
import { TagsList } from "./TagsList";

type MobileScreen = "list" | "editor" | "tags" | "tag-notes" | "settings";

type DraftNote = Pick<Note, "title" | "content" | "tags">;

function isDraftDirty(note: Note, draft: DraftNote): boolean {
  return (
    note.title !== draft.title ||
    note.content !== draft.content ||
    JSON.stringify(note.tags) !== JSON.stringify(draft.tags)
  );
}

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftNote | null>(null);
  const [activeView, setActiveView] = useState<NavView | "search">("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>("list");
  const [mobileSettingsView, setMobileSettingsView] = useState<
    "menu" | "color-theme" | "password"
  >("menu");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const editorNote = useMemo(() => {
    if (!selectedNote || !draft) return null;
    return { ...selectedNote, ...draft };
  }, [selectedNote, draft]);

  const isDirty =
    selectedNote && draft ? isDraftDirty(selectedNote, draft) : false;

  const isMobileTagList = activeView === "tags" && mobileScreen === "tags";
  const applyTagFilter = selectedTag !== null && !isMobileTagList;

  const loadNotes = useCallback(
    async (preserveSelection = true) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchNotes({
          archived: activeView === "archived",
          search: searchQuery || undefined,
          tag: applyTagFilter ? (selectedTag ?? undefined) : undefined,
        });

        setNotes(data);
        setSelectedNoteId((currentId) => {
          if (
            preserveSelection &&
            currentId &&
            data.some((note) => note.id === currentId)
          ) {
            return currentId;
          }

          return data[0]?.id ?? null;
        });
        setDraft((currentDraft) => {
          const currentId = preserveSelection ? selectedNoteId : null;
          const nextId =
            currentId && data.some((note) => note.id === currentId)
              ? currentId
              : (data[0]?.id ?? null);
          const nextNote = data.find((note) => note.id === nextId);

          if (!nextNote) {
            return null;
          }

          if (preserveSelection && currentDraft && nextId === currentId) {
            return currentDraft;
          }

          return {
            title: nextNote.title,
            content: nextNote.content,
            tags: nextNote.tags,
          };
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notes");
      } finally {
        setIsLoading(false);
      }
    },
    [activeView, applyTagFilter, searchQuery, selectedNoteId, selectedTag],
  );

  const loadTags = useCallback(async () => {
    try {
      const data = await fetchTags();
      setTags(data);
    } catch {
      setTags([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await loadNotes();
      if (!cancelled) {
        await loadTags();
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [loadNotes, loadTags]);

  const selectNote = (id: string) => {
    const note = notes.find((item) => item.id === id);
    if (!note) return;

    setSelectedNoteId(id);
    setDraft({
      title: note.title,
      content: note.content,
      tags: note.tags,
    });
    setMobileScreen("editor");
  };

  const handleCreateNote = async () => {
    try {
      const note = await createNote();
      setNotes((current) => [note, ...current]);
      setSelectedNoteId(note.id);
      setDraft({
        title: note.title,
        content: note.content,
        tags: note.tags,
      });
      setActiveView("all");
      setSelectedTag(null);
      setMobileScreen("editor");
      await loadTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    }
  };

  const handleSave = async () => {
    if (!selectedNoteId || !draft) return;

    try {
      const updated = await updateNote(selectedNoteId, draft);
      setNotes((current) =>
        current.map((note) => (note.id === updated.id ? updated : note)),
      );
      setDraft({
        title: updated.title,
        content: updated.content,
        tags: updated.tags,
      });
      await loadTags();
      setMobileScreen(selectedTag ? "tag-notes" : "list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    }
  };

  const handleCancel = () => {
    if (!selectedNote) return;

    setDraft({
      title: selectedNote.title,
      content: selectedNote.content,
      tags: selectedNote.tags,
    });
    setMobileScreen(selectedTag ? "tag-notes" : "list");
  };

  const handleDelete = async () => {
    if (!selectedNoteId) return;

    try {
      await deleteNote(selectedNoteId);
      setSelectedNoteId(null);
      setDraft(null);
      await loadNotes();
      await loadTags();
      setMobileScreen(selectedTag ? "tag-notes" : "list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const handleBackFromTagNotes = () => {
    setSelectedTag(null);
    setMobileScreen("tags");
  };

  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag);
    setActiveView("tags");
    setMobileScreen("tag-notes");
    setSearchQuery("");
  };

  const handleArchive = async () => {
    if (!selectedNoteId || !selectedNote) return;

    try {
      const updated = await updateNote(selectedNoteId, {
        isArchived: !selectedNote.isArchived,
      });
      setNotes((current) =>
        current.map((note) => (note.id === updated.id ? updated : note)),
      );
      await loadNotes();
      await loadTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive note");
    }
  };

  const listTitle =
    activeView === "archived"
      ? "Archived Notes"
      : applyTagFilter && selectedTag
        ? `Notes Tagged: ${selectedTag}`
        : "All Notes";

  const listSubtitle =
    applyTagFilter && selectedTag
      ? `All notes with the '${selectedTag}' tag are shown here.`
      : undefined;

  const showMobileSearch = activeView === "search" && mobileScreen === "list";

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <div className="hidden h-full lg:grid lg:grid-cols-[16rem_20rem_1fr]">
        <Sidebar
          activeView={activeView === "search" ? "all" : activeView}
          selectedTag={selectedTag}
          tags={tags}
          onNavigate={(view) => {
            setActiveView(view);
            setSearchQuery("");
            if (view !== "all") {
              setSelectedTag(null);
            }
          }}
          onSelectTag={(tag) => {
            setSelectedTag(tag);
            setActiveView("all");
            setSearchQuery("");
          }}
          onOpenSettings={() => setActiveView("settings")}
        />

        {activeView === "settings" ? (
          <SettingsPanel
            variant="desktop"
          />
        ) : (
          <Fragment>
            <NoteList
              title={listTitle}
              subtitle={listSubtitle}
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelectNote={selectNote}
              onCreateNote={() => void handleCreateNote()}
              isLoading={isLoading}
            />

            <div className="flex min-h-0 flex-col">
              <div className="flex items-center gap-3 border-b border-border px-6 py-4 bg-surface">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setActiveView("settings")}
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
                  isDirty={Boolean(isDirty)}
                  className="w-3/4"
                  onChange={(updates) =>
                    setDraft((current) =>
                      current ? { ...current, ...updates } : current,
                    )
                  }
                  onSave={() => void handleSave()}
                  onCancel={handleCancel}
                />
                <NoteActions
                  note={editorNote}
                  onDelete={() => void handleDelete()}
                  onArchive={() => void handleArchive()}
                />
              </div>
            </div>
          </Fragment>
        )}
      </div>

      <div className="flex h-full min-h-0 flex-col lg:hidden">
        <MobileHeader
          mode={mobileScreen === "editor" ? "editor" : "main"}
          onBack={() => setMobileScreen(selectedTag ? "tag-notes" : "list")}
          onCancel={handleCancel}
          onSave={() => void handleSave()}
          onDelete={() => void handleDelete()}
          onArchive={() => void handleArchive()}
        />

        {error ? (
          <p className="border-b border-border bg-error-bg px-4 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}

        {mobileScreen === "editor" ? (
          <NoteEditor
            note={editorNote}
            isDirty={Boolean(isDirty)}
            variant="mobile"
            className="flex-1"
            onChange={(updates) =>
              setDraft((current) =>
                current ? { ...current, ...updates } : current,
              )
            }
            onSave={() => void handleSave()}
            onCancel={handleCancel}
          />
        ) : activeView === "settings" || mobileScreen === "settings" ? (
          <SettingsPanel
            className="flex-1"
            variant="mobile"
            mobileView={mobileSettingsView}
            onMobileViewChange={setMobileSettingsView}
          />
        ) : mobileScreen === "tag-notes" && selectedTag ? (
          <NoteList
            title={listTitle}
            subtitle={listSubtitle}
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={selectNote}
            onCreateNote={() => void handleCreateNote()}
            onGoBack={handleBackFromTagNotes}
            isLoading={isLoading}
          />
        ) : activeView === "tags" || mobileScreen === "tags" ? (
          <TagsList tags={tags} onSelectTag={handleSelectTag} />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {showMobileSearch ? (
              <div className="border-b border-border px-4 py-3">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
            ) : null}

            <NoteList
              title={listTitle}
              subtitle={listSubtitle}
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelectNote={selectNote}
              onCreateNote={() => void handleCreateNote()}
              isLoading={isLoading}
            />
          </div>
        )}

        {mobileScreen !== "editor" ? (
          <MobileBottomNav
            activeView={activeView}
            onNavigate={(view) => {
              setActiveView(view);
              setSearchQuery("");
              if (view === "tags") {
                setSelectedTag(null);
                setMobileScreen("tags");
              } else if (view === "settings") {
                setSelectedTag(null);
                setMobileScreen("settings");
                setMobileSettingsView("menu");
              } else {
                setSelectedTag(null);
                setMobileScreen("list");
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
