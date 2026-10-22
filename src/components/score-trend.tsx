// Score-over-time line for one certification: oldest attempt on the left,
// a dashed pass-mark reference line labelled in its own right gutter, and
// each point linking to that attempt's results (hover shows date + score).
// Pass linkPoints={false} when the chart already sits inside a link.
// Pure SVG, server-safe.
export function ScoreTrend({
  points,
  passMark,
  height = 120,
  linkPoints = true
}: {
  points: { id: string; score: number; date: Date }[];  // oldest first
  passMark: number;
  height?: number;
  linkPoints?: boolean;
}) {
  if (points.length === 0) return null;
  const W = 320, H = height, padX = 10, gutter = 52, padTop = 10, padBottom = 10;
  const plotW = W - gutter;
  const x = (i: number) => (points.length === 1 ? plotW / 2 : padX + (i * (plotW - padX * 2)) / (points.length - 1));
  const y = (s: number) => padTop + ((100 - s) / 100) * (H - padTop - padBottom);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');
  const fmt = (d: Date) => d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Score trend over ${points.length} attempts`}>
      <line x1={0} x2={plotW} y1={y(passMark)} y2={y(passMark)} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth={1} strokeDasharray="4 4" />
      <text x={W - 2} y={y(passMark) + 3} textAnchor="end" className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400">
        pass {passMark}%
      </text>
      {points.length > 1 && (
        <path d={line} fill="none" className="stroke-brand dark:stroke-brand-400" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      )}
      {points.map((p, i) => {
        const mark = (
          <>
            <title>{`${fmt(p.date)} · ${p.score}%${linkPoints ? ' — view results' : ''}`}</title>
            <circle cx={x(i)} cy={y(p.score)} r={12} fill="transparent" />
            <circle cx={x(i)} cy={y(p.score)} r={4.5} strokeWidth={2} className="fill-brand stroke-white dark:fill-brand-400 dark:stroke-slate-900" />
          </>
        );
        return linkPoints ? <a key={p.id} href={`/results/${p.id}`}>{mark}</a> : <g key={p.id}>{mark}</g>;
      })}
    </svg>
  );
}
