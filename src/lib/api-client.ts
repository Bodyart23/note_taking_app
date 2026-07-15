import type { CreateNoteInput, Note, UpdateNoteInput } from "@/types/note";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function fetchNotes(
  params?: {
    archived?: boolean;
    search?: string;
    tag?: string;
  },
  signal?: AbortSignal,
): Promise<Note[]> {
  const searchParams = new URLSearchParams();

  if (params?.archived !== undefined) {
    searchParams.set("archived", String(params.archived));
  }

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.tag) {
    searchParams.set("tag", params.tag);
  }

  const query = searchParams.toString();
  const response = await fetch(`/api/notes${query ? `?${query}` : ""}`, {
    signal,
  });
  return handleResponse<Note[]>(response);
}

export async function fetchNote(id: string): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`);
  return handleResponse<Note>(response);
}

export async function createNote(input: CreateNoteInput = {}): Promise<Note> {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return handleResponse<Note>(response);
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput,
): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return handleResponse<Note>(response);
}

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "DELETE",
  });

  await handleResponse<{ success: boolean }>(response);
}

export async function fetchTags(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch("/api/tags", { signal });
  return handleResponse<string[]>(response);
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const response = await fetch("/api/auth/change-password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  await handleResponse<{ success: boolean }>(response);
}
