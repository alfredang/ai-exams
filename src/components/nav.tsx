'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from './user-menu';
import { ThemeToggle } from './theme-toggle';
import { LifeBuoy } from 'lucide-react';

export function Nav() {
  const pathname = usePathname() || '/';
  const inBackend = pathname.startsWith('/admin-dashboard') || pathname.startsWith('/user-dashboard');

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur dark:bg-slate-950/90">
      <div className="flex h-24 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight" aria-label="Tertiary Exams home">
          <Logo />
        </Link>
        {!inBackend && (
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/practice-exams" className="btn-ghost">Practice Exams</Link>
            <Link href="/vendors" className="btn-ghost">Vendors</Link>
            <Link href="/p/about-us" className="btn-ghost">About Us</Link>
            <Link href="/#faq" className="btn-ghost">FAQ</Link>
            <Link href="/p/support" className="btn-ghost">Support</Link>
          </nav>
        )}
        <div className="flex items-center gap-2">
          {!inBackend && (
            <Link
              href="/p/support"
              className="btn-ghost inline-flex h-10 w-10 items-center justify-center p-0 md:hidden"
              aria-label="Contact support"
              title="Support"
            >
              <LifeBuoy className="h-5 w-5" />
            </Link>
          )}
          <UserMenu />
          <div className="ml-2 border-l border-slate-200 pl-3 dark:border-slate-800">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <>
      <img
        src="/logo-mark.png"
        alt="Tertiary Exams"
        className="h-12 w-12 shrink-0 object-contain"
      />
      <span className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
        Tertiary Exams
      </span>
    </>
  );
}
