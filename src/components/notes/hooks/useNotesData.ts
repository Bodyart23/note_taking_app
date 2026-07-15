"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createNote,
  deleteNote,
  fetchNotes,
  fetchTags,
  updateNote,
} from "@/lib/api-client";
import type { Note } from "@/types/note";

import { useToast } from "@/components/ui/Toast";

import type { NotesActiveView } from "./useNotesNavigation";
import {
  type ConfirmAction,
  type DraftNote,
  createLocalNote,
  draftFromNote,
  isDraftDirty,
  isLocalNoteId,
} from "../note-helpers";

type UseNotesDataOptions = {
  initialNotes?: Note[];
  initialTags?: string[];
  activeView: NotesActiveView;
  searchQuery: string;
  selectedTag: string | null;
  applyTagFilter: boolean;
  goToAllNotes: () => void;
  goToArchivedNotes: () => void;
  enterEditor: () => void;
  leaveEditor: () => void;
  navigateForCreateNote: () => void;
};

export function useNotesData({
  initialNotes,
  initialTags,
  activeView,
  searchQuery,
  selectedTag,
  applyTagFilter,
  goToAllNotes,
  goToArchivedNotes,
  enterEditor,
  leaveEditor,
  navigateForCreateNote,
}: UseNotesDataOptions) {
  const { showToast } = useToast();
  const hasInitialData = initialNotes !== undefined;
  const [notes, setNotes] = useState<Note[]>(initialNotes ?? []);
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags ?? []);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    initialNotes?.[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<DraftNote | null>(
    initialNotes?.[0] ? draftFromNote(initialNotes[0]) : null,
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);

  // The server already rendered the default view's data, so the first
  // client-side load effect would just refetch the same thing. Skip it once.
  const skipInitialLoadRef = useRef(hasInitialData);

  // Mirror of `selectedNoteId` so `loadNotes` can read the current selection
  // without depending on it. Depending on `selectedNoteId` directly would
  // recreate `loadNotes` after the initial fetch selects a note, re-running
  // the load effect and firing every request a second time.
  const selectedNoteIdRef = useRef(selectedNoteId);
  useEffect(() => {
    selectedNoteIdRef.current = selectedNoteId;
  }, [selectedNoteId]);

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

  const loadNotes = useCallback(
    async (preserveSelection = true, signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchNotes(
          {
            archived: activeView === "archived",
            search: searchQuery || undefined,
            tag: applyTagFilter ? (selectedTag ?? undefined) : undefined,
          },
          signal,
        );

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
          const currentId = preserveSelection
            ? selectedNoteIdRef.current
            : null;

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

          return draftFromNote(nextNote);
        });
      } catch (err) {
        // An aborted request means a newer load superseded this one (or the
        // component unmounted) — don't surface it as an error.
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load notes");
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [activeView, applyTagFilter, searchQuery, selectedTag],
  );

  const loadTags = useCallback(
    async (signal?: AbortSignal) => {
      try {
        // Tags are scoped to the current view: unarchived tags for All Notes,
        // archived-note tags for Archived Notes.
        const data = await fetchTags(
          { archived: activeView === "archived" },
          signal,
        );
        setTags(data);
      } catch {
        if (!signal?.aborted) {
          setTags([]);
        }
      }
    },
    [activeView],
  );

  useEffect(() => {
    if (skipInitialLoadRef.current) {
      skipInitialLoadRef.current = false;
      return;
    }

    const controller = new AbortController();

    async function load() {
      await loadNotes(true, controller.signal);
      if (!controller.signal.aborted) {
        await loadTags(controller.signal);
      }
    }

    void load();

    return () => {
      // Abort in-flight requests when the effect re-runs (filters changed) or
      // the component unmounts, so stale responses never hit the network twice
      // or overwrite fresh state.
      controller.abort();
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
    setDraft(nextNote ? draftFromNote(nextNote) : null);
  }, [selectedNoteId, visibleNotes]);

  const selectNote = (id: string) => {
    const note = visibleNotes.find((item) => item.id === id);
    if (!note) return;

    setSelectedNoteId(id);
    setDraft(draftFromNote(note));
    enterEditor();
  };

  const handleCreateNote = () => {
    const note = createLocalNote();
    setPendingNotes((current) => [note, ...current]);
    setSelectedNoteId(note.id);
    setDraft(draftFromNote(note));
    setError(null);
    navigateForCreateNote();
  };

  const handleDraftChange = (updates: Partial<DraftNote>) => {
    setDraft((current) => (current ? { ...current, ...updates } : current));
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
        setDraft(draftFromNote(created));
      } else {
        const updated = await updateNote(selectedNoteId, draft);
        setNotes((current) =>
          current.map((note) => (note.id === updated.id ? updated : note)),
        );
        setDraft(draftFromNote(updated));
      }

      await loadTags();
      leaveEditor();
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
      setDraft(nextNote ? draftFromNote(nextNote) : null);

      return remainingPending;
    });
  };

  const handleCancel = () => {
    if (!selectedNote) return;

    if (isLocalNoteId(selectedNote.id)) {
      discardPendingNote(selectedNote.id);
      leaveEditor();
      return;
    }

    setDraft(draftFromNote(selectedNote));
    leaveEditor();
  };

  const handleDelete = async () => {
    if (!selectedNoteId) return;

    setIsConfirming(true);
    try {
      if (isLocalNoteId(selectedNoteId)) {
        discardPendingNote(selectedNoteId);
        setConfirmAction(null);
        leaveEditor();
        showToast({ message: "Note permanently deleted." });
        return;
      }

      await deleteNote(selectedNoteId);
      setSelectedNoteId(null);
      setDraft(null);
      setConfirmAction(null);
      await loadNotes();
      await loadTags();
      leaveEditor();
      showToast({ message: "Note permanently deleted." });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    } finally {
      setIsConfirming(false);
    }
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
        leaveEditor();
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

  return {
    tags,
    selectedNoteId,
    visibleNotes,
    editorNote,
    isDirty: Boolean(isDirty),
    isArchivedNote,
    confirmAction,
    isConfirming,
    isLoading,
    error,
    selectNote,
    handleCreateNote,
    handleDraftChange,
    handleSave,
    handleCancel,
    handleConfirm,
    requestDelete: () => setConfirmAction("delete"),
    requestArchive: () => setConfirmAction("archive"),
    clearConfirmAction: () => setConfirmAction(null),
  };
}
