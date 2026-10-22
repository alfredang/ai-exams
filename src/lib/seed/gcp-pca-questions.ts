/**
 * Google Professional Cloud Architect (PCA) bundle seed — vendor, three
 * practice-exam variants, bundle, and 195 blueprint-aligned questions.
 * Idempotent: replaces rows tagged `generatedBy: 'manual:gcp-pca-seed'`
 * and upserts catalog rows.
 *
 * Exported as `seedGcpPca(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/gcp-pca.ts`) and the protected
 * admin API (`/api/admin/seed-gcp-pca`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Google Cloud docs and
 * the Professional Cloud Architect domain blueprint:
 *   - Designing and planning a cloud solution architecture        — 24% (16)
 *   - Managing and provisioning a solution infrastructure          — 18% (12)
 *   - Designing for security and compliance                        — 18% (12)
 *   - Analyzing and optimizing technical and business processes    — 13% (8)
 *   - Managing implementation                                      — 12% (8)
 *   - Ensuring solution and operations reliability                 — 15% (9)
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

const DESIGN = 'Designing and planning a cloud solution architecture';
const PROVISION = 'Managing and provisioning a solution infrastructure';
const SECURITY = 'Designing for security and compliance';
const ANALYZE = 'Analyzing and optimizing technical and business processes';
const IMPL = 'Managing implementation';
const RELIABILITY = 'Ensuring solution and operations reliability';

const REF_ARCH = { label: 'Google Cloud — Architecture Framework', url: 'https://cloud.google.com/architecture/framework' };
const REF_GKE = { label: 'Google Cloud — GKE overview', url: 'https://cloud.google.com/kubernetes-engine/docs/concepts/kubernetes-engine-overview' };
const REF_GKE_AUTOPILOT = { label: 'Google Cloud — GKE Autopilot overview', url: 'https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview' };
const REF_GCE = { label: 'Google Cloud — Compute Engine documentation', url: 'https://cloud.google.com/compute/docs' };
const REF_MIG = { label: 'Google Cloud — Managed instance groups', url: 'https://cloud.google.com/compute/docs/instance-groups' };
const REF_PREEMPTIBLE = { label: 'Google Cloud — Spot VMs', url: 'https://cloud.google.com/compute/docs/instances/spot' };
const REF_RUN = { label: 'Google Cloud — Cloud Run documentation', url: 'https://cloud.google.com/run/docs' };
const REF_APPENGINE = { label: 'Google Cloud — App Engine documentation', url: 'https://cloud.google.com/appengine/docs' };
const REF_FUNCTIONS = { label: 'Google Cloud — Cloud Functions documentation', url: 'https://cloud.google.com/functions/docs' };
const REF_VPC = { label: 'Google Cloud — VPC overview', url: 'https://cloud.google.com/vpc/docs/vpc' };
const REF_SHARED_VPC = { label: 'Google Cloud — Shared VPC', url: 'https://cloud.google.com/vpc/docs/shared-vpc' };
const REF_PEERING = { label: 'Google Cloud — VPC Network Peering', url: 'https://cloud.google.com/vpc/docs/vpc-peering' };
const REF_INTERCONNECT = { label: 'Google Cloud — Cloud Interconnect', url: 'https://cloud.google.com/network-connectivity/docs/interconnect' };
const REF_VPN = { label: 'Google Cloud — Cloud VPN overview', url: 'https://cloud.google.com/network-connectivity/docs/vpn/concepts/overview' };
const REF_LB = { label: 'Google Cloud — Cloud Load Balancing overview', url: 'https://cloud.google.com/load-balancing/docs/load-balancing-overview' };
const REF_CLOUDSQL = { label: 'Google Cloud — Cloud SQL documentation', url: 'https://cloud.google.com/sql/docs' };
const REF_SPANNER = { label: 'Google Cloud — Spanner documentation', url: 'https://cloud.google.com/spanner/docs' };
const REF_BIGTABLE = { label: 'Google Cloud — Bigtable overview', url: 'https://cloud.google.com/bigtable/docs/overview' };
const REF_BIGQUERY = { label: 'Google Cloud — BigQuery documentation', url: 'https://cloud.google.com/bigquery/docs' };
const REF_FIRESTORE = { label: 'Google Cloud — Firestore documentation', url: 'https://cloud.google.com/firestore/docs' };
const REF_MEMSTORE = { label: 'Google Cloud — Memorystore documentation', url: 'https://cloud.google.com/memorystore/docs' };
const REF_STORAGE = { label: 'Google Cloud — Cloud Storage documentation', url: 'https://cloud.google.com/storage/docs' };
const REF_STORAGE_CLASS = { label: 'Google Cloud — Cloud Storage storage classes', url: 'https://cloud.google.com/storage/docs/storage-classes' };
const REF_PUBSUB = { label: 'Google Cloud — Pub/Sub documentation', url: 'https://cloud.google.com/pubsub/docs' };
const REF_DATAFLOW = { label: 'Google Cloud — Dataflow documentation', url: 'https://cloud.google.com/dataflow/docs' };
const REF_IAM = { label: 'Google Cloud — IAM overview', url: 'https://cloud.google.com/iam/docs/overview' };
const REF_IAM_BEST = { label: 'Google Cloud — IAM best practices', url: 'https://cloud.google.com/iam/docs/using-iam-securely' };
const REF_SA = { label: 'Google Cloud — Service accounts overview', url: 'https://cloud.google.com/iam/docs/service-account-overview' };
const REF_ORGPOLICY = { label: 'Google Cloud — Organization Policy Service', url: 'https://cloud.google.com/resource-manager/docs/organization-policy/overview' };
const REF_RESMGR = { label: 'Google Cloud — Resource hierarchy', url: 'https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy' };
const REF_VPCSC = { label: 'Google Cloud — VPC Service Controls overview', url: 'https://cloud.google.com/vpc-service-controls/docs/overview' };
const REF_KMS = { label: 'Google Cloud — Cloud KMS documentation', url: 'https://cloud.google.com/kms/docs' };
const REF_CMEK = { label: 'Google Cloud — Customer-managed encryption keys', url: 'https://cloud.google.com/kms/docs/cmek' };
const REF_SECMGR = { label: 'Google Cloud — Secret Manager documentation', url: 'https://cloud.google.com/secret-manager/docs' };
const REF_SCC = { label: 'Google Cloud — Security Command Center overview', url: 'https://cloud.google.com/security-command-center/docs/security-command-center-overview' };
const REF_ARMOR = { label: 'Google Cloud — Cloud Armor overview', url: 'https://cloud.google.com/armor/docs/cloud-armor-overview' };
const REF_SRE = { label: 'Google Cloud — SRE fundamentals: SLIs, SLOs, SLAs', url: 'https://cloud.google.com/architecture/framework/reliability' };
const REF_MONITORING = { label: 'Google Cloud — Cloud Monitoring documentation', url: 'https://cloud.google.com/monitoring/docs' };
const REF_LOGGING = { label: 'Google Cloud — Cloud Logging documentation', url: 'https://cloud.google.com/logging/docs' };
const REF_DR = { label: 'Google Cloud — Disaster recovery planning guide', url: 'https://cloud.google.com/architecture/dr-scenarios-planning-guide' };
const REF_COST = { label: 'Google Cloud — Cost optimization on Google Cloud', url: 'https://cloud.google.com/architecture/framework/cost-optimization' };
const REF_CUD = { label: 'Google Cloud — Committed use discounts', url: 'https://cloud.google.com/docs/cuds' };
const REF_BILLING = { label: 'Google Cloud — Cloud Billing documentation', url: 'https://cloud.google.com/billing/docs' };
const REF_TERRAFORM = { label: 'Google Cloud — Terraform on Google Cloud', url: 'https://cloud.google.com/docs/terraform' };
const REF_DM = { label: 'Google Cloud — Infrastructure Manager', url: 'https://cloud.google.com/infrastructure-manager/docs' };
const REF_CICD = { label: 'Google Cloud — Cloud Build documentation', url: 'https://cloud.google.com/build/docs' };
const REF_MIGRATE = { label: 'Google Cloud — Migrate to Virtual Machines', url: 'https://cloud.google.com/migrate/virtual-machines/docs' };
const REF_TRANSFER = { label: 'Google Cloud — Storage Transfer Service', url: 'https://cloud.google.com/storage-transfer/docs/overview' };
const REF_DTS = { label: 'Google Cloud — Database Migration Service', url: 'https://cloud.google.com/database-migration/docs' };
const REF_ANTHOS = { label: 'Google Cloud — GKE Enterprise (Anthos) overview', url: 'https://cloud.google.com/kubernetes-engine/enterprise/docs/concepts/overview' };
const REF_APIGEE = { label: 'Google Cloud — Apigee API management', url: 'https://cloud.google.com/apigee/docs' };
const REF_ENDPOINTS = { label: 'Google Cloud — Cloud Endpoints documentation', url: 'https://cloud.google.com/endpoints/docs' };
const REF_AUTOSCALER = { label: 'Google Cloud — Autoscaling groups of instances', url: 'https://cloud.google.com/compute/docs/autoscaler' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Designing and planning a cloud solution architecture (16) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Mountkirk Games wants its game backend to scale automatically to handle unpredictable spikes from a global player base while minimizing operational overhead. Which compute platform best fits a stateless containerized game API?',
    options: opts4(
      'A single large Compute Engine VM sized for peak load',
      'Cloud Run with concurrency-based autoscaling',
      'App Engine flexible with a fixed number of instances',
      'A manually scaled managed instance group'
    ),
    correct: ['b'],
    explanation: 'Cloud Run scales stateless containers automatically (including to zero) based on request concurrency, minimizing operational overhead for spiky global traffic. A fixed VM wastes money off-peak and cannot absorb spikes, and manual or fixed scaling does not respond to unpredictable load.',
    references: [REF_RUN, REF_ARCH]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'TerramEarth collects telemetry from 20 million vehicles and needs a globally consistent, horizontally scalable relational database for its dealer management system with strong transactions across regions. Which service should the architect choose?',
    options: opts4(
      'Cloud SQL for PostgreSQL with read replicas',
      'Cloud Spanner with a multi-region instance configuration',
      'Bigtable with a multi-cluster routing app profile',
      'Firestore in Datastore mode'
    ),
    correct: ['b'],
    explanation: 'Cloud Spanner provides horizontally scalable relational storage with strong external consistency and synchronous multi-region replication. Cloud SQL does not scale writes horizontally, Bigtable is non-relational and not strongly transactional across rows, and Firestore is document-oriented.',
    references: [REF_SPANNER]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL design choices that reduce single-points-of-failure for a regional web application on Compute Engine.',
    options: opts4(
      'Deploy instances across multiple zones using a regional managed instance group',
      'Place all instances in a single zone to reduce latency',
      'Front the instances with a global external Application Load Balancer',
      'Use a regional persistent disk or a managed database with HA for state'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Spreading a regional MIG across zones, fronting it with a load balancer, and using HA storage all remove single points of failure. Consolidating into one zone increases blast radius and is the opposite of high availability.',
    references: [REF_MIG, REF_LB, REF_ARCH]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A startup wants the lowest operational burden for a new event-driven image-processing pipeline triggered when files land in Cloud Storage. Which option fits best?',
    options: opts4(
      'A cron job on a always-on Compute Engine VM polling the bucket',
      'A Cloud Function triggered by a Cloud Storage finalize event',
      'A GKE Deployment that lists bucket objects every minute',
      'An App Engine standard app polling the bucket on a schedule'
    ),
    correct: ['b'],
    explanation: 'A Cloud Function triggered directly by the Cloud Storage object finalize event is fully managed, scales automatically, and runs only when objects arrive — the least operational overhead. Polling approaches waste resources and add latency.',
    references: [REF_FUNCTIONS, REF_STORAGE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'EHR Healthcare needs an analytics warehouse for petabytes of historical claims data with ad-hoc SQL from analysts and no cluster management. Which service is the best fit?',
    options: opts4(
      'Bigtable',
      'BigQuery',
      'Cloud SQL for MySQL with large machine types',
      'Dataproc with a persistent HDFS cluster'
    ),
    correct: ['b'],
    explanation: 'BigQuery is a serverless, petabyte-scale analytics warehouse designed for ad-hoc SQL with no infrastructure to manage. Bigtable is for wide-column NoSQL, Cloud SQL does not scale to petabyte analytics, and a persistent Dataproc cluster adds management overhead.',
    references: [REF_BIGQUERY]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A team needs sub-10-ms key lookups for 50 TB of user-profile data with millions of reads per second. Which storage service is most appropriate?',
    options: opts4(
      'Cloud SQL for PostgreSQL',
      'Cloud Bigtable',
      'BigQuery',
      'Cloud Storage with a Standard bucket'
    ),
    correct: ['b'],
    explanation: 'Bigtable delivers low single-digit-millisecond latency at very high throughput for large wide-column key/value workloads. Cloud SQL cannot meet that scale, BigQuery is for analytics not low-latency lookups, and Cloud Storage is object storage with much higher latency.',
    references: [REF_BIGTABLE]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'An architect must design a hybrid network that gives 10 Gbps of private connectivity between an on-premises data center and a VPC with an SLA. Which connectivity option is correct?',
    options: opts4(
      'HA VPN over the public internet',
      'Dedicated Interconnect',
      'Carrier Peering',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'Dedicated Interconnect provides high-bandwidth (10/100 Gbps) private Layer-2/3 connectivity with an SLA. HA VPN runs over the internet (no bandwidth SLA at that scale), Carrier Peering is for Google public services, and Cloud NAT provides egress for private instances.',
    references: [REF_INTERCONNECT]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A global external Application Load Balancer can route a single anycast IP to backends in multiple regions, automatically directing users to the closest healthy backend.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'The global external Application Load Balancer uses a single anycast IP and Google\'s global network to route each user to the nearest healthy backend region, providing low latency and cross-region failover.',
    references: [REF_LB]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated customer requires that an internal microservice never be reachable from the public internet but still be load-balanced across zones. Which load balancer should the architect specify?',
    options: opts4(
      'Global external Application Load Balancer',
      'Internal Application Load Balancer',
      'External passthrough Network Load Balancer',
      'Classic external proxy Network Load Balancer'
    ),
    correct: ['b'],
    explanation: 'An internal Application Load Balancer exposes a private RFC 1918 VIP reachable only from within the VPC (or connected networks), providing zonal redundancy without internet exposure. The external options assign public-facing front ends.',
    references: [REF_LB]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cloud Storage class minimizes cost for compliance archives accessed at most once per year while still being immediately retrievable?',
    options: opts4(
      'Standard',
      'Nearline',
      'Coldline',
      'Archive'
    ),
    correct: ['d'],
    explanation: 'Archive storage has the lowest at-rest price for data accessed less than once a year and is still available with millisecond first-byte latency (subject to minimum storage duration and retrieval costs). Standard/Nearline/Coldline cost more for rarely accessed long-term archives.',
    references: [REF_STORAGE_CLASS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A messaging system must decouple producers from consumers, buffer bursts, and deliver at least once with global availability. Which service should be designed in?',
    options: opts4(
      'Cloud Pub/Sub',
      'Memorystore for Redis',
      'Cloud Tasks running on a single queue',
      'A self-managed Kafka cluster on a single VM'
    ),
    correct: ['a'],
    explanation: 'Pub/Sub is a globally available, autoscaling messaging service that decouples publishers and subscribers with at-least-once delivery and large buffering. Memorystore is a cache, and a single-VM Kafka is neither global nor highly available.',
    references: [REF_PUBSUB]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'Helicopter Racing League streams video to a global audience and needs the lowest-latency origin compute near viewers plus caching at the edge. Which combination is best?',
    options: opts4(
      'A single-region VM with no CDN',
      'Multi-region backends behind a global external Application Load Balancer with Cloud CDN enabled',
      'Cloud Functions in one region with Cloud Storage',
      'App Engine standard in one region only'
    ),
    correct: ['b'],
    explanation: 'Global load balancing places users on the nearest backend region while Cloud CDN caches content at Google edge locations, minimizing latency for a worldwide audience. Single-region options cannot serve a global audience with low latency.',
    references: [REF_LB, REF_ARCH]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'An architect needs a relational database for a write-heavy global SaaS that must survive an entire region outage with an RPO of zero. Which design meets the requirement?',
    options: opts4(
      'Cloud SQL with a cross-region read replica promoted manually on failure',
      'Cloud Spanner multi-region configuration',
      'A self-managed MySQL with asynchronous replication',
      'BigQuery with scheduled exports'
    ),
    correct: ['b'],
    explanation: 'A Spanner multi-region configuration synchronously replicates writes across regions, giving zero RPO and surviving a regional outage transparently. Asynchronous replication (Cloud SQL replica, self-managed MySQL) implies non-zero RPO, and BigQuery is an analytics store.',
    references: [REF_SPANNER, REF_DR]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A workload runs batch rendering jobs that tolerate interruption and restart. Which Compute Engine option minimizes cost?',
    options: opts4(
      'On-demand N2 VMs reserved 24x7',
      'Spot VMs in a managed instance group',
      'Sole-tenant nodes',
      'Memory-optimized M3 VMs on demand'
    ),
    correct: ['b'],
    explanation: 'Spot VMs offer steep discounts for fault-tolerant, interruptible batch work and integrate with managed instance groups for automatic recreation. On-demand and sole-tenant options are far more expensive for interruptible batch jobs.',
    references: [REF_PREEMPTIBLE, REF_COST]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A company wants to expose a versioned public REST API with quota, API keys, and analytics, fronting Cloud Run services. Which Google Cloud product should the architect design in?',
    options: opts4(
      'Cloud Armor',
      'Apigee API Management',
      'Cloud NAT',
      'Cloud DNS'
    ),
    correct: ['b'],
    explanation: 'Apigee provides full API lifecycle management — versioning, quotas, API keys, developer portal, and analytics — in front of backend services. Cloud Armor is WAF/DDoS, Cloud NAT is egress, and Cloud DNS is name resolution.',
    references: [REF_APIGEE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must choose a managed Kubernetes mode where Google manages nodes, scaling, and node security with per-pod billing for a team with no Kubernetes ops experience. Which is best?',
    options: opts4(
      'GKE Standard with manual node pools',
      'GKE Autopilot',
      'Self-managed Kubernetes on Compute Engine',
      'Cloud Run for Anthos on bare metal'
    ),
    correct: ['b'],
    explanation: 'GKE Autopilot manages the node infrastructure, scaling, and node security and bills per pod resource request, removing node-ops burden — ideal for teams without Kubernetes operations experience. GKE Standard and self-managed clusters require node management.',
    references: [REF_GKE_AUTOPILOT]
  },

  // ── Managing and provisioning a solution infrastructure (12) ──
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which approach provisions Google Cloud infrastructure declaratively, with state tracking and plan/apply previews, and is the recommended IaC tooling on Google Cloud?',
    options: opts4(
      'Shell scripts calling gcloud in sequence',
      'Terraform with the Google provider',
      'Manually clicking through the Cloud Console',
      'Editing resources directly with the REST API by hand'
    ),
    correct: ['b'],
    explanation: 'Terraform with the Google provider gives declarative, state-tracked infrastructure with plan/apply previews and is the recommended IaC approach on Google Cloud. Imperative scripts and console clicks are not reproducible or reviewable.',
    references: [REF_TERRAFORM]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A platform team wants Google to host and run Terraform applies tied to a Git repository without managing their own CI runners. Which managed service should they use?',
    options: opts4(
      'Cloud Scheduler',
      'Infrastructure Manager',
      'Cloud Tasks',
      'Cloud Composer only'
    ),
    correct: ['b'],
    explanation: 'Infrastructure Manager is the Google-managed service that runs Terraform deployments from a repository, tracking state for you. Cloud Scheduler and Cloud Tasks are job/queue services and do not run Terraform.',
    references: [REF_DM, REF_TERRAFORM]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid ways to let a Compute Engine instance authenticate to Cloud Storage without embedding long-lived keys.',
    options: opts4(
      'Attach a service account to the instance and use Application Default Credentials',
      'Hard-code a downloaded service account JSON key in the boot image',
      'Use Workload Identity Federation for an external identity provider',
      'Grant the attached service account the minimal Cloud Storage IAM role'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Attached service accounts (ADC), Workload Identity Federation, and granting least-privilege roles all avoid long-lived embedded keys. Baking a JSON key into an image is the discouraged anti-pattern that leaks credentials.',
    references: [REF_SA, REF_IAM_BEST]
  },
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'You need Compute Engine instances to scale out when average CPU exceeds 60% and scale in when load drops. Which feature provides this?',
    options: opts4(
      'A standalone unmanaged instance group',
      'A managed instance group with an autoscaler using a CPU utilization target',
      'A startup script that creates more VMs',
      'Cloud Scheduler creating instances hourly'
    ),
    correct: ['b'],
    explanation: 'A managed instance group with an autoscaler scales the group up and down based on a target metric such as 60% average CPU. Unmanaged groups have no autoscaling, and scripts/schedulers do not react to live load.',
    references: [REF_AUTOSCALER, REF_MIG]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Multiple service projects must share a single set of subnets and firewall rules centrally administered by the network team. Which VPC design provides this?',
    options: opts4(
      'VPC Network Peering between every pair of projects',
      'Shared VPC with a host project owning the subnets',
      'A separate default VPC in each project',
      'Cloud VPN tunnels between projects'
    ),
    correct: ['b'],
    explanation: 'Shared VPC lets a host project own subnets and firewall rules that attached service projects consume, centralizing network administration. Full-mesh peering or per-project VPCs do not give centralized subnet/firewall control.',
    references: [REF_SHARED_VPC]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Two VPCs in different projects need private RFC 1918 connectivity without transitive routing and without a gateway appliance. Which feature fits?',
    options: opts4(
      'VPC Network Peering',
      'Cloud NAT',
      'A shared external IP',
      'Cloud CDN'
    ),
    correct: ['a'],
    explanation: 'VPC Network Peering connects two VPCs privately using internal IPs with no gateway, though it is non-transitive. Cloud NAT is for egress, an external IP is public, and Cloud CDN caches HTTP content.',
    references: [REF_PEERING]
  },
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Private-IP-only instances need to reach the internet to download OS package updates without receiving inbound connections. Which service should be provisioned?',
    options: opts4(
      'Cloud NAT',
      'An external Application Load Balancer',
      'Identity-Aware Proxy',
      'Cloud Interconnect'
    ),
    correct: ['a'],
    explanation: 'Cloud NAT provides outbound-only internet access for instances without external IPs, ideal for downloading updates while blocking inbound connections. The other services do not provide managed egress NAT.',
    references: [REF_VPC]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect wants new GKE workloads to authenticate to Google APIs using Kubernetes service accounts mapped to IAM, avoiding node-level credentials. Which feature should be enabled?',
    options: opts4(
      'Legacy node service account scopes',
      'Workload Identity Federation for GKE',
      'A shared static service account key mounted as a Secret',
      'Basic authentication on the cluster'
    ),
    correct: ['b'],
    explanation: 'Workload Identity for GKE binds Kubernetes service accounts to IAM, so pods get scoped credentials without using node-wide service account keys or scopes. Static mounted keys and basic auth are insecure legacy approaches.',
    references: [REF_GKE, REF_SA]
  },
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'A regional managed instance group can automatically recreate a VM that fails its application health check, restoring the desired number of healthy instances.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Managed instance groups support autohealing: when an instance fails its configured health check, the MIG recreates it to maintain the desired count of healthy instances.',
    references: [REF_MIG]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A company must deploy identical infrastructure to dev, staging, and prod with environment-specific values and code review of changes. Which practice should the architect mandate?',
    options: opts4(
      'Manual console changes documented in a wiki',
      'Parameterized Terraform modules with per-environment variable files in version control',
      'A single hand-maintained shell script run on each environment',
      'Copying resources with gcloud export/import ad hoc'
    ),
    correct: ['b'],
    explanation: 'Reusable parameterized Terraform modules with per-environment variables in version control give consistent, reviewable, repeatable deployments. Manual or copy-based approaches drift and are not reviewable.',
    references: [REF_TERRAFORM]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect needs to grant a partner read-only access to a single BigQuery dataset for 30 days with automatic expiry. Which mechanism is most appropriate?',
    options: opts4(
      'Add the partner as project Owner',
      'Grant a dataset-level role with an IAM Conditions time-bound expiry',
      'Share a service account key with the partner',
      'Make the dataset public'
    ),
    correct: ['b'],
    explanation: 'A least-privilege dataset-level role combined with an IAM Condition that expires after 30 days grants exactly the needed access for the needed time. Project Owner, shared keys, and public access all over-grant.',
    references: [REF_IAM, REF_BIGQUERY]
  },
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command-line tool change set should be reviewed before applying infrastructure to catch unintended deletions?',
    options: opts4(
      'terraform apply --auto-approve immediately',
      'terraform plan output reviewed in a pull request',
      'gcloud compute instances delete in a loop',
      'A blind terraform destroy'
    ),
    correct: ['b'],
    explanation: 'Reviewing `terraform plan` output in a pull request surfaces additions, changes, and especially destructions before they are applied. Auto-approve or destroy without review risks accidental data loss.',
    references: [REF_TERRAFORM]
  },

  // ── Designing for security and compliance (12) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which IAM practice most directly enforces least privilege for a team that only needs to view Compute Engine instances?',
    options: opts4(
      'Grant roles/owner at the project level',
      'Grant the predefined roles/compute.viewer role',
      'Grant roles/editor at the organization level',
      'Add the team to the project as a service account'
    ),
    correct: ['b'],
    explanation: 'roles/compute.viewer grants only read access to Compute Engine, satisfying least privilege. Owner and Editor are broad primitive roles that grant far more than needed.',
    references: [REF_IAM_BEST]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance team must guarantee that no resource in the organization can be created outside the EU regions. Which control enforces this centrally?',
    options: opts4(
      'A documented policy in the runbook',
      'An organization policy with the resource location restriction constraint',
      'IAM deny on individual users',
      'A billing budget alert'
    ),
    correct: ['b'],
    explanation: 'The Organization Policy resource-location-restriction constraint enforces allowed locations across the whole org hierarchy regardless of user. Runbooks, IAM, and budgets do not technically prevent out-of-region creation.',
    references: [REF_ORGPOLICY]
  },
  {
    domain: SECURITY, difficulty: 4, type: QType.SINGLE,
    stem: 'An architect must prevent data exfiltration from BigQuery and Cloud Storage to projects outside a trusted perimeter, even by users with valid IAM. Which control is required?',
    options: opts4(
      'Cloud Armor security policies',
      'VPC Service Controls service perimeter',
      'Firewall rules on the default network',
      'Object versioning on the buckets'
    ),
    correct: ['b'],
    explanation: 'VPC Service Controls create a service perimeter that blocks data egress to untrusted projects/networks even when IAM would otherwise allow it. Cloud Armor, firewall rules, and versioning do not stop API-level data exfiltration.',
    references: [REF_VPCSC]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated customer must control and rotate the encryption keys used for Cloud Storage data and prove key custody. Which approach should the architect design?',
    options: opts4(
      'Rely on Google-managed default encryption only',
      'Use customer-managed encryption keys (CMEK) in Cloud KMS',
      'Disable encryption and encrypt in the application without key management',
      'Store the key in a public bucket'
    ),
    correct: ['b'],
    explanation: 'CMEK in Cloud KMS lets the customer own, rotate, and audit the keys protecting Cloud Storage data, satisfying key-custody compliance. Default keys give no customer control, and the other options are insecure.',
    references: [REF_CMEK, REF_KMS]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Where should an application store database passwords and API tokens so they are encrypted, versioned, and access-audited?',
    options: opts4(
      'In environment variables committed to Git',
      'In Secret Manager with IAM-controlled access',
      'In a plaintext file on the VM boot disk',
      'In the Dockerfile as build args'
    ),
    correct: ['b'],
    explanation: 'Secret Manager stores secrets encrypted at rest, supports versioning and rotation, and audits access via IAM and Cloud Audit Logs. The other options expose secrets in plaintext or version control.',
    references: [REF_SECMGR]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect needs a single console to view misconfigurations, vulnerabilities, and threats across the organization. Which service provides this?',
    options: opts4(
      'Cloud Logging only',
      'Security Command Center',
      'Cloud Monitoring dashboards',
      'Cloud Trace'
    ),
    correct: ['b'],
    explanation: 'Security Command Center aggregates misconfigurations, vulnerabilities, and threat findings org-wide in one place. Logging, Monitoring, and Trace are observability tools, not a security posture aggregator.',
    references: [REF_SCC]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A public web application is being hit by Layer-7 application attacks and volumetric DDoS. Which Google Cloud service should be designed in front of the load balancer?',
    options: opts4(
      'Cloud NAT',
      'Cloud Armor with WAF rules',
      'Cloud CDN',
      'Cloud DNS'
    ),
    correct: ['b'],
    explanation: 'Cloud Armor provides WAF rules and DDoS protection at the global external load balancer edge, mitigating L7 attacks and volumetric floods. CDN, NAT, and DNS do not provide WAF/DDoS controls.',
    references: [REF_ARMOR]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Granting a group an IAM role at the folder level automatically applies that role to all projects and resources beneath that folder through policy inheritance.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'IAM policies are inherited down the resource hierarchy, so a role granted at a folder applies to all projects and resources beneath it unless further restricted.',
    references: [REF_RESMGR, REF_IAM]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Auditors require an immutable record of who changed IAM policies and who accessed sensitive data. Which logs must the architect ensure are enabled and exported?',
    options: opts4(
      'Only application stdout logs',
      'Cloud Audit Logs (Admin Activity and Data Access) exported to a retained sink',
      'Load balancer access logs only',
      'VPC Flow Logs only'
    ),
    correct: ['b'],
    explanation: 'Cloud Audit Logs record administrative changes (Admin Activity) and data access (Data Access); exporting them to a retained, restricted sink gives the immutable audit trail auditors require. Flow logs and LB logs do not capture IAM/data-access events.',
    references: [REF_LOGGING, REF_IAM]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'An internal admin app on Compute Engine must be reachable only by named employees without a VPN, using their Google identity. Which service achieves this?',
    options: opts4(
      'Open the firewall to 0.0.0.0/0 and rely on app login',
      'Identity-Aware Proxy (IAP) in front of the application',
      'A public load balancer with a shared password',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'Identity-Aware Proxy enforces per-user Google identity and IAM-based access to the app without a VPN, applying zero-trust context-aware access. Opening the firewall or sharing a password is insecure; NAT is unrelated.',
    references: [REF_IAM_BEST]
  },
  {
    domain: SECURITY, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL measures that reduce the blast radius of a compromised service account.',
    options: opts4(
      'Grant only the minimal predefined roles needed',
      'Use short-lived credentials and disable user-managed keys where possible',
      'Reuse one highly privileged service account across all workloads',
      'Scope the account to a single project rather than the organization'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Least-privilege roles, short-lived credentials/no static keys, and narrow project scope all limit damage from a compromised account. A single shared, highly privileged account maximizes blast radius and is an anti-pattern.',
    references: [REF_SA, REF_IAM_BEST]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A separation-of-duties requirement says developers may deploy to dev but only a release team may deploy to prod. Which design enforces this?',
    options: opts4(
      'Single project with everyone as Editor',
      'Separate dev and prod projects with distinct IAM bindings per environment',
      'One project and a naming convention for resources',
      'Shared service account used by all engineers'
    ),
    correct: ['b'],
    explanation: 'Isolating environments into separate projects with distinct IAM bindings cleanly enforces separation of duties. A single shared project or naming convention cannot technically restrict who deploys to prod.',
    references: [REF_RESMGR, REF_IAM_BEST]
  },

  // ── Analyzing and optimizing technical and business processes (8) ──
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A finance team complains the monthly Compute Engine bill is unpredictable for a steady 24x7 baseline of N2 VMs. Which optimization gives the biggest predictable saving?',
    options: opts4(
      'Switch the steady baseline to committed use discounts (1- or 3-year)',
      'Move everything to on-demand only',
      'Increase machine sizes to finish faster',
      'Disable Cloud Monitoring to cut costs'
    ),
    correct: ['a'],
    explanation: 'Committed use discounts give substantial, predictable savings for steady, always-on baseline usage. On-demand-only is the most expensive for steady load, oversizing wastes money, and disabling monitoring harms reliability without meaningful savings.',
    references: [REF_CUD, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'An architect must give each business unit visibility into its own Google Cloud spend and set alerts before overspend. Which approach is correct?',
    options: opts4(
      'Use a single untagged project for all units',
      'Separate projects/labels per unit with Cloud Billing budgets and alerts',
      'Estimate costs manually each quarter',
      'Disable billing export'
    ),
    correct: ['b'],
    explanation: 'Per-unit projects or labels combined with Cloud Billing budgets and alerts give chargeback visibility and proactive overspend notifications. A single untagged project and manual estimates provide no attribution or early warning.',
    references: [REF_BILLING, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A dev/test environment runs 24x7 but is only used during business hours. Which change reduces cost with the least risk?',
    options: opts4(
      'Delete the environment entirely',
      'Schedule instances to stop outside business hours and start before',
      'Switch the database to a smaller machine permanently',
      'Move it to another cloud'
    ),
    correct: ['b'],
    explanation: 'Scheduling non-prod instances to stop outside business hours eliminates idle spend with minimal risk and effort. Deleting it loses the environment, undersizing the DB can break workloads, and migrating clouds is costly and risky.',
    references: [REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid techniques to optimize BigQuery query cost and performance.',
    options: opts4(
      'Partition and cluster large tables on common filter columns',
      'Always run SELECT * to simplify queries',
      'Use the pricing model and slot reservations that match the workload',
      'Avoid scanning unnecessary columns by selecting only needed fields'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Partitioning/clustering, choosing the right pricing/slot model, and selecting only needed columns all cut bytes scanned and cost. SELECT * scans every column and increases cost — the opposite of optimization.',
    references: [REF_BIGQUERY, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to identify which API calls and resources drive cost spikes over time. Which capability should the architect enable?',
    options: opts4(
      'Cloud Trace latency analysis',
      'Cloud Billing data export to BigQuery with cost breakdown analysis',
      'VPC Flow Logs sampling',
      'Cloud DNS query logging'
    ),
    correct: ['b'],
    explanation: 'Exporting detailed Cloud Billing data to BigQuery lets teams analyze cost by service, project, label, and time to find spike drivers. Trace, flow logs, and DNS logging address other concerns.',
    references: [REF_BILLING]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A legacy monolith release takes a week and is error-prone. The business wants faster, safer releases. Which process change best addresses this?',
    options: opts4(
      'Stop releasing changes',
      'Adopt a CI/CD pipeline with automated tests and progressive (canary) delivery',
      'Increase the size of the release team',
      'Release only once a year'
    ),
    correct: ['b'],
    explanation: 'A CI/CD pipeline with automated testing and canary/progressive rollout shortens lead time and reduces release risk. Slowing or freezing releases increases batch size and risk; adding people does not fix the process.',
    references: [REF_CICD, REF_ARCH]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'An analytics workload has unpredictable, bursty query volume. Which BigQuery pricing choice best matches the business need to pay for what is used?',
    options: opts4(
      'On-demand (per-bytes-scanned) pricing',
      'A large fixed flat-rate reservation sized for peak at all times',
      'Running queries on a permanently provisioned Dataproc cluster',
      'Exporting all data and querying it on a single VM'
    ),
    correct: ['a'],
    explanation: 'On-demand pricing charges per bytes processed, matching unpredictable bursty usage without paying for idle capacity. A peak-sized flat reservation wastes money off-peak; the other options add unnecessary infrastructure.',
    references: [REF_BIGQUERY, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Right-sizing recommendations from Compute Engine can identify over-provisioned VMs whose machine type can be reduced to lower cost without harming performance.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Compute Engine machine-type (right-sizing) recommendations analyze utilization and suggest smaller machine types for over-provisioned VMs, lowering cost while preserving performance.',
    references: [REF_COST, REF_GCE]
  },

  // ── Managing implementation (8) ──
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A team is migrating 200 on-prem VMware VMs to Compute Engine with minimal downtime and no application rewrite. Which Google Cloud service should the architect use?',
    options: opts4(
      'Manually rebuild every VM from scratch',
      'Migrate to Virtual Machines (lift-and-shift migration service)',
      'Storage Transfer Service',
      'Database Migration Service'
    ),
    correct: ['b'],
    explanation: 'Migrate to Virtual Machines performs lift-and-shift VM migration with replication and short cutover, requiring no rewrite. Storage Transfer is for objects, Database Migration Service is for databases, and manual rebuilds are slow and error-prone.',
    references: [REF_MIGRATE]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'A team must migrate a 5 TB on-prem MySQL database to Cloud SQL with continuous replication and minimal cutover downtime. Which service is appropriate?',
    options: opts4(
      'Storage Transfer Service',
      'Database Migration Service',
      'A one-time mysqldump copied via gsutil',
      'BigQuery Data Transfer Service'
    ),
    correct: ['b'],
    explanation: 'Database Migration Service supports continuous (CDC) replication from source MySQL to Cloud SQL, enabling near-zero-downtime cutover. A one-time dump implies long downtime, and the other services do not perform live DB replication.',
    references: [REF_DTS]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'An architect must move 500 TB of archival objects from on-prem to Cloud Storage over a short window. Which managed service should be used?',
    options: opts4(
      'gsutil cp from a single workstation',
      'Storage Transfer Service (including Transfer Appliance for offline at scale)',
      'Database Migration Service',
      'Manual upload through the Console'
    ),
    correct: ['b'],
    explanation: 'Storage Transfer Service (online, or Transfer Appliance for very large offline transfers) is purpose-built for large-scale object migration with scheduling and integrity checks. Single-host gsutil or console upload cannot meet that scale reliably.',
    references: [REF_TRANSFER]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'During a phased migration, an architect wants to deploy a new version to 5% of users and automatically roll back if error rates rise. Which deployment strategy enables this?',
    options: opts4(
      'Big-bang deployment to 100% at once',
      'Canary deployment with automated rollback on SLO breach',
      'Recreate strategy that deletes all old pods first',
      'No versioning, edit in place'
    ),
    correct: ['b'],
    explanation: 'A canary releases to a small percentage and automatically rolls back when error/latency SLOs are violated, limiting blast radius. Big-bang and recreate maximize risk; editing in place has no controlled rollout.',
    references: [REF_CICD, REF_SRE]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that make an implementation/rollout safer.',
    options: opts4(
      'Automated tests gating the pipeline before deploy',
      'Infrastructure as code with peer-reviewed changes',
      'Deploying untested changes directly to production on Friday evening',
      'Progressive rollout with health checks and rollback'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Automated test gates, peer-reviewed IaC, and progressive rollout with rollback all reduce implementation risk. Pushing untested changes straight to prod is the unsafe anti-pattern.',
    references: [REF_CICD, REF_TERRAFORM]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants a managed CI/CD service on Google Cloud to build container images and deploy to GKE on each commit. Which service should be implemented?',
    options: opts4(
      'Cloud Scheduler',
      'Cloud Build with triggers',
      'Cloud Tasks',
      'Cloud Trace'
    ),
    correct: ['b'],
    explanation: 'Cloud Build provides managed CI/CD with repository triggers to build images and deploy to GKE automatically on commit. Scheduler/Tasks are job/queue services and Trace is for latency analysis.',
    references: [REF_CICD]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants consistent Kubernetes config and policy across GKE clusters in multiple clouds and on-prem during a migration. Which platform should the architect adopt?',
    options: opts4(
      'Independent unmanaged clusters with manual kubectl',
      'GKE Enterprise (Anthos) with fleet config management',
      'A single GKE cluster for all environments',
      'Plain Compute Engine VMs with Docker'
    ),
    correct: ['b'],
    explanation: 'GKE Enterprise (Anthos) provides fleet-wide configuration and policy management across multi-cloud and on-prem clusters, ideal for consistent hybrid migration. Independent clusters or a single shared cluster lack centralized policy and isolation.',
    references: [REF_ANTHOS]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Running a parallel pilot of a migrated workload alongside the existing system before full cutover reduces the risk of an unrecoverable migration failure.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'A parallel pilot validates the migrated workload under real conditions while the original system remains available, providing a safe fallback and reducing cutover risk.',
    references: [REF_MIGRATE, REF_DR]
  },

  // ── Ensuring solution and operations reliability (9) ──
  {
    domain: RELIABILITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In SRE terms, what is an error budget?',
    options: opts4(
      'The monthly cloud spend allocated to incident response',
      'The allowed amount of unreliability derived from the SLO target',
      'The number of engineers on call',
      'The maximum number of deployments per day'
    ),
    correct: ['b'],
    explanation: 'An error budget is the acceptable level of unreliability implied by the SLO (for example, 0.1% if the SLO is 99.9%). It governs how much risk teams can spend on change velocity before reliability work must take priority.',
    references: [REF_SRE]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to be paged only when user-facing reliability is actually at risk. Which alerting approach should the architect recommend?',
    options: opts4(
      'Alert on every CPU spike on every VM',
      'Alert on SLO burn rate against the error budget',
      'Alert on each individual log line',
      'Disable alerting and rely on customer reports'
    ),
    correct: ['b'],
    explanation: 'Alerting on SLO burn rate pages humans only when the error budget is being consumed too fast, reducing noise while protecting users. Per-VM or per-log alerts are noisy, and relying on customers detects outages too late.',
    references: [REF_SRE, REF_MONITORING]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A critical service has an RTO of 15 minutes and RPO of 5 minutes. Which DR pattern best fits without paying for a full active-active footprint?',
    options: opts4(
      'Backup and restore from nightly snapshots only',
      'Warm standby (pilot light) in a second region with frequent replication',
      'No DR plan; rebuild manually if needed',
      'Cold storage of code with no infrastructure'
    ),
    correct: ['b'],
    explanation: 'A warm standby (pilot light) in a second region with frequent data replication can meet a 15-minute RTO and 5-minute RPO at lower cost than active-active. Nightly-backup or manual rebuild cannot meet such tight RTO/RPO.',
    references: [REF_DR]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that improve the reliability of a production service.',
    options: opts4(
      'Define SLIs/SLOs and monitor them with alerting on burn rate',
      'Run blameless postmortems and track action items',
      'Skip health checks to save resources',
      'Use multi-zone deployment with autohealing and load balancing'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'SLO-based monitoring, blameless postmortems, and multi-zone autohealing all increase reliability. Skipping health checks removes the mechanism that detects and replaces unhealthy instances and reduces reliability.',
    references: [REF_SRE, REF_MIG]
  },
  {
    domain: RELIABILITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service provides distributed request tracing to find latency bottlenecks across microservices?',
    options: opts4(
      'Cloud Trace',
      'Cloud Billing',
      'Cloud DNS',
      'Cloud NAT'
    ),
    correct: ['a'],
    explanation: 'Cloud Trace collects and analyzes distributed latency data across services to pinpoint bottlenecks. Billing, DNS, and NAT do not provide tracing.',
    references: [REF_MONITORING]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A stateful Cloud SQL primary must survive a zone failure with automatic failover. Which configuration should the architect specify?',
    options: opts4(
      'A single-zone instance with manual restore',
      'A high-availability (regional) Cloud SQL configuration with a standby',
      'Read replicas only, with no failover',
      'Daily exports to Cloud Storage as the only resilience'
    ),
    correct: ['b'],
    explanation: 'Cloud SQL HA (regional) provisions a synchronous standby in another zone with automatic failover, surviving a zone failure. Single-zone, replica-only, or export-only setups do not provide automatic zone-failure failover.',
    references: [REF_CLOUDSQL, REF_DR]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'To prevent a dependency overload from cascading into a full outage, which resilience pattern should the architect build into the service?',
    options: opts4(
      'Unbounded retries with no backoff',
      'Circuit breaking with timeouts and exponential backoff',
      'Removing all timeouts so requests always wait',
      'Sharing one connection pool with no limits'
    ),
    correct: ['b'],
    explanation: 'Circuit breaking combined with sensible timeouts and exponential backoff prevents a struggling dependency from cascading into a total outage. Unbounded retries and removed timeouts amplify overload (retry storms).',
    references: [REF_SRE, REF_ARCH]
  },
  {
    domain: RELIABILITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A 99.9% monthly availability SLO permits roughly 43 minutes of downtime per 30-day month as its error budget.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: '99.9% of a 30-day month (43,200 minutes) leaves about 0.1%, roughly 43 minutes, as the allowable downtime / error budget for the month.',
    references: [REF_SRE]
  },
  {
    domain: RELIABILITY, difficulty: 4, type: QType.SINGLE,
    stem: 'An architect wants to validate that the system actually withstands instance and zone failures before a real incident occurs. Which practice should be adopted?',
    options: opts4(
      'Hope failures never happen',
      'Regular chaos/disaster-recovery testing (game days) in a controlled way',
      'Only test in production during peak traffic with no plan',
      'Disable monitoring during tests'
    ),
    correct: ['b'],
    explanation: 'Controlled chaos engineering and DR game days proactively validate failure handling and recovery procedures before real incidents. Hoping, unplanned peak testing, or disabling monitoring increases risk instead of reducing it.',
    references: [REF_SRE, REF_DR]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Designing and planning a cloud solution architecture (16) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A web frontend serves mostly static assets and needs the lowest cost and global low latency. Which design should the architect choose?',
    options: opts4(
      'A fleet of always-on VMs in one region',
      'Cloud Storage static hosting behind a global external Application Load Balancer with Cloud CDN',
      'App Engine flexible with many idle instances',
      'GKE cluster running an Nginx Deployment in one zone'
    ),
    correct: ['b'],
    explanation: 'Serving static assets from Cloud Storage behind a global load balancer with Cloud CDN gives global low latency at minimal cost with no servers to manage. Always-on VMs or single-zone clusters cost more and serve global users poorly.',
    references: [REF_STORAGE, REF_LB]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An application needs a managed document database with strong consistency, automatic scaling, and offline mobile sync. Which service fits best?',
    options: opts4(
      'Bigtable',
      'Firestore',
      'BigQuery',
      'Cloud SQL for MySQL'
    ),
    correct: ['b'],
    explanation: 'Firestore is a serverless document database with strong consistency, automatic scaling, and built-in mobile/web offline sync SDKs. Bigtable is wide-column, BigQuery is analytics, and Cloud SQL is relational without mobile sync.',
    references: [REF_FIRESTORE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A latency-sensitive API needs a managed in-memory cache to offload repeated reads from Cloud SQL. Which service should the architect add?',
    options: opts4(
      'Memorystore for Redis',
      'BigQuery BI Engine',
      'A second Cloud SQL replica only',
      'Cloud Storage'
    ),
    correct: ['a'],
    explanation: 'Memorystore for Redis is a managed in-memory cache that offloads hot reads and cuts database latency. A read replica still hits disk-backed storage, BI Engine accelerates BigQuery, and Cloud Storage is object storage.',
    references: [REF_MEMSTORE]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which compute option is best for a long-running stateful legacy application that requires a specific OS kernel module and full control of the VM?',
    options: opts4(
      'Cloud Run',
      'Compute Engine VM',
      'App Engine standard',
      'Cloud Functions'
    ),
    correct: ['b'],
    explanation: 'A Compute Engine VM gives full OS and kernel control for stateful legacy software with special kernel-module requirements. The serverless options abstract the OS and cannot load custom kernel modules.',
    references: [REF_GCE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that are true about choosing between Cloud SQL and Cloud Spanner.',
    options: opts4(
      'Cloud SQL is a good fit for a single-region relational workload under a few TB',
      'Cloud Spanner provides horizontal write scaling and strong multi-region consistency',
      'Cloud SQL scales writes horizontally across regions automatically',
      'Cloud Spanner is appropriate when you need very high scale with global consistency'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Cloud SQL suits moderate single-region relational workloads; Spanner adds horizontal write scaling and strong global consistency for very large scale. Cloud SQL does not scale writes horizontally across regions.',
    references: [REF_CLOUDSQL, REF_SPANNER]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An ingestion pipeline must handle millions of IoT events per second and stream them into BigQuery for analytics. Which combination should the architect design?',
    options: opts4(
      'Direct device writes to BigQuery with no buffering',
      'Pub/Sub for ingestion, Dataflow for streaming transform, then BigQuery',
      'Cloud SQL as the ingestion buffer',
      'A single VM running a custom collector'
    ),
    correct: ['b'],
    explanation: 'Pub/Sub buffers high-volume event ingestion, Dataflow performs scalable streaming transformation, and BigQuery stores it for analytics — the canonical streaming analytics pattern. Direct writes, Cloud SQL buffering, or a single VM do not scale to millions of events/sec.',
    references: [REF_PUBSUB, REF_DATAFLOW, REF_BIGQUERY]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'A hybrid design needs encrypted private connectivity to a VPC quickly, with built-in 99.99% availability, but a Dedicated Interconnect lead time is too long. Which option should be chosen?',
    options: opts4(
      'HA VPN with two tunnels on separate interfaces',
      'A single Classic VPN tunnel',
      'Public internet with no encryption',
      'Cloud CDN'
    ),
    correct: ['a'],
    explanation: 'HA VPN provides an SLA-backed (99.99%) encrypted connection that can be provisioned quickly while Interconnect is being arranged. A single Classic VPN tunnel lacks the HA SLA, and unencrypted internet or CDN do not provide private connectivity.',
    references: [REF_VPN]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'Choosing a regional (rather than zonal) GKE cluster places the control plane and nodes across multiple zones, improving availability during a zonal outage.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'A regional GKE cluster replicates the control plane and spreads nodes across multiple zones, so a single zonal failure does not take down the cluster control plane or all nodes.',
    references: [REF_GKE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload needs predictable single-tenant hardware isolation for licensing/compliance while still using Compute Engine. Which feature meets this?',
    options: opts4(
      'Spot VMs',
      'Sole-tenant nodes',
      'Preemptible disks',
      'Shared-core machine types'
    ),
    correct: ['b'],
    explanation: 'Sole-tenant nodes dedicate physical hosts to a single customer, supporting hardware isolation and bring-your-own-license scenarios. Spot/preemptible and shared-core options do not provide dedicated single-tenant hardware.',
    references: [REF_GCE]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which storage class best fits data accessed about once a month with low cost but reasonable retrieval?',
    options: opts4(
      'Standard',
      'Nearline',
      'Archive',
      'Multi-Regional only'
    ),
    correct: ['b'],
    explanation: 'Nearline is designed for data accessed roughly once a month, balancing low storage cost with reasonable retrieval cost. Standard is for frequent access; Archive is for yearly access; Multi-Regional describes location, not access frequency tiering.',
    references: [REF_STORAGE_CLASS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must choose a service to run a containerized stateless API that should scale to zero when idle and bill only per request. Which platform fits?',
    options: opts4(
      'GKE Standard with always-on nodes',
      'Cloud Run',
      'Compute Engine MIG with min 3 instances',
      'App Engine flexible with min 2 instances'
    ),
    correct: ['b'],
    explanation: 'Cloud Run scales stateless containers to zero and bills per request/CPU time, eliminating idle cost. The other options keep minimum capacity running and incur idle charges.',
    references: [REF_RUN]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A global game leaderboard requires sub-second consistent reads/writes worldwide with relational semantics. Which database should the architect select?',
    options: opts4(
      'Cloud Spanner multi-region',
      'Cloud SQL single region',
      'Bigtable single cluster',
      'Cloud Storage'
    ),
    correct: ['a'],
    explanation: 'Cloud Spanner multi-region offers strongly consistent, low-latency relational reads/writes globally. Single-region Cloud SQL cannot serve consistent global writes, Bigtable lacks relational semantics, and Cloud Storage is object storage.',
    references: [REF_SPANNER]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'A design must isolate production and non-production networks while still allowing controlled DNS resolution and limited service access between them. Which approach is most appropriate?',
    options: opts4(
      'Place everything in one default VPC for simplicity',
      'Separate VPCs/projects with controlled peering or shared services and explicit firewall rules',
      'Use only public IPs to communicate between environments',
      'Disable firewall rules entirely'
    ),
    correct: ['b'],
    explanation: 'Separate VPCs/projects with explicit, controlled peering or shared services and tight firewall rules provide isolation with intentional, auditable connectivity. A single shared VPC, public-IP traffic, or disabled firewalls break isolation.',
    references: [REF_VPC, REF_PEERING]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service should an architect use to publish a managed, secured API gateway in front of serverless backends with authentication and quotas for partners?',
    options: opts4(
      'Cloud Endpoints / API Gateway',
      'Cloud NAT',
      'Cloud Trace',
      'Cloud Scheduler'
    ),
    correct: ['a'],
    explanation: 'Cloud Endpoints / API Gateway fronts serverless backends with managed authentication, API keys, and quota enforcement for partner APIs. NAT, Trace, and Scheduler serve unrelated purposes.',
    references: [REF_ENDPOINTS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A data team needs to run existing Apache Spark jobs on Google Cloud with ephemeral, autoscaling clusters created per job. Which service should the architect propose?',
    options: opts4(
      'Dataproc with ephemeral job-scoped clusters',
      'A permanent self-managed Hadoop cluster on VMs',
      'BigQuery only',
      'Cloud Functions'
    ),
    correct: ['a'],
    explanation: 'Dataproc runs managed Spark/Hadoop and supports ephemeral, autoscaling per-job clusters that minimize cost and ops. A permanent self-managed cluster adds overhead; BigQuery and Functions do not run arbitrary Spark jobs.',
    references: [REF_ARCH, REF_DATAFLOW]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A solution must keep web tier and database tier in separate subnets with firewall segmentation in a single VPC. Which networking construct provides this segmentation?',
    options: opts4(
      'Separate subnets with firewall rules scoped by network tags or service accounts',
      'A single subnet with no rules',
      'Public IPs on every instance',
      'Cloud CDN'
    ),
    correct: ['a'],
    explanation: 'Separate subnets combined with firewall rules targeting network tags or service accounts implement tiered segmentation within one VPC. A flat subnet with no rules or public IPs everywhere defeats segmentation.',
    references: [REF_VPC]
  },

  // ── Managing and provisioning a solution infrastructure (12) ──
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team wants reproducible environments and the ability to review infrastructure changes before applying them. Which workflow should the architect mandate?',
    options: opts4(
      'Manual console edits with screenshots',
      'Terraform code in Git with pull-request review of the plan',
      'Ad-hoc gcloud commands typed by each engineer',
      'One engineer remembering all changes'
    ),
    correct: ['b'],
    explanation: 'Terraform in version control with PR review of the plan provides reproducible, auditable, peer-reviewed infrastructure changes. Manual edits and ad-hoc commands are not reproducible or reviewable.',
    references: [REF_TERRAFORM]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants to enforce that all new projects automatically get a baseline of IAM, networking, and logging configuration. Which approach scales best?',
    options: opts4(
      'Manually configure each new project',
      'A landing-zone/project-factory pattern using Terraform modules and organization policies',
      'Email a checklist to project owners',
      'Hope owners remember the standards'
    ),
    correct: ['b'],
    explanation: 'A project-factory/landing-zone pattern with Terraform modules and org policies automatically applies a consistent baseline to every new project at scale. Manual setup and checklists do not scale or guarantee compliance.',
    references: [REF_TERRAFORM, REF_ORGPOLICY]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Compute Engine autoscaling signals for a managed instance group.',
    options: opts4(
      'Average CPU utilization target',
      'HTTP load balancing serving capacity',
      'A custom Cloud Monitoring metric',
      'The number of lines in the application log file'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'MIG autoscaling can use average CPU utilization, load-balancing serving capacity, or custom Cloud Monitoring metrics. Raw log line count is not an autoscaling signal.',
    references: [REF_AUTOSCALER]
  },
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which resource hierarchy level should host shared networking when many service projects need to use centrally managed subnets?',
    options: opts4(
      'A Shared VPC host project',
      'Each developer\'s personal project',
      'A single zonal resource',
      'The billing account'
    ),
    correct: ['a'],
    explanation: 'A Shared VPC host project centrally owns subnets and firewall rules consumed by attached service projects. Personal projects, zonal resources, or the billing account cannot serve this role.',
    references: [REF_SHARED_VPC, REF_RESMGR]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'You must give a CI pipeline running outside Google Cloud the ability to deploy without storing a long-lived service account key. Which feature should be configured?',
    options: opts4(
      'Download and store a JSON key in the CI secret store',
      'Workload Identity Federation with the external OIDC provider',
      'Embed the key in the pipeline YAML',
      'Use the default Compute Engine service account key'
    ),
    correct: ['b'],
    explanation: 'Workload Identity Federation lets an external CI system exchange its OIDC token for short-lived Google credentials with no stored long-lived key. Storing or embedding JSON keys is the credential-leak anti-pattern.',
    references: [REF_SA, REF_IAM_BEST]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload needs egress to the internet from private instances but the security team requires a fixed set of source IPs for allowlisting by partners. Which configuration achieves this?',
    options: opts4(
      'Give every instance an ephemeral external IP',
      'Cloud NAT with reserved static external IP addresses',
      'Disable internet access entirely',
      'Use Cloud CDN for egress'
    ),
    correct: ['b'],
    explanation: 'Cloud NAT configured with reserved static external IPs gives private instances internet egress from a fixed, allowlist-friendly IP set. Ephemeral IPs change, disabling access breaks the workload, and CDN is not an egress NAT.',
    references: [REF_VPC]
  },
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Granting IAM roles to a Google group and managing membership in the group is preferable to granting roles to many individual users.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Assigning roles to groups and managing access via group membership simplifies administration, reduces error, and is an IAM best practice compared to per-user bindings.',
    references: [REF_IAM_BEST]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must roll out a new VM image to a managed instance group with zero downtime and the ability to pause/abort if errors appear. Which mechanism should be used?',
    options: opts4(
      'Delete all instances then recreate them',
      'A managed instance group rolling update with surge and max-unavailable settings',
      'Manually SSH into each VM and patch it',
      'Recreate the group from scratch'
    ),
    correct: ['b'],
    explanation: 'MIG rolling updates replace instances gradually using surge/max-unavailable controls and can be paused or rolled back, achieving zero-downtime deploys. Delete-and-recreate or manual patching cause downtime and drift.',
    references: [REF_MIG]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A team needs Terraform state stored securely with locking so concurrent applies do not corrupt it. Which backend should the architect specify?',
    options: opts4(
      'Local state on each engineer\'s laptop',
      'A Cloud Storage backend with state locking',
      'A shared Google Doc',
      'No state file at all'
    ),
    correct: ['b'],
    explanation: 'A Cloud Storage backend stores Terraform state centrally and supports locking to prevent concurrent corruption. Local state, documents, or no state break team collaboration and integrity.',
    references: [REF_TERRAFORM, REF_STORAGE]
  },
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which IAM identity should a workload use to call Google APIs, rather than a human user account?',
    options: opts4(
      'A personal Gmail account',
      'A dedicated service account with least-privilege roles',
      'The organization admin\'s user',
      'An anonymous identity'
    ),
    correct: ['b'],
    explanation: 'Workloads should authenticate as a dedicated least-privilege service account, not a human or admin user, so access is scoped and auditable. Personal or admin user accounts and anonymous access are insecure.',
    references: [REF_SA]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A multinational must ensure resources are provisioned only in approved regions across all projects. Which provisioning guardrail is correct?',
    options: opts4(
      'Trust developers to pick correct regions',
      'Apply an organization policy resource-location constraint at the org/folder level',
      'Add a comment in the Terraform file',
      'Review regions after the fact monthly'
    ),
    correct: ['b'],
    explanation: 'An org-level resource-location organization policy technically prevents provisioning outside approved regions for all child projects. Trust, comments, or after-the-fact reviews do not prevent violations.',
    references: [REF_ORGPOLICY]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'During provisioning, an architect wants infrastructure changes applied automatically only after they pass automated policy checks. Which practice enables this?',
    options: opts4(
      'Apply changes manually whenever convenient',
      'A CI/CD pipeline running terraform plan plus policy-as-code validation before apply',
      'Skip validation to deploy faster',
      'Let each engineer apply from their laptop'
    ),
    correct: ['b'],
    explanation: 'A pipeline that runs terraform plan and policy-as-code (e.g., OPA/constraint) checks before apply enforces compliant, automated provisioning. Manual or laptop-based applies bypass guardrails.',
    references: [REF_TERRAFORM, REF_CICD]
  },

  // ── Designing for security and compliance (12) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which principle should guide IAM role assignment for a contractor needing temporary deploy access?',
    options: opts4(
      'Grant broad Owner to avoid future requests',
      'Grant least-privilege roles, time-bound with IAM Conditions',
      'Share an admin\'s credentials',
      'Make the project public'
    ),
    correct: ['b'],
    explanation: 'Least-privilege roles bounded by IAM Conditions for the contract period limit exposure and auto-expire. Broad Owner, shared admin credentials, and public access violate security principles.',
    references: [REF_IAM_BEST]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A healthcare workload must encrypt data with keys the customer controls and stores in their own on-prem HSM. Which Cloud KMS capability should the architect design?',
    options: opts4(
      'Default Google-managed encryption',
      'Cloud External Key Manager (Cloud EKM) with CMEK',
      'No encryption, rely on network isolation',
      'Public key shared with the application team'
    ),
    correct: ['b'],
    explanation: 'Cloud External Key Manager lets services use keys held in an external/on-prem key manager via CMEK, keeping key custody outside Google. Default keys give no external control, and the other options are insecure.',
    references: [REF_CMEK, REF_KMS]
  },
  {
    domain: SECURITY, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL controls that help meet a data-residency requirement that customer data must never leave the EU.',
    options: opts4(
      'Organization policy resource-location constraint limiting to EU regions',
      'Choosing EU multi-region or EU regional services for storage',
      'Allowing any region for cost reasons',
      'VPC Service Controls perimeters to prevent data egress to non-approved projects'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Location org policy, EU-scoped services, and VPC Service Controls perimeters together enforce EU data residency. Allowing any region for cost directly violates the residency requirement.',
    references: [REF_ORGPOLICY, REF_VPCSC]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must ensure that even project Owners cannot read the contents of a sensitive Cloud Storage bucket from an untrusted network. Which control adds this protection beyond IAM?',
    options: opts4(
      'A stronger bucket name',
      'VPC Service Controls plus access levels restricting context',
      'Object lifecycle rules',
      'Turning off logging'
    ),
    correct: ['b'],
    explanation: 'VPC Service Controls with access-context levels restrict API access by network/context regardless of IAM role, so even Owners are blocked from untrusted contexts. Naming, lifecycle rules, and disabling logging do not provide this.',
    references: [REF_VPCSC]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service centralizes detection of publicly exposed buckets, open firewall rules, and known vulnerabilities across the organization?',
    options: opts4(
      'Security Command Center',
      'Cloud Trace',
      'Cloud DNS',
      'Cloud Build'
    ),
    correct: ['a'],
    explanation: 'Security Command Center surfaces misconfigurations like public buckets and open firewalls plus vulnerability findings org-wide. Trace, DNS, and Build serve unrelated functions.',
    references: [REF_SCC]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance audit requires proof that admin actions on IAM are recorded and cannot be silently deleted by an admin. Which design satisfies this?',
    options: opts4(
      'Keep logs only in the source project',
      'Export Cloud Audit Logs to a dedicated logging project/bucket with restricted IAM and retention lock',
      'Disable Data Access logs to save space',
      'Trust admins not to delete logs'
    ),
    correct: ['b'],
    explanation: 'Exporting audit logs to a separate, access-restricted project/bucket with retention/lock prevents tampering by source-project admins. Keeping logs only locally or trusting admins does not satisfy auditors.',
    references: [REF_LOGGING]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A public API must rate-limit abusive clients and block known malicious IP ranges at the edge. Which service should the architect specify?',
    options: opts4(
      'Cloud Armor with rate-limiting and IP deny rules',
      'Cloud NAT',
      'Cloud CDN alone',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Cloud Armor enforces rate limiting and IP allow/deny at the load balancer edge, throttling abusive clients and blocking malicious ranges. NAT, CDN alone, and Cloud SQL do not provide edge rate-limiting.',
    references: [REF_ARMOR]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Using customer-managed encryption keys (CMEK) lets an organization disable or rotate the key, which can render the protected data unreadable until the key is restored.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'CMEK gives the customer control over the key lifecycle; disabling or destroying the key makes data encrypted with it inaccessible, which is part of the control (and risk) CMEK provides.',
    references: [REF_CMEK, REF_KMS]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect needs to provide just-in-time elevated access for incident responders with full audit. Which Google Cloud capability should be used?',
    options: opts4(
      'Permanent Owner for the on-call team',
      'IAM with time-bound conditional role grants (and privileged access workflows)',
      'A shared break-glass password in a wiki',
      'No elevation, share root keys'
    ),
    correct: ['b'],
    explanation: 'Time-bound conditional IAM grants provide just-in-time elevation that expires and is audited. Permanent Owner, shared passwords, or shared root keys are insecure and unauditable.',
    references: [REF_IAM, REF_IAM_BEST]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'To enforce that Compute Engine VMs cannot have external IP addresses across the whole organization, the architect should apply which control?',
    options: opts4(
      'A code-review reminder',
      'The "Define allowed external IPs for VM instances" / "vmExternalIpAccess" organization policy constraint',
      'A monthly manual audit',
      'A naming convention'
    ),
    correct: ['b'],
    explanation: 'The organization policy constraint that restricts external IP access on VM instances technically prevents external IPs org-wide. Reminders, audits, and naming conventions are not enforcement controls.',
    references: [REF_ORGPOLICY]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Where should TLS private keys and database credentials for an application be sourced at runtime?',
    options: opts4(
      'Baked into the container image',
      'Retrieved from Secret Manager with IAM-scoped access at runtime',
      'Stored in a public bucket',
      'Printed in application logs for convenience'
    ),
    correct: ['b'],
    explanation: 'Fetching secrets at runtime from Secret Manager with scoped IAM keeps them encrypted, rotatable, and audited. Baking into images, public buckets, or logging secrets exposes them.',
    references: [REF_SECMGR]
  },
  {
    domain: SECURITY, difficulty: 4, type: QType.SINGLE,
    stem: 'A multi-tenant SaaS must guarantee one tenant cannot access another tenant\'s Cloud Storage data even through application bugs. Which architectural control most strongly enforces isolation?',
    options: opts4(
      'A single bucket with tenant ID in object names and app-level checks only',
      'Per-tenant projects or buckets with distinct IAM/CMEK boundaries',
      'Relying solely on the application code to filter tenants',
      'A shared service account for all tenants'
    ),
    correct: ['b'],
    explanation: 'Hard isolation via per-tenant projects or buckets with separate IAM (and optionally CMEK) means a code bug cannot cross tenant boundaries because the platform enforces it. App-only filtering and shared accounts fail under bugs.',
    references: [REF_RESMGR, REF_IAM_BEST]
  },

  // ── Analyzing and optimizing technical and business processes (8) ──
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A workload has a steady baseline plus unpredictable peaks. Which mix optimizes cost while meeting demand?',
    options: opts4(
      'On-demand for everything',
      'Committed use discounts for the steady baseline and autoscaling on-demand/Spot for peaks',
      '3-year commitment sized for absolute peak',
      'Spot VMs for the critical baseline'
    ),
    correct: ['b'],
    explanation: 'Committing the predictable baseline (CUDs) and autoscaling the variable peak with on-demand/Spot balances savings and elasticity. All on-demand overpays for the baseline, peak-sized commitments waste money, and Spot is unsuitable for a critical baseline.',
    references: [REF_CUD, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A business needs to attribute cloud cost to teams and products for chargeback. Which practice should the architect implement?',
    options: opts4(
      'One shared project with no labels',
      'Consistent resource labels and/or per-team projects plus billing export analysis',
      'Guess each team\'s share quarterly',
      'Turn off billing reports'
    ),
    correct: ['b'],
    explanation: 'Consistent labels and/or per-team projects with billing export analysis enable accurate chargeback/showback. A single unlabeled project and guessing provide no defensible attribution.',
    references: [REF_BILLING, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'Storage costs are growing because old objects are never tiered or deleted. Which automated optimization should the architect apply?',
    options: opts4(
      'Manually delete objects occasionally',
      'Object lifecycle management rules to transition to colder classes and delete after retention',
      'Keep everything in Standard forever',
      'Ask users to clean up'
    ),
    correct: ['b'],
    explanation: 'Cloud Storage object lifecycle rules automatically transition aging objects to cheaper classes and delete them after the retention period, controlling cost without manual effort. Manual cleanup and keeping everything in Standard do not scale.',
    references: [REF_STORAGE_CLASS, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL ways to optimize Compute Engine cost without harming a steady production workload.',
    options: opts4(
      'Apply committed use discounts to the steady baseline',
      'Right-size over-provisioned instances based on utilization data',
      'Run the production baseline entirely on Spot VMs',
      'Delete unattached/idle persistent disks and unused IPs'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'CUDs on the baseline, right-sizing, and removing idle resources cut cost safely. Running a steady production baseline entirely on Spot risks frequent preemption and is unsafe for steady prod.',
    references: [REF_CUD, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'The finance team wants to be alerted when projected monthly spend will exceed budget. Which feature should the architect enable?',
    options: opts4(
      'Cloud Billing budgets with threshold and forecasted-spend alerts',
      'Cloud Trace sampling',
      'VPC Flow Logs',
      'Cloud DNS logging'
    ),
    correct: ['a'],
    explanation: 'Cloud Billing budgets can alert on actual and forecasted spend against thresholds, giving early overspend warning. Trace, flow logs, and DNS logging do not track budget.',
    references: [REF_BILLING]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A business process for approving infrastructure changes is slow and manual, delaying delivery. Which improvement aligns technical and business goals best?',
    options: opts4(
      'Remove all approvals',
      'Automate guardrails (policy-as-code) so most changes pass automatically and only exceptions need human review',
      'Add more manual approval layers',
      'Stop making changes'
    ),
    correct: ['b'],
    explanation: 'Automated policy-as-code guardrails let compliant changes flow without manual bottlenecks while escalating only exceptions, improving delivery speed and governance. Removing approvals is risky; more layers slow delivery further.',
    references: [REF_TERRAFORM, REF_ARCH]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A reporting workload runs huge BigQuery scans repeatedly on the same large table. Which optimization reduces repeated cost the most?',
    options: opts4(
      'Re-run the full scan each time with SELECT *',
      'Partition/cluster the table and materialize commonly used aggregates',
      'Copy the table to Cloud SQL',
      'Disable query caching'
    ),
    correct: ['b'],
    explanation: 'Partitioning/clustering plus materialized views/aggregate tables drastically cut bytes scanned for repeated reporting queries. Full SELECT * scans, copying to Cloud SQL, or disabling caching increase cost.',
    references: [REF_BIGQUERY, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Sustained use discounts on Compute Engine are applied automatically when eligible predefined machine types run for a significant portion of the month.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Sustained use discounts are applied automatically (no commitment) for eligible predefined machine types that run for a large fraction of the billing month.',
    references: [REF_COST]
  },

  // ── Managing implementation (8) ──
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An on-prem PostgreSQL must move to Cloud SQL for PostgreSQL with minimal downtime and continuous change replication during validation. Which service is correct?',
    options: opts4(
      'Storage Transfer Service',
      'Database Migration Service',
      'Manual pg_dump/pg_restore only',
      'BigQuery Data Transfer Service'
    ),
    correct: ['b'],
    explanation: 'Database Migration Service performs continuous replication from source PostgreSQL to Cloud SQL, enabling minimal-downtime cutover after validation. A one-time dump means extended downtime; the other services do not migrate live databases.',
    references: [REF_DTS]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants automated container builds and deployment to Cloud Run triggered on each merge to main. Which Google Cloud service should be implemented?',
    options: opts4(
      'Cloud Scheduler',
      'Cloud Build triggers integrated with the repository',
      'Cloud Tasks',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'Cloud Build triggers build the image and deploy to Cloud Run automatically on merge, providing managed CI/CD. Scheduler/Tasks are job/queue services; NAT is networking.',
    references: [REF_CICD, REF_RUN]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'A large offline dataset (petabytes) must be moved to Cloud Storage where network transfer would take months. Which option should the architect choose?',
    options: opts4(
      'gsutil over the existing internet link',
      'Transfer Appliance for offline bulk import',
      'Database Migration Service',
      'Email the data to support'
    ),
    correct: ['b'],
    explanation: 'Transfer Appliance ships a physical device for offline bulk transfer when network transfer is impractical at petabyte scale. gsutil over the internet would take too long, DMS is for databases, and email is not viable.',
    references: [REF_TRANSFER]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'During a cutover, an architect wants to shift traffic gradually from the old App Engine version to the new one and roll back instantly if needed. Which capability supports this?',
    options: opts4(
      'Deleting the old version immediately',
      'App Engine traffic splitting between versions',
      'Editing files in place on the running version',
      'A single big-bang switch with no rollback'
    ),
    correct: ['b'],
    explanation: 'App Engine traffic splitting shifts a configurable percentage between versions and allows instant rollback by reverting the split. Deleting the old version or big-bang switches remove the safe fallback.',
    references: [REF_APPENGINE]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL elements of a low-risk production migration plan.',
    options: opts4(
      'A documented rollback plan',
      'A validation/test phase against migrated data before cutover',
      'Cut over everything at once with no fallback',
      'Pilot with a subset of traffic or users first'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A rollback plan, a validation phase, and a pilot subset all reduce migration risk. Cutting everything over at once with no fallback is the high-risk anti-pattern.',
    references: [REF_MIGRATE, REF_DR]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which deployment approach lets an architect run the new and old versions side by side and switch traffic at once after verifying the new one?',
    options: opts4(
      'Blue-green deployment',
      'In-place edits',
      'Manual VM patching',
      'No versioning'
    ),
    correct: ['a'],
    explanation: 'Blue-green deployment runs the new (green) environment alongside the old (blue) and switches traffic after verification, enabling fast rollback by switching back. The other options lack a clean switch/rollback.',
    references: [REF_CICD]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect is moving a stateless web tier first and the database last in a phased migration. What is the main reason to migrate the database last (or use replication)?',
    options: opts4(
      'Databases never need migrating',
      'To minimize data-consistency risk and downtime by keeping the source DB authoritative until cutover',
      'Because stateless tiers cannot run in the cloud',
      'To increase total downtime'
    ),
    correct: ['b'],
    explanation: 'Keeping the source database authoritative (often with replication) until the final cutover minimizes data-consistency risk and downtime while the stateless tiers are validated. The other statements are incorrect.',
    references: [REF_DTS, REF_MIGRATE]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Infrastructure as code with automated CI/CD makes a migrated environment easier to recreate consistently in case of failure than manually built infrastructure.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'IaC plus automated CI/CD captures the environment declaratively, so it can be recreated consistently and quickly after a failure, unlike manually built, undocumented infrastructure.',
    references: [REF_TERRAFORM, REF_CICD]
  },

  // ── Ensuring solution and operations reliability (9) ──
  {
    domain: RELIABILITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the difference between an SLO and an SLA?',
    options: opts4(
      'They are identical terms',
      'An SLO is an internal reliability target; an SLA is an external contractual commitment with consequences',
      'An SLA is stricter than physics allows',
      'An SLO only applies to billing'
    ),
    correct: ['b'],
    explanation: 'An SLO is the internal target for a service level indicator; an SLA is the external, contractual promise to customers (often with penalties) and is typically looser than the internal SLO. They are not identical.',
    references: [REF_SRE]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A globally distributed web service must survive a full region outage with automatic user redirection. Which design provides this reliability?',
    options: opts4(
      'Single-region deployment with backups',
      'Multi-region backends behind a global external load balancer with health-based failover',
      'A larger single VM',
      'Manual DNS change on outage'
    ),
    correct: ['b'],
    explanation: 'Multi-region backends behind a global external load balancer automatically route users away from an unhealthy region, surviving a regional outage. Single-region or manual-DNS approaches cannot fail over automatically or fast enough.',
    references: [REF_LB, REF_DR]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A team keeps getting paged for transient blips that self-heal in seconds. Which change reduces alert fatigue while protecting users?',
    options: opts4(
      'Page on any single failed request',
      'Alert on sustained SLO burn over a window rather than instantaneous errors',
      'Disable all alerts',
      'Page two teams instead of one'
    ),
    correct: ['b'],
    explanation: 'Alerting on sustained error-budget burn over a window suppresses noise from transient self-healing blips while still catching real degradation. Per-request paging is noisy; disabling alerts hides real issues.',
    references: [REF_SRE, REF_MONITORING]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid components of a tested disaster-recovery strategy.',
    options: opts4(
      'Defined RTO and RPO targets per workload',
      'Regular restore tests and DR drills (game days)',
      'Assuming backups work without ever testing restores',
      'Cross-region replication or backups for critical data'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Defined RTO/RPO, tested restores/DR drills, and cross-region data protection make a credible DR strategy. Assuming untested backups work is a classic failure that surfaces only during a real disaster.',
    references: [REF_DR]
  },
  {
    domain: RELIABILITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Google Cloud capability collects metrics and lets you build uptime checks and alerting policies for a service?',
    options: opts4(
      'Cloud Monitoring',
      'Cloud Billing',
      'Cloud KMS',
      'Cloud NAT'
    ),
    correct: ['a'],
    explanation: 'Cloud Monitoring collects metrics, runs uptime checks, and drives alerting policies for services. Billing, KMS, and NAT do not provide monitoring/alerting.',
    references: [REF_MONITORING]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A service depends on a downstream API that occasionally slows down. Which pattern prevents the slow dependency from exhausting all request threads?',
    options: opts4(
      'No timeout so requests wait indefinitely',
      'Timeouts plus bulkheads/connection limits and graceful degradation',
      'Infinite retries with no backoff',
      'Removing health checks'
    ),
    correct: ['b'],
    explanation: 'Timeouts, bulkheads/connection limits, and graceful degradation contain a slow dependency so it cannot consume all resources. No timeouts or infinite retries cause resource exhaustion and cascading failure.',
    references: [REF_SRE, REF_ARCH]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A Cloud SQL database is a single point of failure for a critical app. Which configuration improves availability with automatic failover within the region?',
    options: opts4(
      'Add more application replicas only',
      'Enable Cloud SQL high availability (regional, with a standby in another zone)',
      'Increase the disk size',
      'Take more frequent manual backups only'
    ),
    correct: ['b'],
    explanation: 'Cloud SQL HA provisions a synchronous standby in another zone with automatic failover, removing the database single point of failure within the region. App replicas, disk size, or backups alone do not provide DB failover.',
    references: [REF_CLOUDSQL]
  },
  {
    domain: RELIABILITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Blameless postmortems focus on systemic causes and improvements rather than punishing individuals, which encourages honest reporting and learning.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Blameless postmortems concentrate on systemic contributing factors and concrete improvements instead of individual blame, which fosters transparency and continuous reliability improvement.',
    references: [REF_SRE]
  },
  {
    domain: RELIABILITY, difficulty: 4, type: QType.SINGLE,
    stem: 'An architect needs to ensure capacity for a known annual traffic surge (e.g., a sale event) without permanent over-provisioning. Which approach best balances reliability and cost?',
    options: opts4(
      'Permanently provision for the annual peak year-round',
      'Pre-scale autoscaling capacity and reservations ahead of the event, then scale back down',
      'Do nothing and hope it holds',
      'Disable autoscaling during the event'
    ),
    correct: ['b'],
    explanation: 'Pre-scaling autoscaler minimums and creating short-term reservations before the event guarantees capacity for the surge, then scaling back avoids year-round waste. Permanent peak provisioning wastes money; doing nothing or disabling autoscaling risks an outage.',
    references: [REF_AUTOSCALER, REF_COST]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Designing and planning a cloud solution architecture (16) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team needs to run scheduled batch ETL jobs that take 2 hours and run nightly. Which compute option minimizes cost while meeting the schedule?',
    options: opts4(
      'An always-on VM running 24x7',
      'A batch job on Spot/Compute Engine started on schedule and stopped when done',
      'Cloud Run min-instances set high all day',
      'App Engine flexible with constant instances'
    ),
    correct: ['b'],
    explanation: 'Running the batch on schedule on Spot/Compute Engine and stopping it when finished pays only for the 2-hour window. Always-on or constant-instance options pay for 22 idle hours.',
    references: [REF_PREEMPTIBLE, REF_COST]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must choose storage for a system needing strong relational integrity, complex joins, and a few hundred GB in one region with managed backups. Which fits best?',
    options: opts4(
      'Bigtable',
      'Cloud SQL',
      'Cloud Storage',
      'Pub/Sub'
    ),
    correct: ['b'],
    explanation: 'Cloud SQL is a managed relational database with joins, transactions, and automated backups, ideal for a few hundred GB single-region workload. Bigtable lacks relational joins, Cloud Storage is object storage, and Pub/Sub is messaging.',
    references: [REF_CLOUDSQL]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Cloud Run for a stateless HTTP service.',
    options: opts4(
      'It can scale to zero when there is no traffic',
      'It autoscales based on concurrent requests',
      'It is ideal for a workload requiring a custom Linux kernel module',
      'It bills based on resources used while handling requests'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Cloud Run scales to zero, autoscales by request concurrency, and bills for resources during request handling. It abstracts the OS, so it cannot load a custom kernel module — that requires Compute Engine.',
    references: [REF_RUN]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which database service is purpose-built for time-series and very high write throughput wide-column workloads such as IoT sensor data?',
    options: opts4(
      'Cloud SQL',
      'Cloud Bigtable',
      'Firestore',
      'BigQuery'
    ),
    correct: ['b'],
    explanation: 'Bigtable is optimized for very high write throughput, low-latency wide-column data such as time-series/IoT. Cloud SQL does not scale to that write rate, Firestore is document-oriented, and BigQuery is for analytics not high-rate point writes.',
    references: [REF_BIGTABLE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A company needs an event-driven serverless workflow that orchestrates several Cloud Functions and external APIs with retries and state. Which Google Cloud building block fits the orchestration need?',
    options: opts4(
      'A single monolithic Cloud Function doing everything',
      'Workflows (and/or Eventarc) to orchestrate serverless steps',
      'A cron job on a VM',
      'Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'Workflows orchestrates multiple serverless steps with retries and state, often event-triggered via Eventarc, keeping the design serverless and resilient. A monolithic function or VM cron is fragile; CDN is unrelated.',
    references: [REF_FUNCTIONS, REF_ARCH]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A solution needs to serve user-uploaded media globally with low latency and offload origin traffic. Which design should the architect choose?',
    options: opts4(
      'Serve directly from one regional VM',
      'Store in Cloud Storage and serve through a global load balancer with Cloud CDN',
      'Email files to users',
      'Store in Cloud SQL as BLOBs'
    ),
    correct: ['b'],
    explanation: 'Cloud Storage as the origin behind a global load balancer with Cloud CDN caches media at the edge for global low latency and offloads the origin. A single regional VM cannot serve global users well, and storing media as DB BLOBs is an anti-pattern.',
    references: [REF_STORAGE, REF_LB]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'An architect needs private access from on-prem to Google APIs (e.g., Cloud Storage) without traversing the public internet. Which design provides this?',
    options: opts4(
      'Public API endpoints over the internet',
      'Private Google Access / Private Service Connect over hybrid connectivity (Interconnect or VPN)',
      'Cloud CDN',
      'A public load balancer'
    ),
    correct: ['b'],
    explanation: 'Private Google Access / Private Service Connect combined with Interconnect or VPN lets on-prem reach Google APIs over private connectivity instead of the public internet. CDN and public endpoints/load balancers do not provide private API access.',
    references: [REF_INTERCONNECT, REF_VPC]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'BigQuery is a serverless data warehouse, so the architect does not provision or manage compute clusters to run SQL analytics.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'BigQuery is serverless: Google manages the underlying compute and storage, and the architect simply runs SQL without provisioning or managing clusters.',
    references: [REF_BIGQUERY]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload requires a managed relational database but must also serve global low-latency reads from multiple continents. Which option should the architect select?',
    options: opts4(
      'Cloud SQL with a single regional instance',
      'Cloud Spanner multi-region configuration',
      'Bigtable single cluster',
      'Memorystore'
    ),
    correct: ['b'],
    explanation: 'Cloud Spanner multi-region provides relational semantics with globally distributed low-latency reads and strong consistency. A single-region Cloud SQL cannot serve global low-latency reads, Bigtable is not relational, and Memorystore is a cache.',
    references: [REF_SPANNER]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which compute platform is best for a traditional web app written for App Engine standard runtimes that wants automatic scaling and zero server management?',
    options: opts4(
      'Compute Engine with manual scaling',
      'App Engine standard environment',
      'A self-managed Kubernetes cluster',
      'Bare-metal servers'
    ),
    correct: ['b'],
    explanation: 'App Engine standard provides fully managed automatic scaling (including to zero) with no server management for supported runtimes. The other options require infrastructure or scaling management.',
    references: [REF_APPENGINE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must design a streaming analytics pipeline with exactly-once processing and autoscaling for variable event volume. Which managed service fits the processing layer?',
    options: opts4(
      'Dataflow (Apache Beam) streaming pipeline',
      'A single VM running a custom consumer',
      'Cloud SQL triggers',
      'Cloud CDN'
    ),
    correct: ['a'],
    explanation: 'Dataflow runs autoscaling Apache Beam streaming pipelines with strong processing semantics, ideal for variable-volume stream analytics. A single VM does not autoscale, and Cloud SQL triggers/CDN do not process streams.',
    references: [REF_DATAFLOW]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must choose between GKE and Cloud Run for a containerized service that needs sidecars, DaemonSets, and fine-grained pod networking. Which is appropriate?',
    options: opts4(
      'Cloud Run, because it supports DaemonSets',
      'GKE, because it supports sidecars, DaemonSets, and fine-grained pod networking',
      'App Engine standard',
      'Cloud Functions'
    ),
    correct: ['b'],
    explanation: 'GKE exposes full Kubernetes primitives (sidecars, DaemonSets, network policy), which Cloud Run/App Engine/Functions abstract away. Cloud Run does not support DaemonSets, so GKE is the right fit here.',
    references: [REF_GKE, REF_RUN]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'TerramEarth wants to predict part failures from telemetry. Which architecture ingests, stores, and analyzes the data at scale on Google Cloud?',
    options: opts4(
      'Devices write straight to a single Cloud SQL instance',
      'Pub/Sub ingestion to Dataflow to BigQuery, with ML on the curated data',
      'A spreadsheet updated nightly',
      'Cloud CDN caching the telemetry'
    ),
    correct: ['b'],
    explanation: 'Pub/Sub ingests high-volume telemetry, Dataflow transforms it, BigQuery stores it for analysis, and ML runs on the curated data — a scalable predictive-maintenance pipeline. A single Cloud SQL instance or spreadsheet cannot scale, and CDN is irrelevant.',
    references: [REF_PUBSUB, REF_DATAFLOW, REF_BIGQUERY]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which option provides a managed NoSQL document database that scales automatically and is well suited to a mobile app backend?',
    options: opts4(
      'Firestore',
      'Cloud Spanner',
      'BigQuery',
      'Compute Engine'
    ),
    correct: ['a'],
    explanation: 'Firestore is a fully managed, automatically scaling NoSQL document database with mobile SDKs, ideal for mobile backends. Spanner is relational, BigQuery is analytics, and Compute Engine is unmanaged VMs.',
    references: [REF_FIRESTORE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A microservices platform must do internal service-to-service load balancing within the VPC with low latency and no public exposure. Which option should the architect design?',
    options: opts4(
      'Global external Application Load Balancer',
      'Internal load balancing (internal Application/Network Load Balancer)',
      'Cloud CDN',
      'Public DNS round-robin'
    ),
    correct: ['b'],
    explanation: 'Internal load balancing provides private, low-latency distribution for service-to-service traffic inside the VPC with no public exposure. External load balancers and public DNS expose services publicly; CDN caches HTTP content.',
    references: [REF_LB]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must choose a messaging pattern where each message is processed by exactly one of many competing workers, scaling horizontally. Which Google Cloud service fits?',
    options: opts4(
      'Pub/Sub with a single subscription shared by a pool of subscriber workers',
      'A broadcast email list',
      'Cloud CDN',
      'Cloud DNS'
    ),
    correct: ['a'],
    explanation: 'A Pub/Sub subscription shared by a pool of subscriber workers delivers each message to one worker (competing consumers) and scales horizontally. Email lists, CDN, and DNS do not implement work queues.',
    references: [REF_PUBSUB]
  },

  // ── Managing and provisioning a solution infrastructure (12) ──
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which practice prevents configuration drift between environments provisioned over time?',
    options: opts4(
      'Editing each environment by hand as needed',
      'Defining infrastructure as code and applying the same modules to every environment',
      'Letting each engineer tweak production directly',
      'Avoiding version control for infra'
    ),
    correct: ['b'],
    explanation: 'Applying the same version-controlled IaC modules to every environment keeps them consistent and prevents drift. Hand edits and untracked tweaks cause drift.',
    references: [REF_TERRAFORM]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must let a GKE Deployment access a Cloud SQL instance securely without storing the DB password in the container. Which approach is best?',
    options: opts4(
      'Hard-code the password in the image',
      'Use the Cloud SQL Auth Proxy/connector with Workload Identity and Secret Manager for credentials',
      'Expose Cloud SQL with a public IP and no auth',
      'Put the password in a ConfigMap in plaintext'
    ),
    correct: ['b'],
    explanation: 'The Cloud SQL Auth Proxy/connector with Workload Identity provides secure IAM-based connectivity, and Secret Manager safely supplies any needed credentials. Hard-coding, public-no-auth, or plaintext ConfigMaps expose the database.',
    references: [REF_CLOUDSQL, REF_SECMGR]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL recommended practices for managing service accounts at scale.',
    options: opts4(
      'Use distinct service accounts per workload with least privilege',
      'Prefer attached service accounts / Workload Identity over downloaded keys',
      'Share one powerful key across all teams',
      'Audit and remove unused service accounts and keys'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Per-workload least-privilege accounts, attached SA/Workload Identity, and auditing/removing unused accounts are best practices. Sharing one powerful key across teams maximizes risk and is discouraged.',
    references: [REF_SA, REF_IAM_BEST]
  },
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach lets the network team centrally manage subnets and firewall rules while application teams deploy into them from their own projects?',
    options: opts4(
      'A separate default network per project',
      'Shared VPC with the network team owning the host project',
      'Public IPs for all inter-project traffic',
      'Manual IP spreadsheet coordination'
    ),
    correct: ['b'],
    explanation: 'Shared VPC centralizes subnet and firewall management in a host project while service projects deploy workloads into the shared subnets. Per-project networks, public IPs, or spreadsheets do not centralize control.',
    references: [REF_SHARED_VPC]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants every project to inherit baseline guardrails (e.g., no external IPs, allowed regions) automatically. Which mechanism enforces this from the top of the hierarchy?',
    options: opts4(
      'A wiki page of rules',
      'Organization policies applied at the org/folder level',
      'Per-project manual configuration',
      'Quarterly audits only'
    ),
    correct: ['b'],
    explanation: 'Organization policies set at the org or folder level are inherited by all child projects, technically enforcing guardrails. Wikis, manual config, and audits do not prevent violations at creation time.',
    references: [REF_ORGPOLICY, REF_RESMGR]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A team needs to update the boot image of a fleet of stateless web servers with controlled rollout and automatic rollback on health-check failure. Which Compute Engine feature is correct?',
    options: opts4(
      'Manually re-create each instance one at a time',
      'A managed instance group with a rolling update and autohealing health checks',
      'A single unmanaged instance',
      'Snapshot the disk and hope'
    ),
    correct: ['b'],
    explanation: 'A MIG rolling update applies the new instance template gradually while autohealing health checks recreate unhealthy instances, giving controlled rollout. Manual recreation or single unmanaged instances lack this automation.',
    references: [REF_MIG]
  },
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Workload Identity Federation lets external workloads (e.g., another cloud or CI system) impersonate a Google service account using short-lived tokens without exporting a service account key.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Workload Identity Federation exchanges an external identity provider token for short-lived Google credentials, removing the need to create and export long-lived service account keys.',
    references: [REF_SA, REF_IAM_BEST]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must give private instances access to Google APIs without external IPs or a NAT for that traffic. Which feature should be enabled on the subnet?',
    options: opts4(
      'Private Google Access',
      'Cloud CDN',
      'External IP on every VM',
      'A public load balancer'
    ),
    correct: ['a'],
    explanation: 'Private Google Access lets instances without external IPs reach Google APIs and services using internal routing. CDN, external IPs, or public load balancers do not provide this private API path.',
    references: [REF_VPC]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A platform team wants every infrastructure change peer-reviewed and applied automatically only after merge. Which pipeline design achieves this?',
    options: opts4(
      'Engineers run terraform apply locally whenever',
      'Git-based workflow: PR review of terraform plan, then automated apply on merge via CI',
      'No review, direct console edits',
      'Nightly manual reconciliation by one person'
    ),
    correct: ['b'],
    explanation: 'A GitOps-style pipeline with PR review of the plan and automated apply on merge enforces review and consistency. Local applies, console edits, or one-person reconciliation are unreviewed and error-prone.',
    references: [REF_TERRAFORM, REF_CICD]
  },
  {
    domain: PROVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the recommended way to grant a workload on Compute Engine access to Cloud Storage?',
    options: opts4(
      'Embed a service account JSON key on the disk',
      'Attach a least-privilege service account to the instance and use Application Default Credentials',
      'Use the project owner credentials',
      'Make the bucket public'
    ),
    correct: ['b'],
    explanation: 'Attaching a least-privilege service account and using ADC avoids embedded keys and over-broad credentials while keeping access scoped and auditable. Embedded keys, owner credentials, or public buckets are insecure.',
    references: [REF_SA, REF_STORAGE]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A company must connect two VPCs in different organizations privately, with overlapping requirements managed centrally and the ability to scale to many producers/consumers. Which feature is most appropriate?',
    options: opts4(
      'Private Service Connect',
      'Public IP communication',
      'Cloud CDN',
      'A shared spreadsheet of routes'
    ),
    correct: ['a'],
    explanation: 'Private Service Connect lets consumers privately reach producer services across organizations with centralized, scalable endpoint management. Public IPs are not private, CDN is for content, and manual route sheets do not scale.',
    references: [REF_VPC, REF_PEERING]
  },
  {
    domain: PROVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'To safely manage Terraform state for a team, which configuration is recommended?',
    options: opts4(
      'Commit terraform.tfstate to the Git repo',
      'Use a remote Cloud Storage backend with versioning and state locking',
      'Keep state only on the lead\'s laptop',
      'Regenerate state from scratch each run'
    ),
    correct: ['b'],
    explanation: 'A remote Cloud Storage backend with object versioning and state locking provides safe shared state and prevents concurrent corruption. Committing state to Git, laptop-only state, or regenerating state are unsafe.',
    references: [REF_TERRAFORM, REF_STORAGE]
  },

  // ── Designing for security and compliance (12) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which IAM construct lets an architect grant access to a logically grouped set of projects (e.g., all of "department-x") at once with inheritance?',
    options: opts4(
      'Granting roles project-by-project repeatedly',
      'Granting roles at the folder level in the resource hierarchy',
      'Sharing one admin login',
      'Public access'
    ),
    correct: ['b'],
    explanation: 'Granting roles at a folder applies them, via inheritance, to all projects beneath it, simplifying access for a department. Per-project grants do not scale, and shared logins/public access are insecure.',
    references: [REF_RESMGR, REF_IAM]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulator requires that production data cannot be queried from developer laptops, only from approved corporate networks. Which Google Cloud feature enforces this context-based restriction?',
    options: opts4(
      'IAM roles alone',
      'VPC Service Controls with Access Context Manager access levels (IP/device based)',
      'A firewall rule on the database VM',
      'Object lifecycle policies'
    ),
    correct: ['b'],
    explanation: 'VPC Service Controls combined with Access Context Manager levels restrict access by network/device context regardless of IAM, blocking queries from non-approved networks. IAM alone, VM firewalls, or lifecycle rules do not enforce context-based API restrictions.',
    references: [REF_VPCSC]
  },
  {
    domain: SECURITY, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL controls that strengthen compliance for sensitive PII stored in Cloud Storage.',
    options: opts4(
      'CMEK so the customer controls the encryption keys',
      'VPC Service Controls perimeter around the storage project',
      'Making the bucket publicly readable for convenience',
      'Cloud Audit Logs Data Access logging exported to a protected sink'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'CMEK, a VPC-SC perimeter, and exported Data Access audit logs strengthen PII compliance. Making the bucket public directly violates confidentiality and is never acceptable for PII.',
    references: [REF_CMEK, REF_VPCSC, REF_LOGGING]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must ensure that a service account key is never created for a particular sensitive project. Which preventive control should be applied?',
    options: opts4(
      'A reminder in onboarding docs',
      'The organization policy constraint that disables service account key creation',
      'A monthly review of created keys',
      'Renaming the project'
    ),
    correct: ['b'],
    explanation: 'The organization policy that disables service account key creation technically prevents key creation for the project. Docs, after-the-fact reviews, and renaming do not prevent the action.',
    references: [REF_ORGPOLICY, REF_SA]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service should the architect use to detect and alert on suspicious IAM grants and exposed resources continuously?',
    options: opts4(
      'Security Command Center',
      'Cloud CDN',
      'Cloud DNS',
      'Cloud Scheduler'
    ),
    correct: ['a'],
    explanation: 'Security Command Center continuously detects misconfigurations, risky IAM, and exposed resources and can alert on them. CDN, DNS, and Scheduler do not provide security posture monitoring.',
    references: [REF_SCC]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated workload must keep encryption keys in a FIPS-validated HSM managed by Google. Which Cloud KMS option should the architect specify?',
    options: opts4(
      'Software-protected keys only',
      'Cloud HSM (hardware-protected keys)',
      'No keys, plaintext storage',
      'A key stored in a Cloud Storage object'
    ),
    correct: ['b'],
    explanation: 'Cloud HSM provides hardware-protected keys backed by FIPS-validated HSMs for stringent key-protection requirements. Software keys may not meet the HSM requirement, and the other options are insecure.',
    references: [REF_KMS]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'An internet-facing API behind the global load balancer needs protection from SQL-injection and OWASP-style attacks. Which service should be configured?',
    options: opts4(
      'Cloud Armor with preconfigured WAF rules',
      'Cloud NAT',
      'Cloud CDN only',
      'Cloud SQL'
    ),
    correct: ['a'],
    explanation: 'Cloud Armor offers preconfigured WAF rules (including OWASP/SQLi protections) applied at the load balancer edge. NAT, CDN alone, and Cloud SQL do not provide WAF protection.',
    references: [REF_ARMOR]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Organization policy constraints are evaluated when resources are created or modified, so they can prevent non-compliant configurations rather than only detecting them afterward.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Organization Policy is a preventive control: constraints are enforced at resource create/modify time, blocking non-compliant configurations rather than merely reporting them later.',
    references: [REF_ORGPOLICY]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A security review finds developers using personal-scope primitive roles broadly. Which remediation aligns with least privilege?',
    options: opts4(
      'Keep Editor for everyone for convenience',
      'Replace primitive roles with predefined or custom roles scoped to required actions and resources',
      'Grant Owner to reduce tickets',
      'Disable IAM entirely'
    ),
    correct: ['b'],
    explanation: 'Replacing broad primitive roles with predefined/custom roles scoped to the needed actions enforces least privilege. Keeping Editor/Owner broadly or disabling IAM increases risk.',
    references: [REF_IAM_BEST]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance requirement mandates that audit logs are retained for 7 years and protected from deletion. Which design satisfies this?',
    options: opts4(
      'Default 30-day log retention in the source project',
      'Log sink to a Cloud Storage bucket with bucket lock / retention policy and restricted IAM',
      'Keep logs only in Cloud Logging with default settings',
      'Let admins delete logs when storage is full'
    ),
    correct: ['b'],
    explanation: 'Exporting logs via a sink to a Cloud Storage bucket with a retention/bucket-lock policy and restricted IAM guarantees 7-year tamper-resistant retention. Default retention and admin-deletable logs do not meet the requirement.',
    references: [REF_LOGGING, REF_STORAGE]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach gives an internal app per-user access control using corporate identities without exposing it via VPN or public credentials?',
    options: opts4(
      'Identity-Aware Proxy (IAP)',
      'A shared admin password',
      'An open firewall to the internet',
      'Cloud NAT'
    ),
    correct: ['a'],
    explanation: 'Identity-Aware Proxy enforces per-user identity and IAM-based access to internal apps without a VPN. Shared passwords, open firewalls, and NAT do not provide identity-aware access control.',
    references: [REF_IAM_BEST]
  },
  {
    domain: SECURITY, difficulty: 4, type: QType.SINGLE,
    stem: 'An architect must ensure that even a compromised CI pipeline cannot exfiltrate data from the production analytics project. Which combination most strongly mitigates this?',
    options: opts4(
      'Give the CI pipeline project Owner for simplicity',
      'Least-privilege scoped service account plus a VPC Service Controls perimeter around the analytics project',
      'Disable audit logging to reduce noise',
      'Share one key between CI and analysts'
    ),
    correct: ['b'],
    explanation: 'A tightly scoped service account limits what the pipeline can do, and a VPC-SC perimeter blocks data egress outside the trusted boundary even if credentials are abused. Owner access, disabled logging, or shared keys increase risk.',
    references: [REF_VPCSC, REF_IAM_BEST]
  },

  // ── Analyzing and optimizing technical and business processes (8) ──
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A predictable production cluster runs the same machine types continuously. Which purchasing option gives the largest committed saving for that stable usage?',
    options: opts4(
      'On-demand only',
      'Committed use discounts (1- or 3-year)',
      'Spot VMs for the production cluster',
      'Buying larger machines than needed'
    ),
    correct: ['b'],
    explanation: 'Committed use discounts give the largest predictable savings for stable, continuous usage. On-demand is most expensive for steady load, Spot is unsafe for production stability, and oversizing wastes money.',
    references: [REF_CUD, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which optimization reduces network egress cost for users downloading large static files repeatedly?',
    options: opts4(
      'Serve every request from the origin in another continent',
      'Enable Cloud CDN so cached content is served from the edge',
      'Disable caching',
      'Move users instead of data'
    ),
    correct: ['b'],
    explanation: 'Cloud CDN serves repeated content from edge caches, reducing origin egress and improving latency. Always serving from a distant origin or disabling caching increases egress cost and latency.',
    references: [REF_LB, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to find idle and underutilized resources across projects to cut waste. Which Google Cloud capability should the architect use?',
    options: opts4(
      'Guess based on intuition',
      'Active Assist / recommender insights (idle VM, idle disk, right-sizing recommendations)',
      'Cloud Trace',
      'Cloud DNS logs'
    ),
    correct: ['b'],
    explanation: 'Active Assist recommenders surface idle VMs, idle disks, and right-sizing opportunities to systematically cut waste. Intuition, Trace, and DNS logs do not provide cost-waste recommendations.',
    references: [REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL approaches that reduce total cost of ownership without reducing reliability for a steady production system.',
    options: opts4(
      'Commit the steady baseline with CUDs',
      'Remove idle/orphaned resources via recommenders',
      'Eliminate redundancy/HA to save money',
      'Right-size based on observed utilization'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'CUDs, removing orphaned resources, and right-sizing reduce cost while preserving reliability. Eliminating HA/redundancy cuts cost at the direct expense of reliability and is not acceptable for a steady production system.',
    references: [REF_CUD, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'A business wants to forecast and cap spend per department automatically. Which Google Cloud feature should be configured?',
    options: opts4(
      'Cloud Billing budgets and alerts scoped per project/department',
      'Cloud Trace',
      'Cloud Armor',
      'Cloud DNS'
    ),
    correct: ['a'],
    explanation: 'Cloud Billing budgets scoped per project/department with alerts (and optional automation) provide forecasting and proactive overspend control. Trace, Armor, and DNS are unrelated to budgeting.',
    references: [REF_BILLING]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A slow, manual incident-response process delays recovery. Which improvement most directly shortens mean time to recovery (MTTR)?',
    options: opts4(
      'Remove monitoring to reduce alert volume',
      'Automate detection and runbooks, with clear on-call ownership and tested playbooks',
      'Add more manual approval steps to incident response',
      'Stop tracking incidents'
    ),
    correct: ['b'],
    explanation: 'Automated detection, tested runbooks/playbooks, and clear on-call ownership directly reduce MTTR. Removing monitoring or adding manual steps lengthens detection and recovery time.',
    references: [REF_SRE, REF_MONITORING]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'BigQuery costs spike from analysts running broad exploratory queries. Which governance optimization helps most without blocking analysis?',
    options: opts4(
      'Remove all analyst access',
      'Set per-user/project query bytes-billed limits (custom quotas) and use partitioned tables',
      'Run every query on SELECT *',
      'Disable BigQuery'
    ),
    correct: ['b'],
    explanation: 'Custom query quotas (maximum bytes billed per user/project) plus partitioned tables cap runaway cost while still allowing analysis. Removing access or disabling BigQuery blocks the business; SELECT * worsens cost.',
    references: [REF_BIGQUERY, REF_COST]
  },
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE,
    stem: 'Moving infrequently accessed data from Standard to Coldline or Archive storage classes can significantly reduce storage cost while keeping the data retrievable.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Transitioning rarely accessed data to Coldline/Archive lowers at-rest storage cost substantially while the data remains retrievable (subject to retrieval and minimum-duration costs).',
    references: [REF_STORAGE_CLASS, REF_COST]
  },

  // ── Managing implementation (8) ──
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization is migrating on-prem VMware VMs to Google Cloud with minimal refactoring and short cutover windows. Which migration approach should the architect recommend?',
    options: opts4(
      'Rewrite every application as serverless first',
      'Lift-and-shift with Migrate to Virtual Machines, modernize later',
      'Manually rebuild all servers by hand',
      'Do not migrate; keep everything on-prem'
    ),
    correct: ['b'],
    explanation: 'Lift-and-shift with Migrate to Virtual Machines moves workloads quickly with minimal refactoring and short cutover, deferring modernization. Rewriting everything first delays value, and manual rebuilds are slow and error-prone.',
    references: [REF_MIGRATE]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'A team must migrate an Oracle database to Cloud SQL/AlloyDB-style targets with schema conversion and continuous replication. Which Google Cloud service should be used?',
    options: opts4(
      'Storage Transfer Service',
      'Database Migration Service',
      'Cloud CDN',
      'Manual CSV export only'
    ),
    correct: ['b'],
    explanation: 'Database Migration Service supports heterogeneous database migration with conversion and continuous replication for minimal-downtime cutover. Storage Transfer is for objects, CDN is for content, and manual CSV export means long downtime and risk.',
    references: [REF_DTS]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which CI/CD practice ensures the same artifact tested in staging is exactly what is deployed to production?',
    options: opts4(
      'Rebuild the image separately for each environment',
      'Promote the same immutable, versioned artifact through environments',
      'Edit code directly on the prod server',
      'Skip staging entirely'
    ),
    correct: ['b'],
    explanation: 'Promoting one immutable, versioned artifact through environments guarantees prod runs exactly what was tested. Rebuilding per environment can introduce drift; editing prod or skipping staging is unsafe.',
    references: [REF_CICD]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'During a GKE rollout, an architect wants Kubernetes to replace pods gradually and stop if the new version is unhealthy. Which built-in mechanism provides this?',
    options: opts4(
      'kubectl delete all pods at once',
      'A Deployment rolling update with readiness probes and maxUnavailable/maxSurge',
      'Manually editing pods on each node',
      'Recreating the whole cluster'
    ),
    correct: ['b'],
    explanation: 'A Deployment rolling update with readiness probes and surge/unavailable settings replaces pods gradually and halts if new pods are unhealthy. Deleting all pods or recreating the cluster causes downtime.',
    references: [REF_GKE]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that reduce risk during a large cloud migration.',
    options: opts4(
      'Migrate in waves with validation gates between waves',
      'Maintain rollback capability until cutover is confirmed stable',
      'Migrate everything in one weekend with no testing',
      'Pilot non-critical workloads first to build confidence'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Wave-based migration with validation gates, retained rollback, and piloting non-critical workloads first all reduce risk. A single untested big-bang weekend migration is the high-risk anti-pattern.',
    references: [REF_MIGRATE, REF_DR]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which managed Google Cloud service runs build, test, and deploy steps defined in a pipeline configuration file?',
    options: opts4(
      'Cloud Build',
      'Cloud DNS',
      'Cloud NAT',
      'Cloud Trace'
    ),
    correct: ['a'],
    explanation: 'Cloud Build executes build/test/deploy steps from a pipeline config (e.g., cloudbuild.yaml) as a managed CI/CD service. DNS, NAT, and Trace do not run pipelines.',
    references: [REF_CICD]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect wants to validate a migrated workload with real production-like traffic before fully cutting over. Which technique enables this safely?',
    options: opts4(
      'Switch 100% of users immediately',
      'Traffic mirroring/shadowing or a canary subset to the new environment',
      'Delete the old environment first',
      'Test only in a developer\'s sandbox'
    ),
    correct: ['b'],
    explanation: 'Traffic mirroring/shadowing or a canary subset exercises the new environment with realistic traffic while the old system still serves users, validating before full cutover. Switching everyone or deleting the old environment removes the safety net.',
    references: [REF_CICD, REF_MIGRATE]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Defining the target environment as infrastructure as code before migration makes the cutover more repeatable and easier to validate across environments.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Capturing the target environment as IaC makes provisioning repeatable and consistent across dev/staging/prod, which de-risks and speeds the migration cutover.',
    references: [REF_TERRAFORM, REF_MIGRATE]
  },

  // ── Ensuring solution and operations reliability (9) ──
  {
    domain: RELIABILITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does an SLI represent in SRE practice?',
    options: opts4(
      'A contractual penalty',
      'A quantitative measure of a service level (e.g., request success rate or latency)',
      'The cloud monthly bill',
      'The number of microservices'
    ),
    correct: ['b'],
    explanation: 'A Service Level Indicator (SLI) is a quantitative measure of some aspect of service level, such as availability or latency. The SLO is the target for the SLI; the SLA is the external contract.',
    references: [REF_SRE]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A stateless service must tolerate the loss of an entire zone with no manual intervention. Which deployment design provides this?',
    options: opts4(
      'A single zonal instance with backups',
      'A regional managed instance group across multiple zones behind a load balancer',
      'A bigger single VM',
      'Manual restart on failure'
    ),
    correct: ['b'],
    explanation: 'A regional MIG spreads instances across zones and the load balancer routes around a failed zone automatically, tolerating a zone outage without manual action. Single-zone or manual approaches cannot.',
    references: [REF_MIG, REF_LB]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must define when reliability work should take priority over feature work. Which mechanism provides that signal objectively?',
    options: opts4(
      'Manager intuition',
      'An error budget policy tied to the SLO',
      'Customer complaints only',
      'Random monthly decisions'
    ),
    correct: ['b'],
    explanation: 'An error budget policy objectively dictates that when the budget is exhausted, reliability work takes priority over features. Intuition, complaints alone, or random decisions are not objective signals.',
    references: [REF_SRE]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that improve operational reliability and observability.',
    options: opts4(
      'Structured logging and centralized log analysis',
      'SLO dashboards with burn-rate alerting',
      'Suppressing all alerts to avoid noise',
      'Distributed tracing across services'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Structured/centralized logging, SLO dashboards with burn-rate alerts, and distributed tracing all improve observability and reliability. Suppressing all alerts blinds operators to real incidents.',
    references: [REF_LOGGING, REF_MONITORING, REF_SRE]
  },
  {
    domain: RELIABILITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service provides uptime checks that probe an endpoint from multiple global locations and alert on failure?',
    options: opts4(
      'Cloud Monitoring uptime checks',
      'Cloud KMS',
      'Cloud NAT',
      'Cloud Build'
    ),
    correct: ['a'],
    explanation: 'Cloud Monitoring uptime checks probe endpoints from multiple global locations and trigger alerting policies on failure. KMS, NAT, and Build do not provide uptime probing.',
    references: [REF_MONITORING]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-region application must meet an RPO of near-zero for its relational data. Which database design satisfies this?',
    options: opts4(
      'Cloud SQL with nightly backups',
      'Cloud Spanner multi-region with synchronous replication',
      'A single-zone database',
      'Asynchronous cross-region replica with hourly lag'
    ),
    correct: ['b'],
    explanation: 'Spanner multi-region synchronously replicates across regions, giving near-zero RPO that survives a regional failure. Nightly backups, single-zone, or async hourly-lag replicas all imply significant data loss.',
    references: [REF_SPANNER, REF_DR]
  },
  {
    domain: RELIABILITY, difficulty: 3, type: QType.SINGLE,
    stem: 'To avoid retry storms when a downstream dependency is overloaded, which client behavior should the architect mandate?',
    options: opts4(
      'Immediate, unlimited retries',
      'Exponential backoff with jitter and a retry cap',
      'No retries ever, even for transient errors',
      'Retry forever with a fixed 1ms interval'
    ),
    correct: ['b'],
    explanation: 'Exponential backoff with jitter and a maximum retry count spreads load and prevents synchronized retry storms while still recovering from transient errors. Unlimited or tight fixed-interval retries amplify overload.',
    references: [REF_SRE, REF_ARCH]
  },
  {
    domain: RELIABILITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Regularly testing backup restores (not just taking backups) is necessary to be confident a disaster-recovery plan will actually work.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Backups that are never test-restored may be unusable when needed; periodic restore testing validates that the DR plan and backups actually work.',
    references: [REF_DR]
  },
  {
    domain: RELIABILITY, difficulty: 4, type: QType.SINGLE,
    stem: 'An architect must design for graceful degradation so a non-critical dependency outage does not take down the whole user experience. Which approach achieves this?',
    options: opts4(
      'Fail the entire request if any dependency is unavailable',
      'Isolate non-critical features with fallbacks/feature flags so core flows continue',
      'Remove all dependencies',
      'Increase timeouts to infinity'
    ),
    correct: ['b'],
    explanation: 'Isolating non-critical features behind fallbacks/feature flags lets core user flows continue when an optional dependency fails, providing graceful degradation. Failing the whole request or infinite timeouts make outages worse.',
    references: [REF_SRE, REF_ARCH]
  }
];

const GCP_PCA_DOMAINS = [
  { name: DESIGN, weight: 24 },
  { name: PROVISION, weight: 18 },
  { name: SECURITY, weight: 18 },
  { name: ANALYZE, weight: 13 },
  { name: IMPL, weight: 12 },
  { name: RELIABILITY, weight: 15 }
];

const GCP_PCA_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'google-professional-cloud-architect-p1',
    code: 'PCA-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering solution architecture design & planning, provisioning infrastructure, security & compliance, process analysis & optimization, managing implementation, and operations reliability.',
    questions: P1
  },
  {
    slug: 'google-professional-cloud-architect-p2',
    code: 'PCA-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'google-professional-cloud-architect-p3',
    code: 'PCA-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const GCP_PCA_BUNDLE = {
  slug: 'google-professional-cloud-architect',
  title: 'Google Professional Cloud Architect',
  description: 'Unlimited Google Professional Cloud Architect practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering solution architecture design & planning, provisioning and managing infrastructure, security & compliance, analyzing and optimizing processes, managing implementation, and ensuring operations reliability, aligned to the Professional Cloud Architect exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 20000 // USD 200 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Google Professional Cloud Architect bundle.
 * Safe to call repeatedly — vendor / exam / bundle rows are upserted,
 * and questions tagged `generatedBy: 'manual:gcp-pca-seed'` are deleted
 * and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedGcpPca(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'google' } });
  await db.vendor.upsert({
    where: { slug: 'google' },
    update: { name: 'Google Cloud', description: 'Google Cloud certifications — cloud architecture, infrastructure, security, and the Professional Cloud Architect credential.' },
    create: { slug: 'google', name: 'Google Cloud', description: 'Google Cloud certifications — cloud architecture, infrastructure, security, and the Professional Cloud Architect credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'google' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of GCP_PCA_EXAMS) {
    const title = `Google Professional Cloud Architect — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Google Professional Cloud Architect exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: GCP_PCA_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:gcp-pca-seed' } });
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
          generatedBy: 'manual:gcp-pca-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: GCP_PCA_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: GCP_PCA_BUNDLE.slug },
    update: {
      title: GCP_PCA_BUNDLE.title,
      description: GCP_PCA_BUNDLE.description,
      price: GCP_PCA_BUNDLE.price,
      priceVoucher: GCP_PCA_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: GCP_PCA_BUNDLE.slug,
      title: GCP_PCA_BUNDLE.title,
      description: GCP_PCA_BUNDLE.description,
      price: GCP_PCA_BUNDLE.price,
      priceVoucher: GCP_PCA_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'google-professional-cloud-architect-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'google-professional-cloud-architect-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'google-professional-cloud-architect-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'google-professional-cloud-architect-p1', tier: 'VOUCHER' as const, position: 4 }
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
