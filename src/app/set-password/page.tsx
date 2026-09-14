import { redirect } from 'next/navigation';
import argon2 from 'argon2';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function setPassword(formData: FormData) {
  'use server';
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/login');
  if ((session?.user as { impersonatedBy?: string } | undefined)?.impersonatedBy) redirect('/user-dashboard');
  const user = await db.user.findUnique({ where: { id: userId }, select: { active: true, role: true, passwordSetupRequired: true, emailVerified: true } });
  if (!user?.active || user.role !== 'USER' || !user.emailVerified) redirect('/login');
  if (!user.passwordSetupRequired) redirect('/user-dashboard');

  const password = String(formData.get('password') || '');
  const confirmation = String(formData.get('confirmation') || '');
  if (password.length < 8 || password.length > 128 || password !== confirmation) {
    redirect('/set-password?error=invalid');
  }
  await db.user.update({ where: { id: userId }, data: { passwordHash: await argon2.hash(password), passwordSetupRequired: false } });
  redirect('/user-dashboard');
}

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/login');
  if ((session?.user as { impersonatedBy?: string } | undefined)?.impersonatedBy) redirect('/user-dashboard');
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, active: true, role: true, passwordSetupRequired: true, emailVerified: true } });
  if (!user?.active || user.role !== 'USER' || !user.emailVerified) redirect('/login');
  if (!user.passwordSetupRequired) redirect('/user-dashboard');
  const error = (await searchParams).error;

  return (
    <div className="container-app max-w-md py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Create your password</h1>
        <p className="mt-2 text-sm text-slate-600">Your email {user.email} is verified. Choose a password for future sign-ins.</p>
        <form action={setPassword} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" name="password" type="password" minLength={8} maxLength={128} required autoComplete="new-password" className="input" />
          </div>
          <div>
            <label htmlFor="confirmation" className="label">Confirm password</label>
            <input id="confirmation" name="confirmation" type="password" minLength={8} maxLength={128} required autoComplete="new-password" className="input" />
          </div>
          {error && <p role="alert" className="text-sm text-red-600">Passwords must match and contain 8–128 characters.</p>}
          <button className="btn-primary w-full">Save password</button>
        </form>
      </div>
    </div>
  );
}
