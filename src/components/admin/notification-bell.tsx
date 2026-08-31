'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';

type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function refresh() {
    try {
      const r = await fetch('/api/admin/notifications');
      const d = await r.json();
      setItems(d.items || []);
      setUnread(d.unread || 0);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    // Fetching is the external synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  async function markAllRead() {
    await fetch('/api/admin/notifications/read-all', { method: 'POST' });
    refresh();
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Bell className="h-3.5 w-3.5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-1 w-80 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Notifications</span>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                disabled={unread === 0}
                className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
              >
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
              <Link href="/admin-dashboard/notifications" onClick={() => setOpen(false)} className="text-[10px] text-blue-600 hover:underline dark:text-blue-400">View all</Link>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-slate-500">No notifications.</div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`border-b border-slate-100 px-3 py-2 last:border-0 dark:border-slate-800/70 ${
                    !n.readAt ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium text-slate-900 dark:text-slate-100">{n.title}</div>
                      {n.body && <div className="mt-0.5 text-[11px] text-slate-500">{n.body}</div>}
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                        <code>{n.kind}</code>
                        <span>·</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                        {n.link && (
                          <Link href={n.link} onClick={() => setOpen(false)} className="text-blue-600 hover:underline dark:text-blue-400">
                            Open →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
