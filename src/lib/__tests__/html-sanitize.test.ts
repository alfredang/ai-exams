import { describe, expect, it } from 'vitest';
import { sanitizePageHtml } from '../html-sanitize';

describe('sanitizePageHtml', () => {
  it('removes scripts and unsafe attributes from public CMS HTML', () => {
    const html = sanitizePageHtml(
      '<p onclick="alert(1)">Hello</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>'
    );

    expect(html).toContain('<p>Hello</p>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('javascript:');
  });

  it('keeps safe links used by policy pages', () => {
    const html = sanitizePageHtml('<a href="mailto:support@example.com">Email support</a>');

    expect(html).toBe('<a href="mailto:support@example.com">Email support</a>');
  });
});
