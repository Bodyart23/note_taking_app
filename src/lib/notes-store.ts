import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import type {
  CreateNoteInput,
  Note,
  NotesQuery,
  UpdateNoteInput,
} from "@/types/note";

const DATA_DIR = path.join(process.cwd(), "data");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(NOTES_FILE);
  } catch {
    await fs.writeFile(NOTES_FILE, "[]", "utf-8");
  }
}

async function readNotes(): Promise<Note[]> {
  await ensureDataFile();
  const raw = await fs.readFile(NOTES_FILE, "utf-8");
  return JSON.parse(raw) as Note[];
}

async function writeNotes(notes: Note[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), "utf-8");
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function filterNotes(notes: Note[], query: NotesQuery = {}): Note[] {
  let filtered = notes;

  if (query.archived !== undefined) {
    filtered = filtered.filter((note) => note.isArchived === query.archived);
  }

  if (query.tag) {
    const tag = query.tag.toLowerCase();
    filtered = filtered.filter((note) =>
      note.tags.some((item) => item.toLowerCase() === tag),
    );
  }

  if (query.search) {
    const term = query.search.toLowerCase();
    filtered = filtered.filter(
      (note) =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term) ||
        note.tags.some((item) => item.toLowerCase().includes(term)),
    );
  }

  return sortNotes(filtered);
}

export async function getNotes(query: NotesQuery = {}): Promise<Note[]> {
  const notes = await readNotes();
  return filterNotes(notes, query);
}

export async function getNoteById(id: string): Promise<Note | null> {
  const notes = await readNotes();
  return notes.find((note) => note.id === id) ?? null;
}

export async function createNote(input: CreateNoteInput = {}): Promise<Note> {
  const notes = await readNotes();
  const now = new Date().toISOString();

  const note: Note = {
    id: randomUUID(),
    title: input.title ?? "Untitled Note",
    content: input.content ?? "",
    tags: input.tags ?? [],
    isArchived: input.isArchived ?? false,
    createdAt: now,
    updatedAt: now,
  };

  notes.push(note);
  await writeNotes(notes);
  return note;
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput,
): Promise<Note | null> {
  const notes = await readNotes();
  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return null;
  }

  const updated: Note = {
    ...notes[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  notes[index] = updated;
  await writeNotes(notes);
  return updated;
}

export async function deleteNote(id: string): Promise<boolean> {
  const notes = await readNotes();
  const nextNotes = notes.filter((note) => note.id !== id);

  if (nextNotes.length === notes.length) {
    return false;
  }

  await writeNotes(nextNotes);
  return true;
}

export async function getAllTags(): Promise<string[]> {
  const notes = await readNotes();
  const tags = new Set<string>();

  for (const note of notes) {
    for (const tag of note.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((a, b) => a.localeCompare(b));
}
