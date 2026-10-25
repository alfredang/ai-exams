import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { isFullName, normalizeName, startBlocker } from '@/lib/full-name';
import { VerifyEmailForm } from '@/components/verify-email-form';
import { resumeOrCreateAttempt } from '@/lib/start-attempt';

export const dynamic = 'force-dynamic';

type Target = { examId?: string; mode?: string; next?: string };

function safeNext(raw?: string) {
  return raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\') ? raw : '/user-dashboard';
}

function targetQuery(t: Target) {
  const q = new URLSearchParams();
  if (t.examId) { q.set('examId', t.examId); q.set('mode', t.mode === 'PRACTICE' ? 'PRACTICE' : 'EXAM'); }
  else if (t.next) q.set('next', safeNext(t.next));
  return q;
}

// Where the customer was heading: straight into the exam they clicked
// (resuming an unfinished attempt in that mode), or back to `next`.
async function continueTo(userId: string, t: Target): Promise<never> {
  if (t.examId) {
    const id = await resumeOrCreateAttempt(userId, t.examId, t.mode === 'PRACTICE' ? 'PRACTICE' : 'EXAM');
    redirect(id ? `/exam/${id}` : '/user-dashboard?start=failed');
  }
  redirect(safeNext(t.next));
}

async function saveName(formData: FormData) {
  'use server';
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/login');
  const t: Target = {
    examId: String(formData.get('examId') || '') || undefined,
    mode: String(formData.get('mode') || ''),
    next: String(formData.get('next') || '') || undefined
  };
  const name = normalizeName(String(formData.get('name') || ''));
  if (!isFullName(name)) {
    const q = targetQuery(t);
    q.set('error', '1');
    redirect(`/complete-profile?${q}`);
  }
  await db.user.update({ where: { id: userId }, data: { name } });
  await continueTo(userId, t);
}

export default async function CompleteProfilePage({ searchParams }: { searchParams: Promise<Target & { error?: string }> }) {
  const sp = await searchParams;
  const session = await auth();
  const user = session?.user as { id?: string; impersonatedBy?: string } | undefined;
  if (!user?.id) redirect(`/login?next=${encodeURIComponent(`/complete-profile?${targetQuery(sp)}`)}`);
  const blocker = await startBlocker(user.id, user.impersonatedBy);
  if (!blocker) await continueTo(user.id, sp);

  const me = await db.user.findUnique({ where: { id: user.id }, select: { name: true, email: true } });
  const current = isFullName(me?.name) ? normalizeName(me?.name) : '';
  const t = targetQuery(sp);

  // Step 1: prove the inbox is theirs. The form signs in with an email code,
  // which marks the address verified, then comes back here for the name.
  if (blocker === 'email' && me?.email) {
    return (
      <div className="container-app max-w-md py-16">
        <div className="card p-8">
          <div className="eyebrow mb-2">Before you start</div>
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="mt-2 text-sm text-slate-600">
            Practice exams need a verified email address. We&rsquo;ll send a 6-digit code to <b>{me.email}</b>.
          </p>
          <VerifyEmailForm email={me.email} next={`/complete-profile?${t}`} />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app max-w-md py-16">
      <div className="card p-8">
        <div className="eyebrow mb-2">Before you start</div>
        <h1 className="text-2xl font-bold">Enter your full name</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your name appears on your score reports, invoices and exam vouchers. Enter your first and last name as they
          appear on your ID.
        </p>
        <form action={saveName} className="mt-6 space-y-4">
          {[...t.entries()].map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input
              id="name" name="name" required minLength={3} maxLength={120} autoComplete="name" autoFocus
              defaultValue={current} placeholder="e.g. Tan Wei Ming" className="input"
            />
          </div>
          {sp.error && (
            <p role="alert" className="text-sm text-red-600">
              Please enter your real first and last name (letters only, e.g. &ldquo;Tan Wei Ming&rdquo;).
            </p>
          )}
          <button className="btn-primary w-full">{sp.examId ? 'Save and start' : 'Save'}</button>
        </form>
        {me?.email && <p className="mt-4 text-xs text-slate-500">Signed in as {me.email}</p>}
      </div>
    </div>
  );
}
