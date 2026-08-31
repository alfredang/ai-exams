/**
 * Google Professional Cloud DevOps Engineer (GCP-PCDOE) bundle seed —
 * vendor, three practice-exam variants, bundle, and 195 blueprint-aligned
 * questions. Idempotent: replaces rows tagged
 * `generatedBy: 'manual:gcp-pcdoe-seed'` and upserts catalog rows.
 *
 * Exported as `seedGcpPcdoe(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/gcp-pcdoe.ts`) and the protected
 * admin API (`/api/admin/seed-gcp-pcdoe`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Google Cloud
 * Professional Cloud DevOps Engineer exam guide and the Google Cloud
 * SRE / Cloud Build / Cloud Deploy / Cloud Monitoring documentation.
 * Questions are original scenario-based items — they are NOT copied from
 * any real exam and never claim to be the real exam. Blueprint:
 *   - Bootstrapping and Managing a Google Cloud Organization — 18% (12)
 *   - Building and Implementing CI/CD Pipelines             — 22% (14)
 *   - Applying Site Reliability Engineering Practices        — 22% (14)
 *   - Implementing Observability                            — 20% (13)
 *   - Optimizing Service Performance                         — 18% (12)
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

const BOOT = 'Bootstrapping and Managing a Google Cloud Organization';
const CICD = 'Building and Implementing CI/CD Pipelines';
const SRE = 'Applying Site Reliability Engineering Practices';
const OBS = 'Implementing Observability';
const PERF = 'Optimizing Service Performance';

const REF_RESMGR = { label: 'Google Cloud — Resource hierarchy', url: 'https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy' };
const REF_ORGPOLICY = { label: 'Google Cloud — Organization Policy Service', url: 'https://cloud.google.com/resource-manager/docs/organization-policy/overview' };
const REF_IAM = { label: 'Google Cloud — IAM overview', url: 'https://cloud.google.com/iam/docs/overview' };
const REF_IAM_BEST = { label: 'Google Cloud — Use IAM securely', url: 'https://cloud.google.com/iam/docs/using-iam-securely' };
const REF_SA = { label: 'Google Cloud — Service accounts overview', url: 'https://cloud.google.com/iam/docs/service-account-overview' };
const REF_WIF = { label: 'Google Cloud — Workload Identity Federation', url: 'https://cloud.google.com/iam/docs/workload-identity-federation' };
const REF_TERRAFORM = { label: 'Google Cloud — Terraform on Google Cloud', url: 'https://cloud.google.com/docs/terraform' };
const REF_INFRAMGR = { label: 'Google Cloud — Infrastructure Manager', url: 'https://cloud.google.com/infrastructure-manager/docs/overview' };
const REF_PROJECTS = { label: 'Google Cloud — Creating and managing projects', url: 'https://cloud.google.com/resource-manager/docs/creating-managing-projects' };
const REF_BILLING = { label: 'Google Cloud — Cloud Billing documentation', url: 'https://cloud.google.com/billing/docs' };
const REF_QUOTAS = { label: 'Google Cloud — Working with quotas', url: 'https://cloud.google.com/docs/quotas' };
const REF_LANDINGZONE = { label: 'Google Cloud — Landing zone design', url: 'https://cloud.google.com/architecture/landing-zones' };
const REF_VPCSC = { label: 'Google Cloud — VPC Service Controls overview', url: 'https://cloud.google.com/vpc-service-controls/docs/overview' };

const REF_BUILD = { label: 'Google Cloud — Cloud Build documentation', url: 'https://cloud.google.com/build/docs' };
const REF_BUILD_CONFIG = { label: 'Google Cloud — Build configuration file schema', url: 'https://cloud.google.com/build/docs/build-config-file-schema' };
const REF_BUILD_TRIGGERS = { label: 'Google Cloud — Creating and managing build triggers', url: 'https://cloud.google.com/build/docs/automating-builds/create-manage-triggers' };
const REF_DEPLOY = { label: 'Google Cloud — Cloud Deploy documentation', url: 'https://cloud.google.com/deploy/docs' };
const REF_DEPLOY_PROGRESSION = { label: 'Google Cloud — Cloud Deploy delivery pipeline and targets', url: 'https://cloud.google.com/deploy/docs/overview' };
const REF_DEPLOY_CANARY = { label: 'Google Cloud — Cloud Deploy canary deployments', url: 'https://cloud.google.com/deploy/docs/deployment-strategies/canary' };
const REF_DEPLOY_APPROVAL = { label: 'Google Cloud — Cloud Deploy approvals', url: 'https://cloud.google.com/deploy/docs/promote-release' };
const REF_ARTIFACT = { label: 'Google Cloud — Artifact Registry documentation', url: 'https://cloud.google.com/artifact-registry/docs' };
const REF_BINAUTH = { label: 'Google Cloud — Binary Authorization', url: 'https://cloud.google.com/binary-authorization/docs' };
const REF_SLSA = { label: 'Google Cloud — Software supply chain security', url: 'https://cloud.google.com/software-supply-chain-security/docs/overview' };
const REF_SOURCEREPO = { label: 'Google Cloud — Cloud Source Repositories', url: 'https://cloud.google.com/source-repositories/docs' };
const REF_SKAFFOLD = { label: 'Google Cloud — Skaffold with Cloud Deploy', url: 'https://cloud.google.com/deploy/docs/using-skaffold' };
const REF_BUILD_PRIVATEPOOL = { label: 'Google Cloud — Cloud Build private pools', url: 'https://cloud.google.com/build/docs/private-pools/private-pools-overview' };

const REF_SRE = { label: 'Google Cloud — SRE fundamentals: SLIs, SLOs, SLAs', url: 'https://cloud.google.com/blog/products/devops-sre/sre-fundamentals-slis-slas-and-slos' };
const REF_SRE_BOOK = { label: 'Google — Site Reliability Engineering book', url: 'https://sre.google/sre-book/table-of-contents/' };
const REF_SRE_WORKBOOK = { label: 'Google — The Site Reliability Workbook', url: 'https://sre.google/workbook/table-of-contents/' };
const REF_SLO = { label: 'Google Cloud — Service monitoring SLOs', url: 'https://cloud.google.com/stackdriver/docs/solutions/slo-monitoring' };
const REF_ERRORBUDGET = { label: 'Google — Embracing risk (error budgets)', url: 'https://sre.google/sre-book/embracing-risk/' };
const REF_TOIL = { label: 'Google — Eliminating toil', url: 'https://sre.google/sre-book/eliminating-toil/' };
const REF_POSTMORTEM = { label: 'Google — Postmortem culture: learning from failure', url: 'https://sre.google/sre-book/postmortem-culture/' };
const REF_INCIDENT = { label: 'Google — Managing incidents', url: 'https://sre.google/sre-book/managing-incidents/' };
const REF_ONCALL = { label: 'Google — Being on-call', url: 'https://sre.google/sre-book/being-on-call/' };
const REF_RELIABILITY = { label: 'Google Cloud — Architecture Framework: Reliability', url: 'https://cloud.google.com/architecture/framework/reliability' };
const REF_DR = { label: 'Google Cloud — Disaster recovery planning guide', url: 'https://cloud.google.com/architecture/dr-scenarios-planning-guide' };

const REF_MONITORING = { label: 'Google Cloud — Cloud Monitoring documentation', url: 'https://cloud.google.com/monitoring/docs' };
const REF_ALERTING = { label: 'Google Cloud — Alerting policies overview', url: 'https://cloud.google.com/monitoring/alerts' };
const REF_LOGGING = { label: 'Google Cloud — Cloud Logging documentation', url: 'https://cloud.google.com/logging/docs' };
const REF_LOG_BASED_METRICS = { label: 'Google Cloud — Log-based metrics', url: 'https://cloud.google.com/logging/docs/logs-based-metrics' };
const REF_TRACE = { label: 'Google Cloud — Cloud Trace documentation', url: 'https://cloud.google.com/trace/docs' };
const REF_PROFILER = { label: 'Google Cloud — Cloud Profiler documentation', url: 'https://cloud.google.com/profiler/docs' };
const REF_ERRORREPORTING = { label: 'Google Cloud — Error Reporting documentation', url: 'https://cloud.google.com/error-reporting/docs' };
const REF_OPS_AGENT = { label: 'Google Cloud — Ops Agent overview', url: 'https://cloud.google.com/monitoring/agent/ops-agent' };
const REF_MQL = { label: 'Google Cloud — Monitoring Query Language', url: 'https://cloud.google.com/monitoring/mql' };
const REF_LOG_ROUTER = { label: 'Google Cloud — Routing and storage overview (Log Router)', url: 'https://cloud.google.com/logging/docs/routing/overview' };
const REF_MANAGED_PROM = { label: 'Google Cloud — Google Cloud Managed Service for Prometheus', url: 'https://cloud.google.com/stackdriver/docs/managed-prometheus' };
const REF_UPTIME = { label: 'Google Cloud — Uptime checks', url: 'https://cloud.google.com/monitoring/uptime-checks' };
const REF_DASHBOARDS = { label: 'Google Cloud — Dashboards overview', url: 'https://cloud.google.com/monitoring/dashboards' };

const REF_GKE = { label: 'Google Cloud — GKE overview', url: 'https://cloud.google.com/kubernetes-engine/docs/concepts/kubernetes-engine-overview' };
const REF_GKE_AUTOSCALE = { label: 'Google Cloud — GKE cluster autoscaler', url: 'https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler' };
const REF_HPA = { label: 'Google Cloud — Horizontal Pod autoscaling', url: 'https://cloud.google.com/kubernetes-engine/docs/concepts/horizontalpodautoscaler' };
const REF_RUN = { label: 'Google Cloud — Cloud Run documentation', url: 'https://cloud.google.com/run/docs' };
const REF_MIG = { label: 'Google Cloud — Managed instance groups', url: 'https://cloud.google.com/compute/docs/instance-groups' };
const REF_LB = { label: 'Google Cloud — Cloud Load Balancing overview', url: 'https://cloud.google.com/load-balancing/docs/load-balancing-overview' };
const REF_CDN = { label: 'Google Cloud — Cloud CDN overview', url: 'https://cloud.google.com/cdn/docs/overview' };
const REF_PERF = { label: 'Google Cloud — Architecture Framework: Performance optimization', url: 'https://cloud.google.com/architecture/framework/performance-optimization' };
const REF_AUTOSCALER = { label: 'Google Cloud — Autoscaling groups of instances', url: 'https://cloud.google.com/compute/docs/autoscaler' };
const REF_GKE_OPTIMIZE = { label: 'Google Cloud — Best practices for running cost-optimized GKE', url: 'https://cloud.google.com/kubernetes-engine/docs/best-practices/cost-optimized-kubernetes-applications' };
const REF_CLOUDSQL = { label: 'Google Cloud — Cloud SQL documentation', url: 'https://cloud.google.com/sql/docs' };
const REF_LOADTEST = { label: 'Google Cloud — Distributed load testing using GKE', url: 'https://cloud.google.com/architecture/distributed-load-testing-using-gke' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Bootstrapping and Managing a Google Cloud Organization (12) ──
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Your team is bootstrapping a new Google Cloud organization. You want to enforce that no Compute Engine VM can be created with an external IP address across all current and future projects. Which mechanism should you use?',
    options: opts4(
      'A custom IAM role removing compute.instances.create',
      'An organization policy constraint (constraints/compute.vmExternalIpAccess) applied at the organization node',
      'A firewall rule denying egress on every VPC',
      'A Cloud Function that deletes any VM with an external IP'
    ),
    correct: ['b'],
    explanation: 'Organization Policy constraints such as constraints/compute.vmExternalIpAccess are applied at the organization, folder, or project level and are inherited by all descendant resources, including future projects. IAM roles control who can act, not the allowed configuration; firewall rules and reactive functions do not prevent the resource from being created.',
    references: [REF_ORGPOLICY, REF_RESMGR]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'A platform team manages shared infrastructure with Terraform. They want state stored centrally with locking so concurrent applies cannot corrupt it. Which backend best meets this on Google Cloud?',
    options: opts4(
      'Local state committed to the Git repository',
      'A Cloud Storage bucket backend, which provides remote state with object-level locking',
      'A Compute Engine disk shared via NFS',
      'A BigQuery table holding the state JSON'
    ),
    correct: ['b'],
    explanation: 'The Terraform Google Cloud Storage (gcs) backend stores state remotely in a bucket and provides state locking, preventing concurrent applies from corrupting state. Committing state to Git leaks secrets and offers no locking; disks and BigQuery are not supported Terraform backends.',
    references: [REF_TERRAFORM]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the Google Cloud resource hierarchy and policy inheritance.',
    options: opts4(
      'IAM policies set at a folder are inherited by all projects under that folder.',
      'An organization policy set at a project overrides inherited organization-level policy only where the constraint allows merging or override.',
      'Deleting the organization node automatically deletes all billing accounts.',
      'Resources can belong to at most one project at a time.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'IAM bindings and org policies flow down the hierarchy (organization → folder → project → resource). Some org-policy constraints allow override/merge at lower nodes. Every resource lives in exactly one project. Billing accounts are independent of the organization node and are not deleted with it.',
    references: [REF_RESMGR, REF_ORGPOLICY]
  },
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A CI pipeline running in GitHub Actions needs to deploy to Google Cloud without storing a long-lived service account key. Which approach is recommended?',
    options: opts4(
      'Generate a JSON service account key and store it as a GitHub secret',
      'Use Workload Identity Federation so GitHub OIDC tokens are exchanged for short-lived Google credentials',
      'Embed a user password in the workflow file',
      'Allow unauthenticated access to the deployment API'
    ),
    correct: ['b'],
    explanation: 'Workload Identity Federation lets external workloads exchange an OIDC/SAML token for short-lived Google Cloud credentials, eliminating long-lived exported service account keys, which are a common credential-leak risk.',
    references: [REF_WIF, REF_SA]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'You must give a new application team the ability to create projects but only under a specific folder, and bill them to a designated billing account. Which combination is correct?',
    options: opts4(
      'Grant roles/owner at the organization to the team',
      'Grant roles/resourcemanager.projectCreator on the folder and roles/billing.user on the billing account',
      'Grant roles/editor on every existing project',
      'Add the team to the Google Workspace super-admin group'
    ),
    correct: ['b'],
    explanation: 'roles/resourcemanager.projectCreator scoped to the folder allows creating projects within that folder, and roles/billing.user on the billing account allows associating new projects with it — applying least privilege rather than broad owner/editor or admin rights.',
    references: [REF_IAM, REF_BILLING]
  },
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Google Cloud service lets you declaratively provision infrastructure using Terraform configurations managed by Google, without you running Terraform yourself?',
    options: opts4(
      'Cloud Deploy',
      'Infrastructure Manager',
      'Cloud Build only',
      'Deployment Manager Classic with YAML'
    ),
    correct: ['b'],
    explanation: 'Infrastructure Manager automates deployment and management of Google Cloud infrastructure resources using Terraform, running and storing state on a Google-managed service. Cloud Deploy delivers applications, not infrastructure provisioning.',
    references: [REF_INFRAMGR, REF_TERRAFORM]
  },
  {
    domain: BOOT, difficulty: 4, type: QType.SINGLE,
    stem: 'Your organization wants to prevent data exfiltration from BigQuery and Cloud Storage by ensuring those APIs can only be reached from defined projects and networks. Which control is designed for this?',
    options: opts4(
      'A deny-all VPC firewall rule',
      'VPC Service Controls service perimeters around the projects',
      'A custom organization policy on machine types',
      'Object lifecycle rules on the buckets'
    ),
    correct: ['b'],
    explanation: 'VPC Service Controls create service perimeters that restrict access to Google-managed services such as BigQuery and Cloud Storage, mitigating data exfiltration by allowing access only from authorized projects and networks.',
    references: [REF_VPCSC]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'A team repeatedly hits a Compute Engine CPU quota in a region during scale-up. What is the correct first action?',
    options: opts4(
      'Create additional projects to multiply quota indefinitely as standard practice',
      'Request a quota increase for the specific quota and region through the quota system',
      'Disable autoscaling permanently',
      'Switch every workload to Spot VMs to bypass quotas'
    ),
    correct: ['b'],
    explanation: 'Quotas are per-project, per-region limits that can be raised through a quota increase request. Spinning up many projects to evade quotas is an anti-pattern; disabling autoscaling harms reliability; Spot VMs still consume quota.',
    references: [REF_QUOTAS]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'When designing a landing zone, why is a dedicated "seed" or bootstrap project with its own service account commonly created first?',
    options: opts4(
      'It is required to enable the free tier',
      'It holds the Terraform state and the highly privileged automation identity used to build the rest of the organization, isolating that blast radius',
      'It is where all production workloads must run',
      'It disables IAM auditing globally'
    ),
    correct: ['b'],
    explanation: 'A bootstrap/seed project isolates the Terraform state and the privileged service account used to provision the organization, limiting the blast radius of that powerful identity and keeping foundation automation separate from workload projects.',
    references: [REF_LANDINGZONE, REF_TERRAFORM]
  },
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about service account keys best reflects Google Cloud security guidance?',
    options: opts4(
      'Exported JSON keys should be rotated weekly and shared by email',
      'Avoid creating exported keys when possible; prefer attached service accounts or Workload Identity Federation',
      'Keys never expire so they are the safest option',
      'Keys should be committed to source control for reproducibility'
    ),
    correct: ['b'],
    explanation: 'Google recommends avoiding exported service account keys entirely where possible, instead using attached service accounts on Google Cloud resources or Workload Identity Federation, because long-lived keys are a frequent source of credential compromise.',
    references: [REF_IAM_BEST, REF_SA]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'A new project is created via Terraform but resources fail because required APIs are disabled. What is the cleanest declarative fix?',
    options: opts4(
      'Manually click Enable in the console after every apply',
      'Add google_project_service resources for the needed APIs so they are enabled as part of the same Terraform configuration',
      'Grant Owner to every developer',
      'Recreate the project in a different region'
    ),
    correct: ['b'],
    explanation: 'Declaring google_project_service resources in Terraform enables the required APIs as part of the same configuration, keeping project bootstrap reproducible and avoiding manual console steps.',
    references: [REF_TERRAFORM, REF_PROJECTS]
  },
  {
    domain: BOOT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL practices that improve safety of an infrastructure-as-code change pipeline.',
    options: opts4(
      'Running terraform plan in CI and requiring human review before apply on production',
      'Storing state in a versioned, access-controlled Cloud Storage bucket',
      'Letting every developer run terraform apply against production from their laptop with personal credentials',
      'Using a dedicated automation service account with least-privilege roles for applies'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Plan-then-review gates, versioned and locked remote state, and a least-privilege automation identity all reduce risk. Ad-hoc local applies with personal credentials remove review, auditability, and least privilege.',
    references: [REF_TERRAFORM, REF_IAM_BEST]
  },

  // ── Building and Implementing CI/CD Pipelines (14) ──
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which file does Cloud Build read by default to determine the ordered build steps for a build?',
    options: opts4(
      'Dockerfile',
      'cloudbuild.yaml (or cloudbuild.json)',
      'skaffold.yaml',
      'pipeline.tf'
    ),
    correct: ['b'],
    explanation: 'Cloud Build executes the steps defined in a build configuration file, by default cloudbuild.yaml or cloudbuild.json. The Dockerfile only describes an image; skaffold.yaml is used by Cloud Deploy/Skaffold.',
    references: [REF_BUILD_CONFIG, REF_BUILD]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a Cloud Build pipeline to run automatically whenever a pull request is opened against the main branch in your GitHub repo. What do you configure?',
    options: opts4(
      'A cron Cloud Scheduler job',
      'A Cloud Build trigger connected to the repository with a pull-request event filter on the main branch',
      'A manual gcloud builds submit command',
      'An uptime check'
    ),
    correct: ['b'],
    explanation: 'Cloud Build triggers connect to a source repository and start builds on events such as push or pull request, with branch/tag filters. Cloud Scheduler and manual submits do not respond to PR events.',
    references: [REF_BUILD_TRIGGERS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Your organization wants to ensure only container images built and signed by the approved pipeline can be deployed to GKE. Which service enforces this at deploy time?',
    options: opts4(
      'Cloud CDN',
      'Binary Authorization with attestations required by policy',
      'Cloud NAT',
      'Cloud Trace'
    ),
    correct: ['b'],
    explanation: 'Binary Authorization is a deploy-time security control that requires images to have trusted attestations before they can run on GKE or Cloud Run, ensuring only images from the approved, signed pipeline are admitted.',
    references: [REF_BINAUTH, REF_SLSA]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Where should you store and version your built container images so Cloud Deploy and GKE can pull them with IAM-controlled access?',
    options: opts4(
      'A public Docker Hub repository',
      'Artifact Registry',
      'A Cloud Storage bucket of tar files',
      'A Compute Engine VM running a self-managed registry with no auth'
    ),
    correct: ['b'],
    explanation: 'Artifact Registry is the recommended managed registry for container images and language packages on Google Cloud, with IAM-based access control, regional storage, and integration with Cloud Build and Cloud Deploy.',
    references: [REF_ARTIFACT]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'You use Cloud Deploy to roll out to dev, then staging, then prod. You want a human to explicitly approve before the prod rollout proceeds. What do you configure?',
    options: opts4(
      'A separate Git repository for prod',
      'A required approval on the prod target in the delivery pipeline',
      'A longer build timeout',
      'A Cloud Function that emails the team'
    ),
    correct: ['b'],
    explanation: 'Cloud Deploy targets can require approval; when a release is promoted to a target that requires approval, the rollout pauses until an authorized user approves it, providing a controlled gate before production.',
    references: [REF_DEPLOY_APPROVAL, REF_DEPLOY_PROGRESSION]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'A team wants new versions released to 10% of traffic, monitored, then automatically progressed to 100% if healthy. Which Cloud Deploy capability directly supports this?',
    options: opts4(
      'Blue/green only with manual DNS swap',
      'A canary deployment strategy with defined percentage phases',
      'Recreate strategy',
      'A scheduled nightly full redeploy'
    ),
    correct: ['b'],
    explanation: 'Cloud Deploy supports a canary deployment strategy that progressively shifts traffic through defined percentage phases, allowing verification at each phase before full rollout.',
    references: [REF_DEPLOY_CANARY]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'Cloud Deploy uses which tool under the hood to render and apply Kubernetes manifests for each target?',
    options: opts4(
      'Helm exclusively',
      'Skaffold',
      'kubectl proxy',
      'Terraform'
    ),
    correct: ['b'],
    explanation: 'Cloud Deploy uses Skaffold to render manifests per target and to deploy and verify releases, which is why a skaffold.yaml is part of the Cloud Deploy configuration.',
    references: [REF_SKAFFOLD, REF_DEPLOY]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'Your Cloud Build builds must access resources inside a private VPC with no external IPs and need consistent network egress. Which feature should you use?',
    options: opts4(
      'The default global build pool with public egress',
      'Cloud Build private pools connected to your VPC',
      'A Cloud NAT-only solution with the default pool',
      'Running builds on a developer laptop'
    ),
    correct: ['b'],
    explanation: 'Cloud Build private pools run workers in a Google-managed project peered to your VPC, enabling builds to reach private resources and providing controlled network configuration that the default pool cannot.',
    references: [REF_BUILD_PRIVATEPOOL, REF_BUILD]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which practice best supports fast, safe rollback of a bad release deployed through Cloud Deploy?',
    options: opts4(
      'Mutating the running deployment in place by hand',
      'Promoting/rolling back to a previously released, immutable, versioned artifact',
      'Rebuilding from an unpinned latest tag',
      'Deleting the GKE cluster'
    ),
    correct: ['b'],
    explanation: 'Because Cloud Deploy releases reference immutable, versioned artifacts, rolling back means redeploying a known-good prior release rather than reconstructing it from mutable tags, which makes rollback fast and predictable.',
    references: [REF_DEPLOY, REF_ARTIFACT]
  },
  {
    domain: CICD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that describe good CI/CD pipeline hygiene on Google Cloud.',
    options: opts4(
      'Tag and store every built image immutably in Artifact Registry by digest or unique version',
      'Run automated tests as build steps before producing a deployable artifact',
      'Deploy directly to production on every commit with no progressive rollout for high-risk services',
      'Use least-privilege service accounts for build and deploy stages'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Immutable versioned artifacts, automated test gates, and least-privilege identities are core CI/CD practices. Pushing every commit straight to prod without progressive delivery removes the safety the pipeline should provide for high-risk services.',
    references: [REF_BUILD, REF_DEPLOY, REF_ARTIFACT]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'In a cloudbuild.yaml, how do you make one build step run only after another completes when steps would otherwise run concurrently?',
    options: opts4(
      'Steps always run strictly sequentially and cannot be parallelized',
      'Use waitFor with the id of the prerequisite step',
      'Add a sleep command',
      'Put each step in a separate trigger'
    ),
    correct: ['b'],
    explanation: 'Cloud Build steps can run concurrently when their dependencies allow; using waitFor referencing a step id (or "-" for no wait) controls ordering explicitly, so a step can wait for specific prerequisites.',
    references: [REF_BUILD_CONFIG]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A team currently stores source in Cloud Source Repositories and wants Cloud Build to trigger on pushes. What links them?',
    options: opts4(
      'A Pub/Sub topic the developers publish to manually',
      'A Cloud Build trigger configured against the Cloud Source Repositories repo',
      'A Cloud Scheduler job polling the repo',
      'An uptime check on the repo URL'
    ),
    correct: ['b'],
    explanation: 'Cloud Build triggers integrate with Cloud Source Repositories (and GitHub/Bitbucket); a trigger on the repo starts builds automatically on matching push or tag events.',
    references: [REF_SOURCEREPO, REF_BUILD_TRIGGERS]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'To strengthen software supply-chain security, your pipeline should generate verifiable build provenance. Which Google Cloud capability provides SLSA build provenance for images built in Cloud Build?',
    options: opts4(
      'Cloud Build automatically can generate and store build provenance/attestations that Binary Authorization can verify',
      'Cloud CDN signed URLs',
      'Cloud DNS DNSSEC',
      'Object versioning on the bucket'
    ),
    correct: ['a'],
    explanation: 'Cloud Build can produce build provenance metadata aligned with SLSA, which can be stored and later verified (for example by Binary Authorization), strengthening the integrity of the software supply chain.',
    references: [REF_SLSA, REF_BINAUTH]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'You want feature work validated automatically and only mergeable code to ever reach the deployment pipeline. Which branching/CI practice supports this best?',
    options: opts4(
      'Commit directly to main with no checks',
      'Require status checks (CI build/tests) to pass on pull requests before merge to the release branch',
      'Run tests only after deploying to production',
      'Disable triggers entirely'
    ),
    correct: ['b'],
    explanation: 'Requiring CI status checks (build + automated tests) to pass on pull requests before merging keeps the release branch deployable, shifting verification left rather than discovering failures in production.',
    references: [REF_BUILD_TRIGGERS, REF_BUILD]
  },

  // ── Applying Site Reliability Engineering Practices (14) ──
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In SRE terms, what is an SLI?',
    options: opts4(
      'A contractual promise to customers with financial penalties',
      'A quantitative measure of some aspect of the level of service provided, e.g., request success rate',
      'The amount of unreliability a service is allowed to have',
      'A dashboard layout'
    ),
    correct: ['b'],
    explanation: 'A Service Level Indicator (SLI) is a carefully defined quantitative measure of a service level, such as availability or latency. An SLA is the contractual promise; the error budget is the allowed unreliability.',
    references: [REF_SRE, REF_SRE_BOOK]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'A service has a 99.9% availability SLO over 30 days. The team has consumed the entire error budget two weeks in. Per SRE practice, what is the appropriate response?',
    options: opts4(
      'Ignore it; SLOs are advisory only',
      'Freeze risky feature launches and prioritize reliability work until the budget recovers',
      'Immediately raise the SLO to 100%',
      'Delete the alerting policy so it stops firing'
    ),
    correct: ['b'],
    explanation: 'When the error budget is exhausted, SRE practice is to slow or freeze risky changes and shift effort to reliability work until reliability recovers; the error budget governs the launch/velocity vs. reliability trade-off.',
    references: [REF_ERRORBUDGET, REF_SRE]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the SRE definition of an error budget for a service with a 99.95% availability SLO?',
    options: opts4(
      'The number of engineers on call',
      'The allowed amount of unreliability, i.e., 100% minus the SLO (0.05%), within the measurement window',
      'The monthly cloud spend cap',
      'The maximum number of deployments per day'
    ),
    correct: ['b'],
    explanation: 'The error budget is 1 minus the SLO target over the window — here 0.05% of the time the service may fail to meet the objective. It quantifies acceptable risk and drives release decisions.',
    references: [REF_ERRORBUDGET]
  },
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Google SRE, "toil" is best described as:',
    options: opts4(
      'Any work that is intellectually challenging and creative',
      'Manual, repetitive, automatable, tactical work that scales linearly with service growth and has no enduring value',
      'Writing postmortems',
      'Designing a new architecture'
    ),
    correct: ['b'],
    explanation: 'Toil is manual, repetitive, automatable, tactical work that scales with the service and provides no lasting value; SRE aims to cap and reduce toil through automation so engineers can do engineering work.',
    references: [REF_TOIL]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'Your postmortem process assigns blame to the engineer who pushed the change that triggered an outage. What SRE principle is being violated?',
    options: opts4(
      'Postmortems should be skipped for small incidents',
      'Blameless postmortems — focus on systemic causes and learning, not individual fault',
      'Error budgets must be zero',
      'On-call rotations should be one person forever'
    ),
    correct: ['b'],
    explanation: 'SRE advocates blameless postmortems: the goal is to identify and fix systemic and process weaknesses so the same failure cannot recur, not to punish individuals, which otherwise discourages transparency.',
    references: [REF_POSTMORTEM]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'During a major incident, who is primarily responsible for coordinating the response and communication while others remediate?',
    options: opts4(
      'No one — everyone fixes independently',
      'A designated Incident Commander coordinating roles and communication',
      'The CFO',
      'The customer'
    ),
    correct: ['b'],
    explanation: 'Effective incident management designates an Incident Commander who coordinates the response, delegates operational and communications roles, and maintains a clear command structure so responders are not duplicating or conflicting.',
    references: [REF_INCIDENT]
  },
  {
    domain: SRE, difficulty: 4, type: QType.SINGLE,
    stem: 'You define an availability SLO and want alerting that pages engineers fast for severe outages but does not page for slow, minor budget burn. Which alerting approach matches SRE guidance?',
    options: opts4(
      'A single static threshold on raw error count',
      'Multi-window, multi-burn-rate alerting on error-budget consumption',
      'Paging on every individual failed request',
      'No alerting; rely on customer reports'
    ),
    correct: ['b'],
    explanation: 'SRE recommends SLO burn-rate alerting using multiple windows and burn-rate thresholds: fast burn pages quickly for severe issues, while slower burn produces tickets, balancing sensitivity and noise.',
    references: [REF_SLO, REF_SRE_WORKBOOK]
  },
  {
    domain: SRE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements consistent with Google SRE practice.',
    options: opts4(
      'SLOs should be set based on what users actually need, not 100%',
      'Error budgets create a shared incentive between development and operations',
      'All toil is acceptable as long as the team is busy',
      'Postmortems should be blameless and result in tracked action items'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'SLOs target user-relevant reliability (rarely 100%), error budgets align dev and ops incentives, and blameless postmortems with action items drive learning. Unbounded toil is explicitly something SRE works to reduce.',
    references: [REF_SRE, REF_TOIL, REF_POSTMORTEM]
  },
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why does SRE generally discourage setting an availability SLO of 100%?',
    options: opts4(
      'Because monitoring cannot measure 100%',
      'Because 100% leaves no error budget for change/maintenance and is usually not what users require or cost-justified',
      'Because Google Cloud caps SLOs at 99%',
      'Because users prefer downtime'
    ),
    correct: ['b'],
    explanation: 'A 100% target leaves zero error budget, making any change or maintenance an SLO violation, and the marginal reliability is rarely perceptible to users or worth the cost; SLOs should reflect actual user needs.',
    references: [REF_ERRORBUDGET, REF_SRE]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team is paged constantly by noisy, non-actionable alerts, causing fatigue. What is the recommended SRE remediation?',
    options: opts4(
      'Tell engineers to ignore alerts',
      'Tune alerts so every page is urgent, actionable, and tied to user-facing symptoms (e.g., SLO burn)',
      'Increase the on-call rotation to 24 people so each is paged rarely regardless of quality',
      'Disable monitoring entirely'
    ),
    correct: ['b'],
    explanation: 'SRE alerting should be actionable and symptom-based, ideally tied to SLOs. Reducing non-actionable pages preserves on-call health and ensures pages represent real, user-affecting problems.',
    references: [REF_ONCALL, REF_SLO]
  },
  {
    domain: SRE, difficulty: 4, type: QType.SINGLE,
    stem: 'A service must survive a single-region outage with an RTO of minutes. Which architecture pattern aligns with this reliability requirement?',
    options: opts4(
      'Single-zone deployment with daily backups only',
      'Multi-region active-active (or warm standby) with automated failover and tested DR',
      'Manual rebuild from documentation after an outage',
      'Increasing the VM size in one zone'
    ),
    correct: ['b'],
    explanation: 'Meeting a minutes-level RTO across a regional failure requires multi-region redundancy with automated failover and regularly tested disaster recovery; single-zone or manual-rebuild approaches cannot meet that objective.',
    references: [REF_DR, REF_RELIABILITY]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the main purpose of conducting a postmortem after a significant incident?',
    options: opts4(
      'To produce a document for auditors only',
      'To capture timeline, impact, root/contributing causes, and concrete action items so recurrence is prevented',
      'To assign disciplinary action',
      'To close the incident faster'
    ),
    correct: ['b'],
    explanation: 'A postmortem records what happened, the impact, contributing causes, and tracked action items to prevent recurrence — it is a learning artifact, not a disciplinary or purely compliance document.',
    references: [REF_POSTMORTEM, REF_INCIDENT]
  },
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the best example of an SLI for a web request-serving service?',
    options: opts4(
      'Number of engineers employed',
      'The proportion of HTTP requests served successfully within 300 ms',
      'Total marketing budget',
      'Number of Git commits'
    ),
    correct: ['b'],
    explanation: 'A good SLI is a measurable, user-relevant signal of service quality, such as the fraction of requests that succeed within a latency threshold. The other options do not measure delivered service quality.',
    references: [REF_SRE, REF_SLO]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'An SRE team wants to reduce repetitive manual restarts of a flaky job. According to SRE principles, the best long-term action is to:',
    options: opts4(
      'Add more people to the rotation to share the restarts',
      'Invest engineering time to automate or fix the root cause, eliminating the toil',
      'Document the restart steps and accept the toil permanently',
      'Increase the alert threshold so it pages less'
    ),
    correct: ['b'],
    explanation: 'SRE caps and reduces toil by investing in automation or fixing the underlying defect, which removes recurring manual work rather than merely redistributing or hiding it.',
    references: [REF_TOIL, REF_SRE_WORKBOOK]
  },

  // ── Implementing Observability (13) ──
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Google Cloud service collects, queries, and alerts on time-series metrics from your applications and infrastructure?',
    options: opts4(
      'Cloud Trace',
      'Cloud Monitoring',
      'Cloud Source Repositories',
      'Artifact Registry'
    ),
    correct: ['b'],
    explanation: 'Cloud Monitoring ingests metrics, supports dashboards and alerting policies, and queries time series. Cloud Trace handles distributed traces, not general metric alerting.',
    references: [REF_MONITORING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to count occurrences of a specific error string appearing in your application logs and alert when the rate spikes. What should you create?',
    options: opts4(
      'An uptime check',
      'A log-based metric that matches the error pattern, then an alerting policy on that metric',
      'A Cloud Trace span',
      'A Cloud Profiler report'
    ),
    correct: ['b'],
    explanation: 'Log-based metrics extract numeric or counter signals from matching log entries; you can then build an alerting policy on the metric to fire when the error rate exceeds a threshold.',
    references: [REF_LOG_BASED_METRICS, REF_ALERTING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A request is slow and spans many microservices. Which observability tool helps you see the latency contribution of each service in the request path?',
    options: opts4(
      'Cloud Logging only',
      'Cloud Trace (distributed tracing)',
      'Cloud Billing reports',
      'Organization Policy'
    ),
    correct: ['b'],
    explanation: 'Cloud Trace provides distributed tracing, showing latency for each span across services in a request, making it the right tool to find which service contributes most to end-to-end latency.',
    references: [REF_TRACE]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to identify which functions consume the most CPU and memory in a continuously running service with minimal overhead in production. Which tool is designed for this?',
    options: opts4(
      'Cloud Trace',
      'Cloud Profiler',
      'Cloud Deploy',
      'Cloud Scheduler'
    ),
    correct: ['b'],
    explanation: 'Cloud Profiler continuously gathers low-overhead CPU and memory profiling data from production, helping pinpoint resource-heavy code paths. Cloud Trace focuses on request latency, not code-level resource profiling.',
    references: [REF_PROFILER]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component routes log entries to destinations such as a Cloud Logging bucket, BigQuery, Pub/Sub, or Cloud Storage based on filters?',
    options: opts4(
      'The Ops Agent',
      'The Log Router with sinks',
      'Cloud CDN',
      'A managed instance group'
    ),
    correct: ['b'],
    explanation: 'The Log Router evaluates inclusion/exclusion filters and uses sinks to route matching log entries to supported destinations (logging buckets, BigQuery, Pub/Sub, Cloud Storage) for analysis or retention.',
    references: [REF_LOG_ROUTER, REF_LOGGING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You run third-party Prometheus-instrumented workloads on GKE and want managed, scalable storage and querying of those metrics on Google Cloud. What should you use?',
    options: opts4(
      'Manually scrape and store metrics in Cloud SQL',
      'Google Cloud Managed Service for Prometheus',
      'Cloud Trace',
      'Error Reporting'
    ),
    correct: ['b'],
    explanation: 'Google Cloud Managed Service for Prometheus provides managed collection, storage, and querying (PromQL) of Prometheus metrics at scale, integrating with Cloud Monitoring without self-managing Prometheus infrastructure.',
    references: [REF_MANAGED_PROM, REF_MONITORING]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which agent is recommended to collect both system and application metrics and logs from Compute Engine VMs?',
    options: opts4(
      'The legacy monitoring-only agent is now mandatory',
      'The Ops Agent',
      'Cloud Trace SDK',
      'gcloud CLI in a cron job'
    ),
    correct: ['b'],
    explanation: 'The Ops Agent is the recommended single agent for collecting telemetry (metrics and logs) from Compute Engine VMs, replacing the older separate Monitoring and Logging agents.',
    references: [REF_OPS_AGENT, REF_MONITORING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'Your team wants to be paged when 95th-percentile request latency exceeds a threshold for 5 minutes. What do you configure in Cloud Monitoring?',
    options: opts4(
      'A log sink to BigQuery',
      'An alerting policy with a condition on the latency metric (e.g., 95th percentile) and a duration window, with a notification channel',
      'A Cloud Profiler report',
      'A new project'
    ),
    correct: ['b'],
    explanation: 'An alerting policy defines a condition (metric, aggregation such as 95th percentile, threshold, and duration) and notification channels; it triggers when the condition holds for the configured window.',
    references: [REF_ALERTING, REF_MONITORING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about observability on Google Cloud.',
    options: opts4(
      'Cloud Trace shows per-span latency across distributed services',
      'Log-based metrics can turn matching log entries into time series for alerting',
      'Error Reporting aggregates and deduplicates application errors',
      'Cloud Monitoring cannot send notifications anywhere'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Cloud Trace provides span-level latency, log-based metrics produce time series from logs, and Error Reporting groups and deduplicates exceptions. Cloud Monitoring does support notification channels (email, PagerDuty, Pub/Sub, etc.).',
    references: [REF_TRACE, REF_LOG_BASED_METRICS, REF_ERRORREPORTING]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Google Cloud service automatically groups and surfaces recurring application exceptions so you can see new vs. resolved errors?',
    options: opts4(
      'Cloud CDN',
      'Error Reporting',
      'Cloud NAT',
      'Cloud DNS'
    ),
    correct: ['b'],
    explanation: 'Error Reporting analyzes and aggregates errors reported from your services, deduplicating similar stack traces and tracking error occurrence trends and resolution state.',
    references: [REF_ERRORREPORTING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a periodic external check that your public HTTPS endpoint is reachable and returns 200 from multiple regions, and to alert if it fails. What do you configure?',
    options: opts4(
      'A Cloud Profiler agent',
      'An uptime check with an alerting policy on its failure',
      'A log-based metric on access logs only',
      'A managed instance group'
    ),
    correct: ['b'],
    explanation: 'Uptime checks probe endpoints from multiple global locations on a schedule; pairing the uptime check with an alerting policy notifies the team when the endpoint becomes unreachable or unhealthy.',
    references: [REF_UPTIME, REF_ALERTING]
  },
  {
    domain: OBS, difficulty: 4, type: QType.SINGLE,
    stem: 'You need a flexible query to compute a ratio SLI (good requests / total requests) directly over Cloud Monitoring time series. Which capability is best suited?',
    options: opts4(
      'Static threshold only, no math allowed',
      'Monitoring Query Language (MQL) or ratio-based SLO conditions to express the computation',
      'Cloud Trace sampling',
      'Artifact Registry cleanup policies'
    ),
    correct: ['b'],
    explanation: 'Monitoring Query Language lets you express advanced computations like ratios over time series, and Cloud Monitoring SLOs support request-based ratio definitions — both suit computing a good/total SLI.',
    references: [REF_MQL, REF_SLO]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'To give an on-call engineer a single curated view of golden signals (latency, traffic, errors, saturation) for a service, you should create:',
    options: opts4(
      'A new billing account',
      'A Cloud Monitoring dashboard with relevant charts',
      'An IAM custom role',
      'A VPC peering connection'
    ),
    correct: ['b'],
    explanation: 'Cloud Monitoring dashboards aggregate selected charts (e.g., the golden signals) into a single curated view, helping responders quickly assess service health.',
    references: [REF_DASHBOARDS, REF_MONITORING]
  },

  // ── Optimizing Service Performance (12) ──
  {
    domain: PERF, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Your stateless web service on GKE experiences variable traffic. Which mechanism automatically adjusts the number of Pods based on observed CPU utilization?',
    options: opts4(
      'Vertical resizing of the node disk',
      'Horizontal Pod Autoscaler (HPA)',
      'A static replica count',
      'Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'The Horizontal Pod Autoscaler scales the number of Pod replicas up or down based on metrics such as CPU utilization or custom metrics, matching capacity to demand for stateless workloads.',
    references: [REF_HPA, REF_GKE]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'After HPA scales Pods up, they stay Pending because no node has capacity. Which GKE feature resolves this?',
    options: opts4(
      'Cloud DNS',
      'Cluster Autoscaler, which adds nodes to the node pool when Pods cannot be scheduled',
      'A larger boot disk',
      'Cloud Armor'
    ),
    correct: ['b'],
    explanation: 'The GKE Cluster Autoscaler adds nodes when Pods are unschedulable due to insufficient resources and removes underused nodes, complementing the HPA which only scales Pods.',
    references: [REF_GKE_AUTOSCALE, REF_HPA]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A globally accessed static asset endpoint has high origin latency and load. Which service reduces latency and offloads the origin by caching content near users?',
    options: opts4(
      'Cloud NAT',
      'Cloud CDN',
      'Cloud Profiler',
      'Cloud Source Repositories'
    ),
    correct: ['b'],
    explanation: 'Cloud CDN caches content at Google edge locations close to users, reducing latency and offloading repeated requests from the origin backend behind the external HTTP(S) load balancer.',
    references: [REF_CDN, REF_LB]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'Your Compute Engine backend behind a load balancer is overloaded at peak and idle off-peak, wasting cost. What should you implement?',
    options: opts4(
      'Manually resize VMs each morning',
      'A managed instance group with autoscaling based on load (e.g., CPU or load-balancing utilization)',
      'A single very large VM running 24/7',
      'Disable the load balancer'
    ),
    correct: ['b'],
    explanation: 'A managed instance group with an autoscaler adds and removes VM instances based on signals such as CPU or serving capacity, matching capacity to demand and reducing cost during off-peak periods.',
    references: [REF_MIG, REF_AUTOSCALER]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'A Cloud Run service has slow cold starts impacting tail latency under bursty traffic. Which configuration most directly mitigates cold-start latency?',
    options: opts4(
      'Setting concurrency to 1',
      'Configuring a minimum number of instances so warm instances are kept ready',
      'Disabling autoscaling',
      'Removing all CPU limits'
    ),
    correct: ['b'],
    explanation: 'Setting a minimum number of instances on Cloud Run keeps warm instances available, reducing cold-start frequency and improving tail latency for bursty traffic.',
    references: [REF_RUN, REF_PERF]
  },
  {
    domain: PERF, difficulty: 4, type: QType.SINGLE,
    stem: 'You suspect a specific code path is the latency bottleneck under production load. Which two-step approach is most effective?',
    options: opts4(
      'Guess and rewrite random functions',
      'Use Cloud Trace to localize the slow span, then Cloud Profiler to find the hot code in that service',
      'Increase the SLO so latency is acceptable',
      'Add more logging only'
    ),
    correct: ['b'],
    explanation: 'Cloud Trace localizes which service/span contributes the latency, then Cloud Profiler pinpoints the CPU/memory-heavy code within that service — a data-driven path to the real bottleneck.',
    references: [REF_TRACE, REF_PROFILER]
  },
  {
    domain: PERF, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that help optimize cost while maintaining performance on GKE.',
    options: opts4(
      'Right-size Pod CPU/memory requests based on observed usage',
      'Enable Cluster Autoscaler and use appropriate node pools',
      'Always over-provision every Deployment to 10x peak as a default',
      'Use Horizontal Pod Autoscaler tuned to real demand'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Right-sizing requests, autoscaling nodes, and HPA tuned to demand keep cost aligned with performance. Blanket 10x over-provisioning wastes resources without commensurate benefit.',
    references: [REF_GKE_OPTIMIZE, REF_HPA]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'Before a major launch you want to verify the system meets latency SLOs under expected peak. What should you do?',
    options: opts4(
      'Deploy to production and hope',
      'Run a distributed load test that simulates peak traffic and observe SLIs/SLOs and resource saturation',
      'Only unit test the code',
      'Increase the VM size and assume it scales'
    ),
    correct: ['b'],
    explanation: 'Distributed load testing against a representative environment validates that the system meets latency and throughput objectives at projected peak and surfaces saturation points before real users are affected.',
    references: [REF_LOADTEST, REF_PERF]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'A read-heavy application overloads its Cloud SQL primary instance. Which change improves read performance with least application disruption?',
    options: opts4(
      'Delete indexes to speed writes',
      'Add read replicas and route read traffic to them',
      'Disable backups',
      'Move all reads to the on-call engineer'
    ),
    correct: ['b'],
    explanation: 'Cloud SQL read replicas offload read traffic from the primary, improving read throughput and latency for read-heavy workloads while the primary continues to handle writes.',
    references: [REF_CLOUDSQL, REF_PERF]
  },
  {
    domain: PERF, difficulty: 2, type: QType.SINGLE,
    stem: 'Which signal is the most appropriate primary autoscaling metric for a CPU-bound stateless API service?',
    options: opts4(
      'Disk free space on the boot volume',
      'Average CPU utilization (or request load) across instances',
      'Number of Git branches',
      'Billing account balance'
    ),
    correct: ['b'],
    explanation: 'For a CPU-bound stateless service, autoscaling on average CPU utilization (or serving/request load) tracks actual demand, whereas unrelated signals like disk space or repo state do not reflect load.',
    references: [REF_AUTOSCALER, REF_HPA]
  },
  {
    domain: PERF, difficulty: 4, type: QType.SINGLE,
    stem: 'A latency-sensitive service shows high tail latency only when the Cluster Autoscaler scales out, due to slow node provisioning. Which mitigation reduces this scale-up latency impact?',
    options: opts4(
      'Disable the Cluster Autoscaler entirely',
      'Maintain spare capacity/headroom (e.g., over-provisioning with low-priority placeholder Pods) so scale-up is not on the critical path',
      'Remove resource requests from all Pods',
      'Switch to a single huge node'
    ),
    correct: ['b'],
    explanation: 'Keeping a small amount of pre-provisioned headroom (for example via low-priority "balloon" Pods that get evicted when real workloads need space) absorbs bursts immediately while the autoscaler provisions more nodes, reducing tail latency during scale-up.',
    references: [REF_GKE_AUTOSCALE, REF_GKE_OPTIMIZE]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'To keep performance optimization an ongoing discipline rather than a one-off, which practice aligns with the Architecture Framework?',
    options: opts4(
      'Optimize once at launch and never revisit',
      'Continuously monitor performance against SLOs and iterate using telemetry-driven changes',
      'Rely solely on customer complaints',
      'Scale only by buying the largest machine type'
    ),
    correct: ['b'],
    explanation: 'The Architecture Framework treats performance optimization as continuous: monitor against SLOs, identify bottlenecks from telemetry, apply targeted changes, and re-measure, rather than a single launch-time effort.',
    references: [REF_PERF, REF_RELIABILITY]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Bootstrapping and Managing a Google Cloud Organization (12) ──
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which node sits at the top of the Google Cloud resource hierarchy and is the root for IAM and organization policies?',
    options: opts4(
      'The default project',
      'The Organization resource',
      'A folder named "root"',
      'The billing account'
    ),
    correct: ['b'],
    explanation: 'The Organization resource is the root node of the hierarchy; folders and projects descend from it, and IAM and organization policies set there are inherited downward. Billing accounts are separate from the hierarchy.',
    references: [REF_RESMGR]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to group projects for the "payments" department so a single IAM policy and set of org policies apply to all of them and any future projects in that department. What should you use?',
    options: opts4(
      'Label each project with department=payments only',
      'A folder for the payments department containing those projects',
      'One giant project for everything',
      'A separate billing account per project'
    ),
    correct: ['b'],
    explanation: 'Folders group projects (and sub-folders) so IAM bindings and organization policies set on the folder are inherited by all current and future contained projects, which labels alone cannot enforce.',
    references: [REF_RESMGR, REF_ORGPOLICY]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'A pipeline service account needs to deploy to GKE but currently has roles/owner. Applying least privilege, what should you do?',
    options: opts4(
      'Keep Owner for convenience',
      'Replace it with the minimal predefined or custom roles needed (e.g., container.developer) for its tasks',
      'Delete the service account and use a user account',
      'Grant Owner at the organization instead'
    ),
    correct: ['b'],
    explanation: 'Least privilege means granting only the roles required for the task (such as container.developer for GKE deploys) rather than broad Owner, which would let a compromised pipeline identity do anything.',
    references: [REF_IAM_BEST, REF_IAM]
  },
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which tool, native to Google Cloud, lets you manage Terraform deployments and state without provisioning your own runner infrastructure?',
    options: opts4(
      'Cloud Deploy',
      'Infrastructure Manager',
      'Cloud Run jobs only',
      'Cloud Scheduler'
    ),
    correct: ['b'],
    explanation: 'Infrastructure Manager is a managed service that runs Terraform configurations and manages their state, removing the need to operate your own Terraform execution environment.',
    references: [REF_INFRAMGR, REF_TERRAFORM]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'Why store Terraform state in a Cloud Storage bucket rather than committing it to Git?',
    options: opts4(
      'Git is faster for binary state',
      'The GCS backend provides shared, access-controlled, lockable remote state and avoids leaking secrets into source control',
      'Terraform cannot read from buckets',
      'Git automatically encrypts state'
    ),
    correct: ['b'],
    explanation: 'Remote state in a GCS bucket gives a single shared source of truth with IAM access control and locking and keeps sensitive state values out of the Git repository.',
    references: [REF_TERRAFORM]
  },
  {
    domain: BOOT, difficulty: 4, type: QType.SINGLE,
    stem: 'A security team needs to guarantee that Cloud Storage data cannot be copied to projects outside an approved set, even by users with storage permissions. Which control addresses this?',
    options: opts4(
      'Bucket IAM only',
      'VPC Service Controls perimeter around the approved projects',
      'A custom organization policy on disk size',
      'Object lifecycle management'
    ),
    correct: ['b'],
    explanation: 'VPC Service Controls add a context-aware perimeter that blocks data movement of protected services (like Cloud Storage) to unauthorized projects/networks, mitigating exfiltration beyond what IAM alone can do.',
    references: [REF_VPCSC]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'A new project association with a billing account fails. Which role is typically required to link projects to a billing account?',
    options: opts4(
      'roles/viewer on the project',
      'roles/billing.user on the billing account (plus project create permission)',
      'roles/compute.admin',
      'roles/storage.objectViewer'
    ),
    correct: ['b'],
    explanation: 'Linking a project to a billing account requires billing permissions such as roles/billing.user on the billing account, in addition to the ability to create/modify the project.',
    references: [REF_BILLING, REF_IAM]
  },
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about organization policy constraints is correct?',
    options: opts4(
      'They authenticate users',
      'They restrict the allowed configurations of resources (e.g., allowed regions, external IP) across the hierarchy',
      'They store application secrets',
      'They are only available at the project level'
    ),
    correct: ['b'],
    explanation: 'Organization policy constraints govern what configurations resources may have (such as allowed locations or external IP usage) and can be applied at organization, folder, or project scope with inheritance.',
    references: [REF_ORGPOLICY, REF_RESMGR]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'Your CI system runs outside Google Cloud and you must eliminate exported service account keys. The recommended solution is to:',
    options: opts4(
      'Email keys with 24h rotation',
      'Configure Workload Identity Federation to trust the external identity provider and impersonate a service account with short-lived tokens',
      'Hardcode keys in the pipeline',
      'Use a shared password vault spreadsheet'
    ),
    correct: ['b'],
    explanation: 'Workload Identity Federation establishes trust with an external IdP and issues short-lived credentials, removing the need for long-lived exported keys for off-cloud CI systems.',
    references: [REF_WIF, REF_SA]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL recommended foundation/landing-zone practices.',
    options: opts4(
      'Use folders to mirror organizational/environment structure',
      'Codify the foundation in version-controlled Terraform',
      'Grant individual users Owner at the organization for convenience',
      'Isolate the bootstrap automation identity and its state in a dedicated project'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Folder-based structure, Terraform-codified foundations, and an isolated bootstrap project follow landing-zone guidance. Broad org-level Owner for individuals violates least privilege and increases blast radius.',
    references: [REF_LANDINGZONE, REF_TERRAFORM, REF_IAM_BEST]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'You consistently hit an API rate/resource quota during deployments in one region. The supported way to get more capacity is to:',
    options: opts4(
      'Spread workloads across dozens of throwaway projects as standard design',
      'Submit a quota increase request for that quota in that region',
      'Ignore the errors and retry forever',
      'Switch the project to no-quota mode'
    ),
    correct: ['b'],
    explanation: 'Quotas are adjustable through the quota request process. There is no "no-quota mode," and farming projects to dodge quotas is an anti-pattern that complicates governance.',
    references: [REF_QUOTAS]
  },
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the cleanest way to ensure required APIs are enabled when a project is provisioned with Terraform?',
    options: opts4(
      'Enable them manually after each apply',
      'Declare google_project_service resources in the same Terraform configuration',
      'File a support ticket each time',
      'Ignore — APIs are all enabled by default'
    ),
    correct: ['b'],
    explanation: 'Declaring google_project_service in Terraform makes API enablement part of the reproducible configuration; APIs are not all enabled by default and manual steps break reproducibility.',
    references: [REF_TERRAFORM, REF_PROJECTS]
  },

  // ── Building and Implementing CI/CD Pipelines (14) ──
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Google Cloud service is purpose-built for managing progressive application delivery to runtimes like GKE and Cloud Run across multiple environments?',
    options: opts4(
      'Cloud Build',
      'Cloud Deploy',
      'Cloud Source Repositories',
      'Cloud Monitoring'
    ),
    correct: ['b'],
    explanation: 'Cloud Deploy is a managed continuous-delivery service that orchestrates promotion of releases through targets (dev/staging/prod) with strategies like canary, complementing Cloud Build which produces artifacts.',
    references: [REF_DEPLOY, REF_DEPLOY_PROGRESSION]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'In Cloud Deploy, what models the ordered sequence of environments a release moves through?',
    options: opts4(
      'A Cloud Build trigger',
      'A delivery pipeline with ordered targets',
      'An uptime check',
      'A Pub/Sub subscription'
    ),
    correct: ['b'],
    explanation: 'A Cloud Deploy delivery pipeline defines the ordered progression of targets (e.g., dev → staging → prod); releases are promoted through these targets, optionally with approvals.',
    references: [REF_DEPLOY_PROGRESSION, REF_DEPLOY]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must guarantee only images that passed your security scan and were signed are deployable to production GKE. Which control enforces it at admission?',
    options: opts4(
      'Network firewall rules',
      'Binary Authorization policy requiring attestations',
      'Cloud CDN cache invalidation',
      'A label on the namespace'
    ),
    correct: ['b'],
    explanation: 'Binary Authorization enforces, at deploy/admission time, that container images carry the required attestations (e.g., from your scan/sign step) before they can run, blocking unverified images.',
    references: [REF_BINAUTH, REF_SLSA]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the recommended Google Cloud destination for storing versioned, IAM-controlled build artifacts (container images, language packages)?',
    options: opts4(
      'Cloud Logging buckets',
      'Artifact Registry',
      'A public file server',
      'Cloud Trace'
    ),
    correct: ['b'],
    explanation: 'Artifact Registry stores and versions container images and packages with IAM access control and integrates with Cloud Build, Cloud Deploy, GKE, and Cloud Run.',
    references: [REF_ARTIFACT]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'A Cloud Build trigger should start a build only for commits pushed to the release/* branches. How do you achieve this?',
    options: opts4(
      'Add a sleep step',
      'Configure the trigger event and a branch filter (regex) matching release/*',
      'Use a separate billing account',
      'Switch to manual builds only'
    ),
    correct: ['b'],
    explanation: 'Cloud Build triggers support event type and branch/tag filters (including regex), so a push trigger filtered to release/* runs only for those branches.',
    references: [REF_BUILD_TRIGGERS]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'You want a release rolled out to 5%, then 25%, then 100% with verification between phases, automated by the delivery tool. Which Cloud Deploy strategy fits?',
    options: opts4(
      'Recreate',
      'Canary with custom phase percentages and verification',
      'Manual SSH deploy',
      'Cron full redeploy'
    ),
    correct: ['b'],
    explanation: 'Cloud Deploy canary strategy supports custom percentage phases with optional verification between phases before progressing to full rollout, matching the described requirement.',
    references: [REF_DEPLOY_CANARY]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'Builds must reach databases that only have private IPs inside your VPC. Which Cloud Build option enables that connectivity?',
    options: opts4(
      'The default global pool with public internet only',
      'Cloud Build private pools peered to your VPC',
      'Disabling the build network',
      'Running builds in Cloud Run'
    ),
    correct: ['b'],
    explanation: 'Cloud Build private pools provide workers connected to your VPC, allowing builds to reach private-IP resources like internal databases that the default pool cannot reach.',
    references: [REF_BUILD_PRIVATEPOOL]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Why should container images be referenced by immutable digests or unique version tags in deployment manifests rather than the mutable "latest" tag?',
    options: opts4(
      'latest is faster to pull',
      'Immutable references guarantee the exact artifact deployed and enable reliable rollback and reproducibility',
      'Digests are required for billing',
      'latest enables canary automatically'
    ),
    correct: ['b'],
    explanation: 'Pinning to a digest or unique version ensures the deployed bits are exactly what was tested, and that rollback redeploys a known artifact; "latest" can change underneath you, breaking reproducibility.',
    references: [REF_ARTIFACT, REF_DEPLOY]
  },
  {
    domain: CICD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Cloud Deploy.',
    options: opts4(
      'It uses Skaffold to render and apply manifests',
      'Targets can require manual approval before promotion',
      'It can perform canary rollouts',
      'It builds container images from Dockerfiles itself instead of Cloud Build'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Cloud Deploy uses Skaffold, supports per-target approvals, and supports canary strategies. It delivers artifacts but does not itself build images — image building is done by Cloud Build (or another CI).',
    references: [REF_SKAFFOLD, REF_DEPLOY_APPROVAL, REF_DEPLOY_CANARY]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'In cloudbuild.yaml, which field defines the ordered (or dependency-ordered) list of operations Cloud Build performs?',
    options: opts4(
      'images',
      'steps',
      'timeout',
      'substitutions'
    ),
    correct: ['b'],
    explanation: 'The steps field lists the build steps (each a container action) Cloud Build executes; images lists artifacts to push, timeout bounds duration, and substitutions parameterize values.',
    references: [REF_BUILD_CONFIG]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'You want CI to fail the build (and block deployment) if integration tests fail. What is the correct pattern?',
    options: opts4(
      'Run integration tests after production deploy only',
      'Add a build step that runs the tests; a non-zero exit fails the build and stops the pipeline',
      'Email the results and continue regardless',
      'Skip tests in CI to save time'
    ),
    correct: ['b'],
    explanation: 'A Cloud Build step that runs integration tests will fail the build on a non-zero exit code, preventing the artifact from progressing — shifting detection left of production.',
    references: [REF_BUILD, REF_BUILD_CONFIG]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'To increase trust in what you ship, your pipeline should produce signed build provenance that a deploy-time policy verifies. Which combination supports this?',
    options: opts4(
      'Cloud CDN + Cloud DNS',
      'Cloud Build provenance/attestations verified by Binary Authorization',
      'Cloud NAT + uptime checks',
      'Cloud Profiler + Cloud Trace'
    ),
    correct: ['b'],
    explanation: 'Cloud Build can emit SLSA-aligned provenance/attestations, and Binary Authorization can require and verify those attestations before admitting an image, hardening the supply chain.',
    references: [REF_SLSA, REF_BINAUTH]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which source options can Cloud Build triggers connect to for automatic builds?',
    options: opts4(
      'Only local files on a laptop',
      'Cloud Source Repositories and connected GitHub/Bitbucket repositories',
      'Only Cloud Storage zip files',
      'Only Artifact Registry'
    ),
    correct: ['b'],
    explanation: 'Cloud Build triggers integrate with Cloud Source Repositories and connected external repos like GitHub and Bitbucket, starting builds on push/PR/tag events.',
    references: [REF_SOURCEREPO, REF_BUILD_TRIGGERS]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'A team needs a fast, low-risk rollback path for a Cloud Deploy-managed service. Which design best enables it?',
    options: opts4(
      'Mutate production manifests by hand during incidents',
      'Keep prior releases (immutable artifacts) so you can roll back/redeploy a known-good release quickly',
      'Always build from the latest tag during rollback',
      'Delete and recreate the cluster'
    ),
    correct: ['b'],
    explanation: 'Because Cloud Deploy releases are versioned and reference immutable artifacts, rollback is a controlled redeploy of a known-good prior release, which is fast and predictable — unlike hand edits or rebuilding from mutable tags.',
    references: [REF_DEPLOY, REF_ARTIFACT]
  },

  // ── Applying Site Reliability Engineering Practices (14) ──
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the relationship between an SLO and an SLA?',
    options: opts4(
      'They are identical',
      'An SLO is an internal reliability target; an SLA is an external contract usually set looser than the SLO',
      'An SLA must always be 100%',
      'An SLO is a legal penalty clause'
    ),
    correct: ['b'],
    explanation: 'The SLO is the internal objective the team holds itself to; the SLA is the customer-facing contract with consequences, typically set more lenient than the SLO so the team has internal margin.',
    references: [REF_SRE, REF_SRE_BOOK]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team blew its monthly error budget due to risky launches. What does an error-budget policy typically require next?',
    options: opts4(
      'Accelerate feature launches to make up lost time',
      'Halt or slow risky changes and prioritize reliability work until the budget is restored',
      'Lower monitoring resolution',
      'Increase the SLA penalty'
    ),
    correct: ['b'],
    explanation: 'An error-budget policy defines agreed consequences for exhaustion — typically freezing risky launches and focusing on reliability/hardening until the service is back within budget.',
    references: [REF_ERRORBUDGET, REF_SRE_WORKBOOK]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best example of reducing toil rather than just absorbing it?',
    options: opts4(
      'Adding more on-call engineers to share manual restarts',
      'Building automation that performs the previously manual recovery and removes the need for human action',
      'Writing a longer runbook for the manual steps',
      'Paging earlier so humans react faster'
    ),
    correct: ['b'],
    explanation: 'Reducing toil means automating away the manual work or fixing root cause; redistributing or documenting manual steps still leaves the toil in place.',
    references: [REF_TOIL, REF_SRE_WORKBOOK]
  },
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A blameless postmortem primarily aims to:',
    options: opts4(
      'Identify who to discipline',
      'Understand systemic causes and produce action items to prevent recurrence without fear of punishment',
      'Satisfy auditors only',
      'Reduce the incident count metric artificially'
    ),
    correct: ['b'],
    explanation: 'Blameless postmortems foster honest analysis of systemic and process failures and concrete preventive actions, because punishing individuals suppresses the information needed to improve.',
    references: [REF_POSTMORTEM]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'During incident response, what is the role of a Communications Lead?',
    options: opts4(
      'To fix the code personally',
      'To handle stakeholder/customer updates so responders can focus on remediation under the Incident Commander',
      'To approve the budget',
      'To write the postmortem alone afterward'
    ),
    correct: ['b'],
    explanation: 'In structured incident management, the Communications Lead owns internal/external updates, freeing the Incident Commander and operations responders to coordinate and remediate.',
    references: [REF_INCIDENT, REF_ONCALL]
  },
  {
    domain: SRE, difficulty: 4, type: QType.SINGLE,
    stem: 'You want SLO alerting that pages quickly for fast budget burn but only opens a ticket for slow burn. Which technique is recommended?',
    options: opts4(
      'One alert at a fixed error count',
      'Multiple burn-rate alerts over short and long windows with different severities',
      'Page on every 5xx',
      'No alerts; rely on dashboards'
    ),
    correct: ['b'],
    explanation: 'Multi-window multi-burn-rate alerting fires high-severity pages on fast burn and lower-severity tickets on slow burn, balancing detection speed against alert noise.',
    references: [REF_SLO, REF_SRE_WORKBOOK]
  },
  {
    domain: SRE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL SRE-aligned statements about reliability targets.',
    options: opts4(
      'SLOs should reflect what users actually need',
      'A 100% SLO leaves no room for change and is usually inappropriate',
      'The error budget should always be zero',
      'Error budgets balance feature velocity against reliability'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'SLOs are user-driven, 100% leaves no error budget and is impractical, and error budgets explicitly trade off velocity vs. reliability. A zero error budget contradicts SRE practice.',
    references: [REF_SRE, REF_ERRORBUDGET]
  },
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes an error budget over a window?',
    options: opts4(
      'The total cloud cost allowed',
      '100% minus the SLO target — the permissible amount of unreliability before policy actions trigger',
      'The number of alerts allowed per day',
      'The maximum team size'
    ),
    correct: ['b'],
    explanation: 'The error budget equals one minus the SLO over the measurement window; consuming it triggers the agreed error-budget policy actions.',
    references: [REF_ERRORBUDGET]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'On-call health is suffering due to frequent non-actionable pages. Which is the best SRE response?',
    options: opts4(
      'Tell engineers to mute their phones',
      'Reduce alert noise so pages are actionable and tied to user-impacting symptoms, and track alert quality',
      'Add 30 people to the rotation regardless of alert quality',
      'Remove all alerting'
    ),
    correct: ['b'],
    explanation: 'SRE emphasizes actionable, symptom-based alerting and explicitly monitoring on-call load/alert quality; reducing non-actionable pages protects responders and keeps signals meaningful.',
    references: [REF_ONCALL, REF_SLO]
  },
  {
    domain: SRE, difficulty: 4, type: QType.SINGLE,
    stem: 'A business requires recovery from a full region failure within 15 minutes. Which approach can meet that RTO?',
    options: opts4(
      'Single region with weekly snapshots',
      'Multi-region redundancy with automated failover and regularly tested DR runbooks',
      'A bigger machine type in one zone',
      'Manual restore from documentation'
    ),
    correct: ['b'],
    explanation: 'A 15-minute RTO across a region failure requires multi-region redundancy and automated, tested failover; single-region or manual approaches cannot reliably meet that objective.',
    references: [REF_DR, REF_RELIABILITY]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'What should result from a postmortem to ensure the same incident does not recur?',
    options: opts4(
      'A note that it was the engineer’s fault',
      'Tracked, owned action items addressing systemic/contributing causes',
      'Only a Slack apology',
      'Immediate SLA renegotiation'
    ),
    correct: ['b'],
    explanation: 'Effective postmortems produce concrete, owned, tracked action items targeting systemic and contributing causes so the failure mode is mitigated, not repeated.',
    references: [REF_POSTMORTEM]
  },
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a valid latency SLI definition?',
    options: opts4(
      'The number of deploys this week',
      'The fraction of requests completed under 200 ms over the measurement window',
      'The size of the codebase',
      'The number of dashboards created'
    ),
    correct: ['b'],
    explanation: 'A latency SLI expresses the proportion of requests meeting a latency threshold over a window — a user-relevant, measurable indicator. The other options are not service-quality measures.',
    references: [REF_SLO, REF_SRE]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why are error budgets useful for aligning development and operations teams?',
    options: opts4(
      'They penalize developers financially',
      'They provide a shared, objective signal: while budget remains, ship features; when exhausted, prioritize reliability',
      'They remove the need for monitoring',
      'They guarantee zero incidents'
    ),
    correct: ['b'],
    explanation: 'Error budgets give both teams a common, data-driven decision rule that balances feature velocity and reliability, replacing subjective tension with an agreed policy.',
    references: [REF_ERRORBUDGET, REF_SRE]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'A recurring manual capacity-add task consumes one engineer-day per week and grows with traffic. SRE guidance says to:',
    options: opts4(
      'Accept it as the cost of doing business',
      'Automate it (e.g., autoscaling/automation) to eliminate the linearly scaling toil',
      'Hire a contractor to do it forever',
      'Increase the alert threshold'
    ),
    correct: ['b'],
    explanation: 'Toil that scales with traffic should be engineered away — for example via autoscaling/automation — so engineering effort does not grow linearly with load.',
    references: [REF_TOIL, REF_SRE_WORKBOOK]
  },

  // ── Implementing Observability (13) ──
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service stores, searches, and routes log entries from Google Cloud resources and applications?',
    options: opts4(
      'Cloud Trace',
      'Cloud Logging',
      'Cloud Profiler',
      'Cloud Build'
    ),
    correct: ['b'],
    explanation: 'Cloud Logging ingests, stores, and lets you search log entries and, via the Log Router, route them to other destinations. Cloud Trace handles latency traces, not logs.',
    references: [REF_LOGGING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want all audit logs exported to BigQuery for long-term analysis. What do you configure?',
    options: opts4(
      'A Cloud Profiler agent',
      'A log sink in the Log Router with a filter for audit logs and a BigQuery destination',
      'An uptime check',
      'A Cloud Trace export'
    ),
    correct: ['b'],
    explanation: 'A logging sink with an appropriate filter routes matching entries (e.g., audit logs) to BigQuery for analysis and retention, which is exactly the Log Router’s purpose.',
    references: [REF_LOG_ROUTER, REF_LOGGING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'End-to-end request latency is high but you do not know which microservice is responsible. Which tool shows per-service span timing?',
    options: opts4(
      'Cloud Logging text search',
      'Cloud Trace',
      'Cloud Billing',
      'Error Reporting'
    ),
    correct: ['b'],
    explanation: 'Cloud Trace visualizes distributed traces with span-level latency, letting you attribute end-to-end latency to specific services in the request path.',
    references: [REF_TRACE]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want continuous, low-overhead insight into which code consumes the most CPU in production. Which tool fits?',
    options: opts4(
      'Cloud Monitoring uptime checks',
      'Cloud Profiler',
      'Cloud Deploy',
      'Cloud Source Repositories'
    ),
    correct: ['b'],
    explanation: 'Cloud Profiler continuously collects statistical CPU and heap profiles from production with minimal overhead, surfacing the hottest code paths.',
    references: [REF_PROFILER]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which agent is recommended for collecting metrics and logs from Compute Engine VMs in one unified component?',
    options: opts4(
      'Two separate legacy agents are still required',
      'The Ops Agent',
      'kubelet',
      'The Cloud SQL Auth Proxy'
    ),
    correct: ['b'],
    explanation: 'The Ops Agent unifies metrics and logs collection on Compute Engine VMs, superseding the older separate Monitoring and Logging agents.',
    references: [REF_OPS_AGENT]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to alert when the rate of a specific WARNING log message exceeds 10/min. What is the correct approach?',
    options: opts4(
      'Create a Cloud Trace span filter',
      'Create a log-based counter metric for the message, then an alerting policy on its rate',
      'Increase log retention',
      'Add a Cloud CDN cache rule'
    ),
    correct: ['b'],
    explanation: 'A log-based metric converts matching log entries into a time series; an alerting policy on that metric’s rate notifies when occurrences exceed the threshold.',
    references: [REF_LOG_BASED_METRICS, REF_ALERTING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'Your teams run Prometheus-instrumented services on GKE and want managed long-term storage and PromQL without operating Prometheus servers. Use:',
    options: opts4(
      'Self-managed Prometheus on VMs',
      'Google Cloud Managed Service for Prometheus',
      'Cloud Trace',
      'Cloud SQL'
    ),
    correct: ['b'],
    explanation: 'Managed Service for Prometheus offers managed, scalable collection, storage, and PromQL querying of Prometheus metrics integrated with Cloud Monitoring, removing the operational burden of self-managed Prometheus.',
    references: [REF_MANAGED_PROM]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'To page when error ratio exceeds 1% for 10 minutes, what must an alerting policy contain?',
    options: opts4(
      'Only a dashboard',
      'A condition (metric/ratio, threshold, duration) plus one or more notification channels',
      'A Cloud Build trigger',
      'A new VPC'
    ),
    correct: ['b'],
    explanation: 'Alerting policies consist of one or more conditions (metric, comparison, threshold, duration) and notification channels that deliver the alert when conditions are met for the specified duration.',
    references: [REF_ALERTING, REF_MONITORING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL correct statements about Google Cloud observability tooling.',
    options: opts4(
      'The Log Router sends matching logs to BigQuery, Pub/Sub, Cloud Storage, or logging buckets',
      'Cloud Profiler reveals CPU/memory hot spots in production code',
      'Error Reporting deduplicates and tracks application errors',
      'Uptime checks profile individual function CPU usage'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Log Router routes logs to supported sinks, Cloud Profiler finds resource hot spots, and Error Reporting groups errors. Uptime checks probe endpoint availability — they do not profile code.',
    references: [REF_LOG_ROUTER, REF_PROFILER, REF_ERRORREPORTING]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool gives developers an aggregated, deduplicated view of new and recurring exceptions across their services?',
    options: opts4(
      'Cloud DNS',
      'Error Reporting',
      'Cloud NAT',
      'Cloud Interconnect'
    ),
    correct: ['b'],
    explanation: 'Error Reporting automatically groups similar errors, surfaces new vs. recurring issues, and tracks their frequency, helping teams triage application failures.',
    references: [REF_ERRORREPORTING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You need synthetic monitoring that verifies a public endpoint responds correctly from several global locations and alerts on failure. Configure:',
    options: opts4(
      'A Cloud Profiler job',
      'An uptime check plus an alerting policy on uptime-check failures',
      'A log sink to Cloud Storage',
      'A managed instance group'
    ),
    correct: ['b'],
    explanation: 'Uptime checks probe the endpoint from multiple regions on a schedule; an alerting policy on uptime-check results notifies the team when availability degrades.',
    references: [REF_UPTIME, REF_ALERTING]
  },
  {
    domain: OBS, difficulty: 4, type: QType.SINGLE,
    stem: 'You need to compute and chart a request-success ratio over time and base an SLO on it in Cloud Monitoring. Which capabilities apply?',
    options: opts4(
      'Only fixed thresholds, no ratios',
      'Monitoring Query Language for the ratio computation and request-based SLO definitions',
      'Cloud Trace sampling rate',
      'Artifact Registry cleanup policy'
    ),
    correct: ['b'],
    explanation: 'MQL supports ratio and other computations over time series, and Cloud Monitoring SLOs support request-based good/total definitions — both apply to a success-ratio SLO.',
    references: [REF_MQL, REF_SLO]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the best way to give responders a single curated screen of a service’s key health signals?',
    options: opts4(
      'Email screenshots hourly',
      'Build a Cloud Monitoring dashboard with the golden-signal charts',
      'Create a new project per signal',
      'Store metrics in Cloud SQL and query manually'
    ),
    correct: ['b'],
    explanation: 'A Cloud Monitoring dashboard consolidates the key charts (latency, traffic, errors, saturation) into one curated view for fast situational awareness during incidents.',
    references: [REF_DASHBOARDS, REF_MONITORING]
  },

  // ── Optimizing Service Performance (12) ──
  {
    domain: PERF, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Compute Engine construct automatically adds/removes identical VM instances based on load to match capacity to demand?',
    options: opts4(
      'A single static VM',
      'A managed instance group with autoscaling',
      'A Cloud Storage bucket',
      'A firewall rule'
    ),
    correct: ['b'],
    explanation: 'A managed instance group (MIG) with an autoscaler scales the instance count based on metrics like CPU or load-balancing utilization, aligning capacity with demand.',
    references: [REF_MIG, REF_AUTOSCALER]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'On GKE, your Deployment’s Pods are CPU-saturated during peaks. Which object scales replica count to demand?',
    options: opts4(
      'StatefulSet only',
      'HorizontalPodAutoscaler',
      'PersistentVolumeClaim',
      'NetworkPolicy'
    ),
    correct: ['b'],
    explanation: 'The HorizontalPodAutoscaler adjusts the number of Pod replicas based on CPU or other metrics, increasing capacity during peaks and reducing it when idle.',
    references: [REF_HPA, REF_GKE]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'High origin load and global user latency for cacheable content can be reduced by:',
    options: opts4(
      'Adding more logging',
      'Enabling Cloud CDN in front of the backend so content is cached at edge locations',
      'Lowering the SLO',
      'Disabling autoscaling'
    ),
    correct: ['b'],
    explanation: 'Cloud CDN caches cacheable responses at Google’s edge near users, cutting latency and reducing repeated origin load behind the external HTTP(S) load balancer.',
    references: [REF_CDN, REF_LB]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'Pods scaled by HPA remain Pending because nodes lack capacity. The correct GKE remedy is:',
    options: opts4(
      'Increase Pod CPU limits',
      'Enable the Cluster Autoscaler so the node pool grows when Pods are unschedulable',
      'Delete the HPA',
      'Add a Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'The Cluster Autoscaler provisions additional nodes when Pods cannot be scheduled and removes idle nodes later, complementing HPA which only scales Pods.',
    references: [REF_GKE_AUTOSCALE, REF_HPA]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'A read-heavy Cloud SQL workload saturates the primary. The least-disruptive performance improvement is to:',
    options: opts4(
      'Remove all indexes',
      'Add read replicas and direct read queries to them',
      'Disable point-in-time recovery',
      'Reduce backup frequency'
    ),
    correct: ['b'],
    explanation: 'Read replicas scale read capacity by serving read traffic off the primary; this improves read performance without rearchitecting the application or harming durability features.',
    references: [REF_CLOUDSQL]
  },
  {
    domain: PERF, difficulty: 4, type: QType.SINGLE,
    stem: 'You must find why P99 latency degrades only under production load. The most effective diagnostic combination is:',
    options: opts4(
      'Read code and guess',
      'Cloud Trace to find the slow span/service, then Cloud Profiler to find the hot code there',
      'Raise the SLO target',
      'Add print statements only'
    ),
    correct: ['b'],
    explanation: 'Cloud Trace localizes which span/service drives tail latency; Cloud Profiler then identifies the resource-heavy code within that service, giving a data-driven root cause.',
    references: [REF_TRACE, REF_PROFILER]
  },
  {
    domain: PERF, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL approaches that improve performance/cost efficiency.',
    options: opts4(
      'Right-size resource requests/limits from observed usage',
      'Autoscale (HPA/MIG) based on real demand signals',
      'Permanently provision for 10x peak by default',
      'Cache cacheable content at the edge with Cloud CDN'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Right-sizing, demand-based autoscaling, and edge caching all improve the performance-to-cost ratio. Default 10x over-provisioning wastes resources without proportional benefit.',
    references: [REF_GKE_OPTIMIZE, REF_CDN, REF_AUTOSCALER]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'Before a high-traffic launch you must validate the system sustains projected peak within latency SLOs. You should:',
    options: opts4(
      'Skip testing and scale reactively',
      'Run a representative distributed load test and observe SLIs/SLOs and saturation',
      'Only run unit tests',
      'Assume vertical scaling will suffice'
    ),
    correct: ['b'],
    explanation: 'A representative distributed load test validates capacity and SLO compliance at projected peak and exposes bottlenecks before customers are impacted.',
    references: [REF_LOADTEST, REF_PERF]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'A Cloud Run service’s tail latency spikes due to cold starts during traffic bursts. The most direct mitigation is:',
    options: opts4(
      'Remove the concurrency setting',
      'Configure a minimum number of instances to keep warm capacity',
      'Disable request logging',
      'Switch to a single instance'
    ),
    correct: ['b'],
    explanation: 'Configuring minimum instances keeps warm instances ready, reducing cold starts and improving tail latency for bursty Cloud Run traffic.',
    references: [REF_RUN, REF_PERF]
  },
  {
    domain: PERF, difficulty: 2, type: QType.SINGLE,
    stem: 'For a CPU-bound stateless service, the most appropriate autoscaling signal is:',
    options: opts4(
      'Number of log lines',
      'Average CPU utilization or request load across instances',
      'Boot disk size',
      'Number of IAM bindings'
    ),
    correct: ['b'],
    explanation: 'CPU utilization or request load reflects real demand for a CPU-bound stateless service, making it the right autoscaling signal; unrelated metrics do not track load.',
    references: [REF_AUTOSCALER, REF_HPA]
  },
  {
    domain: PERF, difficulty: 4, type: QType.SINGLE,
    stem: 'Tail latency briefly degrades whenever the Cluster Autoscaler must add nodes because node provisioning is slow. Which approach reduces this?',
    options: opts4(
      'Turn off the Cluster Autoscaler',
      'Keep buffer capacity using low-priority placeholder Pods that are preempted when real workloads need resources',
      'Remove resource requests',
      'Use one very large node only'
    ),
    correct: ['b'],
    explanation: 'Low-priority "balloon" Pods reserve buffer capacity that real workloads can immediately preempt, so bursts are absorbed without waiting for the autoscaler to provision new nodes.',
    references: [REF_GKE_AUTOSCALE, REF_GKE_OPTIMIZE]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'Which describes the Architecture Framework’s view of performance optimization?',
    options: opts4(
      'A one-time tuning at launch',
      'A continuous cycle: measure against SLOs, find bottlenecks via telemetry, apply targeted changes, re-measure',
      'Only buying bigger machines',
      'Solely reacting to support tickets'
    ),
    correct: ['b'],
    explanation: 'The Architecture Framework frames performance optimization as an ongoing, telemetry-driven loop tied to SLOs rather than a single launch-time activity.',
    references: [REF_PERF, REF_RELIABILITY]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Bootstrapping and Managing a Google Cloud Organization (12) ──
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must restrict resource creation to specific regions for an entire department’s projects, including projects created later. Which control should you apply on the department’s folder?',
    options: opts4(
      'A label on each project',
      'An organization policy constraint for resource locations on the folder',
      'A firewall rule',
      'A custom IAM role'
    ),
    correct: ['b'],
    explanation: 'A resource-location organization policy constraint set on the folder is inherited by all current and future projects beneath it, enforcing allowed regions; labels and IAM roles cannot enforce configuration constraints.',
    references: [REF_ORGPOLICY, REF_RESMGR]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'Multiple engineers run terraform apply against the same shared state and occasionally corrupt it. Which fix addresses the root cause?',
    options: opts4(
      'Tell engineers to coordinate over chat',
      'Use a remote GCS backend that provides state locking so concurrent applies are serialized',
      'Commit state to Git more often',
      'Switch to manual console changes'
    ),
    correct: ['b'],
    explanation: 'The GCS backend serializes access with state locking, preventing concurrent applies from corrupting shared state — a structural fix rather than relying on manual coordination.',
    references: [REF_TERRAFORM]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'A deploy service account currently has roles/editor project-wide. To follow least privilege you should:',
    options: opts4(
      'Upgrade it to roles/owner',
      'Scope it to only the specific roles its automation needs',
      'Use a personal user account instead',
      'Disable IAM auditing'
    ),
    correct: ['b'],
    explanation: 'Least privilege requires granting only the specific permissions/roles the automation needs, reducing the blast radius if the identity is compromised; broad editor/owner does the opposite.',
    references: [REF_IAM_BEST, REF_IAM]
  },
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which managed Google Cloud service runs your Terraform configurations and manages their state for you?',
    options: opts4(
      'Cloud Deploy',
      'Infrastructure Manager',
      'Cloud Build triggers',
      'Cloud DNS'
    ),
    correct: ['b'],
    explanation: 'Infrastructure Manager executes Terraform configurations as a managed service and maintains their state, so you do not run or host Terraform yourself.',
    references: [REF_INFRAMGR, REF_TERRAFORM]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'An off-cloud GitLab pipeline must deploy to Google Cloud with no exported keys. The recommended mechanism is:',
    options: opts4(
      'A shared static API key',
      'Workload Identity Federation trusting GitLab’s OIDC and minting short-lived credentials',
      'A user password in CI variables',
      'Public unauthenticated deploy endpoints'
    ),
    correct: ['b'],
    explanation: 'Workload Identity Federation lets the external pipeline exchange its OIDC token for short-lived Google Cloud credentials, eliminating long-lived exported service account keys.',
    references: [REF_WIF, REF_SA]
  },
  {
    domain: BOOT, difficulty: 4, type: QType.SINGLE,
    stem: 'Auditors require that protected datasets cannot be accessed from outside an approved network/project boundary, regardless of IAM. Which control provides this boundary?',
    options: opts4(
      'IAM conditions only',
      'A VPC Service Controls perimeter around the protected projects',
      'An org policy on machine types',
      'A budget alert'
    ),
    correct: ['b'],
    explanation: 'VPC Service Controls create a perimeter that constrains access to protected services to approved networks/projects, providing exfiltration protection beyond IAM alone.',
    references: [REF_VPCSC]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'New projects fail to create because the principal lacks the right permission at the target folder. Which role enables creating projects in that folder?',
    options: opts4(
      'roles/viewer',
      'roles/resourcemanager.projectCreator on the folder',
      'roles/storage.admin',
      'roles/monitoring.viewer'
    ),
    correct: ['b'],
    explanation: 'roles/resourcemanager.projectCreator scoped to the folder grants the ability to create projects within it, applying least privilege rather than broad administrative roles.',
    references: [REF_IAM, REF_PROJECTS]
  },
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is true about IAM inheritance in the resource hierarchy?',
    options: opts4(
      'Project IAM does not affect contained resources',
      'A role granted at a folder applies to all projects and resources beneath it',
      'IAM is only evaluated at the organization node',
      'Bindings must be duplicated on every resource manually'
    ),
    correct: ['b'],
    explanation: 'IAM policies are inherited down the hierarchy, so a binding at a folder is effective for all descendant projects and resources; you do not duplicate bindings per resource.',
    references: [REF_RESMGR, REF_IAM]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'Deployments fail intermittently because a regional CPU quota is exhausted. The supported remediation is to:',
    options: opts4(
      'Create many projects to multiply quota as the normal pattern',
      'Request an increase for that specific quota and region',
      'Retry indefinitely without changes',
      'Move workloads to an unsupported region'
    ),
    correct: ['b'],
    explanation: 'Quota increase requests are the supported way to obtain more capacity for a specific quota/region; project-sprawl to dodge quotas is an anti-pattern.',
    references: [REF_QUOTAS]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements aligned with secure organization bootstrapping.',
    options: opts4(
      'Avoid exported service account keys; prefer federation or attached service accounts',
      'Codify the foundation as version-controlled IaC',
      'Grant broad Owner at the org to speed delivery',
      'Use folders and org policies for inherited governance'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Avoiding exported keys, IaC-codified foundations, and folder/org-policy governance follow best practice; broad org-level Owner contradicts least privilege and widens blast radius.',
    references: [REF_IAM_BEST, REF_TERRAFORM, REF_ORGPOLICY]
  },
  {
    domain: BOOT, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is a dedicated bootstrap project commonly used when building a Google Cloud foundation with Terraform?',
    options: opts4(
      'It enables free networking',
      'It isolates the privileged automation identity and Terraform state, containing their blast radius',
      'It is required to use Cloud Monitoring',
      'It disables organization policies'
    ),
    correct: ['b'],
    explanation: 'A bootstrap project isolates the high-privilege automation service account and the foundation Terraform state from workloads, limiting the impact if that powerful identity is compromised.',
    references: [REF_LANDINGZONE, REF_TERRAFORM]
  },
  {
    domain: BOOT, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the most reproducible way to ensure required APIs are enabled for a Terraform-provisioned project?',
    options: opts4(
      'Manually enable each API in the console after apply',
      'Include google_project_service resources in the Terraform configuration',
      'Open a support case per API',
      'Assume all APIs are pre-enabled'
    ),
    correct: ['b'],
    explanation: 'Declaring google_project_service in the same Terraform makes API enablement reproducible and part of the project bootstrap, avoiding manual drift.',
    references: [REF_TERRAFORM, REF_PROJECTS]
  },

  // ── Building and Implementing CI/CD Pipelines (14) ──
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which managed service builds your container images and runs test/build steps from a configuration file in your repo?',
    options: opts4(
      'Cloud Deploy',
      'Cloud Build',
      'Cloud Monitoring',
      'Artifact Registry'
    ),
    correct: ['b'],
    explanation: 'Cloud Build executes build and test steps defined in cloudbuild.yaml and can produce container images; Cloud Deploy then handles progressive delivery of those artifacts.',
    references: [REF_BUILD, REF_BUILD_CONFIG]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'You want builds to start automatically when a Git tag matching v*.*.* is pushed. What do you configure?',
    options: opts4(
      'A Cloud Scheduler cron job',
      'A Cloud Build trigger with a tag filter matching the version pattern',
      'An uptime check',
      'A manual gcloud builds submit'
    ),
    correct: ['b'],
    explanation: 'Cloud Build triggers support tag filters, so a trigger configured for tag pushes matching the version regex builds automatically on release tags.',
    references: [REF_BUILD_TRIGGERS]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Production GKE must only run images that have a valid attestation from your verified pipeline. Which service enforces this at admission?',
    options: opts4(
      'Cloud Armor',
      'Binary Authorization',
      'Cloud CDN',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'Binary Authorization enforces deploy-time policy that admits only images carrying required attestations, blocking unverified images from running in production.',
    references: [REF_BINAUTH, REF_SLSA]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Where should release artifacts be stored so Cloud Deploy promotes the exact same immutable image across environments?',
    options: opts4(
      'A developer’s machine',
      'Artifact Registry, referenced by digest/version',
      'Email attachments',
      'A scratch Cloud Storage folder deleted nightly'
    ),
    correct: ['b'],
    explanation: 'Storing images in Artifact Registry and referencing them by digest/version ensures the identical artifact is promoted unchanged through dev/staging/prod, enabling reproducibility and rollback.',
    references: [REF_ARTIFACT, REF_DEPLOY]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'In a Cloud Deploy delivery pipeline, how do you require a person to authorize the production rollout?',
    options: opts4(
      'Add a manual SSH step',
      'Mark the production target as requiring approval',
      'Use a longer timeout',
      'Add a Cloud Function notification only'
    ),
    correct: ['b'],
    explanation: 'Configuring the production target to require approval pauses the rollout until an authorized user approves the promotion, providing a controlled gate.',
    references: [REF_DEPLOY_APPROVAL, REF_DEPLOY_PROGRESSION]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'You want progressive exposure: 10% of traffic, verify, then full, automated by the delivery tool. Which Cloud Deploy strategy?',
    options: opts4(
      'Recreate',
      'Canary deployment with percentage phases and verification',
      'Manual blue/green via DNS',
      'Nightly full redeploy'
    ),
    correct: ['b'],
    explanation: 'Cloud Deploy’s canary strategy shifts traffic in defined percentage phases with optional verification before progressing, matching the progressive-exposure requirement.',
    references: [REF_DEPLOY_CANARY]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'Cloud Deploy relies on which tool to render and deploy per-target Kubernetes manifests?',
    options: opts4(
      'Ansible',
      'Skaffold',
      'Packer',
      'Chef'
    ),
    correct: ['b'],
    explanation: 'Cloud Deploy uses Skaffold to render manifests for each target and to deploy and verify releases, which is why skaffold.yaml is part of the configuration.',
    references: [REF_SKAFFOLD, REF_DEPLOY]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'Your Cloud Build jobs need to reach an internal service that has only private IPs. Which capability enables this?',
    options: opts4(
      'Default public pool only',
      'Cloud Build private pools attached to your VPC',
      'A bigger machine type on the default pool',
      'Disabling the build VPC'
    ),
    correct: ['b'],
    explanation: 'Cloud Build private pools run in a peered, Google-managed environment connected to your VPC, allowing builds to access private-IP internal services.',
    references: [REF_BUILD_PRIVATEPOOL]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'Why reference images by digest rather than a moving tag in deployment manifests?',
    options: opts4(
      'Digests download faster',
      'A digest pins the exact immutable image, ensuring reproducible deploys and reliable rollback',
      'Digests are required for IAM',
      'Tags are not allowed by Kubernetes'
    ),
    correct: ['b'],
    explanation: 'A digest uniquely identifies the exact image content; pinning to it guarantees the deployed bits match what was tested and that rollback redeploys a known artifact.',
    references: [REF_ARTIFACT, REF_DEPLOY]
  },
  {
    domain: CICD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL good practices for a secure, reliable delivery pipeline on Google Cloud.',
    options: opts4(
      'Generate and verify build provenance/attestations',
      'Use least-privilege service accounts per pipeline stage',
      'Deploy untested commits straight to prod for speed',
      'Promote immutable, versioned artifacts through environments'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Provenance/attestation verification, least-privilege stage identities, and immutable artifact promotion all harden delivery. Shipping untested commits directly to prod removes essential safety.',
    references: [REF_SLSA, REF_IAM_BEST, REF_DEPLOY]
  },
  {
    domain: CICD, difficulty: 2, type: QType.SINGLE,
    stem: 'In cloudbuild.yaml, which mechanism parameterizes values like the image tag without editing the file?',
    options: opts4(
      'images',
      'substitutions (and substitution variables)',
      'timeout',
      'artifacts only'
    ),
    correct: ['b'],
    explanation: 'Cloud Build substitutions let you parameterize the build (e.g., $COMMIT_SHA, user-defined variables) so the same config produces builds with different inputs without editing steps.',
    references: [REF_BUILD_CONFIG]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'You want failing unit tests to stop a release from ever being created. The correct pattern is:',
    options: opts4(
      'Run tests only in production',
      'Add a test build step before artifact creation; a failure exits non-zero and aborts the build',
      'Log failures and continue',
      'Disable tests in CI'
    ),
    correct: ['b'],
    explanation: 'A test step that exits non-zero on failure aborts the Cloud Build run before producing an artifact, preventing a broken release from progressing.',
    references: [REF_BUILD, REF_BUILD_CONFIG]
  },
  {
    domain: CICD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which combination produces verifiable supply-chain integrity from build to deploy?',
    options: opts4(
      'Cloud DNS + Cloud CDN',
      'Cloud Build provenance/attestations enforced by Binary Authorization',
      'Cloud NAT + Cloud Armor',
      'Cloud Trace + Cloud Profiler'
    ),
    correct: ['b'],
    explanation: 'Cloud Build can emit SLSA-aligned provenance/attestations, and Binary Authorization enforces that only images with valid attestations are deployed, providing end-to-end integrity.',
    references: [REF_SLSA, REF_BINAUTH]
  },
  {
    domain: CICD, difficulty: 4, type: QType.SINGLE,
    stem: 'A critical service needs minimal-risk rollback after a bad Cloud Deploy release. Which design enables that best?',
    options: opts4(
      'Edit live manifests by hand during the incident',
      'Roll back to a prior versioned, immutable release stored in Artifact Registry',
      'Rebuild from the latest tag during the incident',
      'Recreate the cluster from scratch'
    ),
    correct: ['b'],
    explanation: 'Versioned, immutable Cloud Deploy releases let you roll back by redeploying a known-good prior release quickly and predictably, unlike error-prone live edits or rebuilding from mutable tags.',
    references: [REF_DEPLOY, REF_ARTIFACT]
  },

  // ── Applying Site Reliability Engineering Practices (14) ──
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which best describes a Service Level Objective (SLO)?',
    options: opts4(
      'A legal contract with penalties',
      'A target value or range for an SLI that the service aims to meet',
      'A dashboard widget',
      'The number of on-call engineers'
    ),
    correct: ['b'],
    explanation: 'An SLO is the target (or range) for an SLI that the service aims to achieve, e.g., 99.9% of requests succeed. The contractual promise is the SLA.',
    references: [REF_SRE, REF_SLO]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'With the error budget for the month already exhausted, what is the SRE-recommended action?',
    options: opts4(
      'Ship more features faster',
      'Prioritize reliability work and pause risky launches until the budget recovers',
      'Delete the SLO',
      'Increase the SLA penalty'
    ),
    correct: ['b'],
    explanation: 'Exhausting the error budget triggers the error-budget policy: slow/halt risky changes and invest in reliability until the service is back within objective.',
    references: [REF_ERRORBUDGET, REF_SRE_WORKBOOK]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which characteristic is NOT part of the SRE definition of toil?',
    options: opts4(
      'Manual and repetitive',
      'Automatable',
      'Enduring engineering value that improves the system long-term',
      'Scales linearly with service growth'
    ),
    correct: ['c'],
    explanation: 'Toil is manual, repetitive, automatable, and scales with growth, with no enduring value. Work that creates lasting engineering value is, by definition, not toil.',
    references: [REF_TOIL]
  },
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The core purpose of a blameless postmortem is to:',
    options: opts4(
      'Find someone to blame',
      'Learn from failure by analyzing systemic causes and committing to preventive actions',
      'Close the ticket',
      'Avoid telling customers'
    ),
    correct: ['b'],
    explanation: 'Blameless postmortems focus on systemic causes and concrete preventive actions, encouraging the candor needed to actually prevent recurrence.',
    references: [REF_POSTMORTEM]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'The Incident Commander’s primary responsibility during a major incident is to:',
    options: opts4(
      'Personally write all the code fixes',
      'Coordinate the response, delegate roles, and maintain a clear command structure',
      'Handle billing',
      'Author the postmortem solo'
    ),
    correct: ['b'],
    explanation: 'The Incident Commander coordinates the overall response and delegates operational and communications roles, ensuring a clear, non-chaotic command structure.',
    references: [REF_INCIDENT, REF_ONCALL]
  },
  {
    domain: SRE, difficulty: 4, type: QType.SINGLE,
    stem: 'To page fast on severe outages but only ticket on slow degradation against an SLO, you should implement:',
    options: opts4(
      'A single fixed-count alert',
      'Multi-window, multi-burn-rate SLO alerting with differentiated severities',
      'Paging on every error',
      'No alerting'
    ),
    correct: ['b'],
    explanation: 'Multi-window multi-burn-rate alerting pages quickly for fast error-budget burn and raises lower-severity tickets for slow burn, balancing responsiveness and noise.',
    references: [REF_SLO, REF_SRE_WORKBOOK]
  },
  {
    domain: SRE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about error budgets and SLOs.',
    options: opts4(
      'The error budget equals 100% minus the SLO over the window',
      'Exhausting the budget should change team behavior per the error-budget policy',
      'SLOs should always be 100%',
      'SLOs should be grounded in user needs'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Error budget = 1 − SLO; exhaustion triggers policy actions; SLOs should reflect user needs. Always-100% SLOs are impractical and leave no error budget.',
    references: [REF_ERRORBUDGET, REF_SRE]
  },
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the strongest example of an availability SLI?',
    options: opts4(
      'Lines of code shipped',
      'The ratio of successful requests to total valid requests over a window',
      'Number of meetings held',
      'Count of dashboards'
    ),
    correct: ['b'],
    explanation: 'Availability is well represented by the ratio of successful to total valid requests over a measurement window — a user-relevant, measurable indicator.',
    references: [REF_SLO, REF_SRE]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'Constant non-actionable paging is harming the on-call team. SRE recommends:',
    options: opts4(
      'Ignoring pages outside business hours',
      'Improving alert quality so pages are actionable and symptom-based, and monitoring on-call load',
      'Tripling rotation size regardless of alert quality',
      'Removing monitoring'
    ),
    correct: ['b'],
    explanation: 'SRE prioritizes actionable, symptom-based alerts and explicitly tracks on-call load and alert quality so pages remain meaningful and sustainable.',
    references: [REF_ONCALL, REF_SLO]
  },
  {
    domain: SRE, difficulty: 4, type: QType.SINGLE,
    stem: 'A service must recover from a regional outage within minutes (low RTO). Which design meets this?',
    options: opts4(
      'Single-region with nightly backups',
      'Multi-region active-active/warm standby with automated, tested failover',
      'A larger instance in one zone',
      'Manual rebuild from a wiki'
    ),
    correct: ['b'],
    explanation: 'A minutes-level RTO across a regional failure requires multi-region redundancy with automated, regularly tested failover; single-region or manual recovery cannot meet it.',
    references: [REF_DR, REF_RELIABILITY]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'A useful postmortem should primarily produce:',
    options: opts4(
      'A list of people at fault',
      'A clear timeline, impact, contributing causes, and tracked preventive action items',
      'A marketing summary',
      'An SLA reduction'
    ),
    correct: ['b'],
    explanation: 'Good postmortems document the timeline, impact, contributing causes, and owned, tracked action items so recurrence is prevented — they are learning, not blame, artifacts.',
    references: [REF_POSTMORTEM]
  },
  {
    domain: SRE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why should an SLO usually be less than 100%?',
    options: opts4(
      'Because users want downtime',
      'Because 100% leaves no error budget for change/maintenance and exceeds real user needs and cost-effectiveness',
      'Because Google forbids 100%',
      'Because monitoring rounds down'
    ),
    correct: ['b'],
    explanation: 'A sub-100% SLO preserves an error budget for change and maintenance and aligns reliability with actual user needs and cost, which a 100% target cannot.',
    references: [REF_ERRORBUDGET, REF_SRE]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'A weekly manual failover-test procedure grows as the fleet grows. The SRE-aligned response is to:',
    options: opts4(
      'Accept the growing manual effort',
      'Automate the procedure to remove the linearly scaling toil',
      'Stop testing failover',
      'Page more often'
    ),
    correct: ['b'],
    explanation: 'Toil that scales with the fleet should be automated so engineering effort does not grow linearly with size, while still preserving the value of regular failover testing.',
    references: [REF_TOIL, REF_SRE_WORKBOOK]
  },
  {
    domain: SRE, difficulty: 3, type: QType.SINGLE,
    stem: 'How do error budgets help resolve the classic dev-vs-ops tension over release speed?',
    options: opts4(
      'By banning releases entirely',
      'By providing an objective, shared rule: release while budget remains, focus on reliability when it is spent',
      'By giving ops veto over all features permanently',
      'By eliminating SLOs'
    ),
    correct: ['b'],
    explanation: 'Error budgets convert a subjective argument into a shared, data-driven policy that balances feature velocity with reliability, aligning dev and ops.',
    references: [REF_ERRORBUDGET, REF_SRE]
  },

  // ── Implementing Observability (13) ──
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Google Cloud product is used to define alerting policies and notification channels on metrics?',
    options: opts4(
      'Cloud Profiler',
      'Cloud Monitoring',
      'Artifact Registry',
      'Cloud Source Repositories'
    ),
    correct: ['b'],
    explanation: 'Cloud Monitoring is where you define alerting policies (conditions on metrics) and the notification channels that deliver alerts. Cloud Profiler is for code resource profiling.',
    references: [REF_ALERTING, REF_MONITORING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You must retain security logs for years and analyze them with SQL. The recommended pipeline is:',
    options: opts4(
      'Keep them only in the default _Default bucket',
      'Use a Log Router sink filtering security logs to BigQuery',
      'Screenshot the logs',
      'Send them to Cloud Trace'
    ),
    correct: ['b'],
    explanation: 'A Log Router sink to BigQuery enables long-term retention and SQL analysis of selected logs (e.g., security/audit), which the default short-retention bucket cannot provide.',
    references: [REF_LOG_ROUTER, REF_LOGGING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A user transaction is slow across several services. To attribute latency per service you should use:',
    options: opts4(
      'Cloud Profiler',
      'Cloud Trace',
      'Cloud Billing',
      'Organization Policy'
    ),
    correct: ['b'],
    explanation: 'Cloud Trace shows distributed traces with per-span latency, letting you identify which service in the request path contributes most to total latency.',
    references: [REF_TRACE]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'To find the specific functions consuming the most memory in a long-running production service with minimal overhead, use:',
    options: opts4(
      'Cloud Trace',
      'Cloud Profiler',
      'Cloud Scheduler',
      'Cloud DNS'
    ),
    correct: ['b'],
    explanation: 'Cloud Profiler continuously and cheaply profiles CPU and memory in production, pinpointing the functions consuming the most resources.',
    references: [REF_PROFILER]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component decides, via filters and sinks, where ingested log entries are stored or exported?',
    options: opts4(
      'The HPA',
      'The Log Router',
      'Cloud CDN',
      'A managed instance group'
    ),
    correct: ['b'],
    explanation: 'The Log Router applies inclusion/exclusion filters and sinks to route logs to destinations such as logging buckets, BigQuery, Pub/Sub, or Cloud Storage.',
    references: [REF_LOG_ROUTER, REF_LOGGING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'To alert when a specific exception string appears more than N times per minute in logs, you should:',
    options: opts4(
      'Create an uptime check',
      'Create a log-based metric matching the exception and an alerting policy on its rate',
      'Increase the trace sampling rate',
      'Add a Cloud Armor rule'
    ),
    correct: ['b'],
    explanation: 'A log-based metric converts matching log entries into a metric; an alerting policy on its rate fires when the exception frequency exceeds the threshold.',
    references: [REF_LOG_BASED_METRICS, REF_ALERTING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You operate many Prometheus-instrumented GKE workloads and want managed, scalable metric storage with PromQL. Choose:',
    options: opts4(
      'A single self-hosted Prometheus VM',
      'Google Cloud Managed Service for Prometheus',
      'Cloud Profiler',
      'Cloud Trace'
    ),
    correct: ['b'],
    explanation: 'Managed Service for Prometheus provides scalable, managed Prometheus-compatible metric collection, storage, and PromQL querying integrated with Cloud Monitoring.',
    references: [REF_MANAGED_PROM]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'An alerting policy that should page when CPU > 90% for 10 minutes must include:',
    options: opts4(
      'Only a chart',
      'A condition (metric, threshold, duration) and at least one notification channel',
      'A Cloud Build trigger',
      'A new folder'
    ),
    correct: ['b'],
    explanation: 'Alerting policies need a condition (metric/comparison/threshold/duration) plus notification channels to deliver the alert when the condition holds for the duration.',
    references: [REF_ALERTING, REF_MONITORING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL accurate statements about Google Cloud observability.',
    options: opts4(
      'Cloud Trace attributes latency to spans across services',
      'The Ops Agent collects metrics and logs from Compute Engine VMs',
      'Error Reporting groups and tracks recurring exceptions',
      'Cloud Profiler is primarily for synthetic endpoint checks'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Cloud Trace gives span-level latency, the Ops Agent collects VM telemetry, and Error Reporting aggregates exceptions. Synthetic endpoint checks are uptime checks, not Cloud Profiler.',
    references: [REF_TRACE, REF_OPS_AGENT, REF_ERRORREPORTING]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service surfaces a deduplicated list of application errors and whether each is new or recurring?',
    options: opts4(
      'Cloud CDN',
      'Error Reporting',
      'Cloud Interconnect',
      'Cloud DNS'
    ),
    correct: ['b'],
    explanation: 'Error Reporting aggregates and deduplicates errors from your services and indicates whether each error group is new or recurring, aiding triage.',
    references: [REF_ERRORREPORTING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to verify a public API is healthy from multiple global locations and alert on failures. The right tools are:',
    options: opts4(
      'Cloud Profiler and Cloud Trace',
      'An uptime check plus an alerting policy on its results',
      'A log sink to Pub/Sub only',
      'A managed instance group'
    ),
    correct: ['b'],
    explanation: 'Uptime checks probe endpoints from several regions on a schedule; an alerting policy on the uptime-check results notifies the team when availability degrades.',
    references: [REF_UPTIME, REF_ALERTING]
  },
  {
    domain: OBS, difficulty: 4, type: QType.SINGLE,
    stem: 'You want to define a request-based availability SLO (good/total) and visualize burn in Cloud Monitoring. Which capabilities are appropriate?',
    options: opts4(
      'Only static numeric thresholds',
      'Request-based SLOs and Monitoring Query Language for ratio computations',
      'Cloud Trace sampling configuration',
      'Artifact Registry cleanup policies'
    ),
    correct: ['b'],
    explanation: 'Cloud Monitoring SLOs support request-based good/total definitions, and MQL can express the ratio and burn computations for visualization and alerting.',
    references: [REF_SLO, REF_MQL]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'During an incident, responders need one consolidated view of latency, traffic, errors, and saturation. You should provide:',
    options: opts4(
      'A spreadsheet updated manually',
      'A Cloud Monitoring dashboard with the golden-signal charts',
      'A new billing account',
      'A VPC peering'
    ),
    correct: ['b'],
    explanation: 'A Cloud Monitoring dashboard curates the golden-signal charts into one screen so responders can quickly assess service health during incidents.',
    references: [REF_DASHBOARDS, REF_MONITORING]
  },

  // ── Optimizing Service Performance (12) ──
  {
    domain: PERF, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which GKE feature scales the number of Pod replicas based on observed CPU or custom metrics?',
    options: opts4(
      'Cluster Autoscaler',
      'Horizontal Pod Autoscaler',
      'PersistentVolume',
      'NetworkPolicy'
    ),
    correct: ['b'],
    explanation: 'The Horizontal Pod Autoscaler scales replica count based on metrics like CPU; the Cluster Autoscaler scales nodes, not Pods.',
    references: [REF_HPA, REF_GKE]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'After HPA increases replicas, Pods are Pending due to no node capacity. The fix is to enable:',
    options: opts4(
      'Cloud CDN',
      'The GKE Cluster Autoscaler so nodes are added when Pods are unschedulable',
      'A larger Service object',
      'A new VPC'
    ),
    correct: ['b'],
    explanation: 'The Cluster Autoscaler adds nodes when Pods cannot be scheduled and removes them when idle, complementing the HPA which only adjusts Pod count.',
    references: [REF_GKE_AUTOSCALE, REF_HPA]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'To reduce global latency and origin load for static, cacheable assets, you should:',
    options: opts4(
      'Add more replicas only',
      'Enable Cloud CDN in front of the load-balanced backend',
      'Increase log retention',
      'Lower the SLO'
    ),
    correct: ['b'],
    explanation: 'Cloud CDN caches cacheable content at edge locations close to users, reducing latency and offloading repeated requests from the origin behind the external load balancer.',
    references: [REF_CDN, REF_LB]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'A Compute Engine backend is overloaded at peak and idle off-peak. The cost-and-performance-appropriate fix is:',
    options: opts4(
      'One permanently huge VM',
      'A managed instance group with autoscaling on load',
      'Manual daily resizing',
      'Disabling the load balancer'
    ),
    correct: ['b'],
    explanation: 'A managed instance group autoscaler scales instances with load, handling peaks while reducing waste off-peak — better than a fixed huge VM or manual resizing.',
    references: [REF_MIG, REF_AUTOSCALER]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'Read traffic overwhelms a Cloud SQL primary. The least-disruptive scaling option is:',
    options: opts4(
      'Drop indexes',
      'Add read replicas and route reads to them',
      'Disable backups',
      'Shrink the instance'
    ),
    correct: ['b'],
    explanation: 'Cloud SQL read replicas offload reads from the primary, improving read performance for read-heavy workloads without rearchitecting the app.',
    references: [REF_CLOUDSQL]
  },
  {
    domain: PERF, difficulty: 4, type: QType.SINGLE,
    stem: 'P99 latency degrades only under production load and the slow component is unknown. The best diagnostic approach is:',
    options: opts4(
      'Random code rewrites',
      'Use Cloud Trace to localize the slow span/service, then Cloud Profiler to find the hot code',
      'Increase the SLO',
      'Add logging only'
    ),
    correct: ['b'],
    explanation: 'Cloud Trace identifies which span/service drives tail latency; Cloud Profiler then pinpoints the resource-heavy code there, yielding a data-driven root cause.',
    references: [REF_TRACE, REF_PROFILER]
  },
  {
    domain: PERF, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL techniques that improve performance while controlling cost.',
    options: opts4(
      'Right-size requests/limits using observed usage',
      'Demand-based autoscaling (HPA and/or MIG autoscaler)',
      'Static over-provisioning to 10x peak everywhere',
      'Edge caching of cacheable content with Cloud CDN'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Right-sizing, demand-based autoscaling, and edge caching optimize the performance/cost ratio. Blanket 10x over-provisioning wastes money without proportional benefit.',
    references: [REF_GKE_OPTIMIZE, REF_AUTOSCALER, REF_CDN]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'To confirm the system meets latency SLOs at projected peak before a launch, you should:',
    options: opts4(
      'Rely on production traffic to find limits',
      'Run a representative distributed load test and observe SLOs and saturation',
      'Only run unit tests',
      'Assume bigger machines will handle it'
    ),
    correct: ['b'],
    explanation: 'A representative distributed load test validates SLO compliance at projected peak and reveals saturation points before real users are affected.',
    references: [REF_LOADTEST, REF_PERF]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'Cloud Run cold starts spike tail latency under bursts. The most direct mitigation is to:',
    options: opts4(
      'Disable concurrency',
      'Set a minimum number of instances to keep warm capacity ready',
      'Turn off logging',
      'Use one instance only'
    ),
    correct: ['b'],
    explanation: 'Configuring minimum instances keeps warm Cloud Run instances available, reducing cold-start frequency and improving tail latency under bursty load.',
    references: [REF_RUN, REF_PERF]
  },
  {
    domain: PERF, difficulty: 2, type: QType.SINGLE,
    stem: 'The most appropriate autoscaling signal for a CPU-bound stateless API is:',
    options: opts4(
      'Number of open files',
      'Average CPU utilization or request load',
      'Disk size',
      'Number of IAM roles'
    ),
    correct: ['b'],
    explanation: 'CPU utilization or request load reflects real demand for a CPU-bound stateless API and is the appropriate autoscaling signal; unrelated metrics do not track load.',
    references: [REF_AUTOSCALER, REF_HPA]
  },
  {
    domain: PERF, difficulty: 4, type: QType.SINGLE,
    stem: 'Tail latency briefly worsens during Cluster Autoscaler scale-up because new nodes take time to provision. A good mitigation is to:',
    options: opts4(
      'Disable autoscaling',
      'Reserve buffer capacity with low-priority placeholder Pods that real workloads can preempt instantly',
      'Remove all resource requests',
      'Use a single oversized node'
    ),
    correct: ['b'],
    explanation: 'Low-priority "balloon" Pods hold buffer capacity that real workloads preempt immediately, absorbing bursts while the autoscaler provisions more nodes, reducing scale-up tail latency.',
    references: [REF_GKE_AUTOSCALE, REF_GKE_OPTIMIZE]
  },
  {
    domain: PERF, difficulty: 3, type: QType.SINGLE,
    stem: 'According to the Architecture Framework, performance optimization should be:',
    options: opts4(
      'A single launch-day task',
      'A continuous loop of measuring against SLOs, finding bottlenecks via telemetry, applying changes, and re-measuring',
      'Achieved only by buying bigger machines',
      'Driven solely by customer complaints'
    ),
    correct: ['b'],
    explanation: 'The Architecture Framework treats performance optimization as a continuous, telemetry-driven cycle tied to SLOs, not a one-time launch activity.',
    references: [REF_PERF, REF_RELIABILITY]
  }
];

const GCP_PCDOE_DOMAINS = [
  { name: BOOT, weight: 18 },
  { name: CICD, weight: 22 },
  { name: SRE, weight: 22 },
  { name: OBS, weight: 20 },
  { name: PERF, weight: 18 }
];

const GCP_PCDOE_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'google-professional-cloud-devops-engineer-p1',
    code: 'GCP-PCDOE-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 120-minute, 65-question, blueprint-weighted set covering organization bootstrapping, CI/CD pipelines, SRE practices, observability, and service performance optimization.',
    questions: P1
  },
  {
    slug: 'google-professional-cloud-devops-engineer-p2',
    code: 'GCP-PCDOE-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'google-professional-cloud-devops-engineer-p3',
    code: 'GCP-PCDOE-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const GCP_PCDOE_BUNDLE = {
  slug: 'google-professional-cloud-devops-engineer',
  title: 'Google Professional Cloud DevOps Engineer',
  description: 'All 3 Google Professional Cloud DevOps Engineer practice exams in one bundle — covering organization bootstrapping, CI/CD pipelines, Site Reliability Engineering practices, observability, and service performance optimization, aligned to the official exam guide.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 20000 // USD 200 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Google Professional Cloud DevOps Engineer
 * bundle. Safe to call repeatedly — vendor / exam / bundle rows are
 * upserted, and questions tagged `generatedBy: 'manual:gcp-pcdoe-seed'`
 * are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedGcpPcdoe(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'google' } });
  await db.vendor.upsert({
    where: { slug: 'google' },
    update: { name: 'Google', description: 'Google Cloud certifications — infrastructure, data, security, networking, and the Professional Cloud DevOps Engineer credential.' },
    create: { slug: 'google', name: 'Google', description: 'Google Cloud certifications — infrastructure, data, security, networking, and the Professional Cloud DevOps Engineer credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'google' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of GCP_PCDOE_EXAMS) {
    const title = `Google Professional Cloud DevOps Engineer — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Google Cloud Professional Cloud DevOps Engineer exam guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: GCP_PCDOE_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:gcp-pcdoe-seed' } });
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
          generatedBy: 'manual:gcp-pcdoe-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: GCP_PCDOE_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: GCP_PCDOE_BUNDLE.slug },
    update: {
      title: GCP_PCDOE_BUNDLE.title,
      description: GCP_PCDOE_BUNDLE.description,
      price: GCP_PCDOE_BUNDLE.price,
      priceVoucher: GCP_PCDOE_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: GCP_PCDOE_BUNDLE.slug,
      title: GCP_PCDOE_BUNDLE.title,
      description: GCP_PCDOE_BUNDLE.description,
      price: GCP_PCDOE_BUNDLE.price,
      priceVoucher: GCP_PCDOE_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'google-professional-cloud-devops-engineer-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'google-professional-cloud-devops-engineer-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'google-professional-cloud-devops-engineer-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'google-professional-cloud-devops-engineer-p1', tier: 'VOUCHER' as const, position: 4 }
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
