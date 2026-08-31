'use client';
import { useEffect, useRef, useState } from 'react';

// Row checkboxes are associated to the bulk form via the `form="<id>"`
// attribute, so they live OUTSIDE the <form> element (e.g. in the table).
// `form.querySelectorAll` only finds DOM descendants and would miss them —
// `form.elements` includes all form-associated controls regardless of
// position. Likewise their `change` events bubble through the table, not
// the form, so we listen at document level.
function getBoxes(form: HTMLFormElement, name: string): HTMLInputElement[] {
  return Array.from(form.elements).filter(
    (el): el is HTMLInputElement =>
      el instanceof HTMLInputElement && el.type === 'checkbox' && el.name === name
  );
}

function isMatchAll(form: HTMLFormElement): boolean {
  return !!form.querySelector('input[name="selectAllMatching"][value="1"]');
}

// Custom event so the "select all matching" banner can notify Counter and
// SelectAll header to recompute without us touching every checkbox.
const MATCHING_EVENT = 'bulk-select-matching-changed';

function useBulkSelectListener(handler: () => void, checkboxName: string) {
  useEffect(() => {
    const onChange = (ev: Event) => {
      const t = ev.target;
      if (
        t instanceof HTMLInputElement &&
        t.type === 'checkbox' &&
        t.name === checkboxName
      ) {
        handler();
      }
    };
    const onMatching = () => handler();
    document.addEventListener('change', onChange, true);
    document.addEventListener(MATCHING_EVENT, onMatching);
    handler();
    return () => {
      document.removeEventListener('change', onChange, true);
      document.removeEventListener(MATCHING_EVENT, onMatching);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkboxName]);
}

export function SelectAllCheckbox({
  formId,
  checkboxName = 'ids',
  className
}: {
  formId: string;
  checkboxName?: string;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useBulkSelectListener(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form || !ref.current) return;
    if (isMatchAll(form)) {
      ref.current.checked = true;
      ref.current.indeterminate = false;
      return;
    }
    const boxes = getBoxes(form, checkboxName);
    const checked = boxes.filter((b) => b.checked).length;
    ref.current.checked = boxes.length > 0 && checked === boxes.length;
    ref.current.indeterminate = checked > 0 && checked < boxes.length;
  }, checkboxName);

  const onToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    // If we were in match-all mode and the user unticks, exit match-all.
    if (isMatchAll(form) && !e.target.checked) {
      form.querySelector('input[name="selectAllMatching"]')?.remove();
      document.dispatchEvent(new Event(MATCHING_EVENT));
    }
    const next = e.target.checked;
    const boxes = getBoxes(form, checkboxName);
    boxes.forEach((b) => {
      b.checked = next;
    });
    if (boxes[0]) boxes[0].dispatchEvent(new Event('change', { bubbles: true }));
  };

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label="Select all on this page"
      onChange={onToggle}
      className={className ?? 'h-3.5 w-3.5'}
    />
  );
}

export function SelectedCounter({
  formId,
  checkboxName = 'ids'
}: {
  formId: string;
  checkboxName?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useBulkSelectListener(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form || !ref.current) return;
    if (isMatchAll(form)) {
      // Read total from the form's data attribute set by the page.
      const total = form.dataset.totalMatching ?? '?';
      ref.current.textContent = total;
      return;
    }
    const n = getBoxes(form, checkboxName).filter((b) => b.checked).length;
    ref.current.textContent = String(n);
  }, checkboxName);

  return <span ref={ref}>0</span>;
}

/** Banner that appears when every checkbox on the current page is ticked
 *  AND there are more matching rows across other pages. Lets the user
 *  promote per-page selection into "select all N matching the filter"
 *  (Gmail-style). When active, the server action resolves IDs from the
 *  filter on the server — no need to materialise every row's checkbox. */
export function SelectAllMatchingBanner({
  formId,
  pageCount,
  totalCount,
  checkboxName = 'ids'
}: {
  formId: string;
  pageCount: number;
  totalCount: number;
  checkboxName?: string;
}) {
  const [selectionState, setSelectionState] = useState<{ allOnPage: boolean; matchAll: boolean }>({
    allOnPage: false,
    matchAll: false
  });

  useBulkSelectListener(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    const matchAll = isMatchAll(form);
    const boxes = getBoxes(form, checkboxName);
    const checked = boxes.filter((b) => b.checked).length;
    const allOnPage = boxes.length > 0 && checked === boxes.length;
    setSelectionState((current) =>
      current.allOnPage === allOnPage && current.matchAll === matchAll
        ? current
        : { allOnPage, matchAll }
    );
  }, checkboxName);

  // Nothing to do if there's only one page worth.
  if (totalCount <= pageCount) return null;

  const onPromote = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    if (form.querySelector('input[name="selectAllMatching"]')) return;
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'selectAllMatching';
    hidden.value = '1';
    form.appendChild(hidden);
    setSelectionState((current) => ({ ...current, matchAll: true }));
    document.dispatchEvent(new Event(MATCHING_EVENT));
  };

  const onClear = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    form.querySelector('input[name="selectAllMatching"]')?.remove();
    const boxes = getBoxes(form, checkboxName);
    boxes.forEach((b) => {
      b.checked = false;
    });
    setSelectionState({ allOnPage: false, matchAll: false });
    if (boxes[0]) boxes[0].dispatchEvent(new Event('change', { bubbles: true }));
    document.dispatchEvent(new Event(MATCHING_EVENT));
  };

  const { allOnPage, matchAll } = selectionState;

  if (matchAll) {
    return (
      <span className="inline-flex items-center gap-2 rounded bg-amber-100 px-2 py-0.5 text-[12px] text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
        All <strong>{totalCount}</strong> matching exams selected.
        <button
          type="button"
          onClick={onClear}
          className="underline-offset-2 hover:underline"
        >
          Clear
        </button>
      </span>
    );
  }

  if (allOnPage) {
    return (
      <span className="inline-flex items-center gap-2 rounded bg-blue-100 px-2 py-0.5 text-[12px] text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
        All <strong>{pageCount}</strong> on this page selected.
        <button
          type="button"
          onClick={onPromote}
          className="font-medium underline-offset-2 hover:underline"
        >
          Select all {totalCount} matching the filter →
        </button>
      </span>
    );
  }

  return null;
}
