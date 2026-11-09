import { certNames, SEO_REGION } from './exam-seo';
import { VOUCHER_DELIVERY_TEXT } from './products';
import { formatPrice } from './utils';

// Certification-specific questions for the product pages. Each one answers a
// search people type ("How much is the AZ-900 exam voucher in Singapore?"), in
// words a visitor can read. Answers use the real figures from the database:
// promises here must stay true, and the plain strings stay in USD like the
// rest of our JSON-LD.

export type Faq = { q: string; a: string };
type Cert = { title: string; code: string; vendor: string };

export function practiceFaqs({ cert, poolSize, perAttempt, durationMinutes, passingScore, priceCents, voucherPriceCents }: {
  cert: Cert;
  poolSize: number;
  perAttempt: number;
  durationMinutes: number;
  passingScore: number;
  /** Null when the Practice Exam isn't on sale. */
  priceCents: number | null;
  /** Null when there is no Exam Voucher on sale. */
  voucherPriceCents: number | null;
}): Faq[] {
  const { key, base, aka } = certNames(cert);
  const faqs: Faq[] = [
    {
      q: `Is there a ${key} practice exam in ${SEO_REGION}?`,
      a: priceCents != null
        ? `Yes. Our ${key} practice exam runs online, so you can take it from anywhere in ${SEO_REGION}. It costs ${formatPrice(priceCents)} (GST inclusive) with a tax invoice, and you can try 10 questions free first.`
        : `Yes. Our ${key} practice exam runs online, so you can take it from anywhere in ${SEO_REGION}, and you can try 10 questions free.`
    },
    {
      q: `How many questions are in the ${key} mock exam?`,
      a: `Each attempt draws ${perAttempt} questions from a ${poolSize}-question pool, weighted by the official exam domains. The timed Exam mode runs for ${durationMinutes} minutes with a ${passingScore}% pass mark.`
    },
    {
      q: `Can I retake the ${key} practice test?`,
      a: 'Yes. Retakes are unlimited, every attempt is a fresh draw from the pool, and your score report shows which exam domains to study next.'
    },
    {
      q: `Are these the actual ${key} exam questions?`,
      a: `No. They are original questions written to the official exam blueprint, with explanations and reference links. We never sell exam dumps, and we are not affiliated with ${cert.vendor}.`
    }
  ];
  if (aka) {
    faqs.push({
      q: `Is ${aka} the same as ${key}?`,
      a: `Yes. The ${base} exam code is ${key}, and you may also see it written as ${aka}. This practice exam covers it.`
    });
  }
  if (voucherPriceCents != null) {
    faqs.push({
      q: `Where can I buy the ${key} exam voucher in ${SEO_REGION}?`,
      a: `Here. Our official ${key} exam voucher costs ${formatPrice(voucherPriceCents)} (GST inclusive), is emailed within ${VOUCHER_DELIVERY_TEXT}, and includes this practice exam free.`
    });
  }
  return faqs;
}

export function voucherFaqs({ cert, priceCents }: { cert: Cert; priceCents: number }): Faq[] {
  const { key, aka } = certNames(cert);
  const faqs: Faq[] = [
    {
      q: `How much is the ${key} exam voucher in ${SEO_REGION}?`,
      a: `${formatPrice(priceCents)}, GST inclusive, with a tax invoice for every order. The price includes our ${key} practice exam free.`
    },
    {
      q: `How do I book the ${key} exam in ${SEO_REGION}?`,
      a: `Redeem the emailed voucher code on the ${cert.vendor} exam registration site or with its testing partner, then pick a date. ${cert.vendor} sets which test centres and online options are available.`
    }
  ];
  if (aka) {
    faqs.push({
      q: `Is ${aka} the same as ${key}?`,
      a: `Yes. ${key} is the exam code, and you may also see it written as ${aka}. This voucher covers that exam.`
    });
  }
  return faqs;
}

export function faqJsonLd(items: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  };
}
