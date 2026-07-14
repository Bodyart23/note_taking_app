import type {
  CreateNoteInput,
  UpdateNoteInput,
} from "@/lib/validation/notes";

export type { CreateNoteInput, UpdateNoteInput };

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotesQuery {
  userId: string;
  archived?: boolean;
  search?: string;
  tag?: string;
}
