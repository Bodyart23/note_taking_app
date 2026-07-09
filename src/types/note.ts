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
  userId: string;
  archived?: boolean;
  search?: string;
  tag?: string;
}
