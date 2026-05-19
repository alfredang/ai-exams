/**
 * Internal batch driver: generates seed scripts for Google practice PDFs.
 *   npx tsx scripts/generation/_google-batch.ts
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const PDF_DIR = 'practice-exams-pdfs-20260508-142418';

const FAMILIES = {
  'ace': {
    certCode: 'ACE',
    certSlug: 'google-ace',
    examTitleBase: 'Google Associate Cloud Engineer',
    level: 'Associate',
    durationMinutes: 120,
    passingScore: 70,
    domains: [
      { name: 'Setting up a cloud solution environment', weight: 18 },
      { name: 'Planning and configuring a cloud solution', weight: 22 },
      { name: 'Deploying and implementing a cloud solution', weight: 24 },
      { name: 'Ensuring successful operation of a cloud solution', weight: 18 },
      { name: 'Configuring access and security', weight: 18 }
    ],
    defaultDomain: 'Deploying and implementing a cloud solution',
    refLabel: 'Google Associate Cloud Engineer exam page',
    refUrl: 'https://cloud.google.com/learn/certification/cloud-engineer',
    description: 'Google Associate Cloud Engineer (ACE) practice set covering setup, planning, deployment, operations, and access/security on Google Cloud. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'pro-ml': {
    certCode: 'PRO-ML',
    certSlug: 'google-professional-ml-engineer',
    examTitleBase: 'Google Professional Machine Learning Engineer',
    level: 'Professional',
    durationMinutes: 120,
    passingScore: 70,
    domains: [
      { name: 'Architecting low-code AI solutions', weight: 12 },
      { name: 'Collaborating within and across teams to manage data and models', weight: 16 },
      { name: 'Scaling prototypes into ML models', weight: 18 },
      { name: 'Serving and scaling models', weight: 20 },
      { name: 'Automating and orchestrating ML pipelines', weight: 22 },
      { name: 'Monitoring AI solutions', weight: 12 }
    ],
    defaultDomain: 'Automating and orchestrating ML pipelines',
    refLabel: 'Google Professional Machine Learning Engineer exam page',
    refUrl: 'https://cloud.google.com/learn/certification/machine-learning-engineer',
    description: 'Google Professional Machine Learning Engineer practice set covering low-code AI, data/model collaboration, scaling prototypes, serving, ML pipeline automation, and AI monitoring. Sourced from a third-party practice exam PDF. Not real exam questions.'
  }
} as const;

const PRICING = { practice: 2900, bundle: 17900, voucher: 14900 };

const JOBS: { pdfFile: string; family: keyof typeof FAMILIES; practiceNumber: number }[] = [
  { pdfFile: '0155_Google Associate Cloud Engineer Training Practice Exam 1.pdf', family: 'ace', practiceNumber: 1 },
  { pdfFile: '0154_Google Associate Cloud Engineer Training Practice Exam 2.pdf', family: 'ace', practiceNumber: 2 },
  { pdfFile: '0153_Google Professional Machine Learning Engineer Training Practice Exam 1.pdf', family: 'pro-ml', practiceNumber: 1 },
  { pdfFile: '0152_Google Professional Machine Learning Engineer Training Practice Exam 2.pdf', family: 'pro-ml', practiceNumber: 2 },
  { pdfFile: '0151_Google Professional Machine Learning Engineer Training Practice Exam 3.pdf', family: 'pro-ml', practiceNumber: 3 },
  { pdfFile: '0150_Google Professional Machine Learning Engineer Training Practice Exam 4.pdf', family: 'pro-ml', practiceNumber: 4 },
  { pdfFile: '0149_Google Professional Machine Learning Engineer Training Practice Exam 5.pdf', family: 'pro-ml', practiceNumber: 5 },
  { pdfFile: '0148_Google Professional Machine Learning Engineer Training Practice Exam 6.pdf', family: 'pro-ml', practiceNumber: 6 }
];

function buildConfig(job: typeof JOBS[number]) {
  const fam = FAMILIES[job.family];
  const slug = `${fam.certSlug}-p${job.practiceNumber}`;
  return {
    pdfPath: `${PDF_DIR}/${job.pdfFile}`,
    vendorSlug: 'google',
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
    outputPath: `scripts/generated-seeds/seed-${slug}.ts`,
    defaultDomain: fam.defaultDomain
  };
}

async function main() {
  const tmpCfg = resolve(process.cwd(), 'scripts', 'generation', '_tmp-config.json');
  let ok = 0, fail = 0;
  for (const job of JOBS) {
    writeFileSync(tmpCfg, JSON.stringify(buildConfig(job), null, 2), 'utf8');
    try {
      execSync(`npx tsx scripts/generation/_pdf-to-seed.ts ${tmpCfg}`, { stdio: 'inherit' });
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
