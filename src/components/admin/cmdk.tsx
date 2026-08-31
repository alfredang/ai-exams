'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X } from 'lucide-react';

type Hit = {
  kind: 'order' | 'user' | 'exam' | 'voucher';
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

export function CmdK({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    // Opening the palette starts a fresh, intentionally empty search session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ('');
    setHits([]);
    setFocus(0);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = q.trim();
    if (!trimmed) {
      // Keep stale results out of an empty query.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHits([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          setHits(Array.isArray(data?.hits) ? data.hits : []);
          setFocus(0);
        })
        .catch(() => {
          if (!cancelled) setHits([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocus((f) => Math.min(f + 1, hits.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocus((f) => Math.max(f - 1, 0));
      } else if (e.key === 'Enter') {
        const h = hits[focus];
        if (h) {
          e.preventDefault();
          router.push(h.href);
          onClose();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, hits, focus, onClose, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search orders, users, exams, vouchers…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {q.trim() === '' && (
            <div className="px-4 py-6 text-center text-[12px] text-slate-500">
              Type to search.
              <div className="mt-1 text-[11px] text-slate-400">
                Order IDs · emails · exam codes · voucher codes
              </div>
            </div>
          )}
          {q.trim() !== '' && hits.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-[12px] text-slate-500">No matches.</div>
          )}
          {hits.map((h, i) => (
            <button
              key={`${h.kind}:${h.id}`}
              type="button"
              onMouseEnter={() => setFocus(i)}
              onClick={() => {
                router.push(h.href);
                onClose();
              }}
              className={`flex w-full items-start gap-3 px-3 py-2 text-left text-[13px] ${
                i === focus
                  ? 'bg-blue-50 dark:bg-blue-950/40'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="mt-0.5 inline-flex h-5 min-w-[3rem] items-center justify-center rounded bg-slate-100 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {h.kind}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-slate-900 dark:text-slate-100">
                  {h.title}
                </div>
                {h.subtitle && (
                  <div className="truncate text-[11px] text-slate-500">{h.subtitle}</div>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60">
          <span>
            <kbd className="mr-1 rounded border border-slate-300 bg-white px-1 font-mono dark:border-slate-600 dark:bg-slate-900">↑↓</kbd>
            navigate
          </span>
          <span>
            <kbd className="mr-1 rounded border border-slate-300 bg-white px-1 font-mono dark:border-slate-600 dark:bg-slate-900">↵</kbd>
            open ·{' '}
            <kbd className="ml-1 mr-1 rounded border border-slate-300 bg-white px-1 font-mono dark:border-slate-600 dark:bg-slate-900">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
