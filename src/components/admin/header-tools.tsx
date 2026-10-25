'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import { CmdK } from './cmdk';
import { NotificationBell } from './notification-bell';

// Admin search + notifications, shown in the site header on /admin-dashboard.
export function AdminHeaderTools() {
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const meta = isMac ? e.metaKey : e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-w-0 items-center gap-1 sm:gap-2">
      <button
        type="button"
        onClick={() => setCmdkOpen(true)}
        title="Search (⌘K)"
        aria-label="Search"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800 md:w-64"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden flex-1 text-left md:inline">Search…</span>
        <kbd className="hidden rounded border border-slate-300 bg-white px-1 font-mono text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900 md:inline">
          ⌘K
        </kbd>
      </button>
      <NotificationBell />
      {/* Portalled: the header's backdrop-blur would trap a fixed overlay inside it. */}
      {mounted && createPortal(<CmdK open={cmdkOpen} onClose={() => setCmdkOpen(false)} />, document.body)}
    </div>
  );
}
