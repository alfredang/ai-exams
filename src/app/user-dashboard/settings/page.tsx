import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import argon2 from 'argon2';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NATIONALITY_CODES } from '@/lib/nationalities';
import { ThemePreferenceSelect } from '@/components/theme-preference-select';
import { ProfileForm, type ProfileState } from '@/components/profile-form';

async function updateProfile(formData: FormData): Promise<ProfileState> {
  'use server';
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return { error: 'Your session has expired. Sign in again.' };
  const name = String(formData.get('name') || '').trim().slice(0, 120) || null;
  const nationalityRaw = String(formData.get('nationality') || '').trim();
  const nationality = NATIONALITY_CODES.has(nationalityRaw) ? nationalityRaw : null;
  await db.user.update({ where: { id: userId }, data: { name, nationality } });
  revalidatePath('/user-dashboard/settings');
  return { ok: true };
}

async function changePassword(formData: FormData) {
  'use server';
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return;
  const newPassword = String(formData.get('newPassword') || '');
  if (newPassword.length < 8) return;
  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await argon2.hash(newPassword) }
  });
  revalidatePath('/user-dashboard/settings');
}

export default async function MyProfilePage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect('/login');

  const me = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, nationality: true, createdAt: true, role: true }
  });
  if (!me) redirect('/login');

  return (
    <>
      <h1 className="text-2xl font-bold">My Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your account details, password, and appearance.</p>

      {/* Theme preference */}
      <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="text-sm font-semibold">Theme</h2>
          <p className="mt-0.5 text-xs text-slate-500">System follows your OS. Light/Dark force the choice.</p>
        </div>
        <ThemePreferenceSelect />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Profile details */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Account details</h2>
          <ProfileForm
            action={updateProfile}
            email={me.email}
            initialName={me.name ?? ''}
            initialNationality={me.nationality ?? ''}
            footer={`Joined ${me.createdAt.toLocaleDateString()} · Role ${me.role}`}
          />
        </div>

        {/* Password */}
        <div className="card h-fit p-6">
          <h2 className="text-lg font-semibold">Reset password</h2>
          <p className="mt-1 text-sm text-slate-500">Minimum 8 characters.</p>
          <form action={changePassword} className="mt-4 space-y-3">
            <input
              name="newPassword"
              type="password"
              minLength={8}
              required
              placeholder="New password"
              className="input"
              autoComplete="new-password"
            />
            <button className="btn-primary">Reset password</button>
          </form>
        </div>
      </div>
    </>
  );
}
