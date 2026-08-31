/**
 * HashiCorp Terraform Associate (003) bundle seed — vendor, three
 * practice-exam variants, bundle, and 195 blueprint-aligned questions.
 * Idempotent: replaces rows tagged `generatedBy: 'manual:terraform-seed'`
 * and upserts catalog rows.
 *
 * Exported as `seedTerraform(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/terraform.ts`) and the protected
 * admin API (`/api/admin/seed-terraform`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public HashiCorp Terraform
 * documentation and the Terraform Associate 003 exam objectives:
 *   - Infrastructure as Code (IaC) Concepts                — 10% (2)
 *   - The Purpose of Terraform (vs other IaC)              — 10% (2)
 *   - Terraform Fundamentals                               — 15% (3)
 *   - The Terraform Workflow                                — 15% (3)
 *   - Terraform Modules                                     — 15% (3)
 *   - Use Terraform Outside the Core Workflow              — 10% (2)
 *   - Implement and Maintain State                          — 15% (3)
 *   - Read, Generate, and Modify Configuration             — 10% (2)
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

const IAC = 'Infrastructure as Code (IaC) Concepts';
const PURPOSE = 'The Purpose of Terraform (vs other IaC)';
const FUND = 'Terraform Fundamentals';
const WORKFLOW = 'The Terraform Workflow';
const MODULES = 'Terraform Modules';
const OUTSIDE = 'Use Terraform Outside the Core Workflow';
const STATE = 'Implement and Maintain State';
const CONFIG = 'Read, Generate, and Modify Configuration';

const REF_IAC = { label: 'Terraform Docs — Infrastructure as Code', url: 'https://developer.hashicorp.com/terraform/intro' };
const REF_USECASES = { label: 'Terraform Docs — Use Cases', url: 'https://developer.hashicorp.com/terraform/intro/use-cases' };
const REF_CLOUD = { label: 'Terraform Docs — HCP Terraform', url: 'https://developer.hashicorp.com/terraform/cli/cloud' };
const REF_LANG = { label: 'Terraform Docs — Configuration Language', url: 'https://developer.hashicorp.com/terraform/language' };
const REF_PROVIDERS = { label: 'Terraform Docs — Providers', url: 'https://developer.hashicorp.com/terraform/language/providers' };
const REF_RESOURCES = { label: 'Terraform Docs — Resources', url: 'https://developer.hashicorp.com/terraform/language/resources' };
const REF_VARS = { label: 'Terraform Docs — Input Variables', url: 'https://developer.hashicorp.com/terraform/language/values/variables' };
const REF_OUTPUTS = { label: 'Terraform Docs — Output Values', url: 'https://developer.hashicorp.com/terraform/language/values/outputs' };
const REF_LOCALS = { label: 'Terraform Docs — Local Values', url: 'https://developer.hashicorp.com/terraform/language/values/locals' };
const REF_DATA = { label: 'Terraform Docs — Data Sources', url: 'https://developer.hashicorp.com/terraform/language/data-sources' };
const REF_STATE = { label: 'Terraform Docs — State', url: 'https://developer.hashicorp.com/terraform/language/state' };
const REF_BACKENDS = { label: 'Terraform Docs — Backends', url: 'https://developer.hashicorp.com/terraform/language/backend' };
const REF_LOCKING = { label: 'Terraform Docs — State Locking', url: 'https://developer.hashicorp.com/terraform/language/state/locking' };
const REF_REMOTE_STATE = { label: 'Terraform Docs — terraform_remote_state', url: 'https://developer.hashicorp.com/terraform/language/state/remote-state-data' };
const REF_MODULES = { label: 'Terraform Docs — Modules', url: 'https://developer.hashicorp.com/terraform/language/modules' };
const REF_MOD_SOURCES = { label: 'Terraform Docs — Module Sources', url: 'https://developer.hashicorp.com/terraform/language/modules/sources' };
const REF_REGISTRY = { label: 'Terraform Docs — Module Registry', url: 'https://developer.hashicorp.com/terraform/language/modules/syntax' };
const REF_CLI = { label: 'Terraform Docs — CLI Commands', url: 'https://developer.hashicorp.com/terraform/cli/commands' };
const REF_INIT = { label: 'Terraform Docs — terraform init', url: 'https://developer.hashicorp.com/terraform/cli/commands/init' };
const REF_PLAN = { label: 'Terraform Docs — terraform plan', url: 'https://developer.hashicorp.com/terraform/cli/commands/plan' };
const REF_APPLY = { label: 'Terraform Docs — terraform apply', url: 'https://developer.hashicorp.com/terraform/cli/commands/apply' };
const REF_FMT = { label: 'Terraform Docs — terraform fmt', url: 'https://developer.hashicorp.com/terraform/cli/commands/fmt' };
const REF_VALIDATE = { label: 'Terraform Docs — terraform validate', url: 'https://developer.hashicorp.com/terraform/cli/commands/validate' };
const REF_IMPORT = { label: 'Terraform Docs — terraform import', url: 'https://developer.hashicorp.com/terraform/cli/commands/import' };
const REF_STATE_CMD = { label: 'Terraform Docs — terraform state', url: 'https://developer.hashicorp.com/terraform/cli/commands/state' };
const REF_TAINT = { label: 'Terraform Docs — terraform taint', url: 'https://developer.hashicorp.com/terraform/cli/commands/taint' };
const REF_WORKSPACES = { label: 'Terraform Docs — Workspaces', url: 'https://developer.hashicorp.com/terraform/language/state/workspaces' };
const REF_META = { label: 'Terraform Docs — Meta-Arguments', url: 'https://developer.hashicorp.com/terraform/language/meta-arguments/depends_on' };
const REF_COUNT = { label: 'Terraform Docs — count', url: 'https://developer.hashicorp.com/terraform/language/meta-arguments/count' };
const REF_FOREACH = { label: 'Terraform Docs — for_each', url: 'https://developer.hashicorp.com/terraform/language/meta-arguments/for_each' };
const REF_LIFECYCLE = { label: 'Terraform Docs — lifecycle', url: 'https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle' };
const REF_DEPENDS = { label: 'Terraform Docs — Resource Dependencies', url: 'https://developer.hashicorp.com/terraform/language/resources/behavior' };
const REF_SETTINGS = { label: 'Terraform Docs — Terraform Settings', url: 'https://developer.hashicorp.com/terraform/language/settings' };
const REF_FUNCTIONS = { label: 'Terraform Docs — Built-in Functions', url: 'https://developer.hashicorp.com/terraform/language/functions' };
const REF_EXPRESSIONS = { label: 'Terraform Docs — Expressions', url: 'https://developer.hashicorp.com/terraform/language/expressions' };
const REF_CONSOLE = { label: 'Terraform Docs — terraform console', url: 'https://developer.hashicorp.com/terraform/cli/commands/console' };
const REF_OUTPUT_CMD = { label: 'Terraform Docs — terraform output', url: 'https://developer.hashicorp.com/terraform/cli/commands/output' };
const REF_DEPLOY_TUT = { label: 'Terraform Tutorials — Get Started', url: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Infrastructure as Code Concepts (2) ──
  {
    domain: IAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement BEST describes the core idea of Infrastructure as Code (IaC)?',
    options: opts4(
      'Provisioning infrastructure by manually clicking through a cloud console and recording the steps in a wiki.',
      'Defining and managing infrastructure through machine-readable configuration files that can be versioned, reviewed, and reused.',
      'Running operating-system patches automatically on a fixed schedule.',
      'Storing application source code in a version control system.'
    ),
    correct: ['b'],
    explanation: 'IaC means infrastructure is described in declarative/configuration files that can be version-controlled and reused. Manual console clicks and OS patching are not IaC, and storing app source code alone is just source control.',
    references: [REF_IAC]
  },
  {
    domain: IAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A team adopts IaC and commits all Terraform configuration to Git. Which benefit is MOST directly enabled by this practice?',
    options: opts4(
      'Infrastructure changes can be peer-reviewed and rolled back like application code.',
      'Terraform no longer needs to track state.',
      'Cloud provider credentials are no longer required.',
      'Resources are provisioned without any API calls.'
    ),
    correct: ['a'],
    explanation: 'Version-controlling configuration enables code review, history, and rollback of infrastructure changes. State is still required, credentials are still needed, and Terraform still calls provider APIs.',
    references: [REF_IAC]
  },

  // ── The Purpose of Terraform (2) ──
  {
    domain: PURPOSE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which characteristic distinguishes Terraform as a provisioning tool from configuration-management tools like Ansible, Chef, or Puppet?',
    options: opts4(
      'Terraform focuses on provisioning and managing the lifecycle of infrastructure resources, not on configuring software inside existing servers.',
      'Terraform can only manage a single cloud provider at a time.',
      'Terraform requires an agent installed on every managed machine.',
      'Terraform cannot create or destroy infrastructure resources.'
    ),
    correct: ['a'],
    explanation: 'Terraform is primarily a provisioning tool that manages the full lifecycle of infrastructure across many providers, while config-management tools specialize in configuring software on already-provisioned machines. Terraform is multi-cloud and agentless.',
    references: [REF_USECASES]
  },
  {
    domain: PURPOSE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is Terraform considered "cloud-agnostic" / multi-cloud?',
    options: opts4(
      'It only works with HashiCorp Cloud Platform.',
      'It uses a provider plugin model so the same workflow can manage AWS, Azure, GCP, Kubernetes, and many other platforms.',
      'It translates configuration into CloudFormation under the hood.',
      'It requires a different binary for each cloud provider.'
    ),
    correct: ['b'],
    explanation: 'Terraform uses a plugin-based provider architecture, so one consistent workflow and language manage resources across many platforms with a single binary. It does not delegate to CloudFormation.',
    references: [REF_PROVIDERS]
  },

  // ── Terraform Fundamentals (3) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Terraform command must be run FIRST in a new configuration directory to download provider plugins and prepare the backend?',
    options: opts4(
      'terraform plan',
      'terraform apply',
      'terraform init',
      'terraform validate'
    ),
    correct: ['c'],
    explanation: '`terraform init` initializes the working directory: it downloads provider plugins, installs modules, and configures the backend. Plan, apply, and validate all require an initialized directory.',
    references: [REF_INIT]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'In a Terraform configuration, which block is used to declare and constrain the provider plugins a configuration depends on?',
    options: opts4(
      'The `terraform { required_providers { ... } }` block.',
      'The `resource` block.',
      'The `output` block.',
      'The `data` block.'
    ),
    correct: ['a'],
    explanation: '`required_providers` inside the `terraform` settings block declares each provider\'s source address and version constraints. Resource/data blocks define infrastructure and outputs expose values.',
    references: [REF_SETTINGS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the Terraform configuration language (HCL).',
    options: opts4(
      'HCL is declarative — you describe the desired end state, not step-by-step instructions.',
      'Resources are addressed as `<resource_type>.<name>` within the configuration.',
      'Terraform configuration files must use a `.tf` (or `.tf.json`) extension to be loaded.',
      'Terraform executes resource blocks strictly in the order they appear in the file.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'HCL is declarative, resources are referenced as type.name, and config files use `.tf`/`.tf.json`. Terraform builds a dependency graph and does NOT rely on textual order of blocks.',
    references: [REF_LANG]
  },

  // ── The Terraform Workflow (3) ──
  {
    domain: WORKFLOW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the canonical Terraform core workflow?',
    options: opts4(
      'Write → Plan → Apply',
      'Build → Test → Deploy',
      'Init → Destroy → Apply',
      'Plan → Validate → Format'
    ),
    correct: ['a'],
    explanation: 'The Terraform core workflow is Write (author config), Plan (preview changes), and Apply (execute). The other sequences are not the documented core workflow.',
    references: [REF_DEPLOY_TUT]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `terraform plan` do?',
    options: opts4(
      'Permanently provisions all resources defined in the configuration.',
      'Creates an execution plan describing the actions Terraform would take to reach the desired state, without changing real infrastructure.',
      'Deletes all resources tracked in state.',
      'Uploads the state file to a remote backend.'
    ),
    correct: ['b'],
    explanation: '`terraform plan` is a read-only preview: it compares desired config to current state and shows additions/changes/deletions without modifying infrastructure. Apply performs changes; destroy removes resources.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'You run `terraform apply` and Terraform prompts "Do you want to perform these actions?". Which flag would skip this interactive approval (e.g. in CI)?',
    options: opts4(
      '-auto-approve',
      '-force',
      '-no-prompt',
      '-yes'
    ),
    correct: ['a'],
    explanation: '`terraform apply -auto-approve` skips the interactive confirmation. There is no `-force`, `-no-prompt`, or `-yes` flag for this purpose on apply.',
    references: [REF_APPLY]
  },

  // ── Terraform Modules (3) ──
  {
    domain: MODULES, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In Terraform, what is a module?',
    options: opts4(
      'A container for multiple resources that are used together, callable from other configurations.',
      'A single resource block.',
      'A cloud provider plugin binary.',
      'A state file stored in a remote backend.'
    ),
    correct: ['a'],
    explanation: 'A module is a reusable container of resources (and variables/outputs) that can be called from other configurations via a `module` block. It is not a single resource, a provider, or a state file.',
    references: [REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which `module` block argument specifies WHERE the module code comes from?',
    options: opts4(
      'version',
      'source',
      'providers',
      'depends_on'
    ),
    correct: ['b'],
    explanation: 'The `source` argument is mandatory and tells Terraform where to load the module (local path, registry, Git, etc.). `version` constrains registry module versions; the others have different roles.',
    references: [REF_MOD_SOURCES]
  },
  {
    domain: MODULES, difficulty: 3, type: QType.SINGLE,
    stem: 'A root module needs a value produced inside a child module `network` (e.g. a VPC ID). How is that value exposed and consumed?',
    options: opts4(
      'The child module declares an `output`; the root module references it as `module.network.<output_name>`.',
      'The root module reads the child module\'s state file directly.',
      'The child module declares a `variable`; the root references `var.network`.',
      'Child module values are global and need no declaration.'
    ),
    correct: ['a'],
    explanation: 'Child modules expose values via `output` blocks, consumed by the caller as `module.<name>.<output>`. Variables are inputs INTO a module, not outputs, and module internals are otherwise encapsulated.',
    references: [REF_OUTPUTS, REF_MODULES]
  },

  // ── Use Terraform Outside the Core Workflow (2) ──
  {
    domain: OUTSIDE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An EC2 instance was created manually in the AWS console and you want Terraform to manage it going forward. Which command brings the existing resource under Terraform management?',
    options: opts4(
      'terraform refresh',
      'terraform import',
      'terraform apply -replace',
      'terraform state rm'
    ),
    correct: ['b'],
    explanation: '`terraform import` associates an existing real-world resource with a Terraform resource address in state. `refresh` only updates state from reality, `-replace` recreates, and `state rm` removes tracking.',
    references: [REF_IMPORT]
  },
  {
    domain: OUTSIDE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command lets you interactively evaluate Terraform expressions and inspect values such as `var.region` or function results?',
    options: opts4(
      'terraform show',
      'terraform console',
      'terraform graph',
      'terraform output'
    ),
    correct: ['b'],
    explanation: '`terraform console` opens an interactive REPL to evaluate expressions, functions, and state data. `show` prints state/plan, `graph` emits the dependency graph, and `output` prints root output values.',
    references: [REF_CONSOLE]
  },

  // ── Implement and Maintain State (3) ──
  {
    domain: STATE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary purpose of the Terraform state file?',
    options: opts4(
      'To store provider plugin binaries.',
      'To map resources defined in configuration to real-world infrastructure objects and track metadata.',
      'To store the user\'s cloud credentials.',
      'To cache the output of `terraform fmt`.'
    ),
    correct: ['b'],
    explanation: 'State maps configuration to real resources and stores metadata Terraform needs to plan changes. It is not a credential store, plugin cache, or formatting cache.',
    references: [REF_STATE]
  },
  {
    domain: STATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is a remote backend (e.g. S3, HCP Terraform) recommended over the default local backend for team use?',
    options: opts4(
      'It makes Terraform run faster on a laptop.',
      'It provides shared state, optional state locking, and keeps sensitive state off individual workstations.',
      'It removes the need for provider plugins.',
      'It disables the need for `terraform init`.'
    ),
    correct: ['b'],
    explanation: 'Remote backends enable shared, centralized state with locking and reduce the risk of conflicting concurrent applies. They do not affect speed materially, providers, or init requirements.',
    references: [REF_BACKENDS]
  },
  {
    domain: STATE, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: State locking prevents two users from running operations that write to the same state at the same time, helping avoid state corruption.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. When supported by the backend, Terraform locks state during write operations so concurrent applies cannot corrupt it. Not all backends support locking, but the statement describes its purpose correctly.',
    references: [REF_LOCKING]
  },

  // ── Read, Generate, and Modify Configuration (2) ──
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to provide a configurable instance type without hard-coding it. Which construct should you use?',
    options: opts4(
      'An input variable declared with a `variable` block, referenced as `var.instance_type`.',
      'An `output` block.',
      'A `provider` block alias.',
      'A `terraform` settings block.'
    ),
    correct: ['a'],
    explanation: 'Input variables (`variable` blocks, referenced via `var.<name>`) parameterize configuration. Outputs expose values, provider aliases configure multiple provider instances, and the terraform block holds settings.',
    references: [REF_VARS]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Which construct lets you assign a name to an expression so it can be reused multiple times within a module without re-computing it?',
    options: opts4(
      'A local value (`locals` block), referenced as `local.<name>`.',
      'An input variable.',
      'A data source.',
      'A provisioner.'
    ),
    correct: ['a'],
    explanation: 'Local values defined in a `locals` block name a computed expression for reuse via `local.<name>`. Variables are external inputs, data sources read external data, and provisioners run scripts.',
    references: [REF_LOCALS]
  },

  // ── Added: Infrastructure as Code Concepts (+4) ──
  {
    domain: IAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is a benefit of provisioning infrastructure with IaC rather than manual processes?',
    options: opts4(
      'It removes the need to authenticate to cloud providers.',
      'It improves consistency and repeatability while reducing human error from manual steps.',
      'It guarantees infrastructure can never be changed.',
      'It eliminates the need for any state tracking.'
    ),
    correct: ['b'],
    explanation: 'Codifying infrastructure makes provisioning consistent and repeatable and reduces manual mistakes. It does not remove authentication, freeze infrastructure, or eliminate state.',
    references: [REF_IAC]
  },
  {
    domain: IAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach BEST exemplifies "immutable infrastructure" supported by IaC?',
    options: opts4(
      'Patching running servers in place over SSH for every change.',
      'Building a new image/resource for each change and replacing the old one rather than mutating it.',
      'Editing configuration directly in the cloud console.',
      'Keeping a single long-lived server forever and never replacing it.'
    ),
    correct: ['b'],
    explanation: 'Immutable infrastructure replaces resources with newly built ones instead of mutating existing servers in place, improving predictability. In-place patching and console edits are mutable, ad-hoc practices.',
    references: [REF_IAC]
  },
  {
    domain: IAC, difficulty: 1, type: QType.TRUE_FALSE,
    stem: 'True or False: Because IaC configuration is stored in version control, infrastructure changes can use the same pull-request review process as application code.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. Storing IaC in version control enables code review, history, and collaboration workflows (pull requests) for infrastructure, just like application code.',
    references: [REF_IAC]
  },
  {
    domain: IAC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL outcomes that IaC tools like Terraform help achieve.',
    options: opts4(
      'Reproducible environments across dev, staging, and prod.',
      'A documented, reviewable history of infrastructure changes.',
      'The ability to preview changes before applying them.',
      'Guaranteed elimination of all cloud costs.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'IaC delivers reproducibility, an auditable change history, and (with Terraform) plan previews. It does not eliminate cloud costs — you still pay for provisioned resources.',
    references: [REF_IAC, REF_USECASES]
  },

  // ── Added: The Purpose of Terraform (+4) ──
  {
    domain: PURPOSE, difficulty: 2, type: QType.SINGLE,
    stem: 'Terraform is described as "provider-agnostic." What does the provider plugin model primarily enable?',
    options: opts4(
      'Managing resources across many platforms with one consistent workflow and language.',
      'Running Terraform without any binary installed.',
      'Avoiding the need to ever declare resources.',
      'Storing state only on local disk.'
    ),
    correct: ['a'],
    explanation: 'Providers are plugins that let Terraform manage many platforms (clouds, SaaS, Kubernetes) through one consistent HCL workflow. It does not remove the binary, resources, or state.',
    references: [REF_PROVIDERS]
  },
  {
    domain: PURPOSE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why does Terraform build a resource dependency graph?',
    options: opts4(
      'To bill resources by dependency count.',
      'To determine the correct order to create, update, or destroy resources and parallelize where safe.',
      'To replace the need for a state file.',
      'To encrypt the configuration.'
    ),
    correct: ['b'],
    explanation: 'The dependency graph lets Terraform order operations correctly and run independent changes in parallel. It does not affect billing, replace state, or encrypt config.',
    references: [REF_DEPENDS]
  },
  {
    domain: PURPOSE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants one tool to provision a load balancer in AWS, a DNS record in Cloudflare, and a database in a managed provider — all in one config. Why is Terraform well suited?',
    options: opts4(
      'It only supports AWS so it is simpler.',
      'A single configuration can use multiple providers and wire their resources together with references.',
      'It requires a separate state file per provider by design.',
      'It cannot reference one provider\'s resource from another.'
    ),
    correct: ['b'],
    explanation: 'Terraform configurations can declare multiple providers and reference resources across them in one plan/apply, which is a core multi-cloud strength. References across providers are fully supported.',
    references: [REF_PROVIDERS, REF_USECASES]
  },
  {
    domain: PURPOSE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Terraform is agentless for the platforms it manages — it talks to provider APIs and does not require software pre-installed on target infrastructure.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. Terraform invokes provider APIs directly and does not need an agent on managed infrastructure, unlike some configuration-management tools.',
    references: [REF_USECASES]
  },

  // ── Added: Terraform Fundamentals (+7) ──
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which block type actually creates and manages an infrastructure object?',
    options: opts4(
      'resource',
      'data',
      'output',
      'variable'
    ),
    correct: ['a'],
    explanation: 'A `resource` block declares an infrastructure object Terraform creates/manages. `data` reads existing objects, `output` exposes values, and `variable` declares inputs.',
    references: [REF_RESOURCES]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Where does Terraform install provider plugins by default during `terraform init`?',
    options: opts4(
      'Into the system PATH.',
      'Into the `.terraform` directory within the working directory.',
      'Into the remote state backend.',
      'Into the dependency lock file.'
    ),
    correct: ['b'],
    explanation: 'Provider plugins and modules are installed under the `.terraform` directory in the working directory during init. The lock file records selections but does not hold the binaries.',
    references: [REF_INIT]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which environment variable enables detailed Terraform debug logging?',
    options: opts4(
      'TF_DEBUG',
      'TF_LOG',
      'TF_VERBOSE',
      'TF_TRACE_ONLY'
    ),
    correct: ['b'],
    explanation: 'Setting `TF_LOG` (e.g. to `TRACE` or `DEBUG`) enables verbose logging; `TF_LOG_PATH` writes it to a file. The other variables do not exist.',
    references: [REF_SETTINGS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'How do you set an input variable named `region` from the command line for a single run?',
    options: opts4(
      'terraform apply -var="region=us-east-1"',
      'terraform apply --set region=us-east-1',
      'terraform apply -region us-east-1',
      'terraform apply region=us-east-1'
    ),
    correct: ['a'],
    explanation: '`-var="name=value"` (or `-var-file`) sets input variables on the command line. Terraform also reads `TF_VAR_region` and `*.tfvars` files; the other syntaxes are invalid.',
    references: [REF_VARS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which file name is automatically loaded for variable values without any extra flag?',
    options: opts4(
      'terraform.tfvars',
      'variables.tf',
      'vars.json',
      'terraform.config'
    ),
    correct: ['a'],
    explanation: 'Terraform automatically loads `terraform.tfvars` and `*.auto.tfvars`. `variables.tf` typically declares variables (not values), and the other names are not auto-loaded.',
    references: [REF_VARS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid ways to assign a value to an input variable.',
    options: opts4(
      'A `-var` flag on the command line.',
      'A `*.tfvars` / `*.auto.tfvars` file.',
      'A `TF_VAR_<name>` environment variable.',
      'Defining it inside an `output` block.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Variables can be set via `-var`, `.tfvars` files, and `TF_VAR_` environment variables (plus interactive prompt for root). `output` blocks expose values; they do not assign variables.',
    references: [REF_VARS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the `terraform { required_version = ">= 1.5.0" }` setting do?',
    options: opts4(
      'Pins the AWS provider to 1.5.0.',
      'Constrains which Terraform CLI versions may run this configuration.',
      'Sets the state schema version.',
      'Forces a specific module version.'
    ),
    correct: ['b'],
    explanation: '`required_version` constrains the Terraform CLI version allowed to run the configuration. Provider versions use `required_providers`; module versions use the module block `version`.',
    references: [REF_SETTINGS]
  },

  // ── Added: The Terraform Workflow (+7) ──
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'In `terraform plan` output, what does a leading `+` next to a resource mean?',
    options: opts4(
      'The resource will be updated in place.',
      'The resource will be created.',
      'The resource will be destroyed.',
      'The resource will be replaced.'
    ),
    correct: ['b'],
    explanation: 'A `+` indicates creation, `~` update in place, `-` destroy, and `-/+` replacement. So `+` means Terraform will create the resource.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Running `terraform apply` with no saved plan file does what?',
    options: opts4(
      'Applies immediately with no preview.',
      'Generates a plan, shows it, and prompts for approval before making changes.',
      'Only formats the configuration.',
      'Refuses to run without `-out`.'
    ),
    correct: ['b'],
    explanation: '`terraform apply` without a plan file first runs a plan, displays it, and asks for confirmation (unless `-auto-approve`). It does not skip the preview or require `-out`.',
    references: [REF_APPLY]
  },
  {
    domain: WORKFLOW, difficulty: 1, type: QType.SINGLE,
    stem: 'Which command would you use to remove all managed infrastructure at the end of a temporary environment\'s life?',
    options: opts4(
      'terraform plan',
      'terraform destroy',
      'terraform fmt',
      'terraform validate'
    ),
    correct: ['b'],
    explanation: '`terraform destroy` tears down all resources tracked in state for the configuration. plan previews, fmt formats, and validate checks syntax.',
    references: [REF_CLI]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'You ran `terraform plan -out=tfplan` and want to inspect the saved plan in human-readable form. Which command does that?',
    options: opts4(
      'terraform show tfplan',
      'terraform output tfplan',
      'terraform console tfplan',
      'terraform validate tfplan'
    ),
    correct: ['a'],
    explanation: '`terraform show tfplan` renders a saved plan (or state) in readable form; `terraform show -json tfplan` emits JSON. The other commands do not read plan files.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command refreshes state and shows what would change but is guaranteed not to modify infrastructure?',
    options: opts4(
      'terraform apply',
      'terraform plan',
      'terraform destroy',
      'terraform import'
    ),
    correct: ['b'],
    explanation: '`terraform plan` is read-only: it computes and displays the diff without applying changes. apply/destroy modify infra; import mutates state.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the core write → plan → apply workflow.',
    options: opts4(
      '`plan` does not change real infrastructure.',
      '`apply` requires approval unless `-auto-approve` is given or a saved plan file is supplied.',
      'A saved plan file applied with `terraform apply tfplan` is executed without an additional prompt.',
      '`apply` always ignores the configuration and only reads state.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'plan is read-only; apply prompts unless auto-approved or given a saved plan; applying a saved plan skips the extra prompt. apply uses configuration plus state — it does not ignore configuration.',
    references: [REF_PLAN, REF_APPLY]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: `terraform apply` can be run safely before `terraform init` in a brand-new configuration directory.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['b'],
    explanation: 'False. `terraform init` must run first to install providers/modules and configure the backend; apply errors in an uninitialized directory.',
    references: [REF_INIT]
  },

  // ── Added: Terraform Modules (+7) ──
  {
    domain: MODULES, difficulty: 1, type: QType.SINGLE,
    stem: 'What is the "root module" in a Terraform configuration?',
    options: opts4(
      'The set of `.tf` files in the directory where Terraform is run.',
      'The first module published to the registry.',
      'The state file.',
      'The provider plugin directory.'
    ),
    correct: ['a'],
    explanation: 'The root module is the working directory configuration where Terraform is invoked; it may call child modules. It is not the registry, state, or plugin directory.',
    references: [REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'A registry module source is written as `hashicorp/consul/aws`. What do the three parts represent?',
    options: opts4(
      'Region / account / resource.',
      'Namespace / name / target provider.',
      'Version / hash / source.',
      'Bucket / key / region.'
    ),
    correct: ['b'],
    explanation: 'Public registry module addresses use `<NAMESPACE>/<NAME>/<PROVIDER>` (e.g. `hashicorp/consul/aws`). It is unrelated to regions, hashes, or buckets.',
    references: [REF_REGISTRY]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'To use a Git branch as a module source, which form is valid?',
    options: opts4(
      'source = "git::https://example.com/vpc.git?ref=dev"',
      'source = "branch://dev/vpc"',
      'source = "vpc.git@dev"',
      'source = "https://example.com/vpc#dev"'
    ),
    correct: ['a'],
    explanation: 'Git module sources use the `git::` prefix and a `?ref=` query for a branch/tag/commit. The other syntaxes are not valid Terraform module source forms.',
    references: [REF_MOD_SOURCES]
  },
  {
    domain: MODULES, difficulty: 3, type: QType.SINGLE,
    stem: 'A module is called with `count = 3`. How do you reference an output `id` of the second instance from the caller?',
    options: opts4(
      'module.thing[1].id',
      'module.thing.id[1]',
      'module.thing.1.id',
      'count.module.thing.id'
    ),
    correct: ['a'],
    explanation: 'With `count`, module instances are indexed: `module.<name>[<index>].<output>`, so the second is `module.thing[1].id`. The other forms are invalid address syntax.',
    references: [REF_COUNT, REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is pinning a registry module `version` (e.g. `version = "~> 4.0"`) considered a best practice?',
    options: opts4(
      'It makes `terraform init` skip downloading the module.',
      'It prevents unexpected breaking changes by controlling which module releases are used.',
      'It encrypts the module source.',
      'It is required for local path modules.'
    ),
    correct: ['b'],
    explanation: 'Version constraints protect you from unexpected breaking updates by bounding which module releases Terraform may select. Local path modules are not versioned, and version does not skip downloads or encrypt anything.',
    references: [REF_REGISTRY]
  },
  {
    domain: MODULES, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Terraform modules.',
    options: opts4(
      'Input variables pass values into a module.',
      'Output values expose data from a module to its caller.',
      'A module can call other (child) modules.',
      'A module\'s internal resources are directly addressable from the caller without outputs.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Modules take inputs via variables, expose data via outputs, and can nest child modules. Internal resources are encapsulated — the caller must use outputs, not reach inside.',
    references: [REF_MODULES, REF_OUTPUTS]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which `module` block meta-argument explicitly orders a module after another resource/module is created?',
    options: opts4(
      'depends_on',
      'source',
      'version',
      'sensitive'
    ),
    correct: ['a'],
    explanation: '`depends_on` on a module block creates an explicit ordering dependency. `source`/`version` locate the module; `sensitive` is not a module-block meta-argument.',
    references: [REF_META, REF_MODULES]
  },

  // ── Added: Use Terraform Outside the Core Workflow (+4) ──
  {
    domain: OUTSIDE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command prints a human-readable representation of the current state?',
    options: opts4(
      'terraform show',
      'terraform plan -state',
      'terraform fmt -state',
      'terraform init -show'
    ),
    correct: ['a'],
    explanation: '`terraform show` (with no arguments) renders the current state in readable form; it can also render a saved plan file. The other invocations are not valid.',
    references: [REF_CLI]
  },
  {
    domain: OUTSIDE, difficulty: 3, type: QType.SINGLE,
    stem: 'When importing an existing resource, what must already exist in your configuration for `terraform import aws_instance.web i-123` to succeed?',
    options: opts4(
      'A matching `resource "aws_instance" "web"` block.',
      'A saved plan file.',
      'An output block named web.',
      'A workspace named web.'
    ),
    correct: ['a'],
    explanation: 'Classic `terraform import` requires the target resource block to exist in configuration so the imported object can be bound to that address. It does not need a plan file, output, or workspace.',
    references: [REF_IMPORT]
  },
  {
    domain: OUTSIDE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a machine-readable JSON of all root outputs for a deployment pipeline. Which command?',
    options: opts4(
      'terraform output -json',
      'terraform show -outputs',
      'terraform console --json',
      'terraform state outputs'
    ),
    correct: ['a'],
    explanation: '`terraform output -json` emits all root output values as JSON for scripting. The other forms are not valid output-retrieval commands.',
    references: [REF_OUTPUT_CMD]
  },
  {
    domain: OUTSIDE, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: `terraform state` subcommands (list, show, mv, rm) let you inspect and surgically modify state outside the normal plan/apply cycle.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. The `terraform state` family is the supported way to inspect and advanced-modify state (list/show/mv/rm) without a full plan/apply.',
    references: [REF_STATE_CMD]
  },

  // ── Added: Implement and Maintain State (+7) ──
  {
    domain: STATE, difficulty: 1, type: QType.SINGLE,
    stem: 'What is the default backend Terraform uses if none is configured?',
    options: opts4(
      'The S3 backend.',
      'The local backend (a `terraform.tfstate` file on disk).',
      'HCP Terraform.',
      'No state is kept at all.'
    ),
    correct: ['b'],
    explanation: 'Without a configured backend, Terraform uses the local backend, writing `terraform.tfstate` to the working directory. State is always kept; it is just stored locally.',
    references: [REF_BACKENDS]
  },
  {
    domain: STATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows the attributes of a single resource recorded in state?',
    options: opts4(
      'terraform state show ADDR',
      'terraform output ADDR',
      'terraform plan ADDR',
      'terraform fmt ADDR'
    ),
    correct: ['a'],
    explanation: '`terraform state show <address>` prints the stored attributes of one resource. `output` reads outputs, `plan` previews changes, and `fmt` formats files.',
    references: [REF_STATE_CMD]
  },
  {
    domain: STATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates a new CLI workspace named "staging"?',
    options: opts4(
      'terraform workspace new staging',
      'terraform workspace create staging',
      'terraform new workspace staging',
      'terraform workspace add staging'
    ),
    correct: ['a'],
    explanation: '`terraform workspace new <name>` creates and switches to a new workspace; `terraform workspace select` switches to an existing one. The other forms are invalid.',
    references: [REF_WORKSPACES]
  },
  {
    domain: STATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Within configuration, how do you reference the name of the currently selected CLI workspace?',
    options: opts4(
      'terraform.workspace',
      'var.workspace',
      'local.workspace',
      'workspace.current'
    ),
    correct: ['a'],
    explanation: 'The `terraform.workspace` expression returns the current workspace name, often used to vary naming/sizing per environment. The other references are not built-in.',
    references: [REF_WORKSPACES]
  },
  {
    domain: STATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why should the state file generally NOT be committed to a public Git repository?',
    options: opts4(
      'It is too large for Git.',
      'It may contain sensitive values (secrets, IPs) and can cause conflicts/corruption with concurrent edits.',
      'Git cannot store JSON.',
      'Terraform refuses to read state from Git.'
    ),
    correct: ['b'],
    explanation: 'State can hold secrets and is prone to merge conflicts/corruption if shared via Git; a locking remote backend is recommended instead. Size and JSON support are not the issues.',
    references: [REF_STATE, REF_BACKENDS]
  },
  {
    domain: STATE, difficulty: 3, type: QType.SINGLE,
    stem: 'A backend supports locking. What is the main risk if locking were unavailable and two engineers ran `apply` simultaneously?',
    options: opts4(
      'Slightly slower applies.',
      'State corruption or lost updates from concurrent writes.',
      'Provider plugins would be deleted.',
      'The configuration would be reformatted.'
    ),
    correct: ['b'],
    explanation: 'Concurrent writes to the same state without locking can corrupt it or lose updates. Locking serializes write operations to prevent this; it is unrelated to formatting or plugins.',
    references: [REF_LOCKING]
  },
  {
    domain: STATE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid uses of the `terraform state` command family.',
    options: opts4(
      'Listing tracked resource addresses (`state list`).',
      'Moving a resource to a new address (`state mv`).',
      'Removing a resource from state without destroying it (`state rm`).',
      'Downloading provider plugins (`state init`).'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '`state list`, `state mv`, and `state rm` are real subcommands. There is no `state init`; provider plugins are installed by `terraform init`.',
    references: [REF_STATE_CMD]
  },

  // ── Added: Read, Generate, and Modify Configuration (+5) ──
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to iterate over a map to create one resource per key with stable addresses. Which meta-argument is best?',
    options: opts4(
      'for_each',
      'count',
      'depends_on',
      'lifecycle'
    ),
    correct: ['a'],
    explanation: '`for_each` over a map/set keys instances by key, giving stable addresses when the collection changes (unlike `count`, which uses positional indexes). depends_on and lifecycle do not iterate.',
    references: [REF_FOREACH]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Which declaration prevents an output value from being shown in CLI plan/apply output?',
    options: opts4(
      'Adding `sensitive = true` to the `output` block.',
      'Adding `hidden = true` to the `output` block.',
      'Wrapping the value in `nonsensitive()`.',
      'Setting `count = 0` on the output.'
    ),
    correct: ['a'],
    explanation: 'Marking an output `sensitive = true` redacts it from CLI output (it is still stored in state). `nonsensitive()` does the opposite; `hidden` and `count` on outputs are not how this works.',
    references: [REF_OUTPUTS]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'Which expression accesses the `id` attribute of a resource declared as `resource "aws_vpc" "main"`?',
    options: opts4(
      'aws_vpc.main.id',
      'var.aws_vpc.main.id',
      'resource.aws_vpc.main.id',
      'module.aws_vpc.main.id'
    ),
    correct: ['a'],
    explanation: 'Managed resource attributes are referenced as `<type>.<name>.<attr>` — here `aws_vpc.main.id`. The `var.`/`module.`/`resource.` prefixes are wrong for a managed resource attribute reference.',
    references: [REF_EXPRESSIONS]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Which function returns the first non-null argument and is useful for variable defaulting?',
    options: opts4(
      'coalesce',
      'lookup',
      'flatten',
      'try'
    ),
    correct: ['a'],
    explanation: '`coalesce` returns the first non-null/non-empty argument, handy for defaults. `lookup` reads a map key, `flatten` flattens nested lists, and `try` swallows evaluation errors.',
    references: [REF_FUNCTIONS]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A `validation` block inside a `variable` declaration can enforce custom rules (e.g. allowed values) and fail the run with a message if violated.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. Variable `validation` blocks define a `condition` and `error_message`, rejecting invalid input early with a clear message.',
    references: [REF_VARS]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Infrastructure as Code Concepts (2) ──
  {
    domain: IAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the following is an advantage of declarative IaC (like Terraform) over an imperative scripting approach?',
    options: opts4(
      'You must specify every API call in the exact order to execute.',
      'You describe the desired end state and the tool determines the operations needed to reach it.',
      'It cannot detect drift from the desired state.',
      'It always requires an agent on the target machine.'
    ),
    correct: ['b'],
    explanation: 'Declarative IaC lets you state the desired end result; the engine computes the required changes and can detect drift. Imperative scripting requires ordering every step manually.',
    references: [REF_IAC]
  },
  {
    domain: IAC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Treating infrastructure as code allows the same configuration to be reliably reproduced across multiple environments (dev, staging, prod).',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. Reproducibility across environments is a key IaC benefit — the same versioned configuration (parameterized by variables) recreates consistent infrastructure.',
    references: [REF_IAC]
  },

  // ── The Purpose of Terraform (2) ──
  {
    domain: PURPOSE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'How does Terraform state help Terraform achieve its purpose of safe, predictable changes?',
    options: opts4(
      'It stores the desired configuration so Git is unnecessary.',
      'It records what Terraform manages so plans can show an accurate diff between desired config and real infrastructure.',
      'It encrypts all provider API traffic.',
      'It eliminates the need for provider plugins.'
    ),
    correct: ['b'],
    explanation: 'State lets Terraform compare desired configuration with the last-known real infrastructure to produce an accurate execution plan. It does not replace version control, encrypt API traffic, or remove providers.',
    references: [REF_STATE]
  },
  {
    domain: PURPOSE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL benefits Terraform provides as an infrastructure provisioning tool.',
    options: opts4(
      'A consistent workflow across many providers.',
      'An execution plan that previews changes before they are applied.',
      'Tracking of resource relationships via a dependency graph.',
      'Automatic configuration of application software inside running VMs without any provisioner.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Terraform offers a uniform multi-provider workflow, plan previews, and graph-based dependency ordering. It does NOT inherently configure in-VM software — that is the domain of configuration-management tools (or explicit provisioners).',
    references: [REF_USECASES]
  },

  // ── Terraform Fundamentals (3) ──
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which source address format correctly identifies the official AWS provider in `required_providers`?',
    options: opts4(
      'source = "aws"',
      'source = "hashicorp/aws"',
      'source = "terraform-provider-aws"',
      'source = "registry/aws/latest"'
    ),
    correct: ['b'],
    explanation: 'Provider source addresses use `<NAMESPACE>/<TYPE>` (here `hashicorp/aws`), optionally with a host prefix. The bare name and the other forms are not valid source addresses.',
    references: [REF_PROVIDERS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'In `version = "~> 1.2.0"` inside `required_providers`, what does the `~>` operator mean?',
    options: opts4(
      'Exactly version 1.2.0 only.',
      'Allow the rightmost version component to increment — here >= 1.2.0 and < 1.3.0.',
      'Any version greater than 1.2.0 with no upper bound.',
      'Any version less than 1.2.0.'
    ),
    correct: ['b'],
    explanation: 'The pessimistic constraint `~>` allows the last specified component to increase. `~> 1.2.0` permits 1.2.x but not 1.3.0. Exact pinning uses `= 1.2.0`.',
    references: [REF_SETTINGS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the role of the dependency lock file (`.terraform.lock.hcl`)?',
    options: opts4(
      'It stores the Terraform state.',
      'It records the selected provider versions and hashes so the same versions are used on subsequent runs.',
      'It locks the state during apply.',
      'It contains the cloud credentials.'
    ),
    correct: ['b'],
    explanation: 'The lock file pins provider selections (versions + hashes) for reproducible installs across machines. It is unrelated to state storage, state locking, or credentials.',
    references: [REF_INIT]
  },

  // ── The Terraform Workflow (3) ──
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to save a plan to a file and apply exactly that plan later. Which commands do this?',
    options: opts4(
      'terraform plan -out=tfplan, then terraform apply tfplan',
      'terraform plan > tfplan, then terraform apply < tfplan',
      'terraform save tfplan, then terraform run tfplan',
      'terraform plan --export tfplan, then terraform deploy tfplan'
    ),
    correct: ['a'],
    explanation: '`terraform plan -out=tfplan` writes a binary plan file; `terraform apply tfplan` applies exactly that saved plan with no further prompt. Shell redirection or invented flags do not work.',
    references: [REF_PLAN, REF_APPLY]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command destroys all remote objects managed by the current configuration?',
    options: opts4(
      'terraform delete',
      'terraform destroy',
      'terraform apply -remove',
      'terraform state rm'
    ),
    correct: ['b'],
    explanation: '`terraform destroy` removes all infrastructure tracked in state for the configuration. `state rm` only stops tracking a resource without destroying it; the other commands do not exist.',
    references: [REF_CLI]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'A single resource is misbehaving and you want Terraform to destroy and recreate ONLY that resource on the next apply (current recommended approach).',
    options: opts4(
      'terraform apply -replace="aws_instance.web"',
      'terraform taint aws_instance.web only',
      'terraform destroy -target then re-apply manually each time',
      'terraform refresh aws_instance.web'
    ),
    correct: ['a'],
    explanation: '`terraform apply -replace=ADDR` is the current recommended way to force replacement of a specific resource. `terraform taint` is deprecated in favor of `-replace`; refresh only syncs state.',
    references: [REF_APPLY, REF_TAINT]
  },

  // ── Terraform Modules (3) ──
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'When you reference a module from the public Terraform Registry, which arguments are typically required in the `module` block?',
    options: opts4(
      'source and (recommended) version',
      'count and for_each',
      'provider and backend',
      'depends_on and lifecycle'
    ),
    correct: ['a'],
    explanation: 'Registry modules need a `source` address; specifying `version` is strongly recommended to pin a known release. The other pairs are unrelated meta-arguments/blocks.',
    references: [REF_REGISTRY]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'How do you pass values INTO a child module?',
    options: opts4(
      'By setting the module\'s declared input variables as arguments in the `module` block.',
      'By editing the child module\'s state file.',
      'Through the child module\'s `output` blocks.',
      'Through environment variables only.'
    ),
    correct: ['a'],
    explanation: 'A module\'s input variables are set as arguments within the calling `module` block. Outputs send values back to the caller; you do not edit state to pass inputs.',
    references: [REF_MODULES, REF_VARS]
  },
  {
    domain: MODULES, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Terraform module source types.',
    options: opts4(
      'A local path such as "./modules/network".',
      'A Terraform Registry address such as "terraform-aws-modules/vpc/aws".',
      'A Git repository such as "git::https://example.com/vpc.git".',
      'A raw state file URL such as "state://prod.tfstate".'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Local paths, registry addresses, and Git (and other VCS/HTTP/bucket) sources are supported module source types. There is no `state://` module source.',
    references: [REF_MOD_SOURCES]
  },

  // ── Use Terraform Outside the Core Workflow (2) ──
  {
    domain: OUTSIDE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command produces a visual representation (DOT graph) of the resource dependency graph?',
    options: opts4(
      'terraform graph',
      'terraform show -graph',
      'terraform plan -graph',
      'terraform console -graph'
    ),
    correct: ['a'],
    explanation: '`terraform graph` outputs the dependency graph in DOT format for visualization. The other commands do not have a `-graph` mode.',
    references: [REF_CLI]
  },
  {
    domain: OUTSIDE, difficulty: 3, type: QType.SINGLE,
    stem: 'You suspect the real infrastructure has drifted from state (someone changed a resource manually). Which command updates state to match real-world resources without modifying infrastructure?',
    options: opts4(
      'terraform apply -refresh-only',
      'terraform destroy',
      'terraform import',
      'terraform fmt'
    ),
    correct: ['a'],
    explanation: '`terraform apply -refresh-only` reconciles state with the actual remote objects without changing infrastructure. Import adds a new resource to state; destroy removes infra; fmt only formats files.',
    references: [REF_PLAN, REF_STATE]
  },

  // ── Implement and Maintain State (3) ──
  {
    domain: STATE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists all resource addresses currently tracked in the Terraform state?',
    options: opts4(
      'terraform state list',
      'terraform show list',
      'terraform list state',
      'terraform get state'
    ),
    correct: ['a'],
    explanation: '`terraform state list` prints the resource addresses in state. The other forms are not valid Terraform subcommands.',
    references: [REF_STATE_CMD]
  },
  {
    domain: STATE, difficulty: 3, type: QType.SINGLE,
    stem: 'A resource was removed from configuration but you want Terraform to STOP managing it WITHOUT destroying the real resource. Which command achieves this?',
    options: opts4(
      'terraform destroy -target=ADDR',
      'terraform state rm ADDR',
      'terraform taint ADDR',
      'terraform apply -replace=ADDR'
    ),
    correct: ['b'],
    explanation: '`terraform state rm` removes the resource from state so Terraform no longer manages it, leaving the real object intact. Destroy deletes it; taint/replace force recreation.',
    references: [REF_STATE_CMD]
  },
  {
    domain: STATE, difficulty: 3, type: QType.SINGLE,
    stem: 'When using an S3 remote backend, which additional mechanism is commonly configured to provide state locking?',
    options: opts4(
      'A DynamoDB table (or S3-native locking) referenced by the backend configuration.',
      'A second S3 bucket for backups only.',
      'An EC2 instance acting as a lock server.',
      'A local file on each engineer\'s laptop.'
    ),
    correct: ['a'],
    explanation: 'The S3 backend traditionally uses a DynamoDB table (newer versions also support S3-native lockfiles) to coordinate state locking and prevent concurrent writes. A backup bucket or local file does not provide locking.',
    references: [REF_LOCKING, REF_BACKENDS]
  },

  // ── Read, Generate, and Modify Configuration (2) ──
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to read attributes of an EXISTING resource that Terraform does not manage (e.g. an existing AMI) for use in configuration. Which construct fits?',
    options: opts4(
      'A `data` source block.',
      'A `resource` block.',
      'An `output` block.',
      'A `provisioner` block.'
    ),
    correct: ['a'],
    explanation: 'Data sources let configuration read information about existing/external objects without managing them. Resource blocks create/manage objects; outputs export values; provisioners run scripts.',
    references: [REF_DATA]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Which built-in function would you use to join a list of strings into a single string with a comma separator?',
    options: opts4(
      'concat(",", list)',
      'join(",", list)',
      'merge(",", list)',
      'format(",", list)'
    ),
    correct: ['b'],
    explanation: '`join(separator, list)` concatenates list elements into a string using the separator. `concat` joins lists into a list, `merge` combines maps, and `format` does printf-style formatting.',
    references: [REF_FUNCTIONS]
  },

  // ── Added: Infrastructure as Code Concepts (+4) ──
  {
    domain: IAC, difficulty: 1, type: QType.SINGLE,
    stem: 'Which of the following is NOT a goal of Infrastructure as Code?',
    options: opts4(
      'Reproducible, automated provisioning.',
      'Version-controlled, reviewable infrastructure changes.',
      'Ad-hoc, undocumented manual changes directly in the cloud console.',
      'Consistent environments across dev, staging, and prod.'
    ),
    correct: ['c'],
    explanation: 'Ad-hoc, undocumented manual console changes are exactly what IaC seeks to eliminate. Reproducibility, versioning, and environment consistency are core IaC goals.',
    references: [REF_IAC]
  },
  {
    domain: IAC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company uses IaC and wants to know exactly what changed and who approved it for an audit. Which IaC practice provides this?',
    options: opts4(
      'Storing configuration in version control with peer-reviewed pull requests.',
      'Editing resources by hand and emailing screenshots.',
      'Disabling state to avoid records.',
      'Granting everyone console admin rights.'
    ),
    correct: ['a'],
    explanation: 'Versioned configuration plus reviewed pull requests yields a clear, attributable audit trail of infrastructure changes. The other options remove or undermine traceability.',
    references: [REF_IAC]
  },
  {
    domain: IAC, difficulty: 2, type: QType.SINGLE,
    stem: 'How does IaC help with disaster recovery?',
    options: opts4(
      'It backs up running VM disks automatically.',
      'The codified configuration can recreate infrastructure consistently in a new region or account.',
      'It prevents all outages from ever happening.',
      'It stores customer data redundantly.'
    ),
    correct: ['b'],
    explanation: 'Because infrastructure is codified, the same configuration can rebuild environments reliably elsewhere, aiding disaster recovery. IaC does not back up disks or guarantee zero outages.',
    references: [REF_USECASES]
  },
  {
    domain: IAC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: With declarative IaC you specify the desired end state and the tool figures out the operations required to reach it.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. Declarative IaC tools like Terraform take a desired-state description and compute the create/update/delete actions needed to converge to it.',
    references: [REF_IAC]
  },

  // ── Added: The Purpose of Terraform (+4) ──
  {
    domain: PURPOSE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a primary reason teams choose Terraform over writing custom cloud SDK scripts?',
    options: opts4(
      'Terraform tracks state and produces a reviewable plan, removing the need to hand-code create/update/delete logic.',
      'Terraform requires no provider credentials.',
      'Terraform is the only tool that can call cloud APIs.',
      'Terraform forbids the use of variables.'
    ),
    correct: ['a'],
    explanation: 'Terraform manages state and computes plans automatically, sparing teams from hand-writing idempotent create/update/delete logic. It still needs credentials and supports variables.',
    references: [REF_USECASES]
  },
  {
    domain: PURPOSE, difficulty: 3, type: QType.SINGLE,
    stem: 'What problem does Terraform\'s execution plan specifically solve?',
    options: opts4(
      'It encrypts the state file at rest.',
      'It lets you review proposed changes before they are applied, reducing surprise destructive actions.',
      'It installs provider plugins.',
      'It rotates cloud credentials.'
    ),
    correct: ['b'],
    explanation: 'The plan previews exactly what will be created, changed, or destroyed so risky actions can be caught before apply. Plugin install and credential handling are separate concerns.',
    references: [REF_PLAN]
  },
  {
    domain: PURPOSE, difficulty: 2, type: QType.SINGLE,
    stem: 'Compared with click-ops in a console, what does Terraform add for repeatable infrastructure?',
    options: opts4(
      'A codified, versionable definition plus a consistent plan/apply workflow.',
      'Free cloud compute.',
      'Automatic application code deployment.',
      'Elimination of the need for any cloud account.'
    ),
    correct: ['a'],
    explanation: 'Terraform turns infrastructure into versioned code with a consistent workflow, unlike manual console operations. It does not provide free compute or deploy application code by itself.',
    references: [REF_IAC, REF_USECASES]
  },
  {
    domain: PURPOSE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that correctly describe Terraform\'s purpose and design.',
    options: opts4(
      'It is primarily an infrastructure provisioning tool.',
      'It uses providers to support many platforms.',
      'It produces an execution plan before changing infrastructure.',
      'It is mainly a configuration-management tool for installing software inside servers.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Terraform is a provisioning tool that uses providers and produces a plan before applying. In-server software configuration is the domain of config-management tools.',
    references: [REF_USECASES, REF_PROVIDERS]
  },

  // ── Added: Terraform Fundamentals (+7) ──
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command would you run after adding a new provider to `required_providers` so it is downloaded?',
    options: opts4(
      'terraform init',
      'terraform plan',
      'terraform fmt',
      'terraform output'
    ),
    correct: ['a'],
    explanation: 'Adding or changing required providers requires re-running `terraform init` to install them. plan/fmt/output do not install providers.',
    references: [REF_INIT, REF_PROVIDERS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `terraform init -upgrade` do?',
    options: opts4(
      'Upgrades the Terraform CLI binary.',
      'Allows providers/modules to be upgraded to the newest versions allowed by constraints, updating the lock file.',
      'Upgrades the remote state schema.',
      'Reinstalls the operating system packages.'
    ),
    correct: ['b'],
    explanation: '`terraform init -upgrade` re-selects the newest provider/module versions permitted by constraints and updates `.terraform.lock.hcl`. It does not upgrade the CLI itself.',
    references: [REF_INIT]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Precedence: a variable `region` is set by a `terraform.tfvars` file AND by a `-var` flag on the command line. Which value wins?',
    options: opts4(
      'The `.tfvars` file value.',
      'The `-var` command-line value.',
      'Terraform errors on conflict.',
      'The environment variable always wins.'
    ),
    correct: ['b'],
    explanation: 'Command-line `-var`/`-var-file` flags have higher precedence than `.tfvars`/`.auto.tfvars` files and `TF_VAR_` environment variables, so the `-var` value wins.',
    references: [REF_VARS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which type constraint declares a variable that must be a map of strings?',
    options: opts4(
      'type = map(string)',
      'type = list(string)',
      'type = string(map)',
      'type = object'
    ),
    correct: ['a'],
    explanation: '`map(string)` constrains the variable to a map whose values are strings. `list(string)` is a list, and the other forms are not valid type syntax.',
    references: [REF_VARS]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which block configures authentication and endpoints for a platform such as AWS?',
    options: opts4(
      'The `provider` block.',
      'The `output` block.',
      'The `variable` block.',
      'The `locals` block.'
    ),
    correct: ['a'],
    explanation: 'The `provider` block configures provider-specific settings like region/credentials/endpoints. outputs expose values, variables declare inputs, locals name expressions.',
    references: [REF_PROVIDERS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the `terraform` settings block.',
    options: opts4(
      'It can declare `required_version` for the CLI.',
      'It can declare `required_providers` with source and version.',
      'It can declare a `backend` for state storage.',
      'It is where you define resources to create.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The `terraform` block holds `required_version`, `required_providers`, and `backend` settings. Resources are declared in `resource` blocks, not the terraform block.',
    references: [REF_SETTINGS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Terraform automatically loads every file ending in `.tf` in the working directory regardless of file name.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. Terraform loads all `.tf` (and `.tf.json`) files in the directory; the split into main.tf/variables.tf/outputs.tf is convention, not a requirement.',
    references: [REF_LANG]
  },

  // ── Added: The Terraform Workflow (+7) ──
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'In plan output, what does a `~` prefix on a resource mean?',
    options: opts4(
      'Create',
      'Update in place',
      'Destroy',
      'No change'
    ),
    correct: ['b'],
    explanation: '`~` indicates an in-place update; `+` is create, `-` is destroy, and `-/+` is replacement. Unchanged resources are not listed by default.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the recommended way to skip the approval prompt during automated `terraform destroy` in CI?',
    options: opts4(
      'terraform destroy -auto-approve',
      'terraform destroy -force',
      'terraform destroy -y',
      'terraform destroy --no-confirm'
    ),
    correct: ['a'],
    explanation: '`-auto-approve` skips the interactive confirmation for both apply and destroy. The legacy `-force` flag was removed; `-y`/`--no-confirm` do not exist.',
    references: [REF_APPLY]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'You want plan/apply to refresh state from real infrastructure but you are confident nothing drifted and want a faster run. Which flag skips the refresh?',
    options: opts4(
      'terraform plan -refresh=false',
      'terraform plan -no-state',
      'terraform plan -skip',
      'terraform plan -fast'
    ),
    correct: ['a'],
    explanation: '`-refresh=false` tells Terraform to skip the state refresh against real resources. The other flags are not valid Terraform options.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 1, type: QType.SINGLE,
    stem: 'Which is the FIRST step in the Terraform core workflow?',
    options: opts4(
      'Write the configuration.',
      'Apply the configuration.',
      'Destroy the configuration.',
      'Import existing resources.'
    ),
    correct: ['a'],
    explanation: 'The core workflow is Write → Plan → Apply, so authoring (writing) the configuration comes first. Apply/destroy/import come later or are outside the core loop.',
    references: [REF_DEPLOY_TUT]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A teammate asks how to see proposed changes without risk of modifying anything. What do you tell them to run?',
    options: opts4(
      'terraform apply',
      'terraform plan',
      'terraform destroy',
      'terraform state rm'
    ),
    correct: ['b'],
    explanation: '`terraform plan` previews changes read-only. apply and destroy mutate infrastructure; `state rm` mutates state.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'After `terraform apply tfplan` using a previously saved plan, why is there no second confirmation prompt?',
    options: opts4(
      'Saved plan files are encrypted.',
      'A saved plan already represents an approved set of actions, so Terraform executes it directly.',
      '`-auto-approve` is always implied by `init`.',
      'Plan files disable all output.'
    ),
    correct: ['b'],
    explanation: 'Applying a saved plan executes exactly the previously reviewed actions, so no further approval is requested. This is unrelated to encryption or init.',
    references: [REF_APPLY]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL commands that can change real infrastructure.',
    options: opts4(
      'terraform apply',
      'terraform destroy',
      'terraform plan',
      'terraform validate'
    ),
    correct: ['a', 'b'],
    explanation: 'apply and destroy mutate real infrastructure. plan only previews and validate only checks configuration syntax/consistency.',
    references: [REF_APPLY, REF_CLI]
  },

  // ── Added: Terraform Modules (+7) ──
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about module input variables is correct?',
    options: opts4(
      'They are declared in the child module and assigned by the calling module block.',
      'They are declared in the calling module and read by the child via output.',
      'They are global and require no declaration.',
      'They are stored in the state file as the only way to pass values.'
    ),
    correct: ['a'],
    explanation: 'A child module declares its inputs with `variable` blocks; the caller supplies values as arguments in the `module` block. Outputs flow data back to the caller.',
    references: [REF_VARS, REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 1, type: QType.SINGLE,
    stem: 'What is the main motivation for using modules?',
    options: opts4(
      'To encrypt configuration.',
      'To package and reuse a set of resources with a clean input/output interface (DRY).',
      'To avoid using providers.',
      'To bypass the need for state.'
    ),
    correct: ['b'],
    explanation: 'Modules promote reuse and abstraction by bundling related resources behind a defined interface (inputs/outputs), keeping configuration DRY. They do not replace providers or state.',
    references: [REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'A local module is referenced with `source = "../modules/vpc"`. What is true of local path sources?',
    options: opts4(
      'They are not versioned; they track whatever is at that path.',
      'They require a `version` argument.',
      'They are downloaded from the registry.',
      'They must use the `git::` prefix.'
    ),
    correct: ['a'],
    explanation: 'Local path modules are not versioned — Terraform uses the code at that relative path directly. The `version` argument applies only to registry modules.',
    references: [REF_MOD_SOURCES]
  },
  {
    domain: MODULES, difficulty: 3, type: QType.SINGLE,
    stem: 'A module is called with `for_each = toset(["a","b"])`. How is the "b" instance\'s output `arn` referenced from the caller?',
    options: opts4(
      'module.thing["b"].arn',
      'module.thing.b.arn',
      'module.thing[1].arn',
      'module.thing.arn["b"]'
    ),
    correct: ['a'],
    explanation: 'With `for_each`, instances are keyed by the set/map key: `module.<name>["<key>"].<output>`, so `module.thing["b"].arn`. Numeric indexing is for `count`, not `for_each`.',
    references: [REF_FOREACH, REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'Where can you discover community and verified modules to reuse?',
    options: opts4(
      'The Terraform Registry (registry.terraform.io).',
      'The local backend.',
      'The state file.',
      'The `.terraform.lock.hcl` file.'
    ),
    correct: ['a'],
    explanation: 'The public Terraform Registry hosts published (including verified) modules and providers for reuse. State, backends, and the lock file are unrelated to module discovery.',
    references: [REF_REGISTRY]
  },
  {
    domain: MODULES, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Adding or changing a `module` block requires running `terraform init` (or `terraform get`) before the next plan.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. New or changed module sources must be installed via `terraform init` (or `terraform get`) before Terraform can plan with them.',
    references: [REF_INIT, REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL valid module `source` values.',
    options: opts4(
      '"./modules/app"',
      '"terraform-aws-modules/vpc/aws"',
      '"git::https://github.com/org/repo.git//subdir?ref=v1.0.0"',
      '"backend://prod"'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Local paths, registry addresses, and Git URLs (including subdir and ref) are valid module sources. There is no `backend://` source scheme.',
    references: [REF_MOD_SOURCES]
  },

  // ── Added: Use Terraform Outside the Core Workflow (+4) ──
  {
    domain: OUTSIDE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command opens an interactive REPL to test expressions against current state?',
    options: opts4(
      'terraform console',
      'terraform shell',
      'terraform repl',
      'terraform eval'
    ),
    correct: ['a'],
    explanation: '`terraform console` is the interactive expression evaluator. `shell`, `repl`, and `eval` are not Terraform subcommands.',
    references: [REF_CONSOLE]
  },
  {
    domain: OUTSIDE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need read-only access to another team\'s VPC ID that they expose as a Terraform output in their own state. Best approach?',
    options: opts4(
      'Use the `terraform_remote_state` data source pointed at their backend.',
      'Copy their `.tfstate` into your repo.',
      'Hardcode the VPC ID as a string.',
      'Run `terraform import` on their VPC.'
    ),
    correct: ['a'],
    explanation: 'The `terraform_remote_state` data source reads exported outputs from another configuration\'s state safely (read-only). Copying state or hardcoding is fragile; import would take over management.',
    references: [REF_REMOTE_STATE]
  },
  {
    domain: OUTSIDE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command emits the dependency graph for use with a visualization tool like Graphviz?',
    options: opts4(
      'terraform graph',
      'terraform show -dot',
      'terraform plan -dot',
      'terraform draw'
    ),
    correct: ['a'],
    explanation: '`terraform graph` outputs DOT-format graph data you can render with Graphviz. The other forms are not valid commands.',
    references: [REF_CLI]
  },
  {
    domain: OUTSIDE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to retrieve only the value of a single root output named `endpoint` for a shell script. Which command?',
    options: opts4(
      'terraform output -raw endpoint',
      'terraform show endpoint',
      'terraform get endpoint',
      'terraform console endpoint'
    ),
    correct: ['a'],
    explanation: '`terraform output -raw endpoint` prints just the string value of that output, ideal for scripting. `show`/`get`/`console` do not retrieve a single output that way.',
    references: [REF_OUTPUT_CMD]
  },

  // ── Added: Implement and Maintain State (+7) ──
  {
    domain: STATE, difficulty: 1, type: QType.SINGLE,
    stem: 'What is the default local state file name?',
    options: opts4(
      'state.json',
      'terraform.tfstate',
      'tfstate.lock',
      '.terraform'
    ),
    correct: ['b'],
    explanation: 'The local backend writes `terraform.tfstate` (with a `terraform.tfstate.backup` previous copy). `.terraform` is the plugin/module directory, not state.',
    references: [REF_STATE]
  },
  {
    domain: STATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command switches the active workspace to an existing one named "prod"?',
    options: opts4(
      'terraform workspace select prod',
      'terraform workspace new prod',
      'terraform workspace switch prod',
      'terraform select workspace prod'
    ),
    correct: ['a'],
    explanation: '`terraform workspace select <name>` switches to an existing workspace; `new` would create one. `switch` and the last form are not valid.',
    references: [REF_WORKSPACES]
  },
  {
    domain: STATE, difficulty: 3, type: QType.SINGLE,
    stem: 'A backend block is added for the first time to a config that already has local state. What does `terraform init` offer?',
    options: opts4(
      'To migrate the existing local state into the new backend.',
      'To delete the local state silently.',
      'To ignore the backend until next apply.',
      'Nothing — backends cannot be added later.'
    ),
    correct: ['a'],
    explanation: 'When a backend is added/changed, `terraform init` prompts to migrate existing state into the new backend. Backends can be added later; state is not silently deleted.',
    references: [REF_INIT, REF_BACKENDS]
  },
  {
    domain: STATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which backend is purpose-built to provide managed remote state, remote runs, and locking as a service?',
    options: opts4(
      'The local backend.',
      'HCP Terraform (Terraform Cloud) / `cloud` block.',
      'The `terraform.tfvars` file.',
      'The `.terraform` directory.'
    ),
    correct: ['b'],
    explanation: 'HCP Terraform (configured via the `cloud` block or `remote` backend) provides managed state, remote operations, and locking. The local backend stores state on disk only.',
    references: [REF_CLOUD]
  },
  {
    domain: STATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Two engineers share an S3 backend with a DynamoDB lock table. Engineer A is mid-apply. What happens when Engineer B runs apply?',
    options: opts4(
      'B\'s apply proceeds in parallel, risking corruption.',
      'B is blocked/errors with a state lock until A\'s operation completes.',
      'B overwrites A\'s state immediately.',
      'B\'s apply is queued for one hour automatically.'
    ),
    correct: ['b'],
    explanation: 'With locking, B cannot acquire the state lock while A holds it, so B\'s operation fails fast or waits rather than corrupting state. There is no automatic one-hour queue.',
    references: [REF_LOCKING]
  },
  {
    domain: STATE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Each Terraform CLI workspace maintains its own distinct state while sharing the same configuration and backend.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. Workspaces give multiple isolated states for one configuration/backend, enabling parallel environments without copying code.',
    references: [REF_WORKSPACES]
  },
  {
    domain: STATE, difficulty: 3, type: QType.SINGLE,
    stem: 'You accidentally deleted a resource from configuration and ran apply, destroying it, but want it back without recreating from scratch — what would have prevented this destroy?',
    options: opts4(
      'A `lifecycle { prevent_destroy = true }` on the resource.',
      'Setting `sensitive = true` on an output.',
      'Adding `depends_on`.',
      'Running `terraform fmt` first.'
    ),
    correct: ['a'],
    explanation: '`prevent_destroy = true` makes Terraform reject any plan that would destroy that resource, guarding critical infrastructure. The other options do not block destruction.',
    references: [REF_LIFECYCLE]
  },

  // ── Added: Read, Generate, and Modify Configuration (+5) ──
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'Which expression accesses a value from a map variable `tags` at key "Name"?',
    options: opts4(
      'var.tags["Name"]',
      'var.tags.Name()',
      'tags::Name',
      'var[Name].tags'
    ),
    correct: ['a'],
    explanation: 'Map values are read with bracket (or dot) syntax: `var.tags["Name"]`. The other forms are not valid HCL expressions.',
    references: [REF_EXPRESSIONS]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Which construct best avoids repeating the same complex expression in several places within one module?',
    options: opts4(
      'A `locals` value referenced as `local.<name>`.',
      'A `provisioner`.',
      'A second `provider` block.',
      'A `backend` block.'
    ),
    correct: ['a'],
    explanation: 'Local values name a computed expression once and reuse it via `local.<name>`, keeping configuration DRY. Provisioners, providers, and backends serve different purposes.',
    references: [REF_LOCALS]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'Which interpolation correctly embeds a variable into a string?',
    options: opts4(
      '"web-${var.env}"',
      '"web-$var.env"',
      '"web-{{var.env}}"',
      '"web-#var.env#"'
    ),
    correct: ['a'],
    explanation: 'HCL string interpolation uses `${ ... }`, e.g. `"web-${var.env}"`. The other syntaxes are not valid Terraform interpolation.',
    references: [REF_EXPRESSIONS]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to transform a list of names into a map keyed by name. Which expression style does this?',
    options: opts4(
      'A `for` expression producing a map: `{ for n in var.names : n => upper(n) }`.',
      'A `count` meta-argument.',
      'A `provisioner` block.',
      'A `terraform_remote_state` data source.'
    ),
    correct: ['a'],
    explanation: 'A `for` expression with `key => value` syntax builds a map from a collection. count multiplies resources, provisioners run scripts, and remote_state reads other state.',
    references: [REF_EXPRESSIONS]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Marking an input variable `sensitive = true` causes Terraform to redact its value from plan/apply CLI output.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. A `sensitive` variable (or output) is redacted in CLI output, though its value is still stored in state and used during operations.',
    references: [REF_VARS]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Infrastructure as Code Concepts (2) ──
  {
    domain: IAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is "configuration drift" in the context of IaC?',
    options: opts4(
      'When the Terraform binary version differs from the provider version.',
      'When the real infrastructure no longer matches the state/configuration because of out-of-band changes.',
      'When two modules use the same variable name.',
      'When the plan output is longer than the apply output.'
    ),
    correct: ['b'],
    explanation: 'Drift is when actual infrastructure diverges from what Terraform expects (recorded in state/config), usually due to manual changes. Version mismatches and naming overlaps are different concerns.',
    references: [REF_STATE]
  },
  {
    domain: IAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which practice is MOST aligned with the IaC principle of idempotence?',
    options: opts4(
      'Re-applying the same configuration repeatedly results in the same end state with no unintended changes.',
      'Each apply creates brand-new duplicate resources.',
      'Manual hotfixes are applied directly in the console.',
      'Configuration files are deleted after every apply.'
    ),
    correct: ['a'],
    explanation: 'Idempotence means applying the same desired-state configuration repeatedly converges to the same result without spurious changes. Duplicating resources or manual hotfixes break that property.',
    references: [REF_IAC]
  },

  // ── The Purpose of Terraform (2) ──
  {
    domain: PURPOSE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which scenario is a strong use case for Terraform specifically (rather than a config-management tool)?',
    options: opts4(
      'Installing and patching nginx inside 500 already-running servers.',
      'Provisioning a multi-cloud landing zone: VPCs, subnets, load balancers, and managed databases.',
      'Tailing application logs in real time.',
      'Running unit tests for an application.'
    ),
    correct: ['b'],
    explanation: 'Provisioning and wiring cloud infrastructure across providers is Terraform\'s core use case. In-server software install/patching is configuration management; logging and unit tests are unrelated.',
    references: [REF_USECASES]
  },
  {
    domain: PURPOSE, difficulty: 3, type: QType.SINGLE,
    stem: 'HCP Terraform / Terraform Cloud adds which capability beyond the open-source CLI for the purpose of safe team collaboration?',
    options: opts4(
      'Remote state storage with remote runs, access controls, and a private module registry.',
      'The ability to write configuration in HCL.',
      'Support for the `terraform plan` command.',
      'The provider plugin architecture.'
    ),
    correct: ['a'],
    explanation: 'HCP Terraform adds managed remote state, remote operations, RBAC, policy, and a private registry for team workflows. HCL, `plan`, and the provider model are part of the open-source CLI itself.',
    references: [REF_CLOUD]
  },

  // ── Terraform Fundamentals (3) ──
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command rewrites Terraform configuration files to the canonical HCL style/format?',
    options: opts4(
      'terraform fmt',
      'terraform style',
      'terraform lint',
      'terraform validate'
    ),
    correct: ['a'],
    explanation: '`terraform fmt` rewrites `.tf` files to the canonical format. `terraform validate` checks syntax/consistency but does not reformat; `style` and `lint` are not Terraform subcommands.',
    references: [REF_FMT]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `terraform validate` check?',
    options: opts4(
      'Whether the configuration is syntactically valid and internally consistent, without contacting any provider/remote API.',
      'Whether the real cloud resources still exist.',
      'Whether the state file is locked.',
      'Whether your cloud credentials are valid.'
    ),
    correct: ['a'],
    explanation: '`terraform validate` checks configuration syntax and internal consistency in an initialized directory; it does not access remote state, real resources, or credentials.',
    references: [REF_VALIDATE]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'You configure two instances of the AWS provider for different regions. Which feature lets a resource choose the non-default provider instance?',
    options: opts4(
      'Provider `alias` plus the resource\'s `provider` meta-argument (e.g. provider = aws.west).',
      'A separate backend block per region.',
      'Two `terraform` settings blocks.',
      'The `count` meta-argument.'
    ),
    correct: ['a'],
    explanation: 'Multiple provider configurations use `alias`; a resource selects one via the `provider = <name>.<alias>` meta-argument. Backends and the terraform block are unrelated; count just multiplies instances.',
    references: [REF_PROVIDERS]
  },

  // ── The Terraform Workflow (3) ──
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During `terraform plan`, a resource shows the symbol `-/+`. What does this indicate?',
    options: opts4(
      'The resource will be created only.',
      'The resource will be destroyed and then re-created (replacement).',
      'The resource will be left unchanged.',
      'The resource will be imported.'
    ),
    correct: ['b'],
    explanation: 'In plan output, `-/+` means destroy then create (replacement). `+` is create, `~` is update in place, `-` is destroy, and unchanged resources are not shown.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'You changed only one resource and want to limit the plan/apply to that resource (use sparingly). Which flag does this?',
    options: opts4(
      '-target="aws_instance.web"',
      '-only="aws_instance.web"',
      '-resource="aws_instance.web"',
      '-scope="aws_instance.web"'
    ),
    correct: ['a'],
    explanation: 'The `-target=ADDR` flag restricts operations to the specified resource (and its dependencies). It is intended for exceptional use. The other flags do not exist.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'After editing `backend` configuration in the `terraform` block, what must you do before plan/apply works again?',
    options: opts4(
      'Run `terraform init` (Terraform will prompt to migrate/reconfigure the backend).',
      'Run `terraform fmt`.',
      'Delete the state file manually.',
      'Nothing — backend changes take effect automatically.'
    ),
    correct: ['a'],
    explanation: 'Backend changes require re-running `terraform init`, which prompts to migrate or reconfigure state. Backend changes are NOT picked up automatically, and deleting state is unsafe.',
    references: [REF_INIT, REF_BACKENDS]
  },

  // ── Terraform Modules (3) ──
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'After adding a new `module` block that sources a registry module, which command must you run before `plan`?',
    options: opts4(
      'terraform get or terraform init (to install the module).',
      'terraform fmt',
      'terraform console',
      'terraform output'
    ),
    correct: ['a'],
    explanation: 'New/changed modules must be installed via `terraform init` (or `terraform get`) before planning. fmt, console, and output do not install modules.',
    references: [REF_MODULES, REF_INIT]
  },
  {
    domain: MODULES, difficulty: 3, type: QType.SINGLE,
    stem: 'A child module declares `variable "name" {}` with no default. What happens if the calling `module` block does not set `name`?',
    options: opts4(
      'Terraform uses an empty string automatically.',
      'Terraform errors because a required input variable is not set.',
      'Terraform ignores the variable.',
      'Terraform prompts for it only during destroy.'
    ),
    correct: ['b'],
    explanation: 'A variable with no `default` is required; omitting it for a child module causes an error (child module variables cannot be supplied interactively). A missing default does not become an empty string.',
    references: [REF_VARS, REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to deploy three near-identical environments from one module. Which meta-argument on the `module` block creates multiple instances keyed by a map?',
    options: opts4(
      'for_each',
      'depends_on',
      'provider',
      'lifecycle'
    ),
    correct: ['a'],
    explanation: '`for_each` on a module block instantiates the module once per map/set element, keyed by the element key. `depends_on` only orders, `provider` passes providers, and `lifecycle` is not a module-block meta-argument.',
    references: [REF_FOREACH, REF_MODULES]
  },

  // ── Use Terraform Outside the Core Workflow (2) ──
  {
    domain: OUTSIDE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command prints the values of the root module\'s output variables from current state?',
    options: opts4(
      'terraform output',
      'terraform show outputs',
      'terraform console -output',
      'terraform get output'
    ),
    correct: ['a'],
    explanation: '`terraform output` reads root output values from state and can emit a specific one or JSON. The other invocations are not valid commands for this purpose.',
    references: [REF_OUTPUT_CMD]
  },
  {
    domain: OUTSIDE, difficulty: 3, type: QType.SINGLE,
    stem: 'One configuration needs to consume outputs produced by ANOTHER configuration\'s remote state. Which data source enables this?',
    options: opts4(
      'data "terraform_remote_state"',
      'data "external"',
      'data "local_file"',
      'resource "terraform_state"'
    ),
    correct: ['a'],
    explanation: 'The `terraform_remote_state` data source reads outputs from another configuration\'s state backend. `external` runs an external program, `local_file` reads a file, and `terraform_state` is not a resource.',
    references: [REF_REMOTE_STATE]
  },

  // ── Implement and Maintain State (3) ──
  {
    domain: STATE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement about Terraform CLI workspaces is correct?',
    options: opts4(
      'Each workspace has its own separate state, but they share the same configuration.',
      'Workspaces store separate provider plugins.',
      'Workspaces are the same as Git branches.',
      'Workspaces require a different backend per workspace.'
    ),
    correct: ['a'],
    explanation: 'CLI workspaces provide multiple named states for the same configuration/backend, enabling parallel environments. They are not Git branches and do not duplicate plugins or backends.',
    references: [REF_WORKSPACES]
  },
  {
    domain: STATE, difficulty: 3, type: QType.SINGLE,
    stem: 'A resource was renamed in configuration (its address changed). Which command moves the existing object in state to the new address WITHOUT destroying it?',
    options: opts4(
      'terraform state mv OLD_ADDR NEW_ADDR',
      'terraform import NEW_ADDR',
      'terraform apply -replace=OLD_ADDR',
      'terraform refresh'
    ),
    correct: ['a'],
    explanation: '`terraform state mv` re-keys an existing object to a new address, avoiding destroy/recreate. Import would create a duplicate-state tracking, replace recreates, and refresh only syncs.',
    references: [REF_STATE_CMD]
  },
  {
    domain: STATE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Terraform state.',
    options: opts4(
      'State may contain sensitive values (e.g. passwords) and should be stored securely.',
      'Manually hand-editing the state JSON is discouraged in favor of `terraform state` commands.',
      'A remote backend can enable state locking to prevent concurrent corrupting writes.',
      'State is optional and Terraform can always rebuild it for free with no risk.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'State can hold secrets, should be edited via `terraform state` (not by hand), and remote backends can lock it. State is essential — losing or carelessly rebuilding it risks orphaned/destroyed resources.',
    references: [REF_STATE, REF_STATE_CMD]
  },

  // ── Read, Generate, and Modify Configuration (2) ──
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to create N identical subnets where N comes from a variable. Which meta-argument is the simplest fit?',
    options: opts4(
      'count = var.subnet_count',
      'depends_on = var.subnet_count',
      'provider = var.subnet_count',
      'lifecycle = var.subnet_count'
    ),
    correct: ['a'],
    explanation: '`count` creates a fixed number of near-identical instances of a resource indexed numerically. `depends_on` orders, `provider` selects a provider, and `lifecycle` is a nested block, not a numeric multiplier.',
    references: [REF_COUNT]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to prevent Terraform from accidentally destroying a critical database resource. Which configuration achieves this?',
    options: opts4(
      'A `lifecycle` block with `prevent_destroy = true` on the resource.',
      'Setting `count = 0` on the resource.',
      'Adding `depends_on = []`.',
      'Marking the resource output as `sensitive = true`.'
    ),
    correct: ['a'],
    explanation: '`lifecycle { prevent_destroy = true }` makes Terraform reject any plan that would destroy the resource. `count = 0` would actually remove it, depends_on orders dependencies, and sensitive only hides output values.',
    references: [REF_LIFECYCLE]
  },

  // ── Added: Infrastructure as Code Concepts (+4) ──
  {
    domain: IAC, difficulty: 1, type: QType.SINGLE,
    stem: 'Which best describes a key reason organizations adopt IaC?',
    options: opts4(
      'To make every change require a manual ticket and console session.',
      'To automate provisioning so environments are consistent and quickly reproducible.',
      'To stop tracking what infrastructure exists.',
      'To remove the need for cloud accounts.'
    ),
    correct: ['b'],
    explanation: 'IaC automates provisioning for consistent, fast, reproducible environments. It does not require manual tickets, stop tracking infrastructure, or remove cloud accounts.',
    references: [REF_IAC]
  },
  {
    domain: IAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A team scales from one environment to ten using the same parameterized configuration. Which IaC property is demonstrated?',
    options: opts4(
      'Reproducibility / repeatability.',
      'Statelessness.',
      'Manual provisioning.',
      'Vendor lock-in.'
    ),
    correct: ['a'],
    explanation: 'Recreating many consistent environments from one parameterized configuration illustrates reproducibility/repeatability, a central IaC benefit.',
    references: [REF_IAC]
  },
  {
    domain: IAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is "self-service" infrastructure often cited as an IaC benefit?',
    options: opts4(
      'Teams can provision approved, codified infrastructure via a repeatable pipeline instead of ticketing ops manually.',
      'It removes the need for any approvals ever.',
      'It deletes infrastructure automatically every night.',
      'It bypasses provider APIs.'
    ),
    correct: ['a'],
    explanation: 'Codified, reviewed infrastructure can be offered through automated pipelines, enabling safe self-service. It does not abolish approvals or bypass provider APIs.',
    references: [REF_USECASES]
  },
  {
    domain: IAC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL accurate statements about Infrastructure as Code.',
    options: opts4(
      'Configuration can be peer-reviewed before being applied.',
      'The same code can build identical environments repeatedly.',
      'Changes have a tracked history in version control.',
      'IaC removes the need to ever test changes.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'IaC enables review, repeatable builds, and change history. It does not remove the need to test — previewing/validating changes is still important.',
    references: [REF_IAC]
  },

  // ── Added: The Purpose of Terraform (+4) ──
  {
    domain: PURPOSE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best explains why Terraform keeps state rather than querying the cloud every time?',
    options: opts4(
      'State stores credentials so APIs are unnecessary.',
      'State records the mapping of configuration to real resources and metadata, enabling accurate, performant plans.',
      'State replaces the configuration files.',
      'State is only used by HCP Terraform.'
    ),
    correct: ['b'],
    explanation: 'State maps config to real objects and stores metadata so Terraform can compute accurate plans efficiently. It is not a credential store, a config replacement, or HCP-only.',
    references: [REF_STATE]
  },
  {
    domain: PURPOSE, difficulty: 3, type: QType.SINGLE,
    stem: 'For team collaboration, which HCP Terraform capability most directly reduces the risk of conflicting concurrent changes?',
    options: opts4(
      'Managed remote state with locking and remote runs.',
      'Syntax highlighting in the editor.',
      'The ability to write HCL.',
      'Local-only state files.'
    ),
    correct: ['a'],
    explanation: 'Managed remote state with locking and serialized remote runs prevents conflicting concurrent applies. HCL and editor features do not address concurrency; local state makes it worse.',
    references: [REF_CLOUD]
  },
  {
    domain: PURPOSE, difficulty: 2, type: QType.SINGLE,
    stem: 'Terraform vs CloudFormation: which statement is accurate about Terraform\'s purpose?',
    options: opts4(
      'Terraform is multi-cloud via providers, not limited to a single vendor\'s services.',
      'Terraform only manages AWS resources.',
      'Terraform cannot manage SaaS or Kubernetes.',
      'Terraform compiles to CloudFormation templates.'
    ),
    correct: ['a'],
    explanation: 'Terraform is provider-driven and works across many clouds and platforms (including Kubernetes and SaaS), unlike a single-vendor tool. It does not compile to CloudFormation.',
    references: [REF_PROVIDERS]
  },
  {
    domain: PURPOSE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A core purpose of Terraform is to provide a predictable plan/apply workflow that previews changes before they are made.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. The plan-then-apply model giving a predictable preview of changes is central to Terraform\'s value proposition.',
    references: [REF_PLAN]
  },

  // ── Added: Terraform Fundamentals (+7) ──
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command checks configuration syntax/consistency but does not require provider credentials or network access?',
    options: opts4(
      'terraform validate',
      'terraform apply',
      'terraform import',
      'terraform refresh'
    ),
    correct: ['a'],
    explanation: '`terraform validate` checks syntax and internal consistency offline in an initialized directory. apply/import/refresh contact providers or modify state.',
    references: [REF_VALIDATE]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which file typically declares variables (their names, types, defaults) by convention?',
    options: opts4(
      'variables.tf',
      'terraform.tfstate',
      '.terraform.lock.hcl',
      'backend.json'
    ),
    correct: ['a'],
    explanation: 'By convention `variables.tf` holds `variable` declarations (Terraform actually loads all `.tf` files). The lock file and state file serve different roles.',
    references: [REF_VARS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which environment variable form sets the Terraform input variable `db_password`?',
    options: opts4(
      'TF_VAR_db_password',
      'TERRAFORM_db_password',
      'VAR_db_password',
      'TF_db_password'
    ),
    correct: ['a'],
    explanation: 'Terraform reads `TF_VAR_<name>` environment variables to set input variables, e.g. `TF_VAR_db_password`. The other prefixes are not recognized.',
    references: [REF_VARS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `terraform fmt -recursive` do?',
    options: opts4(
      'Formats `.tf` files in the current directory and all subdirectories.',
      'Validates all modules recursively.',
      'Destroys nested resources.',
      'Initializes every submodule\'s backend.'
    ),
    correct: ['a'],
    explanation: '`terraform fmt -recursive` reformats configuration files in the current directory and all subdirectories. It does not validate, destroy, or init.',
    references: [REF_FMT]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which block exposes a value (like an instance IP) for users or other configurations to read?',
    options: opts4(
      'output',
      'variable',
      'provider',
      'backend'
    ),
    correct: ['a'],
    explanation: 'An `output` block surfaces a value after apply (and for `terraform output`/remote_state). variables are inputs, provider configures the platform, backend stores state.',
    references: [REF_OUTPUTS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about provider version constraints.',
    options: opts4(
      '`= 3.1.0` pins an exact version.',
      '`>= 3.1.0` allows that version or newer.',
      '`~> 3.1` allows 3.x but not 4.0.',
      'Version constraints are stored in the state file.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Exact, lower-bound, and pessimistic constraints behave as described. Version constraints live in configuration (`required_providers`) and selections in the lock file — not in state.',
    references: [REF_SETTINGS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: `terraform validate` requires the working directory to have been initialized first with `terraform init`.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. `validate` needs provider schemas/modules available, so the directory must be initialized via `terraform init` first.',
    references: [REF_VALIDATE, REF_INIT]
  },

  // ── Added: The Terraform Workflow (+7) ──
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'What does a `-` (minus) prefix on a resource in plan output indicate?',
    options: opts4(
      'It will be created.',
      'It will be destroyed.',
      'It will be updated in place.',
      'It is unchanged.'
    ),
    correct: ['b'],
    explanation: '`-` means the resource will be destroyed; `+` create, `~` update in place, `-/+` replace.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command would you add to a CI pipeline to fail the build if files are not canonically formatted?',
    options: opts4(
      'terraform fmt -check',
      'terraform fmt -write',
      'terraform validate -fmt',
      'terraform plan -fmt'
    ),
    correct: ['a'],
    explanation: '`terraform fmt -check` exits non-zero if any file is not properly formatted, without rewriting — ideal for CI gating. The other forms do not perform this check.',
    references: [REF_FMT]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to recreate one resource on the next apply because the provider cannot detect a needed change. Current recommended command?',
    options: opts4(
      'terraform apply -replace="aws_db_instance.main"',
      'terraform taint aws_db_instance.main',
      'terraform refresh',
      'terraform fmt'
    ),
    correct: ['a'],
    explanation: '`terraform apply -replace=ADDR` is the modern recommended way to force replacement of a specific resource; `terraform taint` is deprecated. refresh/fmt do not recreate.',
    references: [REF_APPLY, REF_TAINT]
  },
  {
    domain: WORKFLOW, difficulty: 1, type: QType.SINGLE,
    stem: 'In the core workflow, which step actually changes real infrastructure?',
    options: opts4(
      'Write',
      'Plan',
      'Apply',
      'Validate'
    ),
    correct: ['c'],
    explanation: 'Apply executes the planned changes against real infrastructure. Write authors config, Plan previews, and Validate checks syntax.',
    references: [REF_APPLY]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is `-target` documented as something to use sparingly?',
    options: opts4(
      'It permanently disables state.',
      'It can produce a partial apply that diverges from full configuration, so it is for exceptional cases.',
      'It deletes the lock file.',
      'It always destroys all resources.'
    ),
    correct: ['b'],
    explanation: '`-target` applies only a subset, which can leave configuration and state inconsistent if overused; it is meant for exceptional recovery situations, not routine use.',
    references: [REF_PLAN]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'You changed the `backend` block. Running `terraform plan` immediately gives a backend initialization error. What is the fix?',
    options: opts4(
      'Re-run `terraform init` to migrate/reconfigure the backend.',
      'Run `terraform fmt`.',
      'Delete `.terraform.lock.hcl`.',
      'Run `terraform output`.'
    ),
    correct: ['a'],
    explanation: 'Backend changes require `terraform init` (often with `-migrate-state` or `-reconfigure`) before plan/apply works again. fmt/output and deleting the lock file do not resolve it.',
    references: [REF_INIT, REF_BACKENDS]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL commands that are read-only with respect to real infrastructure.',
    options: opts4(
      'terraform plan',
      'terraform validate',
      'terraform fmt',
      'terraform destroy'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'plan previews, validate checks syntax, and fmt formats files — none change real infrastructure. destroy removes resources.',
    references: [REF_PLAN, REF_VALIDATE, REF_FMT]
  },

  // ── Added: Terraform Modules (+7) ──
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'A module on the public registry is referenced without a host prefix. Which registry is implied?',
    options: opts4(
      'The public Terraform Registry (registry.terraform.io).',
      'A private GitLab instance.',
      'The local filesystem.',
      'An S3 bucket.'
    ),
    correct: ['a'],
    explanation: 'A bare `<namespace>/<name>/<provider>` address resolves to the public Terraform Registry by default; other hosts need an explicit host prefix.',
    references: [REF_REGISTRY]
  },
  {
    domain: MODULES, difficulty: 1, type: QType.SINGLE,
    stem: 'Which keyword/block calls a child module from the root configuration?',
    options: opts4(
      'module',
      'resource',
      'provider',
      'data'
    ),
    correct: ['a'],
    explanation: 'A `module` block instantiates a child module (with `source` and inputs). resource/data/provider declare other constructs.',
    references: [REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is true about outputs declared in a child module?',
    options: opts4(
      'They are only consumable by the calling configuration via `module.<name>.<output>`.',
      'They are global variables anywhere in the project.',
      'They are written to the provider plugin.',
      'They cannot reference the module\'s own resources.'
    ),
    correct: ['a'],
    explanation: 'Child module outputs are exposed to the caller as `module.<name>.<output>` and typically reference the module\'s resources. They are not global or written to plugins.',
    references: [REF_OUTPUTS, REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 3, type: QType.SINGLE,
    stem: 'A module needs an aliased provider configured in the root. How is it passed to the child module?',
    options: opts4(
      'Via the `providers = { aws = aws.west }` argument in the `module` block.',
      'By redeclaring the provider inside the child automatically.',
      'Through an `output` block.',
      'It is impossible to pass aliased providers to modules.'
    ),
    correct: ['a'],
    explanation: 'The `providers` meta-argument on a `module` block maps the caller\'s (possibly aliased) provider configurations into the child module. Outputs are unrelated to provider passing.',
    references: [REF_PROVIDERS, REF_MODULES]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.SINGLE,
    stem: 'What happens if you change a registry module\'s pinned `version` and run plan without re-initializing?',
    options: opts4(
      'Terraform errors/asks you to run init because the new module version is not installed.',
      'Terraform silently downloads it during plan.',
      'Terraform ignores the version change.',
      'Terraform destroys all resources.'
    ),
    correct: ['a'],
    explanation: 'Module version/source changes require `terraform init` to install the new version before planning; Terraform will not silently fetch it during plan.',
    references: [REF_INIT, REF_REGISTRY]
  },
  {
    domain: MODULES, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: A child module cannot directly read the root module\'s variables; values must be passed in explicitly as module arguments.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. Modules are encapsulated — a child only receives values its caller explicitly passes as input arguments; it cannot reach into the root\'s variables.',
    references: [REF_MODULES, REF_VARS]
  },
  {
    domain: MODULES, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL valid `module` block arguments/meta-arguments.',
    options: opts4(
      'source',
      'version',
      'for_each',
      'backend'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '`source`, `version`, and meta-arguments like `for_each`/`count`/`depends_on`/`providers` are valid on module blocks. `backend` is configured in the `terraform` block, not on a module.',
    references: [REF_MODULES, REF_FOREACH]
  },

  // ── Added: Use Terraform Outside the Core Workflow (+4) ──
  {
    domain: OUTSIDE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command associates an EXISTING manually-created S3 bucket with `aws_s3_bucket.logs` in state?',
    options: opts4(
      'terraform import aws_s3_bucket.logs my-bucket-name',
      'terraform apply -import',
      'terraform state add aws_s3_bucket.logs',
      'terraform refresh aws_s3_bucket.logs'
    ),
    correct: ['a'],
    explanation: '`terraform import <address> <id>` binds an existing object to a resource address in state. There is no `state add` subcommand, and refresh/apply do not import.',
    references: [REF_IMPORT]
  },
  {
    domain: OUTSIDE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to evaluate `cidrsubnet("10.0.0.0/16", 8, 2)` quickly without applying anything. Best tool?',
    options: opts4(
      'terraform console',
      'terraform apply',
      'terraform import',
      'terraform fmt'
    ),
    correct: ['a'],
    explanation: '`terraform console` is an interactive REPL perfect for testing function expressions like `cidrsubnet(...)` without changing infrastructure.',
    references: [REF_CONSOLE]
  },
  {
    domain: OUTSIDE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command synchronizes state with real resources without proposing or making infrastructure changes (modern form)?',
    options: opts4(
      'terraform apply -refresh-only',
      'terraform validate',
      'terraform fmt',
      'terraform import'
    ),
    correct: ['a'],
    explanation: '`terraform apply -refresh-only` updates state to match real resources without altering infrastructure (the modern replacement for standalone `terraform refresh`).',
    references: [REF_STATE, REF_PLAN]
  },
  {
    domain: OUTSIDE, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: `terraform_remote_state` only exposes the OTHER configuration\'s declared outputs, not its full resource attributes.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. The `terraform_remote_state` data source surfaces only the root outputs the other configuration explicitly exports, not arbitrary internal resource attributes.',
    references: [REF_REMOTE_STATE]
  },

  // ── Added: Implement and Maintain State (+7) ──
  {
    domain: STATE, difficulty: 1, type: QType.SINGLE,
    stem: 'What does Terraform state primarily track?',
    options: opts4(
      'The mapping between configuration resources and real infrastructure objects, plus metadata.',
      'The Terraform CLI download history.',
      'The user\'s shell command history.',
      'Provider plugin source code.'
    ),
    correct: ['a'],
    explanation: 'State maps declared resources to real-world objects and stores metadata Terraform needs for planning. It is not a command history or plugin source store.',
    references: [REF_STATE]
  },
  {
    domain: STATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command deletes the workspace named "temp" (must not be the current/only one)?',
    options: opts4(
      'terraform workspace delete temp',
      'terraform workspace rm temp',
      'terraform delete workspace temp',
      'terraform workspace drop temp'
    ),
    correct: ['a'],
    explanation: '`terraform workspace delete <name>` removes a workspace (you cannot delete the currently selected or default workspace). The other forms are invalid.',
    references: [REF_WORKSPACES]
  },
  {
    domain: STATE, difficulty: 3, type: QType.SINGLE,
    stem: 'A resource block was renamed from `aws_instance.app` to `aws_instance.web`. Without intervention, what does plan show?',
    options: opts4(
      'A no-op.',
      'Destroy of `aws_instance.app` and create of `aws_instance.web` (unless you `state mv` or use a `moved` block).',
      'Only an in-place update.',
      'An import prompt.'
    ),
    correct: ['b'],
    explanation: 'Renaming an address makes Terraform see the old one as removed and the new one as added (destroy+create). `terraform state mv` or a `moved` block preserves the object.',
    references: [REF_STATE_CMD]
  },
  {
    domain: STATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a valid reason to use a remote backend instead of local state for a team?',
    options: opts4(
      'Shared, centralized state with locking to prevent conflicting writes.',
      'It removes the need to write configuration.',
      'It makes provider plugins unnecessary.',
      'It disables the plan step.'
    ),
    correct: ['a'],
    explanation: 'Remote backends provide shared state plus locking so teams do not corrupt state with concurrent applies. They do not remove config, providers, or planning.',
    references: [REF_BACKENDS, REF_LOCKING]
  },
  {
    domain: STATE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want Terraform to stop managing a resource but keep the real object alive. Which command?',
    options: opts4(
      'terraform state rm aws_instance.legacy',
      'terraform destroy -target=aws_instance.legacy',
      'terraform apply -replace=aws_instance.legacy',
      'terraform taint aws_instance.legacy'
    ),
    correct: ['a'],
    explanation: '`terraform state rm` removes the resource from state so Terraform no longer manages it while leaving the real object intact. destroy deletes it; replace/taint recreate it.',
    references: [REF_STATE_CMD]
  },
  {
    domain: STATE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Hand-editing the raw state JSON is discouraged; the supported approach is the `terraform state` subcommands.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. Manual edits risk corrupting state; HashiCorp recommends the `terraform state` family (mv/rm/show/list) for safe modifications.',
    references: [REF_STATE_CMD, REF_STATE]
  },
  {
    domain: STATE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about remote backends and locking.',
    options: opts4(
      'Some backends support automatic state locking during writes.',
      'Locking helps prevent state corruption from concurrent operations.',
      'Not all backends support locking.',
      'Locking eliminates the need for state entirely.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Many backends lock state during writes to prevent concurrent corruption, but not all backends support locking. Locking does not eliminate the need for state.',
    references: [REF_LOCKING, REF_BACKENDS]
  },

  // ── Added: Read, Generate, and Modify Configuration (+5) ──
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'Which meta-argument creates resource instances keyed by each element of a set or map?',
    options: opts4(
      'for_each',
      'count',
      'lifecycle',
      'provider'
    ),
    correct: ['a'],
    explanation: '`for_each` instantiates one resource per element of a map/set, keyed by the element key (stable across changes). `count` uses numeric indexes; lifecycle/provider serve other roles.',
    references: [REF_FOREACH]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'You want Terraform to create a new replacement resource BEFORE destroying the old one to avoid downtime. Which lifecycle setting?',
    options: opts4(
      'create_before_destroy = true',
      'prevent_destroy = true',
      'ignore_changes = all',
      'replace_triggered_by = []'
    ),
    correct: ['a'],
    explanation: '`lifecycle { create_before_destroy = true }` provisions the replacement before destroying the original, minimizing downtime. The other settings address deletion protection, drift ignoring, and forced replacement triggers.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'Which lifecycle setting tells Terraform to ignore external changes to specified attributes during plan?',
    options: opts4(
      'ignore_changes',
      'prevent_destroy',
      'create_before_destroy',
      'depends_on'
    ),
    correct: ['a'],
    explanation: '`lifecycle { ignore_changes = [..] }` makes Terraform disregard drift on listed attributes so it does not try to revert them. The others control destruction order/protection or dependencies.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Which function reads and returns the contents of a file at plan/apply time?',
    options: opts4(
      'file("script.sh")',
      'read("script.sh")',
      'load("script.sh")',
      'open("script.sh")'
    ),
    correct: ['a'],
    explanation: 'The built-in `file(path)` function returns the file\'s contents as a string. `read`/`load`/`open` are not Terraform functions.',
    references: [REF_FUNCTIONS]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: `depends_on` should be used for explicit ordering only when Terraform cannot infer a dependency automatically from references.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'True. Terraform infers most dependencies from expression references; `depends_on` is for the rare cases where an implicit dependency cannot be detected.',
    references: [REF_META, REF_DEPENDS]
  }
];

const TERRAFORM_DOMAINS = [
  { name: IAC, weight: 10 },
  { name: PURPOSE, weight: 10 },
  { name: FUND, weight: 15 },
  { name: WORKFLOW, weight: 15 },
  { name: MODULES, weight: 15 },
  { name: OUTSIDE, weight: 10 },
  { name: STATE, weight: 15 },
  { name: CONFIG, weight: 10 }
];

const TERRAFORM_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'hashicorp-terraform-associate-p1',
    code: 'TFA003-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 60-minute, 65-question, blueprint-weighted set covering IaC concepts, the purpose of Terraform, fundamentals, the core workflow, modules, working outside the core workflow, state management, and reading/generating/modifying configuration.',
    questions: P1
  },
  {
    slug: 'hashicorp-terraform-associate-p2',
    code: 'TFA003-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 60-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'hashicorp-terraform-associate-p3',
    code: 'TFA003-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 60-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const TERRAFORM_BUNDLE = {
  slug: 'hashicorp-terraform-associate',
  title: 'HashiCorp Certified: Terraform Associate (003)',
  description: 'All 3 HashiCorp Certified: Terraform Associate (003) practice exams in one bundle — 195 blueprint-weighted questions covering Infrastructure as Code concepts, the purpose of Terraform, Terraform fundamentals, the core write/plan/apply workflow, modules, using Terraform outside the core workflow, implementing and maintaining state, and reading/generating/modifying configuration, aligned to the Terraform Associate 003 objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 7050 // USD 70.50 — VOUCHER tier (matches Terraform Associate real-exam fee)
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Terraform Associate bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:terraform-seed'` are deleted and
 * re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedTerraform(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'hashicorp' } });
  await db.vendor.upsert({
    where: { slug: 'hashicorp' },
    update: { name: 'HashiCorp', description: 'HashiCorp certifications — Terraform, Vault, Consul, and infrastructure automation credentials.' },
    create: { slug: 'hashicorp', name: 'HashiCorp', description: 'HashiCorp certifications — Terraform, Vault, Consul, and infrastructure automation credentials.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'hashicorp' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of TERRAFORM_EXAMS) {
    const title = `HashiCorp Certified: Terraform Associate (003) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Terraform Associate 003 objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 60,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: TERRAFORM_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:terraform-seed' } });
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
          generatedBy: 'manual:terraform-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: TERRAFORM_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: TERRAFORM_BUNDLE.slug },
    update: {
      title: TERRAFORM_BUNDLE.title,
      description: TERRAFORM_BUNDLE.description,
      price: TERRAFORM_BUNDLE.price,
      priceVoucher: TERRAFORM_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: TERRAFORM_BUNDLE.slug,
      title: TERRAFORM_BUNDLE.title,
      description: TERRAFORM_BUNDLE.description,
      price: TERRAFORM_BUNDLE.price,
      priceVoucher: TERRAFORM_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'hashicorp-terraform-associate-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'hashicorp-terraform-associate-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'hashicorp-terraform-associate-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'hashicorp-terraform-associate-p1', tier: 'VOUCHER' as const, position: 4 }
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
