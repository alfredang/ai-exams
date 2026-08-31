'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export function SeoSavedFlash() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(() => params.get('seo') === 'saved');

  useEffect(() => {
    if (params.get('seo') !== 'saved') return;
    const hide = setTimeout(() => setShow(false), 2500);
    const clean = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      next.delete('seo');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 2600);
    return () => {
      clearTimeout(hide);
      clearTimeout(clean);
    };
  }, [params, pathname, router]);

  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-lg ring-1 ring-emerald-700/40"
    >
      <CheckCircle2 className="h-4 w-4" />
      SEO meta saved
    </div>
  );
}
