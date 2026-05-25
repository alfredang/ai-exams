import { PrismaClient, QStatus, QType, Role, Tier } from '@prisma/client';
import argon2 from 'argon2';

const db = new PrismaClient();

type Level = 'Foundational' | 'Associate' | 'Professional' | 'Expert' | 'Specialty';

type ExamSeed = {
  vendorSlug: string;
  slug: string;
  code: string;
  title: string;
  description: string;
  level: Level;
  durationMinutes: number;
  passingScore: number;
  questionCount: number;
  domains: { name: string; weight: number }[];
};

const VENDORS = [
  { slug: 'aws', name: 'Amazon Web Services', description: 'Cloud certifications from AWS.' },
  { slug: 'microsoft', name: 'Microsoft', description: 'Azure, Microsoft 365, and AI certifications.' },
  { slug: 'comptia', name: 'CompTIA', description: 'Vendor-neutral IT industry certifications.' },
  { slug: 'cisco', name: 'Cisco', description: 'Networking, security, and DevNet certifications.' },
  { slug: 'oracle', name: 'Oracle', description: 'Oracle Cloud Infrastructure, database, and AI certifications.' },
  { slug: 'google', name: 'Google Cloud', description: 'Google Cloud Platform certifications across cloud, data, and ML.' },
  { slug: 'anthropic', name: 'Anthropic', description: 'Anthropic Claude — agent SDK, Claude Code, MCP, and applied AI architecture.' },
  { slug: 'isc2', name: 'ISC2', description: 'Information security certifications including CISSP.' },
  { slug: 'pmi', name: 'PMI', description: 'Project Management Institute — PMP and other project management certifications.' },
  { slug: 'scrum-org', name: 'Scrum.org', description: 'Agile and Scrum certifications including Professional Scrum Master.' },
  { slug: 'github', name: 'GitHub', description: 'GitHub developer and platform certifications.' },
  { slug: 'axelos', name: 'AXELOS', description: 'ITIL, PRINCE2, and IT service management certifications.' },
  { slug: 'linuxfoundation', name: 'Linux Foundation', description: 'CNCF / Linux Foundation certifications — CKAD, CKA, CKS, and other open-source ecosystem credentials.' },
  { slug: 'tableau', name: 'Tableau', description: 'Tableau certifications for data visualization and analytics.' },
  { slug: 'iassc', name: 'IASSC', description: 'Lean Six Sigma certifications.' },
  { slug: 'hashicorp', name: 'HashiCorp', description: 'HashiCorp certifications — Terraform, Vault, Consul, and infrastructure automation credentials.' },
  { slug: 'docker', name: 'Docker', description: 'Docker certifications — containerization, image management, orchestration, and the Docker Certified Associate credential.' },
  { slug: 'redhat', name: 'Red Hat', description: 'Red Hat certifications — RHCSA, RHCE, and enterprise Linux system administration credentials.' },
  { slug: 'gitlab', name: 'GitLab', description: 'GitLab certifications — Git workflows, CI/CD pipelines, DevSecOps, and the GitLab Certified Associate credential.' },
  { slug: 'elastic', name: 'Elastic', description: 'Elastic certifications — Elasticsearch, Kibana, the Elastic Stack, and the Elastic Certified Engineer credential.' }
];

const CLAUDE_ARCHITECT_DOMAINS = [
  { name: 'Agentic Architecture & Orchestration', weight: 27 },
  { name: 'Tool Design & MCP Integration', weight: 18 },
  { name: 'Claude Code Configuration & Workflows', weight: 20 },
  { name: 'Prompt Engineering & Structured Output', weight: 20 },
  { name: 'Context Management & Reliability', weight: 15 }
];

const CLAUDE_ARCHITECT_DESCRIPTION =
  'Foundational certification covering Claude Code, the Claude Agent SDK, the Claude API, and the Model Context Protocol (MCP). Scenario-based questions test architectural judgment for production deployments — agentic loops, tool design, prompt engineering, structured output, and context management.';

// Slugs that previously existed but have been removed from the catalog.
// Cleanup in main() deletes any DB rows still pointing at these (exam,
// questions, entitlements, attempts, orders). The upsert loop also SKIPS
// these so they are not recreated.
//   - The 3 CCA-F shells were consolidated to a single `anthropic-cca-foundations` slug
//   - aws-soa-c02 retired/renamed to CloudOps Engineer (now aws-soa-c03)
//   - aws-scs-c02 superseded by SCS-C03 (now aws-scs-c03)
//   - 26 catalog placeholder shells removed in 2026-05 cleanup: every cert
//     listed below either has PDF-sourced -p1/-p2/... variants now (so the
//     base shell is redundant) or was a never-implemented catalog stub.
//     The source EXAMS entries are kept below for historical reference;
//     the upsert loop skips them due to OBSOLETE_EXAM_SLUGS membership.
// Note: aws-saa-c03 was previously deleted as a placeholder shell but is
// re-added below now that the official AWS catalogue still offers it.
const OBSOLETE_EXAM_SLUGS: string[] = [];

// Slugs that should be kept in the DB but hidden from the public catalog
// (Exam.published = false). Different from OBSOLETE — these aren't deleted;
// they're just not surfaced until they reach a presentable question count.
const HIDDEN_EXAM_SLUGS = [
  'oracle-oci-foundations-1z0-1085', // OCI Foundations Associate — only 6 questions; hide until ≥60
  // Hidden because they're sold via the matching bundle (same cert).
  // Bundle slug = exam slug for the AWS shells, so leaving them published
  // would shadow the bundle in /practice-exams/[vendor]/[slug] routing.
  'aws-aif-c01',
  'aws-clf-c02',
  'aws-dea-c01',
  'aws-dop-c02',
  'aws-dva-c02',
  'aws-saa-c03',
  'aws-soa-c03',
  'aws-sap-c02',
  'aws-mla-c01',
  'google-associate-cloud-engineer',
  'microsoft-ai-102-official',
  'microsoft-ai-102-practice'
];

// Vendor allowlist for the public catalog. Any exam whose vendorSlug is NOT
// in this list is force-hidden (published = false), regardless of question
// count. Used to launch with AWS only and roll out other vendors gradually.
// Flip a single string to re-enable a vendor.
const VISIBLE_VENDOR_SLUGS = ['aws', 'microsoft', 'google', 'anthropic', 'cisco', 'comptia', 'oracle', 'linuxfoundation', 'hashicorp', 'docker', 'redhat', 'gitlab', 'elastic', 'isc2', 'pmi', 'scrum-org', 'github', 'axelos', 'tableau', 'iassc'];

// Curated bundles — multi-exam products defined declaratively here.
// Each item references an exam by slug + the tier the buyer receives.
type BundleSeed = {
  slug: string;
  title: string;
  description: string;
  price: number; // PRACTICE tier price (cents)
  priceVoucher?: number; // VOUCHER tier price (cents) — when offering a voucher upgrade
  items: { examSlug: string; tier: 'PRACTICE' | 'VOUCHER'; position?: number }[];
};

// Curated bundles — a single purchase grants entitlement to every
// item exam. Listed exams should set `published: false` (so they don't
// appear as standalone catalog cards) — the bundle is what's surfaced.
// Existing Bundle rows in the DB not listed here are auto-unpublished
// by main() without losing referential integrity on historical Orders.
const BUNDLES: BundleSeed[] = [
  {
    slug: 'microsoft-ai-900',
    title: 'Microsoft Azure AI Fundamentals (AI-900)',
    description:
      'All 3 AI-900 practice exams in one bundle — 195 curated questions covering AI workloads & considerations, machine learning on Azure, computer vision, natural language processing, and generative AI, aligned to the official AI-900 study guide.',
    price: 2000,         // $79 — PRACTICE tier (3 practice exams × 65 Q)
    priceVoucher: 9900, // $99 — VOUCHER tier (covers Microsoft AI-900 $99 exam fee)
    items: [
      { examSlug: 'microsoft-ai-900-p1', tier: 'PRACTICE', position: 1 },
      { examSlug: 'microsoft-ai-900-p2', tier: 'PRACTICE', position: 2 },
      { examSlug: 'microsoft-ai-900-p3', tier: 'PRACTICE', position: 3 },
      // Voucher item — only granted when the buyer picks the VOUCHER tier
      // at checkout. fulfillOrder filters items by Order.tier so PRACTICE
      // buyers do not receive this.
      { examSlug: 'microsoft-ai-900-p1', tier: 'VOUCHER', position: 4 }
    ]
  },
  {
    slug: 'scrum-org-psm-i',
    title: 'Professional Scrum Master I (PSM I)',
    description:
      'All 3 Professional Scrum Master I practice exams in one bundle — covering Scrum framework theory, accountabilities (Product Owner, Scrum Master, Developers), events, artifacts, Scrum values, empiricism, self-management, and scaling.',
    price: 2000,         // $39 — PRACTICE tier
    priceVoucher: 22900, // $229 — VOUCHER tier (covers Scrum.org PSM I $200 fee + margin)
    items: [
      { examSlug: 'scrum-org-psm-i-p1', tier: 'PRACTICE', position: 1 },
      { examSlug: 'scrum-org-psm-i-p5', tier: 'PRACTICE', position: 2 },
      { examSlug: 'scrum-org-psm-i-p6', tier: 'PRACTICE', position: 3 },
      { examSlug: 'scrum-org-psm-i-p1', tier: 'VOUCHER', position: 4 }
    ]
  },
  {
    slug: 'google-professional-ml-engineer',
    title: 'Google Professional Machine Learning Engineer',
    description:
      'All 6 Google Professional ML Engineer practice exams in one bundle — 360 questions covering architecting low-code AI, collaborating across teams, scaling prototypes, serving and scaling models, automating ML pipelines, and monitoring AI solutions.',
    price: 2000,         // $79 — PRACTICE tier
    priceVoucher: 20000, // $200 — VOUCHER tier (covers Google Pro ML Engineer $200 exam fee)
    items: [
      { examSlug: 'google-professional-ml-engineer-p1', tier: 'PRACTICE', position: 1 },
      { examSlug: 'google-professional-ml-engineer-p2', tier: 'PRACTICE', position: 2 },
      { examSlug: 'google-professional-ml-engineer-p3', tier: 'PRACTICE', position: 3 },
      { examSlug: 'google-professional-ml-engineer-p4', tier: 'PRACTICE', position: 4 },
      { examSlug: 'google-professional-ml-engineer-p5', tier: 'PRACTICE', position: 5 },
      { examSlug: 'google-professional-ml-engineer-p6', tier: 'PRACTICE', position: 6 },
      { examSlug: 'google-professional-ml-engineer-p1', tier: 'VOUCHER', position: 7 }
    ]
  },
  {
    slug: 'microsoft-sc-200',
    title: 'Microsoft Security Operations Analyst (SC-200)',
    description:
      'All 3 SC-200 practice exams in one bundle — 195 curated questions covering managing a security operations environment (Defender XDR + Sentinel automation, SIEM platform configuration, data ingestion, and detection engineering), responding to security incidents across Defender XDR and Microsoft Defender for Endpoint, and performing threat hunting with KQL, Sentinel Graph, hunting notebooks, and the Sentinel MCP Server. Aligned to the official Microsoft Security Operations Analyst (SC-200) study guide (skills measured as of April 16, 2026).',
    price: 2000,         // $20 — PRACTICE tier
    priceVoucher: 16500, // $165 — VOUCHER tier (adds real Microsoft SC-200 exam voucher)
    items: [
      { examSlug: 'microsoft-sc-200-p1', tier: 'PRACTICE', position: 1 },
      { examSlug: 'microsoft-sc-200-p2', tier: 'PRACTICE', position: 2 },
      { examSlug: 'microsoft-sc-200-p3', tier: 'PRACTICE', position: 3 },
      { examSlug: 'microsoft-sc-200-p1', tier: 'VOUCHER', position: 4 }
    ]
  },
  // ───── Auto-generated multi-variant cert bundles ─────
  // Each entry follows the same shape: practice tier covers all variants,
  // voucher tier additionally grants a real exam voucher entitlement (which
  // an admin issues later via /admin/vouchers).
  ...buildMultiVariantBundles()
];

// Helper to expand a compact spec into BUNDLES entries with PRACTICE items
// for variants p1..pN plus a single VOUCHER item attached to p1.
function buildMultiVariantBundles(): BundleSeed[] {
  const specs: { slug: string; title: string; description: string; variants: number; price: number; priceVoucher: number }[] = [
    { slug: 'aws-clf-c02', title: 'AWS Certified Cloud Practitioner', description: 'All 6 AWS Certified Cloud Practitioner (CLF-C02) practice exams in one bundle — covering cloud concepts, security & compliance, AWS technology & services, and billing/pricing/support.', variants: 6, price: 2000, priceVoucher: 10000 },
    { slug: 'aws-saa-c03', title: 'AWS Certified Solutions Architect — Associate', description: 'All 6 AWS Certified Solutions Architect Associate (SAA-C03) practice exams in one bundle — covering design of secure, resilient, high-performing, and cost-optimized architectures on AWS.', variants: 6, price: 2000, priceVoucher: 15000 },
    { slug: 'aws-dva-c02', title: 'AWS Certified Developer — Associate', description: 'All 6 AWS Certified Developer Associate (DVA-C02) practice exams in one bundle — covering development with AWS services, security, deployment, and troubleshooting.', variants: 6, price: 2000, priceVoucher: 15000 },
    { slug: 'aws-dop-c02', title: 'AWS Certified DevOps Engineer — Professional', description: 'All 8 AWS Certified DevOps Engineer Professional (DOP-C02) practice exams in one bundle — covering SDLC automation, configuration management, monitoring, incident & event response, security & compliance, and HA/business continuity.', variants: 8, price: 2000, priceVoucher: 30000 },
    { slug: 'aws-aif-c01', title: 'AWS Certified AI Practitioner', description: 'All 7 AWS Certified AI Practitioner (AIF-C01) practice exams in one bundle — covering fundamentals of AI/ML, generative AI on AWS, applications of foundation models, and responsible AI.', variants: 7, price: 2000, priceVoucher: 10000 },
    { slug: 'aws-dea-c01', title: 'AWS Certified Data Engineer — Associate', description: 'All 4 AWS Certified Data Engineer Associate (DEA-C01) practice exams in one bundle — covering data ingestion, data store management, data operations and support, and data security & governance.', variants: 4, price: 2000, priceVoucher: 15000 },
    { slug: 'aws-soa-c03', title: 'AWS Certified CloudOps Engineer — Associate (SOA-C03)', description: 'All 3 SOA-C03 practice exams in one bundle — 195 curated questions covering monitoring, logging, analysis, remediation, and performance optimization (CloudWatch, CloudTrail, EventBridge, Systems Manager); reliability and business continuity (Auto Scaling, ELB, Route 53, AWS Backup, disaster recovery); deployment, provisioning, and automation (CloudFormation, StackSets, EC2 Image Builder, the AWS CDK); security and compliance (IAM, AWS KMS, AWS Config, GuardDuty, Security Hub); and networking and content delivery (VPC, Route 53, CloudFront, AWS Global Accelerator). Aligned to the official AWS Certified CloudOps Engineer - Associate (SOA-C03) exam guide.', variants: 3, price: 2000, priceVoucher: 15000 },
    { slug: 'aws-sap-c02', title: 'AWS Certified Solutions Architect — Professional (SAP-C02)', description: 'All 3 SAP-C02 practice exams in one bundle — 195 curated questions covering designing solutions for organizational complexity (multi-account architecture, hybrid and multi-VPC networking, cross-account security, disaster recovery, cost optimization); designing for new solutions (deployment strategies, business continuity, reliability, performance, security, cost); continuous improvement for existing solutions (operational excellence, security, performance, reliability, cost); and accelerating workload migration and modernization (the 7 Rs, migration tooling, re-architecture, and modernization to serverless and containers). Aligned to the official AWS Certified Solutions Architect - Professional (SAP-C02) exam guide.', variants: 3, price: 2000, priceVoucher: 30000 },
    { slug: 'microsoft-dp-900', title: 'Microsoft Azure Data Fundamentals (DP-900)', description: 'All 4 DP-900 practice exams in one bundle — covering core data concepts, relational and non-relational data, and data analytics on Azure.', variants: 4, price: 2000, priceVoucher: 9900 },
    { slug: 'microsoft-az-104', title: 'Microsoft Azure Administrator (AZ-104)', description: 'All 3 AZ-104 practice exams in one bundle — covering identities & governance, storage, compute, virtual networking, and monitoring & maintenance on Azure.', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-ai-102', title: 'Microsoft Azure AI Engineer Associate (AI-102)', description: 'All 4 AI-102 practice exams in one bundle — covering plan & manage Azure AI solutions, implement decision & language solutions, generative AI solutions, and computer vision.', variants: 4, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-dp-100', title: 'Microsoft Azure Data Scientist Associate (DP-100)', description: 'All 2 DP-100 practice exams in one bundle — covering ML solution design, data exploration & model training, deployment preparation, and model retraining on Azure ML.', variants: 2, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-dp-300', title: 'Microsoft Azure Database Administrator (DP-300)', description: 'All 4 DP-300 practice exams in one bundle — covering planning & implementing data platform resources, implementing secure environments, monitoring & optimization, automation, and HA/DR for Azure SQL.', variants: 4, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-md-102', title: 'Microsoft Endpoint Administrator (MD-102)', description: 'All 3 MD-102 practice exams in one bundle — 195 curated questions covering preparing infrastructure for devices (Microsoft Entra device identity, Intune enrollment, identity & compliance, Windows Hello for Business, Windows LAPS), managing and maintaining devices (Windows Autopilot, configuration profiles, Intune Suite add-ons, remote actions, device query), managing applications (deploy, configure, and protect apps including M365 Apps, app protection policies, and app configuration policies), and protecting devices (endpoint security policies, Microsoft Defender for Endpoint integration, and Windows / iOS / macOS / Android update management). Aligned to the official Microsoft Endpoint Administrator (MD-102) study guide (skills measured as of April 28, 2026).', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-ms-102', title: 'Microsoft 365 Administrator Expert (MS-102)', description: 'All 3 MS-102 practice exams in one bundle — covering deploy & manage a Microsoft 365 tenant, implement & manage Microsoft Entra identity & access, manage security & threats with Defender XDR, and Microsoft Purview compliance.', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-pl-300', title: 'Microsoft Power BI Data Analyst Associate (PL-300)', description: 'All 3 PL-300 practice exams in one bundle — covering preparing the data, modeling the data, visualizing & analyzing the data, and managing & securing Power BI assets, aligned to the official PL-300 study guide.', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-ms-700', title: 'Microsoft Teams Administrator Associate (MS-700)', description: 'All 3 MS-700 practice exams in one bundle — 195 curated questions covering configuring and managing a Microsoft Teams environment (network planning, security & compliance, governance and lifecycle, external and guest collaboration, Teams clients and devices), managing teams / channels / chats / apps, managing meetings and calling including Teams Phone (auto attendants, call queues, phone numbers, policies), and monitoring, reporting on, and troubleshooting Teams. Aligned to the official Managing Microsoft Teams (MS-700) study guide (skills measured as of April 28, 2026).', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'cisco-ccna', title: 'Cisco Certified Network Associate (CCNA)', description: 'All 6 CCNA (200-301) practice exams in one bundle — covering networking fundamentals, IP services, security fundamentals, automation & programmability, and network access.', variants: 6, price: 2000, priceVoucher: 30000 },
    { slug: 'cisco-ccnp-encor', title: 'Cisco CCNP Enterprise Core (ENCOR 350-401)', description: 'All 2 CCNP Enterprise Core (ENCOR 350-401) practice exams in one bundle — covering architecture, virtualization, infrastructure, network assurance, security, and automation.', variants: 2, price: 2000, priceVoucher: 40000 },
    { slug: 'comptia-server-plus', title: 'CompTIA Server+', description: 'All 4 CompTIA Server+ (SK0-005) practice exams in one bundle — covering server hardware install/management, server administration, security & disaster recovery, and troubleshooting.', variants: 4, price: 2000, priceVoucher: 36900 },
    { slug: 'comptia-linux-plus', title: 'CompTIA Linux+', description: 'All 6 CompTIA Linux+ (XK0-005) practice exams in one bundle — covering system management, security, scripting/containers/automation, and troubleshooting.', variants: 6, price: 2000, priceVoucher: 36900 },
    { slug: 'comptia-data-plus', title: 'CompTIA Data+', description: 'All 6 CompTIA Data+ (DA0-001) practice exams in one bundle — covering data concepts, mining, analysis, visualization, and governance/quality/controls.', variants: 6, price: 2000, priceVoucher: 23900 },
    { slug: 'google-ace', title: 'Google Associate Cloud Engineer', description: 'All 2 Associate Cloud Engineer practice exams in one bundle — covering setting up a cloud environment, planning and configuring solutions, deploying and implementing, and ensuring successful operation on Google Cloud.', variants: 2, price: 2000, priceVoucher: 12500 },
    { slug: 'github-foundations', title: 'GitHub Foundations', description: 'All 4 GitHub Foundations practice exams in one bundle — covering GitHub features, repository management, collaboration, GitHub workflows, and GitHub administration.', variants: 4, price: 2000, priceVoucher: 9900 },
    { slug: 'isc2-cissp', title: 'ISC2 CISSP', description: 'All 6 CISSP practice exams in one bundle — covering security & risk management, asset security, security architecture & engineering, communication & network security, identity & access management, security assessment & testing, security operations, and software development security.', variants: 6, price: 2000, priceVoucher: 74900 },
    { slug: 'pmi-pmp', title: 'PMI PMP', description: 'All 6 PMP practice exams in one bundle — covering people, process, and business environment domains of the PMP examination content outline.', variants: 6, price: 2000, priceVoucher: 55500 },
    { slug: 'linuxfoundation-ckad', title: 'Certified Kubernetes Application Developer (CKAD)', description: 'All 3 CKAD practice exams in one bundle — covering application design & build, deployment, observability & maintenance, environment/configuration/security, and services & networking, aligned to CNCF CKAD v1.35.', variants: 3, price: 2000, priceVoucher: 39500 },
    { slug: 'linuxfoundation-cka', title: 'Certified Kubernetes Administrator (CKA)', description: 'All 3 CKA practice exams in one bundle — covering cluster architecture & install (kubeadm, etcd, RBAC, CRDs, CNI), workloads & scheduling, services & networking (Ingress + Gateway API), storage, and troubleshooting. Aligned to CNCF CKA v1.32.', variants: 3, price: 2000, priceVoucher: 39500 },
    { slug: 'hashicorp-terraform-associate', title: 'HashiCorp Certified: Terraform Associate (003)', description: 'All 3 Terraform Associate (003) practice exams in one bundle — covering IaC concepts, Terraform fundamentals & workflow, modules, state management, and reading/generating/modifying configuration. Aligned to the HashiCorp Terraform Associate 003 objectives.', variants: 3, price: 2000, priceVoucher: 7050 },
    { slug: 'docker-dca', title: 'Docker Certified Associate (DCA)', description: 'All 3 Docker Certified Associate practice exams in one bundle — covering orchestration, image creation/management/registry, installation & configuration, networking, security, and storage & volumes. Aligned to the DCA exam domains.', variants: 3, price: 2000, priceVoucher: 19500 },
    { slug: 'redhat-rhcsa-ex200', title: 'Red Hat Certified System Administrator (RHCSA EX200)', description: 'All 3 RHCSA (EX200) practice exams in one bundle — covering essential tools, operating running systems, local storage & file systems, system deployment & maintenance, users & groups, and security. Aligned to the official Red Hat EX200 objectives (RHEL 9).', variants: 3, price: 2000, priceVoucher: 50000 },
    { slug: 'gitlab-certified-associate', title: 'GitLab Certified Associate', description: 'All 3 GitLab Certified Associate practice exams in one bundle — covering Git & GitLab fundamentals, source code management & workflows, CI/CD pipelines, project management & collaboration, and security & compliance basics. Aligned to the GitLab Certified Associate curriculum.', variants: 3, price: 2000, priceVoucher: 9900 },
    { slug: 'elastic-certified-engineer', title: 'Elastic Certified Engineer', description: 'All 3 Elastic Certified Engineer practice exams in one bundle — covering installation & configuration, indexing data, queries, mappings & text analysis, cluster administration, and data processing & aggregations. Aligned to the Elastic Certified Engineer exam objectives.', variants: 3, price: 2000, priceVoucher: 40000 },
    { slug: 'microsoft-az-305', title: 'Microsoft Azure Solutions Architect Expert (AZ-305)', description: 'All 3 AZ-305 practice exams in one bundle — designing identity, governance & monitoring, data storage, business continuity, and infrastructure solutions on Azure.', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-az-204', title: 'Microsoft Azure Developer Associate (AZ-204)', description: 'All 3 AZ-204 practice exams in one bundle — developing Azure compute and storage solutions, implementing security, monitoring & optimizing, and connecting to/consuming Azure and third-party services.', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-sc-900', title: 'Microsoft Security, Compliance, and Identity Fundamentals (SC-900)', description: 'All 3 SC-900 practice exams in one bundle — security/compliance/identity concepts, Microsoft Entra capabilities, Microsoft security solutions, and Microsoft compliance (Purview) solutions.', variants: 3, price: 2000, priceVoucher: 9900 },
    { slug: 'comptia-a-plus', title: 'CompTIA A+ (220-1101 / 220-1102)', description: 'All 3 CompTIA A+ practice exams in one bundle — hardware, networking, mobile & virtualization, operating systems, security, and software/operational troubleshooting across Core 1 and Core 2.', variants: 3, price: 2000, priceVoucher: 26300 },
    { slug: 'comptia-network-plus', title: 'CompTIA Network+ (N10-009)', description: 'All 3 CompTIA Network+ practice exams in one bundle — networking concepts, implementation, operations, security, and troubleshooting.', variants: 3, price: 2000, priceVoucher: 36900 },
    { slug: 'comptia-security-plus', title: 'CompTIA Security+ (SY0-701)', description: 'All 3 CompTIA Security+ practice exams in one bundle — general security concepts, threats/vulnerabilities/mitigations, security architecture, security operations, and security program management & oversight.', variants: 3, price: 2000, priceVoucher: 40400 },
    { slug: 'google-professional-cloud-architect', title: 'Google Professional Cloud Architect', description: 'All 3 Professional Cloud Architect practice exams in one bundle — designing & planning architecture, managing & provisioning infrastructure, security & compliance, optimizing processes, managing implementation, and operational reliability on Google Cloud.', variants: 3, price: 2000, priceVoucher: 20000 },
    { slug: 'google-professional-data-engineer', title: 'Google Professional Data Engineer', description: 'All 3 Professional Data Engineer practice exams in one bundle — designing data processing systems, ingesting & processing data, storing data, preparing & using data for analysis, and maintaining & automating data workloads on Google Cloud.', variants: 3, price: 2000, priceVoucher: 20000 },
    { slug: 'isc2-ccsp', title: 'ISC2 CCSP', description: 'All 3 CCSP practice exams in one bundle — cloud concepts/architecture/design, cloud data security, cloud platform & infrastructure security, cloud application security, cloud security operations, and legal/risk/compliance.', variants: 3, price: 2000, priceVoucher: 59900 },
    { slug: 'linuxfoundation-cks', title: 'Certified Kubernetes Security Specialist (CKS)', description: 'All 3 CKS practice exams in one bundle — cluster setup, cluster hardening, system hardening, minimizing microservice vulnerabilities, supply chain security, and monitoring/logging/runtime security. Aligned to CNCF CKS v1.32.', variants: 3, price: 2000, priceVoucher: 44500 },
    { slug: 'pmi-capm', title: 'PMI CAPM', description: 'All 3 CAPM practice exams in one bundle — project management fundamentals & core concepts, predictive plan-based methodologies, agile frameworks/methodologies, and business analysis frameworks.', variants: 3, price: 2000, priceVoucher: 30000 },
    { slug: 'scrum-org-pspo-i', title: 'Professional Scrum Product Owner I (PSPO I)', description: 'All 3 PSPO I practice exams in one bundle — the Scrum framework, product value & vision, Product Backlog management, stakeholders & customers, and empiricism/agility, grounded in the Scrum Guide.', variants: 3, price: 2000, priceVoucher: 20000 },
    // ───── Wave 3b: competitor-parity new certs (65 Q/variant × 3) ─────
    { slug: 'axelos-itil4-foundation', title: 'ITIL 4 Foundation', description: 'All 4 ITIL 4 Foundation practice exams in one bundle — key concepts of service management, the four dimensions & guiding principles, the service value system & value chain, and the ITIL practices. Aligned to the ITIL 4 Foundation syllabus.', variants: 4, price: 2000, priceVoucher: 38000 },
    { slug: 'tableau-desktop-specialist', title: 'Tableau Desktop Specialist', description: 'All 3 Tableau Desktop Specialist practice exams in one bundle — connecting to & preparing data, exploring & analyzing data, sharing insights, and understanding Tableau concepts.', variants: 3, price: 2000, priceVoucher: 10000 },
    { slug: 'iassc-lean-six-sigma-green-belt', title: 'IASSC Lean Six Sigma Green Belt', description: 'All 3 IASSC Lean Six Sigma Green Belt practice exams in one bundle — covering the Define, Measure, Analyze, Improve, and Control phases of the DMAIC methodology. Aligned to the IASSC Green Belt body of knowledge.', variants: 3, price: 2000, priceVoucher: 29500 },
    { slug: 'comptia-pentest-plus', title: 'CompTIA PenTest+ (PT0-003)', description: 'All 3 CompTIA PenTest+ practice exams in one bundle — engagement management, reconnaissance & enumeration, vulnerability discovery & analysis, attacks & exploits, and post-exploitation & lateral movement.', variants: 3, price: 2000, priceVoucher: 41200 },
    { slug: 'comptia-securityx', title: 'CompTIA SecurityX (CAS-005)', description: 'All 3 CompTIA SecurityX (CASP+) practice exams in one bundle — governance/risk & compliance, security architecture, security engineering, and security operations.', variants: 3, price: 2000, priceVoucher: 52400 },
    { slug: 'isc2-cc', title: 'ISC2 Certified in Cybersecurity (CC)', description: 'All 3 ISC2 CC practice exams in one bundle — security principles, business continuity/DR & incident response, access controls concepts, network security, and security operations.', variants: 3, price: 2000, priceVoucher: 5000 },
    { slug: 'microsoft-sc-300', title: 'Microsoft Identity and Access Administrator (SC-300)', description: 'All 3 SC-300 practice exams in one bundle — implementing identities in Microsoft Entra, authentication & access management, access management for applications, and identity governance.', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-pl-900', title: 'Microsoft Power Platform Fundamentals (PL-900)', description: 'All 3 PL-900 practice exams in one bundle — Power Platform business value, core components, Power Apps, Power Automate, Power BI, and Power Pages & Copilot Studio.', variants: 3, price: 2000, priceVoucher: 9900 },
    { slug: 'cisco-devnet-associate-200-901', title: 'Cisco DevNet Associate (200-901 DEVASC)', description: 'All 3 Cisco DevNet Associate practice exams in one bundle — software development & design, understanding & using APIs, Cisco platforms & development, application deployment & security, infrastructure & automation, and network fundamentals.', variants: 3, price: 2000, priceVoucher: 30000 },
    { slug: 'linuxfoundation-kcna', title: 'Kubernetes and Cloud Native Associate (KCNA)', description: 'All 3 KCNA practice exams in one bundle — Kubernetes fundamentals, container orchestration, cloud native architecture, cloud native observability, and cloud native application delivery. Aligned to the CNCF KCNA curriculum.', variants: 3, price: 2000, priceVoucher: 25000 },
    { slug: 'hashicorp-vault-associate', title: 'HashiCorp Certified: Vault Associate (002)', description: 'All 3 Vault Associate (002) practice exams in one bundle — Vault architecture, authentication & authorization, secrets engines, Vault policies, tokens, and encryption as a service. Aligned to the HashiCorp Vault Associate 002 objectives.', variants: 3, price: 2000, priceVoucher: 7050 },
    { slug: 'pmi-acp', title: 'PMI Agile Certified Practitioner (PMI-ACP)', description: 'All 3 PMI-ACP practice exams in one bundle — agile principles & mindset, value-driven delivery, stakeholder engagement, team performance, adaptive planning, problem detection & resolution, and continuous improvement.', variants: 3, price: 2000, priceVoucher: 50500 },
    // ───── Wave 3c: competitor-parity new certs (65 Q/variant × 3) ─────
    { slug: 'microsoft-sc-100', title: 'Microsoft Cybersecurity Architect Expert (SC-100)', description: 'All 3 SC-100 practice exams in one bundle — designing solutions aligned with security best practices; security operations, identity & compliance capabilities; and security solutions for infrastructure, applications & data.', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-dp-600', title: 'Microsoft Fabric Analytics Engineer (DP-600)', description: 'All 3 DP-600 practice exams in one bundle — planning & managing a data analytics solution, preparing & serving data, implementing & managing semantic models, and exploring & analyzing data in Microsoft Fabric.', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'microsoft-pl-600', title: 'Microsoft Power Platform Solution Architect (PL-600)', description: 'All 3 PL-600 practice exams in one bundle — solution envisioning & requirement analysis, architecting a solution, and implementing the solution on Power Platform.', variants: 3, price: 2000, priceVoucher: 16500 },
    { slug: 'google-professional-cloud-devops-engineer', title: 'Google Professional Cloud DevOps Engineer', description: 'All 3 Professional Cloud DevOps Engineer practice exams in one bundle — bootstrapping & managing a Google Cloud organization, CI/CD pipelines, SRE practices, observability, and optimizing service performance.', variants: 3, price: 2000, priceVoucher: 20000 },
    { slug: 'google-professional-cloud-network-engineer', title: 'Google Professional Cloud Network Engineer', description: 'All 3 Professional Cloud Network Engineer practice exams in one bundle — designing & planning a network, implementing VPCs, configuring network services, hybrid interconnectivity, and managing/monitoring network operations on Google Cloud.', variants: 3, price: 2000, priceVoucher: 20000 },
    { slug: 'cisco-ccnp-security-350-701', title: 'Cisco CCNP Security (SCOR 350-701)', description: 'All 3 CCNP Security (SCOR 350-701) practice exams in one bundle — security concepts, network security, securing the cloud, content security, endpoint protection & detection, and secure network access/visibility/enforcement.', variants: 3, price: 2000, priceVoucher: 40000 },
    { slug: 'comptia-project-plus', title: 'CompTIA Project+ (PK0-005)', description: 'All 3 CompTIA Project+ (PK0-005) practice exams in one bundle — project management concepts, project life cycle phases, tools & documentation, and basics of IT & governance.', variants: 3, price: 2000, priceVoucher: 25000 },
    { slug: 'oracle-java-se-17-1z0-829', title: 'Oracle Certified Professional: Java SE 17 Developer (1Z0-829)', description: 'All 3 Java SE 17 Developer (1Z0-829) practice exams in one bundle — the Java object-oriented approach, program flow, generics & collections, streams & lambdas, exceptions, the module system, concurrency, JDBC, and localization.', variants: 3, price: 2000, priceVoucher: 24500 },
    { slug: 'oracle-oci-foundations', title: 'Oracle Cloud Infrastructure Foundations Associate (1Z0-1085)', description: 'All 3 OCI Foundations Associate (1Z0-1085) practice exams in one bundle — OCI introduction, identity & access management, networking, compute, storage, and security & observability. Aligned to the official 1Z0-1085 exam objectives.', variants: 3, price: 2000, priceVoucher: 12500 },
    { slug: 'isc2-sscp', title: 'ISC2 SSCP', description: 'All 3 SSCP practice exams in one bundle — security operations & administration, access controls, risk identification/monitoring/analysis, incident response & recovery, cryptography, network & communications security, and systems & application security.', variants: 3, price: 2000, priceVoucher: 28900 },
    { slug: 'pmi-rmp', title: 'PMI Risk Management Professional (PMI-RMP)', description: 'All 3 PMI-RMP practice exams in one bundle — risk strategy & planning, risk identification, risk analysis, risk response, and monitor & close risks.', variants: 3, price: 2000, priceVoucher: 52000 },
    { slug: 'linuxfoundation-kcsa', title: 'Kubernetes and Cloud Native Security Associate (KCSA)', description: 'All 3 KCSA practice exams in one bundle — overview of cloud native security, Kubernetes cluster component security, Kubernetes security fundamentals, the Kubernetes threat model, platform security, and compliance & security frameworks. Aligned to the CNCF KCSA curriculum.', variants: 3, price: 2000, priceVoucher: 25000 },
    { slug: 'hashicorp-consul-associate', title: 'HashiCorp Certified: Consul Associate (003)', description: 'All 3 Consul Associate (003) practice exams in one bundle — Consul architecture, deployment, service discovery & registration, service mesh, network infrastructure automation, and Consul security. Aligned to the HashiCorp Consul Associate 003 objectives.', variants: 3, price: 2000, priceVoucher: 7050 }
  ];

  const out: BundleSeed[] = specs.map(s => {
    const items: BundleSeed['items'] = [];
    for (let i = 1; i <= s.variants; i++) {
      items.push({ examSlug: `${s.slug}-p${i}`, tier: 'PRACTICE', position: i });
    }
    items.push({ examSlug: `${s.slug}-p1`, tier: 'VOUCHER', position: s.variants + 1 });
    return {
      slug: s.slug, title: s.title, description: s.description,
      price: s.price, priceVoucher: s.priceVoucher, items
    };
  });

  // The microsoft-ai-102 bundle ALSO bundles the two non-pN orphan shells
  // (microsoft-ai-102-official and microsoft-ai-102-practice). Fold them in
  // as PRACTICE items so a single bundle purchase grants access to all 6.
  const ai102 = out.find(b => b.slug === 'microsoft-ai-102');
  if (ai102) {
    const nextPos = ai102.items.reduce((m, i) => Math.max(m, i.position ?? 0), 0) + 1;
    ai102.items.push({ examSlug: 'microsoft-ai-102-practice', tier: 'PRACTICE', position: nextPos });
    ai102.items.push({ examSlug: 'microsoft-ai-102-official', tier: 'PRACTICE', position: nextPos + 1 });
  }

  // 3 additional bundles whose variant slugs do NOT follow the -pN pattern
  // (CompTIA Cloud+ uses -practice-N, DP-203 mixes -pN and -practice-N,
  // MLA-C01 has the base shell + one P-variant).
  out.push({
    slug: 'comptia-cloud-plus',
    title: 'CompTIA Cloud+',
    description: 'All 5 CompTIA Cloud+ (CV0-004) practice exams in one bundle — covering cloud architecture & design, deployment, operations & support, and troubleshooting.',
    price: 2000, priceVoucher: 36900,
    items: [
      { examSlug: 'comptia-cloud-plus-practice-1', tier: 'PRACTICE', position: 1 },
      { examSlug: 'comptia-cloud-plus-practice-5', tier: 'PRACTICE', position: 2 },
      { examSlug: 'comptia-cloud-plus-practice-6', tier: 'PRACTICE', position: 3 },
      { examSlug: 'comptia-cloud-plus-practice-7', tier: 'PRACTICE', position: 4 },
      { examSlug: 'comptia-cloud-plus-practice-8', tier: 'PRACTICE', position: 5 },
      { examSlug: 'comptia-cloud-plus-practice-1', tier: 'VOUCHER', position: 6 }
    ]
  });
  out.push({
    slug: 'microsoft-dp-203',
    title: 'Microsoft Azure Data Engineer Associate (DP-203)',
    description: 'All 2 DP-203 practice exams in one bundle — covering designing & implementing data storage, data processing, security, monitoring, and optimization for Azure data engineering workloads.',
    price: 2000, priceVoucher: 16500,
    items: [
      { examSlug: 'microsoft-dp-203-p1', tier: 'PRACTICE', position: 1 },
      { examSlug: 'microsoft-dp-203-practice-6', tier: 'PRACTICE', position: 2 },
      { examSlug: 'microsoft-dp-203-p1', tier: 'VOUCHER', position: 3 }
    ]
  });
  out.push({
    slug: 'aws-mla-c01',
    title: 'AWS Certified Machine Learning Engineer — Associate',
    description: 'All AWS Certified ML Engineer Associate (MLA-C01) practice exams in one bundle — covering data preparation for ML, ML model development, deployment & orchestration, and ML solution monitoring & maintenance.',
    price: 2000, priceVoucher: 15000,
    items: [
      { examSlug: 'aws-mla-c01',    tier: 'PRACTICE', position: 1 },
      { examSlug: 'aws-mla-c01-p1', tier: 'PRACTICE', position: 2 },
      { examSlug: 'aws-mla-c01',    tier: 'VOUCHER', position: 3 }
    ]
  });
  return out;
}

const EXAMS: ExamSeed[] = [
  // ───── AWS ─────
  {
    vendorSlug: 'aws', slug: 'aws-clf-c02', code: 'CLF-C02',
    title: 'AWS Certified Cloud Practitioner',
    description: 'Foundational AWS certification covering the value of the AWS Cloud, the shared responsibility model, the Well-Architected Framework, security best practices, AWS pricing and billing economics, and core services across compute, networking, database, and storage. Available in-person at AWS-authorized testing centers or online via remote proctoring. Real exam fee is USD 100 (voucher).',
    level: 'Foundational', durationMinutes: 90, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Cloud Concepts', weight: 24 },
      { name: 'Security and Compliance', weight: 30 },
      { name: 'Cloud Technology and Services', weight: 34 },
      { name: 'Billing, Pricing, and Support', weight: 12 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-dva-c02', code: 'DVA-C02',
    title: 'AWS Certified Developer — Associate',
    description: 'Develop, deploy, and debug cloud-based applications using AWS services. Real exam fee is USD 150 (voucher).',
    level: 'Associate', durationMinutes: 130, passingScore: 72, questionCount: 65,
    domains: [
      { name: 'Development with AWS Services', weight: 32 },
      { name: 'Security', weight: 26 },
      { name: 'Deployment', weight: 24 },
      { name: 'Troubleshooting and Optimization', weight: 18 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-soa-c03', code: 'SOA-C03',
    title: 'AWS Certified CloudOps Engineer — Associate',
    description: 'Deploy, manage, and operate workloads on AWS following the Well-Architected Framework. Covers monitoring, logging, remediation, performance optimisation, reliability and business continuity, deployment provisioning and automation, security and compliance, and networking. Replaces the SysOps Administrator (SOA-C02) exam. Real exam fee is USD 150 (voucher).',
    level: 'Associate', durationMinutes: 130, passingScore: 72, questionCount: 65,
    domains: [
      { name: 'Monitoring, Logging, Analysis, Remediation, and Performance Optimization', weight: 22 },
      { name: 'Reliability and Business Continuity', weight: 22 },
      { name: 'Deployment, Provisioning, and Automation', weight: 22 },
      { name: 'Security and Compliance', weight: 16 },
      { name: 'Networking and Content Delivery', weight: 18 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-dea-c01', code: 'DEA-C01',
    title: 'AWS Certified Data Engineer — Associate',
    description: 'Build and maintain data pipelines, manage data stores, and operate, monitor, and secure data workloads on AWS. Covers Kinesis, Glue, EMR, Redshift, DynamoDB, Lake Formation, and the broader analytics stack. Real exam fee is USD 150 (voucher).',
    level: 'Associate', durationMinutes: 130, passingScore: 72, questionCount: 65,
    domains: [
      { name: 'Data Ingestion and Transformation', weight: 34 },
      { name: 'Data Store Management', weight: 26 },
      { name: 'Data Operations and Support', weight: 22 },
      { name: 'Data Security and Governance', weight: 18 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-sap-c02', code: 'SAP-C02',
    title: 'AWS Certified Solutions Architect — Professional',
    description: 'Advanced architectural design across complex AWS environments.',
    level: 'Professional', durationMinutes: 180, passingScore: 75, questionCount: 65,
    domains: [
      { name: 'Design Solutions for Organizational Complexity', weight: 26 },
      { name: 'Design for New Solutions', weight: 29 },
      { name: 'Continuous Improvement for Existing Solutions', weight: 25 },
      { name: 'Accelerate Workload Migration and Modernization', weight: 20 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-dop-c02', code: 'DOP-C02',
    title: 'AWS Certified DevOps Engineer — Professional',
    description: 'Implement and manage continuous delivery systems and methodologies on AWS — CI/CD pipelines, infrastructure as code, monitoring, incident response, and security automation. Real exam fee is USD 300 (voucher).',
    level: 'Professional', durationMinutes: 180, passingScore: 75, questionCount: 75,
    domains: [
      { name: 'SDLC Automation', weight: 22 },
      { name: 'Configuration Management and IaC', weight: 17 },
      { name: 'Resilient Cloud Solutions', weight: 15 },
      { name: 'Monitoring and Logging', weight: 15 },
      { name: 'Incident and Event Response', weight: 14 },
      { name: 'Security and Compliance', weight: 17 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-scs-c03', code: 'SCS-C03',
    title: 'AWS Certified Security — Specialty',
    description: 'Validate expertise in securing AWS workloads — detection, incident response, infrastructure security, identity and access management, data protection, and security governance. Targets candidates with 3–5 years of cloud security experience. Real exam fee is USD 300 (voucher).',
    level: 'Specialty', durationMinutes: 170, passingScore: 75, questionCount: 65,
    domains: [
      { name: 'Detection', weight: 16 },
      { name: 'Incident Response', weight: 14 },
      { name: 'Infrastructure Security', weight: 18 },
      { name: 'Identity and Access Management', weight: 20 },
      { name: 'Data Protection', weight: 18 },
      { name: 'Security Foundations and Governance', weight: 14 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-aif-c01', code: 'AIF-C01',
    title: 'AWS Certified AI Practitioner',
    description: 'Foundational understanding of AI, ML, and generative AI concepts on AWS.',
    level: 'Foundational', durationMinutes: 90, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Fundamentals of AI and ML', weight: 20 },
      { name: 'Fundamentals of Generative AI', weight: 24 },
      { name: 'Applications of Foundation Models', weight: 28 },
      { name: 'Guidelines for Responsible AI', weight: 14 },
      { name: 'Security, Compliance, and Governance for AI Solutions', weight: 14 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-saa-c03', code: 'SAA-C03',
    title: 'AWS Certified Solutions Architect — Associate',
    description: 'Design solutions on AWS based on the Well-Architected Framework — secure, resilient, high-performing, and cost-optimised architectures. Targets candidates with at least 1 year of hands-on AWS design experience. Real exam fee is USD 150 (voucher).',
    level: 'Associate', durationMinutes: 130, passingScore: 72, questionCount: 65,
    domains: [
      { name: 'Design Secure Architectures', weight: 30 },
      { name: 'Design Resilient Architectures', weight: 26 },
      { name: 'Design High-Performing Architectures', weight: 24 },
      { name: 'Design Cost-Optimized Architectures', weight: 20 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-mla-c01', code: 'MLA-C01',
    title: 'AWS Certified Machine Learning Engineer — Associate',
    description: 'Build, operationalise, deploy, and maintain ML solutions and pipelines on AWS — data preparation, model development, deployment and orchestration, monitoring, maintenance, and security. Targets ML engineers with at least 1 year of hands-on SageMaker experience. Real exam fee is USD 150 (voucher).',
    level: 'Associate', durationMinutes: 130, passingScore: 72, questionCount: 65,
    domains: [
      { name: 'Data Preparation for Machine Learning (ML)', weight: 28 },
      { name: 'ML Model Development', weight: 26 },
      { name: 'Deployment and Orchestration of ML Workflows', weight: 22 },
      { name: 'ML Solution Monitoring, Maintenance, and Security', weight: 24 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-aip-c01', code: 'AIP-C01',
    title: 'AWS Certified Generative AI Developer — Professional',
    description: 'Integrate foundation models into applications and business workflows on AWS — vector stores, RAG, agentic AI, prompt engineering, AI safety and governance, performance and cost optimisation. Targets GenAI developers with 1+ year hands-on GenAI experience. Real exam fee is USD 300 (voucher).',
    level: 'Professional', durationMinutes: 180, passingScore: 75, questionCount: 75,
    domains: [
      { name: 'Foundation Model Integration, Data Management, and Compliance', weight: 31 },
      { name: 'Implementation and Integration', weight: 26 },
      { name: 'AI Safety, Security, and Governance', weight: 20 },
      { name: 'Operational Efficiency and Optimization for GenAI Applications', weight: 12 },
      { name: 'Testing, Validation, and Troubleshooting', weight: 11 }
    ]
  },
  {
    vendorSlug: 'aws', slug: 'aws-ans-c01', code: 'ANS-C01',
    title: 'AWS Certified Advanced Networking — Specialty',
    description: 'Design, implement, manage, and secure AWS and hybrid network architectures at scale. Targets candidates with 5+ years of networking experience and 2+ years cloud/hybrid networking. Real exam fee is USD 300 (voucher).',
    level: 'Specialty', durationMinutes: 170, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Network Design', weight: 30 },
      { name: 'Network Implementation', weight: 26 },
      { name: 'Network Management and Operation', weight: 20 },
      { name: 'Network Security, Compliance, and Governance', weight: 24 }
    ]
  },

  // ───── Microsoft ─────
  {
    vendorSlug: 'microsoft', slug: 'microsoft-az-900', code: 'AZ-900',
    title: 'Microsoft Azure Fundamentals',
    description: 'Practice questions covering core Azure concepts, services, governance, and pricing.',
    level: 'Foundational', durationMinutes: 60, passingScore: 70, questionCount: 40,
    // Aligned to MS Learn AZ-900 study guide ranges (verified 2026-05-20):
    //   Cloud concepts 25–30 | Architecture 35–40 | Mgmt/governance 30–35
    domains: [
      { name: 'Cloud concepts', weight: 28 },
      { name: 'Azure architecture and services', weight: 40 },
      { name: 'Azure management and governance', weight: 32 }
    ]
  },
  {
    vendorSlug: 'microsoft', slug: 'microsoft-az-104', code: 'AZ-104',
    title: 'Microsoft Azure Administrator',
    description: 'Implement, manage, and monitor identity, governance, storage, compute, and virtual networks.',
    level: 'Associate', durationMinutes: 100, passingScore: 70, questionCount: 50,
    domains: [
      { name: 'Manage Azure identities and governance', weight: 22 },
      { name: 'Implement and manage storage', weight: 17 },
      { name: 'Deploy and manage Azure compute resources', weight: 22 },
      { name: 'Implement and manage virtual networking', weight: 17 },
      { name: 'Monitor and maintain Azure resources', weight: 22 }
    ]
  },
  {
    vendorSlug: 'microsoft', slug: 'microsoft-az-204', code: 'AZ-204',
    title: 'Developing Solutions for Microsoft Azure',
    description: 'Design, build, test, and maintain cloud applications and services on Azure.',
    level: 'Associate', durationMinutes: 100, passingScore: 70, questionCount: 50,
    domains: [
      { name: 'Develop Azure compute solutions', weight: 27 },
      { name: 'Develop for Azure storage', weight: 17 },
      { name: 'Implement Azure security', weight: 22 },
      { name: 'Monitor, troubleshoot, and optimize solutions', weight: 17 },
      { name: 'Connect to and consume Azure services', weight: 17 }
    ]
  },
  {
    vendorSlug: 'microsoft', slug: 'microsoft-az-305', code: 'AZ-305',
    title: 'Designing Microsoft Azure Infrastructure Solutions',
    description: 'Design identity, governance, monitoring, data, business continuity, and infrastructure solutions.',
    level: 'Expert', durationMinutes: 100, passingScore: 70, questionCount: 50,
    domains: [
      { name: 'Design identity, governance, and monitoring solutions', weight: 27 },
      { name: 'Design data storage solutions', weight: 27 },
      { name: 'Design business continuity solutions', weight: 13 },
      { name: 'Design infrastructure solutions', weight: 33 }
    ]
  },
  {
    vendorSlug: 'microsoft', slug: 'microsoft-az-400', code: 'AZ-400',
    title: 'Designing and Implementing Microsoft DevOps Solutions',
    description: 'Combine people, processes, and technologies to continuously deliver products and services.',
    level: 'Expert', durationMinutes: 100, passingScore: 70, questionCount: 50,
    domains: [
      { name: 'Configure processes and communications', weight: 12 },
      { name: 'Design and implement source control', weight: 17 },
      { name: 'Design and implement build and release pipelines', weight: 42 },
      { name: 'Develop a security and compliance plan', weight: 14 },
      { name: 'Implement an instrumentation strategy', weight: 15 }
    ]
  },
  {
    vendorSlug: 'microsoft', slug: 'microsoft-az-500', code: 'AZ-500',
    title: 'Microsoft Azure Security Technologies',
    description: 'Implement security controls, identity and access, platform protection, and security operations.',
    level: 'Associate', durationMinutes: 100, passingScore: 70, questionCount: 50,
    domains: [
      { name: 'Manage identity and access', weight: 27 },
      { name: 'Secure networking', weight: 22 },
      { name: 'Secure compute, storage, and databases', weight: 22 },
      { name: 'Manage security operations', weight: 29 }
    ]
  },
  {
    vendorSlug: 'microsoft', slug: 'microsoft-ai-900', code: 'AI-900',
    title: 'Microsoft Azure AI Fundamentals',
    description: 'Introduction to AI concepts and Azure services for ML, computer vision, NLP, and generative AI.',
    level: 'Foundational', durationMinutes: 60, passingScore: 70, questionCount: 65,
    // Aligned to MS Learn AI-900 study guide ranges (verified 2026-05-20).
    // Note: GenAI is 28% (3pp above the 20-25% range) to fit a clean 17 Q per
    // variant; MS Learn has been continually bumping GenAI up so this errs
    // safely in their indicated direction.
    domains: [
      { name: 'Describe Artificial Intelligence workloads and considerations', weight: 18 },
      { name: 'Describe fundamental principles of machine learning on Azure', weight: 18 },
      { name: 'Describe features of computer vision workloads on Azure', weight: 18 },
      { name: 'Describe features of Natural Language Processing (NLP) workloads on Azure', weight: 18 },
      { name: 'Describe features of generative AI workloads on Azure', weight: 28 }
    ]
  },
  {
    vendorSlug: 'microsoft', slug: 'microsoft-dp-900', code: 'DP-900',
    title: 'Microsoft Azure Data Fundamentals',
    description: 'Core data concepts and how they are implemented using Azure data services.',
    level: 'Foundational', durationMinutes: 60, passingScore: 70, questionCount: 40,
    // Aligned to MS Learn DP-900 study guide ranges (verified 2026-05-20):
    //   Core 25–30 | Relational 20–25 | Non-relational 15–20 | Analytics 25–30
    // D4 was renamed from "Analytics workloads on Azure" → "Describe an analytics workload".
    domains: [
      { name: 'Describe core data concepts', weight: 28 },
      { name: 'Identify considerations for relational data on Azure', weight: 22 },
      { name: 'Describe considerations for non-relational data on Azure', weight: 20 },
      { name: 'Describe an analytics workload', weight: 30 }
    ]
  },
  {
    vendorSlug: 'microsoft', slug: 'microsoft-ms-900', code: 'MS-900',
    title: 'Microsoft 365 Fundamentals',
    description: 'Cloud concepts and Microsoft 365 services, security, compliance, privacy, pricing, and support.',
    level: 'Foundational', durationMinutes: 60, passingScore: 70, questionCount: 40,
    domains: [
      { name: 'Cloud concepts', weight: 12 },
      { name: 'Microsoft 365 apps and services', weight: 32 },
      { name: 'Security, compliance, privacy, and trust in Microsoft 365', weight: 34 },
      { name: 'Microsoft 365 pricing, licensing, and support', weight: 22 }
    ]
  },
  {
    vendorSlug: 'microsoft', slug: 'microsoft-sc-900', code: 'SC-900',
    title: 'Microsoft Security, Compliance, and Identity Fundamentals',
    description: 'Foundational concepts of security, compliance, and identity across Microsoft solutions.',
    level: 'Foundational', durationMinutes: 60, passingScore: 70, questionCount: 40,
    domains: [
      { name: 'Concepts of security, compliance, and identity', weight: 12 },
      { name: 'Capabilities of Microsoft Entra', weight: 27 },
      { name: 'Capabilities of Microsoft security solutions', weight: 38 },
      { name: 'Capabilities of Microsoft compliance solutions', weight: 23 }
    ]
  },

  // ───── CompTIA ─────
  {
    vendorSlug: 'comptia', slug: 'comptia-a-220-1101', code: '220-1101',
    title: 'CompTIA A+ Core 1',
    description: 'Mobile devices, networking technology, hardware, virtualization and cloud, and hardware/network troubleshooting.',
    level: 'Foundational', durationMinutes: 90, passingScore: 75, questionCount: 90,
    domains: [
      { name: 'Mobile Devices', weight: 15 },
      { name: 'Networking', weight: 20 },
      { name: 'Hardware', weight: 25 },
      { name: 'Virtualization and Cloud Computing', weight: 11 },
      { name: 'Hardware and Network Troubleshooting', weight: 29 }
    ]
  },
  {
    vendorSlug: 'comptia', slug: 'comptia-a-220-1102', code: '220-1102',
    title: 'CompTIA A+ Core 2',
    description: 'Operating systems, security, software troubleshooting, and operational procedures.',
    level: 'Foundational', durationMinutes: 90, passingScore: 78, questionCount: 90,
    domains: [
      { name: 'Operating Systems', weight: 31 },
      { name: 'Security', weight: 25 },
      { name: 'Software Troubleshooting', weight: 22 },
      { name: 'Operational Procedures', weight: 22 }
    ]
  },
  {
    vendorSlug: 'comptia', slug: 'comptia-network-n10-009', code: 'N10-009',
    title: 'CompTIA Network+',
    description: 'Networking concepts, implementation, operations, security, and troubleshooting.',
    level: 'Associate', durationMinutes: 90, passingScore: 80, questionCount: 90,
    domains: [
      { name: 'Networking Concepts', weight: 23 },
      { name: 'Network Implementation', weight: 20 },
      { name: 'Network Operations', weight: 19 },
      { name: 'Network Security', weight: 14 },
      { name: 'Network Troubleshooting', weight: 24 }
    ]
  },
  {
    vendorSlug: 'comptia', slug: 'comptia-security-sy0-701', code: 'SY0-701',
    title: 'CompTIA Security+',
    description: 'Foundational cybersecurity skills: threats, architecture, operations, and program management.',
    level: 'Associate', durationMinutes: 90, passingScore: 83, questionCount: 90,
    domains: [
      { name: 'General Security Concepts', weight: 12 },
      { name: 'Threats, Vulnerabilities, and Mitigations', weight: 22 },
      { name: 'Security Architecture', weight: 18 },
      { name: 'Security Operations', weight: 28 },
      { name: 'Security Program Management and Oversight', weight: 20 }
    ]
  },
  {
    vendorSlug: 'comptia', slug: 'comptia-cysa-cs0-003', code: 'CS0-003',
    title: 'CompTIA CySA+',
    description: 'Continuous security monitoring through behavioral analytics, threat hunting, and incident response.',
    level: 'Professional', durationMinutes: 165, passingScore: 83, questionCount: 85,
    domains: [
      { name: 'Security Operations', weight: 33 },
      { name: 'Vulnerability Management', weight: 30 },
      { name: 'Incident Response and Management', weight: 20 },
      { name: 'Reporting and Communication', weight: 17 }
    ]
  },

  // ───── Cisco ─────
  {
    vendorSlug: 'cisco', slug: 'cisco-ccna-200-301', code: '200-301',
    title: 'Cisco Certified Network Associate (CCNA)',
    description: 'Networking fundamentals, IP services, security, automation, and programmability.',
    level: 'Associate', durationMinutes: 120, passingScore: 82, questionCount: 110,
    domains: [
      { name: 'Network Fundamentals', weight: 20 },
      { name: 'Network Access', weight: 20 },
      { name: 'IP Connectivity', weight: 25 },
      { name: 'IP Services', weight: 10 },
      { name: 'Security Fundamentals', weight: 15 },
      { name: 'Automation and Programmability', weight: 10 }
    ]
  },
  {
    vendorSlug: 'cisco', slug: 'cisco-ccnp-encor-350-401', code: '350-401',
    title: 'Implementing Cisco Enterprise Network Core Technologies (ENCOR)',
    description: 'Core enterprise networking: architecture, virtualization, infrastructure, security, and automation.',
    level: 'Professional', durationMinutes: 120, passingScore: 82, questionCount: 100,
    domains: [
      { name: 'Architecture', weight: 15 },
      { name: 'Virtualization', weight: 10 },
      { name: 'Infrastructure', weight: 30 },
      { name: 'Network Assurance', weight: 10 },
      { name: 'Security', weight: 20 },
      { name: 'Automation', weight: 15 }
    ]
  },
  {
    vendorSlug: 'cisco', slug: 'cisco-cyberops-200-201', code: '200-201',
    title: 'Cisco Certified CyberOps Associate (CBROPS)',
    description: 'Security concepts, monitoring, host-based and network analysis, policies and procedures.',
    level: 'Associate', durationMinutes: 120, passingScore: 80, questionCount: 100,
    domains: [
      { name: 'Security Concepts', weight: 20 },
      { name: 'Security Monitoring', weight: 25 },
      { name: 'Host-Based Analysis', weight: 20 },
      { name: 'Network Intrusion Analysis', weight: 20 },
      { name: 'Security Policies and Procedures', weight: 15 }
    ]
  },

  // ───── Oracle ─────
  {
    vendorSlug: 'oracle', slug: 'oracle-oci-foundations-1z0-1085', code: '1Z0-1085-25',
    title: 'Oracle Cloud Infrastructure Foundations Associate',
    description: 'Fundamental concepts of Oracle Cloud Infrastructure: identity, compute, storage, networking, and security.',
    level: 'Foundational', durationMinutes: 60, passingScore: 65, questionCount: 40,
    domains: [
      { name: 'OCI Introduction', weight: 15 },
      { name: 'OCI Identity and Access Management', weight: 20 },
      { name: 'Networking', weight: 20 },
      { name: 'Compute', weight: 15 },
      { name: 'Storage', weight: 15 },
      { name: 'Security and Observability', weight: 15 }
    ]
  },
  {
    vendorSlug: 'oracle', slug: 'oracle-oci-architect-associate-1z0-1072', code: '1Z0-1072-25',
    title: 'Oracle Cloud Infrastructure Architect Associate',
    description: 'Design and implement OCI workloads with networking, compute, storage, identity, security, and HA/DR.',
    level: 'Associate', durationMinutes: 90, passingScore: 65, questionCount: 60,
    domains: [
      { name: 'Identity and Access Management', weight: 15 },
      { name: 'Networking', weight: 25 },
      { name: 'Compute', weight: 15 },
      { name: 'Storage', weight: 15 },
      { name: 'Database', weight: 10 },
      { name: 'Security and Observability', weight: 10 },
      { name: 'High Availability and Disaster Recovery', weight: 10 }
    ]
  },
  {
    vendorSlug: 'oracle', slug: 'oracle-oci-architect-pro-1z0-997', code: '1Z0-997-25',
    title: 'Oracle Cloud Infrastructure Architect Professional',
    description: 'Advanced OCI architecture: complex networks, governance, automation, and hybrid solutions.',
    level: 'Professional', durationMinutes: 90, passingScore: 70, questionCount: 55,
    domains: [
      { name: 'Plan and Design Solutions', weight: 25 },
      { name: 'Implement and Operate Solutions', weight: 30 },
      { name: 'Migration', weight: 15 },
      { name: 'Performance and Cost Optimization', weight: 15 },
      { name: 'Security and Compliance', weight: 15 }
    ]
  },
  {
    vendorSlug: 'oracle', slug: 'oracle-genai-professional-1z0-1127', code: '1Z0-1127-24',
    title: 'Oracle Cloud Infrastructure Generative AI Professional',
    description: 'Generative AI fundamentals, large language models, and OCI Generative AI Service implementation.',
    level: 'Professional', durationMinutes: 90, passingScore: 65, questionCount: 40,
    domains: [
      { name: 'Fundamentals of Large Language Models', weight: 30 },
      { name: 'Using OCI Generative AI Service', weight: 30 },
      { name: 'Building an LLM Application with OCI Generative AI Service', weight: 40 }
    ]
  },
  {
    vendorSlug: 'oracle', slug: 'oracle-db-sql-1z0-071', code: '1Z0-071',
    title: 'Oracle Database SQL Certified Associate',
    description: 'Relational database concepts and SQL skills using Oracle Database.',
    level: 'Associate', durationMinutes: 100, passingScore: 63, questionCount: 78,
    domains: [
      { name: 'Relational Database Concepts', weight: 10 },
      { name: 'Retrieving and Restricting Data', weight: 25 },
      { name: 'Manipulating Data and Tables', weight: 25 },
      { name: 'Using Functions and Group Operations', weight: 20 },
      { name: 'Joins, Subqueries, and Set Operators', weight: 20 }
    ]
  },

  // ───── Google Cloud ─────
  {
    vendorSlug: 'google', slug: 'google-cloud-digital-leader', code: 'CDL',
    title: 'Google Cloud Digital Leader',
    description: 'Foundational understanding of cloud concepts and Google Cloud products and services.',
    level: 'Foundational', durationMinutes: 90, passingScore: 70, questionCount: 60,
    domains: [
      { name: 'Digital Transformation with Google Cloud', weight: 10 },
      { name: 'Exploring Data Transformation with Google Cloud', weight: 30 },
      { name: 'Innovating with Google Cloud Artificial Intelligence', weight: 30 },
      { name: 'Modernizing Infrastructure and Applications with Google Cloud', weight: 30 }
    ]
  },
  {
    vendorSlug: 'google', slug: 'google-associate-cloud-engineer', code: 'ACE',
    title: 'Google Associate Cloud Engineer',
    description: 'Deploy applications, monitor operations, and manage enterprise solutions on Google Cloud.',
    level: 'Associate', durationMinutes: 120, passingScore: 70, questionCount: 50,
    domains: [
      { name: 'Setting up a cloud solution environment', weight: 20 },
      { name: 'Planning and configuring a cloud solution', weight: 20 },
      { name: 'Deploying and implementing a cloud solution', weight: 25 },
      { name: 'Ensuring successful operation of a cloud solution', weight: 20 },
      { name: 'Configuring access and security', weight: 15 }
    ]
  },
  {
    vendorSlug: 'google', slug: 'google-professional-cloud-architect', code: 'PCA',
    title: 'Google Professional Cloud Architect',
    description: 'Design, develop, and manage robust, secure, scalable, and dynamic Google Cloud solutions.',
    level: 'Professional', durationMinutes: 120, passingScore: 70, questionCount: 50,
    domains: [
      { name: 'Designing and planning a cloud solution architecture', weight: 24 },
      { name: 'Managing and provisioning a solution infrastructure', weight: 15 },
      { name: 'Designing for security and compliance', weight: 18 },
      { name: 'Analyzing and optimizing technical and business processes', weight: 18 },
      { name: 'Managing implementation', weight: 11 },
      { name: 'Ensuring solution and operations reliability', weight: 14 }
    ]
  },
  {
    vendorSlug: 'google', slug: 'google-professional-data-engineer', code: 'PDE',
    title: 'Google Professional Data Engineer',
    description: 'Design data processing systems, build and operationalize ML models, and ensure solution quality.',
    level: 'Professional', durationMinutes: 120, passingScore: 70, questionCount: 50,
    domains: [
      { name: 'Designing data processing systems', weight: 22 },
      { name: 'Ingesting and processing the data', weight: 25 },
      { name: 'Storing the data', weight: 20 },
      { name: 'Preparing and using data for analysis', weight: 15 },
      { name: 'Maintaining and automating data workloads', weight: 18 }
    ]
  },
  {
    vendorSlug: 'google', slug: 'google-professional-cloud-security', code: 'PCSE',
    title: 'Google Professional Cloud Security Engineer',
    description: 'Configure access, network security, and ensure data protection on Google Cloud.',
    level: 'Professional', durationMinutes: 120, passingScore: 70, questionCount: 50,
    domains: [
      { name: 'Configuring access', weight: 22 },
      { name: 'Securing communications and establishing boundary protection', weight: 20 },
      { name: 'Ensuring data protection', weight: 20 },
      { name: 'Managing operations', weight: 18 },
      { name: 'Supporting compliance requirements', weight: 20 }
    ]
  },
  // ───── Anthropic — Claude Certified Architect — Foundations ─────
  // Single consolidated exam — no multi-variant -p1/-p2 split (this cert
  // doesn't have enough question content to warrant variants).
  {
    vendorSlug: 'anthropic', slug: 'anthropic-cca-foundations', code: 'CCA-F',
    title: 'Claude Certified Architect — Foundations',
    description: CLAUDE_ARCHITECT_DESCRIPTION,
    level: 'Foundational', durationMinutes: 120, passingScore: 72, questionCount: 60,
    domains: CLAUDE_ARCHITECT_DOMAINS
  },

  {
    vendorSlug: 'google', slug: 'google-professional-ml-engineer', code: 'PMLE',
    title: 'Google Professional Machine Learning Engineer',
    description: 'Design, build, and productionize ML models using Google Cloud technologies.',
    level: 'Professional', durationMinutes: 120, passingScore: 70, questionCount: 50,
    domains: [
      { name: 'Architecting low-code AI solutions', weight: 12 },
      { name: 'Collaborating within and across teams to manage data and models', weight: 16 },
      { name: 'Scaling prototypes into ML models', weight: 18 },
      { name: 'Serving and scaling models', weight: 19 },
      { name: 'Automating and orchestrating ML pipelines', weight: 21 },
      { name: 'Monitoring AI solutions', weight: 14 }
    ]
  },

  // ───── Linux Foundation / CNCF ─────
  // CKAD v1.35: 5 domains, 2 hours, 66% to pass. Real exam is performance-
  // based (~15-20 hands-on tasks). Our practice variant uses multiple-choice
  // / multi-select questions whose distribution matches the published
  // blueprint weights. Real exam fee is USD 395 (voucher).
  {
    vendorSlug: 'linuxfoundation', slug: 'linuxfoundation-ckad-p1', code: 'CKAD-P1',
    title: 'Certified Kubernetes Application Developer (CKAD) — Practice Exam 1',
    description: 'Practice exam 1 of 3 for the CNCF Certified Kubernetes Application Developer (CKAD) certification — full 120-minute, 65-question, blueprint-weighted set covering Pods, Deployments, Jobs, ConfigMaps/Secrets, SecurityContexts, ServiceAccounts, probes, multi-container patterns, Services, NetworkPolicies, and Ingress. Aligned to CNCF CKAD v1.35.',
    level: 'Associate', durationMinutes: 120, passingScore: 66, questionCount: 65,
    domains: [
      { name: 'Application Design and Build', weight: 20 },
      { name: 'Application Deployment', weight: 20 },
      { name: 'Application Observability and Maintenance', weight: 15 },
      { name: 'Application Environment, Configuration and Security', weight: 25 },
      { name: 'Services and Networking', weight: 20 }
    ]
  },
  {
    vendorSlug: 'linuxfoundation', slug: 'linuxfoundation-ckad-p2', code: 'CKAD-P2',
    title: 'Certified Kubernetes Application Developer (CKAD) — Practice Exam 2',
    description: 'Practice exam 2 of 3 for the CNCF Certified Kubernetes Application Developer (CKAD) certification — a second 120-minute, 65-question, blueprint-weighted set. Aligned to CNCF CKAD v1.35.',
    level: 'Associate', durationMinutes: 120, passingScore: 66, questionCount: 65,
    domains: [
      { name: 'Application Design and Build', weight: 20 },
      { name: 'Application Deployment', weight: 20 },
      { name: 'Application Observability and Maintenance', weight: 15 },
      { name: 'Application Environment, Configuration and Security', weight: 25 },
      { name: 'Services and Networking', weight: 20 }
    ]
  },
  {
    vendorSlug: 'linuxfoundation', slug: 'linuxfoundation-ckad-p3', code: 'CKAD-P3',
    title: 'Certified Kubernetes Application Developer (CKAD) — Practice Exam 3',
    description: 'Practice exam 3 of 3 for the CNCF Certified Kubernetes Application Developer (CKAD) certification — a third 120-minute, 65-question, blueprint-weighted set. Aligned to CNCF CKAD v1.35.',
    level: 'Associate', durationMinutes: 120, passingScore: 66, questionCount: 65,
    domains: [
      { name: 'Application Design and Build', weight: 20 },
      { name: 'Application Deployment', weight: 20 },
      { name: 'Application Observability and Maintenance', weight: 15 },
      { name: 'Application Environment, Configuration and Security', weight: 25 },
      { name: 'Services and Networking', weight: 20 }
    ]
  },

  // CKA v1.32: 5 domains, 2 hours, 66% to pass. Real exam is performance-
  // based (~15-20 hands-on tasks on a live cluster). Our practice variant
  // uses multiple-choice / multi-select questions whose distribution
  // matches the published blueprint weights. Real exam fee is USD 395.
  {
    vendorSlug: 'linuxfoundation', slug: 'linuxfoundation-cka-p1', code: 'CKA-P1',
    title: 'Certified Kubernetes Administrator (CKA) — Practice Exam 1',
    description: 'Practice exam 1 of 3 for the CNCF Certified Kubernetes Administrator (CKA) certification — full 120-minute, 65-question, blueprint-weighted set covering kubeadm install, etcd, RBAC, scheduling, Services & Ingress/Gateway API, NetworkPolicies, PV/PVC/StorageClasses, and the troubleshooting workflows tested by the TGS-2025054612-CKA labs. Aligned to CNCF CKA v1.32.',
    level: 'Associate', durationMinutes: 120, passingScore: 66, questionCount: 65,
    domains: [
      { name: 'Cluster Architecture, Installation and Configuration', weight: 25 },
      { name: 'Workloads and Scheduling', weight: 15 },
      { name: 'Services and Networking', weight: 20 },
      { name: 'Storage', weight: 10 },
      { name: 'Troubleshooting', weight: 30 }
    ]
  },
  {
    vendorSlug: 'linuxfoundation', slug: 'linuxfoundation-cka-p2', code: 'CKA-P2',
    title: 'Certified Kubernetes Administrator (CKA) — Practice Exam 2',
    description: 'Practice exam 2 of 3 for the CNCF Certified Kubernetes Administrator (CKA) certification — a second 120-minute, 65-question, blueprint-weighted set. Aligned to CNCF CKA v1.32.',
    level: 'Associate', durationMinutes: 120, passingScore: 66, questionCount: 65,
    domains: [
      { name: 'Cluster Architecture, Installation and Configuration', weight: 25 },
      { name: 'Workloads and Scheduling', weight: 15 },
      { name: 'Services and Networking', weight: 20 },
      { name: 'Storage', weight: 10 },
      { name: 'Troubleshooting', weight: 30 }
    ]
  },
  {
    vendorSlug: 'linuxfoundation', slug: 'linuxfoundation-cka-p3', code: 'CKA-P3',
    title: 'Certified Kubernetes Administrator (CKA) — Practice Exam 3',
    description: 'Practice exam 3 of 3 for the CNCF Certified Kubernetes Administrator (CKA) certification — a third 120-minute, 65-question, blueprint-weighted set. Aligned to CNCF CKA v1.32.',
    level: 'Associate', durationMinutes: 120, passingScore: 66, questionCount: 65,
    domains: [
      { name: 'Cluster Architecture, Installation and Configuration', weight: 25 },
      { name: 'Workloads and Scheduling', weight: 15 },
      { name: 'Services and Networking', weight: 20 },
      { name: 'Storage', weight: 10 },
      { name: 'Troubleshooting', weight: 30 }
    ]
  },

  // HashiCorp Terraform Associate (003): 8 objective groups, 1 hour,
  // 70% to pass. Practice variants use multiple-choice / multi-select
  // questions whose distribution matches the published 003 objectives.
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'hashicorp', slug: `hashicorp-terraform-associate-p${n}`, code: `TFA003-P${n}`,
    title: `HashiCorp Certified: Terraform Associate (003) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the HashiCorp Certified: Terraform Associate (003) certification — a 60-minute, 65-question, blueprint-weighted set covering IaC concepts, Terraform fundamentals & workflow, modules, state management, and reading/generating/modifying configuration. Aligned to the HashiCorp Terraform Associate 003 objectives.`,
    level: 'Associate', durationMinutes: 60, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Infrastructure as Code (IaC) Concepts', weight: 10 },
      { name: 'The Purpose of Terraform (vs other IaC)', weight: 10 },
      { name: 'Terraform Fundamentals', weight: 15 },
      { name: 'The Terraform Workflow', weight: 15 },
      { name: 'Terraform Modules', weight: 15 },
      { name: 'Use Terraform Outside the Core Workflow', weight: 10 },
      { name: 'Implement and Maintain State', weight: 15 },
      { name: 'Read, Generate, and Modify Configuration', weight: 10 }
    ]
  })),

  // Docker Certified Associate (DCA): 6 domains, 90 minutes, ~65% to pass.
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'docker', slug: `docker-dca-p${n}`, code: `DCA-P${n}`,
    title: `Docker Certified Associate (DCA) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the Docker Certified Associate (DCA) certification — a 90-minute, 65-question, blueprint-weighted set covering orchestration, image creation/management/registry, installation & configuration, networking, security, and storage & volumes. Aligned to the DCA exam domains.`,
    level: 'Associate', durationMinutes: 90, passingScore: 65, questionCount: 65,
    domains: [
      { name: 'Orchestration', weight: 25 },
      { name: 'Image Creation, Management, and Registry', weight: 20 },
      { name: 'Installation and Configuration', weight: 15 },
      { name: 'Networking', weight: 15 },
      { name: 'Security', weight: 15 },
      { name: 'Storage and Volumes', weight: 10 }
    ]
  })),

  // Red Hat Certified System Administrator (RHCSA EX200): 7 objective
  // groups, 150 minutes, 70% to pass. Real exam is performance-based on
  // RHEL 9; practice variants match the published EX200 objective weights.
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'redhat', slug: `redhat-rhcsa-ex200-p${n}`, code: `RHCSA-P${n}`,
    title: `Red Hat Certified System Administrator (RHCSA EX200) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the Red Hat Certified System Administrator (RHCSA EX200) certification — a 150-minute, 65-question, blueprint-weighted set covering essential tools, operating running systems, local storage & file systems, system deployment & maintenance, users & groups, and security. Aligned to the official Red Hat EX200 objectives (RHEL 9).`,
    level: 'Associate', durationMinutes: 150, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Understand and Use Essential Tools', weight: 15 },
      { name: 'Operate Running Systems', weight: 15 },
      { name: 'Configure Local Storage', weight: 15 },
      { name: 'Create and Configure File Systems', weight: 15 },
      { name: 'Deploy, Configure, and Maintain Systems', weight: 20 },
      { name: 'Manage Users and Groups', weight: 10 },
      { name: 'Manage Security', weight: 10 }
    ]
  })),

  // GitLab Certified Associate: 5 domains, 60 minutes, 70% to pass.
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'gitlab', slug: `gitlab-certified-associate-p${n}`, code: `GLCA-P${n}`,
    title: `GitLab Certified Associate — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the GitLab Certified Associate certification — a 60-minute, 65-question, blueprint-weighted set covering Git & GitLab fundamentals, source code management & workflows, CI/CD pipelines, project management & collaboration, and security & compliance basics. Aligned to the GitLab Certified Associate curriculum.`,
    level: 'Associate', durationMinutes: 60, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Git and GitLab Fundamentals', weight: 20 },
      { name: 'Source Code Management and Workflows', weight: 20 },
      { name: 'CI/CD Pipelines', weight: 30 },
      { name: 'Project Management and Collaboration', weight: 15 },
      { name: 'Security and Compliance Basics', weight: 15 }
    ]
  })),

  // Elastic Certified Engineer: 6 domains, 180 minutes, 70% to pass.
  // Real exam is hands-on; practice variants match the published topics.
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'elastic', slug: `elastic-certified-engineer-p${n}`, code: `ECE-P${n}`,
    title: `Elastic Certified Engineer — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the Elastic Certified Engineer certification — a 180-minute, 65-question, blueprint-weighted set covering installation & configuration, indexing data, queries, mappings & text analysis, cluster administration, and data processing & aggregations. Aligned to the Elastic Certified Engineer exam objectives.`,
    level: 'Professional', durationMinutes: 180, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Installation and Configuration', weight: 20 },
      { name: 'Indexing Data', weight: 20 },
      { name: 'Queries', weight: 20 },
      { name: 'Mappings and Text Analysis', weight: 20 },
      { name: 'Cluster Administration', weight: 10 },
      { name: 'Data Processing and Aggregations', weight: 10 }
    ]
  })),

  // ───── Wave 3a: competitor-parity new certs (65 Q/variant × 3) ─────
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-az-305-p${n}`, code: `AZ-305-P${n}`,
    title: `Microsoft Azure Solutions Architect Expert (AZ-305) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft AZ-305 — a 120-minute, 65-question, blueprint-weighted set covering identity/governance/monitoring, data storage, business continuity, and infrastructure solution design on Azure.`,
    level: 'Expert', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Design identity, governance, and monitoring solutions', weight: 28 },
      { name: 'Design data storage solutions', weight: 24 },
      { name: 'Design business continuity solutions', weight: 18 },
      { name: 'Design infrastructure solutions', weight: 30 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-az-204-p${n}`, code: `AZ-204-P${n}`,
    title: `Microsoft Azure Developer Associate (AZ-204) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft AZ-204 — a 120-minute, 65-question, blueprint-weighted set covering Azure compute and storage development, security, monitoring & optimization, and connecting to/consuming Azure and third-party services.`,
    level: 'Associate', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Develop Azure compute solutions', weight: 27 },
      { name: 'Develop for Azure storage', weight: 17 },
      { name: 'Implement Azure security', weight: 18 },
      { name: 'Monitor, troubleshoot, and optimize Azure solutions', weight: 13 },
      { name: 'Connect to and consume Azure services and third-party services', weight: 25 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-az-104-p${n}`, code: `AZ-104-P${n}`,
    title: `Microsoft Azure Administrator (AZ-104) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft AZ-104 — a 100-minute, 65-question, blueprint-weighted set covering Azure identities & governance, storage, compute resources, virtual networking, and monitoring & maintenance. Aligned to the official Microsoft AZ-104 exam objectives.`,
    level: 'Associate', durationMinutes: 100, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Manage Azure identities and governance', weight: 22 },
      { name: 'Implement and manage storage', weight: 18 },
      { name: 'Deploy and manage Azure compute resources', weight: 23 },
      { name: 'Implement and manage virtual networking', weight: 22 },
      { name: 'Monitor and maintain Azure resources', weight: 15 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-ms-102-p${n}`, code: `MS-102-P${n}`,
    title: `Microsoft 365 Administrator Expert (MS-102) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft MS-102 — a 120-minute, 65-question, blueprint-weighted set covering deploy & manage a Microsoft 365 tenant, Microsoft Entra identity & access, security & threats with Microsoft Defender XDR, and Microsoft Purview compliance. Aligned to the official Microsoft MS-102 exam objectives.`,
    level: 'Expert', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Deploy and manage a Microsoft 365 tenant', weight: 27 },
      { name: 'Implement and manage Microsoft Entra identity and access', weight: 27 },
      { name: 'Manage security and threats by using Microsoft Defender XDR', weight: 33 },
      { name: 'Manage compliance by using Microsoft Purview', weight: 13 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-md-102-p${n}`, code: `MD-102-P${n}`,
    title: `Microsoft Endpoint Administrator (MD-102) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft MD-102 — a 100-minute, 65-question, blueprint-weighted set covering preparing infrastructure for devices (Entra device identity, Intune enrollment, identity & compliance), managing and maintaining devices (Windows Autopilot, configuration profiles, Intune Suite, remote actions, device query), managing applications (deploy/configure/protect including M365 Apps and app protection policies), and protecting devices (endpoint security, Microsoft Defender for Endpoint integration, updates). Aligned to the official Microsoft MD-102 study guide (skills measured as of April 28, 2026).`,
    level: 'Associate', durationMinutes: 100, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Prepare infrastructure for devices', weight: 28 },
      { name: 'Manage and maintain devices', weight: 32 },
      { name: 'Manage applications', weight: 20 },
      { name: 'Protect devices', weight: 20 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-sc-200-p${n}`, code: `SC-200-P${n}`,
    title: `Microsoft Security Operations Analyst (SC-200) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft SC-200 — a 100-minute, 65-question, blueprint-weighted set covering managing a security operations environment (Defender XDR + Sentinel automation, SIEM platform configuration, data ingestion, and detection engineering), responding to security incidents across Defender XDR and Microsoft Defender for Endpoint, and performing threat hunting with KQL, Sentinel Graph, hunting notebooks, and the Sentinel MCP Server. Aligned to the official Microsoft SC-200 study guide (skills measured as of April 16, 2026).`,
    level: 'Associate', durationMinutes: 100, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Manage a security operations environment', weight: 40 },
      { name: 'Respond to security incidents', weight: 40 },
      { name: 'Perform threat hunting', weight: 20 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-ms-700-p${n}`, code: `MS-700-P${n}`,
    title: `Microsoft Teams Administrator Associate (MS-700) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft MS-700 — a 100-minute, 65-question, blueprint-weighted set covering configuring and managing a Microsoft Teams environment (network planning, security & compliance, governance and lifecycle, external and guest collaboration, Teams clients and devices), managing teams, channels, chats, and apps, managing meetings and calling including Teams Phone (auto attendants, call queues, phone numbers, policies), and monitoring, reporting on, and troubleshooting Teams. Aligned to the official Managing Microsoft Teams (MS-700) study guide (skills measured as of April 28, 2026).`,
    level: 'Associate', durationMinutes: 100, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Configure and manage a Teams environment', weight: 42 },
      { name: 'Manage teams, channels, chats, and apps', weight: 23 },
      { name: 'Manage meetings and calling', weight: 18 },
      { name: 'Monitor, report on, and troubleshoot Teams', weight: 17 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-sc-900-p${n}`, code: `SC-900-P${n}`,
    title: `Microsoft Security, Compliance, and Identity Fundamentals (SC-900) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft SC-900 — a 60-minute, 65-question, blueprint-weighted set covering security/compliance/identity concepts, Microsoft Entra, Microsoft security solutions, and Microsoft compliance (Purview) solutions.`,
    level: 'Foundational', durationMinutes: 60, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Describe the concepts of security, compliance, and identity', weight: 13 },
      { name: 'Describe the capabilities of Microsoft Entra', weight: 27 },
      { name: 'Describe the capabilities of Microsoft security solutions', weight: 35 },
      { name: 'Describe the capabilities of Microsoft compliance solutions', weight: 25 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'comptia', slug: `comptia-a-plus-p${n}`, code: `220-1100-P${n}`,
    title: `CompTIA A+ (220-1101 / 220-1102) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for CompTIA A+ — a 90-minute, 65-question, blueprint-weighted set covering hardware, networking, mobile & virtualization, operating systems, security, and software/operational troubleshooting across Core 1 and Core 2.`,
    level: 'Foundational', durationMinutes: 90, passingScore: 72, questionCount: 65,
    domains: [
      { name: 'Hardware', weight: 18 },
      { name: 'Networking', weight: 17 },
      { name: 'Mobile Devices and Virtualization', weight: 13 },
      { name: 'Operating Systems', weight: 18 },
      { name: 'Security', weight: 18 },
      { name: 'Software and Operational Troubleshooting', weight: 16 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'comptia', slug: `comptia-network-plus-p${n}`, code: `N10-009-P${n}`,
    title: `CompTIA Network+ (N10-009) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for CompTIA Network+ — a 90-minute, 65-question, blueprint-weighted set covering networking concepts, implementation, operations, security, and troubleshooting.`,
    level: 'Foundational', durationMinutes: 90, passingScore: 72, questionCount: 65,
    domains: [
      { name: 'Networking Concepts', weight: 23 },
      { name: 'Network Implementation', weight: 20 },
      { name: 'Network Operations', weight: 19 },
      { name: 'Network Security', weight: 14 },
      { name: 'Network Troubleshooting', weight: 24 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'comptia', slug: `comptia-security-plus-p${n}`, code: `SY0-701-P${n}`,
    title: `CompTIA Security+ (SY0-701) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for CompTIA Security+ — a 90-minute, 65-question, blueprint-weighted set covering general security concepts, threats/vulnerabilities/mitigations, security architecture, security operations, and security program management & oversight.`,
    level: 'Foundational', durationMinutes: 90, passingScore: 75, questionCount: 65,
    domains: [
      { name: 'General Security Concepts', weight: 12 },
      { name: 'Threats, Vulnerabilities, and Mitigations', weight: 22 },
      { name: 'Security Architecture', weight: 18 },
      { name: 'Security Operations', weight: 28 },
      { name: 'Security Program Management and Oversight', weight: 20 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'google', slug: `google-professional-cloud-architect-p${n}`, code: `PCA-P${n}`,
    title: `Google Professional Cloud Architect — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Google Professional Cloud Architect — a 120-minute, 65-question, blueprint-weighted set covering architecture design & planning, infrastructure provisioning, security & compliance, process optimization, implementation management, and operational reliability.`,
    level: 'Professional', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Designing and planning a cloud solution architecture', weight: 24 },
      { name: 'Managing and provisioning a solution infrastructure', weight: 18 },
      { name: 'Designing for security and compliance', weight: 18 },
      { name: 'Analyzing and optimizing technical and business processes', weight: 13 },
      { name: 'Managing implementation', weight: 12 },
      { name: 'Ensuring solution and operations reliability', weight: 15 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'google', slug: `google-professional-data-engineer-p${n}`, code: `PDE-P${n}`,
    title: `Google Professional Data Engineer — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Google Professional Data Engineer — a 120-minute, 65-question, blueprint-weighted set covering designing data processing systems, ingesting & processing data, storing data, preparing & using data for analysis, and maintaining & automating data workloads.`,
    level: 'Professional', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Designing data processing systems', weight: 22 },
      { name: 'Ingesting and processing the data', weight: 25 },
      { name: 'Storing the data', weight: 20 },
      { name: 'Preparing and using data for analysis', weight: 15 },
      { name: 'Maintaining and automating data workloads', weight: 18 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'isc2', slug: `isc2-ccsp-p${n}`, code: `CCSP-P${n}`,
    title: `ISC2 CCSP — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for ISC2 CCSP — a 240-minute, 65-question, blueprint-weighted set covering cloud concepts/architecture/design, cloud data security, cloud platform & infrastructure security, cloud application security, cloud security operations, and legal/risk/compliance.`,
    level: 'Professional', durationMinutes: 240, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Cloud Concepts, Architecture and Design', weight: 17 },
      { name: 'Cloud Data Security', weight: 20 },
      { name: 'Cloud Platform and Infrastructure Security', weight: 17 },
      { name: 'Cloud Application Security', weight: 17 },
      { name: 'Cloud Security Operations', weight: 16 },
      { name: 'Legal, Risk and Compliance', weight: 13 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'linuxfoundation', slug: `linuxfoundation-cks-p${n}`, code: `CKS-P${n}`,
    title: `Certified Kubernetes Security Specialist (CKS) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for CNCF CKS — a 120-minute, 65-question, blueprint-weighted set covering cluster setup, cluster hardening, system hardening, minimizing microservice vulnerabilities, supply chain security, and monitoring/logging/runtime security. Aligned to CNCF CKS v1.32.`,
    level: 'Specialty', durationMinutes: 120, passingScore: 67, questionCount: 65,
    domains: [
      { name: 'Cluster Setup', weight: 15 },
      { name: 'Cluster Hardening', weight: 15 },
      { name: 'System Hardening', weight: 10 },
      { name: 'Minimize Microservice Vulnerabilities', weight: 20 },
      { name: 'Supply Chain Security', weight: 20 },
      { name: 'Monitoring, Logging and Runtime Security', weight: 20 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'pmi', slug: `pmi-capm-p${n}`, code: `CAPM-P${n}`,
    title: `PMI CAPM — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for PMI CAPM — a 180-minute, 65-question, blueprint-weighted set covering project management fundamentals & core concepts, predictive plan-based methodologies, agile frameworks/methodologies, and business analysis frameworks.`,
    level: 'Associate', durationMinutes: 180, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Project Management Fundamentals and Core Concepts', weight: 36 },
      { name: 'Predictive, Plan-Based Methodologies', weight: 17 },
      { name: 'Agile Frameworks/Methodologies', weight: 20 },
      { name: 'Business Analysis Frameworks', weight: 27 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'scrum-org', slug: `scrum-org-pspo-i-p${n}`, code: `PSPO-I-P${n}`,
    title: `Professional Scrum Product Owner I (PSPO I) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Scrum.org PSPO I — a 60-minute, 65-question, blueprint-weighted set covering the Scrum framework, product value & vision, Product Backlog management, stakeholders & customers, and empiricism/agility, grounded in the Scrum Guide.`,
    level: 'Associate', durationMinutes: 60, passingScore: 85, questionCount: 65,
    domains: [
      { name: 'Scrum Framework', weight: 25 },
      { name: 'Product Value and Vision', weight: 20 },
      { name: 'Product Backlog Management', weight: 25 },
      { name: 'Stakeholders and Customers', weight: 15 },
      { name: 'Empiricism and Agility', weight: 15 }
    ]
  })),

  // ───── Wave 3b: competitor-parity new certs (65 Q/variant × 3) ─────
  ...(['1', '2', '3', '4'] as const).map((n): ExamSeed => ({
    vendorSlug: 'axelos', slug: `axelos-itil4-foundation-p${n}`, code: `ITIL4-FND-P${n}`,
    title: `ITIL 4 Foundation — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for ITIL 4 Foundation — a 60-minute, 65-question, blueprint-weighted set covering key concepts of service management, the four dimensions & guiding principles, the service value system & value chain, and the ITIL practices. Aligned to the ITIL 4 Foundation syllabus.`,
    level: 'Foundational', durationMinutes: 60, passingScore: 65, questionCount: 65,
    domains: [
      { name: 'Key Concepts of Service Management', weight: 20 },
      { name: 'The Four Dimensions and Guiding Principles', weight: 25 },
      { name: 'Service Value System and Value Chain', weight: 20 },
      { name: 'ITIL Practices', weight: 35 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'tableau', slug: `tableau-desktop-specialist-p${n}`, code: `TDS-P${n}`,
    title: `Tableau Desktop Specialist — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the Tableau Desktop Specialist certification — a 60-minute, 65-question, blueprint-weighted set covering connecting to & preparing data, exploring & analyzing data, sharing insights, and understanding Tableau concepts.`,
    level: 'Foundational', durationMinutes: 60, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Connecting to and Preparing Data', weight: 25 },
      { name: 'Exploring and Analyzing Data', weight: 35 },
      { name: 'Sharing Insights', weight: 20 },
      { name: 'Understanding Tableau Concepts', weight: 20 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'iassc', slug: `iassc-lean-six-sigma-green-belt-p${n}`, code: `ICGB-P${n}`,
    title: `IASSC Lean Six Sigma Green Belt — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the IASSC Lean Six Sigma Green Belt certification — a 180-minute, 65-question, blueprint-weighted set covering the Define, Measure, Analyze, Improve, and Control phases of the DMAIC methodology. Aligned to the IASSC Green Belt body of knowledge.`,
    level: 'Associate', durationMinutes: 180, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Define Phase', weight: 23 },
      { name: 'Measure Phase', weight: 23 },
      { name: 'Analyze Phase', weight: 23 },
      { name: 'Improve Phase', weight: 18 },
      { name: 'Control Phase', weight: 13 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'comptia', slug: `comptia-pentest-plus-p${n}`, code: `PT0-003-P${n}`,
    title: `CompTIA PenTest+ (PT0-003) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for CompTIA PenTest+ (PT0-003) — a 165-minute, 65-question, blueprint-weighted set covering engagement management, reconnaissance & enumeration, vulnerability discovery & analysis, attacks & exploits, and post-exploitation & lateral movement.`,
    level: 'Associate', durationMinutes: 165, passingScore: 75, questionCount: 65,
    domains: [
      { name: 'Engagement Management', weight: 13 },
      { name: 'Reconnaissance and Enumeration', weight: 21 },
      { name: 'Vulnerability Discovery and Analysis', weight: 17 },
      { name: 'Attacks and Exploits', weight: 35 },
      { name: 'Post-exploitation and Lateral Movement', weight: 14 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'comptia', slug: `comptia-securityx-p${n}`, code: `CAS-005-P${n}`,
    title: `CompTIA SecurityX (CAS-005) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for CompTIA SecurityX (CASP+, CAS-005) — a 165-minute, 65-question, blueprint-weighted set covering governance/risk & compliance, security architecture, security engineering, and security operations.`,
    level: 'Professional', durationMinutes: 165, passingScore: 75, questionCount: 65,
    domains: [
      { name: 'Governance, Risk, and Compliance', weight: 20 },
      { name: 'Security Architecture', weight: 27 },
      { name: 'Security Engineering', weight: 31 },
      { name: 'Security Operations', weight: 22 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'isc2', slug: `isc2-cc-p${n}`, code: `CC-P${n}`,
    title: `ISC2 Certified in Cybersecurity (CC) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for ISC2 Certified in Cybersecurity (CC) — a 120-minute, 65-question, blueprint-weighted set covering security principles, business continuity/DR & incident response, access controls concepts, network security, and security operations.`,
    level: 'Foundational', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Security Principles', weight: 26 },
      { name: 'Business Continuity, Disaster Recovery and Incident Response', weight: 10 },
      { name: 'Access Controls Concepts', weight: 22 },
      { name: 'Network Security', weight: 24 },
      { name: 'Security Operations', weight: 18 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-sc-300-p${n}`, code: `SC-300-P${n}`,
    title: `Microsoft Identity and Access Administrator (SC-300) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft SC-300 — a 120-minute, 65-question, blueprint-weighted set covering implementing identities in Microsoft Entra, authentication & access management, access management for applications, and identity governance.`,
    level: 'Associate', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Implement Identities in Microsoft Entra', weight: 20 },
      { name: 'Implement Authentication and Access Management', weight: 30 },
      { name: 'Implement Access Management for Applications', weight: 15 },
      { name: 'Plan and Implement Identity Governance', weight: 35 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-pl-900-p${n}`, code: `PL-900-P${n}`,
    title: `Microsoft Power Platform Fundamentals (PL-900) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft PL-900 — a 60-minute, 65-question, blueprint-weighted set covering Power Platform business value, core components, Power Apps, Power Automate, Power BI, and Power Pages & Copilot Studio.`,
    level: 'Foundational', durationMinutes: 60, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Describe the Business Value of Power Platform', weight: 20 },
      { name: 'Identify Core Components of Power Platform', weight: 20 },
      { name: 'Demonstrate the Capabilities of Power Apps', weight: 15 },
      { name: 'Demonstrate the Capabilities of Power Automate', weight: 15 },
      { name: 'Demonstrate the Capabilities of Power BI', weight: 15 },
      { name: 'Demonstrate the Capabilities of Power Pages and Copilot Studio', weight: 15 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'cisco', slug: `cisco-devnet-associate-200-901-p${n}`, code: `200-901-P${n}`,
    title: `Cisco DevNet Associate (200-901 DEVASC) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Cisco DevNet Associate (200-901 DEVASC) — a 120-minute, 65-question, blueprint-weighted set covering software development & design, understanding & using APIs, Cisco platforms & development, application deployment & security, infrastructure & automation, and network fundamentals.`,
    level: 'Associate', durationMinutes: 120, passingScore: 80, questionCount: 65,
    domains: [
      { name: 'Software Development and Design', weight: 15 },
      { name: 'Understanding and Using APIs', weight: 20 },
      { name: 'Cisco Platforms and Development', weight: 15 },
      { name: 'Application Deployment and Security', weight: 15 },
      { name: 'Infrastructure and Automation', weight: 20 },
      { name: 'Network Fundamentals', weight: 15 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'linuxfoundation', slug: `linuxfoundation-kcna-p${n}`, code: `KCNA-P${n}`,
    title: `Kubernetes and Cloud Native Associate (KCNA) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the CNCF KCNA certification — a 90-minute, 65-question, blueprint-weighted set covering Kubernetes fundamentals, container orchestration, cloud native architecture, cloud native observability, and cloud native application delivery. Aligned to the CNCF KCNA curriculum.`,
    level: 'Foundational', durationMinutes: 90, passingScore: 75, questionCount: 65,
    domains: [
      { name: 'Kubernetes Fundamentals', weight: 46 },
      { name: 'Container Orchestration', weight: 22 },
      { name: 'Cloud Native Architecture', weight: 16 },
      { name: 'Cloud Native Observability', weight: 8 },
      { name: 'Cloud Native Application Delivery', weight: 8 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'hashicorp', slug: `hashicorp-vault-associate-p${n}`, code: `VA-002-P${n}`,
    title: `HashiCorp Certified: Vault Associate (002) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the HashiCorp Vault Associate (002) certification — a 60-minute, 65-question, blueprint-weighted set covering Vault architecture, authentication & authorization, secrets engines, Vault policies, tokens, and encryption as a service. Aligned to the HashiCorp Vault Associate 002 objectives.`,
    level: 'Associate', durationMinutes: 60, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Vault Architecture', weight: 15 },
      { name: 'Authentication and Authorization', weight: 20 },
      { name: 'Secrets Engines', weight: 20 },
      { name: 'Vault Policies', weight: 15 },
      { name: 'Tokens', weight: 15 },
      { name: 'Encryption as a Service', weight: 15 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'pmi', slug: `pmi-acp-p${n}`, code: `PMI-ACP-P${n}`,
    title: `PMI Agile Certified Practitioner (PMI-ACP) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for PMI-ACP — a 180-minute, 65-question, blueprint-weighted set covering agile principles & mindset, value-driven delivery, stakeholder engagement, team performance, adaptive planning, problem detection & resolution, and continuous improvement.`,
    level: 'Professional', durationMinutes: 180, passingScore: 75, questionCount: 65,
    domains: [
      { name: 'Agile Principles and Mindset', weight: 16 },
      { name: 'Value-Driven Delivery', weight: 20 },
      { name: 'Stakeholder Engagement', weight: 17 },
      { name: 'Team Performance', weight: 16 },
      { name: 'Adaptive Planning', weight: 12 },
      { name: 'Problem Detection and Resolution', weight: 10 },
      { name: 'Continuous Improvement', weight: 9 }
    ]
  })),

  // ───── Wave 3c: competitor-parity new certs (65 Q/variant × 3) ─────
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-sc-100-p${n}`, code: `SC-100-P${n}`,
    title: `Microsoft Cybersecurity Architect Expert (SC-100) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft SC-100 — a 120-minute, 65-question, blueprint-weighted set covering designing solutions that align with security best practices & priorities; security operations, identity & compliance capabilities; and security solutions for infrastructure, applications & data.`,
    level: 'Expert', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Design Solutions That Align with Security Best Practices and Priorities', weight: 24 },
      { name: 'Design Security Operations, Identity, and Compliance Capabilities', weight: 27 },
      { name: 'Design Security Solutions for Infrastructure', weight: 23 },
      { name: 'Design Security Solutions for Applications and Data', weight: 26 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-dp-600-p${n}`, code: `DP-600-P${n}`,
    title: `Microsoft Fabric Analytics Engineer (DP-600) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft DP-600 — a 100-minute, 65-question, blueprint-weighted set covering planning & managing a data analytics solution, preparing & serving data, implementing & managing semantic models, and exploring & analyzing data in Microsoft Fabric.`,
    level: 'Associate', durationMinutes: 100, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Plan, Implement, and Manage a Solution for Data Analytics', weight: 12 },
      { name: 'Prepare and Serve Data', weight: 41 },
      { name: 'Implement and Manage Semantic Models', weight: 23 },
      { name: 'Explore and Analyze Data', weight: 24 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'microsoft', slug: `microsoft-pl-600-p${n}`, code: `PL-600-P${n}`,
    title: `Microsoft Power Platform Solution Architect (PL-600) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Microsoft PL-600 — a 120-minute, 65-question, blueprint-weighted set covering solution envisioning & requirement analysis, architecting a solution, and implementing the solution on Power Platform.`,
    level: 'Expert', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Perform Solution Envisioning and Requirement Analysis', weight: 38 },
      { name: 'Architect a Solution', weight: 39 },
      { name: 'Implement the Solution', weight: 23 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'google', slug: `google-professional-cloud-devops-engineer-p${n}`, code: `GCP-PCDOE-P${n}`,
    title: `Google Professional Cloud DevOps Engineer — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the Google Professional Cloud DevOps Engineer certification — a 120-minute, 65-question, blueprint-weighted set covering bootstrapping & managing a Google Cloud organization, CI/CD pipelines, SRE practices, observability, and optimizing service performance.`,
    level: 'Professional', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Bootstrapping and Managing a Google Cloud Organization', weight: 18 },
      { name: 'Building and Implementing CI/CD Pipelines', weight: 22 },
      { name: 'Applying Site Reliability Engineering Practices', weight: 22 },
      { name: 'Implementing Observability', weight: 20 },
      { name: 'Optimizing Service Performance', weight: 18 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'google', slug: `google-professional-cloud-network-engineer-p${n}`, code: `GCP-PCNE-P${n}`,
    title: `Google Professional Cloud Network Engineer — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the Google Professional Cloud Network Engineer certification — a 120-minute, 65-question, blueprint-weighted set covering designing & planning a network, implementing VPCs, configuring network services, hybrid interconnectivity, and managing/monitoring network operations on Google Cloud.`,
    level: 'Professional', durationMinutes: 120, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Designing, Planning, and Prototyping a Google Cloud Network', weight: 26 },
      { name: 'Implementing Virtual Private Cloud Instances', weight: 21 },
      { name: 'Configuring Network Services', weight: 23 },
      { name: 'Implementing Hybrid Interconnectivity', weight: 14 },
      { name: 'Managing, Monitoring, and Optimizing Network Operations', weight: 16 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'cisco', slug: `cisco-ccnp-security-350-701-p${n}`, code: `350-701-P${n}`,
    title: `Cisco CCNP Security (SCOR 350-701) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Cisco CCNP Security (SCOR 350-701) — a 120-minute, 65-question, blueprint-weighted set covering security concepts, network security, securing the cloud, content security, endpoint protection & detection, and secure network access/visibility/enforcement.`,
    level: 'Professional', durationMinutes: 120, passingScore: 80, questionCount: 65,
    domains: [
      { name: 'Security Concepts', weight: 25 },
      { name: 'Network Security', weight: 20 },
      { name: 'Securing the Cloud', weight: 15 },
      { name: 'Content Security', weight: 15 },
      { name: 'Endpoint Protection and Detection', weight: 10 },
      { name: 'Secure Network Access, Visibility, and Enforcement', weight: 15 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'comptia', slug: `comptia-project-plus-p${n}`, code: `PK0-005-P${n}`,
    title: `CompTIA Project+ (PK0-005) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for CompTIA Project+ (PK0-005) — a 90-minute, 65-question, blueprint-weighted set covering project management concepts, project life cycle phases, tools & documentation, and basics of IT & governance.`,
    level: 'Foundational', durationMinutes: 90, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Project Management Concepts', weight: 33 },
      { name: 'Project Life Cycle Phases', weight: 30 },
      { name: 'Tools and Documentation', weight: 19 },
      { name: 'Basics of IT and Governance', weight: 18 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'oracle', slug: `oracle-java-se-17-1z0-829-p${n}`, code: `1Z0-829-P${n}`,
    title: `Oracle Certified Professional: Java SE 17 Developer (1Z0-829) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for Oracle Java SE 17 Developer (1Z0-829) — a 90-minute, 65-question, blueprint-weighted set covering the Java object-oriented approach, program flow, generics & collections, streams & lambdas, exceptions, the module system, concurrency, JDBC, and localization.`,
    level: 'Professional', durationMinutes: 90, passingScore: 68, questionCount: 65,
    domains: [
      { name: 'Handling Date, Time, Text, Numeric and Boolean Values', weight: 8 },
      { name: 'Controlling Program Flow', weight: 8 },
      { name: 'Java Object-Oriented Approach', weight: 18 },
      { name: 'Exception Handling', weight: 8 },
      { name: 'Working with Arrays and Collections', weight: 10 },
      { name: 'Working with Streams and Lambda Expressions', weight: 14 },
      { name: 'Java Platform Module System', weight: 8 },
      { name: 'Concurrency', weight: 10 },
      { name: 'Database Applications with JDBC', weight: 8 },
      { name: 'Localization', weight: 8 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'oracle', slug: `oracle-oci-foundations-1z0-1085-p${n}`, code: `1Z0-1085-P${n}`,
    title: `Oracle Cloud Infrastructure Foundations Associate (1Z0-1085) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the Oracle Cloud Infrastructure Foundations Associate (1Z0-1085) certification — a 60-minute, 65-question, blueprint-weighted set covering OCI introduction, identity & access management, networking, compute, storage, and security & observability. Aligned to the official 1Z0-1085 exam objectives.`,
    level: 'Foundational', durationMinutes: 60, passingScore: 65, questionCount: 65,
    domains: [
      { name: 'OCI Introduction', weight: 15 },
      { name: 'OCI Identity and Access Management', weight: 20 },
      { name: 'Networking', weight: 20 },
      { name: 'Compute', weight: 15 },
      { name: 'Storage', weight: 15 },
      { name: 'Security and Observability', weight: 15 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'isc2', slug: `isc2-sscp-p${n}`, code: `SSCP-P${n}`,
    title: `ISC2 SSCP — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for ISC2 SSCP — a 180-minute, 65-question, blueprint-weighted set covering security operations & administration, access controls, risk identification/monitoring/analysis, incident response & recovery, cryptography, network & communications security, and systems & application security.`,
    level: 'Associate', durationMinutes: 180, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Security Operations and Administration', weight: 16 },
      { name: 'Access Controls', weight: 15 },
      { name: 'Risk Identification, Monitoring, and Analysis', weight: 15 },
      { name: 'Incident Response and Recovery', weight: 14 },
      { name: 'Cryptography', weight: 9 },
      { name: 'Network and Communications Security', weight: 16 },
      { name: 'Systems and Application Security', weight: 15 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'pmi', slug: `pmi-rmp-p${n}`, code: `PMI-RMP-P${n}`,
    title: `PMI Risk Management Professional (PMI-RMP) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for PMI-RMP — a 150-minute, 65-question, blueprint-weighted set covering risk strategy & planning, risk identification, risk analysis, risk response, and monitor & close risks.`,
    level: 'Professional', durationMinutes: 150, passingScore: 75, questionCount: 65,
    domains: [
      { name: 'Risk Strategy and Planning', weight: 22 },
      { name: 'Risk Identification', weight: 23 },
      { name: 'Risk Analysis', weight: 23 },
      { name: 'Risk Response', weight: 13 },
      { name: 'Monitor and Close Risks', weight: 19 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'linuxfoundation', slug: `linuxfoundation-kcsa-p${n}`, code: `KCSA-P${n}`,
    title: `Kubernetes and Cloud Native Security Associate (KCSA) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the CNCF KCSA certification — a 90-minute, 65-question, blueprint-weighted set covering overview of cloud native security, Kubernetes cluster component security, Kubernetes security fundamentals, the Kubernetes threat model, platform security, and compliance & security frameworks. Aligned to the CNCF KCSA curriculum.`,
    level: 'Foundational', durationMinutes: 90, passingScore: 75, questionCount: 65,
    domains: [
      { name: 'Overview of Cloud Native Security', weight: 14 },
      { name: 'Kubernetes Cluster Component Security', weight: 22 },
      { name: 'Kubernetes Security Fundamentals', weight: 22 },
      { name: 'Kubernetes Threat Model', weight: 16 },
      { name: 'Platform Security', weight: 16 },
      { name: 'Compliance and Security Frameworks', weight: 10 }
    ]
  })),
  ...(['1', '2', '3'] as const).map((n): ExamSeed => ({
    vendorSlug: 'hashicorp', slug: `hashicorp-consul-associate-p${n}`, code: `CA-003-P${n}`,
    title: `HashiCorp Certified: Consul Associate (003) — Practice Exam ${n}`,
    description: `Practice exam ${n} of 3 for the HashiCorp Consul Associate (003) certification — a 60-minute, 65-question, blueprint-weighted set covering Consul architecture, deployment, service discovery & registration, service mesh, network infrastructure automation, and Consul security. Aligned to the HashiCorp Consul Associate 003 objectives.`,
    level: 'Associate', durationMinutes: 60, passingScore: 70, questionCount: 65,
    domains: [
      { name: 'Explain Consul Architecture', weight: 16 },
      { name: 'Deploy Consul', weight: 16 },
      { name: 'Service Discovery and Registration', weight: 18 },
      { name: 'Service Mesh', weight: 20 },
      { name: 'Network Infrastructure Automation', weight: 15 },
      { name: 'Consul Security', weight: 15 }
    ]
  }))
];

async function main() {
  const admins: { email: string; name: string; password: string }[] = [
    { email: 'angch@tertiaryinfotech.com', name: 'Alfred Ang', password: 'password123' },
    { email: 'marcus@tertiaryinfotech.com', name: 'Marcus', password: 'password123' }
  ];
  for (const a of admins) {
    const passwordHash = await argon2.hash(a.password);
    await db.user.upsert({
      where: { email: a.email },
      update: { name: a.name, role: Role.ADMIN, emailVerified: new Date(), passwordHash },
      create: {
        email: a.email,
        name: a.name,
        passwordHash,
        role: Role.ADMIN,
        emailVerified: new Date()
      }
    });
  }

  for (const v of VENDORS) {
    await db.vendor.upsert({
      where: { slug: v.slug },
      update: { name: v.name, description: v.description },
      create: v
    });
  }

  const vendorMap = Object.fromEntries(
    (await db.vendor.findMany()).map(v => [v.slug, v.id])
  );

  for (const e of EXAMS) {
    // Skip slugs marked obsolete — the cleanup pass below removes any
    // existing rows. Keeping the catalog entry in the source file (rather
    // than deleting it) preserves history and makes revival straightforward.
    if (OBSOLETE_EXAM_SLUGS.includes(e.slug)) continue;
    const isPublished = !HIDDEN_EXAM_SLUGS.includes(e.slug)
      && VISIBLE_VENDOR_SLUGS.includes(e.vendorSlug);
    await db.exam.upsert({
      where: { slug: e.slug },
      update: {
        // Sync catalog-content fields only. `questionCount` and `published`
        // are DELIBERATELY excluded: prod admins set them manually
        // (activate/deactivate, tune exam length) and this seed runs on
        // EVERY deploy (Docker CMD: migrate deploy && tsx prisma/seed.ts).
        // Overwriting them here silently reverts admin changes on every
        // deploy. Prod is authoritative for these — only `create` sets the
        // initial values for brand-new exams.
        title: e.title,
        description: e.description,
        level: e.level,
        durationMinutes: e.durationMinutes,
        passingScore: e.passingScore,
        domains: e.domains
      },
      create: {
        vendorId: vendorMap[e.vendorSlug],
        slug: e.slug,
        code: e.code,
        title: e.title,
        description: e.description,
        level: e.level,
        durationMinutes: e.durationMinutes,
        passingScore: e.passingScore,
        questionCount: e.questionCount,
        domains: e.domains,
        published: isPublished
      }
    });
  }

  // One-time cleanup: remove the obsolete CCA-F placeholder exam shells that
  // were replaced by the consolidated `anthropic-cca-foundations` slug.
  // Safe to delete because they were 0-question placeholders; we still cascade
  // any FK-attached rows (entitlements, questions, attempts, orders) defensively
  // in case the team-entitlement grant loop or admin actions touched them.
  const obsoleteExams = await db.exam.findMany({ where: { slug: { in: OBSOLETE_EXAM_SLUGS } } });
  if (obsoleteExams.length > 0) {
    const obsoleteIds = obsoleteExams.map(e => e.id);
    await db.entitlement.deleteMany({ where: { examId: { in: obsoleteIds } } });
    await db.question.deleteMany({ where: { examId: { in: obsoleteIds } } });
    await db.attempt.deleteMany({ where: { examId: { in: obsoleteIds } } });
    await db.order.deleteMany({ where: { examId: { in: obsoleteIds } } });
    await db.exam.deleteMany({ where: { slug: { in: OBSOLETE_EXAM_SLUGS } } });
    console.log(`✓ Removed ${obsoleteExams.length} obsolete placeholder exam shell(s).`);
  }

  // Curated dogfood set — grants the team enough exams to exercise every
  // My Exams UI path (expandable bundle card, standalone card, voucher strip)
  // without flooding the view with the entire catalog. Add to this list if
  // you need to smoke-test a specific exam path.
  const TEAM_GRANTS: { examSlug: string; tier: Tier }[] = [
    // AI-900 bundle: 3 P-variants collapse into one expandable bundle card.
    { examSlug: 'microsoft-ai-900-p1', tier: Tier.PRACTICE },
    { examSlug: 'microsoft-ai-900-p2', tier: Tier.PRACTICE },
    { examSlug: 'microsoft-ai-900-p3', tier: Tier.PRACTICE },
    // One VOUCHER row on the same bundle exercises the green "Voucher" strip
    // when the bundle card is expanded, and populates /my-content/vouchers.
    { examSlug: 'microsoft-ai-900-p1', tier: Tier.VOUCHER },
    // Standalone exam exercises the single-card UI in My Exams.
    { examSlug: 'anthropic-cca-foundations', tier: Tier.PRACTICE }
  ];

  const teamEmails = ['angch@tertiaryinfotech.com', 'marcus@tertiaryinfotech.com'];
  const teamUsers = await db.user.findMany({ where: { email: { in: teamEmails } } });
  const grantSlugs = [...new Set(TEAM_GRANTS.map(g => g.examSlug))];
  const grantExams = await db.exam.findMany({
    where: { slug: { in: grantSlugs } },
    select: { id: true, slug: true }
  });
  const slugToExamId = new Map(grantExams.map(e => [e.slug, e.id]));
  const allowedExamIds = new Set(grantExams.map(e => e.id));

  for (const u of teamUsers) {
    // Upsert the curated grants.
    for (const g of TEAM_GRANTS) {
      const examId = slugToExamId.get(g.examSlug);
      if (!examId) continue;
      await db.entitlement.upsert({
        where: { userId_examId_tier: { userId: u.id, examId, tier: g.tier } },
        update: {},
        create: { userId: u.id, examId, tier: g.tier }
      });
    }

    // Revoke any previously-seeded entitlements for this user that aren't in
    // the curated list. Real purchases (PAID Orders, real or test-payment)
    // are preserved by deriving the (examId, tier) set from this user's PAID
    // orders and treating those as untouchable. Voucher codes also get a
    // pass — they're real fulfillment artefacts that the user may need.
    const paidOrders = await db.order.findMany({
      where: { userId: u.id, status: 'PAID' },
      select: { examId: true, tier: true, bundleId: true }
    });
    const protectedExamIds = new Set<string>(allowedExamIds);
    for (const o of paidOrders) {
      if (o.examId) protectedExamIds.add(o.examId);
      if (o.bundleId) {
        const items = await db.bundleItem.findMany({
          where: { bundleId: o.bundleId },
          select: { examId: true }
        });
        for (const it of items) protectedExamIds.add(it.examId);
      }
    }
    const stale = await db.entitlement.findMany({
      where: {
        userId: u.id,
        examId: { notIn: [...protectedExamIds] },
        voucher: null
      },
      select: { id: true }
    });
    if (stale.length > 0) {
      await db.entitlement.deleteMany({ where: { id: { in: stale.map(s => s.id) } } });
    }
  }

  // Seed bundles. The seed file is the source of truth for what bundles
  // are offered — any existing Bundle rows not present in BUNDLES are
  // unpublished (not deleted, to preserve referential integrity with
  // any historical Order.bundleId references).
  const examMap = Object.fromEntries((await db.exam.findMany()).map(e => [e.slug, e.id]));
  const seededSlugs = new Set(BUNDLES.map(b => b.slug));
  // Unpublish bundles no longer in the seed list.
  await db.bundle.updateMany({
    where: { slug: { notIn: [...seededSlugs] }, published: true },
    data: { published: false }
  });
  // Auto-create variant exams (e.g. aws-aif-c01-p1, comptia-cloud-plus-practice-3)
  // when a Bundle references a slug that doesn't yet exist. Two paths:
  //   1. If the base exam exists (slug with the -pN / -practice-N suffix stripped)
  //      → clone it so the variant inherits pricing, level, duration, etc.
  //   2. If neither variant nor base exists → infer vendor from the variant
  //      slug's prefix and build a stub exam using the parent bundle's metadata.
  // Stamps the per-variant `label` field so the View Exams table shows
  // e.g. "Practice Exam 3".
  const vendorSlugBySlug: Record<string, string> = Object.fromEntries(
    (await db.vendor.findMany({ select: { id: true, slug: true } })).map((v) => [v.slug, v.id])
  );
  const VENDOR_SLUGS_BY_LENGTH = Object.keys(vendorSlugBySlug).sort((a, b) => b.length - a.length);
  function inferVendorId(slug: string): string | null {
    for (const vs of VENDOR_SLUGS_BY_LENGTH) {
      if (slug === vs || slug.startsWith(`${vs}-`)) return vendorSlugBySlug[vs];
    }
    return null;
  }

  // Map of bundle base slugs whose underlying certification has an opaque
  // vendor exam code that can't be derived from the slug. Verified against
  // the vendor sites in May 2026 — update when CompTIA/Cisco refresh codes.
  const VENDOR_EXAM_CODE_OVERRIDES: Record<string, string> = {
    'comptia-cloud-plus': 'CV0-004',
    'comptia-server-plus': 'SK0-005',
    'comptia-linux-plus': 'XK0-005',
    'comptia-data-plus': 'DA0-001',
    'comptia-network-plus': 'N10-009',
    'comptia-security-plus': 'SY0-701',
    'cisco-ccna': '200-301',
    'cisco-ccnp-encor': '350-401'
  };
  function vendorExamCodeFor(baseSlug: string): string {
    if (VENDOR_EXAM_CODE_OVERRIDES[baseSlug]) return VENDOR_EXAM_CODE_OVERRIDES[baseSlug];
    const vendorSlug = VENDOR_SLUGS_BY_LENGTH.find((vs) => baseSlug === vs || baseSlug.startsWith(`${vs}-`)) ?? '';
    return (vendorSlug ? baseSlug.slice(vendorSlug.length + 1) : baseSlug).toUpperCase();
  }

  let variantsCreated = 0;
  let variantsRecoded = 0;
  for (const b of BUNDLES) {
    for (const item of b.items) {
      const m = item.examSlug.match(/^(.+?)-(?:p|practice-)(\d+)$/);
      if (!m) continue;
      const baseSlug = m[1];
      const idx = Number(m[2]);
      const expectedCode = `${vendorExamCodeFor(baseSlug)}-P${idx}`;

      // If the variant already exists, just fix its code if needed — this
      // recodes the existing CLOUD-PLUS-P1 → CV0-004-P1 etc. on re-seed.
      if (examMap[item.examSlug]) {
        const existing = await db.exam.findUnique({ where: { id: examMap[item.examSlug] }, select: { code: true } });
        if (existing && existing.code !== expectedCode) {
          await db.exam.update({ where: { id: examMap[item.examSlug] }, data: { code: expectedCode } });
          variantsRecoded++;
        }
        continue;
      }

      const baseId = examMap[baseSlug];
      let data: any;
      if (baseId) {
        const base = await db.exam.findUnique({ where: { id: baseId } });
        if (!base) continue;
        data = {
          vendorId: base.vendorId,
          code: expectedCode,
          slug: item.examSlug,
          title: `${base.title} (Practice Exam ${idx})`,
          description: base.description,
          level: base.level,
          durationMinutes: base.durationMinutes,
          passingScore: base.passingScore,
          questionCount: base.questionCount,
          infoUrl: base.infoUrl,
          label: `Practice Exam ${idx}`,
          domains: base.domains as any,
          published: base.published
        };
      } else {
        const vendorId = inferVendorId(item.examSlug);
        if (!vendorId) continue;
        data = {
          vendorId,
          code: expectedCode,
          slug: item.examSlug,
          title: `${b.title} (Practice Exam ${idx})`,
          description: b.description,
          level: 'Associate',
          durationMinutes: 90,
          passingScore: 70,
          questionCount: 60,
          label: `Practice Exam ${idx}`,
          domains: [],
          published: true
        };
      }
      const created = await db.exam.create({ data });
      examMap[item.examSlug] = created.id;
      variantsCreated++;
    }
  }
  if (variantsCreated > 0) console.log(`✓ Auto-created ${variantsCreated} variant exams from bundle references`);
  if (variantsRecoded > 0) console.log(`✓ Recoded ${variantsRecoded} existing variant exams to current vendor exam codes`);

  for (const b of BUNDLES) {
    const bundle = await db.bundle.upsert({
      where: { slug: b.slug },
      update: { title: b.title, description: b.description, price: b.price, priceVoucher: b.priceVoucher ?? null, published: true },
      create: { slug: b.slug, title: b.title, description: b.description, price: b.price, priceVoucher: b.priceVoucher ?? null, published: true }
    });
    await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
    for (const item of b.items) {
      const examId = examMap[item.examSlug];
      if (!examId) {
        console.warn(`  ⚠ Bundle "${b.slug}" references unknown exam slug "${item.examSlug}" — skipping`);
        continue;
      }
      await db.bundleItem.create({
        data: { bundleId: bundle.id, examId, tier: item.tier as Tier, position: item.position ?? 0 }
      });
    }
  }

  // Ensure every visible exam has up to 10 isTeaser questions so the
  // "Try 10 questions for free" teaser link always lands on a real
  // 10-question attempt. Top-up only — never unflags existing teasers.
  // Idempotent: skips exams that already have >= 10.
  const examsWithContent = await db.exam.findMany({
    where: { published: true, questions: { some: { status: QStatus.PUBLISHED } } },
    select: { id: true, slug: true }
  });
  let topUpTotal = 0;
  for (const e of examsWithContent) {
    const teaserCount = await db.question.count({
      where: { examId: e.id, isTeaser: true, status: QStatus.PUBLISHED }
    });
    if (teaserCount >= 10) continue;
    const need = 10 - teaserCount;
    const candidates = await db.question.findMany({
      where: { examId: e.id, isTeaser: false, status: QStatus.PUBLISHED },
      take: need,
      orderBy: { createdAt: 'asc' },
      select: { id: true }
    });
    if (candidates.length === 0) continue;
    await db.question.updateMany({
      where: { id: { in: candidates.map(c => c.id) } },
      data: { isTeaser: true }
    });
    topUpTotal += candidates.length;
  }
  if (topUpTotal > 0) console.log(`✓ Topped up ${topUpTotal} questions to isTeaser=true across ${examsWithContent.length} exams`);

  // Sample testimonials — only created if the table is empty so re-seeding
  // doesn't clobber curated admin content.
  const tcount = await db.testimonial.count();
  if (tcount === 0) {
    const samples = [
      { authorName: 'Priya S.', authorTitle: 'Cloud Engineer', quote: 'Passed AWS SAA-C03 on my first try. The per-domain breakdown showed me exactly where to focus my last week of study.', rating: 5 },
      { authorName: 'Marco D.', authorTitle: 'IT Operations Lead', quote: 'The Exam Mode timer pressure was so realistic that the actual test felt easier. Great explanations on every question.', rating: 5 },
      { authorName: 'Aisha R.', authorTitle: 'Data Analyst', quote: 'AZ-900 cleared in two weeks of evenings. The free teaser convinced me the content was solid before I paid.', rating: 5 },
      { authorName: 'Jonas H.', authorTitle: 'Solutions Architect', quote: 'Original questions — clearly not exam dumps — but the difficulty and topic spread were spot on.', rating: 4 },
      { authorName: 'Lena K.', authorTitle: 'DevOps Engineer', quote: 'I loved being able to flag tricky questions and revisit them. The review screen after submitting is gold.', rating: 5 },
      { authorName: 'Tomás P.', authorTitle: 'Security Analyst', quote: 'The bundle with voucher saved me hours of shopping around. Practiced and booked the exam in one workflow.', rating: 5 }
    ];
    for (let i = 0; i < samples.length; i++) {
      await db.testimonial.create({ data: { ...samples[i], published: true, sortOrder: i } });
    }
    console.log(`✓ Seeded ${samples.length} sample testimonials`);
  }

  console.log(`Seed complete. Vendors: ${VENDORS.length}, Exams: ${EXAMS.length}, Bundles: ${BUNDLES.length}. Admins: ${admins.map(a => a.email).join(', ')}`);
}

main().finally(() => db.$disconnect());
