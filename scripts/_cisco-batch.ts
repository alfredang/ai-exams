/**
 * Internal batch driver: generates seed scripts for Cisco practice PDFs.
 *   npx tsx scripts/_cisco-batch.ts
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const PDF_DIR = 'practice-exams-pdfs-20260508-142418';

const FAMILIES = {
  'ccna': {
    certCode: '200-301',
    certSlug: 'cisco-ccna',
    examTitleBase: 'Cisco Certified Network Associate (CCNA)',
    level: 'Associate',
    durationMinutes: 120,
    passingScore: 82,
    domains: [
      { name: 'Network Fundamentals', weight: 20 },
      { name: 'Network Access', weight: 20 },
      { name: 'IP Connectivity', weight: 25 },
      { name: 'IP Services', weight: 10 },
      { name: 'Security Fundamentals', weight: 15 },
      { name: 'Automation and Programmability', weight: 10 }
    ],
    defaultDomain: 'IP Connectivity',
    refLabel: 'Cisco CCNA (200-301) exam page',
    refUrl: 'https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html',
    description: 'Cisco Certified Network Associate (CCNA, 200-301) practice set covering network fundamentals, access, IP connectivity & services, security fundamentals, and automation. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'ccnp-encor': {
    certCode: '350-401',
    certSlug: 'cisco-ccnp-encor',
    examTitleBase: 'Cisco CCNP Enterprise Core (ENCOR)',
    level: 'Professional',
    durationMinutes: 120,
    passingScore: 82,
    domains: [
      { name: 'Architecture', weight: 15 },
      { name: 'Virtualization', weight: 10 },
      { name: 'Infrastructure', weight: 30 },
      { name: 'Network Assurance', weight: 10 },
      { name: 'Security', weight: 20 },
      { name: 'Automation', weight: 15 }
    ],
    defaultDomain: 'Infrastructure',
    refLabel: 'Cisco CCNP ENCOR (350-401) exam page',
    refUrl: 'https://www.cisco.com/site/us/en/learn/training-certifications/exams/encor.html',
    description: 'Cisco CCNP Enterprise Core (ENCOR, 350-401) practice set covering architecture, virtualization, infrastructure, network assurance, security, and automation. Sourced from a third-party practice exam PDF. Not real exam questions.'
  }
} as const;


const JOBS: { pdfFile: string; family: keyof typeof FAMILIES; practiceNumber: number }[] = [
  { pdfFile: '0147_Cisco Certified Network Associate Practice Exam 1.pdf', family: 'ccna', practiceNumber: 1 },
  { pdfFile: '0146_Cisco Certified Network Associate Practice Exam 2.pdf', family: 'ccna', practiceNumber: 2 },
  { pdfFile: '0145_Cisco Certified Network Associate Practice Exam 3.pdf', family: 'ccna', practiceNumber: 3 },
  { pdfFile: '0144_Cisco Certified Network Associate Practice Exam 4.pdf', family: 'ccna', practiceNumber: 4 },
  { pdfFile: '0143_Cisco Certified Network Associate Practice Exam 5.pdf', family: 'ccna', practiceNumber: 5 },
  { pdfFile: '0142_Cisco Certified Network Associate Practice Exam 6.pdf', family: 'ccna', practiceNumber: 6 },
  { pdfFile: '0106_CCNP ENCOR Practice Exam 1.pdf', family: 'ccnp-encor', practiceNumber: 1 },
  { pdfFile: '0102_CCNP ENCOR Practice Exam 2.pdf', family: 'ccnp-encor', practiceNumber: 2 }
];

function buildConfig(job: typeof JOBS[number]) {
  const fam = FAMILIES[job.family];
  const slug = `${fam.certSlug}-p${job.practiceNumber}`;
  return {
    pdfPath: `${PDF_DIR}/${job.pdfFile}`,
    vendorSlug: 'cisco',
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
    writeFileSync(tmpCfg, JSON.stringify(buildConfig(job), null, 2), 'utf8');
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
