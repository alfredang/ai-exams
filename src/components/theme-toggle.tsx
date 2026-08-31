'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  // Mounted = false until after hydration. Until then, render an
  // invisible placeholder so the icon doesn't flicker between Sun/Moon
  // when the React state catches up to whatever the inline init script
  // already applied to <html>.
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Hydrate from the class set by the pre-React theme bootstrap script.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains('dark');
    if (next) root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
    setIsDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {mounted ? (
        isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4 opacity-0" />
      )}
    </button>
  );
}
