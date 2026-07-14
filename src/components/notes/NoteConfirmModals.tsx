"use client";

import { Archive, Trash2 } from "lucide-react";

import { ConfirmModal } from "@/components/ui/ConfirmModal";

import type { ConfirmAction } from "./note-helpers";

type NoteConfirmModalsProps = {
  confirmAction: ConfirmAction;
  isConfirming: boolean;
  isArchivedNote: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function NoteConfirmModals({
  confirmAction,
  isConfirming,
  isArchivedNote,
  onConfirm,
  onCancel,
}: NoteConfirmModalsProps) {
  return (
    <>
      <ConfirmModal
        open={confirmAction === "delete"}
        title="Delete Note"
        description="Are you sure you want to permanently delete this note? This action cannot be undone."
        icon={<Trash2 className="h-5 w-5" strokeWidth={1.75} />}
        confirmLabel="Delete Note"
        variant="danger"
        isConfirming={isConfirming}
        onConfirm={onConfirm}
        onCancel={() => {
          if (!isConfirming) onCancel();
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
        onConfirm={onConfirm}
        onCancel={() => {
          if (!isConfirming) onCancel();
        }}
      />
    </>
  );
}
