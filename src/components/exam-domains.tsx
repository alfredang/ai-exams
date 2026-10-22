import { ChevronDown, ExternalLink } from 'lucide-react';
import { EXAM_BLUEPRINTS } from '@/lib/exam-blueprints';
import { parseDomains } from '@/lib/question-pool';

/**
 * Product-page exam domains: one accordion row per domain with its official
 * weight, a bar, and (when we have them) the official subtopics. Weights come
 * from the exam row — the same numbers every attempt's draw follows.
 */
export function ExamDomains({ domains, productSlug }: { domains: unknown; productSlug: string }) {
  const rows = parseDomains(domains);
  if (rows.length === 0) return null;
  const topics = EXAM_BLUEPRINTS[productSlug]?.topics ?? {};
  const max = Math.max(...rows.map((d) => d.weight), 1);
  return (
    <div className="mt-8 card p-6">
      <h2 className="font-semibold">Exam domains</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Every attempt draws questions in these official proportions. Open a domain to see the subtopics it covers.
      </p>
      <div className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
        {rows.map((d) => {
          const list = topics[d.name] ?? [];
          const header = (
            <div className="flex w-full items-center gap-3 px-4 py-3 text-left">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{d.name}</span>
                  <span className="shrink-0 font-mono text-sm font-semibold text-blue-700 dark:text-blue-300">{d.weight}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded bg-blue-600 dark:bg-blue-400" style={{ width: `${(d.weight / max) * 100}%` }} />
                </div>
              </div>
              {list.length > 0 && (
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" aria-hidden />
              )}
            </div>
          );
          if (list.length === 0) return <div key={d.name}>{header}</div>;
          return (
            <details key={d.name} className="group">
              <summary className="cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-slate-800/50 [&::-webkit-details-marker]:hidden">
                {header}
              </summary>
              <ul className="space-y-1.5 px-4 pb-4 pt-1 text-sm text-slate-600 dark:text-slate-300">
                {list.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}

// Show the site, not the raw (often very long) URL; the href keeps the full link.
function linkText(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, '')}${/\.pdf$/i.test(u.pathname) ? ' (PDF)' : ''}`;
  } catch {
    return url;
  }
}

/** "References" — the vendor's official exam page and study guide. */
export function ExamReferences({ productSlug, fallbackExamUrl }: { productSlug: string; fallbackExamUrl?: string | null }) {
  const bp = EXAM_BLUEPRINTS[productSlug];
  const links = [
    { label: 'Official exam page', url: bp?.examPageUrl ?? fallbackExamUrl ?? null },
    { label: 'Official study guide', url: bp?.studyGuideUrl ?? null }
  ].filter((l): l is { label: string; url: string } => !!l.url);
  if (links.length === 0) return null;
  return (
    <div className="mt-6 card p-6">
      <h2 className="font-semibold">References</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label} className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-slate-500 dark:text-slate-400">{l.label}:</span>
            <a href={l.url} target="_blank" rel="noopener noreferrer" title={l.url} className="inline-flex items-center gap-1 break-all text-blue-600 hover:underline dark:text-blue-300">
              {linkText(l.url)} <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
