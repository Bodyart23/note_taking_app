import { auth } from "@/auth";
import { NotesApp } from "@/components/notes/NotesApp";
import { getAllTags, getNotes } from "@/lib/notes-store";

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;

  // The proxy redirects unauthenticated users to /auth/log-in before this
  // renders; the guard only covers the brief window of an expiring session.
  if (!userId) {
    return <NotesApp />;
  }

  // Prefetch the default view ("All Notes") on the server so the first paint
  // already contains data instead of a client-side loading state.
  const [initialNotes, initialTags] = await Promise.all([
    getNotes({ userId, archived: false }),
    getAllTags(userId, false),
  ]);

  return <NotesApp initialNotes={initialNotes} initialTags={initialTags} />;
}
