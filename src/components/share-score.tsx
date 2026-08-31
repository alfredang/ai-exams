'use client';
import { useSyncExternalStore } from 'react';
import { ShareButtons } from './share-buttons';
import { Share2 } from 'lucide-react';

export function ShareScore({
  attemptId,
  examTitle,
  score,
  passed
}: {
  attemptId: string;
  examTitle: string;
  score: number;
  passed: boolean;
}) {
  // Defer origin until after mount: window.location.origin is client-only, so
  // reading it during render makes the server ('') and client (real origin)
  // produce different hrefs -> hydration mismatch. Start empty (matches the
  // server) and fill in the live origin post-hydration.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ''
  );
  const url = `${origin}/results/${attemptId}/share`;
  const text = passed
    ? `I just scored ${score}% on ${examTitle} on Tertiary Exams!`
    : `I'm preparing for ${examTitle} on Tertiary Exams — scored ${score}% so far.`;

  return (
    <div className="mt-6 card p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Share2 className="h-4 w-4 text-blue-600" />
        Share your result
      </div>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-300">
        Brag a little — your followers might be studying for the same exam.
      </p>
      <ShareButtons url={url} text={text} />
    </div>
  );
}
