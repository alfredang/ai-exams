import type { EmailTemplateKey } from '@prisma/client';

export type TemplateDefinition = {
  subject: string;
  bodyHtml: string;
  description: string;
  /** Friendly human-readable label shown in the admin UI. */
  displayName: string;
  sampleVars: Record<string, unknown>;
};

const layoutOpen = `<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0f172a">
  {{#if brand.logoUrl}}<img src="{{brand.logoUrl}}" alt="{{brand.name}}" style="height:36px;margin-bottom:16px">{{/if}}`;
const layoutClose = `  <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0">
  <p style="color:#94a3b8;font-size:12px;margin:0">{{brand.name}} — questions? <a href="mailto:{{brand.supportEmail}}" style="color:#2563eb">{{brand.supportEmail}}</a></p>
</div>`;

const wrap = (inner: string) => `${layoutOpen}\n${inner}\n${layoutClose}`;

const sampleBrand = {
  name: 'Tertiary Exams',
  logoUrl: '',
  primaryColor: '#2563eb',
  supportEmail: 'support@example.com'
};

export const DEFAULT_TEMPLATES: Record<EmailTemplateKey, TemplateDefinition> = {
  ORDER_CONFIRMATION: {
    displayName: 'Order Confirmation',
    description: 'Sent immediately after a successful payment.',
    subject: 'Order confirmed — {{productName}}',
    bodyHtml: wrap(`  <h2 style="margin:0 0 12px">Purchase confirmed</h2>
  <p>Hi {{user.name}},</p>
  <p>Thanks for your purchase of <b>{{tierLabel}}</b> for <b>{{productName}}</b>.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:6px 0;color:#64748b">Order</td><td style="padding:6px 0;text-align:right"><code>{{order.id}}</code></td></tr>
    {{#if invoiceNumber}}<tr><td style="padding:6px 0;color:#64748b">Invoice</td><td style="padding:6px 0;text-align:right"><code>{{invoiceNumber}}</code></td></tr>{{/if}}
    <tr><td style="padding:6px 0;color:#64748b">Payment method</td><td style="padding:6px 0;text-align:right">{{paymentMethod}}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b">Amount</td><td style="padding:6px 0;text-align:right">{{money order.amount order.currency}}</td></tr>
  </table>
  {{#if invoiceNumber}}<p style="color:#64748b;font-size:13px">Your tax invoice is attached to this email and also available under <a href="{{appUrl}}/user-dashboard/invoices" style="color:{{brand.primaryColor}}">Invoices</a>.</p>{{/if}}
  {{#if voucherPending}}
  <p style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 14px;border-radius:6px;color:#78350f"><b>Your exam voucher is on the way.</b><br>We'll email it to you within <b>3–5 business days</b>. Your practice access is already active.</p>
  {{/if}}
  <p style="margin-top:24px"><a href="{{appUrl}}/user-dashboard" style="background:{{brand.primaryColor}};color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Go to My Content →</a></p>`),
    sampleVars: {
      brand: sampleBrand,
      appUrl: 'https://example.com',
      productName: 'AWS Solutions Architect Associate',
      tierLabel: 'Practice + Voucher Bundle',
      paymentMethod: 'PayPal',
      voucherPending: true,
      invoiceNumber: 'INV-2026-00042',
      user: { name: 'Alex', email: 'alex@example.com' },
      order: { id: 'ord_abc123', amount: 9900, currency: 'USD' }
    }
  },
  VOUCHER_DELIVERY: {
    displayName: 'Voucher Delivery',
    description: 'Sent when a voucher code is delivered (5 days after purchase).',
    subject: 'Your {{examName}} voucher is ready',
    bodyHtml: wrap(`  <h2 style="margin:0 0 12px">Your voucher is ready</h2>
  <p>Hi {{user.name}},</p>
  <p>Your <b>{{examName}}</b> exam voucher has been issued.</p>
  <p>Voucher code: <code style="background:#f1f5f9;padding:6px 10px;border-radius:6px;font-size:16px;letter-spacing:1px">{{voucherCode}}</code></p>
  <p style="color:#64748b;font-size:14px">Use this code on the certification vendor's exam-booking site (e.g. Pearson VUE / PSI) to schedule your exam.</p>
  {{#if expiresAt}}<p style="color:#64748b;font-size:14px">Expires: {{date expiresAt 'long'}}</p>{{/if}}
  <p style="margin-top:24px"><a href="{{appUrl}}/user-dashboard/vouchers" style="background:{{brand.primaryColor}};color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">View in My Content →</a></p>`),
    sampleVars: {
      brand: sampleBrand,
      appUrl: 'https://example.com',
      examName: 'AWS Solutions Architect Associate',
      voucherCode: 'AWS-SAA-XYZ123',
      expiresAt: new Date(Date.now() + 365 * 86400_000).toISOString(),
      user: { name: 'Alex', email: 'alex@example.com' }
    }
  },
  OTP_LOGIN: {
    displayName: 'Login OTP',
    description: 'One-time code for signing in.',
    subject: 'Your sign-in code — {{brand.name}}',
    bodyHtml: wrap(`  <h2 style="margin:0 0 12px">Your sign-in code</h2>
  <p style="color:#475569">Your one-time code:</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:{{brand.primaryColor}};margin:8px 0">{{code}}</p>
  <p style="color:#94a3b8;font-size:13px">Expires in {{expiresInMinutes}} minutes. If you didn't request this, ignore this email.</p>`),
    sampleVars: { brand: sampleBrand, code: '123456', expiresInMinutes: 10 }
  },
  OTP_REGISTER: {
    displayName: 'Registration OTP',
    description: 'One-time code for verifying email on registration.',
    subject: 'Verify your email — {{brand.name}}',
    bodyHtml: wrap(`  <h2 style="margin:0 0 12px">Verify your email</h2>
  <p style="color:#475569">Your verification code:</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:{{brand.primaryColor}};margin:8px 0">{{code}}</p>
  <p style="color:#94a3b8;font-size:13px">Expires in {{expiresInMinutes}} minutes.</p>`),
    sampleVars: { brand: sampleBrand, code: '123456', expiresInMinutes: 10 }
  },
  OTP_RESET: {
    displayName: 'Password Reset OTP',
    description: 'One-time code for resetting password.',
    subject: 'Reset your password — {{brand.name}}',
    bodyHtml: wrap(`  <h2 style="margin:0 0 12px">Reset your password</h2>
  <p style="color:#475569">Your password reset code:</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:{{brand.primaryColor}};margin:8px 0">{{code}}</p>
  <p style="color:#94a3b8;font-size:13px">Expires in {{expiresInMinutes}} minutes. If you didn't request this, ignore this email.</p>`),
    sampleVars: { brand: sampleBrand, code: '123456', expiresInMinutes: 10 }
  },
  OTP_TEASER_GATE: {
    displayName: 'Teaser Gate OTP',
    description: 'One-time code shown after answering teaser questions.',
    subject: 'Continue your practice exam — {{brand.name}}',
    bodyHtml: wrap(`  <h2 style="margin:0 0 12px">Continue your practice exam</h2>
  <p style="color:#475569">Enter this code to save your progress:</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:{{brand.primaryColor}};margin:8px 0">{{code}}</p>
  <p style="color:#94a3b8;font-size:13px">Expires in {{expiresInMinutes}} minutes.</p>`),
    sampleVars: { brand: sampleBrand, code: '123456', expiresInMinutes: 10 }
  },
  PASSWORD_RESET: {
    displayName: 'Password Reset Link',
    description: 'Password-reset link (if/when used instead of OTP).',
    subject: 'Reset your password — {{brand.name}}',
    bodyHtml: wrap(`  <h2 style="margin:0 0 12px">Reset your password</h2>
  <p>Click the button below to reset your password.</p>
  <p style="margin:18px 0"><a href="{{resetUrl}}" style="background:{{brand.primaryColor}};color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Reset password →</a></p>
  <p style="color:#94a3b8;font-size:13px">Link expires {{date expiresAt 'long'}}. If you didn't request this, ignore this email.</p>`),
    sampleVars: {
      brand: sampleBrand,
      resetUrl: 'https://example.com/reset?token=abc',
      expiresAt: new Date(Date.now() + 3600_000).toISOString()
    }
  }
};

export const TEMPLATE_KEYS: EmailTemplateKey[] = Object.keys(DEFAULT_TEMPLATES) as EmailTemplateKey[];
