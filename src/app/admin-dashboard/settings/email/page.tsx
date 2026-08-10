import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAllSettings, SECRET_KEYS, mask } from '@/lib/settings';
import { PageHeader } from '@/components/admin/page-header';
import EmailForm from './email-form';
import {
  EMAIL_GMAIL_FIELDS,
  EMAIL_SA_FIELDS,
  EMAIL_SMTP_FIELDS,
  EMAIL_COMMON_FIELDS,
  type FieldDef
} from '../groups';

export const dynamic = 'force-dynamic';

const ERROR_LABELS: Record<string, string> = {
  missing_code: 'Google did not return an authorization code.',
  missing_client_id: 'Save the Google OAuth Client ID first, then click Connect Gmail.',
  missing_client_credentials: 'Save both Client ID and Client Secret first.',
  token_exchange_failed: 'Google rejected the token exchange. Re-check the client secret and redirect URI.',
  access_denied: 'Google account holder denied the consent request.'
};

export default async function EmailSettingsPage({
  searchParams
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  const sp = await searchParams;
  const values = await getAllSettings();
  const allFields: FieldDef[] = [...EMAIL_GMAIL_FIELDS, ...EMAIL_SA_FIELDS, ...EMAIL_SMTP_FIELDS, ...EMAIL_COMMON_FIELDS];
  const initial: Record<string, { configured: boolean; preview: string; current: string }> = {};
  for (const f of allFields) {
    const stored = (values as any)[f.key] || '';
    const isSecret = SECRET_KEYS.has(f.key as any);
    initial[f.key] = {
      configured: !!stored,
      preview: isSecret ? mask(stored) : stored,
      current: stored
    };
  }

  const storedTransport = (values.EMAIL_TRANSPORT || 'SMTP').toUpperCase();
  const initialTransport =
    storedTransport === 'GMAIL_OAUTH' || storedTransport === 'GMAIL_SERVICE_ACCOUNT'
      ? (storedTransport as 'GMAIL_OAUTH' | 'GMAIL_SERVICE_ACCOUNT')
      : 'SMTP';
  const fallbackEnabled = (values.EMAIL_FALLBACK_ENABLED || 'true').toLowerCase() !== 'false';
  const gmailConnected = !!values.GMAIL_OAUTH_REFRESH_TOKEN;
  const gmailSender = values.GMAIL_OAUTH_SENDER_EMAIL || '';

  let flash: { kind: 'success' | 'error'; message: string } | undefined;
  if (sp.connected === '1') flash = { kind: 'success', message: `Gmail connected${gmailSender ? ` as ${gmailSender}` : ''}.` };
  else if (sp.error) flash = { kind: 'error', message: ERROR_LABELS[sp.error] || `Gmail connect failed: ${sp.error}` };

  return (
    <div>
      <PageHeader
        title="Email"
        subtitle="Outbound email transport. Pick a primary; any other fully-configured transport is used as an automatic fallback."
      />
      <EmailForm
        initial={initial}
        gmailFields={EMAIL_GMAIL_FIELDS}
        saFields={EMAIL_SA_FIELDS}
        smtpFields={EMAIL_SMTP_FIELDS}
        commonFields={EMAIL_COMMON_FIELDS}
        initialTransport={initialTransport}
        initialFallbackEnabled={fallbackEnabled}
        gmailConnected={gmailConnected}
        gmailSender={gmailSender}
        flash={flash}
      />
    </div>
  );
}
