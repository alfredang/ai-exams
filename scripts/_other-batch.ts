/**
 * Internal batch driver: generates seed scripts for "other" vendor practice
 * PDFs (CISSP, PMP, PSM, ITIL, GitHub Foundations, Tableau, CLSSGB).
 *   npx tsx scripts/_other-batch.ts
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const PDF_DIR = 'practice-exams-pdfs-20260508-142418';

const FAMILIES = {
  'cissp': {
    vendorSlug: 'isc2',
    certCode: 'CISSP',
    certSlug: 'isc2-cissp',
    examTitleBase: 'ISC2 CISSP',
    level: 'Professional',
    durationMinutes: 240,
    passingScore: 70,
    domains: [
      { name: 'Security and Risk Management', weight: 16 },
      { name: 'Asset Security', weight: 10 },
      { name: 'Security Architecture and Engineering', weight: 13 },
      { name: 'Communication and Network Security', weight: 13 },
      { name: 'Identity and Access Management', weight: 13 },
      { name: 'Security Assessment and Testing', weight: 12 },
      { name: 'Security Operations', weight: 13 },
      { name: 'Software Development Security', weight: 10 }
    ],
    defaultDomain: 'Security and Risk Management',
    refLabel: 'ISC2 CISSP exam page',
    refUrl: 'https://www.isc2.org/Certifications/CISSP',
    description: 'ISC2 CISSP practice set covering the eight CISSP domains: security & risk management, asset security, security architecture, communication & network security, IAM, security assessment, operations, and software development security. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'pmp': {
    vendorSlug: 'pmi',
    certCode: 'PMP',
    certSlug: 'pmi-pmp',
    examTitleBase: 'PMI PMP',
    level: 'Professional',
    durationMinutes: 230,
    passingScore: 70,
    domains: [
      { name: 'People', weight: 42 },
      { name: 'Process', weight: 50 },
      { name: 'Business Environment', weight: 8 }
    ],
    defaultDomain: 'Process',
    refLabel: 'PMI PMP exam page',
    refUrl: 'https://www.pmi.org/certifications/project-management-pmp',
    description: 'PMI Project Management Professional (PMP) practice set covering people-, process-, and business-environment-oriented project management questions. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'psm': {
    vendorSlug: 'scrum-org',
    certCode: 'PSM-I',
    certSlug: 'scrum-org-psm-i',
    examTitleBase: 'Scrum.org Professional Scrum Master I (PSM I)',
    level: 'Foundational',
    durationMinutes: 60,
    passingScore: 85,
    domains: [
      { name: 'Scrum Theory', weight: 20 },
      { name: 'Scrum Team', weight: 25 },
      { name: 'Scrum Events', weight: 25 },
      { name: 'Scrum Artifacts', weight: 20 },
      { name: 'Done', weight: 10 }
    ],
    defaultDomain: 'Scrum Team',
    refLabel: 'Scrum.org PSM I assessment',
    refUrl: 'https://www.scrum.org/professional-scrum-master-i-certification',
    description: 'Scrum.org Professional Scrum Master I (PSM I) practice set covering Scrum theory, team, events, artifacts, and the Definition of Done. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'github-foundations': {
    vendorSlug: 'github',
    certCode: 'GH-FOUND',
    certSlug: 'github-foundations',
    examTitleBase: 'GitHub Foundations',
    level: 'Foundational',
    durationMinutes: 60,
    passingScore: 70,
    domains: [
      { name: 'Introduction to Git and GitHub', weight: 25 },
      { name: 'Working with GitHub Repositories', weight: 25 },
      { name: 'Collaboration Features', weight: 25 },
      { name: 'GitHub Ecosystem and AI Tools', weight: 25 }
    ],
    defaultDomain: 'Working with GitHub Repositories',
    refLabel: 'GitHub Foundations exam page',
    refUrl: 'https://resources.github.com/learn/certifications/',
    description: 'GitHub Foundations practice set covering Git/GitHub basics, repository management, collaboration features (PRs, issues, projects), and the GitHub ecosystem. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'itil4': {
    vendorSlug: 'axelos',
    certCode: 'ITIL4-F',
    certSlug: 'axelos-itil4-foundation',
    examTitleBase: 'AXELOS ITIL 4 Foundation',
    level: 'Foundational',
    durationMinutes: 60,
    passingScore: 65,
    domains: [
      { name: 'Service Management Concepts', weight: 25 },
      { name: 'The Four Dimensions of Service Management', weight: 15 },
      { name: 'The ITIL Service Value System', weight: 30 },
      { name: 'ITIL Practices', weight: 30 }
    ],
    defaultDomain: 'The ITIL Service Value System',
    refLabel: 'AXELOS / PeopleCert ITIL 4 Foundation',
    refUrl: 'https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-4-foundation',
    description: 'ITIL 4 Foundation practice set covering service management concepts, the four dimensions, the service value system, and ITIL practices. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'tableau': {
    vendorSlug: 'tableau',
    certCode: 'TDS',
    certSlug: 'tableau-desktop-specialist',
    examTitleBase: 'Tableau Desktop Specialist',
    level: 'Foundational',
    durationMinutes: 60,
    passingScore: 75,
    domains: [
      { name: 'Connecting to and Preparing Data', weight: 25 },
      { name: 'Exploring and Analyzing Data', weight: 35 },
      { name: 'Sharing Insights', weight: 20 },
      { name: 'Understanding Tableau Concepts', weight: 20 }
    ],
    defaultDomain: 'Exploring and Analyzing Data',
    refLabel: 'Tableau Desktop Specialist exam page',
    refUrl: 'https://www.tableau.com/learn/certification/desktop-specialist',
    description: 'Tableau Desktop Specialist practice set covering connecting to data, exploring/analyzing, sharing insights, and core Tableau concepts. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'clssgb': {
    vendorSlug: 'iassc',
    certCode: 'CLSSGB',
    certSlug: 'iassc-clssgb',
    examTitleBase: 'IASSC Certified Lean Six Sigma Green Belt (CLSSGB)',
    level: 'Associate',
    durationMinutes: 180,
    passingScore: 70,
    domains: [
      { name: 'Define Phase', weight: 20 },
      { name: 'Measure Phase', weight: 20 },
      { name: 'Analyze Phase', weight: 20 },
      { name: 'Improve Phase', weight: 20 },
      { name: 'Control Phase', weight: 20 }
    ],
    defaultDomain: 'Measure Phase',
    refLabel: 'IASSC Lean Six Sigma Green Belt',
    refUrl: 'https://www.iassc.org/six-sigma-certification/green-belt-certification/',
    description: 'IASSC Certified Lean Six Sigma Green Belt (CLSSGB) practice set covering DMAIC: Define, Measure, Analyze, Improve, and Control phases. Sourced from a third-party practice exam PDF. Not real exam questions.'
  }
} as const;


type Job = {
  pdfFile: string;
  family: keyof typeof FAMILIES;
  practiceNumber: number;
};

const JOBS: Job[] = [
  // CISSP (6) — using 0125 over 0126 for P4 (larger PDF)
  { pdfFile: '0129_CISSP Practice Exam 1.pdf', family: 'cissp', practiceNumber: 1 },
  { pdfFile: '0128_CISSP Practice Exam 2.pdf', family: 'cissp', practiceNumber: 2 },
  { pdfFile: '0127_CISSP Practice Exam 3.pdf', family: 'cissp', practiceNumber: 3 },
  { pdfFile: '0125_CISSP Practice Exam 4.pdf', family: 'cissp', practiceNumber: 4 },
  { pdfFile: '0124_CISSP Practice Exam 5.pdf', family: 'cissp', practiceNumber: 5 },
  { pdfFile: '0123_CISSP Practice Exam 6.pdf', family: 'cissp', practiceNumber: 6 },
  // PMP (6) — skipping 0237 dup of 0207 P3
  { pdfFile: '0209_PMP Practice Exam 1.pdf', family: 'pmp', practiceNumber: 1 },
  { pdfFile: '0208_PMP Practice Exam 2.pdf', family: 'pmp', practiceNumber: 2 },
  { pdfFile: '0207_PMP Practice Exam 3.pdf', family: 'pmp', practiceNumber: 3 },
  { pdfFile: '0206_PMP Practice Exam 4.pdf', family: 'pmp', practiceNumber: 4 },
  { pdfFile: '0205_PMP Practice Exam 5.pdf', family: 'pmp', practiceNumber: 5 },
  { pdfFile: '0204_PMP Practice Exam 6.pdf', family: 'pmp', practiceNumber: 6 },
  // PSM (2) — Professional Scrum Master P1, P5
  { pdfFile: '0121_Professional Scrum Master Training Practice Exam 1.pdf', family: 'psm', practiceNumber: 1 },
  { pdfFile: '0122_Professional Scrum Master Training Practice Exam 5.pdf', family: 'psm', practiceNumber: 5 },
  // GitHub Foundations (4)
  { pdfFile: '0104_Github Foundations Certification Training Practice Exam 1.pdf', family: 'github-foundations', practiceNumber: 1 },
  { pdfFile: '0103_Github Foundations Certification Training Practice Exam 2.pdf', family: 'github-foundations', practiceNumber: 2 },
  { pdfFile: '0101_Github Foundations Certification Training Practice Exam 3.pdf', family: 'github-foundations', practiceNumber: 3 },
  { pdfFile: '0100_Github Foundations Certification Training Practice Exam 4.pdf', family: 'github-foundations', practiceNumber: 4 },
  // ITIL 4 Foundation (only P7 in the dataset)
  { pdfFile: '0210_ITIL4 Practice Exam 7.pdf', family: 'itil4', practiceNumber: 7 },
  // Tableau Desktop Specialist (only P5)
  { pdfFile: '0081_Tableau Practice Exam 5.pdf', family: 'tableau', practiceNumber: 5 },
  // IASSC CLSSGB (only P1)
  { pdfFile: '0089_CLSSGB Practice Exam 1.pdf', family: 'clssgb', practiceNumber: 1 }
];

function buildConfig(job: Job) {
  const fam = FAMILIES[job.family];
  const slug = `${fam.certSlug}-p${job.practiceNumber}`;
  return {
    pdfPath: `${PDF_DIR}/${job.pdfFile}`,
    vendorSlug: fam.vendorSlug,
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
