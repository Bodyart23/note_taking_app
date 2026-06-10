"use client";

import { Settings } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createNote,
  deleteNote,
  fetchNotes,
  fetchTags,
  updateNote,
} from "@/lib/api-client";
import type { Note } from "@/types/note";

import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { NoteEditor } from "./NoteEditor";
import { NoteList } from "./NoteList";
import { SearchBar } from "./SearchBar";
import { Sidebar, type NavView } from "./Sidebar";

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
  const [mobileScreen, setMobileScreen] = useState<"list" | "editor" | "tags" | "settings">(
    "list",
  );
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

  const isDirty = selectedNote && draft ? isDraftDirty(selectedNote, draft) : false;

  const loadNotes = useCallback(
    async (preserveSelection = true) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchNotes({
          archived: activeView === "archived",
          search: searchQuery || undefined,
          tag: selectedTag ?? undefined,
        });

        setNotes(data);
        setSelectedNoteId((currentId) => {
          if (preserveSelection && currentId && data.some((note) => note.id === currentId)) {
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
    [activeView, searchQuery, selectedNoteId, selectedTag],
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
      setMobileScreen("list");
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
    setMobileScreen("list");
  };

  const handleDelete = async () => {
    if (!selectedNoteId) return;

    try {
      await deleteNote(selectedNoteId);
      setSelectedNoteId(null);
      setDraft(null);
      await loadNotes();
      await loadTags();
      setMobileScreen("list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
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
      : selectedTag
        ? selectedTag
        : "All Notes";

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
          }}
          onSelectTag={setSelectedTag}
          onOpenSettings={() => setActiveView("settings")}
        />

        {activeView === "settings" ? (
          <SettingsPanel className="col-span-2" />
        ) : (
          <>
            <NoteList
              title={listTitle}
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelectNote={selectNote}
              onCreateNote={() => void handleCreateNote()}
              isLoading={isLoading}
            />

            <div className="flex min-h-0 flex-col">
              <div className="flex items-center gap-3 border-b border-border px-6 py-4">
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
                <p className="border-b border-border bg-red-50 px-6 py-2 text-sm text-red-600">
                  {error}
                </p>
              ) : null}

              <NoteEditor
                note={editorNote}
                isDirty={Boolean(isDirty)}
                onChange={(updates) =>
                  setDraft((current) => (current ? { ...current, ...updates } : current))
                }
                onSave={() => void handleSave()}
                onCancel={handleCancel}
                onDelete={() => void handleDelete()}
                onArchive={() => void handleArchive()}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex h-full min-h-0 flex-col lg:hidden">
        <MobileHeader
          mode={mobileScreen === "editor" ? "editor" : "main"}
          onBack={() => setMobileScreen("list")}
          onCancel={handleCancel}
          onSave={() => void handleSave()}
        />

        {error ? (
          <p className="border-b border-border bg-red-50 px-4 py-2 text-sm text-red-600">
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
              setDraft((current) => (current ? { ...current, ...updates } : current))
            }
            onSave={() => void handleSave()}
            onCancel={handleCancel}
          />
        ) : activeView === "settings" || mobileScreen === "settings" ? (
          <SettingsPanel className="flex-1" />
        ) : activeView === "tags" || mobileScreen === "tags" ? (
          <MobileTagsPanel
            tags={tags}
            selectedTag={selectedTag}
            onSelectTag={(tag) => {
              setSelectedTag(tag);
              setActiveView("all");
              setMobileScreen("list");
            }}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {showMobileSearch ? (
              <div className="border-b border-border px-4 py-3">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
            ) : null}

            <NoteList
              title={listTitle}
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
              if (view === "tags") {
                setMobileScreen("tags");
              } else if (view === "settings") {
                setMobileScreen("settings");
              } else {
                setMobileScreen("list");
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function SettingsPanel({ className = "" }: { className?: string }) {
  return (
    <section className={`bg-surface ${className}`}>
      <div className="border-b border-border px-6 py-6">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>
      <div className="px-6 py-6 text-sm text-muted">
        <p>Notes are stored locally in `data/notes.json` on the server.</p>
        <p className="mt-2">
          Use the archive action in the editor to move notes to Archived Notes.
        </p>
      </div>
    </section>
  );
}

function MobileTagsPanel({
  tags,
  selectedTag,
  onSelectTag,
}: {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string) => void;
}) {
  return (
    <section className="flex-1 overflow-y-auto px-4 py-4">
      <h2 className="text-xl font-bold">Tags</h2>
      <ul className="mt-4 space-y-2">
        {tags.map((tag) => (
          <li key={tag}>
            <button
              type="button"
              onClick={() => onSelectTag(tag)}
              className={`w-full rounded-lg border border-border px-4 py-3 text-left text-sm ${
                selectedTag === tag ? "bg-selected" : "bg-surface"
              }`}
            >
              {tag}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
