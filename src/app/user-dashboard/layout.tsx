import { UserChrome } from '@/components/user-chrome';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function MyContentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string; impersonatedBy?: string } | undefined;
  if (user?.id && user.role === 'USER' && !user.impersonatedBy) {
    const account = await db.user.findUnique({ where: { id: user.id }, select: { passwordSetupRequired: true } });
    if (account?.passwordSetupRequired) redirect('/set-password');
  }
  return (
    <>
      <ImpersonationBanner />
      <UserChrome>{children}</UserChrome>
    </>
  );
}
