'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Eye, LayoutDashboard, LogOut, Shield, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ViewAs = 'admin' | 'user';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewAs, setViewAs] = useState<ViewAs>('admin');
  const ref = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) return;
    const stored = (typeof window !== 'undefined' && localStorage.getItem('viewAs')) as ViewAs | null;
    // Hydrate the administrator's persisted view mode after SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === 'user' || stored === 'admin') setViewAs(stored);
  }, [isAdmin]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) setViewOpen(false);
    }
    if (open || viewOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open, viewOpen]);

  function setView(v: ViewAs) {
    setViewAs(v);
    if (typeof window !== 'undefined') localStorage.setItem('viewAs', v);
    setViewOpen(false);
    router.push(v === 'admin' ? '/admin-dashboard' : '/user-dashboard');
  }

  if (status === 'loading') {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />;
  }

  if (!session?.user) {
    return (
      <>
        <Link href="/login" className="btn-ghost">Sign in</Link>
        <Link href="/signup" className="btn-primary-grad">Get started</Link>
      </>
    );
  }

  const name = user.name || user.email || 'Account';
  const initials = (user.name || user.email || 'U')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase())
    .join('') || 'U';
  const displayName = (user.name || (user.email ? user.email.split('@')[0] : 'Account')) as string;
  const image = user.image as string | undefined;

  return (
    <div className="flex items-center gap-2">
      {/* View As — admin only, top-bar pill */}
      {isAdmin && (
        <div className="relative" ref={viewRef}>
          <button
            onClick={() => setViewOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Eye className="h-4 w-4 text-slate-500" />
            <span className="text-slate-500 dark:text-slate-400">View As:</span>
            <span className="font-medium capitalize">{viewAs}</span>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          {viewOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <button
                onClick={() => setView('admin')}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  viewAs === 'admin' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Admin
                </span>
                {viewAs === 'admin' && <span className="text-xs">●</span>}
              </button>
              <button
                onClick={() => setView('user')}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  viewAs === 'user' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" /> User
                </span>
                {viewAs === 'user' && <span className="text-xs">●</span>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-3 pr-1 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <span className="hidden max-w-[180px] truncate font-medium text-slate-700 dark:text-slate-200 sm:inline">
            {displayName}
          </span>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xs font-semibold text-white ring-2 ring-blue-500">
              {initials}
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-2 pb-2 dark:border-slate-800">
              <div className="truncate text-sm font-semibold">{name}</div>
              <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {user.role || 'USER'}
              </div>
            </div>

            <div className="py-1">
              <Link
                href={isAdmin && viewAs === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4" /> My Dashboard
              </Link>
              <Link
                href="/user-dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <User className="h-4 w-4" /> My Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
