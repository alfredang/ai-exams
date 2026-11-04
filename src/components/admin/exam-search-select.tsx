'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search } from 'lucide-react';

type ExamOption = {
  id: string;
  code: string;
  title: string;
  vendor: string;
};

export function ExamSearchSelect({
  name,
  options,
  placeholder = 'Search exams…'
}: {
  name: string;
  options: ExamOption[];
  placeholder?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ExamOption | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options.slice(0, 30);
    return options
      .filter((exam) =>
        exam.code.toLowerCase().includes(needle) ||
        exam.title.toLowerCase().includes(needle) ||
        exam.vendor.toLowerCase().includes(needle)
      )
      .slice(0, 100);
  }, [options, query]);

  function choose(exam: ExamOption) {
    setSelected(exam);
    setQuery(`${exam.vendor} · ${exam.code} — ${exam.title}`);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative w-full sm:w-[32rem]">
      <input type="hidden" name={name} value={selected?.id ?? ''} />
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelected(null);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
          if (event.key === 'Enter' && open && filtered.length === 1) {
            event.preventDefault();
            choose(filtered[0]);
          }
        }}
        placeholder={placeholder}
        role="combobox"
        aria-label="Search and select an exam"
        aria-expanded={open}
        aria-controls="exam-search-results"
        autoComplete="off"
        className="input-sm w-full pl-8"
      />

      {open && (
        <ul
          id="exam-search-results"
          role="listbox"
          className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-[12px] shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {filtered.length === 0 && <li className="px-3 py-2 text-slate-500">No matching exams</li>}
          {filtered.map((exam) => (
            <li key={exam.id} role="option" aria-selected={selected?.id === exam.id}>
              <button
                type="button"
                onClick={() => choose(exam)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-800 dark:text-slate-100">
                    {exam.vendor} · {exam.code}
                  </span>
                  <span className="block truncate text-slate-500">{exam.title}</span>
                </span>
                {selected?.id === exam.id && <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
