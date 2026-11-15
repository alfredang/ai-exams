import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { DEFAULT_TEMPLATES, TEMPLATE_KEYS } from '@/lib/email/defaults';
import type { EmailTemplateKey } from '@prisma/client';
import EditorClient from './editor-client';

export const dynamic = 'force-dynamic';

export default async function EditTemplatePage({ params }: { params: Promise<{ key: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { key } = await params;
  if (!(TEMPLATE_KEYS as string[]).includes(key)) return notFound();
  const k = key as EmailTemplateKey;
  const row = await db.emailTemplate.findUnique({ where: { key: k } });
  const def = DEFAULT_TEMPLATES[k];
  const adminEmail = (session?.user as any)?.email ?? '';

  return (
    <div>
      <div className="mb-2 text-sm">
        <Link href="/admin-dashboard/settings/email-templates" className="text-slate-500 hover:underline">← All templates</Link>
      </div>
      <h1 className="admin-h1">{k}</h1>
      <p className="mt-1 text-sm text-slate-500">{def.description}</p>

      <EditorClient
        templateKey={k}
        initial={{
          subject: row?.subject ?? def.subject,
          bodyHtml: row?.bodyHtml ?? def.bodyHtml,
          enabled: row?.enabled ?? true,
          customized: !!row
        }}
        defaults={{ subject: def.subject, bodyHtml: def.bodyHtml }}
        sampleVars={def.sampleVars}
        adminEmail={adminEmail}
      />
    </div>
  );
}
