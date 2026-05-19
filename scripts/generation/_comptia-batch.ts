/**
 * Internal batch driver: generates seed scripts for CompTIA practice PDFs.
 *   npx tsx scripts/generation/_comptia-batch.ts
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const PDF_DIR = 'practice-exams-pdfs-20260508-142418';

const FAMILIES = {
  'server-plus': {
    certCode: 'SK0-005',
    certSlug: 'comptia-server-plus',
    examTitleBase: 'CompTIA Server+',
    level: 'Associate',
    durationMinutes: 90,
    passingScore: 75,
    domains: [
      { name: 'Server Hardware Installation and Management', weight: 17 },
      { name: 'Server Administration', weight: 30 },
      { name: 'Security and Disaster Recovery', weight: 24 },
      { name: 'Troubleshooting', weight: 29 }
    ],
    defaultDomain: 'Server Administration',
    refLabel: 'CompTIA Server+ exam objectives',
    refUrl: 'https://www.comptia.org/certifications/server',
    description: 'CompTIA Server+ practice set covering server hardware install/management, server administration, security/disaster recovery, and troubleshooting. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'linux-plus': {
    certCode: 'XK0-005',
    certSlug: 'comptia-linux-plus',
    examTitleBase: 'CompTIA Linux+',
    level: 'Associate',
    durationMinutes: 90,
    passingScore: 72,
    domains: [
      { name: 'System Management', weight: 32 },
      { name: 'Security', weight: 21 },
      { name: 'Scripting, Containers, and Automation', weight: 19 },
      { name: 'Troubleshooting', weight: 28 }
    ],
    defaultDomain: 'System Management',
    refLabel: 'CompTIA Linux+ exam objectives',
    refUrl: 'https://www.comptia.org/certifications/linux',
    description: 'CompTIA Linux+ practice set covering system management, security, scripting/containers/automation, and troubleshooting. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'data-plus': {
    certCode: 'DA0-001',
    certSlug: 'comptia-data-plus',
    examTitleBase: 'CompTIA Data+',
    level: 'Associate',
    durationMinutes: 90,
    passingScore: 70,
    domains: [
      { name: 'Data Concepts and Environments', weight: 15 },
      { name: 'Data Mining', weight: 25 },
      { name: 'Data Analysis', weight: 23 },
      { name: 'Visualization', weight: 23 },
      { name: 'Data Governance, Quality, and Controls', weight: 14 }
    ],
    defaultDomain: 'Data Analysis',
    refLabel: 'CompTIA Data+ exam objectives',
    refUrl: 'https://www.comptia.org/certifications/data',
    description: 'CompTIA Data+ practice set covering data concepts, mining, analysis, visualization, and governance. Sourced from a third-party practice exam PDF. Not real exam questions.'
  }
} as const;

const PRICING = { practice: 2900, bundle: 17900, voucher: 14900 };

const JOBS: { pdfFile: string; family: keyof typeof FAMILIES; practiceNumber: number }[] = [
  { pdfFile: '0133_CompTIA Certified Server+ Practice Exam 1.pdf', family: 'server-plus', practiceNumber: 1 },
  { pdfFile: '0132_CompTIA Certified Server+ Practice Exam 2.pdf', family: 'server-plus', practiceNumber: 2 },
  { pdfFile: '0130_CompTIA Certified Server+ Practice Exam 3.pdf', family: 'server-plus', practiceNumber: 3 },
  { pdfFile: '0131_CompTIA Certified Server+ Practice Exam 4.pdf', family: 'server-plus', practiceNumber: 4 },
  { pdfFile: '0169_CompTIA Linux+ Practice Exam 1.pdf', family: 'linux-plus', practiceNumber: 1 },
  { pdfFile: '0167_CompTIA Linux+ Practice Exam 2.pdf', family: 'linux-plus', practiceNumber: 2 },
  { pdfFile: '0168_CompTIA Linux+ Practice Exam 3.pdf', family: 'linux-plus', practiceNumber: 3 },
  { pdfFile: '0166_CompTIA Linux+ Practice Exam 4.pdf', family: 'linux-plus', practiceNumber: 4 },
  { pdfFile: '0165_CompTIA Linux+ Practice Exam 5.pdf', family: 'linux-plus', practiceNumber: 5 },
  { pdfFile: '0164_CompTIA Linux+ Practice Exam 6.pdf', family: 'linux-plus', practiceNumber: 6 },
  { pdfFile: '0197_CompTIA Data+ Practice Exam 1.pdf', family: 'data-plus', practiceNumber: 1 },
  { pdfFile: '0194_CompTIA Data+ Practice Exam 2.pdf', family: 'data-plus', practiceNumber: 2 },
  { pdfFile: '0195_CompTIA Data+ Practice Exam 3.pdf', family: 'data-plus', practiceNumber: 3 },
  { pdfFile: '0192_CompTIA Data+ Practice Exam 4.pdf', family: 'data-plus', practiceNumber: 4 },
  { pdfFile: '0196_CompTIA Data+ Practice Exam 5.pdf', family: 'data-plus', practiceNumber: 5 },
  { pdfFile: '0193_CompTIA Data+ Practice Exam 6.pdf', family: 'data-plus', practiceNumber: 6 }
];

function buildConfig(job: typeof JOBS[number]) {
  const fam = FAMILIES[job.family];
  const slug = `${fam.certSlug}-p${job.practiceNumber}`;
  return {
    pdfPath: `${PDF_DIR}/${job.pdfFile}`,
    vendorSlug: 'comptia',
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
