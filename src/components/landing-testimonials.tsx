import { db } from '@/lib/db';
import { Quote } from 'lucide-react';
import { RatingStars } from './rating-stars';

export async function LandingTestimonials() {
  const items = await db.testimonial.findMany({
    where: { published: true, deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: 9
  });
  if (items.length === 0) return null;

  return (
    <section id="testimonials" className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="container-app py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <Quote className="h-3.5 w-3.5" />
            Testimonials
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">What learners say</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Experiences shared by learners using Tertiary Exams.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Certification outcomes mentioned in reviews are self-reported.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <figure key={t.id} className="card flex h-full flex-col p-6">
              {t.rating != null && <RatingStars value={t.rating} className="mb-3" />}
              <blockquote className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                {t.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatarUrl} alt={t.authorName} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    {t.authorName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.authorName}</div>
                  {t.authorTitle && <div className="text-xs text-slate-500 dark:text-slate-400">{t.authorTitle}</div>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
