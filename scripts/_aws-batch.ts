/**
 * Internal batch driver: generates static seed scripts for every AWS practice
 * PDF in practice-exams-pdfs-20260508-142418/. Runs scripts/_pdf-to-seed.ts
 * once per PDF with the appropriate config (vendor, slug, code, exam title,
 * domains, level, duration, etc.).
 *
 *   npx tsx scripts/_aws-batch.ts
 *
 * Output: scripts/seed-aws-<cert>-p<n>.ts (one file per PDF). Skips dupes
 * (0091-93) and defers CSAA P1 (0236) for separate handling.
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const PDF_DIR = 'practice-exams-pdfs-20260508-142418';

type FamilyMeta = {
  certCode: string;       // e.g. CLF-C02
  certSlug: string;       // e.g. aws-clf-c02
  examTitleBase: string;  // e.g. AWS Certified Cloud Practitioner
  level: string;
  durationMinutes: number;
  passingScore: number;
  domains: { name: string; weight: number }[];
  defaultDomain: string;
  refLabel: string;
  refUrl: string;
  description: string;
};

const FAMILIES: Record<string, FamilyMeta> = {
  'clf-c02': {
    certCode: 'CLF-C02',
    certSlug: 'aws-clf-c02',
    examTitleBase: 'AWS Certified Cloud Practitioner',
    level: 'Foundational',
    durationMinutes: 90,
    passingScore: 70,
    domains: [
      { name: 'Cloud Concepts', weight: 24 },
      { name: 'Security and Compliance', weight: 30 },
      { name: 'Cloud Technology and Services', weight: 34 },
      { name: 'Billing, Pricing, and Support', weight: 12 }
    ],
    defaultDomain: 'Cloud Technology and Services',
    refLabel: 'AWS Certified Cloud Practitioner (CLF-C02) exam guide',
    refUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
    description: 'AWS Certified Cloud Practitioner (CLF-C02) practice set covering cloud concepts, security and compliance, AWS services and technology, and billing/pricing/support. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'saa-c03': {
    certCode: 'SAA-C03',
    certSlug: 'aws-saa-c03',
    examTitleBase: 'AWS Certified Solutions Architect Associate',
    level: 'Associate',
    durationMinutes: 130,
    passingScore: 72,
    domains: [
      { name: 'Design Secure Architectures', weight: 30 },
      { name: 'Design Resilient Architectures', weight: 26 },
      { name: 'Design High-Performing Architectures', weight: 24 },
      { name: 'Design Cost-Optimized Architectures', weight: 20 }
    ],
    defaultDomain: 'Design Resilient Architectures',
    refLabel: 'AWS Certified Solutions Architect - Associate (SAA-C03) exam guide',
    refUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    description: 'AWS Certified Solutions Architect - Associate (SAA-C03) practice set covering secure, resilient, high-performing, and cost-optimized architecture design on AWS. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'dva-c02': {
    certCode: 'DVA-C02',
    certSlug: 'aws-dva-c02',
    examTitleBase: 'AWS Certified Developer Associate',
    level: 'Associate',
    durationMinutes: 130,
    passingScore: 72,
    domains: [
      { name: 'Development with AWS Services', weight: 32 },
      { name: 'Security', weight: 26 },
      { name: 'Deployment', weight: 24 },
      { name: 'Troubleshooting and Optimization', weight: 18 }
    ],
    defaultDomain: 'Development with AWS Services',
    refLabel: 'AWS Certified Developer - Associate (DVA-C02) exam guide',
    refUrl: 'https://aws.amazon.com/certification/certified-developer-associate/',
    description: 'AWS Certified Developer - Associate (DVA-C02) practice set covering AWS service development, security, deployment, and troubleshooting. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'dop-c02': {
    certCode: 'DOP-C02',
    certSlug: 'aws-dop-c02',
    examTitleBase: 'AWS Certified DevOps Engineer Professional',
    level: 'Professional',
    durationMinutes: 180,
    passingScore: 75,
    domains: [
      { name: 'SDLC Automation', weight: 22 },
      { name: 'Configuration Management and IaC', weight: 17 },
      { name: 'Resilient Cloud Solutions', weight: 15 },
      { name: 'Monitoring and Logging', weight: 15 },
      { name: 'Incident and Event Response', weight: 14 },
      { name: 'Security and Compliance', weight: 17 }
    ],
    defaultDomain: 'SDLC Automation',
    refLabel: 'AWS Certified DevOps Engineer - Professional (DOP-C02) exam guide',
    refUrl: 'https://aws.amazon.com/certification/certified-devops-engineer-professional/',
    description: 'AWS Certified DevOps Engineer - Professional (DOP-C02) practice set covering SDLC automation, IaC, resilient cloud solutions, monitoring/logging, incident response, and security. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'aif-c01': {
    certCode: 'AIF-C01',
    certSlug: 'aws-aif-c01',
    examTitleBase: 'AWS Certified AI Practitioner',
    level: 'Foundational',
    durationMinutes: 90,
    passingScore: 70,
    domains: [
      { name: 'Fundamentals of AI and ML', weight: 20 },
      { name: 'Fundamentals of Generative AI', weight: 24 },
      { name: 'Applications of Foundation Models', weight: 28 },
      { name: 'Guidelines for Responsible AI', weight: 14 },
      { name: 'Security, Compliance, and Governance for AI', weight: 14 }
    ],
    defaultDomain: 'Applications of Foundation Models',
    refLabel: 'AWS Certified AI Practitioner (AIF-C01) exam guide',
    refUrl: 'https://aws.amazon.com/certification/certified-ai-practitioner/',
    description: 'AWS Certified AI Practitioner (AIF-C01) practice set covering AI/ML fundamentals, generative AI, foundation models, responsible AI, and AI security/governance. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'dea-c01': {
    certCode: 'DEA-C01',
    certSlug: 'aws-dea-c01',
    examTitleBase: 'AWS Certified Data Engineer Associate',
    level: 'Associate',
    durationMinutes: 130,
    passingScore: 72,
    domains: [
      { name: 'Data Ingestion and Transformation', weight: 34 },
      { name: 'Data Store Management', weight: 26 },
      { name: 'Data Operations and Support', weight: 22 },
      { name: 'Data Security and Governance', weight: 18 }
    ],
    defaultDomain: 'Data Ingestion and Transformation',
    refLabel: 'AWS Certified Data Engineer - Associate (DEA-C01) exam guide',
    refUrl: 'https://aws.amazon.com/certification/certified-data-engineer-associate/',
    description: 'AWS Certified Data Engineer - Associate (DEA-C01) practice set covering data ingestion/transformation, data store management, operations, and data security/governance. Sourced from a third-party practice exam PDF. Not real exam questions.'
  }
};


type Job = {
  pdfFile: string;
  family: keyof typeof FAMILIES;
  practiceNumber: number;
};

// All 38 unique AWS PDFs (excluding 0091/92/93 dupes; CSAA 0236 deferred)
const JOBS: Job[] = [
  // CLF-C02 (6)
  { pdfFile: '0216_AWS Cloud Practitioner Practice Exam 1.pdf', family: 'clf-c02', practiceNumber: 1 },
  { pdfFile: '0215_AWS Cloud Practitioner Practice Exam 2.pdf', family: 'clf-c02', practiceNumber: 2 },
  { pdfFile: '0214_AWS Cloud Practitioner Practice Exam 3.pdf', family: 'clf-c02', practiceNumber: 3 },
  { pdfFile: '0213_AWS Cloud Practitioner Practice Exam 4.pdf', family: 'clf-c02', practiceNumber: 4 },
  { pdfFile: '0212_AWS Cloud Practitioner Practice Exam 5.pdf', family: 'clf-c02', practiceNumber: 5 },
  { pdfFile: '0211_AWS Cloud Practitioner Practice Exam 6.pdf', family: 'clf-c02', practiceNumber: 6 },
  // SAA-C03 (6)
  { pdfFile: '0198_AWS Certified Solutions Architect Associate Training Practice Exam 1.pdf', family: 'saa-c03', practiceNumber: 1 },
  { pdfFile: '0199_AWS Certified Solutions Architect Associate Training Practice Exam 2.pdf', family: 'saa-c03', practiceNumber: 2 },
  { pdfFile: '0200_AWS Certified Solutions Architect Associate Training Practice Exam 3.pdf', family: 'saa-c03', practiceNumber: 3 },
  { pdfFile: '0203_AWS Certified Solutions Architect Associate Training Practice Exam 4.pdf', family: 'saa-c03', practiceNumber: 4 },
  { pdfFile: '0202_AWS Certified Solutions Architect Associate Training Practice Exam 5.pdf', family: 'saa-c03', practiceNumber: 5 },
  { pdfFile: '0201_AWS Certified Solutions Architect Associate Training Practice Exam 6.pdf', family: 'saa-c03', practiceNumber: 6 },
  // DVA-C02 (6)
  { pdfFile: '0141_AWS Certified Developer Associate Training Practice Exam 1.pdf', family: 'dva-c02', practiceNumber: 1 },
  { pdfFile: '0140_AWS Certified Developer Associate Training Practice Exam 2.pdf', family: 'dva-c02', practiceNumber: 2 },
  { pdfFile: '0137_AWS Certified Developer Associate Training Practice Exam 3.pdf', family: 'dva-c02', practiceNumber: 3 },
  { pdfFile: '0136_AWS Certified Developer Associate Training Practice Exam 4.pdf', family: 'dva-c02', practiceNumber: 4 },
  { pdfFile: '0135_AWS Certified Developer Associate Training Practice Exam 5.pdf', family: 'dva-c02', practiceNumber: 5 },
  { pdfFile: '0134_AWS Certified Developer Associate Training Practice Exam 6.pdf', family: 'dva-c02', practiceNumber: 6 },
  // DOP-C02 (8)
  { pdfFile: '0163_Certified DevOps Engineer Professional Practice Exam 1.pdf', family: 'dop-c02', practiceNumber: 1 },
  { pdfFile: '0162_Certified DevOps Engineer Professional Practice Exam 2.pdf', family: 'dop-c02', practiceNumber: 2 },
  { pdfFile: '0161_Certified DevOps Engineer Professional Practice Exam 3.pdf', family: 'dop-c02', practiceNumber: 3 },
  { pdfFile: '0160_Certified DevOps Engineer Professional Practice Exam 4.pdf', family: 'dop-c02', practiceNumber: 4 },
  { pdfFile: '0159_Certified DevOps Engineer Professional Practice Exam 5.pdf', family: 'dop-c02', practiceNumber: 5 },
  { pdfFile: '0158_Certified DevOps Engineer Professional Practice Exam 6.pdf', family: 'dop-c02', practiceNumber: 6 },
  { pdfFile: '0156_Certified DevOps Engineer Professional Practice Exam 7.pdf', family: 'dop-c02', practiceNumber: 7 },
  { pdfFile: '0157_Certified DevOps Engineer Professional Practice Exam 8.pdf', family: 'dop-c02', practiceNumber: 8 },
  // AIF-C01 (7) — note 0178 is "Practice Exam 1"
  { pdfFile: '0178_AWS Certified AI Practitioner Practice Exam 1.pdf', family: 'aif-c01', practiceNumber: 1 },
  { pdfFile: '0177_AIF-C01 Practice Exam 2.pdf', family: 'aif-c01', practiceNumber: 2 },
  { pdfFile: '0176_AIF-C01 Practice Exam 3.pdf', family: 'aif-c01', practiceNumber: 3 },
  { pdfFile: '0173_AIF-C01 Practice Exam 4.pdf', family: 'aif-c01', practiceNumber: 4 },
  { pdfFile: '0172_AIF-C01 Practice Exam 5.pdf', family: 'aif-c01', practiceNumber: 5 },
  { pdfFile: '0171_AIF-C01 Practice Exam 6.pdf', family: 'aif-c01', practiceNumber: 6 },
  { pdfFile: '0170_AIF-C01 Practice Exam 7.pdf', family: 'aif-c01', practiceNumber: 7 },
  // DEA-C01 (4) — skipping 0091/92/93 dupes
  { pdfFile: '0076_AWS Certified Data Engineer Associate Training Practice Exam 1.pdf', family: 'dea-c01', practiceNumber: 1 },
  { pdfFile: '0077_AWS Certified Data Engineer Associate Training Practice Exam 2.pdf', family: 'dea-c01', practiceNumber: 2 },
  { pdfFile: '0075_AWS Certified Data Engineer Associate Training Practice Exam 3.pdf', family: 'dea-c01', practiceNumber: 3 },
  { pdfFile: '0074_AWS Certified Data Engineer Associate Training Practice Exam 4.pdf', family: 'dea-c01', practiceNumber: 4 }
];

function buildConfig(job: Job) {
  const fam = FAMILIES[job.family];
  const slug = `${fam.certSlug}-p${job.practiceNumber}`;
  return {
    pdfPath: `${PDF_DIR}/${job.pdfFile}`,
    vendorSlug: 'aws',
    examSlug: slug,
    examCode: `${fam.certCode}-P${job.practiceNumber}`,
    examTitle: `${fam.examTitleBase} (Practice Exam ${job.practiceNumber})`,
    examDescription: fam.description,
    level: fam.level,
    durationMinutes: fam.durationMinutes,
    passingScore: fam.passingScore,
    domains: fam.domains,
    ref: { label: fam.refLabel, url: fam.refUrl },
    tag: `manual:${slug}`,
    outputPath: `scripts/seed-${slug}.ts`,
    defaultDomain: fam.defaultDomain
  };
}

async function main() {
  const tmpCfg = resolve(process.cwd(), 'scripts', '_tmp-config.json');
  let ok = 0, fail = 0;
  for (const job of JOBS) {
    const cfg = buildConfig(job);
    writeFileSync(tmpCfg, JSON.stringify(cfg, null, 2), 'utf8');
    try {
      execSync(`npx tsx scripts/_pdf-to-seed.ts ${tmpCfg}`, { stdio: 'inherit' });
      ok++;
    } catch {
      console.error(`✗ Failed: ${job.pdfFile}`);
      fail++;
    }
  }
  try { unlinkSync(tmpCfg); } catch {}
  console.log(`\nGenerated ${ok} scripts, ${fail} failures.`);
}

main();
