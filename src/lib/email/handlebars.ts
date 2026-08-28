import Handlebars from 'handlebars';

let registered = false;

function register() {
  if (registered) return;
  registered = true;

  Handlebars.registerHelper('money', (cents: unknown, currency: unknown) => {
    const n = typeof cents === 'number' ? cents : Number(cents);
    if (!isFinite(n)) return '';
    const cur = typeof currency === 'string' && currency ? currency : 'USD';
    if (cur.toUpperCase() === 'SGD') {
      const amount = new Intl.NumberFormat('en-SG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(n / 100);
      return `SGD $${amount}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(n / 100);
  });

  Handlebars.registerHelper('date', (value: unknown, fmt?: unknown) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(String(value));
    if (isNaN(d.getTime())) return '';
    if (fmt === 'long') {
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  });

  Handlebars.registerHelper('upper', (s: unknown) => String(s ?? '').toUpperCase());
  Handlebars.registerHelper('lower', (s: unknown) => String(s ?? '').toLowerCase());
  Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
}

// Compile is the hot path on every transactional email (purchase
// confirmations, voucher delivery, OTP, etc.). Handlebars.compile parses
// the template each call; cache by source string so repeated sends of
// the same template skip parsing entirely.
const compileCache = new Map<string, Handlebars.TemplateDelegate>();

export function compile(source: string): Handlebars.TemplateDelegate {
  register();
  const cached = compileCache.get(source);
  if (cached) return cached;
  const fn = Handlebars.compile(source, { noEscape: false });
  compileCache.set(source, fn);
  return fn;
}

export function render(source: string, vars: Record<string, unknown>): string {
  return compile(source)(vars);
}
