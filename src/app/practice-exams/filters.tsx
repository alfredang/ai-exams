'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';

type Vendor = { id: string; slug: string; name: string };

export function CatalogFilters({
  q,
  vendor,
  level,
  vendors,
  levels
}: {
  q: string;
  vendor: string;
  level: string;
  vendors: Vendor[];
  levels: string[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const submit = () => formRef.current?.requestSubmit();
  const clear = () => {
    const form = formRef.current;
    if (form) {
      for (const name of ['q', 'vendor', 'level']) {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) field.value = '';
      }
    }
    router.push('/practice-exams');
  };

  return (
    <form ref={formRef} className="mb-6 flex flex-wrap gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder="Search by name or code"
        className="input max-w-md"
      />
      <select
        name="vendor"
        defaultValue={vendor}
        onChange={submit}
        className="input max-w-[180px]"
      >
        <option value="">All vendors</option>
        {vendors.map(v => <option key={v.id} value={v.slug}>{v.name}</option>)}
      </select>
      <select
        name="level"
        defaultValue={level}
        onChange={submit}
        className="input max-w-[160px]"
      >
        <option value="">All levels</option>
        {levels.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <button className="btn-primary">Filter</button>
      {(q || vendor || level) && (
        <button type="button" onClick={clear} className="btn-secondary">Clear</button>
      )}
    </form>
  );
}
