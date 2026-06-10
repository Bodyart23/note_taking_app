export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Note Taking App</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Your notes, organized. Built with Next.js and Tailwind CSS.
        </p>
      </div>
    </main>
  );
}
