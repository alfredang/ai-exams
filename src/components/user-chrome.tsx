'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  ShoppingBag,
  Receipt,
  Ticket,
  UserCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ITEMS: { href: string; label: string; icon: any }[] = [
  { href: '/user-dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/user-dashboard/exams', label: 'Exams', icon: BookOpen },
  { href: '/user-dashboard/attempts', label: 'Attempts', icon: ClipboardList },
  { href: '/user-dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/user-dashboard/invoices', label: 'Invoices', icon: Receipt },
  { href: '/user-dashboard/vouchers', label: 'Vouchers', icon: Ticket },
  { href: '/user-dashboard/settings', label: 'My Profile', icon: UserCircle }
];

export function UserChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/user-dashboard';
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('userSidebarCollapsed');
      // Hydrate the persisted UI preference after the server render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(v === '1');
    } catch {}
    setMounted(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem('userSidebarCollapsed', next ? '1' : '0');
      } catch {}
      return next;
    });
  }

  const width = collapsed ? 'w-16' : 'w-60';

  return (
    <div className="flex min-h-[calc(100vh-6rem)] w-full">
      <aside
        className={`relative shrink-0 border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 ${width} ${
          mounted ? '' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-3">
          {!collapsed && (
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              My Content
            </span>
          )}
          <button
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 px-2 pb-4">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === '/user-dashboard' ? pathname === '/user-dashboard' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition ${
                  active
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
