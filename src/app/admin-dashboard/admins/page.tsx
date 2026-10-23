import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth, SUPER_ADMIN_EMAIL, isSuperAdmin } from '@/lib/auth';

async function promote(formData: FormData) {
  'use server';
  const session = await auth();
  const me = session?.user as any;
  if (!isSuperAdmin(me?.email)) return;
  const email = String(formData.get('email') || '').toLowerCase().trim();
  if (!email) return;
  const target = await db.user.findUnique({ where: { email } });
  if (!target) return;
  await db.user.update({ where: { id: target.id }, data: { role: 'ADMIN' } });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.promote', targetType: 'User', targetId: target.id }
  });
  revalidatePath('/admin-dashboard/admins');
}

async function demote(formData: FormData) {
  'use server';
  const session = await auth();
  const me = session?.user as any;
  if (!isSuperAdmin(me?.email)) return;
  const userId = String(formData.get('userId'));
  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return;
  if (isSuperAdmin(target.email)) return;
  await db.user.update({ where: { id: target.id }, data: { role: 'USER' } });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.demote', targetType: 'User', targetId: target.id }
  });
  revalidatePath('/admin-dashboard/admins');
}

export default async function AdminAdminsPage() {
  const session = await auth();
  const me = session?.user as any;
  const superAdmin = isSuperAdmin(me?.email);

  const admins = await db.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Admins</h1>
        <div className="text-xs text-slate-500">
          {superAdmin
            ? `Signed in as super admin (${SUPER_ADMIN_EMAIL})`
            : `Role changes require super admin (${SUPER_ADMIN_EMAIL})`}
        </div>
      </div>

      {superAdmin && (
        <form action={promote} className="card mt-4 flex flex-wrap items-center gap-2 p-4">
          <label className="text-sm font-medium">Add admin by email</label>
          <input name="email" type="email" required placeholder="user@example.com" className="input" />
          <button className="btn-outline">Add as admin</button>
        </form>
      )}

      <div className="card mt-4 overflow-x-auto">
        <table className="w-max min-w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {admins.map((u) => {
              const isSuper = isSuperAdmin(u.email);
              return (
                <tr key={u.id}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">{u.name || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {isSuper ? (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[11px] font-semibold text-purple-800">
                        SUPER ADMIN
                      </span>
                    ) : (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-800">
                        ADMIN
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {superAdmin && !isSuper ? (
                      <form action={demote}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button className="btn-outline text-xs text-red-600">Remove as admin</button>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {admins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                  No admins yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
