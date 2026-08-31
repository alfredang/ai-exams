/**
 * Internal batch driver: re-attempts the PDFs that failed in earlier batches
 * (no answer key in -layout mode). The parser now auto-falls-back to raw
 * pdftotext mode where the correct-answer marker is preserved as a
 * leading-whitespace continuation pattern.
 *
 *   npx tsx scripts/_recovery-batch.ts
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const PDF_DIR = 'practice-exams-pdfs-20260508-142418';

type Cfg = {
  pdfFile: string;
  vendorSlug: string;
  examSlug: string;
  examCode: string;
  examTitle: string;
  examDescription: string;
  level: string;
  durationMinutes: number;
  passingScore: number;
  domains: { name: string; weight: number }[];
  defaultDomain: string;
  ref: { label: string; url: string };
};

// Reused metadata from the earlier batch drivers
const AWS_DEA = {
  vendor: 'aws',
  level: 'Associate',
  duration: 130,
  pass: 72,
  domains: [
    { name: 'Data Ingestion and Transformation', weight: 34 },
    { name: 'Data Store Management', weight: 26 },
    { name: 'Data Operations and Support', weight: 22 },
    { name: 'Data Security and Governance', weight: 18 }
  ],
  defaultDomain: 'Data Ingestion and Transformation',
  ref: {
    label: 'AWS Certified Data Engineer - Associate (DEA-C01) exam guide',
    url: 'https://aws.amazon.com/certification/certified-data-engineer-associate/'
  },
  description: 'AWS Certified Data Engineer - Associate (DEA-C01) practice set covering data ingestion/transformation, data store management, operations, and data security/governance. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const AWS_AIF = {
  vendor: 'aws',
  level: 'Foundational',
  duration: 90,
  pass: 70,
  domains: [
    { name: 'Fundamentals of AI and ML', weight: 20 },
    { name: 'Fundamentals of Generative AI', weight: 24 },
    { name: 'Applications of Foundation Models', weight: 28 },
    { name: 'Guidelines for Responsible AI', weight: 14 },
    { name: 'Security, Compliance, and Governance for AI', weight: 14 }
  ],
  defaultDomain: 'Applications of Foundation Models',
  ref: {
    label: 'AWS Certified AI Practitioner (AIF-C01) exam guide',
    url: 'https://aws.amazon.com/certification/certified-ai-practitioner/'
  },
  description: 'AWS Certified AI Practitioner (AIF-C01) practice set covering AI/ML fundamentals, generative AI, foundation models, responsible AI, and AI security/governance. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const MS_AI102 = {
  vendor: 'microsoft',
  level: 'Associate',
  duration: 100,
  pass: 70,
  domains: [
    { name: 'Plan and manage an Azure AI solution', weight: 17 },
    { name: 'Implement decision support solutions', weight: 17 },
    { name: 'Implement computer vision solutions', weight: 17 },
    { name: 'Implement natural language processing solutions', weight: 17 },
    { name: 'Implement knowledge mining and document intelligence solutions', weight: 16 },
    { name: 'Implement generative AI solutions', weight: 16 }
  ],
  defaultDomain: 'Implement natural language processing solutions',
  ref: {
    label: 'Microsoft AI-102 exam page',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-102/'
  },
  description: 'Microsoft Azure AI Engineer Associate (AI-102) practice set covering Azure AI service planning, decision support, computer vision, NLP, knowledge mining, and generative AI. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const MS_DP100 = {
  vendor: 'microsoft',
  level: 'Associate',
  duration: 100,
  pass: 70,
  domains: [
    { name: 'Design and prepare a machine learning solution', weight: 22 },
    { name: 'Explore data and train models', weight: 38 },
    { name: 'Prepare a model for deployment', weight: 22 },
    { name: 'Deploy and retrain a model', weight: 18 }
  ],
  defaultDomain: 'Explore data and train models',
  ref: {
    label: 'Microsoft DP-100 exam page',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/dp-100/'
  },
  description: 'Microsoft Azure Data Scientist Associate (DP-100) practice set covering ML solution design, data exploration & model training, deployment preparation, and model retraining. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const MS_DP300 = {
  vendor: 'microsoft',
  level: 'Associate',
  duration: 100,
  pass: 70,
  domains: [
    { name: 'Plan and implement data platform resources', weight: 18 },
    { name: 'Implement a secure environment', weight: 18 },
    { name: 'Monitor, configure, and optimize database resources', weight: 28 },
    { name: 'Configure and manage automation of tasks', weight: 14 },
    { name: 'Plan and configure a high availability and disaster recovery (HADR) environment', weight: 22 }
  ],
  defaultDomain: 'Monitor, configure, and optimize database resources',
  ref: {
    label: 'Microsoft DP-300 exam page',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/dp-300/'
  },
  description: 'Microsoft Azure SQL Solutions Administrator Associate (DP-300) practice set covering data platform resources, secure environments, monitoring/optimization, automation, and HADR. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const MS_MS102 = {
  vendor: 'microsoft',
  level: 'Expert',
  duration: 120,
  pass: 70,
  domains: [
    { name: 'Deploy and manage a Microsoft 365 tenant', weight: 28 },
    { name: 'Implement and manage identity and access in Microsoft Entra ID', weight: 22 },
    { name: 'Manage security and threats by using Microsoft Defender XDR', weight: 32 },
    { name: 'Manage compliance by using Microsoft Purview', weight: 18 }
  ],
  defaultDomain: 'Manage security and threats by using Microsoft Defender XDR',
  ref: {
    label: 'Microsoft MS-102 exam page',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ms-102/'
  },
  description: 'Microsoft 365 Administrator Expert (MS-102) practice set covering tenant deployment, identity & access in Entra ID, security with Defender XDR, and compliance with Purview. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

const CISCO_CCNA = {
  vendor: 'cisco',
  level: 'Associate',
  duration: 120,
  pass: 82,
  domains: [
    { name: 'Network Fundamentals', weight: 20 },
    { name: 'Network Access', weight: 20 },
    { name: 'IP Connectivity', weight: 25 },
    { name: 'IP Services', weight: 10 },
    { name: 'Security Fundamentals', weight: 15 },
    { name: 'Automation and Programmability', weight: 10 }
  ],
  defaultDomain: 'IP Connectivity',
  ref: {
    label: 'Cisco CCNA (200-301) exam page',
    url: 'https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html'
  },
  description: 'Cisco Certified Network Associate (CCNA, 200-301) practice set covering network fundamentals, access, IP connectivity & services, security fundamentals, and automation. Sourced from a third-party practice exam PDF. Not real exam questions.'
};

function makeCfg(
  pdfFile: string, fam: any, certCode: string, slugBase: string, titleBase: string, num: number
): Cfg {
  return {
    pdfFile,
    vendorSlug: fam.vendor,
    examSlug: `${slugBase}-p${num}`,
    examCode: `${certCode}-P${num}`,
    examTitle: `${titleBase} (Practice Exam ${num})`,
    examDescription: fam.description,
    level: fam.level,
    durationMinutes: fam.duration,
    passingScore: fam.pass,
    domains: fam.domains,
    defaultDomain: fam.defaultDomain,
    ref: fam.ref
  };
}

const CFGS: Cfg[] = [
  // AWS DEA-C01 P1-P4
  makeCfg('0076_AWS Certified Data Engineer Associate Training Practice Exam 1.pdf', AWS_DEA, 'DEA-C01', 'aws-dea-c01', 'AWS Certified Data Engineer Associate', 1),
  makeCfg('0077_AWS Certified Data Engineer Associate Training Practice Exam 2.pdf', AWS_DEA, 'DEA-C01', 'aws-dea-c01', 'AWS Certified Data Engineer Associate', 2),
  makeCfg('0075_AWS Certified Data Engineer Associate Training Practice Exam 3.pdf', AWS_DEA, 'DEA-C01', 'aws-dea-c01', 'AWS Certified Data Engineer Associate', 3),
  makeCfg('0074_AWS Certified Data Engineer Associate Training Practice Exam 4.pdf', AWS_DEA, 'DEA-C01', 'aws-dea-c01', 'AWS Certified Data Engineer Associate', 4),
  // AWS AIF-C01 P4-P7
  makeCfg('0173_AIF-C01 Practice Exam 4.pdf', AWS_AIF, 'AIF-C01', 'aws-aif-c01', 'AWS Certified AI Practitioner', 4),
  makeCfg('0172_AIF-C01 Practice Exam 5.pdf', AWS_AIF, 'AIF-C01', 'aws-aif-c01', 'AWS Certified AI Practitioner', 5),
  makeCfg('0171_AIF-C01 Practice Exam 6.pdf', AWS_AIF, 'AIF-C01', 'aws-aif-c01', 'AWS Certified AI Practitioner', 6),
  makeCfg('0170_AIF-C01 Practice Exam 7.pdf', AWS_AIF, 'AIF-C01', 'aws-aif-c01', 'AWS Certified AI Practitioner', 7),
  // Microsoft AI-102 P1-P4
  makeCfg('0118_Microsoft Azure AI Engineer Associate (AI-102) Practice Exam 1.pdf', MS_AI102, 'AI-102', 'microsoft-ai-102', 'Microsoft Azure AI Engineer Associate (AI-102)', 1),
  makeCfg('0117_Microsoft Azure AI Engineer Associate (AI-102) Practice Exam 2.pdf', MS_AI102, 'AI-102', 'microsoft-ai-102', 'Microsoft Azure AI Engineer Associate (AI-102)', 2),
  makeCfg('0116_Microsoft Azure AI Engineer Associate (AI-102) Practice Exam 3.pdf', MS_AI102, 'AI-102', 'microsoft-ai-102', 'Microsoft Azure AI Engineer Associate (AI-102)', 3),
  makeCfg('0115_Microsoft Azure AI Engineer Associate (AI-102) Practice Exam 4.pdf', MS_AI102, 'AI-102', 'microsoft-ai-102', 'Microsoft Azure AI Engineer Associate (AI-102)', 4),
  // Microsoft DP-100 P1-P2
  makeCfg('0080_Microsoft Azure Data Scientist Associate (DP-100) Practice Exam 1.pdf', MS_DP100, 'DP-100', 'microsoft-dp-100', 'Microsoft Azure Data Scientist Associate (DP-100)', 1),
  makeCfg('0079_Microsoft Azure Data Scientist Associate (DP-100) Practice Exam 2.pdf', MS_DP100, 'DP-100', 'microsoft-dp-100', 'Microsoft Azure Data Scientist Associate (DP-100)', 2),
  // Microsoft DP-300 P1-P4
  makeCfg('0098_Administering Microsoft Azure SQL Solutions (DP-300) Practice Exam 1.pdf', MS_DP300, 'DP-300', 'microsoft-dp-300', 'Microsoft Azure SQL Solutions Administrator (DP-300)', 1),
  makeCfg('0097_Administering Microsoft Azure SQL Solutions (DP-300) Practice Exam 2.pdf', MS_DP300, 'DP-300', 'microsoft-dp-300', 'Microsoft Azure SQL Solutions Administrator (DP-300)', 2),
  makeCfg('0096_Administering Microsoft Azure SQL Solutions (DP-300) Practice Exam 3.pdf', MS_DP300, 'DP-300', 'microsoft-dp-300', 'Microsoft Azure SQL Solutions Administrator (DP-300)', 3),
  makeCfg('0099_Administering Microsoft Azure SQL Solutions (DP-300) Practice Exam 4.pdf', MS_DP300, 'DP-300', 'microsoft-dp-300', 'Microsoft Azure SQL Solutions Administrator (DP-300)', 4),
  // Microsoft MS-102 P1, P2, P4 (P3 already covered with 2q — not very useful, leave)
  makeCfg('0095_Microsoft 365 Administrator Training MS-102 Practice Exam 1.pdf', MS_MS102, 'MS-102', 'microsoft-ms-102', 'Microsoft 365 Administrator Expert (MS-102)', 1),
  makeCfg('0094_Microsoft 365 Administrator Training MS-102 Practice Exam 2.pdf', MS_MS102, 'MS-102', 'microsoft-ms-102', 'Microsoft 365 Administrator Expert (MS-102)', 2),
  makeCfg('0073_Microsoft 365 Administrator Training MS-102 Practice Exam 4.pdf', MS_MS102, 'MS-102', 'microsoft-ms-102', 'Microsoft 365 Administrator Expert (MS-102)', 4),
  // Cisco CCNA P1-P6
  makeCfg('0147_Cisco Certified Network Associate Practice Exam 1.pdf', CISCO_CCNA, '200-301', 'cisco-ccna', 'Cisco Certified Network Associate (CCNA)', 1),
  makeCfg('0146_Cisco Certified Network Associate Practice Exam 2.pdf', CISCO_CCNA, '200-301', 'cisco-ccna', 'Cisco Certified Network Associate (CCNA)', 2),
  makeCfg('0145_Cisco Certified Network Associate Practice Exam 3.pdf', CISCO_CCNA, '200-301', 'cisco-ccna', 'Cisco Certified Network Associate (CCNA)', 3),
  makeCfg('0144_Cisco Certified Network Associate Practice Exam 4.pdf', CISCO_CCNA, '200-301', 'cisco-ccna', 'Cisco Certified Network Associate (CCNA)', 4),
  makeCfg('0143_Cisco Certified Network Associate Practice Exam 5.pdf', CISCO_CCNA, '200-301', 'cisco-ccna', 'Cisco Certified Network Associate (CCNA)', 5),
  makeCfg('0142_Cisco Certified Network Associate Practice Exam 6.pdf', CISCO_CCNA, '200-301', 'cisco-ccna', 'Cisco Certified Network Associate (CCNA)', 6)
];

function fullCfg(c: Cfg) {
  return {
    pdfPath: `${PDF_DIR}/${c.pdfFile}`,
    vendorSlug: c.vendorSlug,
    examSlug: c.examSlug,
    examCode: c.examCode,
    examTitle: c.examTitle,
    examDescription: c.examDescription,
    level: c.level,
    durationMinutes: c.durationMinutes,
    passingScore: c.passingScore,
    domains: c.domains,
    ref: c.ref,
    tag: `manual:${c.examSlug}`,
    outputPath: `scripts/seed-${c.examSlug}.ts`,
    defaultDomain: c.defaultDomain
  };
}

async function main() {
  const tmpCfg = resolve(process.cwd(), 'scripts', '_tmp-config.json');
  let ok = 0, fail = 0;
  for (const c of CFGS) {
    writeFileSync(tmpCfg, JSON.stringify(fullCfg(c), null, 2), 'utf8');
    try {
      execSync(`npx tsx scripts/_pdf-to-seed.ts ${tmpCfg}`, { stdio: 'inherit' });
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
