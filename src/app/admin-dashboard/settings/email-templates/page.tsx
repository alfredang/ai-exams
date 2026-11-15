import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { DEFAULT_TEMPLATES, TEMPLATE_KEYS } from '@/lib/email/defaults';
import EmailTemplatesClient, { type TemplateRow } from './client';

export const dynamic = 'force-dynamic';

export default async function EmailTemplatesPage() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') redirect('/');

  const rows = await db.emailTemplate.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const items: TemplateRow[] = TEMPLATE_KEYS.map((key) => {
    const row = byKey.get(key);
    const def = DEFAULT_TEMPLATES[key];
    return {
      key,
      displayName: row?.displayName ?? def.displayName,
      description: def.description,
      subject: row?.subject ?? def.subject,
      bodyHtml: row?.bodyHtml ?? def.bodyHtml,
      ccEmails: row?.ccEmails ?? [],
      enabled: row?.enabled ?? true,
      customized: !!row,
      updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : null,
      defaults: { displayName: def.displayName, subject: def.subject, bodyHtml: def.bodyHtml }
    };
  });

  return (
    <div>
      <div className="mb-2 text-sm">
        <Link href="/admin-dashboard/settings/company" className="text-slate-500 hover:underline">← Back to Settings</Link>
      </div>
      <h1 className="admin-h1">Email Templates</h1>
      <p className="mt-1 text-sm text-slate-500">
        Click any row to expand and edit inline. Templates use Handlebars syntax (e.g. <code>{'{{user.name}}'}</code>).
        CC addresses receive a copy of every send for that template.
      </p>
      <EmailTemplatesClient initial={items} adminEmail={user?.email ?? ''} />
    </div>
  );
}
