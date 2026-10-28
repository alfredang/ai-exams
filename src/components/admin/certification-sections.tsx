import { Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { poolStats } from '@/lib/question-pool';
import { SubmitBusyButton } from '@/components/admin/submit-busy-button';
import { SeoSavedFlash } from '@/components/admin/seo-saved-flash';
import { InfoLookupButton } from '@/components/admin/info-lookup-button';
import {
  autoFillFromWeb, runSeoAssist, saveSeoMeta, updateCertificationDetails, updateDomainWeights
} from '@/app/admin-dashboard/certifications/actions';

const LEVELS = ['Foundational', 'Associate', 'Professional', 'Specialty'];

/**
 * The certification sections of the Practice Exam page (/admin-dashboard/bundles/[id]):
 * exam title, code, timer, pass mark, questions per exam, official page and
 * description, then domain weights and SEO meta — all stored on the question
 * bank's Exam row. /admin-dashboard/certifications/[id] forwards to that page
 * (and renders these sections only for a bank no Practice Exam sells yet).
 */
export async function CertificationSections({
  examId,
  flash
}: {
  examId: string;
  /** `?cert=` value: saved | weights | slug | required. */
  flash?: string;
}) {
  const exam = await db.exam.findUnique({ where: { id: examId } });
  if (!exam) return null;
  const pool = await poolStats(db, exam);
  const weightTotal = pool.rows.reduce((s, r) => s + r.weight, 0);

  return (
    <div className="space-y-4">
      <SeoSavedFlash />

      <form id="certification" action={updateCertificationDetails} className="card scroll-mt-24 grid gap-3 p-4 md:grid-cols-3">
        <input type="hidden" name="id" value={exam.id} />
        <div className="md:col-span-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Certification details</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            The exam title and description are also the Practice Exam&apos;s title and description on the catalog, checkout and invoices.
          </p>
        </div>
        {flash === 'saved' && <Flash tone="ok" className="md:col-span-3">Certification saved.</Flash>}
        {flash === 'slug' && <Flash tone="error" className="md:col-span-3">That exam slug is already used by another question bank.</Flash>}
        {flash === 'required' && <Flash tone="error" className="md:col-span-3">Exam title, code and slug are required.</Flash>}
        <Field label="Exam title" className="md:col-span-3">
          <input name="title" defaultValue={exam.title} className="input" required />
        </Field>
        <Field label="Code">
          <input name="code" defaultValue={exam.code} className="input" required />
        </Field>
        <Field label="Slug" hint="Used by the free teaser link.">
          <input name="slug" defaultValue={exam.slug} className="input" required />
        </Field>
        <Field label="Level">
          <select name="level" defaultValue={exam.level} className="input">
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Duration (min)">
          <input name="durationMinutes" type="number" min={1} defaultValue={exam.durationMinutes} className="input" />
        </Field>
        <Field label="Pass %">
          <input name="passingScore" type="number" min={0} max={100} defaultValue={exam.passingScore} className="input" />
        </Field>
        <Field label="Questions per exam">
          <input name="questionCount" type="number" min={1} defaultValue={exam.questionCount} className="input" />
        </Field>
        <div className="text-sm md:col-span-3">
          <label htmlFor="infoUrl" className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Exam Info URL (vendor page or PDF)</label>
          <div className="flex gap-2">
            <input key={exam.infoUrl ?? ''} id="infoUrl" name="infoUrl" type="url" placeholder="https://aws.amazon.com/certification/..." defaultValue={exam.infoUrl ?? ''} className="input" />
            <InfoLookupButton examId={exam.id} action={autoFillFromWeb} />
          </div>
        </div>
        <Field label="Description" className="md:col-span-3">
          <textarea name="description" defaultValue={exam.description ?? ''} rows={4} className="input" />
        </Field>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 md:col-span-2">
          <input type="checkbox" name="published" defaultChecked={exam.published} />
          Active (visible to users)
        </label>
        <div className="flex justify-end md:col-span-1">
          <button className="btn-primary">Save certification</button>
        </div>
      </form>

      <section id="domains" className="card scroll-mt-24 p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exam domains &amp; weights</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Every attempt (practice, exam mode, teaser, retakes) draws {Math.min(exam.questionCount, pool.total)} of the {pool.total} published questions in these proportions.
              {exam.domainsVerifiedAt && <> Weights checked {exam.domainsVerifiedAt.toISOString().slice(0, 10)}.</>}
            </p>
          </div>
          {exam.domainsSourceUrl && (
            <a href={exam.domainsSourceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Official source ↗</a>
          )}
        </div>
        {flash === 'weights' && <Flash tone="ok" className="mb-3">Domain weights saved.</Flash>}
        {pool.rows.length === 0 ? (
          <p className="text-xs text-slate-500">No domain blueprint set — attempts draw uniformly at random.</p>
        ) : (
          <form action={updateDomainWeights}>
            <input type="hidden" name="id" value={exam.id} />
                <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700">
                    <th className="py-1.5 pr-3 font-medium">Domain</th>
                    <th className="w-28 py-1.5 pr-3 font-medium">Exam %</th>
                    <th className="w-24 py-1.5 pr-3 text-right font-medium">In pool</th>
                    <th className="w-28 py-1.5 text-right font-medium">Per attempt</th>
                  </tr>
                </thead>
                <tbody>
                  {pool.rows.map((r, i) => (
                    <tr key={r.name} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                      <td className="py-1.5 pr-3">{r.name}</td>
                      <td className="py-1.5 pr-3">
                        <input name={`weight${i}`} type="number" min={0} max={100} defaultValue={r.weight} className="input-sm w-20" aria-label={`${r.name} weight`} />
                      </td>
                      <td className={`py-1.5 pr-3 text-right tabular-nums ${r.pool < r.perAttempt || r.pool === 0 ? 'font-semibold text-red-600' : ''}`}>{r.pool}</td>
                      <td className="py-1.5 text-right tabular-nums">{r.perAttempt}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-[12px] font-semibold">
                    <td className="py-1.5 pr-3">Total</td>
                    <td className={`py-1.5 pr-3 ${weightTotal === 100 ? '' : 'text-red-600'}`}>{weightTotal}%</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{pool.rows.reduce((s, r) => s + r.pool, 0)}</td>
                    <td className="py-1.5 text-right tabular-nums">{pool.rows.reduce((s, r) => s + r.perAttempt, 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {pool.unmatched.length > 0 && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                Not in the blueprint (used only to fill a short domain):{' '}
                {pool.unmatched.map((u) => `${u.domain} (${u.count})`).join(' · ')}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="flex flex-1 flex-col text-[11px] uppercase tracking-wider text-slate-500">
                Official source URL
                <input name="domainsSourceUrl" type="url" defaultValue={exam.domainsSourceUrl ?? exam.infoUrl ?? ''} className="input-sm mt-0.5 w-full" />
              </label>
              <button className="inline-flex h-9 items-center rounded-md bg-blue-600 px-4 text-[13px] font-medium text-white hover:bg-blue-700">Save weights</button>
            </div>
          </form>
        )}
      </section>

      <section id="seo" className="card scroll-mt-24 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">SEO meta</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">Used by the public Practice Exam page.</p>
          </div>
          <form action={runSeoAssist}>
            <input type="hidden" name="id" value={exam.id} />
                <SubmitBusyButton
              idleLabel={<><Sparkles className="mr-1 h-3.5 w-3.5" /> AI Assist</>}
              busyLabel={<>Generating…</>}
              className="inline-flex h-9 items-center rounded-md bg-violet-600 px-3 text-[13px] font-medium text-white hover:bg-violet-700 disabled:cursor-wait disabled:bg-violet-400"
            />
          </form>
        </div>
        <form action={saveSeoMeta} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="id" value={exam.id} />
            <Field label="Meta title (≤70 chars)" className="md:col-span-2">
            <input name="metaTitle" defaultValue={exam.metaTitle ?? ''} className="input" placeholder="AWS SAA-C03 Practice Exam | Tertiary Exams" />
          </Field>
          <Field label="Meta description (120–180 chars)" className="md:col-span-2">
            <textarea name="metaDescription" defaultValue={exam.metaDescription ?? ''} rows={2} className="input" />
          </Field>
          <Field label="Meta keywords (comma-separated)">
            <input name="metaKeywords" defaultValue={exam.metaKeywords ?? ''} className="input" />
          </Field>
          <Field label="OG image URL (optional)">
            <input name="ogImage" defaultValue={exam.ogImage ?? ''} className="input" />
          </Field>
          <div className="flex justify-end md:col-span-2">
            <SubmitBusyButton
              idleLabel={<>Save SEO</>}
              busyLabel={<>Saving…</>}
              className="btn-primary disabled:cursor-wait disabled:opacity-70"
            />
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block text-sm ${className || ''}`}>
      <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

function Flash({ tone, className, children }: { tone: 'ok' | 'error'; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-md border px-3 py-2 text-[12px] ${tone === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-200'} ${className ?? ''}`}>
      {children}
    </div>
  );
}
