import { createSign } from 'node:crypto';
import nodemailer, { type Transporter } from 'nodemailer';
import { getAllSettings } from './settings';
import { db } from './db';

export type TransportKind = 'GMAIL_OAUTH' | 'GMAIL_SERVICE_ACCOUNT' | 'SMTP';

type BuiltTransport = {
  kind: TransportKind;
  transporter: Transporter;
  from: string;
  signature: string;
};

type AllSettings = Awaited<ReturnType<typeof getAllSettings>>;

const cache = new Map<TransportKind, BuiltTransport>();

/**
 * Google Workspace service-account credentials. Admins may paste either the
 * bare PEM private key or the entire downloaded JSON key file into
 * GMAIL_SA_PRIVATE_KEY — the JSON also carries client_email, which is used
 * when GMAIL_SA_CLIENT_EMAIL is left blank. Literal "\n" sequences (as they
 * appear inside the JSON string) are unescaped.
 */
function serviceAccountCreds(s: AllSettings): { clientEmail: string; privateKey: string; sender: string } {
  let raw = (s.GMAIL_SA_PRIVATE_KEY || '').trim();
  let clientEmail = (s.GMAIL_SA_CLIENT_EMAIL || '').trim();
  if (raw.startsWith('{')) {
    try {
      const json = JSON.parse(raw) as { private_key?: string; client_email?: string };
      raw = json.private_key || '';
      if (!clientEmail) clientEmail = json.client_email || '';
    } catch {
      // fall through — treated as a (malformed) PEM below
    }
  }
  const privateKey = raw.replace(/\\n/g, '\n');
  return { clientEmail, privateKey, sender: (s.GMAIL_SA_SENDER_EMAIL || '').trim() };
}

export function isTransportConfigured(kind: TransportKind, s: AllSettings): boolean {
  if (kind === 'GMAIL_OAUTH') {
    return !!(s.GMAIL_OAUTH_SENDER_EMAIL && s.GMAIL_OAUTH_CLIENT_ID && s.GMAIL_OAUTH_CLIENT_SECRET && s.GMAIL_OAUTH_REFRESH_TOKEN);
  }
  if (kind === 'GMAIL_SERVICE_ACCOUNT') {
    const c = serviceAccountCreds(s);
    return !!(c.clientEmail && c.privateKey && c.sender);
  }
  return !!(s.SMTP_HOST || process.env.SMTP_HOST);
}

// SMTP XOAUTH2 requires the full mail scope; the narrower gmail.send scope
// only works for the REST API. The Workspace admin must authorize the
// service account's client ID for this exact scope under Domain-wide
// Delegation.
const SA_SCOPE = 'https://mail.google.com/';

let saTokenCache: { key: string; accessToken: string; expiresAt: number } | null = null;

/** Mint (and cache) a domain-wide-delegation access token for the impersonated sender. */
async function getServiceAccountAccessToken(clientEmail: string, privateKey: string, sender: string): Promise<string> {
  const cacheKey = `${clientEmail}:${sender}:${privateKey.slice(-16)}`;
  const now = Math.floor(Date.now() / 1000);
  if (saTokenCache && saTokenCache.key === cacheKey && saTokenCache.expiresAt - now > 300) {
    return saTokenCache.accessToken;
  }
  const b64url = (v: string) => Buffer.from(v).toString('base64url');
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: clientEmail,
      sub: sender, // impersonated Workspace user
      scope: SA_SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    })
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  let signature: string;
  try {
    signature = signer.sign(privateKey).toString('base64url');
  } catch {
    throw new Error('Service account private key is invalid — paste the PEM key or the full JSON key file.');
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`
    })
  });
  const json = (await res.json()) as { access_token?: string; expires_in?: number; error?: string; error_description?: string };
  if (!res.ok || !json.access_token) {
    const hint =
      json.error === 'unauthorized_client'
        ? ' (domain-wide delegation for this client ID + scope https://mail.google.com/ is not authorized in the Workspace Admin console)'
        : json.error === 'invalid_grant'
          ? ` (check that ${sender} exists in the Workspace domain)`
          : '';
    throw new Error(`Service account token exchange failed: ${json.error_description || json.error || res.status}${hint}`);
  }
  saTokenCache = { key: cacheKey, accessToken: json.access_token, expiresAt: now + (json.expires_in ?? 3600) };
  return json.access_token;
}

/**
 * Build (or reuse) a nodemailer transporter for the given kind. The
 * signature string is the cache key, so any settings change invalidates
 * the cached transport without a redeploy.
 */
async function buildTransport(kind: TransportKind, s: AllSettings): Promise<BuiltTransport> {
  if (kind === 'GMAIL_OAUTH') {
    const user = s.GMAIL_OAUTH_SENDER_EMAIL || '';
    const clientId = s.GMAIL_OAUTH_CLIENT_ID || '';
    const clientSecret = s.GMAIL_OAUTH_CLIENT_SECRET || '';
    const refreshToken = s.GMAIL_OAUTH_REFRESH_TOKEN || '';
    if (!user || !clientId || !clientSecret || !refreshToken) {
      throw new Error('Gmail OAuth configuration is incomplete. Visit Settings → Email.');
    }
    const signature = `gmail:${user}:${refreshToken.slice(-10)}`;
    const hit = cache.get(kind);
    if (hit && hit.signature === signature) return hit;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { type: 'OAuth2', user, clientId, clientSecret, refreshToken }
    } as any);
    const built = { kind, transporter, from: s.EMAIL_FROM || user, signature };
    cache.set(kind, built);
    return built;
  }

  if (kind === 'GMAIL_SERVICE_ACCOUNT') {
    const { clientEmail, privateKey, sender } = serviceAccountCreds(s);
    if (!clientEmail || !privateKey || !sender) {
      throw new Error('Gmail service account configuration is incomplete. Visit Settings → Email.');
    }
    const accessToken = await getServiceAccountAccessToken(clientEmail, privateKey, sender);
    const signature = `gmail-sa:${sender}:${accessToken.slice(-10)}`;
    const hit = cache.get(kind);
    if (hit && hit.signature === signature) return hit;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { type: 'OAuth2', user: sender, accessToken }
    } as any);
    const built = { kind, transporter, from: s.EMAIL_FROM || sender, signature };
    cache.set(kind, built);
    return built;
  }

  // SMTP path. Settings DB takes precedence, env is fallback for backwards
  // compat with deployments that haven't migrated the values yet.
  const host = s.SMTP_HOST || process.env.SMTP_HOST || '';
  const port = Number(s.SMTP_PORT || process.env.SMTP_PORT || 587);
  const secureSetting = (s.SMTP_SECURE || '').toLowerCase();
  const secure = secureSetting ? secureSetting === 'true' : port === 465;
  const user = s.SMTP_USER || process.env.SMTP_USER || '';
  const pass = s.SMTP_PASSWORD || process.env.SMTP_PASSWORD || '';
  const signature = `smtp:${host}:${port}:${user}:${pass.slice(-6)}`;
  const hit = cache.get(kind);
  if (hit && hit.signature === signature) return hit;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined
  });
  const from =
    s.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.FROM_EMAIL ||
    'Tertiary Exams <noreply@example.com>';
  const built = { kind, transporter, from, signature };
  cache.set(kind, built);
  return built;
}

function primaryTransportKind(s: AllSettings): TransportKind {
  const t = (s.EMAIL_TRANSPORT || 'SMTP').toUpperCase();
  if (t === 'GMAIL_OAUTH') return 'GMAIL_OAUTH';
  if (t === 'GMAIL_SERVICE_ACCOUNT') return 'GMAIL_SERVICE_ACCOUNT';
  return 'SMTP';
}

/**
 * Ordered list of transports to try: the configured primary first, then —
 * unless EMAIL_FALLBACK_ENABLED is explicitly "false" — every other
 * transport that is fully configured, so a Gmail token revocation or an
 * SMTP password rotation degrades to the next working channel instead of
 * dropping OTP/purchase emails on the floor.
 */
function transportOrder(s: AllSettings): TransportKind[] {
  const primary = primaryTransportKind(s);
  if ((s.EMAIL_FALLBACK_ENABLED || 'true').toLowerCase() === 'false') return [primary];
  const rest: TransportKind[] = (['GMAIL_SERVICE_ACCOUNT', 'GMAIL_OAUTH', 'SMTP'] as TransportKind[]).filter(
    (k) => k !== primary && isTransportConfigured(k, s)
  );
  return [primary, ...rest];
}

type SendOutcome = {
  info: Awaited<ReturnType<Transporter['sendMail']>>;
  transport: TransportKind;
  fallbackNote?: string;
};

/** Try each transport in order; resolve on the first success. */
async function sendWithFallback(message: {
  to: string;
  cc?: string | string[];
  subject: string;
  html: string;
  attachments?: any[];
}): Promise<SendOutcome> {
  const s = await getAllSettings();
  const order = transportOrder(s);
  const failures: string[] = [];
  for (const kind of order) {
    try {
      const t = await buildTransport(kind, s);
      const info = await t.transporter.sendMail({ from: t.from, ...message });
      return {
        info,
        transport: kind,
        fallbackNote: failures.length ? `fell back from: ${failures.join('; ')}` : undefined
      };
    } catch (err: any) {
      failures.push(`${kind}: ${String(err?.message ?? err)}`);
    }
  }
  throw new Error(failures.join(' | '));
}

export async function sendMail(
  to: string,
  subject: string,
  html: string,
  attachments?: any[],
  cc?: string | string[],
  meta?: { template?: string; vars?: Record<string, unknown> }
) {
  try {
    const { info, transport, fallbackNote } = await sendWithFallback({ to, cc, subject, html, attachments });
    await logEmail({
      to,
      cc,
      subject,
      transport,
      status: 'SENT',
      providerId: info.messageId,
      error: fallbackNote,
      meta
    });
    return info;
  } catch (err: any) {
    const s = await getAllSettings().catch(() => null);
    const transport = s ? primaryTransportKind(s) : 'SMTP';
    await logEmail({ to, cc, subject, transport, status: 'FAILED', error: String(err?.message ?? err), meta });
    throw err;
  }
}

async function logEmail(input: {
  to: string;
  cc?: string | string[];
  subject: string;
  transport: string;
  status: 'SENT' | 'FAILED';
  providerId?: string;
  error?: string;
  meta?: { template?: string; vars?: Record<string, unknown> };
}) {
  try {
    const user = await db.user.findUnique({ where: { email: input.to.toLowerCase() }, select: { id: true } }).catch(() => null);
    // Truncate the vars payload to keep individual rows tame.
    let payloadVars: any = input.meta?.vars ?? null;
    if (payloadVars) {
      try {
        const json = JSON.stringify(payloadVars);
        if (json.length > 8000) payloadVars = { _truncated: true, preview: json.slice(0, 800) };
      } catch {
        payloadVars = null;
      }
    }
    await db.emailLog.create({
      data: {
        to: input.to,
        cc: Array.isArray(input.cc) ? input.cc.join(',') : (input.cc || null),
        subject: input.subject,
        template: input.meta?.template ?? null,
        transport: input.transport,
        status: input.status,
        providerId: input.providerId ?? null,
        error: input.error ?? null,
        userId: user?.id ?? null,
        payloadVars: payloadVars ?? undefined
      }
    });
  } catch {
    // Logging failure must never break mail sends.
  }
}

export async function sendOTPEmail(
  to: string,
  code: string,
  purpose: 'LOGIN' | 'REGISTER' | 'RESET' | 'TEASER_GATE'
) {
  const { sendTemplated } = await import('./email/templates');
  const key = ({
    LOGIN: 'OTP_LOGIN',
    REGISTER: 'OTP_REGISTER',
    RESET: 'OTP_RESET',
    TEASER_GATE: 'OTP_TEASER_GATE'
  } as const)[purpose];
  return sendTemplated(key, to, { code, expiresInMinutes: 10, purpose });
}

export async function sendPurchaseEmail(
  to: string,
  productName: string,
  tierLabel: string,
  voucherCode?: string,
  voucherPdf?: Buffer,
  voucherPending?: boolean,
  extras?: {
    order?: { id: string; amount: number; currency: string };
    user?: { name?: string | null; email: string };
    paymentMethod?: string;
  },
  invoice?: { invoicePdf: Buffer; invoiceNumber: string }
) {
  const { sendTemplated } = await import('./email/templates');
  const attachments: any[] = [];
  if (voucherPdf && voucherCode) {
    attachments.push({ filename: `voucher-${voucherCode}.pdf`, content: voucherPdf, contentType: 'application/pdf' });
  }
  if (invoice?.invoicePdf) {
    attachments.push({ filename: `invoice-${invoice.invoiceNumber}.pdf`, content: invoice.invoicePdf, contentType: 'application/pdf' });
  }
  return sendTemplated(
    'ORDER_CONFIRMATION',
    to,
    {
      productName,
      tierLabel,
      voucherCode,
      voucherPending: !!voucherPending,
      paymentMethod: extras?.paymentMethod ?? 'PayPal',
      order: extras?.order ?? { id: '', amount: 0, currency: 'USD' },
      user: extras?.user ?? { name: '', email: to },
      invoiceNumber: invoice?.invoiceNumber ?? null
    },
    attachments.length ? attachments : undefined
  );
}

export async function sendVoucherDeliveredEmail(
  to: string,
  examName: string,
  voucherCode: string,
  voucherPdf?: Buffer,
  expiresAt?: Date | null
) {
  const { sendTemplated } = await import('./email/templates');
  const attachments = voucherPdf
    ? [{ filename: `voucher-${voucherCode}.pdf`, content: voucherPdf, contentType: 'application/pdf' }]
    : undefined;
  return sendTemplated(
    'VOUCHER_DELIVERY',
    to,
    { examName, voucherCode, expiresAt: expiresAt ?? null, user: { email: to } },
    attachments
  );
}

const TRANSPORT_LABELS: Record<TransportKind, string> = {
  GMAIL_OAUTH: 'Gmail OAuth',
  GMAIL_SERVICE_ACCOUNT: 'Gmail Service Account',
  SMTP: 'SMTP'
};

/** Used by the admin "Send test email" button. */
export async function sendTestEmail(to: string): Promise<{ ok: boolean; messageId?: string; transport: string; error?: string }> {
  try {
    const { info, transport, fallbackNote } = await sendWithFallback({
      to,
      subject: 'Tertiary Exams — test email',
      html: `<p>This is a test email sent from the admin Settings page.</p><p>If you can read this, the transport is configured correctly.</p>`
    });
    const label = fallbackNote ? `${TRANSPORT_LABELS[transport]} — ${fallbackNote}` : TRANSPORT_LABELS[transport];
    return { ok: true, messageId: info.messageId, transport: label };
  } catch (err: any) {
    return { ok: false, transport: 'unknown', error: String(err?.message || err) };
  }
}
