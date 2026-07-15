export default function Loading() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      {/* Desktop skeleton mirrors the three-column notes layout. */}
      <div
        className="hidden h-full animate-pulse lg:grid lg:grid-cols-[16rem_20rem_1fr]"
        aria-hidden
      >
        <div className="space-y-4 border-r border-border bg-surface px-4 py-6">
          <div className="h-8 w-28 rounded bg-surface-muted" />
          <div className="space-y-2 pt-4">
            <div className="h-9 w-full rounded-lg bg-surface-muted" />
            <div className="h-9 w-full rounded-lg bg-surface-muted" />
            <div className="h-9 w-2/3 rounded-lg bg-surface-muted" />
          </div>
        </div>

        <div className="space-y-3 border-r border-border bg-surface px-4 py-6">
          <div className="h-10 w-full rounded-lg bg-surface-muted" />
          <div className="h-24 w-full rounded-lg bg-surface-muted" />
          <div className="h-24 w-full rounded-lg bg-surface-muted" />
          <div className="h-24 w-full rounded-lg bg-surface-muted" />
        </div>

        <div className="space-y-4 bg-surface px-8 py-6">
          <div className="h-9 w-1/2 rounded bg-surface-muted" />
          <div className="h-4 w-1/3 rounded bg-surface-muted" />
          <div className="h-px w-full bg-border" />
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full rounded bg-surface-muted" />
            <div className="h-4 w-full rounded bg-surface-muted" />
            <div className="h-4 w-3/4 rounded bg-surface-muted" />
          </div>
        </div>
      </div>

      {/* Mobile skeleton: header + note cards. */}
      <div className="flex h-full animate-pulse flex-col gap-3 px-4 py-6 lg:hidden" aria-hidden>
        <div className="h-8 w-32 rounded bg-surface-muted" />
        <div className="h-10 w-full rounded-lg bg-surface-muted" />
        <div className="h-24 w-full rounded-lg bg-surface-muted" />
        <div className="h-24 w-full rounded-lg bg-surface-muted" />
        <div className="h-24 w-full rounded-lg bg-surface-muted" />
      </div>

      <span className="sr-only">Loading notes…</span>
    </div>
  );
}
