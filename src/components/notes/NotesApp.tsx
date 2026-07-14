"use client";

import { Archive, Settings, Trash2 } from "lucide-react";
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
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { NoteActions } from "./NoteAction";
import { NoteEditor } from "./NoteEditor";
import { NoteList } from "./NoteList";
import { SearchBar } from "./SearchBar";
import { Sidebar, type NavView } from "./Sidebar";
import { TagsList } from "./TagsList";

type MobileScreen = "list" | "editor" | "tags" | "tag-notes" | "settings";
type ConfirmAction = "delete" | "archive" | null;

type DraftNote = Pick<Note, "title" | "content" | "tags">;

const LOCAL_NOTE_PREFIX = "local-";

function isLocalNoteId(id: string): boolean {
  return id.startsWith(LOCAL_NOTE_PREFIX);
}

function createLocalNote(): Note {
  const now = new Date();

  return {
    id: `${LOCAL_NOTE_PREFIX}${crypto.randomUUID()}`,
    userId: "",
    title: "Untitled Note",
    content: "",
    tags: [],
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
}

function isDraftDirty(note: Note, draft: DraftNote): boolean {
  return (
    note.title !== draft.title ||
    note.content !== draft.content ||
    JSON.stringify(note.tags) !== JSON.stringify(draft.tags)
  );
}

export function NotesApp() {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
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
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goToArchivedNotes = () => {
    setActiveView("archived");
    setSelectedTag(null);
    setSearchQuery("");
    setMobileScreen("list");
  };

  const goToAllNotes = () => {
    setActiveView("all");
    setSelectedTag(null);
    setSearchQuery("");
    setMobileScreen("list");
  };

  const visibleNotes = useMemo(() => {
    const matchingPending = pendingNotes.filter((note) => {
      if (activeView === "archived") return note.isArchived;
      return !note.isArchived;
    });

    return [...matchingPending, ...notes];
  }, [activeView, notes, pendingNotes]);

  const selectedNote = useMemo(
    () => visibleNotes.find((note) => note.id === selectedNoteId) ?? null,
    [visibleNotes, selectedNoteId],
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
          // Pending local drafts live outside server results — keep them selected.
          if (preserveSelection && currentId && isLocalNoteId(currentId)) {
            return currentId;
          }

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

          if (currentId && isLocalNoteId(currentId) && currentDraft) {
            return currentDraft;
          }

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

  // Pending notes are filtered by view; drop selection if the draft left the list.
  useEffect(() => {
    if (
      !selectedNoteId ||
      !isLocalNoteId(selectedNoteId) ||
      visibleNotes.some((note) => note.id === selectedNoteId)
    ) {
      return;
    }

    const nextNote = visibleNotes[0] ?? null;
    setSelectedNoteId(nextNote?.id ?? null);
    setDraft(
      nextNote
        ? {
            title: nextNote.title,
            content: nextNote.content,
            tags: nextNote.tags,
          }
        : null,
    );
  }, [selectedNoteId, visibleNotes]);

  const selectNote = (id: string) => {
    const note = visibleNotes.find((item) => item.id === id);
    if (!note) return;

    setSelectedNoteId(id);
    setDraft({
      title: note.title,
      content: note.content,
      tags: note.tags,
    });
    setMobileScreen("editor");
  };

  const handleCreateNote = () => {
    const note = createLocalNote();
    setPendingNotes((current) => [note, ...current]);
    setSelectedNoteId(note.id);
    setDraft({
      title: note.title,
      content: note.content,
      tags: note.tags,
    });
    setActiveView("all");
    setSelectedTag(null);
    setError(null);
    setMobileScreen("editor");
  };

  const handleSave = async () => {
    if (!selectedNoteId || !draft) return;

    try {
      if (isLocalNoteId(selectedNoteId)) {
        const created = await createNote({
          ...draft,
          isArchived: selectedNote?.isArchived ?? false,
        });
        setPendingNotes((current) =>
          current.filter((note) => note.id !== selectedNoteId),
        );
        setNotes((current) => [created, ...current]);
        setSelectedNoteId(created.id);
        setDraft({
          title: created.title,
          content: created.content,
          tags: created.tags,
        });
      } else {
        const updated = await updateNote(selectedNoteId, draft);
        setNotes((current) =>
          current.map((note) => (note.id === updated.id ? updated : note)),
        );
        setDraft({
          title: updated.title,
          content: updated.content,
          tags: updated.tags,
        });
      }

      await loadTags();
      setMobileScreen(selectedTag ? "tag-notes" : "list");
      showToast({ message: "Note saved successfully!" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    }
  };

  const discardPendingNote = (discardedId: string) => {
    setPendingNotes((current) => {
      const remainingPending = current.filter((note) => note.id !== discardedId);
      const matchingPending = remainingPending.filter((note) =>
        activeView === "archived" ? note.isArchived : !note.isArchived,
      );
      const nextNote = matchingPending[0] ?? notes[0] ?? null;

      setSelectedNoteId(nextNote?.id ?? null);
      setDraft(
        nextNote
          ? {
              title: nextNote.title,
              content: nextNote.content,
              tags: nextNote.tags,
            }
          : null,
      );

      return remainingPending;
    });
  };

  const handleCancel = () => {
    if (!selectedNote) return;

    if (isLocalNoteId(selectedNote.id)) {
      discardPendingNote(selectedNote.id);
      setMobileScreen(selectedTag ? "tag-notes" : "list");
      return;
    }

    setDraft({
      title: selectedNote.title,
      content: selectedNote.content,
      tags: selectedNote.tags,
    });
    setMobileScreen(selectedTag ? "tag-notes" : "list");
  };

  const handleDelete = async () => {
    if (!selectedNoteId) return;

    setIsConfirming(true);
    try {
      if (isLocalNoteId(selectedNoteId)) {
        discardPendingNote(selectedNoteId);
        setConfirmAction(null);
        setMobileScreen(selectedTag ? "tag-notes" : "list");
        showToast({ message: "Note permanently deleted." });
        return;
      }

      await deleteNote(selectedNoteId);
      setSelectedNoteId(null);
      setDraft(null);
      setConfirmAction(null);
      await loadNotes();
      await loadTags();
      setMobileScreen(selectedTag ? "tag-notes" : "list");
      showToast({ message: "Note permanently deleted." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    } finally {
      setIsConfirming(false);
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

    const wasArchived = selectedNote.isArchived;

    setIsConfirming(true);
    try {
      // Unsaved notes stay local — archive toggles client state until Save Note.
      if (isLocalNoteId(selectedNoteId)) {
        setPendingNotes((current) =>
          current.map((note) =>
            note.id === selectedNoteId
              ? { ...note, isArchived: !note.isArchived }
              : note,
          ),
        );
        setSelectedNoteId(null);
        setDraft(null);
        setConfirmAction(null);
        setMobileScreen(selectedTag ? "tag-notes" : "list");
        showToast(
          wasArchived
            ? {
                message: "Note restored to active notes.",
                action: { label: "All Notes", onClick: goToAllNotes },
              }
            : {
                message: "Note archived.",
                action: {
                  label: "Archived Notes",
                  onClick: goToArchivedNotes,
                },
              },
        );
        return;
      }

      const updated = await updateNote(selectedNoteId, {
        isArchived: !selectedNote.isArchived,
      });
      setNotes((current) =>
        current.map((note) => (note.id === updated.id ? updated : note)),
      );
      setConfirmAction(null);
      await loadNotes();
      await loadTags();
      showToast(
        wasArchived
          ? {
              message: "Note restored to active notes.",
              action: { label: "All Notes", onClick: goToAllNotes },
            }
          : {
              message: "Note archived.",
              action: {
                label: "Archived Notes",
                onClick: goToArchivedNotes,
              },
            },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive note");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleConfirm = () => {
    if (confirmAction === "delete") {
      void handleDelete();
      return;
    }

    if (confirmAction === "archive") {
      void handleArchive();
    }
  };

  const isArchivedNote = Boolean(selectedNote?.isArchived);

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
              notes={visibleNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={selectNote}
              onCreateNote={handleCreateNote}
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
                  onDelete={() => setConfirmAction("delete")}
                  onArchive={() => setConfirmAction("archive")}
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
          onDelete={() => setConfirmAction("delete")}
          onArchive={() => setConfirmAction("archive")}
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
            notes={visibleNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={selectNote}
            onCreateNote={handleCreateNote}
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
              notes={visibleNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={selectNote}
              onCreateNote={handleCreateNote}
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

      <ConfirmModal
        open={confirmAction === "delete"}
        title="Delete Note"
        description="Are you sure you want to permanently delete this note? This action cannot be undone."
        icon={<Trash2 className="h-5 w-5" strokeWidth={1.75} />}
        confirmLabel="Delete Note"
        variant="danger"
        isConfirming={isConfirming}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!isConfirming) setConfirmAction(null);
        }}
      />

      <ConfirmModal
        open={confirmAction === "archive"}
        title={isArchivedNote ? "Unarchive Note" : "Archive Note"}
        description={
          isArchivedNote
            ? "Are you sure you want to unarchive this note? It will appear in All Notes again."
            : "Are you sure you want to archive this note? You can find it in the Archived Notes section and restore it anytime."
        }
        icon={<Archive className="h-5 w-5" strokeWidth={1.75} />}
        confirmLabel={isArchivedNote ? "Unarchive Note" : "Archive Note"}
        variant="primary"
        isConfirming={isConfirming}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!isConfirming) setConfirmAction(null);
        }}
      />
    </div>
  );
}
