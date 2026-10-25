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

// Inline admin search in the site header: type straight into the box and the
// results drop down underneath it. ⌘K / Ctrl+K focuses the box.
export function AdminSearch() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const trimmed = q.trim();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const meta = isMac ? e.metaKey : e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    if (!trimmed) {
      // Keep stale results out of an empty query.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHits([]);
      setLoading(false);
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
  }, [trimmed]);

  function go(h: Hit) {
    router.push(h.href);
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (q) setQ('');
      else inputRef.current?.blur();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setFocus((f) => Math.min(f + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocus((f) => Math.max(f - 1, 0));
    } else if (e.key === 'Enter') {
      const h = hits[focus];
      if (h) {
        e.preventDefault();
        go(h);
      }
    }
  }

  const showResults = open && trimmed !== '';

  return (
    <div ref={boxRef} className="relative">
      <div className="flex h-9 w-28 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-500 focus-within:border-brand-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 dark:focus-within:bg-slate-900 sm:w-48 md:w-64">
        <Search className="h-4 w-4 shrink-0" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKey}
          placeholder="Search…"
          aria-label="Search orders, users, exams, vouchers"
          role="combobox"
          aria-expanded={showResults}
          aria-controls="admin-search-results"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-slate-400" />
        ) : q ? (
          <button
            type="button"
            onClick={() => {
              setQ('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden rounded border border-slate-300 bg-white px-1 font-mono text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900 md:inline">
            ⌘K
          </kbd>
        )}
      </div>

      {showResults && (
        // Below md this is `fixed` inside the blurred header, which makes the
        // header its containing block — so it spans the header width either way.
        <div
          id="admin-search-results"
          role="listbox"
          className="fixed inset-x-4 top-16 z-50 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-[32rem]"
        >
          {hits.length === 0 && (
            <div className="px-4 py-5 text-center text-[12px] text-slate-500">
              {loading ? 'Searching…' : 'No matches. Try an order ID, email, exam code or voucher code.'}
            </div>
          )}
          {hits.map((h, i) => (
            <button
              key={`${h.kind}:${h.id}`}
              type="button"
              role="option"
              aria-selected={i === focus}
              onMouseEnter={() => setFocus(i)}
              onClick={() => go(h)}
              className={`flex w-full items-start gap-3 px-3 py-2 text-left text-[13px] ${
                i === focus
                  ? 'bg-blue-50 dark:bg-blue-950/40'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="mt-0.5 inline-flex h-5 min-w-[3rem] items-center justify-center rounded bg-slate-100 px-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {h.kind}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-slate-900 dark:text-slate-100">{h.title}</div>
                {h.subtitle && <div className="truncate text-xs text-slate-500">{h.subtitle}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
