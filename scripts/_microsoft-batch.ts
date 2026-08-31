/**
 * Internal batch driver: generates seed scripts for every Microsoft practice
 * PDF. Same shape as scripts/_aws-batch.ts.
 *
 *   npx tsx scripts/_microsoft-batch.ts
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const PDF_DIR = 'practice-exams-pdfs-20260508-142418';

type FamilyMeta = {
  certCode: string;
  certSlug: string;          // used as base for `microsoft-<x>-p<n>`
  examTitleBase: string;
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
  'ai-900': {
    certCode: 'AI-900',
    certSlug: 'microsoft-ai-900',
    examTitleBase: 'Microsoft Azure AI Fundamentals (AI-900)',
    level: 'Foundational',
    durationMinutes: 60,
    passingScore: 70,
    domains: [
      { name: 'AI Workloads and Considerations', weight: 18 },
      { name: 'Machine Learning on Azure', weight: 28 },
      { name: 'Computer Vision on Azure', weight: 18 },
      { name: 'Natural Language Processing on Azure', weight: 18 },
      { name: 'Generative AI on Azure', weight: 18 }
    ],
    defaultDomain: 'Machine Learning on Azure',
    refLabel: 'Microsoft AI-900 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-900/',
    description: 'Microsoft Azure AI Fundamentals (AI-900) practice set covering AI workloads, machine learning on Azure, computer vision, NLP, and generative AI. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'ai-102': {
    certCode: 'AI-102',
    certSlug: 'microsoft-ai-102',
    examTitleBase: 'Microsoft Azure AI Engineer Associate (AI-102)',
    level: 'Associate',
    durationMinutes: 100,
    passingScore: 70,
    domains: [
      { name: 'Plan and manage an Azure AI solution', weight: 17 },
      { name: 'Implement decision support solutions', weight: 17 },
      { name: 'Implement computer vision solutions', weight: 17 },
      { name: 'Implement natural language processing solutions', weight: 17 },
      { name: 'Implement knowledge mining and document intelligence solutions', weight: 16 },
      { name: 'Implement generative AI solutions', weight: 16 }
    ],
    defaultDomain: 'Implement natural language processing solutions',
    refLabel: 'Microsoft AI-102 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-102/',
    description: 'Microsoft Azure AI Engineer Associate (AI-102) practice set covering Azure AI service planning, decision support, computer vision, NLP, knowledge mining, and generative AI. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'az-104': {
    certCode: 'AZ-104',
    certSlug: 'microsoft-az-104',
    examTitleBase: 'Microsoft Azure Administrator (AZ-104)',
    level: 'Associate',
    durationMinutes: 100,
    passingScore: 70,
    domains: [
      { name: 'Manage Azure identities and governance', weight: 18 },
      { name: 'Implement and manage storage', weight: 18 },
      { name: 'Deploy and manage Azure compute resources', weight: 22 },
      { name: 'Implement and manage virtual networking', weight: 22 },
      { name: 'Monitor and maintain Azure resources', weight: 20 }
    ],
    defaultDomain: 'Deploy and manage Azure compute resources',
    refLabel: 'Microsoft AZ-104 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-104/',
    description: 'Microsoft Azure Administrator Associate (AZ-104) practice set covering identities and governance, storage, compute, virtual networking, and monitoring. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'az-500': {
    certCode: 'AZ-500',
    certSlug: 'microsoft-az-500',
    examTitleBase: 'Microsoft Azure Security Engineer (AZ-500)',
    level: 'Associate',
    durationMinutes: 120,
    passingScore: 70,
    domains: [
      { name: 'Manage identity and access', weight: 28 },
      { name: 'Secure networking', weight: 22 },
      { name: 'Secure compute, storage, and databases', weight: 22 },
      { name: 'Manage security operations', weight: 28 }
    ],
    defaultDomain: 'Manage identity and access',
    refLabel: 'Microsoft AZ-500 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-500/',
    description: 'Microsoft Azure Security Engineer Associate (AZ-500) practice set covering identity & access, secure networking, secure compute/storage/databases, and security operations. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'dp-100': {
    certCode: 'DP-100',
    certSlug: 'microsoft-dp-100',
    examTitleBase: 'Microsoft Azure Data Scientist Associate (DP-100)',
    level: 'Associate',
    durationMinutes: 100,
    passingScore: 70,
    domains: [
      { name: 'Design and prepare a machine learning solution', weight: 22 },
      { name: 'Explore data and train models', weight: 38 },
      { name: 'Prepare a model for deployment', weight: 22 },
      { name: 'Deploy and retrain a model', weight: 18 }
    ],
    defaultDomain: 'Explore data and train models',
    refLabel: 'Microsoft DP-100 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/dp-100/',
    description: 'Microsoft Azure Data Scientist Associate (DP-100) practice set covering ML solution design, data exploration & model training, model deployment preparation, and model retraining. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'dp-203': {
    certCode: 'DP-203',
    certSlug: 'microsoft-dp-203',
    examTitleBase: 'Microsoft Azure Data Engineer Associate (DP-203)',
    level: 'Associate',
    durationMinutes: 100,
    passingScore: 70,
    domains: [
      { name: 'Design and implement data storage', weight: 22 },
      { name: 'Develop data processing', weight: 30 },
      { name: 'Secure, monitor, and optimize data storage and data processing', weight: 28 },
      { name: 'Design and implement data security', weight: 20 }
    ],
    defaultDomain: 'Develop data processing',
    refLabel: 'Microsoft DP-203 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/dp-203/',
    description: 'Microsoft Azure Data Engineer Associate (DP-203) practice set covering data storage design, data processing, security/monitoring/optimization, and data security. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'dp-300': {
    certCode: 'DP-300',
    certSlug: 'microsoft-dp-300',
    examTitleBase: 'Microsoft Azure SQL Solutions Administrator (DP-300)',
    level: 'Associate',
    durationMinutes: 100,
    passingScore: 70,
    domains: [
      { name: 'Plan and implement data platform resources', weight: 18 },
      { name: 'Implement a secure environment', weight: 18 },
      { name: 'Monitor, configure, and optimize database resources', weight: 28 },
      { name: 'Configure and manage automation of tasks', weight: 14 },
      { name: 'Plan and configure a high availability and disaster recovery (HADR) environment', weight: 22 }
    ],
    defaultDomain: 'Monitor, configure, and optimize database resources',
    refLabel: 'Microsoft DP-300 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/dp-300/',
    description: 'Microsoft Azure SQL Solutions Administrator Associate (DP-300) practice set covering data platform resources, secure environments, monitoring/optimization, automation, and HADR. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'dp-900': {
    certCode: 'DP-900',
    certSlug: 'microsoft-dp-900',
    examTitleBase: 'Microsoft Azure Data Fundamentals (DP-900)',
    level: 'Foundational',
    durationMinutes: 60,
    passingScore: 70,
    domains: [
      { name: 'Describe core data concepts', weight: 28 },
      { name: 'Identify considerations for relational data on Azure', weight: 22 },
      { name: 'Describe considerations for non-relational data on Azure', weight: 18 },
      { name: 'Describe analytics workloads on Azure', weight: 32 }
    ],
    defaultDomain: 'Describe analytics workloads on Azure',
    refLabel: 'Microsoft DP-900 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/dp-900/',
    description: 'Microsoft Azure Data Fundamentals (DP-900) practice set covering core data concepts, relational data, non-relational data, and analytics workloads on Azure. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'ms-102': {
    certCode: 'MS-102',
    certSlug: 'microsoft-ms-102',
    examTitleBase: 'Microsoft 365 Administrator Expert (MS-102)',
    level: 'Expert',
    durationMinutes: 120,
    passingScore: 70,
    domains: [
      { name: 'Deploy and manage a Microsoft 365 tenant', weight: 28 },
      { name: 'Implement and manage identity and access in Microsoft Entra ID', weight: 22 },
      { name: 'Manage security and threats by using Microsoft Defender XDR', weight: 32 },
      { name: 'Manage compliance by using Microsoft Purview', weight: 18 }
    ],
    defaultDomain: 'Manage security and threats by using Microsoft Defender XDR',
    refLabel: 'Microsoft MS-102 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ms-102/',
    description: 'Microsoft 365 Administrator Expert (MS-102) practice set covering tenant deployment, identity & access in Entra ID, security with Defender XDR, and compliance with Purview. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'md-102': {
    certCode: 'MD-102',
    certSlug: 'microsoft-md-102',
    examTitleBase: 'Microsoft Endpoint Administrator (MD-102)',
    level: 'Associate',
    durationMinutes: 120,
    passingScore: 70,
    domains: [
      { name: 'Deploy Windows client', weight: 22 },
      { name: 'Manage identity and compliance', weight: 18 },
      { name: 'Manage, maintain, and protect devices', weight: 38 },
      { name: 'Manage applications', weight: 22 }
    ],
    defaultDomain: 'Manage, maintain, and protect devices',
    refLabel: 'Microsoft MD-102 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/md-102/',
    description: 'Microsoft Endpoint Administrator Associate (MD-102) practice set covering Windows client deployment, identity & compliance, device management, and application management. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'pl-300': {
    certCode: 'PL-300',
    certSlug: 'microsoft-pl-300',
    examTitleBase: 'Microsoft Power BI Data Analyst (PL-300)',
    level: 'Associate',
    durationMinutes: 100,
    passingScore: 70,
    domains: [
      { name: 'Prepare the data', weight: 18 },
      { name: 'Model the data', weight: 32 },
      { name: 'Visualize and analyze the data', weight: 28 },
      { name: 'Deploy and maintain assets', weight: 22 }
    ],
    defaultDomain: 'Model the data',
    refLabel: 'Microsoft PL-300 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/pl-300/',
    description: 'Microsoft Power BI Data Analyst Associate (PL-300) practice set covering data preparation, data modeling, data visualization & analysis, and deployment & maintenance. Sourced from a third-party practice exam PDF. Not real exam questions.'
  },
  'sc-200': {
    certCode: 'SC-200',
    certSlug: 'microsoft-sc-200',
    examTitleBase: 'Microsoft Security Operations Analyst (SC-200)',
    level: 'Associate',
    durationMinutes: 100,
    passingScore: 70,
    domains: [
      { name: 'Mitigate threats using Microsoft Defender XDR', weight: 50 },
      { name: 'Mitigate threats using Microsoft Defender for Cloud', weight: 18 },
      { name: 'Mitigate threats using Microsoft Sentinel', weight: 32 }
    ],
    defaultDomain: 'Mitigate threats using Microsoft Defender XDR',
    refLabel: 'Microsoft SC-200 exam page',
    refUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/sc-200/',
    description: 'Microsoft Security Operations Analyst Associate (SC-200) practice set covering threat mitigation with Microsoft Defender XDR, Defender for Cloud, and Sentinel. Sourced from a third-party practice exam PDF. Not real exam questions.'
  }
};


type Job = {
  pdfFile: string;
  family: keyof typeof FAMILIES;
  practiceNumber: number;
  slugOverride?: string;
  titleOverride?: string;
};

const JOBS: Job[] = [
  // AI-900 (6)
  { pdfFile: '0113_AI-900 Practice Exam 1.pdf', family: 'ai-900', practiceNumber: 1 },
  { pdfFile: '0112_AI-900 Practice Exam 2.pdf', family: 'ai-900', practiceNumber: 2 },
  { pdfFile: '0111_AI-900 Practice Exam 3.pdf', family: 'ai-900', practiceNumber: 3 },
  { pdfFile: '0110_AI-900 Practice Exam 4.pdf', family: 'ai-900', practiceNumber: 4 },
  { pdfFile: '0109_AI-900 Practice Exam 5.pdf', family: 'ai-900', practiceNumber: 5 },
  { pdfFile: '0108_AI-900 Practice Exam 6.pdf', family: 'ai-900', practiceNumber: 6 },
  // AI-102 (4 main + 1 official)
  { pdfFile: '0118_Microsoft Azure AI Engineer Associate (AI-102) Practice Exam 1.pdf', family: 'ai-102', practiceNumber: 1 },
  { pdfFile: '0117_Microsoft Azure AI Engineer Associate (AI-102) Practice Exam 2.pdf', family: 'ai-102', practiceNumber: 2 },
  { pdfFile: '0116_Microsoft Azure AI Engineer Associate (AI-102) Practice Exam 3.pdf', family: 'ai-102', practiceNumber: 3 },
  { pdfFile: '0115_Microsoft Azure AI Engineer Associate (AI-102) Practice Exam 4.pdf', family: 'ai-102', practiceNumber: 4 },
  { pdfFile: '0006_Official AI-102 Practice Exams.pdf', family: 'ai-102', practiceNumber: 0,
    slugOverride: 'microsoft-ai-102-official',
    titleOverride: 'Microsoft Azure AI Engineer Associate (AI-102) — Official Practice Exams' },
  // AZ-104 (4)
  { pdfFile: '0217_AZ-104 Practice Exam 1.pdf', family: 'az-104', practiceNumber: 1 },
  { pdfFile: '0218_AZ-104 Practice Exam 2.pdf', family: 'az-104', practiceNumber: 2 },
  { pdfFile: '0219_AZ-104 Practice Exam 3.pdf', family: 'az-104', practiceNumber: 3 },
  { pdfFile: '0220_AZ-104 Practice Exam 4.pdf', family: 'az-104', practiceNumber: 4 },
  // AZ-500 (1)
  { pdfFile: '0070_AZ-500 Practice Exam 1.pdf', family: 'az-500', practiceNumber: 1 },
  // DP-100 (2)
  { pdfFile: '0080_Microsoft Azure Data Scientist Associate (DP-100) Practice Exam 1.pdf', family: 'dp-100', practiceNumber: 1 },
  { pdfFile: '0079_Microsoft Azure Data Scientist Associate (DP-100) Practice Exam 2.pdf', family: 'dp-100', practiceNumber: 2 },
  // DP-203 (1)
  { pdfFile: '0041_Microsoft Azure Data Engineer Associate  Practice Exam 1.pdf', family: 'dp-203', practiceNumber: 1 },
  // DP-300 (4)
  { pdfFile: '0098_Administering Microsoft Azure SQL Solutions (DP-300) Practice Exam 1.pdf', family: 'dp-300', practiceNumber: 1 },
  { pdfFile: '0097_Administering Microsoft Azure SQL Solutions (DP-300) Practice Exam 2.pdf', family: 'dp-300', practiceNumber: 2 },
  { pdfFile: '0096_Administering Microsoft Azure SQL Solutions (DP-300) Practice Exam 3.pdf', family: 'dp-300', practiceNumber: 3 },
  { pdfFile: '0099_Administering Microsoft Azure SQL Solutions (DP-300) Practice Exam 4.pdf', family: 'dp-300', practiceNumber: 4 },
  // DP-900 (4)
  { pdfFile: '0188_Microsoft Azure Data Fundamentals  Practice Exam 1 .pdf', family: 'dp-900', practiceNumber: 1 },
  { pdfFile: '0062_Microsoft Azure Data Fundamentals  Practice Exam 2.pdf', family: 'dp-900', practiceNumber: 2 },
  { pdfFile: '0061_Microsoft Azure Data Fundamentals  Practice Exam 3.pdf', family: 'dp-900', practiceNumber: 3 },
  { pdfFile: '0060_Microsoft Azure Data Fundamentals Practice Exam 4.pdf', family: 'dp-900', practiceNumber: 4 },
  // MS-102 (4)
  { pdfFile: '0095_Microsoft 365 Administrator Training MS-102 Practice Exam 1.pdf', family: 'ms-102', practiceNumber: 1 },
  { pdfFile: '0094_Microsoft 365 Administrator Training MS-102 Practice Exam 2.pdf', family: 'ms-102', practiceNumber: 2 },
  { pdfFile: '0088_Microsoft 365 Administrator Training MS-102 Practice Exam 3.pdf', family: 'ms-102', practiceNumber: 3 },
  { pdfFile: '0073_Microsoft 365 Administrator Training MS-102 Practice Exam 4.pdf', family: 'ms-102', practiceNumber: 4 },
  // MD-102 — Endpoint Administrator (4)
  { pdfFile: '0071_Microsoft Certified Endpoint Administrator Associate Practice Exam 1.pdf', family: 'md-102', practiceNumber: 1 },
  { pdfFile: '0191_Microsoft Certified Endpoint Administrator Associate Practice Exam 2.pdf', family: 'md-102', practiceNumber: 2 },
  { pdfFile: '0190_Microsoft Certified Endpoint Administrator Associate Practice Exam 3.pdf', family: 'md-102', practiceNumber: 3 },
  { pdfFile: '0189_Microsoft Certified Endpoint Administrator Associate Practice Exam 4.pdf', family: 'md-102', practiceNumber: 4 },
  // PL-300 — Power BI (5)
  { pdfFile: '0047_Microsoft Power BI Data Analyst Associate Practice Exam 1.pdf', family: 'pl-300', practiceNumber: 1 },
  { pdfFile: '0046_Microsoft Power BI Data Analyst Associate  Practice Exam 2.pdf', family: 'pl-300', practiceNumber: 2 },
  { pdfFile: '0045_Microsoft Power BI Data Analyst Associate  Practice Exam 3.pdf', family: 'pl-300', practiceNumber: 3 },
  { pdfFile: '0044_Microsoft Power BI Data Analyst Associate  Practice Exam 4.pdf', family: 'pl-300', practiceNumber: 4 },
  { pdfFile: '0043_Microsoft Power BI Data Analyst Associate  Practice Exam 5.pdf', family: 'pl-300', practiceNumber: 5 },
  // SC-200 (5)
  { pdfFile: '0187_Microsoft Security Operations Analyst  Practice Exam 1.pdf', family: 'sc-200', practiceNumber: 1 },
  { pdfFile: '0186_Microsoft Security Operations Analyst  Practice Exam 2.pdf', family: 'sc-200', practiceNumber: 2 },
  { pdfFile: '0185_Microsoft Security Operations Analyst  Practice Exam 3.pdf', family: 'sc-200', practiceNumber: 3 },
  { pdfFile: '0184_Microsoft Security Operations Analyst  Practice Exam 4.pdf', family: 'sc-200', practiceNumber: 4 },
  { pdfFile: '0183_Microsoft Security Operations Analyst  Practice Exam 5.pdf', family: 'sc-200', practiceNumber: 5 }
];

function buildConfig(job: Job) {
  const fam = FAMILIES[job.family];
  const slug = job.slugOverride || `${fam.certSlug}-p${job.practiceNumber}`;
  const examTitle = job.titleOverride || `${fam.examTitleBase} (Practice Exam ${job.practiceNumber})`;
  const examCode = job.slugOverride
    ? `${fam.certCode}-OFFICIAL`
    : `${fam.certCode}-P${job.practiceNumber}`;
  return {
    pdfPath: `${PDF_DIR}/${job.pdfFile}`,
    vendorSlug: 'microsoft',
    examSlug: slug,
    examCode,
    examTitle,
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
