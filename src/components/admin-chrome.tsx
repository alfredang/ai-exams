'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Receipt,
  RefreshCw,
  Tag,
  FileText,
  Mail,
  Settings as SettingsIcon,
  Building2,
  Palette,
  CreditCard,
  Key,
  LogIn,
  BarChart3,
  Bell,
  Inbox,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  MessageSquare,
  Quote
} from 'lucide-react';
import { CmdK } from './admin/cmdk';
import { NotificationBell } from './admin/notification-bell';

type NavItem = {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
  children?: { href: string; label: string; icon?: any; exact?: boolean }[];
};

type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true }
    ]
  },
  {
    title: 'Catalog',
    items: [
      { href: '/admin-dashboard/exams', label: 'View Exams', icon: BookOpen, exact: true },
      { href: '/admin-dashboard/exams/new', label: 'Create Exam', icon: Sparkles },
      { href: '/admin-dashboard/bundles', label: 'View Bundled Exams', icon: FileText },
      { href: '/admin-dashboard/vendors', label: 'Vendors', icon: Building2 }
    ]
  },
  {
    title: 'Money',
    items: [
      { href: '/admin-dashboard/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin-dashboard/invoices', label: 'Invoices', icon: Receipt },
      {
        href: '/admin-dashboard/vouchers',
        label: 'Vouchers',
        icon: Ticket,
        children: [
          { href: '/admin-dashboard/vouchers', label: 'Deliveries', exact: true },
          { href: '/admin-dashboard/vouchers/inventory', label: 'Inventory' }
        ]
      },
      { href: '/admin-dashboard/coupons', label: 'Coupons', icon: Tag },
      { href: '/admin-dashboard/payments/webhooks', label: 'Webhook Events', icon: RefreshCw }
    ]
  },
  {
    title: 'Reports',
    items: [
      {
        href: '/admin-dashboard/reports/revenue',
        label: 'Reports',
        icon: BarChart3,
        children: [
          { href: '/admin-dashboard/reports/revenue', label: 'Revenue' },
          { href: '/admin-dashboard/reports/tax', label: 'Tax (GST)' },
          { href: '/admin-dashboard/reports/exams', label: 'Exam analytics' }
        ]
      }
    ]
  },
  {
    title: 'People',
    items: [
      { href: '/admin-dashboard/users', label: 'Users', icon: Users },
      { href: '/admin-dashboard/admins', label: 'Admins', icon: ShieldCheck }
    ]
  },
  {
    title: 'Content',
    items: [
      { href: '/admin-dashboard/settings/email-templates', label: 'Email Templates', icon: Mail },
      { href: '/admin-dashboard/pages', label: 'Pages', icon: FileText },
      { href: '/admin-dashboard/faq', label: 'FAQ', icon: FileText },
      { href: '/admin-dashboard/banners', label: 'Banners', icon: Sparkles },
      { href: '/admin-dashboard/reviews', label: 'Reviews', icon: MessageSquare },
      { href: '/admin-dashboard/testimonials', label: 'Testimonials', icon: Quote }
    ]
  },
  {
    title: 'System',
    items: [
      { href: '/admin-dashboard/notifications', label: 'Notifications', icon: Bell },
      {
        href: '/admin-dashboard/emails',
        label: 'Logs',
        icon: Inbox,
        children: [
          { href: '/admin-dashboard/emails', label: 'Email Log' },
          { href: '/admin-dashboard/audit', label: 'Audit Log' }
        ]
      },
      { href: '/admin-dashboard/api-tokens', label: 'API Tokens', icon: Key },
      {
        href: '/admin-dashboard/settings',
        label: 'Settings',
        icon: SettingsIcon,
        children: [
          { href: '/admin-dashboard/settings/company', label: 'Company Info', icon: Building2 },
          { href: '/admin-dashboard/settings/branding', label: 'Branding', icon: Palette },
          { href: '/admin-dashboard/settings/site-seo', label: 'Site SEO', icon: BarChart3 },
          { href: '/admin-dashboard/settings/tax-invoice', label: 'Tax & Invoice', icon: Receipt },
          { href: '/admin-dashboard/settings/payment', label: 'Payment', icon: CreditCard },
          { href: '/admin-dashboard/settings/payment-guide', label: 'Payment Setup Guide', icon: BookOpen },
          { href: '/admin-dashboard/settings/email', label: 'Email', icon: Mail },
          { href: '/admin-dashboard/settings/social-login', label: 'Social Login', icon: LogIn },
          { href: '/admin-dashboard/settings/credentials', label: 'Credentials', icon: Key }
        ]
      }
    ]
  }
];

function isPathActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isItemActive(pathname: string, item: NavItem): boolean {
  if (isPathActive(pathname, item.href, !!item.exact)) return true;
  return !!item.children?.some((c) => isPathActive(pathname, c.href, !!c.exact));
}

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/admin-dashboard';
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [cmdkOpen, setCmdkOpen] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('adminSidebarCollapsed');
      // Hydrate the persisted UI preference after the server render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(v === '1');
      const g = localStorage.getItem('adminSidebarGroups');
      if (g) setOpenGroups(JSON.parse(g));
      const s = localStorage.getItem('adminSidebarSections');
      if (s) setOpenSections(JSON.parse(s));
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const meta = isMac ? e.metaKey : e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function toggleCollapse() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem('adminSidebarCollapsed', next ? '1' : '0');
      } catch {}
      return next;
    });
  }

  function toggleSection(title: string) {
    setOpenSections((s) => {
      const next = { ...s, [title]: !(s[title] ?? true) };
      try {
        localStorage.setItem('adminSidebarSections', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function toggleGroup(href: string) {
    setOpenGroups((g) => {
      const next = { ...g, [href]: !g[href] };
      try {
        localStorage.setItem('adminSidebarGroups', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const width = collapsed ? 'w-14' : 'w-56';

  return (
    <div className="flex min-h-[calc(100vh-6rem)] w-full">
      <aside
        className={`relative shrink-0 border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 ${width} ${
          mounted ? '' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between gap-1 px-2 py-2.5">
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Admin
            </span>
          )}
          {!collapsed && <NotificationBell />}
          <button
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Global search trigger */}
        <div className="px-2 pb-2">
          <button
            type="button"
            onClick={() => setCmdkOpen(true)}
            title="Search (⌘K)"
            className={`flex h-7 w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Search className="h-3 w-3 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Search…</span>
                <kbd className="rounded border border-slate-300 bg-white px-1 text-[9px] font-mono text-slate-500 dark:border-slate-600 dark:bg-slate-900">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-1 pb-4">
          {SECTIONS.map((sec) => {
            const isSectionOpen = openSections[sec.title] ?? true;
            return (
            <div key={sec.title}>
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(sec.title)}
                  className="mb-1 flex w-full items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
                >
                  <span>{sec.title}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${isSectionOpen ? '' : '-rotate-90'}`} />
                </button>
              )}
              {(collapsed || isSectionOpen) && (
              <div className="flex flex-col gap-0.5">
                {sec.items.map((item) => {
                  const { href, label, icon: Icon, children: subs } = item;
                  const active = isItemActive(pathname, item);
                  const hasChildren = !!subs?.length;
                  const isOpen = openGroups[href] ?? active;
                  return (
                    <div key={href}>
                      <div
                        className={`group flex items-center gap-1 rounded-md text-[13px] transition ${
                          active
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                        }`}
                      >
                        {/* left-border accent for active */}
                        <span
                          aria-hidden
                          className={`block h-6 w-0.5 rounded ${active ? 'bg-blue-600 dark:bg-blue-400' : 'bg-transparent'}`}
                        />
                        <Link
                          href={href}
                          title={collapsed ? label : undefined}
                          className="flex flex-1 items-center gap-2.5 rounded-md px-1.5 py-1.5"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {!collapsed && <span className="truncate">{label}</span>}
                        </Link>
                        {!collapsed && hasChildren && (
                          <button
                            type="button"
                            onClick={() => toggleGroup(href)}
                            aria-label={isOpen ? `Collapse ${label}` : `Expand ${label}`}
                            aria-expanded={isOpen}
                            className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                          >
                            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                          </button>
                        )}
                      </div>
                      {!collapsed && hasChildren && isOpen && (
                        <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-slate-200 pl-2 dark:border-slate-700">
                          {subs!.map((c) => {
                            const subActive = isPathActive(pathname, c.href, !!c.exact);
                            return (
                              <Link
                                key={c.href}
                                href={c.href}
                                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] transition ${
                                  subActive
                                    ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                                }`}
                              >
                                {c.icon && <c.icon className="h-3 w-3 opacity-70" />}
                                {c.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      <CmdK open={cmdkOpen} onClose={() => setCmdkOpen(false)} />
    </div>
  );
}
