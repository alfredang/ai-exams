import Link from 'next/link';
import { Check, ListChecks, Loader2, PenLine, Search, Telescope, Upload, Youtube } from 'lucide-react';

export type ScoutCertification = { examId: string; code: string; title: string; added: number; last: string | null };
export type ScoutQuestion = { id: string; examId: string; code: string; domain: string; stem: string; createdAt: string; source: { label: string; url: string | null } | null };
/** A source the scout has read but not yet written questions from (it is working right now). */
export type ScoutInProgress = { code: string; label: string } | null;

const STEPS = [
  { icon: ListChecks, title: 'Pick a certification', body: 'The one on sale that has waited longest since its last scout run.' },
  { icon: Search, title: 'Find and read a course', body: 'A good YouTube course for that exam; the site reads its transcript.' },
  { icon: PenLine, title: 'Write questions and answers', body: '10–20 original questions with answer keys, explanations and official references.' },
  { icon: Upload, title: 'Publish', body: 'Validated, repeats refused, then straight into that question bank.' }
];

const fmt = (iso: string) => new Date(iso).toLocaleString('en-SG', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * "Scouting agent": the exam-question-scout Digital Workforce agent, which
 * finds its own sources every morning. Shows its four-step process (animated
 * while a run is in progress), the certifications it filled in the last 30
 * days and the latest questions it added.
 */
export function ScoutSection({ certifications, questions, inProgress }: { certifications: ScoutCertification[]; questions: ScoutQuestion[]; inProgress: ScoutInProgress }) {
  const last = certifications[0];
  // While running, steps 1–2 are done and step 3 is active; after a run all four are done.
  const stateOf = (i: number) => (inProgress ? (i < 2 ? 'done' : i === 2 ? 'active' : 'idle') : last ? 'done' : 'idle');
  return (
    <section id="scout" className="card scroll-mt-24 p-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Telescope className="h-5 w-5 text-red-600" /> Scouting agent
      </h2>
      <p className="text-xs text-slate-500">
        Works on its own every morning at 7:00, with no request from you: it scouts a YouTube course for one certification and adds new
        questions and answers to that question bank.
      </p>

      <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
        {STEPS.map((s, i) => {
          const st = stateOf(i);
          const Icon = s.icon;
          return (
            <li
              key={s.title}
              className={`rounded-md border bg-white p-3 transition-shadow duration-500 dark:bg-slate-900/60 ${
                st === 'active' ? 'border-red-500 ring-2 ring-red-300/70 dark:ring-red-800/60' : st === 'done' ? 'border-emerald-200 dark:border-emerald-900/60' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="relative inline-flex h-6 w-6 shrink-0">
                  {st === 'active' && <span className="absolute inset-0 rounded-full bg-red-400 opacity-60 motion-safe:animate-ping" />}
                  <span
                    className={`relative inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold text-white ${
                      st === 'active' ? 'bg-red-600' : st === 'done' ? 'bg-emerald-600' : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                  >
                    {st === 'done' ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                </span>
                {st === 'active' ? <Loader2 className="h-4 w-4 text-red-600 motion-safe:animate-spin" /> : <Icon className="h-4 w-4 text-slate-500" />}
                <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{s.title}</span>
              </div>
              <p className="mt-1.5 text-[12px] leading-snug text-slate-600 dark:text-slate-300">{s.body}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[13px]">
        {inProgress ? (
          <span className="font-medium text-red-700 dark:text-red-400">
            Running now: writing questions for {inProgress.code} from “{inProgress.label}”.
          </span>
        ) : last?.last ? (
          <span className="text-slate-600 dark:text-slate-300">
            Last run: {fmt(last.last)} · <span className="font-medium">{last.code}</span> · {last.added} question{last.added === 1 ? '' : 's'} added.
          </span>
        ) : (
          <span className="text-slate-500">No scout run in the last 30 days.</span>
        )}
      </p>

      {certifications.length > 0 && (
        <>
          <h3 className="admin-label mt-4">Certifications scouted · last 30 days</h3>
          <ul className="mt-1 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {certifications.map((c) => (
              <li key={c.examId} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="font-medium">{c.code}</span> — {c.title}
                  {c.last && <span className="ml-2 text-[12px] text-slate-500">{fmt(c.last)}</span>}
                </span>
                <Link href={`/admin-dashboard/exams/${c.examId}?qflag=scout#questions`} className="admin-link text-[13px]">
                  {c.added} question{c.added === 1 ? '' : 's'} →
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {questions.length > 0 && (
        <>
          <h3 className="admin-label mt-4">Latest questions from the scout</h3>
          <div className="mt-1 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="admin-thead">
                <tr>
                  <th className="px-2 py-1.5">Certification</th>
                  <th className="px-2 py-1.5">Question</th>
                  <th className="hidden px-2 py-1.5 lg:table-cell">Exam domain</th>
                  <th className="hidden px-2 py-1.5 xl:table-cell">Source</th>
                  <th className="hidden px-2 py-1.5 sm:table-cell">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {questions.map((q) => (
                  <tr key={q.id}>
                    <td className="whitespace-nowrap px-2 py-1.5 font-medium">{q.code}</td>
                    <td className="px-2 py-1.5">
                      <Link href={`/admin-dashboard/exams/${q.examId}/questions/${q.id}`} className="hover:underline">
                        {q.stem.length > 140 ? `${q.stem.slice(0, 140)}…` : q.stem}
                      </Link>
                    </td>
                    <td className="hidden px-2 py-1.5 text-slate-500 lg:table-cell">{q.domain}</td>
                    <td className="hidden max-w-[16rem] truncate px-2 py-1.5 text-slate-500 xl:table-cell">
                      {q.source?.url ? (
                        <a href={q.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                          <Youtube className="h-3.5 w-3.5 shrink-0 text-red-600" /> {q.source.label}
                        </a>
                      ) : (
                        (q.source?.label ?? '—')
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap px-2 py-1.5 text-slate-500 sm:table-cell">{fmt(q.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
