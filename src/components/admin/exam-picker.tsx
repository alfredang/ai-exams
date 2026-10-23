'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

export type ExamPickerOption = {
  id: string;
  code: string;
  title: string;
  vendor: string;
  label?: string | null;
};

export function ExamPicker({
  name,
  options,
  excludeIds = [],
  placeholder = 'Search by code, title, or label…'
}: {
  name: string;
  options: ExamPickerOption[];
  excludeIds?: string[];
  placeholder?: string;
}) {
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const exclude = useMemo(() => new Set(excludeIds), [excludeIds]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const pool = options.filter((o) => !exclude.has(o.id));
    if (!needle) return pool.slice(0, 50);
    return pool
      .filter((o) =>
        o.code.toLowerCase().includes(needle) ||
        o.title.toLowerCase().includes(needle) ||
        o.vendor.toLowerCase().includes(needle) ||
        (o.label ?? '').toLowerCase().includes(needle)
      )
      .slice(0, 200);
  }, [q, options, exclude]);

  function toggle(id: string) {
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex-1 min-w-[24rem]">
      {/* One hidden input per picked exam — the server action reads getAll(name). */}
      {[...picked].map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="input-sm w-full pl-7"
        />
      </div>

      {picked.size > 0 && (
        <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-500">
          <span className="font-medium text-slate-700 dark:text-slate-200">{picked.size} selected</span>
          <button
            type="button"
            onClick={() => setPicked(new Set())}
            className="text-blue-600 hover:underline dark:text-blue-300"
          >
            clear
          </button>
        </div>
      )}

      <ul className="mt-1 max-h-72 overflow-auto rounded-md border border-slate-200 bg-white text-[12px] shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {filtered.length === 0 && <li className="px-3 py-2 text-slate-500">No matches</li>}
        {filtered.map((o) => {
          const isPicked = picked.has(o.id);
          return (
            <li key={o.id}>
              <label
                className={`flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  isPicked ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isPicked}
                  onChange={() => toggle(o.id)}
                  className="h-3.5 w-3.5 accent-blue-600"
                />
                <span className="flex flex-1 items-center gap-2 truncate">
                  <span className="font-mono text-slate-700 dark:text-slate-200">{o.code}</span>
                  <span className="truncate text-slate-500">{o.vendor} · {o.title}</span>
                </span>
                {o.label && (
                  <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {o.label}
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
