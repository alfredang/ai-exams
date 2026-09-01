'use client';

import { useRef } from 'react';
import Link from 'next/link';

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
  const submit = () => formRef.current?.requestSubmit();

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
        <Link href="/practice-exams" className="btn-secondary">Clear</Link>
      )}
    </form>
  );
}
