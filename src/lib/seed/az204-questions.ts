/**
 * AZ-204 bundle seed — vendor (Microsoft), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:az204-seed'` and upserts catalog rows.
 *
 * Exported as `seedAz204(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/az204.ts`) and the protected
 * admin API (`/api/admin/seed-az204`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the Microsoft Azure Developer Associate (AZ-204) domain blueprint:
 *   - Develop Azure compute solutions                                   — 27% (18)
 *   - Develop for Azure storage                                         — 17% (11)
 *   - Implement Azure security                                          — 18% (12)
 *   - Monitor, troubleshoot, and optimize Azure solutions               — 13% (8)
 *   - Connect to and consume Azure services and third-party services    — 25% (16)
 *
 * These are original practice scenarios. They are NOT real exam items and
 * make no claim of being official or actual AZ-204 questions.
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

const COMPUTE = 'Develop Azure compute solutions';
const STORAGE = 'Develop for Azure storage';
const SECURITY = 'Implement Azure security';
const MONITOR = 'Monitor, troubleshoot, and optimize Azure solutions';
const CONNECT = 'Connect to and consume Azure services and third-party services';

const REF_APPSVC = { label: 'Microsoft Learn — Azure App Service overview', url: 'https://learn.microsoft.com/en-us/azure/app-service/overview' };
const REF_APPSVC_DEPLOY = { label: 'Microsoft Learn — Deployment slots in App Service', url: 'https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots' };
const REF_APPSVC_SCALE = { label: 'Microsoft Learn — Scale up an app in App Service', url: 'https://learn.microsoft.com/en-us/azure/app-service/manage-scale-up' };
const REF_APPSVC_CONFIG = { label: 'Microsoft Learn — Configure an App Service app', url: 'https://learn.microsoft.com/en-us/azure/app-service/configure-common' };
const REF_FUNC = { label: 'Microsoft Learn — Azure Functions overview', url: 'https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview' };
const REF_FUNC_TRIGGERS = { label: 'Microsoft Learn — Azure Functions triggers and bindings', url: 'https://learn.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings' };
const REF_FUNC_PLANS = { label: 'Microsoft Learn — Azure Functions hosting options', url: 'https://learn.microsoft.com/en-us/azure/azure-functions/functions-scale' };
const REF_FUNC_DURABLE = { label: 'Microsoft Learn — Durable Functions overview', url: 'https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview' };
const REF_ACI = { label: 'Microsoft Learn — Azure Container Instances overview', url: 'https://learn.microsoft.com/en-us/azure/container-instances/container-instances-overview' };
const REF_ACA = { label: 'Microsoft Learn — Azure Container Apps overview', url: 'https://learn.microsoft.com/en-us/azure/container-apps/overview' };
const REF_ACA_SCALE = { label: 'Microsoft Learn — Set scaling rules in Azure Container Apps', url: 'https://learn.microsoft.com/en-us/azure/container-apps/scale-app' };
const REF_ACR = { label: 'Microsoft Learn — Azure Container Registry introduction', url: 'https://learn.microsoft.com/en-us/azure/container-registry/container-registry-intro' };
const REF_AKS = { label: 'Microsoft Learn — Azure Kubernetes Service overview', url: 'https://learn.microsoft.com/en-us/azure/aks/what-is-aks' };
const REF_BLOB = { label: 'Microsoft Learn — Introduction to Azure Blob Storage', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction' };
const REF_BLOB_TIERS = { label: 'Microsoft Learn — Access tiers for blob data', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview' };
const REF_BLOB_LIFECYCLE = { label: 'Microsoft Learn — Optimize costs with lifecycle management', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-overview' };
const REF_BLOB_SDK = { label: 'Microsoft Learn — Azure Blob Storage client library for .NET', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-dotnet-get-started' };
const REF_BLOB_LEASE = { label: 'Microsoft Learn — Managing concurrency in Blob Storage', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/concurrency-manage' };
const REF_COSMOS = { label: 'Microsoft Learn — Welcome to Azure Cosmos DB', url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/introduction' };
const REF_COSMOS_CONSISTENCY = { label: 'Microsoft Learn — Consistency levels in Azure Cosmos DB', url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/consistency-levels' };
const REF_COSMOS_PARTITION = { label: 'Microsoft Learn — Partitioning in Azure Cosmos DB', url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/partitioning-overview' };
const REF_COSMOS_CHANGEFEED = { label: 'Microsoft Learn — Change feed in Azure Cosmos DB', url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/change-feed' };
const REF_COSMOS_RU = { label: 'Microsoft Learn — Request units in Azure Cosmos DB', url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/request-units' };
const REF_TABLE = { label: 'Microsoft Learn — Azure Table storage overview', url: 'https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-overview' };
const REF_ENTRA = { label: 'Microsoft Learn — Microsoft Entra ID overview', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/whatis' };
const REF_MSAL = { label: 'Microsoft Learn — Overview of the Microsoft Authentication Library (MSAL)', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/msal-overview' };
const REF_OAUTH = { label: 'Microsoft Learn — OAuth 2.0 and OpenID Connect protocols', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols' };
const REF_SCOPES = { label: 'Microsoft Learn — Permissions and consent in the Microsoft identity platform', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/permissions-consent-overview' };
const REF_MI = { label: 'Microsoft Learn — Managed identities for Azure resources', url: 'https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview' };
const REF_KEYVAULT = { label: 'Microsoft Learn — About Azure Key Vault', url: 'https://learn.microsoft.com/en-us/azure/key-vault/general/overview' };
const REF_KEYVAULT_SECRETS = { label: 'Microsoft Learn — About Azure Key Vault secrets', url: 'https://learn.microsoft.com/en-us/azure/key-vault/secrets/about-secrets' };
const REF_KEYVAULT_RBAC = { label: 'Microsoft Learn — Azure Key Vault RBAC vs access policy', url: 'https://learn.microsoft.com/en-us/azure/key-vault/general/rbac-guide' };
const REF_APPCONFIG = { label: 'Microsoft Learn — What is Azure App Configuration', url: 'https://learn.microsoft.com/en-us/azure/azure-app-configuration/overview' };
const REF_APPCONFIG_FEATURE = { label: 'Microsoft Learn — Manage feature flags in App Configuration', url: 'https://learn.microsoft.com/en-us/azure/azure-app-configuration/manage-feature-flags' };
const REF_SAS = { label: 'Microsoft Learn — Grant limited access to data with shared access signatures', url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview' };
const REF_RBAC = { label: 'Microsoft Learn — Azure role-based access control overview', url: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/overview' };
const REF_APPINSIGHTS = { label: 'Microsoft Learn — Application Insights overview', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview' };
const REF_APPINSIGHTS_SAMPLING = { label: 'Microsoft Learn — Sampling in Application Insights', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/app/sampling' };
const REF_MONITOR = { label: 'Microsoft Learn — Azure Monitor overview', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/overview' };
const REF_MONITOR_METRICS = { label: 'Microsoft Learn — Azure Monitor Metrics overview', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/data-platform-metrics' };
const REF_AUTOSCALE = { label: 'Microsoft Learn — Autoscale in Azure Monitor', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/autoscale/autoscale-overview' };
const REF_KQL = { label: 'Microsoft Learn — Log queries in Azure Monitor', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-query-overview' };
const REF_APIM = { label: 'Microsoft Learn — About API Management', url: 'https://learn.microsoft.com/en-us/azure/api-management/api-management-key-concepts' };
const REF_APIM_POLICIES = { label: 'Microsoft Learn — API Management policies', url: 'https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-policies' };
const REF_APIM_SUBS = { label: 'Microsoft Learn — Subscriptions in API Management', url: 'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions' };
const REF_EVENTGRID = { label: 'Microsoft Learn — What is Azure Event Grid?', url: 'https://learn.microsoft.com/en-us/azure/event-grid/overview' };
const REF_EVENTGRID_DELIVERY = { label: 'Microsoft Learn — Event Grid message delivery and retry', url: 'https://learn.microsoft.com/en-us/azure/event-grid/delivery-and-retry' };
const REF_EVENTHUBS = { label: 'Microsoft Learn — Azure Event Hubs overview', url: 'https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-about' };
const REF_EVENTHUBS_CP = { label: 'Microsoft Learn — Event Hubs features (checkpointing)', url: 'https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-features' };
const REF_SERVICEBUS = { label: 'Microsoft Learn — Azure Service Bus messaging overview', url: 'https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview' };
const REF_SB_SESSIONS = { label: 'Microsoft Learn — Message sessions in Service Bus', url: 'https://learn.microsoft.com/en-us/azure/service-bus-messaging/message-sessions' };
const REF_SB_DLQ = { label: 'Microsoft Learn — Service Bus dead-letter queues', url: 'https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dead-letter-queues' };
const REF_QUEUE = { label: 'Microsoft Learn — Azure Queue Storage introduction', url: 'https://learn.microsoft.com/en-us/azure/storage/queues/storage-queues-introduction' };
const REF_SB_VS_QUEUE = { label: 'Microsoft Learn — Storage queues and Service Bus queues compared', url: 'https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-azure-and-service-bus-queues-compared' };
const REF_GRAPH = { label: 'Microsoft Learn — Overview of Microsoft Graph', url: 'https://learn.microsoft.com/en-us/graph/overview' };
const REF_CDN = { label: 'Microsoft Learn — What is Azure CDN?', url: 'https://learn.microsoft.com/en-us/azure/cdn/cdn-overview' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Develop Azure compute solutions (18) ──
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to deploy a new version of a web app to Azure App Service so you can validate it on production infrastructure and swap it into production with no downtime. Which App Service feature should you use?',
    options: opts4(
      'A separate App Service plan in a different region',
      'Deployment slots with a slot swap',
      'Local cache configuration',
      'A WebJob running the new build'
    ),
    correct: ['b'],
    explanation: 'Deployment slots are live apps with their own hostnames; you deploy and warm up the new build in a staging slot, then swap it into production. The swap exchanges the routing with no cold start, and you can swap back if needed. Separate plans, local cache, and WebJobs do not provide a zero-downtime swap.',
    references: [REF_APPSVC_DEPLOY]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'An Azure Function processes uploaded images. Workloads are highly variable: zero traffic for hours, then thousands of files in a few minutes. You must minimize cost while scaling automatically to handle bursts. Which hosting plan is most appropriate?',
    options: opts4(
      'App Service (Dedicated) plan',
      'Consumption plan',
      'Always On enabled on a Basic plan',
      'A Virtual Machine Scale Set'
    ),
    correct: ['b'],
    explanation: 'The Consumption plan scales out automatically based on incoming events and bills only for execution time and resources used, scaling to zero when idle. A Dedicated plan bills continuously regardless of load. A VMSS is not a Functions hosting model.',
    references: [REF_FUNC_PLANS]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that are TRUE about Azure Functions triggers and bindings.',
    options: opts4(
      'Every function must have exactly one trigger.',
      'Input and output bindings are optional and a function can have multiple of each.',
      'A Blob trigger fires when a blob is created or updated in the monitored container.',
      'Bindings let a function send data to a service without writing the service SDK integration code by hand.'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'A function has exactly one trigger that defines how it is invoked. Bindings (input/output) are optional and a function may declare several. A Blob trigger responds to blob create/update events. Bindings declaratively connect to services so you avoid writing the boilerplate SDK code.',
    references: [REF_FUNC_TRIGGERS]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to run a single short-lived containerized batch job on demand with per-second billing and no cluster to manage. Which Azure service is the best fit?',
    options: opts4(
      'Azure Kubernetes Service (AKS)',
      'Azure Container Instances (ACI)',
      'Azure App Service',
      'Azure Virtual Machine'
    ),
    correct: ['b'],
    explanation: 'Azure Container Instances runs containers on demand without orchestrating or managing a cluster and bills per second, making it ideal for short-lived or burst batch jobs. AKS introduces cluster management overhead; App Service and VMs are not optimized for transient single-container jobs.',
    references: [REF_ACI]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'In Azure Container Apps you must run a long-running microservice that scales based on the number of messages in an Azure Service Bus queue, including scaling to zero when the queue is empty. What underlying technology provides this event-driven scaling?',
    options: opts4(
      'Azure Monitor autoscale rules',
      'KEDA-based scale rules',
      'A cron expression in the container',
      'App Service per-instance scaling'
    ),
    correct: ['b'],
    explanation: 'Azure Container Apps uses KEDA (Kubernetes Event-driven Autoscaling) scalers for event-driven scale rules, including queue-length scalers that can scale the app to zero. Azure Monitor autoscale applies to VMSS/App Service, not Container Apps scale rules.',
    references: [REF_ACA_SCALE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service is a managed private Docker registry used to store and manage container images for your deployments?',
    options: opts4(
      'Azure Container Registry (ACR)',
      'Azure Artifacts',
      'Azure Blob Storage',
      'Azure Container Instances'
    ),
    correct: ['a'],
    explanation: 'Azure Container Registry is a managed, private OCI/Docker registry for storing and managing container images and related artifacts. Azure Artifacts is for packages (NuGet/npm/etc.), Blob Storage is generic object storage, and ACI runs containers but is not a registry.',
    references: [REF_ACR]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must implement a stateful, long-running order-fulfillment workflow in Azure Functions that fans out to parallel activities, then aggregates results, and survives process recycling. Which approach should you use?',
    options: opts4(
      'A single HTTP-triggered function with a long loop',
      'Durable Functions using the orchestrator and activity function pattern',
      'Multiple unrelated timer-triggered functions',
      'A Logic App connector inside the function'
    ),
    correct: ['b'],
    explanation: 'Durable Functions provides orchestrator functions that reliably coordinate stateful workflows, including fan-out/fan-in, and checkpoint state so execution survives restarts. A long-running HTTP function risks timeouts and loses state on recycling.',
    references: [REF_FUNC_DURABLE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Azure App Service, application settings configured in the portal are exposed to your app as environment variables and override values in your configuration files at runtime.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'App Service application settings are injected as environment variables at runtime and take precedence over values shipped in configuration files such as appsettings.json, which is why they are the recommended place for environment-specific configuration.',
    references: [REF_APPSVC_CONFIG]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'A CPU-bound App Service web app needs more cores and memory per instance. You should perform which operation?',
    options: opts4(
      'Scale out by increasing the instance count',
      'Scale up by moving to a higher pricing tier (larger SKU)',
      'Enable Always On',
      'Add a deployment slot'
    ),
    correct: ['b'],
    explanation: 'Scaling up changes the App Service plan to a larger SKU with more CPU and memory per instance, which addresses a per-instance resource bottleneck. Scaling out adds more identical instances and helps with throughput/concurrency, not per-instance capacity.',
    references: [REF_APPSVC_SCALE]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You deploy a microservices application to AKS and need built-in service discovery, self-healing, and rolling updates managed by an orchestrator. Which AKS component schedules and maintains the desired number of pod replicas?',
    options: opts4(
      'The kubelet only',
      'A Deployment managed by the Kubernetes control plane',
      'Azure Load Balancer',
      'The container runtime'
    ),
    correct: ['b'],
    explanation: 'A Kubernetes Deployment, reconciled by the control plane, maintains the declared replica count, performs rolling updates, and replaces unhealthy pods. The kubelet runs pods on a node, the load balancer distributes traffic, and the runtime executes containers — none alone provide declarative replica management.',
    references: [REF_AKS]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which trigger type should you choose for an Azure Function that must run every day at 02:00 UTC to generate a report?',
    options: opts4(
      'HTTP trigger',
      'Timer trigger with a CRON expression',
      'Queue trigger',
      'Event Grid trigger'
    ),
    correct: ['b'],
    explanation: 'A Timer trigger uses a NCRONTAB schedule expression to invoke the function on a recurring schedule such as daily at 02:00 UTC. HTTP, Queue, and Event Grid triggers respond to requests or events, not a fixed clock schedule.',
    references: [REF_FUNC_TRIGGERS]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'During a slot swap in App Service, you want certain configuration settings (such as a connection string) to stay bound to the specific slot and not move with the swap. How do you achieve this?',
    options: opts4(
      'Delete the setting before swapping',
      'Mark the app setting / connection string as a deployment slot setting (sticky to the slot)',
      'Use a separate App Service plan per slot',
      'Store the value only in appsettings.json'
    ),
    correct: ['b'],
    explanation: 'Marking an app setting or connection string as a "deployment slot setting" makes it sticky to the slot, so it stays put during a swap while non-sticky settings move with the app content. This is how you keep slot-specific endpoints separate.',
    references: [REF_APPSVC_DEPLOY]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to host a multi-container application defined by a Docker Compose-style configuration as a single deployable unit with internal networking and ingress. Which Azure service natively supports container apps with built-in ingress and revisions?',
    options: opts4(
      'Azure Container Instances',
      'Azure Container Apps',
      'Azure Functions Consumption plan',
      'Azure Static Web Apps'
    ),
    correct: ['b'],
    explanation: 'Azure Container Apps is a serverless container platform with built-in ingress, revisions, and Dapr/KEDA integration, designed for running microservices and multi-container apps. ACI is best for simple isolated containers; Functions and Static Web Apps are not general container hosts.',
    references: [REF_ACA]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'An Azure Function app on the Consumption plan intermittently exceeds the maximum execution duration for a CPU-heavy task. Which change best resolves the timeout without re-architecting the workload pattern?',
    options: opts4(
      'Increase the queue visibility timeout',
      'Move the function app to a Premium or Dedicated plan that allows a longer/unbounded function timeout',
      'Add more output bindings',
      'Reduce the host concurrency to 1'
    ),
    correct: ['b'],
    explanation: 'The Consumption plan caps function execution duration. Moving to a Premium or Dedicated (App Service) plan raises or removes the timeout limit so long CPU-bound work can complete. Queue/binding/concurrency tweaks do not change the host execution-time limit.',
    references: [REF_FUNC_PLANS]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes the Azure App Service "WEBSITE_RUN_FROM_PACKAGE" deployment approach?',
    options: opts4(
      'It runs the app directly from a mounted ZIP package, making the wwwroot read-only and deployments atomic',
      'It enables auto-scaling based on CPU',
      'It mounts an Azure Files share for logs',
      'It disables application logging'
    ),
    correct: ['a'],
    explanation: 'Run-From-Package mounts the deployment ZIP and runs the app from it, giving atomic deployments and a read-only wwwroot, which reduces file-locking issues and speeds cold start. It is unrelated to autoscale or logging configuration.',
    references: [REF_APPSVC_DEPLOY]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need an Azure Function to react automatically whenever a new blob is created in a container, with low latency and without polling overhead at scale. Which approach is recommended for high-scale blob event processing?',
    options: opts4(
      'A Timer trigger that lists the container every minute',
      'An Event Grid trigger subscribed to Blob Created events',
      'An HTTP trigger called by the client after upload',
      'A Service Bus session-enabled queue trigger'
    ),
    correct: ['b'],
    explanation: 'Using an Event Grid trigger subscribed to Blob Storage "Blob Created" events delivers near real-time, push-based notifications that scale well, avoiding the latency and scale limits of the polling-based classic Blob trigger.',
    references: [REF_FUNC_TRIGGERS, REF_EVENTGRID]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Container Instances feature lets multiple containers share a lifecycle, local network, and storage volumes as a single deployment?',
    options: opts4(
      'A container group',
      'A node pool',
      'A replica set',
      'A scale set'
    ),
    correct: ['a'],
    explanation: 'A container group in ACI is the top-level resource that schedules multiple containers on the same host, sharing lifecycle, local network, and mounted volumes — analogous to a Kubernetes pod. Node pools/replica sets/scale sets are AKS or VMSS concepts.',
    references: [REF_ACI]
  },
  {
    domain: COMPUTE, difficulty: 4, type: QType.SINGLE,
    stem: 'A Durable Functions orchestration must wait for an external approval that may take days, then continue. Which Durable Functions construct should the orchestrator use to pause efficiently without consuming compute while waiting?',
    options: opts4(
      'A Thread.Sleep loop inside the orchestrator',
      'WaitForExternalEvent (optionally combined with a durable timer for timeout)',
      'A blocking HTTP call to a polling endpoint',
      'A continuously running activity function'
    ),
    correct: ['b'],
    explanation: 'Orchestrators call WaitForExternalEvent to suspend until an external event is raised; the orchestration is dehydrated while waiting and does not consume compute. A durable timer can add a timeout. Sleeping or blocking calls inside an orchestrator are not allowed/efficient.',
    references: [REF_FUNC_DURABLE]
  },

  // ── Develop for Azure storage (11) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You store backup files in Azure Blob Storage that are rarely accessed but must be retained for 1 year and retrieved within hours if needed, at the lowest storage cost. Which access tier is most appropriate?',
    options: opts4(
      'Hot tier',
      'Cool tier',
      'Archive tier',
      'Premium block blob'
    ),
    correct: ['c'],
    explanation: 'The Archive tier offers the lowest storage cost for rarely accessed data with long retention; data is offline and requires a rehydration that can take hours, which matches the stated retrieval window. Hot/Cool cost more for storage; Premium is for high-transaction low-latency workloads.',
    references: [REF_BLOB_TIERS]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must automatically move blobs to the Cool tier after 30 days and delete them after 365 days, without writing custom code. What should you configure?',
    options: opts4(
      'A blob lease policy',
      'A lifecycle management policy on the storage account',
      'A SAS token with an expiry',
      'A Cosmos DB change feed processor'
    ),
    correct: ['b'],
    explanation: 'Blob Storage lifecycle management lets you define rules that transition blobs between tiers and delete them based on age or last-modified/last-accessed time, with no custom code. Leases, SAS, and Cosmos change feed do not perform tiering/deletion automation.',
    references: [REF_BLOB_LIFECYCLE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Using the Azure.Storage.Blobs .NET client library, which class is the entry point you use to enumerate containers and obtain BlobContainerClient instances for a storage account?',
    options: opts4(
      'BlobServiceClient',
      'BlobClient',
      'QueueClient',
      'TableServiceClient'
    ),
    correct: ['a'],
    explanation: 'BlobServiceClient represents the storage account Blob service; from it you list containers and create BlobContainerClient objects, which in turn create BlobClient objects for individual blobs. QueueClient and TableServiceClient belong to other storage services.',
    references: [REF_BLOB_SDK]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Two processes may update the same blob concurrently. You must ensure a write only succeeds if the blob has not changed since it was read, using optimistic concurrency. Which mechanism should you use?',
    options: opts4(
      'An exclusive infinite blob lease for every read',
      'An If-Match conditional request using the blob ETag',
      'Disabling soft delete',
      'Switching the account to the Archive tier'
    ),
    correct: ['b'],
    explanation: 'Optimistic concurrency uses the blob ETag with an If-Match condition: the write succeeds only if the current ETag matches the one read, otherwise it fails with 412 and the caller retries. Leases give pessimistic locking; soft delete and tiers are unrelated.',
    references: [REF_BLOB_LEASE]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Azure Cosmos DB for NoSQL, which design choice most directly determines how data is distributed and scaled across physical partitions?',
    options: opts4(
      'The chosen consistency level',
      'The partition key',
      'The indexing mode',
      'The selected region'
    ),
    correct: ['b'],
    explanation: 'The partition key determines logical partitioning and how items are distributed across physical partitions, which drives scalability and even throughput/storage distribution. Consistency level, indexing, and region affect other behaviors but not horizontal data distribution.',
    references: [REF_COSMOS_PARTITION]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'An application reads its own writes and must always see the most recent committed write globally, accepting higher latency and cost. Which Azure Cosmos DB consistency level should you choose?',
    options: opts4(
      'Eventual',
      'Strong',
      'Consistent prefix',
      'Session'
    ),
    correct: ['b'],
    explanation: 'Strong consistency guarantees linearizability — reads return the most recent committed write — at the cost of higher latency and lower availability for multi-region writes. Session guarantees consistency within a session but not globally; Eventual/Consistent prefix are weaker.',
    references: [REF_COSMOS_CONSISTENCY]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a low-latency, near-real-time pipeline that reacts to every insert and update in an Azure Cosmos DB container to update a materialized view. Which Cosmos DB capability is designed for this?',
    options: opts4(
      'The change feed (e.g., via the change feed processor or an Azure Functions Cosmos DB trigger)',
      'A stored procedure run on a timer',
      'Manual periodic full container scans',
      'Increasing the provisioned RU/s'
    ),
    correct: ['a'],
    explanation: 'The Cosmos DB change feed provides an ordered, persistent log of creates and updates that you consume with the change feed processor or an Azure Functions Cosmos DB trigger to build materialized views or event pipelines. Periodic scans are costly and not real-time.',
    references: [REF_COSMOS_CHANGEFEED]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Azure Cosmos DB, Request Units (RU/s) is the currency that abstracts the system resources (CPU, IOPS, memory) required to perform database operations such as reads and writes.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Request Units normalize the cost of operations across Cosmos DB. Each operation consumes RUs based on its resource cost, and you provision or autoscale RU/s throughput. Exceeding provisioned RU/s results in rate-limiting (HTTP 429).',
    references: [REF_COSMOS_RU]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You are designing an Azure Table storage schema for a high-volume key-value lookup by tenant. To get the fastest single-entity point reads, your queries should specify which combination?',
    options: opts4(
      'Only the PartitionKey',
      'Both the PartitionKey and RowKey',
      'A property that is not a key',
      'Only the RowKey'
    ),
    correct: ['b'],
    explanation: 'A point query that specifies both PartitionKey and RowKey is the most efficient Table storage operation, returning a single entity directly. Queries on non-key properties cause partition or table scans and are far slower.',
    references: [REF_TABLE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Blob Storage block blobs and the Hot/Cool/Archive tiers.',
    options: opts4(
      'Block blobs are optimized for uploading large amounts of unstructured object data such as files and media.',
      'Reading data from the Archive tier requires rehydration to an online tier before access.',
      'The Cool tier has lower storage cost but higher access cost than the Hot tier.',
      'Tiering can be set at the blob level, not only the account default.'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'Block blobs store unstructured object data. Archive is offline and must be rehydrated to Hot/Cool before reads. Cool reduces storage cost but increases data access cost compared to Hot. Access tier can be set per blob, overriding the account default.',
    references: [REF_BLOB, REF_BLOB_TIERS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure Storage offering provides simple FIFO-style messaging for decoupling components, with messages up to 64 KB and a single namespace per storage account?',
    options: opts4(
      'Azure Queue Storage',
      'Azure Blob Storage',
      'Azure Table storage',
      'Azure Files'
    ),
    correct: ['a'],
    explanation: 'Azure Queue Storage stores large numbers of small messages (up to 64 KB) and is used to decouple application components asynchronously. Blob is for objects, Table is NoSQL key-value, and Files provides SMB/NFS file shares.',
    references: [REF_QUEUE]
  },

  // ── Implement Azure security (12) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An Azure App Service web app must read secrets from Azure Key Vault without storing any credentials in code or configuration. What is the recommended approach?',
    options: opts4(
      'Store a Key Vault access key in an app setting',
      'Enable a managed identity on the app and grant it access to Key Vault',
      'Embed a service principal client secret in appsettings.json',
      'Use the storage account key'
    ),
    correct: ['b'],
    explanation: 'A managed identity gives the app an Entra ID identity with no credentials to manage; you grant that identity access to Key Vault (RBAC or access policy) and authenticate via DefaultAzureCredential. Storing keys or secrets in config defeats the purpose.',
    references: [REF_MI, REF_KEYVAULT]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the key difference between a system-assigned and a user-assigned managed identity in Azure?',
    options: opts4(
      'System-assigned identities can be shared across many resources; user-assigned cannot',
      'A system-assigned identity is tied to the lifecycle of a single resource; a user-assigned identity is a standalone resource that can be assigned to multiple resources',
      'User-assigned identities cannot access Key Vault',
      'There is no functional difference'
    ),
    correct: ['b'],
    explanation: 'A system-assigned managed identity is created with and deleted alongside its single parent resource. A user-assigned managed identity is an independent Azure resource that you can assign to multiple resources and that survives independently.',
    references: [REF_MI]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A client application must call a protected web API on behalf of a signed-in user using OAuth 2.0 / OpenID Connect. Which Microsoft library should the developer use to acquire tokens?',
    options: opts4(
      'Microsoft Authentication Library (MSAL)',
      'The deprecated ADAL only',
      'A custom HMAC token generator',
      'The Storage SDK'
    ),
    correct: ['a'],
    explanation: 'MSAL is the current Microsoft library for acquiring tokens from the Microsoft identity platform for users and applications, handling OAuth 2.0/OIDC flows and token caching. ADAL is deprecated; hand-rolled tokens and the Storage SDK are not identity libraries.',
    references: [REF_MSAL]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You must grant an external partner read-only access to a single blob for 24 hours without sharing the storage account key or creating an Entra identity. What should you generate?',
    options: opts4(
      'A new storage account access key',
      'A user delegation or service SAS scoped to the blob, read-only, with a 24-hour expiry',
      'A Key Vault secret',
      'A managed identity for the partner'
    ),
    correct: ['b'],
    explanation: 'A shared access signature (SAS) grants scoped, time-limited, permission-limited access to a specific resource without sharing the account key. A user delegation SAS (signed with Entra credentials) is preferred for least privilege. Account keys grant full access; managed identities are for Azure resources, not external partners.',
    references: [REF_SAS]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'When requesting an access token in the Microsoft identity platform, what does the "scope" parameter primarily express?',
    options: opts4(
      'The geographic region of the token',
      'The permissions the client is requesting against a specific resource/API',
      'The encryption algorithm for the token',
      'The token lifetime in seconds'
    ),
    correct: ['b'],
    explanation: 'Scopes (and roles) express the permissions the client requests for a resource, such as User.Read for Microsoft Graph. The identity platform issues a token whose audience and permissions reflect the requested scopes after consent. Scope does not set region, algorithm, or lifetime.',
    references: [REF_SCOPES, REF_OAUTH]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A new Key Vault is created with the Azure RBAC permission model. To let an application read secret values, which role should you assign to its managed identity at the vault scope?',
    options: opts4(
      'Owner',
      'Key Vault Secrets User',
      'Reader',
      'Storage Blob Data Reader'
    ),
    correct: ['b'],
    explanation: 'With the RBAC permission model, the built-in "Key Vault Secrets User" role grants read access to secret contents. "Reader" only allows reading vault metadata, not secret values; Owner is excessive; Storage Blob Data Reader is unrelated to Key Vault.',
    references: [REF_KEYVAULT_RBAC, REF_RBAC]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Key Vault can store and manage secrets, keys, and certificates, and access to it can be controlled with either access policies or Azure RBAC.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Key Vault is a centralized service for secrets, cryptographic keys, and TLS/SSL certificates. Authorization to the data plane can be configured using the legacy access policy model or the recommended Azure RBAC permission model.',
    references: [REF_KEYVAULT, REF_KEYVAULT_RBAC]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You want application configuration values centralized and able to reference Key Vault secrets so apps resolve secrets at runtime through one client. Which combination supports this?',
    options: opts4(
      'Azure App Configuration with Key Vault references',
      'Azure Blob Storage with public access',
      'Hard-coded values in source control',
      'Azure Table storage with the account key in code'
    ),
    correct: ['a'],
    explanation: 'Azure App Configuration can store a Key Vault reference; the App Configuration provider resolves the referenced secret from Key Vault at runtime (using the app identity), centralizing config while keeping secrets in Key Vault. The other options expose or scatter secrets insecurely.',
    references: [REF_APPCONFIG, REF_KEYVAULT_SECRETS]
  },
  {
    domain: SECURITY, difficulty: 4, type: QType.SINGLE,
    stem: 'A daemon service with no signed-in user must authenticate to Microsoft Graph to read directory data. Which OAuth 2.0 flow and permission type should it use?',
    options: opts4(
      'Authorization code flow with delegated permissions',
      'Client credentials flow with application permissions',
      'Implicit flow with delegated permissions',
      'Device code flow with delegated permissions'
    ),
    correct: ['b'],
    explanation: 'A background daemon with no user uses the OAuth 2.0 client credentials flow and is granted application permissions (admin-consented) to call Microsoft Graph as itself. The authorization code, implicit, and device code flows all require a user.',
    references: [REF_OAUTH, REF_GRAPH]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'In the Microsoft identity platform, what is the difference between application (app role / app) permissions and delegated permissions?',
    options: opts4(
      'Application permissions act as the app itself with no user; delegated permissions act on behalf of a signed-in user',
      'Delegated permissions never require consent',
      'Application permissions can only be used in single-page apps',
      'They are interchangeable for all flows'
    ),
    correct: ['a'],
    explanation: 'Application permissions let an app act as itself (typically daemons) and require admin consent. Delegated permissions let an app act on behalf of a signed-in user, constrained by both the user privileges and the granted scopes.',
    references: [REF_SCOPES]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Key Vault feature, when enabled, allows recovery of a deleted secret within a retention period and helps prevent accidental or malicious permanent loss?',
    options: opts4(
      'Soft delete (and optionally purge protection)',
      'Geo-replication only',
      'Private endpoint',
      'Customer-managed keys'
    ),
    correct: ['a'],
    explanation: 'Soft delete retains deleted vault objects for a configurable retention period so they can be recovered; purge protection additionally blocks early permanent deletion. Private endpoints and CMK address network/encryption concerns, not deletion recovery.',
    references: [REF_KEYVAULT_SECRETS]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Using the Azure Identity library, which credential type automatically tries multiple authentication mechanisms (managed identity, environment variables, developer tooling) and is recommended for code that runs both locally and in Azure?',
    options: opts4(
      'StorageSharedKeyCredential',
      'DefaultAzureCredential',
      'A hard-coded ClientSecretCredential committed to git',
      'AnonymousCredential'
    ),
    correct: ['b'],
    explanation: 'DefaultAzureCredential chains several credential types (managed identity in Azure, environment variables, developer CLI/IDE sign-in locally), letting the same code authenticate seamlessly in both environments without embedding secrets.',
    references: [REF_MI]
  },

  // ── Monitor, troubleshoot, and optimize Azure solutions (8) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must collect server-side request rates, dependency calls, exceptions, and end-to-end transaction traces for a web app to diagnose performance problems. Which Azure service should you instrument the app with?',
    options: opts4(
      'Azure Application Insights',
      'Azure Key Vault',
      'Azure Storage Analytics only',
      'Azure Policy'
    ),
    correct: ['a'],
    explanation: 'Application Insights is the APM feature of Azure Monitor that collects requests, dependencies, exceptions, and distributed traces, enabling performance diagnostics and the application map. Key Vault, Storage Analytics, and Policy do not provide APM telemetry.',
    references: [REF_APPINSIGHTS]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A high-traffic service generates excessive Application Insights telemetry and cost. You need to reduce data volume while preserving statistically correct metrics. What should you enable?',
    options: opts4(
      'Disable telemetry entirely',
      'Adaptive or ingestion sampling in Application Insights',
      'A larger Log Analytics workspace only',
      'A longer retention period'
    ),
    correct: ['b'],
    explanation: 'Application Insights sampling (adaptive on the SDK side or ingestion sampling) reduces the volume of stored telemetry while statistically preserving metrics and correlated items, lowering cost without losing analytical value. Disabling telemetry loses observability.',
    references: [REF_APPINSIGHTS_SAMPLING]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'You must automatically add web app instances when average CPU exceeds 70% for 10 minutes and remove instances when it drops below 30%. Which Azure capability implements this?',
    options: opts4(
      'Azure Monitor autoscale rules with scale-out/scale-in conditions',
      'Manual scaling via the portal each time',
      'Application Insights alerts only',
      'A Logic App that restarts the app'
    ),
    correct: ['a'],
    explanation: 'Azure Monitor autoscale evaluates metric-based rules to scale out/in the instance count automatically within configured min/max bounds. Alerts can notify but do not change capacity; manual scaling does not react automatically.',
    references: [REF_AUTOSCALE]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to query application trace and request logs across services using a powerful query language to investigate an incident. Which language do you use against Log Analytics / Application Insights logs?',
    options: opts4(
      'T-SQL',
      'Kusto Query Language (KQL)',
      'GraphQL',
      'XPath'
    ),
    correct: ['b'],
    explanation: 'Azure Monitor Logs (Log Analytics) and Application Insights logs are queried with Kusto Query Language (KQL), which supports filtering, aggregation, joins, and time-series operators for log analysis. T-SQL/GraphQL/XPath are not used for these log stores.',
    references: [REF_KQL]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'In Azure Monitor, metrics are lightweight numeric time-series data suited for near-real-time alerting and charting, whereas logs hold richer, structured/semi-structured records queried with KQL.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Azure Monitor distinguishes Metrics (numeric, time-series, low-latency, ideal for alerts and dashboards) from Logs (detailed event records in Log Analytics queried with KQL). Choosing the right data type matters for cost and latency.',
    references: [REF_MONITOR_METRICS, REF_MONITOR]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Calls from your service to a downstream REST API intermittently fail. You want to see the dependency call duration and failure rate without adding manual logging. What should you rely on in Application Insights?',
    options: opts4(
      'Automatic dependency tracking (dependency telemetry)',
      'Only custom events you write by hand',
      'Storage metrics',
      'Azure Advisor recommendations'
    ),
    correct: ['a'],
    explanation: 'The Application Insights SDK automatically collects dependency telemetry for outbound HTTP, SQL, and other calls, capturing duration, target, and success/failure, surfaced in the application map and Failures view without manual instrumentation.',
    references: [REF_APPINSIGHTS]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'A distributed transaction spans an API, a function, and a database. To follow a single user request across all components in Application Insights, which concept correlates the telemetry?',
    options: opts4(
      'Operation ID / distributed trace context propagated across components',
      'The storage account name',
      'A random GUID logged only in the API',
      'The App Service plan SKU'
    ),
    correct: ['a'],
    explanation: 'Application Insights uses a correlation Operation ID and W3C trace context propagated across services so all telemetry for one request shares the same operation, enabling end-to-end transaction diagnostics and the application map.',
    references: [REF_APPINSIGHTS]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Your Cosmos DB-backed API returns HTTP 429 (Too Many Requests) under load. Which optimization most directly addresses the root cause?',
    options: opts4(
      'Increase provisioned RU/s or enable autoscale, and implement retry with backoff on 429',
      'Switch all reads to Strong consistency',
      'Disable indexing entirely for all paths',
      'Move the database to the Archive tier'
    ),
    correct: ['a'],
    explanation: 'HTTP 429 means request units are being rate-limited. Increasing provisioned RU/s (or using autoscale) and honoring the retry-after with exponential backoff resolves throttling. Stronger consistency increases cost; Cosmos has no Archive tier.',
    references: [REF_COSMOS_RU]
  },

  // ── Connect to and consume Azure services and third-party services (16) ──
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You expose several backend microservice APIs and need a single front door that handles authentication, rate limiting, and request transformation for external consumers. Which Azure service should you use?',
    options: opts4(
      'Azure API Management',
      'Azure Event Grid',
      'Azure Service Bus',
      'Azure Blob Storage'
    ),
    correct: ['a'],
    explanation: 'Azure API Management is an API gateway that fronts backend APIs and applies policies for authentication, rate limiting/quota, caching, and transformation, with a developer portal. Event Grid/Service Bus are messaging services and Blob is storage.',
    references: [REF_APIM]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'In Azure API Management you must enforce a limit of 100 calls per minute per subscription key and strip an internal header before forwarding requests. How are these requirements implemented?',
    options: opts4(
      'By editing the backend application code only',
      'With API Management policies (e.g., rate-limit-by-key and set-header) in the policy pipeline',
      'By creating multiple App Service plans',
      'With a Cosmos DB stored procedure'
    ),
    correct: ['b'],
    explanation: 'API Management policies are XML statements applied in the inbound/outbound pipeline. rate-limit-by-key enforces per-key throttling and set-header (with no value) removes a header. This is done at the gateway without changing backend code.',
    references: [REF_APIM_POLICIES]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'An order service must broadcast "OrderCreated" events so multiple independent subscribers (email, analytics, shipping) can react, using a lightweight publish/subscribe model with built-in retry. Which service is the best fit?',
    options: opts4(
      'Azure Event Grid',
      'Azure Queue Storage',
      'Azure Files',
      'Azure Cache for Redis'
    ),
    correct: ['a'],
    explanation: 'Event Grid is a fully managed event routing service for reactive, publish/subscribe event distribution to multiple handlers with filtering and automatic retry. Queue Storage is point-to-point pull messaging; Files/Redis are not event distribution services.',
    references: [REF_EVENTGRID]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You require ordered processing of related messages so that all messages for a given customer are handled in sequence by one consumer. Which Azure Service Bus feature provides this?',
    options: opts4(
      'Service Bus message sessions',
      'Service Bus auto-delete on idle',
      'Event Hubs capture',
      'Queue Storage visibility timeout'
    ),
    correct: ['a'],
    explanation: 'Service Bus sessions group related messages by a SessionId and guarantee ordered, exclusive processing per session by a single consumer, enabling FIFO for a logical entity such as a customer. The other options do not provide per-key ordered delivery.',
    references: [REF_SB_SESSIONS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A Service Bus queue message repeatedly fails processing and exceeds the maximum delivery count. Where does the message go, and why is that useful?',
    options: opts4(
      'It is silently discarded so the queue stays clean',
      'It is moved to the dead-letter queue (DLQ) for later inspection and reprocessing',
      'It is returned to the sender automatically',
      'It blocks the queue until manually deleted'
    ),
    correct: ['b'],
    explanation: 'After exceeding MaxDeliveryCount, Service Bus moves the message to the sub-queue dead-letter queue. This isolates poison messages so the main queue keeps flowing while operators can inspect, fix, and resubmit failed messages.',
    references: [REF_SB_DLQ]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You must ingest millions of telemetry events per second from IoT devices and allow multiple consumer groups to read the stream independently with replay. Which service is designed for this scale of event streaming?',
    options: opts4(
      'Azure Event Hubs',
      'Azure Queue Storage',
      'Azure Service Bus queues',
      'Azure Table storage'
    ),
    correct: ['a'],
    explanation: 'Event Hubs is a big-data streaming/ingestion service partitioned for very high throughput, supporting multiple consumer groups that read independently and replay within the retention window. Service Bus/Queue Storage are message brokers, not high-volume stream ingestion.',
    references: [REF_EVENTHUBS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'When consuming an Azure Event Hub, what is the purpose of checkpointing?',
    options: opts4(
      'It encrypts events at rest',
      'It records the last successfully processed event position per partition so consumers can resume without reprocessing everything',
      'It deletes processed events from the hub immediately',
      'It throttles producers'
    ),
    correct: ['b'],
    explanation: 'Checkpointing persists the offset/sequence number of the last processed event per partition (typically in a blob store). On restart or scale change, consumers resume from the checkpoint instead of the beginning. It does not delete events or encrypt them.',
    references: [REF_EVENTHUBS_CP]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best contrasts Azure Queue Storage and Azure Service Bus queues?',
    options: opts4(
      'They are identical services with different names',
      'Service Bus queues add advanced messaging features (sessions, transactions, dead-lettering, topics) while Queue Storage is a simpler, very high-volume queue',
      'Queue Storage supports topics and subscriptions; Service Bus does not',
      'Service Bus cannot guarantee at-least-once delivery'
    ),
    correct: ['b'],
    explanation: 'Service Bus is an enterprise broker offering sessions, transactions, dead-lettering, and publish/subscribe topics. Azure Queue Storage is a simpler, cost-effective queue for very large numbers of messages without those advanced features.',
    references: [REF_SB_VS_QUEUE]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Event Grid delivery behavior.',
    options: opts4(
      'Event Grid retries delivery with an exponential backoff policy when a handler returns a failure.',
      'You can configure a dead-letter destination (a storage account) for events that cannot be delivered.',
      'Event Grid guarantees ordered delivery of events by default.',
      'Subscriptions can filter events by event type or subject.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Event Grid retries failed deliveries with backoff and supports dead-lettering to a storage account after retries are exhausted. Subscriptions support event type and subject filtering. Event Grid does NOT guarantee ordering by default.',
    references: [REF_EVENTGRID_DELIVERY]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'In Azure API Management, what does a subscription key primarily provide?',
    options: opts4(
      'Encryption of the backend database',
      'A credential consumers include to authorize and track their access to APIs/products',
      'Automatic horizontal scaling of the backend',
      'A managed identity for the backend'
    ),
    correct: ['b'],
    explanation: 'An API Management subscription provides keys that consumers send (e.g., Ocp-Apim-Subscription-Key) to access subscribed APIs/products, enabling access control, usage tracking, and quota enforcement per subscriber.',
    references: [REF_APIM_SUBS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Service Bus topics with subscriptions enable a publish/subscribe model where one published message can be delivered to multiple independent subscribers based on filter rules.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Service Bus topics implement publish/subscribe: a message sent to a topic is copied to each subscription, and subscription filters/rules control which messages each subscriber receives, decoupling senders from multiple receivers.',
    references: [REF_SERVICEBUS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to cache and serve large static assets (images, videos) to a global audience with low latency and reduced origin load. Which Azure service should you add in front of your storage origin?',
    options: opts4(
      'Azure Content Delivery Network (CDN)',
      'Azure Service Bus',
      'Azure Event Grid',
      'Azure Table storage'
    ),
    correct: ['a'],
    explanation: 'Azure CDN caches static content at globally distributed edge points of presence, reducing latency for users and offloading requests from the storage origin. Service Bus/Event Grid are messaging, and Table storage is a datastore.',
    references: [REF_CDN]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Your app must read a user’s profile and send mail on their behalf across Microsoft 365 services through a single unified REST endpoint. Which API should you call?',
    options: opts4(
      'Microsoft Graph',
      'Azure Resource Manager API',
      'The Storage REST API',
      'The Cosmos DB SQL API'
    ),
    correct: ['a'],
    explanation: 'Microsoft Graph is the unified REST API for Microsoft 365 data and services (users, mail, calendar, files, etc.). ARM manages Azure resources, the Storage API targets blobs/queues/tables, and the Cosmos SQL API targets Cosmos DB documents.',
    references: [REF_GRAPH]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'In API Management you want to reduce backend load by returning previously fetched responses for identical GET requests for 60 seconds. Which policy should you apply?',
    options: opts4(
      'A response caching policy (cache-lookup / cache-store)',
      'A rewrite-uri policy',
      'A validate-jwt policy',
      'A mock-response policy'
    ),
    correct: ['a'],
    explanation: 'API Management response caching policies (cache-lookup and cache-store) serve cached responses for matching requests for a configured duration, reducing backend calls and latency. The other policies handle URL rewriting, token validation, and mocking.',
    references: [REF_APIM_POLICIES]
  },
  {
    domain: CONNECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A consumer must process Service Bus messages but occasionally needs more time than the lock duration to finish work. Which approach prevents the message from being redelivered while still being processed?',
    options: opts4(
      'Renew the message lock (lock renewal) before it expires while processing continues',
      'Increase the queue size',
      'Switch to Queue Storage',
      'Disable dead-lettering'
    ),
    correct: ['a'],
    explanation: 'In peek-lock mode the consumer holds a lock that expires after the lock duration; renewing the lock (auto or manual RenewLock) while long processing continues prevents premature lock expiry and redelivery. Queue size and dead-lettering settings do not address lock expiry.',
    references: [REF_SERVICEBUS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which messaging choice is most appropriate for decoupling a web front end from a slow back-end worker using simple, durable, pull-based work items at very large scale and lowest cost?',
    options: opts4(
      'Azure Queue Storage',
      'Azure Event Grid',
      'Azure CDN',
      'Azure App Configuration'
    ),
    correct: ['a'],
    explanation: 'Azure Queue Storage is a simple, durable, low-cost pull-based queue ideal for offloading work items from a front end to background workers at very high volume. Event Grid is push event distribution, CDN is content caching, and App Configuration is configuration storage.',
    references: [REF_QUEUE, REF_SB_VS_QUEUE]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Develop Azure compute solutions (18) ──
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must deploy a containerized API to a fully managed serverless platform that supports HTTP scaling, traffic splitting between revisions, and scale to zero, without managing Kubernetes. Which service should you choose?',
    options: opts4(
      'Azure Kubernetes Service',
      'Azure Container Apps',
      'Azure Virtual Machines',
      'Azure Batch'
    ),
    correct: ['b'],
    explanation: 'Azure Container Apps is serverless containers with HTTP/event scaling, revision-based traffic splitting, and scale to zero, without exposing Kubernetes management. AKS requires cluster operations; VMs/Batch are not serverless container hosts.',
    references: [REF_ACA]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'An Azure Functions app must keep one or more instances pre-warmed to eliminate cold starts while still scaling on demand. Which hosting plan provides pre-warmed instances?',
    options: opts4(
      'Consumption plan',
      'Premium (Elastic Premium) plan',
      'Free App Service plan',
      'A Logic App Standard plan'
    ),
    correct: ['b'],
    explanation: 'The Functions Premium (Elastic Premium) plan provides always-ready/pre-warmed instances to avoid cold starts plus elastic scale and VNet integration. The Consumption plan can incur cold starts; Free/Logic App plans do not offer Functions pre-warming.',
    references: [REF_FUNC_PLANS]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure App Service deployment method publishes a compiled ZIP to the /api/zipdeploy endpoint (Kudu) and is commonly used by CI pipelines?',
    options: opts4(
      'FTP only',
      'ZIP deploy (zipdeploy)',
      'Manual portal file editor',
      'Remote desktop'
    ),
    correct: ['b'],
    explanation: 'ZIP deploy pushes a package to the Kudu zipdeploy endpoint, which extracts it into wwwroot; it is scriptable and widely used in CI/CD. FTP and the portal editor are manual; RDP is not an App Service deployment mechanism.',
    references: [REF_APPSVC_DEPLOY]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Functions hosting plans.',
    options: opts4(
      'The Consumption plan scales automatically and can scale to zero, billing per execution.',
      'The Premium plan supports VNet integration and eliminates cold starts with pre-warmed instances.',
      'The Dedicated (App Service) plan can run Functions alongside web apps with predictable cost.',
      'Only the Consumption plan can run Azure Functions.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Consumption scales to zero and bills per use; Premium adds VNet integration and pre-warmed instances; Dedicated runs Functions on an existing App Service plan with predictable cost. Functions are not limited to Consumption — multiple plans exist.',
    references: [REF_FUNC_PLANS]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You containerize an app and want to build the image in the cloud (no local Docker) and push it to your registry in one step. Which Azure Container Registry feature should you use?',
    options: opts4(
      'ACR Tasks (az acr build)',
      'Geo-replication',
      'Content trust',
      'A webhook'
    ),
    correct: ['a'],
    explanation: 'ACR Tasks (az acr build) builds container images in Azure and pushes them to the registry without a local Docker daemon, and can trigger on source or base-image updates. Geo-replication, content trust, and webhooks address other concerns.',
    references: [REF_ACR]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'In a Durable Functions application, which function type contains the workflow logic that calls other functions and must be deterministic (no direct I/O or random values)?',
    options: opts4(
      'The activity function',
      'The orchestrator function',
      'The client/starter function',
      'The entity function'
    ),
    correct: ['b'],
    explanation: 'The orchestrator function defines the workflow and must be deterministic because it is replayed; non-deterministic work (I/O, random, time) is delegated to activity functions. Client functions start orchestrations; entities manage state.',
    references: [REF_FUNC_DURABLE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a simple way to run a container on Azure for a few minutes for a one-off data migration, with public IP and DNS, billed by the second. Which service is the simplest fit?',
    options: opts4(
      'Azure Container Instances',
      'Azure Kubernetes Service',
      'Azure Service Fabric',
      'Azure App Service for Containers (Premium)'
    ),
    correct: ['a'],
    explanation: 'Azure Container Instances launches a container quickly with optional public IP/DNS and per-second billing, ideal for short one-off jobs. AKS/Service Fabric add orchestration overhead; App Service is for long-running web workloads.',
    references: [REF_ACI]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'Your App Service web app must reach a backend database that is only accessible from a virtual network. Which App Service networking feature lets the app make outbound calls into the VNet?',
    options: opts4(
      'Hybrid Connections only',
      'Regional VNet integration',
      'A larger SKU',
      'Always On'
    ),
    correct: ['b'],
    explanation: 'Regional VNet integration lets an App Service app make outbound calls into a virtual network to reach private resources such as databases. Always On and SKU size affect availability/capacity, not VNet outbound connectivity.',
    references: [REF_APPSVC_CONFIG]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'An Azure Function can have multiple output bindings, allowing a single invocation to write to several destinations (for example, a queue and a Cosmos DB container).',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'A function has exactly one trigger but may declare multiple input and output bindings, so a single execution can write its results to several destinations declaratively without separate SDK calls.',
    references: [REF_FUNC_TRIGGERS]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'A web app on App Service shows slow first responses after periods of inactivity on a Basic plan. Which setting helps keep the app loaded so it responds faster to the first request?',
    options: opts4(
      'Enable the Always On setting',
      'Disable application logging',
      'Reduce the instance count to 1',
      'Move the static files to Blob Storage'
    ),
    correct: ['a'],
    explanation: 'Always On keeps the App Service worker process loaded so it does not unload after idle time, eliminating the cold first-request delay (and keeping continuous WebJobs/timer triggers alive). The other options do not address process unload.',
    references: [REF_APPSVC_CONFIG]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'In Azure Container Apps, you deploy a new revision and want only 10% of traffic to reach it while 90% continues to the previous revision. What enables this?',
    options: opts4(
      'Manual DNS changes',
      'Traffic splitting across revisions in the ingress configuration',
      'A second Container Apps environment',
      'Scaling the old revision to zero'
    ),
    correct: ['b'],
    explanation: 'Azure Container Apps supports multiple active revisions and weighted traffic splitting at the ingress, so you can send a defined percentage (e.g., 10%) to a new revision for canary releases. DNS hacks and separate environments are unnecessary.',
    references: [REF_ACA]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service runs and orchestrates containers at scale with full Kubernetes API access, node pools, and Horizontal Pod Autoscaler support?',
    options: opts4(
      'Azure Kubernetes Service (AKS)',
      'Azure Container Instances',
      'Azure App Service',
      'Azure Functions'
    ),
    correct: ['a'],
    explanation: 'AKS is the managed Kubernetes offering exposing the full Kubernetes API, node pools, and constructs like the Horizontal Pod Autoscaler for scaling pods. ACI runs single containers/groups without orchestration; App Service/Functions are PaaS app hosts.',
    references: [REF_AKS]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'An Azure Function processes messages from a Service Bus queue. To process multiple messages concurrently per instance and tune throughput, which setting do you adjust?',
    options: opts4(
      'The host.json Service Bus maxConcurrentCalls / maxConcurrentSessions setting',
      'The function timeout only',
      'The App Service plan name',
      'The blob container name'
    ),
    correct: ['a'],
    explanation: 'The Service Bus extension settings in host.json (e.g., maxConcurrentCalls) control how many messages a single function instance processes concurrently, tuning per-instance throughput alongside the platform’s scale-out. Timeout and plan name do not set per-instance concurrency.',
    references: [REF_FUNC_TRIGGERS]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to deploy code to a staging slot, run automated smoke tests, and then promote it. Which App Service capability also lets you route a small percentage of live traffic to the staging slot for testing in production?',
    options: opts4(
      'Slot-level testing in production (traffic percentage to a slot)',
      'A separate region deployment',
      'Local cache',
      'FTP deployment'
    ),
    correct: ['a'],
    explanation: 'App Service deployment slots support "Testing in production" by routing a configurable percentage of live traffic to a non-production slot, enabling canary validation before a full swap. The other options do not split live traffic to a slot.',
    references: [REF_APPSVC_DEPLOY]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which trigger lets an Azure Function execute in direct response to an HTTP request and return an HTTP response to the caller?',
    options: opts4(
      'HTTP trigger',
      'Blob trigger',
      'Timer trigger',
      'Cosmos DB trigger'
    ),
    correct: ['a'],
    explanation: 'An HTTP trigger invokes the function on an incoming HTTP request and can return a custom HTTP response, suitable for building APIs and webhooks. Blob/Timer/Cosmos DB triggers respond to storage events, schedules, or change feeds, not direct HTTP calls.',
    references: [REF_FUNC_TRIGGERS]
  },
  {
    domain: COMPUTE, difficulty: 4, type: QType.SINGLE,
    stem: 'A Durable Functions orchestration must run 50 independent activities in parallel and continue only after all complete, aggregating their outputs. Which pattern should you implement?',
    options: opts4(
      'Function chaining (sequential await of each activity)',
      'Fan-out/fan-in (start all activities, then await Task.WhenAll)',
      'A single monolithic activity',
      'Async HTTP polling pattern'
    ),
    correct: ['b'],
    explanation: 'The fan-out/fan-in pattern starts many activity functions in parallel and then awaits all of them (Task.WhenAll) before aggregating results, which Durable Functions coordinates reliably. Chaining is sequential and far slower for independent work.',
    references: [REF_FUNC_DURABLE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Azure Container Instances, which restart policy should you set for a container running a finite task that should NOT be restarted after it completes successfully?',
    options: opts4(
      'Always',
      'OnFailure',
      'Never',
      'Periodic'
    ),
    correct: ['b'],
    explanation: 'OnFailure restarts the container only if it exits with a non-zero code, which is correct for a finite task that should run to completion and not be restarted on success. Always would restart it even after success; Never is too permissive on failures; Periodic is not a valid policy.',
    references: [REF_ACI]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must store and pull a private container image into Azure Container Instances using a managed identity rather than a registry username/password. What must you configure?',
    options: opts4(
      'Anonymous pull on the registry',
      'A managed identity on the container group with AcrPull role on the registry',
      'A SAS token on the registry',
      'The storage account key'
    ),
    correct: ['b'],
    explanation: 'Assigning a managed identity to the ACI container group and granting it the AcrPull role on the Azure Container Registry lets ACI authenticate to pull the private image without storing registry credentials. Anonymous pull is insecure; SAS/storage keys are not registry auth.',
    references: [REF_ACR, REF_MI]
  },

  // ── Develop for Azure storage (11) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Azure Cosmos DB for NoSQL, choosing a partition key with high cardinality and even access patterns primarily helps avoid which problem?',
    options: opts4(
      'Excessive indexing cost',
      'A "hot partition" that throttles because requests concentrate on one physical partition',
      'Slow region failover',
      'High TLS handshake latency'
    ),
    correct: ['b'],
    explanation: 'A good partition key spreads requests and storage evenly across physical partitions. A low-cardinality or skewed key creates a hot partition that exhausts its share of throughput and returns 429s while others sit idle.',
    references: [REF_COSMOS_PARTITION]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Your application mostly reads its own recent writes and needs consistent reads within a user session but wants better availability and lower latency than Strong globally. Which Cosmos DB consistency level is the recommended default for this?',
    options: opts4(
      'Strong',
      'Session',
      'Eventual',
      'Bounded staleness only'
    ),
    correct: ['b'],
    explanation: 'Session consistency (the default) guarantees read-your-writes, monotonic reads/writes within a session while offering high availability and low latency, which fits per-user scenarios. Strong is global and costlier; Eventual gives weaker guarantees.',
    references: [REF_COSMOS_CONSISTENCY]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Using the Azure Blob Storage .NET SDK, which method on BlobClient uploads local data and overwrites the blob if it already exists?',
    options: opts4(
      'UploadAsync with overwrite set to true',
      'DownloadToAsync',
      'DeleteIfExistsAsync',
      'GetPropertiesAsync'
    ),
    correct: ['a'],
    explanation: 'BlobClient.UploadAsync uploads content; passing overwrite: true (or the appropriate options) replaces an existing blob. DownloadToAsync reads, DeleteIfExistsAsync removes, and GetPropertiesAsync fetches metadata — none upload data.',
    references: [REF_BLOB_SDK]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must prevent two workers from modifying the same blob at once using a coarse, exclusive lock that one worker holds for the duration of its critical section. Which blob feature provides pessimistic locking?',
    options: opts4(
      'A blob lease',
      'An ETag If-None-Match header',
      'A SAS token',
      'Soft delete'
    ),
    correct: ['a'],
    explanation: 'A blob lease grants an exclusive write/delete lock for a finite or infinite duration; only the lease holder can modify the blob until it releases or the lease expires. ETags provide optimistic concurrency, not exclusive locking; SAS and soft delete are unrelated.',
    references: [REF_BLOB_LEASE]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure storage service is best suited to store large, semi-structured JSON documents queried by a rich query API with elastic, globally distributed throughput?',
    options: opts4(
      'Azure Cosmos DB for NoSQL',
      'Azure Queue Storage',
      'Azure Files',
      'Azure Disk Storage'
    ),
    correct: ['a'],
    explanation: 'Azure Cosmos DB for NoSQL stores JSON documents with a rich query language, automatic indexing, elastic RU throughput, and global distribution. Queue/Files/Disk are not document databases with these query and distribution capabilities.',
    references: [REF_COSMOS]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the Azure Cosmos DB change feed.',
    options: opts4(
      'It provides a persistent, ordered record of creates and updates within a container.',
      'It can be consumed using the change feed processor or an Azure Functions Cosmos DB trigger.',
      'It includes deletes by default unless you implement a soft-delete pattern.',
      'It is commonly used to build materialized views and trigger downstream processing.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'The change feed is an ordered, persistent log of inserts and updates consumable via the change feed processor or Functions trigger, often used for materialized views and event-driven processing. It does NOT capture deletes by default; you model deletes via soft delete + TTL.',
    references: [REF_COSMOS_CHANGEFEED]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need cost-effective storage of frequently changing data that is accessed often with low latency. Which Blob access tier is appropriate?',
    options: opts4(
      'Hot tier',
      'Cool tier',
      'Archive tier',
      'Cold tier'
    ),
    correct: ['a'],
    explanation: 'The Hot tier is optimized for data that is accessed or modified frequently, offering the lowest access costs at higher storage cost. Cool/Cold/Archive are progressively cheaper to store but costlier (and slower) to access, suited for infrequently used data.',
    references: [REF_BLOB_TIERS]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'In Azure Table storage, what is the maximum size of a single entity, including all its properties?',
    options: opts4(
      '1 KB',
      '64 KB',
      '1 MB',
      'Unlimited'
    ),
    correct: ['c'],
    explanation: 'An Azure Table storage entity can be up to 1 MB in total, with up to 252 user properties plus PartitionKey, RowKey, and Timestamp. Knowing these limits helps you design entities and avoid storing oversized data inline.',
    references: [REF_TABLE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want blobs that have not been accessed for 90 days to move to Cool automatically based on last access time. What must you enable in addition to a lifecycle rule using last-access tracking?',
    options: opts4(
      'Last access time tracking on the storage account',
      'Soft delete only',
      'A blob lease',
      'Static website hosting'
    ),
    correct: ['a'],
    explanation: 'Lifecycle rules that act on last-access time require last access time tracking to be enabled on the storage account so the platform records and evaluates the last accessed timestamp. Soft delete, leases, and static website hosting are unrelated.',
    references: [REF_BLOB_LIFECYCLE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A point read in Azure Cosmos DB (reading a single item by its id and partition key) has which characteristic compared to a query?',
    options: opts4(
      'It is the most efficient and lowest-RU way to read a single known item',
      'It always costs more RUs than any query',
      'It cannot be used with the .NET SDK',
      'It ignores the partition key'
    ),
    correct: ['a'],
    explanation: 'A point read (ReadItem by id + partition key) is the cheapest and fastest single-item read in Cosmos DB, typically ~1 RU for a small item, far more efficient than a query that scans/filter-evaluates documents.',
    references: [REF_COSMOS_RU]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Blob Storage offers three primary blob types — block blobs, append blobs, and page blobs — and append blobs are optimized for append operations such as logging.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Block blobs store general object data, append blobs are optimized for append-only scenarios like logging, and page blobs back random-access disk scenarios. Choosing the correct blob type matters for performance and supported operations.',
    references: [REF_BLOB]
  },

  // ── Implement Azure security (12) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An Azure Function must write to a storage account without any stored connection string. Which approach achieves passwordless authentication?',
    options: opts4(
      'Embed the storage account key in app settings',
      'Enable a managed identity for the Function app and assign it a data-plane RBAC role (e.g., Storage Blob Data Contributor)',
      'Use a SAS token hard-coded in code',
      'Make the container publicly accessible'
    ),
    correct: ['b'],
    explanation: 'Enabling a managed identity and granting it a data-plane role like Storage Blob Data Contributor lets the Function authenticate to storage via Entra ID with no stored secret. Account keys, hard-coded SAS, and public access are insecure or defeat the goal.',
    references: [REF_MI, REF_RBAC]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OAuth 2.0 flow is recommended for a confidential web app that signs in users and needs to call an API on their behalf?',
    options: opts4(
      'Authorization code flow (with PKCE)',
      'Client credentials flow',
      'Resource owner password credentials flow',
      'Implicit grant flow'
    ),
    correct: ['a'],
    explanation: 'The authorization code flow (with PKCE) is the recommended interactive flow for web and native apps signing in users and obtaining tokens to call APIs on their behalf. Client credentials is for app-only; ROPC and implicit are discouraged for security reasons.',
    references: [REF_OAUTH]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You must let an Azure VM read secrets from Key Vault without code changes to manage credentials and without a user-assigned identity. What should you enable on the VM?',
    options: opts4(
      'A system-assigned managed identity, then grant it Key Vault access',
      'A second NIC',
      'A public IP address',
      'Disk encryption only'
    ),
    correct: ['a'],
    explanation: 'A system-assigned managed identity gives the VM an Entra identity bound to its lifecycle; you grant that identity Key Vault access and authenticate with DefaultAzureCredential — no credentials in code. NICs, public IPs, and disk encryption do not provide identity.',
    references: [REF_MI, REF_KEYVAULT]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A SAS you issue must be immediately revocable for all clients without changing the storage account key. Which SAS type supports revocation via a stored access policy?',
    options: opts4(
      'An ad hoc account SAS',
      'A service SAS associated with a stored access policy',
      'A user delegation SAS without policy',
      'An anonymous public URL'
    ),
    correct: ['b'],
    explanation: 'A service SAS tied to a stored access policy can be revoked by deleting or modifying the policy, instantly invalidating all SAS tokens bound to it without rotating the account key. Ad hoc SAS can only be revoked by rotating the key; public URLs have no token.',
    references: [REF_SAS]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'When you register an application in Microsoft Entra ID for a web app that signs in users, which value must exactly match a URL you configure so the identity platform can return tokens?',
    options: opts4(
      'The redirect URI (reply URL)',
      'The storage connection string',
      'The Key Vault URI',
      'The Cosmos DB endpoint'
    ),
    correct: ['a'],
    explanation: 'The redirect URI (reply URL) registered on the app must exactly match the URI used in the authorization request; the identity platform only returns tokens/codes to a registered redirect URI, mitigating token interception. Storage/Key Vault/Cosmos endpoints are unrelated.',
    references: [REF_OAUTH, REF_ENTRA]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service centrally manages application settings and feature flags so you can change configuration and toggle features without redeploying the app?',
    options: opts4(
      'Azure App Configuration',
      'Azure Key Vault',
      'Azure Blob Storage',
      'Azure Monitor'
    ),
    correct: ['a'],
    explanation: 'Azure App Configuration centralizes key-value settings and feature flags, supporting dynamic refresh and feature management so configuration and feature toggles change without redeployment. Key Vault is for secrets; Blob/Monitor serve other roles.',
    references: [REF_APPCONFIG, REF_APPCONFIG_FEATURE]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You use Azure App Configuration feature flags to roll out a feature to 20% of users gradually. Which App Configuration capability supports this?',
    options: opts4(
      'A feature flag with a targeting/percentage filter',
      'A Key Vault rotation policy',
      'A blob lifecycle rule',
      'An autoscale rule'
    ),
    correct: ['a'],
    explanation: 'App Configuration feature flags support feature filters, including targeting and percentage-based rollout, so you can progressively enable a feature for a portion of users. Key Vault rotation, blob lifecycle, and autoscale do not control feature exposure.',
    references: [REF_APPCONFIG_FEATURE]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Using a managed identity with DefaultAzureCredential removes the need to store and rotate client secrets or connection strings for service-to-service authentication in Azure.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Managed identities are credential-free identities managed by the platform; using DefaultAzureCredential, code obtains tokens automatically with nothing to store or rotate, which is the recommended secure pattern for Azure service-to-service auth.',
    references: [REF_MI]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A web app already signed the user in. To call a downstream API that itself calls another API as the same user, which OAuth 2.0 flow lets the middle-tier API exchange the incoming token for a token to the downstream API?',
    options: opts4(
      'On-behalf-of (OBO) flow',
      'Client credentials flow',
      'Device code flow',
      'Implicit flow'
    ),
    correct: ['a'],
    explanation: 'The on-behalf-of flow lets a middle-tier API exchange the user’s token for a new access token to call a downstream API while preserving the user identity and delegated permissions. Client credentials drops the user; device code/implicit are for other scenarios.',
    references: [REF_OAUTH]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'To follow least privilege, an app that only needs to read blob data should be granted which built-in Azure RBAC role on the storage scope?',
    options: opts4(
      'Owner',
      'Storage Blob Data Reader',
      'Contributor',
      'Storage Account Key Operator'
    ),
    correct: ['b'],
    explanation: 'Storage Blob Data Reader grants read-only data-plane access to blobs, satisfying least privilege. Owner/Contributor are broad management roles, and Storage Account Key Operator manages keys — none are minimal read-only data access.',
    references: [REF_RBAC]
  },
  {
    domain: SECURITY, difficulty: 4, type: QType.SINGLE,
    stem: 'Your app reads a secret from Key Vault on every request and occasionally hits Key Vault throttling under load. Which change best mitigates this while keeping secrets in Key Vault?',
    options: opts4(
      'Cache the secret in memory with a refresh interval instead of fetching it on every request',
      'Move the secret into source code',
      'Disable Key Vault soft delete',
      'Request the secret with a SAS token'
    ),
    correct: ['a'],
    explanation: 'Secrets change rarely, so caching the retrieved value in memory with a periodic refresh dramatically reduces Key Vault calls and avoids throttling while still sourcing the secret from Key Vault. Hard-coding secrets is insecure; soft delete and SAS are irrelevant here.',
    references: [REF_KEYVAULT_SECRETS]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'In the Microsoft identity platform, what is the role of the access token presented to a protected API?',
    options: opts4(
      'It identifies the user to the front-end browser only',
      'It is a bearer credential the API validates (issuer, audience, scope/role, signature) to authorize the request',
      'It encrypts the database',
      'It stores the user’s password'
    ),
    correct: ['b'],
    explanation: 'An access token is a bearer token the resource API validates — checking issuer, audience, lifetime, signature, and scopes/roles — to authorize the caller. It never contains the password and is not a database encryption key.',
    references: [REF_OAUTH]
  },

  // ── Monitor, troubleshoot, and optimize Azure solutions (8) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to be notified when the server-side exception rate of a web app exceeds a threshold. Which Azure Monitor capability should you configure?',
    options: opts4(
      'An alert rule on an Application Insights metric/log signal',
      'A blob lifecycle policy',
      'A Cosmos DB stored procedure',
      'An App Configuration feature flag'
    ),
    correct: ['a'],
    explanation: 'Azure Monitor alert rules evaluate a metric or log query signal (such as Application Insights exceptions) against a condition and trigger action groups (email, webhook, etc.). Lifecycle policies, stored procedures, and feature flags do not provide alerting.',
    references: [REF_MONITOR, REF_APPINSIGHTS]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Your autoscale configuration scales out aggressively then immediately scales in, causing instance "flapping." Which autoscale setting reduces this oscillation?',
    options: opts4(
      'A cool-down period and appropriate scale-in vs scale-out thresholds (with a gap between them)',
      'Removing the maximum instance limit',
      'Disabling metrics collection',
      'Setting min and max to the same value permanently'
    ),
    correct: ['a'],
    explanation: 'Configuring a cool-down period and separating scale-out and scale-in thresholds (a hysteresis gap) prevents rapid back-and-forth scaling. Removing limits or disabling metrics worsens control; pinning min=max disables autoscale entirely.',
    references: [REF_AUTOSCALE]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to write a custom dashboard query that aggregates request duration percentiles over the last 24 hours from Application Insights. Which tool/language do you use?',
    options: opts4(
      'Kusto Query Language in Logs (Log Analytics)',
      'PowerShell DSC',
      'ARM template functions',
      'Bicep'
    ),
    correct: ['a'],
    explanation: 'Application Insights/Log Analytics data is queried with KQL, which provides percentile and time-bucketing functions (e.g., percentile(), summarize by bin()) for building aggregated dashboards. DSC, ARM, and Bicep are deployment tools, not log query languages.',
    references: [REF_KQL]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Application Insights Live Metrics lets you observe near-real-time request, dependency, and failure rates with about a one-second latency, useful during deployments.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Live Metrics streams telemetry with roughly one-second latency, letting you watch performance and failures in real time during a deployment or incident without it being affected by sampling.',
    references: [REF_APPINSIGHTS]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A Function app intermittently fails with storage timeouts to its dependency. You want to automatically retry transient failures with increasing delays. Which resiliency pattern should the client implement?',
    options: opts4(
      'Retry with exponential backoff (and jitter), optionally with a circuit breaker',
      'Infinite immediate retries with no delay',
      'Disable logging to speed up',
      'Increase the function timeout to infinite on Consumption'
    ),
    correct: ['a'],
    explanation: 'Transient faults are best handled with retries using exponential backoff and jitter, optionally guarded by a circuit breaker to avoid hammering a failing dependency. Immediate infinite retries cause storms; logging changes and (impossible) infinite Consumption timeouts do not help.',
    references: [REF_MONITOR]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Application Insights view visually maps components and their dependencies with health and performance to quickly locate a failing downstream service?',
    options: opts4(
      'The Application Map',
      'The blob metrics blade',
      'The Key Vault access policies blade',
      'The cost analysis view'
    ),
    correct: ['a'],
    explanation: 'The Application Map visualizes application components and their dependency calls with success/latency indicators, making it easy to pinpoint a failing or slow downstream service in a distributed system.',
    references: [REF_APPINSIGHTS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You must capture custom business telemetry (for example, "OrderPlaced" with revenue) for analysis in Application Insights. Which approach should you use?',
    options: opts4(
      'Track a custom event/metric via the Application Insights SDK (TrackEvent/TrackMetric)',
      'Write it to a local text file only',
      'Store it in an environment variable',
      'Put it in the App Service plan description'
    ),
    correct: ['a'],
    explanation: 'The Application Insights SDK exposes TrackEvent and TrackMetric to record custom events and metrics with properties/measurements, queryable in Logs and usable in dashboards. Local files, env vars, and plan descriptions are not telemetry stores.',
    references: [REF_APPINSIGHTS]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'After enabling adaptive sampling, stakeholders worry exact request counts are skewed. How does Application Insights present metrics so totals remain accurate despite sampling?',
    options: opts4(
      'It stores every item regardless of sampling',
      'It records an item count multiplier so aggregated metrics are statistically reconstructed to approximate true totals',
      'It disables all metrics when sampling is on',
      'It only samples logs, never metrics'
    ),
    correct: ['b'],
    explanation: 'Sampled telemetry carries an itemCount so Application Insights scales aggregates back up, keeping metrics like request counts statistically accurate even though only a fraction of individual items are retained. It does not store everything or disable metrics.',
    references: [REF_APPINSIGHTS_SAMPLING]
  },

  // ── Connect to and consume Azure services and third-party services (16) ──
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must protect a backend API behind API Management so only requests carrying a valid Microsoft Entra ID JWT are allowed. Which inbound policy should you use?',
    options: opts4(
      'validate-jwt',
      'set-backend-service',
      'cache-store',
      'mock-response'
    ),
    correct: ['a'],
    explanation: 'The validate-jwt policy validates the token signature, issuer, audience, and required claims/scopes before forwarding the request, rejecting unauthorized callers at the gateway. set-backend-service routes, cache-store caches, and mock-response returns stubbed data.',
    references: [REF_APIM_POLICIES]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Event Grid must deliver "BlobCreated" events to your webhook, but your endpoint must first prove it owns the URL. What does Event Grid require during subscription creation for a webhook handler?',
    options: opts4(
      'A validation handshake (responding to the subscription validation event)',
      'A storage account key',
      'A managed identity on the publisher',
      'A Service Bus session'
    ),
    correct: ['a'],
    explanation: 'For webhook (non-Azure) handlers, Event Grid sends a subscription validation event; the endpoint must echo back the validation code (or use the validation URL) to prove ownership before deliveries begin. Storage keys, identities, and sessions are not the validation mechanism.',
    references: [REF_EVENTGRID]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You must guarantee that a financial command message is processed exactly once and removed only after successful handling. Which Service Bus receive mode supports this safe processing?',
    options: opts4(
      'ReceiveAndDelete mode',
      'PeekLock mode with Complete after successful processing',
      'Anonymous mode',
      'Broadcast mode'
    ),
    correct: ['b'],
    explanation: 'In PeekLock mode the message is locked, processed, then explicitly Completed (or Abandoned/Dead-lettered) — ensuring it is removed only after successful handling, supporting at-least-once with safe processing. ReceiveAndDelete removes it on receive, risking loss on failure.',
    references: [REF_SERVICEBUS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'In Event Hubs, what determines the maximum degree of parallelism for consumers in a single consumer group?',
    options: opts4(
      'The number of partitions in the event hub',
      'The storage account tier',
      'The number of topics',
      'The Service Bus namespace SKU'
    ),
    correct: ['a'],
    explanation: 'Each partition is processed by at most one active consumer within a consumer group, so the partition count caps parallel consumption per group. Storage tier, topics, and Service Bus SKU do not govern Event Hubs partition parallelism.',
    references: [REF_EVENTHUBS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements comparing Azure messaging services.',
    options: opts4(
      'Event Grid is best for reactive, discrete event notification with publish/subscribe routing.',
      'Event Hubs is designed for high-throughput event/telemetry streaming and analytics ingestion.',
      'Service Bus provides enterprise messaging with queues, topics, sessions, and transactions.',
      'Azure Queue Storage natively supports topics, subscriptions, and message sessions.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Event Grid handles discrete event routing, Event Hubs handles high-volume streaming, and Service Bus provides advanced enterprise messaging (queues/topics/sessions/transactions). Azure Queue Storage is a simple queue and does NOT provide topics/subscriptions/sessions.',
    references: [REF_SB_VS_QUEUE, REF_EVENTHUBS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which API Management component groups one or more APIs and is what consumers subscribe to in order to receive keys?',
    options: opts4(
      'A product',
      'A backend',
      'A named value',
      'A diagnostic'
    ),
    correct: ['a'],
    explanation: 'In API Management a product bundles one or more APIs with usage policies and visibility; consumers subscribe to a product to obtain subscription keys. Backends define target services, named values store reusable settings, and diagnostics configure logging.',
    references: [REF_APIM_SUBS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want Event Grid to call your Azure Function for each blob-created event and to retry automatically if the function temporarily fails. Which handler integration is recommended?',
    options: opts4(
      'An Event Grid trigger on the Azure Function (event subscription to the function)',
      'A timer-triggered function that lists blobs',
      'An HTTP client polling Event Grid',
      'A manual queue receiver'
    ),
    correct: ['a'],
    explanation: 'Subscribing Event Grid to an Azure Functions Event Grid trigger gives push-based, near-real-time delivery with Event Grid’s built-in retry/dead-letter semantics handling transient function failures. Polling/timer approaches lose the low-latency, retried delivery.',
    references: [REF_EVENTGRID_DELIVERY, REF_FUNC_TRIGGERS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A Service Bus queue must delay processing of certain messages until a specific future time. Which feature schedules a message for later delivery?',
    options: opts4(
      'Scheduled messages (ScheduledEnqueueTime)',
      'Dead-lettering',
      'Auto-forwarding',
      'Duplicate detection'
    ),
    correct: ['a'],
    explanation: 'Service Bus scheduled messages let you set a ScheduledEnqueueTimeUtc so the message becomes available for delivery only at that future time. Dead-lettering isolates failed messages, auto-forwarding chains entities, and duplicate detection drops repeats.',
    references: [REF_SERVICEBUS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'API Management can transform requests and responses (for example, rewrite URLs, convert XML to JSON, and add or remove headers) using policies, without modifying backend code.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'API Management policies operate in the gateway pipeline and can rewrite URLs, transform payloads between XML and JSON, and manipulate headers, decoupling client-facing contracts from backend implementations without backend code changes.',
    references: [REF_APIM_POLICIES]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Two services must communicate reliably even if the consumer is offline for hours, with messages preserved and processed later in order per logical entity. Which combination should you choose?',
    options: opts4(
      'Azure Service Bus queue with sessions enabled',
      'A direct synchronous HTTP call',
      'Azure CDN',
      'Application Insights custom events'
    ),
    correct: ['a'],
    explanation: 'A Service Bus queue durably stores messages until the consumer is available, and sessions provide ordered, per-entity processing. A synchronous HTTP call fails if the consumer is offline; CDN and App Insights are not messaging transports.',
    references: [REF_SERVICEBUS, REF_SB_SESSIONS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to capture Event Hubs streaming data automatically into Azure Blob Storage or Data Lake for batch analytics without writing a consumer. Which feature provides this?',
    options: opts4(
      'Event Hubs Capture',
      'Service Bus sessions',
      'Event Grid dead-lettering',
      'API Management caching'
    ),
    correct: ['a'],
    explanation: 'Event Hubs Capture automatically writes streaming event data to Blob Storage or Azure Data Lake on a configurable time/size window with no consumer code, enabling downstream batch processing. The other features serve unrelated messaging/gateway purposes.',
    references: [REF_EVENTHUBS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A client calls Microsoft Graph and receives HTTP 429 with a Retry-After header. What is the correct client behavior?',
    options: opts4(
      'Immediately retry in a tight loop',
      'Honor the Retry-After header and back off before retrying',
      'Treat 429 as a permanent failure and stop',
      'Switch to the storage account key'
    ),
    correct: ['b'],
    explanation: 'HTTP 429 indicates throttling; the client should wait for the duration in the Retry-After header (or use exponential backoff) before retrying. Tight-loop retries worsen throttling, and 429 is transient, not permanent.',
    references: [REF_GRAPH]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service provides a managed publish/subscribe event broker with HTTP push delivery, schema-based filtering, and serverless integration ideal for reactive architectures?',
    options: opts4(
      'Azure Event Grid',
      'Azure Files',
      'Azure Disk Storage',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Azure Event Grid is a fully managed pub/sub event routing service with HTTP push delivery, event filtering, and tight integration with serverless handlers, designed for event-driven/reactive systems. Files/Disk/Bastion are storage and connectivity services.',
    references: [REF_EVENTGRID]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'In API Management you want to store a secret reference centrally and use it inside policies without hard-coding it. Which API Management feature should you use, optionally backed by Key Vault?',
    options: opts4(
      'Named values (with optional Key Vault integration)',
      'A product description',
      'A diagnostic setting',
      'A user group'
    ),
    correct: ['a'],
    explanation: 'Named values are reusable name/value pairs (optionally secret and backed by Key Vault) referenced in policies, centralizing configuration and secrets without hard-coding them in policy XML. Descriptions, diagnostics, and groups do not store policy values.',
    references: [REF_APIM_POLICIES]
  },
  {
    domain: CONNECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A consumer reads from an Event Hub using the EventProcessorClient. Why is a blob container typically supplied to this client?',
    options: opts4(
      'To store the application source code',
      'To persist partition checkpoints and coordinate partition ownership/load balancing across consumers',
      'To cache HTTP responses',
      'To host the function binaries'
    ),
    correct: ['b'],
    explanation: 'EventProcessorClient uses a blob container as the checkpoint store: it persists per-partition offsets and coordinates ownership so multiple consumer instances balance partitions and resume from the last checkpoint. It is not for source code or HTTP caching.',
    references: [REF_EVENTHUBS_CP]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about Azure Service Bus duplicate detection is correct?',
    options: opts4(
      'It automatically discards messages with a repeated MessageId within a configured time window',
      'It encrypts the message body',
      'It guarantees global ordering across all queues',
      'It is only available in Queue Storage'
    ),
    correct: ['a'],
    explanation: 'When duplicate detection is enabled, Service Bus drops any message whose MessageId was already seen within the configured detection window, helping achieve idempotent send semantics. It does not handle encryption, global ordering, or apply to Queue Storage.',
    references: [REF_SERVICEBUS]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Develop Azure compute solutions (18) ──
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must host a stateless REST API that scales automatically with HTTP traffic, integrates with managed identity, and supports deployment slots. Which Azure service is the most appropriate PaaS choice?',
    options: opts4(
      'Azure App Service (Web App)',
      'A single Azure VM',
      'Azure Batch',
      'Azure Storage static website'
    ),
    correct: ['a'],
    explanation: 'Azure App Service hosts web apps/APIs as a managed PaaS with autoscale, managed identity, and deployment slots. A single VM lacks managed scaling/slots, Batch is for parallel compute jobs, and a storage static website cannot run server-side API code.',
    references: [REF_APPSVC]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'An Azure Function uses a Queue Storage trigger. A message keeps failing and is retried until it exceeds dequeue attempts. Where does the Queue trigger move the poison message by default?',
    options: opts4(
      'It is deleted permanently with no record',
      'To a poison queue (named <queue>-poison)',
      'Back to the front of the original queue forever',
      'To Application Insights only'
    ),
    correct: ['b'],
    explanation: 'The Azure Functions Queue Storage trigger moves a message that exceeds the max dequeue count to a poison queue named "<originalqueue>-poison" so it can be inspected and reprocessed instead of blocking the queue or being silently lost.',
    references: [REF_FUNC_TRIGGERS, REF_QUEUE]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure App Service deployment slots.',
    options: opts4(
      'Slots are live apps with their own host names.',
      'Swapping warms up the target slot before redirecting production traffic.',
      'Slot-specific (sticky) settings stay with the slot during a swap.',
      'Slots are only available on the Free tier.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Deployment slots are live apps with distinct hostnames; swap performs a warm-up then redirects traffic for near-zero downtime, and sticky settings remain bound to a slot during swap. Slots require Standard or higher — they are NOT available on Free/Shared tiers.',
    references: [REF_APPSVC_DEPLOY]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure service is purpose-built to run large-scale parallel and high-performance batch compute jobs by managing a pool of VMs?',
    options: opts4(
      'Azure Batch',
      'Azure App Service',
      'Azure Static Web Apps',
      'Azure Cosmos DB'
    ),
    correct: ['a'],
    explanation: 'Azure Batch schedules and runs large-scale parallel/HPC batch jobs across a managed pool of compute nodes, handling job scheduling and scaling. App Service hosts web apps, Static Web Apps serves SPA/static content, and Cosmos DB is a database.',
    references: [REF_APPSVC]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Container Apps microservice must call another microservice in the same environment securely by name without exposing it publicly. Which feature enables this?',
    options: opts4(
      'Internal ingress / service-to-service discovery within the Container Apps environment',
      'A public load balancer per service',
      'A NAT gateway',
      'Manual IP configuration in code'
    ),
    correct: ['a'],
    explanation: 'Container Apps in the same environment can communicate via internal ingress and built-in service discovery using the app name on the internal network, with no public exposure. Public LBs, NAT gateways, and hard-coded IPs are unnecessary and less secure.',
    references: [REF_ACA]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to schedule a containerized job to run once per day on Azure with minimal management. Which Container Apps feature best fits a scheduled batch run?',
    options: opts4(
      'A Container Apps job with a cron (scheduled) trigger',
      'An always-running replica polling the clock',
      'A manual portal start each day',
      'An App Service Free plan'
    ),
    correct: ['a'],
    explanation: 'Azure Container Apps jobs support scheduled (cron) execution to run a containerized task on a recurring schedule and then stop, which is ideal and cost-effective for a daily batch run. An always-on poller wastes resources and manual starts are not automated.',
    references: [REF_ACA]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Functions binding direction is used to read data into a function automatically before it runs (for example, fetching a Cosmos DB document by id)?',
    options: opts4(
      'An input binding',
      'An output binding',
      'A trigger only',
      'A diagnostic binding'
    ),
    correct: ['a'],
    explanation: 'An input binding declaratively supplies external data (such as a Cosmos DB document or blob) to the function before execution, removing manual SDK fetch code. Output bindings write results out; the trigger fires the function; there is no "diagnostic binding."',
    references: [REF_FUNC_TRIGGERS]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'A function app must access a private Azure SQL endpoint over a virtual network and avoid cold starts. Which Functions hosting plan satisfies both requirements?',
    options: opts4(
      'Consumption plan',
      'Premium (Elastic Premium) plan',
      'Free plan',
      'A static website'
    ),
    correct: ['b'],
    explanation: 'The Functions Premium plan provides VNet integration (for private endpoints) and pre-warmed instances that eliminate cold starts. Consumption lacks pre-warmed instances and full VNet integration; Free/static website cannot host these workloads.',
    references: [REF_FUNC_PLANS]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Container Instances can mount an Azure Files share into a container to persist data beyond the container lifecycle.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'ACI supports mounting an Azure Files share as a volume so data written by the container persists independently of the container instance lifecycle, which is useful for stateful or output-producing jobs.',
    references: [REF_ACI]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must roll back an App Service deployment quickly after a bad swap. What is the fastest, lowest-risk rollback method?',
    options: opts4(
      'Swap the slots back (re-swap to restore the previous production content)',
      'Redeploy from source control and rebuild',
      'Recreate the App Service plan',
      'Restore from a database backup'
    ),
    correct: ['a'],
    explanation: 'Because a swap exchanges slot contents/config, swapping the slots back immediately restores the previous production version with near-zero downtime — the fastest, lowest-risk rollback. Rebuilding or recreating resources is slower and riskier.',
    references: [REF_APPSVC_DEPLOY]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'In Durable Functions, which pattern exposes a status endpoint so a client can poll the progress of a long-running operation started by an HTTP call?',
    options: opts4(
      'The async HTTP API pattern (HTTP 202 with a statusQueryGetUri)',
      'Function chaining',
      'Monitor pattern only',
      'Human interaction only'
    ),
    correct: ['a'],
    explanation: 'The Durable Functions async HTTP API pattern returns HTTP 202 with management URLs (e.g., statusQueryGetUri) so the client polls orchestration status until completion. Chaining, monitor, and human-interaction patterns address different orchestration needs.',
    references: [REF_FUNC_DURABLE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Container Registry capability replicates images to multiple regions so geographically distributed deployments pull from a nearby endpoint?',
    options: opts4(
      'Geo-replication',
      'Content trust',
      'ACR Tasks',
      'A webhook'
    ),
    correct: ['a'],
    explanation: 'ACR geo-replication maintains a single registry replicated across regions, so deployments in each region pull from a local replica with lower latency and a single image name. Content trust signs images, Tasks build images, and webhooks notify on events.',
    references: [REF_ACR]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'An Azure Function on the Consumption plan must connect to resources behind a virtual network. What limitation should you anticipate?',
    options: opts4(
      'The Consumption plan does not support regional VNet integration; use the Premium or Dedicated plan',
      'Functions cannot use bindings on Consumption',
      'Consumption supports only HTTP triggers',
      'Consumption cannot scale out'
    ),
    correct: ['a'],
    explanation: 'Regional VNet integration is not available on the Consumption plan; to reach VNet-restricted resources you must use the Premium (Elastic Premium) or Dedicated plan. Consumption still supports many trigger/binding types and scales out automatically.',
    references: [REF_FUNC_PLANS]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You deploy a container image from Azure Container Registry to Azure Container Instances and want ACI to authenticate without embedding the admin username/password. What is the recommended approach?',
    options: opts4(
      'Enable the registry admin account and embed credentials',
      'Use a managed identity with the AcrPull role for the container group',
      'Make the registry public',
      'Use a SAS token'
    ),
    correct: ['b'],
    explanation: 'Granting a managed identity the AcrPull role and assigning it to the ACI container group lets ACI pull the image using Entra-based auth with no embedded credentials. The admin account is discouraged, public registries expose images, and SAS is not registry auth.',
    references: [REF_ACR, REF_MI]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes Azure Functions "isolated worker" model for .NET?',
    options: opts4(
      'The function runs in a separate process from the Functions host, decoupling the app’s .NET version from the host',
      'It disables all bindings',
      'It only works on the Free tier',
      'It prevents the use of dependency injection'
    ),
    correct: ['a'],
    explanation: 'The .NET isolated worker model runs function code in a separate process from the host, so the app can target a .NET version independent of the host runtime and gives full control over the process (middleware, DI). Bindings and DI are still supported.',
    references: [REF_FUNC]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Container Apps revision must scale based on HTTP concurrency: add a replica for every 50 concurrent requests, with a maximum of 20 replicas. Where do you define this?',
    options: opts4(
      'An HTTP scale rule plus min/max replica settings on the container app',
      'An Azure Monitor autoscale rule on the App Service plan',
      'A Kubernetes HPA manifest you manage directly',
      'A Functions host.json setting'
    ),
    correct: ['a'],
    explanation: 'Azure Container Apps defines scaling via scale rules (here an HTTP rule with a concurrent request threshold) together with minReplicas/maxReplicas on the app. App Service autoscale, manually managed HPA manifests, and host.json do not apply to Container Apps.',
    references: [REF_ACA_SCALE]
  },
  {
    domain: COMPUTE, difficulty: 4, type: QType.SINGLE,
    stem: 'In a Durable Functions orchestrator, why must you use the orchestration context API (e.g., CurrentUtcDateTime) instead of DateTime.UtcNow directly?',
    options: opts4(
      'Because the orchestrator is replayed and direct non-deterministic calls would break deterministic replay',
      'Because DateTime.UtcNow is not available in Azure',
      'Because it improves logging only',
      'Because activities cannot read time'
    ),
    correct: ['a'],
    explanation: 'Durable orchestrators are deterministically replayed to rebuild state; calling DateTime.UtcNow (or other non-deterministic APIs) directly would yield different values on replay and corrupt the orchestration. The context provides replay-safe equivalents.',
    references: [REF_FUNC_DURABLE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which deployment artifact format does App Service support to run a custom containerized app instead of a built-in runtime stack?',
    options: opts4(
      'A Docker/OCI container image from a registry (Web App for Containers)',
      'A raw ISO file',
      'A virtual hard disk (VHD)',
      'A Bicep file as the runtime'
    ),
    correct: ['a'],
    explanation: 'App Service (Web App for Containers) can run a custom Docker/OCI container image pulled from a registry such as ACR or Docker Hub, instead of a built-in language stack. ISO/VHD images and Bicep files are not App Service runtime artifacts.',
    references: [REF_APPSVC]
  },

  // ── Develop for Azure storage (11) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must store a write-once audit log where entries are only appended, never modified in place, and reads are infrequent. Which Azure Blob type is purpose-built for append operations?',
    options: opts4(
      'Append blob',
      'Page blob',
      'Block blob (Premium)',
      'A managed disk'
    ),
    correct: ['a'],
    explanation: 'Append blobs are optimized for append-only workloads such as logging and audit trails, where new data is added to the end of the blob efficiently. Page blobs back random-access disks, block blobs are general object storage, and managed disks are not blob types.',
    references: [REF_BLOB]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-region app needs single-digit-millisecond reads and writes worldwide with 99.999% availability and automatic regional failover. Which Cosmos DB configuration enables this?',
    options: opts4(
      'Single-region account with Strong consistency',
      'Multi-region writes (multi-master) with multiple read/write regions',
      'A single region with manual backups only',
      'Disabling the change feed'
    ),
    correct: ['b'],
    explanation: 'Configuring multiple regions with multi-region writes lets clients read and write to the nearest region with low latency and provides automatic failover and high availability SLAs. A single region cannot deliver global low latency or automatic regional failover.',
    references: [REF_COSMOS]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must automatically delete Cosmos DB items 30 days after creation without writing a cleanup job. Which feature should you configure?',
    options: opts4(
      'Time to Live (TTL) on the container/item',
      'A blob lifecycle policy',
      'A SAS expiry',
      'A Service Bus message TTL'
    ),
    correct: ['a'],
    explanation: 'Cosmos DB Time to Live (TTL) automatically expires and deletes items after the configured number of seconds, removing the need for a custom cleanup process. Blob lifecycle, SAS expiry, and Service Bus TTL apply to different services.',
    references: [REF_COSMOS]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A query in Azure Cosmos DB filters across many partition key values, causing a fan-out (cross-partition) query that consumes high RUs. What is the most effective optimization?',
    options: opts4(
      'Redesign queries to include the partition key so they target a single partition',
      'Lower the provisioned RU/s',
      'Switch to Eventual consistency',
      'Disable indexing on all paths'
    ),
    correct: ['a'],
    explanation: 'Including the partition key in the query restricts it to a single physical partition, dramatically reducing RU cost and latency versus a cross-partition fan-out. Lowering RU/s causes throttling; consistency level and indexing changes do not fix the fan-out cause.',
    references: [REF_COSMOS_PARTITION, REF_COSMOS_RU]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Blob Storage feature lets you recover a blob that was overwritten by retaining previous versions automatically?',
    options: opts4(
      'Blob versioning',
      'Static website hosting',
      'A SAS token',
      'A lifecycle delete rule'
    ),
    correct: ['a'],
    explanation: 'Blob versioning automatically keeps previous versions of a blob whenever it is modified or deleted, so you can restore an earlier version after an unwanted overwrite. SAS controls access, static website serves content, and a delete rule removes data.',
    references: [REF_BLOB]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Cosmos DB partitioning and throughput.',
    options: opts4(
      'Provisioned throughput (RU/s) is distributed across physical partitions.',
      'A hot partition can be throttled even if the account has spare RU/s overall.',
      'The partition key value is immutable for an item once written.',
      'Cross-partition queries are always cheaper than single-partition queries.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'RU/s is split across physical partitions, so a skewed (hot) partition can throttle while overall capacity is unused. An item’s partition key value cannot be changed after creation. Cross-partition (fan-out) queries are generally MORE expensive than single-partition queries.',
    references: [REF_COSMOS_PARTITION, REF_COSMOS_RU]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Storage redundancy option keeps three synchronous copies in the primary region plus asynchronous copies in a secondary region for regional disaster recovery?',
    options: opts4(
      'Geo-redundant storage (GRS)',
      'Locally redundant storage (LRS)',
      'Premium SSD only',
      'No redundancy'
    ),
    correct: ['a'],
    explanation: 'GRS stores three synchronous replicas in the primary region (LRS) and asynchronously replicates to a paired secondary region, protecting against a regional outage. LRS only protects within one datacenter; Premium SSD is a disk tier, not blob redundancy.',
    references: [REF_BLOB]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'When using the Azure Blob SDK to upload a very large file efficiently and resiliently, which approach does the client library use under the hood?',
    options: opts4(
      'A single atomic PUT of the entire file in one request',
      'Splitting the upload into multiple blocks (staged then committed), enabling parallelism and retries',
      'Storing the file in Table storage',
      'Converting the file to a queue message'
    ),
    correct: ['b'],
    explanation: 'For large block blobs the SDK stages multiple blocks (Put Block) in parallel and then commits the block list (Put Block List), enabling parallel transfer and retry of individual blocks. A single PUT is impractical for very large files; Table/Queue are not blob storage.',
    references: [REF_BLOB_SDK]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to track and react to blob create and delete events at scale to feed a downstream pipeline. Which integration is recommended over polling the container?',
    options: opts4(
      'Azure Event Grid Blob Storage events',
      'A timer function that lists the container every minute',
      'Increasing the storage account tier',
      'A blob lease'
    ),
    correct: ['a'],
    explanation: 'Azure Storage integrates with Event Grid to publish BlobCreated/BlobDeleted events for push-based, scalable, near-real-time processing — far more efficient than polling/listing the container. Tier and leases do not provide event notifications.',
    references: [REF_EVENTGRID, REF_BLOB]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Azure Cosmos DB, choosing a partition key that results in many distinct values that are accessed evenly generally improves scalability and avoids throttling.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'A high-cardinality partition key with even read/write distribution spreads load across physical partitions, improving scalability and avoiding hot partitions that would otherwise be throttled while other partitions stay idle.',
    references: [REF_COSMOS_PARTITION]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A .NET app must perform a transactional batch of operations on multiple items that share the same partition key in Cosmos DB. Which capability supports this atomically?',
    options: opts4(
      'Transactional batch (operations within a single logical partition)',
      'Cross-partition distributed transactions across all partitions',
      'A SAS token',
      'Blob leases'
    ),
    correct: ['a'],
    explanation: 'Cosmos DB transactional batch executes multiple point operations atomically when all items share the same partition key (single logical partition). It does not support arbitrary cross-partition distributed transactions; SAS and blob leases are unrelated.',
    references: [REF_COSMOS]
  },

  // ── Implement Azure security (12) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a Container App to pull from a private Azure Container Registry and read a Key Vault secret with no stored credentials. What should you configure?',
    options: opts4(
      'A managed identity on the Container App with AcrPull on the registry and a Key Vault read role',
      'Registry admin credentials in the container environment',
      'A public registry and a public Key Vault',
      'A hard-coded service principal secret'
    ),
    correct: ['a'],
    explanation: 'Assigning a managed identity to the Container App and granting it AcrPull and a Key Vault secrets read role enables credential-free pull and secret access via Entra ID. Admin creds, public exposure, and hard-coded secrets are insecure.',
    references: [REF_MI, REF_KEYVAULT_RBAC]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which token issued by the Microsoft identity platform is intended only for the client to learn about the authenticated user and must NOT be sent to call a resource API?',
    options: opts4(
      'The ID token',
      'The access token',
      'The refresh token',
      'A SAS token'
    ),
    correct: ['a'],
    explanation: 'The ID token (OpenID Connect) conveys authentication info about the user to the client and should not be used as a credential to call APIs. The access token is presented to resource APIs; the refresh token obtains new tokens; SAS is a storage token.',
    references: [REF_OAUTH]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A single-page application (SPA) signs users in and calls an API. Which OAuth 2.0 flow is currently recommended for SPAs?',
    options: opts4(
      'Authorization code flow with PKCE',
      'Implicit grant flow',
      'Client credentials flow',
      'Resource owner password credentials'
    ),
    correct: ['a'],
    explanation: 'The authorization code flow with PKCE is the recommended flow for SPAs because PKCE protects the public client without a secret; the implicit flow is no longer recommended. Client credentials/ROPC are not for user sign-in in browser apps.',
    references: [REF_OAUTH, REF_MSAL]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You must rotate a database password regularly and have apps always use the current value with no redeploy. Which design is recommended?',
    options: opts4(
      'Store the password as a Key Vault secret and have the app read it (with caching) via managed identity',
      'Hard-code the password and redeploy on each rotation',
      'Put the password in a public app setting',
      'Email the password to developers'
    ),
    correct: ['a'],
    explanation: 'Storing the password in Key Vault and reading it through a managed identity (with in-memory caching/refresh) lets you rotate the secret centrally without redeploying the app. Hard-coding, public settings, and emailing secrets are insecure and require redeploys.',
    references: [REF_KEYVAULT_SECRETS, REF_MI]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Azure RBAC concept binds a security principal to a role at a particular scope (management group, subscription, resource group, or resource)?',
    options: opts4(
      'A role assignment',
      'A role definition',
      'A managed identity',
      'A SAS policy'
    ),
    correct: ['a'],
    explanation: 'A role assignment associates a principal (user, group, service principal, managed identity) with a role definition at a scope, granting the defined permissions there. The role definition lists permissions; managed identity is a principal; SAS is storage-specific.',
    references: [REF_RBAC]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A SAS token must allow only listing and reading blobs in one container for 2 hours. Which SAS properties enforce this least-privilege scope?',
    options: opts4(
      'Resource scope (container), permissions (read/list), and a 2-hour expiry (start/expiry time)',
      'Full account permissions with no expiry',
      'Write/delete permissions on the whole account',
      'No permissions and no expiry'
    ),
    correct: ['a'],
    explanation: 'A SAS encodes the signed resource/scope, the allowed permissions (e.g., read and list), and a validity window (start/expiry). Limiting it to the container with read/list and a 2-hour expiry enforces least privilege. Account-wide or no-expiry SAS is over-privileged.',
    references: [REF_SAS]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A user-assigned managed identity can be assigned to multiple Azure resources, allowing several services to share one identity and its role assignments.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'A user-assigned managed identity is a standalone Azure resource that can be attached to multiple resources, so they share the same identity and its RBAC assignments — useful when several services need identical access.',
    references: [REF_MI]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'In Microsoft Entra ID app registration, what is the purpose of a client secret or certificate credential?',
    options: opts4(
      'It authenticates a confidential client application to the identity platform when requesting tokens',
      'It encrypts the user’s browser session',
      'It signs the storage account',
      'It defines the app’s redirect URI'
    ),
    correct: ['a'],
    explanation: 'A client secret or certificate is the credential a confidential client (e.g., a web app or daemon) uses to prove its identity to the Microsoft identity platform when acquiring tokens (e.g., in client credentials or OBO flows). Certificates are preferred over secrets.',
    references: [REF_OAUTH, REF_ENTRA]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'An API protected by Microsoft Entra ID must ensure a caller has a specific permission. Which token claim should the API validate to enforce a delegated permission?',
    options: opts4(
      'The scp (scope) claim',
      'The iss claim only',
      'The exp claim only',
      'The storage account name'
    ),
    correct: ['a'],
    explanation: 'For delegated permissions, the access token’s scp (scope) claim lists granted scopes; the API checks it (alongside standard issuer/audience/expiry validation) to authorize the operation. App-only permissions use the roles claim. iss/exp alone do not convey permissions.',
    references: [REF_SCOPES, REF_OAUTH]
  },
  {
    domain: SECURITY, difficulty: 4, type: QType.SINGLE,
    stem: 'Your app must call Microsoft Graph with application permissions. Why must an administrator grant consent before the app can use these permissions?',
    options: opts4(
      'Application permissions grant tenant-wide access not tied to a user, so they require admin consent',
      'Because Graph is only available to admins',
      'Because delegated permissions are disabled by default',
      'Because tokens cannot be issued otherwise for any flow'
    ),
    correct: ['a'],
    explanation: 'Application permissions let the app act across the tenant without a signed-in user, which is high privilege, so an administrator must grant tenant-wide admin consent before the app can use them. Delegated permissions may use user consent depending on configuration.',
    references: [REF_SCOPES, REF_GRAPH]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Key Vault object type is designed to store TLS/SSL certificates with lifecycle management and optional auto-renewal via an integrated CA?',
    options: opts4(
      'A certificate',
      'A secret',
      'A key',
      'A SAS token'
    ),
    correct: ['a'],
    explanation: 'Key Vault certificate objects manage X.509/TLS certificates, including issuance, storage, and lifecycle (renewal) policies, optionally integrated with a supported certificate authority. Secrets store arbitrary values and keys are cryptographic keys; SAS is unrelated.',
    references: [REF_KEYVAULT]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'To avoid storing any storage connection string, you switch an app to Entra-based auth using DefaultAzureCredential. Which storage data-plane role lets it both read and write blobs?',
    options: opts4(
      'Storage Blob Data Contributor',
      'Reader',
      'Storage Blob Data Reader',
      'Owner of the subscription'
    ),
    correct: ['a'],
    explanation: 'Storage Blob Data Contributor grants read and write (and delete) access to blob data via Entra ID, matching the requirement. Reader/Storage Blob Data Reader are read-only at management/data plane respectively; subscription Owner is far too broad.',
    references: [REF_RBAC]
  },

  // ── Monitor, troubleshoot, and optimize Azure solutions (8) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need a single place to query logs and metrics from App Service, Functions, and storage to investigate an incident. Which Azure platform provides this unified observability?',
    options: opts4(
      'Azure Monitor (Metrics, Logs/Log Analytics, Application Insights)',
      'Azure Key Vault',
      'Azure Container Registry',
      'Azure App Configuration'
    ),
    correct: ['a'],
    explanation: 'Azure Monitor unifies metrics, logs (Log Analytics with KQL), and Application Insights APM across Azure resources for end-to-end observability and troubleshooting. Key Vault, ACR, and App Configuration are not monitoring platforms.',
    references: [REF_MONITOR]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Your App Service is slow only under load. Application Insights shows high dependency duration to SQL. What is the most likely effective first optimization?',
    options: opts4(
      'Investigate and tune the slow SQL queries/indexes (the identified bottleneck)',
      'Increase the function timeout',
      'Disable Application Insights',
      'Move blobs to the Archive tier'
    ),
    correct: ['a'],
    explanation: 'Dependency telemetry pinpointing slow SQL calls indicates the database is the bottleneck, so tuning the queries/indexes (or scaling the database) directly addresses the root cause. Disabling telemetry hides the problem; timeouts and blob tiering are irrelevant.',
    references: [REF_APPINSIGHTS]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'You configure autoscale on a VM Scale Set to add instances based on a custom Application Insights metric. What must the autoscale rule reference?',
    options: opts4(
      'The metric source and a threshold/aggregation with scale action and cool-down',
      'Only the maximum instance count',
      'A blob container name',
      'A Key Vault secret'
    ),
    correct: ['a'],
    explanation: 'An autoscale rule specifies the metric source, the time aggregation and threshold, the scale action (increase/decrease count), and a cool-down to prevent flapping. Just setting a max count or referencing storage/secrets does not define scaling behavior.',
    references: [REF_AUTOSCALE]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Distributed tracing in Application Insights correlates telemetry across services using a shared operation/trace identifier so a single request can be followed end to end.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Distributed tracing propagates a correlation/trace context (operation ID) across service boundaries so all spans for one request are linked, enabling end-to-end transaction diagnostics and the application map across components.',
    references: [REF_APPINSIGHTS]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A query to Cosmos DB occasionally returns 429 during nightly batch loads only. Which targeted optimization is most cost-effective?',
    options: opts4(
      'Use autoscale throughput (or temporarily raise RU/s) and implement retry with backoff for the batch window',
      'Permanently provision peak RU/s 24x7',
      'Switch to Strong consistency',
      'Disable indexing entirely'
    ),
    correct: ['a'],
    explanation: 'Autoscale throughput (or temporarily increasing RU/s during the batch) plus retry-with-backoff handles the periodic spike cost-effectively without paying peak capacity all day. Permanent peak provisioning is wasteful; consistency/indexing changes do not address the spike.',
    references: [REF_COSMOS_RU]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'You must alert when a custom Application Insights metric "QueueBacklog" exceeds 1000 for 5 minutes and notify an on-call team. What do you configure?',
    options: opts4(
      'An Azure Monitor alert rule with the metric condition and an action group',
      'A blob lifecycle rule',
      'A Cosmos DB TTL',
      'An App Service deployment slot'
    ),
    correct: ['a'],
    explanation: 'An Azure Monitor alert rule evaluates the metric/log condition (QueueBacklog > 1000 over 5 minutes) and triggers an action group (email, SMS, webhook, ITSM) to notify on-call. Lifecycle rules, TTL, and slots do not provide alerting/notification.',
    references: [REF_MONITOR, REF_APPINSIGHTS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'To diagnose intermittent 500 errors in an App Service web app, which built-in App Service diagnostic capability captures detailed error and request information?',
    options: opts4(
      'App Service diagnostics and logging (e.g., application/HTTP logs, Diagnose and solve problems)',
      'Key Vault soft delete',
      'ACR geo-replication',
      'Cosmos DB change feed'
    ),
    correct: ['a'],
    explanation: 'App Service provides built-in diagnostics — application and HTTP logs, failed request tracing, and the "Diagnose and solve problems" blade — to investigate errors like intermittent 500s. Key Vault, ACR, and Cosmos change feed are unrelated to web app diagnostics.',
    references: [REF_APPSVC_CONFIG]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'After deploying with sampling enabled, a developer needs the exact count of a rare critical error and is worried sampling drops it. What is the recommended way to ensure these critical events are not lost?',
    options: opts4(
      'Exclude critical telemetry from sampling (configure sampling to not sample those events) or use a separate non-sampled track',
      'Disable Application Insights entirely',
      'Increase the App Service plan size',
      'Move logs to Archive blob storage'
    ),
    correct: ['a'],
    explanation: 'Sampling can be configured to exclude specific critical telemetry types (or you can log them in a way not subject to sampling) so rare but important events are always retained while bulk telemetry is still sampled for cost. Disabling AI or scaling the plan does not solve this.',
    references: [REF_APPINSIGHTS_SAMPLING]
  },

  // ── Connect to and consume Azure services and third-party services (16) ──
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must publish an internal API to external partners with a developer portal, throttling, and key-based access. Which Azure service provides all of this?',
    options: opts4(
      'Azure API Management',
      'Azure Front Door only',
      'Azure Service Bus',
      'Azure Event Hubs'
    ),
    correct: ['a'],
    explanation: 'API Management provides a gateway, developer portal, subscription keys, and throttling/quota policies for publishing APIs to consumers. Front Door is a global L7 load balancer/CDN, while Service Bus and Event Hubs are messaging/streaming services.',
    references: [REF_APIM]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A consumer must process Service Bus messages in strict FIFO order for each customer while still allowing different customers to be processed in parallel. What should you enable?',
    options: opts4(
      'Sessions, using the customer id as the SessionId',
      'Duplicate detection',
      'Auto-forwarding',
      'ReceiveAndDelete mode'
    ),
    correct: ['a'],
    explanation: 'Enabling sessions and using the customer id as SessionId guarantees ordered, single-consumer processing per customer while different sessions (customers) can be processed concurrently. Duplicate detection, auto-forwarding, and ReceiveAndDelete do not provide per-key FIFO.',
    references: [REF_SB_SESSIONS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Event Grid cannot deliver an event after all retries. What should you configure so the undeliverable event is not lost?',
    options: opts4(
      'A dead-letter destination (a Blob Storage container)',
      'A larger Event Hub',
      'A Service Bus session',
      'A Key Vault secret'
    ),
    correct: ['a'],
    explanation: 'Event Grid lets you configure a dead-letter destination (an Azure Storage blob container) where events are sent after retry attempts are exhausted, preventing data loss and allowing later inspection. Event Hubs/sessions/secrets do not serve this role.',
    references: [REF_EVENTGRID_DELIVERY]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want API Management to call the backend using a managed identity instead of a stored key. Which policy lets the gateway acquire and attach a token using its managed identity?',
    options: opts4(
      'authentication-managed-identity',
      'rate-limit-by-key',
      'cache-lookup',
      'mock-response'
    ),
    correct: ['a'],
    explanation: 'The authentication-managed-identity policy makes API Management acquire an Entra token using its managed identity and attach it to the backend request, removing stored backend credentials. The other policies handle throttling, caching, and mocking.',
    references: [REF_APIM_POLICIES, REF_MI]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You must choose a service for high-volume telemetry/event streaming that supports multiple independent consumer groups and event replay within a retention window. Which Azure service fits best?',
    options: opts4(
      'Azure Event Hubs',
      'Azure Service Bus queue',
      'Azure CDN',
      'Azure App Configuration'
    ),
    correct: ['a'],
    explanation: 'Event Hubs is purpose-built for high-throughput event/telemetry streaming with partitions, multiple consumer groups reading independently, and replay within the retention window. Service Bus is enterprise messaging, CDN is content delivery, and App Configuration is configuration storage.',
    references: [REF_SB_VS_QUEUE, REF_EVENTHUBS]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure Service Bus entity supports one-to-many distribution where each subscription independently receives a copy of every matching message?',
    options: opts4(
      'A topic with subscriptions',
      'A single queue',
      'A blob container',
      'An event hub partition'
    ),
    correct: ['a'],
    explanation: 'A Service Bus topic delivers each published message to every subscription (subject to subscription filters), enabling one-to-many publish/subscribe. A queue is point-to-point (one consumer competes per message); blobs and event hub partitions are different constructs.',
    references: [REF_SERVICEBUS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'An app sends commands to a Service Bus queue but must avoid processing the same logical command twice if the sender retries. Which built-in feature helps achieve idempotent enqueue?',
    options: opts4(
      'Duplicate detection (based on MessageId within a window)',
      'Sessions',
      'Auto-delete on idle',
      'Partitioning only'
    ),
    correct: ['a'],
    explanation: 'Duplicate detection drops messages whose MessageId was already received within the configured detection window, so retried sends of the same command are not enqueued twice. Sessions provide ordering, not dedup; auto-delete and partitioning serve other goals.',
    references: [REF_SERVICEBUS]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You scale out Event Hubs consumers by running multiple EventProcessorClient instances. How is partition processing distributed among them?',
    options: opts4(
      'Each instance claims ownership of a subset of partitions and rebalances as instances join or leave',
      'Every instance reads all partitions simultaneously',
      'Only one instance is ever allowed regardless of count',
      'Partitions are randomly duplicated to all instances'
    ),
    correct: ['a'],
    explanation: 'EventProcessorClient coordinates partition ownership through the checkpoint store so each instance owns a subset of partitions and load rebalances when instances are added or removed, ensuring each partition is processed by one active consumer in the group.',
    references: [REF_EVENTHUBS_CP]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Event Grid supports filtering events by subject, event type, and advanced fields so a subscription only receives the events it cares about.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Event Grid subscriptions support subject (prefix/suffix), event type, and advanced filters on event data, so each subscriber receives only relevant events, reducing unnecessary processing.',
    references: [REF_EVENTGRID]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A web app calls Microsoft Graph to read the signed-in user’s calendar. Which type of permission should be requested?',
    options: opts4(
      'A delegated permission (e.g., Calendars.Read) consented by the user',
      'An application permission only',
      'A storage data role',
      'No permission is required for Graph'
    ),
    correct: ['a'],
    explanation: 'Reading the signed-in user’s data uses a delegated permission such as Calendars.Read, where the app acts on behalf of the consenting user. Application permissions are for app-only/daemon access; storage roles are unrelated; Graph always requires permissions.',
    references: [REF_GRAPH, REF_SCOPES]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'You must throttle each client to 10 requests per second at the API Management gateway, identifying clients by subscription key. Which policy do you use?',
    options: opts4(
      'rate-limit-by-key (keyed on the subscription key)',
      'cache-store',
      'set-backend-service',
      'validate-jwt'
    ),
    correct: ['a'],
    explanation: 'rate-limit-by-key enforces a call-rate limit per a specified key expression (such as the subscription key), throttling each client independently at the gateway. cache-store caches responses, set-backend-service routes, and validate-jwt checks tokens.',
    references: [REF_APIM_POLICIES]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scenario is the best fit for Azure Queue Storage rather than Service Bus?',
    options: opts4(
      'A simple, very large backlog of independent work items where advanced features (sessions, transactions, topics) are not needed',
      'Strict FIFO per entity with sessions',
      'Publish/subscribe to many subscribers with filters',
      'Transactional message processing across multiple entities'
    ),
    correct: ['a'],
    explanation: 'Azure Queue Storage is ideal for a simple, very high-volume queue of independent work items at low cost. Sessions/FIFO-per-entity, pub/sub with filters, and cross-entity transactions are Service Bus capabilities, not Queue Storage.',
    references: [REF_SB_VS_QUEUE, REF_QUEUE]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'An Event Grid subscription should only deliver events whose subject begins with "/blobServices/default/containers/images/". Which configuration achieves this?',
    options: opts4(
      'A subject begins-with filter on the event subscription',
      'A Service Bus session id',
      'An API Management product',
      'A Cosmos DB partition key'
    ),
    correct: ['a'],
    explanation: 'Event Grid event subscriptions support a "subject begins with" (and ends with) filter, so only events whose subject matches the prefix are delivered. Service Bus sessions, APIM products, and Cosmos partition keys are unrelated to Event Grid filtering.',
    references: [REF_EVENTGRID]
  },
  {
    domain: CONNECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A long-running consumer must keep a Service Bus message from being redelivered while it processes for longer than the default lock duration. Besides lock renewal, which design also addresses very long processing reliably?',
    options: opts4(
      'Acknowledge quickly by recording the work item and processing asynchronously with idempotent handling',
      'Switch to ReceiveAndDelete and ignore failures',
      'Disable dead-lettering',
      'Use Azure CDN as a buffer'
    ),
    correct: ['a'],
    explanation: 'For very long work, a robust pattern is to quickly complete the message after durably recording the work (e.g., to a store) and process asynchronously with idempotency, avoiding lock-expiry redelivery. ReceiveAndDelete risks loss; disabling DLQ/CDN do not help.',
    references: [REF_SERVICEBUS, REF_SB_DLQ]
  },
  {
    domain: CONNECT, difficulty: 4, type: QType.SINGLE,
    stem: 'API Management must aggregate calls to two backend services and return a combined response, transforming and caching the result. Which API Management capability enables composing this behavior at the gateway?',
    options: opts4(
      'Policies (e.g., send-request / send-one-way-request plus transformation and caching policies)',
      'A Cosmos DB stored procedure',
      'A blob lifecycle rule',
      'An autoscale rule'
    ),
    correct: ['a'],
    explanation: 'API Management policies such as send-request let the gateway call additional backends, then transformation policies combine/reshape responses and caching policies store the result — composing aggregation at the gateway without backend changes. The other options are unrelated services.',
    references: [REF_APIM_POLICIES]
  },
  {
    domain: CONNECT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which messaging service is best for ingesting and processing a continuous high-velocity stream of clickstream events for real-time analytics?',
    options: opts4(
      'Azure Event Hubs',
      'Azure Queue Storage',
      'Azure App Configuration',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'Azure Event Hubs is built for high-velocity event/telemetry stream ingestion (millions of events) feeding real-time analytics pipelines, with partitions and consumer groups. Queue Storage is a simple queue; App Configuration and Key Vault are not streaming services.',
    references: [REF_EVENTHUBS]
  }
];

const AZ204_DOMAINS = [
  { name: COMPUTE, weight: 27 },
  { name: STORAGE, weight: 17 },
  { name: SECURITY, weight: 18 },
  { name: MONITOR, weight: 13 },
  { name: CONNECT, weight: 25 }
];

const AZ204_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-az-204-p1',
    code: 'AZ-204-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering Azure compute (App Service, Functions, Container Apps/ACI/AKS), Azure storage (Blob, Cosmos DB), Azure security (Entra ID, Key Vault, managed identity), monitoring/optimization, and connecting to/consuming Azure and third-party services.',
    questions: P1
  },
  {
    slug: 'microsoft-az-204-p2',
    code: 'AZ-204-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-az-204-p3',
    code: 'AZ-204-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const AZ204_BUNDLE = {
  slug: 'microsoft-az-204',
  title: 'Microsoft Azure Developer Associate (AZ-204)',
  description: 'Unlimited AZ-204 practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering Azure compute solutions, Azure storage, Azure security, monitoring/troubleshooting/optimization, and connecting to and consuming Azure & third-party services, aligned to the Microsoft Azure Developer Associate (AZ-204) exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the AZ-204 bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:az204-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedAz204(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Azure cloud development, infrastructure, security, and the role-based Azure certification track including the Azure Developer Associate (AZ-204) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Azure cloud development, infrastructure, security, and the role-based Azure certification track including the Azure Developer Associate (AZ-204) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of AZ204_EXAMS) {
    const title = `Microsoft Azure Developer Associate (AZ-204) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Microsoft Azure Developer Associate (AZ-204) exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: AZ204_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:az204-seed' } });
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
          generatedBy: 'manual:az204-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: AZ204_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: AZ204_BUNDLE.slug },
    update: {
      title: AZ204_BUNDLE.title,
      description: AZ204_BUNDLE.description,
      price: AZ204_BUNDLE.price,
      priceVoucher: AZ204_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: AZ204_BUNDLE.slug,
      title: AZ204_BUNDLE.title,
      description: AZ204_BUNDLE.description,
      price: AZ204_BUNDLE.price,
      priceVoucher: AZ204_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-az-204-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-az-204-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-az-204-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-az-204-p1', tier: 'VOUCHER' as const, position: 4 }
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
