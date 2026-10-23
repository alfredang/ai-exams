import type { ReactNode } from 'react';

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'right' | 'center';
  // Secondary columns drop out below this breakpoint so row actions stay on
  // screen without sideways scrolling.
  hideBelow?: 'lg' | 'xl' | '2xl';
  // Pin the column (row actions) to the right edge while the table scrolls.
  sticky?: boolean;
};

const HIDE_BELOW = { lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell', '2xl': 'hidden 2xl:table-cell' } as const;
// Pinned from lg only — on phones the icons would cover the row's main column.
const STICKY = 'lg:sticky lg:right-0 lg:bg-white lg:shadow-[-6px_0_6px_-6px_rgb(0_0_0/0.12)] lg:dark:bg-slate-900';
const colClass = (c: { hideBelow?: keyof typeof HIDE_BELOW; sticky?: boolean }) =>
  `${c.hideBelow ? HIDE_BELOW[c.hideBelow] : ''} ${c.sticky ? STICKY : ''}`;

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty = 'No results.',
  dense = true
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  empty?: ReactNode;
  dense?: boolean;
}) {
  const rowPad = dense ? 'py-1.5' : 'py-2.5';
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-max min-w-full text-[13px]">
        <thead className="border-b border-slate-200 bg-slate-50/50 text-left text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/40">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-3 py-2 font-semibold ${alignClass(c.align)} ${colClass(c)} ${c.headerClassName ?? ''}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-xs text-slate-500"
              >
                {empty}
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr
              key={rowKey(r, i)}
              className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-3 ${rowPad} align-middle ${alignClass(c.align)} ${colClass(c)} ${c.className ?? ''}`}
                >
                  {c.cell(r, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function alignClass(a?: 'left' | 'right' | 'center'): string {
  if (a === 'right') return 'text-right';
  if (a === 'center') return 'text-center';
  return 'text-left';
}
