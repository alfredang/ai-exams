/**
 * Official exam-domain weightings, keyed by product (Bundle) slug.
 *
 * Every practice-exam attempt is drawn from the question pool in these
 * proportions (see src/lib/question-pool.ts). Applied to the pool exam on
 * deploy by consolidateExamPools() whenever `verifiedAt` is newer than the
 * exam's stored `domainsVerifiedAt` — bump `verifiedAt` after re-checking a
 * vendor page. Domain `name`s must stay the strings our questions are tagged
 * with; `aliases` relabels legacy question tags onto them.
 */
export type ExamBlueprint = {
  sourceUrl?: string;
  verifiedAt?: string; // ISO date the weights were checked against sourceUrl
  domains?: { name: string; weight: number }[];
  aliases?: Record<string, string>; // legacy Question.domain → blueprint name
  // Official subtopics per domain name, shown in the product page's domain
  // accordion. Display-only — kept out of `domains` so the weights stay the
  // only thing the deploy fold compares and writes.
  topics?: Record<string, string[]>;
  // Product page "References" section.
  examPageUrl?: string; // vendor's official exam / certification page
  studyGuideUrl?: string; // vendor's official exam guide / objectives / study guide
};

// Weights below were checked against each vendor's official exam guide on
// 2026-10-22. Where the vendor gives a range (e.g. Microsoft "25–30%") the
// midpoint is used, normalised to whole numbers summing to 100. Products whose
// vendor publishes no weights (HashiCorp, Elastic, Oracle, Red Hat, Scrum.org)
// are absent and keep the weights stored on the exam.
export const EXAM_BLUEPRINTS: Record<string, ExamBlueprint> = {
  'anthropic-cca-foundations': {
    sourceUrl: 'https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Agentic Architecture & Orchestration', weight: 27 },
      { name: 'Tool Design & MCP Integration', weight: 18 },
      { name: 'Claude Code Configuration & Workflows', weight: 20 },
      { name: 'Prompt Engineering & Structured Output', weight: 20 },
      { name: 'Context Management & Reliability', weight: 15 }
    ]
  },
  'anthropic-ccao-foundations': {
    sourceUrl: 'https://anthropic-partners.skilljar.com/claude-certified-associate-foundations-certification',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Prompting and Task Execution', weight: 14 },
      { name: 'Output Evaluation and Validation', weight: 21 },
      { name: 'Product and Model Selection', weight: 12 },
      { name: 'Workflow Integration and Solution Design', weight: 16 },
      { name: 'Configuration and Knowledge Management', weight: 12 },
      { name: 'Governance, Risk, and Responsible Use', weight: 15 },
      { name: 'Troubleshooting and Optimization', weight: 10 }
    ]
  },
  'aws-aif-c01': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Fundamentals of AI and ML', weight: 20 },
      { name: 'Fundamentals of Generative AI', weight: 24 },
      { name: 'Applications of Foundation Models', weight: 28 },
      { name: 'Guidelines for Responsible AI', weight: 14 },
      { name: 'Security, Compliance, and Governance for AI', weight: 14 }
    ],
    aliases: {
      'Security, Compliance, and Governance for AI Solutions': 'Security, Compliance, and Governance for AI'
    }
  },
  'aws-clf-c02': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Cloud Concepts', weight: 24 },
      { name: 'Security and Compliance', weight: 30 },
      { name: 'Cloud Technology and Services', weight: 34 },
      { name: 'Billing, Pricing, and Support', weight: 12 }
    ]
  },
  'aws-dea-c01': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Data Ingestion and Transformation', weight: 34 },
      { name: 'Data Store Management', weight: 26 },
      { name: 'Data Operations and Support', weight: 22 },
      { name: 'Data Security and Governance', weight: 18 }
    ]
  },
  'aws-dop-c02': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/devops-engineer-professional-02/devops-engineer-professional-02.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'SDLC Automation', weight: 22 },
      { name: 'Configuration Management and IaC', weight: 17 },
      { name: 'Resilient Cloud Solutions', weight: 15 },
      { name: 'Monitoring and Logging', weight: 15 },
      { name: 'Incident and Event Response', weight: 14 },
      { name: 'Security and Compliance', weight: 17 }
    ]
  },
  'aws-dva-c02': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Development with AWS Services', weight: 32 },
      { name: 'Security', weight: 26 },
      { name: 'Deployment', weight: 24 },
      { name: 'Troubleshooting and Optimization', weight: 18 }
    ]
  },
  'aws-mla-c01': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/machine-learning-engineer-associate-02.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Data Preparation for Machine Learning (ML)', weight: 28 },
      { name: 'ML Model Development', weight: 24 },
      { name: 'Deployment and Orchestration of ML Workflows', weight: 24 },
      { name: 'ML Solution Monitoring, Maintenance, and Security', weight: 24 }
    ]
  },
  'aws-saa-c03': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Design Secure Architectures', weight: 30 },
      { name: 'Design Resilient Architectures', weight: 26 },
      { name: 'Design High-Performing Architectures', weight: 24 },
      { name: 'Design Cost-Optimized Architectures', weight: 20 }
    ]
  },
  'aws-sap-c02': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Design Solutions for Organizational Complexity', weight: 26 },
      { name: 'Design for New Solutions', weight: 29 },
      { name: 'Continuous Improvement for Existing Solutions', weight: 25 },
      { name: 'Accelerate Workload Migration and Modernization', weight: 20 }
    ]
  },
  'aws-soa-c03': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/sysops-administrator-associate-03/sysops-administrator-associate-03.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Monitoring, Logging, Analysis, Remediation, and Performance Optimization', weight: 22 },
      { name: 'Reliability and Business Continuity', weight: 22 },
      { name: 'Deployment, Provisioning, and Automation', weight: 22 },
      { name: 'Security and Compliance', weight: 16 },
      { name: 'Networking and Content Delivery', weight: 18 }
    ]
  },
  'axelos-itil4-foundation': {
    sourceUrl: 'https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-4-foundation-2565',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Key Concepts of Service Management', weight: 13 },
      { name: 'The Four Dimensions and Guiding Principles', weight: 20 },
      { name: 'Service Value System and Value Chain', weight: 7 },
      { name: 'ITIL Practices', weight: 60 }
    ]
  },
  'cisco-ccna': {
    sourceUrl: 'https://learningnetwork.cisco.com/s/ccna-exam-topics',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Network Fundamentals', weight: 20 },
      { name: 'Network Access', weight: 20 },
      { name: 'IP Connectivity', weight: 25 },
      { name: 'IP Services', weight: 10 },
      { name: 'Security Fundamentals', weight: 15 },
      { name: 'Automation and Programmability', weight: 10 }
    ]
  },
  'cisco-ccnp-encor': {
    sourceUrl: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/350-401-ENCORE-v1.2.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Architecture', weight: 15 },
      { name: 'Virtualization', weight: 10 },
      { name: 'Infrastructure', weight: 30 },
      { name: 'Network Assurance', weight: 10 },
      { name: 'Security', weight: 20 },
      { name: 'Automation', weight: 15 }
    ]
  },
  'cisco-ccnp-security-350-701': {
    sourceUrl: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/350-701-SCOR-v2.0.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Security Concepts', weight: 20 },
      { name: 'Network Security', weight: 25 },
      { name: 'Securing the Cloud', weight: 15 },
      { name: 'Content Security', weight: 10 },
      { name: 'Endpoint Protection and Detection', weight: 15 },
      { name: 'Secure Network Access, Visibility, and Enforcement', weight: 15 }
    ]
  },
  'cisco-devnet-associate-200-901': {
    sourceUrl: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/200-901-CCNAAUTO_v.1.1.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Software Development and Design', weight: 15 },
      { name: 'Understanding and Using APIs', weight: 20 },
      { name: 'Cisco Platforms and Development', weight: 15 },
      { name: 'Application Deployment and Security', weight: 15 },
      { name: 'Infrastructure and Automation', weight: 20 },
      { name: 'Network Fundamentals', weight: 15 }
    ]
  },
  'comptia-a-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/a/core-1-and-2-v15/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Hardware', weight: 20 },
      { name: 'Networking', weight: 18 },
      { name: 'Mobile Devices and Virtualization', weight: 12 },
      { name: 'Operating Systems', weight: 14 },
      { name: 'Security', weight: 14 },
      { name: 'Software and Operational Troubleshooting', weight: 22 }
    ]
  },
  'comptia-cloud-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/cloud/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Cloud Architecture and Design', weight: 26 },
      { name: 'Deployment', weight: 21 },
      { name: 'Operations and Support', weight: 19 },
      { name: 'Security', weight: 21 },
      { name: 'Troubleshooting', weight: 13 }
    ]
  },
  'comptia-data-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/data/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Data Concepts and Environments', weight: 20 },
      { name: 'Data Mining', weight: 22 },
      { name: 'Data Analysis', weight: 24 },
      { name: 'Visualization', weight: 20 },
      { name: 'Data Governance, Quality, and Controls', weight: 14 }
    ]
  },
  'comptia-linux-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/linux/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'System Management', weight: 43 },
      { name: 'Security', weight: 18 },
      { name: 'Scripting, Containers, and Automation', weight: 17 },
      { name: 'Troubleshooting', weight: 22 }
    ]
  },
  'comptia-network-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/network/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Networking Concepts', weight: 23 },
      { name: 'Network Implementation', weight: 20 },
      { name: 'Network Operations', weight: 19 },
      { name: 'Network Security', weight: 14 },
      { name: 'Network Troubleshooting', weight: 24 }
    ]
  },
  'comptia-pentest-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/pentest/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Engagement Management', weight: 13 },
      { name: 'Reconnaissance and Enumeration', weight: 21 },
      { name: 'Vulnerability Discovery and Analysis', weight: 17 },
      { name: 'Attacks and Exploits', weight: 35 },
      { name: 'Post-exploitation and Lateral Movement', weight: 14 }
    ]
  },
  'comptia-project-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/project/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Project Management Concepts', weight: 33 },
      { name: 'Project Life Cycle Phases', weight: 30 },
      { name: 'Tools and Documentation', weight: 19 },
      { name: 'Basics of IT and Governance', weight: 18 }
    ]
  },
  'comptia-security-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/security/v7/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'General Security Concepts', weight: 12 },
      { name: 'Threats, Vulnerabilities, and Mitigations', weight: 22 },
      { name: 'Security Architecture', weight: 18 },
      { name: 'Security Operations', weight: 28 },
      { name: 'Security Program Management and Oversight', weight: 20 }
    ]
  },
  'comptia-securityx': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/securityx/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Governance, Risk, and Compliance', weight: 20 },
      { name: 'Security Architecture', weight: 27 },
      { name: 'Security Engineering', weight: 31 },
      { name: 'Security Operations', weight: 22 }
    ]
  },
  'comptia-server-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/server/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Server Hardware Installation and Management', weight: 18 },
      { name: 'Server Administration', weight: 30 },
      { name: 'Security and Disaster Recovery', weight: 24 },
      { name: 'Troubleshooting', weight: 28 }
    ]
  },
  'docker-dca': {
    sourceUrl: 'https://training.mirantis.com/certification/dca-certification-exam/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Orchestration', weight: 25 },
      { name: 'Image Creation, Management, and Registry', weight: 20 },
      { name: 'Installation and Configuration', weight: 15 },
      { name: 'Networking', weight: 15 },
      { name: 'Security', weight: 15 },
      { name: 'Storage and Volumes', weight: 10 }
    ]
  },
  'github-foundations': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-900',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Introduction to Git and GitHub', weight: 38 },
      { name: 'Working with GitHub Repositories', weight: 17 },
      { name: 'Collaboration Features', weight: 17 },
      { name: 'GitHub Ecosystem and AI Tools', weight: 28 }
    ]
  },
  'gitlab-certified-associate': {
    sourceUrl: 'https://university.gitlab.com/courses/gitlab-certified-fundamentals-associate',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Git and GitLab Fundamentals', weight: 16 },
      { name: 'Source Code Management and Workflows', weight: 28 },
      { name: 'CI/CD Pipelines', weight: 30 },
      { name: 'Project Management and Collaboration', weight: 12 },
      { name: 'Security and Compliance Basics', weight: 14 }
    ]
  },
  'google-ace': {
    sourceUrl: 'https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Setting up a cloud solution environment', weight: 20 },
      { name: 'Planning and configuring a cloud solution', weight: 15 },
      { name: 'Deploying and implementing a cloud solution', weight: 15 },
      { name: 'Ensuring successful operation of a cloud solution', weight: 30 },
      { name: 'Configuring access and security', weight: 20 }
    ]
  },
  'google-professional-cloud-architect': {
    sourceUrl: 'https://services.google.com/fh/files/misc/professional_cloud_architect_exam_guide_english.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Designing and planning a cloud solution architecture', weight: 25 },
      { name: 'Managing and provisioning a solution infrastructure', weight: 18 },
      { name: 'Designing for security and compliance', weight: 18 },
      { name: 'Analyzing and optimizing technical and business processes', weight: 15 },
      { name: 'Managing implementation', weight: 12 },
      { name: 'Ensuring solution and operations reliability', weight: 12 }
    ]
  },
  'google-professional-cloud-devops-engineer': {
    sourceUrl: 'https://services.google.com/fh/files/misc/professional_cloud_devops_engineer_exam_guide_english.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Bootstrapping and Managing a Google Cloud Organization', weight: 20 },
      { name: 'Building and Implementing CI/CD Pipelines', weight: 25 },
      { name: 'Applying Site Reliability Engineering Practices', weight: 18 },
      { name: 'Implementing Observability', weight: 25 },
      { name: 'Optimizing Service Performance', weight: 12 }
    ]
  },
  'google-professional-cloud-network-engineer': {
    sourceUrl: 'https://services.google.com/fh/files/misc/professional_cloud_network_engineer_exam_guide_english.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Designing, Planning, and Prototyping a Google Cloud Network', weight: 24 },
      { name: 'Implementing Virtual Private Cloud Instances', weight: 23 },
      { name: 'Configuring Network Services', weight: 19 },
      { name: 'Implementing Hybrid Interconnectivity', weight: 18 },
      { name: 'Managing, Monitoring, and Optimizing Network Operations', weight: 16 }
    ]
  },
  'google-professional-data-engineer': {
    sourceUrl: 'https://services.google.com/fh/files/misc/professional_data_engineer_exam_guide_english.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Designing data processing systems', weight: 22 },
      { name: 'Ingesting and processing the data', weight: 25 },
      { name: 'Storing the data', weight: 20 },
      { name: 'Preparing and using data for analysis', weight: 15 },
      { name: 'Maintaining and automating data workloads', weight: 18 }
    ]
  },
  'google-professional-ml-engineer': {
    sourceUrl: 'https://services.google.com/fh/files/misc/professional_machine_learning_engineer_exam_guide_english.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Architecting low-code AI solutions', weight: 13 },
      { name: 'Collaborating within and across teams to manage data and models', weight: 16 },
      { name: 'Scaling prototypes into ML models', weight: 20 },
      { name: 'Serving and scaling models', weight: 20 },
      { name: 'Automating and orchestrating ML pipelines', weight: 18 },
      { name: 'Monitoring AI solutions', weight: 13 }
    ]
  },
  'iassc-lean-six-sigma-green-belt': {
    sourceUrl: 'https://iassc.org/six-sigma-certification/green-belt-certification/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Define Phase', weight: 20 },
      { name: 'Measure Phase', weight: 20 },
      { name: 'Analyze Phase', weight: 20 },
      { name: 'Improve Phase', weight: 20 },
      { name: 'Control Phase', weight: 20 }
    ]
  },
  'isc2-cc': {
    sourceUrl: 'https://www.isc2.org/certifications/cc/cc-certification-exam-outline',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Security Principles', weight: 26 },
      { name: 'Business Continuity, Disaster Recovery and Incident Response', weight: 10 },
      { name: 'Access Controls Concepts', weight: 22 },
      { name: 'Network Security', weight: 24 },
      { name: 'Security Operations', weight: 18 }
    ]
  },
  'isc2-ccsp': {
    sourceUrl: 'https://www.isc2.org/certifications/ccsp/ccsp-certification-exam-outline',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Cloud Concepts, Architecture and Design', weight: 17 },
      { name: 'Cloud Data Security', weight: 20 },
      { name: 'Cloud Platform and Infrastructure Security', weight: 17 },
      { name: 'Cloud Application Security', weight: 16 },
      { name: 'Cloud Security Operations', weight: 17 },
      { name: 'Legal, Risk and Compliance', weight: 13 }
    ]
  },
  'isc2-cissp': {
    sourceUrl: 'https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Security and Risk Management', weight: 16 },
      { name: 'Asset Security', weight: 10 },
      { name: 'Security Architecture and Engineering', weight: 13 },
      { name: 'Communication and Network Security', weight: 13 },
      { name: 'Identity and Access Management', weight: 13 },
      { name: 'Security Assessment and Testing', weight: 12 },
      { name: 'Security Operations', weight: 13 },
      { name: 'Software Development Security', weight: 10 }
    ]
  },
  'isc2-sscp': {
    sourceUrl: 'https://www.isc2.org/certifications/sscp/sscp-certification-exam-outline',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Security Operations and Administration', weight: 16 },
      { name: 'Access Controls', weight: 15 },
      { name: 'Risk Identification, Monitoring, and Analysis', weight: 15 },
      { name: 'Incident Response and Recovery', weight: 14 },
      { name: 'Cryptography', weight: 9 },
      { name: 'Network and Communications Security', weight: 16 },
      { name: 'Systems and Application Security', weight: 15 }
    ]
  },
  'linuxfoundation-cka': {
    sourceUrl: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Cluster Architecture, Installation and Configuration', weight: 25 },
      { name: 'Workloads and Scheduling', weight: 15 },
      { name: 'Services and Networking', weight: 20 },
      { name: 'Storage', weight: 10 },
      { name: 'Troubleshooting', weight: 30 }
    ]
  },
  'linuxfoundation-ckad': {
    sourceUrl: 'https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Application Design and Build', weight: 20 },
      { name: 'Application Deployment', weight: 20 },
      { name: 'Application Observability and Maintenance', weight: 15 },
      { name: 'Application Environment, Configuration and Security', weight: 25 },
      { name: 'Services and Networking', weight: 20 }
    ]
  },
  'linuxfoundation-cks': {
    sourceUrl: 'https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Cluster Setup', weight: 15 },
      { name: 'Cluster Hardening', weight: 15 },
      { name: 'System Hardening', weight: 10 },
      { name: 'Minimize Microservice Vulnerabilities', weight: 20 },
      { name: 'Supply Chain Security', weight: 20 },
      { name: 'Monitoring, Logging and Runtime Security', weight: 20 }
    ]
  },
  'linuxfoundation-kcna': {
    sourceUrl: 'https://training.linuxfoundation.org/certification/kubernetes-cloud-native-associate/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Kubernetes Fundamentals', weight: 46 },
      { name: 'Container Orchestration', weight: 22 },
      { name: 'Cloud Native Architecture', weight: 16 },
      { name: 'Cloud Native Observability', weight: 8 },
      { name: 'Cloud Native Application Delivery', weight: 8 }
    ]
  },
  'linuxfoundation-kcsa': {
    sourceUrl: 'https://training.linuxfoundation.org/certification/kubernetes-and-cloud-native-security-associate-kcsa/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Overview of Cloud Native Security', weight: 14 },
      { name: 'Kubernetes Cluster Component Security', weight: 22 },
      { name: 'Kubernetes Security Fundamentals', weight: 22 },
      { name: 'Kubernetes Threat Model', weight: 16 },
      { name: 'Platform Security', weight: 16 },
      { name: 'Compliance and Security Frameworks', weight: 10 }
    ]
  },
  'microsoft-ai-900': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-900',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Describe Artificial Intelligence workloads and considerations', weight: 19 },
      { name: 'Describe fundamental principles of machine learning on Azure', weight: 19 },
      { name: 'Describe features of computer vision workloads on Azure', weight: 19 },
      { name: 'Describe features of Natural Language Processing (NLP) workloads on Azure', weight: 19 },
      { name: 'Describe features of generative AI workloads on Azure', weight: 24 }
    ]
  },
  'microsoft-az-104': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Manage Azure identities and governance', weight: 24 },
      { name: 'Implement and manage storage', weight: 19 },
      { name: 'Deploy and manage Azure compute resources', weight: 24 },
      { name: 'Implement and manage virtual networking', weight: 19 },
      { name: 'Monitor and maintain Azure resources', weight: 14 }
    ]
  },
  'microsoft-az-204': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-204',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Develop Azure compute solutions', weight: 30 },
      { name: 'Develop for Azure storage', weight: 19 },
      { name: 'Implement Azure security', weight: 19 },
      { name: 'Monitor, troubleshoot, and optimize Azure solutions', weight: 8 },
      { name: 'Connect to and consume Azure services and third-party services', weight: 24 }
    ]
  },
  'microsoft-az-305': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Design identity, governance, and monitoring solutions', weight: 28 },
      { name: 'Design data storage solutions', weight: 22 },
      { name: 'Design business continuity solutions', weight: 17 },
      { name: 'Design infrastructure solutions', weight: 33 }
    ]
  },
  'microsoft-dp-300': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-300',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Plan and implement data platform resources', weight: 17 },
      { name: 'Implement a secure environment', weight: 22 },
      { name: 'Monitor, configure, and optimize database resources', weight: 22 },
      { name: 'Configure and manage automation of tasks', weight: 17 },
      { name: 'Plan and configure a high availability and disaster recovery (HADR) environment', weight: 22 }
    ]
  },
  'microsoft-dp-600': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-600',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Plan, Implement, and Manage a Solution for Data Analytics', weight: 27 },
      { name: 'Prepare and Serve Data', weight: 46 },
      { name: 'Implement and Manage Semantic Models', weight: 27 },
      { name: 'Explore and Analyze Data', weight: 0 }
    ]
  },
  'microsoft-dp-900': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-900',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Describe core data concepts', weight: 29 },
      { name: 'Identify considerations for relational data on Azure', weight: 24 },
      { name: 'Describe considerations for non-relational data on Azure', weight: 18 },
      { name: 'Describe an analytics workload', weight: 29 }
    ],
    aliases: {
      'Describe analytics workloads on Azure': 'Describe an analytics workload'
    }
  },
  'microsoft-md-102': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/md-102',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Prepare infrastructure for devices', weight: 26 },
      { name: 'Manage and maintain devices', weight: 32 },
      { name: 'Manage applications', weight: 21 },
      { name: 'Protect devices', weight: 21 }
    ]
  },
  'microsoft-ms-102': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ms-102',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Deploy and manage a Microsoft 365 tenant', weight: 28 },
      { name: 'Implement and manage Microsoft Entra identity and access', weight: 27 },
      { name: 'Manage security and threats by using Microsoft Defender XDR', weight: 33 },
      { name: 'Manage compliance by using Microsoft Purview', weight: 12 }
    ]
  },
  'microsoft-ms-700': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ms-700',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Configure and manage a Teams environment', weight: 43 },
      { name: 'Manage teams, channels, chats, and apps', weight: 23 },
      { name: 'Manage meetings and calling', weight: 17 },
      { name: 'Monitor, report on, and troubleshoot Teams', weight: 17 }
    ]
  },
  'microsoft-pl-300': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Prepare the data', weight: 28 },
      { name: 'Model the data', weight: 28 },
      { name: 'Visualize and analyze the data', weight: 27 },
      { name: 'Manage and secure Power BI', weight: 17 }
    ]
  },
  'microsoft-pl-600': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-600',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Perform Solution Envisioning and Requirement Analysis', weight: 46 },
      { name: 'Architect a Solution', weight: 37 },
      { name: 'Implement the Solution', weight: 17 }
    ]
  },
  'microsoft-pl-900': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-900',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Describe the Business Value of Power Platform', weight: 8 },
      { name: 'Identify Core Components of Power Platform', weight: 23 },
      { name: 'Demonstrate the Capabilities of Power Apps', weight: 23 },
      { name: 'Demonstrate the Capabilities of Power Automate', weight: 23 },
      { name: 'Demonstrate the Capabilities of Power BI', weight: 0 },
      { name: 'Demonstrate the Capabilities of Power Pages and Copilot Studio', weight: 23 }
    ]
  },
  'microsoft-sc-100': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-100',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Design Solutions That Align with Security Best Practices and Priorities', weight: 22 },
      { name: 'Design Security Operations, Identity, and Compliance Capabilities', weight: 28 },
      { name: 'Design Security Solutions for Infrastructure', weight: 28 },
      { name: 'Design Security Solutions for Applications and Data', weight: 22 }
    ]
  },
  'microsoft-sc-200': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Manage a security operations environment', weight: 41 },
      { name: 'Respond to security incidents', weight: 37 },
      { name: 'Perform threat hunting', weight: 22 }
    ]
  },
  'microsoft-sc-300': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-300',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Implement Identities in Microsoft Entra', weight: 24 },
      { name: 'Implement Authentication and Access Management', weight: 29 },
      { name: 'Implement Access Management for Applications', weight: 24 },
      { name: 'Plan and Implement Identity Governance', weight: 23 }
    ]
  },
  'microsoft-sc-900': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Describe the concepts of security, compliance, and identity', weight: 12 },
      { name: 'Describe the capabilities of Microsoft Entra', weight: 28 },
      { name: 'Describe the capabilities of Microsoft security solutions', weight: 38 },
      { name: 'Describe the capabilities of Microsoft compliance solutions', weight: 22 }
    ]
  },
  'pmi-acp': {
    sourceUrl: 'https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/agile-certified-exam-outline.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Agile Principles and Mindset', weight: 16 },
      { name: 'Value-Driven Delivery', weight: 20 },
      { name: 'Stakeholder Engagement', weight: 17 },
      { name: 'Team Performance', weight: 16 },
      { name: 'Adaptive Planning', weight: 12 },
      { name: 'Problem Detection and Resolution', weight: 10 },
      { name: 'Continuous Improvement', weight: 9 }
    ]
  },
  'pmi-capm': {
    sourceUrl: 'https://www.pmi.org/certifications/certified-associate-capm',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Project Management Fundamentals and Core Concepts', weight: 36 },
      { name: 'Predictive, Plan-Based Methodologies', weight: 17 },
      { name: 'Agile Frameworks/Methodologies', weight: 20 },
      { name: 'Business Analysis Frameworks', weight: 27 }
    ]
  },
  'pmi-pmp': {
    sourceUrl: 'https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/new-pmp-examination-content-outline-2026.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'People', weight: 33 },
      { name: 'Process', weight: 41 },
      { name: 'Business Environment', weight: 26 }
    ]
  },
  'pmi-rmp': {
    sourceUrl: 'https://www.pmi.org/certifications/risk-management-rmp',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Risk Strategy and Planning', weight: 22 },
      { name: 'Risk Identification', weight: 23 },
      { name: 'Risk Analysis', weight: 23 },
      { name: 'Risk Response', weight: 13 },
      { name: 'Monitor and Close Risks', weight: 19 }
    ]
  },
  'scrum-org-psm-i': {
    aliases: {
      'Scrum Artifacts & Definition of Done': 'Scrum Artifacts',
      'Scrum Team & Accountabilities': 'Scrum Team',
      'Scrum Framework & Theory': 'Scrum Theory'
    }
  },
  'tableau-desktop-specialist': {
    sourceUrl: 'https://help.salesforce.com/s/articleView?id=005298988&language=en_US&type=1',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Connecting to and Preparing Data', weight: 23 },
      { name: 'Exploring and Analyzing Data', weight: 37 },
      { name: 'Sharing Insights', weight: 25 },
      { name: 'Understanding Tableau Concepts', weight: 15 }
    ]
  },
  'tableau-tcda': {
    sourceUrl: 'https://help.salesforce.com/s/articleView?id=005298984&language=en_US&type=1',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Connect to and Transform Data', weight: 24 },
      { name: 'Explore and Analyze Data', weight: 41 },
      { name: 'Create Content', weight: 26 },
      { name: 'Publish and Manage Content', weight: 9 }
    ]
  }
};
