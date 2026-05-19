/**
 * Second-pass recovery: retry the PDFs that produced under 10 questions in
 * the original batches and were dropped. The improved parser (with the
 * off-by-one fix and the preceding-spaces heuristic) may recover them.
 *
 *   npx tsx scripts/generation/_recovery2-batch.ts
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const PDF_DIR = 'practice-exams-pdfs-20260508-142418';
const PRICING = { practice: 2900, bundle: 17900, voucher: 14900 };

const MS_AI900 = {
  vendor: 'microsoft', level: 'Foundational', duration: 60, pass: 70,
  domains: [
    { name: 'AI Workloads and Considerations', weight: 18 },
    { name: 'Machine Learning on Azure', weight: 28 },
    { name: 'Computer Vision on Azure', weight: 18 },
    { name: 'Natural Language Processing on Azure', weight: 18 },
    { name: 'Generative AI on Azure', weight: 18 }
  ],
  defaultDomain: 'Machine Learning on Azure',
  ref: { label: 'Microsoft AI-900 exam page', url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-900/' },
  description: 'Microsoft Azure AI Fundamentals (AI-900) practice set covering AI workloads, machine learning on Azure, computer vision, NLP, and generative AI. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const MS_AZ104 = {
  vendor: 'microsoft', level: 'Associate', duration: 100, pass: 70,
  domains: [
    { name: 'Manage Azure identities and governance', weight: 18 },
    { name: 'Implement and manage storage', weight: 18 },
    { name: 'Deploy and manage Azure compute resources', weight: 22 },
    { name: 'Implement and manage virtual networking', weight: 22 },
    { name: 'Monitor and maintain Azure resources', weight: 20 }
  ],
  defaultDomain: 'Deploy and manage Azure compute resources',
  ref: { label: 'Microsoft AZ-104 exam page', url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-104/' },
  description: 'Microsoft Azure Administrator Associate (AZ-104) practice set covering identities and governance, storage, compute, virtual networking, and monitoring. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const MS_MS102 = {
  vendor: 'microsoft', level: 'Expert', duration: 120, pass: 70,
  domains: [
    { name: 'Deploy and manage a Microsoft 365 tenant', weight: 28 },
    { name: 'Implement and manage identity and access in Microsoft Entra ID', weight: 22 },
    { name: 'Manage security and threats by using Microsoft Defender XDR', weight: 32 },
    { name: 'Manage compliance by using Microsoft Purview', weight: 18 }
  ],
  defaultDomain: 'Manage security and threats by using Microsoft Defender XDR',
  ref: { label: 'Microsoft MS-102 exam page', url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ms-102/' },
  description: 'Microsoft 365 Administrator Expert (MS-102) practice set covering tenant deployment, identity & access in Entra ID, security with Defender XDR, and compliance with Purview. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const MS_PL300 = {
  vendor: 'microsoft', level: 'Associate', duration: 100, pass: 70,
  domains: [
    { name: 'Prepare the data', weight: 18 },
    { name: 'Model the data', weight: 32 },
    { name: 'Visualize and analyze the data', weight: 28 },
    { name: 'Deploy and maintain assets', weight: 22 }
  ],
  defaultDomain: 'Model the data',
  ref: { label: 'Microsoft PL-300 exam page', url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/pl-300/' },
  description: 'Microsoft Power BI Data Analyst Associate (PL-300) practice set covering data preparation, data modeling, data visualization & analysis, and deployment & maintenance. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const MS_SC200 = {
  vendor: 'microsoft', level: 'Associate', duration: 100, pass: 70,
  domains: [
    { name: 'Mitigate threats using Microsoft Defender XDR', weight: 50 },
    { name: 'Mitigate threats using Microsoft Defender for Cloud', weight: 18 },
    { name: 'Mitigate threats using Microsoft Sentinel', weight: 32 }
  ],
  defaultDomain: 'Mitigate threats using Microsoft Defender XDR',
  ref: { label: 'Microsoft SC-200 exam page', url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/sc-200/' },
  description: 'Microsoft Security Operations Analyst Associate (SC-200) practice set covering threat mitigation with Microsoft Defender XDR, Defender for Cloud, and Sentinel. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const G_PROML = {
  vendor: 'google', level: 'Professional', duration: 120, pass: 70,
  domains: [
    { name: 'Architecting low-code AI solutions', weight: 12 },
    { name: 'Collaborating within and across teams to manage data and models', weight: 16 },
    { name: 'Scaling prototypes into ML models', weight: 18 },
    { name: 'Serving and scaling models', weight: 20 },
    { name: 'Automating and orchestrating ML pipelines', weight: 22 },
    { name: 'Monitoring AI solutions', weight: 12 }
  ],
  defaultDomain: 'Automating and orchestrating ML pipelines',
  ref: { label: 'Google Professional Machine Learning Engineer exam page', url: 'https://cloud.google.com/learn/certification/machine-learning-engineer' },
  description: 'Google Professional Machine Learning Engineer practice set covering low-code AI, data/model collaboration, scaling prototypes, serving, ML pipeline automation, and AI monitoring. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

type Cfg = {
  pdfFile: string; vendorSlug: string; examSlug: string; examCode: string;
  examTitle: string; examDescription: string; level: string;
  durationMinutes: number; passingScore: number;
  domains: { name: string; weight: number }[]; defaultDomain: string;
  ref: { label: string; url: string };
};

function makeCfg(pdfFile: string, fam: any, certCode: string, slugBase: string, titleBase: string, num: number): Cfg {
  return {
    pdfFile, vendorSlug: fam.vendor,
    examSlug: `${slugBase}-p${num}`,
    examCode: `${certCode}-P${num}`,
    examTitle: `${titleBase} (Practice Exam ${num})`,
    examDescription: fam.description, level: fam.level,
    durationMinutes: fam.duration, passingScore: fam.pass,
    domains: fam.domains, defaultDomain: fam.defaultDomain, ref: fam.ref
  };
}

const CFGS: Cfg[] = [
  makeCfg('0110_AI-900 Practice Exam 4.pdf', MS_AI900, 'AI-900', 'microsoft-ai-900', 'Microsoft Azure AI Fundamentals (AI-900)', 4),
  makeCfg('0109_AI-900 Practice Exam 5.pdf', MS_AI900, 'AI-900', 'microsoft-ai-900', 'Microsoft Azure AI Fundamentals (AI-900)', 5),
  makeCfg('0108_AI-900 Practice Exam 6.pdf', MS_AI900, 'AI-900', 'microsoft-ai-900', 'Microsoft Azure AI Fundamentals (AI-900)', 6),
  makeCfg('0218_AZ-104 Practice Exam 2.pdf', MS_AZ104, 'AZ-104', 'microsoft-az-104', 'Microsoft Azure Administrator (AZ-104)', 2),
  makeCfg('0088_Microsoft 365 Administrator Training MS-102 Practice Exam 3.pdf', MS_MS102, 'MS-102', 'microsoft-ms-102', 'Microsoft 365 Administrator Expert (MS-102)', 3),
  makeCfg('0043_Microsoft Power BI Data Analyst Associate  Practice Exam 5.pdf', MS_PL300, 'PL-300', 'microsoft-pl-300', 'Microsoft Power BI Data Analyst (PL-300)', 5),
  makeCfg('0183_Microsoft Security Operations Analyst  Practice Exam 5.pdf', MS_SC200, 'SC-200', 'microsoft-sc-200', 'Microsoft Security Operations Analyst (SC-200)', 5),
  makeCfg('0150_Google Professional Machine Learning Engineer Training Practice Exam 4.pdf', G_PROML, 'PRO-ML', 'google-professional-ml-engineer', 'Google Professional Machine Learning Engineer', 4),
  makeCfg('0149_Google Professional Machine Learning Engineer Training Practice Exam 5.pdf', G_PROML, 'PRO-ML', 'google-professional-ml-engineer', 'Google Professional Machine Learning Engineer', 5),
  makeCfg('0148_Google Professional Machine Learning Engineer Training Practice Exam 6.pdf', G_PROML, 'PRO-ML', 'google-professional-ml-engineer', 'Google Professional Machine Learning Engineer', 6)
];

function fullCfg(c: Cfg) {
  return {
    pdfPath: `${PDF_DIR}/${c.pdfFile}`,
    vendorSlug: c.vendorSlug, examSlug: c.examSlug, examCode: c.examCode,
    examTitle: c.examTitle, examDescription: c.examDescription,
    level: c.level, durationMinutes: c.durationMinutes,
    passingScore: c.passingScore, domains: c.domains,

    ref: c.ref, tag: `manual:${c.examSlug}`,
    outputPath: `scripts/generated-seeds/seed-${c.examSlug}.ts`, defaultDomain: c.defaultDomain
  };
}

async function main() {
  const tmpCfg = resolve(process.cwd(), 'scripts', 'generation', '_tmp-config.json');
  let ok = 0, fail = 0;
  for (const c of CFGS) {
    writeFileSync(tmpCfg, JSON.stringify(fullCfg(c), null, 2), 'utf8');
    try {
      execSync(`npx tsx scripts/generation/_pdf-to-seed.ts ${tmpCfg}`, { stdio: 'inherit' });
      ok++;
    } catch {
      console.error(`✗ Failed: ${c.pdfFile}`);
      fail++;
    }
  }
  try { unlinkSync(tmpCfg); } catch {}
  console.log(`\nGenerated ${ok} scripts, ${fail} failures.`);
}

main();
