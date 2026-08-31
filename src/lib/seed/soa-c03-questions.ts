/**
 * SOA-C03 bundle seed — vendor (AWS), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:soa-c03-seed'` and upserts catalog rows.
 *
 * Exported as `seedSoaC03(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/soa-c03.ts`) and the protected
 * admin API (`/api/admin/seed-soa-c03`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public AWS documentation and
 * the AWS Certified CloudOps Engineer - Associate (SOA-C03) exam guide:
 *
 *   - Monitoring, Logging, Analysis, Remediation, Performance   22% (14/variant)
 *   - Reliability and Business Continuity                       22% (14/variant)
 *   - Deployment, Provisioning, and Automation                  22% (15/variant)
 *   - Security and Compliance                                   16% (10/variant)
 *   - Networking and Content Delivery                           18% (12/variant)
 *
 * These are original practice scenarios. They are NOT real exam items and
 * make no claim of being official or actual SOA-C03 questions.
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

const D1 = 'Monitoring, Logging, Analysis, Remediation, and Performance Optimization';
const D2 = 'Reliability and Business Continuity';
const D3 = 'Deployment, Provisioning, and Automation';
const D4 = 'Security and Compliance';
const D5 = 'Networking and Content Delivery';

// ── Monitoring / logging ──
const REF_CW = { label: 'AWS Docs — What is Amazon CloudWatch?', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html' };
const REF_CW_AGENT = { label: 'AWS Docs — Collect metrics and logs with the CloudWatch agent', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html' };
const REF_CW_ALARM = { label: 'AWS Docs — Using Amazon CloudWatch alarms', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html' };
const REF_CW_COMPOSITE = { label: 'AWS Docs — Create a composite alarm', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Create_Composite_Alarm.html' };
const REF_CW_DASH = { label: 'AWS Docs — Using Amazon CloudWatch dashboards', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html' };
const REF_CW_CROSS = { label: 'AWS Docs — Cross-account cross-Region CloudWatch console', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Cross-Account-Cross-Region.html' };
const REF_CW_LOGS = { label: 'AWS Docs — Searching and filtering log data (metric filters)', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html' };
const REF_CW_DETAILED = { label: 'AWS Docs — Enable or turn off detailed monitoring for your instances', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-cloudwatch-new.html' };
const REF_CW_RECOVER = { label: 'AWS Docs — Create alarms to stop, terminate, reboot, or recover an instance', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/UsingAlarmActions.html' };
const REF_CLOUDTRAIL = { label: 'AWS Docs — What is AWS CloudTrail?', url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html' };
const REF_EVENTBRIDGE = { label: 'AWS Docs — What is Amazon EventBridge?', url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html' };
const REF_SNS = { label: 'AWS Docs — What is Amazon SNS?', url: 'https://docs.aws.amazon.com/sns/latest/dg/welcome.html' };
const REF_COMPUTE_OPT = { label: 'AWS Docs — What is AWS Compute Optimizer?', url: 'https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html' };

// ── Systems Manager / automation ──
const REF_SSM = { label: 'AWS Docs — What is AWS Systems Manager?', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html' };
const REF_SSM_AUTO = { label: 'AWS Docs — AWS Systems Manager Automation', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-automation.html' };
const REF_SSM_PATCH = { label: 'AWS Docs — AWS Systems Manager Patch Manager', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/patch-manager.html' };
const REF_SSM_STATE = { label: 'AWS Docs — AWS Systems Manager State Manager', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-state.html' };
const REF_SSM_MW = { label: 'AWS Docs — AWS Systems Manager Maintenance Windows', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-maintenance.html' };

// ── Compute / storage / database ──
const REF_EBS = { label: 'AWS Docs — Amazon EBS volume types', url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html' };
const REF_EBS_SNAP = { label: 'AWS Docs — Amazon EBS snapshots', url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html' };
const REF_S3 = { label: 'AWS Docs — What is Amazon S3?', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html' };
const REF_S3_ACCEL = { label: 'AWS Docs — Amazon S3 Transfer Acceleration', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration.html' };
const REF_S3_MULTIPART = { label: 'AWS Docs — Uploading and copying objects using multipart upload', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html' };
const REF_S3_VERSIONING = { label: 'AWS Docs — Using versioning in S3 buckets', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html' };
const REF_DATASYNC = { label: 'AWS Docs — What is AWS DataSync?', url: 'https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html' };
const REF_EFS = { label: 'AWS Docs — What is Amazon EFS?', url: 'https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html' };
const REF_EFS_LIFECYCLE = { label: 'AWS Docs — Amazon EFS lifecycle management', url: 'https://docs.aws.amazon.com/efs/latest/ug/lifecycle-management-efs.html' };
const REF_RDS = { label: 'AWS Docs — What is Amazon RDS?', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html' };
const REF_RDS_PI = { label: 'AWS Docs — Monitoring DB load with Performance Insights', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.html' };
const REF_RDS_PROXY = { label: 'AWS Docs — Using Amazon RDS Proxy', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html' };
const REF_RDS_MAZ = { label: 'AWS Docs — Multi-AZ deployments for high availability', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html' };
const REF_RDS_REPLICA = { label: 'AWS Docs — Working with read replicas', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html' };
const REF_RDS_PITR = { label: 'AWS Docs — Restoring a DB instance to a specified time', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIT.html' };
const REF_EC2 = { label: 'AWS Docs — What is Amazon EC2?', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html' };
const REF_EC2_PLACEMENT = { label: 'AWS Docs — Placement groups', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-groups.html' };
const REF_ELASTICACHE = { label: 'AWS Docs — What is Amazon ElastiCache?', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html' };
const REF_DYNAMODB_AS = { label: 'AWS Docs — Managing throughput capacity with DynamoDB auto scaling', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/AutoScaling.html' };

// ── Reliability / scaling / backup ──
const REF_ASG = { label: 'AWS Docs — What is Amazon EC2 Auto Scaling?', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html' };
const REF_ASG_TARGET = { label: 'AWS Docs — Target tracking scaling policies', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html' };
const REF_ELB = { label: 'AWS Docs — What is Elastic Load Balancing?', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html' };
const REF_ELB_HEALTH = { label: 'AWS Docs — Target group health checks for your Application Load Balancer', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html' };
const REF_R53_HEALTH = { label: 'AWS Docs — How Amazon Route 53 checks the health of your resources', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html' };
const REF_BACKUP = { label: 'AWS Docs — What is AWS Backup?', url: 'https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html' };
const REF_DR = { label: 'AWS Docs — Disaster recovery options in the cloud', url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html' };
const REF_CLOUDFRONT = { label: 'AWS Docs — What is Amazon CloudFront?', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html' };

// ── Deployment / provisioning ──
const REF_CFN = { label: 'AWS Docs — What is AWS CloudFormation?', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html' };
const REF_CFN_STACKSETS = { label: 'AWS Docs — Working with AWS CloudFormation StackSets', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html' };
const REF_CFN_DRIFT = { label: 'AWS Docs — Detecting unmanaged configuration changes (drift)', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-drift.html' };
const REF_CFN_CHANGESET = { label: 'AWS Docs — Updating stacks using change sets', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html' };
const REF_CFN_NESTED = { label: 'AWS Docs — Working with nested stacks', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-nested-stacks.html' };
const REF_CFN_ROLLBACK = { label: 'AWS Docs — Continue rolling back an update for a stack', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-continueupdaterollback.html' };
const REF_CDK = { label: 'AWS Docs — What is the AWS CDK?', url: 'https://docs.aws.amazon.com/cdk/v2/guide/home.html' };
const REF_IMAGE_BUILDER = { label: 'AWS Docs — What is EC2 Image Builder?', url: 'https://docs.aws.amazon.com/imagebuilder/latest/userguide/what-is-image-builder.html' };
const REF_RAM = { label: 'AWS Docs — What is AWS Resource Access Manager?', url: 'https://docs.aws.amazon.com/ram/latest/userguide/what-is.html' };
const REF_LAMBDA = { label: 'AWS Docs — What is AWS Lambda?', url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html' };
const REF_S3_EVENTS = { label: 'AWS Docs — Amazon S3 Event Notifications', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html' };
const REF_CODEDEPLOY = { label: 'AWS Docs — Deployment strategies and configurations in CodeDeploy', url: 'https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html' };
const REF_VPC_SUBNET = { label: 'AWS Docs — Subnets for your VPC', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html' };

// ── Security / compliance ──
const REF_IAM = { label: 'AWS Docs — What is IAM?', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html' };
const REF_IAM_ROLE_EC2 = { label: 'AWS Docs — Using an IAM role to grant permissions to applications on EC2', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html' };
const REF_IAM_MFA = { label: 'AWS Docs — Using multi-factor authentication (MFA) in AWS', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html' };
const REF_IAM_ANALYZER = { label: 'AWS Docs — What is IAM Access Analyzer?', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html' };
const REF_IAM_SIM = { label: 'AWS Docs — Testing IAM policies with the IAM policy simulator', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html' };
const REF_ORG_SCP = { label: 'AWS Docs — Service control policies (SCPs)', url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html' };
const REF_KMS = { label: 'AWS Docs — What is AWS KMS?', url: 'https://docs.aws.amazon.com/kms/latest/developerguide/overview.html' };
const REF_ACM = { label: 'AWS Docs — What is AWS Certificate Manager?', url: 'https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html' };
const REF_SECRETS = { label: 'AWS Docs — What is AWS Secrets Manager?', url: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html' };
const REF_GUARDDUTY = { label: 'AWS Docs — What is Amazon GuardDuty?', url: 'https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html' };
const REF_CONFIG = { label: 'AWS Docs — What is AWS Config?', url: 'https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html' };
const REF_SECURITYHUB = { label: 'AWS Docs — What is AWS Security Hub?', url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html' };
const REF_INSPECTOR = { label: 'AWS Docs — What is Amazon Inspector?', url: 'https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html' };
const REF_TRUSTED_ADVISOR = { label: 'AWS Docs — AWS Trusted Advisor', url: 'https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html' };

// ── Networking ──
const REF_VPC = { label: 'AWS Docs — What is Amazon VPC?', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html' };
const REF_SG = { label: 'AWS Docs — Control traffic to resources using security groups', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html' };
const REF_NACL = { label: 'AWS Docs — Control traffic to subnets using network ACLs', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html' };
const REF_NAT = { label: 'AWS Docs — NAT gateways', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html' };
const REF_VPC_ENDPOINT = { label: 'AWS Docs — Gateway endpoints for Amazon S3', url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html' };
const REF_PRIVATELINK = { label: 'AWS Docs — What is AWS PrivateLink?', url: 'https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html' };
const REF_R53 = { label: 'AWS Docs — What is Amazon Route 53?', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html' };
const REF_R53_ROUTING = { label: 'AWS Docs — Choosing a routing policy', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html' };
const REF_R53_RESOLVER = { label: 'AWS Docs — What is Route 53 Resolver?', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html' };
const REF_FLOW_LOGS = { label: 'AWS Docs — Logging IP traffic using VPC Flow Logs', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html' };
const REF_TGW = { label: 'AWS Docs — What is a transit gateway?', url: 'https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html' };
const REF_PEERING = { label: 'AWS Docs — What is VPC peering?', url: 'https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html' };
const REF_GA = { label: 'AWS Docs — What is AWS Global Accelerator?', url: 'https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html' };
const REF_WAF = { label: 'AWS Docs — What is AWS WAF?', url: 'https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html' };
const REF_SHIELD = { label: 'AWS Docs — AWS Shield', url: 'https://docs.aws.amazon.com/waf/latest/developerguide/shield-chapter.html' };
const REF_CF_INVALIDATION = { label: 'AWS Docs — Invalidating files in CloudFront', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html' };
const REF_DX = { label: 'AWS Docs — What is AWS Direct Connect?', url: 'https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html' };

// ── Additional references (P2 / P3) ──
const REF_CW_INSIGHTS = { label: 'AWS Docs — Analyzing log data with CloudWatch Logs Insights', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html' };
const REF_CW_ANOMALY = { label: 'AWS Docs — Using CloudWatch anomaly detection', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Anomaly_Detection.html' };
const REF_CW_SUBSCRIPTION = { label: 'AWS Docs — Real-time processing of log data with subscriptions', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html' };
const REF_CW_METRIC_MATH = { label: 'AWS Docs — Using metric math', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html' };
const REF_CW_NETMON = { label: 'AWS Docs — Amazon CloudWatch Network Monitor', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/what-is-network-monitor.html' };
const REF_DDB_GLOBAL = { label: 'AWS Docs — Global tables: multi-Region replication for DynamoDB', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html' };
const REF_AURORA = { label: 'AWS Docs — Amazon Aurora DB clusters', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.html' };
const REF_AURORA_AS = { label: 'AWS Docs — Using Amazon Aurora Auto Scaling with Aurora replicas', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Integrating.AutoScaling.html' };
const REF_S3_CRR = { label: 'AWS Docs — Replicating objects with S3 Replication', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html' };
const REF_S3_CLASSES = { label: 'AWS Docs — Understanding and managing Amazon S3 storage classes', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html' };
const REF_EBS_FSR = { label: 'AWS Docs — Amazon EBS fast snapshot restore', url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-fast-snapshot-restore.html' };
const REF_SSM_RUN = { label: 'AWS Docs — AWS Systems Manager Run Command', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/run-command.html' };
const REF_SSM_PARAM = { label: 'AWS Docs — AWS Systems Manager Parameter Store', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html' };
const REF_EB_SCHEDULER = { label: 'AWS Docs — What is Amazon EventBridge Scheduler?', url: 'https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html' };
const REF_IAM_IC = { label: 'AWS Docs — What is IAM Identity Center?', url: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html' };
const REF_IAM_BOUNDARY = { label: 'AWS Docs — Permissions boundaries for IAM entities', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html' };
const REF_S3_POLICY = { label: 'AWS Docs — Bucket policies for Amazon S3', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html' };
const REF_KMS_ROTATION = { label: 'AWS Docs — Rotating AWS KMS keys', url: 'https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html' };
const REF_MACIE = { label: 'AWS Docs — What is Amazon Macie?', url: 'https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html' };
const REF_CONFIG_REMEDIATION = { label: 'AWS Docs — Remediating noncompliant resources with AWS Config rules', url: 'https://docs.aws.amazon.com/config/latest/developerguide/remediation.html' };
const REF_CF_OAC = { label: 'AWS Docs — Restricting access to an S3 origin with origin access control', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html' };
const REF_ELB_LOGS = { label: 'AWS Docs — Access logs for your Application Load Balancer', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html' };
const REF_ELB_DRAIN = { label: 'AWS Docs — Deregistration delay (connection draining)', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html' };
const REF_ELB_XZONE = { label: 'AWS Docs — Cross-zone load balancing', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html' };
const REF_NETWORK_FIREWALL = { label: 'AWS Docs — What is AWS Network Firewall?', url: 'https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html' };
const REF_DNS_FIREWALL = { label: 'AWS Docs — Route 53 Resolver DNS Firewall', url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver-dns-firewall.html' };
const REF_ASG_SCHEDULED = { label: 'AWS Docs — Scheduled scaling for Amazon EC2 Auto Scaling', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-scheduled-scaling.html' };
const REF_ASG_HEALTH = { label: 'AWS Docs — Health checks for instances in an Auto Scaling group', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-health-checks.html' };
const REF_ASG_STEP = { label: 'AWS Docs — Step and simple scaling policies for Amazon EC2 Auto Scaling', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-simple-step.html' };
const REF_CFN_DELETION = { label: 'AWS Docs — DeletionPolicy attribute', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-deletionpolicy.html' };
const REF_CFN_CAPABILITIES = { label: 'AWS Docs — Acknowledging IAM resources in CloudFormation templates', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-template.html' };
const REF_CFN_STACKPOLICY = { label: 'AWS Docs — Prevent updates to stack resources with a stack policy', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/protect-stack-resources.html' };
const REF_CFN_EXPORTS = { label: 'AWS Docs — Referencing resources across stacks with exports', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/walkthrough-crossstackref.html' };
const REF_CFN_INIT = { label: 'AWS Docs — Bootstrapping applications with cfn-init', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/deploying.applications.html' };
const REF_ELASTICACHE_MAZ = { label: 'AWS Docs — Minimizing downtime in ElastiCache with Multi-AZ', url: 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/AutoFailover.html' };
const REF_RDS_BACKUP = { label: 'AWS Docs — Working with backups in Amazon RDS', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html' };

// ── Additional references (P3) ──
const REF_CW_SYNTHETICS = { label: 'AWS Docs — Using synthetic monitoring (CloudWatch Synthetics canaries)', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html' };
const REF_CW_STREAMS = { label: 'AWS Docs — Using metric streams', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Metric-Streams.html' };
const REF_CW_LOGS_RETENTION = { label: 'AWS Docs — Change log data retention in CloudWatch Logs', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html' };
const REF_CT_INTEGRITY = { label: 'AWS Docs — Validating CloudTrail log file integrity', url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html' };
const REF_CT_DATA_EVENTS = { label: 'AWS Docs — Logging data events with CloudTrail', url: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html' };
const REF_EB_ARCHIVE = { label: 'AWS Docs — Archiving and replaying EventBridge events', url: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-archive.html' };
const REF_ASG_LIFECYCLE = { label: 'AWS Docs — Amazon EC2 Auto Scaling lifecycle hooks', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html' };
const REF_ASG_WARMPOOL = { label: 'AWS Docs — Warm pools for Amazon EC2 Auto Scaling', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-warm-pools.html' };
const REF_ASG_REFRESH = { label: 'AWS Docs — Use an instance refresh to update instances in an Auto Scaling group', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/asg-instance-refresh.html' };
const REF_ELB_STICKY = { label: 'AWS Docs — Sticky sessions for your Application Load Balancer', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html' };
const REF_DDB_PITR = { label: 'AWS Docs — Point-in-time recovery for DynamoDB', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/PointInTimeRecovery.html' };
const REF_BACKUP_VAULTLOCK = { label: 'AWS Docs — AWS Backup Vault Lock', url: 'https://docs.aws.amazon.com/aws-backup/latest/devguide/vault-lock.html' };
const REF_S3_OBJECTLOCK = { label: 'AWS Docs — Using S3 Object Lock', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html' };
const REF_AURORA_GLOBAL = { label: 'AWS Docs — Amazon Aurora global databases', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html' };
const REF_RDS_STORAGE_AS = { label: 'AWS Docs — Managing capacity automatically with RDS storage autoscaling', url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIOPS.StorageTypes.html' };
const REF_EC2_BURST = { label: 'AWS Docs — Burstable performance instances', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances.html' };
const REF_CFN_CUSTOM = { label: 'AWS Docs — Custom resources in CloudFormation', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html' };
const REF_CFN_CONDITIONS = { label: 'AWS Docs — Conditions in CloudFormation templates', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/conditions-section-structure.html' };
const REF_CFN_ROLLBACK_TRIGGER = { label: 'AWS Docs — Monitor and roll back stack operations with rollback triggers', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-rollback-triggers.html' };
const REF_CFN_SERVICEROLE = { label: 'AWS Docs — AWS CloudFormation service role', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-servicerole.html' };
const REF_SSM_DISTRIBUTOR = { label: 'AWS Docs — AWS Systems Manager Distributor', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/distributor.html' };
const REF_REACHABILITY = { label: 'AWS Docs — What is Reachability Analyzer?', url: 'https://docs.aws.amazon.com/vpc/latest/reachability/what-is-reachability-analyzer.html' };
const REF_EIGW = { label: 'AWS Docs — Enable outbound IPv6 traffic using an egress-only internet gateway', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/egress-only-internet-gateway.html' };
const REF_ARC = { label: 'AWS Docs — Amazon Route 53 Application Recovery Controller', url: 'https://docs.aws.amazon.com/r53recovery/latest/dg/what-is-route53-recovery.html' };
const REF_KMS_MRK = { label: 'AWS Docs — Multi-Region keys in AWS KMS', url: 'https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html' };
const REF_CONFIG_PACKS = { label: 'AWS Docs — Conformance packs in AWS Config', url: 'https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html' };
const REF_CF_CACHE = { label: 'AWS Docs — Controlling the cache key with cache policies in CloudFront', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html' };
const REF_CF_ORIGIN_FAILOVER = { label: 'AWS Docs — Optimizing high availability with CloudFront origin failover', url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/high_availability_origin_failover.html' };
const REF_S3_STORAGE_LENS = { label: 'AWS Docs — Assessing storage activity and usage with S3 Storage Lens', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage_lens.html' };
const REF_ORG_TAG_POLICY = { label: 'AWS Docs — Tag policies in AWS Organizations', url: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_tag-policies.html' };
const REF_IAM_EVAL = { label: 'AWS Docs — Policy evaluation logic', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html' };
const REF_VPC_DNS = { label: 'AWS Docs — DNS attributes for your VPC', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html' };
const REF_DX_GATEWAY = { label: 'AWS Docs — AWS Direct Connect gateways', url: 'https://docs.aws.amazon.com/directconnect/latest/UserGuide/direct-connect-gateways-intro.html' };
const REF_SSM_PATCH_BASELINE = { label: 'AWS Docs — About patch baselines in Patch Manager', url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/about-patch-baselines.html' };

// Helpers to build option arrays with ids 'a','b','c',('d','e').
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const opts5 = (a: string, b: string, c: string, d: string, e: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }, { id: 'e', text: e }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Monitoring, Logging, Analysis, Remediation, Performance (14) ──
  {
    domain: D1, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A CloudOps engineer needs memory utilization and disk space metrics for a fleet of Amazon EC2 Linux instances in CloudWatch. The default EC2 metrics do not include these. What is the correct way to collect them?',
    options: opts4(
      'Install and configure the CloudWatch agent on the instances to publish memory and disk metrics',
      'Enable EC2 detailed monitoring to add memory and disk metrics',
      'Enable VPC Flow Logs on the instances',
      'Memory and disk metrics are always available; just create a dashboard'
    ),
    correct: ['a'],
    explanation: 'Memory and disk utilization are guest-OS metrics that the hypervisor cannot see, so EC2 does not publish them by default. The CloudWatch agent runs inside the instance and publishes them as custom metrics. Detailed monitoring only changes the EC2 metric frequency to 1 minute — it does not add memory/disk metrics.',
    references: [REF_CW_AGENT, REF_CW]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'An application writes "ERROR" lines to a CloudWatch Logs log group. The team wants an alarm to fire when more than 5 errors occur within 5 minutes. What should the CloudOps engineer configure?',
    options: opts4(
      'A metric filter on the log group that increments a custom metric, with a CloudWatch alarm on that metric',
      'A CloudWatch alarm directly on the log group',
      'CloudTrail data events for the log group',
      'A subscription filter that streams the logs to Amazon S3'
    ),
    correct: ['a'],
    explanation: 'CloudWatch alarms act on metrics, not raw logs. A metric filter scans incoming log events for the "ERROR" pattern and increments a custom metric, which an alarm can then watch. You cannot alarm directly on a log group, and a subscription filter only delivers logs elsewhere.',
    references: [REF_CW_LOGS, REF_CW_ALARM]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'On-call engineers are paged dozens of times during a deployment because individual CPU, memory, and latency alarms all fire at once. They want a single notification only when the service is genuinely unhealthy. What should be implemented?',
    options: opts4(
      'A composite alarm that combines the existing metric alarms with a rule expression and notifies once',
      'Increase the evaluation period on every individual alarm',
      'Delete the metric alarms and rely on CloudWatch dashboards',
      'Move all alarms to a different AWS Region'
    ),
    correct: ['a'],
    explanation: 'A composite alarm uses a rule expression over other alarms (for example, ALARM(cpu) AND ALARM(latency)) and sends one notification based on the combined state, reducing alarm noise. Lengthening evaluation periods does not reduce the number of separate alarms; dashboards do not page anyone.',
    references: [REF_CW_COMPOSITE, REF_CW_ALARM]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps team manages workloads across three AWS accounts and two Regions. They want a single CloudWatch dashboard that displays metrics and alarms from all of them. What is the recommended approach?',
    options: opts4(
      'Use CloudWatch cross-account observability to create a monitoring account and build a cross-account, cross-Region dashboard',
      'Manually screenshot each account dashboard and combine them',
      'CloudWatch dashboards can only ever show one account and one Region',
      'Copy all metric data into a single account with the AWS CLI every hour'
    ),
    correct: ['a'],
    explanation: 'CloudWatch cross-account observability lets a designated monitoring account view metrics, logs, and alarms from linked source accounts, and dashboards support a cross-Region view. There is no need to copy metric data manually.',
    references: [REF_CW_CROSS, REF_CW_DASH]
  },
  {
    domain: D1, difficulty: 1, type: QType.SINGLE,
    stem: 'A CloudWatch alarm should email the operations team whenever it enters the ALARM state. What must the alarm action target?',
    options: opts4(
      'An Amazon SNS topic that the operations team is subscribed to',
      'An Amazon S3 bucket',
      'A CloudWatch Logs log group',
      'An EC2 security group'
    ),
    correct: ['a'],
    explanation: 'CloudWatch alarm notification actions publish to an Amazon SNS topic; subscribers (email, SMS, etc.) receive the message. S3 buckets and log groups are not valid alarm notification targets.',
    references: [REF_CW_ALARM, REF_SNS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A security review asks "who deleted the production S3 bucket policy and when?" Which AWS service provides the answer?',
    options: opts4(
      'AWS CloudTrail, which records management API calls including the identity, time, and source IP',
      'Amazon CloudWatch metrics',
      'VPC Flow Logs',
      'AWS Trusted Advisor'
    ),
    correct: ['a'],
    explanation: 'CloudTrail records management-event API calls (such as DeleteBucketPolicy) with the caller identity, timestamp, and source IP, which is exactly what an audit question needs. CloudWatch metrics are numeric time series; Flow Logs cover IP traffic; Trusted Advisor gives best-practice checks.',
    references: [REF_CLOUDTRAIL]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'When an Amazon EC2 instance is launched, the CloudOps team wants an automated process to immediately tag it and register it with a configuration database. Which service should route the EC2 state-change event to that automation?',
    options: opts4(
      'Amazon EventBridge, with a rule that matches the EC2 instance state-change event and targets the automation',
      'Amazon CloudWatch dashboards',
      'AWS CloudTrail Insights',
      'Amazon SNS email subscriptions'
    ),
    correct: ['a'],
    explanation: 'EventBridge receives the EC2 "instance state-change" event and an event rule can match it and invoke a target (Lambda function, SSM Automation, etc.). Dashboards and SNS email do not route events to automation; CloudTrail Insights only detects unusual API activity.',
    references: [REF_EVENTBRIDGE]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudOps engineer wants a repeatable, auditable procedure to restart a stuck application service and clear a temp directory on EC2 instances on demand, without using SSH. Which approach fits best?',
    options: opts4(
      'Create a Systems Manager Automation runbook that runs the documented remediation steps',
      'Store a shell script in Amazon S3 and ask engineers to download and run it manually',
      'Open SSH on the security group and have each engineer log in',
      'Reboot the whole instance from the EC2 console every time'
    ),
    correct: ['a'],
    explanation: 'A Systems Manager Automation runbook codifies multi-step remediation as a versioned, permission-controlled, auditable document that can run without SSH. Manual scripts and SSH access are neither repeatable nor auditable, and a full reboot is more disruptive than needed.',
    references: [REF_SSM_AUTO, REF_SSM]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A single EC2 instance occasionally fails its system status check because of an underlying host problem. The CloudOps team wants it to recover automatically. What should they configure?',
    options: opts4(
      'A CloudWatch alarm on the StatusCheckFailed_System metric with an EC2 recover action',
      'A CloudWatch alarm with an EC2 terminate action',
      'An Auto Scaling group with a desired capacity of zero',
      'A composite alarm with no actions'
    ),
    correct: ['a'],
    explanation: 'A recover action migrates the instance to new underlying hardware while keeping its instance ID, private IP, and EBS volumes — appropriate for a system status check failure. Terminating the instance would destroy it; a desired capacity of zero removes capacity; an alarm with no actions does nothing.',
    references: [REF_CW_RECOVER, REF_CW_ALARM]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'An application on a General Purpose SSD (gp2) EBS volume needs consistently higher IOPS and throughput, but the team wants to avoid paying for provisioned IOPS io2. What is the most cost-effective change?',
    options: opts4(
      'Migrate the volume to gp3, which lets you provision IOPS and throughput independently of size at a lower cost',
      'Migrate the volume to a Throughput Optimized HDD (st1) volume',
      'Increase the gp2 volume size to several terabytes purely to gain IOPS',
      'Move the data to an instance store volume'
    ),
    correct: ['a'],
    explanation: 'gp3 lets you set IOPS and throughput separately from capacity and is cheaper than gp2 for the same performance — you no longer have to oversize the volume to buy IOPS. st1 is HDD-based and poor for random IOPS; instance store is ephemeral and unsuitable for persistent data.',
    references: [REF_EBS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'Users worldwide upload large files to a single S3 bucket and report slow uploads from distant Regions. Which feature most directly improves long-distance upload speed?',
    options: opts4(
      'Enable S3 Transfer Acceleration so uploads route over the CloudFront edge network to the bucket',
      'Enable S3 Versioning on the bucket',
      'Switch the bucket to the S3 Glacier Deep Archive storage class',
      'Enable S3 Server Access Logging'
    ),
    correct: ['a'],
    explanation: 'S3 Transfer Acceleration routes uploads through nearby CloudFront edge locations and over the optimized AWS backbone, which speeds long-distance transfers. Versioning and access logging do not affect speed, and Glacier Deep Archive is an archival class that would make uploads slower to retrieve.',
    references: [REF_S3_ACCEL, REF_S3]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'An Amazon RDS for PostgreSQL database is slow during business hours. The CloudOps engineer needs to identify which SQL statements and wait events are driving database load. Which tool should they use?',
    options: opts4(
      'Amazon RDS Performance Insights, which visualizes DB load by wait event and top SQL',
      'VPC Flow Logs for the database subnet',
      'AWS Trusted Advisor cost checks',
      'Amazon S3 Storage Lens'
    ),
    correct: ['a'],
    explanation: 'Performance Insights shows database load broken down by wait events and top SQL statements, pinpointing bottlenecks. Flow Logs cover network traffic, Trusted Advisor covers account best practices, and S3 Storage Lens covers object storage — none analyze SQL load.',
    references: [REF_RDS_PI, REF_RDS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'Finance asks the CloudOps team to reduce EC2 spend by identifying over-provisioned instances based on actual CPU, memory, and network usage. Which AWS service produces rightsizing recommendations?',
    options: opts4(
      'AWS Compute Optimizer',
      'AWS CloudFormation drift detection',
      'Amazon EventBridge Scheduler',
      'AWS Resource Access Manager'
    ),
    correct: ['a'],
    explanation: 'AWS Compute Optimizer analyzes utilization metrics and recommends optimal instance types/sizes for EC2 (and other resources). CloudFormation drift detection finds config changes, EventBridge Scheduler runs scheduled tasks, and RAM shares resources — none produce rightsizing recommendations.',
    references: [REF_COMPUTE_OPT]
  },
  {
    domain: D1, difficulty: 3, type: QType.MULTI,
    stem: 'Select TWO true statements about Amazon CloudWatch metric resolution and EC2 monitoring.',
    options: opts5(
      'By default, EC2 sends metrics to CloudWatch every 5 minutes (basic monitoring)',
      'Enabling EC2 detailed monitoring sends metrics every 1 minute',
      'Detailed monitoring adds guest-OS memory utilization to EC2 metrics',
      'Basic monitoring sends EC2 metrics every 10 seconds',
      'High-resolution custom metrics are not supported by CloudWatch'
    ),
    correct: ['a', 'b'],
    explanation: 'Basic monitoring publishes EC2 metrics every 5 minutes; detailed monitoring publishes every 1 minute. Detailed monitoring does NOT add memory metrics (that needs the CloudWatch agent), basic monitoring is 5 minutes not 10 seconds, and CloudWatch does support high-resolution custom metrics down to 1 second.',
    references: [REF_CW_DETAILED, REF_CW]
  },

  // ── Reliability and Business Continuity (14) ──
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'An Auto Scaling group behind an Application Load Balancer should keep average CPU utilization near 50%. Which scaling policy type meets this goal with the least configuration?',
    options: opts4(
      'A target tracking scaling policy with the Average CPU Utilization metric set to 50%',
      'A scheduled scaling action that runs every hour',
      'A step scaling policy with ten manually defined steps',
      'A manual change to desired capacity each morning'
    ),
    correct: ['a'],
    explanation: 'Target tracking scaling adjusts capacity automatically to keep a chosen metric at a target value (CPU at 50%), and it manages the underlying alarms for you. Scheduled scaling is time-based, step scaling needs manual thresholds, and manual changes do not respond to load.',
    references: [REF_ASG_TARGET, REF_ASG]
  },
  {
    domain: D2, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A web tier must survive the loss of an entire Availability Zone with no manual intervention. How should the CloudOps engineer configure the Auto Scaling group and load balancer?',
    options: opts4(
      'Span the Auto Scaling group and load balancer across multiple Availability Zones in the Region',
      'Place all instances in a single Availability Zone for lower latency',
      'Use a larger instance type in one Availability Zone',
      'Disable health checks so instances are never replaced'
    ),
    correct: ['a'],
    explanation: 'Spreading the Auto Scaling group and load balancer across multiple AZs means an AZ failure leaves healthy capacity in the others, and Auto Scaling relaunches capacity. A single AZ is a single point of failure; a bigger instance does not add AZ resilience; disabling health checks removes self-healing.',
    references: [REF_ASG, REF_ELB]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A read-heavy application repeatedly runs the same expensive database query, raising RDS load. The CloudOps engineer wants to reduce database pressure with minimal application change. What should they add?',
    options: opts4(
      'An Amazon ElastiCache cluster to cache frequent query results in memory',
      'A second NAT gateway',
      'An additional CloudWatch alarm',
      'S3 Transfer Acceleration'
    ),
    correct: ['a'],
    explanation: 'ElastiCache (Redis or Memcached) caches frequently requested results in memory, serving repeat reads without hitting the database and improving scalability. NAT gateways, alarms, and Transfer Acceleration do not offload database reads.',
    references: [REF_ELASTICACHE]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A globally accessed website serves mostly static assets. The origin servers are overloaded by repeated requests for the same files. Which change reduces origin load and improves global performance?',
    options: opts4(
      'Put Amazon CloudFront in front of the origin so cached content is served from edge locations',
      'Move the origin to a larger EBS volume',
      'Enable S3 Versioning on the origin bucket',
      'Switch the origin instances to a placement group'
    ),
    correct: ['a'],
    explanation: 'CloudFront caches static content at edge locations close to users, so most requests are served from the edge and never reach the origin, reducing load and latency. A larger EBS volume, versioning, and placement groups do not offload repeated requests.',
    references: [REF_CLOUDFRONT]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A DynamoDB table has unpredictable, spiky traffic and the team does not want to manage capacity or risk throttling. Which configuration is most appropriate?',
    options: opts4(
      'Use the DynamoDB on-demand capacity mode',
      'Use provisioned capacity with fixed low values and no auto scaling',
      'Use provisioned capacity sized for the historical peak at all times',
      'Disable point-in-time recovery to save cost'
    ),
    correct: ['a'],
    explanation: 'On-demand capacity automatically accommodates spiky, unpredictable traffic without capacity planning and without throttling for sudden spikes. Fixed low provisioned capacity throttles during spikes; sizing permanently for peak wastes money; PITR is unrelated to throughput.',
    references: [REF_DYNAMODB_AS]
  },
  {
    domain: D2, difficulty: 1, type: QType.SINGLE,
    stem: 'A production Amazon RDS database must automatically fail over to a standby if the primary or its Availability Zone fails. Which RDS feature provides this?',
    options: opts4(
      'A Multi-AZ deployment',
      'A single read replica in the same AZ',
      'Manual snapshots taken nightly',
      'Storage Auto Scaling'
    ),
    correct: ['a'],
    explanation: 'A Multi-AZ deployment maintains a synchronous standby in another AZ and fails over automatically when the primary fails. A read replica is for scaling reads (and is not an automatic failover target for the same engine setup), snapshots are point-in-time backups, and storage auto scaling only grows disk.',
    references: [REF_RDS_MAZ]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A company runs active web servers in us-east-1 and a standby set in us-west-2. If the primary Region becomes unhealthy, traffic must shift automatically to the standby. Which Route 53 configuration achieves this?',
    options: opts4(
      'Failover routing with health checks on the primary endpoint',
      'Simple routing with a single record',
      'A weighted routing policy split 50/50',
      'A multivalue answer policy with no health checks'
    ),
    correct: ['a'],
    explanation: 'Failover routing pairs a primary and secondary record; when the health check on the primary fails, Route 53 returns the secondary. Simple routing has no failover, an even weighted split sends traffic to both at all times, and multivalue without health checks does not detect failure.',
    references: [REF_R53_HEALTH, REF_R53_ROUTING]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'Instances behind an Application Load Balancer are running but the target group shows them as unhealthy and the ALB returns HTTP 502/503. What should the CloudOps engineer check first?',
    options: opts4(
      'That the target group health check path and port are correct and the instance security group allows the ALB health check traffic',
      'That the instances have public IP addresses',
      'That CloudFront is enabled on the account',
      'That the instances use the latest generation CPU'
    ),
    correct: ['a'],
    explanation: 'A target shows unhealthy when health checks fail — commonly a wrong health check path/port, the app not listening, or a security group that does not allow the ALB to reach the health check port. Public IPs are not required behind an ALB, and CloudFront and CPU generation are unrelated.',
    references: [REF_ELB_HEALTH, REF_SG]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A reporting workload generates heavy read queries that slow the primary Amazon RDS database used by the application. The CloudOps engineer wants to offload those reads. What should they implement?',
    options: opts4(
      'Create one or more RDS read replicas and point the reporting workload at them',
      'Convert the database to a Multi-AZ deployment and query the standby',
      'Take a snapshot and query the snapshot directly',
      'Increase the primary instance size and keep all reads on it'
    ),
    correct: ['a'],
    explanation: 'Read replicas serve read-only traffic, offloading reporting queries from the primary. The Multi-AZ standby is not readable for query traffic, you cannot query a snapshot directly, and simply scaling up still concentrates all load on one instance.',
    references: [REF_RDS_REPLICA, REF_RDS_MAZ]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A company must centrally schedule and enforce backups for EC2, EBS, RDS, DynamoDB, and EFS, with retention rules and compliance reporting. Which service is purpose-built for this?',
    options: opts4(
      'AWS Backup, using a backup plan with backup rules and resource assignments',
      'A cron job on a single EC2 instance that calls the AWS CLI',
      'S3 Lifecycle policies',
      'CloudWatch dashboards'
    ),
    correct: ['a'],
    explanation: 'AWS Backup centrally manages and automates backups across many services using backup plans (schedules, retention, lifecycle) with audit reporting. A self-managed cron job is fragile and not centralized, S3 Lifecycle only manages S3 objects, and dashboards do not perform backups.',
    references: [REF_BACKUP]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs automated daily Amazon EBS snapshots with a 30-day retention period, applied to all volumes tagged Backup=true. Which is the simplest managed way to do this?',
    options: opts4(
      'Use AWS Backup (or Amazon Data Lifecycle Manager) with a policy that targets the Backup=true tag and retains snapshots for 30 days',
      'Manually create snapshots each day from the console',
      'Copy the volumes to S3 with the AWS CLI',
      'Enable S3 Versioning'
    ),
    correct: ['a'],
    explanation: 'AWS Backup and Amazon Data Lifecycle Manager both automate tag-based EBS snapshot creation and retention/expiration. Manual snapshots are error-prone, EBS volumes are not copied to S3 as a backup workflow, and S3 Versioning applies to S3 objects, not EBS volumes.',
    references: [REF_BACKUP, REF_EBS_SNAP]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'After an accidental bad data load, the team must restore an Amazon RDS database to its exact state 10 minutes before the load, with an RPO of about 5 minutes. Which restore method should be used?',
    options: opts4(
      'Perform a point-in-time restore to a new DB instance at the chosen timestamp',
      'Restore the most recent nightly manual snapshot',
      'Reboot the DB instance with failover',
      'Promote a read replica to a standalone instance'
    ),
    correct: ['a'],
    explanation: 'Point-in-time restore uses automated backups and transaction logs to recreate the database at any second within the retention window — ideal for an RPO of minutes. A nightly snapshot could lose many hours of data, a reboot does not undo data changes, and promoting a replica keeps the bad data.',
    references: [REF_RDS_PITR, REF_RDS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'An S3 bucket holds critical files that are sometimes overwritten or deleted by mistake. The team wants to recover any previous version of an object. What should be enabled?',
    options: opts4(
      'S3 Versioning, which preserves previous versions and delete markers for recovery',
      'S3 Transfer Acceleration',
      'S3 Requester Pays',
      'S3 Static website hosting'
    ),
    correct: ['a'],
    explanation: 'With Versioning enabled, every overwrite creates a new version and a delete adds a delete marker, so prior versions remain recoverable. Transfer Acceleration speeds transfers, Requester Pays shifts cost, and static website hosting serves content — none protect against overwrites.',
    references: [REF_S3_VERSIONING]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A business requires a disaster recovery strategy with an RTO of a few minutes and an RPO of seconds, and is willing to pay for always-on standby capacity in a second Region. Which DR strategy fits?',
    options: opts4(
      'Warm standby (or multi-site active/active) with a scaled-down but always-running copy in the second Region',
      'Backup and restore only',
      'Pilot light with no running compute',
      'A single-Region deployment with nightly snapshots'
    ),
    correct: ['a'],
    explanation: 'Warm standby keeps a smaller, always-running copy of the workload in a second Region that scales up on failover, achieving an RTO of minutes and a low RPO. Backup-and-restore and pilot light have longer RTOs because compute must be provisioned/scaled, and a single-Region design provides no Regional DR.',
    references: [REF_DR]
  },

  // ── Deployment, Provisioning, and Automation (15) ──
  {
    domain: D3, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A CloudOps team must provision identical, repeatable network and compute stacks in several environments and track every change as code. Which AWS service should they use?',
    options: opts4(
      'AWS CloudFormation, defining the infrastructure as a template',
      'Manual creation in the AWS Management Console for each environment',
      'Amazon CloudWatch dashboards',
      'AWS Trusted Advisor'
    ),
    correct: ['a'],
    explanation: 'CloudFormation provisions infrastructure declaratively from a template, giving repeatable, version-controlled stacks across environments. Manual console work is not repeatable or easily auditable; dashboards and Trusted Advisor do not provision infrastructure.',
    references: [REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A baseline IAM role and AWS Config rule must be deployed identically into 40 accounts across an AWS Organization, in two Regions each. What is the most efficient mechanism?',
    options: opts4(
      'A CloudFormation StackSet that deploys the template to all target accounts and Regions',
      'Logging into all 40 accounts and creating the stack manually',
      'A single CloudFormation stack in the management account',
      'An AWS RAM resource share'
    ),
    correct: ['a'],
    explanation: 'CloudFormation StackSets deploy and manage a single template across many accounts and Regions from one operation, including organization-wide automatic deployment. A single stack only covers one account/Region, manual work does not scale to 40 accounts, and RAM shares existing resources rather than deploying templates.',
    references: [REF_CFN_STACKSETS, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants consistent, hardened, pre-patched Amazon EC2 AMIs produced on a schedule and tested before distribution. Which service automates this image pipeline?',
    options: opts4(
      'EC2 Image Builder',
      'AWS Config',
      'Amazon Inspector',
      'AWS Resource Access Manager'
    ),
    correct: ['a'],
    explanation: 'EC2 Image Builder automates building, hardening, testing, and distributing AMIs and container images on a defined pipeline and schedule. AWS Config tracks configuration, Inspector scans for vulnerabilities, and RAM shares resources — none build images.',
    references: [REF_IMAGE_BUILDER]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer suspects someone manually changed a security group that is managed by a CloudFormation stack. How can they confirm whether the live resources still match the template?',
    options: opts4(
      'Run CloudFormation drift detection on the stack',
      'Delete and recreate the stack',
      'Check Amazon CloudWatch metrics for the security group',
      'Enable S3 Versioning on the template bucket'
    ),
    correct: ['a'],
    explanation: 'Drift detection compares the stack\'s current resource configurations with the template/expected state and reports any resources that have drifted. Deleting the stack is destructive, CloudWatch metrics do not show config drift, and template bucket versioning does not detect resource drift.',
    references: [REF_CFN_DRIFT]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudFormation stack update fails partway through, and the stack is stuck in UPDATE_ROLLBACK_FAILED. What is the correct first action to get the stack back to a stable state?',
    options: opts4(
      'Fix the underlying cause (for example, a resource that cannot roll back) and then use ContinueUpdateRollback',
      'Immediately delete the stack and all of its resources',
      'Change the stack name and redeploy',
      'Disable rollback for all future stacks and ignore the state'
    ),
    correct: ['a'],
    explanation: 'UPDATE_ROLLBACK_FAILED means a resource could not roll back; you resolve the blocking issue (often by skipping or fixing that resource) and then call ContinueUpdateRollback to return the stack to UPDATE_ROLLBACK_COMPLETE. Deleting the stack is unnecessarily destructive and renaming does not fix the stuck stack.',
    references: [REF_CFN_ROLLBACK, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A central networking account owns VPC subnets that application accounts in the same AWS Organization need to launch resources into, without recreating the subnets. Which service enables this sharing?',
    options: opts4(
      'AWS Resource Access Manager (AWS RAM)',
      'AWS CloudFormation StackSets',
      'Amazon EventBridge',
      'AWS Config aggregators'
    ),
    correct: ['a'],
    explanation: 'AWS RAM lets an account share supported resources (such as VPC subnets, via VPC sharing) with other accounts in the organization, so they can use the same subnets. StackSets deploy templates, EventBridge routes events, and Config aggregators consolidate compliance data.',
    references: [REF_RAM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Before applying a change to a production CloudFormation stack, the team wants to preview exactly which resources will be added, modified, or replaced. What should they create?',
    options: opts4(
      'A change set, then review it before executing',
      'A brand-new stack with a different name',
      'A drift detection report',
      'An Amazon EventBridge rule'
    ),
    correct: ['a'],
    explanation: 'A change set shows the proposed changes — including resource replacements — before you execute them, reducing the risk of unexpected disruption. A new stack does not update the existing one, drift detection compares current state to the template, and EventBridge rules route events.',
    references: [REF_CFN_CHANGESET]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A fleet of EC2 instances must be patched monthly during a defined maintenance window, with patch compliance reporting. Which combination should the CloudOps engineer use?',
    options: opts4(
      'AWS Systems Manager Patch Manager with a patch baseline, run inside a Systems Manager Maintenance Window',
      'A Lambda function triggered by an S3 upload',
      'EC2 Image Builder only',
      'Manual yum/apt updates over SSH'
    ),
    correct: ['a'],
    explanation: 'Patch Manager applies patch baselines and reports compliance; running it inside a Maintenance Window restricts patching to an approved time. A Lambda S3 trigger is unrelated, Image Builder produces new AMIs rather than patching running fleets, and manual SSH patching lacks scheduling and compliance reporting.',
    references: [REF_SSM_PATCH, REF_SSM_MW]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps team wants every EC2 instance to continuously enforce a desired configuration (specific agents installed and a service running), and to be brought back into compliance automatically if it drifts. Which Systems Manager capability fits?',
    options: opts4(
      'Systems Manager State Manager, which applies and maintains a defined configuration on a schedule',
      'Systems Manager Session Manager',
      'Systems Manager Parameter Store',
      'Systems Manager Inventory'
    ),
    correct: ['a'],
    explanation: 'State Manager associates instances with a configuration document and reapplies it on a schedule, keeping instances in the desired state. Session Manager provides shell access, Parameter Store stores configuration data, and Inventory only collects metadata.',
    references: [REF_SSM_STATE, REF_SSM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'When an image is uploaded to an S3 bucket, a thumbnail must be generated automatically. Which event-driven design is correct?',
    options: opts4(
      'Configure an S3 Event Notification for object-created events that invokes an AWS Lambda function to create the thumbnail',
      'Run a Lambda function on a fixed 1-minute schedule to scan the bucket',
      'Have an EC2 instance poll the bucket continuously over SSH',
      'Enable S3 Versioning to generate thumbnails'
    ),
    correct: ['a'],
    explanation: 'S3 Event Notifications publish object-created events that can directly invoke a Lambda function, giving true event-driven processing with no polling. A 1-minute schedule adds latency and wasted runs, continuous EC2 polling is inefficient, and versioning does not process objects.',
    references: [REF_S3_EVENTS, REF_LAMBDA]
  },
  {
    domain: D3, difficulty: 3, type: QType.MULTI,
    stem: 'Select TWO valid ways to reduce the risk of an in-place CloudFormation or application update causing downtime.',
    options: opts5(
      'Use a CloudFormation change set to review changes before executing the update',
      'Use a blue/green deployment so the new version runs alongside the old before traffic shifts',
      'Disable stack rollback so failed updates are left in place',
      'Always delete the existing stack before applying any update',
      'Skip health checks during the deployment to make it finish faster'
    ),
    correct: ['a', 'b'],
    explanation: 'Change sets let you preview changes (including replacements) before executing, and blue/green deployments validate the new version before shifting traffic, both lowering downtime risk. Disabling rollback leaves broken updates in place, deleting the stack first guarantees an outage, and skipping health checks can route traffic to unhealthy targets.',
    references: [REF_CFN_CHANGESET, REF_CODEDEPLOY]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudFormation deployment fails because the new subnet CIDR overlaps an existing subnet in the VPC. What does this indicate and how is it resolved?',
    options: opts4(
      'A subnet sizing/addressing issue — choose a non-overlapping CIDR block within the VPC range and redeploy',
      'A KMS key permission issue — recreate the key',
      'A Route 53 health check failure — disable the health check',
      'An IAM trust policy error — widen the role trust to all principals'
    ),
    correct: ['a'],
    explanation: 'Subnet CIDRs within a VPC must not overlap and must fit inside the VPC CIDR; an overlap is a subnet sizing/addressing error fixed by selecting a free, correctly sized CIDR. The error has nothing to do with KMS keys, Route 53 health checks, or IAM trust policies.',
    references: [REF_VPC_SUBNET, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A company already uses Terraform for most infrastructure but wants to keep AWS-native value such as CloudFormation drift visibility for a few stacks. Which statement reflects a correct, supported approach?',
    options: opts4(
      'AWS supports using third-party IaC tools such as Terraform alongside AWS CloudFormation; teams can choose the tool per workload',
      'Terraform cannot manage any AWS resources',
      'Using Terraform automatically deletes all CloudFormation stacks',
      'CloudFormation must be disabled account-wide before Terraform can be used'
    ),
    correct: ['a'],
    explanation: 'Terraform and CloudFormation can both manage AWS resources, and many organizations use them side by side, choosing per workload. Terraform fully supports AWS, it does not delete CloudFormation stacks, and CloudFormation does not need to be disabled.',
    references: [REF_CFN, REF_CDK]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer wants to express infrastructure in TypeScript and have it synthesized into CloudFormation templates for deployment. Which AWS tool provides this?',
    options: opts4(
      'The AWS Cloud Development Kit (AWS CDK)',
      'AWS Systems Manager Inventory',
      'Amazon EventBridge Pipes',
      'AWS Config conformance packs'
    ),
    correct: ['a'],
    explanation: 'The AWS CDK lets you define infrastructure in general-purpose programming languages (including TypeScript) and synthesizes CloudFormation templates for deployment. SSM Inventory, EventBridge Pipes, and Config conformance packs are unrelated to authoring IaC.',
    references: [REF_CDK, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A large CloudFormation template has become hard to manage. The team wants to break reusable components (such as a standard VPC) into separate templates referenced by a parent stack. Which feature supports this?',
    options: opts4(
      'Nested stacks, where a parent stack references child stack templates as resources',
      'Stack policies',
      'Termination protection',
      'Pseudo parameters'
    ),
    correct: ['a'],
    explanation: 'Nested stacks let a parent stack include other stacks as resources, enabling reusable, modular components. Stack policies protect resources from updates, termination protection prevents deletion, and pseudo parameters are predefined values — none provide modular composition.',
    references: [REF_CFN_NESTED, REF_CFN]
  },

  // ── Security and Compliance (10) ──
  {
    domain: D4, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'An application on Amazon EC2 needs to read objects from an S3 bucket. What is the AWS-recommended way to grant this access?',
    options: opts4(
      'Attach an IAM role to the EC2 instance with a policy allowing the required S3 actions',
      'Store long-lived IAM user access keys in a file on the instance',
      'Embed the root user credentials in the application code',
      'Make the S3 bucket public'
    ),
    correct: ['a'],
    explanation: 'An IAM role attached via an instance profile supplies automatically rotated temporary credentials, with no long-lived secrets to store or leak. Hard-coded access keys and root credentials are security risks, and making the bucket public exposes data to everyone.',
    references: [REF_IAM_ROLE_EC2, REF_IAM]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A compliance rule requires that IAM users cannot perform sensitive actions unless they have authenticated with MFA. How can the CloudOps engineer enforce this?',
    options: opts4(
      'Add an IAM policy condition that requires aws:MultiFactorAuthPresent to be true for the sensitive actions',
      'Email users a reminder to enable MFA',
      'Enable detailed monitoring on the account',
      'Turn on S3 Versioning'
    ),
    correct: ['a'],
    explanation: 'An IAM policy condition keyed on aws:MultiFactorAuthPresent denies (or only allows) the actions unless the request was signed with MFA, which enforces the requirement technically. A reminder is not enforcement, and monitoring/versioning do not control authentication.',
    references: [REF_IAM_MFA, REF_IAM]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer must find which S3 buckets, IAM roles, or KMS keys in an account can be accessed from outside the account or organization. Which tool reports this?',
    options: opts4(
      'IAM Access Analyzer, which identifies resources shared with external principals',
      'Amazon CloudWatch Logs Insights',
      'AWS Cost Explorer',
      'Amazon Athena'
    ),
    correct: ['a'],
    explanation: 'IAM Access Analyzer evaluates resource-based policies and reports findings for resources that grant access to external principals. CloudWatch Logs Insights queries logs, Cost Explorer analyzes spend, and Athena queries data in S3 — none analyze external access.',
    references: [REF_IAM_ANALYZER]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'Before deploying a new IAM policy, a CloudOps engineer wants to confirm exactly which API actions it will allow or deny for a role, without affecting production. Which tool should they use?',
    options: opts4(
      'The IAM policy simulator',
      'AWS CloudTrail Lake',
      'Amazon Inspector',
      'AWS Trusted Advisor'
    ),
    correct: ['a'],
    explanation: 'The IAM policy simulator evaluates policies against specified actions and resources and shows whether each request would be allowed or denied — without making real calls. CloudTrail Lake queries past events, Inspector scans for vulnerabilities, and Trusted Advisor gives best-practice checks.',
    references: [REF_IAM_SIM, REF_IAM]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization must guarantee that no member account — regardless of its own IAM policies — can disable AWS CloudTrail or operate outside approved AWS Regions. Which control enforces this?',
    options: opts4(
      'Service control policies (SCPs) applied to organizational units in AWS Organizations',
      'An IAM permissions policy attached in each account',
      'A CloudWatch alarm in each account',
      'A security group rule'
    ),
    correct: ['a'],
    explanation: 'SCPs set the maximum available permissions for accounts in an OU; even an account admin cannot exceed them, so they can block stopping CloudTrail or using unapproved Regions. Per-account IAM policies can be changed by that account, alarms only notify, and security groups control network traffic.',
    references: [REF_ORG_SCP]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A compliance requirement states that all data on Amazon EBS volumes and in S3 buckets must be encrypted at rest with keys the company can audit and control. Which service should be used?',
    options: opts4(
      'AWS Key Management Service (AWS KMS) to create and manage the encryption keys',
      'AWS Certificate Manager (ACM)',
      'AWS Secrets Manager',
      'Amazon Macie'
    ),
    correct: ['a'],
    explanation: 'AWS KMS provides customer-managed keys for encryption at rest of EBS volumes, S3 objects, and many other services, with CloudTrail logging of key use for auditing. ACM manages TLS certificates (in transit), Secrets Manager stores secrets, and Macie discovers sensitive data.',
    references: [REF_KMS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A public-facing Application Load Balancer must serve HTTPS traffic with a managed, auto-renewing TLS certificate. Which service provides the certificate?',
    options: opts4(
      'AWS Certificate Manager (ACM), which provisions and automatically renews the certificate',
      'AWS KMS',
      'AWS Secrets Manager',
      'Amazon GuardDuty'
    ),
    correct: ['a'],
    explanation: 'ACM provisions public TLS certificates, integrates with load balancers and CloudFront, and renews eligible certificates automatically. KMS manages encryption keys, Secrets Manager stores secrets, and GuardDuty is a threat-detection service.',
    references: [REF_ACM]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'An application stores its database password in plaintext in an environment variable. The CloudOps team wants the password stored securely and rotated automatically. Which service should they use?',
    options: opts4(
      'AWS Secrets Manager, which stores the secret encrypted and supports automatic rotation',
      'Amazon S3 with a public bucket policy',
      'A CloudWatch Logs log group',
      'An EC2 user data script'
    ),
    correct: ['a'],
    explanation: 'Secrets Manager stores credentials encrypted, controls access with IAM, and can rotate database secrets automatically. A public S3 bucket exposes the secret, log groups are not secret stores, and user data is visible in instance metadata.',
    references: [REF_SECRETS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'The CloudOps team wants continuous threat detection that analyzes CloudTrail, VPC Flow Logs, and DNS logs to surface activity such as cryptocurrency mining or credential compromise. Which service provides this?',
    options: opts4(
      'Amazon GuardDuty',
      'AWS Config',
      'AWS CloudFormation',
      'Amazon EFS'
    ),
    correct: ['a'],
    explanation: 'GuardDuty continuously analyzes CloudTrail events, VPC Flow Logs, and DNS logs with threat intelligence and machine learning to detect malicious or unauthorized activity. AWS Config tracks resource configuration/compliance, CloudFormation provisions infrastructure, and EFS is a file system.',
    references: [REF_GUARDDUTY]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance team must continuously verify that every EBS volume is encrypted and be alerted on any non-compliant resource. Which service should the CloudOps engineer use?',
    options: opts4(
      'AWS Config with a managed rule such as encrypted-volumes, which evaluates resources continuously',
      'AWS Trusted Advisor cost optimization checks',
      'Amazon CloudWatch basic monitoring',
      'AWS Budgets'
    ),
    correct: ['a'],
    explanation: 'AWS Config records resource configurations and evaluates them against rules (for example, encrypted-volumes), continuously flagging non-compliant resources. Trusted Advisor cost checks, CloudWatch basic monitoring, and AWS Budgets do not perform configuration compliance evaluation.',
    references: [REF_CONFIG, REF_SECURITYHUB]
  },

  // ── Networking and Content Delivery (12) ──
  {
    domain: D5, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement correctly distinguishes a security group from a network ACL in an Amazon VPC?',
    options: opts4(
      'A security group is stateful and applied to an ENI; a network ACL is stateless and applied at the subnet boundary',
      'A security group is stateless; a network ACL is stateful',
      'Both are stateless and both are applied to subnets',
      'Both are stateful and both are applied to instances'
    ),
    correct: ['a'],
    explanation: 'Security groups operate at the instance/ENI level and are stateful — return traffic is automatically allowed. Network ACLs operate at the subnet level and are stateless — you must allow both inbound and the corresponding outbound (ephemeral) traffic explicitly.',
    references: [REF_SG, REF_NACL]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'EC2 instances in a private subnet must download operating system updates from the internet but must not be reachable from the internet. What should the CloudOps engineer deploy?',
    options: opts4(
      'A NAT gateway in a public subnet, with the private subnet route table sending 0.0.0.0/0 to the NAT gateway',
      'An internet gateway attached directly to the private subnet route table',
      'An egress-only internet gateway for IPv4 traffic',
      'A VPC peering connection to a public VPC'
    ),
    correct: ['a'],
    explanation: 'A NAT gateway allows outbound (and return) internet traffic for private instances while preventing unsolicited inbound connections. Routing the private subnet straight to an internet gateway would make instances internet-reachable, an egress-only internet gateway is IPv6-only, and VPC peering does not provide internet egress.',
    references: [REF_NAT, REF_VPC]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'Instances in a private subnet must reach Amazon S3 without their traffic traversing the public internet, and the company wants to avoid NAT gateway data processing charges for that traffic. What should be configured?',
    options: opts4(
      'A gateway VPC endpoint for Amazon S3, with the route added to the subnet route table',
      'A second NAT gateway',
      'An internet gateway',
      'A Route 53 private hosted zone'
    ),
    correct: ['a'],
    explanation: 'A gateway VPC endpoint for S3 adds a route so S3 traffic stays on the AWS network, avoiding the internet and NAT gateway processing charges. A NAT gateway or internet gateway routes traffic over the internet, and a private hosted zone is for DNS, not connectivity.',
    references: [REF_VPC_ENDPOINT, REF_PRIVATELINK]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A company hosts the same application in three Regions and wants users to be routed to the Region that gives them the lowest network latency. Which Route 53 routing policy should be used?',
    options: opts4(
      'Latency-based routing',
      'Weighted routing',
      'Simple routing',
      'Geoproximity routing with no bias, used solely for cost'
    ),
    correct: ['a'],
    explanation: 'Latency-based routing sends each user to the Region that provides the lowest latency for them. Weighted routing splits traffic by assigned weights, simple routing returns one record set, and geoproximity routes by geographic location rather than measured latency.',
    references: [REF_R53_ROUTING, REF_R53]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'After a CloudFront distribution serves an outdated version of a file even though the origin has been updated, the CloudOps engineer needs the edge caches to fetch the new version immediately. What should they do?',
    options: opts4(
      'Create a CloudFront invalidation for the affected file path',
      'Delete the CloudFront distribution and recreate it',
      'Disable the origin S3 bucket',
      'Lower the EC2 instance size at the origin'
    ),
    correct: ['a'],
    explanation: 'A CloudFront invalidation removes the cached object from edge locations so the next request fetches the current version from the origin. Recreating the distribution is unnecessary and disruptive; disabling the origin or resizing instances does not refresh the cache.',
    references: [REF_CF_INVALIDATION, REF_CLOUDFRONT]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'Two EC2 instances in different subnets of the same VPC cannot communicate. Routing is correct. Which pair of controls should the CloudOps engineer check next?',
    options: opts4(
      'The security groups on both instances and the network ACLs on both subnets',
      'The CloudFront cache behaviors',
      'The Route 53 routing policy',
      'The S3 bucket policy'
    ),
    correct: ['a'],
    explanation: 'Within a VPC, traffic between subnets is filtered by the instances\' security groups and the subnets\' network ACLs; a missing allow rule (remembering NACLs are stateless) is the usual cause. CloudFront, Route 53 policies, and S3 bucket policies are unrelated to intra-VPC instance connectivity.',
    references: [REF_SG, REF_NACL]
  },
  {
    domain: D5, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudOps engineer must determine whether traffic is actually reaching instances in a subnet and whether it is being accepted or rejected. Which data source provides this detail?',
    options: opts4(
      'VPC Flow Logs, which record accepted and rejected IP traffic for the VPC, subnet, or ENI',
      'CloudWatch CPU utilization metrics',
      'AWS CloudTrail management events',
      'S3 server access logs'
    ),
    correct: ['a'],
    explanation: 'VPC Flow Logs capture metadata about IP traffic, including whether each flow was ACCEPTed or REJECTed, which is exactly what is needed to diagnose connectivity. CPU metrics show load, CloudTrail records API calls, and S3 access logs cover bucket requests.',
    references: [REF_FLOW_LOGS]
  },
  {
    domain: D5, difficulty: 3, type: QType.SINGLE,
    stem: 'A company is connecting many VPCs across multiple accounts and finds that full-mesh VPC peering has become hard to manage. Which service simplifies this topology?',
    options: opts4(
      'AWS Transit Gateway, acting as a central hub that connects the VPCs and on-premises networks',
      'An additional internet gateway per VPC',
      'A NAT gateway in each VPC',
      'A separate Route 53 hosted zone per VPC'
    ),
    correct: ['a'],
    explanation: 'A transit gateway is a central hub that connects many VPCs (and on-premises networks via VPN or Direct Connect), replacing the O(n^2) full mesh of peering connections. Internet gateways, NAT gateways, and hosted zones do not interconnect VPCs.',
    references: [REF_TGW, REF_PEERING]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'On-premises servers connected to AWS over a VPN must resolve DNS names of resources in a VPC private hosted zone, and AWS resources must resolve on-premises names. Which feature provides this hybrid DNS resolution?',
    options: opts4(
      'Amazon Route 53 Resolver inbound and outbound endpoints with forwarding rules',
      'A public Route 53 hosted zone',
      'CloudFront with a custom origin',
      'A NAT gateway with DNS enabled'
    ),
    correct: ['a'],
    explanation: 'Route 53 Resolver endpoints enable hybrid DNS: inbound endpoints let on-premises systems resolve VPC names, and outbound endpoints with forwarding rules let VPC resources resolve on-premises names. A public hosted zone, CloudFront, and NAT gateways do not provide hybrid DNS forwarding.',
    references: [REF_R53_RESOLVER, REF_R53]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A non-cacheable TCP/UDP application needs improved global availability and fast regional failover using static anycast IP addresses. Which service is the best fit?',
    options: opts4(
      'AWS Global Accelerator',
      'Amazon CloudFront',
      'Amazon Route 53 Resolver',
      'AWS Direct Connect'
    ),
    correct: ['a'],
    explanation: 'Global Accelerator provides static anycast IP addresses, routes over the AWS global network, and fails over quickly between Regional endpoints — ideal for non-HTTP, non-cacheable workloads. CloudFront is optimized for cacheable HTTP content, Route 53 Resolver is for DNS, and Direct Connect is a dedicated on-premises link.',
    references: [REF_GA, REF_CLOUDFRONT]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A public web application is receiving malicious requests such as SQL injection attempts and traffic from specific bad IP ranges. Which service lets the CloudOps team filter these requests at Layer 7?',
    options: opts4(
      'AWS WAF, attached to the Application Load Balancer or CloudFront distribution',
      'A network ACL on the database subnet',
      'Amazon Inspector',
      'AWS Direct Connect'
    ),
    correct: ['a'],
    explanation: 'AWS WAF inspects HTTP/HTTPS requests and blocks Layer 7 threats such as SQL injection and known-bad IPs via managed and custom rules, attached to an ALB, CloudFront, or API Gateway. NACLs filter IP/port at Layer 3/4, Inspector scans for vulnerabilities, and Direct Connect is connectivity.',
    references: [REF_WAF, REF_SHIELD]
  },
  {
    domain: D5, difficulty: 3, type: QType.SINGLE,
    stem: 'Instances in a VPC connected to on-premises over AWS Direct Connect cannot reach an on-premises subnet, although other on-premises subnets work. Where should the CloudOps engineer look first?',
    options: opts4(
      'The route propagation/routing for that subnet on the virtual private gateway or transit gateway, and the on-premises router advertised routes',
      'The CloudFront cache behavior',
      'The S3 gateway endpoint policy',
      'The EC2 instance AMI version'
    ),
    correct: ['a'],
    explanation: 'When some on-premises subnets are reachable and one is not, the likely cause is a missing route — the prefix is not advertised over the Direct Connect/virtual private gateway or transit gateway, or route propagation is not enabled for it. CloudFront, S3 endpoint policies, and AMI versions are unrelated to hybrid routing.',
    references: [REF_DX, REF_TGW]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Monitoring, Logging, Analysis, Remediation, Performance (14) ──
  {
    domain: D1, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A CloudOps engineer must interactively search and aggregate application logs in a CloudWatch Logs log group to find the slowest requests in the last hour. Which tool is designed for this?',
    options: opts4(
      'CloudWatch Logs Insights, using its purpose-built query language',
      'Amazon Athena querying the EC2 instance directly',
      'A CloudWatch metric alarm',
      'AWS Cost Explorer'
    ),
    correct: ['a'],
    explanation: 'CloudWatch Logs Insights provides an interactive query language to search, filter, and aggregate log data, ideal for ad hoc analysis such as finding the slowest requests. A metric alarm only watches a metric, Athena queries data in S3, and Cost Explorer analyzes spend.',
    references: [REF_CW_INSIGHTS, REF_CW_LOGS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer must collect metrics and container logs from an Amazon EKS cluster and send them to CloudWatch. What is the recommended approach?',
    options: opts4(
      'Deploy the CloudWatch agent (with Container Insights) and a log collector such as Fluent Bit to the cluster',
      'Rely on EC2 detailed monitoring of the worker nodes only',
      'Enable S3 server access logging',
      'Install the CloudWatch agent on a single bastion host'
    ),
    correct: ['a'],
    explanation: 'Container Insights uses the CloudWatch agent and Fluent Bit deployed into the cluster to collect container-level metrics and logs. Node-level EC2 monitoring misses container metrics, S3 access logging is unrelated, and a bastion host cannot collect cluster telemetry.',
    references: [REF_CW_AGENT, REF_CW]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'Traffic to an application is highly seasonal, so a static CloudWatch alarm threshold causes false alarms at night and misses problems during the day. What should the CloudOps engineer use?',
    options: opts4(
      'A CloudWatch anomaly detection alarm that learns the expected pattern and alarms on deviations from a band',
      'A composite alarm with no metric alarms',
      'A static threshold set to the highest value ever seen',
      'Detailed monitoring on the load balancer'
    ),
    correct: ['a'],
    explanation: 'Anomaly detection builds a model of the metric\'s normal pattern (including seasonality) and alarms when values fall outside the expected band, avoiding the false positives/negatives of a static threshold. A composite alarm needs underlying alarms, and a fixed high threshold misses daytime issues.',
    references: [REF_CW_ANOMALY, REF_CW_ALARM]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'Application logs from many accounts must be streamed in near real time to a central logging account for processing. Which CloudWatch Logs feature delivers this?',
    options: opts4(
      'A subscription filter on each log group that streams matching events to a destination such as Kinesis Data Streams or Firehose',
      'Manually exporting logs to S3 once a day',
      'A metric filter only',
      'CloudWatch dashboards shared across accounts'
    ),
    correct: ['a'],
    explanation: 'Subscription filters deliver log events in near real time to destinations such as Kinesis Data Streams, Firehose, or Lambda, including cross-account destinations for centralization. A daily S3 export is batch, a metric filter only creates metrics, and dashboards do not move log data.',
    references: [REF_CW_SUBSCRIPTION, REF_CW_LOGS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization wants every member account\'s API activity recorded in one place automatically, including accounts added in the future. What should the CloudOps engineer configure?',
    options: opts4(
      'An organization trail in AWS CloudTrail',
      'A separate single-account trail created manually in each account',
      'VPC Flow Logs in the management account',
      'A CloudWatch dashboard in each account'
    ),
    correct: ['a'],
    explanation: 'An organization trail logs events for the management account and all member accounts — including accounts created later — into a central location. Per-account trails are not automatic for new accounts, Flow Logs cover network traffic, and dashboards do not record API activity.',
    references: [REF_CLOUDTRAIL]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer wants a single event — an Amazon S3 object upload — to trigger both a Lambda function and a message to an SNS topic, with the event also filtered by object key prefix. Which service handles this routing and filtering?',
    options: opts4(
      'Amazon EventBridge, using an event pattern and multiple targets on one rule',
      'Amazon CloudWatch alarms',
      'AWS Config rules',
      'Amazon Route 53 health checks'
    ),
    correct: ['a'],
    explanation: 'An EventBridge rule can match an event with a pattern (including content filtering) and fan out to multiple targets such as Lambda and SNS. CloudWatch alarms act on metrics, Config rules evaluate resource configuration, and Route 53 health checks monitor endpoints.',
    references: [REF_EVENTBRIDGE, REF_S3_EVENTS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'When a CloudWatch alarm detects a failed application, a documented multi-step recovery procedure must run automatically. How should the CloudOps engineer wire this up?',
    options: opts4(
      'Have the alarm send to an SNS topic or EventBridge rule that starts a Systems Manager Automation runbook containing the recovery steps',
      'Have the alarm directly modify the EC2 security group',
      'Have the alarm write to a CloudWatch dashboard',
      'Manually run the steps each time the alarm fires'
    ),
    correct: ['a'],
    explanation: 'An alarm can notify SNS or trigger an EventBridge rule, which then starts an SSM Automation runbook that performs the recovery steps automatically and auditably. Alarms do not run multi-step procedures themselves, dashboards do not execute actions, and manual steps defeat automation.',
    references: [REF_CW_ALARM, REF_SSM_AUTO]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'Users report a slow web application. The CloudOps engineer wants to alarm specifically on the latency users experience through the Application Load Balancer. Which metric should the alarm watch?',
    options: opts4(
      'The ALB TargetResponseTime metric',
      'The EC2 CPUCreditBalance metric',
      'The S3 BucketSizeBytes metric',
      'The NAT gateway BytesOutToDestination metric'
    ),
    correct: ['a'],
    explanation: 'TargetResponseTime measures the time the ALB targets take to respond, which directly reflects user-facing latency. CPU credit balance, S3 bucket size, and NAT gateway bytes do not measure application response time.',
    references: [REF_CW, REF_ELB]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A latency-sensitive database on EC2 needs sustained, very high random IOPS with consistent performance and supports a mission-critical workload. Which EBS volume type is most appropriate?',
    options: opts4(
      'Provisioned IOPS SSD (io2 / io2 Block Express)',
      'Cold HDD (sc1)',
      'Throughput Optimized HDD (st1)',
      'A magnetic (standard) volume'
    ),
    correct: ['a'],
    explanation: 'Provisioned IOPS SSD (io2 / io2 Block Express) delivers high, consistent random IOPS with high durability for I/O-intensive, mission-critical databases. sc1 and st1 are HDD types optimized for sequential throughput and cost, not random IOPS, and magnetic volumes are previous-generation.',
    references: [REF_EBS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A client repeatedly fails to upload very large objects to Amazon S3 over an unreliable connection, having to restart from the beginning each time. Which S3 capability addresses this?',
    options: opts4(
      'Multipart upload, which splits the object into parts that can be uploaded and retried independently',
      'S3 Versioning',
      'S3 Object Lock',
      'S3 Requester Pays'
    ),
    correct: ['a'],
    explanation: 'Multipart upload divides a large object into parts uploaded in parallel and retried individually, so a failure only re-sends the affected part. Versioning, Object Lock, and Requester Pays do not improve large-upload reliability.',
    references: [REF_S3_MULTIPART, REF_S3]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'An Amazon EFS file system stores large amounts of data that is rarely accessed after 30 days, and the team wants to reduce storage cost automatically. What should be configured?',
    options: opts4(
      'EFS lifecycle management to transition infrequently accessed files to the EFS Infrequent Access storage class',
      'An S3 Lifecycle policy on the EFS file system',
      'EBS fast snapshot restore',
      'A NAT gateway'
    ),
    correct: ['a'],
    explanation: 'EFS lifecycle management automatically moves files not accessed within a set period to the lower-cost Infrequent Access (or Archive) storage class. S3 Lifecycle policies apply to S3, not EFS; fast snapshot restore and NAT gateways are unrelated to EFS cost.',
    references: [REF_EFS_LIFECYCLE, REF_EFS]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A Lambda-based application opens many short-lived connections to an Amazon RDS database and exhausts the database connection limit during traffic spikes. What is the recommended fix?',
    options: opts4(
      'Use Amazon RDS Proxy to pool and share database connections',
      'Increase the Lambda function timeout',
      'Move the database to a NAT gateway subnet',
      'Enable S3 Transfer Acceleration'
    ),
    correct: ['a'],
    explanation: 'RDS Proxy pools and reuses database connections, smoothing the connection storms caused by many concurrent Lambda invocations and improving scalability. A longer timeout does not reduce connections, and NAT gateways and Transfer Acceleration are unrelated.',
    references: [REF_RDS_PROXY, REF_RDS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A tightly coupled HPC application needs the lowest possible network latency and highest packet-per-second performance between its EC2 instances in a single Availability Zone. Which placement strategy should be used?',
    options: opts4(
      'A cluster placement group',
      'A spread placement group across multiple AZs',
      'A partition placement group with many partitions',
      'No placement group; rely on the default placement'
    ),
    correct: ['a'],
    explanation: 'A cluster placement group packs instances close together in one AZ for low-latency, high-throughput networking — ideal for tightly coupled HPC. Spread placement groups maximize isolation, partition placement groups suit large distributed workloads, and default placement gives no locality guarantees.',
    references: [REF_EC2_PLACEMENT, REF_EC2]
  },
  {
    domain: D1, difficulty: 3, type: QType.MULTI,
    stem: 'Select TWO correct statements about Amazon CloudWatch metrics and alarms.',
    options: opts5(
      'Metric math lets you combine multiple metrics into a new derived time series that an alarm can watch',
      'An alarm can be configured to treat missing data as notBreaching, breaching, ignore, or missing',
      'CloudWatch automatically collects guest-OS memory usage from every EC2 instance with no agent',
      'A standard CloudWatch metric alarm can monitor more than one metric directly without metric math',
      'Alarms cannot send notifications to Amazon SNS'
    ),
    correct: ['a', 'b'],
    explanation: 'Metric math creates derived series (for example, error rate) that an alarm can monitor, and alarms have a configurable missing-data treatment. CloudWatch does not collect memory without the agent, a single metric alarm watches one metric/expression, and alarms certainly can notify SNS.',
    references: [REF_CW_METRIC_MATH, REF_CW_ALARM]
  },

  // ── Reliability and Business Continuity (14) ──
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'An Auto Scaling group must add capacity in larger increments as load rises further above a threshold (a bigger jump for a larger breach). Which scaling policy type supports graduated steps?',
    options: opts4(
      'A step scaling policy',
      'A scheduled scaling action',
      'Manual capacity adjustment',
      'A target tracking policy with one fixed step'
    ),
    correct: ['a'],
    explanation: 'Step scaling defines multiple steps so the size of the capacity change varies with the magnitude of the alarm breach. Scheduled scaling is time-based, manual adjustment is not automatic, and target tracking keeps a metric at a target rather than applying graduated steps.',
    references: [REF_ASG_STEP, REF_ASG]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'An online store has a predictable traffic surge every weekday at 09:00. The CloudOps engineer wants capacity ready just before the surge instead of waiting for reactive scaling. What should be configured?',
    options: opts4(
      'A scheduled scaling action that increases the Auto Scaling group capacity before 09:00',
      'A larger health check grace period',
      'A target tracking policy only, with no schedule',
      'Termination protection on all instances'
    ),
    correct: ['a'],
    explanation: 'Scheduled scaling changes capacity at known times, so the group is already scaled up before a predictable surge. Reactive target tracking alone lags the spike, a grace period only delays health checks, and termination protection does not add capacity.',
    references: [REF_ASG_SCHEDULED, REF_ASG]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A Multi-AZ Application Load Balancer sends uneven traffic to instances because one AZ has more instances than another. Which setting evens out the distribution across all registered targets regardless of AZ?',
    options: opts4(
      'Cross-zone load balancing',
      'Sticky sessions',
      'Connection draining',
      'A larger idle timeout'
    ),
    correct: ['a'],
    explanation: 'Cross-zone load balancing distributes traffic evenly across all registered targets in all AZs, rather than splitting evenly per AZ first. Sticky sessions pin clients to targets, connection draining handles deregistration, and idle timeout affects connection lifetime.',
    references: [REF_ELB_XZONE, REF_ELB]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'An application must serve low-latency reads and writes to users in North America, Europe, and Asia from the same DynamoDB data, with multi-Region resilience. Which DynamoDB feature provides this?',
    options: opts4(
      'DynamoDB global tables, which replicate the table across multiple Regions',
      'A single-Region table with on-demand capacity',
      'DynamoDB Accelerator (DAX) in one Region',
      'A read replica of the DynamoDB table'
    ),
    correct: ['a'],
    explanation: 'Global tables replicate a DynamoDB table across multiple Regions with multi-active read/write access, giving local latency and Regional resilience. On-demand capacity is single-Region, DAX is an in-Region cache, and DynamoDB does not use read replicas.',
    references: [REF_DDB_GLOBAL]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'An Amazon Aurora cluster\'s reader endpoint is overwhelmed during reporting peaks. The CloudOps engineer wants the number of Aurora Replicas to grow and shrink automatically with read load. What should be configured?',
    options: opts4(
      'Aurora Auto Scaling for Aurora Replicas based on a target metric such as average CPU or connections',
      'EC2 Auto Scaling on the database instances',
      'A larger writer instance only',
      'Manual addition of replicas each morning'
    ),
    correct: ['a'],
    explanation: 'Aurora Auto Scaling adds or removes Aurora Replicas automatically to keep a target metric (CPU utilization or connections) within range. EC2 Auto Scaling does not manage Aurora instances, scaling only the writer does not add read capacity, and manual changes are not elastic.',
    references: [REF_AURORA_AS, REF_AURORA]
  },
  {
    domain: D2, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A Route 53 record must fail over based on whether a downstream CloudWatch alarm is in the ALARM state, rather than on an HTTP health check of an endpoint. Which Route 53 capability supports this?',
    options: opts4(
      'A health check that monitors the state of a CloudWatch alarm',
      'A weighted routing policy',
      'A Route 53 private hosted zone',
      'A CNAME record at the zone apex'
    ),
    correct: ['a'],
    explanation: 'Route 53 supports a health check type that tracks the state of a CloudWatch alarm, so failover can be driven by any metric the alarm watches. Weighted routing splits traffic, private hosted zones are for VPC DNS, and a CNAME cannot exist at the zone apex.',
    references: [REF_R53_HEALTH, REF_CW_ALARM]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'During scale-in, users behind an Application Load Balancer experience dropped requests because instances are removed while still processing connections. Which setting prevents this?',
    options: opts4(
      'Increase the target group deregistration delay (connection draining) so in-flight requests finish',
      'Disable health checks during scale-in',
      'Reduce the ALB idle timeout to zero',
      'Switch the listener from HTTPS to HTTP'
    ),
    correct: ['a'],
    explanation: 'Deregistration delay (connection draining) keeps a deregistering target in a draining state until in-flight requests complete or the timeout expires, avoiding dropped requests. Disabling health checks, zeroing the idle timeout, or changing the protocol do not gracefully drain connections.',
    references: [REF_ELB_DRAIN, REF_ELB]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A compliance rule requires that backups created by AWS Backup are also stored in a second AWS Region for disaster recovery. How is this achieved?',
    options: opts4(
      'Add a copy action to the AWS Backup plan rule that copies recovery points to a backup vault in another Region',
      'Manually download each backup and re-upload it to the other Region',
      'Enable S3 Versioning on the backup vault',
      'Use a NAT gateway to route backups to another Region'
    ),
    correct: ['a'],
    explanation: 'An AWS Backup plan rule can include a copy action that automatically copies recovery points to a vault in another Region (or account). Manual copying is error-prone, versioning does not create cross-Region copies, and NAT gateways do not move backups.',
    references: [REF_BACKUP]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'When restoring large EBS volumes from a snapshot for a DR drill, the first reads are slow because of lazy loading from S3. Which feature eliminates this initial performance hit?',
    options: opts4(
      'Enable EBS fast snapshot restore on the snapshot in the target Availability Zones',
      'Convert the snapshot to an AMI',
      'Increase the volume size after restore',
      'Enable S3 Transfer Acceleration'
    ),
    correct: ['a'],
    explanation: 'Fast snapshot restore lets volumes created from the snapshot deliver full provisioned performance immediately, removing the lazy-load latency. Converting to an AMI, resizing the volume, or enabling Transfer Acceleration do not remove the initialization penalty.',
    references: [REF_EBS_FSR, REF_EBS_SNAP]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team must keep a copy of an Amazon RDS database\'s recovery points in another Region. Which approach is correct?',
    options: opts4(
      'Copy automated/manual RDS snapshots to the target Region (or use AWS Backup cross-Region copy)',
      'Automated backups are automatically available in every Region with no action',
      'Use S3 Cross-Region Replication on the RDS storage volume',
      'Attach a read replica in the same AZ'
    ),
    correct: ['a'],
    explanation: 'RDS snapshots can be copied to another Region, and AWS Backup can copy RDS recovery points cross-Region, providing a Regional DR copy. Automated backups are not automatically cross-Region, you cannot apply S3 replication to RDS storage, and a same-AZ replica adds no Regional protection.',
    references: [REF_RDS_BACKUP, REF_BACKUP]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A static-asset S3 bucket must have all objects continuously copied to a bucket in another Region for disaster recovery, including future uploads. What should the CloudOps engineer configure?',
    options: opts4(
      'S3 Cross-Region Replication (a replication rule) on the source bucket',
      'A one-time S3 batch copy',
      'S3 Transfer Acceleration',
      'A CloudFront distribution with the second bucket as origin'
    ),
    correct: ['a'],
    explanation: 'S3 Cross-Region Replication automatically and asynchronously copies new and updated objects to a destination bucket in another Region. A one-time copy misses future objects, Transfer Acceleration speeds uploads, and CloudFront serves content rather than replicating it.',
    references: [REF_S3_CRR, REF_S3]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A company wants a low-cost DR posture where the database is continuously replicated to a second Region but no application servers run there until a disaster, accepting an RTO of tens of minutes. Which DR strategy is this?',
    options: opts4(
      'Pilot light',
      'Multi-site active/active',
      'Warm standby',
      'Backup and restore'
    ),
    correct: ['a'],
    explanation: 'Pilot light keeps core elements such as the database replicated and ready in the second Region, while application/compute is provisioned only on failover — low cost with a moderate RTO. Multi-site and warm standby run more (or all) capacity continuously; backup and restore has the longest RTO and no live replication.',
    references: [REF_DR]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'An ElastiCache for Redis cluster must continue serving with minimal disruption if the primary node fails. What should be enabled?',
    options: opts4(
      'Multi-AZ with automatic failover, using a replica in another Availability Zone',
      'A single-node cluster with a larger node type',
      'Cluster mode disabled and no replicas',
      'A NAT gateway in front of the cluster'
    ),
    correct: ['a'],
    explanation: 'ElastiCache for Redis Multi-AZ with automatic failover promotes a replica in another AZ if the primary fails, minimizing downtime. A single node has no failover target, no replicas means no failover, and a NAT gateway is unrelated to cache availability.',
    references: [REF_ELASTICACHE_MAZ, REF_ELASTICACHE]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'An Auto Scaling group keeps instances that are running but whose application has crashed and fails the load balancer health check. The team wants Auto Scaling to replace those instances. What should be changed?',
    options: opts4(
      'Set the Auto Scaling group health check type to ELB so it uses the load balancer health checks',
      'Leave the health check type as EC2 only',
      'Disable the load balancer health checks',
      'Increase the desired capacity manually'
    ),
    correct: ['a'],
    explanation: 'With the health check type set to ELB, Auto Scaling considers an instance unhealthy and replaces it when the load balancer health check fails — even though the EC2 status checks still pass. EC2-only checks miss application crashes, disabling LB health checks hides the failure, and raising capacity does not remove bad instances.',
    references: [REF_ASG_HEALTH, REF_ASG]
  },

  // ── Deployment, Provisioning, and Automation (15) ──
  {
    domain: D3, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A CloudFormation template must be reusable across dev, test, and prod with different instance sizes per environment. Which template feature should the CloudOps engineer use?',
    options: opts4(
      'Parameters, so the environment-specific values are supplied at stack creation time',
      'Hard-coded values duplicated into three separate templates',
      'A stack policy',
      'Termination protection'
    ),
    correct: ['a'],
    explanation: 'Parameters let one template accept environment-specific input (such as instance size) at deploy time, keeping a single reusable template. Three hard-coded templates duplicate maintenance, stack policies protect resources from updates, and termination protection prevents deletion.',
    references: [REF_CFN, REF_CFN_NESTED]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudOps engineer must deploy a baseline stack to every account in an AWS Organization, and have it deploy automatically into any new account that joins. Which StackSets option supports this?',
    options: opts4(
      'A service-managed StackSet with automatic deployment enabled for the organization or organizational units',
      'A self-managed StackSet where IAM roles are created manually in each account',
      'A single stack in the management account',
      'An AWS RAM share of the template'
    ),
    correct: ['a'],
    explanation: 'Service-managed StackSets integrate with AWS Organizations and, with automatic deployment enabled, deploy to existing and newly added accounts in the targeted OUs. Self-managed StackSets require manual IAM setup and do not auto-enroll new accounts; a single stack and RAM do not deploy templates org-wide.',
    references: [REF_CFN_STACKSETS]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudFormation stack creates an Amazon RDS database that must survive even if the stack is deleted. Which template attribute ensures the database is kept?',
    options: opts4(
      'A DeletionPolicy of Retain (or Snapshot) on the RDS resource',
      'A stack policy denying all updates',
      'Termination protection on the EC2 instances',
      'An Outputs section listing the database'
    ),
    correct: ['a'],
    explanation: 'A DeletionPolicy of Retain keeps the resource when the stack is deleted, and Snapshot takes a final snapshot for supported resources. Stack policies govern updates not deletion, EC2 termination protection does not cover RDS, and Outputs only export values.',
    references: [REF_CFN_DELETION, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudFormation template that creates an IAM role fails with an "InsufficientCapabilities" error. What must the CloudOps engineer do?',
    options: opts4(
      'Acknowledge IAM resource creation by providing CAPABILITY_IAM (or CAPABILITY_NAMED_IAM) when creating or updating the stack',
      'Remove the IAM role from the template permanently',
      'Switch the stack to a different Region',
      'Add a DeletionPolicy to the role'
    ),
    correct: ['a'],
    explanation: 'CloudFormation requires you to explicitly acknowledge templates that create IAM resources by specifying CAPABILITY_IAM or CAPABILITY_NAMED_IAM. Removing the role changes the design, the Region is irrelevant, and a DeletionPolicy does not grant the capability.',
    references: [REF_CFN_CAPABILITIES, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer must run a single ad hoc command — collecting a diagnostic file — across 200 EC2 instances at once, without SSH. Which Systems Manager capability fits?',
    options: opts4(
      'Systems Manager Run Command',
      'Systems Manager Parameter Store',
      'Systems Manager Maintenance Windows',
      'Systems Manager Inventory'
    ),
    correct: ['a'],
    explanation: 'Run Command executes a command or document against many managed instances at once, with no SSH, and reports results. Parameter Store holds configuration data, Maintenance Windows schedule tasks, and Inventory only gathers metadata.',
    references: [REF_SSM_RUN, REF_SSM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Application configuration values and a database password must be stored centrally so EC2 instances and Lambda functions can retrieve them, with the password encrypted. Which Systems Manager feature should be used?',
    options: opts4(
      'Systems Manager Parameter Store, using String parameters for config and SecureString parameters for the password',
      'CloudWatch Logs log groups',
      'An S3 bucket with public read access',
      'EC2 instance user data'
    ),
    correct: ['a'],
    explanation: 'Parameter Store stores configuration data hierarchically; SecureString parameters are encrypted with AWS KMS, suitable for the password. Log groups are not config stores, a public S3 bucket exposes data, and user data is visible in instance metadata.',
    references: [REF_SSM_PARAM, REF_SSM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A cleanup job must run every night at 02:00 UTC to delete temporary resources. The CloudOps engineer wants a serverless, managed scheduler with a one-time or recurring schedule and built-in retries. Which service should they use?',
    options: opts4(
      'Amazon EventBridge Scheduler with a cron or rate schedule',
      'A long-running EC2 instance with crontab',
      'A CloudWatch alarm',
      'An S3 Lifecycle policy'
    ),
    correct: ['a'],
    explanation: 'EventBridge Scheduler is a managed, serverless scheduler supporting cron/rate schedules, time zones, and retry/dead-letter configuration. A crontab on EC2 is self-managed, alarms react to metrics, and S3 Lifecycle only manages S3 object transitions/expiration.',
    references: [REF_EB_SCHEDULER, REF_EVENTBRIDGE]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'When AWS Config detects a security group that allows unrestricted SSH from 0.0.0.0/0, the CloudOps team wants the rule removed automatically. How should they configure this?',
    options: opts4(
      'Attach an automatic remediation action (an SSM Automation document) to the AWS Config rule',
      'Send the finding to a CloudWatch dashboard',
      'Email the finding and wait for manual action',
      'Disable the AWS Config rule'
    ),
    correct: ['a'],
    explanation: 'AWS Config supports remediation actions that run an SSM Automation document against noncompliant resources, automatically or on demand — for example, revoking the open SSH rule. A dashboard or email is not remediation, and disabling the rule hides the problem.',
    references: [REF_CONFIG_REMEDIATION, REF_CONFIG]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer needs to detect whether resources managed by a CloudFormation StackSet have been changed outside CloudFormation across all target accounts. What should they run?',
    options: opts4(
      'Drift detection on the StackSet',
      'A new StackSet with the same template',
      'Termination protection on each stack instance',
      'An AWS Budgets report'
    ),
    correct: ['a'],
    explanation: 'StackSets support drift detection, which checks stack instances across accounts and Regions for configuration changes made outside CloudFormation. Creating another StackSet, enabling termination protection, or running a budget report does not detect drift.',
    references: [REF_CFN_DRIFT, REF_CFN_STACKSETS]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants a deployment method that releases a new application version to a small percentage of traffic first, monitors it, and then shifts the rest. Which CodeDeploy deployment configuration describes this?',
    options: opts4(
      'A canary deployment configuration',
      'An all-at-once in-place deployment',
      'A deployment with rollbacks disabled',
      'A deployment that skips health checks'
    ),
    correct: ['a'],
    explanation: 'A canary deployment shifts a small percentage of traffic to the new version, waits, then shifts the remainder, limiting blast radius. All-at-once exposes every user immediately, and disabling rollbacks or health checks increases risk.',
    references: [REF_CODEDEPLOY]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudFormation stack created a golden AMI with EC2 Image Builder. The AMI must be available to several other accounts and Regions for their launch templates. Which Image Builder feature handles this?',
    options: opts4(
      'A distribution configuration that copies and shares the image to the target Regions and accounts',
      'A CloudFront distribution',
      'An S3 Cross-Region Replication rule',
      'A Route 53 routing policy'
    ),
    correct: ['a'],
    explanation: 'An EC2 Image Builder distribution configuration specifies the Regions to distribute the image to and the accounts to share it with. CloudFront and Route 53 deliver content/DNS, and S3 replication copies S3 objects, not AMIs.',
    references: [REF_IMAGE_BUILDER]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'During a CloudFormation stack update, a critical production database resource must never be replaced or deleted by accident. Which mechanism prevents updates to that specific resource?',
    options: opts4(
      'A stack policy that denies update actions on that resource',
      'A change set',
      'A nested stack',
      'A mapping'
    ),
    correct: ['a'],
    explanation: 'A stack policy is a JSON document that defines which resources can be updated during stack updates; it can deny updates to a critical resource. Change sets preview changes, nested stacks modularize templates, and mappings hold lookup values.',
    references: [REF_CFN_STACKPOLICY, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A networking CloudFormation stack creates a VPC, and several application stacks need that VPC ID. What is the recommended way to share the value between stacks?',
    options: opts4(
      'Export the VPC ID as a stack output and use Fn::ImportValue in the consuming stacks',
      'Copy and paste the VPC ID into every consuming template manually',
      'Store the VPC ID in a CloudWatch metric',
      'Re-create the VPC in each application stack'
    ),
    correct: ['a'],
    explanation: 'A stack can export an output value, and other stacks reference it with Fn::ImportValue, creating a managed cross-stack reference. Manual copy-paste is error-prone, metrics are numeric time series, and recreating the VPC defeats sharing.',
    references: [REF_CFN_EXPORTS, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudFormation template launches EC2 instances that must install packages and start services on first boot in a controlled, signal-based way. Which approach is intended for this?',
    options: opts4(
      'Use the cfn-init helper scripts with AWS::CloudFormation::Init metadata and a CreationPolicy with cfn-signal',
      'Manually SSH into each instance after the stack finishes',
      'Put all setup logic in a Lambda function unrelated to the stack',
      'Use an S3 Lifecycle policy'
    ),
    correct: ['a'],
    explanation: 'cfn-init reads AWS::CloudFormation::Init metadata to install packages and start services, and cfn-signal with a CreationPolicy tells CloudFormation when configuration succeeded. Manual SSH is not repeatable, an unrelated Lambda is not integrated with the stack, and S3 Lifecycle is irrelevant.',
    references: [REF_CFN_INIT, REF_CFN]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudFormation stack manages an Auto Scaling group. When the launch template changes, instances must be replaced a few at a time so the application stays available during the update. Which template attribute controls this?',
    options: opts4(
      'An UpdatePolicy with AutoScalingRollingUpdate on the Auto Scaling group resource',
      'A DeletionPolicy of Retain',
      'A stack policy denying all updates',
      'A Conditions section'
    ),
    correct: ['a'],
    explanation: 'An UpdatePolicy with AutoScalingRollingUpdate tells CloudFormation to replace Auto Scaling group instances in controlled batches (honoring MinInstancesInService) during an update, preserving availability. DeletionPolicy governs deletion, a stack policy can block updates entirely, and Conditions control whether resources are created.',
    references: [{ label: 'AWS Docs — UpdatePolicy attribute', url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-updatepolicy.html' }, REF_CFN]
  },

  // ── Security and Compliance (10) ──
  {
    domain: D4, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team lead can create IAM roles for developers but must not be able to grant those roles more permissions than a defined maximum. Which IAM feature enforces this ceiling?',
    options: opts4(
      'A permissions boundary attached to the roles the lead creates',
      'An identity-based policy with full administrator access',
      'A larger session duration',
      'An access key rotation policy'
    ),
    correct: ['a'],
    explanation: 'A permissions boundary sets the maximum permissions an IAM entity can have; even if a broader policy is attached, effective permissions are capped by the boundary. Administrator access removes the ceiling, and session duration and key rotation do not limit permission scope.',
    references: [REF_IAM_BOUNDARY, REF_IAM]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants employees to sign in to multiple AWS accounts and applications with their existing corporate directory credentials, centrally managed. Which service provides this workforce single sign-on?',
    options: opts4(
      'AWS IAM Identity Center',
      'An IAM user created in every account',
      'Amazon Cognito user pools for the workforce',
      'AWS Directory Service Simple AD only'
    ),
    correct: ['a'],
    explanation: 'IAM Identity Center provides centralized workforce SSO across multiple AWS accounts and applications, integrating with an external identity provider or its own directory. Per-account IAM users do not centralize identity, Cognito targets application end users, and Simple AD alone is just a directory.',
    references: [REF_IAM_IC, REF_IAM]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A specific S3 bucket must allow read access only from a particular AWS account, regardless of that account\'s own IAM policies for outbound permissions. Which policy type should the CloudOps engineer attach to the bucket?',
    options: opts4(
      'A resource-based policy — an S3 bucket policy — that grants the required access to that account',
      'A permissions boundary on the bucket',
      'A service control policy on the bucket',
      'An EC2 security group on the bucket'
    ),
    correct: ['a'],
    explanation: 'An S3 bucket policy is a resource-based policy that controls access to the bucket itself, including granting cross-account access. Permissions boundaries and SCPs apply to IAM entities/accounts, and security groups are network controls, not bucket access controls.',
    references: [REF_S3_POLICY, REF_IAM]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A compliance standard requires that the KMS keys used to encrypt data are rotated yearly without re-encrypting existing data. What should the CloudOps engineer enable?',
    options: opts4(
      'Automatic key rotation on the KMS customer managed key',
      'Deletion of the key every year',
      'A new key created manually each month with no rotation policy',
      'S3 Versioning on the key'
    ),
    correct: ['a'],
    explanation: 'Automatic rotation for a KMS customer managed key rotates the cryptographic key material on a schedule while keeping the same key ID, so existing ciphertext stays valid. Deleting the key destroys access to data, ad hoc manual keys are unmanaged, and versioning does not apply to KMS keys.',
    references: [REF_KMS_ROTATION, REF_KMS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer wants one console that aggregates and prioritizes security findings from GuardDuty, Inspector, and Macie and checks the account against best-practice security standards. Which service does this?',
    options: opts4(
      'AWS Security Hub',
      'Amazon CloudWatch',
      'AWS CloudTrail',
      'AWS Trusted Advisor'
    ),
    correct: ['a'],
    explanation: 'AWS Security Hub aggregates findings from services such as GuardDuty, Inspector, and Macie, and runs automated security best-practice checks against standards. CloudWatch handles metrics/logs, CloudTrail records API calls, and Trusted Advisor gives broader account checks but is not the security findings aggregator.',
    references: [REF_SECURITYHUB, REF_GUARDDUTY]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps team must continuously scan EC2 instances and container images in Amazon ECR for software vulnerabilities and unintended network exposure. Which service is purpose-built for this?',
    options: opts4(
      'Amazon Inspector',
      'AWS Config',
      'Amazon Macie',
      'AWS Certificate Manager'
    ),
    correct: ['a'],
    explanation: 'Amazon Inspector continuously scans EC2 instances and ECR container images for known software vulnerabilities (CVEs) and for unintended network exposure. AWS Config evaluates resource configuration, Macie discovers sensitive data, and ACM manages certificates.',
    references: [REF_INSPECTOR]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A compliance team needs to discover whether any S3 buckets contain sensitive data such as credit card numbers or personally identifiable information. Which AWS service should be used?',
    options: opts4(
      'Amazon Macie',
      'Amazon GuardDuty',
      'AWS Shield',
      'Amazon Inspector'
    ),
    correct: ['a'],
    explanation: 'Amazon Macie uses machine learning and pattern matching to discover and classify sensitive data (PII, financial data) in Amazon S3. GuardDuty detects threats, Shield protects against DDoS, and Inspector scans for software vulnerabilities.',
    references: [REF_MACIE]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'AWS Trusted Advisor flags several security checks — exposed access keys and overly permissive security groups. What is the appropriate CloudOps response?',
    options: opts4(
      'Review each finding and remediate it (rotate/remove the exposed keys, tighten the security group rules)',
      'Disable Trusted Advisor so the warnings stop appearing',
      'Ignore the findings because Trusted Advisor is only informational',
      'Open the security groups further to clear the check'
    ),
    correct: ['a'],
    explanation: 'Trusted Advisor security checks identify real risks; the correct response is to remediate them — rotate or remove exposed keys and restrict overly broad security group rules. Disabling Trusted Advisor or ignoring/worsening the configuration leaves the account exposed.',
    references: [REF_TRUSTED_ADVISOR]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'An application running on EC2 must use a KMS key to decrypt data, but the request fails with an access-denied error even though the instance role policy allows kms:Decrypt. What else must allow the access?',
    options: opts4(
      'The KMS key policy (or a grant) must also permit the instance role to use the key',
      'The S3 bucket policy must allow kms:Decrypt',
      'The VPC route table must include a KMS route',
      'The instance must have a public IP address'
    ),
    correct: ['a'],
    explanation: 'Access to a KMS key requires permission from both the IAM identity policy and the key policy (or a grant); if the key policy does not allow the role, the request is denied. S3 bucket policies, route tables, and public IPs do not govern KMS key permissions.',
    references: [REF_KMS, REF_IAM]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A regulatory requirement mandates that a workload\'s data and resources stay only in approved AWS Regions. How can a CloudOps engineer enforce this across all accounts in the organization?',
    options: opts4(
      'Apply a service control policy that denies actions outside the approved Regions',
      'Add a CloudWatch alarm in each Region',
      'Email developers a list of approved Regions',
      'Enable detailed monitoring globally'
    ),
    correct: ['a'],
    explanation: 'An SCP with a Region condition can deny resource-creating actions outside approved Regions for every account in the targeted OUs, technically enforcing data residency. Alarms only notify, an email is not enforcement, and monitoring does not restrict Regions.',
    references: [REF_ORG_SCP]
  },

  // ── Networking and Content Delivery (12) ──
  {
    domain: D5, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A network ACL allows inbound HTTPS (port 443) but clients still cannot complete connections. Because NACLs are stateless, what else must be allowed?',
    options: opts4(
      'An outbound rule for the ephemeral port range so response traffic can leave the subnet',
      'An inbound rule for port 22',
      'A second internet gateway',
      'A CloudFront distribution'
    ),
    correct: ['a'],
    explanation: 'Network ACLs are stateless, so return traffic is not automatically allowed; you must add an outbound rule covering the ephemeral port range (for example, 1024–65535) for responses. Port 22, a second internet gateway, and CloudFront do not address the stateless return-traffic issue.',
    references: [REF_NACL, REF_VPC]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'VPC A is peered with VPC B, and VPC B is peered with VPC C. Instances in VPC A cannot reach VPC C. Why?',
    options: opts4(
      'VPC peering is not transitive — A must have a direct peering connection (and routes) to C',
      'VPC peering requires the VPCs to be in the same subnet',
      'Peering only works within a single Availability Zone',
      'CloudFront must be enabled for peering to work'
    ),
    correct: ['a'],
    explanation: 'VPC peering is non-transitive: traffic does not flow through an intermediate VPC, so A reaches C only with a direct A–C peering connection and matching routes (or by using a transit gateway). Peering does not require shared subnets or a single AZ, and CloudFront is unrelated.',
    references: [REF_PEERING, REF_TGW]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'Instances in a private subnet must call the Amazon SQS API without using a NAT gateway or the public internet. What should the CloudOps engineer create?',
    options: opts4(
      'An interface VPC endpoint (powered by AWS PrivateLink) for Amazon SQS',
      'A gateway VPC endpoint, which is the only option for SQS',
      'An internet gateway in the private subnet',
      'A Route 53 public hosted zone'
    ),
    correct: ['a'],
    explanation: 'An interface VPC endpoint (AWS PrivateLink) provides private connectivity to AWS services such as SQS via an elastic network interface in the subnet. Gateway endpoints exist only for S3 and DynamoDB, an internet gateway uses the public internet, and a hosted zone is for DNS.',
    references: [REF_PRIVATELINK, REF_VPC]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to release a new application version to just 10% of users and the existing version to 90%, controlled at the DNS layer. Which Route 53 routing policy fits?',
    options: opts4(
      'Weighted routing, assigning weights of 10 and 90 to the two record sets',
      'Failover routing',
      'Latency-based routing',
      'Geolocation routing'
    ),
    correct: ['a'],
    explanation: 'Weighted routing splits traffic between records in proportion to assigned weights, enabling a 10/90 canary at the DNS layer. Failover routing is for DR, latency-based routing chooses the lowest-latency Region, and geolocation routes by user location.',
    references: [REF_R53_ROUTING, REF_R53]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'Static content in an S3 bucket should be served only through a CloudFront distribution, never by direct S3 URL access. Which configuration enforces this?',
    options: opts4(
      'Use CloudFront origin access control (OAC) and an S3 bucket policy that allows access only from the distribution',
      'Make the S3 bucket fully public',
      'Enable S3 Transfer Acceleration',
      'Put the bucket behind a NAT gateway'
    ),
    correct: ['a'],
    explanation: 'Origin access control lets CloudFront sign requests to S3, and a bucket policy that allows only that distribution blocks direct S3 access. A public bucket allows direct access, Transfer Acceleration only speeds transfers, and a NAT gateway does not restrict S3 access.',
    references: [REF_CF_OAC, REF_CLOUDFRONT]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer must analyze the request rate, client IPs, and HTTP responses handled by an Application Load Balancer over the past week. Which data source provides per-request detail?',
    options: opts4(
      'Application Load Balancer access logs delivered to Amazon S3',
      'EC2 status checks',
      'AWS Config configuration items',
      'Route 53 query logs'
    ),
    correct: ['a'],
    explanation: 'ALB access logs record detailed information for each request — client IP, request path, response code, processing times — and are delivered to S3 for analysis. EC2 status checks are health signals, Config items track configuration, and Route 53 query logs cover DNS, not ALB requests.',
    references: [REF_ELB_LOGS, REF_ELB]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A VPC has a single NAT gateway in one Availability Zone serving private subnets in three AZs. What is the main reliability concern, and how is it fixed?',
    options: opts4(
      'If that AZ fails, all private subnets lose internet egress — deploy a NAT gateway in each AZ and route each subnet to its local NAT gateway',
      'NAT gateways cannot be used with more than one subnet — switch to an internet gateway',
      'NAT gateways must be in a private subnet — move it',
      'There is no concern; one NAT gateway is always sufficient'
    ),
    correct: ['a'],
    explanation: 'A single NAT gateway is an AZ-level single point of failure (and cross-AZ data charges apply); the resilient design places a NAT gateway in each AZ and routes each private subnet to the NAT gateway in its own AZ. NAT gateways serve multiple subnets and must reside in a public subnet.',
    references: [REF_NAT, REF_VPC]
  },
  {
    domain: D5, difficulty: 3, type: QType.SINGLE,
    stem: 'A company uses a transit gateway to connect many VPCs but needs production VPCs isolated from development VPCs while both still reach a shared services VPC. How is this segmentation achieved?',
    options: opts4(
      'Use multiple transit gateway route tables and associate/propagate VPC attachments so production and development cannot route to each other',
      'Delete the transit gateway and use full-mesh peering',
      'Place all VPCs in one subnet',
      'Use a single default transit gateway route table for everything'
    ),
    correct: ['a'],
    explanation: 'Transit gateway route tables let you control which attachments can route to which, so production and development stay isolated while both route to shared services. Full mesh peering is harder to manage, VPCs are not in shared subnets, and one default route table allows everything to reach everything.',
    references: [REF_TGW]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer must point the zone apex (example.com) at an Application Load Balancer. A CNAME is not allowed at the apex. What should they use?',
    options: opts4(
      'A Route 53 alias record pointing to the load balancer',
      'A plain CNAME record at the apex',
      'An MX record',
      'A TXT record'
    ),
    correct: ['a'],
    explanation: 'A Route 53 alias record can point the zone apex to AWS resources such as an ALB, CloudFront distribution, or S3 website — something a CNAME cannot do at the apex. MX and TXT records serve mail routing and verification, not address resolution to a load balancer.',
    references: [REF_R53, REF_R53_ROUTING]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A company needs stateful, deep packet inspection and intrusion prevention for traffic flowing in and out of its VPCs, managed centrally. Which AWS service provides this?',
    options: opts4(
      'AWS Network Firewall',
      'A network ACL',
      'A security group',
      'Amazon Route 53 Resolver'
    ),
    correct: ['a'],
    explanation: 'AWS Network Firewall is a managed, stateful network firewall and intrusion prevention service for VPC traffic, with centralized rule management. NACLs and security groups provide basic stateless/stateful filtering without IPS, and Route 53 Resolver handles DNS.',
    references: [REF_NETWORK_FIREWALL, REF_VPC]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps team must block VPC resources from resolving DNS names of known malicious domains. Which service should they configure?',
    options: opts4(
      'Route 53 Resolver DNS Firewall with domain rule groups',
      'AWS WAF web ACLs',
      'A NAT gateway',
      'CloudFront geo restriction'
    ),
    correct: ['a'],
    explanation: 'Route 53 Resolver DNS Firewall filters outbound DNS queries from a VPC, blocking or alerting on queries to malicious domains via domain rule groups. AWS WAF filters HTTP requests, NAT gateways provide egress, and CloudFront geo restriction limits content by country.',
    references: [REF_DNS_FIREWALL, REF_R53_RESOLVER]
  },
  {
    domain: D5, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudOps engineer must continuously monitor packet loss and latency between an on-premises data center and AWS over a hybrid link. Which AWS service is designed for this network monitoring?',
    options: opts4(
      'Amazon CloudWatch Network Monitor',
      'AWS Trusted Advisor',
      'Amazon Inspector',
      'AWS Config'
    ),
    correct: ['a'],
    explanation: 'CloudWatch Network Monitor continuously measures round-trip time and packet loss for hybrid connectivity between on-premises networks and AWS. Trusted Advisor gives best-practice checks, Inspector scans for vulnerabilities, and Config tracks resource configuration.',
    references: [REF_CW_NETMON, REF_CW]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Monitoring, Logging, Analysis, Remediation, Performance (14) ──
  {
    domain: D1, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A CloudOps engineer wants to monitor a public web endpoint every few minutes from outside the application, verifying it loads and returns the expected content, and to be alerted on failures. Which service should they use?',
    options: opts4(
      'Amazon CloudWatch Synthetics canaries',
      'VPC Flow Logs',
      'AWS CloudTrail',
      'AWS Config'
    ),
    correct: ['a'],
    explanation: 'CloudWatch Synthetics canaries are scripted checks that probe endpoints and APIs on a schedule, validating availability and content, and emit metrics that alarms can watch. Flow Logs cover IP traffic, CloudTrail records API calls, and Config tracks resource configuration.',
    references: [REF_CW_SYNTHETICS, REF_CW]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'CloudWatch Logs costs are rising because log groups keep data forever. The CloudOps engineer wants application debug logs to be deleted automatically after 30 days. What should they configure?',
    options: opts4(
      'A retention setting of 30 days on the log group',
      'A metric filter on the log group',
      'S3 Versioning on the log group',
      'A subscription filter to delete logs'
    ),
    correct: ['a'],
    explanation: 'Each CloudWatch Logs log group has a configurable retention period; setting it to 30 days deletes events older than that automatically. Metric filters create metrics, S3 Versioning does not apply to log groups, and subscription filters deliver logs elsewhere rather than expiring them.',
    references: [REF_CW_LOGS_RETENTION, REF_CW_LOGS]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'A metric is briefly noisy, so a CloudWatch alarm based on a single datapoint causes false alerts. The team wants the alarm to trigger only if the threshold is breached in at least 3 of the last 5 evaluation periods. Which alarm setting provides this?',
    options: opts4(
      'Configure the alarm with an "M out of N" datapoints-to-alarm setting (3 out of 5)',
      'Set the alarm period to 1 second',
      'Use a composite alarm with no rule expression',
      'Disable the alarm during noisy periods'
    ),
    correct: ['a'],
    explanation: 'CloudWatch alarms support "M out of N" evaluation — alarm only when M of the last N datapoints breach — which absorbs brief noise while still catching sustained problems. A 1-second period makes alarms noisier, an empty composite alarm does nothing, and disabling the alarm removes coverage.',
    references: [REF_CW_ALARM, REF_CW]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'An auditor must be able to prove that CloudTrail log files were not modified or deleted after delivery. Which CloudTrail feature provides this assurance?',
    options: opts4(
      'CloudTrail log file integrity validation, which produces digitally signed digest files',
      'CloudWatch metric filters on the trail',
      'S3 Transfer Acceleration on the log bucket',
      'A composite alarm'
    ),
    correct: ['a'],
    explanation: 'Log file integrity validation creates hashed, digitally signed digest files so you can verify whether log files were changed or deleted after CloudTrail delivered them. Metric filters, Transfer Acceleration, and composite alarms do not provide tamper evidence.',
    references: [REF_CT_INTEGRITY, REF_CLOUDTRAIL]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A security team needs a record of every GetObject and PutObject call on a specific sensitive S3 bucket. The default trail does not show these. What must the CloudOps engineer enable?',
    options: opts4(
      'CloudTrail data events for that S3 bucket',
      'CloudTrail management events only',
      'VPC Flow Logs for the bucket',
      'CloudWatch detailed monitoring'
    ),
    correct: ['a'],
    explanation: 'Object-level S3 operations such as GetObject and PutObject are data events, which are not logged by default — they must be explicitly enabled (and can be scoped to specific buckets). Management events cover control-plane actions, Flow Logs cover IP traffic, and detailed monitoring changes metric frequency.',
    references: [REF_CT_DATA_EVENTS, REF_CLOUDTRAIL]
  },
  {
    domain: D1, difficulty: 3, type: QType.SINGLE,
    stem: 'During an incident, a downstream EventBridge target was unavailable and events were lost. The CloudOps team wants to retain events and reprocess them once the target recovers. Which EventBridge features should they use?',
    options: opts4(
      'An event archive to retain events, plus replay to reprocess them, and a dead-letter queue on the target',
      'A CloudWatch dashboard showing the event count',
      'A metric filter on the event bus',
      'S3 Versioning on the target'
    ),
    correct: ['a'],
    explanation: 'EventBridge archives retain events for later replay, and a dead-letter queue captures events that a target failed to process, so nothing is lost. Dashboards and metric filters only show counts, and S3 Versioning does not retain events.',
    references: [REF_EB_ARCHIVE, REF_EVENTBRIDGE]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A routine cleanup runbook should run automatically every Sunday at 03:00 against a fleet of instances, but only within an approved change window. Which combination achieves this?',
    options: opts4(
      'A Systems Manager Maintenance Window with a scheduled task that runs the SSM Automation runbook',
      'A CloudWatch alarm with no actions',
      'An EC2 user data script',
      'A NAT gateway scheduled rule'
    ),
    correct: ['a'],
    explanation: 'A Maintenance Window defines an approved recurring schedule and runs registered tasks — including SSM Automation runbooks — only within that window. An alarm with no actions does nothing, user data runs at launch, and NAT gateways do not schedule tasks.',
    references: [REF_SSM_MW, REF_SSM_AUTO]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A burstable T-family EC2 instance running a steadily busy application is being throttled because it has exhausted its CPU credits. The team wants consistent performance and accepts paying for sustained CPU. What is the simplest change?',
    options: opts4(
      'Enable unlimited mode on the burstable instance (or move to a fixed-performance instance family)',
      'Attach a larger EBS volume',
      'Enable detailed monitoring',
      'Add the instance to a placement group'
    ),
    correct: ['a'],
    explanation: 'Unlimited mode lets a burstable instance sustain high CPU beyond its baseline for an additional charge, removing throttling; a fixed-performance family is the alternative for consistently high CPU. A larger EBS volume, detailed monitoring, and placement groups do not address CPU credit exhaustion.',
    references: [REF_EC2_BURST, REF_EC2]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A company must migrate 50 TB of files from an on-premises NFS server to Amazon S3 quickly, with validation and incremental sync. Which service is purpose-built for this?',
    options: opts4(
      'AWS DataSync',
      'Amazon S3 Transfer Acceleration alone',
      'AWS Backup',
      'Amazon EFS lifecycle management'
    ),
    correct: ['a'],
    explanation: 'AWS DataSync automates and accelerates moving data between on-premises storage (NFS, SMB) and AWS storage services, with integrity verification and incremental transfers. Transfer Acceleration only speeds individual S3 uploads, AWS Backup protects existing AWS resources, and EFS lifecycle management tiers EFS data.',
    references: [REF_DATASYNC, REF_S3]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer must analyze S3 usage across hundreds of buckets to find cost-optimization opportunities such as objects that should move to cheaper storage classes. Which tool provides this organization-wide visibility?',
    options: opts4(
      'Amazon S3 Storage Lens',
      'VPC Flow Logs',
      'AWS Trusted Advisor fault tolerance checks',
      'Amazon CloudWatch Synthetics'
    ),
    correct: ['a'],
    explanation: 'S3 Storage Lens delivers organization-wide visibility into object storage usage and activity with recommendations to optimize cost, such as identifying infrequently accessed data. Flow Logs cover network traffic, Trusted Advisor fault-tolerance checks are not storage analytics, and Synthetics monitors endpoints.',
    references: [REF_S3_STORAGE_LENS, REF_S3_CLASSES]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'An Amazon RDS database is approaching its allocated storage limit and the CloudOps team wants storage to grow automatically before it runs out, avoiding an outage. What should they enable?',
    options: opts4(
      'RDS storage autoscaling, which increases allocated storage when free space is low',
      'A read replica',
      'S3 Lifecycle policies',
      'A larger DB security group'
    ),
    correct: ['a'],
    explanation: 'RDS storage autoscaling automatically increases allocated storage when free space drops below a threshold, up to a configured maximum, preventing storage-full outages. Read replicas scale reads, S3 Lifecycle is for S3, and security groups control network access.',
    references: [REF_RDS_STORAGE_AS, REF_RDS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer needs to deploy and continuously stream all CloudWatch metrics to a third-party monitoring tool with low latency. Which feature is designed for this?',
    options: opts4(
      'CloudWatch metric streams to a destination such as Amazon Data Firehose',
      'A one-time GetMetricData API call each day',
      'A CloudWatch dashboard shared with the vendor',
      'A metric filter'
    ),
    correct: ['a'],
    explanation: 'CloudWatch metric streams continuously deliver metrics in near real time, commonly via Amazon Data Firehose, to destinations including third-party tools. A daily API call is batch, a shared dashboard is not a data feed, and metric filters create metrics from logs.',
    references: [REF_CW_STREAMS, REF_CW]
  },
  {
    domain: D1, difficulty: 3, type: QType.MULTI,
    stem: 'Select TWO accurate statements about Amazon EBS gp3 volumes.',
    options: opts5(
      'gp3 lets you provision IOPS and throughput independently of the volume size',
      'gp3 provides a baseline of 3,000 IOPS regardless of size',
      'gp3 is an HDD volume type optimized for sequential workloads',
      'gp3 volumes cannot be used as EC2 boot volumes',
      'gp3 always costs more than gp2 for equivalent performance'
    ),
    correct: ['a', 'b'],
    explanation: 'gp3 decouples IOPS and throughput from capacity and includes a 3,000 IOPS baseline at any size. gp3 is an SSD type (not HDD), it can be used as a boot volume, and it is generally cheaper than gp2 for equivalent performance.',
    references: [REF_EBS]
  },
  {
    domain: D1, difficulty: 2, type: QType.SINGLE,
    stem: 'The CloudWatch agent is installed on an EC2 instance but no custom metrics or logs appear in CloudWatch, and the agent log shows access-denied errors. What is the most likely cause?',
    options: opts4(
      'The instance role lacks permissions to publish metrics and logs (for example, the CloudWatchAgentServerPolicy)',
      'The instance needs a public IP address',
      'Detailed monitoring is disabled on the instance',
      'The instance is not in a placement group'
    ),
    correct: ['a'],
    explanation: 'The CloudWatch agent uses the EC2 instance role to call CloudWatch and CloudWatch Logs; without the required permissions (commonly granted via the CloudWatchAgentServerPolicy managed policy) those calls are denied. A public IP, detailed monitoring, and placement groups do not affect the agent\'s permission to publish.',
    references: [REF_CW_AGENT, REF_IAM_ROLE_EC2]
  },

  // ── Reliability and Business Continuity (14) ──
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'When an Auto Scaling group launches a new instance, it must finish a lengthy bootstrap and register with an external system before receiving traffic. The CloudOps engineer wants Auto Scaling to pause the instance in a Pending state until bootstrap completes. Which feature provides this?',
    options: opts4(
      'An Auto Scaling lifecycle hook',
      'A scheduled scaling action',
      'A target tracking policy',
      'A cooldown period only'
    ),
    correct: ['a'],
    explanation: 'A lifecycle hook puts an instance into a wait state (Pending:Wait or Terminating:Wait) so custom actions can complete before the instance enters service or is terminated. Scheduled scaling and target tracking control capacity timing, and a cooldown only delays subsequent scaling activities.',
    references: [REF_ASG_LIFECYCLE, REF_ASG]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'An application has a 15-minute instance bootstrap, so scale-out is too slow to absorb sudden traffic spikes. The CloudOps engineer wants pre-initialized instances ready to serve almost immediately. What should they configure?',
    options: opts4(
      'A warm pool for the Auto Scaling group',
      'A longer health check grace period',
      'A larger cooldown period',
      'Termination protection on all instances'
    ),
    correct: ['a'],
    explanation: 'A warm pool maintains pre-initialized instances in a stopped (or running/hibernated) state so scale-out can bring them into service quickly, eliminating the long bootstrap during a spike. Grace periods, cooldowns, and termination protection do not pre-initialize capacity.',
    references: [REF_ASG_WARMPOOL, REF_ASG]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A legacy application stores session state in memory on each instance, so users must keep reaching the same instance behind an Application Load Balancer. Which feature supports this until the app is modernized?',
    options: opts4(
      'Enable sticky sessions (session affinity) on the target group',
      'Enable cross-zone load balancing',
      'Disable health checks',
      'Use a Network Load Balancer with no target group'
    ),
    correct: ['a'],
    explanation: 'Sticky sessions use a load balancer-generated or application cookie to route a user repeatedly to the same target, accommodating in-memory session state. Cross-zone balancing changes distribution, disabling health checks harms reliability, and an NLB without a target group cannot route traffic.',
    references: [REF_ELB_STICKY, REF_ELB]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants an Amazon RDS deployment that provides automatic failover AND lets read traffic be served by the standby instances to improve read throughput. Which option fits?',
    options: opts4(
      'An RDS Multi-AZ DB cluster, which has two readable standby instances',
      'A single-instance Multi-AZ deployment with one non-readable standby',
      'A single-AZ instance with nightly snapshots',
      'A read replica in the same AZ as the primary'
    ),
    correct: ['a'],
    explanation: 'A Multi-AZ DB cluster deployment provisions one writer and two readable standby instances across AZs, giving fast failover and additional read capacity. A classic single-instance Multi-AZ standby is not readable, a single-AZ instance has no failover, and a same-AZ replica adds no AZ resilience.',
    references: [REF_RDS_MAZ, REF_RDS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A DynamoDB table holds critical data. The team wants the ability to restore the table to any second within the last 35 days after an accidental write. What should be enabled?',
    options: opts4(
      'DynamoDB point-in-time recovery (PITR)',
      'A DynamoDB global secondary index',
      'DynamoDB Accelerator (DAX)',
      'On-demand capacity mode'
    ),
    correct: ['a'],
    explanation: 'PITR provides continuous backups and lets you restore a DynamoDB table to any point in time within the retention window (up to 35 days). A global secondary index is a query structure, DAX is a cache, and on-demand capacity controls throughput, not recovery.',
    references: [REF_DDB_PITR]
  },
  {
    domain: D2, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A multi-Region application needs coordinated, well-tested failover with readiness checks and the ability to shift traffic between Regional replicas during a disaster. Which AWS service is purpose-built for this?',
    options: opts4(
      'Amazon Route 53 Application Recovery Controller (ARC)',
      'Amazon CloudFront',
      'AWS Resource Access Manager',
      'Amazon EventBridge'
    ),
    correct: ['a'],
    explanation: 'Route 53 Application Recovery Controller provides readiness checks and routing controls to manage and verify failover across Regional replicas of an application. CloudFront delivers content, RAM shares resources, and EventBridge routes events.',
    references: [REF_ARC, REF_R53]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A compliance rule requires that backup recovery points cannot be deleted or have their retention shortened by anyone — even an administrator — for the duration of the retention period. Which AWS Backup feature enforces this?',
    options: opts4(
      'AWS Backup Vault Lock in compliance mode',
      'S3 Versioning on the backup vault',
      'A backup plan with a copy action',
      'A larger backup window'
    ),
    correct: ['a'],
    explanation: 'AWS Backup Vault Lock in compliance mode makes backups immutable — recovery points cannot be deleted and retention cannot be shortened, even by the account root user, until retention expires. Versioning, copy actions, and backup windows do not provide immutability.',
    references: [REF_BACKUP_VAULTLOCK, REF_BACKUP]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'To protect critical S3 objects against ransomware-style deletion or overwrite, the CloudOps team needs objects to be write-once-read-many for a fixed retention period. Which feature should they use?',
    options: opts4(
      'S3 Object Lock with a retention period (and optionally legal hold)',
      'S3 Transfer Acceleration',
      'S3 Requester Pays',
      'S3 static website hosting'
    ),
    correct: ['a'],
    explanation: 'S3 Object Lock enforces WORM protection: objects (or versions) cannot be deleted or overwritten for the retention period or while a legal hold is in place. Transfer Acceleration, Requester Pays, and website hosting provide no immutability.',
    references: [REF_S3_OBJECTLOCK, REF_S3_VERSIONING]
  },
  {
    domain: D2, difficulty: 3, type: QType.SINGLE,
    stem: 'A globally distributed application built on Amazon Aurora needs a secondary Region that can be promoted within minutes during a Regional outage, with typical cross-Region replication lag of about one second. Which feature meets this?',
    options: opts4(
      'An Amazon Aurora global database',
      'A single-Region Aurora cluster with read replicas',
      'Manual snapshot copies taken nightly',
      'An RDS Multi-AZ deployment'
    ),
    correct: ['a'],
    explanation: 'An Aurora global database replicates to secondary Regions with typically about a second of lag and supports fast cross-Region failover/promotion. In-Region replicas and Multi-AZ do not provide Regional DR, and nightly snapshot copies have a much larger RPO.',
    references: [REF_AURORA_GLOBAL, REF_AURORA]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A non-critical internal application can tolerate several hours of downtime and several hours of data loss in a disaster. The company wants the lowest-cost DR approach. Which strategy fits?',
    options: opts4(
      'Backup and restore — restore infrastructure and data from backups in another Region when needed',
      'Multi-site active/active',
      'Warm standby',
      'Pilot light with continuous database replication'
    ),
    correct: ['a'],
    explanation: 'Backup and restore is the lowest-cost DR strategy and is acceptable when the RTO and RPO can be measured in hours. Multi-site, warm standby, and pilot light all keep more resources running and cost more, which is unnecessary for this tolerance.',
    references: [REF_DR]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'After publishing a new launch template version, a CloudOps engineer must roll all running instances in an Auto Scaling group onto the new version gradually, keeping a minimum healthy percentage in service. Which feature does this?',
    options: opts4(
      'An Auto Scaling group instance refresh',
      'A scheduled scaling action',
      'Increasing the desired capacity',
      'A lifecycle hook only'
    ),
    correct: ['a'],
    explanation: 'An instance refresh replaces instances in the group in batches according to a new launch template/configuration while honoring a minimum healthy percentage. Scheduled scaling and capacity changes do not roll instances onto a new template, and a lifecycle hook alone does not perform the rollout.',
    references: [REF_ASG_REFRESH, REF_ASG]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer must share an encrypted EBS snapshot with another AWS account so that account can create volumes from it. Besides modifying the snapshot permissions, what else is required?',
    options: opts4(
      'Share the customer managed KMS key used to encrypt the snapshot with the other account',
      'Make the snapshot public',
      'Disable encryption on the snapshot',
      'Copy the snapshot to an S3 bucket and share the bucket'
    ),
    correct: ['a'],
    explanation: 'An encrypted EBS snapshot can be shared with another account only if it is encrypted with a customer managed KMS key — snapshots encrypted with the default AWS managed key cannot be shared at all. The receiving account must also be granted permission to use that customer managed key. Encrypted snapshots cannot be made public, disabling encryption is not part of any sharing workflow, and snapshots are not shared by copying them to an S3 bucket.',
    references: [REF_EBS_SNAP, REF_KMS]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'For a workload to survive an Availability Zone failure, the CloudOps engineer is configuring an Application Load Balancer. What is the minimum AZ requirement for the ALB?',
    options: opts4(
      'Enable the ALB in at least two Availability Zones, each with a subnet',
      'Enable the ALB in exactly one Availability Zone',
      'Place the ALB outside any VPC',
      'Use a single subnet shared by all AZs'
    ),
    correct: ['a'],
    explanation: 'An Application Load Balancer requires subnets in at least two Availability Zones, so it remains available if one AZ fails. A single AZ is a single point of failure, an ALB lives within a VPC, and a subnet belongs to exactly one AZ.',
    references: [REF_ELB, REF_VPC]
  },
  {
    domain: D2, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer wants an Auto Scaling group to stay resilient and cost-effective by drawing capacity from several instance types and from both Spot and On-Demand purchase options. Which feature provides this?',
    options: opts4(
      'A mixed instances policy on the Auto Scaling group',
      'A launch template pinned to a single instance type',
      'A cluster placement group',
      'A scheduled scaling action'
    ),
    correct: ['a'],
    explanation: 'A mixed instances policy lets one Auto Scaling group span multiple instance types and combine Spot and On-Demand capacity, improving resilience to Spot interruptions and capacity shortages while lowering cost. A single instance type, a placement group, and scheduled scaling do not diversify capacity sources.',
    references: [{ label: 'AWS Docs — Auto Scaling groups with multiple instance types and purchase options', url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-mixed-instances-groups.html' }, REF_ASG]
  },

  // ── Deployment, Provisioning, and Automation (15) ──
  {
    domain: D3, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A single CloudFormation template should create an Amazon RDS read replica only in the production environment, but skip it in dev and test. Which template feature supports this?',
    options: opts4(
      'Conditions, used to control whether the read replica resource is created',
      'Outputs',
      'Metadata',
      'A stack policy'
    ),
    correct: ['a'],
    explanation: 'CloudFormation Conditions evaluate input (such as an environment parameter) and control whether resources are created or properties applied — perfect for creating the replica only in prod. Outputs export values, Metadata holds extra information, and stack policies protect resources during updates.',
    references: [REF_CFN_CONDITIONS, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'CloudFormation drift detection shows that a stack-managed security group was changed manually. The CloudOps team wants the resource brought back to match the template. What is the recommended action?',
    options: opts4(
      'Update the stack (for example, by reapplying the template) so CloudFormation reconciles the resource to the template definition',
      'Manually keep the out-of-band change and ignore drift forever',
      'Delete the entire stack',
      'Disable drift detection'
    ),
    correct: ['a'],
    explanation: 'After drift is detected, performing a stack update reconciles the resource back to the template-defined configuration, restoring managed state. Ignoring drift leaves configuration unmanaged, deleting the stack is destructive, and disabling drift detection only hides the problem.',
    references: [REF_CFN_DRIFT, REF_CFN]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudOps engineer wants a CloudFormation stack update to automatically roll back if a CloudWatch alarm enters the ALARM state during or shortly after the update. Which feature provides this?',
    options: opts4(
      'Rollback triggers configured with monitored CloudWatch alarms on the stack operation',
      'A stack policy denying updates',
      'A DeletionPolicy of Retain',
      'Termination protection'
    ),
    correct: ['a'],
    explanation: 'Rollback triggers let you specify CloudWatch alarms to monitor during a create/update; if an alarm fires within the monitoring window, CloudFormation rolls the operation back. Stack policies, DeletionPolicy, and termination protection do not monitor alarms to trigger rollback.',
    references: [REF_CFN_ROLLBACK_TRIGGER, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudFormation template must reference the AWS account ID and Region it is deployed into, without hard-coding them. What should the CloudOps engineer use?',
    options: opts4(
      'Pseudo parameters such as AWS::AccountId and AWS::Region',
      'Hard-coded strings updated per deployment',
      'A separate template per account and Region',
      'A stack policy'
    ),
    correct: ['a'],
    explanation: 'Pseudo parameters are predefined values (AWS::AccountId, AWS::Region, AWS::StackName, and others) that CloudFormation resolves at deploy time, keeping templates portable. Hard-coded values and per-environment templates create maintenance burden, and stack policies are unrelated.',
    references: [REF_CFN, REF_CFN_CONDITIONS]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps team must approve only critical and security operating-system patches automatically, with a 7-day delay after release, for a fleet managed by Patch Manager. Where is this defined?',
    options: opts4(
      'In a patch baseline, using approval rules with classification, severity, and an auto-approval delay',
      'In an IAM permissions boundary',
      'In a CloudFormation stack policy',
      'In a Route 53 health check'
    ),
    correct: ['a'],
    explanation: 'A Patch Manager patch baseline defines approval rules — filtering by classification and severity, with an auto-approval delay — and lists explicit approved/rejected patches. Permissions boundaries, stack policies, and health checks are unrelated to patch approval.',
    references: [REF_SSM_PATCH_BASELINE, REF_SSM_PATCH]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer must install and consistently update a third-party monitoring agent package across a large managed-instance fleet. Which Systems Manager capability is designed to package and deploy software?',
    options: opts4(
      'Systems Manager Distributor',
      'Systems Manager Parameter Store',
      'Systems Manager Inventory',
      'Systems Manager Session Manager'
    ),
    correct: ['a'],
    explanation: 'Systems Manager Distributor lets you package, version, and deploy software (such as agents) to managed instances. Parameter Store stores configuration data, Inventory collects metadata, and Session Manager provides shell access.',
    references: [REF_SSM_DISTRIBUTOR, REF_SSM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'An EventBridge rule passes raw event JSON to an SNS topic, but the operations team wants a concise human-readable message instead of the full event. Which EventBridge feature reshapes the event before delivery?',
    options: opts4(
      'An input transformer on the rule target',
      'A dead-letter queue',
      'A composite alarm',
      'A subscription filter'
    ),
    correct: ['a'],
    explanation: 'An EventBridge input transformer extracts values from the event and builds a custom payload (such as a readable sentence) before sending it to the target. A dead-letter queue captures failed deliveries, composite alarms combine alarms, and subscription filters belong to CloudWatch Logs.',
    references: [REF_EVENTBRIDGE]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A Lambda function processing messages occasionally fails, and the failed events are lost. The CloudOps engineer wants failed asynchronous invocations captured for investigation. What should they configure?',
    options: opts4(
      'A dead-letter queue (or an on-failure destination) for the Lambda function',
      'A larger function memory size',
      'A CloudWatch dashboard',
      'S3 Versioning on the function code bucket'
    ),
    correct: ['a'],
    explanation: 'For asynchronous invocations, a dead-letter queue or an on-failure destination captures events that exhaust retries, so they can be inspected and reprocessed. More memory may speed execution but does not capture failures, and dashboards and code-bucket versioning do not retain failed events.',
    references: [REF_LAMBDA]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudOps engineer wants users to deploy CloudFormation stacks without granting their own IAM identities broad permissions to create the underlying resources. Which approach achieves this?',
    options: opts4(
      'Attach a CloudFormation service role to the stack so CloudFormation uses that role to create resources',
      'Give every user AdministratorAccess',
      'Disable IAM for CloudFormation operations',
      'Use the account root user to deploy all stacks'
    ),
    correct: ['a'],
    explanation: 'A CloudFormation service role lets CloudFormation make the resource calls using that role\'s permissions, so users only need permission to operate the stack — not to create the resources directly. Granting broad admin rights, disabling IAM, or using the root user are insecure.',
    references: [REF_CFN_SERVICEROLE, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CodeDeploy deployment should automatically roll back if a CloudWatch alarm indicates elevated application errors during the deployment. How is this configured?',
    options: opts4(
      'Associate the CloudWatch alarm with the deployment group and enable automatic rollback on alarm',
      'Disable rollback so the deployment always completes',
      'Set the deployment configuration to all-at-once',
      'Remove health checks from the target group'
    ),
    correct: ['a'],
    explanation: 'CodeDeploy deployment groups can monitor CloudWatch alarms and automatically roll back if an alarm activates during deployment. Disabling rollback removes the safety net, all-at-once increases blast radius, and removing health checks hides failures.',
    references: [REF_CODEDEPLOY, REF_CW_ALARM]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudFormation template provisions EC2 instances and must not report CREATE_COMPLETE until the application on each instance has finished bootstrapping and signaled success. Which mechanism enforces this?',
    options: opts4(
      'A CreationPolicy on the resource together with cfn-signal sent from the instance',
      'A DeletionPolicy of Snapshot',
      'A stack policy',
      'A Mappings section'
    ),
    correct: ['a'],
    explanation: 'A CreationPolicy makes CloudFormation wait for a specified number of success signals (sent by cfn-signal) before marking the resource complete. DeletionPolicy governs deletion behavior, stack policies protect updates, and Mappings hold lookup values.',
    references: [REF_CFN_INIT, REF_CFN]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudOps engineer must run a single SSM Automation runbook against resources in 30 accounts and 4 Regions in a controlled, rate-limited way. Which capability supports this?',
    options: opts4(
      'Systems Manager Automation with multi-account and multi-Region execution, using rate control (concurrency and error thresholds)',
      'Run Command targeting a single instance ID',
      'A CloudWatch dashboard',
      'A NAT gateway per Region'
    ),
    correct: ['a'],
    explanation: 'SSM Automation supports multi-account and multi-Region execution with rate control — concurrency limits and error thresholds — to run a runbook broadly and safely. Run Command against one instance does not scale to accounts/Regions, and dashboards and NAT gateways do not run automations.',
    references: [REF_SSM_AUTO, REF_SSM]
  },
  {
    domain: D3, difficulty: 3, type: QType.SINGLE,
    stem: 'A CloudFormation template must provision a resource type that CloudFormation does not natively support, by calling a Lambda function during stack operations. Which feature enables this?',
    options: opts4(
      'A CloudFormation custom resource backed by a Lambda function',
      'A nested stack',
      'A stack policy',
      'A change set'
    ),
    correct: ['a'],
    explanation: 'A custom resource lets CloudFormation invoke a Lambda function (or SNS topic) during create/update/delete to provision logic or resources CloudFormation does not natively support. Nested stacks compose templates, stack policies protect resources, and change sets preview updates.',
    references: [REF_CFN_CUSTOM, REF_CFN]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps team wants golden AMIs to always include a defined set of build and test steps, packaged so they can be reused across multiple image pipelines. Which EC2 Image Builder construct holds those reusable steps?',
    options: opts4(
      'Components, referenced by an image recipe',
      'A CloudFormation change set',
      'An S3 Lifecycle policy',
      'A Route 53 routing policy'
    ),
    correct: ['a'],
    explanation: 'In EC2 Image Builder, components define build and test steps; an image recipe combines a base image with selected components, and recipes are used by pipelines. Change sets, S3 Lifecycle policies, and Route 53 routing policies are unrelated to image building.',
    references: [REF_IMAGE_BUILDER]
  },
  {
    domain: D3, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps team uses Terraform and wants safe collaboration: a shared, locked state file and version history of infrastructure changes. Which practices address this?',
    options: opts4(
      'Store Terraform state in a remote backend with state locking, and keep the configuration in a Git repository',
      'Keep the only copy of state on one engineer\'s laptop',
      'Email the state file between team members',
      'Disable state entirely and apply blindly'
    ),
    correct: ['a'],
    explanation: 'A remote backend with locking prevents concurrent conflicting applies, and keeping the configuration in Git provides version history and review. A single laptop copy, emailing state, or disabling state are all error-prone and unsafe.',
    references: [REF_CDK, REF_CFN]
  },

  // ── Security and Compliance (10) ──
  {
    domain: D4, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A developer needs to run AWS CLI commands from their laptop. Which approach follows AWS security best practice?',
    options: opts4(
      'Use short-term credentials via IAM Identity Center (or assume a role), granting only the permissions the task needs',
      'Create an IAM user with AdministratorAccess and long-lived access keys',
      'Share the account root user access keys with the team',
      'Embed access keys in a public Git repository for convenience'
    ),
    correct: ['a'],
    explanation: 'Best practice is short-term credentials (IAM Identity Center or assumed roles) scoped with least privilege. Long-lived admin keys, root user keys, and keys committed to source control are serious security risks.',
    references: [REF_IAM_IC, REF_IAM]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'A user has an IAM identity policy that allows s3:DeleteObject, but a service control policy on their account explicitly denies s3:DeleteObject. What is the effective result?',
    options: opts4(
      'The action is denied — an explicit deny anywhere in the evaluation always overrides any allow',
      'The action is allowed because the identity policy grants it',
      'The two policies cancel out and the user is prompted',
      'The action is allowed only from the AWS Management Console'
    ),
    correct: ['a'],
    explanation: 'In IAM policy evaluation, an explicit deny — whether in an SCP, identity policy, or resource policy — always overrides any allow. Because the SCP explicitly denies the action, the user cannot perform it regardless of the identity policy.',
    references: [REF_IAM_EVAL, REF_ORG_SCP]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization must ensure every resource across all accounts is tagged with a CostCenter tag using a consistent set of allowed values. Which AWS Organizations feature helps enforce tagging standards?',
    options: opts4(
      'Tag policies',
      'Service control policies that delete untagged resources',
      'A permissions boundary',
      'A CloudWatch alarm'
    ),
    correct: ['a'],
    explanation: 'Tag policies in AWS Organizations define and standardize tag keys and allowed values across accounts and report non-compliant resources. SCPs cap permissions (and do not delete resources), permissions boundaries limit IAM entities, and alarms only notify.',
    references: [REF_ORG_TAG_POLICY, REF_ORG_SCP]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A company encrypts data with AWS KMS and needs the SAME key identity usable in multiple Regions so that data encrypted in one Region can be decrypted in another. Which KMS feature provides this?',
    options: opts4(
      'KMS multi-Region keys',
      'A single-Region customer managed key',
      'An AWS managed key',
      'KMS automatic key rotation'
    ),
    correct: ['a'],
    explanation: 'Multi-Region keys are KMS keys with the same key ID and key material replicated across Regions, so ciphertext from one Region can be decrypted by the related key in another. Single-Region and AWS managed keys are Region-bound, and rotation changes key material rather than enabling cross-Region use.',
    references: [REF_KMS_MRK, REF_KMS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer requests a public TLS certificate from AWS Certificate Manager for a domain hosted in Amazon Route 53 and wants validation and future renewals to be hands-off. Which validation method should they choose?',
    options: opts4(
      'DNS validation, with the validation CNAME record added to the Route 53 hosted zone',
      'Email validation to the domain administrator',
      'Manual approval in the support console',
      'No validation is required for public certificates'
    ),
    correct: ['a'],
    explanation: 'DNS validation lets ACM validate domain ownership via a CNAME record and renew certificates automatically as long as the record remains. Email validation requires manual action on each renewal, manual approval is not the mechanism, and validation is always required.',
    references: [REF_ACM]
  },
  {
    domain: D4, difficulty: 3, type: QType.SINGLE,
    stem: 'When Amazon GuardDuty produces a high-severity finding, the CloudOps team wants an automated response to run immediately. How should they wire this up?',
    options: opts4(
      'Send GuardDuty findings to Amazon EventBridge and match high-severity findings with a rule that triggers a Lambda function or SSM Automation runbook',
      'Poll the GuardDuty console manually every hour',
      'Forward all findings only to an email inbox',
      'Disable the finding type that is too noisy'
    ),
    correct: ['a'],
    explanation: 'GuardDuty findings are delivered to EventBridge, where a rule can match severity and trigger automated remediation through Lambda or SSM Automation. Manual polling and email-only delivery are not automated, and disabling a finding type reduces visibility.',
    references: [REF_GUARDDUTY, REF_EVENTBRIDGE]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A compliance team must evaluate all accounts against a published framework (such as a CIS or PCI-aligned set of controls) using AWS Config, deployed consistently as a single package. Which AWS Config feature should they use?',
    options: opts4(
      'AWS Config conformance packs',
      'A single AWS Config rule per account',
      'A CloudWatch dashboard',
      'An IAM permissions boundary'
    ),
    correct: ['a'],
    explanation: 'A conformance pack is a collection of AWS Config rules and remediation actions packaged together and deployable across an organization, ideal for a compliance framework. A single rule is not a framework, dashboards do not evaluate compliance, and permissions boundaries limit IAM permissions.',
    references: [REF_CONFIG_PACKS, REF_CONFIG]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A database password stored in AWS Secrets Manager must be changed every 30 days without application downtime or manual steps. What should the CloudOps engineer configure?',
    options: opts4(
      'Automatic rotation on the secret, using a rotation schedule and a rotation function',
      'A reminder in a calendar to rotate the secret manually',
      'A CloudWatch alarm on the secret',
      'S3 Versioning on the secret'
    ),
    correct: ['a'],
    explanation: 'Secrets Manager automatic rotation uses a rotation Lambda function on a schedule to change the credential and update both the secret and the data store, with no downtime. A manual reminder is error-prone, alarms only notify, and S3 Versioning does not apply to secrets.',
    references: [REF_SECRETS, REF_KMS]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'A security team must see all Security Hub findings from every account and Region in one place. Which configuration provides this consolidated view?',
    options: opts4(
      'Designate a Security Hub delegated administrator account and enable cross-Region finding aggregation',
      'Log in to each account and Region separately to review findings',
      'Forward findings to a single S3 bucket and stop using Security Hub',
      'Enable detailed monitoring in every Region'
    ),
    correct: ['a'],
    explanation: 'A Security Hub delegated administrator account aggregates findings across member accounts, and cross-Region aggregation consolidates findings from multiple Regions into one aggregation Region. Logging in separately is not consolidated, abandoning Security Hub loses its checks, and detailed monitoring is unrelated.',
    references: [REF_SECURITYHUB]
  },
  {
    domain: D4, difficulty: 2, type: QType.SINGLE,
    stem: 'For compliance, CloudTrail log files delivered to Amazon S3 must be encrypted with a key the company controls and audits. How should the CloudOps engineer configure the trail?',
    options: opts4(
      'Configure the trail to encrypt log files with an AWS KMS customer managed key (SSE-KMS)',
      'Leave the log files unencrypted to simplify access',
      'Store the log files on an EC2 instance store volume',
      'Disable the trail to avoid storing logs'
    ),
    correct: ['a'],
    explanation: 'CloudTrail can encrypt delivered log files with an SSE-KMS customer managed key, giving the company control over and audit logging of key usage. Unencrypted logs fail the requirement, instance store is ephemeral, and disabling the trail eliminates the audit record entirely.',
    references: [REF_CLOUDTRAIL, REF_KMS]
  },

  // ── Networking and Content Delivery (12) ──
  {
    domain: D5, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Web-tier instances must accept traffic only from the load balancer, not from arbitrary IP addresses. What is the cleanest security group configuration on the web-tier instances?',
    options: opts4(
      'An inbound rule that allows the application port with the load balancer\'s security group as the source',
      'An inbound rule allowing the application port from 0.0.0.0/0',
      'No inbound rules at all',
      'An inbound rule allowing all ports from 0.0.0.0/0'
    ),
    correct: ['a'],
    explanation: 'A security group rule can reference another security group as its source, so the web tier accepts the application port only from instances in the load balancer\'s security group. Allowing 0.0.0.0/0 exposes the instances broadly, and no inbound rules block the load balancer too.',
    references: [REF_SG, REF_VPC]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer wants VPC Flow Logs that can be queried quickly and used to drive metric filters and alarms on rejected traffic. Which Flow Logs destination best supports this?',
    options: opts4(
      'Amazon CloudWatch Logs',
      'An EC2 instance store volume',
      'An EBS snapshot',
      'A Route 53 hosted zone'
    ),
    correct: ['a'],
    explanation: 'Sending VPC Flow Logs to CloudWatch Logs allows Logs Insights queries and metric filters/alarms (for example, on REJECT records). Flow Logs can also go to S3 for cheaper bulk analysis, but instance store, EBS snapshots, and hosted zones are not valid Flow Logs destinations.',
    references: [REF_FLOW_LOGS, REF_CW_LOGS]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudOps engineer wants Route 53 to return up to eight healthy IP addresses for a domain and rely on health checks, improving availability for a simple application without a load balancer. Which routing policy fits?',
    options: opts4(
      'Multivalue answer routing with health checks',
      'Simple routing with one value',
      'Failover routing',
      'Geolocation routing'
    ),
    correct: ['a'],
    explanation: 'Multivalue answer routing returns multiple healthy records (up to eight) and uses health checks so unhealthy endpoints are not returned, giving basic availability without a load balancer. Simple routing has no health checks, failover is primary/secondary, and geolocation routes by location.',
    references: [REF_R53_ROUTING, REF_R53_HEALTH]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudFront-fronted application must stay available even if the primary origin returns errors. Which CloudFront feature serves content from a backup origin in that case?',
    options: opts4(
      'An origin group with origin failover',
      'A larger cache TTL',
      'Field-level encryption',
      'A geo restriction'
    ),
    correct: ['a'],
    explanation: 'A CloudFront origin group designates a primary and secondary origin; on configured failure responses CloudFront fails over to the secondary origin. A larger TTL only extends caching, field-level encryption protects sensitive fields, and geo restriction limits access by country.',
    references: [REF_CF_ORIGIN_FAILOVER, REF_CLOUDFRONT]
  },
  {
    domain: D5, difficulty: 3, type: QType.SINGLE,
    stem: 'A company wants to privately expose an internal application running behind a Network Load Balancer to selected customer VPCs in other accounts, without VPC peering. What should the provider configure?',
    options: opts4(
      'A VPC endpoint service (AWS PrivateLink), which consumers reach through interface VPC endpoints',
      'A NAT gateway in each consumer VPC',
      'A public Application Load Balancer open to the internet',
      'A transit gateway shared with every customer'
    ),
    correct: ['a'],
    explanation: 'With AWS PrivateLink, the provider publishes a VPC endpoint service fronted by a Network Load Balancer, and consumers connect privately via interface VPC endpoints — no peering or internet exposure. NAT gateways provide egress, a public ALB exposes the app, and a shared transit gateway over-connects networks.',
    references: [REF_PRIVATELINK, REF_VPC]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'Instances in a VPC cannot resolve the private DNS hostnames of other resources or of VPC interface endpoints. Which VPC attributes must be checked?',
    options: opts4(
      'enableDnsSupport and enableDnsHostnames on the VPC',
      'The CloudFront cache policy',
      'The S3 bucket policy',
      'The EC2 instance type'
    ),
    correct: ['a'],
    explanation: 'Private DNS resolution within a VPC depends on the enableDnsSupport and enableDnsHostnames attributes; both typically must be enabled for private hostnames and interface endpoint private DNS to resolve. CloudFront policies, S3 bucket policies, and instance types do not affect VPC DNS resolution.',
    references: [REF_VPC_DNS, REF_VPC]
  },
  {
    domain: D5, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Instances in a private subnet use IPv6 and must make outbound connections to the internet but must not be reachable from the internet. Which gateway provides IPv6-only outbound access?',
    options: opts4(
      'An egress-only internet gateway',
      'A NAT gateway',
      'A standard internet gateway attached to the private subnet',
      'A virtual private gateway'
    ),
    correct: ['a'],
    explanation: 'An egress-only internet gateway allows outbound-only IPv6 traffic and blocks inbound connections, the IPv6 equivalent of what a NAT gateway does for IPv4. A NAT gateway is for IPv4, an internet gateway allows inbound too, and a virtual private gateway is for VPN connectivity.',
    references: [REF_EIGW, REF_NAT]
  },
  {
    domain: D5, difficulty: 3, type: QType.SINGLE,
    stem: 'A company has several VPCs in multiple Regions and an AWS Direct Connect connection, and wants those VPCs to reach on-premises over Direct Connect through a single logical connection point. Which construct should be used?',
    options: opts4(
      'A Direct Connect gateway, associating the VPCs (or transit gateways) with it',
      'A separate Direct Connect circuit per VPC',
      'A NAT gateway in each VPC',
      'VPC peering between every VPC and on-premises'
    ),
    correct: ['a'],
    explanation: 'A Direct Connect gateway is a globally available resource that lets you connect VPCs (directly or via transit gateways) across Regions to a Direct Connect connection. A circuit per VPC is costly and unnecessary, NAT gateways provide internet egress, and you cannot peer a VPC with on-premises.',
    references: [REF_DX_GATEWAY, REF_DX]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A regulation requires that users in certain countries are blocked from accessing a web application, decided at the DNS layer. Which Route 53 routing policy should be used?',
    options: opts4(
      'Geolocation routing',
      'Latency-based routing',
      'Weighted routing',
      'Simple routing'
    ),
    correct: ['a'],
    explanation: 'Geolocation routing answers DNS queries based on the user\'s geographic location, so you can route or block specific countries (CloudFront geo restriction is the complementary control at the CDN layer). Latency, weighted, and simple routing do not make decisions based on user location.',
    references: [REF_R53_ROUTING, REF_R53]
  },
  {
    domain: D5, difficulty: 2, type: QType.SINGLE,
    stem: 'A CloudFront distribution has a poor cache hit ratio because requests include many query strings and headers that do not affect the response. Which configuration improves the hit ratio?',
    options: opts4(
      'Use a cache policy that includes only the query strings, headers, and cookies that actually vary the response in the cache key',
      'Set the minimum TTL to zero',
      'Disable caching entirely',
      'Add more origins'
    ),
    correct: ['a'],
    explanation: 'A cache policy controls the cache key; including only the values that genuinely vary the response means more requests match a cached object, raising the hit ratio. A zero minimum TTL and disabling caching reduce hits, and adding origins does not change cache behavior.',
    references: [REF_CF_CACHE, REF_CLOUDFRONT]
  },
  {
    domain: D5, difficulty: 3, type: QType.SINGLE,
    stem: 'An EC2 instance cannot reach another instance, and the CloudOps engineer wants AWS to analyze the path and identify the exact blocking component (a security group, NACL, or route) without sending live traffic. Which tool should they use?',
    options: opts4(
      'VPC Reachability Analyzer',
      'Amazon CloudWatch Synthetics',
      'AWS Trusted Advisor',
      'Amazon Inspector'
    ),
    correct: ['a'],
    explanation: 'VPC Reachability Analyzer performs static configuration analysis of the network path between two resources and identifies the blocking component when they are not reachable — without sending packets. Synthetics probes endpoints, Trusted Advisor gives best-practice checks, and Inspector scans for vulnerabilities.',
    references: [REF_REACHABILITY, REF_VPC]
  },
  {
    domain: D5, difficulty: 3, type: QType.MULTI,
    stem: 'A public web application is being hit by a flood of requests from a small number of IP addresses. Select TWO controls that help mitigate this at the application edge.',
    options: opts5(
      'An AWS WAF rate-based rule that blocks IPs exceeding a request threshold',
      'An AWS WAF IP set rule that blocks the specific offending IP addresses',
      'Deleting the Application Load Balancer',
      'Opening all security group ports to 0.0.0.0/0',
      'Disabling CloudWatch metrics for the distribution'
    ),
    correct: ['a', 'b'],
    explanation: 'A WAF rate-based rule blocks source IPs that exceed a request rate, and a WAF IP set rule blocks the specific known-bad addresses — both mitigate the flood at Layer 7. Deleting the load balancer causes an outage, opening all ports worsens exposure, and disabling metrics only reduces visibility.',
    references: [REF_WAF, REF_SHIELD]
  }
];

const SOA_C03_DOMAINS = [
  { name: D1, weight: 22 },
  { name: D2, weight: 22 },
  { name: D3, weight: 22 },
  { name: D4, weight: 16 },
  { name: D5, weight: 18 }
];

const SOA_C03_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'aws-soa-c03-p1',
    code: 'SOA-C03-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 130-minute, 65-question, blueprint-weighted set covering monitoring, logging, analysis, remediation, and performance optimization; reliability and business continuity; deployment, provisioning, and automation; security and compliance; and networking and content delivery.',
    questions: P1
  },
  {
    slug: 'aws-soa-c03-p2',
    code: 'SOA-C03-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 130-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'aws-soa-c03-p3',
    code: 'SOA-C03-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 130-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const SOA_C03_BUNDLE = {
  slug: 'aws-soa-c03',
  title: 'AWS Certified CloudOps Engineer — Associate (SOA-C03)',
  description: 'All 3 SOA-C03 practice exams in one bundle — 195 curated questions covering monitoring, logging, analysis, remediation, and performance optimization (CloudWatch, CloudTrail, EventBridge, Systems Manager); reliability and business continuity (Auto Scaling, ELB, Route 53, AWS Backup, disaster recovery); deployment, provisioning, and automation (CloudFormation, StackSets, EC2 Image Builder, the AWS CDK); security and compliance (IAM, AWS KMS, AWS Config, GuardDuty, Security Hub); and networking and content delivery (VPC, Route 53, CloudFront, AWS Global Accelerator). Aligned to the official AWS Certified CloudOps Engineer - Associate (SOA-C03) exam guide.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 15000 // USD 150 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the SOA-C03 bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:soa-c03-seed'` are deleted and re-created.
 */
export async function seedSoaC03(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'aws' } });
  await db.vendor.upsert({
    where: { slug: 'aws' },
    update: {},
    create: { slug: 'aws', name: 'Amazon Web Services', description: 'Cloud certifications from AWS.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'aws' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of SOA_C03_EXAMS) {
    const title = `AWS Certified CloudOps Engineer — Associate (SOA-C03) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official AWS SOA-C03 exam guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 130,
      passingScore: 72,
      questionCount: e.questions.length,
      domains: SOA_C03_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:soa-c03-seed' } });
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
          generatedBy: 'manual:soa-c03-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: SOA_C03_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: SOA_C03_BUNDLE.slug },
    update: {
      title: SOA_C03_BUNDLE.title,
      description: SOA_C03_BUNDLE.description,
      price: SOA_C03_BUNDLE.price,
      priceVoucher: SOA_C03_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: SOA_C03_BUNDLE.slug,
      title: SOA_C03_BUNDLE.title,
      description: SOA_C03_BUNDLE.description,
      price: SOA_C03_BUNDLE.price,
      priceVoucher: SOA_C03_BUNDLE.priceVoucher,
      published: true
    }
  });

  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'aws-soa-c03-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'aws-soa-c03-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'aws-soa-c03-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'aws-soa-c03-p1', tier: 'VOUCHER' as const, position: 4 }
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
