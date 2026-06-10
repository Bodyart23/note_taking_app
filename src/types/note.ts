export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface NotesQuery {
  archived?: boolean;
  search?: string;
  tag?: string;
}
