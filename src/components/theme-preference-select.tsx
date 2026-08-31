'use client';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

type ThemePref = 'system' | 'light' | 'dark';

/**
 * Three-way theme picker for the user profile page. Persists to
 * localStorage; the inline init script in <head> reads it on next page load.
 * "System" clears the stored value so the OS prefers-color-scheme decides.
 */
export function ThemePreferenceSelect() {
  const [pref, setPref] = useState<ThemePref>('system');

  useEffect(() => {
    try {
      const t = localStorage.getItem('theme');
      // Hydrate the persisted browser-only preference after SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPref(t === 'dark' ? 'dark' : t === 'light' ? 'light' : 'system');
    } catch {}
  }, []);

  function apply(next: ThemePref) {
    setPref(next);
    try {
      if (next === 'system') {
        localStorage.removeItem('theme');
        const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', sysDark);
      } else {
        localStorage.setItem('theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
    } catch {}
  }

  const opts: { value: ThemePref; label: string; icon: any }[] = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon }
  ];

  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
      {opts.map((o) => {
        const Icon = o.icon;
        const active = pref === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => apply(o.value)}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[12px] transition ${
              active
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" /> {o.label}
          </button>
        );
      })}
    </div>
  );
}
