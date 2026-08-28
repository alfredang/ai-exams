import { db } from './db';

export type PageDefault = {
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  showInFooter: boolean;
  footerGroup: 'legal' | 'company' | null;
  position: number;
};

const PARA = (s: string) => `<p style="margin:0 0 12px;line-height:1.7">${s}</p>`;
const HEADING = (s: string) => `<h2 style="margin:24px 0 8px;font-size:1.25rem;font-weight:600">${s}</h2>`;

export const DEFAULT_PAGES: PageDefault[] = [
  {
    slug: 'about-us',
    title: 'About Tertiary Exams',
    excerpt: 'Practice smarter for your next certification — our mission, how we work, and who is behind Tertiary Exams.',
    showInFooter: true,
    footerGroup: 'legal',
    position: 5,
    bodyHtml: [
      PARA('<strong>Practice smarter for your next certification.</strong>'),
      PARA('Tertiary Exams exists to help working professionals pass their next IT certification with confidence — without resorting to brain dumps, leaked questions, or shortcuts that fall apart on test day. We believe the right way to prepare is to practice on questions that <em>look like</em> the real exam in shape, difficulty, and topic mix, while teaching you something every time you click an answer.'),
      HEADING('Our mission'),
      PARA('Make high-quality certification practice accessible, affordable, and honest. Every question on Tertiary Exams is an original, blueprint-aligned practice item written by domain experts and paired with a clear explanation and a citation so you learn the <em>why</em>, not just the answer.'),
      PARA('We will never publish dumps of real exam questions. Instead, we publish the next best thing: original questions that mirror the official blueprint, weighted by domain, so a high score on Tertiary Exams is a meaningful signal that you are ready.'),
      HEADING('What we do'),
      PARA('We build full-length practice exams for the certifications our learners care about most — AWS, Microsoft Azure, Google Cloud, CompTIA, Cisco, PMI, ISC2, GitHub, Anthropic, IASSC, AXELOS, Oracle, Tableau, and more. Each certification ships as a <strong>bundle</strong>: multiple full-length practice exams grouped together so you get genuine retest variety, not the same 60 questions in a different order.'),
      PARA('Bundles can be purchased on their own, or with an optional discounted real-exam voucher — so one purchase covers your full prep journey from first attempt to test day.'),
      HEADING('How we are different'),
      PARA('<strong>Original content, not dumps.</strong> Every question is written by a subject-matter expert, reviewed before release, and mapped to a specific domain in the published vendor blueprint.'),
      PARA('<strong>Explanations and citations.</strong> Every answer has a written explanation and a reference link to authoritative documentation, so a wrong answer becomes a learning moment instead of a guess.'),
      PARA('<strong>Practice mode and Exam mode.</strong> Practice mode reveals correctness immediately so you build intuition. Exam mode is a timed simulation that matches real-test duration and gives you a per-domain breakdown when you submit — so you know exactly where to focus next.'),
      PARA('<strong>Try before you buy.</strong> Every exam ships with a free teaser. No credit card required.'),
      HEADING('Who we are'),
      PARA('Tertiary Exams is the certification-practice arm of <strong>Tertiary Infotech Academy Pte Ltd</strong>, a Singapore-registered training provider (UEN 201200696W). Our parent company has trained thousands of working professionals across Southeast Asia in classroom and online courses on cloud, data, AI, cybersecurity, and project management. Tertiary Exams brings that same rigour to self-paced exam preparation.'),
      HEADING('Get in touch'),
      PARA('Email: <a href="mailto:sales@tertiarycourses.com.sg" style="color:#2563eb;text-decoration:underline">sales@tertiarycourses.com.sg</a><br>Tel: +65 6100 0613<br>Address: 12 Woodland Square #07-85/86/87 Woods Square Tower 1, Singapore 737715')
    ].join('')
  },
  {
    slug: 'how-it-works',
    title: 'How it works',
    excerpt: 'How to study with our practice exams.',
    showInFooter: true,
    footerGroup: 'company',
    position: 10,
    bodyHtml: [
      PARA('Our practice exams are designed to mirror the structure, difficulty, and topic weighting of the real certification.'),
      HEADING('1. Try {{TEASER_N}} questions free'),
      PARA('Every exam ships with a free teaser. No credit card required.'),
      HEADING('2. Practice mode'),
      PARA('See the correct answer and an explanation immediately after each question. Build your understanding.'),
      HEADING('3. Exam mode'),
      PARA('Timed simulation that matches the real test duration. Get a per-domain breakdown of your score.'),
      HEADING('4. Voucher option'),
      PARA('Some exams include a discounted real-exam voucher delivered within 3-5 business days. Use it at the certification vendor to book your test.')
    ].join('')
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    excerpt: 'Terms governing use of our service.',
    showInFooter: true,
    footerGroup: 'legal',
    position: 10,
    bodyHtml: [
      PARA('By accessing or using this platform you agree to these terms.'),
      HEADING('Accounts'),
      PARA('You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.'),
      HEADING('Content'),
      PARA('All practice questions, explanations, and supplementary materials are our original work, protected by copyright. You may use them for personal exam preparation only — redistribution or resale is prohibited.'),
      HEADING('Vouchers'),
      PARA('Exam vouchers are issued by third-party certification bodies. Voucher delivery times depend on inventory availability and typically take 3-5 business days.'),
      HEADING('Limitation of liability'),
      PARA('We provide practice materials on an "as is" basis. We do not guarantee a passing score on any real certification exam.'),
      PARA('<em>Last updated: this date should be edited via the admin Pages dashboard.</em>')
    ].join('')
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    excerpt: 'How we collect and handle your data.',
    showInFooter: true,
    footerGroup: 'legal',
    position: 20,
    bodyHtml: [
      PARA('We collect only the information needed to deliver our service: your email, name, billing address, and exam progress.'),
      HEADING('What we collect'),
      PARA('Account: email, name, optional password.<br>Purchases: billing address, order history, payment provider transaction id (we never store full card numbers).<br>Usage: which questions you answered and how you scored.'),
      HEADING('What we don\'t do'),
      PARA('We do not sell your data. We do not run third-party advertising trackers on your account pages.'),
      HEADING('Your rights'),
      PARA('You may request deletion of your account and associated data at any time by emailing <a href="mailto:sales@tertiarycourses.com.sg" style="color:#2563eb;text-decoration:underline">sales@tertiarycourses.com.sg</a>.')
    ].join('')
  },
  {
    slug: 'refund-policy',
    title: 'Refund Policy',
    excerpt: 'When and how refunds are issued.',
    showInFooter: true,
    footerGroup: 'legal',
    position: 30,
    bodyHtml: [
      PARA('We want you to be confident in your purchase.'),
      HEADING('Practice exams'),
      PARA('Full refund within 7 days of purchase if you have answered fewer than {{TEASER_N}} questions across all attempts. Email <a href="mailto:sales@tertiarycourses.com.sg" style="color:#2563eb;text-decoration:underline">sales@tertiarycourses.com.sg</a> with your order id.'),
      HEADING('Voucher bundles'),
      PARA('Once a voucher code has been issued and delivered to you, the voucher portion is non-refundable (we have already paid the certification vendor). The practice-exam portion remains refundable under the 7-day / {{TEASER_N}}-question rule.'),
      HEADING('How to request'),
      PARA('Reply to your order confirmation email or contact <a href="mailto:sales@tertiarycourses.com.sg" style="color:#2563eb;text-decoration:underline">sales@tertiarycourses.com.sg</a> directly. Approved refunds are returned to the original payment method within 5-10 business days.')
    ].join('')
  }
];

// Idempotently seeds the default pages. Creates a row only if the slug
// doesn't exist — never overwrites admin edits.
export async function seedDefaultPages(): Promise<{ created: string[]; skipped: string[] }> {
  const existing = await db.page.findMany({ select: { slug: true } });
  const have = new Set(existing.map((r) => r.slug));
  const created: string[] = [];
  const skipped: string[] = [];
  for (const p of DEFAULT_PAGES) {
    if (have.has(p.slug)) {
      skipped.push(p.slug);
      continue;
    }
    await db.page.create({
      data: {
        slug: p.slug,
        title: p.title,
        bodyHtml: p.bodyHtml,
        excerpt: p.excerpt,
        showInFooter: p.showInFooter,
        footerGroup: p.footerGroup,
        position: p.position,
        published: true
      }
    });
    created.push(p.slug);
  }
  return { created, skipped };
}

export async function getFooterPages() {
  return db.page.findMany({
    where: { published: true, showInFooter: true },
    select: { slug: true, title: true, footerGroup: true, position: true },
    orderBy: [{ footerGroup: 'asc' }, { position: 'asc' }, { title: 'asc' }]
  });
}
