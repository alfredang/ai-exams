type Opt = { id: string; text: string };

type Parsed = {
  correctTitle?: string;
  correctBody?: string;
  intro?: string;
  source?: string;
  incorrectBullets: { title: string; body: string }[];
  trailing?: string;
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseExplanation(text: string, options: Opt[], correctIds: string[]): Parsed {
  let working = text.replace(/\s+/g, ' ').trim();

  let source: string | undefined;
  const viaMatch = working.match(/\bvia\s*-\s*(\S+)/i);
  if (viaMatch) {
    source = viaMatch[1].replace(/\s+/g, '');
    working = working.replace(viaMatch[0], '').replace(/\s{2,}/g, ' ').trim();
  }

  let intro = '';
  let afterCorrect = working;
  const correctIdx = working.search(/Correct option:?/i);
  if (correctIdx >= 0) {
    intro = working.slice(0, correctIdx).trim();
    afterCorrect = working.slice(correctIdx).replace(/^Correct option:?/i, '').trim();
  }

  let correctSection = afterCorrect;
  let incorrectSection = '';
  const incorrectIdx = afterCorrect.search(/Incorrect options:?/i);
  if (incorrectIdx >= 0) {
    correctSection = afterCorrect.slice(0, incorrectIdx).trim();
    incorrectSection = afterCorrect.slice(incorrectIdx).replace(/^Incorrect options:?/i, '').trim();
  }

  let correctTitle: string | undefined;
  let correctBody: string | undefined;
  if (correctSection) {
    const correctOpts = options.filter((o) => correctIds.includes(o.id));
    for (const o of correctOpts) {
      const rx = new RegExp('^' + escapeRegex(o.text) + '\\s*', 'i');
      if (rx.test(correctSection)) {
        correctTitle = o.text;
        correctBody = correctSection.replace(rx, '').trim();
        break;
      }
    }
    if (!correctTitle) correctBody = correctSection;
  }

  const distractors = options.filter((o) => !correctIds.includes(o.id)).map((o) => o.text);
  const bullets: { title: string; body: string }[] = [];
  let trailing: string | undefined;

  if (incorrectSection) {
    const hits: { start: number; end: number; title: string }[] = [];
    for (const d of distractors) {
      const idx = incorrectSection.indexOf(d);
      if (idx >= 0) hits.push({ start: idx, end: idx + d.length, title: d });
    }
    hits.sort((a, b) => a.start - b.start);
    if (hits.length) {
      if (hits[0].start > 0) {
        const lead = incorrectSection.slice(0, hits[0].start).trim();
        if (lead) bullets.push({ title: '', body: lead });
      }
      for (let i = 0; i < hits.length; i++) {
        const h = hits[i];
        const bodyStart = h.end;
        const bodyEnd = i + 1 < hits.length ? hits[i + 1].start : incorrectSection.length;
        let body = incorrectSection.slice(bodyStart, bodyEnd).trim();
        body = body.replace(/^[-–—:\s]+/, '').trim();
        bullets.push({ title: h.title, body });
      }
    } else {
      trailing = incorrectSection;
    }
  }

  const lastBullet = bullets[bullets.length - 1];
  if (lastBullet) {
    const m = lastBullet.body.match(/\b(References?|Refs?|Source|Sources)\b[:\s].*$/i);
    if (m) {
      lastBullet.body = lastBullet.body.slice(0, m.index).trim();
    }
  }

  return { correctTitle, correctBody, intro, source, incorrectBullets: bullets, trailing };
}

function isLikelyUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

// Question.references is nullable JSON. Manual authors can omit it, older
// imports use plain URLs, and batch authors also store per-option metadata.
function referenceLinks(value: unknown): { label: string; url: string }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    const url = typeof item === 'string'
      ? item.trim()
      : item && typeof item === 'object' && 'url' in item && typeof item.url === 'string'
        ? item.url.trim()
        : '';
    if (!isLikelyUrl(url)) return [];
    const label = item && typeof item === 'object' && 'label' in item && typeof item.label === 'string'
      ? item.label.trim()
      : '';
    return [{ label: label || url, url }];
  });
}

export function ExplanationView({
  text,
  options,
  correctIds,
  references = [],
  hideCorrectTitle = false
}: {
  text: string;
  options: Opt[];
  correctIds: string[];
  references?: unknown;
  // The results page already prints the correct answer above the
  // explanation, so it skips the repeated "Correct option" heading.
  hideCorrectTitle?: boolean;
}) {
  const p = parseExplanation(text, options, correctIds);
  const links = referenceLinks(references);
  const hasStructure =
    !!p.correctTitle || !!p.correctBody || p.incorrectBullets.length > 0;

  if (!hasStructure) {
    return (
      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
        <p className="whitespace-pre-line">{text}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
      {p.intro && <p>{p.intro}</p>}

      {hideCorrectTitle && p.correctBody && <p>{p.correctBody}</p>}

      {!hideCorrectTitle && (p.correctTitle || p.correctBody) && (
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Correct option
          </div>
          {p.correctTitle && (
            <div className="mb-1 font-medium text-slate-900 dark:text-slate-100">
              {p.correctTitle}
            </div>
          )}
          {p.correctBody && <p>{p.correctBody}</p>}
        </div>
      )}

      {p.source && isLikelyUrl(p.source) && (
        <p className="text-xs text-slate-500">
          Source:{' '}
          <a
            href={p.source}
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
          >
            {p.source}
          </a>
        </p>
      )}

      {p.incorrectBullets.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
            Incorrect options
          </div>
          <ul className="space-y-2 pl-4">
            {p.incorrectBullets.map((b, i) => (
              <li key={i} className="list-disc">
                {b.title && (
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {b.title}
                  </div>
                )}
                {b.body && <p>{b.body}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {p.trailing && <p>{p.trailing}</p>}

      {links.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            References
          </div>
          <ul className="space-y-0.5 pl-4 text-xs">
            {links.map((r, i) => (
              <li key={i} className="list-disc">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                >
                  {r.label || r.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
