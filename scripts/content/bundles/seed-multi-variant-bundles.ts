/**
 * One-shot: consolidate every multi-variant cert into a single bundle.
 *
 *   npx tsx scripts/content/bundles/seed-multi-variant-bundles.ts
 *
 * For each entry in CONFIGS:
 *   1. Set `published: false` on all matching variant exam slugs (hide
 *      from the public catalog).
 *   2. Upsert the Bundle row (title, description, prices).
 *   3. Rewrite BundleItems: one PRACTICE item per variant + one VOUCHER
 *      item attached to the first variant (the voucher is for the real
 *      vendor exam; the specific shell it points at doesn't matter).
 *
 * Idempotent — safe to re-run.
 *
 * Pricing strategy (cents):
 *   Foundational  → practice $49–79, voucher $99–129
 *   Associate     → practice $39–79, voucher $149–199
 *   Professional  → practice $49–99, voucher $199–299
 *   Expert        → practice $59–99, voucher $199–299
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

type BundleConfig = {
  slug: string;
  title: string;
  description: string;
  practicePrefix: string; // slug prefix to match variants by `${prefix}-p\d+`
  variantCount: number;
  price: number;          // cents
  priceVoucher: number;   // cents
};

const CONFIGS: BundleConfig[] = [
  // ───── AWS ─────
  {
    slug: 'aws-clf-c02', title: 'AWS Certified Cloud Practitioner',
    description: 'All 6 AWS Certified Cloud Practitioner (CLF-C02) practice exams in one bundle — covering cloud concepts, security & compliance, AWS technology & services, and billing/pricing/support.',
    practicePrefix: 'aws-clf-c02', variantCount: 6,
    price: 2000, priceVoucher: 10000
  },
  {
    slug: 'aws-saa-c03', title: 'AWS Certified Solutions Architect — Associate',
    description: 'All 6 AWS Certified Solutions Architect Associate (SAA-C03) practice exams in one bundle — covering design of secure, resilient, high-performing, and cost-optimized architectures on AWS.',
    practicePrefix: 'aws-saa-c03', variantCount: 6,
    price: 2000, priceVoucher: 15000
  },
  {
    slug: 'aws-dva-c02', title: 'AWS Certified Developer — Associate',
    description: 'All 6 AWS Certified Developer Associate (DVA-C02) practice exams in one bundle — covering development with AWS services, security, deployment, and troubleshooting.',
    practicePrefix: 'aws-dva-c02', variantCount: 6,
    price: 2000, priceVoucher: 15000
  },
  {
    slug: 'aws-dop-c02', title: 'AWS Certified DevOps Engineer — Professional',
    description: 'All 8 AWS Certified DevOps Engineer Professional (DOP-C02) practice exams in one bundle — covering SDLC automation, configuration management, monitoring, incident & event response, security & compliance, and HA/business continuity.',
    practicePrefix: 'aws-dop-c02', variantCount: 8,
    price: 2000, priceVoucher: 30000
  },
  {
    slug: 'aws-aif-c01', title: 'AWS Certified AI Practitioner',
    description: 'All 7 AWS Certified AI Practitioner (AIF-C01) practice exams in one bundle — covering fundamentals of AI/ML, generative AI on AWS, applications of foundation models, and responsible AI.',
    practicePrefix: 'aws-aif-c01', variantCount: 7,
    price: 2000, priceVoucher: 10000
  },
  {
    slug: 'aws-dea-c01', title: 'AWS Certified Data Engineer — Associate',
    description: 'All 4 AWS Certified Data Engineer Associate (DEA-C01) practice exams in one bundle — covering data ingestion, data store management, data operations and support, and data security & governance.',
    practicePrefix: 'aws-dea-c01', variantCount: 4,
    price: 2000, priceVoucher: 15000
  },

  // ───── Microsoft ─────
  {
    slug: 'microsoft-dp-900', title: 'Microsoft Azure Data Fundamentals (DP-900)',
    description: 'All 4 DP-900 practice exams in one bundle — covering core data concepts, relational and non-relational data, and data analytics on Azure.',
    practicePrefix: 'microsoft-dp-900', variantCount: 4,
    price: 2000, priceVoucher: 9900
  },
  {
    slug: 'microsoft-az-104', title: 'Microsoft Azure Administrator (AZ-104)',
    description: 'All 3 AZ-104 practice exams in one bundle — covering identities & governance, storage, compute, virtual networking, and monitoring & maintenance on Azure.',
    practicePrefix: 'microsoft-az-104', variantCount: 3,
    price: 2000, priceVoucher: 16500
  },
  {
    slug: 'microsoft-ai-102', title: 'Microsoft Azure AI Engineer Associate (AI-102)',
    description: 'All 4 AI-102 practice exams in one bundle — covering plan & manage Azure AI solutions, implement decision & language solutions, generative AI solutions, and computer vision.',
    practicePrefix: 'microsoft-ai-102', variantCount: 4,
    price: 2000, priceVoucher: 16500
  },
  {
    slug: 'microsoft-dp-100', title: 'Microsoft Azure Data Scientist Associate (DP-100)',
    description: 'All 2 DP-100 practice exams in one bundle — covering ML solution design, data exploration & model training, deployment preparation, and model retraining on Azure ML.',
    practicePrefix: 'microsoft-dp-100', variantCount: 2,
    price: 2000, priceVoucher: 16500
  },
  {
    slug: 'microsoft-dp-300', title: 'Microsoft Azure Database Administrator (DP-300)',
    description: 'All 4 DP-300 practice exams in one bundle — covering planning & implementing data platform resources, implementing secure environments, monitoring & optimization, automation, and HA/DR for Azure SQL.',
    practicePrefix: 'microsoft-dp-300', variantCount: 4,
    price: 2000, priceVoucher: 16500
  },
  {
    slug: 'microsoft-md-102', title: 'Microsoft Endpoint Administrator (MD-102)',
    description: 'All 4 MD-102 practice exams in one bundle — covering deploy Windows clients, manage identity & compliance, manage, protect, and monitor devices.',
    practicePrefix: 'microsoft-md-102', variantCount: 4,
    price: 2000, priceVoucher: 16500
  },
  {
    slug: 'microsoft-ms-102', title: 'Microsoft 365 Administrator Expert (MS-102)',
    description: 'All 4 MS-102 practice exams in one bundle — covering deploy & manage a Microsoft 365 tenant, implement & manage Microsoft Entra identity & access, manage security & threats with Defender XDR, and Microsoft Purview compliance.',
    practicePrefix: 'microsoft-ms-102', variantCount: 4,
    price: 2000, priceVoucher: 16500
  },
  {
    slug: 'microsoft-pl-300', title: 'Microsoft Power BI Data Analyst (PL-300)',
    description: 'All 5 PL-300 practice exams in one bundle — covering data preparation, data modeling, data visualization, and data analysis deployment & maintenance in Power BI.',
    practicePrefix: 'microsoft-pl-300', variantCount: 5,
    price: 2000, priceVoucher: 16500
  },

  // ───── Cisco ─────
  {
    slug: 'cisco-ccna', title: 'Cisco Certified Network Associate (CCNA)',
    description: 'All 6 CCNA (200-301) practice exams in one bundle — covering networking fundamentals, IP services, security fundamentals, automation & programmability, and network access.',
    practicePrefix: 'cisco-ccna', variantCount: 6,
    price: 2000, priceVoucher: 30000
  },
  {
    slug: 'cisco-ccnp-encor', title: 'Cisco CCNP Enterprise Core (ENCOR 350-401)',
    description: 'All 2 CCNP Enterprise Core (ENCOR 350-401) practice exams in one bundle — covering architecture, virtualization, infrastructure, network assurance, security, and automation.',
    practicePrefix: 'cisco-ccnp-encor', variantCount: 2,
    price: 2000, priceVoucher: 40000
  },

  // ───── CompTIA ─────
  {
    slug: 'comptia-server-plus', title: 'CompTIA Server+',
    description: 'All 4 CompTIA Server+ (SK0-005) practice exams in one bundle — covering server hardware install/management, server administration, security & disaster recovery, and troubleshooting.',
    practicePrefix: 'comptia-server-plus', variantCount: 4,
    price: 2000, priceVoucher: 36900
  },
  {
    slug: 'comptia-linux-plus', title: 'CompTIA Linux+',
    description: 'All 6 CompTIA Linux+ (XK0-005) practice exams in one bundle — covering system management, security, scripting/containers/automation, and troubleshooting.',
    practicePrefix: 'comptia-linux-plus', variantCount: 6,
    price: 2000, priceVoucher: 36900
  },
  {
    slug: 'comptia-data-plus', title: 'CompTIA Data+',
    description: 'All 6 CompTIA Data+ (DA0-001) practice exams in one bundle — covering data concepts, mining, analysis, visualization, and governance/quality/controls.',
    practicePrefix: 'comptia-data-plus', variantCount: 6,
    price: 2000, priceVoucher: 23900
  },

  // ───── Google ─────
  {
    slug: 'google-ace', title: 'Google Associate Cloud Engineer',
    description: 'All 2 Associate Cloud Engineer practice exams in one bundle — covering setting up a cloud environment, planning and configuring solutions, deploying and implementing, and ensuring successful operation on Google Cloud.',
    practicePrefix: 'google-ace', variantCount: 2,
    price: 2000, priceVoucher: 12500
  },

  // ───── GitHub ─────
  {
    slug: 'github-foundations', title: 'GitHub Foundations',
    description: 'All 4 GitHub Foundations practice exams in one bundle — covering GitHub features, repository management, collaboration, GitHub workflows, and GitHub administration.',
    practicePrefix: 'github-foundations', variantCount: 4,
    price: 2000, priceVoucher: 9900
  },

  // ───── ISC2 ─────
  {
    slug: 'isc2-cissp', title: 'ISC2 CISSP',
    description: 'All 6 CISSP practice exams in one bundle — covering security & risk management, asset security, security architecture & engineering, communication & network security, identity & access management, security assessment & testing, security operations, and software development security.',
    practicePrefix: 'isc2-cissp', variantCount: 6,
    price: 2000, priceVoucher: 74900
  },

  // ───── PMI ─────
  {
    slug: 'pmi-pmp', title: 'PMI PMP',
    description: 'All 6 PMP practice exams in one bundle — covering people, process, and business environment domains of the PMP examination content outline.',
    practicePrefix: 'pmi-pmp', variantCount: 6,
    price: 2000, priceVoucher: 55500
  }
];

function variantSlugs(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}-p${i + 1}`);
}

async function processBundle(cfg: BundleConfig) {
  // Discover what variants actually exist (some families have non-contiguous
  // numbering — only act on the ones present in the DB).
  const candidates = await db.exam.findMany({
    where: { slug: { startsWith: `${cfg.practicePrefix}-p` } },
    select: { id: true, slug: true }
  });
  const matching = candidates.filter(e => /-p\d+$/.test(e.slug));
  if (matching.length === 0) {
    console.log(`  ⚠ skip ${cfg.slug}: no variants found in DB`);
    return;
  }
  matching.sort((a, b) => {
    const an = Number(a.slug.match(/-p(\d+)$/)![1]);
    const bn = Number(b.slug.match(/-p(\d+)$/)![1]);
    return an - bn;
  });
  const examMap = Object.fromEntries(matching.map(e => [e.slug, e.id]));
  const orderedSlugs = matching.map(e => e.slug);

  // 1. Hide the variants from the public catalog.
  await db.exam.updateMany({
    where: { slug: { in: orderedSlugs } },
    data: { published: false }
  });

  // 2. Upsert the bundle.
  const bundle = await db.bundle.upsert({
    where: { slug: cfg.slug },
    update: {
      title: cfg.title,
      description: cfg.description,
      price: cfg.price,
      priceVoucher: cfg.priceVoucher,
      published: true
    },
    create: {
      slug: cfg.slug,
      title: cfg.title,
      description: cfg.description,
      price: cfg.price,
      priceVoucher: cfg.priceVoucher,
      published: true
    }
  });

  // 3. Rewrite items.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  let position = 1;
  for (const slug of orderedSlugs) {
    await db.bundleItem.create({
      data: { bundleId: bundle.id, examId: examMap[slug], tier: 'PRACTICE', position: position++ }
    });
  }
  // Voucher attached to the first variant — the voucher is for the real
  // vendor exam, not any specific practice variant.
  await db.bundleItem.create({
    data: { bundleId: bundle.id, examId: examMap[orderedSlugs[0]], tier: 'VOUCHER', position: position++ }
  });

  console.log(`  ✓ ${cfg.slug.padEnd(32)} | ${matching.length} variants hidden | Practice $${cfg.price / 100} | Voucher $${cfg.priceVoucher / 100}`);
}

async function main() {
  console.log(`Processing ${CONFIGS.length} multi-variant cert bundles...\n`);
  for (const cfg of CONFIGS) {
    await processBundle(cfg);
  }
  console.log('\n✓ All bundles processed.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
