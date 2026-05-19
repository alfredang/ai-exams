import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h2',
  'h3',
  'h4',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul'
];

export function sanitizePageHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: (_tagName, attribs) => {
        const next = { ...attribs };
        if (next.target === '_blank') next.rel = 'noopener noreferrer';
        return { tagName: 'a', attribs: next };
      }
    }
  });
}
