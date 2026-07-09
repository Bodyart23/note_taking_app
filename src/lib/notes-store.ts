import type {
  CreateNoteInput,
  Note,
  NotesQuery,
  UpdateNoteInput,
} from "@/types/note";
import { ObjectId, WithId, type Collection } from "mongodb";

import { getDb } from "./mongodb";

interface NoteDocument {
  _id?: ObjectId;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

let indexEnsured = false;

function mapNote(doc: WithId<NoteDocument>): Note {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    content: doc.content,
    tags: doc.tags,
    isArchived: doc.isArchived,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function getNotesCollection(): Promise<Collection<NoteDocument>> {
  const db = await getDb();
  const collection = db.collection<NoteDocument>("notes");

  if (!indexEnsured) {
    await collection.createIndex({ userId: 1, updatedAt: -1 });
    indexEnsured = true;
  }

  return collection;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getNotes(query: NotesQuery): Promise<Note[]> {
  const collection = await getNotesCollection();
  const { userId, archived, search, tag } = query;

  const filter: Record<string, unknown> = { userId };

  if (archived !== undefined) {
    filter.isArchived = archived;
  }

  if (tag) {
    filter.tags = {
      $regex: `^${escapeRegex(tag.trim())}$`,
      $options: "i",
    };
  }

  if (search) {
    const term = escapeRegex(search.trim());
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { content: { $regex: term, $options: "i" } },
      { tags: { $regex: term, $options: "i" } },
    ];
  }

  const notesDocs = await collection
    .find(filter)
    .sort({ updatedAt: -1 })
    .toArray();

  return notesDocs.map(mapNote);
}

export async function getNoteById(
  userId: string,
  id: string,
): Promise<Note | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getNotesCollection();
  const note = await collection.findOne({ _id: new ObjectId(id), userId });
  if (!note) return null;
  return mapNote(note);
}

export async function createNote(
  userId: string,
  input: CreateNoteInput = {},
): Promise<Note> {
  const collection = await getNotesCollection();
  const now = new Date();

  const note: NoteDocument = {
    userId,
    title: input.title ?? "Untitled Note",
    content: input.content ?? "",
    tags: input.tags ?? [],
    isArchived: input.isArchived ?? false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(note);
  return mapNote({ _id: result.insertedId, ...note });
}

export async function updateNote(
  userId: string,
  id: string,
  input: UpdateNoteInput,
): Promise<Note | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getNotesCollection();
  const updated = await collection.findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return updated ? mapNote(updated) : null;
}

export async function deleteNote(userId: string, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;

  const collection = await getNotesCollection();
  const deleted = await collection.deleteOne({ _id: new ObjectId(id), userId });
  return deleted.deletedCount === 1;
}

export async function getAllTags(userId: string): Promise<string[]> {
  const notes = await getNotes({ userId });
  const tags = new Set<string>();

  for (const note of notes) {
    for (const tag of note.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((a, b) => a.localeCompare(b));
}
