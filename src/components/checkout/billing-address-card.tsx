'use client';
import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';

export type AddressDto = {
  id: string;
  fullName: string;
  company?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
};

type Props = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

const EMPTY: Omit<AddressDto, 'id' | 'isDefault'> = {
  fullName: '',
  company: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: ''
};

export function BillingAddressCard({ selectedId, onSelect }: Props) {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/billing-addresses')
      .then((r) => r.json())
      .then((d) => {
        const items: AddressDto[] = d.items ?? [];
        setAddresses(items);
        if (!selectedId) {
          const def = items.find((a) => a.isDefault) ?? items[0];
          if (def) onSelect(def.id);
          else setEditing(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setErr(''); setSaving(true);
    const res = await fetch('/api/billing-addresses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, country: form.country.toUpperCase() })
    });
    setSaving(false);
    if (!res.ok) { setErr('Could not save address. Check the form.'); return; }
    const d = await res.json();
    setAddresses((cur) => [d.item, ...cur]);
    onSelect(d.item.id);
    setEditing(false);
    setForm(EMPTY);
  }

  if (loading) {
    return <div className="card p-4 text-sm text-slate-500">Loading addresses…</div>;
  }

  if (editing) {
    return (
      <div className="card p-4">
        <h3 className="text-sm font-semibold">Billing address</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
          <Field label="Company (optional)" value={form.company ?? ''} onChange={(v) => setForm({ ...form, company: v })} />
          <Field label="Address line 1" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} required className="sm:col-span-2" />
          <Field label="Address line 2" value={form.line2 ?? ''} onChange={(v) => setForm({ ...form, line2: v })} className="sm:col-span-2" />
          <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
          <Field label="State / region" value={form.state ?? ''} onChange={(v) => setForm({ ...form, state: v })} />
          <Field label="Postal code" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} required />
          <Field label="Country (ISO-2, e.g. SG)" value={form.country} onChange={(v) => setForm({ ...form, country: v })} required maxLength={2} />
          <Field label="Phone (optional)" value={form.phone ?? ''} onChange={(v) => setForm({ ...form, phone: v })} className="sm:col-span-2" />
        </div>
        {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save address'}</button>
          {addresses.length > 0 && (
            <button type="button" onClick={() => { setEditing(false); setErr(''); }} className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Billing address</h3>
        <button
          type="button"
          onClick={() => { setEditing(true); setForm(EMPTY); }}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add new
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {addresses.map((a) => {
          const selected = selectedId === a.id;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onSelect(a.id)}
                className={`flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm ${selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'}`}
              >
                <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                  {selected && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{a.fullName}{a.company ? ` — ${a.company}` : ''}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}{a.state ? `, ${a.state}` : ''} {a.postalCode}, {a.country}
                    {a.phone ? ` · ${a.phone}` : ''}
                  </div>
                </div>
                {a.isDefault && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">DEFAULT</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Field({
  label, value, onChange, required, className = '', maxLength
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; className?: string; maxLength?: number }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block text-slate-600 dark:text-slate-300">{label}{required && ' *'}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
    </label>
  );
}
