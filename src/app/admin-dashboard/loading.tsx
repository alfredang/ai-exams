// Shown inside the admin shell the moment a sidebar link is clicked, while the
// page's queries run — the sidebar and header stay in place.
export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading…</span>
      <div className="mb-4">
        <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-3 w-72 max-w-full rounded bg-slate-200/70 dark:bg-slate-800/70" />
      </div>
      <div className="card mb-3 h-12" />
      <div className="card divide-y divide-slate-100 dark:divide-slate-800/70">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/3 rounded bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="ml-auto h-3 w-16 rounded bg-slate-200/70 dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
