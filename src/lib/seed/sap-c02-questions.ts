/**
 * SAP-C02 bundle seed — vendor (AWS), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:sap-c02-seed'` and upserts catalog rows.
 *
 * Exported as `seedSapC02(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/sap-c02.ts`) and the protected
 * admin API (`/api/admin/seed-sap-c02`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public AWS documentation and
 * the AWS Certified Solutions Architect - Professional (SAP-C02) exam
 * guide:
 *
 *   - Design Solutions for Organizational Complexity      26% (17/variant)
 *   - Design for New Solutions                            29% (19/variant)
 *   - Continuous Improvement for Existing Solutions       25% (16/variant)
 *   - Accelerate Workload Migration and Modernization     20% (13/variant)
 *
 * These are original practice scenarios. They are NOT real exam items and
 * make no claim of being official or actual SAP-C02 questions.
 */
import { PrismaClient, QStatus, QType } from '@prisma/client';

type Opt = { id: string; text: string };
type Q = {
  domain: string;
  difficulty: number;
  type: QType;
  stem: string;
  options: Opt[];
  correct: string[];
  explanation: string;
  references: { label: string; url: string }[];
  isTeaser?: boolean;
};

const D1 = 'Design Solutions for Organizational Complexity';
const D2 = 'Design for New Solutions';
const D3 = 'Continuous Improvement for Existing Solutions';
const D4 = 'Accelerate Workload Migration and Modernization';

// ── Networking ──
const REF_TGW = { label: 'AWS Docs — What is a transit gateway?', url: 'https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html' };
const REF_PEERING = { label: 'AWS Docs — What is VPC peering?', url: 'https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html' };
const REF_DX = { label: 'AWS Docs — What is AWS Direct Connect?', url: 'https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html' };
const REF_DX_GATEWAY = { label: 'AWS Docs — AWS Direct Connect gateways', url: 'https://docs.aws.amazon.com/directconnect/latest/UserGuide/direct-connect-gateways-intro.html' };
const REF_VPN = { label: 'AWS Docs — What is AWS Site-to-Site VPN?', url: 'https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html' };
const REF_R53_RESOLVER = { label: 'AWS Docs — What is Route 53 Resolver?', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html' };
const REF_R53_ROUTING = { label: 'AWS Docs — Choosing a routing policy', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html' };
const REF_PRIVATELINK = { label: 'AWS Docs — What is AWS PrivateLink?', url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html' };
const REF_VPC = { label: 'AWS Docs — What is Amazon VPC?', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html' };
const REF_REGIONS_AZ = { label: 'AWS Docs — Regions and Availability Zones', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html' };
const REF_CLOUDFRONT = { label: 'AWS Docs — What is Amazon CloudFront?', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html' };
const REF_GA = { label: 'AWS Docs — What is AWS Global Accelerator?', url: 'https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html' };
const REF_VPC_ENDPOINT = { label: 'AWS Docs — Gateway endpoints for Amazon S3', url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html' };

// ── Identity / multi-account / security ──
const REF_IAM = { label: 'AWS Docs — What is IAM?', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html' };
const REF_IAM_ROLES = { label: 'AWS Docs — IAM roles', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html' };
const REF_IAM_CROSS = { label: 'AWS Docs — IAM tutorial: Delegate access across AWS accounts using IAM roles', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html' };
const REF_IAM_IC = { label: 'AWS Docs — What is IAM Identity Center?', url: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html' };
const REF_IAM_ANALYZER = { label: 'AWS Docs — What is IAM Access Analyzer?', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html' };
const REF_ORG = { label: 'AWS Docs — What is AWS Organizations?', url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html' };
const REF_SCP = { label: 'AWS Docs — Service control policies (SCPs)', url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html' };
const REF_CONTROL_TOWER = { label: 'AWS Docs — What is AWS Control Tower?', url: 'https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html' };
const REF_RAM = { label: 'AWS Docs — What is AWS Resource Access Manager?', url: 'https://docs.aws.amazon.com/ram/latest/userguide/what-is.html' };
const REF_CLOUDTRAIL = { label: 'AWS Docs — What is AWS CloudTrail?', url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html' };
const REF_SECURITYHUB = { label: 'AWS Docs — What is AWS Security Hub?', url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html' };
const REF_GUARDDUTY = { label: 'AWS Docs — What is Amazon GuardDuty?', url: 'https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html' };
const REF_CONFIG = { label: 'AWS Docs — What is AWS Config?', url: 'https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html' };
const REF_KMS = { label: 'AWS Docs — What is AWS KMS?', url: 'https://docs.aws.amazon.com/kms/latest/developerguide/overview.html' };
const REF_ACM = { label: 'AWS Docs — What is AWS Certificate Manager?', url: 'https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html' };
const REF_SECRETS = { label: 'AWS Docs — What is AWS Secrets Manager?', url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html' };
const REF_WAF = { label: 'AWS Docs — What is AWS WAF?', url: 'https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html' };
const REF_SHIELD = { label: 'AWS Docs — AWS Shield Advanced', url: 'https://docs.aws.amazon.com/waf/latest/developerguide/ddos-advanced-summary.html' };

// ── Reliability / DR / compute ──
const REF_DR = { label: 'AWS Docs — Disaster recovery options in the cloud', url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html' };
const REF_DRS = { label: 'AWS Docs — What is AWS Elastic Disaster Recovery?', url: 'https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html' };
const REF_BACKUP = { label: 'AWS Docs — What is AWS Backup?', url: 'https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html' };
const REF_ASG = { label: 'AWS Docs — What is Amazon EC2 Auto Scaling?', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html' };
const REF_ELB = { label: 'AWS Docs — What is Elastic Load Balancing?', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html' };
const REF_EC2 = { label: 'AWS Docs — Amazon EC2 instance types', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html' };
const REF_LAMBDA = { label: 'AWS Docs — What is AWS Lambda?', url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html' };
const REF_ECS = { label: 'AWS Docs — What is Amazon ECS?', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html' };
const REF_EKS = { label: 'AWS Docs — What is Amazon EKS?', url: 'https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html' };
const REF_FARGATE = { label: 'AWS Docs — AWS Fargate for Amazon ECS', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html' };
const REF_BEANSTALK = { label: 'AWS Docs — What is AWS Elastic Beanstalk?', url: 'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html' };

// ── Storage / database ──
const REF_S3 = { label: 'AWS Docs — What is Amazon S3?', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html' };
const REF_S3_LIFECYCLE = { label: 'AWS Docs — Managing the lifecycle of objects', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html' };
const REF_S3_INTELLIGENT = { label: 'AWS Docs — Amazon S3 Intelligent-Tiering storage class', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering.html' };
const REF_EBS = { label: 'AWS Docs — Amazon EBS volume types', url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html' };
const REF_EFS = { label: 'AWS Docs — What is Amazon EFS?', url: 'https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html' };
const REF_FSX = { label: 'AWS Docs — What is Amazon FSx?', url: 'https://docs.aws.amazon.com/fsx/latest/WindowsGuide/what-is.html' };
const REF_STORAGE_GATEWAY = { label: 'AWS Docs — What is AWS Storage Gateway?', url: 'https://docs.aws.amazon.com/storagegateway/latest/userguide/WhatIsStorageGateway.html' };
const REF_RDS = { label: 'AWS Docs — What is Amazon RDS?', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html' };
const REF_RDS_MAZ = { label: 'AWS Docs — Multi-AZ deployments for high availability', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html' };
const REF_RDS_REPLICA = { label: 'AWS Docs — Working with read replicas', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html' };
const REF_AURORA = { label: 'AWS Docs — Amazon Aurora DB clusters', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.html' };
const REF_AURORA_GLOBAL = { label: 'AWS Docs — Amazon Aurora global databases', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html' };
const REF_AURORA_SERVERLESS = { label: 'AWS Docs — Using Aurora Serverless v2', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html' };
const REF_DYNAMODB = { label: 'AWS Docs — What is Amazon DynamoDB?', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html' };
const REF_DDB_GLOBAL = { label: 'AWS Docs — Global tables: multi-Region replication for DynamoDB', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html' };
const REF_ELASTICACHE = { label: 'AWS Docs — What is Amazon ElastiCache?', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html' };

// ── Integration / deployment / ops ──
const REF_SQS = { label: 'AWS Docs — What is Amazon SQS?', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html' };
const REF_SNS = { label: 'AWS Docs — What is Amazon SNS?', url: 'https://docs.aws.amazon.com/sns/latest/dg/welcome.html' };
const REF_EVENTBRIDGE = { label: 'AWS Docs — What is Amazon EventBridge?', url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html' };
const REF_STEPFUNCTIONS = { label: 'AWS Docs — What is AWS Step Functions?', url: 'https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html' };
const REF_CFN = { label: 'AWS Docs — What is AWS CloudFormation?', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html' };
const REF_CFN_STACKSETS = { label: 'AWS Docs — Working with AWS CloudFormation StackSets', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html' };
const REF_CODEDEPLOY = { label: 'AWS Docs — Deployment strategies and configurations in CodeDeploy', url: 'https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html' };
const REF_SSM = { label: 'AWS Docs — What is AWS Systems Manager?', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html' };
const REF_CW = { label: 'AWS Docs — What is Amazon CloudWatch?', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html' };
const REF_XRAY = { label: 'AWS Docs — What is AWS X-Ray?', url: 'https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html' };

// ── Cost ──
const REF_COST_EXPLORER = { label: 'AWS Docs — Analyzing your costs with AWS Cost Explorer', url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html' };
const REF_SAVINGS_PLANS = { label: 'AWS Docs — What are Savings Plans?', url: 'https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html' };
const REF_RI = { label: 'AWS Docs — Reserved Instances', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html' };
const REF_SPOT = { label: 'AWS Docs — Amazon EC2 Spot Instances', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html' };
const REF_BUDGETS = { label: 'AWS Docs — Managing your costs with AWS Budgets', url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html' };
const REF_CUR = { label: 'AWS Docs — AWS Cost and Usage Reports', url: 'https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html' };
const REF_COMPUTE_OPT = { label: 'AWS Docs — What is AWS Compute Optimizer?', url: 'https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html' };
const REF_TRUSTED_ADVISOR = { label: 'AWS Docs — AWS Trusted Advisor', url: 'https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html' };
const REF_COST_ALLOCATION = { label: 'AWS Docs — Using AWS cost allocation tags', url: 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html' };

// ── Migration ──
const REF_MIGRATION_HUB = { label: 'AWS Docs — What is AWS Migration Hub?', url: 'https://docs.aws.amazon.com/migrationhub/latest/ug/whatishub.html' };
const REF_MGN = { label: 'AWS Docs — What is AWS Application Migration Service?', url: 'https://docs.aws.amazon.com/mgn/latest/ug/what-is-application-migration-service.html' };
const REF_DISCOVERY = { label: 'AWS Docs — What is AWS Application Discovery Service?', url: 'https://docs.aws.amazon.com/application-discovery/latest/userguide/what-is-appdiscovery.html' };
const REF_DMS = { label: 'AWS Docs — What is AWS Database Migration Service?', url: 'https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html' };
const REF_SCT = { label: 'AWS Docs — What is the AWS Schema Conversion Tool?', url: 'https://docs.aws.amazon.com/SchemaConversionTool/latest/userguide/CHAP_Welcome.html' };
const REF_DATASYNC = { label: 'AWS Docs — What is AWS DataSync?', url: 'https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html' };
const REF_SNOW = { label: 'AWS Docs — What is the AWS Snow Family?', url: 'https://docs.aws.amazon.com/snowball/latest/developer-guide/whatissnowball.html' };
const REF_TRANSFER = { label: 'AWS Docs — What is AWS Transfer Family?', url: 'https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html' };
const REF_7RS = { label: 'AWS Prescriptive Guidance — The 7 Rs migration strategies', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html' };

// Helpers to build option arrays with ids 'a','b','c',('d','e').
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const opts5 = (a: string, b: string, c: string, d: string, e: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }, { id: 'e', text: e }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Design Solutions for Organizational Complexity (17) ──
  {
    domain: D1, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A company has 60 VPCs across multiple accounts and needs them to communicate with each other and with two on-premises data centers. Managing the growing mesh of VPC peering connections has become unmanageable. Which design should the solutions architect recommend?',
    options: opts4(
      'A transit gateway as a central hub connecting the VPCs and, via VPN or Direct Connect, the on-premises data centers',
      'A full mesh of VPC peering connections plus a VPN per VPC',
      'A NAT gateway in every VPC',
      'A separate internet gateway for each VPC to route traffic between them'
    ),
    correct: ['a'],
    explanation: 'A transit gateway is a central hub that scales to thousands of VPC and on-premises attachments, replacing the unmanageable O(n^2) peering mesh. A full mesh and per-VPC VPNs do not scale, NAT gateways provide internet egress, and internet gateways do not route between VPCs.',
    references: [REF_TGW, REF_PEERING]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A company uses an AWS Direct Connect connection for predictable, low-latency hybrid traffic. The business requires that connectivity survives a Direct Connect failure with automatic failover. Which design meets this most cost-effectively?',
    options: opts4(
      'Configure an AWS Site-to-Site VPN as a backup path and let routing fail over to it if the Direct Connect connection goes down',
      'Rely on a single Direct Connect connection and accept the risk',
      'Provision four Direct Connect connections in the same location',
      'Replace Direct Connect entirely with the public internet'
    ),
    correct: ['a'],
    explanation: 'A Site-to-Site VPN as a backup gives automatic failover at far lower cost than additional dedicated circuits; dynamic routing prefers Direct Connect and falls back to the VPN. A single connection has no resilience, multiple circuits in one location share failure domains and cost more, and the public internet alone loses Direct Connect benefits.',
    references: [REF_DX, REF_VPN]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'On-premises servers must resolve DNS records in a private Route 53 hosted zone, and AWS resources must resolve on-premises domain names. Which solution provides this bidirectional hybrid DNS resolution?',
    options: opts4(
      'Route 53 Resolver inbound and outbound endpoints with forwarding rules',
      'A public Route 53 hosted zone shared with on-premises',
      'A NAT gateway with DNS enabled',
      'CloudFront with a custom origin'
    ),
    correct: ['a'],
    explanation: 'Route 53 Resolver inbound endpoints let on-premises systems resolve AWS private DNS, and outbound endpoints with forwarding rules let AWS resolve on-premises names — providing bidirectional hybrid DNS. Public zones, NAT gateways, and CloudFront do not provide hybrid DNS forwarding.',
    references: [REF_R53_RESOLVER]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A central security team in one AWS account must be able to assume read-only audit access into 200 member accounts in an AWS Organization. Which approach is the most scalable and secure?',
    options: opts4(
      'Deploy a cross-account IAM role with a read-only policy into every member account (for example, via CloudFormation StackSets) and have the security team assume it',
      'Create IAM users with long-lived access keys in each of the 200 accounts',
      'Share the root user credentials of each member account with the security team',
      'Disable IAM in the member accounts so the security account has implicit access'
    ),
    correct: ['a'],
    explanation: 'A standardized cross-account IAM role deployed to every account (StackSets makes this org-wide and repeatable) lets the security team assume temporary, least-privilege credentials. Long-lived keys in 200 accounts and shared root credentials are insecure, and disabling IAM does not grant cross-account access.',
    references: [REF_IAM_CROSS, REF_CFN_STACKSETS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A solutions architect must give a security operations team a single console that aggregates security findings and standards-based checks across all accounts in an AWS Organization. Which approach should they use?',
    options: opts4(
      'Enable AWS Security Hub with a delegated administrator account and organization-wide finding aggregation',
      'Log in to each account separately to review findings',
      'Forward all CloudTrail logs to a spreadsheet',
      'Enable Amazon CloudWatch detailed monitoring in every account'
    ),
    correct: ['a'],
    explanation: 'Security Hub with a delegated administrator aggregates findings and runs security standard checks across all member accounts in one place. Per-account review does not scale, CloudTrail logs alone are not prioritized security findings, and detailed monitoring is a metrics feature.',
    references: [REF_SECURITYHUB, REF_ORG]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A company is setting up a new multi-account environment and wants a prescriptive landing zone with guardrails, a multi-account structure, and centralized identity from day one. Which AWS service should they use?',
    options: opts4(
      'AWS Control Tower',
      'AWS Config alone',
      'A single AWS account with many IAM users',
      'Amazon CloudWatch'
    ),
    correct: ['a'],
    explanation: 'AWS Control Tower sets up and governs a secure, multi-account landing zone with preventive and detective guardrails and integrated IAM Identity Center. AWS Config alone is one detective control, a single account is not multi-account, and CloudWatch is for monitoring.',
    references: [REF_CONTROL_TOWER, REF_ORG]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A company must guarantee that no developer in any member account can disable AWS CloudTrail or launch resources outside two approved Regions, even if they hold administrator IAM permissions in their account. Which control enforces this?',
    options: opts4(
      'Service control policies (SCPs) attached to organizational units in AWS Organizations',
      'An IAM permissions policy attached to each developer',
      'A network ACL on each VPC',
      'An Amazon GuardDuty detector'
    ),
    correct: ['a'],
    explanation: 'SCPs define the maximum permissions for accounts in an OU; even an account administrator cannot exceed them, so they can block disabling CloudTrail and restrict Regions. Per-developer IAM policies can be changed locally, NACLs filter network traffic, and GuardDuty only detects threats.',
    references: [REF_SCP, REF_ORG]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A company needs every member account\'s API activity centralized into one immutable, dedicated logging account, including any accounts added later. Which design achieves this?',
    options: opts4(
      'An organization trail in AWS CloudTrail delivering to an S3 bucket in a dedicated logging account',
      'A separate trail manually created in each account writing to that account\'s own bucket',
      'CloudWatch dashboards shared across accounts',
      'VPC Flow Logs in the management account'
    ),
    correct: ['a'],
    explanation: 'An organization trail automatically logs all current and future member accounts to a central S3 bucket, which can be locked down in a dedicated logging account. Per-account trails are not automatic for new accounts, dashboards do not centralize logs, and Flow Logs cover network traffic, not API calls.',
    references: [REF_CLOUDTRAIL, REF_ORG]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A central networking account owns VPC subnets and Route 53 Resolver rules that many application accounts must use without recreating them. Which service enables this cross-account sharing?',
    options: opts4(
      'AWS Resource Access Manager (AWS RAM)',
      'AWS CloudFormation StackSets',
      'Amazon EventBridge',
      'AWS Config aggregators'
    ),
    correct: ['a'],
    explanation: 'AWS RAM shares supported resources — such as VPC subnets and Route 53 Resolver rules — with other accounts in the organization. StackSets deploy templates, EventBridge routes events, and Config aggregators consolidate compliance data.',
    references: [REF_RAM]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A business-critical application requires a recovery time objective of about 10 minutes and a recovery point objective of seconds in a second AWS Region, and the company will pay for always-on standby capacity. Which disaster recovery strategy fits?',
    options: opts4(
      'Warm standby — a scaled-down but always-running copy in the second Region that scales up on failover',
      'Backup and restore',
      'Pilot light with no running application servers',
      'A single-Region deployment with cross-AZ redundancy only'
    ),
    correct: ['a'],
    explanation: 'Warm standby keeps a smaller always-on copy of the workload running in the second Region with live data replication, achieving an RTO of minutes and a very low RPO. Backup and restore and pilot light have longer RTOs because compute must be provisioned/scaled, and a single-Region design has no Regional DR.',
    references: [REF_DR]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants to replicate on-premises physical and virtual servers into AWS for disaster recovery, with continuous block-level replication and fast failover. Which AWS service is purpose-built for this?',
    options: opts4(
      'AWS Elastic Disaster Recovery (AWS DRS)',
      'Amazon S3 Cross-Region Replication',
      'AWS Backup',
      'AWS DataSync'
    ),
    correct: ['a'],
    explanation: 'AWS Elastic Disaster Recovery continuously replicates on-premises (and cloud) servers into AWS and enables fast, reliable recovery with low RPO/RTO. S3 CRR replicates objects, AWS Backup schedules backups of AWS resources, and DataSync is a data transfer service.',
    references: [REF_DRS, REF_DR]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A company runs a steady, predictable baseline of compute across EC2, Fargate, and Lambda and wants the deepest discount with the flexibility to change instance families and Regions. Which purchasing option should the solutions architect recommend?',
    options: opts4(
      'A Compute Savings Plan covering the steady baseline usage',
      'Standard Reserved Instances locked to one instance family and Region',
      'On-Demand pricing for everything',
      'Spot Instances for the entire baseline'
    ),
    correct: ['a'],
    explanation: 'Compute Savings Plans give a strong discount for a committed hourly spend and apply automatically across EC2 instance families, Regions, Fargate, and Lambda. Standard RIs are less flexible, On-Demand has no discount, and Spot is unsuitable for steady baseline capacity because instances can be reclaimed.',
    references: [REF_SAVINGS_PLANS, REF_RI]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A nightly batch-processing job is fault tolerant, checkpoints its progress, and can be interrupted and resumed. The company wants to minimize its compute cost. Which purchasing option is most appropriate?',
    options: opts4(
      'Amazon EC2 Spot Instances',
      'On-Demand Instances',
      'Standard Reserved Instances for a 3-year term',
      'Dedicated Hosts'
    ),
    correct: ['a'],
    explanation: 'Spot Instances offer the deepest discount and are ideal for fault-tolerant, interruption-tolerant, checkpointed workloads such as nightly batch jobs. On-Demand is more expensive, 3-year RIs over-commit for a nightly job, and Dedicated Hosts are for licensing/compliance needs at premium cost.',
    references: [REF_SPOT]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A finance team must allocate AWS costs to individual business units and see spend broken down by those units. Which combination should the solutions architect recommend?',
    options: opts4(
      'A consistent cost allocation tagging strategy, with the activated tags analyzed in AWS Cost Explorer',
      'A single account with no tags and manual estimates',
      'VPC Flow Logs filtered by business unit',
      'Amazon Inspector findings grouped by team'
    ),
    correct: ['a'],
    explanation: 'Applying consistent cost allocation tags and activating them lets Cost Explorer (and Cost and Usage Reports) group and filter spend by business unit. Untagged accounts cannot be attributed, and Flow Logs and Inspector are not cost tools.',
    references: [REF_COST_ALLOCATION, REF_COST_EXPLORER]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A company must choose an AWS Region for a new workload based on the lowest latency to its European users and a data residency requirement that data stays within the EU. What should drive the decision?',
    options: opts4(
      'Select an EU Region that satisfies the data residency requirement and provides the lowest latency to the users',
      'Always select the us-east-1 Region because it has the most services',
      'Select the cheapest Region regardless of location',
      'Distribute the data across every global Region'
    ),
    correct: ['a'],
    explanation: 'Region selection must satisfy hard constraints first — here, EU data residency — and then optimize latency to the user base. Defaulting to us-east-1 or the cheapest Region can violate residency, and spreading data globally breaks the residency requirement.',
    references: [REF_REGIONS_AZ]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants employees to sign in to all of its AWS accounts using their existing corporate identity provider, with centralized, role-based access. Which approach should the solutions architect recommend?',
    options: opts4(
      'Use AWS IAM Identity Center federated to the external identity provider, with permission sets mapped to accounts',
      'Create duplicate IAM users in every account',
      'Share one IAM user across the whole company',
      'Use the management account root user for daily access'
    ),
    correct: ['a'],
    explanation: 'IAM Identity Center federates with an external IdP and uses permission sets to grant role-based, short-term access across many accounts from one place. Duplicate IAM users, a shared user, and routine root usage are insecure and unmanageable.',
    references: [REF_IAM_IC, REF_IAM]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'An application account must use a KMS key that is owned and managed by a central security account to encrypt its EBS volumes. What must be configured for this to work?',
    options: opts4(
      'A KMS key policy on the central key that grants the application account permission to use the key, plus matching IAM permissions in the application account',
      'A public KMS key with no key policy',
      'A copy of the security account root credentials in the application account',
      'A NAT gateway between the two accounts'
    ),
    correct: ['a'],
    explanation: 'Cross-account KMS use requires the key policy to allow the external account and that account\'s IAM identities to also be granted the KMS actions — both sides must permit it. KMS keys are not public, sharing root credentials is unsafe, and NAT gateways are unrelated.',
    references: [REF_KMS, REF_IAM]
  },

  // ── Design for New Solutions (19) ──
  {
    domain: D2, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A company must provision identical, repeatable infrastructure for multiple environments and track every change as version-controlled code. Which AWS service should the solutions architect use?',
    options: opts4(
      'AWS CloudFormation, defining the infrastructure as templates',
      'Manual creation in the AWS Management Console per environment',
      'Amazon CloudWatch dashboards',
      'AWS Trusted Advisor'
    ),
    correct: ['a'],
    explanation: 'CloudFormation provisions infrastructure declaratively from version-controlled templates, giving repeatable, auditable stacks across environments. Manual console work is not repeatable, and dashboards and Trusted Advisor do not provision infrastructure.',
    references: [REF_CFN]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new application must be released with the ability to shift traffic to the new version and roll back instantly with no downtime if errors rise. Which deployment strategy should the solutions architect choose?',
    options: opts4(
      'A blue/green deployment, shifting traffic to the new environment and rolling back by shifting it back',
      'An all-at-once in-place deployment',
      'A deployment with rollback disabled to ensure it completes',
      'Manual replacement of servers one at a time over several days'
    ),
    correct: ['a'],
    explanation: 'Blue/green runs the new version alongside the old; traffic shifts to green and can roll back instantly to blue if errors rise, with no downtime. All-at-once risks a full outage, disabling rollback removes the safety net, and slow manual replacement is error-prone.',
    references: [REF_CODEDEPLOY]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new global application uses a relational database and needs a secondary AWS Region that can be promoted within minutes during a Regional outage, with cross-Region replication lag typically around one second. Which database design meets this?',
    options: opts4(
      'An Amazon Aurora global database with a secondary Region',
      'A single-Region Amazon RDS instance with nightly snapshots copied cross-Region',
      'An RDS Multi-AZ deployment in one Region',
      'A self-managed database on EC2 with manual log shipping'
    ),
    correct: ['a'],
    explanation: 'An Aurora global database replicates to secondary Regions with typically about one second of lag and supports fast cross-Region failover/promotion. Nightly snapshot copies have a large RPO, Multi-AZ is single-Region, and manual log shipping is operationally fragile.',
    references: [REF_AURORA_GLOBAL, REF_AURORA]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A solutions architect is designing IAM for a new workload. Microservices on EC2 and Lambda each need access only to the specific resources they use. Which principle and mechanism should be applied?',
    options: opts4(
      'Least privilege — assign each component a dedicated IAM role scoped to only the actions and resources it needs',
      'Attach AdministratorAccess to every component for simplicity',
      'Use one shared IAM user with access keys for all components',
      'Make all resources public so no permissions are needed'
    ),
    correct: ['a'],
    explanation: 'Least privilege means each component gets a dedicated IAM role granting only the actions and resources it requires, limiting blast radius. Broad admin access, a shared user with keys, and public resources all violate least privilege and expose the workload.',
    references: [REF_IAM_ROLES, REF_IAM]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new large-scale public web application must be protected against DDoS attacks and common web exploits such as SQL injection, with a global edge presence. Which combination should the solutions architect design?',
    options: opts5(
      'Serve the application through Amazon CloudFront, attach AWS WAF for Layer 7 filtering, and use AWS Shield Advanced for enhanced DDoS protection',
      'Place the application directly on EC2 with a public IP and no edge service',
      'Rely only on a network ACL to block attackers',
      'Use a single large EC2 instance to absorb the traffic',
      'Disable logging so attackers cannot be tracked'
    ),
    correct: ['a'],
    explanation: 'CloudFront provides a global edge that absorbs and disperses traffic, AWS WAF filters Layer 7 exploits such as SQL injection, and Shield Advanced adds enhanced DDoS protection and response support. Direct EC2 exposure, NACL-only filtering, oversized instances, and disabling logging do not provide scalable protection.',
    references: [REF_WAF, REF_SHIELD, REF_CLOUDFRONT]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new solution must encrypt sensitive data both at rest in Amazon S3 and Amazon RDS and in transit between clients and the application. Which combination should the solutions architect specify?',
    options: opts4(
      'Server-side encryption with AWS KMS keys for data at rest, and TLS certificates from AWS Certificate Manager for data in transit',
      'No encryption at rest, and TLS only for some endpoints',
      'Client-managed keys stored in a public S3 bucket',
      'Encryption at rest only, with plaintext HTTP for client traffic'
    ),
    correct: ['a'],
    explanation: 'KMS-backed server-side encryption protects data at rest in S3 and RDS, and ACM-provided TLS certificates protect data in transit. Skipping encryption at rest, storing keys publicly, or using plaintext HTTP all fail the requirement.',
    references: [REF_KMS, REF_ACM]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new order-processing system must absorb unpredictable traffic spikes and let the web tier accept orders even when the processing tier is busy or briefly unavailable. Which design pattern should the solutions architect apply?',
    options: opts4(
      'Place an Amazon SQS queue between the web tier and the processing tier to decouple them and buffer requests',
      'Have the web tier call the processing tier synchronously for every order',
      'Run both tiers on a single EC2 instance',
      'Store orders in a CloudWatch log group for the processing tier to read'
    ),
    correct: ['a'],
    explanation: 'An SQS queue decouples the tiers and buffers requests, so the web tier keeps accepting orders during spikes while the processing tier consumes at its own rate. Synchronous calls couple the tiers, a single instance is a single point of failure, and log groups are not a work queue.',
    references: [REF_SQS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'When a new image is uploaded, the system must notify several independent subscribers — a thumbnail service, an indexing service, and an audit service — each processing the event at its own pace. Which design provides reliable fan-out?',
    options: opts4(
      'Publish the event to an Amazon SNS topic with an Amazon SQS queue subscribed for each consuming service',
      'Have the uploader call each service synchronously in sequence',
      'Write the event to a single shared SQS queue read by all three services',
      'Store the event in DynamoDB and have services poll the table continuously'
    ),
    correct: ['a'],
    explanation: 'The SNS fan-out pattern publishes one message to a topic, and each subscribed SQS queue gets its own copy, so each service processes independently and durably. Synchronous sequential calls couple the services, one shared queue means consumers compete for messages, and table polling is inefficient.',
    references: [REF_SNS, REF_SQS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new workflow has multiple sequential and parallel steps with error handling, retries, and human-approval stages. The solutions architect wants to orchestrate it without managing orchestration servers. Which service is the best fit?',
    options: opts4(
      'AWS Step Functions',
      'A single large AWS Lambda function containing all logic',
      'Amazon SQS alone',
      'An EC2 instance running a cron job'
    ),
    correct: ['a'],
    explanation: 'Step Functions is a serverless orchestrator that coordinates multi-step workflows with built-in branching, parallelism, retries, error handling, and wait/approval states. One giant Lambda function is hard to maintain and limited by timeout, SQS only queues messages, and a cron job lacks workflow orchestration.',
    references: [REF_STEPFUNCTIONS]
  },
  {
    domain: D2, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A new application must remain available if a single Availability Zone fails. Which design should the solutions architect choose for the EC2 web tier?',
    options: opts4(
      'An Auto Scaling group with an Application Load Balancer, both spanning multiple Availability Zones',
      'A single large EC2 instance in one Availability Zone',
      'Two EC2 instances in the same Availability Zone',
      'An EC2 instance with a static Elastic IP and no load balancer'
    ),
    correct: ['a'],
    explanation: 'An Auto Scaling group and load balancer spanning multiple AZs keep healthy capacity available if one AZ fails, and Auto Scaling replaces lost capacity. A single instance, two instances in one AZ, and a static EIP design all leave a single point of failure.',
    references: [REF_ASG, REF_ELB]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new web tier has highly variable traffic. The solutions architect wants it to add capacity automatically as load rises and remove it as load falls, keeping CPU utilization near a target. Which configuration achieves this?',
    options: opts4(
      'An Auto Scaling group with a target tracking scaling policy on average CPU utilization',
      'A fixed fleet sized for the all-time peak',
      'A single instance that is manually resized each day',
      'A scheduled scaling action that runs once a week'
    ),
    correct: ['a'],
    explanation: 'Target tracking scaling automatically adjusts Auto Scaling group capacity to keep a metric such as average CPU at a target value, matching capacity to variable demand. A peak-sized fleet wastes money, manual resizing does not react to load, and weekly scheduled scaling cannot follow variable traffic.',
    references: [REF_ASG]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new application is expected to launch thousands of EC2 instances quickly during a product event. The solutions architect must ensure the account does not hit capacity limits. What should they do during design?',
    options: opts4(
      'Review the relevant service quotas in advance and request increases before the event',
      'Assume AWS has unlimited capacity and no quotas apply',
      'Disable Auto Scaling so no new instances launch',
      'Launch all instances manually the morning of the event'
    ),
    correct: ['a'],
    explanation: 'Service quotas (limits) apply per account and Region; a professional design reviews them and requests increases ahead of a known spike. Quotas do exist, disabling Auto Scaling removes elasticity, and manual launches do not address quota limits.',
    references: [REF_EC2, REF_ASG]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A read-heavy application repeatedly issues the same expensive database queries. The solutions architect wants to cut latency and database load by caching results in memory. Which service should they add?',
    options: opts4(
      'Amazon ElastiCache',
      'Amazon S3 Glacier Deep Archive',
      'AWS Storage Gateway',
      'Amazon Athena'
    ),
    correct: ['a'],
    explanation: 'ElastiCache (Redis or Memcached) provides an in-memory cache that serves repeated reads with sub-millisecond latency and offloads the database. Glacier Deep Archive is cold storage, Storage Gateway is hybrid storage, and Athena queries data in S3.',
    references: [REF_ELASTICACHE]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new application stores user session and profile data with simple key-based access patterns and needs single-digit-millisecond latency at virtually unlimited scale. Which purpose-built database should the solutions architect select?',
    options: opts4(
      'Amazon DynamoDB',
      'A single large Amazon RDS for MySQL instance',
      'Amazon Redshift',
      'Amazon OpenSearch Service'
    ),
    correct: ['a'],
    explanation: 'DynamoDB is a serverless key-value database delivering single-digit-millisecond latency at massive scale — ideal for session and profile lookups by key. A single RDS instance does not scale horizontally as easily, Redshift is for analytics, and OpenSearch is for search/log analytics.',
    references: [REF_DYNAMODB]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new analytics workload runs in-memory data processing and needs instances optimized for high memory-to-vCPU ratios. Which EC2 instance family characteristic should the solutions architect select?',
    options: opts4(
      'A memory-optimized instance family',
      'A compute-optimized instance family',
      'A storage-optimized instance family for sequential disk I/O',
      'A burstable (T-family) instance for steady heavy load'
    ),
    correct: ['a'],
    explanation: 'Memory-optimized instances provide a high memory-to-vCPU ratio for in-memory and memory-intensive workloads. Compute-optimized targets CPU-bound work, storage-optimized targets disk I/O, and burstable instances are designed for variable, generally low baseline CPU, not steady heavy load.',
    references: [REF_EC2]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new application needs a shared file system that multiple Linux EC2 instances across Availability Zones can mount concurrently with POSIX semantics, scaling automatically. Which storage service should the solutions architect select?',
    options: opts4(
      'Amazon EFS',
      'An Amazon EBS volume attached to one instance',
      'An EC2 instance store volume',
      'Amazon S3 Glacier'
    ),
    correct: ['a'],
    explanation: 'Amazon EFS is an elastic, POSIX-compliant shared file system that many Linux instances across AZs can mount concurrently. A standard EBS volume attaches to one instance, instance store is ephemeral, and Glacier is archival object storage.',
    references: [REF_EFS, REF_EBS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new data lake in Amazon S3 will hold objects with unknown and changing access patterns, and the company wants storage cost optimized automatically without performance impact or retrieval fees for frequent access. Which approach should the solutions architect choose?',
    options: opts4(
      'Store the objects in the S3 Intelligent-Tiering storage class',
      'Keep everything in S3 Standard permanently',
      'Move all objects immediately to S3 Glacier Deep Archive',
      'Use an S3 Lifecycle rule to delete objects after 30 days'
    ),
    correct: ['a'],
    explanation: 'S3 Intelligent-Tiering automatically moves objects between access tiers based on changing access patterns, optimizing cost without performance impact or retrieval fees for the frequent/infrequent tiers — ideal for unknown patterns. S3 Standard never optimizes, Deep Archive blocks frequent access, and deletion loses data.',
    references: [REF_S3_INTELLIGENT, REF_S3_LIFECYCLE]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new workload transfers large volumes of data out from EC2 instances to users worldwide, and data transfer costs are projected to be high. Which design most directly reduces those costs?',
    options: opts4(
      'Serve the content through Amazon CloudFront so cached responses reduce data transfer out from the origin',
      'Move the EC2 instances to a larger instance type',
      'Enable S3 Versioning on all buckets',
      'Disable Availability Zone redundancy'
    ),
    correct: ['a'],
    explanation: 'CloudFront caches content at edge locations; data transfer out from CloudFront is priced lower than direct EC2 transfer and cache hits avoid repeated origin transfer, reducing cost and latency. Larger instances, versioning, and removing AZ redundancy do not reduce data transfer cost.',
    references: [REF_CLOUDFRONT]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A solutions architect is choosing a pricing model for a new production workload with a stable 24x7 baseline plus occasional unpredictable bursts. What is the most cost-effective design?',
    options: opts4(
      'Cover the stable baseline with a Savings Plan or Reserved Instances and handle bursts with On-Demand capacity',
      'Run everything On-Demand permanently',
      'Run the entire workload, baseline included, on Spot Instances',
      'Buy Reserved Instances for the unpredictable burst capacity'
    ),
    correct: ['a'],
    explanation: 'A cost-optimized design commits a Savings Plan or RIs for the predictable baseline and uses On-Demand for unpredictable bursts. All On-Demand misses the baseline discount, Spot is unsuitable for a stable production baseline, and RIs for unpredictable bursts waste the commitment.',
    references: [REF_SAVINGS_PLANS, REF_RI]
  },

  // ── Continuous Improvement for Existing Solutions (16) ──
  {
    domain: D3, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'An existing workload requires engineers to manually fix a recurring misconfiguration. The solutions architect wants the issue detected and remediated automatically. Which approach should they recommend?',
    options: opts4(
      'Detect the condition with an Amazon EventBridge rule (or AWS Config rule) and trigger automatic remediation with AWS Lambda or AWS Systems Manager Automation',
      'Add the manual steps to a wiki page',
      'Email engineers whenever the issue recurs',
      'Ignore the issue because it is only a misconfiguration'
    ),
    correct: ['a'],
    explanation: 'Operational excellence favors automated detection (EventBridge or Config rules) plus automated remediation (Lambda or SSM Automation), removing repetitive manual toil. A wiki page and emails still rely on manual action, and ignoring the issue is not improvement.',
    references: [REF_EVENTBRIDGE, REF_SSM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing microservices application is hard to troubleshoot because requests span many services and latency problems are difficult to localize. Which improvement should the solutions architect recommend?',
    options: opts4(
      'Instrument the services with AWS X-Ray to trace requests end to end and identify bottlenecks',
      'Remove all logging to reduce noise',
      'Combine all microservices into a single process',
      'Increase every instance size and hope latency improves'
    ),
    correct: ['a'],
    explanation: 'AWS X-Ray provides distributed tracing across services, showing the path and latency of each request so bottlenecks can be pinpointed. Removing logging reduces visibility, collapsing the architecture is a major regression, and blindly upsizing instances does not localize the problem.',
    references: [REF_XRAY, REF_CW]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing application is deployed all-at-once, causing brief outages and risky rollbacks. The solutions architect wants to improve the deployment process. Which change should they recommend?',
    options: opts4(
      'Adopt a blue/green or canary deployment strategy so new versions are validated before full traffic shift, with fast rollback',
      'Deploy less frequently to reduce the number of outages',
      'Disable health checks so deployments finish faster',
      'Deploy directly to production during peak hours'
    ),
    correct: ['a'],
    explanation: 'Blue/green or canary deployments validate the new version before shifting all traffic and allow fast rollback, eliminating the all-at-once outage risk. Deploying less often does not fix the process, disabling health checks hides failures, and peak-hour deploys increase risk.',
    references: [REF_CODEDEPLOY]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A security review of an existing environment must continuously verify that resources stay compliant — for example, that no S3 bucket is public — and automatically remediate violations. Which service should the solutions architect use?',
    options: opts4(
      'AWS Config with managed rules and automatic remediation actions',
      'Amazon CloudWatch basic monitoring',
      'AWS Trusted Advisor cost checks',
      'AWS CloudFormation drift detection only'
    ),
    correct: ['a'],
    explanation: 'AWS Config continuously evaluates resources against rules (such as detecting public S3 buckets) and can run automatic remediation via SSM Automation. CloudWatch basic monitoring covers metrics, Trusted Advisor cost checks are about spend, and drift detection only compares stacks to templates.',
    references: [REF_CONFIG]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing application stores database credentials in plaintext configuration files. The solutions architect wants to improve secrets handling and rotate credentials automatically. Which service should they recommend?',
    options: opts4(
      'AWS Secrets Manager, retrieving secrets at runtime with automatic rotation enabled',
      'A public S3 bucket holding the credentials file',
      'An environment variable baked into the AMI',
      'A CloudWatch Logs log group containing the credentials'
    ),
    correct: ['a'],
    explanation: 'Secrets Manager stores credentials encrypted, controls access with IAM, and rotates database secrets automatically, eliminating plaintext config files. A public bucket exposes secrets, an AMI-baked variable is hard to rotate and visible, and log groups are not a secret store.',
    references: [REF_SECRETS]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A solutions architect must audit an existing environment for IAM identities that have far more permissions than they actually use, to enforce least privilege. Which tool helps identify this?',
    options: opts4(
      'IAM Access Analyzer (including unused access findings) and IAM last-accessed information',
      'Amazon CloudFront access logs',
      'AWS Budgets reports',
      'VPC Flow Logs'
    ),
    correct: ['a'],
    explanation: 'IAM Access Analyzer surfaces external access and unused access findings, and IAM last-accessed data shows which permissions are actually used, guiding least-privilege right-sizing. CloudFront logs, Budgets, and Flow Logs do not analyze IAM permission usage.',
    references: [REF_IAM_ANALYZER, REF_IAM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing TCP-based application has users worldwide and suffers inconsistent performance over the public internet. It cannot use a content cache. Which service should the solutions architect add to improve performance?',
    options: opts4(
      'AWS Global Accelerator, routing user traffic over the AWS global network to the optimal endpoint',
      'Amazon CloudFront with long cache TTLs',
      'A larger EC2 instance type at the origin',
      'An additional NAT gateway'
    ),
    correct: ['a'],
    explanation: 'Global Accelerator routes traffic over the AWS global network with static anycast IPs, improving performance and availability for non-cacheable TCP/UDP applications. CloudFront is for cacheable content, a bigger instance does not fix internet path performance, and a NAT gateway is unrelated.',
    references: [REF_GA, REF_CLOUDFRONT]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'An existing application\'s relational database is the performance bottleneck because of heavy reporting reads competing with transactional traffic. Which improvement should the solutions architect recommend first?',
    options: opts4(
      'Add read replicas and direct reporting/read traffic to them',
      'Delete the reporting queries permanently',
      'Move the database to a smaller instance to save money',
      'Disable backups to reduce database load'
    ),
    correct: ['a'],
    explanation: 'Read replicas offload read-heavy reporting traffic from the primary, relieving the bottleneck while transactional writes continue on the primary. Deleting reporting loses business function, downsizing worsens performance, and disabling backups creates risk without solving the bottleneck.',
    references: [REF_RDS_REPLICA, REF_RDS]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A reliability review of an existing application finds the database is a single instance in one Availability Zone — a single point of failure. Which change should the solutions architect recommend?',
    options: opts4(
      'Convert the database to a Multi-AZ deployment for automatic failover to a standby in another AZ',
      'Take more frequent manual snapshots and leave the database single-AZ',
      'Move the database to a larger instance in the same AZ',
      'Add a NAT gateway in front of the database'
    ),
    correct: ['a'],
    explanation: 'A Multi-AZ deployment maintains a synchronous standby in another AZ and fails over automatically, removing the single-AZ single point of failure. Snapshots are backups not failover, a larger same-AZ instance is still a single point of failure, and NAT gateways are unrelated.',
    references: [REF_RDS_MAZ]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing application runs on a fixed set of EC2 instances; when one fails, it stays down until an engineer notices. The solutions architect wants the system to self-heal. Which change should they recommend?',
    options: opts4(
      'Place the instances in an Auto Scaling group with health checks so unhealthy instances are replaced automatically',
      'Add more CloudWatch dashboards for the operations team',
      'Increase the instance size so failures are less likely',
      'Document a manual recovery runbook and rely on it'
    ),
    correct: ['a'],
    explanation: 'An Auto Scaling group with health checks detects unhealthy instances and replaces them automatically, providing self-healing. Dashboards only improve visibility, larger instances still fail, and a manual runbook still depends on a human noticing.',
    references: [REF_ASG]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A cost review must identify idle and underutilized resources — such as idle load balancers and low-utilization EC2 instances — in an existing account. Which tools should the solutions architect use?',
    options: opts4(
      'AWS Trusted Advisor and AWS Compute Optimizer',
      'Amazon Route 53 health checks',
      'AWS WAF web ACL logs',
      'Amazon SNS topic metrics'
    ),
    correct: ['a'],
    explanation: 'Trusted Advisor flags idle/underutilized resources, and Compute Optimizer analyzes utilization to recommend rightsizing — together they identify cost-saving opportunities. Route 53 health checks, WAF logs, and SNS metrics are not cost-optimization tools.',
    references: [REF_TRUSTED_ADVISOR, REF_COMPUTE_OPT]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A finance team wants to be alerted before monthly AWS spend exceeds a defined threshold for an existing workload. Which service should the solutions architect configure?',
    options: opts4(
      'AWS Budgets, with a cost budget and alert thresholds',
      'Amazon CloudWatch Synthetics',
      'AWS Config conformance packs',
      'Amazon Inspector'
    ),
    correct: ['a'],
    explanation: 'AWS Budgets lets you set cost or usage budgets and sends alerts as actual or forecasted spend approaches the threshold. Synthetics monitors endpoints, Config conformance packs evaluate compliance, and Inspector scans for vulnerabilities.',
    references: [REF_BUDGETS, REF_COST_EXPLORER]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'A solutions architect must perform a detailed, line-item analysis of an existing environment\'s costs, including per-resource and per-tag breakdowns, for chargeback. Which data source provides this granularity?',
    options: opts4(
      'The AWS Cost and Usage Report (CUR), queried for granular line items',
      'A single number from the AWS Billing console home page',
      'VPC Flow Logs',
      'CloudWatch CPU metrics'
    ),
    correct: ['a'],
    explanation: 'The AWS Cost and Usage Report contains the most granular cost and usage line items, including resource IDs and cost allocation tags, suitable for detailed chargeback analysis. The billing home page total lacks detail, and Flow Logs and CPU metrics are not cost data.',
    references: [REF_CUR, REF_COST_EXPLORER]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing stateless, fault-tolerant batch-processing fleet runs entirely On-Demand. The solutions architect wants to cut its cost significantly. Which change should they recommend?',
    options: opts4(
      'Run the fault-tolerant batch fleet on Spot Instances (for example, in a Spot-based Auto Scaling group)',
      'Move the fleet to Dedicated Hosts',
      'Buy 3-year Reserved Instances for the entire fleet',
      'Leave the fleet On-Demand but in a different Region'
    ),
    correct: ['a'],
    explanation: 'A stateless, fault-tolerant workload is an ideal Spot candidate, capturing large discounts while tolerating interruptions. Dedicated Hosts cost more, 3-year RIs over-commit for batch capacity that varies, and changing Region does not reduce the On-Demand rate materially.',
    references: [REF_SPOT]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing fleet is configured and patched manually, leading to inconsistency and drift. The solutions architect wants centralized, automated configuration and patch management. Which service should they recommend?',
    options: opts4(
      'AWS Systems Manager (using State Manager and Patch Manager)',
      'Amazon CloudWatch dashboards',
      'AWS Cost Explorer',
      'Amazon Route 53'
    ),
    correct: ['a'],
    explanation: 'AWS Systems Manager provides centralized configuration management (State Manager) and patching (Patch Manager), eliminating manual drift. Dashboards visualize metrics, Cost Explorer analyzes spend, and Route 53 is DNS — none manage configuration.',
    references: [REF_SSM]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'An existing single-Region application has grown and occasionally hits an AWS service quota, causing failed launches. The solutions architect wants to improve reliability against this. What should they do?',
    options: opts5(
      'Monitor quota usage with AWS Service Quotas and CloudWatch alarms, and request quota increases proactively before limits are reached',
      'Spread the workload across more Availability Zones, since service quotas are tracked per Availability Zone',
      'Ignore the quota errors because they are transient',
      'Reduce the application capacity so it never approaches a quota',
      'Assume quotas do not apply to production accounts'
    ),
    correct: ['a'],
    explanation: 'AWS Service Quotas integrates with CloudWatch alarms to warn as usage approaches a limit, so the team can request increases proactively before launches fail. Service quotas are tracked per account and Region — not per Availability Zone — so adding AZs does not raise them. Ignoring errors, artificially capping capacity, and assuming quotas do not apply all fail to address the limit.',
    references: [REF_EC2, REF_ASG]
  },

  // ── Accelerate Workload Migration and Modernization (13) ──
  {
    domain: D4, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A company is migrating dozens of applications to AWS and must classify each one by migration strategy — for example, rehost, replatform, or refactor. Which framework describes these strategies?',
    options: opts4(
      'The 7 Rs migration strategies (retire, retain, rehost, relocate, repurchase, replatform, refactor)',
      'The AWS Well-Architected pillars',
      'The shared responsibility model',
      'The CAP theorem'
    ),
    correct: ['a'],
    explanation: 'The 7 Rs (retire, retain, rehost, relocate, repurchase, replatform, refactor) are the common strategies used to classify each application for migration. The Well-Architected pillars, the shared responsibility model, and the CAP theorem are different frameworks unrelated to migration classification.',
    references: [REF_7RS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'Before a large migration, a company must discover its on-premises servers, capture utilization and dependencies, and track migration progress. Which AWS services support this assessment?',
    options: opts4(
      'AWS Application Discovery Service to collect server data, with AWS Migration Hub to track the portfolio and migration progress',
      'Amazon CloudFront and AWS WAF',
      'Amazon SQS and Amazon SNS',
      'AWS Budgets and AWS Cost Explorer'
    ),
    correct: ['a'],
    explanation: 'Application Discovery Service collects on-premises configuration, utilization, and dependency data, and Migration Hub provides a single place to assess the portfolio and track migration progress. CloudFront/WAF, SQS/SNS, and Budgets/Cost Explorer are not migration assessment tools.',
    references: [REF_DISCOVERY, REF_MIGRATION_HUB]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company will rehost (lift and shift) hundreds of on-premises virtual machines to Amazon EC2 with minimal application changes and minimal cutover downtime. Which service is purpose-built for this?',
    options: opts4(
      'AWS Application Migration Service (AWS MGN)',
      'AWS Database Migration Service (AWS DMS)',
      'AWS DataSync',
      'Amazon S3 Transfer Acceleration'
    ),
    correct: ['a'],
    explanation: 'AWS Application Migration Service (MGN) is the primary lift-and-shift service: it continuously replicates source servers and cuts them over to EC2 with minimal downtime. DMS migrates databases, DataSync moves files/objects, and S3 Transfer Acceleration speeds S3 uploads.',
    references: [REF_MGN]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'A company is migrating an on-premises Oracle database to Amazon Aurora PostgreSQL. The schema and stored procedures must be converted, and data must be migrated with minimal downtime. Which combination should the solutions architect use?',
    options: opts4(
      'The AWS Schema Conversion Tool (AWS SCT) to convert the schema, and AWS Database Migration Service (AWS DMS) to migrate the data with ongoing replication',
      'AWS DataSync for both schema conversion and data migration',
      'A manual export and import with no tooling',
      'AWS Snowball Edge to convert the Oracle schema'
    ),
    correct: ['a'],
    explanation: 'For a heterogeneous migration (Oracle to Aurora PostgreSQL), AWS SCT converts the schema and code objects, and AWS DMS migrates the data with change data capture for minimal-downtime cutover. DataSync and Snowball do not convert schemas, and a manual export/import is error-prone with significant downtime.',
    references: [REF_SCT, REF_DMS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company must move 400 TB of data to AWS from a site with limited, slow internet bandwidth, where an online transfer would take many months. Which service should the solutions architect recommend?',
    options: opts4(
      'AWS Snowball (AWS Snow Family) for offline bulk data transfer',
      'AWS DataSync over the existing internet connection',
      'Amazon S3 Transfer Acceleration over the existing internet connection',
      'A single AWS Site-to-Site VPN tunnel'
    ),
    correct: ['a'],
    explanation: 'When bandwidth makes online transfer of hundreds of terabytes impractical, the Snow Family physically ships the data to AWS. DataSync and S3 Transfer Acceleration still depend on the slow link, and a VPN tunnel does not increase available bandwidth.',
    references: [REF_SNOW, REF_DATASYNC]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company has adequate network bandwidth and must perform an ongoing, scheduled, incremental sync of data from an on-premises NFS file server to Amazon S3 and Amazon EFS, with integrity validation. Which service should the solutions architect choose?',
    options: opts4(
      'AWS DataSync',
      'AWS Snowball Edge',
      'A manual rsync script on a single EC2 instance',
      'Amazon CloudFront'
    ),
    correct: ['a'],
    explanation: 'AWS DataSync automates and accelerates online transfers between on-premises storage and AWS (S3, EFS, FSx), with scheduling, incremental sync, and integrity verification. Snowball is for offline bulk transfer, a manual script lacks automation/validation, and CloudFront is a CDN.',
    references: [REF_DATASYNC]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'After migration, partners must continue uploading files to the company using SFTP, but the company no longer wants to run SFTP servers. The data must land directly in Amazon S3. Which service should the solutions architect use?',
    options: opts4(
      'AWS Transfer Family, providing a fully managed SFTP endpoint that stores files in Amazon S3',
      'An EC2 instance running an SFTP daemon',
      'Amazon CloudFront with SFTP origins',
      'AWS DataSync exposed to partners as an SFTP server'
    ),
    correct: ['a'],
    explanation: 'AWS Transfer Family provides fully managed SFTP (and FTPS/FTP) endpoints that store transferred files directly in Amazon S3 or EFS, removing the need to operate SFTP servers. A self-managed EC2 SFTP daemon is operational overhead, and CloudFront and DataSync do not provide managed SFTP endpoints for partners.',
    references: [REF_TRANSFER]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A migrated web application runs on a small fleet of always-on EC2 instances at low, steady utilization, and the company wants to reduce operational overhead and cost by moving to a managed platform without rearchitecting much. Which option should the solutions architect evaluate first?',
    options: opts4(
      'Containerize the application and run it on AWS Fargate so there are no servers to manage',
      'Move it to a much larger EC2 instance',
      'Keep it on EC2 but disable all monitoring',
      'Rewrite the entire application from scratch immediately'
    ),
    correct: ['a'],
    explanation: 'Containerizing and running on AWS Fargate removes server management while keeping the application largely intact, reducing operational overhead and matching cost to usage. A bigger instance adds cost, disabling monitoring harms operations, and a full rewrite is unnecessary for a replatform.',
    references: [REF_FARGATE, REF_ECS]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'A company is modernizing a containerized application and wants to standardize on the Kubernetes API and ecosystem while letting AWS manage the Kubernetes control plane. Which service should the solutions architect choose?',
    options: opts4(
      'Amazon Elastic Kubernetes Service (Amazon EKS)',
      'Amazon Elastic Container Service (Amazon ECS) with the EC2 launch type',
      'AWS Lambda',
      'AWS Elastic Beanstalk with a single instance'
    ),
    correct: ['a'],
    explanation: 'Amazon EKS runs the Kubernetes API with an AWS-managed control plane, suiting teams that want the Kubernetes ecosystem and portability. ECS is AWS\'s own orchestrator (not the Kubernetes API), Lambda is for event-driven functions, and Beanstalk is a PaaS, not a Kubernetes platform.',
    references: [REF_EKS, REF_ECS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company is modernizing an image-processing job that runs sporadically a few times a day, each run lasting under a minute. They want to eliminate idle server cost and management. Which target should the solutions architect recommend?',
    options: opts4(
      'AWS Lambda, invoked on demand for each job',
      'A dedicated always-on EC2 instance',
      'An EC2 Auto Scaling group with a minimum size of two',
      'A large Amazon EMR cluster running continuously'
    ),
    correct: ['a'],
    explanation: 'AWS Lambda is ideal for short, sporadic, event-driven jobs: it runs only when invoked, with no idle cost or server management. An always-on instance, a minimum-size Auto Scaling group, and a continuous EMR cluster all incur idle cost for a job that runs briefly a few times a day.',
    references: [REF_LAMBDA]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'A migrated relational database has highly variable, intermittent traffic with long idle periods, and the company wants the database capacity — and cost — to scale automatically, including down to very low usage. Which option should the solutions architect choose?',
    options: opts4(
      'Amazon Aurora Serverless v2, which automatically scales database capacity with demand',
      'A large provisioned Amazon RDS instance sized for peak load',
      'A fleet of EC2 instances running a self-managed database',
      'Amazon Redshift provisioned for continuous use'
    ),
    correct: ['a'],
    explanation: 'Aurora Serverless v2 automatically scales database capacity up and down with demand, fitting variable, intermittent workloads and avoiding paying for peak capacity during idle periods. A peak-sized provisioned instance wastes money, self-managed databases add overhead, and Redshift is a data warehouse.',
    references: [REF_AURORA_SERVERLESS, REF_AURORA]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A monolithic application is being modernized. The team wants to decouple components so that a slow downstream component does not block the rest of the application. Which approach should the solutions architect recommend?',
    options: opts4(
      'Introduce asynchronous messaging with Amazon SQS (and Amazon EventBridge for event routing) between components',
      'Merge all components into one larger process',
      'Have every component call the others synchronously',
      'Run the monolith on a bigger instance and make no other change'
    ),
    correct: ['a'],
    explanation: 'Decoupling with SQS queues (and EventBridge for event routing) lets components work asynchronously, so a slow consumer does not block producers. Merging components and synchronous calls increase coupling, and a bigger instance does not decouple anything.',
    references: [REF_SQS, REF_EVENTBRIDGE]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'During a phased migration, on-premises applications must keep low-latency access to frequently used files while the data is gradually moved to Amazon S3, with a local cache. Which service should the solutions architect use?',
    options: opts4(
      'AWS Storage Gateway (File Gateway), providing local cached access backed by Amazon S3',
      'Amazon S3 Glacier Deep Archive mounted locally',
      'An Amazon EBS volume shared over the internet',
      'Amazon CloudFront in front of the on-premises file server'
    ),
    correct: ['a'],
    explanation: 'AWS Storage Gateway (File Gateway) presents an on-premises file interface with a local cache for low-latency access while durably storing data in Amazon S3 — well suited to a phased migration. Glacier is archival, EBS is not a shared internet file service, and CloudFront caches web content, not on-premises file shares.',
    references: [REF_STORAGE_GATEWAY, REF_S3]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Design Solutions for Organizational Complexity (17) ──
  {
    domain: D1, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'VPC A is peered with VPC B, and VPC B is peered with VPC C. Resources in VPC A cannot reach VPC C. What is the cause, and what is the scalable fix for many VPCs?',
    options: opts4(
      'VPC peering is not transitive; for many VPCs, connect them through a transit gateway instead of a peering mesh',
      'Peering is transitive, so the route tables must be wrong',
      'VPC C must be in a different AWS account',
      'CloudFront must be enabled for peering to be transitive'
    ),
    correct: ['a'],
    explanation: 'VPC peering is non-transitive — traffic does not flow through an intermediate peered VPC — so A cannot reach C without a direct connection. A transit gateway is the scalable hub that provides transitive routing among many VPCs.',
    references: [REF_PEERING, REF_TGW]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A company has VPCs in four AWS Regions and one AWS Direct Connect connection. All VPCs must reach on-premises over Direct Connect. Which design connects them efficiently?',
    options: opts4(
      'Associate the VPCs (directly or via transit gateways) with a Direct Connect gateway',
      'Order a separate Direct Connect connection for every VPC',
      'Use a NAT gateway in each VPC to reach on-premises',
      'Peer every VPC directly with the on-premises network'
    ),
    correct: ['a'],
    explanation: 'A Direct Connect gateway is a global resource that lets VPCs across Regions (directly or through transit gateways) share one Direct Connect connection to on-premises. A circuit per VPC is costly, NAT gateways provide internet egress, and you cannot peer a VPC with on-premises.',
    references: [REF_DX_GATEWAY, REF_DX]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A company with many VPCs attached to a transit gateway wants all internet-bound traffic to leave through a single, centrally managed inspection point. Which design achieves centralized egress?',
    options: opts4(
      'Route spoke VPC internet traffic through the transit gateway to a central egress/inspection VPC that holds the NAT gateways and firewall',
      'Put a NAT gateway and internet gateway in every spoke VPC',
      'Disable the transit gateway and use VPC peering',
      'Send all traffic through Amazon CloudFront'
    ),
    correct: ['a'],
    explanation: 'A central egress (inspection) VPC attached to the transit gateway concentrates NAT and firewall inspection in one place, with spoke VPCs routing 0.0.0.0/0 to the transit gateway. Per-VPC NAT/internet gateways decentralize and complicate inspection, peering does not centralize egress, and CloudFront is for inbound content delivery.',
    references: [REF_TGW, REF_VPC]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A provider account runs an internal application behind a Network Load Balancer and must expose it privately to many consumer accounts without VPC peering or internet exposure. Which service should the solutions architect use?',
    options: opts4(
      'AWS PrivateLink — publish a VPC endpoint service that consumers reach through interface VPC endpoints',
      'A public Application Load Balancer open to the internet',
      'A transit gateway shared with every consumer',
      'A NAT gateway in each consumer VPC'
    ),
    correct: ['a'],
    explanation: 'AWS PrivateLink lets a provider publish a VPC endpoint service behind an NLB, and consumers connect privately via interface endpoints — no peering, no internet exposure. A public ALB exposes the app, a shared transit gateway over-connects networks, and NAT gateways are for egress.',
    references: [REF_PRIVATELINK, REF_VPC]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A third-party SaaS vendor must assume a role in the company\'s AWS account to manage resources. The solutions architect wants to prevent the "confused deputy" problem. What should the role\'s trust policy require?',
    options: opts4(
      'An external ID condition that the vendor must supply when assuming the role',
      'The vendor to use the company\'s root credentials',
      'A wildcard principal so any account can assume the role',
      'A long-lived IAM user access key shared with the vendor'
    ),
    correct: ['a'],
    explanation: 'For third-party cross-account access, the trust policy should require a unique external ID (an sts:ExternalId condition) to prevent the confused deputy problem. Sharing root credentials or access keys and using a wildcard principal are insecure.',
    references: [REF_IAM_CROSS, REF_IAM]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants a single mechanism to receive and route security and operational events (such as GuardDuty findings) from all member accounts to a central account for processing. Which design should the solutions architect use?',
    options: opts4(
      'Send events to Amazon EventBridge and route them cross-account to an event bus in a central account',
      'Email every finding to a shared mailbox',
      'Have each account write findings to its own private S3 bucket only',
      'Poll each account\'s console manually'
    ),
    correct: ['a'],
    explanation: 'EventBridge can route events cross-account to a central event bus, enabling centralized processing and notification of security/operational events. Email, isolated per-account buckets, and manual polling do not provide centralized, automated routing.',
    references: [REF_EVENTBRIDGE, REF_GUARDDUTY]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A company governed by AWS Control Tower must provision new, pre-configured member accounts that automatically inherit guardrails and baseline configuration. Which Control Tower capability provides this?',
    options: opts4(
      'Account Factory, which provisions new accounts that conform to the landing zone configuration',
      'A manual account creation process with no baseline',
      'A CloudWatch dashboard',
      'A NAT gateway template'
    ),
    correct: ['a'],
    explanation: 'Control Tower Account Factory provisions and configures new accounts that automatically conform to the landing zone\'s guardrails and baseline. Manual creation does not guarantee conformance, and dashboards and NAT templates do not provision governed accounts.',
    references: [REF_CONTROL_TOWER, REF_ORG]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A solutions architect must allow member accounts to use only a small set of approved services and block everything else by default. Which SCP strategy should they apply?',
    options: opts4(
      'Use an allow-list SCP that permits only the approved services, replacing the default FullAWSAccess',
      'Attach an SCP that allows all actions and rely on users to self-restrict',
      'Leave only the default FullAWSAccess SCP in place',
      'Apply the SCP to individual IAM users instead of accounts/OUs'
    ),
    correct: ['a'],
    explanation: 'An allow-list SCP grants only the approved services and, by removing FullAWSAccess, denies everything else by default for the accounts in scope. Allowing all actions or keeping only FullAWSAccess provides no restriction, and SCPs apply to accounts/OUs, not individual users.',
    references: [REF_SCP, REF_ORG]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A central S3 bucket receives CloudTrail logs from all accounts. The logs must be encrypted with a key the security team controls and audits. How should the solutions architect configure encryption?',
    options: opts4(
      'Encrypt the bucket and CloudTrail log delivery with an AWS KMS customer managed key, with a key policy granting the accounts permission to encrypt',
      'Leave the central bucket unencrypted for easier access',
      'Encrypt with a key stored in a public location',
      'Use a unique unmanaged key per object with no policy'
    ),
    correct: ['a'],
    explanation: 'A KMS customer managed key encrypts the central log bucket and CloudTrail deliveries, gives the security team control, and logs key usage in CloudTrail; the key policy must allow the source accounts to encrypt. Unencrypted logs and publicly stored keys fail the requirement.',
    references: [REF_KMS, REF_CLOUDTRAIL]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A networking team owns a transit gateway and must let many other accounts in the organization attach their VPCs to it. Which service enables sharing the transit gateway across accounts?',
    options: opts4(
      'AWS Resource Access Manager (AWS RAM)',
      'Amazon Route 53',
      'AWS CloudTrail',
      'Amazon CloudFront'
    ),
    correct: ['a'],
    explanation: 'AWS RAM can share a transit gateway with other accounts in the organization so they can create VPC attachments to it. Route 53 is DNS, CloudTrail records API activity, and CloudFront is a CDN.',
    references: [REF_RAM, REF_TGW]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A mission-critical application must serve users from two AWS Regions simultaneously, with both Regions actively handling traffic and the lowest possible RTO and RPO. Which disaster recovery strategy is this?',
    options: opts4(
      'Multi-site active/active',
      'Backup and restore',
      'Pilot light',
      'Warm standby'
    ),
    correct: ['a'],
    explanation: 'Multi-site active/active runs the workload in multiple Regions serving traffic simultaneously, giving the lowest RTO and RPO at the highest cost. Backup and restore and pilot light have larger RTOs, and warm standby keeps the second site scaled down rather than fully active.',
    references: [REF_DR]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A company must centrally manage and automate backups for resources across many accounts and copy them to a second Region for compliance. Which approach should the solutions architect recommend?',
    options: opts4(
      'Use AWS Backup with organization-wide backup policies and backup plan rules that copy recovery points cross-Region',
      'Write a custom backup script and run it on one EC2 instance',
      'Rely on each team to take manual snapshots',
      'Enable S3 Versioning and consider backups complete'
    ),
    correct: ['a'],
    explanation: 'AWS Backup integrates with AWS Organizations for central backup policies across accounts, and plan rules can copy recovery points to another Region for compliance. A single-instance script is fragile, manual snapshots are inconsistent, and S3 Versioning only protects S3 objects.',
    references: [REF_BACKUP]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A company is consolidating many AWS accounts under one organization and wants combined billing and to benefit from aggregated volume pricing tiers. Which AWS Organizations feature provides this?',
    options: opts4(
      'Consolidated billing, which combines usage across accounts for volume pricing and a single bill',
      'A separate payment method per account with no consolidation',
      'Service control policies',
      'AWS Config aggregators'
    ),
    correct: ['a'],
    explanation: 'Consolidated billing in AWS Organizations combines usage across all member accounts for a single bill and can reach volume discount tiers sooner. SCPs are permission guardrails, and Config aggregators consolidate compliance data, not billing.',
    references: [REF_ORG, REF_COST_EXPLORER]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A solutions architect must reduce EC2, EBS, and Lambda cost across an organization by identifying over-provisioned resources from actual utilization. Which service provides rightsizing recommendations?',
    options: opts4(
      'AWS Compute Optimizer',
      'AWS CloudFormation drift detection',
      'Amazon Route 53 Resolver',
      'AWS Resource Access Manager'
    ),
    correct: ['a'],
    explanation: 'AWS Compute Optimizer analyzes utilization metrics and recommends optimal configurations for EC2 instances, EBS volumes, Lambda functions, and more. Drift detection, Route 53 Resolver, and RAM are unrelated to rightsizing.',
    references: [REF_COMPUTE_OPT]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A solutions architect must place a new workload to maximize resilience to the failure of a single data center while keeping components close for low inter-component latency. What should the design use?',
    options: opts4(
      'Multiple Availability Zones within one Region',
      'A single Availability Zone',
      'Multiple Regions with synchronous writes between them for every request',
      'Edge locations instead of Availability Zones'
    ),
    correct: ['a'],
    explanation: 'Availability Zones are isolated data center groupings within a Region with low-latency links; spreading across multiple AZs survives a single data center failure while keeping latency low. A single AZ has no resilience, synchronous cross-Region writes add high latency, and edge locations are for content delivery, not application hosting.',
    references: [REF_REGIONS_AZ, REF_DR]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'Using IAM Identity Center, a solutions architect must grant the "Developers" group read/write access in development accounts and read-only access in production accounts. Which Identity Center concept maps a set of permissions to accounts?',
    options: opts4(
      'Permission sets, assigned to the group for the relevant accounts',
      'A single IAM user shared by all developers',
      'A NAT gateway per account',
      'A service control policy attached to each developer'
    ),
    correct: ['a'],
    explanation: 'IAM Identity Center permission sets define a collection of permissions and are assigned to users/groups for specific accounts, so the same group can have different access per account. A shared IAM user is insecure, NAT gateways are networking, and SCPs apply to accounts/OUs.',
    references: [REF_IAM_IC, REF_IAM]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'Data encrypted in one Region must be decryptable in a second Region for a cross-Region active/active design, using the same key identity. Which AWS KMS feature supports this?',
    options: opts4(
      'AWS KMS multi-Region keys',
      'A single-Region customer managed key',
      'An AWS managed key',
      'Disabling encryption in the second Region'
    ),
    correct: ['a'],
    explanation: 'KMS multi-Region keys share the same key ID and key material across Regions, so ciphertext produced in one Region can be decrypted by the related key in another. Single-Region and AWS managed keys are Region-bound, and disabling encryption is not acceptable.',
    references: [REF_KMS]
  },

  // ── Design for New Solutions (19) ──
  {
    domain: D2, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A solutions architect must deploy the same baseline networking and security stack consistently into 30 accounts across an AWS Organization, including future accounts. Which approach is best?',
    options: opts4(
      'A service-managed CloudFormation StackSet with automatic deployment to the organization or OUs',
      'A single CloudFormation stack in the management account',
      'Manually creating the stack in each account',
      'An AWS RAM share of the template file'
    ),
    correct: ['a'],
    explanation: 'A service-managed StackSet integrates with AWS Organizations and, with automatic deployment, deploys the template to current and future member accounts in the targeted OUs. A single stack covers one account, manual work does not scale, and RAM shares resources rather than deploying templates.',
    references: [REF_CFN_STACKSETS, REF_CFN]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new solution needs an automated pipeline that builds, tests, and deploys application changes from source control to production with approval stages. Which AWS service orchestrates this CI/CD pipeline?',
    options: opts4(
      'AWS CodePipeline, integrating build, test, deploy, and manual approval stages',
      'Amazon CloudWatch dashboards',
      'AWS Trusted Advisor',
      'Amazon Route 53'
    ),
    correct: ['a'],
    explanation: 'AWS CodePipeline models a release pipeline with source, build, test, approval, and deploy stages, automating the path from commit to production. Dashboards, Trusted Advisor, and Route 53 do not orchestrate CI/CD.',
    references: [{ label: 'AWS Docs — What is AWS CodePipeline?', url: 'https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html' }, REF_CODEDEPLOY]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new application can tolerate an RTO of a few hours and an RPO of minutes. The company wants the lowest-cost cross-Region DR design that still keeps the database continuously replicated. Which strategy fits?',
    options: opts4(
      'Pilot light — keep the database replicated and core resources ready in the second Region, provisioning application servers on failover',
      'Multi-site active/active',
      'Warm standby with full-scale always-on capacity',
      'Backup and restore with weekly backups only'
    ),
    correct: ['a'],
    explanation: 'Pilot light continuously replicates the database and keeps core elements ready while application compute is provisioned on failover — low cost with an RTO of hours and a low RPO. Multi-site and warm standby cost more, and weekly backups give a poor RPO.',
    references: [REF_DR]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new application needs a relational database whose reads can be scaled out and that can serve disaster recovery from another Region. Which feature should the solutions architect use for cross-Region reads on Amazon RDS?',
    options: opts4(
      'A cross-Region read replica',
      'A Multi-AZ standby in the same Region used for reads',
      'A nightly snapshot copied to another Region',
      'An EC2 instance running a database copy'
    ),
    correct: ['a'],
    explanation: 'A cross-Region read replica serves read traffic in another Region and can be promoted for disaster recovery. The Multi-AZ standby is not readable, nightly snapshots have a large RPO, and a self-managed EC2 copy adds operational overhead.',
    references: [REF_RDS_REPLICA, REF_RDS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new application on EC2 and Lambda must access S3 and DynamoDB. The solutions architect wants no long-lived credentials anywhere. What should the design use?',
    options: opts4(
      'IAM roles attached to the EC2 instances and Lambda functions, granting least-privilege access',
      'IAM user access keys stored in the application code',
      'The account root user credentials',
      'A shared key file distributed to all instances'
    ),
    correct: ['a'],
    explanation: 'IAM roles supply automatically rotated temporary credentials to EC2 and Lambda, eliminating long-lived secrets. Embedded access keys, root credentials, and shared key files are insecure.',
    references: [REF_IAM_ROLES, REF_IAM]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new internet-facing application needs continuous, intelligent threat detection that analyzes account activity, network traffic, and DNS for signs of compromise. Which service should the solutions architect include?',
    options: opts4(
      'Amazon GuardDuty',
      'AWS CloudFormation',
      'Amazon EFS',
      'AWS Cost Explorer'
    ),
    correct: ['a'],
    explanation: 'Amazon GuardDuty continuously analyzes CloudTrail, VPC Flow Logs, and DNS logs with threat intelligence and machine learning to detect compromise. CloudFormation provisions infrastructure, EFS is storage, and Cost Explorer analyzes spend.',
    references: [REF_GUARDDUTY]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new solution must encrypt large volumes of data at rest, and the security team requires control over the encryption keys and an audit trail of key usage. Which approach should the solutions architect specify?',
    options: opts4(
      'Use AWS KMS customer managed keys for envelope encryption, with key usage logged in AWS CloudTrail',
      'Hard-code a static encryption key in the application',
      'Store the encryption key in a public S3 bucket',
      'Skip encryption and rely on network controls only'
    ),
    correct: ['a'],
    explanation: 'KMS customer managed keys give the security team control over key policies and rotation, perform efficient envelope encryption for large data, and log every key use in CloudTrail. Hard-coded or publicly stored keys and skipping encryption all fail the requirement.',
    references: [REF_KMS, REF_CLOUDTRAIL]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new system uses an SQS queue between producers and consumers. The solutions architect must ensure that messages which repeatedly fail processing do not block the queue and can be inspected later. What should be configured?',
    options: opts4(
      'A dead-letter queue with a maxReceiveCount redrive policy on the source queue',
      'A larger consumer instance type',
      'A shorter message retention period',
      'A second internet gateway'
    ),
    correct: ['a'],
    explanation: 'A dead-letter queue with a redrive policy moves messages that exceed the maximum receive count off the main queue for later inspection, preventing poison messages from blocking processing. Larger consumers, shorter retention, and internet gateways do not isolate failing messages.',
    references: [REF_SQS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new multi-step order workflow must coordinate several Lambda functions, handle retries and compensating actions on failure, and remain serverless. Which service should the solutions architect choose?',
    options: opts4(
      'AWS Step Functions, modeling the workflow as a state machine with retry and catch behavior',
      'A single Lambda function with deeply nested try/catch logic',
      'An EC2 instance running a workflow daemon',
      'Amazon SNS alone'
    ),
    correct: ['a'],
    explanation: 'Step Functions orchestrates multi-step serverless workflows with built-in retry, catch, and parallel/branching states, supporting compensating actions. One monolithic Lambda is hard to maintain and timeout-limited, an EC2 daemon is not serverless, and SNS only delivers notifications.',
    references: [REF_STEPFUNCTIONS, REF_LAMBDA]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new application is deployed identically in two Regions and must serve users from the closest healthy Region, failing away from an unhealthy Region automatically. Which Route 53 configuration meets this?',
    options: opts4(
      'Latency-based routing records with health checks on each Regional endpoint',
      'A single simple routing record',
      'Weighted routing fixed at 50/50 with no health checks',
      'A private hosted zone'
    ),
    correct: ['a'],
    explanation: 'Latency-based routing sends users to the lowest-latency Region, and associated health checks remove an unhealthy Region from responses, providing automatic failover. Simple routing has no failover, an even weighted split ignores latency and health, and a private hosted zone is for internal VPC DNS.',
    references: [REF_R53_ROUTING]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new application has a recurring, predictable daily traffic pattern. The solutions architect wants capacity provisioned ahead of demand rather than lagging it. Which Auto Scaling capability should they use?',
    options: opts4(
      'Predictive scaling, which forecasts demand and scales capacity ahead of it',
      'Only reactive target tracking with a long cooldown',
      'Manual scaling each morning',
      'A fixed fleet sized to the daily peak'
    ),
    correct: ['a'],
    explanation: 'Predictive scaling uses machine learning on historical patterns to forecast load and provision capacity ahead of recurring demand, complementing reactive scaling. Reactive-only scaling lags spikes, manual scaling is error-prone, and a peak-sized fleet wastes money off-peak.',
    references: [REF_ASG]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new event-driven application invokes a Lambda function on every message and is expected to receive sudden, very large bursts. The solutions architect must design so the function does not throttle critical traffic. What should they do?',
    options: opts4(
      'Plan around the account Lambda concurrency quota — request increases and use reserved concurrency for critical functions',
      'Assume Lambda has unlimited concurrency and ignore quotas',
      'Run the function on a single EC2 instance instead',
      'Disable the function during bursts'
    ),
    correct: ['a'],
    explanation: 'Lambda concurrency is governed by an account quota; a professional design requests increases ahead of known bursts and uses reserved concurrency to guarantee capacity for critical functions. Concurrency is not unlimited, moving to one EC2 instance removes scalability, and disabling the function drops traffic.',
    references: [REF_LAMBDA]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new application reads heavily from a DynamoDB table with repeated key lookups and needs microsecond read latency for hot items. Which service should the solutions architect add?',
    options: opts4(
      'Amazon DynamoDB Accelerator (DAX), an in-memory cache for DynamoDB',
      'Amazon CloudFront in front of DynamoDB',
      'A larger EC2 instance for the application',
      'Amazon S3 Transfer Acceleration'
    ),
    correct: ['a'],
    explanation: 'DynamoDB Accelerator (DAX) is a fully managed in-memory cache for DynamoDB that delivers microsecond read latency for cached items. CloudFront caches web content, a bigger instance does not cache DynamoDB reads, and S3 Transfer Acceleration is for S3 uploads.',
    references: [{ label: 'AWS Docs — In-memory acceleration with DynamoDB Accelerator (DAX)', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html' }, REF_DYNAMODB]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new solution must run complex analytical SQL queries (joins and aggregations) over petabytes of structured data in a data warehouse. Which purpose-built service should the solutions architect select?',
    options: opts4(
      'Amazon Redshift',
      'Amazon DynamoDB',
      'Amazon ElastiCache',
      'Amazon RDS for MySQL on a small instance'
    ),
    correct: ['a'],
    explanation: 'Amazon Redshift is a petabyte-scale, columnar data warehouse optimized for complex analytical queries. DynamoDB is a key-value store, ElastiCache is an in-memory cache, and a small RDS instance is not suited to petabyte-scale analytics.',
    references: [{ label: 'AWS Docs — What is Amazon Redshift?', url: 'https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html' }, REF_DYNAMODB]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new compute-bound application performs heavy numerical processing and needs the highest sustained CPU performance per vCPU. Which EC2 instance family should the solutions architect select?',
    options: opts4(
      'A compute-optimized instance family',
      'A memory-optimized instance family',
      'A storage-optimized instance family',
      'A burstable (T-family) instance'
    ),
    correct: ['a'],
    explanation: 'Compute-optimized instances provide a high ratio of CPU performance, suited to compute-bound numerical workloads. Memory-optimized targets large in-memory data, storage-optimized targets disk I/O, and burstable instances are for variable, generally low baseline CPU.',
    references: [REF_EC2]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new high-performance computing application needs a shared file system delivering hundreds of GB/s of throughput and sub-millisecond latency for thousands of Linux compute nodes. Which storage service should the solutions architect select?',
    options: opts4(
      'Amazon FSx for Lustre',
      'Amazon S3 Glacier',
      'A single Amazon EBS gp2 volume',
      'Amazon FSx for Windows File Server'
    ),
    correct: ['a'],
    explanation: 'Amazon FSx for Lustre is a high-performance parallel file system designed for HPC and machine learning, delivering very high throughput and low latency. Glacier is archival, a single EBS volume cannot serve thousands of nodes, and FSx for Windows targets Windows/SMB workloads.',
    references: [REF_FSX]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new application writes log objects to Amazon S3 that are accessed frequently for 30 days, rarely for the next 60 days, and must be retained cheaply for 7 years. Which S3 design meets this at the lowest cost?',
    options: opts4(
      'An S3 Lifecycle policy that transitions objects to S3 Standard-IA after 30 days and to S3 Glacier classes after 90 days',
      'Keep all objects in S3 Standard for 7 years',
      'Delete the objects after 30 days',
      'Store everything in S3 Glacier Deep Archive from day one'
    ),
    correct: ['a'],
    explanation: 'An S3 Lifecycle policy transitions objects through cheaper storage classes as access patterns change — Standard-IA after 30 days, a Glacier class after 90 — minimizing cost while meeting the 7-year retention. Keeping everything in Standard is expensive, deletion violates retention, and Deep Archive from day one blocks the frequent-access period.',
    references: [REF_S3_LIFECYCLE, REF_S3]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new architecture has private-subnet instances that call Amazon S3 and DynamoDB heavily. The solutions architect wants to avoid NAT gateway data processing charges for that traffic. What should the design include?',
    options: opts4(
      'Gateway VPC endpoints for Amazon S3 and DynamoDB',
      'A larger NAT gateway',
      'An internet gateway attached to the private subnets',
      'A Route 53 private hosted zone'
    ),
    correct: ['a'],
    explanation: 'Gateway VPC endpoints for S3 and DynamoDB keep that traffic on the AWS network and avoid NAT gateway data processing charges and internet routing. A larger NAT gateway still incurs processing charges, an internet gateway exposes the subnets, and a hosted zone is for DNS.',
    references: [REF_VPC_ENDPOINT, REF_VPC]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new design has a front-end tier and a back-end processing tier with very different scaling characteristics. The solutions architect wants them to scale independently and tolerate back-end slowdowns. Which pattern should they apply?',
    options: opts4(
      'Decouple the tiers with an Amazon SQS queue so each scales independently and the queue buffers load',
      'Run both tiers in one Auto Scaling group scaled by a single metric',
      'Call the back end synchronously from the front end for every request',
      'Combine both tiers into one Lambda function'
    ),
    correct: ['a'],
    explanation: 'An SQS queue decouples the tiers so each scales on its own metrics and the queue buffers load when the back end is slow. One shared Auto Scaling group cannot scale the tiers independently, synchronous calls couple them, and merging tiers removes the separation entirely.',
    references: [REF_SQS, REF_ASG]
  },

  // ── Continuous Improvement for Existing Solutions (16) ──
  {
    domain: D3, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An existing environment has logs scattered across individual EC2 instances, making troubleshooting slow. Which improvement should the solutions architect recommend?',
    options: opts4(
      'Centralize logs by sending them to Amazon CloudWatch Logs (and optionally to S3), then query with CloudWatch Logs Insights',
      'Leave logs on each instance and connect with SSH when needed',
      'Delete logs to save space',
      'Print logs to the EC2 console only'
    ),
    correct: ['a'],
    explanation: 'Centralizing logs in CloudWatch Logs (with optional S3 archival) enables fast, unified search with Logs Insights and survives instance termination. Per-instance logs, deletion, and console-only output all hinder troubleshooting.',
    references: [REF_CW]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing application generates many separate CloudWatch alarms that all fire during one underlying incident, paging the team repeatedly. Which improvement reduces alarm noise?',
    options: opts4(
      'Use a CloudWatch composite alarm that combines the related alarms and notifies once on the overall condition',
      'Delete all alarms',
      'Increase every alarm threshold so none ever fire',
      'Route every alarm to a separate email address'
    ),
    correct: ['a'],
    explanation: 'A composite alarm combines existing alarms with a rule expression and notifies once based on the overall state, reducing duplicate pages. Deleting alarms removes coverage, unreachable thresholds hide problems, and more email addresses do not reduce noise.',
    references: [REF_CW]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing environment is provisioned manually, causing inconsistency and slow recovery. Which improvement should the solutions architect recommend for operational excellence?',
    options: opts4(
      'Adopt infrastructure as code (for example, AWS CloudFormation) so environments are repeatable and version-controlled',
      'Document the manual clicks in more detail',
      'Provision faster by skipping reviews',
      'Reduce the number of environments to one shared environment'
    ),
    correct: ['a'],
    explanation: 'Infrastructure as code with CloudFormation makes provisioning repeatable, reviewable, and version-controlled, eliminating manual inconsistency and speeding recovery. Better manual documentation, skipping reviews, and collapsing environments do not solve the underlying problem.',
    references: [REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A security review of an existing environment must determine whether any S3 buckets contain sensitive data such as personally identifiable information. Which service should the solutions architect use?',
    options: opts4(
      'Amazon Macie',
      'Amazon GuardDuty',
      'AWS Shield',
      'AWS Cost Explorer'
    ),
    correct: ['a'],
    explanation: 'Amazon Macie discovers and classifies sensitive data such as PII in Amazon S3. GuardDuty detects threats, Shield protects against DDoS, and Cost Explorer analyzes spend.',
    references: [{ label: 'AWS Docs — What is Amazon Macie?', url: 'https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html' }, REF_SECURITYHUB]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing fleet is patched inconsistently and manually. The solutions architect wants scheduled, compliant, automated patching with reporting. Which service should they recommend?',
    options: opts4(
      'AWS Systems Manager Patch Manager, run within maintenance windows',
      'Manual yum/apt updates over SSH',
      'EC2 Image Builder used to rebuild every instance hourly',
      'Amazon Inspector to apply patches automatically'
    ),
    correct: ['a'],
    explanation: 'Patch Manager applies patch baselines on a schedule within maintenance windows and reports compliance. Manual SSH patching is inconsistent, rebuilding instances hourly is disruptive, and Inspector finds vulnerabilities but does not apply OS patches.',
    references: [REF_SSM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing web application\'s origin servers are overloaded by repeated requests for the same static assets, and global users see high latency. Which improvement should the solutions architect recommend?',
    options: opts4(
      'Put Amazon CloudFront in front of the application to cache static content at edge locations',
      'Move the origin to a bigger EBS volume',
      'Add a second NAT gateway',
      'Enable S3 Versioning on the origin'
    ),
    correct: ['a'],
    explanation: 'CloudFront caches static assets at edge locations, offloading repeated requests from the origin and lowering global latency. A bigger volume, a NAT gateway, and versioning do not offload repeated requests.',
    references: [REF_CLOUDFRONT]
  },
  {
    domain: D3, difficulty: 3, type: QType.MULTI,
    stem: 'An existing application\'s relational database is the bottleneck due to a read-heavy dashboard that runs the same queries constantly. Which two improvements best address this? (Choose two.)',
    options: opts5(
      'Add RDS read replicas and direct dashboard reads to them',
      'Add an ElastiCache layer to cache frequent query results',
      'Disable automated backups on the database',
      'Move the database to a smaller instance type',
      'Delete the dashboard feature'
    ),
    correct: ['a', 'b'],
    explanation: 'Read replicas offload read-heavy traffic from the primary, and an ElastiCache layer serves repeated query results from memory — together they relieve the bottleneck. Disabling backups creates risk, downsizing worsens performance, and deleting the feature removes business value.',
    references: [REF_RDS_REPLICA, REF_ELASTICACHE]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A reliability review of an existing VPC finds one NAT gateway in a single Availability Zone serving private subnets in three AZs. What should the solutions architect recommend?',
    options: opts4(
      'Deploy a NAT gateway in each Availability Zone and route each private subnet to its local NAT gateway',
      'Keep the single NAT gateway but make it larger',
      'Replace the NAT gateway with an internet gateway on the private subnets',
      'Remove the NAT gateway entirely'
    ),
    correct: ['a'],
    explanation: 'A single NAT gateway is an AZ-level single point of failure (and incurs cross-AZ data charges); the resilient design uses one NAT gateway per AZ with each subnet routing to its local gateway. Resizing does not add resilience, an internet gateway exposes the subnets, and removing the NAT gateway breaks outbound access.',
    references: [REF_VPC]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'An existing single-Region application has grown business-critical and now needs to survive a full Region failure. Which improvement should the solutions architect prioritize?',
    options: opts4(
      'Introduce a multi-Region disaster recovery strategy with data replication and a defined failover process',
      'Add more Availability Zones in the same Region',
      'Increase the instance sizes',
      'Take more frequent snapshots in the same Region'
    ),
    correct: ['a'],
    explanation: 'Surviving a Region failure requires a multi-Region DR strategy with cross-Region data replication and a tested failover process. More AZs, larger instances, and same-Region snapshots do not protect against the loss of the entire Region.',
    references: [REF_DR]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing production workload has run On-Demand at a stable 24x7 level for over a year. The solutions architect wants to cut its cost with minimal risk. Which change should they recommend?',
    options: opts4(
      'Purchase a Savings Plan (or Reserved Instances) to cover the steady baseline usage',
      'Move the entire steady workload to Spot Instances',
      'Switch to a smaller Region',
      'Delete the workload during business hours'
    ),
    correct: ['a'],
    explanation: 'A Savings Plan or Reserved Instances delivers a significant discount for steady, predictable usage with no architectural change. Spot is unsuitable for a stable production baseline, changing Region does not materially cut the rate, and deleting the workload is not viable.',
    references: [REF_SAVINGS_PLANS, REF_RI]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A cost review of an existing account must find unattached EBS volumes, idle load balancers, and old snapshots that are wasting money. Which service surfaces these directly?',
    options: opts4(
      'AWS Trusted Advisor cost optimization checks',
      'Amazon CloudWatch Synthetics',
      'AWS Step Functions',
      'Amazon Route 53'
    ),
    correct: ['a'],
    explanation: 'AWS Trusted Advisor cost optimization checks flag idle and unused resources such as unattached volumes and idle load balancers. Synthetics monitors endpoints, Step Functions orchestrates workflows, and Route 53 is DNS.',
    references: [REF_TRUSTED_ADVISOR]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A solutions architect must analyze S3 storage usage and activity across an existing organization to find cost-optimization opportunities such as objects that should be in cheaper storage classes. Which tool provides this?',
    options: opts4(
      'Amazon S3 Storage Lens',
      'Amazon Inspector',
      'AWS WAF',
      'Amazon EventBridge'
    ),
    correct: ['a'],
    explanation: 'Amazon S3 Storage Lens delivers organization-wide visibility into object storage usage and activity with recommendations to optimize cost. Inspector scans for vulnerabilities, WAF filters web traffic, and EventBridge routes events.',
    references: [{ label: 'AWS Docs — Assessing storage activity and usage with S3 Storage Lens', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage_lens.html' }, REF_S3]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing environment relies on engineers manually performing routine operational tasks. The solutions architect wants to codify these as repeatable, auditable procedures. Which service should they recommend?',
    options: opts4(
      'AWS Systems Manager Automation runbooks',
      'Amazon CloudWatch dashboards',
      'AWS Cost Explorer',
      'Amazon SNS email subscriptions'
    ),
    correct: ['a'],
    explanation: 'Systems Manager Automation runbooks codify operational procedures as versioned, permission-controlled, auditable documents that can run on demand or on a schedule. Dashboards visualize metrics, Cost Explorer analyzes spend, and SNS only sends notifications.',
    references: [REF_SSM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A solutions architect must continuously benchmark an existing multi-account environment against security best practices and standards such as the AWS Foundational Security Best Practices. Which service should they enable?',
    options: opts4(
      'AWS Security Hub with security standards enabled',
      'Amazon CloudFront',
      'AWS Direct Connect',
      'Amazon ElastiCache'
    ),
    correct: ['a'],
    explanation: 'AWS Security Hub runs automated checks against security standards (including the AWS Foundational Security Best Practices) and aggregates the results across accounts. CloudFront, Direct Connect, and ElastiCache are not security posture services.',
    references: [REF_SECURITYHUB]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing Auto Scaling group reacts too slowly to traffic spikes, leaving users with errors before new capacity is ready. Which improvement should the solutions architect evaluate?',
    options: opts4(
      'Tune the scaling policies (for example, target tracking thresholds) and add a warm pool of pre-initialized instances',
      'Set the Auto Scaling group to a fixed size equal to the minimum',
      'Disable health checks to keep instances longer',
      'Remove the load balancer'
    ),
    correct: ['a'],
    explanation: 'Tuning scaling policies and adding a warm pool of pre-initialized instances lets the group respond to spikes faster. A fixed minimum size removes elasticity, disabling health checks hides failures, and removing the load balancer breaks distribution.',
    references: [REF_ASG]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing application protects data with ad hoc, inconsistent snapshots taken by different teams. The solutions architect wants a centralized, policy-driven, auditable backup strategy. Which service should they adopt?',
    options: opts4(
      'AWS Backup, with backup plans defining schedules, retention, and lifecycle, plus audit reporting',
      'A shared spreadsheet listing who took which snapshot',
      'S3 Versioning only',
      'Manual snapshots continued, but more often'
    ),
    correct: ['a'],
    explanation: 'AWS Backup centralizes backups across services with policy-driven schedules, retention, lifecycle, and audit reporting, replacing inconsistent manual snapshots. A spreadsheet is not automation, S3 Versioning only covers S3, and more-frequent manual snapshots remain inconsistent.',
    references: [REF_BACKUP]
  },

  // ── Accelerate Workload Migration and Modernization (13) ──
  {
    domain: D4, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During migration planning, a company decides to retire an aging self-managed email server and adopt a managed SaaS email product instead. Which of the 7 Rs migration strategies is this?',
    options: opts4(
      'Repurchase (move to a different product, often SaaS)',
      'Rehost (lift and shift)',
      'Replatform (lift, tinker, and shift)',
      'Refactor (re-architect)'
    ),
    correct: ['a'],
    explanation: 'Repurchase means moving to a different product — commonly a SaaS offering — rather than migrating the existing software. Rehost moves the app unchanged, replatform makes minor optimizations, and refactor re-architects the application.',
    references: [REF_7RS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'Before migrating, a company must compare the total cost of running its on-premises workloads versus running them on AWS to build a business case. Which tool helps model and estimate this?',
    options: opts4(
      'The AWS Pricing Calculator (with discovery data) to model AWS cost and support a TCO comparison',
      'Amazon CloudWatch metrics',
      'AWS WAF logs',
      'Amazon SQS queue depth'
    ),
    correct: ['a'],
    explanation: 'The AWS Pricing Calculator models the cost of proposed AWS architectures, supporting a total cost of ownership comparison against on-premises. CloudWatch metrics, WAF logs, and SQS depth are not cost-modeling tools.',
    references: [{ label: 'AWS Docs — AWS Pricing Calculator', url: 'https://docs.aws.amazon.com/pricing-calculator/latest/userguide/what-is-pricing-calculator.html' }, REF_COST_EXPLORER]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company must build a migration portfolio: an inventory of on-premises servers with utilization and dependency mapping to plan migration waves. Which service collects this discovery data?',
    options: opts4(
      'AWS Application Discovery Service, feeding AWS Migration Hub',
      'Amazon Inspector',
      'AWS Config',
      'Amazon CloudFront'
    ),
    correct: ['a'],
    explanation: 'AWS Application Discovery Service collects server configuration, utilization, and dependency data, which Migration Hub uses for portfolio assessment and wave planning. Inspector scans for vulnerabilities, Config tracks AWS resource configuration, and CloudFront is a CDN.',
    references: [REF_DISCOVERY, REF_MIGRATION_HUB]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A team using AWS Application Migration Service wants to validate that migrated servers boot and function correctly on AWS before the final production cutover. Which capability supports this?',
    options: opts4(
      'Launching test instances from the replicated servers before performing the cutover',
      'Deleting the source servers before testing',
      'Skipping testing because MGN guarantees success',
      'Running the production cutover first and testing afterward'
    ),
    correct: ['a'],
    explanation: 'AWS Application Migration Service supports launching test instances from continuously replicated source servers so teams can validate functionality before the cutover. Deleting sources early, skipping testing, or cutting over before testing are all unsafe.',
    references: [REF_MGN]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'A company is migrating a production database to AWS and must keep the source and target in sync until cutover so downtime is minimal. Which AWS DMS capability provides this?',
    options: opts4(
      'Change data capture (ongoing replication) so changes on the source continue to be applied to the target until cutover',
      'A single full load with no ongoing replication',
      'A nightly snapshot copy',
      'Manual export and import on cutover day'
    ),
    correct: ['a'],
    explanation: 'AWS DMS supports change data capture (CDC) for ongoing replication, keeping the target continuously in sync with the source so cutover downtime is minimal. A one-time full load goes stale, nightly snapshots have large RPO, and manual export/import causes long downtime.',
    references: [REF_DMS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A remote site with very limited connectivity must migrate large amounts of data to AWS and also run some local data preprocessing before shipment. Which AWS Snow Family option fits?',
    options: opts4(
      'AWS Snowball Edge, which provides bulk offline transfer plus on-device compute for preprocessing',
      'AWS DataSync over the limited link',
      'Amazon S3 Transfer Acceleration over the limited link',
      'A standard internet upload'
    ),
    correct: ['a'],
    explanation: 'AWS Snowball Edge provides offline bulk data transfer and on-device compute, so data can be preprocessed locally before the device is shipped to AWS. DataSync, S3 Transfer Acceleration, and a standard upload all depend on the limited link.',
    references: [REF_SNOW]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A migration requires transferring many terabytes of data continuously between on-premises and AWS during a multi-month cutover, with consistent, low-latency, private bandwidth. Which connectivity option should the solutions architect recommend?',
    options: opts4(
      'AWS Direct Connect for a dedicated, consistent private network connection',
      'A single small Site-to-Site VPN tunnel over the public internet',
      'Public internet uploads with no dedicated link',
      'Mailing hard drives weekly for the entire project'
    ),
    correct: ['a'],
    explanation: 'AWS Direct Connect provides a dedicated, consistent, private connection with predictable bandwidth and latency, suited to sustained large transfers during a long migration. A small VPN and public internet have variable performance, and repeatedly mailing drives is impractical for continuous transfer.',
    references: [REF_DX]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A migrated application currently runs on a single self-managed server and must move to a managed AWS platform that handles capacity, load balancing, and health monitoring with minimal code changes. Which service should the solutions architect evaluate?',
    options: opts4(
      'AWS Elastic Beanstalk',
      'A single EC2 instance configured manually',
      'AWS Lambda with a complete rewrite into functions',
      'Amazon S3 static website hosting'
    ),
    correct: ['a'],
    explanation: 'AWS Elastic Beanstalk runs and manages web applications — provisioning, load balancing, scaling, and health monitoring — with minimal code change, ideal for a quick replatform. A manual EC2 instance keeps the management burden, Lambda requires re-architecture, and S3 hosting serves only static content.',
    references: [REF_BEANSTALK, REF_EC2]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'A company is moving a containerized application to AWS. The team wants the simplest AWS-native container orchestration without managing a Kubernetes control plane or any servers. Which combination should the solutions architect recommend?',
    options: opts4(
      'Amazon ECS with the AWS Fargate launch type',
      'Amazon EKS with self-managed EC2 nodes',
      'A single EC2 instance running Docker manually',
      'AWS Lambda with no containers'
    ),
    correct: ['a'],
    explanation: 'Amazon ECS with AWS Fargate is the simplest AWS-native, serverless container option — no control plane and no servers to manage. EKS with self-managed nodes adds Kubernetes and node management, a manual Docker host adds operational burden, and Lambda is not a container orchestrator.',
    references: [REF_ECS, REF_FARGATE]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company is modernizing an application that uses a self-managed NoSQL database on EC2, which is costly to operate and scale. The access pattern is simple key-value lookups. Which managed target should the solutions architect recommend?',
    options: opts4(
      'Amazon DynamoDB',
      'Amazon Redshift',
      'A larger self-managed NoSQL cluster on EC2',
      'Amazon S3 Glacier'
    ),
    correct: ['a'],
    explanation: 'Amazon DynamoDB is a fully managed, serverless key-value database that removes operational overhead and scales seamlessly — a strong modernization target for self-managed NoSQL with key-value access. Redshift is for analytics, a bigger EC2 cluster keeps the operational burden, and Glacier is archival storage.',
    references: [REF_DYNAMODB]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A modernization effort must let many independent services react to business events (such as "order placed") without the producer knowing the consumers. Which service should the solutions architect introduce?',
    options: opts4(
      'Amazon EventBridge, using an event bus and rules to route events to consumers',
      'A direct synchronous API call from the producer to every consumer',
      'A shared database table that all services poll',
      'A single monolithic process containing all services'
    ),
    correct: ['a'],
    explanation: 'Amazon EventBridge provides an event bus with rules that route events to many consumers, decoupling producers from consumers in an event-driven architecture. Synchronous calls couple the services, table polling is inefficient, and a monolith removes the decoupling entirely.',
    references: [REF_EVENTBRIDGE]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company is modernizing a self-managed MySQL database on EC2 and wants a managed, MySQL-compatible database with higher performance, automated failover, and storage that scales automatically. Which target should the solutions architect recommend?',
    options: opts4(
      'Amazon Aurora MySQL-Compatible Edition',
      'A larger self-managed MySQL instance on EC2',
      'Amazon DynamoDB',
      'Amazon OpenSearch Service'
    ),
    correct: ['a'],
    explanation: 'Amazon Aurora MySQL-Compatible Edition is a managed, MySQL-compatible database with high performance, automated failover, and auto-scaling storage — a strong modernization target. A bigger EC2 instance keeps the management burden, DynamoDB is non-relational, and OpenSearch is for search/analytics.',
    references: [REF_AURORA, REF_RDS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company is migrating a Windows application that depends on a Windows-native SMB file share. Which AWS storage service should the solutions architect select for the migrated file share?',
    options: opts4(
      'Amazon FSx for Windows File Server',
      'Amazon EFS',
      'Amazon S3 Glacier',
      'An Amazon EBS volume shared over the internet'
    ),
    correct: ['a'],
    explanation: 'Amazon FSx for Windows File Server provides fully managed Windows-native SMB file shares with Active Directory integration. Amazon EFS is NFS for Linux, Glacier is archival object storage, and EBS volumes are not internet-shared SMB shares.',
    references: [REF_FSX, REF_EFS]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Design Solutions for Organizational Complexity (17) ──
  {
    domain: D1, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A company runs transit gateways in three AWS Regions and needs the VPCs in each Region to communicate with VPCs in the other Regions over the AWS network. Which design connects the transit gateways?',
    options: opts4(
      'Create transit gateway peering attachments between the transit gateways in the different Regions',
      'Peer every individual VPC across Regions directly',
      'Route inter-Region traffic over the public internet with NAT gateways',
      'Use a single transit gateway for all three Regions'
    ),
    correct: ['a'],
    explanation: 'Transit gateway peering attachments connect transit gateways across Regions over the AWS global network, so all attached VPCs can communicate. Per-VPC cross-Region peering does not scale, public internet routing is less secure and consistent, and a transit gateway is a Regional resource — it cannot span Regions.',
    references: [REF_TGW]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A company\'s primary connectivity is AWS Direct Connect with BGP. The solutions architect must add a backup that fails over automatically and is preferred again once Direct Connect recovers. What should they configure?',
    options: opts4(
      'An AWS Site-to-Site VPN backup, relying on BGP route preference so Direct Connect is used when available and the VPN takes over on failure',
      'A second Direct Connect connection in the same rack with no routing changes',
      'A manual process to switch DNS during an outage',
      'A NAT gateway as the backup path'
    ),
    correct: ['a'],
    explanation: 'A Site-to-Site VPN backup with BGP gives automatic failover; AWS prefers Direct Connect routes and falls back to the VPN, then prefers Direct Connect again on recovery. A second connection in the same rack shares failure domains, manual DNS switching is slow, and a NAT gateway is not a hybrid path.',
    references: [REF_DX, REF_VPN]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'Many application VPCs need access to shared services — Active Directory, centralized DNS, and security tooling — without duplicating them in every VPC. Which design should the solutions architect recommend?',
    options: opts4(
      'A shared services VPC hosting the common services, connected to the application VPCs through a transit gateway',
      'Deploy a full copy of Active Directory and DNS in every application VPC',
      'Expose the shared services to the public internet for all VPCs to reach',
      'Use VPC peering from every application VPC to every other application VPC'
    ),
    correct: ['a'],
    explanation: 'A shared services VPC centralizes common services and connects to application VPCs through a transit gateway, avoiding duplication. Copying the services into every VPC is wasteful, public exposure is insecure, and a full peering mesh does not scale.',
    references: [REF_TGW, REF_VPC]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A security team must prevent resources across the organization\'s VPCs from resolving DNS names of known malicious domains. Which service should the solutions architect deploy?',
    options: opts4(
      'Route 53 Resolver DNS Firewall with domain rule groups',
      'AWS WAF web ACLs',
      'A NAT gateway',
      'Amazon CloudFront geo restriction'
    ),
    correct: ['a'],
    explanation: 'Route 53 Resolver DNS Firewall filters outbound DNS queries from VPCs, blocking queries to malicious domains via rule groups that can be shared across the organization. WAF filters HTTP requests, NAT gateways provide egress, and CloudFront geo restriction limits content by country.',
    references: [REF_R53_RESOLVER]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A solutions architect must let a specific S3 bucket be read by an application in another AWS account, controlled at the bucket itself. Which mechanism should they use?',
    options: opts4(
      'An S3 bucket policy (a resource-based policy) granting the other account the required read actions',
      'A service control policy attached to the bucket',
      'A permissions boundary on the bucket',
      'A network ACL on the bucket'
    ),
    correct: ['a'],
    explanation: 'An S3 bucket policy is a resource-based policy that controls access to the bucket, including granting cross-account access. SCPs and permissions boundaries apply to IAM entities/accounts, and network ACLs are subnet-level network controls.',
    references: [{ label: 'AWS Docs — Bucket policies for Amazon S3', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html' }, REF_IAM]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants Amazon GuardDuty enabled across every account in its organization, managed centrally, with new accounts enrolled automatically. Which approach should the solutions architect use?',
    options: opts4(
      'Designate a GuardDuty delegated administrator account and enable auto-enable for the organization',
      'Enable GuardDuty manually in each account and revisit when accounts are added',
      'Enable GuardDuty only in the management account',
      'Forward VPC Flow Logs to a spreadsheet for review'
    ),
    correct: ['a'],
    explanation: 'A GuardDuty delegated administrator manages GuardDuty across the organization, and auto-enable brings new accounts under coverage automatically. Manual per-account enablement does not scale, the management account alone leaves others uncovered, and a spreadsheet is not threat detection.',
    references: [REF_GUARDDUTY, REF_ORG]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A solutions architect is designing the organizational unit (OU) structure for a new AWS Organization. Which design principle should guide it?',
    options: opts4(
      'Group accounts into OUs by function and apply SCPs at the OU level so policies are inherited consistently',
      'Place every account directly under the root with no OUs',
      'Create one OU per individual IAM user',
      'Avoid OUs because they cannot have policies attached'
    ),
    correct: ['a'],
    explanation: 'Best practice groups accounts into OUs by function or environment and attaches SCPs at the OU level so guardrails are inherited consistently and managed at scale. A flat structure makes policy management hard, OUs are not per-user, and OUs can have SCPs attached.',
    references: [REF_ORG, REF_SCP]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance mandate requires that every Amazon EBS volume and S3 object created in any member account is encrypted. Which control most directly enforces this organization-wide?',
    options: opts4(
      'A service control policy that denies the creation of unencrypted resources (for example, denying ec2:CreateVolume without encryption)',
      'A CloudWatch alarm in each account',
      'An email policy reminder to developers',
      'A Trusted Advisor check with no enforcement'
    ),
    correct: ['a'],
    explanation: 'An SCP can deny API calls that would create unencrypted resources, technically enforcing encryption across all accounts in scope. Alarms and Trusted Advisor only detect/notify, and reminders are not enforcement.',
    references: [REF_SCP, REF_KMS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A security team must run sophisticated, SQL-based queries across many years of CloudTrail activity from all accounts for investigations. Which capability is designed for this?',
    options: opts4(
      'AWS CloudTrail Lake, an immutable managed data store you query with SQL',
      'A single CloudWatch metric',
      'Amazon Route 53 query logs',
      'AWS Budgets reports'
    ),
    correct: ['a'],
    explanation: 'CloudTrail Lake aggregates events into an immutable data store you can query with SQL over long retention periods, ideal for investigations. A CloudWatch metric is a single time series, Route 53 query logs cover DNS, and Budgets reports cover cost.',
    references: [REF_CLOUDTRAIL]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A networking account must share its VPC subnets with several application accounts in the organization so those accounts can launch resources into the shared subnets. Which service enables VPC sharing?',
    options: opts4(
      'AWS Resource Access Manager (AWS RAM)',
      'AWS CloudTrail',
      'Amazon EventBridge',
      'AWS Trusted Advisor'
    ),
    correct: ['a'],
    explanation: 'AWS RAM enables VPC sharing by sharing subnets with other accounts in the organization, which can then launch resources into them. CloudTrail records API activity, EventBridge routes events, and Trusted Advisor provides best-practice checks.',
    references: [REF_RAM, REF_VPC]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A company has a disaster recovery plan based on AWS Elastic Disaster Recovery but has never validated it. What should the solutions architect recommend to gain confidence in the RTO and RPO?',
    options: opts4(
      'Regularly perform non-disruptive recovery drills by launching recovery (drill) instances and testing them',
      'Assume the plan works because the service is managed',
      'Wait for a real disaster to find out',
      'Delete the source servers to force a test'
    ),
    correct: ['a'],
    explanation: 'AWS Elastic Disaster Recovery supports non-disruptive recovery drills that launch drill instances so teams can validate functionality and confirm RTO/RPO without affecting production. Assuming success, waiting for a real disaster, or deleting sources are all unsafe.',
    references: [REF_DRS, REF_DR]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A compliance requirement states that backup recovery points must be immutable — undeletable and with retention that cannot be shortened — for the retention period. Which AWS Backup feature provides this?',
    options: opts4(
      'AWS Backup Vault Lock in compliance mode',
      'S3 Versioning on the backup vault',
      'A backup plan with a cross-Region copy action',
      'A larger backup window'
    ),
    correct: ['a'],
    explanation: 'AWS Backup Vault Lock in compliance mode makes recovery points immutable — they cannot be deleted and retention cannot be shortened, even by the root user — until retention expires. Versioning, copy actions, and backup windows do not provide immutability.',
    references: [REF_BACKUP]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A solutions architect must reduce a large organization\'s compute cost and wants data-driven recommendations on how much Savings Plans commitment to purchase. Which tool provides these recommendations?',
    options: opts4(
      'AWS Cost Explorer, which generates Savings Plans purchase recommendations from historical usage',
      'Amazon CloudWatch metrics',
      'AWS Config rules',
      'Amazon Inspector'
    ),
    correct: ['a'],
    explanation: 'AWS Cost Explorer analyzes historical usage and generates Savings Plans (and Reserved Instance) purchase recommendations. CloudWatch metrics, Config rules, and Inspector are not cost-recommendation tools.',
    references: [REF_COST_EXPLORER, REF_SAVINGS_PLANS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A finance team wants to be alerted automatically when AWS spend deviates significantly from normal patterns, without setting fixed thresholds. Which service should the solutions architect recommend?',
    options: opts4(
      'AWS Cost Anomaly Detection',
      'A fixed AWS Budgets threshold only',
      'Amazon GuardDuty',
      'AWS Trusted Advisor fault tolerance checks'
    ),
    correct: ['a'],
    explanation: 'AWS Cost Anomaly Detection uses machine learning to learn normal spend patterns and alerts on unusual cost increases without fixed thresholds. A fixed Budgets threshold is static, GuardDuty is for threats, and Trusted Advisor fault tolerance checks are not cost anomaly detection.',
    references: [{ label: 'AWS Docs — Detecting unusual spend with AWS Cost Anomaly Detection', url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/getting-started-ad.html' }, REF_BUDGETS]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'An application serving a metropolitan area requires single-digit-millisecond latency to end users and to on-premises systems in that city. Which AWS infrastructure option should the solutions architect evaluate?',
    options: opts4(
      'AWS Local Zones, which place compute and storage closer to large population and industry centers',
      'A standard Region thousands of kilometers away',
      'Amazon CloudFront only, with no compute changes',
      'A single Availability Zone in a distant Region'
    ),
    correct: ['a'],
    explanation: 'AWS Local Zones extend a Region by placing compute and storage in large metro areas, delivering single-digit-millisecond latency to nearby users and on-premises systems. A distant Region adds latency, CloudFront alone caches content but does not run the latency-sensitive compute, and a distant AZ does not help.',
    references: [{ label: 'AWS Docs — AWS Local Zones', url: 'https://docs.aws.amazon.com/local-zones/latest/ug/what-is-aws-local-zones.html' }, REF_VPC]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants employees to access AWS using their existing SAML 2.0 corporate identity provider, with no separate AWS passwords. Which approach should the solutions architect use?',
    options: opts4(
      'Configure identity federation — connect the SAML identity provider to AWS IAM Identity Center (or an IAM SAML identity provider)',
      'Create a separate IAM user with a password for every employee',
      'Share one IAM role\'s long-term access keys with all employees',
      'Use the management account root user for employee access'
    ),
    correct: ['a'],
    explanation: 'SAML 2.0 federation — typically via IAM Identity Center — lets employees sign in with their corporate identity provider and receive temporary AWS credentials, with no separate AWS passwords. Per-employee IAM users, shared keys, and root usage are insecure and unmanageable.',
    references: [REF_IAM_IC, REF_IAM]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'An application in account B must encrypt data with a KMS key owned by central security account A, and decrypt it later. Besides the key policy in account A allowing account B, what else is required?',
    options: opts4(
      'IAM policies in account B granting its principals the KMS actions (for example, kms:Encrypt and kms:Decrypt) on that key',
      'Making the KMS key public',
      'Copying account A\'s root credentials into account B',
      'A VPC peering connection between the two accounts'
    ),
    correct: ['a'],
    explanation: 'Cross-account KMS use requires both the key policy in the owning account to allow the external account and IAM policies in the external account to grant its principals the KMS actions — both must permit it. KMS keys cannot be public, sharing root credentials is unsafe, and VPC peering is unrelated to KMS authorization.',
    references: [REF_KMS, REF_IAM]
  },

  // ── Design for New Solutions (19) ──
  {
    domain: D2, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A large CloudFormation template has become difficult to maintain. The solutions architect wants reusable components — such as a standard VPC and a standard security baseline — composed into larger deployments. Which feature supports this?',
    options: opts4(
      'Nested stacks, where a parent stack references reusable child stack templates',
      'A single monolithic template with all resources inline',
      'A stack policy',
      'Termination protection'
    ),
    correct: ['a'],
    explanation: 'Nested stacks let a parent stack reference reusable child templates, enabling modular, maintainable infrastructure as code. A monolithic template is hard to maintain, stack policies protect resources during updates, and termination protection prevents deletion.',
    references: [REF_CFN]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new containerized service on Amazon ECS must be released with zero downtime and the ability to validate the new version before sending it production traffic. Which deployment approach should the solutions architect choose?',
    options: opts4(
      'A blue/green deployment with AWS CodeDeploy for the ECS service',
      'An all-at-once replacement of every task',
      'Manual task replacement during peak hours',
      'A deployment with health checks disabled'
    ),
    correct: ['a'],
    explanation: 'CodeDeploy supports blue/green deployments for ECS, standing up the new task set, validating it, and shifting traffic with instant rollback — achieving zero downtime. All-at-once replacement risks an outage, peak-hour manual work is risky, and disabling health checks hides failures.',
    references: [REF_CODEDEPLOY, REF_ECS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new internal, non-critical application can tolerate a recovery time of a day and data loss of a day in a disaster. Which DR strategy minimizes cost for this new solution?',
    options: opts4(
      'Backup and restore — restore the application and data from backups in another Region when needed',
      'Multi-site active/active',
      'Warm standby',
      'Pilot light with continuous replication'
    ),
    correct: ['a'],
    explanation: 'Backup and restore is the lowest-cost DR strategy and is appropriate when RTO and RPO can be measured in hours to a day. Multi-site, warm standby, and pilot light all run more resources continuously and cost more than this tolerance requires.',
    references: [REF_DR]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new application must provide low-latency reads and writes to the same data for users in three continents, with multi-Region resilience. Which database design should the solutions architect choose?',
    options: opts4(
      'Amazon DynamoDB global tables, replicating the table across the three Regions',
      'A single-Region DynamoDB table accessed from all continents',
      'A single Amazon RDS instance with cross-Region read replicas only',
      'An EC2-hosted database in one Region'
    ),
    correct: ['a'],
    explanation: 'DynamoDB global tables provide multi-active, multi-Region replication so each continent reads and writes locally with low latency and Regional resilience. A single-Region table adds cross-continent latency, read replicas cannot serve local writes, and a single EC2-hosted database is a Regional single point of failure.',
    references: [REF_DDB_GLOBAL, REF_DYNAMODB]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new platform lets team leads create IAM roles for their developers, but those roles must never be able to exceed a defined maximum set of permissions. Which IAM feature should the solutions architect use?',
    options: opts4(
      'Permissions boundaries attached to the roles the team leads create',
      'AdministratorAccess attached to every developer role',
      'A longer maximum session duration',
      'An access key rotation schedule'
    ),
    correct: ['a'],
    explanation: 'A permissions boundary caps the maximum permissions an IAM entity can have, so delegated role creation cannot exceed the boundary. Administrator access removes the cap, and session duration and key rotation do not limit permission scope.',
    references: [{ label: 'AWS Docs — Permissions boundaries for IAM entities', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html' }, REF_IAM]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new public web application must be protected against the OWASP Top 10 and common bot traffic with minimal rule-writing effort. Which approach should the solutions architect take?',
    options: opts4(
      'Attach AWS WAF with AWS Managed Rules rule groups to the application\'s CloudFront distribution or load balancer',
      'Write every protection rule from scratch in a network ACL',
      'Rely only on security groups',
      'Disable public access entirely so no protection is needed'
    ),
    correct: ['a'],
    explanation: 'AWS WAF with AWS Managed Rules provides maintained rule groups covering common threats (including OWASP Top 10 categories) and bot control, with minimal custom rule-writing. NACLs and security groups operate at Layer 3/4 and cannot inspect HTTP, and disabling public access defeats a public application.',
    references: [REF_WAF, REF_CLOUDFRONT]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new public web application served through Amazon CloudFront must use HTTPS with a managed, automatically renewed TLS certificate. Where should the solutions architect provision the certificate?',
    options: opts4(
      'In AWS Certificate Manager, in the us-east-1 Region for use with CloudFront',
      'On each EC2 origin instance, renewed manually',
      'In Amazon S3 as a certificate file',
      'In AWS Secrets Manager as the only storage'
    ),
    correct: ['a'],
    explanation: 'ACM provides managed, auto-renewing public TLS certificates; certificates used with CloudFront must be requested in us-east-1. Manually managed certificates on instances, certificate files in S3, and Secrets Manager storage do not integrate with CloudFront as managed TLS.',
    references: [REF_ACM, REF_CLOUDFRONT]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new solution must ingest a high-volume, continuous stream of clickstream events and let multiple consumers process the stream in real time. Which service should the solutions architect choose for ingestion?',
    options: opts4(
      'Amazon Kinesis Data Streams',
      'A single Amazon SQS standard queue read by one consumer',
      'Amazon S3 with hourly batch uploads',
      'Amazon RDS with frequent INSERT statements'
    ),
    correct: ['a'],
    explanation: 'Amazon Kinesis Data Streams is built for high-volume, real-time streaming ingestion and lets multiple consumers read the same stream independently. A single SQS consumer does not fan out for real-time stream processing, hourly S3 batches are not real time, and RDS is not a streaming platform.',
    references: [{ label: 'AWS Docs — What is Amazon Kinesis Data Streams?', url: 'https://docs.aws.amazon.com/streams/latest/dev/introduction.html' }, REF_SQS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new payment-processing system must guarantee that messages are processed exactly once and in the exact order they were sent. Which messaging option should the solutions architect choose?',
    options: opts4(
      'An Amazon SQS FIFO queue',
      'An Amazon SQS standard queue',
      'An Amazon SNS standard topic',
      'A CloudWatch Logs log group'
    ),
    correct: ['a'],
    explanation: 'An SQS FIFO queue provides strict ordering and exactly-once processing, required for ordered payment processing. SQS standard queues offer best-effort ordering and at-least-once delivery, SNS standard topics do not guarantee order, and a log group is not a message queue.',
    references: [REF_SQS]
  },
  {
    domain: D2, difficulty: 1, type: QType.SINGLE,
    stem: 'A new production Amazon RDS database must fail over automatically to a standby if its Availability Zone fails. Which configuration should the solutions architect choose?',
    options: opts4(
      'A Multi-AZ deployment',
      'A single-AZ instance with frequent snapshots',
      'A read replica in the same AZ',
      'Storage autoscaling only'
    ),
    correct: ['a'],
    explanation: 'A Multi-AZ deployment maintains a synchronous standby in another AZ and fails over automatically on an AZ or instance failure. Snapshots are backups, a same-AZ read replica adds no AZ resilience, and storage autoscaling only grows disk capacity.',
    references: [REF_RDS_MAZ]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new application\'s instances must complete a lengthy registration with an external system before the Auto Scaling group puts them into service. Which Auto Scaling feature should the solutions architect use?',
    options: opts4(
      'A lifecycle hook that holds the instance in a wait state until registration completes',
      'A shorter health check grace period',
      'A scheduled scaling action',
      'Termination protection on the instances'
    ),
    correct: ['a'],
    explanation: 'A lifecycle hook holds a launching instance in a wait state so custom actions — such as external registration — can complete before the instance enters service. A grace period only delays health checks, scheduled scaling controls timing of capacity changes, and termination protection prevents deletion.',
    references: [REF_ASG]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new application will store millions of objects in a single S3 bucket and perform a very high request rate. The solutions architect must design so request performance scales. Which statement is correct?',
    options: opts4(
      'Amazon S3 scales request rate automatically and to high levels across an increasing number of key prefixes, so spreading objects across prefixes helps very high request rates',
      'S3 buckets have a fixed, low request limit that cannot be exceeded',
      'A separate bucket must be created for every 100 objects',
      'S3 cannot serve more than one request per second per bucket'
    ),
    correct: ['a'],
    explanation: 'Amazon S3 automatically scales to a very high request rate, and that rate scales with the number of key prefixes, so spreading objects across prefixes supports extremely high request rates. S3 does not impose a fixed low per-bucket limit, and per-object or per-second restrictions of that kind do not exist.',
    references: [REF_S3]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new global website serves mostly static content from an S3 bucket to users worldwide. Which design provides low latency and offloads the origin?',
    options: opts4(
      'Serve the content through Amazon CloudFront with the S3 bucket as the origin',
      'Serve directly from the S3 bucket in one Region to all users',
      'Run a fleet of EC2 web servers in one Region',
      'Email the static files to users'
    ),
    correct: ['a'],
    explanation: 'CloudFront caches the static content at edge locations close to users, providing low latency globally and offloading requests from the S3 origin. Serving directly from one Region adds latency for distant users, an EC2 fleet adds cost and management, and emailing files is not a delivery design.',
    references: [REF_CLOUDFRONT, REF_S3]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A new application must store and query highly connected data — for example, social relationships and recommendations — using graph traversals. Which purpose-built database should the solutions architect select?',
    options: opts4(
      'Amazon Neptune',
      'Amazon RDS for PostgreSQL',
      'Amazon DynamoDB',
      'Amazon Redshift'
    ),
    correct: ['a'],
    explanation: 'Amazon Neptune is a managed graph database optimized for highly connected data and graph traversals such as social and recommendation queries. RDS is relational, DynamoDB is key-value, and Redshift is a data warehouse — none are graph-optimized.',
    references: [{ label: 'AWS Docs — What is Amazon Neptune?', url: 'https://docs.aws.amazon.com/neptune/latest/userguide/intro.html' }, REF_DYNAMODB]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new machine learning training workload requires hardware acceleration for large matrix computations. Which EC2 instance characteristic should the solutions architect select?',
    options: opts4(
      'A GPU-accelerated (accelerated computing) instance family',
      'A burstable T-family instance',
      'A storage-optimized instance family',
      'The smallest general-purpose instance available'
    ),
    correct: ['a'],
    explanation: 'GPU-accelerated (accelerated computing) instances provide the hardware acceleration suited to machine learning training. Burstable instances are for low, variable CPU, storage-optimized targets disk I/O, and a tiny general-purpose instance cannot handle ML training.',
    references: [REF_EC2]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new transactional database on Amazon EBS needs sustained, very high, consistent IOPS for a mission-critical workload. Which EBS volume type should the solutions architect specify?',
    options: opts4(
      'Provisioned IOPS SSD (io2 / io2 Block Express)',
      'Cold HDD (sc1)',
      'Throughput Optimized HDD (st1)',
      'A previous-generation magnetic volume'
    ),
    correct: ['a'],
    explanation: 'Provisioned IOPS SSD (io2 / io2 Block Express) delivers high, consistent IOPS and high durability for mission-critical, I/O-intensive databases. sc1 and st1 are HDD types optimized for sequential throughput and cost, and magnetic volumes are previous-generation.',
    references: [REF_EBS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new stateless web fleet must balance cost and resilience by using a mix of On-Demand and Spot capacity across several instance types in one Auto Scaling group. Which feature provides this?',
    options: opts4(
      'A mixed instances policy on the Auto Scaling group',
      'A single launch template pinned to one instance type and On-Demand only',
      'A cluster placement group',
      'A scheduled scaling action'
    ),
    correct: ['a'],
    explanation: 'A mixed instances policy lets one Auto Scaling group combine multiple instance types and both On-Demand and Spot purchase options, balancing cost and resilience. A single On-Demand instance type misses Spot savings and diversification, and placement groups and scheduled scaling do not mix purchase options.',
    references: [REF_ASG, REF_SPOT]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new data lake in Amazon S3 will hold objects whose access frequency is unknown and will change over time. The company wants automatic cost optimization with no operational effort. Which storage class should the solutions architect choose?',
    options: opts4(
      'S3 Intelligent-Tiering',
      'S3 Standard for all objects permanently',
      'S3 Glacier Deep Archive for all objects from creation',
      'S3 One Zone-IA for all objects'
    ),
    correct: ['a'],
    explanation: 'S3 Intelligent-Tiering automatically moves objects between access tiers as patterns change, optimizing cost with no operational effort and no retrieval fees for the frequent/infrequent tiers. S3 Standard never optimizes, Deep Archive blocks frequent access, and One Zone-IA reduces availability and is not access-adaptive.',
    references: [REF_S3_INTELLIGENT, REF_S3_LIFECYCLE]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A new order-processing component must keep working even if the downstream fulfillment service is temporarily unavailable, processing the backlog when it recovers. Which design should the solutions architect use?',
    options: opts4(
      'Buffer requests in an Amazon SQS queue and have the fulfillment service consume from it (for example, with AWS Lambda)',
      'Call the fulfillment service synchronously and fail the order if it is down',
      'Run order processing and fulfillment in one process',
      'Store orders only in memory on the order component'
    ),
    correct: ['a'],
    explanation: 'An SQS queue buffers requests so the order component keeps accepting orders while the fulfillment service is down, and the service drains the backlog on recovery (Lambda can consume the queue). Synchronous calls fail when the downstream is down, a single process couples the components, and in-memory storage loses data on failure.',
    references: [REF_SQS, REF_LAMBDA]
  },

  // ── Continuous Improvement for Existing Solutions (16) ──
  {
    domain: D3, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An existing environment requires an engineer to manually run a cleanup task every night. The solutions architect wants this fully automated and serverless. Which approach should they recommend?',
    options: opts4(
      'Use an Amazon EventBridge scheduled rule to invoke an AWS Lambda function that performs the cleanup',
      'Keep a dedicated EC2 instance running a crontab',
      'Ask the engineer to set a phone reminder',
      'Run the task manually but document it better'
    ),
    correct: ['a'],
    explanation: 'An EventBridge scheduled rule invoking a Lambda function provides fully serverless, automated scheduling with no servers to manage. A crontab on EC2 is self-managed, and reminders or better documentation still rely on manual effort.',
    references: [REF_EVENTBRIDGE, REF_LAMBDA]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An operations team only learns that an existing public endpoint is down when customers complain. The solutions architect wants proactive detection from the user perspective. Which improvement should they recommend?',
    options: opts4(
      'Add Amazon CloudWatch Synthetics canaries that probe the endpoint on a schedule and alarm on failures',
      'Wait for more customer complaints to confirm the issue',
      'Remove monitoring to reduce noise',
      'Check the endpoint manually once a week'
    ),
    correct: ['a'],
    explanation: 'CloudWatch Synthetics canaries continuously probe endpoints from the outside and alarm on failures, detecting outages before customers do. Waiting for complaints, removing monitoring, and weekly manual checks are all reactive or insufficient.',
    references: [REF_CW]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing application is released all-at-once, occasionally causing a customer-facing incident. The solutions architect wants to limit the blast radius of a bad release. Which deployment improvement should they recommend?',
    options: opts4(
      'Adopt a canary deployment that shifts a small percentage of traffic first, monitors, then completes the rollout',
      'Continue all-at-once but deploy more often',
      'Deploy only on weekends with no other change',
      'Disable monitoring during deployments'
    ),
    correct: ['a'],
    explanation: 'A canary deployment exposes a small percentage of traffic to the new version first and completes the rollout only if it is healthy, limiting blast radius. Frequent all-at-once deploys still risk full incidents, weekend timing alone does not reduce blast radius, and disabling monitoring hides failures.',
    references: [REF_CODEDEPLOY]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A security improvement review finds that an existing application uses long-lived IAM user access keys on EC2 instances. What should the solutions architect recommend?',
    options: opts4(
      'Replace the access keys with an IAM role attached to the EC2 instances, providing automatically rotated temporary credentials',
      'Rotate the access keys once a year and keep using them',
      'Store the access keys in a public S3 bucket for convenience',
      'Embed the access keys in the application code'
    ),
    correct: ['a'],
    explanation: 'Attaching an IAM role to the instances provides automatically rotated temporary credentials and removes the long-lived keys entirely — the recommended improvement. Yearly rotation still leaves long-lived keys, and public storage or embedding keys in code are serious risks.',
    references: [REF_IAM_ROLES, REF_IAM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A compliance team must continuously evaluate an existing multi-account environment against a defined set of AWS Config rules deployed as one consistent package. Which AWS Config feature should the solutions architect use?',
    options: opts4(
      'AWS Config conformance packs',
      'A single standalone Config rule',
      'A CloudWatch dashboard',
      'An IAM permissions boundary'
    ),
    correct: ['a'],
    explanation: 'A conformance pack bundles AWS Config rules and remediation actions into a single package that can be deployed consistently across an organization. A standalone rule is not a framework, a dashboard does not evaluate compliance, and a permissions boundary limits IAM permissions.',
    references: [REF_CONFIG]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing TCP-based gaming application has a global user base and inconsistent performance over the public internet. Which improvement should the solutions architect recommend?',
    options: opts4(
      'Add AWS Global Accelerator to route traffic over the AWS global network with static anycast IPs',
      'Add Amazon CloudFront with a long cache TTL',
      'Move the servers to a single larger instance',
      'Add a second NAT gateway'
    ),
    correct: ['a'],
    explanation: 'AWS Global Accelerator routes non-cacheable TCP/UDP traffic over the AWS global network with static anycast IPs, improving and stabilizing global performance. CloudFront is for cacheable content, a larger instance does not fix internet path quality, and a NAT gateway is unrelated.',
    references: [REF_GA]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing application repeatedly issues identical, expensive DynamoDB read requests for hot items, and read latency must improve. Which improvement should the solutions architect recommend?',
    options: opts4(
      'Add Amazon DynamoDB Accelerator (DAX) as an in-memory cache in front of the table',
      'Move the table to a smaller capacity setting',
      'Add a second internet gateway',
      'Disable point-in-time recovery on the table'
    ),
    correct: ['a'],
    explanation: 'DynamoDB Accelerator (DAX) is an in-memory cache that serves repeated reads with microsecond latency, offloading the table. Reducing capacity worsens performance, a NAT/internet gateway is unrelated, and disabling PITR removes recoverability without helping latency.',
    references: [{ label: 'AWS Docs — In-memory acceleration with DynamoDB Accelerator (DAX)', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html' }, REF_DYNAMODB]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An existing Multi-AZ Application Load Balancer sends uneven traffic because one AZ has more registered targets than another. Which setting should the solutions architect enable to even out the distribution?',
    options: opts4(
      'Cross-zone load balancing',
      'Sticky sessions',
      'A longer idle timeout',
      'Deletion protection'
    ),
    correct: ['a'],
    explanation: 'Cross-zone load balancing distributes traffic evenly across all registered targets in all AZs, instead of splitting evenly per AZ first. Sticky sessions pin clients to targets, idle timeout governs connection lifetime, and deletion protection prevents accidental deletion.',
    references: [REF_ELB]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'An existing Amazon Aurora cluster\'s reader endpoint is overloaded during unpredictable reporting peaks. The solutions architect wants the number of read replicas to adjust automatically with load. Which improvement should they recommend?',
    options: opts4(
      'Enable Aurora Auto Scaling for Aurora Replicas based on a target metric',
      'Manually add replicas each morning',
      'Increase only the writer instance size',
      'Disable the reader endpoint'
    ),
    correct: ['a'],
    explanation: 'Aurora Auto Scaling adds and removes Aurora Replicas automatically to keep a target metric within range, matching read capacity to unpredictable load. Manual changes are not elastic, scaling only the writer adds no read capacity, and disabling the reader endpoint removes read scaling.',
    references: [REF_AURORA, REF_RDS_REPLICA]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A cost review must identify which existing EC2 instances and EBS volumes are over-provisioned, based on actual utilization, and get specific rightsizing recommendations. Which service should the solutions architect use?',
    options: opts4(
      'AWS Compute Optimizer',
      'Amazon CloudFront',
      'AWS WAF',
      'Amazon SNS'
    ),
    correct: ['a'],
    explanation: 'AWS Compute Optimizer analyzes utilization metrics and recommends optimal instance and volume configurations for rightsizing. CloudFront, WAF, and SNS are not rightsizing tools.',
    references: [REF_COMPUTE_OPT]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A finance team wants to be alerted automatically when an existing environment\'s spend deviates from its normal pattern, without maintaining fixed thresholds. Which service should the solutions architect recommend?',
    options: opts4(
      'AWS Cost Anomaly Detection',
      'Amazon Inspector',
      'AWS CloudTrail',
      'Amazon Route 53'
    ),
    correct: ['a'],
    explanation: 'AWS Cost Anomaly Detection uses machine learning to learn normal spend and alerts on anomalies without fixed thresholds. Inspector scans for vulnerabilities, CloudTrail records API activity, and Route 53 is DNS.',
    references: [{ label: 'AWS Docs — Detecting unusual spend with AWS Cost Anomaly Detection', url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/getting-started-ad.html' }, REF_COST_EXPLORER]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing workload has run On-Demand at a stable level for 14 months. The solutions architect wants the deepest, lowest-risk cost reduction and flexibility across instance families. Which option should they recommend?',
    options: opts4(
      'Purchase a Compute Savings Plan to cover the steady usage',
      'Move the steady workload to Spot Instances',
      'Switch the workload to a burstable instance family',
      'Take no action because On-Demand is always cheapest'
    ),
    correct: ['a'],
    explanation: 'A Compute Savings Plan provides a strong discount for committed steady usage and applies flexibly across instance families, sizes, Regions, Fargate, and Lambda. Spot is unsuitable for a stable production baseline, burstable instances suit variable low CPU, and On-Demand is not the cheapest for steady usage.',
    references: [REF_SAVINGS_PLANS]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing environment has configuration drift because resources are changed manually outside of any standard. The solutions architect wants to detect and report non-compliant configurations continuously. Which service should they use?',
    options: opts4(
      'AWS Config, recording resource configurations and evaluating them against rules',
      'Amazon CloudWatch dashboards',
      'AWS Budgets',
      'Amazon CloudFront'
    ),
    correct: ['a'],
    explanation: 'AWS Config records resource configurations over time and continuously evaluates them against rules, flagging non-compliant resources. Dashboards visualize metrics, Budgets track cost, and CloudFront is a CDN.',
    references: [REF_CONFIG]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A security review must identify IAM roles in an existing account that have not been used for a long time so they can be removed. Which capability helps find them?',
    options: opts4(
      'IAM Access Analyzer unused access findings and IAM last-accessed information',
      'Amazon GuardDuty threat findings',
      'AWS Cost Explorer',
      'VPC Flow Logs'
    ),
    correct: ['a'],
    explanation: 'IAM Access Analyzer surfaces unused access findings (including unused roles), and IAM last-accessed data shows recency of use, guiding cleanup toward least privilege. GuardDuty detects threats, Cost Explorer analyzes spend, and Flow Logs cover network traffic.',
    references: [REF_IAM_ANALYZER, REF_IAM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing application\'s database is the performance bottleneck because read-heavy reporting competes with transactional traffic. Which improvement should the solutions architect recommend first?',
    options: opts4(
      'Add read replicas and direct the reporting reads to them',
      'Disable backups to reduce database load',
      'Move the database to a smaller instance',
      'Delete the reporting workload'
    ),
    correct: ['a'],
    explanation: 'Read replicas offload read-heavy reporting from the primary so transactional traffic is no longer starved. Disabling backups creates risk, downsizing worsens performance, and deleting the reporting workload removes business value.',
    references: [REF_RDS_REPLICA, REF_RDS]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to validate that an existing application actually recovers from component failures as designed, by deliberately injecting faults in a controlled experiment. Which AWS service supports this?',
    options: opts4(
      'AWS Fault Injection Service (AWS FIS), to run controlled fault-injection experiments',
      'Amazon CloudFront',
      'AWS Cost Explorer',
      'Amazon SNS'
    ),
    correct: ['a'],
    explanation: 'AWS Fault Injection Service runs controlled chaos-engineering experiments — injecting faults such as instance termination or latency — to verify that recovery mechanisms work. CloudFront, Cost Explorer, and SNS do not perform fault injection.',
    references: [{ label: 'AWS Docs — What is AWS Fault Injection Service?', url: 'https://docs.aws.amazon.com/fis/latest/userguide/what-is.html' }, REF_DR]
  },

  // ── Accelerate Workload Migration and Modernization (13) ──
  {
    domain: D4, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A company wants to move existing VMware workloads to AWS quickly with minimal changes by extending its VMware environment into AWS, planning to optimize them later. Which of the 7 Rs strategies does this represent?',
    options: opts4(
      'Relocate — move workloads (for example, VMware-based) to AWS without conversion or re-architecture',
      'Refactor — fully re-architect the applications first',
      'Retire — decommission the workloads',
      'Repurchase — replace them with a SaaS product'
    ),
    correct: ['a'],
    explanation: 'Relocate moves workloads such as VMware-based VMs to AWS without converting or re-architecting them, enabling a fast migration with later optimization. Refactor re-architects, retire decommissions, and repurchase swaps in a different product.',
    references: [REF_7RS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company must build a prioritized inventory of on-premises applications and plan migration waves with dependency information. Which AWS service centralizes this assessment and tracking?',
    options: opts4(
      'AWS Migration Hub',
      'Amazon CloudWatch',
      'AWS WAF',
      'Amazon SNS'
    ),
    correct: ['a'],
    explanation: 'AWS Migration Hub provides a single place to discover, assess, plan, and track application migrations across tools and accounts, supporting wave planning. CloudWatch monitors metrics, WAF filters web traffic, and SNS sends notifications.',
    references: [REF_MIGRATION_HUB, REF_DISCOVERY]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'A company is migrating a 10 TB Microsoft SQL Server database to Amazon Aurora PostgreSQL and must minimize downtime during cutover. Which combination of tools should the solutions architect use?',
    options: opts4(
      'AWS Schema Conversion Tool to convert the schema, and AWS DMS with change data capture to migrate and keep data in sync until cutover',
      'AWS DataSync to convert and migrate the database',
      'AWS Snowball to convert the SQL Server schema',
      'A manual backup and restore on cutover day with no tooling'
    ),
    correct: ['a'],
    explanation: 'For a heterogeneous migration (SQL Server to Aurora PostgreSQL), AWS SCT converts the schema and code, and AWS DMS with change data capture migrates the data and keeps it synchronized until a low-downtime cutover. DataSync and Snowball do not convert schemas, and a manual cutover causes extended downtime.',
    references: [REF_SCT, REF_DMS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company with sufficient bandwidth must continuously synchronize an on-premises NFS file share to Amazon EFS during a phased migration, with scheduling and integrity verification. Which service should the solutions architect use?',
    options: opts4(
      'AWS DataSync',
      'AWS Snowball Edge',
      'Amazon CloudFront',
      'A manual copy on cutover day'
    ),
    correct: ['a'],
    explanation: 'AWS DataSync automates and accelerates online transfers between on-premises NFS/SMB storage and AWS services such as EFS, with scheduling, incremental sync, and integrity verification. Snowball is for offline bulk transfer, CloudFront is a CDN, and a single manual copy lacks ongoing sync.',
    references: [REF_DATASYNC, REF_EFS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'After migration, external partners must continue to upload files using SFTP, and the company wants no SFTP servers to operate. The files must land in Amazon S3. Which service should the solutions architect use?',
    options: opts4(
      'AWS Transfer Family, providing managed SFTP endpoints backed by Amazon S3',
      'A self-managed SFTP server on EC2',
      'AWS DataSync configured as an SFTP server',
      'Amazon CloudFront with SFTP support'
    ),
    correct: ['a'],
    explanation: 'AWS Transfer Family provides fully managed SFTP (and FTPS/FTP) endpoints that store transferred files directly in Amazon S3 or EFS, with no servers to operate. A self-managed EC2 SFTP server is operational overhead, and DataSync and CloudFront do not provide managed SFTP endpoints for partners.',
    references: [REF_TRANSFER, REF_S3]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company must move a 600 TB media archive to Amazon S3 from a facility where transferring it online would take far too long. Which service should the solutions architect recommend?',
    options: opts4(
      'AWS Snowball (AWS Snow Family) for offline bulk transfer',
      'AWS DataSync over the existing internet link',
      'Amazon S3 Transfer Acceleration over the existing internet link',
      'AWS Transfer Family over SFTP'
    ),
    correct: ['a'],
    explanation: 'When the data volume makes online transfer impractical, the Snow Family physically ships the data to AWS. DataSync, S3 Transfer Acceleration, and Transfer Family all still depend on the slow online link.',
    references: [REF_SNOW]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A migrated batch job runs for about 20 minutes a few times per day and is event-triggered. The company wants to eliminate idle compute cost and server management. Which target should the solutions architect recommend?',
    options: opts4(
      'AWS Lambda, invoked per job (or AWS Fargate for tasks exceeding Lambda limits)',
      'An always-on EC2 instance sized for the peak',
      'An EC2 Auto Scaling group with a minimum of two instances',
      'A continuously running Amazon EMR cluster'
    ),
    correct: ['a'],
    explanation: 'For short, sporadic, event-triggered jobs, Lambda runs only when invoked with no idle cost (Fargate is the serverless option when a job exceeds Lambda\'s limits). An always-on instance, a minimum-size Auto Scaling group, and a continuous EMR cluster all incur idle cost.',
    references: [REF_LAMBDA, REF_FARGATE]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company already runs Kubernetes on-premises and wants to migrate to AWS while keeping the Kubernetes API and tooling, with AWS managing the control plane. Which service should the solutions architect recommend?',
    options: opts4(
      'Amazon Elastic Kubernetes Service (Amazon EKS)',
      'AWS Lambda',
      'Amazon Elastic Beanstalk',
      'Amazon EC2 with a manually installed orchestration tool'
    ),
    correct: ['a'],
    explanation: 'Amazon EKS runs the upstream Kubernetes API with an AWS-managed control plane, letting a Kubernetes shop keep its API and tooling. Lambda is for functions, Elastic Beanstalk is a PaaS, and a manually installed orchestrator on EC2 reintroduces the management burden.',
    references: [REF_EKS]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'A modernization effort targets a relational database whose traffic is intermittent with long idle periods. The company wants database capacity and cost to scale automatically with demand. Which option should the solutions architect recommend?',
    options: opts4(
      'Amazon Aurora Serverless v2',
      'A peak-sized provisioned Amazon RDS instance running 24x7',
      'A self-managed database on a large EC2 instance',
      'Amazon Redshift provisioned for continuous use'
    ),
    correct: ['a'],
    explanation: 'Aurora Serverless v2 scales database capacity automatically with demand, including down for idle periods, avoiding paying for peak capacity continuously. A peak-sized provisioned instance and a large EC2 host waste money when idle, and Redshift is a data warehouse.',
    references: [REF_AURORA_SERVERLESS, REF_AURORA]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A monolithic application is being modernized into independent services that must coordinate a multi-step business process with retries and error handling, without managing orchestration servers. Which service should the solutions architect introduce?',
    options: opts4(
      'AWS Step Functions to orchestrate the workflow across the services',
      'A single shared database table polled by every service',
      'Synchronous chained API calls between all services',
      'One large EC2 instance running the whole process'
    ),
    correct: ['a'],
    explanation: 'AWS Step Functions orchestrates multi-step workflows across decoupled services with built-in retries and error handling, serverlessly. Table polling is inefficient, synchronous chained calls couple the services and propagate failures, and one big instance recreates a monolith.',
    references: [REF_STEPFUNCTIONS]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'A company is modernizing an on-premises data warehouse. It wants to store raw data cheaply and run ad hoc SQL analysis without managing servers. Which combination should the solutions architect recommend?',
    options: opts4(
      'Store the data in Amazon S3 and query it in place with Amazon Athena',
      'Keep the data on a single large EC2 instance with a local database',
      'Load all data into Amazon ElastiCache',
      'Store the data only in Amazon SQS'
    ),
    correct: ['a'],
    explanation: 'Storing raw data in Amazon S3 and querying it in place with serverless Amazon Athena provides cheap storage and ad hoc SQL analysis with no servers to manage. A single EC2 instance does not scale, ElastiCache is an in-memory cache, and SQS is a message queue, not analytical storage.',
    references: [{ label: 'AWS Docs — What is Amazon Athena?', url: 'https://docs.aws.amazon.com/athena/latest/ug/what-is.html' }, REF_S3]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'During a migration, a company must replace on-premises physical tape backups but keep its existing backup software, which expects a tape interface. Which AWS service provides a drop-in replacement?',
    options: opts4(
      'AWS Storage Gateway Tape Gateway, presenting a virtual tape library backed by Amazon S3 and S3 Glacier',
      'Amazon EFS mounted by the backup software',
      'Amazon DynamoDB as the backup target',
      'Amazon CloudFront as a tape cache'
    ),
    correct: ['a'],
    explanation: 'AWS Storage Gateway Tape Gateway presents a virtual tape library that existing backup software can use unchanged, storing virtual tapes durably in Amazon S3 and archiving to S3 Glacier classes. EFS, DynamoDB, and CloudFront do not present a tape interface.',
    references: [REF_STORAGE_GATEWAY, REF_S3]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company is migrating a Windows file server that requires Active Directory integration and SMB access for Windows clients. Which AWS service should the solutions architect select as the target?',
    options: opts4(
      'Amazon FSx for Windows File Server',
      'Amazon EFS',
      'Amazon S3 with static website hosting',
      'An Amazon EBS volume attached to one EC2 instance'
    ),
    correct: ['a'],
    explanation: 'Amazon FSx for Windows File Server provides fully managed Windows-native SMB file shares with Active Directory integration, matching the source requirements. EFS is NFS for Linux, S3 website hosting serves static content, and a single EBS volume is not a shared SMB file service.',
    references: [REF_FSX]
  }
];

const SAP_C02_DOMAINS = [
  { name: D1, weight: 26 },
  { name: D2, weight: 29 },
  { name: D3, weight: 25 },
  { name: D4, weight: 20 }
];

const SAP_C02_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'aws-sap-c02-p1',
    code: 'SAP-C02-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 180-minute, 65-question, blueprint-weighted set covering designing solutions for organizational complexity, designing for new solutions, continuous improvement for existing solutions, and accelerating workload migration and modernization.',
    questions: P1
  },
  {
    slug: 'aws-sap-c02-p2',
    code: 'SAP-C02-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 180-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'aws-sap-c02-p3',
    code: 'SAP-C02-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 180-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const SAP_C02_BUNDLE = {
  slug: 'aws-sap-c02',
  title: 'AWS Certified Solutions Architect — Professional (SAP-C02)',
  description: 'All 3 SAP-C02 practice exams in one bundle — 195 curated questions covering designing solutions for organizational complexity (multi-account architecture, hybrid and multi-VPC networking, cross-account security, disaster recovery, cost optimization); designing for new solutions (deployment strategies, business continuity, reliability, performance, security, cost); continuous improvement for existing solutions (operational excellence, security, performance, reliability, cost); and accelerating workload migration and modernization (the 7 Rs, migration tooling, re-architecture, and modernization to serverless and containers). Aligned to the official AWS Certified Solutions Architect - Professional (SAP-C02) exam guide.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 30000 // USD 300 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the SAP-C02 bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:sap-c02-seed'` are deleted and re-created.
 */
export async function seedSapC02(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'aws' } });
  await db.vendor.upsert({
    where: { slug: 'aws' },
    update: {},
    create: { slug: 'aws', name: 'Amazon Web Services', description: 'Cloud certifications from AWS.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'aws' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of SAP_C02_EXAMS) {
    const title = `AWS Certified Solutions Architect — Professional (SAP-C02) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official AWS SAP-C02 exam guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 180,
      passingScore: 75,
      questionCount: e.questions.length,
      domains: SAP_C02_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:sap-c02-seed' } });
    let teaserCount = 0;
    for (const q of e.questions) {
      await db.question.create({
        data: {
          examId: exam.id,
          domain: q.domain,
          difficulty: q.difficulty,
          type: q.type,
          stem: q.stem,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          references: q.references,
          status: QStatus.PUBLISHED,
          generatedBy: 'manual:sap-c02-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: SAP_C02_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: SAP_C02_BUNDLE.slug },
    update: {
      title: SAP_C02_BUNDLE.title,
      description: SAP_C02_BUNDLE.description,
      price: SAP_C02_BUNDLE.price,
      priceVoucher: SAP_C02_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: SAP_C02_BUNDLE.slug,
      title: SAP_C02_BUNDLE.title,
      description: SAP_C02_BUNDLE.description,
      price: SAP_C02_BUNDLE.price,
      priceVoucher: SAP_C02_BUNDLE.priceVoucher,
      published: true
    }
  });

  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'aws-sap-c02-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'aws-sap-c02-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'aws-sap-c02-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'aws-sap-c02-p1', tier: 'VOUCHER' as const, position: 4 }
  ];
  for (const it of items) {
    await db.bundleItem.create({
      data: { bundleId: bundle.id, examId: examIds[it.examSlug], tier: it.tier, position: it.position }
    });
  }

  return {
    vendor: existingVendor ? 'updated' : 'created',
    exams: examResults,
    bundle: existingBundle ? 'updated' : 'created'
  };
}
