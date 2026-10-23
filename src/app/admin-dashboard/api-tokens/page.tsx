import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/admin/badge';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { Trash2 } from 'lucide-react';
import { generateApiToken } from '@/lib/api-tokens';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role === 'USER') throw new Error('forbidden');
  return user as { id: string };
}

async function createToken(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const name = String(formData.get('name') || '').trim();
  const scopesRaw = String(formData.get('scopes') || '').trim();
  if (!name) return;
  const scopes = scopesRaw.split(/[,\s]+/).filter(Boolean);
  const { raw, prefix, hashed } = generateApiToken();
  const created = await db.apiToken.create({
    data: { name, hashedToken: hashed, prefix, scopes, createdById: me.id }
  });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'api-token.create', targetType: 'ApiToken', targetId: created.id, metadata: { prefix } }
  });
  // One-time display via flash cookie equivalent: stash the raw value in
  // a redirect query so the issuer can copy it. The value never persists.
  revalidatePath('/admin-dashboard/api-tokens');
  redirect(`/admin-dashboard/api-tokens?newToken=${encodeURIComponent(raw)}`);
}

async function revokeToken(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const id = String(formData.get('id'));
  await db.apiToken.update({ where: { id }, data: { revokedAt: new Date() } });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'api-token.revoke', targetType: 'ApiToken', targetId: id, metadata: {} }
  });
  revalidatePath('/admin-dashboard/api-tokens');
}

export default async function ApiTokensPage({ searchParams }: { searchParams: Promise<{ newToken?: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role === 'USER' || !session?.user) redirect('/');
  const sp = await searchParams;
  const newToken = sp.newToken;
  const tokens = await db.apiToken.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { email: true } } }
  });

  return (
    <div>
      <PageHeader title="API tokens" subtitle="Long-lived bearer tokens for partner integrations." />

      {newToken && (
        <div className="card mb-3 border-l-2 border-l-emerald-500 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">New token (copy now — shown only once)</div>
          <code className="mt-1 block break-all rounded bg-slate-50 p-2 text-[12px] font-mono dark:bg-slate-800">{newToken}</code>
        </div>
      )}

      <form action={createToken} className="card mb-3 flex flex-wrap items-end gap-2 p-3">
        <label className="flex-1 min-w-[12rem]">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Name</span>
          <input name="name" required placeholder="LMS Integration v1" className="input-sm" />
        </label>
        <label className="flex-1 min-w-[14rem]">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Scopes (comma-separated, optional)</span>
          <input name="scopes" placeholder="read:orders, read:invoices" className="input-sm" />
        </label>
        <button className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">
          Create token
        </button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-[12px]">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-left text-[11px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Prefix</th>
              <th className="px-3 py-2">Scopes</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Last used</th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {tokens.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-[12px] text-slate-500">No tokens yet.</td></tr>
            )}
            {tokens.map((t) => (
              <tr key={t.id}>
                <td className="px-3 py-1.5 font-medium">{t.name}</td>
                <td className="px-3 py-1.5 font-mono text-xs">{t.prefix}…</td>
                <td className="px-3 py-1.5 text-xs text-slate-500">{t.scopes.join(', ') || '*'}</td>
                <td className="px-3 py-1.5">
                  <Badge variant={t.revokedAt ? 'muted' : 'success'}>{t.revokedAt ? 'Revoked' : 'Active'}</Badge>
                </td>
                <td className="px-3 py-1.5 text-xs">{t.createdAt.toLocaleDateString()} · {t.createdBy.email}</td>
                <td className="px-3 py-1.5 text-xs">{t.lastUsedAt ? t.lastUsedAt.toLocaleString() : '—'}</td>
                <td className="px-3 py-1.5 text-right">
                  {!t.revokedAt && (
                    <form action={revokeToken} className="inline-flex">
                      <input type="hidden" name="id" value={t.id} />
                      <ConfirmButton message={`Revoke token "${t.name}"?`} className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </ConfirmButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
