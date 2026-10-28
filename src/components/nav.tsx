'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PRACTICE_PRICE_CENTS } from '@/lib/products';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';
import { CurrencySwitcher } from './currency-switcher';
import { Price } from './price';
import { AdminHeaderTools } from './admin/header-tools';
import { BookOpenCheck, Building2, ChevronRight, HelpCircle, Info, LifeBuoy, ListChecks, Menu, Ticket, X } from 'lucide-react';

const LINKS = [
  { href: '/practice-exams', label: 'Practice Exams', icon: BookOpenCheck, desc: <>Timed mock exams · <Price cents={PRACTICE_PRICE_CENTS} /> each</> },
  { href: '/exam-vouchers', label: 'Exam Vouchers', icon: Ticket, desc: 'Official vouchers · Practice Exam free' },
  { href: '/vendors', label: 'Vendors', icon: Building2, desc: 'Browse by Vendor' },
  { href: '/#how', label: 'How it works', icon: ListChecks, desc: 'From first question to exam day' },
  { href: '/#faq', label: 'FAQ', icon: HelpCircle, desc: 'Quick answers' },
  { href: '/p/support', label: 'Support', icon: LifeBuoy, desc: 'We reply within one business day' }
];

// Desktop shows the first six; the mobile menu adds About Us.
const MOBILE_EXTRA = [{ href: '/p/about-us', label: 'About Us', icon: Info, desc: 'Who we are' }];

export function Nav() {
  const pathname = usePathname() || '/';
  const inAdmin = pathname.startsWith('/admin-dashboard');
  const inBackend = inAdmin || pathname.startsWith('/user-dashboard');
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on navigation.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Escape closes and returns focus to the toggle; focus the first link on open;
  // lock page scroll behind the open menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isActive = (href: string) => !href.includes('#') && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="flex h-16 w-full items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold tracking-tight sm:gap-3" aria-label="Tertiary Exams home">
          <Logo />
        </Link>
        {!inBackend && (
          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={`btn-ghost ${isActive(l.href) ? 'bg-brand-50 text-brand-700 dark:bg-slate-800/70 dark:text-white' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {inAdmin && <AdminHeaderTools />}
          {!inAdmin && <CurrencySwitcher className="hidden sm:inline-flex" />}
          <UserMenu />
          <div className="border-l border-line pl-1 dark:border-slate-800 sm:ml-1 sm:pl-2">
            <ThemeToggle />
          </div>
          {!inBackend && (
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="btn-ghost inline-flex h-11 w-11 items-center justify-center p-0 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {!inBackend && open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-40 bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
          />
          <div
            id="mobile-menu"
            ref={panelRef}
            className="absolute inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-white shadow-lift lg:hidden dark:border-slate-800 dark:bg-slate-950"
          >
            <nav aria-label="Main" className="mx-auto max-w-xl px-4 py-3">
              <ul className="divide-y divide-line dark:divide-slate-800">
                {[...LINKS, ...MOBILE_EXTRA].map(({ href, label, icon: Icon, desc }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(href) ? 'page' : undefined}
                      className="flex min-h-[52px] items-center gap-3 rounded-md px-2 py-2.5 transition hover:bg-brand-50 dark:hover:bg-slate-800/70"
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block font-semibold ${isActive(href) ? 'text-brand-700 dark:text-brand-300' : 'text-ink dark:text-slate-100'}`}>{label}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{desc}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted dark:text-slate-400 sm:hidden">
                <span>Show prices in</span>
                <CurrencySwitcher />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 pb-2">
                <Link href="/practice-exams" onClick={() => setOpen(false)} className="btn-outline min-h-[44px]">Practice Exams</Link>
                <Link href="/exam-vouchers" onClick={() => setOpen(false)} className="btn-primary-grad min-h-[44px]">Exam Vouchers</Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

function Logo() {
  return (
    <>
      <Image
        src="/logo-mark.png"
        alt="Tertiary Exams"
        width={48}
        height={48}
        className="h-9 w-9 shrink-0 object-contain"
      />
      <span className="hidden truncate font-display text-base font-extrabold tracking-tight text-ink dark:text-white sm:inline sm:text-xl">
        Tertiary Exams
      </span>
    </>
  );
}
