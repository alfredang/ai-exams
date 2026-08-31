/**
 * Cisco DevNet Associate (200-901 DEVASC) bundle seed — vendor, three
 * practice-exam variants, bundle, and 195 blueprint-aligned questions.
 * Idempotent: replaces rows tagged `generatedBy: 'manual:devnet-seed'`
 * and upserts the catalog rows.
 *
 * Exported as `seedDevnet(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/devnet.ts`) and the protected
 * admin API (`/api/admin/seed-devnet`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Cisco DevNet docs and
 * the official Cisco 200-901 DEVASC exam-topics blueprint:
 *   - Software Development and Design        — 15% (10/variant)
 *   - Understanding and Using APIs           — 20% (13/variant)
 *   - Cisco Platforms and Development        — 15% (10/variant)
 *   - Application Deployment and Security    — 15% (10/variant)
 *   - Infrastructure and Automation          — 20% (13/variant)
 *   - Network Fundamentals                   — 15% ( 9/variant)
 *
 * These are original scenario-based items grounded in the published
 * exam topics — they are NOT copied from any real exam and make no
 * claim of being actual exam content.
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

const SWDEV = 'Software Development and Design';
const APIS = 'Understanding and Using APIs';
const PLATFORMS = 'Cisco Platforms and Development';
const APPSEC = 'Application Deployment and Security';
const INFRA = 'Infrastructure and Automation';
const NETFUND = 'Network Fundamentals';

const REF_EXAMTOPICS = { label: 'Cisco — 200-901 DEVASC exam topics', url: 'https://learningnetwork.cisco.com/s/devasc-exam-topics' };
const REF_DEVNET = { label: 'Cisco DevNet — Developer site', url: 'https://developer.cisco.com/' };
const REF_DEVNET_CODEEX = { label: 'Cisco DevNet — Code Exchange', url: 'https://developer.cisco.com/codeexchange/' };
const REF_DEVNET_LEARN = { label: 'Cisco DevNet — Learning Labs', url: 'https://developer.cisco.com/learning/' };
const REF_REST = { label: 'Cisco DevNet — REST API fundamentals', url: 'https://developer.cisco.com/learning/labs/rest-api-fundamentals/' };
const REF_GIT = { label: 'Cisco DevNet — Git fundamentals', url: 'https://developer.cisco.com/learning/labs/intro-git/' };
const REF_PYTHON = { label: 'Cisco DevNet — Python programming basics', url: 'https://developer.cisco.com/learning/tracks/python-programming/' };
const REF_DESIGN = { label: 'Cisco DevNet — Software design patterns', url: 'https://developer.cisco.com/learning/tracks/coding-fundamentals/' };
const REF_DNAC = { label: 'Cisco DevNet — Catalyst Center (DNA Center) Platform', url: 'https://developer.cisco.com/dnacenter/' };
const REF_MERAKI = { label: 'Cisco DevNet — Meraki Dashboard API', url: 'https://developer.cisco.com/meraki/' };
const REF_WEBEX = { label: 'Cisco DevNet — Webex APIs', url: 'https://developer.webex.com/docs' };
const REF_ACI = { label: 'Cisco DevNet — ACI programmability', url: 'https://developer.cisco.com/site/aci/' };
const REF_NXOS = { label: 'Cisco DevNet — NX-OS programmability', url: 'https://developer.cisco.com/site/nx-os/' };
const REF_IOSXE = { label: 'Cisco DevNet — IOS XE programmability', url: 'https://developer.cisco.com/site/ios-xe/' };
const REF_NETCONF = { label: 'Cisco DevNet — NETCONF / YANG / RESTCONF', url: 'https://developer.cisco.com/learning/tracks/programming-cisco-network/' };
const REF_ANSIBLE = { label: 'Cisco DevNet — Ansible network automation', url: 'https://developer.cisco.com/learning/tracks/ansible-network-automation/' };
const REF_DOCKER = { label: 'Cisco DevNet — Docker fundamentals', url: 'https://developer.cisco.com/learning/labs/docker-101/' };
const REF_CICD = { label: 'Cisco DevNet — CI/CD pipelines', url: 'https://developer.cisco.com/learning/tracks/devops/' };
const REF_SECURITY = { label: 'Cisco DevNet — Application security fundamentals', url: 'https://developer.cisco.com/learning/tracks/security/' };
const REF_OSI = { label: 'Cisco — Networking basics (OSI / TCP-IP)', url: 'https://www.cisco.com/c/en/us/solutions/small-business/resource-center/networking/networking-basics.html' };
const REF_HTTP = { label: 'MDN — HTTP request methods', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods' };
const REF_JSON = { label: 'Cisco DevNet — Working with JSON / XML / YAML', url: 'https://developer.cisco.com/learning/labs/data-formats-yaml/' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Software Development and Design (10) ──
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team is choosing a software development methodology where requirements are delivered in short, time-boxed iterations with frequent customer feedback. Which methodology best fits this description?',
    options: opts4(
      'Waterfall',
      'Agile',
      'Big-bang',
      'V-model'
    ),
    correct: ['b'],
    explanation: 'Agile delivers working software in short, time-boxed iterations (sprints) with continuous customer feedback and adaptation. Waterfall and the V-model are sequential phase-gated models, and big-bang lacks iterative planning.',
    references: [REF_DESIGN, REF_EXAMTOPICS]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'In the Model-View-Controller (MVC) pattern, which component is responsible for handling user input and coordinating updates between the data and the presentation layer?',
    options: opts4(
      'Model',
      'View',
      'Controller',
      'Template'
    ),
    correct: ['c'],
    explanation: 'The Controller receives user input, invokes business logic on the Model, and selects the View to render. The Model holds data/state and the View renders presentation; "Template" is not an MVC role.',
    references: [REF_DESIGN]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL benefits typically associated with a microservices architecture compared to a monolith.',
    options: opts4(
      'Independent deployment of individual services',
      'Technology heterogeneity per service',
      'Zero network latency between components',
      'Independent scaling of high-demand services'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Microservices allow independent deployment, per-service technology choices, and independent scaling. They do NOT remove network latency — inter-service calls traverse the network, which is a known trade-off versus in-process monolith calls.',
    references: [REF_DESIGN, REF_EXAMTOPICS]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Git command creates a new local branch named `feature-x` and immediately switches the working tree to it?',
    options: opts4(
      'git branch feature-x',
      'git checkout -b feature-x',
      'git merge feature-x',
      'git remote add feature-x'
    ),
    correct: ['b'],
    explanation: '`git checkout -b feature-x` creates the branch and checks it out in one step. `git branch feature-x` only creates it without switching; `git merge` integrates branches; `git remote add` configures a remote.',
    references: [REF_GIT]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'During a `git merge`, both branches modified the same lines of `app.py`. What is the immediate result?',
    options: opts4(
      'Git silently keeps the destination branch version',
      'Git reports a merge conflict that must be resolved manually before committing',
      'Git automatically rebases the source branch',
      'Git deletes the conflicting file'
    ),
    correct: ['b'],
    explanation: 'When the same lines diverge, Git cannot auto-merge and marks the file with conflict markers, requiring manual resolution and a follow-up commit. It does not silently choose a side, rebase, or delete the file.',
    references: [REF_GIT]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'A Python developer needs to isolate project dependencies so they do not pollute the system interpreter. Which tool is purpose-built for this?',
    options: opts4(
      'pip freeze',
      'venv (virtual environment)',
      'os.environ',
      'pylint'
    ),
    correct: ['b'],
    explanation: 'Python `venv` creates an isolated virtual environment with its own site-packages, preventing dependency pollution. `pip freeze` only lists versions, `os.environ` reads environment variables, and `pylint` is a linter.',
    references: [REF_PYTHON]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which testing approach validates that individual functions or methods behave correctly in isolation, typically with mocked dependencies?',
    options: opts4(
      'Integration testing',
      'Unit testing',
      'Load testing',
      'User acceptance testing'
    ),
    correct: ['b'],
    explanation: 'Unit testing exercises the smallest testable units in isolation, often with mocks/stubs. Integration tests check component interactions, load tests measure performance, and UAT validates business requirements with end users.',
    references: [REF_DESIGN]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'In Big-O notation, what is the time complexity of looking up a value by key in a well-distributed hash table (Python dict) on average?',
    options: opts4(
      'O(n)',
      'O(1)',
      'O(n log n)',
      'O(n^2)'
    ),
    correct: ['b'],
    explanation: 'Average-case hash-table key lookup is O(1) constant time because the hash maps directly to a bucket. Worst case can degrade to O(n) with many collisions, but average lookup is constant.',
    references: [REF_PYTHON]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'A code review flags a class that both formats a report and writes it to disk. Which design principle is being violated?',
    options: opts4(
      'Single Responsibility Principle',
      'Open/Closed Principle',
      'Liskov Substitution Principle',
      'Interface Segregation Principle'
    ),
    correct: ['a'],
    explanation: 'The Single Responsibility Principle states a class should have one reason to change. Mixing report formatting and persistence gives the class two responsibilities and two reasons to change, violating SRP.',
    references: [REF_DESIGN]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Git workflow command uploads your committed local changes from the current branch to a configured remote repository?',
    options: opts4(
      'git pull',
      'git push',
      'git stash',
      'git log'
    ),
    correct: ['b'],
    explanation: '`git push` publishes local commits to the remote. `git pull` fetches and merges remote changes locally, `git stash` shelves uncommitted work, and `git log` shows history.',
    references: [REF_GIT]
  },

  // ── Understanding and Using APIs (13) ──
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which HTTP method is idempotent and is conventionally used to retrieve a resource without modifying server state?',
    options: opts4(
      'POST',
      'GET',
      'DELETE',
      'PATCH'
    ),
    correct: ['b'],
    explanation: 'GET is a safe, idempotent method used to retrieve representations without side effects. POST is non-idempotent and creates/triggers actions; PATCH partially updates; DELETE removes resources.',
    references: [REF_HTTP, REF_REST]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'An API call returns HTTP status code 401. What does this most directly indicate?',
    options: opts4(
      'The resource was not found',
      'Authentication is required or has failed',
      'The server encountered an internal error',
      'The request succeeded with no content'
    ),
    correct: ['b'],
    explanation: 'HTTP 401 Unauthorized indicates missing or invalid authentication credentials. 404 means not found, 500 is a server error, and 204 means success with no body.',
    references: [REF_HTTP, REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL characteristics that describe a RESTful API.',
    options: opts4(
      'Stateless interactions between client and server',
      'Resources identified by URIs',
      'Mandatory use of SOAP envelopes',
      'Uses standard HTTP verbs to act on resources'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'REST is stateless, models resources addressable by URIs, and uses standard HTTP verbs (GET/POST/PUT/DELETE). SOAP envelopes belong to the SOAP protocol, not REST.',
    references: [REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Cisco platform API uses a token in the request header `Authorization: Bearer <token>`. Which authentication scheme is being used?',
    options: opts4(
      'Basic authentication',
      'Bearer token (OAuth-style) authentication',
      'API key in query string',
      'Mutual TLS only'
    ),
    correct: ['b'],
    explanation: 'The `Authorization: Bearer <token>` header is the bearer-token scheme used by OAuth 2.0 and many Cisco APIs. Basic auth uses base64 user:pass, an API key is often a query/header value, and mTLS is certificate-based.',
    references: [REF_REST, REF_DNAC]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which data format is line-oriented, uses indentation for structure, and is commonly used for configuration files and Ansible playbooks?',
    options: opts4(
      'XML',
      'YAML',
      'CSV',
      'Protobuf'
    ),
    correct: ['b'],
    explanation: 'YAML uses indentation-based structure and is widely used for config and Ansible playbooks. XML is tag-based, CSV is tabular, and Protobuf is a binary serialization format.',
    references: [REF_JSON, REF_ANSIBLE]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A synchronous REST API forces the client to wait for the full result before continuing. Which API style instead notifies the client when a long-running job completes, avoiding a blocked request?',
    options: opts4(
      'Polling with no callback',
      'Webhook (asynchronous callback) API',
      'Synchronous RPC',
      'Stateless GET'
    ),
    correct: ['b'],
    explanation: 'A webhook lets the server POST a notification to a client-registered URL when work completes, an asynchronous pattern that avoids blocking. The other options remain synchronous or require active polling.',
    references: [REF_WEBEX, REF_REST]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'In the JSON document `{"interfaces": [{"name": "Gig0/1"}, {"name": "Gig0/2"}]}`, what does the value of the `interfaces` key represent?',
    options: opts4(
      'A string',
      'An array of objects',
      'A single object',
      'A boolean'
    ),
    correct: ['b'],
    explanation: 'The square brackets denote a JSON array, and each element is an object (`{...}`). So `interfaces` is an array of objects, each with a `name` key.',
    references: [REF_JSON]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A REST API responds with HTTP 429. What is the appropriate client behavior?',
    options: opts4(
      'Immediately retry in a tight loop',
      'Back off and retry later, honoring rate-limit headers such as Retry-After',
      'Treat it as success',
      'Switch to HTTP instead of HTTPS'
    ),
    correct: ['b'],
    explanation: 'HTTP 429 Too Many Requests signals rate limiting. The client should implement exponential backoff and respect `Retry-After`. Tight-loop retries worsen throttling and may extend the block.',
    references: [REF_REST, REF_MERAKI]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Python library is the de-facto standard for making HTTP REST calls in scripts that consume Cisco APIs?',
    options: opts4(
      'matplotlib',
      'requests',
      'pandas',
      'pytest'
    ),
    correct: ['b'],
    explanation: 'The `requests` library provides a simple, widely used HTTP client in Python and is commonly used in DevNet labs to call REST APIs. matplotlib plots, pandas does data analysis, and pytest is a test runner.',
    references: [REF_PYTHON, REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'When constructing a REST request to create a new resource, which combination of method and typical success status code is correct?',
    options: opts4(
      'GET and 201 Created',
      'POST and 201 Created',
      'DELETE and 200 OK',
      'PUT and 404 Not Found'
    ),
    correct: ['b'],
    explanation: 'Creating a resource is conventionally done with POST, and a successful creation typically returns 201 Created (often with a Location header). GET retrieves, DELETE removes, and PUT replaces.',
    references: [REF_HTTP, REF_REST]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which HTTP request header tells the server the media type the client expects in the response body?',
    options: opts4(
      'Content-Type',
      'Accept',
      'Host',
      'User-Agent'
    ),
    correct: ['b'],
    explanation: 'The `Accept` header declares the response media types the client can handle (e.g. `application/json`). `Content-Type` describes the request body, `Host` carries the target host, and `User-Agent` identifies the client.',
    references: [REF_HTTP]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer must page through a large API result set. The response includes a `next` URL in its body. Which pagination strategy is in use?',
    options: opts4(
      'No pagination',
      'Cursor/link-based pagination',
      'Client-side sorting only',
      'HTTP caching'
    ),
    correct: ['b'],
    explanation: 'A server-supplied `next` link is link/cursor-based pagination — the client follows the provided URL to fetch subsequent pages without computing offsets itself.',
    references: [REF_MERAKI, REF_REST]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool provides an interactive way to construct, send, and inspect REST API calls while developing against Cisco DevNet sandboxes?',
    options: opts4(
      'Postman',
      'traceroute',
      'nslookup',
      'ping'
    ),
    correct: ['a'],
    explanation: 'Postman is an API client for building and inspecting REST requests, widely used in DevNet learning labs. traceroute, nslookup, and ping are network diagnostic utilities, not API clients.',
    references: [REF_DEVNET_LEARN, REF_REST]
  },

  // ── Cisco Platforms and Development (10) ──
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco platform exposes an intent-based northbound REST API for campus network automation, including device, site, and template management?',
    options: opts4(
      'Cisco Webex',
      'Cisco Catalyst Center (DNA Center)',
      'Cisco Umbrella DNS',
      'Cisco AnyConnect'
    ),
    correct: ['b'],
    explanation: 'Cisco Catalyst Center (formerly DNA Center) provides an intent-based northbound REST API for campus automation, assurance, and templates. Webex is collaboration, Umbrella is DNS security, and AnyConnect is a VPN client.',
    references: [REF_DNAC]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'The Meraki Dashboard API is best described as which kind of management model?',
    options: opts4(
      'Per-device CLI over SSH',
      'Cloud-hosted REST API for centralized management of Meraki organizations and networks',
      'SNMP-only polling',
      'Serial console configuration'
    ),
    correct: ['b'],
    explanation: 'Meraki is cloud-managed; its Dashboard API is a cloud-hosted REST API operating on organizations, networks, and devices. It is not a per-device CLI/SSH, SNMP-only, or serial workflow.',
    references: [REF_MERAKI]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL Cisco collaboration capabilities that can be automated through the Webex APIs.',
    options: opts4(
      'Creating spaces (rooms) and posting messages',
      'Managing meetings and memberships',
      'Reconfiguring BGP routing on a core router',
      'Registering webhooks for message events'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Webex APIs manage spaces, messages, meetings, memberships, and webhooks. BGP routing on a core router is a network-platform task (e.g., via IOS XE/NETCONF), not a Webex collaboration API capability.',
    references: [REF_WEBEX]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco data-center platform exposes a programmable policy model through its APIC controller and a REST API for fabric automation?',
    options: opts4(
      'Cisco ACI (Application Centric Infrastructure)',
      'Cisco Webex',
      'Cisco DNA Spaces',
      'Cisco Jabber'
    ),
    correct: ['a'],
    explanation: 'Cisco ACI is managed by the APIC controller and exposes a REST API plus an object model (the Management Information Tree) for data-center fabric automation. The others are not ACI fabric controllers.',
    references: [REF_ACI]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'On a Cisco IOS XE device, which programmability interface lets you retrieve and modify configuration using YANG data models over an SSH transport?',
    options: opts4(
      'SNMPv2c',
      'NETCONF',
      'Syslog',
      'TFTP'
    ),
    correct: ['b'],
    explanation: 'NETCONF uses YANG data models over SSH to get/edit configuration on IOS XE. SNMPv2c is a legacy management protocol, Syslog is one-way logging, and TFTP is file transfer.',
    references: [REF_IOSXE, REF_NETCONF]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco DevNet resource offers always-on and reservable lab environments so developers can test API code without owning hardware?',
    options: opts4(
      'Cisco DevNet Sandbox',
      'Cisco TAC',
      'Cisco Smart Licensing',
      'Cisco PSIRT'
    ),
    correct: ['a'],
    explanation: 'Cisco DevNet Sandbox provides always-on and reservable labs for hands-on API development. TAC is technical support, Smart Licensing manages licenses, and PSIRT handles security incident response.',
    references: [REF_DEVNET]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'A script must subscribe to streaming operational telemetry from a Cisco NX-OS switch rather than periodically polling SNMP. Which capability supports this?',
    options: opts4(
      'Model-driven telemetry',
      'Console logging',
      'CDP neighbor discovery',
      'DHCP relay'
    ),
    correct: ['a'],
    explanation: 'Model-driven telemetry pushes structured, YANG-modeled operational data on subscription, replacing inefficient SNMP polling. CDP, console logging, and DHCP relay do not stream telemetry.',
    references: [REF_NXOS]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco DevNet site lets developers discover, share, and reference open-source code samples and SDKs for Cisco platforms?',
    options: opts4(
      'Code Exchange',
      'Cisco Live On-Demand',
      'Cisco Feature Navigator',
      'Cisco CCW (Commerce Workspace)'
    ),
    correct: ['a'],
    explanation: 'DevNet Code Exchange curates community and Cisco code samples and SDKs by platform. Cisco Live is events, Feature Navigator checks IOS feature support, and CCW is for ordering.',
    references: [REF_DEVNET_CODEEX]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'When using the Catalyst Center (DNA Center) REST API, what must a client typically obtain first before calling other endpoints?',
    options: opts4(
      'A static IP lease',
      'An authentication token from the token endpoint',
      'An SNMP community string',
      'A serial console session'
    ),
    correct: ['b'],
    explanation: 'Clients first authenticate to the Catalyst Center token endpoint to obtain an `X-Auth-Token`, then include it on subsequent API calls. SNMP strings and serial sessions are unrelated to the REST flow.',
    references: [REF_DNAC]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco platform API would you use to programmatically retrieve security events and enforce policy in a cloud-delivered DNS-layer security service?',
    options: opts4(
      'Cisco Umbrella API',
      'Cisco Webex API',
      'Cisco UCS Manager XML API only',
      'Cisco IP SLA'
    ),
    correct: ['a'],
    explanation: 'Cisco Umbrella provides APIs for reporting, enforcement, and management of its cloud DNS-layer security. Webex is collaboration, UCS Manager manages compute hardware, and IP SLA is a measurement feature.',
    references: [REF_DEVNET]
  },

  // ── Application Deployment and Security (10) ──
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which artifact defines the steps to build a container image, including the base image and commands to run during the build?',
    options: opts4(
      'docker-compose.yml',
      'Dockerfile',
      'requirements.txt',
      '.gitignore'
    ),
    correct: ['b'],
    explanation: 'A Dockerfile is the build recipe: it declares the base image (FROM) and build steps (RUN/COPY/CMD). Compose orchestrates multi-container apps, requirements.txt lists Python deps, and .gitignore excludes files from Git.',
    references: [REF_DOCKER]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A team automatically builds, tests, and deploys code on every commit to the main branch. Which practice is this?',
    options: opts4(
      'Manual release management',
      'Continuous Integration / Continuous Deployment (CI/CD)',
      'Cold standby provisioning',
      'Air-gapped delivery'
    ),
    correct: ['b'],
    explanation: 'Automated build/test/deploy on every commit is CI/CD. It contrasts with manual release management; cold standby and air-gapped delivery describe availability and isolation, not the delivery pipeline.',
    references: [REF_CICD]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that improve the security of an application deployment.',
    options: opts4(
      'Storing secrets in a managed secrets store rather than in source code',
      'Serving traffic over TLS (HTTPS)',
      'Hard-coding API tokens in the Git repository',
      'Applying least-privilege to service accounts'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Externalizing secrets, enforcing TLS, and least privilege all harden a deployment. Hard-coding tokens in Git is a common, severe vulnerability — credentials leak through history even if later removed.',
    references: [REF_SECURITY]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which deployment model runs application code in response to events without the developer managing servers or scaling?',
    options: opts4(
      'Bare-metal hosting',
      'Serverless (Functions-as-a-Service)',
      'On-prem virtualization',
      'Edge caching'
    ),
    correct: ['b'],
    explanation: 'Serverless / FaaS executes functions on demand with the provider handling provisioning and scaling. Bare-metal and on-prem virtualization require server management, and edge caching stores content, not code execution.',
    references: [REF_CICD]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command runs a container from the `web:1.0` image in the background and maps host port 8080 to container port 80?',
    options: opts4(
      'docker run -it web:1.0',
      'docker run -d -p 8080:80 web:1.0',
      'docker build -p 8080:80 web:1.0',
      'docker exec -p 8080:80 web:1.0'
    ),
    correct: ['b'],
    explanation: '`docker run -d -p 8080:80 web:1.0` runs detached (`-d`) and publishes host 8080 to container 80. `-it` is interactive, `docker build` builds images, and `docker exec` runs commands in an existing container.',
    references: [REF_DOCKER]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the primary security purpose of input validation in an application that accepts API parameters?',
    options: opts4(
      'To speed up database queries',
      'To prevent injection and malformed-data attacks by rejecting untrusted input',
      'To compress response payloads',
      'To enable horizontal scaling'
    ),
    correct: ['b'],
    explanation: 'Validating and sanitizing untrusted input is a primary defense against injection (SQL, command) and malformed-data attacks. It is a security control, not a performance or scaling mechanism.',
    references: [REF_SECURITY]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A pipeline must store the database password used by a deployment job. Which approach is the most secure?',
    options: opts4(
      'Commit it to the repository in plaintext',
      'Inject it at runtime from the CI/CD secret manager as a masked variable',
      'Print it to the build log for traceability',
      'Email it to all team members'
    ),
    correct: ['b'],
    explanation: 'Secrets should be injected at runtime from the CI/CD secret manager as masked variables, never committed, logged, or shared by email. Logging or emailing secrets exposes them broadly.',
    references: [REF_CICD, REF_SECURITY]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which deployment topology places application components in different physical/cloud locations to reduce latency and improve resilience?',
    options: opts4(
      'Single-host monolith',
      'Distributed / multi-region deployment',
      'Local-only development build',
      'Static file bundle'
    ),
    correct: ['b'],
    explanation: 'A distributed/multi-region deployment spreads components across locations, lowering latency for distributed users and improving resilience to a regional failure. A single-host monolith has neither property.',
    references: [REF_CICD]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which mechanism limits the blast radius of a compromised container by restricting the Linux capabilities and syscalls it can use?',
    options: opts4(
      'Running every container as root with --privileged',
      'Applying least privilege via dropped capabilities and seccomp profiles',
      'Disabling all logging',
      'Exposing all host ports'
    ),
    correct: ['b'],
    explanation: 'Dropping unneeded Linux capabilities and applying a seccomp profile constrains what a compromised container can do, reducing blast radius. Running privileged as root and exposing all ports do the opposite.',
    references: [REF_SECURITY, REF_DOCKER]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'In a typical CI/CD pipeline, in which stage are automated unit tests most appropriately executed?',
    options: opts4(
      'Only in production after release',
      'In the build/test stage before deployment',
      'Never — tests are manual only',
      'After the application is decommissioned'
    ),
    correct: ['b'],
    explanation: 'Automated unit tests run in the build/test stage so failures stop the pipeline before deployment. Testing only in production after release defeats the purpose of CI/CD quality gates.',
    references: [REF_CICD]
  },

  // ── Infrastructure and Automation (13) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which automation tool is agentless and uses YAML playbooks executed over SSH to configure network and server infrastructure?',
    options: opts4(
      'Ansible',
      'SNMP',
      'Telnet',
      'Wireshark'
    ),
    correct: ['a'],
    explanation: 'Ansible is agentless, connecting over SSH (or network APIs) and running YAML playbooks. SNMP is a monitoring/management protocol, Telnet is an unencrypted CLI transport, and Wireshark is a packet analyzer.',
    references: [REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the core idea of Infrastructure as Code (IaC)?',
    options: opts4(
      'Manually configuring each device through its console',
      'Defining and provisioning infrastructure through machine-readable definition files under version control',
      'Replacing all hardware with containers',
      'Disabling change tracking to speed up deployments'
    ),
    correct: ['b'],
    explanation: 'IaC manages infrastructure with declarative/versioned definition files, enabling repeatable, reviewable provisioning. Manual console config is the opposite, and disabling change tracking removes auditability.',
    references: [REF_CICD, REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid southbound interfaces a controller-based network might use to program devices.',
    options: opts4(
      'NETCONF',
      'RESTCONF',
      'gRPC/gNMI',
      'A printed configuration guide'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'NETCONF, RESTCONF, and gRPC/gNMI are model-driven southbound interfaces controllers use to program devices. A printed configuration guide is documentation, not a programmatic interface.',
    references: [REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which transport and encoding combination does RESTCONF use to manipulate YANG-modeled configuration?',
    options: opts4(
      'SSH with XML only',
      'HTTPS with JSON or XML payloads',
      'SNMP with ASN.1',
      'TFTP with binary blobs'
    ),
    correct: ['b'],
    explanation: 'RESTCONF runs over HTTPS and carries YANG-modeled data as JSON or XML. NETCONF uses SSH/XML; SNMP and TFTP are unrelated management/file protocols.',
    references: [REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A test must validate device configuration in an isolated, reproducible network topology before production. Which tool provides this capability?',
    options: opts4(
      'Cisco Modeling Labs / VIRL',
      'A spreadsheet of IP addresses',
      'A physical label maker',
      'A static PDF diagram'
    ),
    correct: ['a'],
    explanation: 'Cisco Modeling Labs (formerly VIRL) builds virtual, reproducible topologies for safe pre-production testing and automation validation. The other options are not network simulation environments.',
    references: [REF_DEVNET]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'In Ansible, what is an "inventory"?',
    options: opts4(
      'A list of managed hosts and groups the playbook targets',
      'A compiled binary of the playbook',
      'The packet capture of a run',
      'The CPU usage report'
    ),
    correct: ['a'],
    explanation: 'An Ansible inventory enumerates the managed hosts (and groups) that plays target, optionally with host/group variables. It is not a binary, capture, or usage report.',
    references: [REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is idempotency an important property of network automation tasks?',
    options: opts4(
      'It guarantees the script runs faster each time',
      'Re-running the same task converges to the same desired state without unintended repeated changes',
      'It encrypts all configuration data',
      'It disables logging during the run'
    ),
    correct: ['b'],
    explanation: 'Idempotent automation can be re-run safely: it only makes changes needed to reach the declared state, preventing duplicate or drifting configuration. It is unrelated to speed, encryption, or logging.',
    references: [REF_ANSIBLE, REF_CICD]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Python library is commonly used to connect to network device CLIs over SSH for screen-scraping automation when no API is available?',
    options: opts4(
      'Netmiko',
      'NumPy',
      'Flask',
      'Jinja-only (no transport)'
    ),
    correct: ['a'],
    explanation: 'Netmiko is a multi-vendor SSH library that simplifies CLI automation when a structured API is unavailable. NumPy is numerical, Flask is a web framework, and Jinja2 alone only templates text.',
    references: [REF_PYTHON, REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A team renders device configurations from a data model using a templating engine. Which tool is typically used for this in Python/Ansible workflows?',
    options: opts4(
      'Jinja2 templates',
      'tcpdump',
      'iperf',
      'cron only'
    ),
    correct: ['a'],
    explanation: 'Jinja2 renders configuration text from variables/data models and is used by Ansible and Python tooling. tcpdump and iperf are network diagnostics, and cron only schedules jobs.',
    references: [REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What does configuration "drift" mean in infrastructure automation?',
    options: opts4(
      'Devices physically moving in a rack',
      'Actual device state diverging over time from the intended/declared configuration',
      'A packet routing change',
      'A DNS cache expiry'
    ),
    correct: ['b'],
    explanation: 'Drift is when the running state diverges from the declared/source-of-truth configuration, often due to manual changes. Automation detects and remediates drift to restore desired state.',
    references: [REF_CICD, REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which characteristic distinguishes a controller-based (SDN) architecture from traditional per-device management?',
    options: opts4(
      'Each device is configured independently via console only',
      'A centralized controller provides a programmatic abstraction and pushes intent to many devices',
      'It removes the need for any network devices',
      'It uses only SNMP traps'
    ),
    correct: ['b'],
    explanation: 'SDN/controller-based architectures centralize control, exposing northbound APIs and pushing intent to devices via southbound protocols. Traditional management configures each device independently.',
    references: [REF_DNAC, REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which file format is the structured, machine-readable schema language used to model configuration and operational state for NETCONF/RESTCONF?',
    options: opts4(
      'CSV',
      'YANG',
      'INI',
      'Markdown'
    ),
    correct: ['b'],
    explanation: 'YANG is the data-modeling language that defines configuration and state for NETCONF/RESTCONF/gNMI. CSV, INI, and Markdown are not network data-modeling languages.',
    references: [REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is version control (e.g., Git) considered essential for Infrastructure as Code?',
    options: opts4(
      'It compiles the network configuration into firmware',
      'It tracks changes, enables review, and allows rollback of infrastructure definitions',
      'It replaces the need for testing',
      'It increases link bandwidth'
    ),
    correct: ['b'],
    explanation: 'Storing IaC in Git provides change history, peer review, and rollback — core to safe, auditable infrastructure changes. It does not compile firmware, replace testing, or affect bandwidth.',
    references: [REF_GIT, REF_CICD]
  },

  // ── Network Fundamentals (9) ──
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'At which OSI layer does IP addressing and routing operate?',
    options: opts4(
      'Layer 2 (Data Link)',
      'Layer 3 (Network)',
      'Layer 4 (Transport)',
      'Layer 7 (Application)'
    ),
    correct: ['b'],
    explanation: 'IP addressing and routing are Layer 3 (Network) functions. Layer 2 handles MAC/framing, Layer 4 handles end-to-end transport (TCP/UDP), and Layer 7 is application protocols.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which transport-layer protocol provides connection-oriented, reliable, ordered delivery with retransmission?',
    options: opts4(
      'UDP',
      'TCP',
      'ICMP',
      'ARP'
    ),
    correct: ['b'],
    explanation: 'TCP is connection-oriented and provides reliable, ordered delivery with acknowledgments and retransmission. UDP is connectionless/best-effort, ICMP is for control messages, and ARP resolves IP to MAC.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that are true about IPv4 private address ranges (RFC 1918).',
    options: opts4(
      '10.0.0.0/8 is a private range',
      '172.16.0.0/12 is a private range',
      '8.8.8.8 is a private address',
      '192.168.0.0/16 is a private range'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'RFC 1918 private ranges are 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16. 8.8.8.8 is a well-known public DNS resolver address, not private.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A host is configured with IP 192.168.10.20/24. What is the network address of its subnet?',
    options: opts4(
      '192.168.10.0',
      '192.168.10.20',
      '192.168.10.255',
      '192.168.0.0'
    ),
    correct: ['a'],
    explanation: 'With a /24 mask, the first 24 bits are the network. Zeroing the host octet of 192.168.10.20 gives the network address 192.168.10.0; .255 is the broadcast.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which protocol resolves a domain name such as developer.cisco.com into an IP address?',
    options: opts4(
      'DHCP',
      'DNS',
      'NTP',
      'SMTP'
    ),
    correct: ['b'],
    explanation: 'DNS resolves hostnames to IP addresses. DHCP assigns IP configuration, NTP synchronizes time, and SMTP transfers email.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which device primarily forwards traffic between different IP networks based on a routing table?',
    options: opts4(
      'Layer 2 switch',
      'Router',
      'Hub',
      'Repeater'
    ),
    correct: ['b'],
    explanation: 'A router forwards packets between IP networks using its routing table. A Layer 2 switch forwards frames within a LAN, while hubs and repeaters operate at the physical layer.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'An application connects to a server on TCP port 443. Which service is conventionally associated with that port?',
    options: opts4(
      'HTTP (cleartext web)',
      'HTTPS (TLS-encrypted web)',
      'SSH',
      'DNS'
    ),
    correct: ['b'],
    explanation: 'TCP 443 is the well-known port for HTTPS (HTTP over TLS). HTTP uses 80, SSH uses 22, and DNS uses 53.',
    references: [REF_OSI, REF_HTTP]
  },
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the primary function of NAT (Network Address Translation) at an Internet edge?',
    options: opts4(
      'Encrypting all application payloads',
      'Translating private IP addresses to a routable public address',
      'Assigning DNS names to hosts',
      'Synchronizing system clocks'
    ),
    correct: ['b'],
    explanation: 'NAT maps private (RFC 1918) addresses to one or more public addresses so internal hosts can reach the Internet. It does not encrypt payloads, assign DNS names, or sync clocks.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer cannot reach an API endpoint and wants to verify basic IP reachability and round-trip latency to the host. Which utility is most appropriate first?',
    options: opts4(
      'ping',
      'git',
      'pip',
      'docker'
    ),
    correct: ['a'],
    explanation: '`ping` sends ICMP echo requests to test basic Layer 3 reachability and measure round-trip time. git, pip, and docker are development/packaging tools, not reachability diagnostics.',
    references: [REF_OSI]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Software Development and Design (10) ──
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which version-control concept lets multiple developers work on isolated lines of development that are later integrated?',
    options: opts4(
      'Branching',
      'Garbage collection',
      'Port forwarding',
      'Subnetting'
    ),
    correct: ['a'],
    explanation: 'Branching creates isolated lines of development that can be merged back later, enabling parallel work. The other terms relate to memory, networking, and addressing, not source control.',
    references: [REF_GIT]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best describes the Observer design pattern?',
    options: opts4(
      'It restricts a class to a single instance',
      'It defines a one-to-many dependency so dependents are notified of state changes',
      'It provides a simplified interface to a complex subsystem',
      'It creates objects without specifying concrete classes'
    ),
    correct: ['b'],
    explanation: 'Observer establishes a one-to-many relationship where observers are notified when the subject changes. Singleton restricts instances, Facade simplifies a subsystem, and Factory abstracts object creation.',
    references: [REF_DESIGN]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL good practices for writing maintainable Python code.',
    options: opts4(
      'Use clear, descriptive function and variable names',
      'Add docstrings and comments where intent is non-obvious',
      'Duplicate logic across many functions instead of reusing it',
      'Follow a consistent style guide such as PEP 8'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Descriptive names, docstrings, and a consistent style guide improve maintainability. Duplicating logic (violating DRY) increases bugs and maintenance cost — refactor into reusable functions instead.',
    references: [REF_PYTHON, REF_DESIGN]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Git command shows the commit history of the current branch?',
    options: opts4(
      'git log',
      'git clone',
      'git init',
      'git rm'
    ),
    correct: ['a'],
    explanation: '`git log` displays the commit history. `git clone` copies a repository, `git init` creates a new repo, and `git rm` removes tracked files.',
    references: [REF_GIT]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'A function returns different results for the same inputs because it reads a global mutable variable. Which quality is the function lacking?',
    options: opts4(
      'Purity / referential transparency',
      'Recursion',
      'Encapsulation of imports',
      'Static typing'
    ),
    correct: ['a'],
    explanation: 'A pure (referentially transparent) function always returns the same output for the same inputs with no side effects. Depending on external mutable state breaks purity, complicating testing and reasoning.',
    references: [REF_PYTHON, REF_DESIGN]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of a `requirements.txt` file in a Python project?',
    options: opts4(
      'It stores the application logs',
      'It pins the project package dependencies for reproducible installs',
      'It defines firewall rules',
      'It is the unit-test report'
    ),
    correct: ['b'],
    explanation: '`requirements.txt` lists package dependencies (often with pinned versions) so `pip install -r` reproduces the environment. It is not for logs, firewall rules, or test reports.',
    references: [REF_PYTHON]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach writes tests before the implementation code, then writes just enough code to pass them?',
    options: opts4(
      'Test-Driven Development (TDD)',
      'Waterfall sign-off',
      'Manual smoke testing only',
      'Hotfix-first development'
    ),
    correct: ['a'],
    explanation: 'TDD follows red-green-refactor: write a failing test, write minimal code to pass, then refactor. The other options do not require tests to precede implementation.',
    references: [REF_DESIGN]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which data structure provides last-in, first-out (LIFO) access?',
    options: opts4(
      'Queue',
      'Stack',
      'Hash map',
      'Linked list (only FIFO)'
    ),
    correct: ['b'],
    explanation: 'A stack is LIFO — the most recently pushed element is popped first. A queue is FIFO, a hash map provides key lookup, and a linked list can implement either depending on operations.',
    references: [REF_PYTHON]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer wants to undo the last local commit but keep the changes staged. Which Git command is appropriate?',
    options: opts4(
      'git reset --soft HEAD~1',
      'git push --force',
      'git clone --depth 1',
      'git config --global user.name'
    ),
    correct: ['a'],
    explanation: '`git reset --soft HEAD~1` moves HEAD back one commit while keeping the changes staged. Force-push rewrites remote history, clone copies a repo, and config sets identity.',
    references: [REF_GIT]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which principle encourages designing modules so that they are open for extension but closed for modification?',
    options: opts4(
      'Open/Closed Principle',
      'Don’t Repeat Yourself',
      'You Aren’t Gonna Need It',
      'Keep It Simple'
    ),
    correct: ['a'],
    explanation: 'The Open/Closed Principle says software entities should be extendable without modifying existing, tested code (e.g., via abstraction/polymorphism). DRY, YAGNI, and KISS are separate guidelines.',
    references: [REF_DESIGN]
  },

  // ── Understanding and Using APIs (13) ──
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which HTTP method is typically used to fully replace an existing resource?',
    options: opts4(
      'GET',
      'PUT',
      'OPTIONS',
      'HEAD'
    ),
    correct: ['b'],
    explanation: 'PUT replaces a resource with the supplied representation and is idempotent. GET retrieves, OPTIONS describes allowed methods, and HEAD returns headers only.',
    references: [REF_HTTP, REF_REST]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'An API returns HTTP 200 with a JSON body. Which Python `requests` attribute parses that body into a dictionary?',
    options: opts4(
      'response.status_code',
      'response.json()',
      'response.headers',
      'response.url'
    ),
    correct: ['b'],
    explanation: '`response.json()` deserializes a JSON body into a Python object (typically a dict). `status_code` is the numeric status, `headers` are the response headers, and `url` is the final URL.',
    references: [REF_PYTHON, REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid reasons an API would return HTTP status codes in the 4xx range.',
    options: opts4(
      'The client sent malformed JSON (400)',
      'Authentication failed (401)',
      'The server crashed unexpectedly (this is 4xx)',
      'The requested resource does not exist (404)'
    ),
    correct: ['a', 'b', 'd'],
    explanation: '4xx codes indicate client errors: 400 bad request, 401 unauthorized, 404 not found. An unexpected server crash is a 5xx (server error), not 4xx.',
    references: [REF_HTTP, REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A REST endpoint requires the header `Content-Type: application/json` on a POST. What does omitting or setting the wrong value most likely cause?',
    options: opts4(
      'Faster responses',
      'The server may reject the request or fail to parse the body (e.g., 415 Unsupported Media Type)',
      'Automatic retries',
      'A redirect to HTTP'
    ),
    correct: ['b'],
    explanation: 'The `Content-Type` header tells the server how to parse the request body. An incorrect/missing value can cause a parse failure or a 415 Unsupported Media Type response.',
    references: [REF_HTTP, REF_REST]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which serialization format is natively object-based, human-readable, and the default payload for most modern REST APIs?',
    options: opts4(
      'JSON',
      'EBCDIC',
      'A raw byte stream with no schema',
      'Base64 only'
    ),
    correct: ['a'],
    explanation: 'JSON is human-readable, object/array based, and the default REST payload format. EBCDIC is a legacy character encoding, and base64 is an encoding scheme, not a structured format.',
    references: [REF_JSON, REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A client must call an API that limits requests to 5 per second. Which technique best avoids being throttled?',
    options: opts4(
      'Send all requests simultaneously',
      'Implement client-side rate limiting / throttling and backoff',
      'Disable TLS to send faster',
      'Ignore HTTP status codes'
    ),
    correct: ['b'],
    explanation: 'Client-side throttling with backoff keeps the request rate within the server limit and handles 429 responses gracefully. Bursting all requests guarantees throttling.',
    references: [REF_REST, REF_MERAKI]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'In a URL like `https://api.example.com/v1/devices?type=switch`, what is `type=switch`?',
    options: opts4(
      'The path',
      'A query parameter',
      'The scheme',
      'The fragment'
    ),
    correct: ['b'],
    explanation: 'Text after `?` is the query string; `type=switch` is a query parameter used to filter results. The scheme is `https`, the path is `/v1/devices`, and a fragment follows `#`.',
    references: [REF_REST, REF_HTTP]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which authentication method sends a base64-encoded `username:password` in the Authorization header?',
    options: opts4(
      'OAuth 2.0 bearer token',
      'HTTP Basic authentication',
      'API key in cookie',
      'Mutual TLS'
    ),
    correct: ['b'],
    explanation: 'HTTP Basic auth encodes `username:password` in base64 within the Authorization header (and must be used over TLS). Bearer tokens, cookie API keys, and mTLS use different mechanisms.',
    references: [REF_REST, REF_HTTP]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which HTTP status code class (2xx) indicates the request was successfully received, understood, and accepted?',
    options: opts4(
      '1xx Informational',
      '2xx Success',
      '3xx Redirection',
      '5xx Server Error'
    ),
    correct: ['b'],
    explanation: '2xx codes (e.g., 200, 201, 204) indicate success. 1xx is informational, 3xx is redirection, and 5xx indicates a server-side error.',
    references: [REF_HTTP]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Webex integration must receive a notification whenever a new message is posted to a space. Which mechanism should it register?',
    options: opts4(
      'A polling cron job every hour',
      'A webhook subscribed to the messages created event',
      'An SNMP trap',
      'A syslog server'
    ),
    correct: ['b'],
    explanation: 'A Webex webhook subscribed to `messages` `created` events delivers near-real-time callbacks. Hourly polling is inefficient and laggy; SNMP traps and syslog are not Webex notification mechanisms.',
    references: [REF_WEBEX]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the acronym CRUD map to in RESTful API design?',
    options: opts4(
      'Connect, Route, Update, Delete',
      'Create, Read, Update, Delete (commonly POST, GET, PUT/PATCH, DELETE)',
      'Cache, Render, Upload, Deploy',
      'Compile, Run, Undo, Debug'
    ),
    correct: ['b'],
    explanation: 'CRUD = Create, Read, Update, Delete, conventionally mapped to POST, GET, PUT/PATCH, and DELETE on resource URIs.',
    references: [REF_REST, REF_HTTP]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer needs to inspect exactly what headers and body a script sends to a Cisco API for troubleshooting. Which approach is most appropriate?',
    options: opts4(
      'Guess based on documentation only',
      'Capture/inspect the request with an API client or proxy debugger (e.g., Postman, mitmproxy)',
      'Reboot the network device',
      'Disable logging on the client'
    ),
    correct: ['b'],
    explanation: 'An API client or debugging proxy reveals the exact request line, headers, and body for troubleshooting. Guessing or disabling logging removes the visibility you need; rebooting devices is unrelated.',
    references: [REF_DEVNET_LEARN, REF_REST]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about a stateless REST API is correct?',
    options: opts4(
      'The server stores the client session between requests',
      'Each request must contain all information needed to process it',
      'Requests cannot include authentication',
      'It requires a persistent TCP connection for the whole session'
    ),
    correct: ['b'],
    explanation: 'In a stateless API, each request is self-contained (including auth/context); the server keeps no client session state between requests, which improves scalability.',
    references: [REF_REST]
  },

  // ── Cisco Platforms and Development (10) ──
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco product family provides cloud-managed networking with a centralized dashboard and a documented REST API for organizations and networks?',
    options: opts4(
      'Cisco Meraki',
      'Cisco IOS classic only',
      'Cisco Jabber',
      'Cisco TelePresence rooms'
    ),
    correct: ['a'],
    explanation: 'Cisco Meraki is cloud-managed and exposes the Dashboard REST API operating on organizations, networks, and devices. The other options are not cloud-managed dashboard platforms.',
    references: [REF_MERAKI]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'In Cisco ACI, what is the role of the APIC?',
    options: opts4(
      'A data-plane forwarding ASIC',
      'The centralized policy controller and single point of management/automation for the fabric',
      'A wireless access point model',
      'A serial console server'
    ),
    correct: ['b'],
    explanation: 'The APIC (Application Policy Infrastructure Controller) is the centralized policy controller and automation API endpoint for an ACI fabric. It is not a forwarding ASIC, AP, or console server.',
    references: [REF_ACI]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL tasks the Catalyst Center (DNA Center) platform API can automate.',
    options: opts4(
      'Retrieving network device inventory',
      'Provisioning sites and assigning devices',
      'Pushing configuration templates',
      'Mining cryptocurrency on switches'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The Catalyst Center API automates inventory retrieval, site provisioning/assignment, and template push, among other intent operations. Cryptocurrency mining on switches is not a platform capability.',
    references: [REF_DNAC]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco programmability interface on IOS XE returns operational and configuration data as JSON over HTTPS?',
    options: opts4(
      'RESTCONF',
      'Telnet',
      'FTP',
      'LLDP'
    ),
    correct: ['a'],
    explanation: 'RESTCONF on IOS XE exposes YANG-modeled data over HTTPS using JSON or XML. Telnet is a CLI transport, FTP is file transfer, and LLDP is a discovery protocol.',
    references: [REF_IOSXE, REF_NETCONF]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer wants a free, no-hardware environment to practice calling the Webex API. Which Cisco DevNet resource is most appropriate?',
    options: opts4(
      'A DevNet Sandbox / Learning Lab for Webex',
      'A purchase order in Cisco Commerce',
      'A TAC service request',
      'A hardware RMA'
    ),
    correct: ['a'],
    explanation: 'DevNet Sandboxes and Learning Labs provide free, no-hardware practice environments for Webex and other platform APIs. Commerce, TAC, and RMA are commercial/support processes.',
    references: [REF_DEVNET, REF_WEBEX]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco platform is designed primarily for collaboration automation, including messaging, meetings, and devices?',
    options: opts4(
      'Cisco Webex',
      'Cisco ACI',
      'Cisco DNA Center',
      'Cisco IOS XE'
    ),
    correct: ['a'],
    explanation: 'Cisco Webex provides collaboration APIs for messaging, meetings, and devices. ACI and DNA Center automate networks, and IOS XE is a network OS.',
    references: [REF_WEBEX]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'When automating Cisco NX-OS, which mechanism allows running Python scripts directly on the switch?',
    options: opts4(
      'On-box (guest shell / on-switch) Python',
      'A Windows-only desktop agent',
      'A printed runbook',
      'A serial null-modem cable'
    ),
    correct: ['a'],
    explanation: 'NX-OS supports on-box Python (including the Guest Shell) so automation can run directly on the switch. The other options are not NX-OS scripting environments.',
    references: [REF_NXOS]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which DevNet resource provides structured, hands-on tutorials that guide developers through Cisco API workflows step by step?',
    options: opts4(
      'DevNet Learning Labs',
      'Cisco Bug Search Tool',
      'Cisco Software Download',
      'Cisco EOL bulletins'
    ),
    correct: ['a'],
    explanation: 'DevNet Learning Labs deliver guided, hands-on tutorials for Cisco APIs and tools. Bug Search, Software Download, and EOL bulletins serve support/lifecycle purposes, not guided coding labs.',
    references: [REF_DEVNET_LEARN]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'A script calls the Meraki Dashboard API and receives HTTP 404 for an organization ID. What is the most likely cause?',
    options: opts4(
      'The TLS certificate expired on the client',
      'The organization ID is incorrect or the API key lacks access to it',
      'The switch firmware needs a reboot',
      'JSON is not supported by Meraki'
    ),
    correct: ['b'],
    explanation: 'A 404 for an organization typically means the ID is wrong or the API key has no access to that resource. Meraki fully supports JSON, and a client cert/firmware issue would not present as a resource 404.',
    references: [REF_MERAKI]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco platform exposes a northbound REST API plus assurance data for an intent-based campus network?',
    options: opts4(
      'Cisco Catalyst Center (DNA Center)',
      'Cisco Jabber',
      'Cisco AnyConnect',
      'Cisco IP Phone firmware'
    ),
    correct: ['a'],
    explanation: 'Catalyst Center (DNA Center) provides a northbound REST API and assurance analytics for intent-based campus networking. The other options are clients/endpoints, not controller platforms.',
    references: [REF_DNAC]
  },

  // ── Application Deployment and Security (10) ──
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command builds a Docker image from the Dockerfile in the current directory and tags it `app:1.0`?',
    options: opts4(
      'docker run app:1.0',
      'docker build -t app:1.0 .',
      'docker pull app:1.0',
      'docker ps app:1.0'
    ),
    correct: ['b'],
    explanation: '`docker build -t app:1.0 .` builds the image using the current directory context and tags it. `docker run` starts a container, `docker pull` downloads an image, and `docker ps` lists containers.',
    references: [REF_DOCKER]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A web application accepts a search term and inserts it directly into a SQL query string. Which vulnerability class does this create?',
    options: opts4(
      'Cross-site scripting only',
      'SQL injection',
      'DNS poisoning',
      'ARP spoofing'
    ),
    correct: ['b'],
    explanation: 'Concatenating untrusted input into SQL enables SQL injection. The mitigation is parameterized queries/prepared statements. XSS, DNS poisoning, and ARP spoofing are unrelated attack classes here.',
    references: [REF_SECURITY]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL benefits of containerizing an application for deployment.',
    options: opts4(
      'Consistent runtime environment across stages',
      'Lightweight, fast startup compared to full VMs',
      'Guaranteed elimination of all security concerns',
      'Easier horizontal scaling via orchestration'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Containers give environment consistency, fast lightweight startup, and easy orchestration-based scaling. They do NOT eliminate security concerns — image, runtime, and supply-chain risks still require controls.',
    references: [REF_DOCKER, REF_SECURITY]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool defines and runs multi-container Docker applications from a single declarative YAML file?',
    options: opts4(
      'Docker Compose',
      'traceroute',
      'curl',
      'ssh-keygen'
    ),
    correct: ['a'],
    explanation: 'Docker Compose uses a `compose.yml`/`docker-compose.yml` file to define and run multi-container applications. curl makes HTTP requests, traceroute traces paths, and ssh-keygen creates keys.',
    references: [REF_DOCKER]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the main security advantage of using short-lived access tokens over long-lived static credentials?',
    options: opts4(
      'They never need to be transmitted',
      'A leaked token has a limited validity window, reducing exposure',
      'They make TLS unnecessary',
      'They increase request throughput'
    ),
    correct: ['b'],
    explanation: 'Short-lived tokens limit the window an attacker can use a leaked credential, reducing exposure. They still must be transmitted securely (over TLS) and do not affect throughput.',
    references: [REF_SECURITY]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'In a CI/CD pipeline, what is a "build artifact"?',
    options: opts4(
      'A network packet capture',
      'The packaged output of a build (e.g., a container image or compiled binary) passed to later stages',
      'A firewall rule set',
      'A DNS zone file'
    ),
    correct: ['b'],
    explanation: 'A build artifact is the packaged output (image, archive, binary) produced by the build stage and consumed by test/deploy stages. The other options are unrelated network/security objects.',
    references: [REF_CICD]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which practice reduces the attack surface of a container image?',
    options: opts4(
      'Basing it on a minimal image and removing unnecessary packages',
      'Installing every available development tool',
      'Running the app as root by default',
      'Disabling image scanning'
    ),
    correct: ['a'],
    explanation: 'Using a minimal base image and removing unneeded packages shrinks the attack surface and patch burden. Extra tools, running as root, and disabling scanning all increase risk.',
    references: [REF_SECURITY, REF_DOCKER]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which environment is intended to mirror production for final validation before a release goes live?',
    options: opts4(
      'Development laptop only',
      'Staging environment',
      'A whiteboard sketch',
      'The CI runner cache'
    ),
    correct: ['b'],
    explanation: 'A staging environment closely mirrors production so changes can be validated before going live. A dev laptop is not production-like, and the others are not environments.',
    references: [REF_CICD]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A deployment must roll out a new version with the ability to instantly revert if errors spike. Which strategy provides this?',
    options: opts4(
      'Edit files directly on the production server with no backup',
      'Blue/green (or canary) deployment with fast rollback',
      'Delete the old version before deploying the new one',
      'Deploy only on Fridays at 5 PM'
    ),
    correct: ['b'],
    explanation: 'Blue/green or canary deployments keep a known-good version available so traffic can be shifted back instantly on failure. Editing prod directly or deleting the old version removes the rollback path.',
    references: [REF_CICD]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Why should application logs avoid recording full passwords or API tokens?',
    options: opts4(
      'Logs are always encrypted, so it does not matter',
      'Logs are often centralized and broadly readable, so secrets in logs become a leakage vector',
      'It improves log compression',
      'It speeds up the application'
    ),
    correct: ['b'],
    explanation: 'Logs are frequently aggregated and accessible to many people/systems; writing secrets into them creates a broad credential-leakage vector. Logs are not guaranteed to be encrypted.',
    references: [REF_SECURITY]
  },

  // ── Infrastructure and Automation (13) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which configuration-management approach declares the desired end state and lets the tool determine the steps to reach it?',
    options: opts4(
      'Imperative scripting of every command',
      'Declarative configuration',
      'Manual console entry',
      'One-off shell aliases'
    ),
    correct: ['b'],
    explanation: 'Declarative configuration specifies the desired end state; the tool computes the actions to converge to it. Imperative scripting lists explicit steps, which is harder to keep idempotent.',
    references: [REF_ANSIBLE, REF_CICD]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A NETCONF client wants only configuration data, not operational state, from a device. Which datastore/operation concept applies?',
    options: opts4(
      'Use <get-config> against a configuration datastore (e.g., running)',
      'Use ping to the device',
      'Read the serial console buffer',
      'Query SNMP sysUpTime'
    ),
    correct: ['a'],
    explanation: 'NETCONF `<get-config>` retrieves configuration from a datastore such as `running`, while `<get>` returns config plus state. ping, console buffers, and SNMP sysUpTime are unrelated.',
    references: [REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Ansible for network automation.',
    options: opts4(
      'It is agentless for many use cases',
      'Playbooks are written in YAML',
      'It can use network connection plugins to talk to devices',
      'It requires installing a compiled agent on every router'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Ansible is agentless, uses YAML playbooks, and has network connection plugins (e.g., network_cli, netconf). It does NOT require a compiled agent on each router.',
    references: [REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of a "dry run" (check mode) in an automation tool?',
    options: opts4(
      'It permanently applies changes faster',
      'It reports what would change without actually modifying the systems',
      'It deletes the inventory',
      'It encrypts the playbook'
    ),
    correct: ['b'],
    explanation: 'Check/dry-run mode previews intended changes without applying them, supporting safe validation before a real run. It does not modify systems, delete inventory, or encrypt playbooks.',
    references: [REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which protocol is purpose-built for streaming model-driven telemetry efficiently from network devices to a collector?',
    options: opts4(
      'gNMI (gRPC Network Management Interface)',
      'FTP',
      'Telnet',
      'POP3'
    ),
    correct: ['a'],
    explanation: 'gNMI uses gRPC to subscribe to and stream YANG-modeled telemetry efficiently. FTP transfers files, Telnet is a CLI transport, and POP3 retrieves email.',
    references: [REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What does CI in CI/CD primarily ensure?',
    options: opts4(
      'Code changes are frequently integrated and automatically tested',
      'Cables are inventoried',
      'Containers are immortal',
      'Configuration is never changed'
    ),
    correct: ['a'],
    explanation: 'Continuous Integration means developers integrate changes frequently into a shared branch with automated builds/tests catching regressions early. The other options are not what CI means.',
    references: [REF_CICD]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A team stores all network device intended configs in Git and applies them via a pipeline. Which benefit does this MOST directly provide?',
    options: opts4(
      'Higher link speed',
      'A reviewable, auditable source of truth with rollback',
      'Automatic IP address assignment',
      'Encrypted Wi-Fi by default'
    ),
    correct: ['b'],
    explanation: 'Treating configs as version-controlled code yields an auditable source of truth, peer review, and rollback. It does not change link speed, assign IPs, or configure Wi-Fi encryption by itself.',
    references: [REF_GIT, REF_CICD]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Python library provides multi-vendor, structured interaction with network devices using a common API (often over NETCONF/SSH)?',
    options: opts4(
      'NAPALM',
      'Pillow',
      'BeautifulSoup',
      'SQLAlchemy'
    ),
    correct: ['a'],
    explanation: 'NAPALM offers a unified, multi-vendor API for retrieving and configuring network devices. Pillow handles images, BeautifulSoup parses HTML, and SQLAlchemy is an ORM.',
    references: [REF_PYTHON, REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best describes "immutable infrastructure"?',
    options: opts4(
      'Servers are patched in place repeatedly over years',
      'Instead of modifying running servers, you replace them with new built-from-image instances',
      'Infrastructure cannot be automated',
      'Configuration is stored only in memory'
    ),
    correct: ['b'],
    explanation: 'Immutable infrastructure replaces instances with freshly built images rather than mutating them in place, reducing drift and improving reproducibility.',
    references: [REF_CICD]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'In an Ansible playbook, what is a "task"?',
    options: opts4(
      'A single action that calls a module against the targeted hosts',
      'The git commit hash',
      'A firewall ACL line',
      'A DNS A record'
    ),
    correct: ['a'],
    explanation: 'An Ansible task is a single unit of action that invokes a module (e.g., copy, ios_config) against targeted hosts. It is not a commit hash, ACL line, or DNS record.',
    references: [REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is structured data (JSON/XML from model-driven APIs) preferred over CLI screen-scraping for automation?',
    options: opts4(
      'It looks nicer in a terminal',
      'It is reliably machine-parseable and less likely to break when output formatting changes',
      'It uses less electricity',
      'It is required by TCP'
    ),
    correct: ['b'],
    explanation: 'Structured API data is deterministically machine-parseable, so automation is robust against CLI formatting changes that break fragile screen-scraping.',
    references: [REF_NETCONF, REF_JSON]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which term describes automatically provisioning and configuring a brand-new device when it first connects to the network?',
    options: opts4(
      'Zero-touch provisioning (ZTP)',
      'Manual rack-and-stack only',
      'Packet fragmentation',
      'Spanning tree election'
    ),
    correct: ['a'],
    explanation: 'Zero-touch provisioning automatically configures a new device on first boot/connection using a defined workflow, reducing manual setup. The other options are unrelated networking concepts.',
    references: [REF_NETCONF, REF_DNAC]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A pipeline must run automation only after the network test topology passes validation tests. Which CI/CD concept enforces this ordering?',
    options: opts4(
      'A pipeline stage/gate dependency',
      'A subnet mask',
      'A MAC address table',
      'A DNS TTL'
    ),
    correct: ['a'],
    explanation: 'Pipeline stages with gate dependencies ensure later stages run only after earlier ones (e.g., validation) succeed. Subnet masks, MAC tables, and DNS TTLs are unrelated networking constructs.',
    references: [REF_CICD]
  },

  // ── Network Fundamentals (9) ──
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Layer 2 address uniquely identifies a network interface on a local segment?',
    options: opts4(
      'IPv4 address',
      'MAC address',
      'TCP port number',
      'DNS name'
    ),
    correct: ['b'],
    explanation: 'A MAC address is the Layer 2 hardware address identifying an interface on a local segment. IP is Layer 3, TCP ports are Layer 4, and DNS names are application-layer identifiers.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A /26 IPv4 subnet provides how many usable host addresses?',
    options: opts4(
      '64',
      '62',
      '30',
      '126'
    ),
    correct: ['b'],
    explanation: 'A /26 has 6 host bits = 64 total addresses; subtracting the network and broadcast addresses leaves 62 usable hosts.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL protocols that operate at the transport layer (OSI Layer 4).',
    options: opts4(
      'TCP',
      'UDP',
      'IP',
      'Both TCP and UDP'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'TCP and UDP are transport-layer (Layer 4) protocols, so "Both TCP and UDP" is also correct. IP operates at Layer 3 (Network), not the transport layer.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol automatically assigns IP addresses and network configuration to clients?',
    options: opts4(
      'DHCP',
      'BGP',
      'OSPF',
      'STP'
    ),
    correct: ['a'],
    explanation: 'DHCP dynamically assigns IP addresses, subnet mask, gateway, and DNS to clients. BGP and OSPF are routing protocols, and STP prevents Layer 2 loops.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A client opens an HTTPS connection. Which layer-4 protocol and well-known port pair is used?',
    options: opts4(
      'UDP / 53',
      'TCP / 443',
      'TCP / 23',
      'UDP / 161'
    ),
    correct: ['b'],
    explanation: 'HTTPS uses TCP with well-known port 443. UDP/53 is DNS, TCP/23 is Telnet, and UDP/161 is SNMP.',
    references: [REF_OSI, REF_HTTP]
  },
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the function of a default gateway on a host?',
    options: opts4(
      'It resolves DNS names',
      'It is the router the host sends traffic to for destinations outside its local subnet',
      'It stores the host firmware',
      'It assigns MAC addresses'
    ),
    correct: ['b'],
    explanation: 'The default gateway is the next-hop router for destinations not on the host’s local subnet. DNS resolution, firmware storage, and MAC assignment are different functions.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which tool traces the path (hop-by-hop routers) packets take to reach a destination host?',
    options: opts4(
      'traceroute / tracert',
      'chmod',
      'grep',
      'tar'
    ),
    correct: ['a'],
    explanation: 'traceroute (tracert on Windows) reveals the sequence of routers along the path to a destination. chmod, grep, and tar are unrelated file/text utilities.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes TCP from UDP?',
    options: opts4(
      'TCP is connectionless; UDP is connection-oriented',
      'TCP provides reliable, ordered delivery; UDP is best-effort and lower overhead',
      'UDP guarantees delivery; TCP does not',
      'Both provide identical reliability guarantees'
    ),
    correct: ['b'],
    explanation: 'TCP is connection-oriented with reliable, ordered delivery; UDP is connectionless, best-effort, and lower overhead (useful for latency-sensitive traffic). UDP does not guarantee delivery.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'An API client receives "connection refused" when calling https://host:8443. Which explanation is most consistent with that error?',
    options: opts4(
      'DNS resolved but no service is listening on TCP 8443 at that host',
      'The JSON body is malformed',
      'The HTTP method is wrong',
      'The access token expired'
    ),
    correct: ['a'],
    explanation: '"Connection refused" is a transport-layer signal that nothing is accepting connections on that port/host. Malformed JSON, wrong method, or expired tokens would produce HTTP-level responses, not a refused TCP connection.',
    references: [REF_OSI, REF_REST]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Software Development and Design (10) ──
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Git command downloads a complete copy of a remote repository, including its history, to your local machine?',
    options: opts4(
      'git clone',
      'git status',
      'git diff',
      'git tag'
    ),
    correct: ['a'],
    explanation: '`git clone` copies an entire remote repository (history and branches) locally. `git status` shows working-tree state, `git diff` shows changes, and `git tag` marks releases.',
    references: [REF_GIT]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which creational design pattern provides a single, globally accessible instance of a class?',
    options: opts4(
      'Singleton',
      'Adapter',
      'Strategy',
      'Decorator'
    ),
    correct: ['a'],
    explanation: 'The Singleton pattern ensures a class has one instance with a global access point. Adapter converts interfaces, Strategy swaps algorithms, and Decorator adds behavior dynamically.',
    references: [REF_DESIGN]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that support a clean, reviewable Git history.',
    options: opts4(
      'Writing clear, descriptive commit messages',
      'Making focused commits that address one logical change',
      'Committing unrelated changes together in one giant commit',
      'Using feature branches and pull requests for review'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Descriptive messages, focused commits, and PR-based review keep history readable and reviewable. Bundling unrelated changes into one giant commit makes review and rollback harder.',
    references: [REF_GIT]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the DRY principle advise?',
    options: opts4(
      'Document Repeatedly, Yearly',
      'Avoid duplicating logic; have a single authoritative representation of each piece of knowledge',
      'Deploy Rarely, Yearly',
      'Disable Runtime Yields'
    ),
    correct: ['b'],
    explanation: 'DRY (Don’t Repeat Yourself) advises against duplicating logic; each piece of knowledge should have one authoritative representation to reduce bugs and maintenance.',
    references: [REF_DESIGN]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'A Python script must handle the case where an API call raises an exception without crashing. Which construct is appropriate?',
    options: opts4(
      'A try/except block around the call',
      'A while True loop with no exit',
      'Deleting the function',
      'Printing to stderr only'
    ),
    correct: ['a'],
    explanation: 'A try/except block catches and handles exceptions gracefully (e.g., logging and retrying). An infinite loop, deleting the function, or only printing does not handle the error path.',
    references: [REF_PYTHON]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which file conventionally instructs Git to ignore certain files (e.g., virtual environments, secrets) from version control?',
    options: opts4(
      '.gitignore',
      'Dockerfile',
      'README.md',
      'setup.cfg'
    ),
    correct: ['a'],
    explanation: '`.gitignore` lists path patterns Git should not track, helping keep secrets and build artifacts out of the repo. The other files serve documentation, build, or packaging roles.',
    references: [REF_GIT]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which sorting algorithm has an average and worst-case time complexity of O(n^2)?',
    options: opts4(
      'Merge sort',
      'Bubble sort',
      'Heap sort',
      'Binary search'
    ),
    correct: ['b'],
    explanation: 'Bubble sort is O(n^2) on average and worst case. Merge and heap sort are O(n log n); binary search is O(log n) and is a search, not a sort.',
    references: [REF_PYTHON]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'In Agile/Scrum, what is a "sprint"?',
    options: opts4(
      'A permanent freeze of all requirements',
      'A short, fixed-length iteration that delivers a potentially shippable increment',
      'A network performance test',
      'A type of merge conflict'
    ),
    correct: ['b'],
    explanation: 'A sprint is a short, time-boxed iteration (commonly 1–4 weeks) producing a potentially shippable increment. It is not a requirements freeze, network test, or merge conflict.',
    references: [REF_DESIGN]
  },
  {
    domain: SWDEV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which practice most directly reduces "it works on my machine" deployment problems?',
    options: opts4(
      'Hard-coding absolute paths',
      'Packaging the app and its dependencies (e.g., in a container) for consistent environments',
      'Skipping dependency pinning',
      'Editing production directly'
    ),
    correct: ['b'],
    explanation: 'Packaging the app with its dependencies (containerization, pinned requirements) ensures the same environment everywhere, eliminating environment-drift surprises.',
    references: [REF_DOCKER, REF_PYTHON]
  },
  {
    domain: SWDEV, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the primary purpose of a code review before merging a pull request?',
    options: opts4(
      'To increase line count',
      'To catch defects, share knowledge, and maintain code quality before integration',
      'To slow the team down intentionally',
      'To rename the repository'
    ),
    correct: ['b'],
    explanation: 'Code review catches defects early, spreads knowledge across the team, and enforces quality/standards before code is integrated. It is a quality and collaboration practice.',
    references: [REF_GIT, REF_DESIGN]
  },

  // ── Understanding and Using APIs (13) ──
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which HTTP method partially updates fields of an existing resource without replacing the whole resource?',
    options: opts4(
      'PUT',
      'PATCH',
      'GET',
      'TRACE'
    ),
    correct: ['b'],
    explanation: 'PATCH applies a partial modification to a resource. PUT replaces the entire resource, GET retrieves it, and TRACE echoes the request for diagnostics.',
    references: [REF_HTTP, REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Cisco API requires the header `X-Auth-Token`. Where should this token typically be obtained?',
    options: opts4(
      'Hard-coded into client source forever',
      'From an authentication endpoint that issues a (often time-limited) token',
      'From the device serial number',
      'From a DNS TXT record'
    ),
    correct: ['b'],
    explanation: 'Token-based APIs (e.g., Catalyst Center) issue an `X-Auth-Token` from an auth endpoint, frequently with an expiry. Hard-coding it, or deriving it from serials/DNS, is incorrect and insecure.',
    references: [REF_DNAC, REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that are true about webhooks.',
    options: opts4(
      'They deliver event notifications by having the server call a client-provided URL',
      'They typically reduce the need for constant polling',
      'They require the client to keep polling every second',
      'They are commonly used by Cisco Webex for message events'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Webhooks push event notifications to a client-registered URL, reducing polling. Cisco Webex uses them for events. Requiring constant per-second polling contradicts the purpose of webhooks.',
    references: [REF_WEBEX, REF_REST]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which status code indicates a successful request that returns no response body?',
    options: opts4(
      '200 OK',
      '204 No Content',
      '301 Moved Permanently',
      '400 Bad Request'
    ),
    correct: ['b'],
    explanation: '204 No Content means the request succeeded but there is intentionally no response body (common for successful DELETE). 200 returns a body, 301 redirects, and 400 is a client error.',
    references: [REF_HTTP]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer must send structured data in a POST body to a JSON API in Python `requests`. Which argument serializes a dict to a JSON body and sets the content type?',
    options: opts4(
      'files=mydict',
      'json=mydict',
      'params=mydict',
      'stream=mydict'
    ),
    correct: ['b'],
    explanation: 'Passing `json=mydict` to `requests` serializes the dict to JSON and sets `Content-Type: application/json`. `params` builds a query string, `files` uploads multipart files, and `stream` controls response streaming.',
    references: [REF_PYTHON, REF_REST]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'What is an API "endpoint"?',
    options: opts4(
      'A physical Ethernet port',
      'A specific URL/path that exposes a resource or operation of the API',
      'A DNS root server',
      'A CPU register'
    ),
    correct: ['b'],
    explanation: 'An API endpoint is a specific URL/path (often combined with a method) that exposes a resource or operation. It is not a physical port, DNS server, or CPU register.',
    references: [REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best protects an API key used by a script in source control?',
    options: opts4(
      'Commit it directly in the script',
      'Load it from an environment variable or secrets manager, and add config files to .gitignore',
      'Email it to the team',
      'Embed it in the README'
    ),
    correct: ['b'],
    explanation: 'Secrets should be injected via environment variables or a secrets manager and excluded from the repo via .gitignore. Committing, emailing, or documenting the key exposes it.',
    references: [REF_SECURITY, REF_GIT]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which HTTP status code range indicates server-side errors?',
    options: opts4(
      '2xx',
      '5xx',
      '3xx',
      '1xx'
    ),
    correct: ['b'],
    explanation: '5xx status codes (e.g., 500, 502, 503) indicate the server failed to fulfill a valid request. 2xx is success, 3xx redirection, and 1xx informational.',
    references: [REF_HTTP]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'An API documentation page describes available paths, parameters, and schemas in a machine-readable specification. Which standard is commonly used for REST API description?',
    options: opts4(
      'OpenAPI (Swagger) specification',
      'RFC 1918',
      'IEEE 802.1Q',
      'PEP 8'
    ),
    correct: ['a'],
    explanation: 'OpenAPI (formerly Swagger) is a widely used machine-readable specification for describing REST APIs. RFC 1918 is private addressing, 802.1Q is VLAN tagging, and PEP 8 is Python style.',
    references: [REF_REST, REF_DEVNET_LEARN]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which part of an HTTP response tells the client the format of the returned body?',
    options: opts4(
      'The Content-Type response header',
      'The TCP sequence number',
      'The MAC address',
      'The default gateway'
    ),
    correct: ['a'],
    explanation: 'The `Content-Type` response header (e.g., `application/json`) declares the media type of the body so the client can parse it. The other items are lower-layer or unrelated fields.',
    references: [REF_HTTP, REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A client must call a paginated API and combine all results. Which is the correct general algorithm?',
    options: opts4(
      'Request page 1 only and stop',
      'Loop: request a page, process it, follow the next link/offset until no more pages remain',
      'Request all pages in a single call with no parameters',
      'Only read the HTTP status code'
    ),
    correct: ['b'],
    explanation: 'Correct pagination loops through pages (following next links or incrementing offsets) until the API signals no further pages, accumulating results. Stopping at page 1 misses data.',
    references: [REF_MERAKI, REF_REST]
  },
  {
    domain: APIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool can convert a captured cURL command into reusable API request collections for testing?',
    options: opts4(
      'Postman',
      'ifconfig',
      'route',
      'arp'
    ),
    correct: ['a'],
    explanation: 'Postman can import cURL commands and organize them into reusable collections for API testing. ifconfig, route, and arp are network configuration/diagnostic utilities.',
    references: [REF_DEVNET_LEARN, REF_REST]
  },
  {
    domain: APIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is HTTPS strongly recommended when calling APIs that send authentication tokens?',
    options: opts4(
      'It compresses JSON automatically',
      'It encrypts the request/response in transit, protecting tokens from eavesdropping',
      'It removes the need for authentication',
      'It guarantees the server is bug-free'
    ),
    correct: ['b'],
    explanation: 'HTTPS (TLS) encrypts traffic in transit so credentials/tokens cannot be read by on-path attackers. It does not eliminate the need for auth or guarantee server correctness.',
    references: [REF_SECURITY, REF_REST]
  },

  // ── Cisco Platforms and Development (10) ──
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco DevNet offering lets you reserve a complete lab environment for hands-on API testing for a limited time?',
    options: opts4(
      'Reservable DevNet Sandbox',
      'Cisco Smart Net Total Care',
      'Cisco Bug Search',
      'Cisco EOL notice'
    ),
    correct: ['a'],
    explanation: 'Reservable DevNet Sandboxes provide time-limited, dedicated lab environments for hands-on API testing. The other options are support/lifecycle services, not lab environments.',
    references: [REF_DEVNET]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'On Cisco IOS XE, which interface family lets you programmatically configure the device using YANG models over either SSH or HTTPS?',
    options: opts4(
      'NETCONF (SSH) and RESTCONF (HTTPS)',
      'Telnet only',
      'SNMP traps only',
      'Serial console only'
    ),
    correct: ['a'],
    explanation: 'IOS XE supports NETCONF over SSH and RESTCONF over HTTPS, both using YANG models for programmatic configuration. Telnet, SNMP traps, and serial console are not model-driven config APIs.',
    references: [REF_IOSXE, REF_NETCONF]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL Cisco platforms that expose a documented REST API for automation.',
    options: opts4(
      'Cisco Catalyst Center (DNA Center)',
      'Cisco Meraki Dashboard',
      'Cisco Webex',
      'A standalone unmanaged Ethernet hub'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Catalyst Center, Meraki Dashboard, and Webex all provide documented REST APIs. A standalone unmanaged hub has no management plane or API.',
    references: [REF_DNAC, REF_MERAKI]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco platform would you target to automate creating a messaging space and posting an alert from a monitoring script?',
    options: opts4(
      'Cisco Webex',
      'Cisco ACI',
      'Cisco IOS XE',
      'Cisco Umbrella'
    ),
    correct: ['a'],
    explanation: 'Cisco Webex APIs create spaces and post messages, making it the right target for ChatOps-style alerting. ACI and IOS XE automate networks, and Umbrella is DNS-layer security.',
    references: [REF_WEBEX]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'What does the ACI object model (Management Information Tree) primarily allow developers to do?',
    options: opts4(
      'Edit the switch boot ROM directly',
      'Programmatically read and modify policy objects that define fabric behavior',
      'Replace TCP with UDP fabric-wide',
      'Disable all logging permanently'
    ),
    correct: ['b'],
    explanation: 'The ACI MIT is a hierarchical object model; developers read/modify managed objects (tenants, EPGs, contracts) via the APIC API to define fabric behavior. The other options are not what the model provides.',
    references: [REF_ACI]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which DevNet resource is best for discovering reusable SDKs and sample integrations contributed by Cisco and the community?',
    options: opts4(
      'DevNet Code Exchange',
      'Cisco PSIRT advisories',
      'Cisco Field Notices',
      'Cisco Power Calculator'
    ),
    correct: ['a'],
    explanation: 'DevNet Code Exchange curates SDKs and sample integrations by platform. PSIRT advisories and Field Notices are security/lifecycle notices, and the Power Calculator estimates power draw.',
    references: [REF_DEVNET_CODEEX]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'A monitoring tool must collect streaming interface counters from many Cisco devices with minimal overhead. Which platform capability is most suitable?',
    options: opts4(
      'Model-driven telemetry subscriptions',
      'Manual `show interface` copy-paste',
      'Pinging each interface',
      'Reading the device label'
    ),
    correct: ['a'],
    explanation: 'Model-driven telemetry subscriptions stream structured counters efficiently at scale, far better than manual CLI scraping or pinging. Device labels carry no operational data.',
    references: [REF_NXOS, REF_IOSXE]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which DevNet learning resource provides guided, scenario-based modules to learn a Cisco API end to end?',
    options: opts4(
      'DevNet Learning Labs',
      'Cisco Returns Portal',
      'Cisco Licensing Portal',
      'Cisco Marketplace ads'
    ),
    correct: ['a'],
    explanation: 'DevNet Learning Labs offer guided, scenario-based modules to learn Cisco APIs end to end. The other options are commercial/administrative portals.',
    references: [REF_DEVNET_LEARN]
  },
  {
    domain: PLATFORMS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Meraki automation must act on all networks in an organization. What is the typical first API call?',
    options: opts4(
      'Reboot every access point',
      'List the organizations / networks the API key can access, then iterate',
      'Delete the organization',
      'Disable the dashboard'
    ),
    correct: ['b'],
    explanation: 'A common Meraki pattern is to first list accessible organizations and their networks, then iterate to act on each. Rebooting/deleting first would be destructive and is not a discovery step.',
    references: [REF_MERAKI]
  },
  {
    domain: PLATFORMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco platform provides intent-based campus automation and network assurance through a single controller and API?',
    options: opts4(
      'Cisco Catalyst Center (DNA Center)',
      'Cisco Webex Calling',
      'Cisco Duo only',
      'Cisco IP SLA'
    ),
    correct: ['a'],
    explanation: 'Catalyst Center (DNA Center) delivers intent-based campus automation and assurance via one controller and a northbound API. The others are collaboration, MFA, or measurement features.',
    references: [REF_DNAC]
  },

  // ── Application Deployment and Security (10) ──
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Dockerfile instruction sets the command that runs by default when a container starts?',
    options: opts4(
      'FROM',
      'CMD',
      'COPY',
      'EXPOSE'
    ),
    correct: ['b'],
    explanation: '`CMD` sets the default command/arguments executed when the container starts. `FROM` sets the base image, `COPY` adds files, and `EXPOSE` documents a port.',
    references: [REF_DOCKER]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which control most directly mitigates credential leakage when many microservices need database access?',
    options: opts4(
      'Sharing one root credential in plaintext config',
      'Using a centralized secrets manager with scoped, rotated credentials per service',
      'Disabling authentication between services',
      'Logging credentials for auditing'
    ),
    correct: ['b'],
    explanation: 'A centralized secrets manager issuing scoped, rotated, per-service credentials limits blast radius and supports rotation. Shared root creds, disabled auth, and logging secrets all increase risk.',
    references: [REF_SECURITY]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid reasons to use environment variables for application configuration in containerized deployments.',
    options: opts4(
      'They externalize config so the same image runs across environments',
      'They keep secrets out of the image when injected at runtime',
      'They guarantee the application has no bugs',
      'They allow per-environment values without rebuilding the image'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Environment variables externalize configuration, keep injected secrets out of the image, and enable per-environment values without rebuilds. They do not guarantee bug-free code.',
    references: [REF_DOCKER, REF_CICD]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists the currently running Docker containers?',
    options: opts4(
      'docker images',
      'docker ps',
      'docker build',
      'docker rmi'
    ),
    correct: ['b'],
    explanation: '`docker ps` lists running containers (add `-a` for all). `docker images` lists images, `docker build` builds an image, and `docker rmi` removes an image.',
    references: [REF_DOCKER]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the security purpose of scanning container images in a CI/CD pipeline?',
    options: opts4(
      'To make images larger',
      'To detect known vulnerabilities in OS packages and libraries before deployment',
      'To rename the image',
      'To disable TLS'
    ),
    correct: ['b'],
    explanation: 'Image scanning detects known CVEs in base OS packages and app dependencies so vulnerable images are caught before deployment. It does not change image size, name, or TLS.',
    references: [REF_SECURITY, REF_CICD]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about TLS for an application API endpoint is correct?',
    options: opts4(
      'TLS only matters for internal traffic',
      'TLS provides encryption and server authentication, protecting data in transit',
      'TLS replaces the need for authorization',
      'TLS slows the app so it should be disabled'
    ),
    correct: ['b'],
    explanation: 'TLS encrypts data in transit and authenticates the server (and optionally the client), protecting confidentiality and integrity. It does not replace authorization controls.',
    references: [REF_SECURITY]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A pipeline deploys to production only after manual approval following automated tests. What is this gate called?',
    options: opts4(
      'A continuous-deployment auto-promote',
      'A manual approval gate (often part of continuous delivery)',
      'A subnet handoff',
      'A DNS cutover'
    ),
    correct: ['b'],
    explanation: 'A manual approval gate requires human sign-off before promoting to production — common in continuous delivery. Fully automatic promotion is continuous deployment; the others are unrelated.',
    references: [REF_CICD]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is running a container process as a non-root user generally recommended?',
    options: opts4(
      'It makes the image build faster',
      'It limits the impact if the container process is compromised',
      'It is required for the image to start',
      'It disables networking'
    ),
    correct: ['b'],
    explanation: 'Running as a non-root user applies least privilege so a compromised process has limited capabilities, reducing potential host impact. It is not a build-speed or startup requirement.',
    references: [REF_SECURITY, REF_DOCKER]
  },
  {
    domain: APPSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'An application must be deployed to multiple environments (dev, test, prod) using the same artifact. Which practice supports this?',
    options: opts4(
      'Rebuild a different image for each environment',
      'Build once and promote the same immutable artifact, parameterizing config per environment',
      'Hard-code prod settings into the source',
      'Manually copy files to each server'
    ),
    correct: ['b'],
    explanation: 'Build-once/promote-the-same-artifact with externalized per-environment config ensures what was tested is what ships. Rebuilding per environment or hard-coding settings undermines that guarantee.',
    references: [REF_CICD]
  },
  {
    domain: APPSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a recommended way to provide a secret to a container at runtime?',
    options: opts4(
      'Bake it into a public image layer',
      'Inject it via an orchestrator secret or environment variable from a secrets manager',
      'Print it in the container logs',
      'Store it in the image tag'
    ),
    correct: ['b'],
    explanation: 'Secrets should be injected at runtime via an orchestrator secret or from a secrets manager, never baked into image layers, logged, or placed in tags where they persist and leak.',
    references: [REF_SECURITY, REF_DOCKER]
  },

  // ── Infrastructure and Automation (13) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best describes the goal of network automation?',
    options: opts4(
      'To remove all network devices',
      'To programmatically and repeatably configure, manage, and validate network infrastructure',
      'To make every change manual for safety',
      'To disable monitoring'
    ),
    correct: ['b'],
    explanation: 'Network automation aims to configure, manage, and validate infrastructure programmatically and repeatably, reducing manual error and increasing speed. It does not remove devices or disable monitoring.',
    references: [REF_ANSIBLE, REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A NETCONF operation must merge a small configuration change into the running datastore without replacing the whole config. Which operation/attribute supports this?',
    options: opts4(
      '<edit-config> with default operation "merge"',
      'A full <copy-config> overwrite',
      '<kill-session>',
      '<close-session>'
    ),
    correct: ['a'],
    explanation: 'NETCONF `<edit-config>` with a merge operation applies only the specified changes to the target datastore. `<copy-config>` overwrites wholesale, and kill/close-session manage sessions.',
    references: [REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL components commonly found in an Ansible project.',
    options: opts4(
      'An inventory of hosts',
      'One or more YAML playbooks',
      'Modules invoked by tasks',
      'A mandatory compiled C agent on each host'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Ansible projects use an inventory, YAML playbooks, and modules invoked by tasks. Ansible is agentless, so a mandatory compiled agent on each host is not part of the model.',
    references: [REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the benefit of testing automation against a virtual lab (e.g., Cisco Modeling Labs) before production?',
    options: opts4(
      'It guarantees zero production cost forever',
      'It validates changes safely in an isolated, reproducible topology, reducing production risk',
      'It eliminates the need for version control',
      'It speeds up physical cabling'
    ),
    correct: ['b'],
    explanation: 'A virtual lab lets you validate automation safely in a reproducible topology before touching production, reducing outage risk. It does not replace version control or affect physical cabling.',
    references: [REF_DEVNET, REF_CICD]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which encoding is most commonly used with RESTCONF requests and responses to Cisco IOS XE?',
    options: opts4(
      'JSON (or XML)',
      'EBCDIC',
      'Raw hex dumps',
      'Morse code'
    ),
    correct: ['a'],
    explanation: 'RESTCONF carries YANG-modeled data as JSON or XML over HTTPS. EBCDIC, raw hex dumps, and Morse code are not RESTCONF payload encodings.',
    references: [REF_IOSXE, REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What does CD typically stand for in a CI/CD pipeline?',
    options: opts4(
      'Continuous Delivery / Continuous Deployment',
      'Compact Disc',
      'Change Denied',
      'Console Daemon'
    ),
    correct: ['a'],
    explanation: 'CD stands for Continuous Delivery (always-releasable, manual promotion) or Continuous Deployment (automatic promotion to production). The other expansions are unrelated.',
    references: [REF_CICD]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants automated drift detection for network configs. Which workflow accomplishes this?',
    options: opts4(
      'Never compare device state to intended config',
      'Periodically collect running config and diff it against the version-controlled source of truth, alerting on differences',
      'Disable backups',
      'Only check once per year manually'
    ),
    correct: ['b'],
    explanation: 'Drift detection periodically pulls running state and diffs it against the source-of-truth config, alerting/remediating on differences. Not comparing or checking yearly leaves drift undetected.',
    references: [REF_CICD, REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Python construct is commonly used to render device configuration text from variables in automation workflows?',
    options: opts4(
      'A Jinja2 template',
      'A NumPy array',
      'A matplotlib figure',
      'A pytest fixture'
    ),
    correct: ['a'],
    explanation: 'Jinja2 templates render configuration text from variables/data, a standard technique in Python/Ansible automation. NumPy, matplotlib, and pytest serve numerical, plotting, and testing roles.',
    references: [REF_PYTHON, REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Why might a team choose RESTCONF over screen-scraping `show` commands for collecting device data?',
    options: opts4(
      'RESTCONF output is unstructured and brittle',
      'RESTCONF returns structured, schema-defined data that is reliably machine-parseable',
      'RESTCONF requires no transport',
      'Screen-scraping is always more reliable'
    ),
    correct: ['b'],
    explanation: 'RESTCONF returns structured, YANG-schema-defined JSON/XML that automation can parse reliably, unlike fragile CLI screen-scraping that breaks on formatting changes.',
    references: [REF_NETCONF, REF_JSON]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'In automation, what is a "playbook run report" or task result most useful for?',
    options: opts4(
      'Decorating the terminal',
      'Confirming which tasks changed state and which failed, supporting troubleshooting and idempotency checks',
      'Replacing the inventory',
      'Encrypting the network'
    ),
    correct: ['b'],
    explanation: 'Run results show changed/ok/failed per task, which is essential for troubleshooting and verifying idempotency. They do not replace inventory or encrypt the network.',
    references: [REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best scales configuration of 500 similar branch routers?',
    options: opts4(
      'Manually SSH to each router and type commands',
      'Use templated, data-driven automation (e.g., Ansible + Jinja2) applied across an inventory',
      'Email each site a Word document',
      'Configure them all by serial console one by one'
    ),
    correct: ['b'],
    explanation: 'Templated, data-driven automation applied across an inventory scales to hundreds of devices consistently. Manual SSH/console per device does not scale and is error-prone.',
    references: [REF_ANSIBLE]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What is a key advantage of model-driven programmability (NETCONF/RESTCONF + YANG) over SNMP for configuration?',
    options: opts4(
      'It uses no network at all',
      'It provides structured, transactional configuration with well-defined data models',
      'It only works on printers',
      'It removes the need for authentication'
    ),
    correct: ['b'],
    explanation: 'Model-driven interfaces provide structured, often transactional configuration with well-defined YANG models, improving reliability over SNMP for config tasks. It still uses the network and requires auth.',
    references: [REF_NETCONF]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A CI pipeline lints and validates network config templates on every commit before allowing a merge. Which benefit does this MOST directly provide?',
    options: opts4(
      'Faster physical link negotiation',
      'Early detection of configuration errors before they reach devices',
      'Automatic IP subnetting',
      'Reduced electrical power draw'
    ),
    correct: ['b'],
    explanation: 'Linting/validating templates in CI catches syntax and policy errors early, before they are pushed to devices, reducing outage risk. It does not affect link negotiation, subnetting, or power.',
    references: [REF_CICD, REF_ANSIBLE]
  },

  // ── Network Fundamentals (9) ──
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OSI layer is responsible for end-to-end transport using protocols such as TCP and UDP?',
    options: opts4(
      'Layer 1 (Physical)',
      'Layer 4 (Transport)',
      'Layer 3 (Network)',
      'Layer 7 (Application)'
    ),
    correct: ['b'],
    explanation: 'Layer 4 (Transport) provides end-to-end delivery via TCP/UDP. Layer 1 is physical signaling, Layer 3 handles IP routing, and Layer 7 is application protocols.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'How many usable host addresses does a /30 IPv4 subnet provide (commonly used for point-to-point links)?',
    options: opts4(
      '4',
      '2',
      '6',
      '0'
    ),
    correct: ['b'],
    explanation: 'A /30 has 2 host bits = 4 total addresses; minus the network and broadcast addresses, 2 usable hosts remain — ideal for point-to-point links.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the DNS protocol.',
    options: opts4(
      'It resolves hostnames to IP addresses',
      'It commonly uses UDP port 53 (and TCP 53 for larger responses/zone transfers)',
      'It is a routing protocol like OSPF',
      'It can return multiple record types (A, AAAA, CNAME, etc.)'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'DNS resolves names to addresses, uses port 53 (UDP primarily, TCP for large responses/zone transfers), and supports many record types. It is not a routing protocol.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which address type is used to send a frame to all hosts on a local Ethernet segment?',
    options: opts4(
      'Unicast',
      'Broadcast',
      'A single host MAC',
      'Loopback'
    ),
    correct: ['b'],
    explanation: 'A broadcast frame (destination MAC ff:ff:ff:ff:ff:ff) reaches all hosts on the local segment. Unicast targets one host, and loopback is a host-internal address.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'An application uses port 22 for a secure remote shell. Which protocol is this?',
    options: opts4(
      'Telnet',
      'SSH',
      'HTTP',
      'SNMP'
    ),
    correct: ['b'],
    explanation: 'SSH (Secure Shell) uses TCP port 22 for encrypted remote access. Telnet (23) is unencrypted, HTTP is 80, and SNMP is UDP 161/162.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of a subnet mask?',
    options: opts4(
      'To encrypt IP packets',
      'To distinguish the network portion of an IP address from the host portion',
      'To assign MAC addresses',
      'To resolve domain names'
    ),
    correct: ['b'],
    explanation: 'A subnet mask marks which bits of an IP address are the network portion versus the host portion, defining subnet boundaries. It does not encrypt, assign MACs, or resolve names.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer’s API request times out, but ping to the host succeeds. Which conclusion is most reasonable?',
    options: opts4(
      'The host is completely offline',
      'Layer 3 reachability is fine, but the API service/port may be down or filtered',
      'DNS is definitely broken',
      'The cable is unplugged'
    ),
    correct: ['b'],
    explanation: 'Successful ping shows Layer 3 reachability, so an API timeout points to a higher-layer issue: the service is down, the port is filtered by a firewall, or the app is unresponsive — not a dead host.',
    references: [REF_OSI, REF_REST]
  },
  {
    domain: NETFUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol maps an IPv4 address to a MAC address on a local network?',
    options: opts4(
      'ARP',
      'DNS',
      'DHCP',
      'BGP'
    ),
    correct: ['a'],
    explanation: 'ARP (Address Resolution Protocol) resolves an IPv4 address to its MAC address on a local segment. DNS resolves names, DHCP assigns addresses, and BGP is an inter-domain routing protocol.',
    references: [REF_OSI]
  },
  {
    domain: NETFUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about IPv6 compared to IPv4 is correct?',
    options: opts4(
      'IPv6 uses 32-bit addresses like IPv4',
      'IPv6 uses 128-bit addresses, vastly expanding the address space',
      'IPv6 cannot coexist with IPv4',
      'IPv6 removes the concept of routing'
    ),
    correct: ['b'],
    explanation: 'IPv6 uses 128-bit addresses (versus IPv4’s 32-bit), enormously expanding the address space. IPv6 and IPv4 can coexist (dual-stack) and IPv6 still uses routing.',
    references: [REF_OSI]
  }
];

const DEVNET_DOMAINS = [
  { name: SWDEV, weight: 15 },
  { name: APIS, weight: 20 },
  { name: PLATFORMS, weight: 15 },
  { name: APPSEC, weight: 15 },
  { name: INFRA, weight: 20 },
  { name: NETFUND, weight: 15 }
];

const DEVNET_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'cisco-devnet-associate-200-901-p1',
    code: '200-901-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering software development & design, APIs, Cisco platforms & development, application deployment & security, infrastructure & automation, and network fundamentals.',
    questions: P1
  },
  {
    slug: 'cisco-devnet-associate-200-901-p2',
    code: '200-901-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'cisco-devnet-associate-200-901-p3',
    code: '200-901-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const DEVNET_BUNDLE = {
  slug: 'cisco-devnet-associate-200-901',
  title: 'Cisco DevNet Associate (200-901 DEVASC)',
  description: 'All 3 Cisco DevNet Associate (200-901 DEVASC) practice exams in one bundle — covering software development & design, understanding & using APIs, Cisco platforms & development, application deployment & security, infrastructure & automation, and network fundamentals, aligned to the official Cisco 200-901 DEVASC exam topics.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 30000 // USD 300 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Cisco DevNet Associate bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:devnet-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedDevnet(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'cisco' } });
  await db.vendor.upsert({
    where: { slug: 'cisco' },
    update: { name: 'Cisco', description: 'Cisco certifications — networking, security, collaboration, and the Cisco DevNet developer credentials.' },
    create: { slug: 'cisco', name: 'Cisco', description: 'Cisco certifications — networking, security, collaboration, and the Cisco DevNet developer credentials.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'cisco' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of DEVNET_EXAMS) {
    const title = `Cisco DevNet Associate (200-901 DEVASC) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official Cisco 200-901 DEVASC exam topics.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 120,
      passingScore: 80,
      questionCount: e.questions.length,
      domains: DEVNET_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:devnet-seed' } });
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
          generatedBy: 'manual:devnet-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: DEVNET_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: DEVNET_BUNDLE.slug },
    update: {
      title: DEVNET_BUNDLE.title,
      description: DEVNET_BUNDLE.description,
      price: DEVNET_BUNDLE.price,
      priceVoucher: DEVNET_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: DEVNET_BUNDLE.slug,
      title: DEVNET_BUNDLE.title,
      description: DEVNET_BUNDLE.description,
      price: DEVNET_BUNDLE.price,
      priceVoucher: DEVNET_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'cisco-devnet-associate-200-901-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'cisco-devnet-associate-200-901-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'cisco-devnet-associate-200-901-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'cisco-devnet-associate-200-901-p1', tier: 'VOUCHER' as const, position: 4 }
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
