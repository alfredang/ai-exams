'use client';
import { useSyncExternalStore } from 'react';
import { ShareButtons } from './share-buttons';
import { Share2 } from 'lucide-react';

export function ShareExam({
  vendorSlug,
  examSlug,
  title
}: {
  vendorSlug: string;
  examSlug: string;
  title: string;
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
  const url = `${origin}/practice-exams/${vendorSlug}/${examSlug}`;
  const text = `Practicing ${title} on Tertiary Exams — original questions, free teaser available.`;
  return (
    <div className="mt-6 card p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Share2 className="h-4 w-4 text-blue-600" />
        Share this exam
      </div>
      <ShareButtons url={url} text={text} />
    </div>
  );
}
