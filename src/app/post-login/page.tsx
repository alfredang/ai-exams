import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PostLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session?.user) redirect('/login');
  if (userId && role === 'USER' && !(session.user as any).impersonatedBy) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { passwordSetupRequired: true } });
    if (user?.passwordSetupRequired) redirect('/set-password');
  }
  // Administrators should always enter the admin workspace after signing in.
  // Do this before honoring `next`, which may point at a public or user route.
  if (role === 'ADMIN') redirect('/admin-dashboard');
  const rawNext = (await searchParams).next;
  if (rawNext && rawNext !== '/post-login' && rawNext.startsWith('/') &&
      !rawNext.startsWith('//') && !rawNext.startsWith('/\\')) redirect(rawNext);
  redirect('/user-dashboard');
}
