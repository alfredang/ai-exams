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
    ],
    examPageUrl: 'https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification',
    studyGuideUrl: 'https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf',
    topics: {
      'Agentic Architecture & Orchestration': [
        'Design and implement agentic loops for autonomous task execution',
        'Orchestrate multi-agent systems with coordinator-subagent patterns',
        'Configure subagent invocation, context passing, and spawning',
        'Implement multi-step workflows with enforcement and handoff patterns',
        'Apply Agent SDK hooks for tool call interception and data normalization',
        'Design task decomposition strategies for complex workflows',
        'Manage session state, resumption, and forking'
      ],
      'Tool Design & MCP Integration': [
        'Design effective tool interfaces with clear descriptions and boundaries',
        'Implement structured error responses for MCP tools',
        'Distribute tools appropriately across agents and configure tool choice',
        'Integrate MCP servers into Claude Code and agent workflows',
        'Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively'
      ],
      'Claude Code Configuration & Workflows': [
        'Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization',
        'Create and configure custom slash commands and skills',
        'Apply path-specific rules for conditional convention loading',
        'Determine when to use plan mode vs direct execution',
        'Apply iterative refinement techniques for progressive improvement',
        'Integrate Claude Code into CI/CD pipelines'
      ],
      'Prompt Engineering & Structured Output': [
        'Design prompts with explicit criteria to improve precision and reduce false positives',
        'Apply few-shot prompting to improve output consistency and quality',
        'Enforce structured output using tool use and JSON schemas',
        'Implement validation, retry, and feedback loops for extraction quality',
        'Design efficient batch processing strategies',
        'Design multi-instance and multi-pass review architectures'
      ],
      'Context Management & Reliability': [
        'Manage conversation context to preserve critical information across long interactions',
        'Design effective escalation and ambiguity resolution patterns',
        'Implement error propagation strategies across multi-agent systems',
        'Manage context effectively in large codebase exploration',
        'Design human review workflows and confidence calibration',
        'Preserve information provenance and handle uncertainty in multi-source synthesis'
      ]
    }
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
    ],
    examPageUrl: 'https://anthropic-partners.skilljar.com/claude-certified-associate-foundations-certification',
    studyGuideUrl: 'https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf',
    topics: {
      'Prompting and Task Execution': [
        'Create effective prompts for business and technical tasks',
        'Apply task decomposition techniques to structure complex requests',
        'Iterate prompts to improve output quality',
        'Adapt prompting strategies to task type (analysis, research, drafting, brainstorming)'
      ],
      'Output Evaluation and Validation': [
        'Evaluate Claude-generated outputs for accuracy and completeness',
        'Identify hallucinations, inconsistencies, and biases in responses',
        'Apply fact-checking and validation techniques',
        'Determine when human review or additional verification is required',
        'Edit, adapt, refine, and compare outputs for the intended audience',
        'Organize information and select output formats (artifacts, inline, structured data)'
      ],
      'Product and Model Selection': [
        'Select appropriate Claude product features (Projects, research mode, chat, artifacts)',
        'Differentiate between Claude model types (Haiku, Sonnet, Opus)',
        'Align model selection with task requirements (cost, speed, quality)',
        'Manage context limitations and memory (when to restart, summarize, or persist)'
      ],
      'Workflow Integration and Solution Design': [
        'Apply Claude to analyze requirements and use cases',
        'Leverage Claude for research, planning, and process optimization',
        'Use Claude to support solution design, development, and iteration',
        'Integrate Claude into existing workflows to augment or redesign them',
        'Communicate Claude\'s value and limitations to stakeholders'
      ],
      'Configuration and Knowledge Management': [
        'Configure Claude Projects with instructions and knowledge sources',
        'Manage uploaded knowledge and connectors (e.g., Google Drive, Gmail)',
        'Create effective system-level instructions',
        'Maintain and update Claude configurations, knowledge sources, and instructions'
      ],
      'Governance, Risk, and Responsible Use': [
        'Identify appropriate and inappropriate use cases',
        'Apply data sensitivity, regulatory, and privacy considerations',
        'Follow organizational AI policies and governance standards',
        'Understand the ethical implications of AI usage'
      ],
      'Troubleshooting and Optimization': [
        'Identify, diagnose, and resolve issues with underperforming prompts or poor outputs',
        'Adjust approach based on feedback and results',
        'Optimize workflows for efficiency and effectiveness'
      ]
    }
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
    },
    examPageUrl: 'https://aws.amazon.com/certification/certified-ai-practitioner/',
    studyGuideUrl: 'https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html',
    topics: {
      'Fundamentals of AI and ML': [
        'Explain basic AI concepts and terminologies',
        'Identify practical use cases for AI',
        'Describe the AI/ML development lifecycle'
      ],
      'Fundamentals of Generative AI': [
        'Explain the basic concepts of generative AI',
        'Understand the capabilities and limitations of GenAI for solving business problems',
        'Describe AWS infrastructure and technologies for building GenAI applications'
      ],
      'Applications of Foundation Models': [
        'Describe design considerations for applications that use foundation models',
        'Choose effective prompt engineering techniques',
        'Describe the training and fine-tuning process for foundation models',
        'Describe methods to evaluate foundation model performance'
      ],
      'Guidelines for Responsible AI': [
        'Explain the development of AI systems that are responsible',
        'Recognize the importance of transparent and explainable models'
      ],
      'Security, Compliance, and Governance for AI': [
        'Explain methods to secure AI systems',
        'Recognize governance and compliance regulations for AI systems'
      ]
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
    ],
    examPageUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
    studyGuideUrl: 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html',
    topics: {
      'Cloud Concepts': [
        'Define the benefits of the AWS Cloud',
        'Identify design principles of the AWS Cloud',
        'Understand the benefits of and strategies for migration to the AWS Cloud',
        'Understand concepts of cloud economics'
      ],
      'Security and Compliance': [
        'Understand the AWS shared responsibility model',
        'Understand AWS Cloud security, governance, and compliance concepts',
        'Identify AWS access management capabilities',
        'Identify components and resources for security'
      ],
      'Cloud Technology and Services': [
        'Define methods of deploying and operating in the AWS Cloud',
        'Define the AWS global infrastructure',
        'Identify AWS compute services',
        'Identify AWS database services',
        'Identify AWS network services',
        'Identify AWS storage services',
        'Identify AWS AI/ML services and analytics services',
        'Identify services from other in-scope AWS service categories'
      ],
      'Billing, Pricing, and Support': [
        'Compare AWS pricing models',
        'Understand resources for billing, budget, and cost management',
        'Identify AWS technical resources and AWS Support options'
      ]
    }
  },
  'aws-dea-c01': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Data Ingestion and Transformation', weight: 34 },
      { name: 'Data Store Management', weight: 26 },
      { name: 'Data Operations and Support', weight: 22 },
      { name: 'Data Security and Governance', weight: 18 }
    ],
    examPageUrl: 'https://aws.amazon.com/certification/certified-data-engineer-associate/',
    studyGuideUrl: 'https://docs.aws.amazon.com/aws-certification/latest/data-engineer-associate-01/data-engineer-associate-01.html',
    topics: {
      'Data Ingestion and Transformation': [
        'Perform data ingestion',
        'Transform and process data',
        'Orchestrate data pipelines',
        'Apply programming concepts'
      ],
      'Data Store Management': [
        'Choose a data store',
        'Understand data cataloging systems',
        'Manage the lifecycle of data',
        'Design data models and schema evolution'
      ],
      'Data Operations and Support': [
        'Automate data processing by using AWS services',
        'Analyze data by using AWS services',
        'Maintain and monitor data pipelines',
        'Ensure data quality'
      ],
      'Data Security and Governance': [
        'Apply authentication mechanisms',
        'Apply authorization mechanisms',
        'Ensure data encryption and masking',
        'Prepare logs for audit',
        'Understand data privacy and governance'
      ]
    }
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
    ],
    examPageUrl: 'https://aws.amazon.com/certification/certified-devops-engineer-professional/',
    studyGuideUrl: 'https://docs.aws.amazon.com/aws-certification/latest/devops-engineer-professional-02/devops-engineer-professional-02.html',
    topics: {
      'SDLC Automation': [
        'Implement CI/CD pipelines',
        'Integrate automated testing into CI/CD pipelines',
        'Build and manage artifacts',
        'Implement deployment strategies for instance, container, and serverless environments'
      ],
      'Configuration Management and IaC': [
        'Define cloud infrastructure and reusable components to provision and manage systems',
        'Automate creating, onboarding, and securing accounts in multi-account/multi-Region setups',
        'Design and build automated solutions for complex tasks and large-scale environments'
      ],
      'Resilient Cloud Solutions': [
        'Implement highly available solutions to meet resilience and business requirements',
        'Implement solutions that are scalable to meet business requirements',
        'Implement automated recovery processes to meet RTO and RPO requirements'
      ],
      'Monitoring and Logging': [
        'Configure the collection, aggregation, and storage of logs and metrics',
        'Audit, monitor, and analyze logs and metrics to detect issues',
        'Automate monitoring and event management of complex environments'
      ],
      'Incident and Event Response': [
        'Manage event sources to process, notify, and take action in response to events',
        'Implement configuration changes in response to events',
        'Troubleshoot system and application failures'
      ],
      'Security and Compliance': [
        'Implement techniques for identity and access management at scale',
        'Apply automation for security controls and data protection',
        'Implement security monitoring and auditing solutions'
      ]
    }
  },
  'aws-dva-c02': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Development with AWS Services', weight: 32 },
      { name: 'Security', weight: 26 },
      { name: 'Deployment', weight: 24 },
      { name: 'Troubleshooting and Optimization', weight: 18 }
    ],
    examPageUrl: 'https://aws.amazon.com/certification/certified-developer-associate/',
    studyGuideUrl: 'https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html',
    topics: {
      'Development with AWS Services': [
        'Develop code for applications hosted on AWS',
        'Develop code for AWS Lambda',
        'Use data stores in application development'
      ],
      'Security': [
        'Implement authentication and/or authorization for applications and AWS services',
        'Implement encryption by using AWS services',
        'Manage sensitive data in application code'
      ],
      'Deployment': [
        'Prepare application artifacts to be deployed to AWS',
        'Test applications in development environments',
        'Automate deployment testing',
        'Deploy code by using AWS CI/CD services'
      ],
      'Troubleshooting and Optimization': [
        'Assist in a root cause analysis',
        'Instrument code for observability',
        'Optimize applications by using AWS services and features'
      ]
    }
  },
  'aws-mla-c01': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/machine-learning-engineer-associate-02.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Data Preparation for Machine Learning (ML)', weight: 28 },
      { name: 'ML Model Development', weight: 24 },
      { name: 'Deployment and Orchestration of ML Workflows', weight: 24 },
      { name: 'ML Solution Monitoring, Maintenance, and Security', weight: 24 }
    ],
    examPageUrl: 'https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/',
    studyGuideUrl: 'https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/machine-learning-engineer-associate-02.html',
    topics: {
      'Data Preparation for Machine Learning (ML)': [
        'Collect and store data',
        'Perform data transformation, feature engineering, and pre-processing',
        'Validate data quality and manage bias'
      ],
      'ML Model Development': [
        'Choose appropriate modeling approaches for ML and AI solutions',
        'Train, fine-tune, and customize models for ML and AI solutions',
        'Analyze and evaluate the performance of ML and AI systems'
      ],
      'Deployment and Orchestration of ML Workflows': [
        'Manage deployment infrastructure for ML and AI model types',
        'Provision and configure resources for ML and AI workloads based on requirements',
        'Implement automated orchestration and CI/CD pipelines for MLOps and AI workloads'
      ],
      'ML Solution Monitoring, Maintenance, and Security': [
        'Monitor ML and AI model inference and performance',
        'Optimize and manage ML and AI infrastructure costs and performance',
        'Secure ML and AI workloads and model endpoints'
      ]
    }
  },
  'aws-saa-c03': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Design Secure Architectures', weight: 30 },
      { name: 'Design Resilient Architectures', weight: 26 },
      { name: 'Design High-Performing Architectures', weight: 24 },
      { name: 'Design Cost-Optimized Architectures', weight: 20 }
    ],
    examPageUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    studyGuideUrl: 'https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html',
    topics: {
      'Design Secure Architectures': [
        'Design secure access to AWS resources',
        'Design secure workloads and applications',
        'Determine appropriate data security controls'
      ],
      'Design Resilient Architectures': [
        'Design scalable and loosely coupled architectures',
        'Design highly available and/or fault-tolerant architectures'
      ],
      'Design High-Performing Architectures': [
        'Determine high-performing and/or scalable storage solutions',
        'Design high-performing and elastic compute solutions',
        'Determine high-performing database solutions',
        'Determine high-performing and/or scalable network architectures',
        'Determine high-performing data ingestion and transformation solutions'
      ],
      'Design Cost-Optimized Architectures': [
        'Design cost-optimized storage solutions',
        'Design cost-optimized compute solutions',
        'Design cost-optimized database solutions',
        'Design cost-optimized network architectures'
      ]
    }
  },
  'aws-sap-c02': {
    sourceUrl: 'https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02.html',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Design Solutions for Organizational Complexity', weight: 26 },
      { name: 'Design for New Solutions', weight: 29 },
      { name: 'Continuous Improvement for Existing Solutions', weight: 25 },
      { name: 'Accelerate Workload Migration and Modernization', weight: 20 }
    ],
    examPageUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-professional/',
    studyGuideUrl: 'https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02.html',
    topics: {
      'Design Solutions for Organizational Complexity': [
        'Architect network connectivity strategies',
        'Prescribe security controls',
        'Design reliable and resilient architectures',
        'Design a multi-account AWS environment',
        'Determine cost optimization and visibility strategies'
      ],
      'Design for New Solutions': [
        'Design a deployment strategy to meet business requirements',
        'Design a solution to ensure business continuity',
        'Determine security controls based on requirements',
        'Design a strategy to meet reliability requirements',
        'Design a solution to meet performance objectives',
        'Determine a cost optimization strategy to meet solution goals and objectives'
      ],
      'Continuous Improvement for Existing Solutions': [
        'Determine a strategy to improve overall operational excellence',
        'Determine a strategy to improve security',
        'Determine a strategy to improve performance',
        'Determine a strategy to improve reliability',
        'Identify opportunities for cost optimizations'
      ],
      'Accelerate Workload Migration and Modernization': [
        'Select existing workloads and processes for potential migration',
        'Determine the optimal migration approach for existing workloads',
        'Determine a new architecture for existing workloads',
        'Determine opportunities for modernization and enhancements'
      ]
    }
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
    ],
    examPageUrl: 'https://aws.amazon.com/certification/certified-cloudops-engineer-associate/',
    studyGuideUrl: 'https://docs.aws.amazon.com/aws-certification/latest/sysops-administrator-associate-03/sysops-administrator-associate-03.html',
    topics: {
      'Monitoring, Logging, Analysis, Remediation, and Performance Optimization': [
        'Implement metrics, alarms, and filters by using AWS monitoring and logging services',
        'Identify and remediate issues by using monitoring and availability metrics',
        'Implement performance optimization strategies for compute, storage, and database resources'
      ],
      'Reliability and Business Continuity': [
        'Implement scalability and elasticity',
        'Implement highly available and resilient environments',
        'Implement backup and restore strategies'
      ],
      'Deployment, Provisioning, and Automation': [
        'Provision and maintain cloud resources',
        'Automate the management of existing resources'
      ],
      'Security and Compliance': [
        'Implement and manage security and compliance tools and policies',
        'Implement strategies to protect data and infrastructure'
      ],
      'Networking and Content Delivery': [
        'Implement and optimize networking features and connectivity',
        'Configure domains, DNS services, and content delivery',
        'Troubleshoot network connectivity issues'
      ]
    }
  },
  'axelos-itil4-foundation': {
    sourceUrl: 'https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-4-foundation-2565',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Key Concepts of Service Management', weight: 13 },
      { name: 'The Four Dimensions and Guiding Principles', weight: 20 },
      { name: 'Service Value System and Value Chain', weight: 7 },
      { name: 'ITIL Practices', weight: 60 }
    ],
    examPageUrl: 'https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-4-foundation-2565',
    topics: {
      'Key Concepts of Service Management': [
        'Recall definitions: service, utility, warranty, customer, user, sponsor, service management',
        'Describe the key concepts of creating value with services',
        'Describe the key concepts of service relationships'
      ],
      'The Four Dimensions and Guiding Principles': [
        'Describe the four dimensions of service management',
        'Describe the nature, use, and interaction of the guiding principles',
        'Explain the use of the seven ITIL guiding principles'
      ],
      'Service Value System and Value Chain': [
        'Describe the ITIL service value system',
        'Describe how the interconnected service value chain supports value streams',
        'Describe the purpose of each value chain activity'
      ],
      'ITIL Practices': [
        'Recall the purpose of 15 ITIL practices',
        'Recall definitions of key ITIL terms (IT asset, event, CI, change, incident, problem)',
        'Explain 7 ITIL practices in detail, including the continual improvement model'
      ]
    }
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
    ],
    examPageUrl: 'https://www.cisco.com/site/us/en/learn/training-certifications/exams/ccna.html',
    studyGuideUrl: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf',
    topics: {
      'Network Fundamentals': [
        'Explain the role and function of network components and topology architectures',
        'Compare physical interface and cabling types and identify interface and cable issues',
        'Compare TCP to UDP',
        'Configure and verify IPv4 addressing and subnetting, and describe private IPv4 addressing',
        'Configure and verify IPv6 addressing and prefix, and describe IPv6 address types',
        'Verify IP parameters for client OS (Windows, Mac OS, Linux)',
        'Describe wireless principles and virtualization fundamentals (VMs, containers, VRFs)',
        'Describe switching concepts'
      ],
      'Network Access': [
        'Configure and verify VLANs (normal range) spanning multiple switches',
        'Configure and verify interswitch connectivity',
        'Configure and verify Layer 2 discovery protocols (CDP and LLDP)',
        'Configure and verify (Layer 2/Layer 3) EtherChannel (LACP)',
        'Interpret basic operations of Rapid PVST+ Spanning Tree Protocol',
        'Describe Cisco wireless architectures, AP modes, and WLAN component connections',
        'Describe network device management access (Telnet, SSH, HTTP/S, console, TACACS+/RADIUS)',
        'Interpret the wireless LAN GUI configuration for client connectivity'
      ],
      'IP Connectivity': [
        'Interpret the components of the routing table',
        'Determine how a router makes a forwarding decision by default',
        'Configure and verify IPv4 and IPv6 static routing',
        'Configure and verify single area OSPFv2',
        'Describe the purpose, functions, and concepts of first hop redundancy protocols'
      ],
      'IP Services': [
        'Configure and verify inside source NAT using static and pools',
        'Configure and verify NTP operating in client and server mode',
        'Explain the role of DHCP and DNS, and configure and verify DHCP client and relay',
        'Explain the function of SNMP and syslog (facilities and severity levels)',
        'Explain QoS per-hop behavior (classification, marking, queuing, policing, shaping)',
        'Configure network devices for remote access using SSH',
        'Describe the capabilities and functions of TFTP/FTP in the network'
      ],
      'Security Fundamentals': [
        'Define key security concepts and security program elements',
        'Configure and verify device access control using local passwords',
        'Describe password policy elements and alternatives (MFA, certificates, biometrics)',
        'Describe IPsec remote access and site-to-site VPNs',
        'Configure and verify access control lists',
        'Configure and verify Layer 2 security features (DHCP snooping, DAI, port security)',
        'Compare authentication, authorization, and accounting concepts',
        'Describe WPA, WPA2, and WPA3 and configure a WLAN in the GUI using WPA2 PSK'
      ],
      'Automation and Programmability': [
        'Explain how automation impacts network management',
        'Compare traditional networks with controller-based networking',
        'Describe controller-based, software defined architecture (overlay, underlay, fabric)',
        'Explain AI (generative and predictive) and machine learning in network operations',
        'Describe characteristics of REST-based APIs (authentication, CRUD, HTTP verbs, encoding)',
        'Recognize configuration management mechanisms such as Ansible and Terraform',
        'Recognize components of JSON-encoded data'
      ]
    }
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
    ],
    examPageUrl: 'https://www.cisco.com/site/us/en/learn/training-certifications/exams/encor.html',
    studyGuideUrl: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/350-401-ENCORE-v1.2.pdf',
    topics: {
      'Architecture': [
        'Enterprise network design principles: 2-tier, 3-tier, fabric, cloud and high availability',
        'Working principles of the Cisco Catalyst SD-WAN solution',
        'Working principles of the Cisco SD-Access solution',
        'Interpret QoS configurations'
      ],
      'Virtualization': [
        'Device virtualization: type 1 and 2 hypervisors, virtual machines and virtual switching',
        'Configure and verify data path virtualization: VRF, GRE and IPsec tunneling',
        'Network virtualization concepts: LISP and VXLAN'
      ],
      'Infrastructure': [
        'Layer 2: troubleshoot 802.1q trunking and EtherChannels; configure RSTP and MST',
        'Layer 3: compare EIGRP and OSPF; configure OSPFv2/v3 and eBGP; policy-based routing',
        'IP services: NTP/PTP, NAT/PAT, first hop redundancy (HSRP, VRRP) and multicast'
      ],
      'Network Assurance': [
        'Diagnose network problems with debugs, traceroute, ping, SNMP and syslog',
        'Configure and verify Flexible NetFlow',
        'Configure SPAN/RSPAN/ERSPAN',
        'Configure and verify IPSLA',
        'How Cisco Catalyst Center applies network configuration, monitoring and management',
        'Configure and verify NETCONF and RESTCONF'
      ],
      'Security': [
        'Configure and verify device access control: lines, local user authentication and AAA',
        'Configure and verify infrastructure security features: ACLs and CoPP',
        'Describe REST API security',
        'Network security design: threat defense, endpoint security, NGFW, TrustSec and MACsec'
      ],
      'Automation': [
        'Interpret basic Python components and scripts',
        'Construct valid JSON-encoded files',
        'Principles and benefits of a data modeling language such as YANG',
        'APIs for Cisco Catalyst Center and SD-WAN Manager',
        'Interpret REST API response codes and payloads from Catalyst Center and RESTCONF',
        'Construct an EEM applet to automate configuration, troubleshooting or data collection',
        'Compare agent vs. agentless orchestration tools'
      ]
    }
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
    ],
    examPageUrl: 'https://www.cisco.com/site/us/en/learn/training-certifications/exams/scor.html',
    studyGuideUrl: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/350-701-SCOR-v2.0.pdf',
    topics: {
      'Security Concepts': [
        'Attack threats against on-premises, hybrid and cloud environments',
        'Security vulnerabilities and exploits, incl. OWASP Top 10 and CVE/CVSS prioritization',
        'Vulnerabilities in AI/LLM models such as prompt injection and system prompt leakage',
        'Controls that protect against phishing and social engineering attacks',
        'Cryptography components and site-to-site/remote access VPN deployment types',
        'Security intelligence authoring, sharing and consumption',
        'Zero trust architecture and defense-in-depth strategy (SAFE)',
        'Interpret scripts that call security appliance APIs in a language such as Python'
      ],
      'Network Security': [
        'Network security solutions and deployment models for intrusion prevention and firewalls',
        'Security monitoring and telemetry technologies',
        'Configure infrastructure security: segmentation, port security, DHCP snooping, DAI',
        'Management options for security solutions and CIS benchmarks for device hardening',
        'Troubleshoot AAA for device and network access such as TACACS+ and RADIUS',
        'Configure secure network management: SNMPv3, NETCONF/RESTCONF, secure syslog, NTP auth',
        'Implement access control, AVC, URL filtering, malware and intrusion prevention on FTD',
        'Configure and troubleshoot site-to-site and remote access VPN on Secure Firewall (FTD)'
      ],
      'Securing the Cloud': [
        'Security responsibility within cloud shared responsibility models',
        'Select cloud security capabilities, deployment models, frameworks and policy management',
        'Select security solutions for public, private, hybrid and community clouds, incl. CASB',
        'Network, application and data security in the cloud (Multicloud Defense, Secure Workload)',
        'Configure Splunk to ingest cloud logging and monitoring data',
        'Application and workload security concepts, including eBPF',
        'DevSecOps: IaC security, CI/CD pipelines, container orchestration, secure development'
      ],
      'Content Security': [
        'Security Service Edge (SSE) and Secure Access Service Edge (SASE)',
        'Configure Cisco Secure Access Secure Internet Access',
        'Configure Cisco Secure Access Secure Private Access',
        'Configure data loss prevention and AI guardrails for secure internet access',
        'Interpret Cisco Secure Access Investigate scores and indicators',
        'Configure email security features with Cisco Secure Email Threat Defense'
      ],
      'Endpoint Protection and Detection': [
        'Endpoint Protection Platforms (EPP) and Endpoint Detection and Response (EDR)',
        'Endpoint device management and asset inventory systems such as MDM',
        'Endpoint posture assessment solutions',
        'Endpoint protection with Cisco Secure Client and Secure Malware Analytics',
        'Configure endpoint antimalware protection using Cisco Secure Endpoint',
        'Interpret Cisco Secure Endpoint malware detection events'
      ],
      'Secure Network Access, Visibility, and Enforcement': [
        'Identity management and secure access: guest services, profiling, posture and BYOD',
        'Device compliance and application control',
        'Configure 802.1X and MAB network access control with Cisco ISE',
        'Configure network access with Change of Authorization (CoA)',
        'Exfiltration techniques such as DNS tunneling, HTTPS, email, ICMP and cloud storage',
        'Visibility and enforcement with telemetry, AI/ML, XDR and SIEM/SOAR (Splunk, Cisco XDR)',
        'Cisco Duo in zero trust: Trust Monitor, MFA, Device Trust and Adaptive Access',
        'Manage, orchestrate and automate security information and events with Splunk'
      ]
    }
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
    ],
    examPageUrl: 'https://www.cisco.com/site/us/en/learn/training-certifications/exams/ccnaauto.html',
    studyGuideUrl: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/200-901-CCNAAUTO_v.1.1.pdf',
    topics: {
      'Software Development and Design': [
        'Compare data formats: XML, JSON and YAML',
        'Parse XML, JSON and YAML into Python data structures',
        'Concepts of test-driven development',
        'Compare software development methods: agile, lean and waterfall',
        'Benefits of organizing code into functions, classes and modules',
        'Advantages of common design patterns (MVC and Observer)',
        'Advantages of version control',
        'Common Git operations: clone, add/remove, commit, push/pull, branch, merge, diff'
      ],
      'Understanding and Using APIs': [
        'Construct a REST API request from API documentation',
        'Common usage patterns for webhooks',
        'Constraints when consuming APIs',
        'Common REST API HTTP response codes and the parts of an HTTP response',
        'Troubleshoot a problem from the HTTP response code, request and API documentation',
        'API authentication: basic, custom token and API keys',
        'Compare API styles: REST, RPC, synchronous and asynchronous',
        'Write a Python script that calls a REST API using the requests library'
      ],
      'Cisco Platforms and Development': [
        'Construct a Python script that uses a Cisco SDK',
        'Cisco network management platforms and APIs: Meraki, Catalyst Center, ACI, SD-WAN, NSO',
        'Cisco compute (UCS Manager, Intersight) and collaboration (Webex, CUCM) platforms and APIs',
        'Cisco security platforms and APIs: XDR, Firepower, Secure Endpoint, ISE and more',
        'Device-level APIs and dynamic interfaces for IOS XE and NX-OS',
        'Appropriate DevNet resources: Sandbox, Code Exchange, Learning Labs and API docs',
        'Apply model-driven programmability (YANG, RESTCONF, NETCONF) in a Cisco environment',
        'Write code for Meraki, Catalyst Center or Webex operations from API reference docs'
      ],
      'Application Deployment and Security': [
        'Edge computing benefits and deployment models: private, public, hybrid cloud and edge',
        'Deployment types: virtual machines, bare metal and containers',
        'CI/CD pipeline components and the principles of DevOps practices',
        'Construct a Python unit test',
        'Interpret a Dockerfile and use Docker images in a local developer environment',
        'App security: secrets, encryption, data handling and OWASP threats (XSS, SQLi, CSRF)',
        'Role of firewalls, DNS, load balancers and reverse proxies in application deployment',
        'Bash commands: file management, directory navigation and environment variables'
      ],
      'Infrastructure and Automation': [
        'Model-driven programmability and controller-level vs. device-level management',
        'Network simulation and test tools such as Cisco Modeling Labs and pyATS',
        'CI/CD pipelines in infrastructure automation and principles of infrastructure as code',
        'Automation tools such as Ansible, Terraform and Cisco NSO',
        'Identify workflows automated by Python scripts using Cisco APIs and RESTCONF',
        'Interpret workflows automated by Ansible playbooks and bash scripts',
        'Interpret RESTCONF/NETCONF query results and basic YANG models',
        'Interpret unified diffs, code review principles and sequence diagrams with API calls'
      ],
      'Network Fundamentals': [
        'Purpose and usage of MAC addresses and VLANs',
        'IP addresses, routes, subnet masks/prefixes and gateways',
        'Common networking components: switches, routers, firewalls and load balancers',
        'Interpret a basic network topology diagram',
        'Management, data and control planes in a network device',
        'IP services (DHCP, DNS, NAT, SNMP, NTP) and common protocol port values',
        'Diagnose application connectivity issues: NAT, blocked ports, proxy and VPN',
        'Impacts of network constraints on applications'
      ]
    }
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
    ],
    examPageUrl: 'https://www.comptia.org/en-us/certifications/a/',
    studyGuideUrl: 'https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-a-220-1101-exam-objectives-(7-0).pdf',
    topics: {
      'Hardware': [
        'Cable types and their connectors, features and purposes',
        'Install the appropriate RAM and select and install storage devices',
        'Install and configure motherboards, CPUs and add-on cards',
        'Install or replace the appropriate power supply',
        'Deploy and configure multifunction devices/printers and replace printer consumables',
        'Apply the best practice methodology to resolve problems',
        'Troubleshoot motherboards, RAM, CPU, power, storage drives and RAID arrays',
        'Troubleshoot video, projector and display issues, and printer issues'
      ],
      'Networking': [
        'TCP and UDP ports, protocols and their purposes',
        'Common networking hardware',
        'Protocols for wireless networking',
        'Services provided by networked hosts',
        'Install and configure basic wired/wireless SOHO networks',
        'Network configuration concepts, Internet connection types and network types',
        'Use networking tools',
        'Troubleshoot problems with wired and wireless networks'
      ],
      'Mobile Devices and Virtualization': [
        'Install and configure laptop hardware and components',
        'Display components of mobile devices',
        'Set up and configure accessories and ports of mobile devices',
        'Configure mobile-device network connectivity and application support',
        'Troubleshoot common issues with mobile devices',
        'Cloud-computing concepts',
        'Client-side virtualization'
      ],
      'Operating Systems': [
        'Basic features of Microsoft Windows editions',
        'Use the appropriate Microsoft command-line tools',
        'Windows 10 features, tools, Control Panel utilities and settings',
        'Configure Microsoft Windows networking features on a client/desktop',
        'Application installation and configuration concepts',
        'Common OS types and their purposes',
        'Perform OS installations and upgrades in a diverse OS environment',
        'Common features and tools of macOS and Linux client/desktop operating systems'
      ],
      'Security': [
        'Security measures and their purposes',
        'Wireless security protocols and authentication methods',
        'Detect, remove and prevent malware using the appropriate tools and methods',
        'Common social-engineering attacks, threats and vulnerabilities',
        'Configure Windows OS security settings and workstation security best practices',
        'Methods for securing mobile and embedded devices',
        'Data destruction and disposal methods',
        'Secure SOHO wired/wireless networks and configure browser security settings'
      ],
      'Software and Operational Troubleshooting': [
        'Troubleshoot common Windows OS problems',
        'Troubleshoot PC security issues and apply malware removal best practices',
        'Troubleshoot mobile OS and application issues, including security issues',
        'Documentation, support systems and change-management best practices',
        'Workstation backup and recovery methods',
        'Safety procedures, environmental impacts and local environmental controls',
        'Prohibited content/activity, privacy, licensing, policy and professional communication',
        'Scripting basics and remote access technologies'
      ]
    }
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
    ],
    examPageUrl: 'https://www.comptia.org/en-us/certifications/cloud/',
    studyGuideUrl: 'https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-cloud-cv0-004-exam-objectives-(2-0).pdf',
    topics: {
      'Cloud Architecture and Design': [
        'Use the appropriate cloud service model',
        'Concepts related to service availability',
        'Cloud networking concepts',
        'Storage resources and technologies',
        'Cloud-native design, containerization and virtualization concepts',
        'Cost considerations of cloud usage and methods for optimizing workloads',
        'Importance of database concepts',
        'Evolving technologies in the cloud'
      ],
      'Deployment': [
        'Compare and contrast cloud deployment models',
        'Implement appropriate deployment strategies',
        'Aspects of cloud migration',
        'Use code to deploy and configure cloud resources',
        'Provision the appropriate cloud resources for a set of requirements',
        'Source control concepts',
        'Continuous integration/continuous deployment (CI/CD) pipeline concepts'
      ],
      'Operations and Support': [
        'Configure appropriate resources to achieve observability',
        'Configure appropriate scaling approaches',
        'Use appropriate backup and recovery methods',
        'Manage the life cycle of cloud resources',
        'Concepts related to integration of systems',
        'Importance of tools used in DevOps environments'
      ],
      'Security': [
        'Vulnerability management concepts',
        'Aspects of compliance and regulation',
        'Implement identity and access management',
        'Apply security best practices',
        'Apply security controls in the cloud',
        'Monitor suspicious activities to identify common attacks'
      ],
      'Troubleshooting': [
        'Troubleshoot deployment issues',
        'Troubleshoot network issues',
        'Troubleshoot security issues'
      ]
    }
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
    ],
    examPageUrl: 'https://www.comptia.org/en-us/certifications/data/',
    studyGuideUrl: 'https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-data-da0-001-exam-objectives-(4-0).pdf',
    topics: {
      'Data Concepts and Environments': [
        'Basic concepts of data schemas and dimensions',
        'Compare and contrast different data types',
        'Common data structures and file formats'
      ],
      'Data Mining': [
        'Data acquisition concepts',
        'Common reasons for cleansing and profiling datasets',
        'Execute data manipulation techniques',
        'Techniques for data manipulation and query optimization'
      ],
      'Data Analysis': [
        'Apply the appropriate descriptive statistical methods',
        'Purpose of inferential statistical methods',
        'Types of analysis and key analysis techniques',
        'Common data analytics tools'
      ],
      'Visualization': [
        'Translate business requirements to form a report',
        'Design components for reports and dashboards',
        'Methods for dashboard development',
        'Apply the appropriate type of visualization',
        'Compare and contrast types of reports'
      ],
      'Data Governance, Quality, and Controls': [
        'Important data governance concepts',
        'Apply data quality control concepts',
        'Master data management (MDM) concepts'
      ]
    }
  },
  'comptia-linux-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/linux/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'System Management', weight: 43 },
      { name: 'Security', weight: 18 },
      { name: 'Scripting, Containers, and Automation', weight: 17 },
      { name: 'Troubleshooting', weight: 22 }
    ],
    examPageUrl: 'https://www.comptia.org/en-us/certifications/linux/',
    studyGuideUrl: 'https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-linux-xk0-005-exam-objectives-(3-0).pdf',
    topics: {
      'System Management': [
        'Linux fundamentals',
        'Manage files and directories',
        'Configure and manage storage using the appropriate tools',
        'Configure and use the appropriate processes and services',
        'Use the appropriate networking tools or configuration files',
        'Build and install software',
        'Manage software configurations'
      ],
      'Security': [
        'Security best practices in a Linux environment',
        'Implement identity management',
        'Implement and configure firewalls',
        'Configure and execute remote connectivity for system management',
        'Apply the appropriate access controls'
      ],
      'Scripting, Containers, and Automation': [
        'Create simple shell scripts to automate common tasks',
        'Perform basic container operations',
        'Perform basic version control using Git',
        'Common infrastructure as code technologies',
        'Container, cloud and orchestration concepts'
      ],
      'Troubleshooting': [
        'Analyze and troubleshoot storage issues',
        'Analyze and troubleshoot network resource issues',
        'Analyze and troubleshoot CPU and memory issues',
        'Analyze and troubleshoot user access and file permissions',
        'Use systemd to diagnose and resolve common problems with a Linux system'
      ]
    }
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
    ],
    examPageUrl: 'https://www.comptia.org/en-us/certifications/network/',
    studyGuideUrl: 'https://lecbyo.files.cmp.optimizely.com/download/35a7403ab73211ef9dcda6f347fbf652',
    topics: {
      'Networking Concepts': [
        'Concepts related to the OSI reference model',
        'Compare and contrast networking appliances, applications and functions',
        'Cloud concepts and connectivity options',
        'Common networking ports, protocols, services and traffic types',
        'Compare and contrast transmission media and transceivers',
        'Network topologies, architectures and types',
        'Use appropriate IPv4 network addressing',
        'Evolving use cases for modern network environments'
      ],
      'Network Implementation': [
        'Characteristics of routing technologies',
        'Configure switching technologies and features',
        'Select and configure wireless devices and technologies',
        'Important factors of physical installations'
      ],
      'Network Operations': [
        'Purpose of organizational processes and procedures',
        'Use network monitoring technologies',
        'Disaster recovery (DR) concepts',
        'Implement IPv4 and IPv6 network services',
        'Compare and contrast network access and management methods'
      ],
      'Network Security': [
        'Importance of basic network security concepts',
        'Types of attacks and their impact to the network',
        'Apply network security features, defense techniques and solutions'
      ],
      'Network Troubleshooting': [
        'The troubleshooting methodology',
        'Troubleshoot common cabling and physical interface issues',
        'Troubleshoot common issues with network services',
        'Troubleshoot common performance issues',
        'Use the appropriate tool or protocol to solve networking issues'
      ]
    }
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
    ],
    examPageUrl: 'https://www.comptia.org/en-us/certifications/pentest/',
    studyGuideUrl: 'https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-pentest-pt0-003-exam-objectives-(3-0).pdf',
    topics: {
      'Engagement Management': [
        'Pre-engagement activities',
        'Collaboration and communication activities',
        'Compare and contrast testing frameworks and methodologies',
        'Components of a penetration test report',
        'Analyze findings and recommend appropriate remediation within a report'
      ],
      'Reconnaissance and Enumeration': [
        'Apply information gathering techniques',
        'Apply enumeration techniques',
        'Modify scripts for reconnaissance and enumeration',
        'Use the appropriate tools for reconnaissance and enumeration'
      ],
      'Vulnerability Discovery and Analysis': [
        'Conduct vulnerability discovery using various techniques',
        'Analyze output from reconnaissance, scanning and enumeration phases',
        'Physical security concepts'
      ],
      'Attacks and Exploits': [
        'Analyze output to prioritize and prepare attacks',
        'Perform network attacks using the appropriate tools',
        'Perform authentication attacks using the appropriate tools',
        'Perform host-based attacks using the appropriate tools',
        'Perform web application attacks using the appropriate tools',
        'Perform cloud-based attacks using the appropriate tools',
        'Perform wireless and social engineering attacks',
        'Attacks against specialized systems and scripting to automate attacks'
      ],
      'Post-exploitation and Lateral Movement': [
        'Establish and maintain persistence',
        'Move laterally throughout the environment',
        'Concepts related to staging and exfiltration',
        'Cleanup and restoration activities'
      ]
    }
  },
  'comptia-project-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/project/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Project Management Concepts', weight: 33 },
      { name: 'Project Life Cycle Phases', weight: 30 },
      { name: 'Tools and Documentation', weight: 19 },
      { name: 'Basics of IT and Governance', weight: 18 }
    ],
    examPageUrl: 'https://www.comptia.org/en-us/certifications/project/',
    studyGuideUrl: 'https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-project-pk0-005-exam-objectives-(6-0).pdf',
    topics: {
      'Project Management Concepts': [
        'Project characteristics, methodologies and frameworks used in IT projects',
        'Compare and contrast Agile vs. Waterfall concepts',
        'Apply the change control process throughout the project life cycle',
        'Perform risk management and issue management activities',
        'Schedule development and management activities and techniques',
        'Quality management and performance management concepts',
        'Communication management concepts and effective meeting management techniques',
        'Team and resource management, procurement and vendor selection'
      ],
      'Project Life Cycle Phases': [
        'Value of artifacts in the discovery/concept preparation phase',
        'Activities during the project initiation phase',
        'Activities during the project planning phase',
        'Activities during the project execution phase',
        'Activities performed during the closing phase'
      ],
      'Tools and Documentation': [
        'Use the appropriate tools throughout the project life cycle',
        'Compare and contrast project management productivity tools',
        'Analyze quality and performance charts to inform project decisions'
      ],
      'Basics of IT and Governance': [
        'Environmental, social and governance (ESG) factors in project management',
        'Information security concepts impacting project management',
        'Compliance and privacy considerations impacting project management',
        'Basic IT concepts relevant to IT project management',
        'Operational change-control processes during an IT project'
      ]
    }
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
    ],
    examPageUrl: 'https://www.comptia.org/en-us/certifications/security/v7/',
    studyGuideUrl: 'https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-security-sy0-701-exam-objectives-(6-0).pdf',
    topics: {
      'General Security Concepts': [
        'Compare and contrast various types of security controls',
        'Fundamental security concepts',
        'Importance of change management processes and the impact to security',
        'Importance of using appropriate cryptographic solutions'
      ],
      'Threats, Vulnerabilities, and Mitigations': [
        'Common threat actors and motivations',
        'Common threat vectors and attack surfaces',
        'Various types of vulnerabilities',
        'Analyze indicators of malicious activity',
        'Purpose of mitigation techniques used to secure the enterprise'
      ],
      'Security Architecture': [
        'Security implications of different architecture models',
        'Apply security principles to secure enterprise infrastructure',
        'Concepts and strategies to protect data',
        'Importance of resilience and recovery in security architecture'
      ],
      'Security Operations': [
        'Apply common security techniques to computing resources',
        'Security implications of hardware, software and data asset management',
        'Activities associated with vulnerability management',
        'Security alerting and monitoring concepts and tools',
        'Modify enterprise capabilities to enhance security',
        'Implement and maintain identity and access management',
        'Importance of automation and orchestration in secure operations',
        'Incident response activities and using data sources to support an investigation'
      ],
      'Security Program Management and Oversight': [
        'Elements of effective security governance',
        'Elements of the risk management process',
        'Third-party risk assessment and management processes',
        'Elements of effective security compliance',
        'Types and purposes of audits and assessments',
        'Implement security awareness practices'
      ]
    }
  },
  'comptia-securityx': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/securityx/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Governance, Risk, and Compliance', weight: 20 },
      { name: 'Security Architecture', weight: 27 },
      { name: 'Security Engineering', weight: 31 },
      { name: 'Security Operations', weight: 22 }
    ],
    examPageUrl: 'https://www.comptia.org/en-us/certifications/securityx/',
    studyGuideUrl: 'https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-securityx-cas-005-exam-objectives-(3-0).pdf',
    topics: {
      'Governance, Risk, and Compliance': [
        'Implement the appropriate governance components for security requirements',
        'Perform risk management activities',
        'How compliance affects information security strategies',
        'Perform threat-modeling activities',
        'Information security challenges of artificial intelligence (AI) adoption'
      ],
      'Security Architecture': [
        'Analyze requirements to design resilient systems',
        'Implement security early in the systems life cycle and throughout later stages',
        'Integrate appropriate controls in the design of a secure architecture',
        'Apply security concepts to access, authentication and authorization system design',
        'Securely implement cloud capabilities in an enterprise environment',
        'Integrate Zero Trust concepts into system architecture design'
      ],
      'Security Engineering': [
        'Troubleshoot common IAM component issues in an enterprise environment',
        'Analyze requirements to enhance the security of endpoints and servers',
        'Troubleshoot complex network infrastructure security issues',
        'Implement hardware security technologies and techniques',
        'Secure specialized and legacy systems against threats',
        'Use automation to secure the enterprise',
        'Importance of advanced cryptographic concepts',
        'Apply the appropriate cryptographic use case and/or technique'
      ],
      'Security Operations': [
        'Analyze data to enable monitoring and response activities',
        'Analyze vulnerabilities and attacks, and recommend ways to reduce the attack surface',
        'Apply threat-hunting and threat intelligence concepts',
        'Analyze data and artifacts in support of incident response activities'
      ]
    }
  },
  'comptia-server-plus': {
    sourceUrl: 'https://www.comptia.org/en-us/certifications/server/',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Server Hardware Installation and Management', weight: 18 },
      { name: 'Server Administration', weight: 30 },
      { name: 'Security and Disaster Recovery', weight: 24 },
      { name: 'Troubleshooting', weight: 28 }
    ],
    examPageUrl: 'https://www.comptia.org/en-us/certifications/server/',
    studyGuideUrl: 'https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-server-sk0-005-exam-objectives-(5-0).pdf',
    topics: {
      'Server Hardware Installation and Management': [
        'Install physical hardware',
        'Deploy and manage storage',
        'Perform server hardware maintenance'
      ],
      'Server Administration': [
        'Install server operating systems',
        'Configure servers to use network infrastructure services',
        'Configure and maintain server functions and features',
        'Key concepts of high availability for servers',
        'Purpose and operation of virtualization',
        'Scripting basics for server administration',
        'Importance of asset management and documentation',
        'Licensing concepts'
      ],
      'Security and Disaster Recovery': [
        'Data security concepts',
        'Physical security concepts',
        'Identity and access management for server administration',
        'Data security risks and mitigation strategies',
        'Apply server hardening methods',
        'Proper server decommissioning concepts',
        'Importance of backups and restores',
        'Importance of disaster recovery'
      ],
      'Troubleshooting': [
        'Troubleshooting theory and methodology',
        'Troubleshoot common hardware failures',
        'Troubleshoot storage problems',
        'Troubleshoot common OS and software problems',
        'Troubleshoot network connectivity issues',
        'Troubleshoot security problems'
      ]
    }
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
    ],
    examPageUrl: 'https://training.mirantis.com/certification/dca-certification-exam/',
    studyGuideUrl: 'https://a.storyblok.com/f/146871/x/2001ce939c/docker-study-guide_v1-5-jan-2025.pdf',
    topics: {
      'Orchestration': [
        'Complete the setup of a swarm mode cluster with managers and worker nodes',
        'Extend instructions for running individual containers into services under swarm',
        'Describe the importance of quorum in a swarm cluster',
        'Describe the difference between running a container and running a service',
        'Convert an application deployment into a stack file with docker stack deploy',
        'Run replicated and global services and use node labels for task placement',
        'Identify the steps to troubleshoot a service that is not deploying',
        'Deploy Kubernetes pods and deployments, configured with configMaps and secrets'
      ],
      'Image Creation, Management, and Registry': [
        'Describe the use of Dockerfile and options such as ADD, COPY, VOLUME, EXPOSE, ENTRYPOINT',
        'Create an efficient image via a Dockerfile',
        'Manage images with CLI commands such as list, delete, prune and rmi',
        'Inspect images and report specific attributes using filter and format',
        'Tag an image, display its layers and modify it to a single layer',
        'Describe registry functions and deploy a registry',
        'Log into, search, push to and pull and delete images from a registry',
        'Sign an image in a registry'
      ],
      'Installation and Configuration': [
        'Describe sizing requirements for installation',
        'Set up the repo, select a storage driver and install Docker engine on multiple platforms',
        'Configure logging drivers (splunk, journald, etc.)',
        'Set up swarm, configure managers, add nodes and set up the backup schedule',
        'Create and manage users and teams',
        'Use certificate-based client-server authentication for registry access',
        'Describe the use of namespaces, cgroups and certificate configuration',
        'Deploy Docker engine, UCP and DTR in an HA configuration and configure their backups'
      ],
      'Networking': [
        'Describe the Container Network Model and its network and IPAM drivers',
        'Describe the types and use cases of the built-in network drivers',
        'Describe traffic flow between the Docker engine, registry and UCP controllers',
        'Create a Docker bridge network for developers to use for their containers',
        'Publish ports externally and compare host and ingress publishing modes',
        'Configure Docker to use external DNS',
        'Configure L7 load balancing and deploy a service on an overlay network',
        'Route traffic to Kubernetes pods using ClusterIP and NodePort services'
      ],
      'Security': [
        'Describe security administration and tasks',
        'Describe image signing and enable Docker Content Trust',
        'Describe default engine and swarm security, including MTLS',
        'Describe identity roles and compare UCP workers and managers',
        'Use external certificates with UCP and DTR',
        'Demonstrate that an image passes a security scan',
        'Configure RBAC with UCP and integrate UCP with LDAP/AD',
        'Create UCP client bundles'
      ],
      'Storage and Volumes': [
        'Identify the correct graph drivers to use with various operating systems',
        'Configure devicemapper',
        'Compare object and block storage and when they should be used',
        'Describe how an application is composed of layers and where they reside on the filesystem',
        'Describe how volumes are used with Docker for persistent storage',
        'Clean up unused images on a filesystem and DTR',
        'Use storage across cluster nodes',
        'Provision persistent storage to Kubernetes pods with PVs, PVCs and storageClass'
      ]
    }
  },
  'github-foundations': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-900',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Introduction to Git and GitHub', weight: 38 },
      { name: 'Working with GitHub Repositories', weight: 17 },
      { name: 'Collaboration Features', weight: 17 },
      { name: 'GitHub Ecosystem and AI Tools', weight: 28 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/github-foundations/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-900',
    topics: {
      'Introduction to Git and GitHub': [
        'Describe the purpose and benefits of version control',
        'Explain the difference between Git and GitHub',
        'Identify key Git concepts such as repositories, commits and branches',
        'Describe GitHub accounts, organizations and enterprise options',
        'Explain the GitHub Flow for collaboration',
        'Identify uses of Markdown in issues and pull requests',
        'Recognize when to use GitHub Desktop and GitHub Mobile',
        'Secure accounts with two-factor authentication (2FA) and passkeys'
      ],
      'Working with GitHub Repositories': [
        'Describe repository structure and key files (README, LICENSE, CONTRIBUTING, CODEOWNERS)',
        'Create, organize and maintain repositories using templates and branches',
        'Add and manage files within a repository',
        'Describe repository insights, stars, metrics dashboards and dependency insights',
        'Recognize best practices for repository maintenance and collaboration',
        'Describe repository privacy options, visibility settings and branch protection rules',
        'Identify access permissions and roles for repositories and organizations',
        'Manage organization settings, teams and roles'
      ],
      'Collaboration Features': [
        'Use issues, pull requests and discussions for collaboration',
        'Link pull requests to issues and manage templates, filters and assignments',
        'Configure notifications for workflow management',
        'Use Gists, Wikis and GitHub Pages to document and share information',
        'Describe GitHub Projects and layout options',
        'Configure projects, labels, milestones and workflows',
        'Use saved replies and assignees to streamline communication',
        'Use project insights to track progress and productivity'
      ],
      'GitHub Ecosystem and AI Tools': [
        'Describe the purpose and capabilities of GitHub Actions',
        'Identify how GitHub Copilot assists with AI-powered code suggestions and agents',
        'Explain the differences between Copilot Individual, Business and Enterprise',
        'Describe GitHub Codespaces and how to set up and customize dev containers',
        'Explain when to use the github.dev editor and how it differs from Codespaces',
        'Explain Enterprise Managed Users and organization-wide Copilot policy management',
        'Describe the benefits of open source, GitHub Sponsors and the GitHub Marketplace',
        'Explain how InnerSource applies open-source principles within organizations'
      ]
    }
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
    ],
    examPageUrl: 'https://university.gitlab.com/courses/gitlab-certified-fundamentals-associate',
    topics: {
      'Git and GitLab Fundamentals': [
        'Define GitLab\'s core purpose and its position within the DevSecOps toolchain',
        'DevSecOps concepts and toolchain integration',
        'GitLab projects, groups and subgroups'
      ],
      'Source Code Management and Workflows': [
        'Create and submit merge requests for code review',
        'Merge requests and code review workflows',
        'Configure project settings including visibility and member permissions',
        'GitLab Web IDE',
        'Code snippets'
      ],
      'CI/CD Pipelines': [
        'Create a basic .gitlab-ci.yml configuration file and configure pipeline stages',
        'CI/CD pipeline stages and jobs',
        'Identify and resolve common pipeline failures',
        'Continuous integration vs. continuous delivery vs. continuous deployment',
        'Deployment strategies (blue-green, canary, rolling)',
        'GitLab Pages deployment',
        'Release management, release notes and feature flags',
        'GitLab Package Registry and Container Registry'
      ],
      'Project Management and Collaboration': [
        'Create, assign and manage issues for work tracking',
        'Organize issues using labels, milestones and boards',
        'Project wikis',
        'Collaborative features (comments, mentions, notifications)'
      ],
      'Security and Compliance Basics': [
        'Set up security scanning tools in GitLab projects',
        'Security scanning (SAST, dependency scanning, container scanning)',
        'Analyze and interpret security scan results and reports',
        'Vulnerability reports'
      ]
    }
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
    ],
    examPageUrl: 'https://cloud.google.com/learn/certification/cloud-engineer',
    studyGuideUrl: 'https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf',
    topics: {
      'Setting up a cloud solution environment': [
        'Creating a resource hierarchy and applying organizational policies',
        'Granting members IAM roles within a project',
        'Managing users and groups in Cloud Identity',
        'Enabling APIs within projects',
        'Provisioning and setting up products in Google Cloud Observability',
        'Assessing quotas and requesting increases',
        'Creating billing accounts and linking projects to a billing account',
        'Establishing billing budgets and alerts and setting up billing exports'
      ],
      'Planning and configuring a cloud solution': [
        'Selecting appropriate compute choices for a given workload',
        'Choosing the appropriate storage for Compute Engine',
        'Identifying whether to use GPUs or TPUs',
        'Choosing data products (e.g., Cloud SQL, BigQuery, Firestore, Spanner, Bigtable)',
        'Choosing storage products and Cloud Storage classes',
        'Choosing load balancers and differentiating Network Service Tiers',
        'AI-assisted planning (e.g., Gemini CLI, Gemini Cloud Assist, Application Design Center)'
      ],
      'Deploying and implementing a cloud solution': [
        'Launching a compute instance and creating an autoscaled managed instance group',
        'Deploying a GKE cluster and a containerized application to GKE',
        'Deploying an application to serverless compute platforms',
        'Loading data (e.g., command-line upload, Storage Transfer Service)',
        'Creating a VPC with subnets and applying VPC firewall and Cloud NGFW rules',
        'Establishing network connectivity (Cloud VPN, VPC Network Peering, Interconnect)',
        'Implementing resources with Infrastructure as Code tooling (e.g., Terraform, Helm)'
      ],
      'Ensuring successful operation of a cloud solution': [
        'Managing compute resources',
        'Managing storage and data solutions',
        'Managing networking resources',
        'Monitoring and logging'
      ],
      'Configuring access and security': [
        'Viewing and creating IAM policies',
        'Attaching roles and policy inheritance in the Organization hierarchy',
        'Managing role types and defining custom IAM roles',
        'Creating service accounts and using them in IAM policies with minimum permissions',
        'Assigning service accounts to resources and managing their IAM permissions',
        'Managing service account impersonation and short-lived credentials',
        'Using a Google Cloud service account with a GKE application',
        'Provisioning Workload Identity Federation'
      ]
    }
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
    ],
    examPageUrl: 'https://cloud.google.com/learn/certification/cloud-architect',
    studyGuideUrl: 'https://services.google.com/fh/files/misc/professional_cloud_architect_exam_guide_english.pdf',
    topics: {
      'Designing and planning a cloud solution architecture': [
        'Designing a cloud solution infrastructure that meets business requirements',
        'Designing a cloud solution infrastructure that meets technical requirements',
        'Designing network, storage and compute resources',
        'Creating a migration plan (documents and architectural diagrams)',
        'Envisioning future solution improvements'
      ],
      'Managing and provisioning a solution infrastructure': [
        'Configuring network topologies',
        'Configuring individual storage systems',
        'Configuring compute systems',
        'Leveraging Gemini Enterprise Agent Platform for end-to-end ML workflows',
        'Configuring prebuilt solutions or APIs with Agent Platform'
      ],
      'Designing for security and compliance': [
        'Identity and Access Management (IAM) and resource hierarchy',
        'Data security (key management, encryption, secret management)',
        'Security controls (e.g., VPC Service Controls, organization policy, auditing)',
        'Secure remote access (e.g., Identity-Aware Proxy, Workload Identity Federation)',
        'Securing the software supply chain and securing AI',
        'Compliance with legislation and regulation (e.g., data privacy, data sovereignty)',
        'Commercial compliance for sensitive data such as card information and PII',
        'Industry certifications (e.g., SOC 2) and audits'
      ],
      'Analyzing and optimizing technical and business processes': [
        'Software development lifecycle (SDLC) and CI/CD',
        'Troubleshooting and root cause analysis best practices',
        'Testing and validation of software and infrastructure',
        'Service catalog and provisioning',
        'Disaster recovery and business continuity',
        'Stakeholder, change and customer success management',
        'Team assessment, skills readiness and decision-making processes',
        'Cost and resource optimization (CapEx/OpEx)'
      ],
      'Managing implementation': [
        'Advising development and operations teams to ensure successful deployment',
        'API management best practices (e.g., Apigee)',
        'Testing frameworks (load, unit, integration)',
        'Data and system migration and management tooling',
        'Interacting with Google Cloud programmatically',
        'Cloud Shell, Cloud Code, Google Cloud SDKs and Cloud Emulators',
        'Infrastructure as Code and Google API client libraries'
      ],
      'Ensuring solution and operations reliability': [
        'Operational excellence pillar of the Google Cloud Well-Architected Framework',
        'Familiarity with Google Cloud Observability solutions',
        'Deployment and release management',
        'Assisting with the support of deployed solutions',
        'Evaluating quality control measures',
        'Ensuring the reliability of solutions in production (e.g., chaos and load testing)'
      ]
    }
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
    ],
    examPageUrl: 'https://cloud.google.com/learn/certification/cloud-devops-engineer',
    studyGuideUrl: 'https://services.google.com/fh/files/misc/professional_cloud_devops_engineer_exam_guide_english.pdf',
    topics: {
      'Bootstrapping and Managing a Google Cloud Organization': [
        'Designing the overall resource hierarchy for an organization',
        'Managing infrastructure',
        'Designing a CI/CD architecture stack in Google Cloud, hybrid and multi-cloud',
        'Managing multiple environments (e.g., staging, production)',
        'Enabling secure cloud development environments'
      ],
      'Building and Implementing CI/CD Pipelines': [
        'Designing pipelines',
        'Implementing and managing pipelines',
        'Managing pipeline configuration and secrets',
        'Securing the deployment pipeline'
      ],
      'Applying Site Reliability Engineering Practices': [
        'Balancing change, velocity and reliability of the service',
        'Managing service lifecycle',
        'Mitigating incident impact on users'
      ],
      'Implementing Observability': [
        'Instrumenting and collecting telemetry',
        'Managing and analyzing logs',
        'Managing metrics, dashboards and alerts',
        'Capturing and analyzing distributed traces',
        'Troubleshooting issues'
      ],
      'Optimizing Service Performance': [
        'Collecting performance information (application performance monitoring)',
        'Active Assist insights and recommendations',
        'Implementing FinOps practices for optimizing resource utilization and costs',
        'Observability costs and Spot VMs',
        'Infrastructure cost planning (committed-use and sustained-use discounts, network tiers)',
        'Leveraging Google Cloud recommenders',
        'Optimizing individual workload costs (GKE, Cloud Run, Compute Engine)'
      ]
    }
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
    ],
    examPageUrl: 'https://cloud.google.com/learn/certification/cloud-network-engineer',
    studyGuideUrl: 'https://services.google.com/fh/files/misc/professional_cloud_network_engineer_exam_guide_english.pdf',
    topics: {
      'Designing, Planning, and Prototyping a Google Cloud Network': [
        'Designing an overall network architecture',
        'Designing VPC networks',
        'Designing a resilient and performant hybrid and multi-cloud network',
        'Designing for Google Kubernetes Engine (GKE)'
      ],
      'Implementing Virtual Private Cloud Instances': [
        'Configuring VPCs',
        'Configuring VPC routing',
        'Configuring Network Connectivity Center',
        'Configuring and maintaining GKE clusters',
        'Configuring and managing NGFW policies and VPC firewall rules'
      ],
      'Configuring Network Services': [
        'Configuring load balancing',
        'Configuring Cloud CDN',
        'Configuring Cloud DNS',
        'Configuring Google Cloud Armor policies',
        'Securing internet egress traffic using Public Cloud NAT and Secure Web Proxy'
      ],
      'Implementing Hybrid Interconnectivity': [
        'Configuring Cloud Interconnect',
        'Configuring a site-to-site IPSec VPN',
        'Configuring Cloud Router',
        'Configuring Network Connectivity Center'
      ],
      'Managing, Monitoring, and Optimizing Network Operations': [
        'Logging and monitoring with Google Cloud Observability',
        'Maintaining and troubleshooting connectivity issues',
        'Using Network Intelligence Center to monitor and troubleshoot networking issues',
        'Configuring self-managed network virtual appliances and Packet Mirroring'
      ]
    }
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
    ],
    examPageUrl: 'https://cloud.google.com/learn/certification/data-engineer',
    studyGuideUrl: 'https://services.google.com/fh/files/misc/professional_data_engineer_exam_guide_english.pdf',
    topics: {
      'Designing data processing systems': [
        'Designing for security and compliance',
        'Designing for reliability and fidelity',
        'Designing for flexibility and portability',
        'Designing data migrations'
      ],
      'Ingesting and processing the data': [
        'Planning the data pipelines',
        'Building the pipelines',
        'Deploying and operationalizing the pipelines'
      ],
      'Storing the data': [
        'Selecting storage systems',
        'Planning for using a data warehouse',
        'Using a data lake',
        'Designing for a data platform'
      ],
      'Preparing and using data for analysis': [
        'Preparing data for visualization',
        'Preparing data for AI and ML',
        'Sharing data'
      ],
      'Maintaining and automating data workloads': [
        'Optimizing resources',
        'Designing automation and repeatability',
        'Organizing workloads based on business requirements',
        'Monitoring and troubleshooting processes',
        'Maintaining awareness of failures and mitigating impact'
      ]
    }
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
    ],
    examPageUrl: 'https://cloud.google.com/learn/certification/machine-learning-engineer',
    studyGuideUrl: 'https://services.google.com/fh/files/misc/professional_machine_learning_engineer_exam_guide_english.pdf',
    topics: {
      'Architecting low-code AI solutions': [
        'Building models in BigQuery ML or AutoML based on the business problem',
        'Performing feature engineering and generating predictions using BigQuery ML',
        'Training models using Agent Platform AutoML',
        'Fine-tuning Gemini models using BigQuery',
        'Evaluating and selecting the appropriate model from Model Garden',
        'Building applications using industry-specific APIs (Document AI, Vision, Translate)',
        'Optimizing Gemini-based applications for cost, latency and availability'
      ],
      'Collaborating within and across teams to manage data and models': [
        'Exploring and preprocessing data for ML',
        'Model prototyping using notebooks (Agent Platform Workbench, Colab Enterprise)',
        'Tracking and running ML experiments'
      ],
      'Scaling prototypes into ML models': [
        'Building models considering cost, complexity, latency and scalability',
        'Training models',
        'Choosing appropriate hardware for training'
      ],
      'Serving and scaling models': [
        'Deploying models for batch and online inference',
        'Packaging and serving models using prebuilt and custom containers',
        'Organizing and versioning models in Model Registry',
        'Implementing model rollout strategies (e.g., A/B testing, canary deployments)',
        'Managing and serving features using Agent Platform Feature Store',
        'Deploying models to public and private endpoints',
        'Scaling the serving backend based on throughput',
        'Tuning ML models for training and serving in production'
      ],
      'Automating and orchestrating ML pipelines': [
        'Validating data and models',
        'Building and orchestrating pipelines with managed or unmanaged services',
        'Ensuring consistent data preprocessing between training and serving',
        'Determining an appropriate retraining policy',
        'Deploying models in CI/CD/CT pipelines (e.g., Cloud Build)'
      ],
      'Monitoring AI solutions': [
        'Building secure AI systems that protect against data exfiltration and malicious prompting',
        'Aligning with responsible AI practices (e.g., monitoring for bias)',
        'Model explainability on Agent Platform',
        'Configuring Model Monitoring for continuous evaluation of production models',
        'Monitoring for training-serving skew, data drift and concept drift',
        'Monitoring, testing and evaluating gen AI solutions'
      ]
    }
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
    ],
    examPageUrl: 'https://iassc.org/six-sigma-certification/green-belt-certification/',
    studyGuideUrl: 'https://iassc.org/body-of-knowledge/green-belt-body-of-knowledge/',
    topics: {
      'Define Phase': [
        'The basics of Six Sigma, including Y = f(x), voice of the customer and roles',
        'The fundamentals of Six Sigma: CTQs, cost of poor quality, Pareto analysis and metrics',
        'Selecting Lean Six Sigma projects: business case, project charter and project metrics',
        'Financial evaluation and benefits capture',
        'The Lean enterprise: the seven elements of waste and 5S'
      ],
      'Measure Phase': [
        'Process definition: fishbone diagrams, process mapping, SIPOC and value stream maps',
        'X-Y diagrams and Failure Modes and Effects Analysis (FMEA)',
        'Six Sigma statistics: descriptive statistics, normality and graphical analysis',
        'Measurement System Analysis, including Gage R&R and attribute MSA',
        'Process capability and the concept of stability'
      ],
      'Analyze Phase': [
        'Patterns of variation: multi-vari analysis and classes of distributions',
        'Inferential statistics: sampling techniques and the central limit theorem',
        'Hypothesis testing concepts: practical vs statistical significance, alpha and beta risk',
        'Hypothesis testing with normal data: 1 and 2 sample t-tests, variance tests, one-way ANOVA',
        'Hypothesis testing with non-normal data: Mann-Whitney, Kruskal-Wallis, Mood\'s median',
        'Proportion tests and Chi-squared contingency tables'
      ],
      'Improve Phase': [
        'Simple linear regression: correlation and regression equations',
        'Residuals analysis',
        'Multiple linear and non-linear regression analysis',
        'Confidence and prediction intervals',
        'Data transformation using Box-Cox'
      ],
      'Control Phase': [
        'Lean controls: control methods for 5S, Kanban and Poka-Yoke (mistake proofing)',
        'Statistical Process Control (SPC) and data collection for SPC',
        'Control charts: I-MR, Xbar-R, Xbar-S, U, P, NP, CuSum and EWMA',
        'Six Sigma control plans: cost benefit analysis, control plan and response plan'
      ]
    }
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
    ],
    examPageUrl: 'https://www.isc2.org/certifications/cc',
    studyGuideUrl: 'https://www.isc2.org/certifications/cc/cc-certification-exam-outline',
    topics: {
      'Security Principles': [
        'Understand cybersecurity concepts: CIA, AAA, non-repudiation and privacy',
        'Understand risk management concepts',
        'Understand governance concepts: regulations, frameworks, policies and standards',
        'Understand technical, administrative and physical cybersecurity controls',
        'Maintain professional and ethical conduct, including the ISC2 Code of Ethics',
        'Plan Governance, Risk, and Compliance (GRC)',
        'Measure cybersecurity effectiveness with key metrics, KRIs and dashboards'
      ],
      'Business Continuity, Disaster Recovery and Incident Response': [
        'Understand redundancy through Business Continuity (BC)',
        'Understand redundancy through Disaster Recovery (DR)',
        'Understand Incident Response (IR) and implementing an Incident Response Plan (IRP)',
        'Run Incident Response exercises such as testing and tabletops'
      ],
      'Access Controls Concepts': [
        'Understand identity life cycle management: roles, provisioning, review, deprovisioning',
        'Understand logical access controls',
        'Apply the Principle of Least Privilege (PoLP) and Separation of Duties (SoD)',
        'Understand access control models'
      ],
      'Network Security': [
        'Understand network security: OSI and TCP/IP models, IPv4/IPv6, VPN, firewalls, wireless',
        'Understand network security architecture: segmentation, defense in depth and Zero Trust',
        'Understand cloud security: service and deployment models and the shared security model'
      ],
      'Security Operations': [
        'Understand data security: data handling and encryption',
        'Understand security operations: logging, monitoring, event triage and threat intelligence',
        'Understand asset protection: asset lifecycle, configuration and change management',
        'Understand security testing: readiness, application and physical penetration testing',
        'Understand security awareness: organizational culture, social engineering and phishing'
      ]
    }
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
    ],
    examPageUrl: 'https://www.isc2.org/certifications/ccsp',
    studyGuideUrl: 'https://www.isc2.org/certifications/ccsp/ccsp-certification-exam-outline',
    topics: {
      'Cloud Concepts, Architecture and Design': [
        'Understand cloud computing concepts',
        'Describe cloud reference architecture',
        'Understand security concepts relevant to cloud computing',
        'Understand design principles of secure cloud computing',
        'Evaluate Cloud Service Providers (CSP)',
        'Comprehend Artificial Intelligence (AI) and Machine Learning (ML)'
      ],
      'Cloud Data Security': [
        'Describe cloud data concepts',
        'Design and implement cloud data storage architectures',
        'Design and apply data security technologies and strategies',
        'Implement data discovery and plan and implement data classification',
        'Design and implement Information Rights Management (IRM)',
        'Plan and implement data retention, deletion and archiving policies',
        'Design and implement auditability, traceability and accountability of data events',
        'Comprehend data protection of AI and ML data'
      ],
      'Cloud Platform and Infrastructure Security': [
        'Comprehend cloud infrastructure and platform components',
        'Design a secure data center',
        'Analyze risks associated with cloud infrastructure and platforms',
        'Plan and implement security controls',
        'Plan business continuity (BC) and disaster recovery (DR)'
      ],
      'Cloud Application Security': [
        'Advocate training and awareness for application security',
        'Describe the Secure Software Development Life Cycle (SDLC) process',
        'Apply the Secure Software Development Life Cycle (SDLC)',
        'Apply cloud software assurance and validation',
        'Use verified secure software',
        'Comprehend and apply the specifics of cloud application architecture',
        'Design appropriate Identity and Access Management (IAM) solutions'
      ],
      'Cloud Security Operations': [
        'Build and implement physical and logical infrastructure for cloud environments',
        'Operate and maintain physical and logical infrastructure for cloud environments',
        'Implement operational controls and standards (e.g., ITIL, ISO/IEC 20000-1)',
        'Support digital forensics',
        'Manage communication with relevant parties',
        'Manage security operations'
      ],
      'Legal, Risk and Compliance': [
        'Articulate legal requirements and unique risks within the cloud environment',
        'Understand privacy issues',
        'Understand audit process, methodologies and required adaptations for the cloud',
        'Understand implications of cloud to enterprise risk management',
        'Understand outsourcing and cloud contract design'
      ]
    }
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
    ],
    examPageUrl: 'https://www.isc2.org/certifications/cissp',
    studyGuideUrl: 'https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline',
    topics: {
      'Security and Risk Management': [
        'Promote ethics and apply security concepts (CIA, authenticity, non-repudiation)',
        'Evaluate and apply security governance principles',
        'Understand legal, regulatory and compliance issues and investigation types',
        'Develop, document and implement security policy, standards, procedures and guidelines',
        'Identify, analyze, prioritize and implement Business Continuity (BC) requirements',
        'Contribute to and enforce personnel security policies and procedures',
        'Apply risk management, threat modeling and Supply Chain Risk Management (SCRM) concepts',
        'Establish and maintain a security awareness, education and training program'
      ],
      'Asset Security': [
        'Identify and classify information and assets',
        'Establish information and asset handling requirements',
        'Provision information and assets securely',
        'Manage data lifecycle',
        'Ensure appropriate asset retention (e.g., End of Life, End of Support)',
        'Determine data security controls and compliance requirements'
      ],
      'Security Architecture and Engineering': [
        'Research, implement and manage engineering processes using secure design principles',
        'Understand security models and select controls based on systems security requirements',
        'Understand security capabilities of Information Systems (e.g., TPM, memory protection)',
        'Assess and mitigate vulnerabilities of security architectures, designs and solutions',
        'Select and determine cryptographic solutions',
        'Understand methods of cryptanalytic attacks',
        'Apply security principles to site and facility design and controls',
        'Manage the information system lifecycle'
      ],
      'Communication and Network Security': [
        'Apply secure design principles in network architectures',
        'Secure network components',
        'Implement secure communication channels according to design'
      ],
      'Identity and Access Management': [
        'Control physical and logical access to assets',
        'Design identification and authentication strategy (people, devices and services)',
        'Federated identity with a third-party service',
        'Implement and manage authorization mechanisms',
        'Manage the identity and access provisioning lifecycle',
        'Implement authentication systems'
      ],
      'Security Assessment and Testing': [
        'Design and validate assessment, test and audit strategies',
        'Conduct security control testing',
        'Collect security process data (e.g., technical and administrative)',
        'Analyze test output and generate report',
        'Conduct or facilitate security audits'
      ],
      'Security Operations': [
        'Understand and comply with investigations',
        'Conduct logging and monitoring activities',
        'Perform configuration management and apply foundational security operations concepts',
        'Apply resource protection and conduct incident management',
        'Operate and maintain detection and preventative measures',
        'Implement patch and vulnerability management and participate in change management',
        'Implement recovery strategies and Disaster Recovery (DR) processes, and test DR plans',
        'Participate in BC planning, manage physical security and address personnel safety'
      ],
      'Software Development Security': [
        'Understand and integrate security in the Software Development Life Cycle (SDLC)',
        'Identify and apply security controls in software development ecosystems',
        'Assess the effectiveness of software security',
        'Assess security impact of acquired software',
        'Define and apply secure coding guidelines and standards'
      ]
    }
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
    ],
    examPageUrl: 'https://www.isc2.org/certifications/sscp',
    studyGuideUrl: 'https://www.isc2.org/certifications/sscp/sscp-certification-exam-outline',
    topics: {
      'Security Operations and Administration': [
        'Comply with codes of ethics',
        'Understand security concepts',
        'Identify and implement security controls',
        'Document and maintain functional security controls',
        'Support and implement the asset management lifecycle',
        'Support and implement the change management lifecycle',
        'Support and implement security awareness and training',
        'Collaborate with physical security operations'
      ],
      'Access Controls': [
        'Implement and maintain authentication methods',
        'Understand and support internetwork trust architectures',
        'Support and implement the identity management lifecycle',
        'Understand and administer access controls'
      ],
      'Risk Identification, Monitoring, and Analysis': [
        'Understand risk management',
        'Understand legal and regulatory concerns (e.g., jurisdiction, limitations, privacy)',
        'Perform security assessments and vulnerability management activities',
        'Operate and monitor security platforms (e.g., continuous monitoring)',
        'Analyze monitoring results'
      ],
      'Incident Response and Recovery': [
        'Understand and support the incident response lifecycle (e.g., NIST, ISO)',
        'Understand and support forensic investigations',
        'Understand and support business continuity (BCP) and disaster recovery plans (DRP)'
      ],
      'Cryptography': [
        'Understand reasons and requirements for cryptography',
        'Apply cryptography concepts',
        'Understand and implement secure protocols',
        'Understand public key infrastructure (PKI)'
      ],
      'Network and Communications Security': [
        'Understand and apply fundamental concepts of networking',
        'Understand network attacks and countermeasures (e.g., DDoS, MITM, DNS cache poisoning)',
        'Manage network access controls',
        'Manage network security',
        'Operate and configure network-based security appliances and services',
        'Secure wireless communications',
        'Secure and monitor Internet of Things (IoT)'
      ],
      'Systems and Application Security': [
        'Identify and analyze malicious code and activity',
        'Implement and operate endpoint device security',
        'Administer and manage mobile devices',
        'Understand and configure cloud security',
        'Operate and maintain secure virtual environments'
      ]
    }
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
    ],
    examPageUrl: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
    studyGuideUrl: 'https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.37.pdf',
    topics: {
      'Cluster Architecture, Installation and Configuration': [
        'Manage role based access control (RBAC)',
        'Prepare underlying infrastructure for installing a Kubernetes cluster',
        'Create and manage Kubernetes clusters using kubeadm',
        'Manage the lifecycle of Kubernetes clusters',
        'Implement and configure a highly-available control plane',
        'Use Helm and Kustomize to install cluster components',
        'Understand extension interfaces (CNI, CSI, CRI, etc.)',
        'Understand CRDs, install and configure operators'
      ],
      'Workloads and Scheduling': [
        'Understand application deployments and how to perform rolling updates and rollbacks',
        'Use ConfigMaps and Secrets to configure applications',
        'Configure workload autoscaling',
        'Understand the primitives used to create robust, self-healing application deployments',
        'Configure Pod admission and scheduling (limits, node affinity, etc.)'
      ],
      'Services and Networking': [
        'Understand connectivity between Pods',
        'Define and enforce Network Policies',
        'Use ClusterIP, NodePort, LoadBalancer service types and endpoints',
        'Use the Gateway API to manage Ingress traffic',
        'Know how to use Ingress controllers and Ingress resources',
        'Understand and use CoreDNS'
      ],
      'Storage': [
        'Implement storage classes and dynamic volume provisioning',
        'Configure volume types, access modes and reclaim policies',
        'Manage persistent volumes and persistent volume claims'
      ],
      'Troubleshooting': [
        'Troubleshoot clusters and nodes',
        'Troubleshoot cluster components',
        'Monitor cluster and application resource usage',
        'Manage and evaluate container output streams',
        'Troubleshoot services and networking'
      ]
    }
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
    ],
    examPageUrl: 'https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/',
    studyGuideUrl: 'https://github.com/cncf/curriculum/blob/master/CKAD_Curriculum_v1.37.pdf',
    topics: {
      'Application Design and Build': [
        'Define, build and modify container images',
        'Choose and use the right workload resource (Deployment, DaemonSet, CronJob, etc.)',
        'Understand multi-container Pod design patterns (e.g. sidecar, init and others)',
        'Utilize persistent and ephemeral volumes'
      ],
      'Application Deployment': [
        'Use Kubernetes primitives to implement common deployment strategies (blue/green, canary)',
        'Understand Deployments and how to perform rolling updates',
        'Use the Helm package manager to deploy existing packages',
        'Kustomize'
      ],
      'Application Observability and Maintenance': [
        'Understand API deprecations',
        'Implement probes and health checks',
        'Use built-in CLI tools to monitor Kubernetes applications',
        'Utilize container logs',
        'Debugging in Kubernetes'
      ],
      'Application Environment, Configuration and Security': [
        'Discover and use resources that extend Kubernetes (CRD, Operators)',
        'Understand authentication, authorization and admission control',
        'Understand requests, limits, quotas',
        'Understand ConfigMaps',
        'Define resource requirements',
        'Create and consume Secrets',
        'Understand ServiceAccounts',
        'Understand Application Security (SecurityContexts, Capabilities, etc.)'
      ],
      'Services and Networking': [
        'Demonstrate basic understanding of NetworkPolicies',
        'Provide and troubleshoot access to applications via services',
        'Use Ingress rules to expose applications'
      ]
    }
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
    ],
    examPageUrl: 'https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/',
    studyGuideUrl: 'https://github.com/cncf/curriculum/blob/master/CKS_Curriculum%20v1.34.pdf',
    topics: {
      'Cluster Setup': [
        'Use Network security policies to restrict cluster level access',
        'Use CIS benchmark to review the security configuration of Kubernetes components',
        'Properly set up Ingress with TLS',
        'Protect node metadata and endpoints',
        'Verify platform binaries before deploying'
      ],
      'Cluster Hardening': [
        'Use Role Based Access Controls to minimize exposure',
        'Exercise caution in using service accounts (disable defaults, minimize permissions)',
        'Restrict access to Kubernetes API',
        'Upgrade Kubernetes to avoid vulnerabilities'
      ],
      'System Hardening': [
        'Minimize host OS footprint (reduce attack surface)',
        'Use least-privilege identity and access management',
        'Minimize external access to the network',
        'Appropriately use kernel hardening tools such as AppArmor and seccomp'
      ],
      'Minimize Microservice Vulnerabilities': [
        'Use appropriate pod security standards',
        'Manage Kubernetes secrets',
        'Understand and implement isolation techniques (multi-tenancy, sandboxed containers, etc.)',
        'Implement Pod-to-Pod encryption (Cilium, Istio)'
      ],
      'Supply Chain Security': [
        'Minimize base image footprint',
        'Understand your supply chain (e.g. SBOM, CI/CD, artifact repositories)',
        'Secure your supply chain (permitted registries, sign and validate artifacts, etc.)',
        'Perform static analysis of user workloads and container images (e.g. Kubesec, KubeLinter)'
      ],
      'Monitoring, Logging and Runtime Security': [
        'Perform behavioral analytics to detect malicious activities',
        'Detect threats within physical infrastructure, apps, networks, data, users and workloads',
        'Investigate and identify phases of attack and bad actors within the environment',
        'Ensure immutability of containers at runtime',
        'Use Kubernetes audit logs to monitor access'
      ]
    }
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
    ],
    examPageUrl: 'https://training.linuxfoundation.org/certification/kubernetes-cloud-native-associate/',
    studyGuideUrl: 'https://github.com/cncf/curriculum/blob/master/KCNA_Curriculum.pdf',
    topics: {
      'Kubernetes Fundamentals': [
        'Kubernetes Core Concepts',
        'Administration',
        'Scheduling',
        'Containerization'
      ],
      'Container Orchestration': [
        'Networking',
        'Security',
        'Troubleshooting',
        'Storage'
      ],
      'Cloud Native Architecture': [
        'Cloud Native Ecosystem and Principles',
        'Cloud Native Community and Collaboration'
      ],
      'Cloud Native Observability': [
        'Observability'
      ],
      'Cloud Native Application Delivery': [
        'Application Delivery',
        'Debugging'
      ]
    }
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
    ],
    examPageUrl: 'https://training.linuxfoundation.org/certification/kubernetes-and-cloud-native-security-associate-kcsa/',
    studyGuideUrl: 'https://github.com/cncf/curriculum/blob/master/KCSA%20Curriculum.pdf',
    topics: {
      'Overview of Cloud Native Security': [
        'The 4Cs of Cloud Native Security',
        'Cloud Provider and Infrastructure Security',
        'Controls and Frameworks',
        'Isolation Techniques',
        'Artifact Repository and Image Security',
        'Workload and Application Code Security'
      ],
      'Kubernetes Cluster Component Security': [
        'API Server',
        'Controller Manager and Scheduler',
        'Kubelet and Container Runtime',
        'KubeProxy and Container Networking',
        'Pod',
        'Etcd',
        'Client Security',
        'Storage'
      ],
      'Kubernetes Security Fundamentals': [
        'Pod Security Standards',
        'Pod Security Admissions',
        'Authentication',
        'Authorization',
        'Secrets',
        'Isolation and Segmentation',
        'Audit Logging',
        'Network Policy'
      ],
      'Kubernetes Threat Model': [
        'Kubernetes Trust Boundaries and Data Flow',
        'Persistence',
        'Denial of Service',
        'Malicious Code Execution and Compromised Applications in Containers',
        'Attacker on the Network',
        'Access to Sensitive Data',
        'Privilege Escalation'
      ],
      'Platform Security': [
        'Supply Chain Security',
        'Image Repository',
        'Observability',
        'Service Mesh',
        'PKI',
        'Connectivity',
        'Admission Control'
      ],
      'Compliance and Security Frameworks': [
        'Compliance Frameworks',
        'Threat Modelling Frameworks',
        'Supply Chain Compliance',
        'Automation and Tooling'
      ]
    }
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
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-900',
    topics: {
      'Describe Artificial Intelligence workloads and considerations': [
        'Identify computer vision workloads',
        'Identify natural language processing workloads',
        'Identify document processing workloads',
        'Identify features of generative AI workloads',
        'Responsible AI: fairness, reliability and safety, privacy and security',
        'Responsible AI: inclusiveness, transparency and accountability'
      ],
      'Describe fundamental principles of machine learning on Azure': [
        'Identify regression, classification and clustering machine learning scenarios',
        'Identify features of deep learning techniques and the Transformer architecture',
        'Identify features and labels in a dataset for machine learning',
        'Describe how training and validation datasets are used in machine learning',
        'Describe capabilities of automated machine learning',
        'Describe data and compute services for data science and machine learning',
        'Describe model management and deployment capabilities in Azure Machine Learning'
      ],
      'Describe features of computer vision workloads on Azure': [
        'Identify features of image classification solutions',
        'Identify features of object detection solutions',
        'Identify features of optical character recognition solutions',
        'Identify features of facial detection and facial analysis solutions',
        'Describe capabilities of the Azure AI Vision service',
        'Describe capabilities of the Azure AI Face detection service'
      ],
      'Describe features of Natural Language Processing (NLP) workloads on Azure': [
        'Identify features and uses for key phrase extraction and entity recognition',
        'Identify features and uses for sentiment analysis',
        'Identify features and uses for language modeling',
        'Identify features and uses for speech recognition and synthesis',
        'Identify features and uses for translation',
        'Describe capabilities of the Azure AI Language service',
        'Describe capabilities of the Azure AI Speech service'
      ],
      'Describe features of generative AI workloads on Azure': [
        'Identify features of generative AI models',
        'Identify common scenarios for generative AI',
        'Identify responsible AI considerations for generative AI',
        'Describe features and capabilities of Azure AI Foundry',
        'Describe features and capabilities of Azure OpenAI service',
        'Describe features and capabilities of Azure AI Foundry model catalog'
      ]
    }
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
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104',
    topics: {
      'Manage Azure identities and governance': [
        'Manage Microsoft Entra users and groups',
        'Manage access to Azure resources',
        'Manage Azure subscriptions and governance'
      ],
      'Implement and manage storage': [
        'Configure access to storage',
        'Configure and manage storage accounts',
        'Configure Azure Files and Azure Blob Storage'
      ],
      'Deploy and manage Azure compute resources': [
        'Automate deployment of resources by using ARM templates or Bicep files',
        'Create and configure virtual machines',
        'Provision and manage containers in the Azure portal',
        'Create and configure Azure App Service'
      ],
      'Implement and manage virtual networking': [
        'Configure and manage virtual networks in Azure',
        'Configure secure access to virtual networks',
        'Configure name resolution and load balancing'
      ],
      'Monitor and maintain Azure resources': [
        'Monitor resources by using Azure Monitor metrics, logs and alerts',
        'Use Azure Monitor Insights, Azure Network Watcher and Connection monitor',
        'Implement backup and recovery by using Recovery Services and Azure Backup vaults',
        'Configure Azure Site Recovery and perform a failover to a secondary region'
      ]
    }
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
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-204',
    topics: {
      'Develop Azure compute solutions': [
        'Implement containerized solutions (Container Registry, Instances and Apps)',
        'Implement Azure App Service Web Apps',
        'Implement Azure Functions'
      ],
      'Develop for Azure storage': [
        'Perform operations on Azure Cosmos DB containers and items by using the SDK',
        'Set the appropriate Azure Cosmos DB consistency level for operations',
        'Implement Azure Cosmos DB change feed notifications',
        'Set and retrieve Azure Blob Storage properties and metadata',
        'Perform operations on Blob Storage data by using the appropriate SDK',
        'Implement storage policies and data lifecycle management'
      ],
      'Implement Azure security': [
        'Authenticate and authorize users by using the Microsoft Identity platform',
        'Authenticate and authorize users and apps by using Microsoft Entra ID',
        'Create and implement shared access signatures',
        'Implement solutions that interact with Microsoft Graph',
        'Secure app configuration data by using Azure App Configuration or Azure Key Vault',
        'Develop code that uses keys, secrets and certificates stored in Azure Key Vault',
        'Implement Managed Identities for Azure resources'
      ],
      'Monitor, troubleshoot, and optimize Azure solutions': [
        'Monitor and analyze metrics, logs and traces with Application Insights',
        'Implement availability tests and alerts',
        'Instrument an app or service to use Application Insights'
      ],
      'Connect to and consume Azure services and third-party services': [
        'Implement Azure API Management',
        'Develop event-based solutions with Azure Event Grid and Azure Event Hubs',
        'Develop message-based solutions with Azure Service Bus and Azure Queue Storage'
      ]
    }
  },
  'microsoft-az-305': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Design identity, governance, and monitoring solutions', weight: 28 },
      { name: 'Design data storage solutions', weight: 22 },
      { name: 'Design business continuity solutions', weight: 17 },
      { name: 'Design infrastructure solutions', weight: 33 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305',
    topics: {
      'Design identity, governance, and monitoring solutions': [
        'Design solutions for logging and monitoring',
        'Design authentication and authorization solutions',
        'Design governance'
      ],
      'Design data storage solutions': [
        'Design data storage solutions for relational data',
        'Design data storage solutions for semi-structured and unstructured data',
        'Design data integration'
      ],
      'Design business continuity solutions': [
        'Recommend a recovery solution for Azure and hybrid workloads meeting recovery objectives',
        'Recommend a backup and recovery solution for compute',
        'Recommend a backup and recovery solution for databases',
        'Recommend a backup and recovery solution for unstructured data',
        'Recommend a high availability solution for compute',
        'Recommend a high availability solution for relational data',
        'Recommend a high availability solution for semi-structured and unstructured data'
      ],
      'Design infrastructure solutions': [
        'Design compute solutions',
        'Design an application architecture',
        'Design migrations',
        'Design network solutions'
      ]
    }
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
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-database-administrator-associate/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-300',
    topics: {
      'Plan and implement data platform resources': [
        'Plan and deploy Azure SQL solutions',
        'Configure resources for scale and performance',
        'Plan and implement a migration strategy'
      ],
      'Implement a secure environment': [
        'Configure database authentication and authorization',
        'Implement security for data at rest and data in transit',
        'Implement compliance controls for sensitive data'
      ],
      'Monitor, configure, and optimize database resources': [
        'Monitor resource activity and performance',
        'Monitor and optimize query performance',
        'Configure database solutions for optimal performance'
      ],
      'Configure and manage automation of tasks': [
        'Create and manage SQL Server Agent jobs',
        'Automate deployment of database resources',
        'Create and manage database tasks in Azure'
      ],
      'Plan and configure a high availability and disaster recovery (HADR) environment': [
        'Plan an HA/DR strategy for database solutions',
        'Plan and perform backup and restore of a database',
        'Configure HA/DR for database solutions'
      ]
    }
  },
  'microsoft-dp-600': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-600',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Plan, Implement, and Manage a Solution for Data Analytics', weight: 27 },
      { name: 'Prepare and Serve Data', weight: 46 },
      { name: 'Implement and Manage Semantic Models', weight: 27 },
      { name: 'Explore and Analyze Data', weight: 0 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/fabric-analytics-engineer-associate/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-600',
    topics: {
      'Plan, Implement, and Manage a Solution for Data Analytics': [
        'Implement workspace-level access controls',
        'Implement item-level access controls',
        'Implement row-level, column-level, object-level, and file-level access control',
        'Apply sensitivity labels to items and endorse items',
        'Configure version control for a workspace',
        'Create and configure deployment pipelines',
        'Perform impact analysis of downstream dependencies',
        'Deploy and manage semantic models by using the XMLA endpoint'
      ],
      'Prepare and Serve Data': [
        'Create a data connection',
        'Discover data by using OneLake catalog and Real-Time hub',
        'Ingest or access data as needed',
        'Choose between different data stores',
        'Create views, functions, and stored procedures',
        'Implement a star schema for a lakehouse or warehouse',
        'Denormalize, aggregate, merge, or join data',
        'Identify and resolve duplicate data, missing data, or null values'
      ],
      'Implement and Manage Semantic Models': [
        'Choose a storage mode',
        'Implement relationships, such as bridge tables and many-to-many relationships',
        'Write DAX calculations using variables, iterators, table filtering, and windowing',
        'Implement calculation groups, dynamic format strings, and field parameters',
        'Design and build composite models',
        'Implement performance improvements in queries and report visuals',
        'Configure Direct Lake, including default fallback and refresh behavior',
        'Implement incremental refresh for semantic models'
      ],
      'Explore and Analyze Data': [
        'Select, filter, and aggregate data by using the Visual query editor',
        'Select, filter, and aggregate data by using SQL',
        'Select, filter, and aggregate data by using KQL',
        'Select, filter, and aggregate data by using DAX'
      ]
    }
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
    },
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-900',
    topics: {
      'Describe core data concepts': [
        'Describe ways to represent data',
        'Identify options for data storage',
        'Describe common data workloads',
        'Identify roles and responsibilities for data workloads'
      ],
      'Identify considerations for relational data on Azure': [
        'Identify features of relational data',
        'Describe normalization and why it is used',
        'Identify common structured query language (SQL) statements',
        'Identify common database objects',
        'Describe the Azure SQL family: SQL Database, SQL Managed Instance, SQL Server on VMs',
        'Identify Azure database services for open-source database systems'
      ],
      'Describe considerations for non-relational data on Azure': [
        'Describe features of Azure Blob storage',
        'Describe features of Azure Files',
        'Describe features of Azure Table storage',
        'Identify use cases for Azure Cosmos DB',
        'Describe Azure Cosmos DB APIs'
      ],
      'Describe an analytics workload': [
        'Describe common elements of large-scale analytics',
        'Describe considerations for real-time data analytics',
        'Describe data visualization in Microsoft Power BI'
      ]
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
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/modern-desktop/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/md-102',
    topics: {
      'Prepare infrastructure for devices': [
        'Add devices to Microsoft Entra ID',
        'Enroll devices to Microsoft Intune',
        'Implement identity and compliance'
      ],
      'Manage and maintain devices': [
        'Deploy and upgrade Windows clients by using cloud-based tools',
        'Plan and implement device configuration profiles',
        'Implement Intune Suite add-on capabilities',
        'Perform remote actions on devices',
        'Automate management tasks',
        'Monitor and optimize health'
      ],
      'Manage applications': [
        'Prepare applications for deployment by using Intune',
        'Deploy apps by using Intune, including Win32, LOB, and Microsoft Store apps',
        'Deploy Microsoft 365 Apps by using Intune',
        'Manage Microsoft 365 Apps by using the Microsoft 365 Apps admin center',
        'Deploy apps from Apple Business Manager and Managed Google Play by using Intune',
        'Monitor app deployment status and troubleshoot installation failures',
        'Plan and implement app protection policies for managed and unmanaged (BYOD) devices',
        'Plan and implement app configuration policies for managed apps and managed devices'
      ],
      'Protect devices': [
        'Create antivirus policies by using Microsoft Intune',
        'Create and manage disk encryption policies, including BitLocker recovery keys',
        'Create firewall policies by using Microsoft Intune',
        'Configure attack surface reduction policies by using Microsoft Intune',
        'Plan and implement security baselines by using Microsoft Intune',
        'Integrate Intune with Microsoft Defender for Endpoint',
        'Create and manage update rings, feature updates, and quality updates for Windows',
        'Implement Windows Autopatch and configure Hotpatch policies'
      ]
    }
  },
  'microsoft-ms-102': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ms-102',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Deploy and manage a Microsoft 365 tenant', weight: 28 },
      { name: 'Implement and manage Microsoft Entra identity and access', weight: 27 },
      { name: 'Manage security and threats by using Microsoft Defender XDR', weight: 33 },
      { name: 'Manage compliance by using Microsoft Purview', weight: 12 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/m365-administrator-expert/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ms-102',
    topics: {
      'Deploy and manage a Microsoft 365 tenant': [
        'Implement and manage a Microsoft 365 tenant',
        'Manage users and groups',
        'Manage roles and role groups'
      ],
      'Implement and manage Microsoft Entra identity and access': [
        'Implement and manage identity synchronization with Microsoft Entra tenant',
        'Implement and manage authentication',
        'Implement and manage secure access'
      ],
      'Manage security and threats by using Microsoft Defender XDR': [
        'Review and respond to security reports and alerts generated by Microsoft Defender XDR',
        'Manage email and collaboration protection with Microsoft Defender for Office 365',
        'Implement and manage endpoint protection by using Microsoft Defender for Endpoint',
        'Implement and manage Microsoft Defender for Cloud Apps'
      ],
      'Manage compliance by using Microsoft Purview': [
        'Implement and manage sensitive information types',
        'Implement retention labels, retention label policies, and retention policies',
        'Implement sensitivity labels and sensitivity label policies',
        'Monitor label usage with Content explorer, Activity explorer, and label reports',
        'Configure DLP policies for Microsoft 365 workloads',
        'Configure Endpoint DLP',
        'Review and respond to DLP alerts, events, and reports'
      ]
    }
  },
  'microsoft-ms-700': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ms-700',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Configure and manage a Teams environment', weight: 43 },
      { name: 'Manage teams, channels, chats, and apps', weight: 23 },
      { name: 'Manage meetings and calling', weight: 17 },
      { name: 'Monitor, report on, and troubleshoot Teams', weight: 17 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/m365-teams-administrator-associate/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ms-700',
    topics: {
      'Configure and manage a Teams environment': [
        'Plan network settings for Teams',
        'Manage security and compliance settings for Teams',
        'Plan and implement governance for Teams',
        'Configure and manage external collaboration',
        'Manage Teams clients and devices'
      ],
      'Manage teams, channels, chats, and apps': [
        'Create and manage teams',
        'Manage channels and chats',
        'Manage apps for Teams'
      ],
      'Manage meetings and calling': [
        'Recommend meeting types, including Appointments, webinars, town halls, and meetings',
        'Configure meeting settings, including for Microsoft 365 Copilot',
        'Create and manage meeting templates, meeting policies, and customization policies',
        'Configure and manage Teams webinars and town halls',
        'Provision and manage phone numbers for users, services, and conferencing bridges',
        'Manage voice settings, voicemail policies, and calling policies',
        'Manage auto-attendants and call queues'
      ],
      'Monitor, report on, and troubleshoot Teams': [
        'Monitor and report on voice and meeting quality',
        'Configure alert rules',
        'Report on Teams usage, including team activity, app usage, and active users',
        'Monitor and report on the creation and deletion of teams',
        'Monitor and report on guest access',
        'Collect client-side logs and clear the Teams client cache',
        'Troubleshoot Teams client installation, update, and sign-in issues',
        'Troubleshoot issues with joining meetings and accessing meeting features'
      ]
    }
  },
  'microsoft-pl-300': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Prepare the data', weight: 28 },
      { name: 'Model the data', weight: 28 },
      { name: 'Visualize and analyze the data', weight: 27 },
      { name: 'Manage and secure Power BI', weight: 17 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300',
    topics: {
      'Prepare the data': [
        'Get or connect to data',
        'Profile and clean the data',
        'Transform and load the data'
      ],
      'Model the data': [
        'Design and implement a data model',
        'Create model calculations by using DAX',
        'Optimize model performance'
      ],
      'Visualize and analyze the data': [
        'Create reports',
        'Enhance reports for usability and storytelling',
        'Identify patterns and trends'
      ],
      'Manage and secure Power BI': [
        'Create and configure a workspace',
        'Publish, import, or update items in a workspace',
        'Configure and update an app',
        'Promote or certify Power BI content',
        'Identify when a gateway is required and configure scheduled refresh',
        'Assign workspace roles and configure item-level access',
        'Implement row-level security roles and group membership',
        'Apply sensitivity labels'
      ]
    }
  },
  'microsoft-pl-600': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-600',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Perform Solution Envisioning and Requirement Analysis', weight: 46 },
      { name: 'Architect a Solution', weight: 37 },
      { name: 'Implement the Solution', weight: 17 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/power-platform-solution-architect-expert/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-600',
    topics: {
      'Perform Solution Envisioning and Requirement Analysis': [
        'Initiate solution planning',
        'Identify organization information and metrics',
        'Identify existing solutions and systems',
        'Capture requirements',
        'Perform fit/gap analyses'
      ],
      'Architect a Solution': [
        'Lead the design process',
        'Design the data model',
        'Design integrations',
        'Design the security model'
      ],
      'Implement the Solution': [
        'Evaluate detailed designs and implementation',
        'Review security across the solution, including business rules, user roles, and boundaries',
        'Ensure that the solution conforms to API limits',
        'Assess the solution performance and impact on resources',
        'Resolve automation and integration conflicts',
        'Identify and resolve potential and actual performance issues',
        'Escalate and provide options to resolve data migration issues',
        'Identify factors that impact go-live readiness and remediate issues'
      ]
    }
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
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/power-platform-fundamentals/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-900',
    topics: {
      'Describe the Business Value of Power Platform': [
        'Describe the value of Power Apps to build applications',
        'Describe the value of Power Automate to automate processes',
        'Describe the value of Dataverse to organize business data',
        'Describe the value of connectors to integrate services and data for apps and flows',
        'Describe the value of generative AI features in Microsoft Power Platform',
        'Describe the value of Copilot Studio to create agents'
      ],
      'Identify Core Components of Power Platform': [
        'Describe differences between traditional databases and Dataverse',
        'Describe tables, columns, and relationships',
        'Describe table forms and views',
        'Describe the options for business logic in Dataverse, including Power Fx',
        'Describe environments',
        'Describe the Microsoft Power Platform security model',
        'Describe the monitoring and analytics capabilities of Microsoft Power Platform',
        'Describe application lifecycle management (ALM) with Power Platform pipelines'
      ],
      'Demonstrate the Capabilities of Power Apps': [
        'Describe use cases for and capabilities of canvas apps',
        'Describe use cases for and capabilities of model-driven apps',
        'Describe use cases for and capabilities of Plan designer',
        'Describe use cases for and capabilities of code apps',
        'Describe how to use AI to create a canvas app',
        'Describe how to use AI to create a model-driven app',
        'Describe creating AI-powered apps by using the vibe experience'
      ],
      'Demonstrate the Capabilities of Power Automate': [
        'Describe use cases for cloud and desktop flows',
        'Describe use cases for approvals, Teams, Outlook, SharePoint, Forms, and documents',
        'Describe connector triggers and actions for cloud flows',
        'Describe how to use AI to create and modify cloud flows',
        'Describe how to use AI to create and modify desktop flows'
      ],
      'Demonstrate the Capabilities of Power Pages and Copilot Studio': [
        'Describe the value of Microsoft Power Pages to build websites',
        'Describe use cases for agents',
        'Describe how to build agent conversation paths by using topics',
        'Describe how to use knowledge sources in agents',
        'Describe how tools, including MCP servers and agent flows, are used in agents',
        'Describe how to publish agents by using channels',
        'Describe how to monitor Copilot Studio agent usage and adoption',
        'Describe agent evaluations'
      ]
    }
  },
  'microsoft-sc-100': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-100',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Design Solutions That Align with Security Best Practices and Priorities', weight: 22 },
      { name: 'Design Security Operations, Identity, and Compliance Capabilities', weight: 28 },
      { name: 'Design Security Solutions for Infrastructure', weight: 28 },
      { name: 'Design Security Solutions for Applications and Data', weight: 22 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/cybersecurity-architect-expert/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-100',
    topics: {
      'Design Solutions That Align with Security Best Practices and Priorities': [
        'Design a ransomware resiliency strategy based on Microsoft Security Best Practices',
        'Design solutions aligned with MCRA and the Microsoft Cloud Security Benchmark (MCSB)',
        'Design solutions aligned with the Cloud Adoption Framework and Well-Architected Framework'
      ],
      'Design Security Operations, Identity, and Compliance Capabilities': [
        'Design solutions for security operations',
        'Design solutions for identity and access management',
        'Design solutions for securing privileged access',
        'Design solutions for regulatory compliance'
      ],
      'Design Security Solutions for Infrastructure': [
        'Design solutions for security posture management in hybrid and multicloud environments',
        'Specify requirements for securing server and client endpoints',
        'Specify requirements for securing SaaS, PaaS, and IaaS services',
        'Evaluate solutions for network security and Security Service Edge (SSE)'
      ],
      'Design Security Solutions for Applications and Data': [
        'Evaluate solutions for securing Microsoft 365',
        'Design solutions for securing applications',
        'Design solutions for securing an organization\'s data'
      ]
    }
  },
  'microsoft-sc-200': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Manage a security operations environment', weight: 41 },
      { name: 'Respond to security incidents', weight: 37 },
      { name: 'Perform threat hunting', weight: 22 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/security-operations-analyst/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200',
    topics: {
      'Manage a security operations environment': [
        'Configure automation for Microsoft Defender XDR and Microsoft Sentinel',
        'Configure the Microsoft Sentinel SIEM and platform',
        'Ingest data into the Microsoft Sentinel SIEM and platform',
        'Configure detections'
      ],
      'Respond to security incidents': [
        'Respond to alerts and incidents in Microsoft Defender XDR',
        'Respond to alerts and incidents in Microsoft Defender for Endpoint',
        'Investigate Microsoft 365 activities to identify threats'
      ],
      'Perform threat hunting': [
        'Identify threats by using Kusto Query Language (KQL)',
        'Create Advanced Hunting queries in Microsoft Defender XDR',
        'Interpret threat analytics in Microsoft Defender XDR',
        'Create hunting graphs, including blast radius',
        'Analyze relationships between entities by using Sentinel Graph',
        'Create and monitor hunting queries in Microsoft Sentinel',
        'Create and manage KQL jobs in Data lake',
        'Hunt for threats by using Notebooks, including connection to the Sentinel MCP Server'
      ]
    }
  },
  'microsoft-sc-300': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-300',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Implement Identities in Microsoft Entra', weight: 24 },
      { name: 'Implement Authentication and Access Management', weight: 29 },
      { name: 'Implement Access Management for Applications', weight: 24 },
      { name: 'Plan and Implement Identity Governance', weight: 23 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/identity-and-access-administrator/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-300',
    topics: {
      'Implement Identities in Microsoft Entra': [
        'Configure and manage a Microsoft Entra tenant',
        'Create, configure, and manage Microsoft Entra identities',
        'Implement and manage identities for external users and tenants',
        'Implement and manage hybrid identity'
      ],
      'Implement Authentication and Access Management': [
        'Plan, implement, and manage Microsoft Entra user authentication',
        'Plan, implement, and manage Microsoft Entra Conditional Access',
        'Manage risk by using Microsoft Entra ID Protection',
        'Implement Global Secure Access'
      ],
      'Implement Access Management for Applications': [
        'Plan and implement identities for applications and Azure workloads',
        'Plan, implement, and monitor the integration of enterprise applications',
        'Plan and implement app registrations',
        'Manage and monitor app access by using Microsoft Defender for Cloud Apps'
      ],
      'Plan and Implement Identity Governance': [
        'Plan and implement entitlement management in Microsoft Entra',
        'Plan, implement, and manage access reviews in Microsoft Entra',
        'Plan and implement privileged access',
        'Monitor identity activity by using logs, workbooks, and reports'
      ]
    }
  },
  'microsoft-sc-900': {
    sourceUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Describe the concepts of security, compliance, and identity', weight: 12 },
      { name: 'Describe the capabilities of Microsoft Entra', weight: 28 },
      { name: 'Describe the capabilities of Microsoft security solutions', weight: 38 },
      { name: 'Describe the capabilities of Microsoft compliance solutions', weight: 22 }
    ],
    examPageUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/security-compliance-and-identity-fundamentals/',
    studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900',
    topics: {
      'Describe the concepts of security, compliance, and identity': [
        'Describe the shared responsibility model',
        'Describe defense-in-depth',
        'Describe the Zero Trust model',
        'Describe encryption and hashing',
        'Describe Governance, Risk, and Compliance (GRC) concepts',
        'Define identity as the primary security perimeter',
        'Define authentication and authorization',
        'Describe identity providers, directory services, Active Directory and federation'
      ],
      'Describe the capabilities of Microsoft Entra': [
        'Describe function and identity types of Microsoft Entra ID',
        'Describe authentication capabilities of Microsoft Entra ID',
        'Describe access management capabilities of Microsoft Entra ID',
        'Describe identity protection and governance capabilities of Microsoft Entra'
      ],
      'Describe the capabilities of Microsoft security solutions': [
        'Describe core infrastructure security services in Azure',
        'Describe security management capabilities of Azure',
        'Describe capabilities of Microsoft Sentinel',
        'Describe threat protection with Microsoft Defender XDR'
      ],
      'Describe the capabilities of Microsoft compliance solutions': [
        'Describe Microsoft Service Trust Portal and privacy principles',
        'Describe compliance management capabilities of Microsoft Purview',
        'Describe information protection, data lifecycle management and data governance in Purview',
        'Describe insider risk, eDiscovery, and audit capabilities in Microsoft Purview'
      ]
    }
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
    ],
    examPageUrl: 'https://www.pmi.org/certifications/agile-acp',
    studyGuideUrl: 'https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/agile-certified-exam-outline.pdf',
    topics: {
      'Agile Principles and Mindset': [
        'Experiment early: build increments to validate the solution and market need',
        'Embrace an agile mindset: use agile values, principles and complexity models',
        'Promote agile mindset principles and practices across the team',
        'Embrace change: promote a growth mindset and adapt to changing requirements'
      ],
      'Value-Driven Delivery': [
        'Manage increments aligned with business priorities and measure value delivered',
        'Manage value delivery: define value and ensure targeted results are achieved',
        'Optimize flow: limit work in progress and shield the team from interruptions'
      ],
      'Stakeholder Engagement': [
        'Shorten feedback loops by including stakeholders from day one',
        'Promote a shared vision and purpose with all stakeholders',
        'Build transparency with information radiators and communication strategies',
        'Seek early feedback and incorporate stakeholder input regularly',
        'Actively engage customers and validate deliverables against acceptance criteria'
      ],
      'Team Performance': [
        'Promote a collaborative team environment and working agreements',
        'Empower teams through trust, coaching, mentoring and emotional intelligence',
        'Facilitate conflict management with a collaborative approach'
      ],
      'Adaptive Planning': [
        'Refine the product backlog: clarify, prioritize, decompose and size items',
        'Visualize work and keep progress data continuously shared',
        'Manage agile metrics and use their insights for decision making'
      ],
      'Problem Detection and Resolution': [
        'Foster psychological safety and a no-blame culture',
        'Facilitate problem resolution using root cause analysis',
        'Manage impediments and risk proactively and prevent recurrence'
      ],
      'Continuous Improvement': [
        'Perform continuous improvements driven by metrics and feedback',
        'Promote knowledge sharing through lessons learned and communities of practice',
        'Recognize and eliminate waste across the end-to-end value flow'
      ]
    }
  },
  'pmi-capm': {
    sourceUrl: 'https://www.pmi.org/certifications/certified-associate-capm',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Project Management Fundamentals and Core Concepts', weight: 36 },
      { name: 'Predictive, Plan-Based Methodologies', weight: 17 },
      { name: 'Agile Frameworks/Methodologies', weight: 20 },
      { name: 'Business Analysis Frameworks', weight: 27 }
    ],
    examPageUrl: 'https://www.pmi.org/certifications/certified-associate-capm',
    studyGuideUrl: 'https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/capm-exam-content-outline-english.pdf',
    topics: {
      'Project Management Fundamentals and Core Concepts': [
        'Demonstrate an understanding of the various project life cycles and processes',
        'Demonstrate an understanding of project management planning',
        'Demonstrate an understanding of project roles and responsibilities',
        'Determine how to follow and execute planned strategies or frameworks',
        'Demonstrate an understanding of common problem-solving tools and techniques'
      ],
      'Predictive, Plan-Based Methodologies': [
        'Explain when it is appropriate to use a predictive, plan-based approach',
        'Demonstrate an understanding of a project management plan schedule',
        'Determine how to document project controls of predictive, plan-based projects'
      ],
      'Agile Frameworks/Methodologies': [
        'Explain when it is appropriate to use an adaptive approach',
        'Determine how to plan project iterations',
        'Determine how to document project controls for an adaptive project',
        'Explain the components of an adaptive plan',
        'Determine how to prepare and execute task management steps'
      ],
      'Business Analysis Frameworks': [
        'Demonstrate an understanding of business analysis (BA) roles and responsibilities',
        'Determine how to conduct stakeholder communication',
        'Determine how to gather requirements',
        'Demonstrate an understanding of product roadmaps',
        'Determine how project methodologies influence business analysis processes',
        'Validate requirements through product delivery'
      ]
    }
  },
  'pmi-pmp': {
    sourceUrl: 'https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/new-pmp-examination-content-outline-2026.pdf',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'People', weight: 33 },
      { name: 'Process', weight: 41 },
      { name: 'Business Environment', weight: 26 }
    ],
    examPageUrl: 'https://www.pmi.org/certifications/project-management-pmp',
    studyGuideUrl: 'https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/new-pmp-examination-content-outline-2026.pdf',
    topics: {
      'People': [
        'Develop a common vision',
        'Manage conflicts',
        'Lead the project team',
        'Engage stakeholders',
        'Align stakeholder expectations',
        'Manage stakeholder expectations',
        'Help ensure knowledge transfer',
        'Plan and manage communication'
      ],
      'Process': [
        'Develop an integrated project management plan and plan delivery',
        'Develop and manage project scope',
        'Help ensure value-based delivery',
        'Plan and manage resources and procurement',
        'Plan and manage finance and schedule',
        'Plan and optimize quality of products/deliverables',
        'Evaluate project status',
        'Manage project closure'
      ],
      'Business Environment': [
        'Define and establish project governance',
        'Plan and manage project compliance',
        'Manage and control changes',
        'Remove impediments and manage issues',
        'Plan and manage risk',
        'Continuous improvement',
        'Support organizational change',
        'Evaluate external business environment changes'
      ]
    }
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
    ],
    examPageUrl: 'https://www.pmi.org/certifications/risk-management-rmp',
    studyGuideUrl: 'https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/risk-management-exam-outline2.pdf',
    topics: {
      'Risk Strategy and Planning': [
        'Perform a preliminary document analysis',
        'Assess project environment for threats and opportunities',
        'Confirm risk thresholds based on risk appetites',
        'Establish risk management strategy',
        'Document the risk management plan',
        'Plan and lead risk management activities with stakeholders'
      ],
      'Risk Identification': [
        'Conduct risk identification exercises',
        'Examine assumption and constraint analyses',
        'Document risk triggers and thresholds based on context/environment',
        'Develop risk register'
      ],
      'Risk Analysis': [
        'Perform qualitative analysis',
        'Perform quantitative analysis',
        'Identify threats and opportunities'
      ],
      'Risk Response': [
        'Determine the appropriate risk response strategy (avoid, accept, mitigate, enhance)',
        'Decide time-bound risk response actions and identify action owners',
        'Assess and communicate the effectiveness of risk response strategies',
        'Execute the risk response and contingency plans',
        'Encourage stakeholders to provide feedback on the risk response',
        'Evaluate and react to secondary and residual risks from the response'
      ],
      'Monitor and Close Risks': [
        'Gather and analyze performance data',
        'Monitor residual and secondary risks',
        'Provide information required to update relevant project documents',
        'Monitor project risk levels'
      ]
    }
  },
  'scrum-org-psm-i': {
    aliases: {
      'Scrum Artifacts & Definition of Done': 'Scrum Artifacts',
      'Scrum Team & Accountabilities': 'Scrum Team',
      'Scrum Framework & Theory': 'Scrum Theory'
    },
    examPageUrl: 'https://www.scrum.org/assessments/professional-scrum-master-i-certification',
    topics: {
      'Scrum Theory': [
        'Empiricism and lean thinking',
        'Transparency',
        'Inspection',
        'Adaptation',
        'Scrum Values: commitment, focus, openness, respect and courage'
      ],
      'Scrum Team': [
        'A small, cross-functional, self-managing team with no sub-teams or hierarchy',
        'Developers accountabilities',
        'Product Owner accountabilities',
        'Scrum Master accountabilities',
        'Self-managing teams, facilitation and coaching'
      ],
      'Scrum Events': [
        'The Sprint as the container for all other events',
        'Sprint Planning',
        'Daily Scrum',
        'Sprint Review',
        'Sprint Retrospective'
      ],
      'Scrum Artifacts': [
        'Product Backlog and its commitment, the Product Goal',
        'Sprint Backlog and its commitment, the Sprint Goal',
        'Increment and its commitment, the Definition of Done'
      ],
      'Done': [
        'The Definition of Done as the quality standard for the Increment',
        'An Increment is born when a Product Backlog item meets the Definition of Done',
        'Done creates transparency about the work completed',
        'Work not meeting the Definition of Done cannot be released or shown at Sprint Review',
        'Organizational Definition of Done standards versus team-created ones',
        'Multiple Scrum Teams on one product share the same Definition of Done'
      ]
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
    ],
    examPageUrl: 'https://trailhead.salesforce.com/credentials/tableaudesktopfoundations',
    studyGuideUrl: 'https://help.salesforce.com/s/articleView?id=005298988&type=1',
    topics: {
      'Connecting to and Preparing Data': [
        'Create live connections and extracts',
        'Create and manage the data model',
        'Manage data properties'
      ],
      'Exploring and Analyzing Data': [
        'Create basic charts',
        'Organize data and apply filters',
        'Apply analytics to a worksheet'
      ],
      'Sharing Insights': [
        'Format view for presentation',
        'Create and modify a dashboard',
        'View and share workbook data'
      ],
      'Understanding Tableau Concepts': [
        'Understand dimensions and measures',
        'Understand discrete and continuous fields',
        'Understand aggregations'
      ]
    }
  },
  'tableau-tcda': {
    sourceUrl: 'https://help.salesforce.com/s/articleView?id=005298984&language=en_US&type=1',
    verifiedAt: '2026-10-22',
    domains: [
      { name: 'Connect to and Transform Data', weight: 24 },
      { name: 'Explore and Analyze Data', weight: 41 },
      { name: 'Create Content', weight: 26 },
      { name: 'Publish and Manage Content', weight: 9 }
    ],
    examPageUrl: 'https://trailhead.salesforce.com/credentials/tableaudataanalyst',
    studyGuideUrl: 'https://help.salesforce.com/s/articleView?id=005298984&type=1',
    topics: {
      'Connect to and Transform Data': [
        'Connect to data sources',
        'Prepare data for analysis',
        'Perform data transformation in Tableau Prep',
        'Customize fields'
      ],
      'Explore and Analyze Data': [
        'Create calculated fields',
        'Create table calculations',
        'Create and use filters',
        'Create parameters to enable interactivity',
        'Structure the data',
        'Map data geographically',
        'Summarize, model, and customize data by using the Analytics pane',
        'Create Level of Detail calculations'
      ],
      'Create Content': [
        'Create charts',
        'Create dashboards and stories',
        'Add interactivity to dashboards',
        'Format workbooks, worksheets, and dashboards'
      ],
      'Publish and Manage Content': [
        'Publish content',
        'Schedule data updates',
        'Manage published workbooks'
      ]
    }
  },
  'elastic-certified-engineer': {
    examPageUrl: 'https://www.elastic.co/training/elastic-certified-engineer-exam',
    topics: {
      'Installation and Configuration': [
        'Describe the Elastic Stack architecture',
        'Describe shard sizing and allocation strategies',
        'Secure a cluster for production'
      ],
      'Indexing Data': [
        'Define an index that satisfies a given set of requirements',
        'Define an Index Lifecycle Management policy for a time-series index',
        'Define an index template that creates a new data stream',
        'Define and use index aliases',
        'Select and configure appropriate ingest methods',
        'Use the Reindex API and Update By Query API to reindex or update documents'
      ],
      'Queries': [
        'Search for terms and/or phrases in one or more fields of an index',
        'Write a search query that is a Boolean combination of multiple queries and filters',
        'Write and execute ES|QL queries',
        'Implement semantic search',
        'Write and execute a query that searches across multiple clusters'
      ],
      'Mappings and Text Analysis': [
        'Define a mapping that satisfies a given set of requirements',
        'Define and use a dynamic template that satisfies a given set of requirements',
        'Use appropriate field data types for indexing, search and aggregation requirements'
      ],
      'Cluster Administration': [
        'Monitor and maintain cluster health',
        'Perform cross-cluster operations',
        'Implement role-based access control (RBAC)'
      ],
      'Data Processing and Aggregations': [
        'Define and use an ingest pipeline that satisfies a given set of requirements',
        'Ingest and process data using Streams',
        'Write and execute metric and bucket aggregations'
      ]
    }
  },
  'hashicorp-consul-associate': {
    examPageUrl: 'https://hashicorp-certifications.zendesk.com/hc/en-us/articles/46488759177741-The-Consul-Associate-exam-will-be-retired-on-July-15-2026',
    studyGuideUrl: 'https://hashicorp-education.s3.us-west-2.amazonaws.com/Certifications/Consul+Associate+003+for+Credly.pdf',
    topics: {
      'Explain Consul Architecture': [
        'Identify datacenter components including agents and communication protocol options',
        'Review Consul server high availability and scalability options',
        'Differentiate server agents from data plane components (client agents, Dataplane)',
        'Understand that Consul can run on multiple platforms'
      ],
      'Deploy Consul': [
        'Configure, bootstrap and start Consul server agents',
        'Configure and start Consul client agents',
        'Configure and start Consul on Kubernetes',
        'Explain Consul agent join methods and behavior',
        'Manage Consul servers',
        'Backup and restore Consul cluster state',
        'Review Consul datacenter observability',
        'Understand Consul datacenter troubleshooting options'
      ],
      'Service Discovery and Registration': [
        'Understand how Consul discovers, tracks and monitors the health of services',
        'Interpret a service registration',
        'Differentiate between service registration methods',
        'Understand service health check configuration options and behaviors',
        'Query the service catalog via CLI, API, UI or DNS and interpret the results',
        'Interpret and use prepared queries'
      ],
      'Service Mesh': [
        'Consider the high-level architecture and key benefits of Consul service mesh',
        'Understand service mesh intentions and when to use them',
        'Apply proxy configuration options within Consul service mesh',
        'Use Consul gateways to connect services into, out of and within the mesh',
        'Describe Consul service mesh observability'
      ],
      'Network Infrastructure Automation': [
        'Discuss how Consul automates networking tasks',
        'Summarize how Consul controls access to services at point of entry',
        'Understand how to enable communication between multiple Consul datacenters'
      ],
      'Consul Security': [
        'Understand the Consul security/threat model',
        'Differentiate certificate types needed for TLS encryption',
        'Interpret TLS encryption settings and intended use',
        'Configure gossip encryption',
        'Understand Consul ACL system components and usage',
        'Create and configure ACL policies and tokens',
        'Use ACL tokens to communicate securely with Consul services and agents',
        'Maintain Consul communications security'
      ]
    }
  },
  'hashicorp-terraform-associate': {
    examPageUrl: 'https://developer.hashicorp.com/certifications/terraform-associate',
    studyGuideUrl: 'https://developer.hashicorp.com/terraform/tutorials/certification-004/associate-review-004',
    topics: {
      'Infrastructure as Code (IaC) Concepts': [
        'Explain what IaC is',
        'Describe the advantages of IaC patterns'
      ],
      'The Purpose of Terraform (vs other IaC)': [
        'Explain how Terraform manages multi-cloud, hybrid cloud and service-agnostic workflows',
        'Explain how Terraform uses and manages state'
      ],
      'Terraform Fundamentals': [
        'Install and version Terraform providers',
        'Describe how Terraform uses providers',
        'Write Terraform configuration using multiple providers'
      ],
      'The Terraform Workflow': [
        'Describe the Terraform workflow',
        'Initialize a Terraform working directory',
        'Validate a Terraform configuration',
        'Generate and review an execution plan',
        'Apply changes to infrastructure with Terraform',
        'Destroy Terraform-managed infrastructure',
        'Apply formatting and style adjustments to a configuration'
      ],
      'Terraform Modules': [
        'Explain how Terraform sources modules',
        'Describe variable scope within modules',
        'Use modules in configuration',
        'Manage module versions'
      ],
      'Use Terraform Outside the Core Workflow': [
        'Import existing infrastructure into your Terraform workspace',
        'Use the CLI to inspect state',
        'Describe when and how to use verbose logging',
        'Use HCP Terraform to create infrastructure',
        'Describe HCP Terraform collaboration and governance features',
        'Organize and use HCP Terraform workspaces and projects',
        'Configure and use HCP Terraform integration'
      ],
      'Implement and Maintain State': [
        'Describe the local backend',
        'Describe state locking',
        'Configure remote state using the backend block',
        'Manage resource drift and Terraform state'
      ],
      'Read, Generate, and Modify Configuration': [
        'Use and differentiate resource and data blocks',
        'Refer to resource attributes and create cross-resource references',
        'Use variables and outputs',
        'Understand and use complex types',
        'Write dynamic configuration using expressions and functions',
        'Define resource dependencies in configuration',
        'Validate configuration using custom conditions',
        'Manage sensitive data, including secrets management with Vault'
      ]
    }
  },
  'hashicorp-vault-associate': {
    examPageUrl: 'https://developer.hashicorp.com/certifications/vault-associate',
    studyGuideUrl: 'https://developer.hashicorp.com/vault/tutorials/associate-cert-003/associate-review-003',
    topics: {
      'Vault Architecture': [
        'Describe how Vault encrypts data',
        'Explain how to seal and unseal Vault',
        'Configure environment variables',
        'Explain cluster strategy for self-managed and HashiCorp-managed clusters',
        'Explain the uses of storage backends',
        'Explain the uses of Shamir secret sharing and unsealing',
        'Explain the uses of disaster recovery and performance replication',
        'Describe the Vault Agent and the Vault Secrets Operator'
      ],
      'Authentication and Authorization': [
        'Define the purpose of authentication methods',
        'Choose an authentication method based on use case',
        'Explain the difference between human and system authentication methods',
        'Define the purpose of identities and groups',
        'Authenticate to Vault using the API, CLI and UI',
        'Configure authentication methods using the API, CLI and UI'
      ],
      'Secrets Engines': [
        'Describe the purpose of secrets engines and choose one based on use case',
        'Compare dynamic vs. static secrets and their use cases',
        'Explain the value of short-lived, dynamic secrets',
        'Describe the use of response wrapping',
        'Enable secrets engines using the API, CLI and UI',
        'Access Vault secrets using the CLI, API and UI',
        'Explain the purpose of a lease ID',
        'Describe how to renew and revoke leases'
      ],
      'Vault Policies': [
        'Explain the value of Vault policies',
        'Describe Vault policy paths',
        'Describe Vault policy capabilities',
        'Choose a Vault policy based on requirements',
        'Configure Vault policies using the UI and CLI'
      ],
      'Tokens': [
        'Choose between service and batch tokens based on use case',
        'Describe root token uses and lifecycle',
        'Explain the purpose of token accessors',
        'Explain the impact of time-to-live',
        'Explain orphaned tokens',
        'Describe how to create tokens based on need'
      ],
      'Encryption as a Service': [
        'Describe the uses of the transit secrets engine',
        'Encrypt and decrypt secrets',
        'Rotate the encryption key'
      ]
    }
  },
  'oracle-java-se-17-1z0-829': {
    examPageUrl: 'https://mylearn.oracle.com/ou/exam/java-se-17-developer-1z0-829/105037/110649/170355',
    topics: {
      'Handling Date, Time, Text, Numeric and Boolean Values': [
        'Use primitives and wrapper classes, including the Math API, to evaluate expressions',
        'Apply parentheses, type promotion and casting in arithmetic and boolean expressions',
        'Manipulate text, including text blocks, using String and StringBuilder classes',
        'Manipulate date, time, duration, period, instant and time-zone objects with Date-Time API'
      ],
      'Controlling Program Flow': [
        'Create if/else program flow control constructs',
        'Use switch statements and switch expressions',
        'Create loops',
        'Use break and continue statements'
      ],
      'Java Object-Oriented Approach': [
        'Declare and instantiate objects, including nested classes, and explain the object life-cycle',
        'Create classes and records with fields, methods, constructors and initializers',
        'Implement overloading, including var-arg methods',
        'Apply variable scope, local variable type inference, encapsulation and immutability',
        'Implement inheritance, including abstract and sealed classes, and override methods',
        'Implement polymorphism, type casting, instanceof and pattern matching',
        'Create and use interfaces, functional interfaces, and private, static and default methods',
        'Create and use enumerations with fields, methods and constructors'
      ],
      'Exception Handling': [
        'Handle exceptions using try/catch/finally blocks',
        'Use try-with-resources',
        'Use multi-catch blocks',
        'Create and use custom exceptions'
      ],
      'Working with Arrays and Collections': [
        'Create Java arrays',
        'Create List, Set, Map and Deque collections',
        'Add, remove, update, retrieve and sort elements',
        'Use generics, including wildcards'
      ],
      'Working with Streams and Lambda Expressions': [
        'Use object and primitive streams to supply, filter, map, consume and sort data',
        'Use lambda expressions implementing functional interfaces',
        'Perform decomposition, concatenation and reduction on streams',
        'Perform grouping and partitioning on sequential and parallel streams'
      ],
      'Java Platform Module System': [
        'Define modules and their dependencies',
        'Expose module content, including for reflection',
        'Define services, producers and consumers',
        'Compile Java code and produce modular and non-modular JARs',
        'Create runtime images',
        'Implement migration using unnamed and automatic modules'
      ],
      'Concurrency': [
        'Create worker threads using Runnable and Callable and manage the thread lifecycle',
        'Use Executor services and the concurrent API',
        'Develop thread-safe code using locking mechanisms and the concurrent API',
        'Process Java collections concurrently, including with parallel streams'
      ],
      'Database Applications with JDBC': [
        'Create database connections using the JDBC API',
        'Create and execute basic, prepared and callable statements',
        'Process query results',
        'Control transactions'
      ],
      'Localization': [
        'Implement localization using locales',
        'Use resource bundles',
        'Parse and format messages, dates, times and numbers',
        'Format currency and percentage values'
      ]
    }
  },
  'oracle-oci-foundations': {
    examPageUrl: 'https://mylearn.oracle.com/ou/learning-path/become-an-oci-foundations-associate/163541',
    topics: {
      'OCI Introduction': [
        'Explore OCI Distributed Cloud',
        'Understand OCI Regions and Availability Domains',
        'Learn OCI basics and architecture',
        'Discuss OCI pricing model',
        'Outline OCI cost management tools',
        'Use tagging and understand support rewards'
      ],
      'OCI Identity and Access Management': [
        'Describe OCI Identity and Access Management services',
        'Understand compartments',
        'Understand authentication and authorization',
        'Set up a tenancy'
      ],
      'Networking': [
        'Explain OCI Networking services',
        'Understand Virtual Cloud Network (VCN) basics',
        'Understand VCN routing',
        'Understand VCN security',
        'Implement load balancers'
      ],
      'Compute': [
        'Explain OCI Compute services',
        'Understand compute instance basics',
        'Understand scaling strategies',
        'Explore container workloads with OKE',
        'Explore serverless functions using Oracle Functions'
      ],
      'Storage': [
        'Explain OCI Storage services',
        'Understand Object Storage',
        'Understand Block Volume',
        'Understand File Storage'
      ],
      'Security and Observability': [
        'Understand OCI Shared Security model',
        'Explain OCI Security services',
        'Understand Cloud Guard',
        'Understand Security Zones',
        'Understand encryption and Vault services'
      ]
    }
  },
  'redhat-rhcsa-ex200': {
    examPageUrl: 'https://www.redhat.com/en/services/training/ex200-red-hat-certified-system-administrator-rhcsa-exam',
    topics: {
      'Understand and Use Essential Tools': [
        'Access a shell prompt and issue commands with correct syntax',
        'Use input-output redirection, grep and regular expressions to analyze text',
        'Access remote systems using SSH and switch users in multi-user targets',
        'Archive, compress, unpack and uncompress files using tar, gzip and bzip2',
        'Create, edit, copy, move and delete files and directories; create hard and soft links',
        'List, set and change standard ugo/rwx permissions',
        'Locate, read and use system documentation including man, info and /usr/share/doc',
        'Create simple shell scripts using conditionals, loops and script inputs'
      ],
      'Operate Running Systems': [
        'Boot, reboot and shut down a system normally',
        'Boot systems into different targets manually',
        'Interrupt the boot process in order to gain access to a system',
        'Identify CPU/memory intensive processes and kill processes',
        'Adjust process scheduling and manage tuning profiles',
        'Locate and interpret system log files and journals, and preserve journals',
        'Start, stop and check the status of network services',
        'Securely transfer files between systems'
      ],
      'Configure Local Storage': [
        'List, create and delete partitions on GPT disks',
        'Create and remove physical volumes',
        'Assign physical volumes to volume groups',
        'Create and delete logical volumes',
        'Configure systems to mount file systems at boot by UUID or label',
        'Add new partitions, logical volumes and swap to a system non-destructively'
      ],
      'Create and Configure File Systems': [
        'Create, mount, unmount and use VFAT, ext4 and XFS file systems',
        'Mount and unmount network file systems using NFS',
        'Configure autofs',
        'Extend existing logical volumes',
        'Diagnose and correct file permission problems'
      ],
      'Deploy, Configure, and Maintain Systems': [
        'Schedule tasks using at, cron and systemd timer units',
        'Start and stop services and configure services to start automatically at boot',
        'Configure systems to boot into a specific target automatically',
        'Configure time service clients',
        'Install and update software packages from Red Hat CDN, a remote repository or local files',
        'Configure RPM and Flatpak repositories and install or remove packages',
        'Modify the system bootloader',
        'Configure IPv4/IPv6 addresses and hostname resolution'
      ],
      'Manage Users and Groups': [
        'Create, delete and modify local user accounts',
        'Change passwords and adjust password aging for local user accounts',
        'Create, delete and modify local groups and group memberships',
        'Configure privileged access'
      ],
      'Manage Security': [
        'Configure firewall settings using firewall-cmd/firewalld',
        'Manage default file permissions',
        'Configure key-based authentication for SSH',
        'Set enforcing and permissive modes for SELinux',
        'List and identify SELinux file and process context',
        'Restore default file contexts',
        'Manage SELinux port labels',
        'Use Boolean settings to modify system SELinux settings'
      ]
    }
  },
  'scrum-org-pspo-i': {
    examPageUrl: 'https://www.scrum.org/assessments/professional-scrum-product-owner-i-certification',
    topics: {
      'Scrum Framework': [
        'Scrum Team accountabilities, including the Product Owner',
        'Scrum Events and their purpose',
        'Scrum Artifacts and their commitments',
        'Definition of Done',
        'Self-managing teams'
      ],
      'Product Value and Vision': [
        'Product Vision: the value the product delivers and to whom',
        'Product Value: meeting customer needs and value-based decisions',
        'Aligning the Product Vision with the organization\'s Business Strategy',
        'Inspecting and adapting business strategy from Increment feedback'
      ],
      'Product Backlog Management': [
        'Ordering and adjusting Product Backlog items to maximize value',
        'Continuous Product Backlog refinement',
        'The Product Goal as the Product Backlog commitment',
        'Forecasting and release planning',
        'Small, incremental and frequent releases rather than big-bang launches'
      ],
      'Stakeholders and Customers': [
        'Collaborating with stakeholders and customers on the Product Backlog',
        'Understanding the challenges key stakeholders face',
        'Providing transparency suited to stakeholder needs',
        'Inspecting outcomes with stakeholders at the Sprint Review'
      ],
      'Empiricism and Agility': [
        'Empiricism and lean thinking',
        'Transparency, inspection and adaptation',
        'Flexibility to respond to change',
        'Delivering valuable product Increments within 30 days or less'
      ]
    }
  }
};
