'use client';

import type { ReactNode } from 'react';
import type { EnquiryTopicId } from '@/lib/enquiry-topics';

export const TOPIC_EVENT = 'enquiry:topic';

/**
 * Same-page jump to the enquiry form with a topic preselected. A plain
 * ?topic= link would not reach the already-mounted form, so this fires an
 * event the form listens for.
 */
export function TopicLink({ topic, className, children }: { topic: EnquiryTopicId; className?: string; children: ReactNode }) {
  return (
    <a
      href={`?topic=${topic}#enquiry`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(TOPIC_EVENT, { detail: topic }));
        document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `?topic=${topic}#enquiry`);
      }}
    >
      {children}
    </a>
  );
}
